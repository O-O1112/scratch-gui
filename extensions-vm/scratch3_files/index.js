const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Files {
    constructor (runtime) {
        this.runtime = runtime;
        this.clipboardContent = '';
        this.loadedFileContent = '';
        this.loadedFileName = '';
        this.loadedFileSize = 0;
        this.hasLoaded = false;
    }

    getInfo () {
        return {
            id: 'files',
            name: '檔案與剪貼簿 (Files and Clipboard)',
            color1: '#0EA5E9',
            color2: '#0284C7',
            color3: '#0369A1',
            blocks: [
                {
                    opcode: 'copyToClipboard',
                    blockType: BlockType.COMMAND,
                    text: '複製文字 [TEXT] 到系統剪貼簿',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello Scratch!'
                        }
                    }
                },
                {
                    opcode: 'readClipboard',
                    blockType: BlockType.COMMAND,
                    text: '讀取系統剪貼簿內容'
                },
                {
                    opcode: 'getClipboard',
                    blockType: BlockType.REPORTER,
                    text: '當前剪貼簿文字'
                },
                '---',
                {
                    opcode: 'downloadFile',
                    blockType: BlockType.COMMAND,
                    text: '下載/儲存檔案 檔名: [FILENAME] 內容: [CONTENT]',
                    arguments: {
                        FILENAME: {
                            type: ArgumentType.STRING,
                            defaultValue: 'savegame.json'
                        },
                        CONTENT: {
                            type: ArgumentType.STRING,
                            defaultValue: '{"level": 1, "score": 1000}'
                        }
                    }
                },
                {
                    opcode: 'openFilePicker',
                    blockType: BlockType.COMMAND,
                    text: '彈出檔案選取視窗 支援類型: [EXT]',
                    arguments: {
                        EXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '.json,.txt,.csv'
                        }
                    }
                },
                '---',
                {
                    opcode: 'hasFileLoaded',
                    blockType: BlockType.BOOLEAN,
                    text: '已成功讀取檔案？'
                },
                {
                    opcode: 'getFileContent',
                    blockType: BlockType.REPORTER,
                    text: '讀取的檔案內容'
                },
                {
                    opcode: 'getFileName',
                    blockType: BlockType.REPORTER,
                    text: '讀取的檔案名稱'
                },
                {
                    opcode: 'getFileSize',
                    blockType: BlockType.REPORTER,
                    text: '讀取的檔案大小 (Bytes)'
                }
            ]
        };
    }

    copyToClipboard (args) {
        const text = Cast.toString(args.TEXT);
        this.clipboardContent = text;

        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).catch(() => {
                this._fallbackCopy(text);
            });
        } else {
            this._fallbackCopy(text);
        }
    }

    _fallbackCopy (text) {
        if (typeof document === 'undefined') return;
        try {
            const ta = document.createElement('textarea');
            ta.value = text;
            ta.style.position = 'fixed';
            ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.focus();
            ta.select();
            document.execCommand('copy');
            document.body.removeChild(ta);
        } catch (e) {
            // ignore
        }
    }

    readClipboard () {
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.readText) {
            return navigator.clipboard.readText().then((text) => {
                this.clipboardContent = text;
                return text;
            }).catch(() => {
                return this.clipboardContent;
            });
        }
        return this.clipboardContent;
    }

    getClipboard () {
        return this.clipboardContent;
    }

    downloadFile (args) {
        const filename = Cast.toString(args.FILENAME) || 'download.txt';
        const content = Cast.toString(args.CONTENT);

        if (typeof document === 'undefined') return;

        try {
            const blob = new Blob([content], {type: 'text/plain;charset=utf-8'});
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (e) {
            // ignore download error
        }
    }

    openFilePicker (args) {
        if (typeof document === 'undefined') return;

        const accept = Cast.toString(args.EXT) || '*/*';
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = accept;
        input.style.display = 'none';

        input.onchange = (e) => {
            const file = e.target.files && e.target.files[0];
            if (!file) return;

            this.loadedFileName = file.name;
            this.loadedFileSize = file.size;

            const reader = new FileReader();
            reader.onload = (event) => {
                this.loadedFileContent = event.target.result;
                this.hasLoaded = true;
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            };
            reader.onerror = () => {
                this.hasLoaded = false;
                if (input.parentNode) {
                    input.parentNode.removeChild(input);
                }
            };
            reader.readAsText(file);
        };

        document.body.appendChild(input);
        input.click();
    }

    hasFileLoaded () {
        return this.hasLoaded;
    }

    getFileContent () {
        return this.loadedFileContent;
    }

    getFileName () {
        return this.loadedFileName;
    }

    getFileSize () {
        return this.loadedFileSize;
    }
}

module.exports = Scratch3Files;
