# 手機全程橫向流程 · v0.85.63

## 目的與範圍

HERO FRONTIER 的首頁、大廳、選角、建造與戰場都以寬畫面設計。本版統一手機入口為橫向容器，不將既有畫面強行重做為直向；不改英雄、塔、士兵、怪物、經濟、地圖或任何存檔欄位。

## 玩家操作

手機請橫向握持遊玩。從瀏覽器直向開啟時，`td-mobile.html` 會承接同一份橫向遊戲畫面；將手機橫放後，即可得到既有完整比例的首頁、選單與戰場。加入主畫面後，PWA 會以橫向啟動。

右下角「安裝到主畫面」仍只開啟 Safari／瀏覽器的安裝說明，不會自動遮住遊戲內容。

## 架構與 API

`td.html` 的觸控入口會導向 `td-mobile.html`；容器在直向 viewport 交換 iframe 寬高並旋轉同源 `td.html`，在橫向 viewport 直接填滿。`mobileShell=1` 和 `preview=iphone15promax` 僅用於手機／模擬器版型判斷，不寫入 localStorage。`td.webmanifest` 使用 `orientation: "landscape"`。沒有 HTTP API、後端、資料庫、權限或存檔 schema 變更。

流程：

`手機觸控入口 → td-mobile.html 橫向容器 → td.html（同一遊戲與存檔）`

`iPhone 模擬器直向入口 → 同一 td-mobile.html → 同一橫向畫面`

## 部署、備份與回復

需要 Node.js 18 以上，沒有新增套件、資料庫遷移或環境變數。版本為 `0.85.63`，Service Worker 快取鍵為 `sky-strike-v0.85.63`。部署時同步發布 `td-mobile.html`、`td.webmanifest`、`td-lobby.css`、`td-combat.css`、手機模擬器、版本標記、`sw.js`、測試與本文件。

執行 `npm run check`、`npm test` 後推送 `main`，等待 GitHub Pages 的測試、部署與公開資源驗證完成。更新不讀寫玩家進度；請關閉舊分頁再從版本化更新頁重新開啟，不需清除網站資料。若需回復，先依備份還原手冊匯出資料，再回復相同批次的程式和快取版本。

## QA 與 FAQ

1. 430×932 直向裝置：正式手機入口含 `rotate(90deg)`，載入的是同一份寬畫面遊戲。
2. 932×430 橫向裝置：首頁、選單與戰場完整填滿，不出現另一套直向首頁。
3. PWA manifest 的 `orientation` 為 `landscape`；安裝提示只能由小按鈕手動開啟。
4. 模擬器的直向入口與真機使用同一個容器，預覽首頁採橫向手機資訊階層。
5. 執行 `npm run check`、`npm test`、`npm run verify:pages`。

**為什麼不改成直向首頁？** 首頁、選單、建造與戰場已是同一套橫向設計；維持它可避免重做所有既有畫面並保留完整操作空間。
