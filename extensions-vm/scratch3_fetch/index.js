const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Fetch {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'fetch',
            name: '網路請求 (Fetch)',
            color1: '#0284C7',
            color2: '#0369A1',
            color3: '#075985',
            blocks: [
                {
                    opcode: 'get',
                    blockType: BlockType.REPORTER,
                    text: '發送 GET 請求至 [URL]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://httpbin.org/get'
                        }
                    }
                },
                {
                    opcode: 'post',
                    blockType: BlockType.REPORTER,
                    text: '發送 POST 請求至 [URL] 內容 [DATA]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://httpbin.org/post'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Scratch!'
                        }
                    }
                },
                {
                    opcode: 'postJSON',
                    blockType: BlockType.REPORTER,
                    text: '發送 POST JSON 至 [URL] 資料 [DATA]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://httpbin.org/post'
                        },
                        DATA: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"message":"Hello","status":200}'
                        }
                    }
                },
                {
                    opcode: 'getJsonField',
                    blockType: BlockType.REPORTER,
                    text: '發送 GET 請求至 [URL] 並取得 JSON 欄位 [PATH]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'https://httpbin.org/json'
                        },
                        PATH: {
                            type: ArgumentType.STRING,
                            defaultValue: 'slideshow.title'
                        }
                    }
                },
                '---',
                {
                    opcode: 'isOnline',
                    blockType: BlockType.BOOLEAN,
                    text: '網路已連線？'
                }
            ]
        };
    }

    _extractPath (obj, pathStr) {
        if (!pathStr || !pathStr.trim()) return obj;
        const normalized = pathStr.replace(/\[(\w+)\]/g, '.$1').replace(/^\./, '');
        const keys = normalized.split('.');
        let current = obj;
        for (const k of keys) {
            if (current === null || current === undefined) return '';
            current = current[k];
        }
        if (current === null || current === undefined) return '';
        if (typeof current === 'object') return JSON.stringify(current);
        return String(current);
    }

    get (args) {
        const url = Cast.toString(args.URL);
        return fetch(url)
            .then(res => res.text())
            .catch(err => {
                console.error('[Fetch GET error]', err);
                return '';
            });
    }

    post (args) {
        const url = Cast.toString(args.URL);
        const data = Cast.toString(args.DATA);
        return fetch(url, {
            method: 'POST',
            body: data
        })
            .then(res => res.text())
            .catch(err => {
                console.error('[Fetch POST error]', err);
                return '';
            });
    }

    postJSON (args) {
        const url = Cast.toString(args.URL);
        const data = Cast.toString(args.DATA);
        return fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: data
        })
            .then(res => res.text())
            .catch(err => {
                console.error('[Fetch POST JSON error]', err);
                return '';
            });
    }

    getJsonField (args) {
        const url = Cast.toString(args.URL);
        const path = Cast.toString(args.PATH);
        return fetch(url)
            .then(res => res.json())
            .then(data => this._extractPath(data, path))
            .catch(err => {
                console.error('[Fetch getJsonField error]', err);
                return '';
            });
    }

    isOnline () {
        if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
            return !!navigator.onLine;
        }
        return true;
    }
}

module.exports = Scratch3Fetch;
