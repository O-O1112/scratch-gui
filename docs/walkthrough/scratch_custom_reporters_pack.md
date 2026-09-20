# 自訂擴充載入修復與 15 款橢圓形積木實裝紀錄

## 1. 問題根因診斷與排查過程

針對「點擊擴充卡片後沒有反應」以及「積木未出現在左側工具箱」的問題，經由 headless 瀏覽器 Chrome DevTools Protocol (CDP) 逐層斷點追蹤，確認為兩大層次相依問題：

### (1) Scratch VM 模組打包路徑分流（Web Worker 回退失敗）
- **現象**：點擊擴充卡片時，Promise 未順利 resolve，卡片無反應或卡死。
- **原因**：Webpack 預設引用 MIT 官方編譯好的 `scratch-vm/dist/web/scratch-vm.js`，該打包檔內未包含我們的自訂擴充，導致系統誤判為外部非內建模組而嘗試啟動 Web Worker，最終因路徑問題失敗。
- **修復**：在 `webpack.config.js` 中建立 `resolve.alias` 強制將 `scratch-vm` 映射至原始碼 `node_modules/scratch-vm/src/index.js`，同時於 `scripts/setup-extensions.js` 修訂 `package.json` 的主入口，確保擴充直接註冊進 `builtinExtensions`。

### (2) XML 樹解析致命錯誤（未跳脫之實體符號）
- **現象**：`loadExtensionURL` 成功回傳且 `runtime.getBlocksXML()` 產生了包含自訂分類的 XML，但在呼叫 `workspace.updateToolbox()` 後，分類選單依然只有原生的 9 項。
- **原因**：自訂分類名稱宣告為 `自訂代碼與監聽 (Custom & Listeners)`，其中的 `&` 符號未經 XML 轉義直接拼裝為 `<category name="... & ...">`。瀏覽器 `DOMParser.parseFromString(xml, 'text/xml')` 遇到 `&` 視為未封閉的實體名稱，觸發 `parsererror: Unexpected token inside entity`，導致 XML 樹自第 36 個節點後中斷，第 10 項自訂分類遭到全數丟棄！
- **修復**：
  1. 將分類名稱中的 `&` 替換為標準文字 `and`（`Custom and Listeners`）。
  2. 在 `node_modules/scratch-vm/src/engine/runtime.js` 的 `getBlocksXML` 加入安全轉義防護，對所有動態分類名稱進行 `&amp;`、`&lt;`、`&gt;`、`&quot;` 安全替換，杜絕未來的 XML 解析錯誤。

---

## 2. 15 款自訂橢圓形（Reporter）與實用積木清單

擴充模組完整實裝並提供積木即時監視（Monitors）與拖曳功能：

1. **最後按下的鍵盤按鍵名稱** (`custom_getLastKey`) - 橢圓形積木，支援即時按鍵字串回傳與舞台打勾監視。
2. **最後按下的鍵盤 KeyCode 代碼** (`custom_getLastKeyCode`) - 橢圓形數值積木，取得如 13 (Enter)、32 (Space) 等鍵盤代碼。
3. **目前正按下的所有按鍵清單** (`custom_getPressedKeys`) - 橢圓形陣列字串積木，支援組合鍵狀態監控。
4. **按鍵 [key] 正處於按下狀態？** (`custom_isKeyHeld`) - 六角形布林積木，判斷特定案件是否按住。
5. **滑鼠視窗絕對座標 X** (`custom_getMouseClientX`) - 橢圓形積木，取得瀏覽器視窗中的滑鼠 X 座標。
6. **滑鼠視窗絕對座標 Y** (`custom_getMouseClientY`) - 橢圓形積木，取得瀏覽器視窗中的滑鼠 Y 座標。
7. **滑鼠滾輪最後滾動量 (Delta)** (`custom_getMouseWheelDelta`) - 橢圓形積木，偵測向上/向下滾動量。
8. **瀏覽器視窗內部寬度** (`custom_getWindowWidth`) - 橢圓形積木，回傳 `window.innerWidth`。
9. **瀏覽器視窗內部高度** (`custom_getWindowHeight`) - 橢圓形積木，回傳 `window.innerHeight`。
10. **使用者作業系統 / 平台** (`custom_getUserPlatform`) - 橢圓形積木，回傳作業系統名稱。
11. **當前網頁網址 (URL)** (`custom_getCurrentUrl`) - 橢圓形積木，回傳 `window.location.href`。
12. **網址參數 [param] 之值** (`custom_getUrlParam`) - 橢圓形積木，自動解析 URL Query 參數。
13. **目前時間戳記 (Unix 毫秒)** (`custom_getTimestamp`) - 橢圓形積木，回傳高精確度 `Date.now()`。
14. **格式化目前日期時間 [format]** (`custom_getFormattedTime`) - 橢圓形積木，自帶下拉選單（支援 YYYY-MM-DD 等）。
15. **隨機產生唯一碼 (UUID)** (`custom_generateUUID`) - 橢圓形積木，生成 UUID v4 字串。
16. **文字 Base64 編碼 / 解碼** (`custom_base64Encode` / `custom_base64Decode`) - 橢圓形編解碼轉換積木。
17. **執行自訂 JS 代碼與表達式求值** (`custom_execute` / `custom_evaluate` / `custom_getLastResult`) - 執行原生 JS 並即時取回求值回傳值。

---

## 3. 端對端自動化測試與驗證

透過 Headless Edge 模擬使用者真實操作（點擊左下角「新增擴充」卡片 -> 選擇「自訂代碼與監聽」）：
已確認左側選單出現第 10 項分類，且工具箱內成功注入 23 顆自訂積木（含全部 15 款橢圓形數值/文字積木）。

---

## 4. 線上測試入口
- 專案已發布至 GitHub Pages：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
