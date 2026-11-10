# iOS App Store 上架準備

2026-11-10 更新：本機診斷、背景恢復與離線隱私說明已納入 v0.85.106 玩家開發包，詳見 [診斷操作與驗收](DIAGNOSTICS_V085106.md)。未公開部署或原生送審，發行者／客服及真機缺項未解除。

2026-11-10 更新：手機穩定性修正及 iOS 玩家開發資源包同步 v0.85.105；按需載圖、縮圖失敗隔離與復原驗證詳見 [v105 交付](MOBILE_STABILITY_V085105.md)。原 v104 包已備份，送審與實機缺項仍未解除。

2026-11-07 更新：三款付費造型已完成重製，網站與 iOS 開發資源包同步 v0.85.104，舊購買紀錄保留。詳見 [v104 交付與驗收](CHIEF_SKINS_V085104.md)；下方保留原輪次紀錄，送審缺項仍未解除。

2026-11-03，iOS 準備工具 v1.2.0，遊戲 v0.85.102。已完成離線 Web 資源包、Capacitor 設定、獨立正式玩家模式，以及 App 內離線隱私／支援說明與素材盤點工具；尚未產生、編譯或簽署 Xcode 工程，也沒有 IPA 或 TestFlight 版本。正式隱私資料、授權、商店資料與真機驗收仍未完成，不可直接送審。

## 產品與開發順序

1. 已完成：獨立打包、版本清單、停用包內網頁更新與 PWA 安裝提示、保留原網站。
2. 已完成：正式玩家模式。在打包時轉換 ProfileStore 與 FrontierApp，移除管理者切換、測試輪次與網頁更新入口，資料層拒絕切換／新增／還原測試輪次。開發網站與其存檔保持原樣。
3. 已完成 App 內離線隱私與客服說明入口；發行者確認名稱及客服信箱「尚未決定」，不放假資料。公開政策與客服網址、政策確認及原生 SDK／Required Reason API 盤點仍待完成，再填 App Privacy 與隱私清單。
4. 逐項確認角色造型、圖片、配音及音樂的商用權利。以權利紀錄決定是否保留每項內容。

   2026-11-03 已完成本輪[素材來源與商用依據審查](IOS_MATERIAL_RIGHTS_REVIEW.md)：使用者確認全部圖片與參考圖為本專案生成／自繪，564 圖片已附來源聲明；五個配音核對供應商商用聲明，程序配樂核對程式來源。逐檔證據分類與八張封面視覺檢查已記錄，不自動簽署法律核准，未要求整批替換素材。下方 v1.2.0 的 38 個紀錄命中為當時較小搜尋範圍，完整新版分類見審查文件。
5. 整理資源；目前全部打包約 879 MB，並非啟動下載量。先查實際引用再移除，避免故事或造型缺圖。
6. Mac 建立原生工程，加入正式圖示、旋轉與安全區、背景暫停和恢復、存檔匯出匯入與音訊生命週期處理，再進行 iPhone 真機驗證。
7. 設定 App Store Connect、分級、商店素材、簽署，先送 TestFlight，再送審。

現有商城使用遊戲貨幣。是否加入真錢付費、售價與商品尚未定案；如果要用真錢解鎖虛擬商品，必須依當時適用的 Apple 規則設計內購、交易驗證與恢復購買，不能把目前本機錢包當成付款系統。

## 架構與資料

```text
既有網站來源 → build-static-site 的檔案清單
             → prepare-ios.cjs
               → 排除 sw.js、update.html 與網站 index
               → 轉換包內 main、mobile-pwa、update-client
               → native/ios/www ＋ ios-build-manifest.json
                 → Capacitor sync → Xcode → 真機／TestFlight → App Review
```

`native/ios/package.json` 獨立宣告 Capacitor 8 系列相依套件；Windows 這輪沒有下載或安裝它們。第一次在 Mac 安裝後，須保存 package-lock.json 並以 npm ci 重現相同版本。`capacitor.config.json` 的 webDir 指向 www，沒有 server.url，遊戲資源不依賴遠端網站更新。Bundle ID 目前是 `com.example.herofrontier`，僅供開發配置，須換成發行者擁有且已註冊的識別碼。

沒有新增伺服器、資料庫或網路 API。遊戲仍使用本機 ProfileStore、錢包與排行榜。iOS 包改用 `heroFrontierPlayerV1` 鍵與 `edition: ios-player` 存檔，只包含一份玩家進度；內部沿用 test 身份代號以相容戰報，但畫面不呈現測試輪次。新玩家沒有管理者鑽石，僅能使用初始及正常獎勵解鎖的內容。所有寫入均先驗證玩家身份；isAdmin 固定為 false，allows 只依玩家解鎖清單判斷。

開發網站仍用原本 `heroFrontierProfilesV1`，作者的管理者 99999 鑽石及封存進度不受影響。iOS 只接受本版玩家格式的備份，開發者／管理者／壞格式備份會在寫入前拒絕；有效玩家匯入先保留舊資料。原 Safari 與 App WKWebView 不共用儲存，開發者備份暫無轉移工具，不能承諾自動遷移或雲端備份。匯出下載、文件選取與重新安裝後還原仍需真機驗證。此本機模式隔離不等於伺服器反作弊或真錢交易驗證。

## Windows 製作與驗證

在專案根目錄執行：

```text
npm run ios:check
node --test tests/ios-packaging.test.js
npm run ios:prepare
npm run ios:audit
npm run ios:release-check
```

check 只計算清單與阻擋項。prepare 產生約 879 MB 的本機開發資源，不會上傳、安裝程式或操作 Apple 帳號。輸出包含 `playerMode: true`、工具版本、`releaseReady: false` 與五類送審阻擋項；check 成功不代表通過 App Review。若 www 已存在，工具拒絕覆蓋；先將舊 www 移到 artifacts 下的新備份目錄，再重新產生。不可把舊輸出直接混合成新版。

本次全套 1,191 項測試通過。新增六項玩家模式測試涵蓋初始錢包、開發存檔隔離、資料層拒絕管理者／測試輪次、一般獎勵／錢包／外觀偏好、備份恢復、壞存檔保留與 UI 編譯；沿用打包的來源不變與拒絕覆蓋檢查。隔離 Edge 實際載入輸出包，驗證管理者入口消失、UI 與資料呼叫被拒、玩家備份匯入與重新載入保留、Worker 註冊數為 0、無 JS 例外。檢視桌機 1280×800 與觸控 393×852 的橫向手機殼截圖；狹窄桌機 viewport 不代表手機殼測試。

重現：使用既有 Playwright 與 Edge 執行 `npm run qa:ios-player`，輸出在 `artifacts/ios-player-mode`，測試只操作隔離瀏覽器。這不是 WKWebView 或 iPhone 認證。www 不納入 Git；未來原生 ios 工程應納入版本管理，勿提交簽署私鑰、憑證或帳號機密。

### 隱私客服與素材盤點 v1.2.0

設定中的「隱私與本機資料說明」與「客服與常見問題」可離線閱讀，按返回設定回到原遊戲，不重建玩家進度。產生的 `ios-privacy.html`、`ios-support.html` 僅進入 native/ios/www，不會改變 Pages 網站。內嵌說明無腳本或外部資源；發行資訊經 HTML 轉義，公開網址限制 HTTPS。這兩頁目前標明開發版，不能代替正式公開政策與支援網址。

發行資料集中在 `native/ios/legal-config.json`。publisherName、supportEmail、privacyPolicyUrl、supportUrl 目前均為 null，policyApproved 為 false；收到實際資料並檢查後才可填入，不要拿 example 網址或測試信箱送審。不要僅為消除缺項而設定 policyApproved。更新設定後需重新打包。本機說明涵蓋存檔、遊戲貨幣／造型、設定、備份及恢復風險；沒有承諾真機文件匯出、雲端備份或 App 內資料刪除功能已完成。

原始碼盤點目前發現：ProfileStore／各設定使用本機儲存；RankingDataSource 讀取本機戰績；HeroVoice fetch 僅接受 assets/audio/voices 下的相對音檔；地圖編輯工具有本機 studio API，不是玩家帳號伺服器。尚未發現遊戲接入廣告、分析、追蹤或真錢付款服務，但這不是完整原生隱私認證。Capacitor 依賴未安裝，不能先填 Required Reason API 原因碼或直接宣告最終 App 不蒐集資料。參考 [Apple App Privacy Details](https://developer.apple.com/app-store/app-privacy-details/) 與 [Privacy Manifest](https://developer.apple.com/documentation/bundleresources/privacy-manifest-files)，以實際原生工程及第三方 SDK 決定最終答案。

`npm run ios:audit` 為 569 個規劃發布的媒體建立路徑、大小、SHA-256 與可直接對應的製作紀錄，完整報告在 `artifacts/ios-compliance/content-audit.json`。媒體共 876,034,957 bytes，其中 38 個可直接對應目前挑選的 JSON 製作紀錄；這不是所有可能證據的完整搜尋，也不是其餘檔案沒有來源的結論。全部權利狀態為 pending-review、核准數為 0。圖像生成提示或供應者聲明不是完整商用授權證明；需逐項確認生成服務條款、參考素材、角色設計及第三方權利。戰牛配音已有 provider-rights.json，但仍須發布前覆核該服務與上游條款。

`npm run ios:release-check` 在此準備階段刻意以非零狀態回報尚不可送審，不會上傳或自動批准權利。即使聯絡資料填齊，也仍需完成素材及原生審查後擴充發布驗證。一般 `ios:audit` 可正常產生報告。

本輪全套 1,194 項測試通過；新增三項法律頁生成、資料轉義／網址檢查與入口測試。實際打包後的 Edge 回歸也驗證兩頁可讀、可返回設定、閱讀前後錢包不變，並檢視截圖。舊工具 v1.1.0 輸出移至 `artifacts/ios-backups/pre-legal-pages-1.1.0`，原檔可回復；未部署或送審。

## Mac 安裝與簽署交接

依官方 Capacitor 8 文件，需要相容 Node 版本、macOS、Xcode 26 以上與 Command Line Tools；上架 SDK 要求以 Apple 當天公告為準。Mac 上依序：

```text
cd native/ios
npm install
npm run prepare:web
npm run add:ios
npm run sync:ios
npm run open:ios
```

首次安裝後保存 lockfile。已有原生工程時跳過 add:ios。先修改正式 Bundle ID，再設定 Xcode 的 Team、最低支援版本、Build number 與簽署。不要把 Apple 密碼或私鑰貼到聊天。此配置未在 Mac 上編譯，最低 iOS 版本與原生隱私清單必須依實際選定 Capacitor／SDK 驗證。

需要發行者提供的資料：Apple Developer Program 帳號與 App Store Connect 存取、正式 App 名稱與 Bundle ID、客服聯絡資料、隱私政策公開網址、預計是否有真錢付費。App 隱私與年齡分級答案要符合實際產品，不能先填成無資料或低分級以求通過。

## 手機操作與 QA

正式玩家應直接進入遊戲，無需理解管理者、測試輪次、PWA 安裝或網站版本握手。App 更新交由 App Store，重要提示以玩家可理解的語句呈現。

真機須驗證：首次離線開啟、橫直旋轉與瀏海安全區、觸控選塔與配裝、低記憶體與發熱、長時間戰鬥、背景暫停與回前景、音訊中斷、存檔匯出／匯入／更新保留，以及遊戲各章節與商城內容。桌機 viewport 與 JavaScript 測試不等於 iPhone 認證。

## 部署備份與回復

現有 GitHub／Pages 部署不受這套獨立打包流程影響。提交前同時保留現有 v0.85.101／102 工作，不做 reset。上一份工具 v1.0.0 的輸出已移至 `artifacts/ios-backups/pre-player-mode-1.0.0`，沒有刪除；需要回復時可在獨立目錄檢視，不要將含開發功能的舊包送審。每次打包保留版本清單、原始碼版本與對應 lockfile；發布前備份玩家測試存檔。App Store 發布後的回復通常需以更高 Build number 提交修正版，不能假設能直接降版。網站回復與 App 發布是兩套流程。本輪未提交、推送或上傳。

## FAQ

**現在能上傳到 App Store 嗎？** 還不能。只有開發資源與配置，原生工程、簽署與送審阻擋項尚未完成。

**Windows 可以直接產生正式 IPA 嗎？** 這套流程的 iOS 編譯需要 Mac；若使用雲端 Mac，也仍需要 Apple 簽署與真機驗證。

**包一層網頁就一定能通過嗎？** 不保證。需符合完整性、娛樂價值、隱私、付費與內容權利等審核要求。

## 官方依據

- [Capacitor 環境要求](https://capacitorjs.com/docs/getting-started/environment-setup)
- [加入既有 Web 專案與 sync 流程](https://capacitorjs.com/docs/getting-started)
- [Apple 上傳 SDK 與分級要求](https://developer.apple.com/news/upcoming-requirements/)
- [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [App Review 所需支援與隱私連結](https://developer.apple.com/app-store/review/)
