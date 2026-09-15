# 安裝手冊

## 0.60.0 安裝與啟動

本版沒有新增套件或資料庫。完整更新 `td-combat.css`、`tests/td-edge-ui.test.js`、`package.json` 與 `sw.js`，執行 `npm run check`、`npm test`，再開啟 `http://127.0.0.1:4173/td.html?v=0.60.0`。若瀏覽器縮放後仍使用舊版排版，請強制重新整理並確認離線快取為 `sky-strike-v0.60.0`。

## 0.59.0 安裝與啟動

沒有新增套件、資料庫或網路圖片依賴。請完整保留 `assets/td/opening`、三個選角資料系統、`TDGame.js`、`td.css` 與 `sw.js`，執行 `npm run check`、`npm test`，再以 `npm run serve:test` 啟動並開啟 `http://127.0.0.1:4173/td.html?v=0.59.0`。若仍看到軍團卡裁切英雄臉部，請重新載入並等待 Service Worker 更新為 `sky-strike-v0.59.0`。

## 0.58.0 安裝與啟動

沒有新增第三方依賴或資料庫。完整保留 `td.html`、`td.css`、`td-combat.css`、`src/td`、`assets/td`、`sw.js` 與文件，執行 `npm run check`、`npm test` 後以 `npm run serve:test` 啟動，開啟 `http://127.0.0.1:4173/td.html?v=0.58.0`。若仍看到滿版軍械庫、可穿模怪群或舊建造 Carousel，請重新整理並等待 Service Worker 切換至 `sky-strike-v0.58.0`。

## 0.57.0 安裝與啟動

需求為 Node.js 18 以上，沒有新增套件。保留完整專案，尤其 `assets/td/beginner-valley-v1.png`、`src/td/maps.js`、`BattlefieldCamera.js`、`FrontierTerrain.js`、`MiniMapView.js`、`td-combat.css` 與 `sw.js`。執行 `npm run check`、`npm test`，再以 `npm run serve:test` 啟動並開啟 `http://127.0.0.1:4173/td.html?v=0.57.0`。安裝到手機主畫面後若仍見舊地圖，重新整理並等待 Service Worker 切換至 `sky-strike-v0.57.0`。

## 0.55.0 安裝與啟動（2026-09-15，本機）

無新增依賴。保留完整專案後執行 `npm test`、`npm run check`，再以 `npm run serve:test` 啟動並開啟 `http://127.0.0.1:4173/td.html`。若手機主畫面仍見舊士兵規則，重新載入頁面等待 Service Worker 切換至 `sky-strike-v0.55.0`。

## 0.54.3 商城與技能分區（2026-09-14，本機）

無新依賴；完整保留專案檔案，執行 `npm run serve:test` 後開啟 `http://127.0.0.1:4173/td.html`。離線版若仍顯示舊技能列，重新載入讓 Service Worker 更新 `sky-strike-v0.54.3` 快取。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

沒有新依賴；完整保留專案並開啟 `td.html` 即可。測試可執行 `npm run serve:test`，再開啟 `http://127.0.0.1:4173/td.html`。若離線版仍顯示舊箭頭，重新載入讓新版 Service Worker 更新快取。

## 0.54.1 英雄小卡（2026-09-14，本機）

沒有新依賴。保留完整專案並直接開啟 td.html；測試可執行 `npm run serve:test` 後到 `http://127.0.0.1:4173/td.html`。若畫面仍是舊卡，重新載入頁面並讓更新後的 sw.js 完成離線快取更新。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

無新依賴。保留完整專案，直接開 td.html；開發測試可執行 npm run serve:test 並到 http://127.0.0.1:4173/td.html。缺少 src/td/systems/MiniMapView.js 將使小地圖無法載入。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

安裝方式不變：本機可開 td.html；開發測試可執行 npm run serve:test，瀏覽 http://127.0.0.1:4173/td.html。無新增依賴，需保留 td-combat.css。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

安裝方式不變，可直接開 td.html；測試預覽用 npm run serve:test 後開 http://127.0.0.1:4173/td.html。必須保留 assets/td/frontier-ground-v2.png 及既有 assets 全目錄，無新增套件。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

安裝方式不變；兩張新PNG必須與程式一起保留於assets/td。沒有新執行時套件，npm test與npm run check仍為驗證入口。

## 0.50.0 大地圖原型（2026-09-14，本機）

安裝方式不變：Node18+、npm test、npm run check、npm run serve:test；開啟本機td.html，開局可選大地圖原型或原版。新增地景使用本機既有素材，不需另外下載素材套件。


## 最新：0.49.0 鏡頭原型

0.49.0不增加依賴，沿用npm run serve:test或原本靜態開啟方式；複製專案時須包含src/td/systems/BattlefieldCamera.js。

## 0.48.0 安裝差異

無新增安裝依賴或伺服器需求，沿用原本啟動方式。完整複製專案時不可漏掉 `td-combat.css`；不要只複製 td.html。

## v0.47.0 初次開玩檢查

不需伺服器或登入；下載完整專案後以 Chrome／Edge 開啟 `td.html`，或使用現有 GitHub Pages 入口。手機建議橫向握持；若自動識別不符，可在 ⚙ 遊戲選單選手機介面。選難度、英雄、軍團後開局；建造現在要在地圖選位置並再次確認。要離線安裝成主畫面捷徑，仍需從 HTTPS Pages 開啟且等 PWA 資產快取完成；本機 `file://` 不提供 Service Worker。

## v0.46.0 安裝初驗

沿用 v0.45.0 安裝方式，沒有新增套件。完整複製專案後開 `td.html`，以王國軍團建造戰鼓堡與一名附近守軍，塔卡應顯示「守軍攻速支援」；獅翼弩砲卡顯示支援怪優先。切換暮影軍團則可看到兩種召喚塔的不同定位。開發者執行 `npm run check`、`npm test`；本機 HTTP 可用 `npm run serve:test`。若舊 PWA 仍顯示舊說明，先關閉分頁再開以更新 `sky-strike-v0.46.0` 快取。此版尚未部署 Pages。

## v0.45.0 安裝初驗

無新依賴；完整複製專案後以 Chrome／Edge 開 `td.html`，或在專案目錄執行 `npm run serve:test` 並開 `http://127.0.0.1:4173/td.html`。選「王國巡林者 × 暮影盟約」並開始，應看到巡林者技能與暮影建造清單；再測另一個交叉組合。開發者驗證執行 `npm run check`、`npm test`。若仍顯示舊三步開局，關閉舊分頁重開，讓 `sky-strike-v0.45.0` 離線快取更新。未安裝任何資料庫或伺服器套件；手機 Pages 版待另外發布。

## v0.44.2 安裝初驗

安裝方式與 v0.44.1 相同，無新套件。開 `td.html` 選英雄、開波，滿血普通怪不應連成血條長線；也可執行 `npm run serve:test`，開 `http://127.0.0.1:4173/tests/td-readability-preview.html?count=30` 檢查固定 30 隻場景。開發驗證執行 `npm run check`、`npm test`。

## v0.44.1 安裝初驗

安裝方式與 v0.44.0 相同，無新增套件。完整複製專案後開 `td.html`，選王國巡林者，在商店買精鋼長弓，確認戰場上的弓靠近角色右手；轉向時應與角色一起翻面。公開 Pages 目前仍為 v0.44.0，待明確要求發布後才更新。

## v0.44.0 安裝與初驗

無新套件或伺服器需求。下載完整專案後，用 Chrome／Edge 開 `td.html`，或先執行 `npm run serve:test` 再開 `http://127.0.0.1:4173/td.html`。先看開局三步驟與完整英雄圖，開始後點「招募／建造」測底部 Drawer；選卡後點戰場綠色位置會直接建造並扣款，紅色位置不建造。按 ⚙ 試取消重開與設定。手機可用 Chrome／Edge 開相同檔案或網址，選「自動」介面並展開建造面板；本機新版尚未做真機驗收。開發者另執行 `npm run check`、`npm test`。v0.44.0 UI 已部署到 GitHub Pages，但這次本機續作未發布。

## v0.43.0 安裝與初驗

完整複製專案後用 Chrome／Edge 開 `td.html`；本機亦可執行 `npm run serve:test`，再開 `http://127.0.0.1:4173/td.html`。開發驗證執行 `npm run check`、`npm test`，無新套件。選角應見三英雄完整圖片，進場應見完整地圖；不提供低畫質進場。建一名士兵，點選後應看到五種索敵策略。GitHub Pages 使用者需等部署完成後關閉舊遊戲分頁並重新開啟。

## v0.42.0 安裝與初驗

無新相依套件。完整取得專案後執行 `npm run check` 與 `npm test`，再用 Chrome／Edge 開啟 `td.html` 或執行 `npm run serve:test` 開 `http://127.0.0.1:4173/td.html`。選王國應見 125G 寒鋼哨塔、選老兵應見第 30 波血量 309%；建 100G 林地弩塔後，下一級應顯示 280G。手機需展開建造面板。若手機仍見舊價格，須先待 GitHub Pages 新版發布，並關閉舊遊戲分頁再開。

## v0.41.0 安裝與驗證

無新套件。完整複製專案後執行 `npm run check`、`npm test`，以 Chrome／Edge 開啟 `td.html`，或 `npm run serve:test` 後開啟 `http://127.0.0.1:4173/td.html`。選角時應先看到圖片載入狀態；進場後 F 大絕按鈕可見，地圖與首波怪物不應是色塊／圓點。手機加入主畫面仍使用原圖示。

## v0.40.1 驗證

無新套件。完整複製新增 v4 PNG、`ArtSystem.js`、`sw.js` 與其餘專案檔案，執行 `npm run check`、`npm test`。開啟 `td.html?v=0.40.1`，選王國英雄、暫停、購買精鋼長弓並關閉商店；地圖草地應直接透過角色周圍顯示，不能出現棋盤格。

## v0.40.0 安裝驗證

安裝方式不變：完整複製專案後用 Chrome／Edge 開啟 `td.html`，不需伺服器、帳號或資料庫。更新時務必包含八張新增 PNG、`src/td`、`td.html`、`td.css` 與 `sw.js`。開發者使用 Node.js 18+ 執行 `npm run check` 與 `npm test`；若工作區另有未納入版本管理的測試，先確認其所需素材是否齊全。進遊戲選三族各查看五名守軍，試建新兵並檢查第二波狼群。

## v0.39.0 驗證

無新增套件或資料遷移。必須一併複製五張新增 PNG、相關 TD 程式、`td.html`、`td.css` 與 `sw.js`。執行 `npm run check`、`npm test`，應通過 153 項測試；再開啟 `td.html?v=0.39.0`，選精靈按 E 檢查元素，開商店確認本族三兵未出現，並切換手機介面測試「展開建造／收合面板」。

## v0.38.0（2026-09-12）

安裝方式不變：完整複製專案後開啟 td.html 即可遊玩；測試需 Node.js 18 以上，執行 npm run check 與 npm test。无需資料庫、帳號、環境變數或第三方依賴。

## v0.36.0 驗證

無新增套件。更新時必須包含六張新 PNG、`config.js`、`FactionSystem.js`、`CombatUnit.js`、`Monster.js`、`ArtSystem.js`、`td.html`、`td.css` 與 `sw.js`。執行 `npm run check`、`npm test` 後開啟 `td.html?v=0.36.0`；三流派應各顯示 3 名守軍，術士、祭司與 Boss 應為獨立外觀。若仍是舊建造清單，完整關閉頁面再重開以更新 v0.36.0 離線快取。

## v0.35.0 驗證

不需安裝新套件。更新時必須保留 `hero-hunter-actions-v2.png`、`hero-rogue-actions-v2.png`、`hero-rogue-actions-unarmed-v2.png` 與 `faction-towers-v2.png`。執行測試後開啟 `td.html`，三流派應各顯示 2 名守軍、4 座建築；若仍顯示舊圖，完整關閉頁面再重開以更新 v0.35.0 離線快取。

## v0.34.0 驗證

無新增套件或伺服器需求。完整更新後執行 `npm run check`、`npm test`，再開啟 `td.html`；下一波情報可正常顯示且 `WaveCatalog.total()` 為 30 即代表程式已更新。若 GitHub Pages／手機主畫面仍載入舊版，完整關閉遊戲再重開，讓 v0.34.0 快取接管。

## v0.33.0 驗證

安裝需求不變，無新增依賴。更新全部檔案後重新整理 `td.html`，難度選單應顯示三種歸隊時間與災厄永久陣亡；若仍顯示舊文案，關閉頁面後重開以更新 v0.33.0 Service Worker 快取。

> v0.30.0 新增的種族單位、三族大型建築與戰狼圖集均已保存於 `assets/td/`，不需另外下載素材或安裝套件。更新後若仍看到舊版，請關閉分頁後重新開啟，或清除該站台的 Service Worker 快取。

## 遊玩安裝

1. 將整個專案資料夾複製到 Windows 電腦。
2. 確認資料夾結構完整，不要只複製 `index.html`。
3. 安裝最新版 Chrome 或 Edge。
4. 雙擊 `index.html` 即可，不需網路與伺服器；開始畫面應同時顯示四種難度、六套外觀與「突破 100 波遠征」說明。開始標準模式後右下角應顯示「防線 5 / 5」。
5. 塔防模式可從開始畫面的連結進入，也可直接雙擊 `td.html`；應顯示人族邊境戰場、職業選擇、240G、5 木材、0 功勳與 20/20 城門。
6. 確認 `assets/td` 包含戰場、建築、敵軍及三張 `*-actions-v1.png`；缺少時遊戲仍會顯示簡化圖形，但不屬於完整 v0.16 美術交付。
7. 使用頂端「介面」選單輪流切換自動、電腦、手機，確認戰局不會重開；重新整理後應維持最後選擇。
8. 選職後確認顯示 18 秒準備與下一波情報，按「立即開始」可跳過倒數；在合法草地部署一名士兵與一座防禦塔。兩者位置永久固定，英雄仍可移動與施法。

## 開發環境（選用）

安裝 Node.js 18 或更新版本後，在專案根目錄執行 `npm test`。本專案不需 `npm install`。

## 手機

手機不需安裝檔。部署至 GitHub Pages 後，以 Safari／Chrome 開啟公開網址；需要類似 App 的體驗時選擇「加入主畫面」。iOS 與 Android 的選單名稱可能略有不同。

## v0.17.0 英雄與指揮介面

完整複製新版檔案，確認 assets/td/hero-actions-v1.png 存在。開啟 td.html，選職後應看到女英雄與固定頭像、霜環、招募／建造分類。點頭像再點地面可控制英雄；按暫停能安心練習部署。

## v0.18.0 英雄技能與種族塔

安裝方式不變：完整下載專案後開啟 td.html，或 npm run serve:test 後開啟 http://127.0.0.1:4173/td.html。必須保留新增三個 JS 模組與 assets/td/faction-towers-v1.png。無新增套件或帳號要求。

## v0.19.0 英雄流派與傭兵館

安裝方式不變，開啟td.html或執行npm run serve:test。完整下載時須包含 src/td/systems/HeroRoster.js；無新增套件。首次進入直接選英雄、招募守軍或傭兵、部署後開始第一波。

## v0.20.0 敵軍動作第一階段

安裝方式不變。完整下載專案須包含assets/td/enemy-grunt-actions-v1.png、enemy-runner-actions-v1.png、enemy-brute-actions-v1.png。開啟td.html可玩，無新增套件。

## v0.21.0 RTS 指揮介面

安裝方式與需求不變，無新增套件。開啟 `td.html` 後應看到黑鐵金框 HUD、頂部速度鍵與右側英雄指揮面板；若仍見舊介面，HTTP／GitHub Pages 使用者請重新載入以更新 Service Worker 快取。

## v0.22.0 戰鬥回饋

無新增套件。完整下載須包含 `src/td/systems/CombatFeedbackSystem.js`；進入戰鬥後應看到傷害與 Gold 跳字。若頁面空白，確認此檔案與 `td.html` 的載入順序完整。

## v0.23.0 戰鬥生命週期

不需新增套件或資料庫。確認 `src/td/systems/EnemyCombatSystem.js` 存在，並由 `td.html` 在 `TDGame.js` 前載入；若更新後仍見舊行為，重新整理一次讓 v0.23.0 Service Worker 接管。

## v0.24.0 黃金 15 波

安裝條件不變。完整專案必須包含 `TDDifficultySystem.js` 與 `EnemyTraitSystem.js`，兩者均需在 `TDGame.js` 前由 `td.html` 載入。HTTP 或 GitHub Pages 更新後重新整理，看到四個難度選項即代表 v0.24.0 已載入。

## v0.31.0 戰地軍械

無新增套件、伺服器或資料庫。完整下載需含 `src/td/systems/ArmorySystem.js` 與 `assets/td/items/equipment-atlas-v1.png`；兩者已列入 `td.html` 及離線快取。選角後看到選取卡下方「軍械庫」即代表新版已載入。

## v0.32.0 唯一軍械

安裝需求不變。更新後軍械庫上方應看到武器／護甲／戰器三個欄位；若未出現，重新整理以更新 `sky-strike-v0.32.0` 離線快取。

## v0.32.1 手機安裝

正式網址必須使用 HTTPS（GitHub Pages 符合）。從 `td.html` 加入主畫面時使用 `td.webmanifest` 並直接啟動塔防；Android Chrome 選「安裝應用程式」，iOS Safari 由分享選單選「加入主畫面」。首次開啟需連線，完成離線快取後可再次離線啟動。

v0.32.2 的 Pages 工作流程可自動初始化全新公開倉庫；若組織政策禁止 Pages，仍需由倉庫管理者開啟權限。
