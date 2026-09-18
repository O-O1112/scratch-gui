const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Storage {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'storage',
            name: '本地儲存 (Storage)',
            color1: '#059669',
            color2: '#047857',
            color3: '#065F46',
            blocks: [
                {
                    opcode: 'setItem',
                    blockType: BlockType.COMMAND,
                    text: '儲存項目 [KEY] 為 [VALUE]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'highScore'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '100'
                        }
                    }
                },
                {
                    opcode: 'getItem',
                    blockType: BlockType.REPORTER,
                    text: '讀取項目 [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'highScore'
                        }
                    }
                },
                {
                    opcode: 'hasItem',
                    blockType: BlockType.BOOLEAN,
                    text: '項目 [KEY] 是否存在？',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'highScore'
                        }
                    }
                },
                {
                    opcode: 'removeItem',
                    blockType: BlockType.COMMAND,
                    text: '刪除項目 [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'highScore'
                        }
                    }
                },
                {
                    opcode: 'clear',
                    blockType: BlockType.COMMAND,
                    text: '清空所有儲存資料'
                }
            ]
        };
    }

    setItem (args) {
        const key = 'scratch_' + Cast.toString(args.KEY);
        const value = Cast.toString(args.VALUE);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.setItem(key, value);
            }
        } catch (e) {
            console.error('[Storage error]', e);
        }
    }

    getItem (args) {
        const key = 'scratch_' + Cast.toString(args.KEY);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const val = window.localStorage.getItem(key);
                return val !== null ? val : '';
            }
        } catch (e) {
            console.error('[Storage error]', e);
        }
        return '';
    }

    hasItem (args) {
        const key = 'scratch_' + Cast.toString(args.KEY);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                return window.localStorage.getItem(key) !== null;
            }
        } catch (e) {
            console.error('[Storage error]', e);
        }
        return false;
    }

    removeItem (args) {
        const key = 'scratch_' + Cast.toString(args.KEY);
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                window.localStorage.removeItem(key);
            }
        } catch (e) {
            console.error('[Storage error]', e);
        }
    }

    clear () {
        try {
            if (typeof window !== 'undefined' && window.localStorage) {
                const keysToRemove = [];
                for (let i = 0; i < window.localStorage.length; i++) {
                    const k = window.localStorage.key(i);
                    if (k && k.startsWith('scratch_')) {
                        keysToRemove.push(k);
                    }
                }
                keysToRemove.forEach(k => window.localStorage.removeItem(k));
            }
        } catch (e) {
            console.error('[Storage error]', e);
        }
    }
}

module.exports = Scratch3Storage;
