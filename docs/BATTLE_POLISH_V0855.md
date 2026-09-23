# v0.85.5 桌機可讀性、霜原塔樓／技能與排行榜

日期：2026-09-23。這是本版規則；舊版「所有遠征均列入排行榜」的說明以本頁為準。

## 需求與交付範圍

全軍團共用的桌機建造／技能介面放大；正式美術及新技能效果以使用者截圖的霜原盟族／霜牙・凜為範圍。不新增英雄、軍團、裝備或戰鬥數值。右上資源列維持原尺寸。塔樓動畫採繪製圖集加程序式建造／蓄能／回彈，不是多張逐格重繪動畫。

|項目|本版行為|
|---|---|
|桌機建造卡|184×240 CSS px；圖片 124×124；名称 16、用途 13、費用 14 px|
|桌機技能列|396 px 寬；按鈕 108 px 高；圖示 66 px；名稱 14 px|
|適用版面|視窗至少 1100×650，滑鼠精細指標；手機維持原響應式尺寸|
|七座霜原塔|冰晶尖塔、暴雪祭壇、碎冰重弩、霜骨圖騰、霜墓尖碑、極光獵台、冰河核心共用正式透明圖集|
|Q / W|目標霜印、命中即時光暈／碎晶；實體冰矛光軌、爆裂冰柱與裂紋|
|E / F|實際狼人圖集的幻影獵群；擴散冰晶陣、地面霜紋，保留既有持續極光／落雪|
|排行榜|自由遠征完成至少 16 波；剛進第 16 波不算。所有六張現有地圖適用|

## 操作與安裝

使用現有 Node.js，於專案目錄執行 `npm run serve:test`，開啟 `http://127.0.0.1:4173/td.html`。無新套件、API 金鑰、資料庫或伺服器 API。依 README 的原有安裝流程即可。

選擇霜牙・凜及霜原盟族進入自由遠征，展開「招募／建造」。卡片橫向捲動；可按士兵／塔／輔助分類。滑鼠懸停／手機長按仍顯示完整說明。技能按 Q/W/E/F 或點右下按鈕；原有冷卻、資源、範圍和音效開關不變。

同服務下開啟 `battle-polish-preview.html`：七座塔與四技能使用正式渲染器，支援重播建造、暫停、前進 0.15 秒。此驗收頁不建立戰績，不寫玩家存檔，也不提供作弊入口。

## 架構與 API

```text
Building.update ── visualAge / fireFlash ── FrostlandTowerArt ── 塔樓 PNG
                                          └─ ArtSystem.preview ── 建造卡
FrostlandHero ── 原有真實傷害 / 冷卻
             └─ FrostlandVFX ── FrostlandSpellArt ── Canvas 疊層效果
td-polish.css ── 桌機尺寸 + 四格技能 PNG（Q / W / E / F）
BattleReport.finalize ── clearedWaves / rankingEligible ── RankingDataSource ── 排行榜
                    └─ 原始戰報歷史保留
```

- `ArtSystem.drawBuilding(ctx,type,x,y,level,branch,motion?)` 新增可選視覺狀態；舊呼叫相容。`motion` 為 Building；只讀 visualAge、fireFlash、aim。不改碰撞座標。支援塔不虛構攻擊。
- `FrostlandTowerArt.js` 於 FrostlandSprites 後載入；共用 atlas、預載就緒檢查、失敗重試及預覽快取失效。動作跟隨遊戲 dt，暫停不前進。
- 外觀包 `CosmeticArt` 轉送完整繪圖參數，避免包裝層遺失建造／開火動畫狀態；既有外觀包行為不變。
- `FrostlandSpellArt.draw(ctx,event,synergy)` 回傳是否處理；沿用 VFX 72／36 件桌機／手機上限與到期清理。特效不產生傷害或投射物，避免重複扣血。
- 戰報新增 `clearedWaves:number`、`rankingEligible:boolean`；儲存 key / version 維持相容。當前未完成波次與 abortWave 不計門檻。劇情局不參加自由遠征排行。
- 舊資料缺少 clearedWaves：勝利取 waves；失敗／撤退扣除未完成的最後一波。低波次資料僅在排行榜讀取時排除，不刪歷史戰報、不改原分數、不清除存檔。

## 美術來源及替換

以內建 ImageGen 生成（非 CLI），未新增外部圖庫依賴。圖集以本機專案相對路徑供應：

- `assets/td/frostland/towers-atlas-v1.png`：透明 4×2；依序 crystal / blizzard / ballista / totem / obelisk / aurora / glacier / 空格。生成原始尺寸 1774×887；裁切使用比例座標，不假設整數格寬。
- `assets/td/frostland/skill-icons-v1.png`：2×2，左上 Q、右上 W、左下 E、右下 F。
- `assets/td/frostland/spell-effects-v1.png`：透明 2×2，冰晶柱／碎冰爆裂／獵矛光軌／極光霧弧；取代技能冰柱的低面數幾何外觀，並加入繪製的命中爆裂。載入失敗時保留程序式效果作為備援。
- 生成規格／提示詞集見 [美術提示詞](BATTLE_POLISH_ART_PROMPTS.md)。替换需保留格序及透明 alpha，并同步 SW 快取版本。

## 管理、部署、更新、備份與回復

部署須一起包含 td-polish.css、三張 PNG、兩個新系統模組及 td.html、sw.js 的更新；切勿只上傳 HTML。SW 名稱為 `sky-strike-v0.85.5`。啟動後若仍見舊圖，確認版本並關閉舊分頁後重新開啟；必要時 Ctrl+F5。不要用清除玩家資料處理美術快取。

更新前先用遊戲原有匯出功能備份玩家資料。此版不遷移或刪除存檔。修改前原始檔副本保存在 `artifacts/battle-polish-v0855-backup/`（包含當時未提交修改）。回復時先備份目前工作目錄，再僅逐一回復本版修改的檔案；不要整個覆蓋 docs 或用 git reset，以免抹除其他工作的變更。新檔可保留但移除入口引用。回退部署時提高 SW 快取標籤避免旧新資源混用。新增欄位可被舊程式忽略。

## FAQ

**第 16 波失敗卻沒有排名？** 若只完成 15 波，未達門檻；需完成第 16 波。

**低波次紀錄被刪了？** 沒有。原始戰報仍保存，僅不列入排行榜。舊版地圖最高分欄位保留，與本次排行資格是不同用途。

**圖片載入失敗？** 確認三張 PNG 及新模組都已部署；看載入提示重試，不要清除存檔。不同英雄／軍團可自由搭配。

**所有軍團都重畫了嗎？** 沒有。桌機 UI 共用；本次新塔樓／技能美術及技能效果只針對霜原。

## QA 清單與結果

- 自動測試：`npm test` 572／572 全套通過；`npm run check` 通過，包含新增兩個系統及預覽 JS。結果保存於 `artifacts/battle-polish-v0855-tests.log`，修改檔案／回復對照見 `artifacts/battle-polish-v0855-manifest.json`。
- 邊界：15／16／17 完成波次、未完成的第 16 波、撤退／失敗／通關、舊紀錄、劇情排除、戰報保留。
- 圖集：七格非空／有透明像素、各格正常裁切、SW 資源存在。
- 動畫：建造／開火不更改座標、不多發射；四種技能 Canvas save/restore 配對、有手機粒子上限、到期與暫停回歸。
- 本機瀏覽器：正式遠征載入、卡片正式塔圖、四格技能背景來源；1920×1080 與約 1366×768 CSS 視窗檢查面板邊界。瀏覽器擷取存在 DPR 縮放／裁切差異，幾何尺寸以 DOM 實測為準。
- 視覺驗收頁使用正式 renderer 檢查七塔、四圖示及技能重播；不代表已做所有顯示器、手機實機或長時間壓力測試。
