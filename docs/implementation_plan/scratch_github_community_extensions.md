# 整合 GitHub 社群擴充模組（控制台、自訂 JS、自訂游標、本地儲存）實作計畫

因應使用者需求，在現有 AI 擴充模組（Handpose、Facemesh、ML2Scratch）與基礎模組之外，擴充加入 Scratch / TurboWarp 開源社群中最高人氣且最實用的開發者與創作者擴充功能：**控制台 (Console)** 與 **自訂系列 (Custom JS、自訂游標、本地儲存)**。

---

## 規劃整合之擴充模組清單

### 1. 控制台擴充 (`console`)
- **功能定位**：提供專案即時除錯、日誌記錄與性能分析工具。
- **提供積木**：
  - `輸出日誌 (log) [內容]`
  - `輸出警告 (warn) [內容]`
  - `輸出錯誤 (error) [內容]`
  - `輸出資訊 (info) [內容]`
  - `清空控制台 (clear)`
  - `開始計時 [標籤]` / `結束計時 [標籤]`
  - `次數計數 [標籤]`
  - `建立日誌群組 [標籤]` / `結束群組`

### 2. 自訂 JavaScript 擴充 (`custom` / `customjs`)
- **功能定位**：打破積木語法限制，允許創作者在專案中執行自訂 JavaScript 邏輯與表達式。
- **提供積木**：
  - `執行 JavaScript 程式碼 [CODE]`（命令積木，可執行函數調用、API 操作等）
  - `計算 JavaScript 表達式 [EXPRESSION]`（回傳值積木 Reporter，取得運算結果）
  - `最後執行結果`（Reporter，取得上一次命令的傳回值）
  - `全域自訂變數 [KEY] 設為 [VALUE]`
  - `取得全域自訂變數 [KEY]`

### 3. 自訂游標擴充 (`cursor`)
- **功能定位**：針對互動遊戲與展示自訂滑鼠外觀或隱藏游標。
- **提供積木**：
  - `將游標樣式設為 [預設/指針/文字/移動/十字/等待/禁止]`
  - `將游標設為圖片網址 [URL] 焦點X: [X] Y: [Y]`
  - `隱藏滑鼠游標`
  - `顯示滑鼠游標`

### 4. 本地持久化儲存擴充 (`storage`)
- **功能定位**：使用瀏覽器 `localStorage` 提供跨頁面、離線記憶之自訂存檔功能（玩家存檔、最高分數、遊戲設定等）。
- **提供積木**：
  - `儲存項目 [KEY] 為 [VALUE]`
  - `讀取項目 [KEY]`
  - `刪除項目 [KEY]`
  - `清空所有儲存資料`
  - `項目 [KEY] 是否存在？`（布林積木）

---

## User Review Required

> [!IMPORTANT]
> 1. **安全性考量**：`自訂 JavaScript` 擴充允許在瀏覽器環境執行自訂腳本代碼，屬於高階開發者功能，能達成完全自訂邏輯與外部 API 串接。
> 2. **擴充庫分類**：本次新增的 4 款擴充將新增至擴充功能庫中，與現有 AI 模組、音樂、畫筆並存。

---

## Proposed Changes

### 擴充 VM 核心邏輯 (`extensions-vm/`)
- [NEW] `extensions-vm/scratch3_console/index.js`：控制台擴充積木邏輯。
- [NEW] `extensions-vm/scratch3_custom/index.js`：自訂 JavaScript 執行與求值積木邏輯。
- [NEW] `extensions-vm/scratch3_cursor/index.js`：舞台游標切換邏輯。
- [NEW] `extensions-vm/scratch3_storage/index.js`：LocalStorage 本地持久化存儲邏輯。
- [MODIFY] `extensions-vm/extension-manager.js`：在 `builtinExtensions` 中註冊 `console`, `custom`, `cursor`, `storage`。
- [MODIFY] `scripts/setup-extensions.js`：同步複製新增之擴充目錄至 `node_modules/scratch-vm/src/extensions/`。

### 擴充 GUI 卡片與素材 (`src/lib/libraries/extensions/`)
- [NEW] `src/lib/libraries/extensions/console/`：圖標與說明卡片配置。
- [NEW] `src/lib/libraries/extensions/custom/`：圖標與說明卡片配置。
- [NEW] `src/lib/libraries/extensions/cursor/`：圖標與說明卡片配置。
- [NEW] `src/lib/libraries/extensions/storage/`：圖標與說明卡片配置。
- [MODIFY] `src/lib/libraries/extensions/index.jsx`：將新擴充加入清單供點選載入。

### 構建與部署
- 執行 `node scripts/setup-extensions.js` 注入 VM。
- 執行 `npm run build` 編譯 Webpack。
- 部署至 `gh-pages` 分支上線。

---

## Verification Plan

### 自動化驗證
- `npm run build`：驗證所有擴充模組語法正確、Webpack 成功打包輸出且無錯誤。

### 手動功能驗證
- 在瀏覽器開啟部署頁面，開啟「擴充功能庫」確認 4 款新擴充正常顯示。
- 載入「控制台」擴充，拖曳 `輸出日誌` 積木並點擊，按 F12 驗證 DevTools Console 正確列印。
- 載入「自訂 JavaScript」擴充，執行 `1 + 1` 或 `Math.sqrt(16)` 驗證回傳值積木正常計算。
- 載入「自訂游標」擴充，切換游標樣式驗證舞台滑鼠指標立即變更。
- 載入「本地儲存」擴充，寫入鍵值後重整頁面，驗證能成功讀回存檔。
