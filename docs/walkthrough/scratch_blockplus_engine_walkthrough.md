# Block Plus 多語言執行引擎整合完成說明

## 概述
我們已成功將使用者的 **Block Plus 多語言編程語言與執行引擎**（`O-O1112/Block_lang`、`O-O1112/Block`、`O-O1112/Block-Web-Runtime`）完整植入 Scratch GUI / Scratch VM 中，使 Scratch 專案能直接撰寫與執行原生 Block 語法及多語言混合腳本，並已正式部署上線至 GitHub Pages。

---

## 核心引擎功能與特性

### 1. 原生 Block 控制流語法（Native Block）
完全遵循使用者 Block 語言規範，複合語句均以獨立 `block` 結尾：
```block
func calculate(x, y):
    total = x + y
    if total > 50:
        return total * 2
    else:
        return total
    block
block

result = calculate(30, 25)
print("計算結果:", result)
```

### 2. 跨語言狀態管線（Polyglot Pipeline）
在同一個腳本內支援以標籤混合切換語言，所有語言**共享同一個全域狀態匯流排**（`state` / `globalState`）：
- **`<js> ... </js>`**：原生執行 JavaScript，可直接讀寫 `state`、呼叫 `print()` 或操作 `scratch` 物件。
- **`<py> ... </py>`**：支援 Python 語法（變數賦值、迴圈、列表運算），並支援動態 WebAssembly Pyodide。
- **`<sql> ... </sql>`**：內建記憶體關聯式資料庫引擎，支援 `CREATE TABLE`、`INSERT INTO`、`SELECT` 查詢，結果自動存入 `state['sql_result']`。
- **`<json> ... </json>`**：支援 `{{變數}}` 模板插值與 JSON 物件動態寫入狀態。
- **`<html> ... </html>`**：支援 `{{變數}}` HTML 模板渲染與即時預覽。
- **`<del> ... </del>`**：指定刪除狀態變數，釋放記憶體。

### 3. Scratch 舞台精靈雙向橋接（Scratch Bridge）
在 Block 與 `<js>` 腳本內部，可以直接使用 `scratch` API 操控 Scratch 舞台：
- `scratch.say("你好！")`：使當前選中的精靈說話。
- `scratch.setPos(x, y)`、`scratch.setX(x)`、`scratch.setY(y)`：移動精靈座標。
- `scratch.x`、`scratch.y`、`scratch.direction`：即時讀取精靈屬性。
- `scratch.broadcast("事件名稱")`：觸發 Scratch 廣播。
- `scratch.getVar("變數名")`、`scratch.setVar("變數名", 值)`：讀寫 Scratch 專案本體變數。

---

## Scratch 積木清單

| 積木外觀 | 類型 | 說明 |
| :--- | :--- | :--- |
| `執行 Block Plus 程式碼 [CODE]` | Command | 執行完整 Block Plus 腳本（可含多語言標籤） |
| `計算 Block Plus 表達式 [EXPR]` | Reporter | 同步計算表達式並回傳結果（0ms 延遲） |
| `執行 Block Plus 並回傳輸出 [CODE]` | Reporter | 執行腳本並回傳所有 print / log 輸出結果 |
| `執行 <[LANG]> 區塊程式碼 [CODE]` | Command | 下拉選單選擇 `py` / `js` / `block` / `sql` / `json` / `html` / `del` 直接執行 |
| `Block 全域變數 [KEY]` | Reporter | 讀取 Block 引擎狀態變數 |
| `設 Block 全域變數 [KEY] 為 [VALUE]` | Command | 寫入 Block 引擎狀態變數 |
| `刪除 Block 全域變數 [KEY]` | Command | 刪除指定變數 |
| `Block 所有全域變數 (JSON)` | Reporter | 以 JSON 字串格式匯出所有狀態 |
| `Block 控制台輸出紀錄` | Reporter | 讀取歷史所有輸出紀錄字串 |
| `清空 Block 控制台紀錄` | Command | 清空歷史輸出紀錄 |
| `重設 Block 引擎狀態` | Command | 重設引擎所有變數與記憶體資料表 |

---

## 異動檔案彙整

1. `extensions-vm/scratch3_blocklang/block-engine.js`：核心 Block Plus 直譯與多語言引擎。
2. `extensions-vm/scratch3_blocklang/index.js`：Scratch 3 VM 擴充積木介面與精靈橋接。
3. `extensions-vm/extension-manager.js`：註冊 `blocklang` 擴充。
4. `scripts/setup-extensions.js`：自動複製擴充模組至 `node_modules/scratch-vm`。
5. `src/lib/libraries/extensions/blocklang/blocklang.svg`：官方純黑幾何風格大卡片圖示。
6. `src/lib/libraries/extensions/blocklang/blocklang-small.svg`：官方幾何 "B" 標誌選單小圖示。
7. `src/lib/libraries/extensions/index.jsx`：擴充庫選單卡片註冊。
8. `README.md`：同步更新功能清單。
9. `docs/implementation_plan/scratch_blockplus_engine.md`：架構實作計畫雙軌存檔。
10. `docs/walkthrough/scratch_blockplus_engine_walkthrough.md`：完成變更紀錄雙軌存檔。

---

## 驗證結果

1. **引擎單元測試**：
   - 驗證 Native Block 控制流（`func ... block`、`for ... block`）：成功。
   - 驗證跨語言管線（`<js>` 寫入狀態 $\to$ `<py>` 運算加總 $\to$ `<sql>` 建表與查詢 $\to$ `<json>` 插值 $\to$ `<html>` 渲染）：全部成功且狀態順暢傳遞。
   - 驗證同步求值：即時回傳數值。
2. **Webpack 打包建置**：
   - `npm run build` 成功編譯，耗時 21 秒，無任何警告與錯誤。
3. **GitHub Pages 部署**：
   - 成功發布至 `gh-pages` 分支。
   - 正式線上網址：[https://o-o1112.github.io/scratch-gui/](https://o-o1112.github.io/scratch-gui/)
