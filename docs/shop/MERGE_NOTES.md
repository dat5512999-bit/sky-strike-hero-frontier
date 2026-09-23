# 合併注意事項

> 主目錄整合狀態 v0.83.5：已依使用者此次需求完成主入口、素材與 SW 接線，沒有整個 Git merge。以下「尚未整合／不 merge」描述保留為原分支交接歷史，不代表目前入口狀態。 詳見 [商城與圖鑑整合交付](../FEATURE_INTEGRATION_V0835.md)。

- 分支：`feature/shop-ui`；基底：`7f6fa5c`。原工作目錄繼續停留在 main，其未提交內容未被搬移、stash 或提交。本次不 merge main。
- 商城改動新增 `src/td/shop/*`、`shop.html`、`shop.css`、測試與 QA。沒有改 `TDGame.js`、`td.html`、`td.css`、`src/td/app/*`、任何戰鬥 systems、`sw.js` 或 package.json。
- README、CHANGELOG 與 docs 的索引附加文字可能與 P0/P1 衝突，請保留兩邊記錄；商城模組版本 0.3.0 與全域遊戲版本分開，不可用商城基底的 package 覆蓋 P0/P1 新版本。
- 先讓 P0/P1 的導航、生命週期與玩家 ID 穩定，再由其負責人在商城路由明確 mount `ShopView`；離開時 destroy。不能把戰鬥資源商城改接這個模組。
- 一併載入 SkinSchema、SkinCatalog、SkinStore、ShopArt、ShopTemplates、ScrollRail、ShopView 與 scoped shop.css；嵌入時勿載入独立 main.js。ShopView 支援 `onClose`，不會改寫 history 或主程式方法。
- Save 整合只替換 Adapter。必須依 profile 隔離、atomic commit/CAS、驗證版本；玩家切換重新建立 store。不要將 mock balance/ownership 遷入正式付費資料。
- `appearance()` 回傳的是美術描述，尚未接入英雄選角、戰場、召喚或技能 renderer。由呈現層消費 slots；原版 fallback、幀數與動作時序、音量管理須保持既有 Core 決策。禁止用 skin 設定修改碰撞／ATK／HP／掉落／積分／排名。
- 本版部分 slots 明確 null；可預覽原版 fallback。正式 skin 完成美術驗收前不可宣稱已提供全部替換資產。
- PWA／離線快取在本次範圍外；網站發版時由部署分支決定是否將商城加入 sw manifest。
- 合併後重跑全套 tests、商城瀏覽器 QA、既有故事／戰鬥／Save 測試，另補 iPhone 實機 Safari 瀏海與主畫面模式測試。本版紀錄為 Edge 觸控模擬，不等同 iOS Safari 實機。
- 回復：撤銷商城 commit 或另開基底 worktree；不可 hard reset 另一開發線的未提交內容。

- 0.2.0 新增 assets/td/shop 概念美術；部署時不可漏掉。上一版視覺可在 2c18497 檢視。Skin ID 與 Store 契約不變。


- 0.3.0 新增 skin-lab.html/css、src/td/skin-lab、霜華動作試作；它只讀現有 Hero/ArtSystem 等模組，沒有正式 renderer hook，不可當作已完成戰場換裝。ScrollRail.js 必須在 ShopView.js 前載入。
- 合併時先確認 P0/P1 的 arcanist ID、動作圖、drawHero 方法與武器分層契約；比較頁以基底 7f6fa5c 驗證。霜華目標對應 arcanist；原版戰場圖修正為 hero-actions-v1.png。完整缺口見 SKIN_FEASIBILITY_V030.md。

## Skin Lab 0.3.1

施法改用獨立四格素材與足點，修正裁切／鄰格碎片，鏡頭保留完整光效空間。新增 PNG 必須隨版部署；API、操作、管理、更新回復、架構與測試見 [施法修正交付](CAST_FIX_V031.md)。Core、存檔與付款範圍不變。
## Skin Lab 0.4.0

新增 HeroLooks.js、六張 sun／moon 圖片及三英雄切換。載入順序必須為 PreviewModel → HeroLooks → main；資料僅供試裝，不加入正式販售或 Store。合併前確認 arcanist／hunter／rogue ID、原圖 bounds 與 drawHero 契約；比較頁原版繪圖以 gear:null 的副本排除 Armory 依賴，不修改真實 Hero。正式武器分層、戰局接入與 Save 仍屬後續工作。文件衝突保留雙方紀錄，參閱 [0.4.0 交付及回復方式](HERO_LOOKS_V040.md)。本次不 merge main。
