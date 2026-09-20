const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3AnimatedText {
    constructor (runtime) {
        this.runtime = runtime;
        this.canvas = null;
        this.ctx = null;
        this.text = '';
        this.displayedText = '';
        this.color = '#FFFFFF';
        this.fontSize = 32;
        this.fontFamily = 'sans-serif';
        this.effect = 'none';
        this.posX = 0;
        this.posY = 0;
        this.typewriterTimer = null;
        this.animFrameId = null;
        this.animTick = 0;

        this._setupCanvas = this._setupCanvas.bind(this);
        this._render = this._render.bind(this);

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._setupCanvas, {passive: true});
        }
        setTimeout(this._setupCanvas, 500);

        this.runtime.on('PROJECT_STOP_ALL', () => {
            this.clearText();
        });

        this._startLoop();
    }

    _setupCanvas () {
        if (typeof document === 'undefined') return;
        let canvas = document.getElementById('scratch-animated-text-canvas');
        const stageContainer = document.querySelector('div[class*="stage_stage_"]') ||
                               document.querySelector('div[class*="stage-wrapper"]') ||
                               document.body;

        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'scratch-animated-text-canvas';
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '36';
            if (stageContainer) {
                stageContainer.style.position = 'relative';
                stageContainer.appendChild(canvas);
            }
        }

        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        const rect = canvas.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        const w = rect.width > 0 ? rect.width : 480;
        const h = rect.height > 0 ? rect.height : 360;
        canvas.width = Math.floor(w * dpr);
        canvas.height = Math.floor(h * dpr);
    }

    _startLoop () {
        if (this.animFrameId) return;
        const loop = () => {
            this._render();
            if (typeof window !== 'undefined') {
                this.animFrameId = window.requestAnimationFrame(loop);
            }
        };
        if (typeof window !== 'undefined') {
            this.animFrameId = window.requestAnimationFrame(loop);
        }
    }

    _render () {
        if (!this.canvas || !this.ctx) return;
        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        ctx.clearRect(0, 0, cw, ch);

        if (!this.displayedText) return;

        this.animTick++;
        const dpr = cw / 480;
        const cx = ((this.posX + 240) / 480) * cw;
        const cy = ((180 - this.posY) / 360) * ch;

        ctx.save();
        ctx.font = `bold ${Math.floor(this.fontSize * dpr)}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let drawX = cx;
        let drawY = cy;

        if (this.effect === 'shake') {
            drawX += (Math.random() - 0.5) * 4 * dpr;
            drawY += (Math.random() - 0.5) * 4 * dpr;
        }

        if (this.effect === 'rainbow') {
            const hue = (this.animTick * 3) % 360;
            ctx.fillStyle = `hsl(${hue}, 90%, 60%)`;
        } else if (this.effect === 'pulse') {
            const scale = 1 + Math.sin(this.animTick * 0.1) * 0.1;
            ctx.translate(drawX, drawY);
            ctx.scale(scale, scale);
            drawX = 0;
            drawY = 0;
            ctx.fillStyle = this.color;
        } else {
            ctx.fillStyle = this.color;
        }

        // Text shadow for crisp readability
        ctx.shadowColor = 'rgba(0,0,0,0.6)';
        ctx.shadowBlur = 4 * dpr;
        ctx.shadowOffsetX = 2 * dpr;
        ctx.shadowOffsetY = 2 * dpr;

        ctx.fillText(this.displayedText, drawX, drawY);
        ctx.restore();
    }

    getInfo () {
        return {
            id: 'animatedtext',
            name: '動態文字 (Animated Text)',
            color1: '#7C3AED',
            color2: '#6D28D9',
            color3: '#5B21B6',
            blocks: [
                {
                    opcode: 'showText',
                    blockType: BlockType.COMMAND,
                    text: '在 X: [X] Y: [Y] 顯示文字 [TEXT]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Hello World!'
                        }
                    }
                },
                {
                    opcode: 'typewriteText',
                    blockType: BlockType.COMMAND,
                    text: '以打字機效果顯示 [TEXT] 間隔: [SPEED] 秒',
                    arguments: {
                        TEXT: {
                            type: ArgumentType.STRING,
                            defaultValue: '歡迎來到 Scratch 奇幻世界！'
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.05
                        }
                    }
                },
                {
                    opcode: 'clearText',
                    blockType: BlockType.COMMAND,
                    text: '清除動態文字'
                },
                '---',
                {
                    opcode: 'setStyle',
                    blockType: BlockType.COMMAND,
                    text: '設定文字 字型: [FONT] 大小: [SIZE] 顏色: [COLOR]',
                    arguments: {
                        FONT: {
                            type: ArgumentType.STRING,
                            menu: 'fontMenu',
                            defaultValue: 'sans-serif'
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 36
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#FFFFFF'
                        }
                    }
                },
                {
                    opcode: 'setEffect',
                    blockType: BlockType.COMMAND,
                    text: '設定文字動態特效: [EFFECT]',
                    arguments: {
                        EFFECT: {
                            type: ArgumentType.STRING,
                            menu: 'effectMenu',
                            defaultValue: 'rainbow'
                        }
                    }
                },
                '---',
                {
                    opcode: 'getCurrentText',
                    blockType: BlockType.REPORTER,
                    text: '當前顯示文字'
                }
            ],
            menus: {
                fontMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '黑體 (Sans-Serif)', value: 'sans-serif'},
                        {text: '等寬字體 (Monospace)', value: 'monospace'},
                        {text: '手寫風 (Cursive)', value: 'cursive'}
                    ]
                },
                effectMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '彩虹漸層 (Rainbow)', value: 'rainbow'},
                        {text: '震動搖擺 (Shake)', value: 'shake'},
                        {text: '心跳呼吸 (Pulse)', value: 'pulse'},
                        {text: '無特效 (None)', value: 'none'}
                    ]
                }
            }
        };
    }

    showText (args) {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        this.posX = Cast.toNumber(args.X);
        this.posY = Cast.toNumber(args.Y);
        this.text = Cast.toString(args.TEXT);
        this.displayedText = this.text;
    }

    typewriteText (args) {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        this.text = Cast.toString(args.TEXT);
        this.displayedText = '';
        const speed = Math.max(0.01, Cast.toNumber(args.SPEED)) * 1000;

        let index = 0;
        this.typewriterTimer = setInterval(() => {
            if (index < this.text.length) {
                this.displayedText = this.text.substring(0, index + 1);
                index++;
            } else {
                clearInterval(this.typewriterTimer);
                this.typewriterTimer = null;
            }
        }, speed);
    }

    clearText () {
        if (this.typewriterTimer) {
            clearInterval(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        this.text = '';
        this.displayedText = '';
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    setStyle (args) {
        this.fontFamily = Cast.toString(args.FONT);
        this.fontSize = Math.max(8, Math.min(120, Cast.toNumber(args.SIZE)));
        this.color = Cast.toString(args.COLOR);
    }

    setEffect (args) {
        this.effect = Cast.toString(args.EFFECT);
    }

    getCurrentText () {
        return this.displayedText;
    }
}

module.exports = Scratch3AnimatedText;
