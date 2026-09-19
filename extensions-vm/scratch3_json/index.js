const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3JSON {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'json',
            name: 'JSON 資料處理 (JSON)',
            color1: '#D97706',
            color2: '#B45309',
            color3: '#92400E',
            blocks: [
                {
                    opcode: 'isValid',
                    blockType: BlockType.BOOLEAN,
                    text: '[JSON] 是否為合法 JSON？',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"name":"Scratch","version":3}'
                        }
                    }
                },
                '---',
                {
                    opcode: 'get',
                    blockType: BlockType.REPORTER,
                    text: '取得 [JSON] 的路徑 [PATH] 之值',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"player":{"name":"Alex","score":100}}'
                        },
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'player.score'
                        }
                    }
                },
                {
                    opcode: 'set',
                    blockType: BlockType.REPORTER,
                    text: '在 [JSON] 設定路徑 [PATH] 為 [VALUE]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"name":"Alex"}'
                        },
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'score'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '200'
                        }
                    }
                },
                {
                    opcode: 'deleteKey',
                    blockType: BlockType.REPORTER,
                    text: '在 [JSON] 刪除屬性 [PATH]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"name":"Alex","temp":1}'
                        },
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'temp'
                        }
                    }
                },
                '---',
                {
                    opcode: 'keys',
                    blockType: BlockType.REPORTER,
                    text: '取得 [JSON] 的所有鍵名 (Keys)',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"a":1,"b":2}'
                        }
                    }
                },
                {
                    opcode: 'values',
                    blockType: BlockType.REPORTER,
                    text: '取得 [JSON] 的所有值 (Values)',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"a":1,"b":2}'
                        }
                    }
                },
                {
                    opcode: 'length',
                    blockType: BlockType.REPORTER,
                    text: '取得 [JSON] 的長度或項目數',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '["apple","banana","cherry"]'
                        }
                    }
                },
                '---',
                {
                    opcode: 'arrayPush',
                    blockType: BlockType.REPORTER,
                    text: '將 [VALUE] 加入陣列 [JSON]',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '["apple","banana"]'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: 'orange'
                        }
                    }
                },
                {
                    opcode: 'arrayGet',
                    blockType: BlockType.REPORTER,
                    text: '取得陣列 [JSON] 的第 [INDEX] 項 (從 1 起算)',
                    arguments: {
                        JSON: {
                            type: ArgumentType.STRING,
                            defaultValue: '["apple","banana","cherry"]'
                        },
                        INDEX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 1
                        }
                    }
                },
                '---',
                {
                    opcode: 'newObject',
                    blockType: BlockType.REPORTER,
                    text: '建立空白物件 {}'
                },
                {
                    opcode: 'newArray',
                    blockType: BlockType.REPORTER,
                    text: '建立空白陣列 []'
                }
            ]
        };
    }

    _parse (str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return null;
        }
    }

    _parsePath (pathStr) {
        if (!pathStr || !pathStr.trim()) return [];
        const normalized = pathStr.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
        return normalized.split('.');
    }

    isValid (args) {
        const str = Cast.toString(args.JSON).trim();
        if (!str) return false;
        try {
            JSON.parse(str);
            return true;
        } catch (e) {
            return false;
        }
    }

    get (args) {
        const obj = this._parse(Cast.toString(args.JSON));
        if (obj === null || obj === undefined) return '';

        const keys = this._parsePath(Cast.toString(args.PATH));
        if (keys.length === 0) return JSON.stringify(obj);

        let current = obj;
        for (const k of keys) {
            if (current === null || current === undefined) return '';
            current = current[k];
        }

        if (current === null || current === undefined) return '';
        if (typeof current === 'object') return JSON.stringify(current);
        return String(current);
    }

    set (args) {
        let obj = this._parse(Cast.toString(args.JSON));
        if (obj === null || typeof obj !== 'object') {
            obj = {};
        }

        const keys = this._parsePath(Cast.toString(args.PATH));
        if (keys.length === 0) return JSON.stringify(obj);

        const valStr = Cast.toString(args.VALUE);
        let valToSet;
        try {
            valToSet = JSON.parse(valStr);
        } catch (e) {
            valToSet = valStr;
        }

        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                const nextKeyIsNum = !isNaN(Number(keys[i + 1]));
                current[key] = nextKeyIsNum ? [] : {};
            }
            current = current[key];
        }

        current[keys[keys.length - 1]] = valToSet;
        return JSON.stringify(obj);
    }

    deleteKey (args) {
        const obj = this._parse(Cast.toString(args.JSON));
        if (obj === null || typeof obj !== 'object') return Cast.toString(args.JSON);

        const keys = this._parsePath(Cast.toString(args.PATH));
        if (keys.length === 0) return JSON.stringify(obj);

        let current = obj;
        for (let i = 0; i < keys.length - 1; i++) {
            const key = keys[i];
            if (!current[key] || typeof current[key] !== 'object') {
                return JSON.stringify(obj);
            }
            current = current[key];
        }

        const lastKey = keys[keys.length - 1];
        if (Array.isArray(current)) {
            const idx = Number(lastKey);
            if (!isNaN(idx)) {
                current.splice(idx, 1);
            }
        } else {
            delete current[lastKey];
        }

        return JSON.stringify(obj);
    }

    keys (args) {
        const obj = this._parse(Cast.toString(args.JSON));
        if (obj === null || typeof obj !== 'object') return '[]';
        return JSON.stringify(Object.keys(obj));
    }

    values (args) {
        const obj = this._parse(Cast.toString(args.JSON));
        if (obj === null || typeof obj !== 'object') return '[]';
        return JSON.stringify(Object.values(obj));
    }

    length (args) {
        const obj = this._parse(Cast.toString(args.JSON));
        if (obj === null || obj === undefined) return 0;
        if (Array.isArray(obj)) return obj.length;
        if (typeof obj === 'object') return Object.keys(obj).length;
        return String(obj).length;
    }

    arrayPush (args) {
        let arr = this._parse(Cast.toString(args.JSON));
        if (!Array.isArray(arr)) {
            arr = [];
        }

        const valStr = Cast.toString(args.VALUE);
        let valToPush;
        try {
            valToPush = JSON.parse(valStr);
        } catch (e) {
            valToPush = valStr;
        }

        arr.push(valToPush);
        return JSON.stringify(arr);
    }

    arrayGet (args) {
        const arr = this._parse(Cast.toString(args.JSON));
        if (!Array.isArray(arr)) return '';

        const index = Cast.toNumber(args.INDEX) - 1; // 1-based index in Scratch
        if (index < 0 || index >= arr.length) return '';

        const item = arr[index];
        if (item === null || item === undefined) return '';
        if (typeof item === 'object') return JSON.stringify(item);
        return String(item);
    }

    newObject () {
        return '{}';
    }

    newArray () {
        return '[]';
    }
}

module.exports = Scratch3JSON;
