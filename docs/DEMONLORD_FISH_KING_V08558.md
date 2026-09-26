# 第 50 波魚人王重製 · v0.85.58

## 原因與範圍

使用者指出舊魔王太像娜迦英雄，並要求沿用先前類似河豚的概念。已找到 `assets/td/concepts/naga-v1/04-siltwater-demonlord.png`：圓臉、厚下巴、鼓肚、魚鰭、角冠、雙腳、鏽甲與鉤杖的魚人王。內建 image_gen 依此角色身分及既有遊戲圖集風格製作 16 格動畫，而非繼續使用蛇尾型魔王。

只修改第 50 波外觀。怪物 ID、名字、生命、攻擊、移速、碰撞、掉落、階段能力與援軍均不改。娜迦英雄圖片及外觀程式不改；英雄 PNG SHA-256 保持 `c0a2e3ec1fa0873eb7afdb2a7aa4a464df5610f88d2fb6b12a03a044c4147c03`。

## 素材、架構、API

- 正式圖：`assets/td/bosses/demonlord-actions-v2.png`，1254×1254 RGBA，16 個分離主要角色區塊。
- `demonlord-actions-v1.png` 是格距不足的初稿，不載入；舊蛇尾魔王仍保留供比較與素材失敗時回退。
- 完整提示／參考圖路徑：`assets/td/bosses/demonlord-prompts.json`，內建 image_gen 製作。
- 流程：`WaveSystem → BossVisualCatalog(demonlord) → BossSpriteBounds.demonlord → 圖集`。WaveHUD 使用相同圖集縮圖；不新增 HTTP API、資料庫、存檔欄位或權限。
- BossVisualCatalog 將第 50 波由 original 改為新圖集。圖像按需載入，來源裁切／腳底錨點逐幀定義，目標高度仍 116。

## 玩家操作、安裝與更新

遊戲操作及安裝依賴不變，更新後重新整理並確認 0.85.58。自由遠征第 50 波預告與戰場會顯示新魚人王。既有戰局如尚未換圖，請重新載入後開新局；不需刪除存檔。

開啟 `boss-preview.html`，下方新增「娜迦英雄／舊版魔王／新版魔王」比較，沿用正式渲染器。動作選單、暫停、逐格和轉向可一起操作，不寫入玩家資料。

## 管理、部署與回復

部署需同步帶上 BossVisualCatalog、BossSpriteBounds、新 PNG、預覽頁／腳本、sw.js 及同版版本檔。遊戲無新增套件；QA 工具沿用 Playwright、Edge、pngjs。此回合只有本機實作，未遠端部署。

圖片首次載入失敗時暫用舊魔王，保持遊戲可運作。預覽頁有重試載入按鈕。離線前先在連網下開啟比較頁下載素材。

保留完整已驗證版本作為整版備份。只回復第 50 波到 v0.85.57 外觀時，將 BossVisualCatalog 的第 50 波 path 回復 `assets/td/naga/siltwater-demonlord-actions-v1.png`，original 回復 true；更新快取版本並重載。新舊素材皆保留，不清除玩家存檔。`BossVisualCatalog.enabled=false` 會回退所有首領外觀，不是只回退第 50 波。

## 測試與限制

- `npm run test:boss-visuals`：驗證新版圖集、英雄原圖雜湊、實際出兵、四難度戰鬥數值不變、裁切、各動作朝向、失敗回退及 Canvas 狀態還原。
- `node --test tests/td-wave-50-balance.test.js`：波次壓力與第 50 波四族援軍回歸。
- `npm run check:boss-visuals`、靜態交付資產檢查。
- 首領、波次壓力、HUD、靜態交付合計 32 項全部通過；最終全專案 794 項中 791 通過、3 項地圖測試失敗（建造點／空地及 western signal 邏輯規則），不宣稱整個專案測試全過。
- `npm run qa:boss-visuals`：Edge 正式渲染器 400 個角色繪製組合，十個波次 HUD／出兵 ID；新版圖透明像素約 73.8%，不是畫成黑色底。
- 人工查看 `artifacts/boss-visuals/hero-vs-demonlord.png` 並排截圖；待機、攻擊、死亡圖亦由預覽工具輸出。
- 非整場 50 波實玩或全遊戲發行認證。先前獨立地圖發佈／2-2 地圖測試問題不在本次修改範圍。

## FAQ

**這就是原本河豚概念嗎？** 使用原本 04 號魚人王概念作為角色身分參考，保留圓厚魚人造型並轉成實際尺寸動畫，不是直接把概念海報貼進戰場。

**會增加反傷或膨脹技能嗎？** 本次沒有，只重做美術與出手動作；能力與平衡維持原樣。
