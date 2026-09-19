const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

const DEFAULT_AXIS_DEADZONE = 0.1;
const BUTTON_DEADZONE = 0.05;

class Scratch3Gamepad {
    constructor (runtime) {
        this.runtime = runtime;
        this.gamepadState = [];

        if (this.runtime && this.runtime.on) {
            this.runtime.on('BEFORE_EXECUTE', () => {
                this.updateState();
            });
        }
    }

    updateState () {
        if (typeof navigator === 'undefined' || !navigator.getGamepads) {
            this.gamepadState = [];
            return;
        }

        const rawGamepads = navigator.getGamepads();
        const oldState = this.gamepadState;

        this.gamepadState = Array.from(rawGamepads || []).map((gamepad, idx) => {
            if (!gamepad) return null;

            const oldResult = oldState && oldState[idx];
            const state = {
                id: gamepad.id,
                connected: gamepad.connected,
                axisValues: [],
                axisDirections: [],
                axisMagnitudes: [],
                buttonValues: [],
                buttonPressed: [],
                vibrationActuator: gamepad.vibrationActuator || null
            };

            // Process pairs of axes (0,1 = Left stick, 2,3 = Right stick)
            for (let i = 0; i < gamepad.axes.length; i += 2) {
                const x = gamepad.axes[i] || 0;
                const y = (i + 1 < gamepad.axes.length) ? gamepad.axes[i + 1] : 0;
                const magnitude = Math.sqrt(x * x + y * y);

                if (magnitude > DEFAULT_AXIS_DEADZONE) {
                    let direction = (Math.atan2(y, x) * 180 / Math.PI) + 90;
                    if (direction < 0) direction += 360;

                    state.axisDirections.push(direction, direction);
                    state.axisMagnitudes.push(magnitude, magnitude);
                    state.axisValues.push(x, y);
                } else {
                    const oldDir = (oldResult && oldResult.axisDirections[i]) !== undefined ?
                        oldResult.axisDirections[i] : 90;
                    state.axisDirections.push(oldDir, oldDir);
                    state.axisMagnitudes.push(0, 0);
                    state.axisValues.push(0, 0);
                }
            }

            // Process buttons
            for (let i = 0; i < gamepad.buttons.length; i++) {
                const btn = gamepad.buttons[i];
                let val = (typeof btn === 'object' && btn !== null) ? btn.value : btn;
                let pressed = (typeof btn === 'object' && btn !== null) ? btn.pressed : (val > 0.5);

                if (val < BUTTON_DEADZONE) {
                    val = 0;
                    pressed = false;
                }

                state.buttonValues.push(val);
                state.buttonPressed.push(pressed);
            }

            return state;
        });
    }

    _getGamepads (padIndex) {
        this.updateState();
        if (padIndex === 'any') {
            return this.gamepadState.filter(p => p !== null);
        }
        const idx = Cast.toNumber(padIndex) - 1;
        if (idx >= 0 && idx < this.gamepadState.length && this.gamepadState[idx]) {
            return [this.gamepadState[idx]];
        }
        return [];
    }

    getInfo () {
        return {
            id: 'gamepad',
            name: '遊戲手把 (Gamepad)',
            color1: '#8B5CF6',
            color2: '#7C3AED',
            color3: '#6D28D9',
            blocks: [
                {
                    opcode: 'gamepadConnected',
                    blockType: BlockType.BOOLEAN,
                    text: '遊戲手把 [PAD] 已連線？',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'gamepadCount',
                    blockType: BlockType.REPORTER,
                    text: '已連線的遊戲手把數量'
                },
                '---',
                {
                    opcode: 'buttonDown',
                    blockType: BlockType.BOOLEAN,
                    text: '手把 [PAD] 的按鈕 [BUTTON] 按下？',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        },
                        BUTTON: {
                            type: ArgumentType.STRING,
                            menu: 'buttonMenu',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'buttonValue',
                    blockType: BlockType.REPORTER,
                    text: '手把 [PAD] 的按鈕 [BUTTON] 數值 (0-1)',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        },
                        BUTTON: {
                            type: ArgumentType.STRING,
                            menu: 'buttonMenu',
                            defaultValue: '0'
                        }
                    }
                },
                '---',
                {
                    opcode: 'axisValue',
                    blockType: BlockType.REPORTER,
                    text: '手把 [PAD] 的軸 [AXIS] 數值 (-1 到 1)',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        },
                        AXIS: {
                            type: ArgumentType.STRING,
                            menu: 'axisMenu',
                            defaultValue: '0'
                        }
                    }
                },
                {
                    opcode: 'stickDirection',
                    blockType: BlockType.REPORTER,
                    text: '手把 [PAD] 的 [STICK] 角度 (0-360°)',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        },
                        STICK: {
                            type: ArgumentType.STRING,
                            menu: 'stickMenu',
                            defaultValue: '1'
                        }
                    }
                },
                {
                    opcode: 'stickMagnitude',
                    blockType: BlockType.REPORTER,
                    text: '手把 [PAD] 的 [STICK] 推力大小 (0-1)',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        },
                        STICK: {
                            type: ArgumentType.STRING,
                            menu: 'stickMenu',
                            defaultValue: '1'
                        }
                    }
                },
                '---',
                {
                    opcode: 'vibrate',
                    blockType: BlockType.COMMAND,
                    text: '震動手把 [PAD] 持續 [DURATION] 毫秒 強度 [STRONG] 弱震 [WEAK]',
                    arguments: {
                        PAD: {
                            type: ArgumentType.STRING,
                            menu: 'padMenu',
                            defaultValue: '1'
                        },
                        DURATION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 300
                        },
                        STRONG: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.8
                        },
                        WEAK: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.5
                        }
                    }
                }
            ],
            menus: {
                padMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '手把 1', value: '1'},
                        {text: '手把 2', value: '2'},
                        {text: '手把 3', value: '3'},
                        {text: '手把 4', value: '4'},
                        {text: '任何手把', value: 'any'}
                    ]
                },
                buttonMenu: {
                    acceptReporters: true,
                    items: [
                        {text: 'A / 叉 (Cross)', value: '0'},
                        {text: 'B / 圓 (Circle)', value: '1'},
                        {text: 'X / 方塊 (Square)', value: '2'},
                        {text: 'Y / 三角 (Triangle)', value: '3'},
                        {text: 'L1 / 左肩鍵', value: '4'},
                        {text: 'R1 / 右肩鍵', value: '5'},
                        {text: 'L2 / 左板機', value: '6'},
                        {text: 'R2 / 右板機', value: '7'},
                        {text: 'Select / Back / Share', value: '8'},
                        {text: 'Start / Options', value: '9'},
                        {text: 'L3 / 左搖桿下壓', value: '10'},
                        {text: 'R3 / 右搖桿下壓', value: '11'},
                        {text: '方向鍵 上', value: '12'},
                        {text: '方向鍵 下', value: '13'},
                        {text: '方向鍵 左', value: '14'},
                        {text: '方向鍵 右', value: '15'},
                        {text: 'Home / 主頁鍵', value: '16'},
                        {text: '任何按鈕', value: 'any'}
                    ]
                },
                axisMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '左搖桿 X (橫向)', value: '0'},
                        {text: '左搖桿 Y (縱向)', value: '1'},
                        {text: '右搖桿 X (橫向)', value: '2'},
                        {text: '右搖桿 Y (縱向)', value: '3'}
                    ]
                },
                stickMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '左搖桿', value: '1'},
                        {text: '右搖桿', value: '2'}
                    ]
                }
            }
        };
    }

    gamepadConnected (args) {
        const pads = this._getGamepads(args.PAD);
        return pads.length > 0;
    }

    gamepadCount () {
        this.updateState();
        return this.gamepadState.filter(p => p !== null).length;
    }

    buttonDown (args) {
        const pads = this._getGamepads(args.PAD);
        if (pads.length === 0) return false;

        const targetButton = args.BUTTON;
        if (targetButton === 'any') {
            return pads.some(p => p.buttonPressed.some(pressed => pressed));
        }

        const bIdx = Cast.toNumber(targetButton);
        return pads.some(p => !!p.buttonPressed[bIdx]);
    }

    buttonValue (args) {
        const pads = this._getGamepads(args.PAD);
        if (pads.length === 0) return 0;

        const bIdx = Cast.toNumber(args.BUTTON);
        for (const pad of pads) {
            if (pad.buttonValues[bIdx] !== undefined) {
                return pad.buttonValues[bIdx];
            }
        }
        return 0;
    }

    axisValue (args) {
        const pads = this._getGamepads(args.PAD);
        if (pads.length === 0) return 0;

        const aIdx = Cast.toNumber(args.AXIS);
        for (const pad of pads) {
            if (pad.axisValues[aIdx] !== undefined) {
                return pad.axisValues[aIdx];
            }
        }
        return 0;
    }

    stickDirection (args) {
        const pads = this._getGamepads(args.PAD);
        if (pads.length === 0) return 90;

        const stick = Cast.toNumber(args.STICK);
        const startIndex = (stick === 2) ? 2 : 0;
        for (const pad of pads) {
            if (pad.axisDirections[startIndex] !== undefined) {
                return pad.axisDirections[startIndex];
            }
        }
        return 90;
    }

    stickMagnitude (args) {
        const pads = this._getGamepads(args.PAD);
        if (pads.length === 0) return 0;

        const stick = Cast.toNumber(args.STICK);
        const startIndex = (stick === 2) ? 2 : 0;
        for (const pad of pads) {
            if (pad.axisMagnitudes[startIndex] !== undefined) {
                return pad.axisMagnitudes[startIndex];
            }
        }
        return 0;
    }

    vibrate (args) {
        const pads = this._getGamepads(args.PAD);
        const duration = Math.max(0, Cast.toNumber(args.DURATION));
        const strong = Math.min(1, Math.max(0, Cast.toNumber(args.STRONG)));
        const weak = Math.min(1, Math.max(0, Cast.toNumber(args.WEAK)));

        pads.forEach(pad => {
            if (pad && pad.vibrationActuator && typeof pad.vibrationActuator.playEffect === 'function') {
                try {
                    pad.vibrationActuator.playEffect('dual-rumble', {
                        startDelay: 0,
                        duration: duration,
                        weakMagnitude: weak,
                        strongMagnitude: strong
                    });
                } catch (e) {
                    console.warn('[Gamepad vibrate error]', e);
                }
            }
        });
    }
}

module.exports = Scratch3Gamepad;
