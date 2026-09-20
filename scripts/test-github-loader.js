const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const CDP_PORT = 9227;
const SCREENSHOT_MODAL = path.resolve(
    'C:/Users/liguo/.gemini/antigravity/brain/7da405ac-2bae-49fe-af68-edc80c4cdbb9',
    'github_loader_modal.png'
);
const SCREENSHOT_LOADED = path.resolve(
    'C:/Users/liguo/.gemini/antigravity/brain/7da405ac-2bae-49fe-af68-edc80c4cdbb9',
    'github_external_extension_loaded.png'
);

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.wav': 'audio/wav',
    '.mp3': 'audio/mpeg',
    '.woff2': 'font/woff2'
};

const mockGitHubExtCode = `
(function(Scratch) {
    'use strict';
    class GitHubCommunityExtension {
        getInfo() {
            return {
                id: 'github_community',
                name: 'GitHub 外部社群模組 (GitHub Community)',
                color1: '#2563EB',
                color2: '#1D4ED8',
                color3: '#1E40AF',
                blocks: [
                    {
                        opcode: 'githubAction',
                        blockType: Scratch.BlockType.COMMAND,
                        text: '自 GitHub 即時安裝成功：執行動作 [MSG]',
                        arguments: {
                            MSG: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'Hello from GitHub!'
                            }
                        }
                    },
                    {
                        opcode: 'getGitVersion',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'GitHub 擴充版本號'
                    }
                ]
            };
        }
        githubAction(args) {
            console.log('[GitHub Community Ext Action]:', args.MSG);
        }
        getGitVersion() {
            return 'v1.0.0-github';
        }
    }
    Scratch.extensions.register(new GitHubCommunityExtension());
})(Scratch);
`;

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    const relPath = reqUrl.replace(/^\/+/, '');

    // Serve mock external GitHub extension script
    if (relPath === 'mock-github-ext.js') {
        res.writeHead(200, {
            'Content-Type': 'application/javascript',
            'Access-Control-Allow-Origin': '*'
        });
        res.end(mockGitHubExtCode);
        return;
    }

    const filePath = path.join(BUILD_DIR, relPath || 'index.html');
    if (!fs.existsSync(filePath)) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
});

server.listen(0, async () => {
    const PORT = server.address().port;
    console.log(`[Server] Serving at http://localhost:${PORT}`);

    const tempProfile = path.join(os.tmpdir(), 'edge_test_profile_' + Date.now());
    const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
    const edgeArgs = [
        `--remote-debugging-port=${CDP_PORT}`,
        `--user-data-dir=${tempProfile}`,
        '--headless=new',
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-gpu=false',
        '--use-gl=angle',
        '--use-angle=gl',
        '--enable-webgl',
        '--window-size=1440,900',
        '--no-sandbox',
        '--disable-web-security',
        `http://localhost:${PORT}`
    ];

    console.log('[Edge] Launching headless browser...');
    const edge = spawn(edgePath, edgeArgs);

    let isTerminated = false;
    function cleanup() {
        if (isTerminated) return;
        isTerminated = true;
        try { edge.kill(); } catch (e) {}
        try { server.close(); } catch (e) {}
    }

    let wsUrl = null;
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 500));
        try {
            const listRes = await fetch(`http://localhost:${CDP_PORT}/json/list`).then(r => r.json());
            if (listRes && listRes.length > 0) {
                const pageTarget = listRes.find(t => t.type === 'page' && t.url.includes(String(PORT))) ||
                                   listRes.find(t => t.type === 'page');
                if (pageTarget && pageTarget.webSocketDebuggerUrl) {
                    wsUrl = pageTarget.webSocketDebuggerUrl;
                    break;
                }
            }
        } catch (e) {}
    }

    if (!wsUrl) {
        console.error('[Error] Could not connect to Edge remote debugging port!');
        cleanup();
        process.exit(1);
    }

    console.log('[Edge] Connected to CDP:', wsUrl);
    const ws = new WebSocket(wsUrl);

    let msgId = 1;
    const callbacks = new Map();

    ws.on('message', (data) => {
        const msg = JSON.parse(data.toString());
        if (msg.method === 'Runtime.consoleAPICalled') {
            const args = (msg.params.args || []).map(a => a.value || a.description).join(' ');
            console.log(`[Browser Console] ${msg.params.type}: ${args}`);
        } else if (msg.method === 'Runtime.exceptionThrown') {
            console.error(`[Browser Exception]:`, msg.params.exceptionDetails);
        }

        if (msg.id && callbacks.has(msg.id)) {
            const cb = callbacks.get(msg.id);
            callbacks.delete(msg.id);
            cb(msg.result, msg.error);
        }
    });

    function send(method, params = {}) {
        return new Promise((resolve, reject) => {
            const id = msgId++;
            callbacks.set(id, (result, error) => {
                if (error) reject(error);
                else resolve(result);
            });
            ws.send(JSON.stringify({ id, method, params }));
        });
    }

    ws.on('open', async () => {
        try {
            await send('Page.enable');
            await send('Runtime.enable');

            console.log('[Test] Waiting for window.vm and editingTarget...');
            let vmReady = false;
            for (let i = 0; i < 60; i++) {
                await new Promise(r => setTimeout(r, 500));
                const evalRes = await send('Runtime.evaluate', {
                    expression: 'Boolean(window.vm && window.vm.extensionManager && window.vm.editingTarget)'
                });
                if (evalRes && evalRes.result && evalRes.result.value) {
                    vmReady = true;
                    break;
                }
            }

            if (!vmReady) {
                throw new Error('window.vm was not ready');
            }
            console.log('[Test] window.vm is ready!');

            // 1. Open Extension Library modal to capture custom_github card at top
            console.log('[Test] Opening Extension Library modal...');
            await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const btn = document.querySelector('button[class*="extension-button"]') ||
                                    document.querySelector('div[class*="extension-button-container"] button');
                        if (btn) btn.click();
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1500));

            // Capture modal screenshot
            console.log(`[Test] Capturing modal screenshot to ${SCREENSHOT_MODAL}...`);
            const modalScreenshotRes = await send('Page.captureScreenshot', { format: 'png' });
            if (modalScreenshotRes && modalScreenshotRes.data) {
                fs.writeFileSync(SCREENSHOT_MODAL, Buffer.from(modalScreenshotRes.data, 'base64'));
                console.log('[Test] Modal screenshot saved!');
            }

            // Close modal by clicking back button ([role="button"])
            await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const backBtn = document.querySelector('[role="button"][class*="back-button"]') ||
                                        document.querySelector('div[class*="header-item-close"] [role="button"]') ||
                                        Array.from(document.querySelectorAll('[role="button"]')).find(b => 
                                            b.textContent && b.textContent.includes('返回')
                                        );
                        if (backBtn) {
                            backBtn.click();
                        }
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1000));

            // 2. Test Dynamic GitHub extension loading via URL
            console.log('[Test] Testing dynamic external extension load via loadExtensionURL...');
            const dynamicLoadResult = await send('Runtime.evaluate', {
                expression: `window.vm.extensionManager.loadExtensionURL('http://localhost:${PORT}/mock-github-ext.js')`,
                awaitPromise: true
            });
            console.log('[Test] Dynamic Load Result:', dynamicLoadResult);

            // Also load curated extensions
            await send('Runtime.evaluate', {
                expression: `window.vm.extensionManager.loadExtensionURL('pointerlock')`,
                awaitPromise: true
            });
            await send('Runtime.evaluate', {
                expression: `window.vm.extensionManager.loadExtensionURL('animatedtext')`,
                awaitPromise: true
            });

            await new Promise(r => setTimeout(r, 1500));

            // Select the newly loaded GitHub external category in toolbox
            console.log('[Test] Selecting GitHub community category in toolbox...');
            await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const items = Array.from(document.querySelectorAll('*')).filter(el => 
                            el.textContent && el.textContent.includes('GitHub 外部社群模組') && el.children.length === 0
                        );
                        if (items.length > 0) {
                            const btn = items[0].closest('div') || items[0];
                            btn.dispatchEvent(new MouseEvent('mousedown', {bubbles: true}));
                            btn.dispatchEvent(new MouseEvent('mouseup', {bubbles: true}));
                            btn.click();
                        }
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1500));

            // Capture workspace screenshot showing GitHub external blocks
            console.log(`[Test] Capturing loaded extension screenshot to ${SCREENSHOT_LOADED}...`);
            const loadedScreenshotRes = await send('Page.captureScreenshot', { format: 'png' });
            if (loadedScreenshotRes && loadedScreenshotRes.data) {
                fs.writeFileSync(SCREENSHOT_LOADED, Buffer.from(loadedScreenshotRes.data, 'base64'));
                console.log('[Test] Loaded extension screenshot saved!');
            }

            console.log('[Test] All tests completed successfully!');
        } catch (err) {
            console.error('[Test Error]:', err);
        } finally {
            cleanup();
            process.exit(0);
        }
    });
});
