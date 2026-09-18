const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Console {
    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: 'console',
            name: '控制台 (Console)',
            color1: '#3D5A80',
            color2: '#293241',
            color3: '#1E2530',
            blocks: [
                {
                    opcode: 'log',
                    blockType: BlockType.COMMAND,
                    text: '輸出日誌 [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello from Scratch!'
                        }
                    }
                },
                {
                    opcode: 'warn',
                    blockType: BlockType.COMMAND,
                    text: '輸出警告 [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Warning message'
                        }
                    }
                },
                {
                    opcode: 'error',
                    blockType: BlockType.COMMAND,
                    text: '輸出錯誤 [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Error message'
                        }
                    }
                },
                {
                    opcode: 'info',
                    blockType: BlockType.COMMAND,
                    text: '輸出資訊 [TEXT]',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Info message'
                        }
                    }
                },
                {
                    opcode: 'clear',
                    blockType: BlockType.COMMAND,
                    text: '清空控制台'
                },
                '---',
                {
                    opcode: 'timeStart',
                    blockType: BlockType.COMMAND,
                    text: '開始計時 [LABEL]',
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'timer1'
                        }
                    }
                },
                {
                    opcode: 'timeEnd',
                    blockType: BlockType.COMMAND,
                    text: '結束計時 [LABEL]',
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'timer1'
                        }
                    }
                },
                {
                    opcode: 'count',
                    blockType: BlockType.COMMAND,
                    text: '計數 [LABEL]',
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: 'counter1'
                        }
                    }
                }
            ]
        };
    }

    log (args) {
        console.log(Cast.toString(args.TEXT));
    }

    warn (args) {
        console.warn(Cast.toString(args.TEXT));
    }

    error (args) {
        console.error(Cast.toString(args.TEXT));
    }

    info (args) {
        console.info(Cast.toString(args.TEXT));
    }

    clear () {
        console.clear();
    }

    timeStart (args) {
        console.time(Cast.toString(args.LABEL));
    }

    timeEnd (args) {
        console.timeEnd(Cast.toString(args.LABEL));
    }

    count (args) {
        console.count(Cast.toString(args.LABEL));
    }
}

module.exports = Scratch3Console;
