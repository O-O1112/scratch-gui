const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Custom {
    constructor (runtime) {
        this.runtime = runtime;
        this.lastResult = '';
        this.lastKey = '';
        this.lastKeyCode = 0;
        this.pressedKeys = new Set();
        this.mouseClientX = 0;
        this.mouseClientY = 0;
        this.lastWheelDelta = 0;

        if (typeof window !== 'undefined') {
            window.__scratch_custom_vars = window.__scratch_custom_vars || {};

            // Keyboard listener
            window.addEventListener('keydown', (e) => {
                this.lastKey = e.key || '';
                this.lastKeyCode = e.keyCode || e.which || 0;
                if (e.key) {
                    this.pressedKeys.add(e.key.toLowerCase());
                }
            }, {passive: true});

            window.addEventListener('keyup', (e) => {
                if (e.key) {
                    this.pressedKeys.delete(e.key.toLowerCase());
                }
            }, {passive: true});

            // Window blur clears pressed keys
            window.addEventListener('blur', () => {
                this.pressedKeys.clear();
            });

            // Mouse window listener
            window.addEventListener('mousemove', (e) => {
                this.mouseClientX = e.clientX;
                this.mouseClientY = e.clientY;
            }, {passive: true});

            // Wheel listener
            window.addEventListener('wheel', (e) => {
                this.lastWheelDelta = Math.round(e.deltaY);
            }, {passive: true});
        }
    }

    getInfo () {
        return {
            id: 'custom',
            name: '自訂代碼與監聽 (Custom & Listeners)',
            color1: '#E09F3E',
            color2: '#C98522',
            color3: '#A3650C',
            blocks: [
                // 1. 鍵盤輸入監聽 (Keyboard Listeners)
                {
                    opcode: 'getLastKey',
                    blockType: BlockType.REPORTER,
                    text: '最後按下的鍵盤按鍵名稱'
                },
                {
                    opcode: 'getLastKeyCode',
                    blockType: BlockType.REPORTER,
                    text: '最後按下的鍵盤 KeyCode 代碼'
                },
                {
                    opcode: 'getPressedKeys',
                    blockType: BlockType.REPORTER,
                    text: '目前正按下的所有按鍵清單'
                },
                {
                    opcode: 'isKeyHeld',
                    blockType: BlockType.BOOLEAN,
                    text: '按鍵 [KEY] 正處於按下狀態？',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'shift'
                        }
                    }
                },
                '---',
                // 2. 滑鼠視窗與滾輪監聽 (Mouse & Wheel)
                {
                    opcode: 'getMouseClientX',
                    blockType: BlockType.REPORTER,
                    text: '滑鼠視窗絕對座標 X'
                },
                {
                    opcode: 'getMouseClientY',
                    blockType: BlockType.REPORTER,
                    text: '滑鼠視窗絕對座標 Y'
                },
                {
                    opcode: 'getMouseWheelDelta',
                    blockType: BlockType.REPORTER,
                    text: '滑鼠滾輪最後滾動量 (Delta)'
                },
                '---',
                // 3. 系統環境與視窗 (System & Window)
                {
                    opcode: 'getWindowWidth',
                    blockType: BlockType.REPORTER,
                    text: '瀏覽器視窗內部寬度'
                },
                {
                    opcode: 'getWindowHeight',
                    blockType: BlockType.REPORTER,
                    text: '瀏覽器視窗內部高度'
                },
                {
                    opcode: 'getUserPlatform',
                    blockType: BlockType.REPORTER,
                    text: '使用者作業系統 / 平台'
                },
                {
                    opcode: 'getCurrentUrl',
                    blockType: BlockType.REPORTER,
                    text: '當前網頁網址 (URL)'
                },
                {
                    opcode: 'getUrlParam',
                    blockType: BlockType.REPORTER,
                    text: '網址參數 [PARAM] 之值',
                    arguments: {
                        PARAM: {
                            type: ArgumentType.STRING,
                            defaultValue: 'id'
                        }
                    }
                },
                '---',
                // 4. 時間與字串運算 (Time & String Utils)
                {
                    opcode: 'getTimestamp',
                    blockType: BlockType.REPORTER,
                    text: '目前時間戳記 (Unix 毫秒)'
                },
                {
                    opcode: 'getFormattedTime',
                    blockType: BlockType.REPORTER,
                    text: '格式化目前日期時間 [FORMAT]',
                    arguments: {
                        FORMAT: {
                            type: ArgumentType.STRING,
                            menu: 'formatMenu',
                            defaultValue: 'YYYY-MM-DD HH:mm:ss'
                        }
                    }
                },
                {
                    opcode: 'generateUUID',
                    blockType: BlockType.REPORTER,
                    text: '隨機產生唯一碼 (UUID)'
                },
                {
                    opcode: 'base64Encode',
                    blockType: BlockType.REPORTER,
                    text: '文字 [TEXT] 的 Base64 編碼',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Scratch'
                        }
                    }
                },
                {
                    opcode: 'base64Decode',
                    blockType: BlockType.REPORTER,
                    text: 'Base64 [TEXT] 進行解碼',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'SGVsbG8gU2NyYXRjaA=='
                        }
                    }
                },
                '---',
                // 5. 原有 JavaScript 執行與變數 (JS Execution)
                {
                    opcode: 'execute',
                    blockType: BlockType.COMMAND,
                    text: '執行 JavaScript [CODE]',
                    arguments: {
                        CODE: {
                            type: ArgumentType.STRING,
                            defaultValue: "console.log('Custom JS Running');"
                        }
                    }
                },
                {
                    opcode: 'evaluate',
                    blockType: BlockType.REPORTER,
                    text: '計算 JavaScript [EXPR]',
                    arguments: {
                        EXPR: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Math.round(Math.random() * 100)'
                        }
                    }
                },
                {
                    opcode: 'getLastResult',
                    blockType: BlockType.REPORTER,
                    text: '最後執行結果'
                },
                {
                    opcode: 'setCustomVar',
                    blockType: BlockType.COMMAND,
                    text: '自訂全域變數 [KEY] 設為 [VALUE]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '123'
                        }
                    }
                },
                {
                    opcode: 'getCustomVar',
                    blockType: BlockType.REPORTER,
                    text: '取得自訂全域變數 [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'myVar'
                        }
                    }
                }
            ],
            menus: {
                formatMenu: {
                    acceptReporters: true,
                    items: [
                        {text: 'YYYY-MM-DD HH:mm:ss', value: 'YYYY-MM-DD HH:mm:ss'},
                        {text: 'YYYY-MM-DD', value: 'YYYY-MM-DD'},
                        {text: 'HH:mm:ss', value: 'HH:mm:ss'},
                        {text: 'HH:mm', value: 'HH:mm'}
                    ]
                }
            }
        };
    }

    // 1. 鍵盤監聽
    getLastKey () {
        return this.lastKey;
    }

    getLastKeyCode () {
        return this.lastKeyCode;
    }

    getPressedKeys () {
        return Array.from(this.pressedKeys).join(',');
    }

    isKeyHeld (args) {
        const key = Cast.toString(args.KEY).toLowerCase();
        return this.pressedKeys.has(key);
    }

    // 2. 滑鼠視窗與滾輪
    getMouseClientX () {
        return this.mouseClientX;
    }

    getMouseClientY () {
        return this.mouseClientY;
    }

    getMouseWheelDelta () {
        return this.lastWheelDelta;
    }

    // 3. 系統與視窗
    getWindowWidth () {
        if (typeof window !== 'undefined') {
            return window.innerWidth || document.documentElement.clientWidth || 0;
        }
        return 0;
    }

    getWindowHeight () {
        if (typeof window !== 'undefined') {
            return window.innerHeight || document.documentElement.clientHeight || 0;
        }
        return 0;
    }

    getUserPlatform () {
        if (typeof navigator === 'undefined') return 'Unknown';
        const ua = navigator.userAgent || '';
        if (/windows/i.test(ua)) return 'Windows';
        if (/macintosh|mac os x/i.test(ua)) return 'macOS';
        if (/android/i.test(ua)) return 'Android';
        if (/iphone|ipad|ipod/i.test(ua)) return 'iOS';
        if (/linux/i.test(ua)) return 'Linux';
        return navigator.platform || 'Unknown';
    }

    getCurrentUrl () {
        if (typeof window !== 'undefined' && window.location) {
            return window.location.href || '';
        }
        return '';
    }

    getUrlParam (args) {
        const param = Cast.toString(args.PARAM);
        if (typeof window !== 'undefined' && window.location) {
            const urlParams = new URLSearchParams(window.location.search);
            return urlParams.get(param) || '';
        }
        return '';
    }

    // 4. 時間與字串運算
    getTimestamp () {
        return Date.now();
    }

    getFormattedTime (args) {
        const format = Cast.toString(args.FORMAT) || 'YYYY-MM-DD HH:mm:ss';
        const d = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        const year = d.getFullYear();
        const month = pad(d.getMonth() + 1);
        const day = pad(d.getDate());
        const hours = pad(d.getHours());
        const minutes = pad(d.getMinutes());
        const seconds = pad(d.getSeconds());

        return format
            .replace(/YYYY/g, year)
            .replace(/MM/g, month)
            .replace(/DD/g, day)
            .replace(/HH/g, hours)
            .replace(/mm/g, minutes)
            .replace(/ss/g, seconds);
    }

    generateUUID () {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : ((r & 0x3) | 0x8);
            return v.toString(16);
        });
    }

    base64Encode (args) {
        const str = Cast.toString(args.TEXT);
        try {
            return btoa(unescape(encodeURIComponent(str)));
        } catch (e) {
            return '';
        }
    }

    base64Decode (args) {
        const str = Cast.toString(args.TEXT);
        try {
            return decodeURIComponent(escape(atob(str)));
        } catch (e) {
            return '';
        }
    }

    // 5. JavaScript 執行
    execute (args) {
        const code = Cast.toString(args.CODE);
        try {
            const fn = new Function('runtime', 'vm', code);
            const res = fn(this.runtime, this.runtime ? this.runtime.vm : null);
            this.lastResult = res !== undefined ? String(res) : '';
        } catch (err) {
            console.error('[Custom JS Error]', err);
            this.lastResult = 'Error: ' + err.message;
        }
    }

    evaluate (args) {
        const expr = Cast.toString(args.EXPR);
        try {
            const fn = new Function('runtime', 'vm', 'return (' + expr + ');');
            const res = fn(this.runtime, this.runtime ? this.runtime.vm : null);
            return res !== undefined ? String(res) : '';
        } catch (err) {
            console.error('[Custom JS Eval Error]', err);
            return 'Error: ' + err.message;
        }
    }

    getLastResult () {
        return this.lastResult;
    }

    setCustomVar (args) {
        const key = Cast.toString(args.KEY);
        if (typeof window !== 'undefined' && window.__scratch_custom_vars) {
            window.__scratch_custom_vars[key] = args.VALUE;
        }
    }

    getCustomVar (args) {
        const key = Cast.toString(args.KEY);
        if (typeof window !== 'undefined' && window.__scratch_custom_vars) {
            const val = window.__scratch_custom_vars[key];
            return val !== undefined ? String(val) : '';
        }
        return '';
    }
}

module.exports = Scratch3Custom;
