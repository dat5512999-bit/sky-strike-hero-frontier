# 埃及島曦陽衛團與南方軍團美術（v0.85.83）

2026-10-06。埃及島現在是自由遠征可玩的第十軍團；島嶼與南方帝國的關係只作劇情伏筆，沒有新增主線關卡或改寫既有通關條件。本版並為矮人、龍族各四名士兵換成個別 4×4 待機／移動／攻擊／受擊動作圖。

## 玩家操作與定位

主大廳選「自由遠征」→ 選地圖與難度 → 在組建隊伍選「曦陽守衛・納芙拉」及／或「埃及島曦陽衛團」→ 開始遠征。英雄與軍團仍可自由混搭。選角能看到女性納芙拉肖像及三個技能圖示；戰場角色使用同一女性形象的 4×4 圖集。建造抽屜的「士兵」「塔」分類提供以下八張卡；金幣／木材不足或不合法地面時不會扣款。

| 士兵 | 主要用途 | 塔 | 主要用途 |
| --- | --- | --- | --- |
| 日輪盾衛 | 低價近戰守線 | 獵日瞭望塔 | 廉價遠射、單體穿甲 |
| 青金獵日弓手 | 遠程點殺 | 曦陽祭壇 | 同族士兵與埃及英雄攻速 +16%，不疊加 |
| 曦陽祭司 | 支援／魔法 | 流砂方尖碑 | 範圍短緩速 15%／0.7 秒，不凍結 |
| 金翼聖甲守護者 | 後期重甲防線 | 聖甲重弩堡 | 後期高價穿甲範圍火力 |

納芙拉的日輪斬、沙金領域、曦陽守望維持原有技能冷卻與戰鬥效果，商店武器仍有初始裝備及三階升級。三個新軍團的士兵都有可相容的軍械／掉落；商城加入既有的獅心盾，讓防禦配置也能取得。每座埃及塔 Lv.3 各有兩種分支，升至 Lv.5、回收與取消部署沿用共用流程。祭壇只支援埃及單位，不複製霜原的冰凍；方尖碑是短緩速，不是第二座急凍塔。

## 架構、資料與相容性

`FactionSystem` 定義軍團／可建清單 → `config.js` 定義戰鬥數值與卡片定位 → `BuildSystem` 驗證成本、地面與上限 → `CombatUnit`／`Building` 使用既有戰鬥流程；`BattleSynergySystem` 算祭壇同族加速，`TowerEvolutionSystem` 算分支，`ArmorySystem`／`ShopSystem` 管裝備，`ImperialFactionArt` 製作選卡與戰場繪製，`PaintedTowerVFX`／`UnitVFX` 製作攻擊及支援提示。檔案仍位於 `src/td/` 與 `assets/td/{egypt,dwarf,dragonkin}/`，未新增資料庫、HTTP API、帳號權限或存檔 schema。舊存檔仍可讀；新軍團 ID 是 `egypt`，塔與士兵 ID 見 `config.js`，不可任意改名而破壞舊存檔引用。

## 安裝、部署、驗收與回復

沿用 Node.js ≥18；安裝／啟動方式見 `INSTALLATION.md`。正式發布須把 `package.json`、`td.html`、`update.html`、`ProfileStore`、`FrontierApp`、`BattleReportSystem` 的 0.85.83 標記，`sw.js` 的 `sky-strike-v0.85.83`，本版所有 JS、PNG、測試與文件放在同一次提交／部署。部署後清理舊 Worker 快取並查看選角、八張卡、合法位置及 4×4 動作；不能只見版本字樣就視為通過。

自動檢查：`npm run check`、`npm test`、`npm run balance:audit`、`node scripts/qa-battlefield-acceptance.cjs --faction egypt`，以及同設備對照的 `node scripts/qa-desktop-soak.cjs --faction egypt --seconds 60 --headed`。先在 128×128 卡、正常戰場與半尺寸診斷圖人工檢查剪影、腳點、裁切、塔位與角色性別。無頭短測和固定怪長測不代表自然 50 波或玩家前景裝置；若玩家仍覺得卡，記錄版本、地圖、波次、倍速與效能面板的影格／更新／繪圖 P95、追趕與略過數值。詳細標準見 `BATTLEFIELD_ACCEPTANCE_STANDARD.md`。

發布結果（2026-10-06）：GitHub `main` 提交 `79d0a1e` 的 Pages 部署工作流程與其中線上檔案比對成功。本機 `npm test` 989/989、`npm run check`、十軍團平衡稽核及埃及戰場圖 QA 通過；60 秒固定 120 怪前景長測未見持續掉幀或追趕積壓。本機網路無法自行連接 Pages，因此不宣稱已在玩家裝置核對 Service Worker 快取或自然 50 波實戰。

更新前依 `BACKUP_RESTORE.md` 匯出玩家資料並保留上一 Git 提交和部署副本。若回退，應整套回復程式、PNG 引用、版本入口與 Service Worker 快取鍵；不要只刪除埃及卡或改版號。已購買／裝備的新 ID 在舊版可能無法顯示，先保留資料備份，不做破壞性清除。
