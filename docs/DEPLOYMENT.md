# 部署手冊

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
