# Scratch 5 大進階擴充模組包實裝計畫 (5-in-1 Extensions Pack)

為 Scratch 打造極致豐富的創作生態，依據需求一次性整合 5 大領域核心擴充模組，大幅拓展遊戲、動畫、音樂、多人連線與資料存儲能力。

---

## 1. 模組規格與架構設計

### 模組 1：2D 物理引擎 (Physics 2D - Matter.js)
- **核心庫**：`matter-js` (已就緒，輕量高效 2D 剛體物理)。
- **目標場景**：物理彈珠台、憤怒鳥拋物線、平台跳躍跳台、重力沙盒、骨牌效應。
- **核心積木**：
  - `[初始化物理世界 重力X: [0] 重力Y: [-10]]`
  - `[將當前角色設為物理物件 形狀: [方塊/圓形] 類型: [動態剛體/靜態障礙]]`
  - `[設定物理屬性 質量:[1] 彈性:[0.8] 摩擦力:[0.1] 空氣阻力:[0.01]]`
  - `[施加推力 (Force) X:[0] Y:[50]]` / `[施加瞬間衝量 (Impulse) X:[10] Y:[0]]`
  - `[設定物理速度 VX:[0] VY:[0]]`
  - `<與角色 [name] 發生物理碰撞？>` (布林積木)
  - `(當前物理速度 VX)`、`(當前物理速度 VY)` (橢圓形積木)

### 模組 2：粒子特效與濾鏡 (Particles & Visual FX)
- **核心技術**：HTML5 2D Canvas 獨立粒子發射器，自動對齊 Scratch 舞台。
- **目標場景**：魔法光暈、戰鬥爆炸、噴射引擎火焰、煙霧迷霧、雪花落葉天候。
- **核心積木**：
  - `[在 X:[0] Y:[0] 發射預設粒子 [火焰 / 煙霧 / 爆炸 / 雪花 / 星光] 數量:[20]]`
  - `[跟隨當前角色持續發射粒子 [火焰] 速率:[5/秒]]`
  - `[停止所有粒子發射器]` / `[清除舞台上所有粒子]`
  - `[設定自訂粒子屬性 顏色:[#ffaa00] 壽命:[1.5秒] 速度:[5] 擴散角:[45度] 尺寸:[8]]`
  - `[設定畫布色彩混合模式 [正常 / 濾色 (Screen) / 加亮光暈 (Lighter)]]`

### 模組 3：多人即時連線 (Multiplayer & Networking - WebSocket)
- **核心技術**：原生 Web API `WebSocket`，支援標準房間與自訂訊號伺服器。
- **目標場景**：雙人即時格鬥/對戰、多人連線跑酷、跨玩家虛擬世界、即時聊天室。
- **核心積木**：
  - `[連線至多人伺服器 網址:[wss://...]]` / `[加入連線房間 [room123] 玩家名稱:[P1]]`
  - `[離開房間並斷線]`
  - `[向全房間廣播訊息 標籤:[tag] 內容:[msg]]`
  - `[向特定玩家 [playerId] 發送私人訊息 [msg]]`
  - `[同步自身變數 [key] 為 [value]]`（自動廣播給所有玩家）
  - `[當收到房間訊息 標籤:[tag]]` (HAT 觸發積木)
  - 橢圓形積木：`(我的玩家 ID)`、`(房間連線人數)`、`(最新收到的訊息內容)`、`(玩家 [player] 的變數 [key])`

### 模組 4：進階音訊合成與頻譜分析 (Web Audio & Synth)
- **核心技術**：原生 Web Audio API (`AudioContext`, `OscillatorNode`, `BiquadFilterNode`, `AnalyserNode`)。
- **目標場景**：8-bit 紅白機晶片音效合成、自製合成器音樂、音樂節奏遊戲 (Rhythm Game)、音量頻譜即時可視化。
- **核心積木**：
  - `[播放合成音調 波形:[方塊波 (8-bit) / 正弦波 / 鋸齒波 / 三角波] 音高 (Hz):[440] 持續:[0.3] 秒]`
  - `[播放打擊噪聲 (Noise) 衰減時間:[0.2] 秒]`（製作鼓聲、射擊爆炸聲）
  - `[設定 ADSR 包絡 起音(A):[0.05] 衰減(D):[0.1] 延音(S):[0.7] 釋音(R):[0.2]]`
  - `[設定低通音效濾波器 截止頻率:[1000] Hz]`（製作水下悶音或低音加強）
  - 橢圓形回傳積木：`(即時麥克風/音訊主頻率 Hz)`、`(即時低音強度 Bass)`、`(即時總音量 Decibels)`

### 模組 5：檔案系統與剪貼簿 (Files & Clipboard)
- **核心技術**：原生 HTML5 File API、Blob 下載與 `navigator.clipboard`。
- **目標場景**：導出/保存遊戲存檔檔案 (.json)、讀取本機關卡地圖檔、剪貼簿文字複製貼上、匯入文字資料。
- **核心積木**：
  - `[複製文字 [text] 至剪貼簿]`
  - `(剪貼簿文字內容)` (橢圓形積木)
  - `[匯出/下載檔案 檔名:[save.json] 內容:[text]]`
  - `[彈出檔案選擇視窗並讀取文字檔]`
  - `(最後讀取的檔案文字內容)` (橢圓形積木)
  - `(最後讀取的檔案名稱)` (橢圓形積木)

---

## 2. 預計異動與新增檔案

### [新增組件]
- `extensions-vm/scratch3_physics/index.js`
- `extensions-vm/scratch3_particles/index.js`
- `extensions-vm/scratch3_multiplayer/index.js`
- `extensions-vm/scratch3_webaudio/index.js`
- `extensions-vm/scratch3_files/index.js`
- 10 款 SVG 圖標（5 組大卡片與左側分類圓形圖標）：
  - `src/lib/libraries/extensions/physics/`
  - `src/lib/libraries/extensions/particles/`
  - `src/lib/libraries/extensions/multiplayer/`
  - `src/lib/libraries/extensions/webaudio/`
  - `src/lib/libraries/extensions/files/`

### [修改組件]
- `extensions-vm/extension-manager.js`：註冊 5 大模組至 `builtinExtensions`。
- `src/lib/libraries/extensions/index.jsx`：註冊 5 大模組之卡片元資料與圖標引用。
- `scripts/setup-extensions.js`：加入 5 大模組目錄同步機制。

---

## 3. 驗證計畫

1. **編譯打包**：執行 `npm run build` 確認 Webpack 5 順利編譯。
2. **E2E 自動化驗證 (Headless Edge CDP)**：
   - 依序啟動並測試 5 款擴充載入，確保無 XML 錯誤、分類圖標與積木完整進入工具箱。
   - 執行 2D 物理模擬與粒子發射測試。
   - 擷取實機測試截圖。
3. **發布與驗證**：發布至 GitHub Pages (`https://o-o1112.github.io/scratch-gui/`) 並驗證。
