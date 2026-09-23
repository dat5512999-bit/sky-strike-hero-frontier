# v0.85.10 手機舊畫面更新修復

## 問題與驗證

手機開啟正確的 `td-mobile.html` 仍可能停留在舊選角頁。正式站的 `td.html`、`sw.js` 與大廳程式已是新版，乾淨瀏覽器也能顯示 0.85.9 主大廳；GitHub Pages 回應 `Cache-Control: max-age=600`。原流程在圖片全部載入後才註冊 Service Worker，安裝預快取又會使用 HTTP 快取，且不會重新導覽已開啟的手機 iframe。這些更新缺口可能讓舊頁面和舊檔案繼續留在手機，並非跳過多個版號造成存檔損壞。

## 使用者操作與 FAQ

在原本遊玩的瀏覽器開啟 `update.html`，保持連線，等待更新完成後自動進入大廳。畫面出現重試按鈕時，先確認網路再重試；聊天軟體內建瀏覽器可改用 Chrome 或 Safari。新版大廳「設定」也提供「更新並重新開啟」。請先結束目前戰鬥再使用此入口；更新不清除 localStorage、IndexedDB、玩家進度、購買紀錄或裝備。各瀏覽器的本機存檔仍分開保存。

正常入口仍是 `td.html`（手機自動轉至 `td-mobile.html`）；更新完成後可繼續使用原書籤。沒有新增安裝依賴、帳號、付款或玩家設定。

## 系統架構與內部 API

```text
update.html → update-client.refresh → Service Worker register/update（updateViaCache:none）
  → 安裝殼層檔案（Request cache:reload）→ activated → GAME_VERSION 訊息確認
  → td.html?release=0.85.10 → 手機容器／新版大廳
```

- `src/td/update-client.js` 是獨立更新入口，無須先初始化遊戲。`refresh(serviceWorker, expectedVersion, Channel)` 完成更新並驗證實際啟用版號；`activated(worker)` 等待啟用並拒絕失敗的 worker。整體最長等待 60 秒，版本訊息最長 5 秒。
- Worker 接收 `{type:'GAME_VERSION'}`，使用附帶的 MessagePort 回覆 `sky-strike-v0.85.10`；不傳輸玩家資料。
- 主入口和手機殼立即註冊更新，不再等待全部圖片下載。既有戰鬥不會因背景 worker 切換而強制重載。
- HTML／JS／CSS 重新向網路確認內容，離線時只回退到當前版本快取；圖片也只查當前版本，避免舊分頁重建的舊快取混入。
- 不新增資料庫或 HTTP API；版本顯示、戰報與 SW 同步為 0.85.10。

## 安裝、管理與部署

沿用 `npm run serve:test` 本機啟動方式；開啟 localhost 下的 `update.html` 測試。正式更新頁需 HTTPS（GitHub Pages 已提供）。必須一起發布更新頁、更新程式、main／mobile-pwa、FrontierApp、版本檔案與 sw.js；Pages 工作流程會自動包含新的 HTML 和 `src/`。

部署後確認 `/update.html` 可開啟、更新後大廳顯示 0.85.10、離線快取名稱一致。使用舊版的手機不必清除網站資料，也不應要求使用者刪除存檔來解決程式更新。

## 備份與回復

發布前以遊戲設定匯出玩家備份，程式版本由 Git 保留。要回復上一版，使用 `git revert` 回復本次更新修復提交，再推送 main 重新部署；需一併回復入口、版本顯示與 SW。沒有存檔格式遷移，程式回退不需刪除玩家資料。

## 測試清單

- [x] 更新安裝要求略過舊 HTTP 快取；預快取失敗不啟用。
- [x] HTML／程式重新驗證 HTTP 快取；離線回退與圖片僅使用當前版本。
- [x] 版本訊息、等待啟用、拒絕錯版、離線失敗顯示重試且不重新導覽。
- [x] 更新流程不存取或清除玩家儲存；設定連結從手機 iframe 開啟頂層更新頁。
- [x] 本機瀏覽器更新入口自動開啟 0.85.10 主大廳；手機 iframe 的設定更新連結會返回頂層入口。
- [ ] GitHub Pages 部署及公開手機入口驗證。

`npm run check` 與 `npm test`（595／595）通過；手機原本的快取環境仍需使用者從更新入口確認。
