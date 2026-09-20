const THREE = require('three');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');
const Cast = require('../../util/cast');

class Scratch3Three3D {
    constructor (runtime) {
        this.runtime = runtime;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.canvas = null;
        this.objects = new Map();
        this.lights = new Map();
        this.animFrameId = null;
        this.mouseCoords = {x: 0, y: 0};
        this.raycaster = new THREE.Raycaster();
        this.isInitialized = false;

        this._onResize = this._onResize.bind(this);
        this._renderLoop = this._renderLoop.bind(this);

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', this._onResize, {passive: true});
            window.addEventListener('mousemove', (e) => {
                if (!this.canvas) return;
                const rect = this.canvas.getBoundingClientRect();
                if (rect.width > 0 && rect.height > 0) {
                    this.mouseCoords.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
                    this.mouseCoords.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
                }
            }, {passive: true});
        }

        // Reset scene on green flag or stop
        this.runtime.on('PROJECT_STOP_ALL', () => {
            // Keep renderer ready but optionally reset
        });
    }

    _parseColor (c) {
        try {
            const str = Cast.toString(c).trim();
            return new THREE.Color(str);
        } catch (e) {
            return new THREE.Color(0xffffff);
        }
    }

    _setupCanvas () {
        if (typeof document === 'undefined') return;
        let canvas = document.getElementById('scratch-3d-canvas');
        const stageContainer = document.querySelector('div[class*="stage_stage_"]') ||
                               document.querySelector('div[class*="stage-wrapper"]') ||
                               document.body;

        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.id = 'scratch-3d-canvas';
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1';
            if (stageContainer) {
                if (window.getComputedStyle(stageContainer).position === 'static') {
                    stageContainer.style.position = 'relative';
                }
                stageContainer.appendChild(canvas);
            }
        }
        this.canvas = canvas;

        const rect = canvas.parentElement ? canvas.parentElement.getBoundingClientRect() : null;
        const width = rect && rect.width > 0 ? rect.width : 480;
        const height = rect && rect.height > 0 ? rect.height : 360;

        if (!this.renderer) {
            this.renderer = new THREE.WebGLRenderer({
                canvas: this.canvas,
                alpha: true,
                antialias: true
            });
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
            this.renderer.setSize(width, height, false);
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }

        if (!this.scene) {
            this.scene = new THREE.Scene();
        }

        if (!this.camera) {
            this.camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);
        }

        if (!this.animFrameId) {
            this._renderLoop();
        }

        this.isInitialized = true;
    }

    _onResize () {
        if (!this.canvas || !this.renderer || !this.camera) return;
        const rect = this.canvas.parentElement ? this.canvas.parentElement.getBoundingClientRect() : null;
        const width = rect && rect.width > 0 ? rect.width : 480;
        const height = rect && rect.height > 0 ? rect.height : 360;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height, false);
    }

    _renderLoop () {
        if (this.renderer && this.scene && this.camera) {
            this.renderer.render(this.scene, this.camera);
        }
        this.animFrameId = requestAnimationFrame(this._renderLoop);
    }

    getInfo () {
        return {
            id: 'three3d',
            name: '3D 遊戲與專案引擎 (Three.js 3D)',
            color1: '#4F46E5',
            color2: '#4338CA',
            color3: '#3730A3',
            blocks: [
                // 1. 場景與環境 (Scene & Environment)
                {
                    opcode: 'init3D',
                    blockType: BlockType.COMMAND,
                    text: '初始化 3D 世界 / 重設 3D 場景'
                },
                {
                    opcode: 'setBackgroundColor',
                    blockType: BlockType.COMMAND,
                    text: '設定 3D 背景顏色 [COLOR]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#111827'
                        }
                    }
                },
                {
                    opcode: 'setFog',
                    blockType: BlockType.COMMAND,
                    text: '啟用 3D 空間霧氣 顏色 [COLOR] 密度 [DENSITY]',
                    arguments: {
                        COLOR: {
                            type: ArgumentType.COLOR,
                            defaultValue: '#111827'
                        },
                        DENSITY: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0.02
                        }
                    }
                },
                {
                    opcode: 'setLayerOrder',
                    blockType: BlockType.COMMAND,
                    text: '設定 3D 渲染圖層 [LAYER]',
                    arguments: {
                        LAYER: {
                            type: ArgumentType.STRING,
                            menu: 'layerMenu',
                            defaultValue: 'top'
                        }
                    }
                },
                {
                    opcode: 'clearScene',
                    blockType: BlockType.COMMAND,
                    text: '清除所有 3D 物件'
                },
                '---',
                // 2. 相機與視角控制 (Camera)
                {
                    opcode: 'setCameraPos',
                    blockType: BlockType.COMMAND,
                    text: '設定 3D 相機位置 X: [X] Y: [Y] Z: [Z]',
                    arguments: {
                        X: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 5},
                        Z: {type: ArgumentType.NUMBER, defaultValue: 10}
                    }
                },
                {
                    opcode: 'changeCameraPos',
                    blockType: BlockType.COMMAND,
                    text: '將 3D 相機位置增加 X: [DX] Y: [DY] Z: [DZ]',
                    arguments: {
                        DX: {type: ArgumentType.NUMBER, defaultValue: 0},
                        DY: {type: ArgumentType.NUMBER, defaultValue: 0},
                        DZ: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'cameraLookAt',
                    blockType: BlockType.COMMAND,
                    text: '3D 相機朝向目標 X: [X] Y: [Y] Z: [Z]',
                    arguments: {
                        X: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Z: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'cameraFollow',
                    blockType: BlockType.COMMAND,
                    text: '3D 相機跟隨物件 [NAME] 距離: [DIST] 高度: [HEIGHT]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        DIST: {type: ArgumentType.NUMBER, defaultValue: 10},
                        HEIGHT: {type: ArgumentType.NUMBER, defaultValue: 5}
                    }
                },
                {
                    opcode: 'getCameraX',
                    blockType: BlockType.REPORTER,
                    text: '3D 相機 X 座標'
                },
                {
                    opcode: 'getCameraY',
                    blockType: BlockType.REPORTER,
                    text: '3D 相機 Y 座標'
                },
                {
                    opcode: 'getCameraZ',
                    blockType: BlockType.REPORTER,
                    text: '3D 相機 Z 座標'
                },
                '---',
                // 3. 光源系統 (Lighting)
                {
                    opcode: 'addAmbientLight',
                    blockType: BlockType.COMMAND,
                    text: '建立環境光 顏色 [COLOR] 強度 [INTENSITY]',
                    arguments: {
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#ffffff'},
                        INTENSITY: {type: ArgumentType.NUMBER, defaultValue: 0.6}
                    }
                },
                {
                    opcode: 'addDirectionalLight',
                    blockType: BlockType.COMMAND,
                    text: '建立平行光 (太陽光) 顏色 [COLOR] 強度 [INTENSITY] 方向 X: [X] Y: [Y] Z: [Z]',
                    arguments: {
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#ffffff'},
                        INTENSITY: {type: ArgumentType.NUMBER, defaultValue: 0.8},
                        X: {type: ArgumentType.NUMBER, defaultValue: 5},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 10},
                        Z: {type: ArgumentType.NUMBER, defaultValue: 7}
                    }
                },
                {
                    opcode: 'addPointLight',
                    blockType: BlockType.COMMAND,
                    text: '建立點光源 顏色 [COLOR] 強度 [INTENSITY] 位置 X: [X] Y: [Y] Z: [Z] 距離: [DIST]',
                    arguments: {
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#ffaa00'},
                        INTENSITY: {type: ArgumentType.NUMBER, defaultValue: 1.0},
                        X: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 3},
                        Z: {type: ArgumentType.NUMBER, defaultValue: 0},
                        DIST: {type: ArgumentType.NUMBER, defaultValue: 20}
                    }
                },
                '---',
                // 4. 幾何形體建立 (Geometry)
                {
                    opcode: 'createCube',
                    blockType: BlockType.COMMAND,
                    text: '建立方塊 (Cube) 名稱: [NAME] 寬:[W] 高:[H] 深:[D] 顏色:[COLOR]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        W: {type: ArgumentType.NUMBER, defaultValue: 2},
                        H: {type: ArgumentType.NUMBER, defaultValue: 2},
                        D: {type: ArgumentType.NUMBER, defaultValue: 2},
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#4C97FF'}
                    }
                },
                {
                    opcode: 'createSphere',
                    blockType: BlockType.COMMAND,
                    text: '建立球體 (Sphere) 名稱: [NAME] 半徑:[RADIUS] 顏色:[COLOR]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'ball1'},
                        RADIUS: {type: ArgumentType.NUMBER, defaultValue: 1.5},
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#FF6680'}
                    }
                },
                {
                    opcode: 'createCylinder',
                    blockType: BlockType.COMMAND,
                    text: '建立圓柱 (Cylinder) 名稱: [NAME] 半徑:[RADIUS] 高:[HEIGHT] 顏色:[COLOR]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cyl1'},
                        RADIUS: {type: ArgumentType.NUMBER, defaultValue: 1},
                        HEIGHT: {type: ArgumentType.NUMBER, defaultValue: 3},
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#00D494'}
                    }
                },
                {
                    opcode: 'createPlane',
                    blockType: BlockType.COMMAND,
                    text: '建立地面 (Plane) 名稱: [NAME] 寬:[WIDTH] 深:[DEPTH] 顏色:[COLOR]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'ground'},
                        WIDTH: {type: ArgumentType.NUMBER, defaultValue: 50},
                        DEPTH: {type: ArgumentType.NUMBER, defaultValue: 50},
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#374151'}
                    }
                },
                '---',
                // 5. 物件操作與動畫變換 (Transform & Materials)
                {
                    opcode: 'setObjectPos',
                    blockType: BlockType.COMMAND,
                    text: '設定物件 [NAME] 位置 X:[X] Y:[Y] Z:[Z]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        X: {type: ArgumentType.NUMBER, defaultValue: 0},
                        Y: {type: ArgumentType.NUMBER, defaultValue: 1},
                        Z: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'changeObjectPos',
                    blockType: BlockType.COMMAND,
                    text: '將物件 [NAME] 位置增加 X:[DX] Y:[DY] Z:[DZ]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        DX: {type: ArgumentType.NUMBER, defaultValue: 0},
                        DY: {type: ArgumentType.NUMBER, defaultValue: 0},
                        DZ: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'setObjectRotation',
                    blockType: BlockType.COMMAND,
                    text: '設定物件 [NAME] 旋轉角度 X:[RX] Y:[RY] Z:[RZ]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        RX: {type: ArgumentType.NUMBER, defaultValue: 0},
                        RY: {type: ArgumentType.NUMBER, defaultValue: 0},
                        RZ: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'changeObjectRotation',
                    blockType: BlockType.COMMAND,
                    text: '將物件 [NAME] 旋轉角度增加 X:[DRX] Y:[DRY] Z:[DRZ]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        DRX: {type: ArgumentType.NUMBER, defaultValue: 0},
                        DRY: {type: ArgumentType.NUMBER, defaultValue: 2},
                        DRZ: {type: ArgumentType.NUMBER, defaultValue: 0}
                    }
                },
                {
                    opcode: 'setObjectScale',
                    blockType: BlockType.COMMAND,
                    text: '設定物件 [NAME] 縮放 X:[SX] Y:[SY] Z:[SZ]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        SX: {type: ArgumentType.NUMBER, defaultValue: 1},
                        SY: {type: ArgumentType.NUMBER, defaultValue: 1},
                        SZ: {type: ArgumentType.NUMBER, defaultValue: 1}
                    }
                },
                {
                    opcode: 'setObjectColor',
                    blockType: BlockType.COMMAND,
                    text: '設定物件 [NAME] 顏色 [COLOR] 透明度 [OPACITY]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        COLOR: {type: ArgumentType.COLOR, defaultValue: '#4C97FF'},
                        OPACITY: {type: ArgumentType.NUMBER, defaultValue: 1.0}
                    }
                },
                {
                    opcode: 'deleteObject',
                    blockType: BlockType.COMMAND,
                    text: '刪除 3D 物件 [NAME]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'}
                    }
                },
                {
                    opcode: 'getObjectProp',
                    blockType: BlockType.REPORTER,
                    text: '物件 [NAME] 的 [PROP]',
                    arguments: {
                        NAME: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        PROP: {type: ArgumentType.STRING, menu: 'propMenu', defaultValue: 'x'}
                    }
                },
                '---',
                // 6. 遊戲碰撞與互動 (Physics & Collision)
                {
                    opcode: 'isColliding',
                    blockType: BlockType.BOOLEAN,
                    text: '物件 [OBJA] 與 物件 [OBJB] 發生碰撞？',
                    arguments: {
                        OBJA: {type: ArgumentType.STRING, defaultValue: 'cube1'},
                        OBJB: {type: ArgumentType.STRING, defaultValue: 'ground'}
                    }
                },
                {
                    opcode: 'getClickedObjectName',
                    blockType: BlockType.REPORTER,
                    text: '滑鼠游標指向的 3D 物件名稱'
                }
            ],
            menus: {
                layerMenu: {
                    acceptReporters: true,
                    items: [
                        {text: '在 2D 角色上方', value: 'top'},
                        {text: '在 2D 角色下方', value: 'bottom'}
                    ]
                },
                propMenu: {
                    acceptReporters: true,
                    items: [
                        {text: 'X 座標', value: 'x'},
                        {text: 'Y 座標', value: 'y'},
                        {text: 'Z 座標', value: 'z'},
                        {text: '旋轉角 X', value: 'rx'},
                        {text: '旋轉角 Y', value: 'ry'},
                        {text: '旋轉角 Z', value: 'rz'},
                        {text: '縮放 X', value: 'sx'},
                        {text: '縮放 Y', value: 'sy'},
                        {text: '縮放 Z', value: 'sz'}
                    ]
                }
            }
        };
    }

    // Methods
    init3D () {
        this._setupCanvas();
        this.clearScene();
        // Add default lighting so objects look 3D immediately
        this.addAmbientLight({COLOR: '#ffffff', INTENSITY: 0.5});
        this.addDirectionalLight({COLOR: '#ffffff', INTENSITY: 0.8, X: 5, Y: 10, Z: 7});
        if (this.camera) {
            this.camera.position.set(0, 5, 10);
            this.camera.lookAt(0, 0, 0);
        }
    }

    setBackgroundColor (args) {
        this._setupCanvas();
        if (this.scene) {
            this.scene.background = this._parseColor(args.COLOR);
        }
    }

    setFog (args) {
        this._setupCanvas();
        if (this.scene) {
            const color = this._parseColor(args.COLOR);
            const density = Cast.toNumber(args.DENSITY);
            this.scene.fog = new THREE.FogExp2(color, density);
        }
    }

    setLayerOrder (args) {
        this._setupCanvas();
        if (!this.canvas) return;
        const layer = Cast.toString(args.LAYER);
        if (layer === 'bottom') {
            this.canvas.style.zIndex = '0';
        } else {
            this.canvas.style.zIndex = '1';
        }
    }

    clearScene () {
        if (!this.scene) return;
        for (const [, obj] of this.objects) {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
        }
        this.objects.clear();
        for (const [, light] of this.lights) {
            this.scene.remove(light);
        }
        this.lights.clear();
    }

    setCameraPos (args) {
        this._setupCanvas();
        if (this.camera) {
            this.camera.position.x = Cast.toNumber(args.X);
            this.camera.position.y = Cast.toNumber(args.Y);
            this.camera.position.z = Cast.toNumber(args.Z);
        }
    }

    changeCameraPos (args) {
        this._setupCanvas();
        if (this.camera) {
            this.camera.position.x += Cast.toNumber(args.DX);
            this.camera.position.y += Cast.toNumber(args.DY);
            this.camera.position.z += Cast.toNumber(args.DZ);
        }
    }

    cameraLookAt (args) {
        this._setupCanvas();
        if (this.camera) {
            this.camera.lookAt(
                Cast.toNumber(args.X),
                Cast.toNumber(args.Y),
                Cast.toNumber(args.Z)
            );
        }
    }

    cameraFollow (args) {
        this._setupCanvas();
        const name = Cast.toString(args.NAME);
        const dist = Cast.toNumber(args.DIST);
        const height = Cast.toNumber(args.HEIGHT);
        const target = this.objects.get(name);
        if (target && this.camera) {
            this.camera.position.x = target.position.x;
            this.camera.position.y = target.position.y + height;
            this.camera.position.z = target.position.z + dist;
            this.camera.lookAt(target.position.x, target.position.y, target.position.z);
        }
    }

    getCameraX () {
        return this.camera ? Math.round(this.camera.position.x * 100) / 100 : 0;
    }

    getCameraY () {
        return this.camera ? Math.round(this.camera.position.y * 100) / 100 : 0;
    }

    getCameraZ () {
        return this.camera ? Math.round(this.camera.position.z * 100) / 100 : 0;
    }

    addAmbientLight (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const color = this._parseColor(args.COLOR);
        const intensity = Cast.toNumber(args.INTENSITY);
        if (this.lights.has('ambient')) {
            this.scene.remove(this.lights.get('ambient'));
        }
        const light = new THREE.AmbientLight(color, intensity);
        this.lights.set('ambient', light);
        this.scene.add(light);
    }

    addDirectionalLight (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const color = this._parseColor(args.COLOR);
        const intensity = Cast.toNumber(args.INTENSITY);
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const z = Cast.toNumber(args.Z);
        if (this.lights.has('directional')) {
            this.scene.remove(this.lights.get('directional'));
        }
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(x, y, z);
        light.castShadow = true;
        this.lights.set('directional', light);
        this.scene.add(light);
    }

    addPointLight (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const color = this._parseColor(args.COLOR);
        const intensity = Cast.toNumber(args.INTENSITY);
        const x = Cast.toNumber(args.X);
        const y = Cast.toNumber(args.Y);
        const z = Cast.toNumber(args.Z);
        const dist = Cast.toNumber(args.DIST);
        const light = new THREE.PointLight(color, intensity, dist);
        light.position.set(x, y, z);
        this.lights.set(`point_${Date.now()}`, light);
        this.scene.add(light);
    }

    createCube (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const name = Cast.toString(args.NAME);
        const w = Cast.toNumber(args.W);
        const h = Cast.toNumber(args.H);
        const d = Cast.toNumber(args.D);
        const color = this._parseColor(args.COLOR);

        this.deleteObject({NAME: name});

        const geom = new THREE.BoxGeometry(w, h, d);
        const mat = new THREE.MeshStandardMaterial({color, roughness: 0.4, metalness: 0.2});
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(0, h / 2, 0);

        this.objects.set(name, mesh);
        this.scene.add(mesh);
    }

    createSphere (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const name = Cast.toString(args.NAME);
        const radius = Cast.toNumber(args.RADIUS);
        const color = this._parseColor(args.COLOR);

        this.deleteObject({NAME: name});

        const geom = new THREE.SphereGeometry(radius, 32, 16);
        const mat = new THREE.MeshStandardMaterial({color, roughness: 0.3, metalness: 0.3});
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(0, radius, 0);

        this.objects.set(name, mesh);
        this.scene.add(mesh);
    }

    createCylinder (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const name = Cast.toString(args.NAME);
        const radius = Cast.toNumber(args.RADIUS);
        const height = Cast.toNumber(args.HEIGHT);
        const color = this._parseColor(args.COLOR);

        this.deleteObject({NAME: name});

        const geom = new THREE.CylinderGeometry(radius, radius, height, 32);
        const mat = new THREE.MeshStandardMaterial({color, roughness: 0.4, metalness: 0.2});
        const mesh = new THREE.Mesh(geom, mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(0, height / 2, 0);

        this.objects.set(name, mesh);
        this.scene.add(mesh);
    }

    createPlane (args) {
        this._setupCanvas();
        if (!this.scene) return;
        const name = Cast.toString(args.NAME);
        const width = Cast.toNumber(args.WIDTH);
        const depth = Cast.toNumber(args.DEPTH);
        const color = this._parseColor(args.COLOR);

        this.deleteObject({NAME: name});

        const geom = new THREE.PlaneGeometry(width, depth);
        const mat = new THREE.MeshStandardMaterial({color, roughness: 0.8, metalness: 0.1, side: THREE.DoubleSide});
        const mesh = new THREE.Mesh(geom, mat);
        mesh.rotation.x = -Math.PI / 2; // Horizontal ground
        mesh.receiveShadow = true;

        this.objects.set(name, mesh);
        this.scene.add(mesh);
    }

    setObjectPos (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj) {
            obj.position.x = Cast.toNumber(args.X);
            obj.position.y = Cast.toNumber(args.Y);
            obj.position.z = Cast.toNumber(args.Z);
        }
    }

    changeObjectPos (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj) {
            obj.position.x += Cast.toNumber(args.DX);
            obj.position.y += Cast.toNumber(args.DY);
            obj.position.z += Cast.toNumber(args.DZ);
        }
    }

    setObjectRotation (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj) {
            obj.rotation.x = (Cast.toNumber(args.RX) * Math.PI) / 180;
            obj.rotation.y = (Cast.toNumber(args.RY) * Math.PI) / 180;
            obj.rotation.z = (Cast.toNumber(args.RZ) * Math.PI) / 180;
        }
    }

    changeObjectRotation (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj) {
            obj.rotation.x += (Cast.toNumber(args.DRX) * Math.PI) / 180;
            obj.rotation.y += (Cast.toNumber(args.DRY) * Math.PI) / 180;
            obj.rotation.z += (Cast.toNumber(args.DRZ) * Math.PI) / 180;
        }
    }

    setObjectScale (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj) {
            obj.scale.x = Cast.toNumber(args.SX);
            obj.scale.y = Cast.toNumber(args.SY);
            obj.scale.z = Cast.toNumber(args.SZ);
        }
    }

    setObjectColor (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj && obj.material) {
            const color = this._parseColor(args.COLOR);
            const opacity = Cast.toNumber(args.OPACITY);
            obj.material.color = color;
            if (opacity < 1.0) {
                obj.material.transparent = true;
                obj.material.opacity = opacity;
            } else {
                obj.material.transparent = false;
                obj.material.opacity = 1.0;
            }
            obj.material.needsUpdate = true;
        }
    }

    deleteObject (args) {
        const name = Cast.toString(args.NAME);
        const obj = this.objects.get(name);
        if (obj && this.scene) {
            this.scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
                if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                else obj.material.dispose();
            }
            this.objects.delete(name);
        }
    }

    getObjectProp (args) {
        const name = Cast.toString(args.NAME);
        const prop = Cast.toString(args.PROP).toLowerCase();
        const obj = this.objects.get(name);
        if (!obj) return 0;
        switch (prop) {
        case 'x': return Math.round(obj.position.x * 100) / 100;
        case 'y': return Math.round(obj.position.y * 100) / 100;
        case 'z': return Math.round(obj.position.z * 100) / 100;
        case 'rx': return Math.round((obj.rotation.x * 180) / Math.PI);
        case 'ry': return Math.round((obj.rotation.y * 180) / Math.PI);
        case 'rz': return Math.round((obj.rotation.z * 180) / Math.PI);
        case 'sx': return Math.round(obj.scale.x * 100) / 100;
        case 'sy': return Math.round(obj.scale.y * 100) / 100;
        case 'sz': return Math.round(obj.scale.z * 100) / 100;
        default: return 0;
        }
    }

    isColliding (args) {
        const nameA = Cast.toString(args.OBJA);
        const nameB = Cast.toString(args.OBJB);
        const objA = this.objects.get(nameA);
        const objB = this.objects.get(nameB);
        if (!objA || !objB) return false;
        const boxA = new THREE.Box3().setFromObject(objA);
        const boxB = new THREE.Box3().setFromObject(objB);
        return boxA.intersectsBox(boxB);
    }

    getClickedObjectName () {
        if (!this.camera || !this.scene || this.objects.size === 0) return '';
        this.raycaster.setFromCamera(this.mouseCoords, this.camera);
        const meshes = Array.from(this.objects.values());
        const intersects = this.raycaster.intersectObjects(meshes, true);
        if (intersects.length > 0) {
            const hit = intersects[0].object;
            for (const [name, obj] of this.objects.entries()) {
                if (obj === hit || (obj.children && obj.children.includes(hit))) {
                    return name;
                }
            }
        }
        return '';
    }
}

module.exports = Scratch3Three3D;
