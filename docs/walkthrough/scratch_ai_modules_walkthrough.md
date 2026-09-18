# Scratch GUI AI 模組整合、深色模式與 GitHub Pages 上線成果

本次任務已全數完成，包含 AI 視覺辨識模組整合、模組庫精簡、全域深色模式、AI 範例專案快速載入器、即時 FPS 幀率監控器，並已成功構建部署至 **GitHub Pages** 正式上線。

---

## 🌐 線上體驗連結

- **線上直接試用（GitHub Pages）**：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
- **GitHub 專案倉庫**：[https://github.com/O-O1112/scratch-gui](https://github.com/O-O1112/scratch-gui)

---

## 🚀 核心功能與成果

### 1. 三款 AI 視覺辨識模組整合
- **Handpose2Scratch**（手部辨識）：利用 MediaPipe / ml5 進行手部 21 節點偵測與手勢辨識。
- **Facemesh2Scratch**（臉部辨識）：偵測臉部 468 個網格節點與五官特徵。
- **ML2Scratch**（機器學習影像分類）：支援即時攝影機樣本收集、分類訓練與辨識判定。

### 2. 精簡擴充模組庫
依據要求移除 9 款未勾選模組，模組選擇庫中僅保留下列 5 款：
1. `Handpose2Scratch`
2. `Facemesh2Scratch`
3. `ML2Scratch`
4. `Music`（音樂）
5. `Pen`（畫筆）

### 3. 全域深色模式 (Full Dark Mode)
- **視覺護眼**：全域覆蓋 `#121212` / `#1c1c1f` 深灰與高對比色調，包含積木區、導覽列、分頁籤、角色清單與彈窗。
- **一鍵切換**：導覽列設有 ☀️ / 🌙 快速切換按鈕，同時支援「設定」->「顏色模式」切換。
- **記憶偏好**：透過 Cookie 自動記憶使用者選擇，支援系統 `prefers-color-scheme`。

### 4. 實用小功能強化
- **AI 範例專案一鍵載入**（頂端導覽列「AI 範例」選單）：
  - `✋ 手部追蹤範例 (Handpose)`
  - `🙂 臉部網格範例 (Facemesh)`
  - `✨ 五官高亮特效 (Highlight)`
  - `🏓 機器學習桌球對戰 (ML Pong)`
  - `🔢 數字 1 或 2 分類辨識 (1 or 2)`
- **舞台即時 FPS 計數器**：
  - 位於綠旗與停止鍵右側，即時計算繪圖幀率，方便觀察 AI 模型運行效能。

---

## 📂 變更與檔案結構

| 類別 | 檔案路徑 | 說明 |
| :--- | :--- | :--- |
| **AI 擴充** | `src/lib/libraries/extensions/` | 註冊 Handpose、Facemesh、ML2Scratch UI 卡片 |
| **AI 核心** | `extensions-vm/` & `scripts/setup-extensions.js` | 封裝 AI 擴充積木邏輯並於 postinstall 自動注入 VM |
| **深色樣式** | `src/css/dark-theme.css` | 全域深色覆蓋樣式表 |
| **導覽與控制** | `src/components/menu-bar/ai-samples-menu.jsx` | AI 範例專案下拉選單 |
| **FPS 監控** | `src/components/controls/fps-counter.jsx` | 舞台即時幀率顯示組件 |
| **範例專案** | `static/samples/` | 5 款 `.sb3` 範例專案檔 |
| **部署** | `build/` -> `gh-pages` 分支 | 靜態頁面已正式部署上線 |

---

## 驗證結果

- **本地 Webpack 構建**：`npm run build` 通過，產出完整 `gui.js` 與靜態資源。
- **GitHub Pages 部署**：
  - HTTP 狀態碼：`200 OK`
  - 資源載入：`index.html`、`gui.js`、`static/samples/*.sb3` 皆可正常取得。
