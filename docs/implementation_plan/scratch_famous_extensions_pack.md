# 整合社群頂級知名擴充模組 (Gamepad, Fetch, JSON) 規劃

為豐富 Scratch GUI 創作與硬體/網路互動能力，本次計畫引入社群中最知名且實用度最高的三大明星擴充：**遊戲手把 (Gamepad)**、**網路請求 (Fetch)** 與 **JSON 資料處理 (JSON)**。

---

## 擴充模組介紹與規格

### 1. 遊戲手把 (Gamepad)
- **識別碼**：`gamepad`
- **主要功能**：
  - 支援 Xbox / PlayStation / Nintendo Switch / 標準 USB 與藍牙手把（最多 4 支）。
  - 手把連接狀態與數量偵測（`gamepadConnected`、`gamepadCount`）。
  - 按鈕按下偵測與數值讀取（A/B/X/Y, L1/R1, L2/R2, D-Pad, Start/Select/Home, L3/R3）。
  - 搖桿 X/Y 軸數值讀取（-1 ~ 1）、搖桿角度（0 ~ 360°）與推力幅度（0 ~ 1）。
  - 手把震動反饋（`vibrate`，強/弱馬達與毫秒時間控制）。

### 2. 網路請求 (Fetch / Web API)
- **識別碼**：`fetch`
- **主要功能**：
  - 發送 HTTP GET 請求並回傳文字內容。
  - 發送 HTTP POST 請求（支援純文字或 JSON 負載）。
  - 便捷 JSON 欄位提取（例如傳入網址直接解析回傳 JSON 的 `status` 或 `data.items[0]`）。
  - 網路連線狀態（`isOnline`）。

### 3. JSON 資料處理 (JSON)
- **識別碼**：`json`
- **主要功能**：
  - 檢查字串是否為合法 JSON（`isValid`）。
  - 讀取 JSON 物件或陣列欄位（`get`，支援巢狀路徑如 `user.name` 或 `items[0]`）。
  - 設定 JSON 屬性並返回新字串（`set`）。
  - 刪除屬性（`delete`）、取得所有鍵名（`keys`）、取得所有值（`values`）。
  - 陣列項目取得（`arrayGet`）、陣列推入（`arrayPush`）、長度計算（`length`）。

---

## User Review Required

> [!IMPORTANT]
> - 三個擴充模組均屬於純前端客戶端運作：
>   - **Gamepad** 使用 W3C 標準 `navigator.getGamepads()`，需由瀏覽器直接存取手把硬體。
>   - **Fetch** 使用瀏覽器原生 `window.fetch()`，跨域請求仍受目標伺服器 CORS 規範限制。
>   - **JSON** 純 JS 解析，效能高且零額外外部依賴。

---

## Proposed Changes

### Scratch VM 擴充核心層

#### [NEW] [scratch3_gamepad/index.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/scratch3_gamepad/index.js)
- 實作 Gamepad 類別，包含死區過濾（Deadzone）、按鈕映射、角度與幅度計算、震動 API。

#### [NEW] [scratch3_fetch/index.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/scratch3_fetch/index.js)
- 實作 Fetch 類別，包含 GET、POST、POST JSON、路徑擷取與連線檢查。

#### [NEW] [scratch3_json/index.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/scratch3_json/index.js)
- 實作 JSON 類別，支援路徑讀寫、陣列操作與轉換。

#### [MODIFY] [extensions-vm/extension-manager.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/extension-manager.js)
- 在 `builtinExtensions` 加入 `gamepad`、`fetch`、`json`。

#### [MODIFY] [scripts/setup-extensions.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/scripts/setup-extensions.js)
- 改為動態掃描 `extensions-vm` 下所有 `scratch3_*` 目錄並自動同步至 `node_modules/scratch-vm/src/extensions/`。

---

### Scratch GUI 介面層

#### [NEW] `src/lib/libraries/extensions/gamepad/` (圖示)
- 遊戲手把卡片圖示與積木側邊欄小圖標。

#### [NEW] `src/lib/libraries/extensions/fetch/` (圖示)
- 網路請求卡片圖示與積木側邊欄小圖標。

#### [NEW] `src/lib/libraries/extensions/json/` (圖示)
- JSON 資料處理卡片圖示與積木側邊欄小圖標。

#### [MODIFY] [src/lib/libraries/extensions/index.jsx](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/libraries/extensions/index.jsx)
- 在擴充模組庫清單加入 Gamepad、Fetch、JSON 三個卡片與繁體中文說明。

---

## Verification Plan

### Automated Tests
- 執行 `node scripts/setup-extensions.js` 驗證擴充同步。
- 執行 `npm run build` 驗證 webpack 打包無報錯，並清理 `.map` 檔。

### Manual Verification
- 啟動 local 伺服器或部署至 GitHub Pages (`https://o-o1112.github.io/scratch-gui/`)。
- 在「新增擴充」庫中確認三款新模組正常顯示圖示與繁體中文標籤。
- 載入三款模組，測試手把偵測積木、Fetch 測試（如 `https://httpbin.org/get`）、以及 JSON 解析與讀取積木。
