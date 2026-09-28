# v0.85.73 第四章：潮門回聲

日期：2026-09-28。版本：0.85.73。

## 玩家內容

第四章延續第三章的可重測異常，讓既有的娜迦英雄「破潮者・賽洛」與娜迦潮衛以觀測夥伴身分正式加入主線。這不是新的英雄／軍團解鎖：新玩家與舊存檔仍可直接在自由遠征選擇娜迦；其初始三叉戟、三段商店升級及既有軍械相容性均維持不變。

依序完成下列任務以推進故事並將各地圖加入自由遠征：

1. 4-1「潮門外流」：8 波，記錄第一次潮流回折。
2. 4-2「鹽潮航道」：9 波，以潮向與壓力重測。
3. 4-3「礁環交會」：10 波，雙入口在橋頭匯流並交叉比對。
4. 4-4「潮儀守夜」：11 波，完成長時觀測與記錄封存。

本章只陳述關卡中反覆觀察到的回折、同步與原始讀值；不指定異常來源、不宣告古老種族身分，也不把未知事件寫入編年史。

## 系統、離線與回復

資料流為 `StoryCatalog → FrontierApp 劇情選擇 → ProfileStore.complete → StoryCodexBridge.completeChapter`。每關勝利沿用既有地圖解鎖；Chapter IV mapping 驗證四個任務完成但沒有獎勵動作，因此不會重複解鎖娜迦或新增編年主張。`TDGame` 將四張地圖列入自由遠征。

新增四張 1536×1024 原創 ImageGen PNG：`chapter4-tidegate-outfall-v1.png`、`chapter4-brineway-v1.png`、`chapter4-reef-confluence-v1.png`、`chapter4-tide-observatory-v1.png`。提示主題分別是礁岸潮門、風暴鹽脊堤道、雙礁岸道路匯入橋頭、潮儀台與蜿蜒古道；均要求等角手繪奇幻塔防地圖、無文字、無商標、無角色。Service Worker 按既有大圖策略處理，快取版本為 `sky-strike-v0.85.73`。

四張地圖均有獨立邏輯道路、可建區與禁建區；潮門、礁灘、觀測台、堤道、橋面與道路不可建造。`礁環交會` 的兩條路只在合流後共用尾段。

驗收執行 `npm run check`、`npm run test:naga`、`npm run test:mobile`、`npm test`。本更新不改玩家資料 schema；更新前可匯出 `hero-frontier-profiles.json`，如需回退再回到上一個 Git commit 後匯回即可，無須移除娜迦或劇情進度。
