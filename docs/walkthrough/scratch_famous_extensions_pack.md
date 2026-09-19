# 社群頂級知名擴充模組 (Gamepad, Fetch, JSON) 整合成果

本次成功將 Scratch / TurboWarp 社群中最知名、最具實用價值的 3 大明星擴充模組整合至 Scratch GUI 中：

1. **遊戲手把 (Gamepad)**
2. **網路請求 (Fetch / Web API)**
3. **JSON 資料處理 (JSON)**

---

## 擴充模組規格與亮點

### 1. 遊戲手把 (Gamepad)
- **核心架構**：以 W3C 標準 Gamepad API 為底層，自動針對按鍵與類比搖桿設定死區濾波（Deadzone），並追蹤搖桿推力、方位角與雙馬達震動。
- **積木清單**：
  - `遊戲手把 [PAD] 已連線？`（支援指定 1~4 號手把或任何手把）
  - `已連線的遊戲手把數量`
  - `手把 [PAD] 的按鈕 [BUTTON] 按下？`（A/B/X/Y, L1/R1, L2/R2, D-Pad, Select/Start/Home 等）
  - `手把 [PAD] 的按鈕 [BUTTON] 數值 (0-1)`（支援類比板機力度讀取）
  - `手把 [PAD] 的軸 [AXIS] 數值 (-1 到 1)`（左搖桿 X/Y、右搖桿 X/Y）
  - `手把 [PAD] 的 [STICK] 角度 (0-360°)`
  - `手把 [PAD] 的 [STICK] 推力大小 (0-1)`
  - `震動手把 [PAD] 持續 [DURATION] 毫秒 強度 [STRONG] 弱震 [WEAK]`

### 2. 網路請求 (Fetch / Web API)
- **核心架構**：整合瀏覽器原生 Fetch API，支援連線外部 REST API、取得動態遠端資料，並具備安全的非阻塞非同步 Promise 處理。
- **積木清單**：
  - `發送 GET 請求至 [URL]`（回傳回應文字）
  - `發送 POST 請求至 [URL] 內容 [DATA]`
  - `發送 POST JSON 至 [URL] 資料 [DATA]`（自動帶入 `application/json` 標頭）
  - `發送 GET 請求至 [URL] 並取得 JSON 欄位 [PATH]`（直接抽取巢狀 JSON 欄位）
  - `網路已連線？`（檢測客戶端網路狀態）

### 3. JSON 資料處理 (JSON)
- **核心架構**：支援完整的 JSON 物件與陣列操作，能與 Fetch、Storage、Block Plus 串接形成完整的資料處理管線。
- **積木清單**：
  - `[JSON] 是否為合法 JSON？`
  - `取得 [JSON] 的路徑 [PATH] 之值`（支援 `user.profile.name` 或 `items[0]` 路徑語法）
  - `在 [JSON] 設定路徑 [PATH] 為 [VALUE]`
  - `在 [JSON] 刪除屬性 [PATH]`
  - `取得 [JSON] 的所有鍵名 (Keys)` / `取得 [JSON] 的所有值 (Values)`
  - `取得 [JSON] 的長度或項目數`
  - `將 [VALUE] 加入陣列 [JSON]`
  - `取得陣列 [JSON] 的第 [INDEX] 項 (從 1 起算)`
  - `建立空白物件 {}` / `建立空白陣列 []`

---

## 異動檔案彙整

| 模組 / 檔案 | 類型 | 說明 |
|---|---|---|
| `extensions-vm/scratch3_gamepad/index.js` | 新增 | 遊戲手把完整邏輯與按鍵軸向解析 |
| `extensions-vm/scratch3_fetch/index.js` | 新增 | 網路 GET / POST / JSON 欄位抽取邏輯 |
| `extensions-vm/scratch3_json/index.js` | 新增 | JSON 物件陣列讀寫與路徑查詢邏輯 |
| `src/lib/libraries/extensions/gamepad/*` | 新增 | 手把卡片圖示 (`gamepad.svg`) 與側邊欄圖標 |
| `src/lib/libraries/extensions/fetch/*` | 新增 | 網路請求卡片圖示 (`fetch.svg`) 與側邊欄圖標 |
| `src/lib/libraries/extensions/json/*` | 新增 | JSON 工具卡片圖示 (`json.svg`) 與側邊欄圖標 |
| `extensions-vm/extension-manager.js` | 修改 | 在 `builtinExtensions` 註冊 3 大模組 |
| `scripts/setup-extensions.js` | 修改 | 改為動態自動掃描並複製所有 `scratch3_*` 目錄 |
| `src/lib/libraries/extensions/index.jsx` | 修改 | 於擴充庫新增 Gamepad、Fetch、JSON 卡片 |

---

## 驗證與部署

1. **自動建置**：`webpack 5.107.2 compiled successfully`，產物乾淨。
2. **線上部署**：已發布至 GitHub Pages (`gh-pages`)，HTTP 200 正常連線。
3. **線上測試入口**：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
