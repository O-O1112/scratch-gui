# Scratch GUI 功能擴充與 GitHub Pages 上線實施計畫

本計畫旨在為已整合 AI 模組與深色模式的 Scratch GUI 新增實用輔助小功能，並建立遠端 GitHub 儲存庫發布至 GitHub Pages，實現一鍵公開上線。

---

## 使用者審閱項目 (User Review Required)

> [!IMPORTANT]
> **GitHub 發布帳號與儲存庫確認**
> - 本機已檢測到 GitHub 登入憑證：帳號 **`O-O1112`** (`liguoguo103@gmail.com`)。
> - 預計建立的 GitHub 儲存庫名稱：`scratch-gui`（公開儲存庫）。
> - 預計 GitHub Pages 上線網址：`https://o-o1112.github.io/scratch-gui/`。

---

## 規劃新增之小功能 (Proposed Features)

### 1. 「🤖 AI 範例專案」快速載入選單 (AI Sample Projects Loader)
- **問題**：使用者進入編輯器後，需自行摸索 AI 積木接法或手動上傳 `.sb3` 範例檔案。
- **方案**：
  - 將各大 AI 模組內附的 `.sb3` 範例整合至 `static/samples/`：
    1. 🖐️ **手部辨識追蹤** (`handpose.sb3`)
    2. 👤 **臉部特徵網格** (`facemesh.sb3`)
    3. 🎯 **臉部特定部位高亮** (`highlight.sb3`)
    4. 🏓 **ML 視訊體感桌球遊戲** (`ml_pong.sb3`)
    5. ✌️ **ML 手勢與圖片分類** (`1or2.sb3`)
  - 於導覽列（Menu Bar）新增「**AI 範例 (AI Samples)**」選單，點選即可直接一鍵透過 `vm.loadProject()` 載入至編輯器，直接點綠旗即可體驗！

### 2. 即時效能 FPS 幀率監控器 (Real-time FPS Monitor)
- **問題**：AI 視覺辨識（攝影機串流 + 模型推論）極度消耗算力，使用者難以掌握當前流暢度。
- **方案**：
  - 於舞台控制列（綠旗與紅鈕旁）新增精緻的動態 **FPS 徽章**。
  - 即時計算目前畫格渲染幀率（綠色 ≥ 50 FPS，黃色 25~49 FPS，橙色 < 25 FPS），支援深色模式調色。

---

## GitHub Pages 上線部署流程 (GitHub Pages Deployment)

1. **靜態資產準備**：
   - 複製 sample projects 到 `static/samples/`。
   - 確保 Webpack 輸出目錄含 `build/.nojekyll`（防止 Jekyll 忽略下劃線命名或特定資產）。
2. **建立 GitHub 遠端儲存庫**：
   - 使用 GitHub API 在帳號 `O-O1112` 下建立公開倉庫 `scratch-gui`。
   - 設定本機 git remote 為 `https://github.com/O-O1112/scratch-gui.git`。
3. **推送原始代碼與分支部署**：
   - 提交並推送完整專案源碼至 `main` 分支。
   - 執行 `npm run build` 生成產品包至 `build/`。
   - 將 `build/` 內容發布至 `gh-pages` 分支。
4. **啟用 GitHub Pages**：
   - 透過 API 設定 Pages 來源為 `gh-pages` 分支根目錄。

---

## 驗證計畫 (Verification Plan)

1. **本地建置與功能驗證**：
   - 執行 `npm run build` 確認編譯成功無報錯。
   - 測試 AI 範例選單，點選後確認專案與積木正確載入至畫面上。
   - 確認 FPS 計數器即時運算跳動且深淺色樣式適配。
2. **遠端與 Pages 驗證**：
   - 確認 GitHub 儲存庫與 `gh-pages` 分支建立成功。
   - 透過瀏覽器存取 `https://o-o1112.github.io/scratch-gui/`，確認頁面正常運作、AI 模組與範例檔正常下載執行。
