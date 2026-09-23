> **v0.85.11（2026-09-23）：** 沿用 Node.js 18+ 與原啟動方式；沒有新增依賴、安裝或設定步驟。 詳見 [手機版修復說明](MOBILE_RANKING_INPUT_V08511.md)。

> **v0.85.10（2026-09-23）：** 安裝方式不變；update.html 需 HTTPS 或 localhost，修復舊画面時不必重新安裝或刪除存檔。 詳見 [更新修復說明](UPDATE_RECOVERY_V08510.md)。

> **v0.85.9：** Node.js 18 以上執行 `npm run check`、`npm test`，再以 `npm run serve:test` 開啟 `/td.html`；無新增套件。選卡後檢查全圖綠點與紅框已消失。詳見 [地圖部署視覺整理](DEPLOYMENT_VISUAL_V0859.md)。

> **v0.85.8：** 使用 Node.js 18 以上取得完整靜態檔，執行語法與霜原測試後啟動 td.html；無新增套件或設定。步驟見 [霜原平衡交付](FROSTLAND_BALANCE_V0858.md)。

# 安裝手冊

> **v0.85.7（2026-09-23）：** Node.js 18 以上與既有靜態伺服器即可；無額外套件，兩張新地精 PNG 必須一併取得。 操作、架構、部署、回復及驗收見 [地精視覺交付](GOBLIN_POLISH_V0857.md)。

> **v0.85.6：** 安裝步驟不變；啟動 `td.html` 後，預設 ×1 已採新節奏。若仍為舊節奏，重新載入以更新離線快取。見 [速度調整](GAME_SPEED_V0856.md)。

> **v0.85.5（2026-09-23）更新：** 桌機建造／技能介面放大；霜原七塔正式美術及四技能圖示／特效；排行榜僅收錄自由遠征完成至少 16 波的成績，原始戰報保留。當前操作、API、架構、安裝部署、回復與驗收以 [本版交付文件](BATTLE_POLISH_V0855.md) 為準。

v0.85.3：取得整份靜態目錄和三張新版地圖 PNG，執行 `npm run check`、`npm test`、`npm run serve:test` 後開啟 `/td.html`。見 [戰場安裝與驗收](STORY_MAP_REFINEMENT_V0853.md)。

v0.85.2：安裝不需邊境對戰原型檔案；完整部署根目錄並更新離線快取。見 [移除與驗收紀錄](VERSUS_REMOVAL_V0852.md)。

v0.84.9 安裝需包含新增的 `src/td/systems/ArmoryUI.js`；不需新套件或資料庫。啟動、更新與驗證見 [軍械庫更新](ARMORY_V0849.md)。

v0.84.8 安裝後確認三張新地圖資產與劇情入口，詳見 [三張劇情戰場](STORY_MAPS_V0848.md)。

> **v0.84.7 現行商城：** 四位英雄外觀（獸人為「冥骨帝王」）與「日蝕王庭」已開放使用玩家檔案的試用水晶購買、保存與裝備；沒有真實付款。詳細規格、操作、限制、部署與測試見 [外觀上架交付](COSMETIC_RELEASE_V0847.md)。

> v0.84.6：結算畫面只需既有 Node.js 18+ 與靜態服務，無新增套件或資料庫；安裝後以 `td.html` 驗證，詳見 [本版交付](RESULT_SCREEN_V0846.md)。

> v0.84.4：沿用 Node.js 18+，無新套件；完整複製 HTML、CSS、JS 與新增的日蝕王庭和地精圖集素材，以本機伺服器開啟 `td.html`。詳見 [本版安裝](EXPEDITION_SCORE_PROFILE_V0844.md)。

> v0.84.3：沿用 Node.js 18+，無新套件；安裝完整專案並以本機伺服器開啟 td.html，確認版本 v0.84.3。詳見 [技能交付](CHIEF_SHOCKWAVE_V0843.md)。

> v0.84.2：安裝時保留 td-ranking.css 與 src/td/ranking 兩個腳本，和 td.html 同版即可開啟排行榜；測試指令見 [排行榜安裝](RANKING_UI_V0842.md)。

> v0.83.6：沿用 Node.js 18+ 與現有啟動方式，無新增套件。更新後確認大廳 v0.83.6，原分頁必須重新整理才載入修正。 詳見 [右鍵與戰鬥版型修正](BATTLE_INPUT_LAYOUT_V0836.md)。

> v0.83.5：沿用 Node.js 18+、npm run check、npm test、npm run serve:test。新增頁面與 assets/td/shop、assets/td/codex 必須隨專案完整取得，不需新套件或金鑰。 詳見 [商城與圖鑑整合交付](FEATURE_INTEGRATION_V0835.md)。

> v0.83.4：沿用 Node 18+ 與原安裝流程，不需新套件或設定。同步更新大廳樣式、FrontierApp、入口與快取；見 [安裝步驟](LOBBY_LAYOUT_V0834.md)。

> v0.83.3：保留 src/td/cinematic、src/td/codex、assets/cinematics/prologue 與 td-cinematic.css；Node 18+ 執行 npm run check、npm test、npm run serve:test，開啟 /td.html。正式影片可稍後放入，不影響首次啟動。詳見 [序章安裝](PROLOGUE_CINEMATIC_V1.md)。

> v0.83.2 無新增相依套件。重新載入 `td.html` 後確認遠征頁為 v0.83.2；若仍見舊版，關閉分頁重開並檢查離線快取是否更新。

> v0.83.1 無新增相依套件或資料庫。開啟 `td.html`、重新整理使快取更新；可在遠征頁確認版本 v0.83.1，並選一座 100G 弩塔核對 Lv2 升級為 160G。

> v0.73.0 無新增相依套件。重新開啟並載入 `sky-strike-v0.73.0`，開局頁應出現測試標籤，完成一局後戰況頁應顯示最近戰局。

> v0.72.0 無新增套件、帳號或資料庫。重新開啟遊戲載入 `sky-strike-v0.72.0`，完成一波後確認戰況頁出現戰局分析。

> v0.71.4 無新增相依套件或資料遷移。重新開啟遊戲載入 `sky-strike-v0.71.4`；標準難度詳細規則應顯示金幣55%。

> v0.71.3 無新增相依套件或資料遷移。更新後重新開啟遊戲並確認快取 `sky-strike-v0.71.3`；標準模式應顯示終極士兵鎖，老兵模式應解除。

## 0.71.0 暮秋遺跡與整合發布

新增第三張「暮秋遺跡 · 雙 U 型彎」，採縮窄第一個內圈的確認版本。遠征頁可直接選擇，沿用英雄／軍團／波次及地圖獨立戰績；路線、建造區、小地圖與离線資產同步，無新帳號、API 或設定。完整安裝、更新、架構圖、備份回復與測試見 [發布手冊](AUTUMN_RUINS_V0710.md)。

> v0.70.0 無新增相依套件或資料遷移。更新完整檔案後重新開啟遊戲，確認服務工作者快取為 `sky-strike-v0.70.0`；翡翠古龍 Lv.2 原價應為 800G。

## 0.69.9

本版無新增套件、帳號、資料庫或設定。取得完整專案後開啟 `td.html`，或執行 `node scripts/serve-test.js`。

## 0.69.8 地圖獨立積分

安裝流程與 Node.js 需求不變，無新增套件或資料庫。更新完整專案後執行 npm run serve:test，使用原本 td.html 入口。舊戰績於載入時自動讀取及歸類，不需手動匯入。

## 0.69.6 士兵裝備顯示修正

安裝方法不變，完整更新專案後執行 npm run serve:test。這次不新增素材、套件或資料庫；ArtSystem.js、package.json 與 sw.js 應同版更新。

> 0.69.3 手機安裝需以 HTTPS 發布完整專案。Android Chrome 可使用頁面顯示的「安裝」按鈕；iPhone／iPad Safari 使用分享選單的「加入主畫面」。兩者都會從 `td-mobile.html` 以橫向容器啟動。

> 0.69.2 不增加安裝步驟；請確認 11 張新增動作圖與程式一起複製。清單見 [UNIT_ACTIONS_V0692.md](UNIT_ACTIONS_V0692.md)。

## 0.68.5 馭獸師與熊戰鬥動作（2026-09-17）

恢復馭獸師原本的鹿角、肩鳥與綠袍設計，新增待機及施法畫格；三階熊新增踏步與撲咬畫格，近戰命中顯示爪痕。使用既有 state、frameClock、attackTimer 切換，無資料庫、API 或權限變更。完整安裝、更新、回復與測試方式見 [動作更新紀錄](NATURE_MOTION_V0685.md)。


## 0.68.4 森靈馭獸師造型（2026-09-17）

沿用直接雙擊 td.html 或 npm run serve:test。新版素材需保留在 assets/td；不需額外套件或設定。


## 0.68.0 雙隘口要塞（2026-09-17）

無新執行期依賴；Node.js 18+，npm run serve:test 後開啟 td.html?v=0.68.0，在目前戰場選第二張。

詳見 [第二張地圖規格、操作與回復](TWIN_PASS_V0680.md)。

## 0.67.0 終極士兵（2026-09-17）

完整取得0.67.0專案即可使用，不需新增套件、帳號或資料庫。開啟td.html，或執行node scripts/serve-test.js後進入本機遊戲。

詳見[終極士兵操作、架構與驗收](ULTIMATE_SOLDIERS_V1.md)。

## 0.66.5 直接開檔修復（2026-09-17）

可直接雙擊 td.html；亦可 npm run serve:test 後開啟伺服器網址。手機入口 td-mobile.html 同樣支援直接開檔。


## 0.66.4 建造預覽對齊（2026-09-17）

沿用 npm run serve:test 啟動靜態網站，瀏覽 td.html。此版不新增執行套件；視覺 QA 腳本需可用的 Playwright 與 Edge。


## 0.66.2 選取用途說明（2026-09-17）

沿用既有 Node.js 18+ 與靜態啟動流程：npm test、npm run check、npm run serve:test。開啟伺服器提供的 td.html，部署／選取單位查看用途，無額外套件。


## 0.66.1 新手谷地美術（2026-09-17）

沿用 Node.js 18+ 與 npm run serve:test，不需新套件或設定。開啟 td.html?v=0.66.1。

詳見 [地圖更新、架構與回復手冊](MAP_ART_V0661.md)。

## 0.65.0 手機介面修正（2026-09-17）

安裝步驟不變：Node.js 18+，執行 `npm run serve:test`，開啟 `http://127.0.0.1:4173/td.html`。完整複製專案，包含新增的 `td-mobile.html` 與 `src/td/mobile-entry.js`。手機與桌面使用同一入口，不需要另裝套件或資料庫。

## 0.64.0 首次安裝與啟動

1. 下載完整倉庫 ZIP 並解壓，或 `git clone https://github.com/dat5512999-bit/sky-strike-hero-frontier.git`。
2. 安裝 Node.js 18+ 後，在專案根目錄執行 `npm run serve:test`（預設不需 npm install）；保持此終端開啟。
3. 用瀏覽器開啟 `http://127.0.0.1:4173/td.html`，依序選難度、英雄、軍團，再開始遠征。勿開根目錄 index.html，那是另一個射擊模式。
4. 手機開啟部署的 HTTPS /td.html，橫向遊玩，可加入主畫面。首次需要連線載入素材；不能用手機的 127.0.0.1 連到電腦。
5. 開發驗證：`npm run check`、`npm test`；需瀏覽器 QA 時再按 [QA 文件](RELEASE_V064_QA.md) 裝選用 Playwright。

本版必須包含 `HeroJoystick.js`、`BattleSynergySystem.js`、`assets/td/faction-builds-v1.png`；無帳號、密鑰、資料庫或新執行期依賴。以下舊版安裝章節為歷史補充。

## 0.62.0 安裝與啟動

無新增套件、資料庫或外部服務。更新後執行 `npm run check`、`npm test`，再以 `npm run serve:test` 開啟 `http://127.0.0.1:4173/td.html?v=0.62.0`。離線版快取名稱為 `sky-strike-v0.62.0`；既有本機戰績會自動保留於 `heroFrontierScoreRecordsV1`。

## 0.61.0 安裝與啟動

無新增套件、資料庫或外部服務。完整更新 TD 系統、HTML／CSS、兩份 manifest、`package.json`、`sw.js`、測試與文件後，執行 `npm run check`、`npm test`，再以 `npm run serve:test` 啟動並開啟 `http://127.0.0.1:4173/td.html?v=0.61.0`。離線版若仍顯示舊 HUD，請強制重新整理以切換到 `sky-strike-v0.61.0`。

## 0.60.1 安裝與啟動

無新增套件。完整更新 `td.html`、`td.css`、`src/td/main.js`、`src/td/TDGame.js`、測試、`package.json` 與 `sw.js`，執行 `npm run check`、`npm test`，再開啟 `http://127.0.0.1:4173/td.html?v=0.60.1`。進入戰鬥後由 ⚙ 選「返回遠征選擇」，網址應保持在 `td.html`。

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

無新依賴；完整複製專案後以 Chrome／Edge 開 `td.html`，或在專案目錄執行 `npm run serve:test` 並開 `http://127.0.0.1:4173/td.html`。選「守誓者・雷恩 × 暗影軍團」並開始，應看到巡林者技能與暮影建造清單；再測另一個交叉組合。開發者驗證執行 `npm run check`、`npm test`。若仍顯示舊三步開局，關閉舊分頁重開，讓 `sky-strike-v0.45.0` 離線快取更新。未安裝任何資料庫或伺服器套件；手機 Pages 版待另外發布。

## v0.44.2 安裝初驗

安裝方式與 v0.44.1 相同，無新套件。開 `td.html` 選英雄、開波，滿血普通怪不應連成血條長線；也可執行 `npm run serve:test`，開 `http://127.0.0.1:4173/tests/td-readability-preview.html?count=30` 檢查固定 30 隻場景。開發驗證執行 `npm run check`、`npm test`。

## v0.44.1 安裝初驗

安裝方式與 v0.44.0 相同，無新增套件。完整複製專案後開 `td.html`，選守誓者・雷恩，在商店買精鋼長弓，確認戰場上的弓靠近角色右手；轉向時應與角色一起翻面。公開 Pages 目前仍為 v0.44.0，待明確要求發布後才更新。

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


## v0.66.0 戰旗光環

v0.66.0 沿用既有安裝方式，無新增依賴。安裝 Node.js 18+ 後可執行 npm test、npm run check；npm run serve:test 啟動後開啟 http://127.0.0.1:4173/td.html。


## 0.66.2 角色比例（2026-09-17）

沿用既有安裝方式，無新增執行依賴。使用 Node.js 18 以上執行 npm test 與 npm run check；一般玩家不必執行素材量測工具。


## v0.66.3 侵蝕特效

v0.66.3 沿用原安裝與設定，不需新套件或下載素材。Node.js 18+ 執行 npm test、npm run check；npm run serve:test 後開啟 http://127.0.0.1:4173/td.html。

## 0.66.4 波次提示

波次預告改為怪物縮圖、數量與威脅標籤，新增入口倒數與短暫開戰提醒。操作、設定、架構、API、部署、還原與驗證方式見 [波次提示文件](WAVE_HUD_V0664.md)。



## 0.67.1 手機波次版面修正

修正波次與倒數重疊、速度列出界，縮小手機提示面板；無操作、設定或資料格式變更。原因、架構、更新、還原及觸控版面驗證見 [版面修正文件](WAVE_LAYOUT_V0671.md)。


## 0.68.1 波次避讓與預覽修正

波次改為靠左小列，預告按需展開，戰鬥提示可點穿；修正三種終極士兵卡片裁切。操作、API、架構、部署、還原與測試見 [版本文件](EDGE_WAVE_PREVIEW_V0681.md)。



## v0.68.2 藤蔓纏繞

v0.68.2 沿用原安裝與設定。無新增套件；Node.js 18+ 執行 npm test、npm run check。npm run serve:test 後開啟 http://127.0.0.1:4173/td.html。

## 0.68.3 士兵尺寸微調（2026-09-17）

我方部署士兵統一放大 12%，保留相對體型與腳底錨點；英雄、怪物、召喚物和卡片大小維持原設定。無新增操作、設定、API、權限或資料格式。ArtSystem.drawCombatUnit → 腳底縮放 → drawCombatUnitSprite；預覽直接使用未放大的 sprite 方法，避免再次裁切。

安裝與部署流程不變，完整更新後關閉舊分頁再開啟。package.json 與 Service Worker 快取更新至 0.68.3。修改前 ArtSystem.js、package.json、sw.js 保存在 artifacts/soldier-v0683-backup/；若需還原，將 ArtSystem.js 放回 src/td/systems/，其餘放回根目錄，已有後續修改時先比較合併，部署使用新的快取名稱。

驗證：342 項測試通過；全角色圖在 artifacts/qa-unit-scale/roster.png；三種終極士兵的六張卡片預覽仍完整。此版本只改畫面尺寸，射程、攻擊、碰撞與移動數值不變。


## v0.69.0 英雄技能與動畫完整顯示

沿用 Node.js 18+ 與原安裝方式，無新增套件。新增兩個 systems 檔須完整；npm test、npm run check；npm run serve:test 啟動本機網頁。
## 0.69.1 安裝補充

無新增外部依賴；需一併部署 FieldLoot 腳本。詳見 [版本文件](FIELD_LOOT_SHOP_V0691.md)。

## 0.69.7 雙隘口路線校準

依正式圖片的鋪石路面重新取樣上下道路中心，修正彎道偏向路緣；共用末段長度同步計算。沿用 maps → Monster／BuildSystem／MiniMapView 架構，不改圖片、素材腳底或 API。重新開始遠征即可使用新座標，無設定與存檔遷移；部署完整版本與新的 Service Worker 快取。回復前資料在 artifacts/route-v0697-backup，請逐檔比較，避免覆蓋其他工作。

6 項雙路測試與語法檢查通過；新增獨立路面取樣回歸、完整路線怪物截圖，見 artifacts/qa-twinpass/full-route-battle.png。全套當次為 375/377 通過，兩項旗幟／統領光環測試失敗，涉及另行修改中的軍團平衡，未在此地圖修正中改動。
## 0.71.1 安裝補充

無新增依賴。部署完整檔案並重新開啟頁面後，難度卡應顯示積分倍率；既有瀏覽器戰績會在下次讀取與儲存時升級為 V3。
# v0.74.0 安裝補充

不需新增套件。覆蓋新版靜態檔案後重新載入；既有本機戰績會直接用於第三階段判定。
# v0.75.0 安裝補充

不需新增套件或遷移資料。覆蓋新版靜態檔案並重新載入即可套用功勳節奏。
# v0.76.0 安裝補充

不需新增套件或資料遷移。重新載入後確認開局顯示 `v0.76.0 · BALANCE E2`；若仍顯示舊版本，關閉舊遊戲分頁再重新開啟。
# v0.77.0 安裝補充

不需安裝新套件或建立資料庫。瀏覽器須允許本機儲存，才能在重新開啟後顯示「繼續遠征」。
# v0.79.2 安裝補充

無新增依賴或資料庫變更。重新載入後應更新至 `sky-strike-v0.79.2`。

v0.80.0 無新增執行期依賴。覆蓋完整專案後重新載入，Service Worker 快取應顯示 `sky-strike-v0.80.0`；新荒野 PNG 必須與 `assets/td/opening` 一併保留。


## 0.83.0 · 大廳與獨立測試輪次

無新增套件。Node.js 18+，npm run serve:test 後開 td.html；手機使用 td-mobile.html。首次啟動複製舊存檔至管理者。 完整操作、限制、架構與回復步驟見 [P0 說明](LOBBY_P0_V083.md)。

## v0.83.3

v0.83.3 無新增依賴；使用既有 npm run serve:test。需完整保留新增 CSS 與造型圖。詳見 [版本安裝說明](LOBBY_EXPEDITION_V0833.md)。

# 地精 V1 安裝補充

沿用原有純靜態安裝流程；新版須連同 `src/td/systems/GoblinNetworkSystem.js`、`GoblinArt.js`、`assets/td/goblin-concept-card.svg` 和更新後的 `td.html` 一起部署。無資料庫與額外套件。見 [地精 V1](GOBLIN_FACTION_V1.md)。

安裝後可依 [v0.84.5 武器紀錄](FACTION_HERO_WEAPONS_V0845.md) 在自由遠征檢查荒野與地精英雄三階武器。


## 商城單一入口與雷霆戰王（0.6.1）

正式商城統一由 `td.html` 大廳或 `td.html?panel=shop` 進入；獨立 `shop.html` 與專用啟動程式已刪除，舊 4187 展示服務已停止。雷霆戰王沿用原有玩家檔案保存購買與裝備，四組動作已接入正式戰場。共用商城元件及既有收藏保留。

操作、API、部署、測試與回復限制見 [0.6.1 整合說明](shop/THUNDER_TD_V061.md)。

> v0.85.4 沒有新相依或素材；完整安裝後直接開啟 `td.html` 即可。檔案清單見 [命中回饋交付](HIT_FEEDBACK_V0854.md#安裝部署更新與回復)。
> v0.85.1：根目錄 `td.html` 已直接載入冰原系統與選角插畫；完整檔案清單見[選角插畫交付](FROSTLAND_SELECTION_ART_V0851.md)。

v0.85.0：沿用 Node.js 18+，無新依賴。完整取得 assets/td/frostland 與 items/frostland-spears-v1.png，執行 npm run check、npm test、npm run serve:test，開啟 /td.html。也可開 /frostland-preview.html。步驟見 [冰原 V1](FROSTLAND_FACTION_V1.md)。
