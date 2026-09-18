const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Cursor {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'cursor',
            name: '自訂游標 (Cursor)',
            color1: '#7B2CBF',
            color2: '#5A189A',
            color3: '#3C096C',
            blocks: [
                {
                    opcode: 'setCursorType',
                    blockType: BlockType.COMMAND,
                    text: '將游標設為 [TYPE]',
                    arguments: {
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'cursorTypeMenu',
                            defaultValue: 'pointer'
                        }
                    }
                },
                {
                    opcode: 'setCustomCursorImage',
                    blockType: BlockType.COMMAND,
                    text: '將游標設為圖片 [URL] 焦點X: [X] Y: [Y]',
                    arguments: {
                        URL: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        },
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'hideCursor',
                    blockType: BlockType.COMMAND,
                    text: '隱藏滑鼠游標'
                },
                {
                    opcode: 'showCursor',
                    blockType: BlockType.COMMAND,
                    text: '顯示滑鼠游標'
                }
            ],
            menus: {
                cursorTypeMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '預設箭頭 (default)', value: 'default'},
                        {text: '手勢指標 (pointer)', value: 'pointer'},
                        {text: '文字輸入 (text)', value: 'text'},
                        {text: '十字準星 (crosshair)', value: 'crosshair'},
                        {text: '移動 (move)', value: 'move'},
                        {text: '禁止 (not-allowed)', value: 'not-allowed'},
                        {text: '等待 (wait)', value: 'wait'},
                        {text: '抓取 (grab)', value: 'grab'}
                    ]
                }
            }
        };
    }

    _getCanvas () {
        if (typeof document === 'undefined') return null;
        return document.querySelector('canvas') || document.body;
    }

    setCursorType (args) {
        const type = Cast.toString(args.TYPE);
        const canvas = this._getCanvas();
        if (canvas) {
            canvas.style.cursor = type;
        }
    }

    setCustomCursorImage (args) {
        const url = Cast.toString(args.URL);
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const canvas = this._getCanvas();
        if (canvas && url) {
            canvas.style.cursor = 'url("' + url + '") ' + x + ' ' + y + ', auto';
        }
    }

    hideCursor () {
        const canvas = this._getCanvas();
        if (canvas) {
            canvas.style.cursor = 'none';
        }
    }

    showCursor () {
        const canvas = this._getCanvas();
        if (canvas) {
            canvas.style.cursor = 'default';
        }
    }
}

module.exports = Scratch3Cursor;
