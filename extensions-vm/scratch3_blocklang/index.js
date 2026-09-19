const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');
const BlockEngine = require('./block-engine');

class Scratch3BlockLang {
    constructor (runtime) {
        this.runtime = runtime;
        this.engine = new BlockEngine(this._createScratchBridge());
    }

    _createScratchBridge () {
        const runtime = this.runtime;
        return {
            say: (msg) => {
                const target = runtime.getEditingTarget();
                if (target) {
                    runtime.emit('SAY', target, 'say', String(msg));
                }
            },
            setPos: (x, y) => {
                const target = runtime.getEditingTarget();
                if (target) target.setXY(Number(x), Number(y));
            },
            setX: (x) => {
                const target = runtime.getEditingTarget();
                if (target) target.setXY(Number(x), target.y);
            },
            setY: (y) => {
                const target = runtime.getEditingTarget();
                if (target) target.setXY(target.x, Number(y));
            },
            get x () {
                const target = runtime.getEditingTarget();
                return target ? target.x : 0;
            },
            get y () {
                const target = runtime.getEditingTarget();
                return target ? target.y : 0;
            },
            get direction () {
                const target = runtime.getEditingTarget();
                return target ? target.direction : 90;
            },
            setDirection: (dir) => {
                const target = runtime.getEditingTarget();
                if (target) target.setDirection(Number(dir));
            },
            broadcast: (name) => {
                runtime.startHats('event_whenbroadcastreceived', {
                    BROADCAST_OPTION: String(name)
                });
            },
            getVar: (name) => {
                const target = runtime.getEditingTarget() || runtime.getTargetForStage();
                if (target && target.lookupVariableByNameAndType) {
                    const v = target.lookupVariableByNameAndType(name, '');
                    if (v) return v.value;
                }
                return '';
            },
            setVar: (name, val) => {
                const target = runtime.getEditingTarget() || runtime.getTargetForStage();
                if (target && target.lookupOrCreateVariable) {
                    const v = target.lookupOrCreateVariable(name, '');
                    if (v) v.value = val;
                }
            }
        };
    }

    getInfo () {
        return {
            id: 'blocklang',
            name: 'Block Plus 引擎',
            color1: '#0F172A',
            color2: '#1E293B',
            color3: '#334155',
            blocks: [
                {
                    opcode: 'executeBlock',
                    blockType: BlockType.COMMAND,
                    text: '執行 Block 程式碼 [CODE]',
                    arguments: {
                        CODE: {
                            type: ArgumentType.STRING,
                            defaultValue: "<py>print('123')<\\py>"
                        }
                    }
                },
                {
                    opcode: 'executeAndGetOutput',
                    blockType: BlockType.REPORTER,
                    text: '執行 Block 程式碼並回傳 [CODE]',
                    arguments: {
                        CODE: {
                            type: ArgumentType.STRING,
                            defaultValue: "<py>print('123')<\\py>"
                        }
                    }
                },
                {
                    opcode: 'evaluateExpr',
                    blockType: BlockType.REPORTER,
                    text: '計算 Block 表達式 [EXPR]',
                    arguments: {
                        EXPR: {
                            type: ArgumentType.STRING,
                            defaultValue: '123 * 2'
                        }
                    }
                },
                '---',
                {
                    opcode: 'getBlockVar',
                    blockType: BlockType.REPORTER,
                    text: 'Block 全域變數 [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'score'
                        }
                    }
                },
                {
                    opcode: 'setBlockVar',
                    blockType: BlockType.COMMAND,
                    text: '設 Block 全域變數 [KEY] 為 [VALUE]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'score'
                        },
                        VALUE: {
                            type: ArgumentType.STRING,
                            defaultValue: '100'
                        }
                    }
                },
                {
                    opcode: 'delBlockVar',
                    blockType: BlockType.COMMAND,
                    text: '刪除 Block 全域變數 [KEY]',
                    arguments: {
                        KEY: {
                            type: ArgumentType.STRING,
                            defaultValue: 'score'
                        }
                    }
                },
                {
                    opcode: 'getAllVarsJson',
                    blockType: BlockType.REPORTER,
                    text: 'Block 所有全域變數 (JSON)'
                },
                '---',
                {
                    opcode: 'getLogs',
                    blockType: BlockType.REPORTER,
                    text: 'Block 控制台輸出紀錄'
                },
                {
                    opcode: 'clearLogs',
                    blockType: BlockType.COMMAND,
                    text: '清空 Block 控制台紀錄'
                },
                {
                    opcode: 'resetEngine',
                    blockType: BlockType.COMMAND,
                    text: '重設 Block 引擎狀態'
                }
            ]
        };
    }

    executeBlock (args) {
        const code = Cast.toString(args.CODE);
        const target = this.runtime.getEditingTarget();
        const prevLogsLen = this.engine.outputLogs.length;

        const res = this.engine.execute(code);
        if (res && typeof res.then === 'function') {
            return res.then(val => {
                const newLogs = this.engine.outputLogs.slice(prevLogsLen);
                const toShow = newLogs.length > 0 ? newLogs.join('\n') : (val !== undefined ? String(val) : '');
                if (toShow && target) {
                    this.runtime.emit('SAY', target, 'say', String(toShow));
                }
                return val;
            });
        }
        const newLogs = this.engine.outputLogs.slice(prevLogsLen);
        const toShow = newLogs.length > 0 ? newLogs.join('\n') : (res !== undefined ? String(res) : '');
        if (toShow && target) {
            this.runtime.emit('SAY', target, 'say', String(toShow));
        }
        return res;
    }

    evaluateExpr (args) {
        const expr = Cast.toString(args.EXPR);
        const res = this.engine.evaluateNativeExpr(expr, { state: this.engine.state, scratch: this.engine.scratchBridge });
        return typeof res === 'object' && res !== null ? JSON.stringify(res) : String(res !== undefined ? res : '');
    }

    executeAndGetOutput (args) {
        const code = Cast.toString(args.CODE);
        const prevLogsLen = this.engine.outputLogs.length;
        const res = this.engine.executeSync(code);
        const newLogs = this.engine.outputLogs.slice(prevLogsLen);
        if (newLogs.length > 0) return newLogs.join('\n');
        return res !== undefined ? String(res) : '';
    }

    getBlockVar (args) {
        const key = Cast.toString(args.KEY);
        const val = this.engine.getState(key);
        return typeof val === 'object' && val !== null ? JSON.stringify(val) : String(val);
    }

    setBlockVar (args) {
        const key = Cast.toString(args.KEY);
        let val = args.VALUE;
        const num = Number(val);
        if (!isNaN(num) && String(val).trim() !== '') {
            val = num;
        } else if (val === 'true' || val === 'True') {
            val = true;
        } else if (val === 'false' || val === 'False') {
            val = false;
        }
        this.engine.setState(key, val);
    }

    delBlockVar (args) {
        const key = Cast.toString(args.KEY);
        this.engine.deleteState(key);
    }

    getAllVarsJson () {
        return this.engine.getAllStateJson();
    }

    getLogs () {
        return this.engine.getLogs();
    }

    clearLogs () {
        this.engine.clearLogs();
    }

    resetEngine () {
        this.engine.resetState();
    }
}

module.exports = Scratch3BlockLang;
