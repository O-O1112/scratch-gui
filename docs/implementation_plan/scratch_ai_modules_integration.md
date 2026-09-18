# Scratch GUI 整合手部辨識與臉部辨識模組實施計畫

本計畫針對 `C:\Users\liguo\Downloads\scratch.txt` 所提供的來源連結，完成 Scratch GUI 與手部辨識（Handpose2Scratch）、臉部辨識（Facemesh2Scratch）兩個擴充模組的下載、整合、相依設定與建置。

---

## 來源連結（依 scratch.txt）

- **Scratch GUI**：[scratchfoundation/scratch-gui](https://github.com/scratchfoundation/scratch-gui)
- **手部辨識模組**：[champierre/handpose2scratch](https://github.com/champierre/handpose2scratch)
- **臉部辨識模組**：[champierre/facemesh2scratch](https://github.com/champierre/facemesh2scratch)

---

## 使用者審閱項目 (User Review Required)

> [!IMPORTANT]
> **建議工作目錄設定**
> 專案目錄建立於：`C:\Users\liguo\.gemini\antigravity\scratch\scratch-gui`。
> 建議使用者將該目錄設為主要作用工作區（Active Workspace）。

> [!NOTE]
> **模組技術架構說明**
> - Handpose2Scratch 與 Facemesh2Scratch 核心依賴 `ml5@0.12.2`（基於 TensorFlow.js 與 MediaPipe）。
> - 整合架構分為兩層：
>   1. **VM 邏輯層 (`scratch-vm`)**：負責積木定義、攝影機串流捕獲、特徵點估算運算（21 個手部關節點 / 468 個臉部特徵點）。
>   2. **GUI 顯示層 (`scratch-gui`)**：負責擴充模組庫清單展示、圖標與描述呈現、使用者點選載入積木調色盤。

---

## 實施計畫與變更步驟 (Proposed Changes)

### 階段一：下載與專案目錄建立

- [NEW] 下載/複製 Scratch GUI 至 `C:\Users\liguo\.gemini\antigravity\scratch\scratch-gui`。
- [NEW] 於專案內下載/克隆 `handpose2scratch` 與 `facemesh2scratch` 原始碼。

### 階段二：相依套件與擴充核心導入

- 安裝 `ml5@0.12.2`。
- 複製擴充功能至 VM 模組目錄：
  - [NEW] `node_modules/scratch-vm/src/extensions/scratch3_handpose2scratch/index.js`
  - [NEW] `node_modules/scratch-vm/src/extensions/scratch3_facemesh2scratch/index.js`
- 註冊擴充至 VM 擴充管理器：
  - [MODIFY] `node_modules/scratch-vm/src/extension-support/extension-manager.js`：加入 `handpose2scratch` 與 `facemesh2scratch` 的 builtin 註冊。

### 階段三：GUI 擴充功能庫與圖標註冊

- 複製擴充圖標資產：
  - [NEW] `src/lib/libraries/extensions/handpose2scratch/` (`.png`, `-small.png`)
  - [NEW] `src/lib/libraries/extensions/facemesh2scratch/` (`.png`, `-small.png`)
- 註冊擴充至 GUI 擴充清單：
  - [MODIFY] `src/lib/libraries/extensions/index.jsx`：引入圖標並於 `export default` 清單新增兩個模組條目。

### 階段四：專案開發規範補全

依環境與開發規範補齊必要專案檔案：
- [NEW] `docker-compose.yml`：提供前端服務預設容器定義。
- [NEW] `.env.example`：設定開發埠號與環境參數。
- [MODIFY] `README.md`：記錄新增的手部與臉部辨識擴充說明及本機/容器啟動指引。
- [NEW] `docs/implementation_plan/scratch_ai_modules_integration.md`（雙軌文件歸檔）。

---

## 驗證計畫 (Verification Plan)

### 1. Webpack 編譯驗證
- 執行：`npm run build`
- 預期產出：Webpack 5 編譯成功無報錯，`build/gui.js` 正確打包 ml5、TensorFlow 與兩個擴充模組。

### 2. 開發伺服器與介面驗證
- 啟動指令：`npm start`（埠號預設 8601）
- 瀏覽器檢驗：
  1. 開啟 `http://localhost:8601/`，確認 Scratch GUI 主畫面載入正常。
  2. 點擊左下角「新增擴充功能」按鈕。
  3. 確認擴充列表內出現 **Handpose2Scratch** 與 **Facemesh2Scratch**。
  4. 點選擴充模組，確認相關積木類別（手部特徵點、臉部特徵點）成功載入左側積木欄。
