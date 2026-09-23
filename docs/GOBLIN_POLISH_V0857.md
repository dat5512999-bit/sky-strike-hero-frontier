# v0.85.7 地精視覺調整

日期：2026-09-23。只修改地精顯示層，不新增英雄、軍團、裝備、數值或存檔格式；保留 v0.85.6 的遊戲速度與 v0.85.5 的桌機 UI、排行榜門檻。

## 需求、順序與 UI

先修正七張建造卡取景，再補建築狀態動作，最後替換四個技能圖示與施法特效。原有七座建築已具正式繪圖，不重新設計塔型。重載攻城架原裁切會切到頂部及腳架，冷凝支援站也略有裁切；新取景完整包含原畫透明邊界內的不透明像素。

- 桌機共用建造卡 184×240、圖片 124×124、技能圖示 66×66，資源列不變。
- Q 臨場改裝：連接實際目標的電弧、工具齒輪與焊接火花。
- W 蒸汽洩壓：向外散出的多層透明蒸汽。
- E 巡修機偶：落地塵霧、金屬碎屑、電光；仍由原本 Summon 流程建立真正機偶。
- F 全網超載：反應爐電光，連接供電機械；持續超載／冷卻由原 networkOverloaded／networkCooling 狀態呈現。
- 七塔使用現有繪製 PNG 加程序式建造浮現、開火回彈與槍口火焰；不是新畫的逐格塔樓動畫。支援塔不產生槍口火焰，冷卻塔不演出開火。

## 架構與內部 API

`Building.update / 原技能事件 → visualAge、fireFlash、skillVfx → GoblinPresentation → Canvas`

`GoblinNetworkSystem → networkPowered / networkOverloaded / networkCooling → 同一顯示層`

`GoblinArt.goblinBuildingImage → 圖集載入／重試 → previewCache 失效 → 建造卡刷新`

檔案：
- `src/td/systems/GoblinArt.js`：共用建築圖集載入、重新載入時刷新卡片；signal 使用遊戲動畫時鐘。
- `src/td/systems/GoblinPresentation.js`：只負責地精繪圖，必須在 CosmeticArt.js 之後載入，保留 drawBuilding 第七個 motion 參數。
- `HeroSkillVFX.draw`：優先呼叫 `GoblinPresentation.draw(ctx,v,hero)`；未就緒時回傳 false，使用原向量備援。
- `GoblinPresentation.assets(art)`：按需載入兩張圖；`sprite` 使用 2×2 圖集。
- `ArtSystem.GOBLIN_BUILDING_FRAMES` 提供現有建築圖集映射；`PREVIEW_BOUNDS` 逐塔緊密取景以保留小型機械的可讀性，重載攻城架為 left 130、top 158、width 124、height 134（384×384 來源畫布）。
- `coreStatus / failedAssets / retryFailed / preloadFaction` 納入建築、特效及技能圖示。
- 無新增 HTTP API、資料庫、權限或帳號要求，無對外傳送資料。

## 安裝、設定、使用與部署

1. 使用 Node.js 18 以上，取得包含 assets 的完整專案，不需新增套件或 API Key。
2. 在專案目錄執行 `npm run check`、`npm test`；已知非本次範圍的地圖失敗見下方。
3. 執行 `npm run serve:test`，開啟 `http://127.0.0.1:4173/td.html`；既有 4195 預覽伺服器可繼續使用。
4. 選擇銅齒・奇克與地精工程團開始遊戲；Q/W/E/F 和原介面操作不變，無額外設定。
5. `/goblin-polish-preview.html` 可單獨驗收七塔、四技能、暫停、0.15 秒步進、重播建造與供電／超載／冷卻展示。此頁狀態切換是視覺展示，不是假造正式技能結果，不寫入存檔或排行。
6. 部署完整静態檔案，包含兩張新 PNG、GoblinPresentation.js、td-polish.css、兩個預覽檔與更新的 sw.js；離線快取版本為 `sky-strike-v0.85.7`。不用資料遷移。

## FAQ 與管理維護

- 還是舊技能符號？確認完整更新並重新整理頁面，等待新版離線快取生效；不要刪除個人存檔。
- 圖片暫時失敗？正式遊戲載入狀態會列入失敗並可重試；建築重新載入會清除舊預覽快取。
- 為何有些塔沒開火？支援建築本来不開火；缺電、冷卻等戰鬥限制維持原規則。
- 傷害、冷卻、金錢或排行是否有調整？没有。排行仍只列自由遠征完成至少 16 波的戰績。
- 效能：超載電弧最多桌機 10 個、手機 5 個機械；蒸汽最多桌機 8＋1、手機 5＋1 層，無每次施法建立圖片。低階實機仍需體感驗收。

## QA（2026-09-23）

- `npm run check` 通過。
- 地精專項 16／16 通過，包括七塔實際 alpha 像素取景、建造／回彈狀態、支援／冷卻不開火、戰鬥錨點、四技能分層與繪圖上限、Canvas 狀態平衡、載入失敗重試、透明 PNG、離線清單。
- 全專案 581／582 通過。唯一失敗為 `td-story-maps.test.js:19`：frostborn (960,720) 距最近路線 190.70，大於檢查門檻 180。使用本次修改前備份的入口與模組重跑，仍出現同一失敗；不在地精視覺範圍，未改地图或放寬測試。
- 瀏覽器驗收 Q／W／E／F、建造重播、狀態切換與暫停步進；正式 td.html 選角與戰鬥四圖示均使用新 PNG、尺寸 66×66，七張卡 previewReady，無頁面橫向溢出或 Console Error。
- 手動清單：Q 連到被改裝機械、W 蒸汽漸散、E 真機偶落地、F 電弧不連離網物件；暫停／步進；支援塔不開火；重載攻城架頭腳完整；重新整理後美術可載入。

## 版本與回復

修改前快照：`artifacts/goblin-polish-v0857-backup/`；修改清單：`artifacts/goblin-polish-v0857-manifest.json`。
回復前先另外保存目前工作；依 manifest 的 modified 清單逐一比對並還原相對路徑的備份，避免覆蓋其他任務後來的變更。移除 GoblinPresentation 的引用並回復版本／快取；新增檔可留在磁碟但不能仍被入口引用。不要整個 git reset，因為專案已有其他未提交工作。
個人存檔未改動，無需清空或還原。回復後重跑語法及地精測試，重新載入瀏覽器。

## ImageGen 素材與完整提示詞

使用內建 imagegen 工具（非 API／非 CLI）。兩張全新生成素材，不改寫原技能 SVG，原始生成檔保留。
- `assets/td/goblin/skill-icons-v2.png`：四招繪製圖示。
- `assets/td/goblin/spell-effects-v1.png`：透明蒸汽、電弧、槍口火焰、塵霧素材。

### 圖示提示詞

Use case: stylized-concept. Production painted ability icon atlas for a fantasy RTS goblin engineer. Exactly 2 by 2 equal square cells, square image, each fills its own dark charcoal teal background. No text, no letters, no gutters, no border. Premium detailed hand-painted game art, strong recognizable silhouettes at 66 pixels, brass copper riveted machinery, glowing teal power and hot amber sparks. Top-left Q field modification: rugged engineer wrench tightening a large brass gear around a luminous turquoise reactor core, flying welding sparks. Top-right W steam release: heavy brass pressure valve explosively venting dramatic white-blue steam clouds, orange pressure gauge and dark steel pipes. Bottom-left E repair automaton: compact squat brass-and-steel walking robot with two articulated legs and two mechanical arms, single round glowing teal eye, emerging from a deployment clamp amid sparks. Bottom-right F network overload: multiple brass coils linked by fierce branching teal electric arcs, blazing amber central generator, dangerous hot metal and smoke. Distinct illustrated scenes, not abstract flat symbols, not vector line icons. Exact quadrant grid, no cross-cell overlap.

### 特效提示詞

Use case: stylized-concept. Transparent production VFX sprite atlas for a premium fantasy RTS mechanical goblin faction. Square image, EXACT 2 columns by 2 rows, each isolated sprite centered within its equal square cell with 12 percent transparent margins. Genuinely transparent alpha background, no black rectangles, no checkerboard, no text, no frame, no objects crossing cells. Top-left: volumetric pale blue-white pressurized steam puff, layered swirling wisps, clearly dimensional soft edges fading smoothly into transparency. Top-right: irregular branching cyan-teal electric discharge starburst, very bright white thin core, delicate glowing branches and sparks, no solid disc. Bottom-left: short directional orange-white mechanical gun muzzle flash, pointed flame facing RIGHT, small amber sparks and smoky wisps, no weapon. Bottom-right: horizontal isometric ground impact cloud of tan-gray dust, upward flying small brass metal flakes and golden sparks, center mostly open and transparent for a robot to stand in. Hand-painted textured realistic game effects, crisp highlights and soft smoke, readable at 60-160 pixels. Four separate effect cutouts, not icon buttons.
