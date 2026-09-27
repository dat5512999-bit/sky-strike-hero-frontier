# 手機首頁與戰場方向流程 · v0.85.61（歷史記錄）

> 此直向首頁方案已由 v0.85.63 取代。現行手機入口統一使用橫向容器，請依 [手機全程橫向流程](MOBILE_LANDSCAPE_FLOW_V08563.md) 操作與部署。

## 目標

手機開啟遊戲時，首頁、劇情、商城與圖鑑必須直向正向顯示；戰鬥開始後若手機仍為直向，才提示玩家橫放裝置。此修正不變更戰鬥數值、玩家進度、裝備、購買紀錄或存檔格式。

## 使用者流程

1. 從 `td-mobile.html` 開啟或安裝主畫面圖示後，首頁以直向顯示。
2. 點選「開始遠征」後，手機可嘗試由瀏覽器切換橫向；未切換時顯示「請將手機轉為橫向」，不旋轉首頁。
3. 右下角「安裝到主畫面」是可選按鈕。Safari 點它後，依提示按分享按鈕並選「加入主畫面」；提示不會自動遮住首頁。
4. `mobile-simulator.html` 的直向模式與正式入口共用 `td-mobile.html`；模擬器以 iPhone 15 Pro Max 的 430×932 視窗強制套用手機首頁版型。橫向模式僅供檢查戰場。

## 架構與 API

```text
td.html（觸控手機）→ td-mobile.html → td.html?mobileShell=1
                                     ├─ 主大廳：直向手機版型
                                     └─ 戰場 + 直向：橫放提示 → 真實橫向戰場
mobile-simulator.html → 同一 mobileShell + preview=iphone15promax
```

`mobileShell=1` 僅是內嵌入口旗標，會強制手機版型且不讀取桌機版型偏好；`preview=iphone15promax` 另外加上模擬器專用樣式旗標，補足桌機瀏覽器的滑鼠媒體查詢差異。兩者不是伺服器 API，也不寫入 localStorage。PWA manifest 使用 `orientation: "any"`，使首頁可直向開啟。

## 安裝、部署與回復

需要 Node.js 18 以上，無新增套件、後端、資料庫或權限。部署要同步 `td-mobile.html`、`td.webmanifest`、`td-lobby.css`、`td-combat.css`、`src/td/main.js`、兩支手機腳本、`sw.js` 和版本標記。快取鍵為 `sky-strike-v0.85.61`。

依序執行：`npm run check`、`npm test`、推送 `main`、等待 GitHub Pages 的測試／部署／線上檔案校驗完成。玩家使用 `update.html?release=0.85.61` 更新，不應清除網站資料；既有開啟中的分頁需重新開啟。

若需回復，以新的遞增版本和快取鍵建立回復提交；不可只回退 manifest 或 service worker。更新前可從遊戲設定匯出玩家備份；本修正本身不會改寫任何玩家資料。

## QA 與 FAQ

- 自動驗收：手機殼不得含 `rotate(90deg)`；PWA 為 `any`；直向 battle 才顯示方向提示；模擬器和手機都使用強制手機版型；安裝入口可手動展開。
- 人工驗收：iPhone Safari 直向開啟首頁，底部導覽正常、內容不橫轉、安裝按鈕不遮住卡片；開始遠征時才出現橫放提示；橫放後提示消失且戰場可操作。
- 模擬器是 UI 回歸工具，不代表 Safari 網址列、多指手勢、手機 GPU 或實際 FPS。真機截圖仍是最後視覺驗收依據。
- 若看到舊版：開啟版本化更新頁，完成後關閉舊分頁重開；不要清除網站資料，避免刪除進度。
