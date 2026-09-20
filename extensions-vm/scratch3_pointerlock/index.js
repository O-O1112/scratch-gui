const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3PointerLock {
    constructor (runtime) {
        this.runtime = runtime;
        this.isLocked = false;
        this.deltaX = 0;
        this.deltaY = 0;

        this._onMouseMove = this._onMouseMove.bind(this);
        this._onLockChange = this._onLockChange.bind(this);

        if (typeof document !== 'undefined') {
            document.addEventListener('pointerlockchange', this._onLockChange, false);
            document.addEventListener('mousemove', this._onMouseMove, false);
        }

        this.runtime.on('PROJECT_STOP_ALL', () => {
            this.unlock();
            this.deltaX = 0;
            this.deltaY = 0;
        });
    }

    _getStageElement () {
        if (typeof document === 'undefined') return null;
        return document.querySelector('div[class*="stage_stage_"]') ||
               document.querySelector('div[class*="stage-wrapper"]') ||
               document.querySelector('canvas') ||
               document.body;
    }

    _onLockChange () {
        const stage = this._getStageElement();
        this.isLocked = (document.pointerLockElement === stage) || (document.pointerLockElement !== null);
    }

    _onMouseMove (e) {
        if (this.isLocked) {
            this.deltaX += e.movementX || 0;
            this.deltaY += e.movementY || 0;
        }
    }

    getInfo () {
        return {
            id: 'pointerlock',
            name: '滑鼠指針鎖定 (Pointer Lock)',
            color1: '#0F766E',
            color2: '#0D9488',
            color3: '#115E59',
            blocks: [
                {
                    opcode: 'lock',
                    blockType: BlockType.COMMAND,
                    text: '鎖定滑鼠指針到舞台'
                },
                {
                    opcode: 'unlock',
                    blockType: BlockType.COMMAND,
                    text: '解除滑鼠指針鎖定'
                },
                {
                    opcode: 'resetDelta',
                    blockType: BlockType.COMMAND,
                    text: '重設滑鼠移動累積量'
                },
                '---',
                {
                    opcode: 'isPointerLocked',
                    blockType: BlockType.BOOLEAN,
                    text: '滑鼠指針已鎖定？'
                },
                {
                    opcode: 'getDeltaX',
                    blockType: BlockType.REPORTER,
                    text: '滑鼠水平移動量 (Delta X)'
                },
                {
                    opcode: 'getDeltaY',
                    blockType: BlockType.REPORTER,
                    text: '滑鼠垂直移動量 (Delta Y)'
                }
            ]
        };
    }

    lock () {
        const stage = this._getStageElement();
        if (stage && stage.requestPointerLock) {
            stage.requestPointerLock();
        }
    }

    unlock () {
        if (typeof document !== 'undefined' && document.exitPointerLock) {
            document.exitPointerLock();
        }
    }

    resetDelta () {
        this.deltaX = 0;
        this.deltaY = 0;
    }

    isPointerLocked () {
        return this.isLocked;
    }

    getDeltaX () {
        const dx = this.deltaX;
        this.deltaX = 0; // Return and reset for game loop tick
        return dx;
    }

    getDeltaY () {
        const dy = this.deltaY;
        this.deltaY = 0; // Return and reset for game loop tick
        return dy;
    }
}

module.exports = Scratch3PointerLock;
