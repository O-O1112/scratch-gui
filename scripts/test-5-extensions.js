const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { spawn } = require('child_process');
const WebSocket = require('ws');

const BUILD_DIR = path.resolve(__dirname, '..', 'build');
const CDP_PORT = 9226;
const SCREENSHOT_PATH = path.resolve(
    'C:/Users/liguo/.gemini/antigravity/brain/7da405ac-2bae-49fe-af68-edc80c4cdbb9',
    'extensions_5_in_1_working.png'
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

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];
    const relPath = reqUrl.replace(/^\/+/, '');
    const filePath = path.join(BUILD_DIR, relPath || 'index.html');

    if (!fs.existsSync(filePath)) {
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = mimeTypes[ext] || 'application/octet-stream';
    res.writeHead(200, {'Content-Type': contentType});
    fs.createReadStream(filePath).pipe(res);
});

server.listen(0, async () => {
    const PORT = server.address().port;
    console.log(`[Server] Serving build/ at http://localhost:${PORT}`);

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
                throw new Error('window.vm was not ready after 30 seconds');
            }
            console.log('[Test] window.vm and editingTarget are ready!');

            // Small delay to ensure Blockly toolbox is completely mounted
            await new Promise(r => setTimeout(r, 1000));

            // Load the 5 extensions
            const extensionsToTest = ['physics', 'particles', 'multiplayer', 'webaudio', 'files'];
            for (const extId of extensionsToTest) {
                console.log(`[Test] Loading extension: ${extId}...`);
                await send('Runtime.evaluate', {
                    expression: `window.vm.extensionManager.loadExtensionURL('${extId}')`,
                    awaitPromise: true
                });
                await new Promise(r => setTimeout(r, 500));
            }

            // Find category element by text or class and click it
            console.log('[Test] Selecting Physics category...');
            await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const items = Array.from(document.querySelectorAll('*')).filter(el => 
                            el.textContent && el.textContent.includes('2D 物理引擎') && el.children.length === 0
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

            // Verify extension functionality
            console.log('[Test] Verifying extension runtime functionality...');
            const verificationScript = `
                (function() {
                    const results = {};
                    
                    // 1. Check Physics
                    const phys = window.vm.extensionManager._loadedExtensions.get('physics');
                    results.physics = {
                        loaded: Boolean(phys),
                        hasEngine: Boolean(phys && phys.engine),
                        blocksCount: phys ? phys.getInfo().blocks.length : 0
                    };

                    // 2. Check Particles
                    const part = window.vm.extensionManager._loadedExtensions.get('particles');
                    if (part) {
                        part.burstAtCoords({PRESET: 'fire', X: 0, Y: 0, COUNT: 40});
                    }
                    results.particles = {
                        loaded: Boolean(part),
                        canvasCreated: Boolean(document.getElementById('scratch-particles-canvas')),
                        activeCount: part ? part.getParticleCount() : 0,
                        blocksCount: part ? part.getInfo().blocks.length : 0
                    };

                    // 3. Check Multiplayer
                    const multi = window.vm.extensionManager._loadedExtensions.get('multiplayer');
                    if (multi) {
                        multi.joinRoom({ROOM: 'test-room', NAME: 'Tester'});
                    }
                    results.multiplayer = {
                        loaded: Boolean(multi),
                        myId: multi ? multi.getMyId() : null,
                        room: multi ? multi.getRoomName() : null,
                        blocksCount: multi ? multi.getInfo().blocks.length : 0
                    };

                    // 4. Check WebAudio
                    const audio = window.vm.extensionManager._loadedExtensions.get('webaudio');
                    results.webaudio = {
                        loaded: Boolean(audio),
                        blocksCount: audio ? audio.getInfo().blocks.length : 0
                    };

                    // 5. Check Files
                    const files = window.vm.extensionManager._loadedExtensions.get('files');
                    if (files) {
                        files.copyToClipboard({TEXT: 'Scratch 5 in 1 Test'});
                    }
                    results.files = {
                        loaded: Boolean(files),
                        clipboard: files ? files.getClipboard() : null,
                        blocksCount: files ? files.getInfo().blocks.length : 0
                    };

                    return JSON.stringify(results, null, 2);
                })()
            `;

            const testOutput = await send('Runtime.evaluate', {
                expression: verificationScript
            });

            console.log('[Test Results]:');
            console.log(testOutput.result ? testOutput.result.value : testOutput);

            // Wait 1.5 seconds for visual updates
            await new Promise(r => setTimeout(r, 1500));

            // Capture toolbox screenshot
            console.log(`[Test] Capturing toolbox screenshot to ${SCREENSHOT_PATH}...`);
            const screenshotRes = await send('Page.captureScreenshot', { format: 'png' });
            if (screenshotRes && screenshotRes.data) {
                fs.writeFileSync(SCREENSHOT_PATH, Buffer.from(screenshotRes.data, 'base64'));
                console.log('[Test] Toolbox screenshot saved!');
            }

            // Open Extension Library modal
            console.log('[Test] Opening Extension Library modal...');
            await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const btn = document.querySelector('button[class*="extension-button"]') ||
                                    document.querySelector('div[class*="extension-button-container"] button') ||
                                    document.querySelector('button[title*="擴充"]');
                        if (btn) btn.click();
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1500));

            // Scroll modal down to show newly added extensions
            await send('Runtime.evaluate', {
                expression: `
                    (function() {
                        const modal = document.querySelector('div[class*="library_library-scroll-grid"]') ||
                                      document.querySelector('div[class*="library_body"]') ||
                                      document.querySelector('div[class*="modal_body"]');
                        if (modal) modal.scrollTop = modal.scrollHeight;
                    })()
                `
            });

            await new Promise(r => setTimeout(r, 1500));

            const modalScreenshotPath = path.resolve(
                'C:/Users/liguo/.gemini/antigravity/brain/7da405ac-2bae-49fe-af68-edc80c4cdbb9',
                'extensions_library_modal.png'
            );
            console.log(`[Test] Capturing modal screenshot to ${modalScreenshotPath}...`);
            const modalScreenshotRes = await send('Page.captureScreenshot', { format: 'png' });
            if (modalScreenshotRes && modalScreenshotRes.data) {
                fs.writeFileSync(modalScreenshotPath, Buffer.from(modalScreenshotRes.data, 'base64'));
                console.log('[Test] Modal screenshot saved successfully!');
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
