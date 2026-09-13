# 部署手冊

## v0.44.1 待發布檢查

v0.44.0 已部署成功，v0.44.1 巡林者持弓修復目前只在本機；沒有使用者明確要求時不要推送。發布時需整批包含 `ArtSystem.js`、`sw.js`、`package.json`、測試與文件；確認 Pages 完成後分別測試職業弓 Lv.1～3、獅心王弓、不持有新弓及左右轉向。快取名稱為 `sky-strike-v0.44.1`，更新後需關閉舊分頁重開。

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

靜態部署方式不變。上線前執行 `npm run check` 與 `npm test`，並確認 `sw.js` 使用 `sky-strike-v0.33.0`。在 HTTP／GitHub Pages 環境至少以標準難度部署一名守軍，再驗證負傷後裝備仍由原單位持有；另以災厄驗證永久陣亡會釋放軍械。

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

最新快取為 `sky-strike-v0.23.0`。發布時必須包含 `EnemyCombatSystem.js`、Hero、CombatUnit、Monster、BuildSystem、CombatFeedbackSystem、TDGame、td.html 與 sw.js。發布後重新整理確認新版 Service Worker 接管，再以三倍速驗證守軍 HP、Boss 紅圈與英雄復活倒數。

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
