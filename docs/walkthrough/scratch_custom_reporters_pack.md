# 擴充模組載入機制修復與 15 樣自訂橢圓形積木

### 1. 問題根因診斷
先前為了讓自訂模組自動出現，在專案載入（`vm-manager-hoc.jsx`）階段提早呼叫了 `loadExtensionURL`。但在該時機點，編輯器的積木畫布與工具箱（`blocks.jsx`）尚未掛載完成，使得廣播的 `EXTENSION_ADDED` 事件遺失，且標記了擴充為「已載入」。
當使用者打開擴充庫點擊卡片時，程式判定該擴充已載入而直接跳過註冊流程，導致「點擊卡片後看似沒有任何反應」。

### 2. 修復措施
- 移除提早預載邏輯，恢復為標準 Scratch 擴充生命週期管理。
- 使用者在點擊左下角「**+ 新增擴充**」並選取「**自訂代碼與監聽 (Custom & Listeners)**」時，系統會確實執行 `loadExtensionURL` -> 廣播 `EXTENSION_ADDED` -> `blocks.jsx` 動態產生分類並將 15 款橢圓形積木注入工具箱 -> 自動滾動至該分類。
- 保留 `webpack.config.js` 的 `hash: true` 機制，避免瀏覽器快取舊的代碼包。

---

## 驗證
- 最新修復已打包並推送發布至 GitHub Pages。
- 測試入口：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
