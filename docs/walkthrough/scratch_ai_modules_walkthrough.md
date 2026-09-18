# Scratch GUI 擴充模組更新與深色模式成果

已完成加入 **全域深色模式 (Dark Mode)**，解決長時間觀看白色背景造成的眼睛疲勞，並支援一鍵即時切換與持久化儲存。

---

## 新增深色模式特色

1. **護眼深色外觀**：
   - 積木工作區 (`scratch-blocks`)：自動切換至 `#121212` 深黑背景與高對比深色積木配色。
   - 導覽列與選單：改為深灰 `#1c1c1f` 配色與暗色下拉選單。
   - 程式碼/造型/音效標籤頁：深色分頁外觀與高亮藍色選取指示條。
   - 舞台與角色資訊欄：深色面板 (`#202024`) 與暗色輸入框。
   - 擴充功能庫與模態框：全域深色卡片與篩選列。
2. **雙重切換途徑**：
   - **快速切換**：導覽列左側設定圖示旁提供 **☀️ / 🌙 一鍵切換按鈕**。
   - **設定選單**：點擊「設定 (Settings)」->「顏色模式 (Color Mode)」-> 選擇「深色模式 (Dark)」。
3. **偏好設定記憶**：
   - 透過 Cookie 自動記錄使用者選擇，重整頁面維持深色狀態。
   - 支援偵測系統級 `prefers-color-scheme: dark` 自動套用。

---

## 擴充功能庫保留清單（共 5 款）

1. **Handpose2Scratch**（手部辨識）：即時追蹤手部關節與手勢。
2. **Facemesh2Scratch**（臉部辨識）：即時追蹤 468 個面部特徵點。
3. **ML2Scratch**（機器學習辨識）：自訂圖像分類與即時訓練辨識。
4. **音樂 (Music)**：官方樂器演奏與節奏積木。
5. **畫筆 (Pen)**：官方角色繪圖與印章積木。

---

## 修改項目清單

- [x] 建立深色模式主題圖標：[`src/lib/themes/dark/icon.svg`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/themes/dark/icon.svg)
- [x] 主題註冊啟用：[`src/lib/themes/index.js`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/themes/index.js)、[`themePersistance.js`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/themes/themePersistance.js)、[`system-preferences-hoc.jsx`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/lib/system-preferences-hoc.jsx)
- [x] 選單啟用深色選項：[`theme-menu.jsx`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/components/menu-bar/theme-menu.jsx)
- [x] 導覽列一鍵切換鈕：[`menu-bar.jsx`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/components/menu-bar/menu-bar.jsx)
- [x] 全域深色樣式表：[`src/css/dark-theme.css`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/css/dark-theme.css) 與 [`gui.jsx`](file:///C:/Users/liguo/.gemini/antigravity/scratch/scratch-gui/src/components/gui/gui.jsx) `data-theme` 綁定
- [x] Webpack 5 重新建置驗證通過（`webpack 5.107.2 compiled successfully`）。

---

## 啟動與使用方式

```bash
cd C:\Users\liguo\.gemini\antigravity\scratch\scratch-gui
npm start
```

1. 在瀏覽器開啟 `http://localhost:8601/`。
2. 點擊頂端導覽列上的 **🌙 圖標**，或至「設定」->「顏色模式」選擇「Dark」，即可立刻切換至深色模式。
