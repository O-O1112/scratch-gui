# Scratch GUI 多人即時協作系統架構決策與實施計畫

為 Scratch GUI 導入即時多人協作系統（Multiplayer / Real-Time Collaboration），允許多位使用者透過網路同時編輯同一個 Scratch 專案，即時同步積木操作、游標動態與協作者在線狀態。

---

## [需要架構決策] 協作架構方案評估

因目前專案係託管於 **GitHub Pages 靜態網站**，以下提供兩種可行的系統架構比較：

| 評估維度 | 方案 A：WebRTC P2P (PeerJS) 房間協作【推薦】 | 方案 B：獨立集中式 WebSocket Relay 伺服器 |
| :--- | :--- | :--- |
| **後端伺服器依賴** | **零後端維護**（利用公共 STUN 與 PeerJS 信號） | **需額外架設維護**（Node.js + Socket.io / Docker） |
| **GitHub Pages 相容度** | **100% 靜態相容**，隨開即用 | 依賴外部第三方 PaaS（如 Render / Fly.io），有休眠或連線配額限制 |
| **傳輸延遲** | **極低延遲**（P2P 點對點直接傳輸，< 50ms） | 需經伺服器轉發中繼，依託管節點距離而定 |
| **房間生命週期** | 房主 (Host) 發起制（房主在線時房間運作，產生邀請連結） | 持久化房間（房主離線後房間仍可保留狀態） |
| **衝突與廣播機制** | 房主節點為權威廣播源（Host-Authoritative Broadcast） | 伺服器中心轉發廣播 |
| **適用情境** | **遠距教學、課堂共編、雙人/小組即時結對編程** | 大型公開社區開放式多人共編 |

> [!TIP]
> **架構師建議採用【方案 A】**：
> 1. 無需架設外部伺服器，100% 維持 GitHub Pages 免費且穩定的靜態託管優勢。
> 2. 房主只需點擊「🤝 協作」->「建立房間」，即可生成專屬 6 碼房間號或一鍵邀請網址（`?collab=xxxx`），協作者點入即可即時連線共編。

---

## 使用者審閱項目 (User Review Required)

> [!IMPORTANT]
> **請確認選擇採用的架構方案**：
> - 預設推薦：**方案 A（Serverless WebRTC P2P）**。若您有自建專屬 WebSocket 伺服器的需求，亦可指定方案 B。

---

## 核心模組與技術實作細節（以方案 A 為例）

### 1. 導覽列協作控制器組件 (`CollabMenu`)
- **位置**：頂部導覽列「設定」旁新增「🤝 協作」按鈕。
- **功能**：
  - **建立房間 (Create Room)**：隨機生成易記的短房間碼，並提供「複製邀請連結」。
  - **加入房間 (Join Room)**：輸入 6 位房間碼連線。
  - **在線成員清單 (Presence List)**：顯示當前房間內協作者頭像、名稱、連線狀態與身分（房主/成員）。
  - **中斷連線 (Leave Room)**：離開協作並轉回單機獨立模式。

### 2. Scratch Blocks 事件攔截與遠端回放引擎 (`CollabAdapter`)
- **事件捕獲**：監聽 `workspace.addChangeListener(event)`，攔截下列積木事件並封裝成 JSON 廣播：
  - `Blockly.Events.CREATE`：積木建立
  - `Blockly.Events.MOVE`：積木拖動與吸附
  - `Blockly.Events.CHANGE`：積木欄位輸入與參數變更
  - `Blockly.Events.DELETE`：積木刪除
  - `Blockly.Events.VAR_CREATE` / `VAR_DELETE`：變數增刪
- **遠端回放與防回音 (Echo Prevention)**：
  - 設定 `isRemoteApplying` 旗標，當本機接收並執行 `Blockly.Events.fromJson(event, workspace).run(true)` 時，暫停本地廣播，防止無限迴圈重送。
- **專案初始狀態同步 (Initial Project Sync)**：
  - 當新成員加入房間時，房主透過 DataChannel 自動序列化當前專案，新成員端自動呼叫 `vm.loadProject()` 完成全量初始化。

### 3. 協作者即時游標與積木操作指示 (Presence & Cursors)
- 協作者拖動積木或移動滑鼠時，在對方畫面上顯示對應顏色之協作者浮動游標與積木高亮框，提供清晰視覺回饋。

---

## 變更檔案預計清單

### [NEW]
- `src/lib/collab/collab-manager.js`：WebRTC 連線管理、PeerJS 生命週期、事件廣播與訊息路由。
- `src/lib/collab/blockly-adapter.js`：Scratch Blocks 事件序列化、反序列化與回放引擎。
- `src/components/menu-bar/collab-menu.jsx`：導覽列協作下拉選單與房間對話框組件。
- `src/components/menu-bar/collab-modal.jsx`：建立/加入房間與邀請連結彈窗。
- `src/components/collab-cursors/collab-cursors.jsx`：工作區協作者游標與在線指示層。

### [MODIFY]
- `src/components/menu-bar/menu-bar.jsx`：整合 `CollabMenu`。
- `src/containers/blocks.jsx`：掛載協作適配器以監聽與回放積木事件。
- `package.json`：引入 `peerjs` 依賴。

---

## 驗證計畫 (Verification Plan)

1. **多分頁/多視窗連線測試**：
   - 開啟分頁 A 建立房間，複製邀請連結至分頁 B 開啟。
   - 驗證分頁 B 自動連入房間，並成功同步分頁 A 之初始專案狀態。
2. **即時積木操作測試**：
   - 在分頁 A 新增、移動、修改、刪除積木，驗證分頁 B 即時同步顯示。
   - 在分頁 B 操作積木，驗證分頁 A 同步回放。
3. **編譯與部署驗證**：
   - 執行 `npm run build` 確認 Webpack 5 無報錯。
   - 部署至 GitHub Pages 並於兩台不同裝置/不同瀏覽器進行外網實測。
