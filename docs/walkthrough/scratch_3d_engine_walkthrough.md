# Scratch 3D 遊戲與專案引擎 (Three.js WebGL 3D) 實裝紀錄

## 1. 架構概述與實作重點

為讓 Scratch 能原生支援 3D 遊戲與專案開發，本次實裝採行 **Three.js WebGL 3D 渲染引擎舞台疊加架構**：
- **獨立 WebGL 繪圖管線**：在 Scratch Stage 內嵌高畫質、透明背景的 `<canvas id="scratch-3d-canvas">`，直接由 GPU 硬體加速渲染，維持穩定 60 FPS。
- **2D / 3D 分層共存**：3D 世界與 Scratch 原生 2D 角色無縫整合，創作者可將 2D 角色作為遊戲 UI、血條、計分板或對話框，3D 畫布則渲染遊戲場景與立體物件。
- **全生命週期響應**：3D Canvas 自動偵測 Scratch 舞台縮放與全螢幕切換，即時更新相機寬高比 (`aspect`) 與投影矩陣。

---

## 2. 3D 積木生態庫 (共 29 顆核心積木)

### (1) 場景與環境 (Scene & Environment)
- `[初始化 3D 世界 / 重設 3D 場景]` (`three3d_init3D`)：掛載 3D Canvas、建立 Scene、Camera 與預設自然環境光照。
- `[設定 3D 背景顏色 [顏色]]` (`three3d_setBackgroundColor`)：自訂天空或宇宙背景色彩。
- `[啟用 3D 空間霧氣 顏色 [顏色] 密度 [密度]]` (`three3d_setFog`)：建立真實空間景深與迷霧效果。
- `[設定 3D 渲染圖層 [在 2D 角色上方 / 在 2D 角色下方]]` (`three3d_setLayerOrder`)：彈性切換 2D 與 3D 的覆蓋層級。
- `[清除所有 3D 物件]` (`three3d_clearScene`)：安全釋放 GPU 幾何形狀與材質記憶體。

### (2) 相機與視角 (Camera Controls)
- `[設定 3D 相機位置 X:[] Y:[] Z:[]]` (`three3d_setCameraPos`)。
- `[將 3D 相機位置增加 X:[] Y:[] Z:[]]` (`three3d_changeCameraPos`)。
- `[3D 相機朝向目標 X:[] Y:[] Z:[]]` (`three3d_cameraLookAt`)。
- `[3D 相機跟隨物件 [名稱] 距離:[] 高度:[]]` (`three3d_cameraFollow`)：一鍵實現第三人稱遊戲視角。
- 橢圓形回傳積木：`(3D 相機 X 座標)`、`(3D 相機 Y 座標)`、`(3D 相機 Z 座標)`。

### (3) 光影系統 (Lighting & Shadows)
- `[建立環境光 顏色 [顏色] 強度 [強度]]` (`three3d_addAmbientLight`)。
- `[建立平行光 (太陽光) 顏色 [顏色] 強度 [強度] 方向 X:[] Y:[] Z:[]]` (`three3d_addDirectionalLight`)：支援物體投射柔和陰影 (PCFSoftShadowMap)。
- `[建立點光源 顏色 [顏色] 強度 [強度] 位置 X:[] Y:[] Z:[] 距離:[]]` (`three3d_addPointLight`)。

### (4) 3D 幾何物件建立 (3D Primitives)
- `[建立方塊 (Cube) 名稱:[] 寬:[] 高:[] 深:[] 顏色:[]]` (`three3d_createCube`)。
- `[建立球體 (Sphere) 名稱:[] 半徑:[] 顏色:[]]` (`three3d_createSphere`)。
- `[建立圓柱 (Cylinder) 名稱:[] 半徑:[] 高:[] 顏色:[]]` (`three3d_createCylinder`)。
- `[建立地面 (Plane) 名稱:[] 寬:[] 深:[] 顏色:[]]` (`three3d_createPlane`)。

### (5) 物件變換與材質動畫 (Transform & Material)
- `[設定物件 [名稱] 位置 X:[] Y:[] Z:[]]` / `[將物件 [名稱] 位置增加 X:[] Y:[] Z:[]]`。
- `[設定物件 [名稱] 旋轉角度 X:[] Y:[] Z:[]]` / `[將物件 [名稱] 旋轉角度增加 X:[] Y:[] Z:[]]`（支援平滑自轉動畫）。
- `[設定物件 [名稱] 縮放 X:[] Y:[] Z:[]]`。
- `[設定物件 [名稱] 顏色 [顏色] 透明度 [透明度]]`。
- `[刪除 3D 物件 [名稱]]`。
- 橢圓形回傳積木：`物件 [名稱] 的 [X座標 / Y座標 / Z座標 / 旋轉X / 旋轉Y / 旋轉Z / 縮放X / 縮放Y / 縮放Z]`。

### (6) 遊戲碰撞與互動 (Physics & Raycasting)
- `<物件 [A] 與 物件 [B] 發生碰撞？>` (`three3d_isColliding`)：以 3D AABB 空間碰撞盒精確計算實體接觸。
- `(滑鼠游標指向的 3D 物件名稱)` (`three3d_getClickedObjectName`)：即時利用 3D 射線檢測 (Raycaster) 捕捉滑鼠指標選取的物體。

---

## 3. 實機渲染與自動化測試驗證

透過 Headless Edge CDP 模擬使用者真實載入與積木執行（包含建立水平地面、自轉紫光立方體與粉紅球體，並佈置平行光源）：
- **舞台渲染**：右上角舞台成功渲染具有真實立體光影、雙向投射陰影與 60 FPS 幀率的 3D 空間。
- **工具箱**：左側選單成功注入專屬靛藍色「**3D 遊戲與專案引擎 (Three.js 3D)**」分類與全套 29 顆 3D 指令與回傳積木。

---

## 4. 線上測試入口
- **GitHub Pages 網址**：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
- **操作方式**：點擊左下角「**+ 新增擴充**」，選擇「**3D 遊戲與專案引擎 (Three.js 3D)**」卡片即可立即開始創作 3D 專案與遊戲！
