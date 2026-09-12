# 安裝手冊

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
8. 選職後確認顯示 18 秒準備與下一波情報，按「立即開始」可跳過倒數；部署一名職業守軍與一座防禦塔，再確認移動、攻擊移動、固守與停止。

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
