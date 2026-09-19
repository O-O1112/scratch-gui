# 整合 Block Language (Block-Lang) 擴充模組實作計畫

本計畫旨在將創作者開發之跨語言整合引擎與程式語言 **[Block Language (Block-Lang)](https://o-o1112.github.io/Block_lang/)** 完整封裝為 Scratch 3.0 原生擴充模組，使 Scratch 能直接撰寫、執行與求值具備 `block` 結構特徵的 Native Block 語法與 `<js>` 多語言管線。

---

## 語法支援與模組特性

依據 [Block Language 官方規範](https://o-o1112.github.io/Block_lang/)：
1. **原生 Block 語法 (Native Block Syntax)**：
   - 複合語句統一以獨立 `block` 結尾：
     - `if condition:` ... `elif condition:` ... `else:` ... `block`
     - `for item in items:` ... `block`
     - `while condition:` ... `block`
     - `func name(param1, param2):` ... `block`
   - 支援列表 `[1, 2, 3]`、字典/物件 `{"name": "Block"}`、屬性訪問 `profile.total` 或 `profile["key"]`。
   - 內建函式：`print(...)`, `len(...)`, `range(...)`, `sum(...)`, `str(...)`, `int(...)`, `float(...)`, `bool(...)`, `contains(...)`, `keys(...)`, `values(...)`。
2. **多語言標籤支援 (Runtime Tags)**：
   - `<js> ... </js>`：執行 JavaScript 並無縫同步至跨語言共用狀態 (Shared State Pipeline)。
   - `<json> ... </json>`：解析 JSON 數據載入狀態。
3. **無縫串接 Scratch**：
   - 指令積木執行腳本並捕獲 `stdout` 輸出。
   - Reporter 積木直接計算 Block 表達式回傳值給其他 Scratch 積木。
   - 雙向變數共享（Scratch 變數 ⇄ Block 變數）。

---

## 規劃提供之積木清單

| 積木類型 | 積木語法 | 說明 |
| :--- | :--- | :--- |
| **命令 (Command)** | `執行 Block 腳本 [CODE]` | 執行包含 `block` 區塊與多語言標籤之完整腳本 |
| **表達式 (Reporter)** | `計算 Block 表達式 [EXPR]` | 求值並回傳運算結果（如 `sum([1, 2, 3])`） |
| **報表 (Reporter)** | `Block 標準輸出 (stdout)` | 取得最新一次 `print()` 輸出的文字紀錄 |
| **命令 (Command)** | `設 Block 變數 [KEY] 為 [VALUE]` | 寫入跨語言共用狀態 Pipeline |
| **報表 (Reporter)** | `取得 Block 變數 [KEY]` | 讀取共用狀態中特定變數的值 |
| **命令 (Command)** | `執行 [LANG] 區塊代碼 [CODE]` | 快速調用 `<block>`, `<js>`, `<json>` 專屬語法 |
| **命令 (Command)** | `重設 Block 引擎狀態` | 清空所有共用狀態與暫存 |

---

## User Review Required

> [!IMPORTANT]
> - **引擎運作方式**：在瀏覽器端實作完全獨立、零外網依賴的 Web 輕量化 `BlockLangInterpreter`，支援離線環境與 GitHub Pages 靜態運作。
> - **外觀識別**：採用 Block_lang 官方主題色（Sky Blue `#0EA5E9`）與專屬 Block 標誌圖標。

---

## Proposed Changes

### 擴充 VM 核心邏輯
- [NEW] `extensions-vm/scratch3_blocklang/interpreter.js`：符合 Block_lang 規範之 JS 解析器與執行器（支援以 `block` 結尾的複合語句、函式定義、多語言標籤與共用狀態）。
- [NEW] `extensions-vm/scratch3_blocklang/index.js`：封裝為 Scratch 3.0 擴充類別。
- [MODIFY] `extensions-vm/extension-manager.js`：在 `builtinExtensions` 註冊 `blocklang`。
- [MODIFY] `scripts/setup-extensions.js`：設定自動同步至 `node_modules/scratch-vm`。

### 擴充 GUI 卡片與素材
- [NEW] `src/lib/libraries/extensions/blocklang/blocklang.svg`：官方風格 Banner。
- [NEW] `src/lib/libraries/extensions/blocklang/blocklang-small.svg`：積木目錄小圖標。
- [MODIFY] `src/lib/libraries/extensions/index.jsx`：在擴充功能庫註冊 `Block Language (Block-Lang)`，作者標註 `O-O1112`，連結指向 `https://o-o1112.github.io/Block_lang/`。

### 文件與部署
- 更新 `README.md`。
- 執行 `npm run build` 並部署至 `gh-pages`。

---

## Verification Plan

### 自動化驗證
- 執行 `npm run build` 確認 Webpack 構建無任何語法錯誤。

### 功能測試案例
1. **迴圈與條件求和測試**：
   ```block
   total = 0
   for x in [1, 2, 3, 4]:
       if x == 2:
           continue
       block
       total = total + x
   block
   print("Total: " + str(total))
   ```
   驗證 `stdout` 輸出為 `Total: 8`。
2. **函式定義與調用測試**：
   ```block
   func greet(name):
       return "Hello " + name
   block
   print(greet("Scratch"))
   ```
   驗證 `stdout` 輸出為 `Hello Scratch`。
3. **表達式求值測試**：
   計算 `sum([10, 20, 30]) + 5`，驗證 Reporter 積木回傳 `65`。
4. **多語言 `<js>` 標籤測試**：
   ```block
   <js>
   state.msg = "Polyglot Bridge";
   </js>
   ```
   驗證 `取得 Block 變數 msg` 成功讀出 `"Polyglot Bridge"`。
