# 15 樣自訂橢圓形 (Reporter) 積木擴充成果

已於「自訂代碼與監聽 (Custom & Listeners)」模組中全面加入 15+ 樣強大的**橢圓形 (Reporter) 積木**，大幅拓展 Scratch 取得鍵盤即時輸入、滑鼠視窗與系統環境狀態的能力。

---

## 新增之 15 樣橢圓形 (Reporter) 積木一覽

### 1. 鍵盤輸入即時監聽 (Keyboard Listeners)
1. `最後按下的鍵盤按鍵名稱`：回傳如 `a`、`Enter`、`Shift`、`ArrowUp`、`Space` 等按鍵文字。
2. `最後按下的鍵盤 KeyCode 代碼`：回傳按鍵的標準 KeyCode 數字（如 Enter=13, Space=32, ESC=27）。
3. `目前正按下的所有按鍵清單`：回傳當前所有被按住的按鍵（例如 `w,shift`），支援多鍵同時偵測。
4. `按鍵 [KEY] 正處於按下狀態？`（六角形布林積木，輔助配合清單檢查）。

### 2. 滑鼠視窗與滾輪 (Mouse & Wheel)
5. `滑鼠視窗絕對座標 X`：以瀏覽器視窗為基準之滑鼠 X 像素位置。
6. `滑鼠視窗絕對座標 Y`：以瀏覽器視窗為基準之滑鼠 Y 像素位置。
7. `滑鼠滾輪最後滾動量 (Delta)`：滾輪向下滾為正、向上滾為負之數值。

### 3. 系統環境與視窗 (System & Window)
8. `瀏覽器視窗內部寬度`：`window.innerWidth` 像素數值。
9. `瀏覽器視窗內部高度`：`window.innerHeight` 像素數值。
10. `使用者作業系統 / 平台`：回傳 `Windows`、`macOS`、`Linux`、`Android`、`iOS`。
11. `當前網頁網址 (URL)`：回傳瀏覽器當前完整頁面網址。
12. `網址參數 [PARAM] 之值`：解析查詢字串（例如 `?player=Alex` 輸入 `player` 回傳 `Alex`）。

### 4. 時間與字串運算 (Time & String Utils)
13. `目前時間戳記 (Unix 毫秒)`：回傳高精確度 `Date.now()` 毫秒數字。
14. `格式化目前日期時間 [FORMAT]`：支援 `YYYY-MM-DD HH:mm:ss`、`HH:mm:ss` 等格式。
15. `隨機產生唯一碼 (UUID)`：自動生成不重複唯一識別碼（UUIDv4）。
16. `文字 [TEXT] 的 Base64 編碼`：支援字串 Base64 編碼。
17. `Base64 [TEXT] 進行解碼`：支援 Base64 還原字串。

---

## 異動檔案彙整

| 檔案路徑 | 類型 | 說明 |
|---|---|---|
| `extensions-vm/scratch3_custom/index.js` | 修改 | 掛載全域鍵盤與滑鼠視窗事件監聽器，實作 15 樣 Reporter 積木 |
| `src/lib/libraries/extensions/index.jsx` | 修改 | 更新模組名稱為「自訂代碼與監聽」，更新繁體中文說明 |
| `docs/implementation_plan/scratch_custom_reporters_pack.md` | 新增 | 實作規劃存檔 |
| `docs/walkthrough/scratch_custom_reporters_pack.md` | 新增 | 實作驗證存檔 |

---

## 驗證與部署
- **建置狀況**：`webpack 5.107.2 compiled successfully in 23203 ms`。
- **線上站點**：已發布至 GitHub Pages (`gh-pages`)，HTTP 200。
- **測試入口**：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
