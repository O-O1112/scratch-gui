const Matter = require('matter-js');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Physics {
    constructor (runtime) {
        this.runtime = runtime;
        this.engine = null;
        this.world = null;
        this.bodies = new Map(); // targetId -> Matter.Body
        this.boundaries = new Map(); // boundaryId -> Matter.Body
        this.collisionPairs = new Set();
        this.autoStep = true;
        this.lastStepTime = Date.now();

        this._initPhysicsWorld(0, -9.8);

        // Step physics before each execution cycle
        this._onBeforeExecute = this._onBeforeExecute.bind(this);
        this.runtime.on('BEFORE_EXECUTE', this._onBeforeExecute);

        this.runtime.on('PROJECT_STOP_ALL', () => {
            this.collisionPairs.clear();
        });
    }

    _initPhysicsWorld (gravityX = 0, gravityY = -9.8) {
        if (this.engine) {
            Matter.World.clear(this.world, false);
            Matter.Engine.clear(this.engine);
        }
        this.engine = Matter.Engine.create({
            enableSleeping: false
        });
        this.world = this.engine.world;
        // Scratch Y is positive upwards, Matter Y is positive downwards
        this.world.gravity.x = gravityX * 0.1;
        this.world.gravity.y = -gravityY * 0.1;
        this.world.gravity.scale = 0.001;

        this.bodies.clear();
        this.boundaries.clear();
        this.collisionPairs.clear();

        Matter.Events.on(this.engine, 'collisionStart', (event) => {
            for (const pair of event.pairs) {
                const key1 = `${pair.bodyA.id}_${pair.bodyB.id}`;
                const key2 = `${pair.bodyB.id}_${pair.bodyA.id}`;
                this.collisionPairs.add(key1);
                this.collisionPairs.add(key2);
            }
        });

        Matter.Events.on(this.engine, 'collisionEnd', (event) => {
            for (const pair of event.pairs) {
                const key1 = `${pair.bodyA.id}_${pair.bodyB.id}`;
                const key2 = `${pair.bodyB.id}_${pair.bodyA.id}`;
                this.collisionPairs.delete(key1);
                this.collisionPairs.delete(key2);
            }
        });
    }

    _scratchToMatter (x, y) {
        return {
            x: Number(x) + 240,
            y: 180 - Number(y)
        };
    }

    _matterToScratch (x, y) {
        return {
            x: Number(x) - 240,
            y: 180 - Number(y)
        };
    }

    _scratchAngleToRad (deg) {
        // Scratch: 0 is up, 90 is right, clockwise
        // Matter: 0 is right, PI/2 is down, clockwise
        return (Number(deg) - 90) * (Math.PI / 180);
    }

    _matterAngleToScratch (rad) {
        let deg = (Number(rad) * (180 / Math.PI)) + 90;
        deg = ((deg + 180) % 360) - 180;
        return deg;
    }

    _onBeforeExecute () {
        if (!this.autoStep || !this.engine) return;
        const now = Date.now();
        const delta = Math.min(now - this.lastStepTime, 50);
        this.lastStepTime = now;

        Matter.Engine.update(this.engine, delta > 0 ? delta : 1000 / 60);

        // Sync Matter bodies back to Scratch targets
        for (const [targetId, body] of this.bodies.entries()) {
            const target = this.runtime.getTargetById(targetId);
            if (!target) {
                Matter.World.remove(this.world, body);
                this.bodies.delete(targetId);
                continue;
            }
            if (body.isStatic) continue;

            const scratchPos = this._matterToScratch(body.position.x, body.position.y);
            const scratchDir = this._matterAngleToScratch(body.angle);

            target.setXY(scratchPos.x, scratchPos.y);
            target.setDirection(scratchDir);
        }
    }

    getInfo () {
        return {
            id: 'physics',
            name: '2D 物理引擎 (Physics 2D)',
            color1: '#D97706',
            color2: '#B45309',
            color3: '#92400E',
            blocks: [
                {
                    opcode: 'initWorld',
                    blockType: BlockType.COMMAND,
                    text: '初始化物理世界 重力X: [GX] 重力Y: [GY]',
                    arguments: {
                        GX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        GY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -10
                        }
                    }
                },
                {
                    opcode: 'setupSpriteBody',
                    blockType: BlockType.COMMAND,
                    text: '將當前角色設為物理 [SHAPE] 剛體 [TYPE] 寬/直徑: [W] 高: [H]',
                    arguments: {
                        SHAPE: {
                            type: ArgumentType.STRING,
                            menu: 'shapeMenu',
                            defaultValue: 'box'
                        },
                        TYPE: {
                            type: ArgumentType.STRING,
                            menu: 'bodyTypeMenu',
                            defaultValue: 'dynamic'
                        },
                        W: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        },
                        H: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 50
                        }
                    }
                },
                {
                    opcode: 'createWall',
                    blockType: BlockType.COMMAND,
                    text: '在 X: [X] Y: [Y] 建立靜態障礙物 寬: [W] 高: [H]',
                    arguments: {
                        X: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        Y: {
                            type: ArgumentType.NUMBER,
                            defaultValue: -170
                        },
                        W: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 480
                        },
                        H: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 20
                        }
                    }
                },
                {
                    opcode: 'setMaterial',
                    blockType: BlockType.COMMAND,
                    text: '設定物理材質 彈性: [RESTITUTION] 摩擦力: [FRICTION] 密度: [DENSITY]',
                    arguments: {
                        RESTITUTION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.8
                        },
                        FRICTION: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1
                        },
                        DENSITY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.001
                        }
                    }
                },
                {
                    opcode: 'applyForce',
                    blockType: BlockType.COMMAND,
                    text: '對當前角色施加推力 FX: [FX] FY: [FY]',
                    arguments: {
                        FX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        FY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.05
                        }
                    }
                },
                {
                    opcode: 'setVelocity',
                    blockType: BlockType.COMMAND,
                    text: '設定物理速度 VX: [VX] VY: [VY]',
                    arguments: {
                        VX: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        },
                        VY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 10
                        }
                    }
                },
                {
                    opcode: 'setAngularVelocity',
                    blockType: BlockType.COMMAND,
                    text: '設定旋轉角速度: [AV]',
                    arguments: {
                        AV: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.1
                        }
                    }
                },
                {
                    opcode: 'setStatic',
                    blockType: BlockType.COMMAND,
                    text: '設定當前角色是否為固定障礙: [IS_STATIC]',
                    arguments: {
                        IS_STATIC: {
                            type: ArgumentType.STRING,
                            menu: 'booleanMenu',
                            defaultValue: 'true'
                        }
                    }
                },
                {
                    opcode: 'removeBody',
                    blockType: BlockType.COMMAND,
                    text: '移除當前角色的物理實體'
                },
                {
                    opcode: 'clearWorld',
                    blockType: BlockType.COMMAND,
                    text: '清空物理世界所有剛體'
                },
                '---',
                {
                    opcode: 'isTouchingSprite',
                    blockType: BlockType.BOOLEAN,
                    text: '與角色 [TARGET] 發生物理碰撞？',
                    arguments: {
                        TARGET: {
                            type: ArgumentType.STRING,
                            defaultValue: 'Sprite1'
                        }
                    }
                },
                {
                    opcode: 'getVelocityX',
                    blockType: BlockType.REPORTER,
                    text: '物理速度 X'
                },
                {
                    opcode: 'getVelocityY',
                    blockType: BlockType.REPORTER,
                    text: '物理速度 Y'
                },
                {
                    opcode: 'getAngularVelocity',
                    blockType: BlockType.REPORTER,
                    text: '旋轉角速度'
                }
            ],
            menus: {
                shapeMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '方塊 (Box)', value: 'box'},
                        {text: '圓形 (Circle)', value: 'circle'}
                    ]
                },
                bodyTypeMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '動態剛體 (Dynamic)', value: 'dynamic'},
                        {text: '靜態障礙 (Static)', value: 'static'}
                    ]
                },
                booleanMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '是 (True)', value: 'true'},
                        {text: '否 (False)', value: 'false'}
                    ]
                }
            }
        };
    }

    initWorld (args) {
        const gx = Cast.toNumber(args.GX);
        const gy = Cast.toNumber(args.GY);
        this._initPhysicsWorld(gx, gy);
    }

    setupSpriteBody (args, util) {
        if (!util || !util.target) return;
        const target = util.target;
        const shape = Cast.toString(args.SHAPE);
        const isStatic = Cast.toString(args.TYPE) === 'static';
        const w = Math.max(1, Cast.toNumber(args.W));
        const h = Math.max(1, Cast.toNumber(args.H));

        // Remove old body if any
        if (this.bodies.has(target.id)) {
            Matter.World.remove(this.world, this.bodies.get(target.id));
            this.bodies.delete(target.id);
        }

        const mPos = this._scratchToMatter(target.x, target.y);
        const angle = this._scratchAngleToRad(target.direction);

        let body;
        if (shape === 'circle') {
            body = Matter.Bodies.circle(mPos.x, mPos.y, w / 2, {
                isStatic: isStatic,
                angle: angle,
                restitution: 0.8,
                friction: 0.1
            });
        } else {
            body = Matter.Bodies.rectangle(mPos.x, mPos.y, w, h, {
                isStatic: isStatic,
                angle: angle,
                restitution: 0.8,
                friction: 0.1
            });
        }

        body.scratchTargetId = target.id;
        this.bodies.set(target.id, body);
        Matter.World.add(this.world, body);
    }

    createWall (args) {
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const w = Math.max(1, Cast.toNumber(args.W));
        const h = Math.max(1, Cast.toNumber(args.H));
        const mPos = this._scratchToMatter(x, y);

        const wall = Matter.Bodies.rectangle(mPos.x, mPos.y, w, h, {
            isStatic: true,
            friction: 0.5,
            restitution: 0.2
        });

        const id = `wall_${Date.now()}_${Math.random()}`;
        this.boundaries.set(id, wall);
        Matter.World.add(this.world, wall);
    }

    setMaterial (args, util) {
        if (!util || !util.target) return;
        const body = this.bodies.get(util.target.id);
        if (!body) return;

        const restitution = Math.max(0, Math.min(1, Cast.toNumber(args.RESTITUTION)));
        const friction = Math.max(0, Cast.toNumber(args.FRICTION));
        const density = Math.max(0.0001, Cast.toNumber(args.DENSITY));

        Matter.Body.set(body, {
            restitution: restitution,
            friction: friction,
            density: density
        });
    }

    applyForce (args, util) {
        if (!util || !util.target) return;
        const body = this.bodies.get(util.target.id);
        if (!body) return;

        const fx = Cast.toNumber(args.FX);
        const fy = -Cast.toNumber(args.FY); // Invert Scratch Y to Matter Y
        Matter.Body.applyForce(body, body.position, {x: fx * 0.001, y: fy * 0.001});
    }

    setVelocity (args, util) {
        if (!util || !util.target) return;
        const body = this.bodies.get(util.target.id);
        if (!body) return;

        const vx = Cast.toNumber(args.VX);
        const vy = -Cast.toNumber(args.VY); // Invert Scratch Y to Matter Y
        Matter.Body.setVelocity(body, {x: vx, y: vy});
    }

    setAngularVelocity (args, util) {
        if (!util || !util.target) return;
        const body = this.bodies.get(util.target.id);
        if (!body) return;

        const av = Cast.toNumber(args.AV);
        Matter.Body.setAngularVelocity(body, av);
    }

    setStatic (args, util) {
        if (!util || !util.target) return;
        const body = this.bodies.get(util.target.id);
        if (!body) return;

        const isStatic = Cast.toString(args.IS_STATIC) === 'true';
        Matter.Body.setStatic(body, isStatic);
    }

    removeBody (args, util) {
        if (!util || !util.target) return;
        const body = this.bodies.get(util.target.id);
        if (body) {
            Matter.World.remove(this.world, body);
            this.bodies.delete(util.target.id);
        }
    }

    clearWorld () {
        if (!this.world) return;
        for (const body of this.bodies.values()) {
            Matter.World.remove(this.world, body);
        }
        for (const wall of this.boundaries.values()) {
            Matter.World.remove(this.world, wall);
        }
        this.bodies.clear();
        this.boundaries.clear();
        this.collisionPairs.clear();
    }

    isTouchingSprite (args, util) {
        if (!util || !util.target) return false;
        const thisBody = this.bodies.get(util.target.id);
        if (!thisBody) return false;

        const targetName = Cast.toString(args.TARGET);
        const otherTarget = this.runtime.getSpriteTargetByName(targetName);
        if (!otherTarget) return false;

        const otherBody = this.bodies.get(otherTarget.id);
        if (!otherBody) return false;

        const key1 = `${thisBody.id}_${otherBody.id}`;
        const key2 = `${otherBody.id}_${thisBody.id}`;
        return this.collisionPairs.has(key1) || this.collisionPairs.has(key2);
    }

    getVelocityX (args, util) {
        if (!util || !util.target) return 0;
        const body = this.bodies.get(util.target.id);
        return body ? Math.round(body.velocity.x * 100) / 100 : 0;
    }

    getVelocityY (args, util) {
        if (!util || !util.target) return 0;
        const body = this.bodies.get(util.target.id);
        // Convert Matter velocity Y back to Scratch velocity Y
        return body ? Math.round(-body.velocity.y * 100) / 100 : 0;
    }

    getAngularVelocity (args, util) {
        if (!util || !util.target) return 0;
        const body = this.bodies.get(util.target.id);
        return body ? Math.round(body.angularVelocity * 1000) / 1000 : 0;
    }
}

module.exports = Scratch3Physics;
