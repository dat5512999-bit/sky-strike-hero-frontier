# v0.85.85 劇情與商城整合交付

## 產品範圍與開發順序

本版整合 v0.85.84 之後尚未發布的內容：第一至第四章 16 關及西境預告共 86 幕逐幕配圖、九種逐幕情緒配樂、四款英雄外觀、地精工程團「工地防衛公司」外觀，以及管理者試用資源補足。它不是新增可玩英雄或軍團；外觀不改戰鬥數值、技能、武器升級、士兵軍械或戰利品。先確認內容與素材，再驗證存檔／商店／戰場整合，最後同版發布 HTML、JS、PNG、文件與 Service Worker。

## 架構、資料與介面

```text
StoryCatalog 的逐幕 image / musicMood → FrontierApp 故事卡 → StoryMusic Web Audio
SkinCatalog 的商品／目標 → ProfileSkinAdapter 玩家存檔 → CrossworldSkinArt／FactionSkinArt 戰場圖
```

沿用 `src/td/app`、`src/td/shop`、`src/td/systems` 與 `assets/td` 原有分工，沒有伺服器 API 或資料庫。逐幕配圖採既有按需載入；11 張新增故事圖約 28.4 MiB，慢網路首次開幕仍需實機觀察。音樂在劇情頁播放，切幕轉換，離開劇情／背景分頁停止；音樂偏好使用本裝置的 `heroFrontierStoryMusic`，與戰場音效分開。商城購買仍只使用遊戲內試用水晶；管理者檔首次補到 99,999，設一次性旗標，不在每次開啟時重複補發。既有玩家檔格式維持相容。

玩家從大廳進劇情即可逐幕觀看、使用「♫ 音樂」開關；從商城可預覽新外觀，購買後另按裝備，回到自由遠征選對應英雄或地精軍團。外觀圖未載入時沿用原角色／建築圖，不阻斷戰鬥；未支援 Web Audio 時音樂按鈕標示不可用。若仍見舊畫面，先核對大廳 v0.85.85，關閉舊分頁並重新開啟，必要時使用 `update.html` 切換快取。

## 安裝、發布、備份與回復

第一次安裝維持 Node.js ≥18，於專案目錄執行 `npm run serve:test`，開啟 `http://127.0.0.1:4173/td.html`。發布使用 GitHub `main` 與 Pages，應同時包含新圖、`StoryCatalog.js`、`StoryMusic.js`、商店與外觀渲染器、入口及 `sw.js`，快取鍵為 `sky-strike-v0.85.85`。部署後執行 `npm run verify:pages` 逐檔比對；不要只更新 HTML。更新前匯出玩家 JSON，保留上一完整 Git 提交。回復須整版回退程式、素材及 Worker 快取鍵，不刪玩家資料；本版無資料庫遷移。

## QA 與已知限制

- 本機 `npm test` **1003/1003**、`npm run check`、`npm run check:release`、`npm run balance:audit`、`npm run enemy-balance:audit`、`git diff --check` 通過；劇情逐幕圖、配樂、商城、存檔與離線路徑均有聚焦測試。
- 本機瀏覽器抽查 v0.85.85 入口、故事卡切幕／情緒及商城五款商品，沒有腳本警告。發布後仍須驗證 Pages 實際檔案一致。
- 新造型是原創透明逐格素材，商城與戰場渲染器已連結；部分生成圖的特效靠近固定格邊，戰場可能裁掉少量光效。曾嘗試重排一張圖，但結果仍未達逐格安全標準，故未納入。角色本體與商品可用，專業美術逐格重製仍列後續項目；不得宣稱全部動作美術無裁切。
- 真人聆聽、橫向實體手機、慢速網路首載，以及自然 50 波長局流暢度尚未由本機自動測試證實。程序配樂是第一版，未宣稱錄音室級音質；沒有真實金流。

## 文件與維護入口

玩家、管理者、API、FAQ、架構、安裝、部署、備份、測試清單和更新紀錄均於本版同步。細節見 [逐幕配圖](STORY_CARD_VISUAL_DIVERSITY_V1.md)、[配樂](STORY_MUSIC_V1.md)、[外觀商城](COSMETIC_RELEASE_V0847.md)；未來加英雄或軍團須重新遵守 `skills/hero-faction-content/SKILL.md` 的武器、軍械、掉落與逐格驗收流程。
