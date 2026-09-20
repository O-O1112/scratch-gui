# [需要架構決策] Scratch「從 GitHub 安裝擴充模組」架構設計與實裝計畫

依據使用者需求「**從github上裝**」，本計畫旨在為 Scratch 提供自 GitHub 平台載入、解析與即時執行社群開源積木擴充（Community Extensions）的完整能力。

---

## 1. 架構決策與方案比較

在 Scratch 瀏覽器環境中載入 GitHub 上的第三方擴充模組，涉及 **動態程式碼執行 (Eval/Worker)**、**跨來源資源共享 (CORS)**、**GitHub URL 格式轉換** 與 **相容性/安全性**。以下提供 3 種架構實施方案：

| 評估維度 | 方案 A：動態 GitHub 網址安裝器 (URL Dynamic Loader) | 方案 B：精選 GitHub 知名模組預載包 (Pre-bundled Gallery) | 方案 C (推薦)：雙軌方案 (動態 URL 安裝器 + 精選熱門庫) |
| :--- | :--- | :--- | :--- |
| **運作方式** | 擴充庫提供「輸入 GitHub 網址」功能，即時 fetch GitHub Raw 程式碼並注入執行 | 挑選 GitHub 上最知名的 3~5 款模組（如動畫文字、指針鎖定、相機畫布），直接打包進本地專案 | **結合方案 A 與 B**：既有「輸入 GitHub 網址」動態載入器，亦直接內建精選知名 GitHub 擴充 |
| **彈性與擴充性** | **極高**。創作者只要貼上任意 GitHub repo 或 Gist 連結即可載入 | **低**。僅限預先編譯的模組，新模組需重新發布版本 | **極高**。既支援任意外部 GitHub 擴充，又具備即開即用的代表性模組 |
| **網路依賴性** | 需網路連線至 GitHub 或 jsDelivr CDN | **100% 離線可用**，載入零延遲且無 CORS 問題 | 精選模組可離線使用；自訂 GitHub 擴充需網路連線 |
| **安全與相容性** | 需處理 CORS 限制、GitHub blob 網址轉 raw、以及 Unsandboxed 執行環境 | 由本地嚴格驗證後打包，無相容性與 CORS 疑慮 | 本地模組保證相容；動態載入器提供 CORS Proxy (jsDelivr) 與安全性防護 |
| **架構師建議** | 適合進階開發者 | 適合一般教學使用者 | **首選方案**，兼顧自由度與新手體驗 |

---

## 2. 詳細技術架構設計 (採方案 C 雙軌架構)

### (1) GitHub URL 智慧解析與 CORS 代理
使用者輸入的 GitHub 網址通常為網頁預覽格式，需自動轉換為可跨域存取 (CORS-friendly) 的 JavaScript 原始檔端點：
- **格式 1 (一般 Repo 檔案)**：
  - 輸入：`https://github.com/:owner/:repo/blob/:branch/:path.js`
  - 轉為 jsDelivr CDN (最快且 100% CORS 支援)：`https://cdn.jsdelivr.net/gh/:owner/:repo@:branch/:path.js`
  - 備援轉為 Raw：`https://raw.githubusercontent.com/:owner/:repo/:branch/:path.js`
- **格式 2 (GitHub Gist)**：
  - 輸入：`https://gist.github.com/:user/:gistId`
  - 轉為 Gist Raw 程式碼。
- **格式 3 (Raw 網址)**：
  - 輸入：`https://raw.githubusercontent.com/...`，直接請求。

### (2) 注入 Scratch 3.0 / TurboWarp Community Extension API
GitHub 上的開源擴充大多採用標準 Unsandboxed 註冊規範：
```javascript
(function(Scratch) {
  'use strict';
  class MyExtension {
    getInfo() { ... }
  }
  Scratch.extensions.register(new MyExtension());
})(Scratch);
```
我們將在 `extension-manager.js` 中向全域暴露現代化相容層：
- `window.Scratch.ArgumentType`
- `window.Scratch.BlockType`
- `window.Scratch.TargetType`
- `window.Scratch.Cast`
- `window.Scratch.extensions.unsandboxed = true`
- `window.Scratch.extensions.register(instance)`：直接呼叫 `_registerInternalExtension(instance)`，無需經過受限的 Worker，支援 DOM、Canvas、網路與所有自訂積木！

### (3) UI 入口設計
1. **擴充庫專屬卡片**：在擴充功能清單首位（或明顯處）新增「**從 GitHub / 網址安裝自訂擴充**」卡片，搭配專屬 GitHub 標誌與藍紫漸層 Banner。
2. **互動彈窗 (URL Input Modal)**：
   - 點擊卡片彈出輸入視窗，提供直覺的網址輸入框。
   - 附帶「**熱門 GitHub 擴充快捷選單**」（一鍵填入如 Animated Text、Pointer Lock、Canvas Filters 等經典模組）。
   - 載入狀態指示（載入中、成功提示、若發生語法錯誤或 404 時顯示友善錯誤警告）。

---

## 3. 預計異動檔案清單

### [新增組件]
- `src/lib/libraries/extensions/github_loader/github_loader.svg` (600×372 專屬卡片 Banner)
- `src/lib/libraries/extensions/github_loader/github_loader-small.svg` (40×40 分類圖標)

### [修改組件]
- `extensions-vm/extension-manager.js`：
  - 實作 `window.Scratch` 相容層與 `Scratch.extensions.register`
  - 實作 GitHub / Gist 網址解析器與 jsDelivr / Raw 動態載入流程
- `src/lib/libraries/extensions/index.jsx`：
  - 註冊「從 GitHub / 網址安裝擴充」卡片元資料
- `src/containers/extension-library.jsx`：
  - 攔截 GitHub 安裝卡片點擊事件，彈出友善的 GitHub URL 輸入對話框，呼叫 `vm.extensionManager.loadExtensionURL(url)`。

---

## 4. 驗證計畫

1. **GitHub URL 轉換測試**：
   - 驗證 `github.com/.../blob/...` 自動解析為 `cdn.jsdelivr.net` / `raw.githubusercontent.com`。
2. **動態載入測試**：
   - 透過輸入真實 GitHub 開源 Scratch 擴充網址進行載入測試。
   - 驗證擴充能成功註冊、工具箱生成新分類、積木出現在畫布。
3. **E2E 自動化測試 (Headless Edge CDP)**：
   - 自動開啟擴充庫，點擊 GitHub 載入卡片並驗證執行。
   - 擷取截圖存檔。
4. **線上部署**：
   - 建置並發布至 GitHub Pages，推播至 `main`。
