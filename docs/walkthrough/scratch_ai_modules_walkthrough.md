# Scratch GUI GitHub 社群擴充模組整合成果

已成功為 Scratch GUI 擴充功能庫整合 4 款開源社群高人氣擴充功能：**控制台 (Console)**、**自訂代碼 (Custom JS)**、**自訂游標 (Cursor)** 與 **本地儲存 (Storage)**，並通過 Webpack 編譯與 GitHub Pages 正式上線。

---

## 🌐 線上驗證與專案連結

- **線上直接試用（GitHub Pages）**：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
- **GitHub 專案倉庫**：[https://github.com/O-O1112/scratch-gui](https://github.com/O-O1112/scratch-gui)

---

## 🚀 新增擴充模組詳情

### 1. 控制台 (Console)
- **擴充 ID**：`console`
- **代表色**：海軍藍 (`#3D5A80`)
- **核心積木**：
  - `輸出日誌 [TEXT]`（等同 `console.log`）
  - `輸出警告 [TEXT]`（等同 `console.warn`）
  - `輸出錯誤 [TEXT]`（等同 `console.error`）
  - `輸出資訊 [TEXT]`（等同 `console.info`）
  - `清空控制台`（等同 `console.clear`）
  - `開始計時 [LABEL]` / `結束計時 [LABEL]`（精確量測積木運行耗時）
  - `計數 [LABEL]`（記錄迴圈或事件觸發次數）

### 2. 自訂代碼 (Custom JS)
- **擴充 ID**：`custom`
- **代表色**：JS 琥珀金 (`#E09F3E`)
- **核心積木**：
  - `執行 JavaScript [CODE]`：執行任意自訂 JS 腳本或調用外部 API。
  - `計算 JavaScript [EXPR]`（Reporter）：計算表達式並取得運算結果（如 `Math.hypot(x, y)`）。
  - `最後執行結果`（Reporter）：取得前一次執行的回傳值。
  - `自訂全域變數 [KEY] 設為 [VALUE]` / `取得自訂全域變數 [KEY]`：跨積木或與網頁腳本交換全域狀態。

### 3. 自訂游標 (Cursor)
- **擴充 ID**：`cursor`
- **代表色**：紫羅蘭色 (`#7B2CBF`)
- **核心積木**：
  - `將游標設為 [TYPE]`：提供預設箭頭、手勢指標、文字輸入、十字準星、移動、禁止、等待、抓取等樣式。
  - `將游標設為圖片 [URL] 焦點X: [X] Y: [Y]`：自訂滑鼠外觀圖片。
  - `隱藏滑鼠游標` / `顯示滑鼠游標`：適合全螢幕沉浸式遊戲。

### 4. 本地儲存 (Storage)
- **擴充 ID**：`storage`
- **代表色**：翡翠綠 (`#059669`)
- **核心積木**：
  - `儲存項目 [KEY] 為 [VALUE]`：寫入 `localStorage`。
  - `讀取項目 [KEY]`：讀取已保存之資料。
  - `項目 [KEY] 是否存在？`（布林判斷）：檢查存檔是否存在。
  - `刪除項目 [KEY]` / `清空所有儲存資料`：存檔管理與重置。

---

## 📦 現有完整擴充模組庫清單（共 9 款）

1. ✋ **Handpose2Scratch**（手部即時追蹤辨識）
2. 👤 **Facemesh2Scratch**（臉部 468 點特徵網格追蹤）
3. 📷 **ML2Scratch**（機器學習影像自訂訓練分類）
4. 🖥️ **控制台 (Console)**（除錯日誌與性能分析）
5. 💻 **自訂代碼 (Custom JS)**（JavaScript 腳本求值與執行）
6. 🖱️ **自訂游標 (Cursor)**（舞台滑鼠樣式自訂與隱藏）
7. 💾 **本地儲存 (Storage)**（持久化本機存檔與跨頁記憶）
8. 🎵 **音樂 (Music)**（樂器與打擊樂演奏）
9. 🖌️ **畫筆 (Pen)**（繪圖軌跡與印章）
