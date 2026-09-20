const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Particles {
    constructor (runtime) {
        this.runtime = runtime;
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.emitters = new Map(); // id -> {x, y, targetId, preset, rate, lastEmit}
        this.blendMode = 'source-over';
        this.animFrameId = null;

        this._setupCanvas = this._setupCanvas.bind(this);
        this._renderLoop = this._renderLoop.bind(this);

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._setupCanvas, {passive: true});
        }

        // Initialize canvas after DOM is ready
        setTimeout(this._setupCanvas, 500);

        this.runtime.on('PROJECT_STOP_ALL', () => {
            this.particles = [];
            this.emitters.clear();
        });

        this._startLoop();
    }

    _setupCanvas () {
        if (typeof document === 'undefined') return;
        let canvas = document.getElementById('scratch-particles-canvas');
        const stageContainer = document.querySelector('div[class*="stage_stage_"]') ||
                               document.querySelector('div[class*="stage-wrapper"]') ||
                               document.body;

        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'scratch-particles-canvas';
            canvas.style.position = 'absolute';
            canvas.style.left = '0';
            canvas.style.top = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '35'; // Above stage WebGL canvas, below UI overlays
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

    _scratchToCanvas (x, y) {
        if (!this.canvas) return {x: 240, y: 180};
        const cw = this.canvas.width;
        const ch = this.canvas.height;
        // Scratch (-240..240, -180..180) -> Canvas (0..cw, 0..ch)
        return {
            x: ((Number(x) + 240) / 480) * cw,
            y: ((180 - Number(y)) / 360) * ch
        };
    }

    _startLoop () {
        if (this.animFrameId) return;
        const loop = () => {
            this._renderLoop();
            if (typeof window !== 'undefined') {
                this.animFrameId = window.requestAnimationFrame(loop);
            }
        };
        if (typeof window !== 'undefined') {
            this.animFrameId = window.requestAnimationFrame(loop);
        }
    }

    _renderLoop () {
        if (!this.canvas || !this.ctx) {
            this._setupCanvas();
            return;
        }

        const ctx = this.ctx;
        const cw = this.canvas.width;
        const ch = this.canvas.height;

        ctx.clearRect(0, 0, cw, ch);

        // Update continuous emitters
        const now = Date.now();
        for (const [emitterId, emitter] of this.emitters.entries()) {
            let emitX = emitter.x;
            let emitY = emitter.y;
            if (emitter.targetId) {
                const target = this.runtime.getTargetById(emitter.targetId);
                if (!target) {
                    this.emitters.delete(emitterId);
                    continue;
                }
                emitX = target.x;
                emitY = target.y;
            }
            const interval = 1000 / emitter.rate;
            if (now - emitter.lastEmit >= interval) {
                const count = Math.min(10, Math.floor((now - emitter.lastEmit) / interval));
                this._burst(emitter.preset, emitX, emitY, count);
                emitter.lastEmit = now;
            }
        }

        if (this.particles.length === 0) return;

        ctx.save();
        ctx.globalCompositeOperation = this.blendMode;

        const remaining = [];
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            p.life -= 0.016;
            if (p.life <= 0) continue;

            p.x += p.vx;
            p.y += p.vy;
            p.vy += p.gravity;
            p.size *= p.shrink;

            const progress = p.life / p.maxLife; // 1 -> 0
            const alpha = Math.max(0, Math.min(1, progress * p.maxAlpha));

            ctx.beginPath();
            ctx.arc(p.x, p.y, Math.max(0.5, p.size), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = alpha;
            ctx.fill();

            remaining.push(p);
        }

        this.particles = remaining;
        ctx.restore();
    }

    _burst (preset, scratchX, scratchY, count) {
        const center = this._scratchToCanvas(scratchX, scratchY);
        const dpr = (this.canvas ? this.canvas.width / 480 : 1);

        for (let i = 0; i < count; i++) {
            let p;
            switch (preset) {
            case 'fire': {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.8;
                const speed = (2 + Math.random() * 4) * dpr;
                const colors = ['#ff3300', '#ff8800', '#ffcc00', '#ffee55'];
                p = {
                    x: center.x + (Math.random() - 0.5) * 15 * dpr,
                    y: center.y + (Math.random() - 0.5) * 8 * dpr,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: -0.05 * dpr,
                    size: (6 + Math.random() * 8) * dpr,
                    shrink: 0.96,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    maxLife: 0.6 + Math.random() * 0.4,
                    life: 0.6 + Math.random() * 0.4,
                    maxAlpha: 0.9
                };
                break;
            }
            case 'smoke': {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2;
                const speed = (0.5 + Math.random() * 2) * dpr;
                const shades = ['#555555', '#777777', '#999999', '#bbbbbb'];
                p = {
                    x: center.x + (Math.random() - 0.5) * 10 * dpr,
                    y: center.y + (Math.random() - 0.5) * 10 * dpr,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: -0.02 * dpr,
                    size: (8 + Math.random() * 10) * dpr,
                    shrink: 1.02, // Expands
                    color: shades[Math.floor(Math.random() * shades.length)],
                    maxLife: 1.2 + Math.random() * 0.8,
                    life: 1.2 + Math.random() * 0.8,
                    maxAlpha: 0.5
                };
                break;
            }
            case 'explosion': {
                const angle = Math.random() * Math.PI * 2;
                const speed = (3 + Math.random() * 8) * dpr;
                const colors = ['#ffffff', '#ffee33', '#ff6600', '#ff0033'];
                p = {
                    x: center.x,
                    y: center.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.1 * dpr,
                    size: (4 + Math.random() * 6) * dpr,
                    shrink: 0.95,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    maxLife: 0.5 + Math.random() * 0.5,
                    life: 0.5 + Math.random() * 0.5,
                    maxAlpha: 1.0
                };
                break;
            }
            case 'snow': {
                p = {
                    x: center.x + (Math.random() - 0.5) * 480 * (dpr),
                    y: center.y + (Math.random() - 0.5) * 50 * (dpr),
                    vx: (Math.random() - 0.5) * 0.8 * dpr,
                    vy: (0.8 + Math.random() * 1.5) * dpr,
                    gravity: 0.01 * dpr,
                    size: (2 + Math.random() * 3) * dpr,
                    shrink: 0.999,
                    color: '#ffffff',
                    maxLife: 2.5 + Math.random() * 1.5,
                    life: 2.5 + Math.random() * 1.5,
                    maxAlpha: 0.85
                };
                break;
            }
            case 'sparks': {
                const angle = Math.random() * Math.PI * 2;
                const speed = (4 + Math.random() * 6) * dpr;
                p = {
                    x: center.x,
                    y: center.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: 0.15 * dpr,
                    size: (2 + Math.random() * 2) * dpr,
                    shrink: 0.97,
                    color: Math.random() > 0.5 ? '#ffff77' : '#00ffff',
                    maxLife: 0.4 + Math.random() * 0.4,
                    life: 0.4 + Math.random() * 0.4,
                    maxAlpha: 1.0
                };
                break;
            }
            case 'stars': {
                const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.5;
                const speed = (1 + Math.random() * 2) * dpr;
                const colors = ['#fde047', '#a855f7', '#38bdf8', '#fb7185'];
                p = {
                    x: center.x + (Math.random() - 0.5) * 20 * dpr,
                    y: center.y + (Math.random() - 0.5) * 20 * dpr,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    gravity: -0.01 * dpr,
                    size: (3 + Math.random() * 4) * dpr,
                    shrink: 0.97,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    maxLife: 0.8 + Math.random() * 0.6,
                    life: 0.8 + Math.random() * 0.6,
                    maxAlpha: 0.9
                };
                break;
            }
            default:
                break;
            }

            if (p) {
                this.particles.push(p);
            }
        }
    }

    getInfo () {
        return {
            id: 'particles',
            name: '粒子特效與濾鏡 (Particles and FX)',
            color1: '#EC4899',
            color2: '#DB2777',
            color3: '#BE185D',
            blocks: [
                {
                    opcode: 'burstAtCoords',
                    blockType: BlockType.COMMAND,
                    text: '在 X: [X] Y: [Y] 噴射特效 [PRESET] 數量: [COUNT]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        PRESET: {
                            type: ArgumentType.STRING,
                            menu: 'presetMenu',
                            defaultValue: 'fire'
                        },
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 25
                        }
                    }
                },
                {
                    opcode: 'burstAtSprite',
                    blockType: BlockType.COMMAND,
                    text: '在當前角色位置噴射特效 [PRESET] 數量: [COUNT]',
                    arguments: {
                        PRESET: {
                            type: ArgumentType.STRING,
                            menu: 'presetMenu',
                            defaultValue: 'explosion'
                        },
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 30
                        }
                    }
                },
                {
                    opcode: 'startContinuous',
                    blockType: BlockType.COMMAND,
                    text: '跟隨當前角色持續發射 [PRESET] 頻率: 每秒 [RATE] 個',
                    arguments: {
                        PRESET: {
                            type: ArgumentType.STRING,
                            menu: 'presetMenu',
                            defaultValue: 'fire'
                        },
                        RATE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 15
                        }
                    }
                },
                {
                    opcode: 'stopSpriteEmitter',
                    blockType: BlockType.COMMAND,
                    text: '停止當前角色的粒子發射器'
                },
                {
                    opcode: 'stopAllEmitters',
                    blockType: BlockType.COMMAND,
                    text: '停止所有持續發射器'
                },
                {
                    opcode: 'emitCustom',
                    blockType: BlockType.COMMAND,
                    text: '自訂粒子 X: [X] Y: [Y] 顏色: [COLOR] 數量: [COUNT] 速度: [SPEED] 尺寸: [SIZE]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#00ffcc'
                        },
                        COUNT: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        },
                        SPEED: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        },
                        SIZE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 5
                        }
                    }
                },
                {
                    opcode: 'setBlendMode',
                    blockType: BlockType.COMMAND,
                    text: '設定粒子色彩混合模式: [MODE]',
                    arguments: {
                        MODE: {
                            type: ArgumentType.STRING,
                            menu: 'blendModeMenu',
                            defaultValue: 'lighter'
                        }
                    }
                },
                {
                    opcode: 'clearAll',
                    blockType: BlockType.COMMAND,
                    text: '清除畫布上所有粒子'
                },
                '---',
                {
                    opcode: 'getParticleCount',
                    blockType: BlockType.REPORTER,
                    text: '當前活躍粒子數量'
                }
            ],
            menus: {
                presetMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '火焰 (Fire)', value: 'fire'},
                        {text: '煙霧 (Smoke)', value: 'smoke'},
                        {text: '爆炸 (Explosion)', value: 'explosion'},
                        {text: '飄雪 (Snow)', value: 'snow'},
                        {text: '火花 (Sparks)', value: 'sparks'},
                        {text: '星光 (Stars)', value: 'stars'}
                    ]
                },
                blendModeMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '加亮光暈 (Lighter / Additive)', value: 'lighter'},
                        {text: '正常覆蓋 (Source-Over)', value: 'source-over'},
                        {text: '濾色疊加 (Screen)', value: 'screen'},
                        {text: '色彩增值 (Multiply)', value: 'multiply'}
                    ]
                }
            }
        };
    }

    burstAtCoords (args) {
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const preset = Cast.toString(args.PRESET);
        const count = Math.min(200, Math.max(1, Cast.toNumber(args.COUNT)));
        this._burst(preset, x, y, count);
    }

    burstAtSprite (args, util) {
        if (!util || !util.target) return;
        const preset = Cast.toString(args.PRESET);
        const count = Math.min(200, Math.max(1, Cast.toNumber(args.COUNT)));
        this._burst(preset, util.target.x, util.target.y, count);
    }

    startContinuous (args, util) {
        if (!util || !util.target) return;
        const preset = Cast.toString(args.PRESET);
        const rate = Math.min(60, Math.max(1, Cast.toNumber(args.RATE)));
        const targetId = util.target.id;
        this.emitters.set(targetId, {
            targetId: targetId,
            preset: preset,
            rate: rate,
            lastEmit: Date.now()
        });
    }

    stopSpriteEmitter (args, util) {
        if (!util || !util.target) return;
        this.emitters.delete(util.target.id);
    }

    stopAllEmitters () {
        this.emitters.clear();
    }

    emitCustom (args) {
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const color = Cast.toString(args.COLOR);
        const count = Math.min(200, Math.max(1, Cast.toNumber(args.COUNT)));
        const speed = Math.max(0.1, Cast.toNumber(args.SPEED));
        const size = Math.max(0.5, Cast.toNumber(args.SIZE));

        const center = this._scratchToCanvas(x, y);
        const dpr = (this.canvas ? this.canvas.width / 480 : 1);

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const spd = (speed * (0.5 + Math.random() * 0.8)) * dpr;
            this.particles.push({
                x: center.x,
                y: center.y,
                vx: Math.cos(angle) * spd,
                vy: Math.sin(angle) * spd,
                gravity: 0.05 * dpr,
                size: size * dpr,
                shrink: 0.97,
                color: color,
                maxLife: 0.8 + Math.random() * 0.5,
                life: 0.8 + Math.random() * 0.5,
                maxAlpha: 1.0
            });
        }
    }

    setBlendMode (args) {
        this.blendMode = Cast.toString(args.MODE);
    }

    clearAll () {
        this.particles = [];
        if (this.ctx && this.canvas) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        }
    }

    getParticleCount () {
        return this.particles.length;
    }
}

module.exports = Scratch3Particles;
