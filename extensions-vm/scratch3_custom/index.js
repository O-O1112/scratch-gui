const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Custom {
    constructor (runtime) {
        this.runtime = runtime;
        this.lastResult = '';
        if (typeof window !== 'undefined') {
            window.__scratch_custom_vars = window.__scratch_custom_vars || {};
        }
    }

    getInfo () {
        return {
            id: 'custom',
            name: '自訂代碼 (Custom JS)',
            color1: '#E09F3E',
            color2: '#C98522',
            color3: '#A3650C',
            blocks: [
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
                '---',
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
            ]
        };
    }

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
