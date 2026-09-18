# 部署手冊

> v0.73.0 部署後抽查策略標籤不改變遊戲規則、同配置歷史能顯示、舊紀錄不報錯，並確認離線快取名稱為 `sky-strike-v0.73.0`。

> v0.72.0 部署需同步更新戰況 UI、TD 腳本與 Service Worker。抽查戰況分析可顯示且離線重新開啟正常。

> v0.71.4 部署後抽查四難度金幣78%／55%／45%／38%，並用自動測試確認標準前14波理論持金約4500G。

> v0.71.3 須一併部署難度、波次、軍團、TDGame、HTML、CSS、測試與文件。部署後抽查四個難度說明、鎖定卡及第20波敵量級距。

## 0.71.0 暮秋遺跡與整合發布

新增第三張「暮秋遺跡 · 雙 U 型彎」，採縮窄第一個內圈的確認版本。遠征頁可直接選擇，沿用英雄／軍團／波次及地圖獨立戰績；路線、建造區、小地圖與离線資產同步，無新帳號、API 或設定。完整安裝、更新、架構圖、備份回復與測試見 [發布手冊](AUTUMN_RUINS_V0710.md)。

> v0.70.0 發布時須一併部署 `CombatUnit.js`、`package.json`、`sw.js`、測試與文件。部署後關閉舊分頁再開，抽查古龍 Lv.2 原價 800G。

## 0.69.9 軍團定位平衡

完整部署程式、測試、文件與 `sw.js`；確認快取為 `sky-strike-v0.69.9`。重開遊戲後檢查士兵說明、支援建築升級比例與三軍團配隊。

## 0.69.8 地圖獨立積分

發布時同步更新 BattleReportSystem.js、TDGame.js、package.json 與 sw.js。驗收至少切换兩張地圖確認最高分獨立，結算後重新載入確認保存。此次僅本機修改，未執行遠端發布。

## 0.69.6 士兵裝備顯示修正

完整部署包含本版 ArtSystem.js 及 sw.js 的靜態檔案；確認新版快取生效後檢查裝備標記。未在本次操作發布遠端網站。

> 0.69.2 已將新增動作圖加入離線資產清單，快取版本為 `sky-strike-v0.69.2`。詳見 [UNIT_ACTIONS_V0692.md](UNIT_ACTIONS_V0692.md)。

## 0.68.5 馭獸師與熊戰鬥動作（2026-09-17）

恢復馭獸師原本的鹿角、肩鳥與綠袍設計，新增待機及施法畫格；三階熊新增踏步與撲咬畫格，近戰命中顯示爪痕。使用既有 state、frameClock、attackTimer 切換，無資料庫、API 或權限變更。完整安裝、更新、回復與測試方式見 [動作更新紀錄](NATURE_MOTION_V0685.md)。


## 0.68.4 森靈馭獸師造型（2026-09-17）

完整部署 0.68.4，快取 sky-strike-v0.68.4 包含 beastmaster-v2.png；驗收 Lv.3 馭獸師與建造預覽。


## 0.68.0 雙隘口要塞（2026-09-17）

需部署完整 v0.68.0（新增素材、路線系統、選圖 UI 與 sw.js），快取版號以 sw.js 的最新值為準（保留並行更新）。目前僅本機完成，未發布遠端。

詳見 [第二張地圖規格、操作與回復](TWIN_PASS_V0680.md)。

## 0.67.0 終極士兵（2026-09-17）

整包部署0.67.0，包含三張assets/td/ultimate-*-v1.png與更新後的sw.js（sky-strike-v0.67.0）。確認新卡片預覽、角色部署及離線資產完整。

詳見[終極士兵操作、架構與驗收](ULTIMATE_SOLDIERS_V1.md)。

## 0.66.5 直接開檔修復（2026-09-17）

完整更新至 0.66.5；HTTP 快取名稱 sky-strike-v0.66.5。驗收直接開檔及 HTTP 開局、迎戰、地圖與小地圖。


## 0.66.4 建造預覽對齊（2026-09-17）

完整部署 0.66.4 靜態檔案並確認快取 sky-strike-v0.66.4。開啟建造清單，確認魔法師與盾衛預覽大小接近、價格留在卡片內。


## 0.66.2 選取用途說明（2026-09-17）

整包部署後重新開啟 td.html?v=0.66.2，確認 Service Worker 快取 sky-strike-v0.66.2；選取時間術士確認用途欄。無後端遷移。


## 0.66.1 新手谷地美術（2026-09-17）

部署完整版本，包含 beginner-valley-v2.png、maps.js、ArtSystem.js、sw.js；快取名稱 sky-strike-v0.66.1。本次只完成本機更新，未發布遠端。

詳見 [地圖更新、架構與回復手冊](MAP_ART_V0661.md)。

## 0.65.0 手機介面修正（2026-09-17）

部署必須同批更新 `td.html`、`td-mobile.html`、`src/td/mobile-entry.js`、`src/td/main.js`、`src/td/TDGame.js`、`td-combat.css` 與 `sw.js`；不要漏掉離線資產清單中的新檔。沿用 HTTPS 靜態主機，允許同源 iframe。驗證直式首開、橫向首開、離線重開與旋轉不重置遊戲。本次僅完成本機修改，未執行遠端發布。

## 0.64.0 發布流程

完整提交程式、圖集、測試及文件；版本為 `package.json 0.64.0`、快取為 `sky-strike-v0.64.0`。不要只更新 HTML 或圖片，兩個新系統腳本也必須一起發布。沒有資料庫遷移或新 secrets。

推送 main 後，既有 `.github/workflows/pages.yml` 自動執行 check／tests，再上傳靜態站。到 GitHub Actions 確認成功後，開啟 `https://dat5512999-bit.github.io/sky-strike-hero-frontier/td.html?v=0.64.0`；推送成功不等於 Pages 已完成部署。

部署後核對三個新英雄名稱、橫向手機搖桿、爆破工坊預覽及雷電連線；重新整理確認既有最佳積分仍存在。大型圖集仍為成功載入後按需快取，不阻塞 Service Worker 安裝。

以下「本機／未部署」是各歷史版本撰寫時的狀態，不代表目前 GitHub 狀態。

## 0.62.0 部署

本版目前只在本機，尚未推送 GitHub／Pages。部署時同步 `BattleReportSystem.js`、`TDGame.js`、`main.js`、`td.html`、`td.css`、`td-combat.css`、測試、文件、`package.json` 與 `sw.js`。發布後確認 Cache 為 `sky-strike-v0.62.0`，完成一場成功及一場失敗煙霧測試，並重新載入確認最佳積分仍存在。

## 0.61.0 待部署狀態

本版目前在本機工作樹，尚未推送 GitHub／Pages。部署必須包含 TDGame、Camera、Economy、Shop、BattleReport、HeroRoster、Art、Map、HTML／CSS、manifest、測試、所有文件、`package.json` 與 `sw.js`；快取名為 `sky-strike-v0.61.0`。沒有資料庫或存檔遷移。發布後需以 PC 與實體橫向手機驗證英雄拖曳、空地 Pan、Pinch、觸控確認建造、兌換、積分面板、右上暫停及大絕文字。

## 0.60.1 待部署狀態

本版目前只在本機，尚未推送 GitHub／Pages。部署需同步 `td.html`、`td.css`、TDGame／main、測試、文件、`package.json` 與 `sw.js`，快取名為 `sky-strike-v0.60.1`。發布後確認遊戲選單與結算返回都停留在 `/td.html`，並確認 HTML 中沒有 `href="index.html"`。

## 0.60.0 待部署狀態

本版目前只在本機，尚未推送 GitHub／Pages。部署單位包含 `td-combat.css`、回歸測試、所有文件、`package.json` 與 `sw.js`；沒有資料庫或 API 遷移。快取名為 `sky-strike-v0.60.0`。發布後需以實體桌面瀏覽器檢查 100%、150%、200%，特別確認倍速列置中、暫停鍵位於資源列最右側，以及 HUD 沒有遮住主要戰場操作。

## 0.59.0 待部署狀態

本版目前只在本機，尚未推送 GitHub／Pages。部署必須包含 `assets/td/opening` 內四類難度場景、三張英雄立繪、三張軍團橫幅，以及 HeroRoster、FactionSystem、TDDifficultySystem、TDGame、CSS、測試、文件、`package.json` 與 `sw.js`。快取名為 `sky-strike-v0.59.0`，無資料或 API 遷移。發布後請確認所有 PNG 回應成功且軍團卡沒有退回英雄圖。

## 0.58.0 待部署狀態

目前修改保留在本機工作樹，尚未推送 GitHub／Pages。發布時必須整批包含 Monster、EnemyCombatSystem、TDGame、maps、ArtSystem、FrontierTerrain、HTML、兩份 CSS、package、Service Worker、測試與文件；不能只上傳樣式，否則英雄受傷規則與怪物隊列會不同步。快取名為 `sky-strike-v0.58.0`，無資料庫或 HTTP API 遷移。發布前須完成 `npm run check`、`npm test`、`git diff --check`，並複驗 1366×768、1920×1080 與 844×390。

## 0.57.0 發布單位

0.57.0 必須以完整版本發布：正式地圖 PNG、`maps.js`、Camera／Terrain／MiniMap、Monster／CombatUnit／Wave／Build、TDGame、HTML／CSS、測試與文件不可拆開部署。Service Worker 快取名為 `sky-strike-v0.57.0`，大型美術仍採成功載入後快取，避免安裝階段同步等待。沒有資料庫、API 或伺服器遷移。GitHub Pages 發布後以 `td.html?v=0.57.0` 避免舊網址快取誤判。

發布前驗收：250／250 自動測試、靜態檢查與差異格式檢查通過；2560×1440、1920×1080、1366×768、844×390、932×430 的正式地圖比例、Gameplay Safe Area、入口道路、建造限制與單位旁操作皆完成瀏覽器驗證。發布後仍需在真實手機驗證 PWA 冷啟動、觸控長局與完整 30 Wave。

## 0.55.0 待部署狀態（2026-09-15，本機）

這輪僅修改本機，未推送 GitHub／Pages。日後依使用者明確要求發布時，須連同 `CombatUnit.js`、`Monster.js`、`EnemyCombatSystem.js`、`BuildSystem.js`、`ArmorySystem.js`、`TDGame.js`、相關 UI／文字、測試與文件整批部署；`sw.js` 快取版號為 `sky-strike-v0.55.0`。沒有資料庫或伺服器端遷移。

## 0.54.3 商城與技能分區（2026-09-14，本機）

目前僅本機修改，尚未發布 GitHub／Pages。日後使用者要求部署時，同步 HTML、CSS、`TDGame.js`、`package.json`、`sw.js`；離線快取版號為 `sky-strike-v0.54.3`。無資料庫與伺服器 API 變更。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

尚未發布至 GitHub／Pages。日後經使用者要求部署時，同步 `ArtSystem.js`、`package.json`、`sw.js` 等既有遊戲檔；新離線快取為 `sky-strike-v0.54.2`。無伺服器 API 或資料庫變更。

## 0.54.1 英雄小卡（2026-09-14，本機）

尚未發布至 GitHub／Pages。日後經使用者要求部署時，同步上傳 td.html、td.css、td-combat.css、package.json、sw.js；新離線快取為 `sky-strike-v0.54.1`。無伺服器 API 或資料庫變更。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

本機 0.54.0，尚未部署。未來經授權發布時，須連同新 MiniMapView.js、td.html、td-combat.css、src/td/main.js、src/td/TDGame.js 及 sw.js 上傳；離線快取名稱 sky-strike-v0.54.0。沒有遠端 API 或資料庫部署。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

本機版 0.53.0，未部署。若日後獲授權發布，需一起部署 td.html、td.css、td-combat.css 與 sw.js；離線快取名稱已更新為 sky-strike-v0.53.0。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

本機版本 0.52.0，未部署。未來獲授權發布時一併包含新版地表和 sw.js；快取名稱 sky-strike-v0.52.0。仍按既有策略按需快取大型美術，不新增同步等待所有圖片的安裝步驟。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

本機0.51.0未commit／未push。sw cache版本0.51.0；兩張新assets/td圖遵守原延後圖片快取方式，不加入同步PRECACHE。發布時須整套HTML/CSS/JS/兩張PNG一致部署。

## 0.50.0 大地圖原型（2026-09-14，本機）

本機0.50.0未推送GitHub。sw.js cache版本0.50.0新增maps.js與FrontierTerrain.js；發布時需和HTML／JS／CSS一致部署。此次未增加外部依賴或資源來源。


## 最新：0.49.0 鏡頭原型

0.49.0的Camera腳本已加入Service Worker殼快取，CACHE_NAME為sky-strike-v0.49.0。僅本機測試，未推送GitHub／Pages。發布前需再次確認腳本與CSS均存在。

## 0.48.0 部署差異

靜態部署需包含 `td-combat.css`，已加入 Service Worker 的殼快取。快取名稱為 `sky-strike-v0.48.0`。此次只在本機驗收，沒有推送 GitHub／Pages；發布需另外取得使用者指示。

## v0.47.0 本機待發布

靜態檔照舊由 GitHub Pages／任意靜態伺服器提供，無資料庫或 API 部署。發布前跑 `npm test`、`npm run check`，確認 `td.html`、`td.css`、`src/td` 腳本與 `sw.js` 同版，再以真手機橫式測「選卡→合法點位單擊建造」、長按詳情及安全區；目前真機測試未完成。Service Worker 快取名稱仍為 `sky-strike-v0.47.0` 待發布基線，不能由版號推論 P2/P3/P4 已上線。這次沒有推送 GitHub；僅在使用者明確要求更新時才發布。

## v0.46.0 待發布檢查

目前只在本機，**未推送 GitHub**。收到使用者明確發布要求後，應將 v0.45.0 尚未發布的英雄 × 軍團改動與本版塔定位檔案一起提交，不能只上傳 `src/td/config.js`；至少包含 `TDGame.js`、`Building.js`、`CombatUnit.js`、`BuildSystem.js`、`TowerSkillSystem.js`、`TowerEvolutionSystem.js`、`tests/td-tower-identity.test.js`、文件、`package.json`、`sw.js`。先跑 `npm run check`、`npm test`，部署後在 PC／手機實測建造卡、戰鼓不疊加、弩砲索敵、兩種召喚塔，並確認 `sky-strike-v0.46.0` 快取已生效。無環境變數、資料庫或 API 遷移。

## v0.45.0 待發布檢查

目前只在本機，**未推送 GitHub**。未來經使用者明確要求發布時，應整批提交 `td.html`、`td.css`、`src/td/main.js`、本次更動的 TD 系統／測試／文件、`package.json` 與 `sw.js`；不可只上傳 HTML，否則會出現選角與建造資料版本不一致。先執行 `npm run check`、`npm test`，再驗三位英雄 × 三個軍團、重開、第三波軍械、PC／手機介面及 Console。Pages 生效後關閉舊分頁重開，確認 Service Worker 快取為 `sky-strike-v0.45.0`。不需環境變數或資料庫遷移。

## v0.44.2 發布檢查

本版依使用者要求推送 GitHub，包含 `Monster.js`、`TDGame.js`、`Projectile.js`、`CombatFeedbackSystem.js`、`sw.js`、v0.44.1 換弓修復、版本、測試與文件；Service Worker 快取名稱為 `sky-strike-v0.44.2`。Pages 更新後關閉舊分頁重開，再確認 12／20／30 怪群、Boss 血條、手機與 Console。截圖測試頁及 PNG 只作 QA，不是遊戲入口。

## v0.44.1 待發布檢查

v0.44.0 已部署成功；v0.44.1 巡林者持弓修復當時只在本機，後續併入 v0.44.2。需整批包含 `ArtSystem.js`、`sw.js`、`package.json`、測試與文件；確認 Pages 完成後分別測試職業弓 Lv.1～3、獅心王弓、不持有新弓及左右轉向。快取名稱原為 `sky-strike-v0.44.1`，更新後需關閉舊分頁重開。

## v0.44.0 已發布檢查

v0.44.0 已在使用者明確要求後推送並完成 GitHub Pages 部署。該次需整批提交 `td.html`、`td.css`、`src/td/main.js`、`src/td/TDGame.js`、`sw.js`、版本、測試與文件；其 Service Worker 快取名為 `sky-strike-v0.44.0`。頁面初驗包含 1920×1080 PC 建造 Drawer、筆電寬度、手機原面板和重開／結算。靜態部署不需資料庫或環境變數。

## v0.43.0 發布檢查

此次依使用者明確要求推送。需一起發布 `TargetSelector.js`、`CombatUnit.js`、`TDGame.js`、`ArtSystem.js`、`main.js`、`td.html`、`td.css`、`sw.js`、版本與測試文件及先前未發布內容；勿只更新 HTML。Service Worker 快取名 `sky-strike-v0.43.0`，新腳本必須在離線預存清單。發布後用同一網址的 Chrome／Edge 驗證三英雄、地圖和敵軍完整圖片及開局，並測士兵索敵與離線重開。

## v0.42.0 發布檢查（尚未發布）

使用者本次未要求更新 GitHub，請勿自行推送。若日後明確要求發布，須同時包含 `config.js`、`Building.js`、`TowerSkillSystem.js`、`TowerEvolutionSystem.js`、`Projectile.js`、`TDDifficultySystem.js`、`FactionSystem.js`、`ArtSystem.js`、`TDGame.js`、`td.html`、`td.css`、`sw.js` 和文件。Service Worker 快取名稱 `sky-strike-v0.42.0`；手機舊頁關閉重開後驗證老兵摘要、寒鋼哨塔、升級價格與三族控場。線上版目前仍可能是舊版，不應當作本地測試結果。

## v0.41.0 發布前後

本機修復尚未發布。取得使用者明確指示後，連同 `HeroUltimateSystem.js`、`ArtSystem.js`、`td.html`、`td.css`、`TDGame.js`、`main.js` 與 `sw.js` 一起推送；不能只推 UI 或圖片。Pages 更新後於 4G／Wi‑Fi 各重開手機遊戲，確認選角載入提示、地圖／首波怪物／英雄圖片、F 大絕與既有 R 商店。離線快取名稱為 `sky-strike-v0.41.0`，切版後關閉舊分頁再開。

## v0.40.1 發布檢查

發布時必須同時包含 `hero-hunter-actions-unarmed-v4.png`、`ArtSystem.js` 與 `sw.js`（快取 `sky-strike-v0.40.1`）。部署後關閉舊分頁，重開並實際購買王國弓確認無棋盤格；只上傳 PNG 而未改美術引用不會修復。Pages 狀態需在 GitHub 部署紀錄中確認。

## v0.40.0 發布檢查

此批八張新圖集必須連同 `config.js`、`FactionSystem.js`、`Monster.js`、`WaveCatalog.js`、`ArtSystem.js`、`td.html`、`td.css`、`sw.js` 一併部署。手機與電腦分別驗證建造卡、召喚、商店、30 波預告，並關閉舊分頁後重開以避免舊快取；目前正式快取版本以 v0.40.1 章節為準。

## v0.39.0 發布檢查

確認 `sw.js` 使用 `sky-strike-v0.39.0` 並快取五張新增圖集。發布後重開分頁，煙霧測試跨族傭兵、元素／幽魂／亡靈、三英雄武器換裝、雷霜連鎖、魔焰濺射及 390px 手機精簡／展開面板。除非使用者明確要求，本地版本不自動推送 GitHub。

## v0.38.0（2026-09-12）

完整部署 v0.38.0 的 HTML、CSS、src、assets 與 sw.js；快取名稱已升至 sky-strike-v0.38.0。部署後關閉舊遊戲頁並重新開啟，確認難度卡顯示 30 關與金幣倍率。此回合只修改本機，尚未發布至遠端。

## v0.36.0 發布檢查

部署方式不變；必須一併發布 `faction-knight-v1.png`、`faction-treant-v1.png`、`faction-golem-v1.png`、`enemy-shaman-actions-v1.png`、`enemy-healer-actions-v1.png`、`enemy-boss-actions-v1.png` 與相關程式／樣式。確認 `sw.js` 快取名稱為 `sky-strike-v0.36.0`。發布後各選一次三族、確認 3 名守軍卡，並煙霧測試第 3 波術士與第 5 波祭司／Boss。除非使用者明確要求，本地版本完成不會自動推送 GitHub。

## v0.35.0 發布檢查

部署方式不變，但必須連同四張新 PNG、`ArtSystem.js`、`FactionSystem.js`、`TowerSkillSystem.js`、`TowerEvolutionSystem.js`、`config.js`、`td.html`、`td.css` 與 `sw.js` 一起發布。確認快取名稱為 `sky-strike-v0.35.0`；發布後逐一選擇三位英雄並確認英雄肖像、戰場人物與普通守軍不同，再各建造一座新增塔。

## v0.34.0 發布檢查

部署方式不變。確認 `sw.js` 的快取名稱為 `sky-strike-v0.34.0`，並上傳完整 `WaveCatalog.js`、`WaveSystem.js`、`Monster.js`、`EnemyCombatSystem.js`、`Hero.js`、`TDGame.js` 與測試／文件。發布煙霧測試至少覆蓋首波開始、模擬第 30 波完成、Lv.15 封頂與後期 Boss 增援。

## v0.33.0 發布檢查

此段為 v0.33.0 歷史發布檢查，不能用於 0.55.0。現行上線前應執行 `npm run check` 與 `npm test`、確認 `sw.js` 使用 `sky-strike-v0.55.0`，再驗證士兵定點、同兵種可重複部署、每名只裝一件，且換裝或販售會釋放軍械。

> v0.30.0 部署時必須包含 `FactionSystem.js`、`LootSystem.js`、`TowerEvolutionSystem.js`、`faction-structures-v1.png`、三種新守軍圖集與 `war-wolf-actions-v1.png`。`sw.js` 快取版本已升至 `sky-strike-v0.30.0`。

## 本機／隨身碟

發行時保留 `index.html`、`styles.css`、`src` 與版本文件。以 ZIP 封裝整個資料夾，解壓後可直接開啟。

## 靜態網站（選用）

可將相同檔案上傳至任何靜態網站空間；入口為 `index.html`，不需環境變數、建置命令、資料庫或後端。部署前執行 `npm test` 與 `npm run check`。

## GitHub Pages

專案已包含 `.github/workflows/pages.yml`。目前工作流程依 GitHub 官方 Pages 建議使用 `configure-pages@v5`、`upload-pages-artifact@v4` 與 `deploy-pages@v4`。

1. 在 GitHub 建立 Repository，將本專案推送到 `main`。
2. 進入 **Settings → Pages**，將 Source 設為 **GitHub Actions**。
3. 開啟 **Actions**，確認 `Deploy GitHub Pages` 的測試與部署成功。
4. Pages 顯示的網址通常為 `https://帳號.github.io/Repository名稱/`。
5. 用手機開啟該網址並以直向模式測試；需要時加入主畫面。

每次推送 `main` 都會先執行語法檢查與自動測試，通過後才部署。Repository 若為公開，遊戲原始碼與 Pages 網址也會公開。自訂網域必須另外在 Repository Pages 設定中配置，單放 `CNAME` 不等於完成網域設定。

GitHub Pages 部署依據：[GitHub 官方自訂工作流程文件](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)。

## PWA 與離線

`manifest.webmanifest` 提供主畫面名稱、圖示、直向與獨立視窗設定；`sw.js` 快取兩種遊戲及塔防 PNG。直接雙擊檔案時不註冊 Service Worker，只有 HTTP／HTTPS 部署才啟用離線支援。連線時採 network-first；本版快取為 `sky-strike-v0.17.0`，包含 `WaveCatalog`、`EconomySystem`、波次流程、跨裝置介面、作戰實體與動作圖集。部署後須同時開啟 Pages 根網址與 `/td.html`，並測試三種介面模式、準備倒數、波次預告、桌面／手機指令及建築繞行。

## v0.17.0 英雄與指揮介面

v0.17.0 快取為 sky-strike-v0.17.0，必須包含 hero-actions-v1.png。同步發布 td.html、td.css、TDGame、Hero、ArtSystem、td/main 與 sw.js。發布前驗證新頭像可載入、英雄四態動作、兩種版面、命令分類。無新增部署服務。

## v0.18.0 英雄技能與種族塔

本版有效快取名稱 sky-strike-v0.18.0（取代上方歷史版本名稱）。同步部署所有改動，尤其 faction-towers-v1.png、TowerSkillSystem.js、ShopSystem.js、Summon.js、td.html、td.css 與 sw.js。更新後重新載入，確認六塔按鈕及商店可用。未自動發布到網路。

## v0.19.0 英雄流派與傭兵館

最新快取為 sky-strike-v0.19.0。同步發布所有修改，尤其 HeroRoster.js、Hero、Summon、BuildSystem、ArtSystem、TDGame、td/main、td.html、td.css、sw.js。部署後核對三英雄技能名稱與傭兵館，未自動上傳任何服務。

## v0.20.0 敵軍動作第一階段

最新快取sky-strike-v0.20.0。同步發布三張新增PNG、Monster.js、ArtSystem.js、TDGame.js、sw.js；不能只換HTML。未進行網路部署。

## v0.21.0 RTS 指揮介面

最新快取為 `sky-strike-v0.21.0`。需同步發布 `td.html`、`td.css`、`src/td/main.js`、`src/td/TDGame.js` 與 `sw.js`。部署後以桌面和手機各驗證三段速度、暫停、Q／W／E／R、建造與商店；本次未自動發布到網路。

## v0.22.0 戰鬥回饋

最新快取為 `sky-strike-v0.22.0`。同步發布新增的 `CombatFeedbackSystem.js` 及 Projectile、Monster、Hero、HeroRoster、TDGame、HTML、Service Worker；缺任一檔可能讓頁面無法啟動。發布後以 ×3 驗證大量回饋仍流暢。

## v0.23.0 戰鬥生命週期

此為 v0.23.0 的歷史快取紀錄；0.55.0 的快取名稱請以本文件頁首與 `sw.js` 為準。發布時仍須包含 `EnemyCombatSystem.js`、Hero、CombatUnit、Monster、BuildSystem、CombatFeedbackSystem、TDGame、td.html 與 sw.js。發布後以三倍速驗證士兵定點、Boss 紅圈與英雄復活倒數。

## v0.24.0 黃金 15 波

最新快取為 `sky-strike-v0.24.0`。發布時同步上傳兩個新系統、WaveCatalog、WaveSystem、EconomySystem、Monster、Projectile、Hero、ArtSystem、TDGame、HTML、CSS、測試與文件。發布後重新整理兩次並確認四難度、城門生命與難度名稱一致；本次未自動部署到網路。

## v0.31.0 戰地軍械

最新快取為 `sky-strike-v0.31.0`。發布必須包含 `ArmorySystem.js`、`equipment-atlas-v1.png`、Hero、CombatUnit、ArtSystem、LootSystem、TDGame、HTML、CSS、Service Worker、測試及文件。部署後重新整理至新 Service Worker，確認第 3 波掉寶、軍械庫配置與手機介面無水平溢出。本次只修改本機專案，未自動發布。

## v0.32.0 唯一軍械

最新快取為 `sky-strike-v0.32.0`。同步發布 ArmorySystem、BuildSystem、TDGame、HTML、CSS、Service Worker 與文件；沒有新資產或外部依賴。部署後驗證三欄配置、轉裝、卸裝及守軍離場回收。本次未自動發布到網路。

## v0.32.1 手機 PWA

最新快取為 `sky-strike-v0.32.1`。部署必須包含 `manifest.webmanifest`、`td.webmanifest`、192／512／180 PNG 與 Service Worker。GitHub Pages 工作流程在 `main` 推送後執行檢查與測試，再發布整個靜態專案。發布後以手機從 `/td.html` 加入主畫面並驗證名稱、圖示與啟動頁。

## v0.32.2 首次部署修正

最新快取為 `sky-strike-v0.32.2`。`actions/configure-pages@v5` 設定 `enablement: true`，避免空白新倉庫因尚無 Pages Site 而回傳 404。推送後必須確認 Actions 的 deploy job 成功，並實際開啟 Pages URL。

正式部署已於 2026-09-12 驗收：GitHub Actions run `34619937429` 的第二次執行成功，站台為 `https://dat5512999-bit.github.io/sky-strike-hero-frontier/`，塔防入口為 `https://dat5512999-bit.github.io/sky-strike-hero-frontier/td.html`。


## v0.66.0 戰旗光環

完整部署 v0.66.0 專案靜態檔案，包含 src、td-combat.css、package.json 與 sw.js；service worker 快取版本為 sky-strike-v0.66.0。重新整理並在戰旗旁選取英雄，確認狀態與綠色加成。無資料遷移。


## 0.66.2 角色比例（2026-09-17）

發布 package.json、sw.js 與 src/td/systems/ArtSystem.js 的 0.66.2 版本。完整靜態專案部署方式不變；Service Worker 快取版本同步更新，關閉舊遊戲分頁後重新開啟。


## v0.66.3 侵蝕特效

完整部署靜態專案（含 src、package.json、sw.js）；快取升為 sky-strike-v0.66.3。更新後刷新頁面，以煉金術師或瘟疫尖碑命中敵人驗證。沒有資料遷移。

## 0.66.4 波次提示

波次預告改為怪物縮圖、數量與威脅標籤，新增入口倒數與短暫開戰提醒。操作、設定、架構、API、部署、還原與驗證方式見 [波次提示文件](WAVE_HUD_V0664.md)。


## 0.67.1 手機波次版面修正

修正波次與倒數重疊、速度列出界，縮小手機提示面板；無操作、設定或資料格式變更。原因、架構、更新、還原及觸控版面驗證見 [版面修正文件](WAVE_LAYOUT_V0671.md)。


## 0.68.1 波次避讓與預覽修正

波次改為靠左小列，預告按需展開，戰鬥提示可點穿；修正三種終極士兵卡片裁切。操作、API、架構、部署、還原與測試見 [版本文件](EDGE_WAVE_PREVIEW_V0681.md)。



## v0.68.2 藤蔓纏繞

完整更新靜態專案，包含 CombatFeedbackSystem.js、TDGame.js、package.json、sw.js；快取版本 sky-strike-v0.68.2。重新整理後用翠靈古樹命中敵人確認粗藤。無資料遷移。

## 0.68.3 士兵尺寸微調（2026-09-17）

我方部署士兵統一放大 12%，保留相對體型與腳底錨點；英雄、怪物、召喚物和卡片大小維持原設定。無新增操作、設定、API、權限或資料格式。ArtSystem.drawCombatUnit → 腳底縮放 → drawCombatUnitSprite；預覽直接使用未放大的 sprite 方法，避免再次裁切。

安裝與部署流程不變，完整更新後關閉舊分頁再開啟。package.json 與 Service Worker 快取更新至 0.68.3。修改前 ArtSystem.js、package.json、sw.js 保存在 artifacts/soldier-v0683-backup/；若需還原，將 ArtSystem.js 放回 src/td/systems/，其餘放回根目錄，已有後續修改時先比較合併，部署使用新的快取名稱。

驗證：342 項測試通過；全角色圖在 artifacts/qa-unit-scale/roster.png；三種終極士兵的六張卡片預覽仍完整。此版本只改畫面尺寸，射程、攻擊、碰撞與移動數值不變。


## v0.69.0 英雄技能與動畫完整顯示

完整部署 v0.69.0，包含新增 HeroSkillVFX.js、SpriteFrameBounds.js、td.html 與 sw.js。快取 sky-strike-v0.69.0；刷新後驗證技能差異與狼／元素攻擊動作。無資料遷移。
## 0.69.1 部署補充

靜態檔案與快取更新清單見 [版本文件](FIELD_LOOT_SHOP_V0691.md)。

## 0.69.7 雙隘口路線校準

依正式圖片的鋪石路面重新取樣上下道路中心，修正彎道偏向路緣；共用末段長度同步計算。沿用 maps → Monster／BuildSystem／MiniMapView 架構，不改圖片、素材腳底或 API。重新開始遠征即可使用新座標，無設定與存檔遷移；部署完整版本與新的 Service Worker 快取。回復前資料在 artifacts/route-v0697-backup，請逐檔比較，避免覆蓋其他工作。

6 項雙路測試與語法檢查通過；新增獨立路面取樣回歸、完整路線怪物截圖，見 artifacts/qa-twinpass/full-route-battle.png。全套當次為 375/377 通過，兩項旗幟／統領光環測試失敗，涉及另行修改中的軍團平衡，未在此地圖修正中改動。
## 0.71.1 部署補充

一併部署 `BattleReportSystem.js`、`TDDifficultySystem.js`、`TDGame.js`、`td.html`、`package.json` 與 `sw.js`。此功能自 0.71.1 起提供；目前整包離線快取為 `sky-strike-v0.71.2`，無後端或資料庫遷移。
# v0.74.0 部署

部署後確認 Service Worker 快取為 `sky-strike-v0.74.0`，重新載入並在戰況看到「第三階段平衡判定」。無資料庫或伺服器部署步驟。
# v0.75.0 部署

部署後確認快取為 `sky-strike-v0.75.0`，邊境補給說明不含功勳，建築 Lv.4／Lv.5 顯示 1／2 功勳；商店仍顯示 1000:1 雙向兌換。
# v0.76.0 部署

部署後確認快取為 `sky-strike-v0.76.0`，開局顯示 `v0.76.0 · BALANCE E2`。重新整理後才開始新版樣本；既有進行中分頁仍使用載入時的舊程式。
# v0.77.0 部署

部署時確認 `ChapterCheckpointSystem.js` 可載入且離線快取名稱為 `sky-strike-v0.77.0`。舊版沒有相容檢查點，不需要遷移。
# v0.78.0 部署

離線快取名稱為 `sky-strike-v0.78.0`，並包含對戰頁面、樣式與六個對戰腳本。部署後從 `td.html` 開局頁測試對戰入口及返回遠征連結。
# v0.78.1 部署

離線快取更新為 `sky-strike-v0.78.1`，並列入對戰背景。部署後應檢查背景、工人、三兵種、塔與兵營均可顯示。
# v0.79.0 部署

快取版本為 `sky-strike-v0.79.0`。部署後測試建造預覽／取消、維修／拆除、規則面板、暫停選單及桌面／手機橫向版面。

# v0.79.1 部署

快取版本為 `sky-strike-v0.79.1`。部署後重新載入英雄遠征，確認開局介面無對戰原型連結。
# v0.79.2 部署

快取版本為 `sky-strike-v0.79.2`。部署後確認開局只顯示地圖、難度、英雄與軍團選擇，且完成戰局後戰報可正常儲存。
