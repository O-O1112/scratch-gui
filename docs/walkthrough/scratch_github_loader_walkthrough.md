# 從 GitHub 動態安裝擴充功能與社群精選模組驗證記錄 (Walkthrough)

## 1. 任務目標回顧
依據使用者要求「從github上裝」並選擇「方案 C：雙軌方案（動態 URL 安裝器 + 精選熱門庫）」，實作以下功能：
1. **動態 URL 安裝器**：在擴充庫置頂「從 GitHub / 網址安裝自訂擴充」卡片，支援點擊輸入任意 GitHub、Raw、Gist 或 jsDelivr 網址，自動轉為無 CORS 限制的 CDN 端點，在主執行緒動態執行並註冊積木。
2. **精選社群模組**：
   - `Pointer Lock` (滑鼠指針鎖定)：FPS、3D 視角鎖定滑鼠並計算 Delta X/Y。
   - `Animated Text` (動態文字)：畫布打字機效果、動畫文字與彩虹字體渲染。
3. **無沙箱 (Unsandboxed) 擴充生態相容性**：
   - 暴露全域物件 `window.Scratch`（提供 `ArgumentType`, `BlockType`, `TargetType`, `Cast`, `extensions.unsandboxed = true`, `extensions.register`）。
   - 擴充 ID 正規表達式容錯修訂（將非英數符號淨化，避免原生 `^[a-z0-9]+$` 崩潰）。
4. **自動化驗證與部署**：
   - 使用 Edge CDP 進行端對端畫面測試並截圖。
   - 部署至 GitHub Pages (`https://o-o1112.github.io/scratch-gui/`) 並同步至主分支。

---

## 2. 異動檔案與核心實作

### 擴充生態核心引擎 (`extensions-vm/extension-manager.js`)
- **`window.Scratch` 注入**：支援 TurboWarp/社群最常見的 `(function(Scratch) { Scratch.extensions.register(...) })(Scratch)` 寫法。
- **`_resolveGitHubURL` 轉換**：
  - `github.com/:owner/:repo/blob/:branch/:file` 自動轉為 `cdn.jsdelivr.net/gh/:owner/:repo@:branch/:file`。
  - `raw.githubusercontent.com/:owner/:repo/:branch/:file` 自動轉為 `cdn.jsdelivr.net/gh/:owner/:repo@:branch/:file`。
  - 支援 Gist 與任意直接 JS 網址。
- **`loadExtensionURL`**：支援主執行緒動態 fetch + 腳本執行與積木即時載入。
- **ID 容錯修訂**：在 `_prepareExtensionInfo` 中執行 `extensionInfo.id = extensionInfo.id.replace(/[^a-z0-9]/gi, '')`。

### 精選擴充模組
- `extensions-vm/scratch3_pointerlock/index.js`
- `extensions-vm/scratch3_animatedtext/index.js`
- SVG 向量圖示資源：
  - `src/lib/libraries/extensions/github_loader/`
  - `src/lib/libraries/extensions/pointerlock/`
  - `src/lib/libraries/extensions/animatedtext/`

### GUI 整合
- `src/lib/libraries/extensions/index.jsx`：置頂「從 GitHub / 網址安裝自訂擴充」卡片，並註冊 `pointerlock` 與 `animatedtext`。
- `src/containers/extension-library.jsx`：點擊卡片彈出網址輸入對話框，即時呼叫 `loadExtensionURL`。

---

## 3. 端對端自動化驗證結果

使用 Edge Headless 與 Chrome DevTools Protocol 執行真實瀏覽器模擬驗證：

### 驗證 1：擴充庫中的 GitHub 安裝器入口
擴充功能選擇庫首張卡片即為「從 GitHub / 網址安裝自訂擴充」，配備專屬終端機與 GitHub 向量插圖：
![GitHub Loader Modal](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/docs/walkthrough/github_loader_modal.png)

### 驗證 2：動態載入外部 GitHub 模組與精選模組積木
測試伺服器模擬提供外部 GitHub 擴充模組 `http://localhost:PORT/mock-github-ext.js`，透過 `loadExtensionURL` 動態載入後，成功於左側積木欄即時呈現：
1. **GitHub 外部社群模組 (GitHub Community)**
   - `自 GitHub 即時安裝成功：執行動作 [Hello from GitHub!]`
   - `[ ] (GitHub 擴充版本號)`
2. **滑鼠指針鎖定 (Pointer Lock)**
   - `鎖定滑鼠指針到舞台`、`解除滑鼠指針鎖定`、`重設滑鼠移動累積量`、`<滑鼠指針已鎖定？>`、`(滑鼠水平移動量)`、`(滑鼠垂直移動量)`
3. **動態文字 (Animated Text)**
   - `在 X: 0 Y: 0 顯示文字 [Hello World!]`、`以打字機效果顯示 [...]`、`清除動態文字`、`設定文字 字型 大小`
![GitHub External Extension Loaded](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/docs/walkthrough/github_external_extension_loaded.png)

---

## 4. 部署與同步狀態
- **GitHub Pages 部署**：已成功推送編譯產物至 `gh-pages` 分支（https://o-o1112.github.io/scratch-gui/）。
- **Git 倉庫狀態**：所有原始碼、腳本、文件與資源已準備就緒，待提交至 `main` 分支。
