# 商城視覺重製 0.2.0

依使用者對 0.1.0 與參考圖落差的回饋，重製 PC 與手機橫向介面。0.1.0 的問題是美術與商城主題不一致、商品圖偏小、角色預覽被技術說明壓縮，以及缺少原圖的金屬框飾與光影層次。本版維持商城業務邏輯與 Core 隔離。

## 實際變更

- 新增五份商城專用美術：霜華公主立繪、冰雪公主／霜狼橫幅、赤焰魔神立繪、紫色鳳凰特效概念、黑金商人殿堂背景。
- PC 改為五張主打商品並列＋下方典藏陳列、右側較大角色立繪、縮圖式預覽列、金色切角購買區。
- 手機橫向使用獨立 CSS：縮窄分類軌、五張可觸控商品卡、全幅雙欄詳情，保留 Safe Area。小螢幕商品區允許水平／垂直捲動，主卡價格與狀態可見。
- 以 `ShopArt.js` 集中原生 SVG 分類圖示與水晶；不用字元符號模擬商城主要圖示。以 `ShopTemplates.js` 分離畫面模板，`ShopView` 管理互動與生命週期。
- 預覽細節改成橫向縮圖列；「造型內容與展示說明」可展開，技術說明不再壓縮主要角色畫面。
- 真實支付、Save、Core 完全不變。商品 id、targetId、價格、Mock 初始所有權和 revision 規則均保持不變，概念美術與顯示名稱更新。

## 安裝、設定與部署

沿用 `node scripts/serve-test.js` → `/shop.html`，不需新 npm 依賴。更新時需一併複製 `assets/td/shop/`、新 `ShopArt.js` 和 `ShopTemplates.js`；只更新 CSS 或 HTML 會導致資產缺漏。嵌入載入順序：Schema → Catalog → Store → ShopArt → ShopTemplates → ShopView。沒有修改 Service Worker。

美術由內建 `image_gen` 產生，完整提示詞、生成方式與最終工作區路徑見 [ART_MANIFEST.json](../../assets/td/shop/ART_MANIFEST.json)。美術皆為獨立圖片，文字／按鈕／價格仍由真實 HTML 與資料層產生；沒有把參考圖整張當成介面。

## QA 與交付邊界

重跑桌面 1920×1080、1366×768、觸控橫向 844×390、932×430，以及 Safe Area 47px 左右／21px 下方。追加 Logo 不越過畫面頂端、橫幅文字不裁切、六組分類 SVG 皆存在等檢查。結果見 [QA_REPORT.md](QA_REPORT.md)。仍未驗證實機 iOS Safari。

目前新的立繪、橫幅與特效商品图是概念美術，不宣稱已提供对应戰鬥動畫、VFX、語音套件；展開說明可見原版 fallback 的範圍。外觀裝備狀態仍僅存在商城 Memory Adapter。

## 回復与合併

上一版 commit 為 `2c18497`。可使用 `git worktree add ../shop-v010 2c18497` 獨立預覽上一版；不要覆蓋另一開發線的未提交內容。撤回本次重製可 revert 本次提交。兩版均無正式 Save 變更，不需資料遷移。

本次繼續在 `feature/shop-ui` 提交，不 merge main。未來 P0/P1 大廳整合時需補載新增兩個呈現模組，其他接點依 [MERGE_NOTES.md](MERGE_NOTES.md)。
