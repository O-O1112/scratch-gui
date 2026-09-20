# 自訂橢圓形積木 (鍵盤輸入監聽與系統工具 15 樣) 規劃

因應使用者需求，在「自訂擴充模組 (Custom)」中擴充 **15 樣頂級實用的橢圓形 (Reporter) 積木**，強化專案對鍵盤即時輸入、滑鼠視窗、系統環境與字串運算的能力。

---

## 預計擴充之 15 樣橢圓形 (Reporter) 自訂積木

1. **最後按下的鍵盤按鍵 (字元/名稱)**：如 `a`、`Enter`、`Shift`、`ArrowUp`、`Space`。
2. **目前正被按下的所有按鍵清單**：即時回傳以逗點分隔的所有按鍵（如 `w,Shift`）。
3. **最後鍵盤按鍵之 KeyCode / 代碼**：如 Enter=13, Space=32, ESC=27 等數值。
4. **最後輸入字元是否為大寫**：回傳 true / false 或大寫狀態。
5. **滑鼠視窗絕對座標 X (ClientX)**：以瀏覽器視窗為基準之滑鼠 X 像素。
6. **滑鼠視窗絕對座標 Y (ClientY)**：以瀏覽器視窗為基準之滑鼠 Y 像素。
7. **滑鼠滾輪最後滾動量 (Wheel Delta)**：向下為正、向上為負之數值。
8. **目前 Unix 毫秒時間戳記**：`Date.now()` 高精度毫秒數值。
9. **格式化目前日期時間**：回傳 `YYYY-MM-DD HH:mm:ss` 格式字串。
10. **產生隨機 UUID / 唯一碼**：生成不重複唯一識別碼（如 `a8f9-4b12-...`）。
11. **當前網頁網址 (URL)**：回傳完整當前頁面網址。
12. **網址參數 [PARAM] 之值**：解析網址查詢字串（如 `?level=2` 回傳 `2`）。
13. **瀏覽器視窗內部寬度**：`window.innerWidth` 像素值。
14. **瀏覽器視窗內部高度**：`window.innerHeight` 像素值。
15. **使用者作業系統 / 平台**：回傳 `Windows`、`macOS`、`Linux`、`iOS` 或 `Android`。
16. **字串 Base64 編碼/解碼**：將文字進行 Base64 編碼或還原。

---

## 影響檔案

1. `extensions-vm/scratch3_custom/index.js`：掛載全域鍵盤 `keydown`/`keyup` 與滑鼠 `wheel`/`mousemove` 監聽器，新增 15 樣 Reporter 積木。
2. `src/lib/libraries/extensions/index.jsx`：更新自訂擴充模組之繁體中文說明。
3. `scripts/setup-extensions.js`：同步至 `scratch-vm`。

---

## 驗證計畫
1. 執行 `node scripts/setup-extensions.js` 同步。
2. 執行 `npm run build` 編譯。
3. 部署至 `gh-pages` 與 push 到 `main`。
4. 線上測試各個橢圓形積木的回傳值與鍵盤即時監聽效果。
