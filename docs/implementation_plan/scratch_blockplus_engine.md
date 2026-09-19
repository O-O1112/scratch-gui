# [需要架構決策] 整合 Block Plus 全功能多語言引擎至 Scratch GUI

## 背景與目標
使用者提出：「不對，因該要將block plus整個引擎放上去，然後可使用」。
Block Plus 是使用者所設計的開創性多語言協同開發程式語言與執行引擎（`O-O1112/Block_lang`、`O-O1112/Block`、`O-O1112/Block-Web-Runtime`），其核心特點包含：
1. **Native Block 語法架構**：複合控制語句以獨立 `block` 結尾（如 `func ... block`、`for ... in ... block`、`while ... block`、`if ... elif ... else ... block`）。
2. **多語言管線化嵌入（Polyglot Pipeline）**：同一腳本中透過 `<js>`、`<py>`、`<json>`、`<html>`、`<del>` 等多語言標籤分段執行，所有語言區塊皆共享同一個雙向狀態匯流排（`globalState`）。
3. **動態擴充與模板引擎**：支援 `{{variable}}` 變數插值、動態類型轉換與輸出緩衝捕獲（Output Buffer）。

本任務目標是將完整的 **Block Plus 直譯與執行引擎** 完整植入 Scratch GUI / Scratch VM 中，成為原生支援的獨立擴充模組，並提供豐富的 Scratch 積木與 Scratch 精靈雙向互通橋接能力。

---

## 架構決策方案比較

### 方案 A (推薦)：純前端高效雙引擎架構（Embedded Fast Engine + Polyglot State Bus）
- **運作原理**：
  - 在 Scratch VM 擴充內部實現完整的 Block Plus 解析器與抽象語法樹（AST）直譯器（依據 `NativeBlockProgram.cs` 與 `block.js` 規格）。
  - **Native Block 核心**：純 JavaScript 實現原生符號解析、作用域、函式遞迴與迴圈計數器，達到 0ms 啟動延遲與完全零網路依賴。
  - **`<js>` 區塊**：透過隔離沙盒執行原生 JavaScript，執行前後自動同步全域狀態 `globalState`。
  - **`<py>` 區塊**：提供輕量化 Python 語法即時解析器，並支援非同步掛載 Web Pyodide (Wasm) 引擎，離線即時與進階運算兼備。
  - **`<json>`, `<html>`, `<del>` 區塊**：支援 `{{var}}` 模板插值、JSON 狀態載入與記憶體變數清理。
  - **Scratch Sprite 雙向橋接**：在 Block 與 `<js>` 區塊中直接注入 `scratch` 物件（可呼叫 `scratch.say("訊息")`、`scratch.setX(100)`、`scratch.broadcast("訊息")` 等）。
- **優點**：
  - 完全離線可用，部署至 GitHub Pages 後 100% 穩定秒開。
  - Scratch Reporter（求值積木）可**同步回傳**計算結果，無需等待多層非同步訊息傳遞，完全不卡頓 Scratch 30 FPS 渲染循環。
  - 具備直接操控 Scratch 舞台精靈的強大互動性。
- **缺點**：
  - 重度 Python 科學運算套件（如 numpy）初次執行需下載 Wasm，需有輕量原生解析器作為無網路備援。

---

### 方案 B：外掛 Web Worker / iframe 隔離容器（仿 Block-Web-Runtime 模式）
- **運作原理**：
  - 仿照 `Block-Web-Runtime` 架構，透過 iframe 嵌入獨立 runner HTML 或純 Web Worker 載入 Pyodide/SQLite Wasm。
- **優點**：
  - 腳本崩潰或無限迴圈時可直接 Terminate Worker，與 Scratch 主執行緒隔離。
- **缺點**：
  - Scratch 3 的 Reporter（求值積木）本質上是同步取值，Web Worker 的 `postMessage` 是非同步的，會造成 Reporter 延遲或需等待下一幀。
  - 增加了靜態資源部署與跨域通訊的複雜度。

> [!TIP]
> **架構師建議採用【方案 A】**，以原生高效直譯引擎為主軸，結合同步求值與 Scratch 精靈雙向橋接，並提供輸出緩衝與完整的 Block Plus 語法支援。

---

## User Review Required

> [!IMPORTANT]
> 請確認以下設計與積木功能清單：
> 1. **擴充識別碼**：`blocklang`
> 2. **中文名稱**：`Block Plus 引擎`
> 3. **積木功能清單**：
>    - `執行 Block Plus 程式碼 [CODE]`（Command 積木：支援 native block、`<js>`、`<py>` 等複合代碼）
>    - `計算 Block Plus 表達式 [EXPR]`（Reporter 積木：計算運算式並即時回傳值）
>    - `執行 Block Plus 並回傳輸出 [CODE]`（Reporter 積木：執行腳本並回傳所有 print / console 輸出字串）
>    - `Block 變數 [KEY]`（Reporter 積木：讀取 Block 全域變數）
>    - `設 Block 變數 [KEY] 為 [VALUE]`（Command 積木：寫入 Block 全域變數）
>    - `刪除 Block 變數 [KEY]`（Command 積木：刪除指定變數）
>    - `Block 所有變數 (JSON)`（Reporter 積木：以 JSON 格式匯出所有狀態）
>    - `Block 控制台輸出日誌`（Reporter 積木：讀取歷史輸出日誌）
>    - `清空 Block 控制台日誌`（Command 積木）
>    - `重設 Block 引擎狀態`（Command 積木：清空所有全域狀態變數與暫存）
>    - `精靈橋接`：在 Block 與 `<js>` 腳本中可直接使用 `scratch.say(msg)`、`scratch.setPos(x, y)`、`scratch.x`、`scratch.y`、`scratch.broadcast(name)`。

---

## Open Questions

> [!NOTE]
> 1. **官方幾何標誌**：將使用使用者 `O-O1112/Block_` 專案中的幾何 "B" 向量標誌製作擴充卡片與選單圖示，主題色採高質感科技黑曜底色與純白幾何標誌。
> 2. **預設範例代碼**：執行積木中預設放入代表性的 Block Plus 代碼（如 `func greet(name): return "Hello, " + name block\nprint(greet("Scratch"))`）。

---

## Proposed Changes

### 1. Scratch VM 核心擴充 (`extensions-vm/`)
#### [NEW] [block-engine.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/scratch3_blocklang/block-engine.js)
- 依據 `NativeBlockProgram.cs` 與 `block.js` 實作完整的純 JS Block Plus 引擎：
  - AST / Token 直譯器：支援 `func/block`, `for/block`, `while/block`, `if/elif/else/block`, `print`, `return`, 列表與字典、運算子與內建函式（`range`, `len`, `str`, `int`, `float`, `push`, `pop`, `keys`, `values`, `sum`, `min`, `max`, `type`, `json_parse`, `json_stringify`）。
  - 支援 `<js>` 區塊雙向狀態注入與沙盒執行。
  - 支援 `<py>` 區塊輕量 Python 執行與狀態轉換。
  - 支援 `<json>`、`<html>`、`<del>` 標籤處理。
  - 輸出捕獲日誌總線（Capture output callback）。
  - Scratch 舞台精靈控制橋接器（`scratch` 物件封裝）。

#### [NEW] [index.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/scratch3_blocklang/index.js)
- 實作 `Scratch3BlockLang` 擴充類別，註冊所有 Command / Reporter 積木與預設參數。

#### [MODIFY] [extension-manager.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/extensions-vm/extension-manager.js)
- 於 `builtinExtensions` 加入 `blocklang: () => require('../extensions/scratch3_blocklang')`。

#### [MODIFY] [setup-extensions.js](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/scripts/setup-extensions.js)
- 加入自動複製 `scratch3_blocklang` 目錄至 `node_modules/scratch-vm/src/extensions/scratch3_blocklang`。

---

### 2. Scratch GUI 擴充圖庫 (`src/lib/libraries/extensions/`)
#### [NEW] [blocklang.svg](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/libraries/extensions/blocklang/blocklang.svg)
#### [NEW] [blocklang-small.svg](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/libraries/extensions/blocklang/blocklang-small.svg)
- 基於官方幾何 "B" 標誌與科技黑主題設計的 SVG 向量大圖與選單小圖。

#### [MODIFY] [index.jsx](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/libraries/extensions/index.jsx)
- 引入圖標並註冊 `Block Plus 引擎 (Block Plus)` 卡片至擴充庫中。

---

### 3. 雙軌文件同步 (`docs/`)
#### [NEW] [scratch_blockplus_engine.md](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/docs/implementation_plan/scratch_blockplus_engine.md)
- 依規範同步存檔至專案本機 `docs/implementation_plan/` 目錄。

---

## Verification Plan

### 自動與腳本測試
1. **獨立引擎單元驗證**：
   - 建立測試腳本，驗證 Native Block 語法、`<js>` 區塊、狀態共享與輸出日誌：
   ```powershell
   node test-blocklang.js
   ```
2. **建置測試**：
   - 執行 `node scripts/setup-extensions.js` 同步至 `scratch-vm`。
   - 執行 `npm run build` 確認 Webpack 打包完全無錯誤。
   - 移除 `.map` 大檔，確保 GitHub Pages 尺寸輕量。

### 人工與線上驗證
1. **GitHub Pages 上線驗證**：
   - 推送至 `gh-pages` 分支與 `main` 分支。
   - 開啟 `https://o-o1112.github.io/scratch-gui/` 測試：
     - 在擴充選單中點選「Block Plus 引擎」。
     - 拖拉「執行 Block Plus 程式碼」積木並執行預設程式，檢查輸出日誌積木。
     - 測試多語言變數傳遞與 Scratch 精靈移動指令。
