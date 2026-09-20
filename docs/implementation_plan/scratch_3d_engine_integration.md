# [需要架構決策] Scratch 3D 專案與遊戲引擎整合計畫 (Three.js 3D Engine)

為 Scratch 導入真正的 3D 渲染與遊戲開發能力，讓使用者能夠透過圖形化積木建立 3D 場景、控制相機（第一人稱 / 第三人稱 / 環視）、佈置光源與陰影、建立 3D 幾何模型（立方體、球體、平面、文字）、變更材質貼圖、處理 3D 空間移動旋轉與簡易碰撞物理，打造流暢的 3D 遊戲。

---

## 1. 架構決策方案評估 (Architectural Trade-offs)

引入 3D 能力屬於**「引入外部依賴與渲染管線擴充」**之重大架構決策，在此提供 2 種技術路線比較：

| 評估維度 | 方案 A（推薦）：Three.js 舞台疊加 WebGL 引擎 | 方案 B：Scratch 軟體光柵化偽 3D (Raycasting) |
|---|---|---|
| **核心技術** | WebGL 2.0 / 1.0 + Three.js 現代渲染管線 | 純 CPU 筆跡/圖章軟體數學投射 (類似經典 Wolfenstein) |
| **外部依賴** | 引入 `three` 函式庫 (~600KB，可樹搖或 CDN 載入) | 零依賴 |
| **渲染效能** | **GPU 硬體加速 60 FPS**，可渲染數萬個多邊形與即時光影 | CPU 單執行緒計算，多於數十個多邊形即嚴重掉幀 (<15 FPS) |
| **3D 遊戲能力** | 完整支援真 3D 空間 (X/Y/Z)、自訂光源 (環境光/平行光/點光源)、陰影、材質/紋理貼圖、3D 模型載入 (.gltf/.obj)、第一/三人稱相機與射線碰撞檢測 | 僅能製作偽 3D 線框迷宮，無法實現真 3D 空間運動、無立體光影、無外部模型支援 |
| **UI 整合度** | 3D 畫布與 Scratch 2D Stage 完美貼合，Scratch 既有 2D 角色可直接作為遊戲 HUD/血條/按鈕 | 佔用 Scratch 2D 繪圖層，難以與 2D UI 分層管理 |
| **社群相容度** | 與 TurboWarp 3D、PenguinMod 3D 業界標準架構完全一致 | 極少數教學展示用，不適合實際遊戲創作 |

### 架構決策結論：
> **採行 方案 A (Three.js 舞台疊加 WebGL 3D 引擎)**。
> 唯有標準 WebGL GPU 引擎才能滿足使用者提出的「做出 3D 專案、3D 遊戲」之核心期待。

---

## 2. 3D 積木生態設計 (Block Design)

規劃完整的 3D 遊戲積木組，分類清晰直覺：

### (1) 場景與視窗 (Scene & Environment)
- `[初始化 3D 世界 / 重設 3D 場景]`：建立 3D WebGL Canvas，自動對齊 Scratch 舞台解析度（480x360 或全螢幕）。
- `[設定 3D 背景顏色 [顏色]]` / `[啟用 3D 空間霧氣 顏色 [顏色] 密度 [0.02]]`。
- `[清除所有 3D 物件]`：安全釋放 GPU 幾何與材質記憶體。

### (2) 相機與視角控制 (Camera)
- `[設定 3D 相機位置 X: [0] Y: [5] Z: [10]]`。
- `[3D 相機朝向目標 X: [0] Y: [0] Z: [0]]`。
- `[3D 相機旋轉 水平角 (Yaw): [0] 俯仰角 (Pitch): [0]]`。
- `[3D 相機跟隨物件 [名稱] 距離: [10] 高度: [5]]`（快速實現第三人稱 RPG 視角）。
- 橢圓形積木：`(3D 相機 X 座標)`、`(3D 相機 Y 座標)`、`(3D 相機 Z 座標)`。

### (3) 光源與環境 (Lighting & Shadows)
- `[建立環境光 顏色 [#ffffff] 強度 [0.6]]`。
- `[建立平行光 (太陽光) 顏色 [#ffffff] 強度 [0.8] 方向 X:[5] Y:[10] Z:[7]]`。
- `[建立點光源 顏色 [#ffaa00] 強度 [1.0] 位置 X:[0] Y:[2] Z:[0] 距離:[20]]`。

### (4) 3D 幾何物件建立 (Geometry & Primitives)
- `[建立方塊 (Cube) 名稱: [cube1] 寬:[2] 高:[2] 深:[2] 顏色:[#4C97FF]]`。
- `[建立球體 (Sphere) 名稱: [ball1] 半徑:[1.5] 顏色:[#FF6680]]`。
- `[建立圓柱 (Cylinder) 名稱: [cyl1] 頂半徑:[1] 底半徑:[1] 高:[3] 顏色:[#00D494]]`。
- `[建立地面 (Plane) 名稱: [ground] 寬:[50] 深:[50] 顏色:[#333333]]`。
- `[建立 3D 文字 名稱: [txt1] 內容: [Hello 3D] 大小: [2] 顏色:[#FFDF00]]`。

### (5) 物件操作與動畫變形 (Transform & Materials)
- `[設定物件 [名稱] 位置 X:[0] Y:[0] Z:[0]]` / `[將物件 [名稱] 位置增加 X:[0] Y:[0] Z:[0]]`。
- `[設定物件 [名稱] 旋轉 X:[0] Y:[0] Z:[0]]` / `[將物件 [名稱] 旋轉增加 X:[0] Y:[1] Z:[0]]`（旋轉動畫）。
- `[設定物件 [名稱] 縮放 X:[1] Y:[1] Z:[1]]`。
- `[設定物件 [名稱] 材質 顏色:[#4C97FF] 金屬感:[0.2] 粗糙度:[0.5] 透明度:[1.0]]`。
- `[設定物件 [名稱] 貼圖網址 [URL]]`（支援貼圖）。
- `[刪除 3D 物件 [名稱]]`。

### (6) 遊戲碰撞與互動 (Physics & Collision)
- `<物件 [objA] 與 物件 [objB] 發生 3D 碰撞？>`（六角形布林，基於 3D AABB 盒）。
- `(滑鼠游標指向的 3D 物件名稱)`（橢圓形，基於 3D 射線檢測 Raycaster）。
- `(物件 [名稱] 的 [X座標 / Y座標 / Z座標 / 旋轉X / 旋轉Y / 旋轉Z])`（橢圓形回傳值）。

---

## 3. 預計異動與新增檔案

### [新增組件]
#### [NEW] `extensions-vm/scratch3_three3d/index.js`
- 核心 3D 引擎實作：管理 Three.js Scene, Camera, WebGLRenderer, Meshes, Lights, Animation Loop, Raycasting, AABB 碰撞檢測。

#### [NEW] `src/lib/libraries/extensions/three3d/three3d.svg`
- 3D 擴充卡片封面圖標。

#### [NEW] `src/lib/libraries/extensions/three3d/three3d-small.svg`
- 3D 工具箱分類圓形圖標。

### [修改組件]
#### [MODIFY] [package.json](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/package.json)
- 新增 `three` 依賴套件。

#### [MODIFY] [src/lib/libraries/extensions/index.jsx](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/libraries/extensions/index.jsx)
- 註冊「**3D 專案與遊戲引擎 (Three.js 3D)**」擴充卡片。

#### [MODIFY] [extensions-vm/extension-manager.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/extension-manager.js)
- 將 `three3d` 加入內建擴充清單 `builtinExtensions`。

#### [MODIFY] [scripts/setup-extensions.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/scripts/setup-extensions.js)
- 同步拷貝 `scratch3_three3d` 至 `node_modules/scratch-vm/`。

---

## 4. 驗證計畫 (Verification Plan)

1. **自動化建置**：執行 `npm run build` 確認 Webpack 打包順利無錯誤。
2. **Headless Edge CDP 端對端測試**：
   - 啟動瀏覽器載入 Scratch 頁面。
   - 模擬使用者點擊擴充庫，選取「3D 專案與遊戲引擎 (Three.js 3D)」。
   - 確認左側分類選單出現 3D 分類圖示，工具箱包含全套 3D 場景、幾何、相機、碰撞積木。
   - 動態執行 3D 積木腳本（初始化場景、建立自轉方塊、設定相機、點亮點光源）。
   - 擷取 3D WebGL 渲染截圖確認畫面正常。
3. **發布驗證**：發布至 GitHub Pages (`https://o-o1112.github.io/scratch-gui/`) 並驗證生產環境。
