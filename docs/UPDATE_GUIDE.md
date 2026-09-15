# 版本更新手冊

## 0.60.0 升級方式

拉取完整版本後執行 `npm run check` 與 `npm test`，再重新載入 `td.html?v=0.60.0`。沒有存檔遷移或新依賴；離線版確認快取更新為 `sky-strike-v0.60.0`。只更新 CSS 而不更新 Service Worker 可能持續看到舊斷點。更新後請在瀏覽器 100%、150%、200% 各檢查一次頂部控制列。

## 0.59.0 升級方式

拉取完整版本後執行 `npm run check` 與 `npm test`，再重新載入 `td.html?v=0.59.0`。沒有存檔遷移；離線版確認快取更新為 `sky-strike-v0.59.0`。請勿只更新 CSS，七個新選角 PNG 與 Hero／Faction／Difficulty metadata 必須一起更新。

## 0.57.0 升級方式

拉取完整 0.57.0 版本後執行 `npm run check` 與 `npm test`，再重新載入 `td.html?v=0.57.0`。本版沒有存檔遷移；舊戰局不保證熱更新，請開始新局。確認離線快取已改為 `sky-strike-v0.57.0`。升級後士兵永久固定，舊版準備期重新部署與 M／A／H／S 操作不再提供。

## 0.55.0 升級方式（2026-09-15，本機）

更新完整專案並執行 `npm test`、`npm run check`。沒有舊戰局存檔遷移；重新載入 `td.html` 後啟動新局，離線版確認快取已更新至 `sky-strike-v0.55.0`。不應只更新 UI 而保留舊 `CombatUnit`／`ArmorySystem`。本輪未推送 GitHub，除非使用者另行要求。

## 0.54.3 商城與技能分區（2026-09-14，本機）

更新後重新載入 `td.html`；無存檔轉換。離線版使用 `sky-strike-v0.54.3` 快取。部署時同步 `td.html`、`td.css`、`td-combat.css`、`TDGame.js`、`package.json`、`sw.js`；僅在使用者明確要求時推送 GitHub。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

更新後重新載入 `td.html`；無存檔轉換。離線版以 `sky-strike-v0.54.2` 取代舊快取，須同步 `ArtSystem.js`、`package.json`、`sw.js`；僅在使用者明確要求時推送 GitHub。

## 0.54.1 英雄小卡（2026-09-14，本機）

本機更新後重新載入 td.html；無存檔轉換。離線安裝版需讓 sw.js 的 `sky-strike-v0.54.1` 取代舊快取，並同步 td.html、td.css、td-combat.css；只在使用者明確要求時推送 GitHub。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

本機重新載入 td.html 即可看到 PC／橫向右上縮圖；無存檔轉換。若日後發布，務必同步新腳本與 sw.js 快取版號，避免舊離線頁面引用不到新檔；只在使用者明確要求時推送 GitHub。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

本機版重新載入 td.html 即可見新版頂部資源列；沒有存檔轉換。若未來發布，請同步更新四個網頁／樣式檔與 sw.js 快取，僅於使用者明確要求時推送 GitHub。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

v0.52.0 是本機更新：重新載入 td.html 查看；沒有資料遷移或玩家存檔重置。版本、sw 與新版 PNG 需一起發布，僅在使用者要求時推送 GitHub。驗證細節見 MAP_DEPLOYMENT_V052.md。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

更新後重載td.html可看到「⌖ 鏡頭」折疊入口和新版技能圖示。保留使用者未提交成果；這次不自動GitHub發布。只換CSS而不更新HTML／ArtSystem會造成錯配。

## 0.50.0 大地圖原型（2026-09-14，本機）

0.50.0是本機大地圖原型；尚未commit／推送。更新後重新載入td.html，開局戰場選單有兩張地圖。若保留舊頁籤，它仍是上一輪程式，請重載。不要將dirty tree整體reset，裡面有多輪未提交成果。


## 最新：0.49.0 鏡頭原型

0.49.0更新後執行npm test／npm run check。驗证先拖鏡頭、放大、再建塔及選取；全圖留白不下令；取消拖曳、回英雄、橫直切換後仍能操作。新Camera與main語法檢查已加入check。

## 0.48.0 更新檢查

更新 HTML、main.js、新增的 td-combat.css 與 sw.js 為同一版本。執行 `npm test`、`npm run check` 和 `node --check src/td/main.js`；首次重載檢查上緣 HUD、左下英雄、右下技能、Drawer 與直式回退。此版未推送 GitHub。

## Combat Experience V2 本機續作注意（2026-09-14）

目前工作目錄仍有多批未提交修改，不能對整個目錄 reset／discard。P2 UX Revision 改為合法位置單擊即建造；發布前需將 `td.html`、`td.css`、`src/td/TDGame.js`、`Hero.js`、`config.js`、`main.js`、測試及文件一同核對，並與既有 P0–P2 檔案一起處理，不能只更新單一 UI 檔。先跑 `npm test`（目前 210 項）、`npm run check`，再以 PC、真手機橫式與 Edge 驗證。此續作尚未發布 GitHub，P5 未開始；[進度紀錄](COMBAT_EXPERIENCE_V2_PROGRESS.md)為交接依據。

## 更新到 v0.44.1

先備份整個專案與未提交修改，再一起更新 `ArtSystem.js`、`sw.js`、`package.json`、測試和文件。無新套件、無存檔遷移；執行 `npm run check`、`npm test`。本機開 `td.html`，選巡林者買弓、觀察待機／移動／攻擊和左右轉向，裝備獅心王弓時確認沒有雙弓。公開 GitHub Pages 仍為 v0.44.0；只有使用者明確要求時才發布 v0.44.1。

## 更新到 v0.44.0

先備份專案與未提交修改。整批更新 HTML、CSS、`TDGame.js`、`main.js`、`sw.js` 和文件，不要只換介面檔；無新套件與資料遷移。執行 `npm run check`、`npm test` 後關閉舊分頁再開。依序檢查開局三步驟、PC 底部建造 Drawer、手機原建造面板、遊戲選單二次確認與再挑戰沿用設定。若想回 v0.43.0，請在獨立目錄檢出該版本，不要清空目前工作樹。v0.44.0 已在明確要求後發布至 GitHub Pages。

## 更新到 v0.43.0

先備份專案和未提交修改；更新整份靜態檔案，不要漏掉恢復直接載圖的 `ArtSystem.js`、新 `TargetSelector.js`、`td.html` 引用或 `sw.js` 離線清單。執行 `npm run check` 與 `npm test`；關閉舊分頁再開，確認三英雄與地圖完整顯示、士兵可切換五種索敵。無存檔遷移；GitHub Pages 推送後需等待部署完成，再重開舊分頁。

## 更新到 v0.41.0

從 v0.40.1 更新全部程式與文件，新增 `src/td/systems/HeroUltimateSystem.js`，不要漏掉 `td.html` 的腳本引用與 `sw.js` 清單。執行 `npm run check`、`npm test`；關閉舊遊戲分頁再開。選角時等待圖片就緒，進場以 F 測大絕與 R 商店。沒有存檔遷移，線上版需另外依部署手冊發布。

## 更新到 v0.40.1

在 v0.40.0 基礎上加入 `hero-hunter-actions-unarmed-v4.png`，替換 `ArtSystem.js` 與 `sw.js`，並更新測試／文件；其他角色與數值不變。執行 `npm run check`、`npm test` 後關閉舊分頁重開；購買王國弓驗證透明背景。本版無存檔遷移，回退見 `BACKUP_RESTORE.md`。

## 更新到 v0.40.0

完整更新程式、HTML、CSS、`sw.js` 與八張新 PNG；不可只換圖片或只加入建造按鈕。此版不需資料轉換，既有本機偏好可沿用。先備份工作樹，執行 `npm run check`、`npm test`，再於三族各部署一名新兵並檢查新敵軍。若仍看到舊建造列，關閉分頁並重開以刷新 Service Worker；還原見 `BACKUP_RESTORE.md`。

## 更新到 v0.39.0

完整替換五張新增動作／無武器圖集及裝備、投射物、召喚、陣營、UI、快取、測試與文件。不可只複製圖片，否則 form 與商店互斥不會生效；不可漏掉 `main.js`／`td.css`，否則手機面板無法收合。更新後執行 `npm run check` 與 `npm test`，應有 153 項通過。本版沒有戰役資料遷移。

## v0.38.0（2026-09-12）

完整替換本版程式、td.html、td.css、package.json 與 sw.js，保留 assets 全部素材。本版無存檔遷移。更新後驗證選角三圖、四種難度卡與開始遊戲功能。回退方式見 BACKUP_RESTORE.md。

## 更新到 v0.36.0

完整替換六張新增動作圖及守軍設定、陣營、美術、實體、HTML、CSS、Service Worker、測試與文件。不可只複製圖片，否則新兵不會進入陣營清單；不可只增加按鈕，否則 `BuildSystem` 會拒絕未知類型。更新後執行 `npm run check` 與 `npm test`，應有 145 項通過。本版沒有資料遷移。

## 更新到 v0.35.0

完整替換 `assets/td` 的四張 v2 新素材及塔防的設定、美術、流派、技能、分支、HTML、CSS、Service Worker、測試與文件。不可只複製 PNG，否則新塔不會進入建造清單；也不可只改 `FactionSystem`，否則建造時會找不到設定。更新後 `npm run check` 與 `npm test` 應有 142 項通過。

## 更新到 v0.34.0

請完整替換塔防波表、怪物、英雄、Boss 戰鬥、主流程、設定與 Service Worker 檔案，不可只把 `totalWaves` 改成 30。執行 `npm run check` 與 `npm test` 應有 140 項通過。此版無存檔遷移；更新會重開目前戰役。

## 更新到 v0.33.0

完整替換 `CombatUnit.js`、`BuildSystem.js`、`TDDifficultySystem.js`、`BattleReportSystem.js`、`TDGame.js`、`td.html` 與 `sw.js`，再執行 `npm run check`、`npm test`。本版沒有存檔遷移；進行中的戰役會重開。更新後確認標準難度顯示「守軍 10 秒歸隊」。

> 更新至 v0.30.0 後請執行 `npm run check` 與 `npm test`，再用 Chrome／Edge 重新載入 `td.html`。若 Service Worker 仍提供舊介面，移除舊站台資料後再開啟；遊戲沒有資料庫 migration。

## 一般玩家更新

1. 備份目前整個遊戲資料夾。
2. 取得新版 ZIP，解壓到「新的資料夾」，不要直接覆蓋舊版。
3. 查看 `CHANGELOG.md` 確認版本與變更。
4. 雙擊新版 `index.html` 完成煙霧測試。
5. 確認可玩後再刪除舊資料夾。沒有伺服器進度需要移轉；外觀、難度與最高紀錄由瀏覽器保存。

## Git 維護者更新

先確認工作區沒有未提交的重要修改，再取得新版提交並執行 `npm run check`、`npm test`。`v0.16.0` 是準備／預告／清場結算的塔防波次基線；`v0.15.0` 是可切換跨裝置介面基線，`v0.14.0` 是 A* 戰術指令基線。避免用破壞未提交內容的強制重設命令。

## v0.17.0 英雄與指揮介面

更新 v0.17.0 後重新載入頁面以載入新版 UI 與英雄圖集。新增控制入口為頭像／F1；所有建造功能位於招募／建造頁，升級與回收位於選取與命令頁。更新會重開局內狀態，介面偏好保持。

## v0.18.0 英雄技能與種族塔

更新完整 v0.18.0 檔案後重載頁面，局內戰局會重新開始。看到六種建築與英雄三技能／商店入口即代表新版介面載入。不要只替換 td.html，以免缺少新模組。

## v0.19.0 英雄流派與傭兵館

用完整v0.19.0檔案更新後重載（會重開戰局），開場看到人族／精靈／暗影三英雄代表更新成功。若技能仍相同，確認HeroRoster.js與sw.js同步更新，再重新載入。

## v0.20.0 敵軍動作第一階段

完整更新後重載頁面，首波敵軍應有交替步伐。更新会重開當局；若仍單圖，檢查三張PNG是否完整，重新載入取得v0.20.0快取。

## v0.21.0 RTS 指揮介面

完整更新 `td.html`、`td.css`、`src/td/main.js`、`src/td/TDGame.js` 與 `sw.js` 後重新載入。看到頂部 Wave／速度 HUD 和右側英雄狀態即代表新版生效；HTTP 版若仍為舊版，關閉舊分頁後重新開啟以讓 v0.21.0 快取接管。局內進度會重開，介面模式偏好保留。

## v0.22.0 戰鬥回饋

必須完整更新新增模組與所有相依檔，不能只替換 HTML。重新載入後開第一波，看到傷害／Gold 跳字與雙層血條代表成功；舊局會重開，沒有資料遷移。

## v0.23.0 戰鬥生命週期

更新後執行 `npm run check` 與 `npm test`，確認至少 99 項測試通過。瀏覽器依序驗證選角、部署守軍、選取資訊 HP、三倍速戰鬥與手機介面；Boss 波需確認增援、狂暴及紅圈踐踏。第一次載入若仍是舊行為，重新整理讓新版快取接管。

## v0.24.0 黃金 15 波

完整覆蓋新版檔案後執行 `npm run check` 與 `npm test`，應有 105 項測試通過。重新整理兩次，先選災厄遠征，確認城門為 15、波次列顯示難度且整備明顯縮短；再重新開始驗證標準戰役回到 20。舊局會重開，沒有存檔遷移。

## v0.31.0 戰地軍械

完整更新程式與 `sw.js` 後執行 `npm run check`、`npm test`。重新載入並選角，確認軍械庫入口存在；跑完第 3 波後應出現流派可用裝備。此版軍械不寫入永久儲存，更新或回退皆無資料遷移，但進行中的戰局會重開。

## v0.32.0 唯一軍械與守軍編成

完整更新 `ArmorySystem.js`、`BuildSystem.js`、`TDGame.js`、`td.html`、`td.css` 與 `sw.js` 後執行 `npm run check`、`npm test`。重新載入後，軍械庫上方應出現武器／護甲／戰器三欄。此版把同一件軍械改為單一持有人；更新會重開目前戰局，但沒有永久資料遷移。

## v0.32.1 手機安裝圖示

同步更新兩份 manifest、兩個 HTML、Service Worker 及 `assets/icons/app-icon-*.png`。若手機仍顯示舊圖示，先從主畫面移除舊捷徑，重新開啟 HTTPS 的 `td.html` 再加入；瀏覽器與作業系統可能暫存既有圖示。

## v0.32.2 GitHub Pages

同步更新 `.github/workflows/pages.yml`、版本號與 Service Worker。此版只修正新倉庫首次啟用 Pages 的流程，不遷移或重設任何遊戲資料。
