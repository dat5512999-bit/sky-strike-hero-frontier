> **v0.85.42：** `maps.emberroad` 與 `chapter2-ember-road` 是故事專用資料；`MapPressureSystem` 產生暫態 `mapPressure.armorBonus`，`Monster.takeDamage()` 才讀取它。無 HTTP API、資料庫或存檔 schema 變更。見 [2-2 介面](CHAPTER2_MAP_2_2_V08542.md)。

> **v0.85.39：** `MapPressureSystem` 只讀取 `ns.config.mapPressure`，將地圖路段換算為怪物暫態 `mapPressure`；`Monster.update()` 消費此狀態。無 HTTP API、資料庫或存檔 schema 變更。見 [地圖壓力](MAP_PRESSURE_V08539.md)。

> **v0.85.38：** `SpeedLoadGuard.speed(requested)` 回傳有效倍速，`observe(plan, requested, active)` 回報切換；不新增 HTTP API、資料庫或存檔欄位。見 [模組介面](LONG_SESSION_FOLLOWUP_V08538.md)。

> **v0.85.36：** `HeroEvolutionPresentation.draw(ctx, art, hero)` 會唯讀 `evolutionCast` 與 `evolutionReveal` 繪製職業 VFX；無 HTTP API、資料庫或存檔 schema 變更。見 [介面責任](HERO_EVOLUTION_ANIMATION_V08536.md)。

> **v0.85.33：** `ProfileStore` 首次建立時啟用既有 `test` 檔第 1 輪；`FrontierApp.lockReason()` 查實際故事獎勵；`FrameTimingSystem.next()` 最多回傳 12 個細步。無 HTTP API、資料庫或存檔 schema 變更。見 [架構與 API](PLAYER_ENTRY_FRAME_PACING_V08533.md)。

> **v0.85.31：** 新增內部 `FrameTimingSystem.next()`、`PerformanceMonitor.record()`；無 HTTP API、資料庫或存檔 schema 變更。見 [架構說明](FRAME_PACING_V08531.md)。

> **v0.85.30：** `FactionSystem.FACTIONS[id].codexArt` 是圖鑑專用直式軍團肖像的唯讀資產路徑；`CodexCatalog` 優先把它公開為 `entry.art`。沒有 HTTP API、存檔 schema 或戰鬥規則變更。見 [圖鑑軍團肖像交付](CODEX_FACTION_ART_V08530.md)。
> **v0.85.32：** `HeroEvolutionSystem` 是英雄階段、技能組、進化石、試煉與進化倍率的唯一入口；`EconomySystem.emblems` 與原功勳獨立，`ChapterCheckpointSystem` 同步保存二者。無網路 API。詳見 [英雄進化交付](HERO_EVOLUTION_V08532.md)。

> **v0.85.26：** 僅更新 `config.buildings.goblinGenerator` 的成本；沒有 HTTP API 或存檔 schema 變更。見 [地精前期平衡](GOBLIN_EARLY_GAME_V08526.md)。

> **v0.85.25：** `Monster.walkPhase`／`visualHeading` 是當局繪圖狀態，`ArtSystem.DIRECTIONAL_MONSTERS` 是方向圖集規格；沒有 HTTP API 或存檔 schema 變更。見 [架構說明](COMBAT_MOTION_V08525.md)。

> **v0.85.24：** `GoblinNetworkSystem.stateLabel(item)` 將既有網路狀態轉成玩家可讀的戰鬥結果；沒有 HTTP API 或存檔 schema。見 [供能可讀性熱修](GOBLIN_NETWORK_VISIBILITY_V08524.md)。

> v0.85.20 怪物攻擊站姿與路徑銜接：參見 [完整操作、架構、部署、回復與驗收](COMBAT_MOTION_V08520.md)。

> **第二章 2-1 預覽：** `StoryCatalog.chapter2Preview` 是一筆沒有地圖、波次或獎勵的唯讀劇情資料；`getMission(id)` 可解析它以供 `FrontierApp` 的既有 `story-card-replay` 路徑讀取。其 `replay=true` 保證結束時只返回劇情頁，不呼叫 `launchStory()`，無 HTTP API、存檔 schema 或解鎖變更。詳見 [第二章劇情本](CHAPTER2_STORY_TREATMENT_V1.md)。

> **v0.85.19：** `TutorialSystem.onLootClaim()`、`onEquipmentPickerOpened()` 與 `onEquipmentEquipped()` 串接既有軍械操作；`ArmoryUI` 提供可辨識的 `data-equip-gear`。沒有 HTTP API 或存檔 schema 變更。詳見 [新手裝備教學](CHAPTER1_ONBOARDING_V08519.md)。

> **v0.85.18：** `Monster.update()` 以獨立視覺計時選攻擊影格；`CombatUnit.animate()` 依冷卻與出手選姿勢。對外 API 與存檔格式不變。詳見 [戰鬥動作時序](COMBAT_MOTION_V08518.md)。

> **v0.85.13（2026-09-24）：** `CosmeticArt.drawCombatUnitSprite` 依狀態選日蝕圖集列，`GoblinArt` 改載 v2 動作圖；介面參數、存檔與 HTTP API 不變。詳見 [軍團動作圖交付](FACTION_MOTION_V08513.md)。

> **v0.85.12（2026-09-24）：** `StoryCatalog.mission.storyCards` 提供第一關三張卡的標題、短句與既有圖片；`FrontierApp.startStoryCards(replay)`／`finishStoryCards()` 管理閱讀與進戰鬥，不新增 HTTP API 或存檔欄位。詳見 [劇情卡交付](STORY_CARDS_V08512.md)。

> **v0.85.11（2026-09-23）：** Hero.setTarget(x,y,speedScale=1) 新增可選移動速度比例；HeroJoystick 輸出漸進強度。 詳見 [手機版修復說明](MOBILE_RANKING_INPUT_V08511.md)。

> **v0.85.10（2026-09-23）：** 新增 update-client.refresh／activated 與 GAME_VERSION 訊息；無網路 API 或玩家資料格式變更。 詳見 [更新修復說明](UPDATE_RECOVERY_V08510.md)。

> **v0.85.9：** `FrontierTerrain` 不再繪製部署抽樣點與禁建多邊形；`BuildSystem.updatePointer` 記錄預覽是否已啟動，原 `terrainIssue`／`placementIssue` 呼叫與傳回值不變。無新網路 API。詳見 [地圖部署視覺整理](DEPLOYMENT_VISUAL_V0859.md)。

> **v0.85.8：** 既有 ns.config、HeroRoster 與 FrostlandHero 內部數值調整；無新增 HTTP API、資料庫或呼叫參數。數值表與流程見 [霜原平衡交付](FROSTLAND_BALANCE_V0858.md)。

# API 文件（內部模組介面）

> **v0.85.7（2026-09-23）：** 新增純繪圖 GoblinPresentation 與 goblinBuildingImage 圖集快取接口；不新增 HTTP API。 操作、架構、部署、回復及驗收見 [地精視覺交付](GOBLIN_POLISH_V0857.md)。

> **v0.85.6：** `TDGame.setGameSpeed(1|2|3)` 介面不變；`loop` 的模擬時間基準乘 2 並拆步執行。無 HTTP API 變更。見 [速度調整](GAME_SPEED_V0856.md)。

> **v0.85.5（2026-09-23）更新：** 桌機建造／技能介面放大；霜原七塔正式美術及四技能圖示／特效；排行榜僅收錄自由遠征完成至少 16 波的成績，原始戰報保留。當前操作、API、架構、安裝部署、回復與驗收以 [本版交付文件](BATTLE_POLISH_V0855.md) 為準。

v0.85.3 歷史紀錄：無新增網路 API；`BuildSystem.terrainIssue(x,y,kind)` 回報地形禁建原因，`placementIssue` 再檢查占位。當時 `FrontierTerrain` 使用前者繪製可建亮點；此圖層已在 v0.85.9 移除。見 [戰場架構](STORY_MAP_REFINEMENT_V0853.md)。

v0.85.2：邊境對戰 API 已移除；霜原驗收頁僅補齊既有商城腳本依賴，沒有新增 API。見 [移除與驗收紀錄](VERSUS_REMOVAL_V0852.md)。

v0.84.9：`ArmorySystem.resaleValue(id)` 回傳本局裝備售價，`sell(id, economy)` 拒售未持有或裝備中的物品，成功時移除副本並透過 `EconomySystem.refundGold` 返金；`ArmoryUI` 管理清單與角色配裝視窗。詳見 [軍械庫更新](ARMORY_V0849.md)。

v0.84.8 地圖定義 `ns.maps.definitions` 與劇情 `StoryCatalog.missions/getMission` 的新增資料見 [三張劇情戰場](STORY_MAPS_V0848.md)；無對外 API 變更。

> **v0.84.7 現行商城：** 四位英雄外觀（獸人為「冥骨帝王」）與「日蝕王庭」已開放使用玩家檔案的試用水晶購買、保存與裝備；沒有真實付款。詳細規格、操作、限制、部署與測試見 [外觀上架交付](COSMETIC_RELEASE_V0847.md)。

> v0.84.6：`ResultScreen.view(result, options)` 產生結算顯示模型，`render(ui, result, options)` 寫入 DOM；`FrontierApp.onBattleEnd(victory)` 回傳模式、任務及解鎖／儲存狀態。詳見 [模組契約](RESULT_SCREEN_V0846.md)。

> v0.84.4：`BattleReportSystem.finalize('retreated', {baseHealth})` 保存撤退積分；`RankingDataSource.read()` 讀實際戰報；`ProfileStore.setProfileArt(id)` 保存個人頁籤背景。無新增 HTTP API。詳見 [本版資料契約](EXPEDITION_SCORE_PROFILE_V0844.md)。

> v0.84.3：新增 Hero.castShockwave(waves)、ChiefShockwave.update(dt,monsters,onKill,onHit)／draw(ctx)；沿用 Projectile.hit 傷害回報，無 HTTP API。詳見 [技能交付](CHIEF_SHOCKWAVE_V0843.md)。

> v0.84.2：新增 RankingDataSource.read()/display() 與 RankingView.action()/render()/rows()；由 FrontierApp 讀取 ProfileStore.adapter(free)，無 HTTP API 或正式線上提交。詳見 [排行榜介面](RANKING_UI_V0842.md)。

> v0.83.6：LayoutSystem 新增 preferenceKey()，使用 :pointer／:touch 的偏好 key；TDGame 空選取圖示改讀 HeroRoster。無新增網路 API。 詳見 [右鍵與戰鬥版型修正](BATTLE_INPUT_LAYOUT_V0836.md)。

> v0.83.5：新增主程式 openShop／bindCodex 接線與 CodexHost；CodexIntegration 支援 readOnlyReplay。td.html 接受 panel=free、hero、map 或 panel=shop，所有遠征選擇再次檢查解鎖。無新增 HTTP API。 詳見 [商城與圖鑑整合交付](FEATURE_INTEGRATION_V0835.md)。

> v0.83.4：新增 FrontierApp.walletButton(kind,amount)，產生含貨幣名稱 aria-label／title 的圖示數量按鈕。沿用 wallet action；無新 HTTP API。見 [介面說明](LOBBY_LAYOUT_V0834.md)。

> v0.83.3：新增 TowerFrontier.cinematic.prologue、CinematicPlayer.play(id)、CinematicStoryAdapter.trigger(data,hook)、PrologueProgress.prologueSeen／complete(result,identity)／replay(id,player)。沿用 CodexSaveBridge 以單次 ProfileStore commit 寫入收藏；無 HTTP API。完整回傳值、字幕／Reference schema 與接線見 [序章 API](PROLOGUE_CINEMATIC_V1.md)。

> v0.83.2：`WaveCatalog.get(wave)` 另回傳 `spawnPace`（預設 1），`WaveSystem.spawnInterval()` 在原難度間隔後乘此係數。僅第 14／20／28 波為 1.2／1.2／1.3；無 HTTP API 或資料遷移。

> v0.83.1：`Building.upgradeCost()` 首級倍率 1.6，其餘不變；`CombatUnit.upgradeCost()` 火槍手首級倍率 0.8；`CombatUnit.config().shots` 獵手為 2／2／3／4／4。回傳物件格式不變，無 HTTP API。

## v0.73.0 平衡實驗 API

`BattleReportSystem` 新增 `setStrategy`、`recordSupport`、`efficiency` 與 `historyComparison`；完成紀錄增加 strategy、剩餘資源、最終軍備與分析摘要。舊紀錄欄位缺失時安全回退。沒有 HTTP API。

## v0.72.0 戰局統計 API

`BattleReportSystem` 新增 `recordDamage`、`recordInvestment`、`armySnapshot`、`analysis` 與 `analysisLine`。`BuildSystem.onTransaction` 只在成功部署或升級後回報實付成本。沒有 HTTP API、遠端上傳或帳號資料。

## v0.71.4 收益倍率

`EconomySystem.setRewardRate(rate)` 接受 0.3～2；目前難度倍率為 0.78／0.55／0.45／0.38。`addKill()` 與 `completeWave()` 共用倍率，退款不受影響。沒有新增 HTTP API。

## v0.71.3 難度內容 API

`TDDifficultySystem.allows(kind,id)` 回傳目前難度是否允許部署；`lockReason(kind,id)` 提供玩家提示。`enemyCount` 現可低於 1，`WaveSystem.definition()` 會縮減非 Boss 編成且每組至少一名。`FactionSystem.contentGate` 防止商店繞過。沒有新增 HTTP API。

## 0.71.1 難度積分 API

`BattleReportSystem.bestForDifficulty(map, difficulty)` 回傳指定地圖與難度的最高分；`scoreState()` 增加 `difficultyBestScore`、`difficulty`、`difficultyName`。本機 payload 升級為 `{version:3,bestByMap,bestByMapDifficulty,legacyBestScore,runs}`。

## 0.71.0 暮秋遺跡與整合發布

新增第三張「暮秋遺跡 · 雙 U 型彎」，採縮窄第一個內圈的確認版本。遠征頁可直接選擇，沿用英雄／軍團／波次及地圖獨立戰績；路線、建造區、小地圖與离線資產同步，無新帳號、API 或設定。完整安裝、更新、架構圖、備份回復與測試見 [發布手冊](AUTUMN_RUINS_V0710.md)。

## 0.69.9 戰鬥欄位

新增／使用 `bonusVsHeavy`、`executeThreshold`、`executeMultiplier`、`commandHaste` 與 `towerSupportHaste`。支援塔倍率由 `Building.config()` 回傳等級後數值；沒有新增 HTTP API。詳見 [定位調整](ROSTER_BALANCE_V1.md)。

## 0.69.8 地圖獨立積分

BattleReportSystem 新增 bestForMap(map)、recordsForMap(map)、mapId()。bestScore getter 回傳本局地圖最高分。原 STORAGE_KEY heroFrontierScoreRecordsV1 保持相容，payload 為 {version:2,bestByMap,legacyBestScore,runs}。runs 各地圖最多 20 筆；bestByMap 永久保留該地圖最高分。舊版 runs 依明確 map 歸類，缺少 map 歸 legacy，舊全域最高分保留在 legacyBestScore，不推定地圖。

## 0.69.6 士兵裝備顯示修正

ArtSystem.drawGearPieces 對 kind=unit 直接略過身上貼圖；drawCombatUnit 完成角色繪製、還原變換後呼叫 drawSoldierEquipmentBadge(ctx,unit)。標記中心為 (x+43,y+30)、半徑 5，無裝備或 active=false 不繪製，不依賴裝備圖集是否載入。HTTP API 與資料格式無變更。

> 0.69.2：沒有對外 API 變更；新增內部 `ArtSystem.actionImage`、`drawActionUnit` 與 `drawRobot` 美術路由。詳見 [UNIT_ACTIONS_V0692.md](UNIT_ACTIONS_V0692.md)。

## 0.68.5 馭獸師與熊戰鬥動作（2026-09-17）

恢復馭獸師原本的鹿角、肩鳥與綠袍設計，新增待機及施法畫格；三階熊新增踏步與撲咬畫格，近戰命中顯示爪痕。使用既有 state、frameClock、attackTimer 切換，無資料庫、API 或權限變更。完整安裝、更新、回復與測試方式見 [動作更新紀錄](NATURE_MOTION_V0685.md)。


## 0.68.4 森靈馭獸師造型（2026-09-17）

ArtSystem.drawBeastmaster(ctx,unit) 使用 BEASTMASTER_RECT 靜態邊界與 UNIT_HEIGHTS.beastmaster 繪製單張素材；previewBounds 對應同一比例。無新 HTTP API。


## 0.68.0 雙隘口要塞（2026-09-17）

新增地圖欄位 routes、sharedLength、blockedAreas 與 Monster.remainingDistance()；雙路 progress() 以負剩餘距離排序。戰績新增 map／mapName，無 HTTP API。

詳見 [第二張地圖規格、操作與回復](TWIN_PASS_V0680.md)。

## 0.67.0 終極士兵（2026-09-17）

新增 config.units 的 ultimate、commandAura、soulSlam 欄位。v0.70.0 起 `CombatUnit.upgradeCost()` 對所有士兵使用初始造價乘 `[1,1.3,1.7,2.2]` 並取整至 5G；不再依 ultimate 分流。ArtSystem.ULTIMATE_FRAMES／drawUltimateUnit 處理四格裁切；Monster.TYPES.wildDragon 為新敵軍。沒有新增 HTTP API。

詳見[終極士兵操作、架構與驗收](ULTIMATE_SOLDIERS_V1.md)。

## 0.66.5 直接開檔修復（2026-09-17）

ArtSystem.PREVIEW_BOUNDS 以 kind:type 儲存 {left,top,width,height}；preview 使用既有繪製結果與靜態邊界。新增素材時須同步量測邊界。無新網路 API。


## 0.66.4 建造預覽對齊（2026-09-17）

ArtSystem.preview(button,kind,type) 現在涵蓋所有建造種類，內部 previewCache 以 kind:type 快取裁切邊界與來源 Canvas；previewReady 阻止重複繪製。無 HTTP API 變更。


## 0.66.2 選取用途說明（2026-09-17）

TDGame.selectionPurpose(subject) 接收具 config() 的單位或 {kind,type} 部署資料，回傳用途文字；updateSelectionPurpose(subject) 更新 td-selection-purpose，null 時清空並隱藏。無新增 HTTP API。


## 0.66.1 新手谷地美術（2026-09-17）

沒有新增或變更 API。maps.definitions.beginner.asset 與 ArtSystem.mapAssets.beginner 改載入 v2 圖片；1536×1024 世界與座標契約不變。

詳見 [地圖更新、架構與回復手冊](MAP_ART_V0661.md)。

## 0.65.0 手機介面修正（2026-09-17）

新增 `src/td/mobile-entry.js`，頂層小型觸控瀏覽器導向同源 `td-mobile.html`，內嵌時不再導向。橫向容器 resizeGame 交換 viewport 寬高並旋轉 iframe，保留原本遊戲實例。TDGame.placementPointer 記錄建造手勢；pointermove 同步 BuildSystem.stagePlacement，pointerup/cancel 清除指標。data-hero-expanded 與 aria-expanded 控制英雄資訊展開。無新增 HTTP API／資料庫 Schema。

## 0.64.0 新增／擴充的內部介面

沒有新增公開 HTTP API、DB schema 或網路服務。

- `HeroJoystick(game, element)`：`sync()` 控制是否顯示，`update(dt)` 呼叫既有 Hero.setTarget，`reset()` 停止並釋放 Pointer Capture；`active` 用於既有 Camera／Touch 輸入仲裁。
- `BattleSynergySystem(game)`：`prepare(owner,target,cfg,options)` 為 static 攻擊選項 Hook；`hit(monster,damage,source)`、`onEnemyDeath(monster)` 接既有 TDGame；`update(dt)` 處理 DOT／支援／召喚，`refract()` 在原攻擊生成後執行；`draw(ctx)` 不改邏輯，`reset()` 清空單局狀態。
- `Projectile` options 新增 style、armorPierce、arcaneMark、natureMark、vulnerability、shock、plague、lineStart/lineEnd、reflected；chain 表示最多受擊目標數，非額外跳數。
- `Summon` options 新增 tags、spawnTime、launchDelay、armedTime、splash；form 包含 bear／bomb／heavyBomb。仍是原 Summon，不是另一個 Entity System。
- `CombatFeedbackSystem.explosion(position,radius,color,style)`、`soul(from,to)`、`aura(unit,color)`；`drawStatus(ctx,monster,clock)` 為 static。事件由既有 update 回收。
- `BuildSystem.queueMercenary(type,kind='unit')` 支援 building；`discountedCost(cost,point)`、`upgradeCost(item?)`、`pendingCost(point?)` 統一報價，回收按實際花費。
- `FactionSystem.canHire(id,kind='unit')` 不販售當前軍團已有項或 enemyOnly；`unlock` 也拒絕 enemyOnly。
- `ArtSystem.preview(button,kind,type)` 與戰場共用圖集；`BUILD_CELLS/BUILD_RECTS` 可替換資產座標。

詳細契約見 [Build V1](FACTION_BUILDS_V1.md)。以下是既有／歷史介面記錄。

## 0.62.0 清場計時與戰績介面

- `BattleReportSystem.targetTime(wave, enemyCount?, spawnInterval?)`：產生每波基準清場秒數；缺少敵量資料時使用向後相容的波次估算。
- `BattleReportSystem.timeBonus(time, parTime)`：每提早一秒加 `TIME_POINTS_PER_SECOND=5` 分，逾時最低為 0。
- `startWave(..., { parTime })`／`finish()`：保存 `time`、`parTime`、`timeBonus` 並納入原分數與難度倍率。
- `finalize(victory)`：產生 `{outcome,victory,score,grade,waves,time,timeBonus,bestScore,isNewBest}`，寫入本機最近 20 場並具冪等性。
- `scoreState()`：另回傳 `bestScore`、`time`、`timeBonus`；`finalLine(result?)` 包含總時間、速度分與最佳紀錄。
- 儲存鍵為 `heroFrontierScoreRecordsV1`；沒有 HTTP API、帳號服務或資料庫。

## 0.61.0 觸控、兌換與評分介面

- `BattlefieldCamera.initialView({ preferFocus })`：手機橫向可使用地圖焦點與 `mobileInitialZoom` 建立初始視野。
- Camera Pointer：空地單指平移、雙指縮放；英雄起手與 `build.pending` 不攔截。
- `EconomySystem.exchangeGoldForMerit()`／`exchangeMeritForGold()`：以 `MERIT_GOLD_RATE=1000` 原子式檢查與交換。
- `ShopSystem.exchange(direction, economy)`：接受 `gold-to-merit`、`merit-to-gold`，回傳 `{ok,message}`。
- `BattleReportSystem.scoreState()`：回傳 `score`、`completedScore`、`liveScore`、`grade`、`waves`、`multiplier`。
- `BattleReportSystem.grade(score,waves)`：以每完成波平均積分輸出 `SS/S/A/B/C/D`，無波次為 `--`。
- `TDGame.updateScoreUi()`：同步積分快捷圖塊與小型明細面板，不改戰鬥狀態。

## 0.60.1 遠征返回介面

- `TDGame.returnToOpening()`：先隱藏目前遊戲選單，再呼叫既有 `reset()` 回到 HERO FRONTIER 遠征選擇；回傳 `true`。
- `ui.menuReturn`、`ui.resultChange`、`ui.openingReset` 共用此入口；沒有新增頁面 Router 或第二套 Reset。
- `td.html` 不再把 `index.html` 當成 HERO FRONTIER 模式選單。

## 0.60.0 HUD Presentation 契約

- 本版沒有新增 JavaScript Gameplay API、資料欄位或事件。
- `td-combat.css` 依 CSS Viewport 寬高切換 HUD 密度；地圖 World、Camera、Canvas 與 Pointer 換算仍是原 API。
- `.hud-controls` 以固定斷點寬度及 `calc()` 水平置中，不使用父層 `transform`，以免改變其中 fixed 暫停按鈕的 containing block（定位參考層）。

## 0.59.0 選角美術資料介面

- `HeroRoster.get(type).selectionArt`／`selectionFocus`：英雄選角立繪與 CSS `background-position` 焦點。
- `FactionSystem.FACTIONS[id].selectionArt`／`selectionFocus`：獨立軍團橫幅與構圖焦點，不得指向英雄立繪。
- `TDDifficultySystem.MODES[id].selectionArt`／`selectionPosition`：難度場景圖集及其象限位置。
- `TDGame.attachDifficultyUi()` 將資料寫入 `--selection-art`、`--selection-focus`、`--selection-position`；選擇事件、Hero/Faction ID 與 Build 權限仍沿用原 API。

## 0.58.0 怪物隊列與地圖規則介面

- `Monster.routeDistance`：怪物在共享折線路徑上的累積邏輯距離；不取代 `x/y`，索敵、Projectile、AoE 與 Chain 仍用世界座標。
- `Monster.update(dt, hero, defenders, maxAdvance)`：第四參數可限制當幀最大前進量；省略時維持原本獨立移動。
- `Monster.setRouteDistance(distance)`：把增援放到既有道路的指定累積距離；不建立側向 Lane。
- `Monster.minimumHeadway(front, back)`：依前後怪物半徑回傳隊列最小中心距離。
- `TDGame.updateMonsterConvoy(dt)`：以前方怪物為基準限制後方快怪，並沿用原漏怪結算。
- 地圖定義新增 `heroVulnerable`；`false` 時 `EnemyCombatSystem.update()` 仍處理 Boss 階段，但取消對英雄的蓄力、攻擊與踐踏傷害。
- 建造顯示順序由 `TDGame.updateBuildFilter()` 依 `cost` 後 `wood` 寫入 CSS `order`；不改資料表與建造權限。

## 0.57.0 Battlefield API 契約

- `TowerFrontier.maps.apply(id)` 將同一地圖資料套用到 `ns.config`；正式 `beginner` 提供 `width`、`height`、`asset`、`path`、`spawn`、`gate`、`heroSpawn`、`roadClearance`、`buildAreas`、`safeArea` 與 `camera`。
- `BattlefieldCamera` 只做等比例世界／螢幕座標轉換、縮放和平移；不修改世界尺寸、路線或戰鬥資料。
- `BuildSystem.placementIssue(x,y,kind)` 依序回傳 `boundary`、`road`、`terrain`、`occupied` 或 `null`；士兵與塔使用同一道路禁建和草地區域。
- `CombatUnit.issueCommand()`、`setTarget()`、`followPath()` 固定回傳 `false`；`update()` 只進行固定位置索敵與攻擊。`Hero.setTarget()` 保持可移動。
- `Monster.visualPosition()` 直接回傳目前 `{x,y}`；0.57.0 不再套用 Visual Lane 或 Stagger，攻擊、AoE 與 Chain 仍共用該邏輯座標。

## 0.55.0 士兵與軍械介面（2026-09-15，本機）

`CombatUnit.update(dt, monsters, projectiles)` 只在部署位置射程內索敵與射擊；`takeDamage()` 對士兵回傳 0。這是 0.55.0 歷史介面，當時 `TDGame.commandSelected(x, y)` 尚允許準備期重新部署；0.57.0 起固定回傳 `false`。`BuildSystem.placeQueued()` 每次建立新 `CombatUnit`，不設兵種數量硬上限。`ArmorySystem.obtain(itemId)` 可收同名裝備副本（內部 ID 如 `war-drum#2`）；`equip(copyId, target)` 對士兵保證只保留一件、不可共享，同名不同副本可給不同個體；`unequip(slot, target)` 與 `releaseTarget(target)` 把持有關係解除，但副本仍在 `owned`。英雄原有多欄位裝備規則不變。無 HTTP API。

## 0.54.3 商城與技能分區（2026-09-14，本機）

`td-shop-open` ID 與 `TDGame` 原點擊／R 鍵處理不變。`td-ultimate` 新增 `.skill-cooldown` 顯示欄，由原 UI 更新流程寫入剩餘秒數；技能名稱文字只寫入可見名稱。無 HTTP API 變更。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

`ArtSystem.drawCombatUnit(ctx, unit)` 與 `drawRank(ctx, x, y, level, color, building, type)` 參數及回傳值不變；`building=false` 只繪腳邊標記，不再疊身體多邊形。無 HTTP API 變更。

## 0.54.1 英雄小卡（2026-09-14，本機）

沒有新增 HTTP 或內部模組 API。`TDGame.updateUi` 繼續更新原 `td-hero-hp-*`、`td-hero-mp-*`、`td-hero-xp-*`、`td-stat-*` 與 `td-hero-weapon` 節點；僅將次要節點移入原生 `<details>`，事件與資料契約不變。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

無新 HTTP API。MiniMapView(button).attach(game) 綁定既有 BattlefieldCamera.focus；draw(game) 每約 100ms 從現有地表快取、ns.config.path、game.monsters、game.build.towers 與 game.hero 畫縮圖；static fit／point 僅做世界與縮圖座標換算，不更改任何遊戲資料。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

無新 HTTP 或 JavaScript API。td-gold／td-lumber／td-merit／td-health、td-pause、td-menu-open 仍是既有 DOM 介面，既有 updateUi 與事件監聽不變；resource-icon 僅呈現。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

BuildSystem.placementIssue(x,y,kind) 回傳 null／boundary／road／occupied；canPlaceAt 共用它，原規則不變。placementMessage 提供人類可讀說明。FrontierTerrain.draw(ctx,art,build?) 僅在 build.pending 時畫部署提示。maps.definitions.frontier.openingFocus／zones 都是呈現資料，不是碰撞或增益；無新 HTTP API。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

僅呈現欄位：ArtSystem.frontierGround／skillIcons（原load與重試）；body.dataset.heroClass／skillArt提供CSS技能圖集定位。FrontierTerrain依ground是否ready決定升級快取；沒有新增HTTP API或Combat接口。

## 0.50.0 大地圖原型（2026-09-14，本機）

本機介面：TowerFrontier.maps.definitions / length(points) / apply(id)。正式UI入口 TDGame.chooseMap(id) 僅開局可呼叫，重建既有 PathSystem／NavigationSystem、更新 Hero 出生點與 Camera 尺寸；不要在戰鬥中直接 maps.apply。沒有新增網路 API。FrontierTerrain.draw(ctx,art) 延遲建立靜態地景快取。


## 最新：0.49.0 鏡頭原型

0.49.0：BattlefieldCamera 提供 resize、worldToScreen／screenToWorld、contains、pan、focus、changeZoom、showAll、reset，以及 begin／end 繪圖邊界。Camera.attach只接呈現輸入，不持有戰鬥資料。TDGame.canvasPoint 在鏡頭啟用時回傳世界座標；BuildSystem、TargetSelector與Damage介面未改。

## 0.48.0 呈現介面

`main.js` 的 `syncEdgePresentation()` 依既有 LayoutSystem 切換 `body.edge-combat`；`data-edge-orders` 僅控制原指令格可見性。沒有新增公開 API、網路端點或第二套 Build／Combat。`td-combat.css` 只對 battle/result 狀態生效，直式仍使用原布局。

## v0.47.0 介面與放置預覽

`LayoutSystem(root, storage, viewport)` 的 `viewport()` 可回傳舊式寬度數字，或 `{width, height, coarse}`；`resolved()` 仍回傳 `desktop`／`mobile`，`apply()` 額外寫入 `data-combat-orientation`。`BuildSystem.queue(type,kind)` 僅記待放物；`updatePointer(x,y)` 更新視覺預覽，`stagePlacement(x,y)` 暫存座標及合法性；UI 對合法 Canvas 點位立即呼叫 `TDGame.confirmPlacement()`。`canConfirm(economy)` 重查放置與資源；`BuildSystem.confirmPlacement(economy)` 成功時委派原 `placeQueued(x,y,economy)`，失敗不扣款；`cancel()` 清除待放與預覽。`placeQueued()` 保留供既有內部呼叫與測試，UI 不再直接呼叫。建造卡 `config.units/buildings.role` 為短定位，`TDGame.buildDetailDescription()` 提供長描述；`Hero.castNova()` 沒有有效敵人時回傳 `false` 且不耗 CD。這些都是本機模組介面，沒有 HTTP API。

## v0.46.0 塔定位介面

- `BuildSystem.applyTowerSupport()` 在單位更新前計算每名守軍受到的最高 `allyHaste`，離開半徑或出售塔後下次呼叫即歸零；不作用於英雄或召喚物。`CombatUnit.config().interval` 以 `原間隔 / (1 + supportHaste)` 計算，讓卡面百分比等於實際攻速增幅。
- `config.buildings` 的 `role` 供既有建造卡顯示；`priorityTargets` 僅讓獅翼弩砲優先處理指定敵類。`summonInterval/CapBase/Duration/Damage/Range/Speed/LeashBonus` 由 `TowerSkillSystem.fire()` 傳給既有 `Summon`；未擴張 Projectile 或傷害 API。
- `TowerEvolutionSystem.apply()` 支援分支上的 `allyHaste/allyHasteRadius/summonDuration`，其餘塔、經濟與儲存格式不變。這些都是本機 JS 內部介面，沒有 HTTP API。

## v0.45.0 開局組合介面

- `TDGame.selectOpeningProfession(heroId)` 選英雄；`selectOpeningFaction(factionId)` 選軍團；`chooseProfession(heroId, factionId)` 需兩者皆有效且英雄核心圖片就緒才進場。沿用舊方法名稱，語意中的 `profession` 現為英雄 ID。
- `ProfessionSystem.selected`／`Hero.classType` 負責英雄；`FactionSystem.selected`／`available(kind)`／`allows(kind,id)` 負責建造權限；`TDGame.lastRun={difficulty,profession,faction}` 供同組合重開。`BattleReportSystem.run` 增加 `faction/factionName`。
- `LootSystem.createOffers(wave, heroId, factionId)`：第三波保底軍械依英雄；軍團相關排除規則依軍團；省略第三參數時保留舊同 ID 行為。`TowerEvolutionSystem` 的 `burstRadius` 只放大特定第 4 擊爆發，沒有新 Effect Engine。無 HTTP API、資料庫或資料遷移。

## v0.44.2 敵軍繪製介面

- `Monster.visualPosition()` 回傳 `{x,y}` 的純繪製座標；`x/y/index` 仍為戰鬥座標。`visualLane`、`visualStagger` 為建構時固定的視覺參數。
- `Monster.showsHealthBar()`、`drawHealthBar(ctx)` 控制血條呈現；`Monster.compareForDraw(a,b)` 供繪製排序，Boss 保持最上層。不改 `takeDamage`、`progress` 或 `WaveSystem` 介面。
- `CombatFeedbackSystem.visualPosition(monster)` 與 `Projectile.chainPoints` 僅供視覺回饋；選敵、濺射半徑、連鎖距離及傷害公式不變。無外部 HTTP API。

## v0.44.1 美術圖層介面

- `ArtSystem.drawHunterWeapon(ctx, hero)` 優先繪製英雄身上相容的軍械庫武器，否則繪製已購買的職業弓；未取得任何換裝弓時回傳 `false`。不參與傷害與索敵。
- `ArtSystem.drawGearPieces(ctx, target, mounted, skipWeapon=false)` 新增可選的純視覺參數；巡林者弓已獨立貼手繪製時用它避免重複，其他單位維持原行為。`Hero`、`ArmorySystem` 與 `EquipmentSystem` 的資料契約未變。

## v0.44.0 UI 流程介面

- `TDGame.selectOpeningProfession(type)` 只選開局英雄，不啟動波次；`chooseProfession(type)` 仍做原有圖片門檻、職業初始化與準備倒數。`updateOpeningRules()` 讀既有 `TDDifficultySystem.summary()`，不另存倍率。
- `TDGame.showCommands(panel)` 控制桌機建造 Drawer／手機原指令分頁；`setBuildFilter(key)` 與 `updateBuildFilter()` 只控制卡片可見性，鍵為 `all/unit/tower/support/recent`。`BuildSystem.queue/placeQueued/upgrade/sell` 與資料契約未變。
- `TDGame.openMenu/closeMenu/showMenuPane` 為單一 UI 暫停／恢復入口；`retrySameSetup()` 呼叫既有 `reset()` 後重套上一局難度與英雄。勝敗後 `end(victory)` 的戰報資料仍不變。無 HTTP API、資料庫或新儲存格式。

## v0.43.0 守軍索敵介面

- `TargetSelector.supports(strategy)`、`valid(target)`、`rank(origin, targets, strategy, filter)`、`select(...)` 為可重用的純索敵介面；策略鍵為 `nearest/front/lowestHealth/highestHealth/fastest`。
- `CombatUnit.setTargetStrategy(key)` 拒絕無效值；`setGuardPoint(x,y)` 與 `guardRadius/maxChaseDistance` 控制自動警戒及追擊。`update(dt,monsters,projectiles,{navigation,buildings})` 沿用既有投射物與傷害。
- `ArtSystem.load(src)` 恢復直接設定圖片 `src` 並監聽載入；`coreStatus(type)` 仍回傳地圖、首波敵軍與所選英雄的就緒狀態。`TDGame.chooseProfession` 未就緒時不開局；無低畫質繞過選項。沒有 HTTP API。

## v0.42.0 塔與傷害資料契約

- `Building.upgradeCost()` 回傳 `{gold,merit}` 或 Lv.5 的 `null`；`gold` 為塔原價乘 `[2.8,4.2,6.2,8.4]` 後取整至 10G，v0.75.0 起 Lv.3→4／Lv.4→5 的 `merit` 為 1／2。`BuildSystem.upgrade(economy)` 仍原子性扣款，失敗不升級。
- `config.buildings[type].slow/slowTime/bonusVsSlowed/role` 為選填欄位；`TowerSkillSystem.fire()` 將增傷欄位傳至 `Projectile`。`Projectile.hit()` 以命中前 `slowTimer>0 && slowFactor<=.8` 判定強緩速，對應傷害類型及怪物護甲仍照原公式結算。
- `FactionSystem.available('building')` 王國起始含 `iceward`；`TowerEvolutionSystem.branches('iceward')` 有兩條互斥三級進階。無新外部 API、資料庫或帳號權限。

## v0.41.0 英雄大絕與美術載入介面

- `HeroUltimateSystem.get(classType)` 回傳名稱、圖示、說明、冷卻與範圍；`cast(hero, monsters, onKill, onHit)` 成功回傳範圍效果資料，無目標／死亡／冷卻中回傳 `null`。
- `Hero.skillCooldowns.ultimate` 保存本局剩餘秒數；符文沿用既有每級 10% 縮減規則。
- `ArtSystem.coreStatus(classType)` 回傳 `{loaded,total,failed,ready}`，並觸發必要圖片請求；`retryFailed()` 重新請求失敗圖片，`onProgress` 通知 UI。圖片最多 4 張並行，其他圖在首次繪製時請求。
- 無新資料庫、外部 API、帳號或資料傳輸；上述均為瀏覽器內部介面。

## v0.40.1 美術引用

- `ArtSystem.heroHunterUnarmed`：改載入 `hero-hunter-actions-unarmed-v4.png`。`drawHero` 仍只在已買武器、無武器底圖與武器圖集均載入完成後切換分層；無新 API 或資料格式。

## v0.40.0 資料契約

- `config.units[musketeer|halberdier|dryad|moonblade|banshee|boneRider]`：沿用既有單位設定欄位與 `CombatUnit` 生命週期；`style`、`chainRange` 等選填欄位送入既有 `Projectile`。
- `FactionSystem.available('unit')`：每族回傳五名開局守軍，戰利解鎖兵種繼續合併；`canHire` 排除本族和已解鎖單位。
- `Monster.TYPES[direwolf|raider|revenant]`：分別是高速、攻擊守軍的 siege、攻擊英雄的 hunter；`WaveCatalog` 仍提供 30 波與五波一 Boss。
- 無外部 HTTP API、資料庫、網路權限或持久存檔格式變更。

## v0.39.0 新增介面

- `FactionSystem.canHire(unitId)`：兵種存在、已選軍團且目前不可建造時回傳 `true`。
- `EquipmentSystem.projectileOptions(hero, base, random?)`：以職業武器擴充投射物設定；測試可注入固定亂數。
- `ArtSystem.drawSummonSprite(...)`：統一四乘四召喚動畫切格、朝向、陰影與階級。
- `ArtSystem.drawClassWeapon(ctx, hero)`：把九宮格職業武器疊至三英雄無武器底圖。
- `body[data-mobile-panel]`：`compact`／`expanded` 僅控制手機指揮面板呈現。

## v0.38.0（2026-09-12）

TDDifficultySystem.summary(totalWaves) 回傳關卡數、城門耐久、首末關血量倍率、金幣倍率和歸隊規則。modifiers() 新增 healthGrowth（每關線性成長係數，預設 0）。Monster 建構時套用 enemyHealth × (1 + healthGrowth × (wave - 1)) 到血量及護盾。沒有新增網路 API 或資料庫。

## v0.36.0 軍團擴充介面

- `config.units` 新增 `knight`、`treant`、`golem`；它們與既有單位使用相同 `CombatUnit` 介面。
- `FactionSystem.available('unit')` 對選定本族回傳 3 名開局守軍；戰利品解鎖仍以集合合併。
- `CombatUnit.attack()` 讀取 `slow/slowTime/splash`，並依類型在第四擊觸發騎士暈緩或魔像強化震地。
- `ArtSystem.enemyActions` 可直接以 `Monster.type` 取得術士、祭司、Boss 圖集；`visualBase` 只保留給盾衛與旗手的既有衍生外觀。

## v0.35.0 英雄與建築介面

- `ArtSystem.drawHero()` 依 `Hero.classType` 選擇三套獨立英雄圖集；暗影武器鍛造改用新版專屬無武器底圖。
- `config.buildings` 新增 `ballista`、`moonwell`、`plague`，仍由 `Building` 與 `BuildSystem` 共用同一生命週期。
- `FactionSystem.available('building')` 每個初始流派回傳 4 種本族建築，戰利品解鎖仍以集合附加。
- `TowerEvolutionSystem.branches()` 與 `TowerSkillSystem.describe()/fire()` 已涵蓋三座新塔。

## v0.34.0 三十波介面

- `WaveCatalog.total()` 現回傳 `30`；`get(1..30)` 提供名稱、提示、威脅、敵軍群組與獎勵。
- `WaveSystem.spawnInterval()` 依目前波次與 Difficulty `spawnRate` 回傳出兵間隔；後半 Boss 仍保留至少 0.52 秒基準可讀空檔。
- `Hero.xpForNext()` 在 Lv.15 回傳 `null`。
- `Monster` 使用分段線性生命倍率；第 1～15 波保持既有斜率，第 16～30 波降低斜率。
- `TDGame.end()` 與 `wavePreviewLabel()` 從 `catalog.total()` 取得總波數，不再硬編 15。

## v0.33.0 守軍負傷介面（歷史，0.55.0 已移除）

`unitRecovery`、`setUnitRecovery()`、`recoveringUnits()`、`setRecoveryPolicy()`、`updateRecovery()` 與士兵戰敗移除均不再提供。現行 `BattleReportSystem.recordDefeat(target)` 只統計英雄倒下；士兵使用頁首 0.55.0 的定點與單件裝備介面。

所有模組掛載於全域 `SkyStrike` 命名空間，以支援直接由 `file://` 開啟。

| 模組 | 主要介面 | 責任 |
|---|---|---|
| `Player` | `setTarget`、`update`、`takeDamage`、`draw` | 玩家移動、HP、受傷狀態 |
| `Enemy` | `update`、`takeDamage`、`draw` | 普通敵機行為、HP 與逃脫狀態 |
| `Bullet` | `update`、`draw` | 玩家、分身與戰寵共用投射物 |
| `EnemyBullet` | `update`、`draw` | 敵方瞄準彈與彈幕投射物 |
| `PowerUp` | `update`、`draw` | 技能果實移動與外觀 |
| `Weapon` | `update`、`reset` | 自動射擊節奏與子彈建立 |
| `Collision` | `resolvePlayerBullets`、`resolvePlayerEnemies` | 碰撞配對與結果通知 |
| `Spawner` | `update`、`currentInterval`、`setModifiers`、`reset` | 敵機生成、難度漸進與詞綴倍率 |
| `GameState` | `start`、`pause`、`resume`、`end`、`registerKill`、`breakCombo` | 流程、分數、Combo、倍率與最高紀錄 |
| `Effects` | `hit`、`burst`、`announce`、`offset`、`update`、`draw` | 命中火花、粒子爆炸、提示、衝擊波與震動 |
| `BattlefieldRenderer` | `reset`、`update`、`draw` | 分層星流、環境光塵、航線與暗角背景 |
| `SkinRegistry` | `register`、`all`、`select`、`restore`、`current`、`draw` | 外觀包註冊、選擇、保存與繪圖委派 |
| `InputController` | `canvasPoint`、`touchTarget`、Pointer handlers | 桌面絕對定位與手機相對拖曳 |
| `SkillSystem` | `update`、`spawn`、`maybeDrop`、`collect`、`level`、`status` | 果實生成、Lv.1～3、限時技能、護盾與清場 |
| `DifficultySystem` | `all`、`current`、`select`、`restore` | 難度資料、選擇與本機保存 |
| `ChallengeSystem` | `reset`、`update`、`onKill`、`onPlayerDamaged`、`status` | 限時事件狀態機與龍果獎勵 |
| `StageDirector` | `update`、`affix`、`modifiers`、`onEnemyEscaped`、`defenseStatus`、`isBossWave` | 100 波、符文詞綴、防線、Boss 與固定獎勵流程 |
| `SupportSystem` | `collect`、`update`、`draw`、`status` | 鏡像分身與星靈戰寵的成長、自動射擊與視覺 |
| `Boss` | `update`、`shootPattern`、`takeDamage`、`draw` | 大型 HP、巡航、血量階段與 Boss 彈幕 |
| `Game` | `start`、`togglePause`、`update`、`draw` | 組合各模組與遊戲迴圈 |

`Enemy.escaped` 只標記事實，防線扣損由 `StageDirector.onEnemyEscaped()` 統一執行。`Boss` 仍是後續擴充點；`PowerUp` 已由技能與事件系統生成。事件完成時建立 `dragonfruit`，一般隨機生成不包含此類型。

## TowerFrontier 塔防介面

| 模組 | 主要介面 | 責任 |
|---|---|---|
| `Monster` | `update`、`takeDamage`、`applySlow`、`progress` | 路徑移動、HP、護甲、緩速與漏怪 |
| `CombatUnit` | `issueCommand`、`setTarget`、`update`、`upgrade` | 前兩個相容入口拒絕移動；`update` 只做固定位置索敵／攻擊，`upgrade` 保留個體成長 |
| `Building` | `config`、`update`、`upgrade`、`sellValue` | 固定弩塔／寒霜塔／火砲塔的索敵與攻擊 |
| `Projectile` | `update`、`hit` | 單體／範圍傷害與緩速效果 |
| `Hero` | `setTarget`、`update`、`castNova` | 玩家移動、自動攻擊、攔截與主動技能 |
| `PathSystem` | `draw` | 固定道路節點與道路繪製 |
| `LayoutSystem` | `select`、`restore`、`resolved`、`apply`、`onResize` | 自動／電腦／手機模式、偏好保存與版面狀態 |
| `NavigationSystem` | `findPath`、`segmentClear`、`nearestOpen` | 30px 導航格、建築障礙、八方向 A* 與路徑簡化 |
| `CommandSystem` | `arm`、`issue`、`hold`、`stop`、`reset` | 管理目前指令模式並把目的地與路徑交給單位 |
| `ArtSystem` | `load`、`drawBackground`、`drawCombatUnit`、`drawBuilding`、`drawUnit` | 本機美術載入、4×4 動作圖集與建築圖集裁切 |
| `ProfessionSystem` | `choose`、`current`、`reset` | 三職業選擇與單局職業鎖定 |
| `WaveCatalog` | `total`、`get` | 30 波名稱、敵軍編成、威脅、提示與清場獎勵資料 |
| `WaveSystem` | `beginPreparation`、`preview`、`canStart`、`start`、`update`、`acknowledgeReward`、`label` | 準備／出兵／清場／結算狀態機與生成佇列 |
| `EconomySystem` | `canAfford`、`spend`、`addKill`、`completeWave`、`refundGold` | 金幣、木材、功勳的集中收支與單次結算 |
| `BuildSystem` | `queue`、`canPlaceAt`、`placeQueued`、`selectAt`、`combatUnits`、`buildings` | 單位／建築分流、選取、部署，透過經濟介面扣款與回收 |
| `EnemyCombatSystem` | `update`、`validTargets`、`strike`、`phase` | 敵軍目標政策、攻擊前搖、Boss 增援／狂暴／範圍技能 |
| `TDGame` | `startWave`、`queueDeploy`、`armCommand`、`commandSelected`、`castNova`、`update` | 協調戰術指令、波次、英雄、建築、經濟與結算 |
| `ArmorySystem` | `obtain`、`canEquip`、`equip`、`equipped`、`apply`、`title`、`visual` | 管理本局戰利裝備、角色相容性、能力修正、稱號與外觀掛件 |

## Skin Pack 介面

每個 pack 必須包含 `id`、`name`、`icon`、`accent`、`secondary`、`background`、`star`、`effect`，以及 `renderers.player`、`renderers.bullet`、`renderers.enemy`。呼叫 `SkyStrike.skins.register(pack)` 後即可被選擇；詳細範例見外觀包製作指南。

## v0.17.0 英雄與指揮介面

Hero.setState 管理 idle／walk／attack／cast；pendingTarget 在攻擊蓄力 0.18 秒後建立 Projectile。ArtSystem.drawHero 依四列圖集與左右鏡像繪製；drawRank 只繪製 Lv.2～5 裝飾。TDGame.selectHero 清除 build.selected／pending、切換命令分類；showCommands 改 UI 分類。paused 只暫停模擬，保留整備操作。

## v0.18.0 英雄技能與種族塔

TowerSkillSystem.rank(kills)、progress(tower)、describe(tower)、fire(tower,targets,projectiles,summons) 管理六類塔技能。ShopSystem.offer(id) 回傳價格／等級，buy(id,economy) 驗證並扣除金幣。Hero.castThunder(monsters,onKill,projectiles)、castSummon(summons) 回傳是否成功。Projectile.owner 保存擊殺來源；TDGame.onKill 使用 rewardHandled 防止重複獎勵。Summon.update(dt,monsters,projectiles) 處理追擊、壽命及來源失效。均為本機 JS API，不新增 HTTP API。

## v0.19.0 英雄流派與傭兵館

Hero.chooseClass(type) 驗證流派；HeroRoster.get(type) 提供普攻與技能資料。HeroRoster.cast(hero,slot,monsters,onKill) 處理非精靈技能；updateFields 處理陷阱與毒霧，drawFields 繪製範圍與軌跡。BuildSystem.queueMercenary(type) 只排隊、不扣款；pendingCost() 提供實際費用；placeQueued() 成功才付費，CombatUnit.mercenary 區分來源。沒有新增網路 API。

## v0.20.0 敵軍動作第一階段

Monster新增walkDistance、state、frame、facing、hitTime、deathTime；updateDeath(dt)只推進死亡圖幀。ArtSystem.drawMonster(ctx,monster)回傳是否已使用新動畫圖集；未載入或不支援類型回退舊drawUnit。TDGame.corpses獨立於monsters，重開局清除。

## v0.21.0 RTS 指揮介面

`TDGame.setGameSpeed(speed)` 僅接受 `1 | 2 | 3` 並回傳是否成功；主迴圈將原始 `dt` 乘上倍率。`updateUi()` 同步 `td-wave-number`、英雄 HP、冷卻能量、四項能力與技能 Cooldown CSS 變數。這些都是本機介面，不新增 HTTP API。

## v0.22.0 戰鬥回饋

`Projectile.update(dt, monsters, onKill, onHit)` 與 `hit(...)` 的 `onHit(monster, actualDamage, critical, projectile)` 為可選回呼。`CombatFeedbackSystem.hit`、`gold`、`death`、`update`、`draw` 管理純視覺物件；`Monster.displayHealth` 僅供平滑血條，不參與存活判定。無網路 API。

## v0.23.0 戰鬥生命週期

`Hero.takeDamage(amount)` 回傳實際傷害，倒下後由 `updateDowned(dt)` 計時復活。`CombatUnit.takeDamage()` 固定回傳 0，士兵不承傷、不死亡；敵軍攻擊目標只包含英雄。`EnemyCombatSystem.update(dt, monsters, hero, defenders, hooks)` 保留既有參數相容並集中處理敵軍攻擊、Boss 階段、增援與踐踏前搖；hooks 只通知 UI 與回饋，不修改經濟。

## v0.24.0 黃金 15 波

`TDDifficultySystem.choose(id)` 只接受 `story | standard | veteran | calamity`；`current()` 回傳顯示資料，`modifiers()` 回傳本局倍率副本。`TDGame.chooseDifficulty(id)` 僅在選角前生效，並由 `applyDifficulty()` 同步 Wave、Economy 與城門。

`EnemyTraitSystem.update(dt, monsters, hooks)` 每幀重算旗手光環並推進祭司治療；`hooks.onHeal(healer, target, amount)` 僅提供視覺回饋。`Monster.effectiveHealth()` 包含剩餘屏障，所有直接傷害回饋以攻擊前後有效生命差計算。未新增 HTTP API。

## v0.27.0 職業武器

`EquipmentSystem.weapon(hero, level?)` 回傳目前或指定階級的武器副本；`nextWeapon(hero)` 在滿級時回傳 `null`；`effectColor(hero, fallback)` 提供戰鬥回饋色；`drawSignature(ctx, hero)` 只繪製裝備特效，不修改英雄狀態。`ShopSystem.offer('spear')` 現在附帶 `visual` 與 `active`，`buy` 成功時附帶實際裝備的 `item`。既有 `Hero.equipment.spear`、三級價格及傷害公式保持相容。

## v0.28.0 暗影英雄掛點

`ArtSystem.drawRogueWeapons(ctx, hero)` 依 `hero.state`、`hero.frame` 與裝備階級繪製兩把武器並回傳是否成功。`drawHero` 只在暗影英雄已購買武器且兩個新素材 ready 時改用無武器底圖。此為內部繪圖 API，沒有修改 `Hero` 或 `Projectile` 的公開戰鬥介面。

## v0.30 新增介面

- `FactionSystem.choose(id)`：選擇 `hunter`、`arcanist` 或 `rogue` 軍團。
- `FactionSystem.available(kind)`／`allows(kind, id)`：取得或檢查目前可建造內容。
- `FactionSystem.unlock(kind, id)`：由戰利品解鎖單位或建築；拒絕未知 ID。
- `LootSystem.createOffers(wave, profession)`：建立 Boss 後三選一；第 5 波保證半獸人戰契。
- `LootSystem.claim(id, context)`：套用解鎖、裝備或資源並防止重複領取同一待選項。
- `TowerEvolutionSystem.branches(type)`／`choose(tower, id)`：列出並選擇 Lv.3 塔分支。
- `Hero.gainExperience(amount)`／`xpProgress()`：增加英雄 XP 並回傳升級數與 UI 進度。
- `CombatUnit.registerKill()`／`mastery()`：累積擊殺並取得 Lv.1～5 熟練等級。

## v0.31 新增介面

- `ArmorySystem.obtain(id)`：把合法裝備收入本局軍械庫，同件不重複。
- `ArmorySystem.canEquip(id, target)`／`equip(id, target)`：驗證英雄職業或守軍類型，配置到 `weapon | armor | relic` 欄位。
- `ArmorySystem.apply(target, config)`：回傳套用乘算與加算修正後的能力副本，不修改基礎表。
- `ArmorySystem.title(target, fallback)`／`visual(target)`：提供進階稱號與主要外觀資料給 UI／`ArtSystem`。
- `LootSystem.createOffers()` 在 3 的倍數波次保證一件軍械；`claim()` 的 context 可傳入 `armory` 以收入裝備。

## v0.32 新增介面

- `ArmorySystem.wearer(id)`：回傳唯一軍械目前持有人，未配置時為 `null`。
- `ArmorySystem.unequip(slot, target)`：卸下指定欄位並重新同步守軍最大生命。
- `ArmorySystem.releaseTarget(target)`：角色離場時一次回收全部裝備。
- `ArmorySystem.equip()` 現在會自動處理原持有人與被替換欄位，結果包含 `movedFrom`、`replaced`。
- `BuildSystem.onRemove(target)`：可選移除事件；出售或死亡清除時呼叫，BuildSystem 本身不依賴軍械系統。

## v0.32.1 PWA 介面契約

- `manifest.webmanifest`：射擊模式安裝資訊，起始頁為專案根目錄並提供塔防捷徑。
- `td.webmanifest`：塔防獨立安裝資訊，`id` 與 `start_url` 均為 `./td-mobile.html`，讓 Android 與 iOS 主畫面入口共用橫向容器。
- `src/td/mobile-pwa.js`：註冊共用 Service Worker、接收 Android `beforeinstallprompt`，並提供 iOS Safari 加入主畫面的說明。
- 圖示來源固定為 192／512 PNG；iOS HTML 入口另使用 180 PNG Apple Touch Icon。

v0.32.2 的 GitHub Pages 部署契約要求 `actions/configure-pages@v5` 傳入 `enablement: true`，讓全新倉庫可建立 Pages Site。


## v0.66.0 戰旗光環

BattleSynergySystem.flagRate(target) 回傳當下有效戰旗倍率；排除失效來源、死亡單位與非士兵／英雄。static damageRate(target) 取支援最大倍率；attackStats(target) 回傳 {base,bonus,total}；drawFlag(ctx,target) 繪製同判定的光環與圖示。沒有新增 HTTP API。


## 0.66.2 角色比例（2026-09-17）

新增 ArtSystem.size(image, target, fallbackFoot, key?) → {height, foot}。依離線量測的可見高度換算繪圖尺寸；key 用於裁切圖集，否則依 image.assetSrc 查詢。沒有新增網路 API、資料庫或權限。


## v0.66.3 侵蝕特效

新增 CombatFeedbackSystem.corrosionKinds(monster)、updateCorrosion(dt,monsters)、drawCorrosion(ctx,layer)、drawCorrosionBadge(ctx,monster,x,y)。layer 為 ground 或 air；只讀取 vulnerability.time／plagueDot.time 與 active。corrosion Map 保存純視覺 age／fade／kinds，reset 清空；不改健康與 debuff 時間。無新增 HTTP API。

## 0.66.4 波次提示

波次預告改為怪物縮圖、數量與威脅標籤，新增入口倒數與短暫開戰提醒。操作、設定、架構、API、部署、還原與驗證方式見 [波次提示文件](WAVE_HUD_V0664.md)。



## 0.67.1 手機波次版面修正

修正波次與倒數重疊、速度列出界，縮小手機提示面板；無操作、設定或資料格式變更。原因、架構、更新、還原及觸控版面驗證見 [版面修正文件](WAVE_LAYOUT_V0671.md)。


## 0.68.1 波次避讓與預覽修正

波次改為靠左小列，預告按需展開，戰鬥提示可點穿；修正三種終極士兵卡片裁切。操作、API、架構、部署、還原與測試見 [版本文件](EDGE_WAVE_PREVIEW_V0681.md)。



## v0.68.2 藤蔓纏繞

新增 updateRoots(dt,monsters) 同步 rootTime 純視覺生命週期，drawRoots(ctx,layer) 接受 ground／air，static vineLeaf(ctx,x,y,angle,size) 畫葉片。roots Map 僅存 age／fade／ending；reset、死亡與移除清理。nature explosion 分支改畫放射藤刺。無 HTTP API 變動。

## 0.68.3 士兵尺寸微調（2026-09-17）

我方部署士兵統一放大 12%，保留相對體型與腳底錨點；英雄、怪物、召喚物和卡片大小維持原設定。無新增操作、設定、API、權限或資料格式。ArtSystem.drawCombatUnit → 腳底縮放 → drawCombatUnitSprite；預覽直接使用未放大的 sprite 方法，避免再次裁切。

安裝與部署流程不變，完整更新後關閉舊分頁再開啟。package.json 與 Service Worker 快取更新至 0.68.3。修改前 ArtSystem.js、package.json、sw.js 保存在 artifacts/soldier-v0683-backup/；若需還原，將 ArtSystem.js 放回 src/td/systems/，其餘放回根目錄，已有後續修改時先比較合併，部署使用新的快取名稱。

驗證：342 項測試通過；全角色圖在 artifacts/qa-unit-scale/roster.png；三種終極士兵的六張卡片預覽仍完整。此版本只改畫面尺寸，射程、攻擊、碰撞與移動數值不變。


## v0.69.0 英雄技能與動畫完整顯示

新增 HeroSkillVFX.emit/update/draw/drawField/summonBirth，事件只存展示位置。ArtSystem.drawFrame(ctx,image,column,row,x,y,width,height) 使用 SpriteFrameBounds.frames/cuts，維持比例與座標，允許跨格並排除鄰幀。缺資料退回舊 4×4。無 HTTP API 變動。
## 0.69.1 地面戰利品 API

`FieldLoot`、`LootSystem.rollDrop/grant/milestone` 與擴充後的 `ShopSystem` 見 [版本文件](FIELD_LOOT_SHOP_V0691.md)。

## 0.69.7 雙隘口路線校準

依正式圖片的鋪石路面重新取樣上下道路中心，修正彎道偏向路緣；共用末段長度同步計算。沿用 maps → Monster／BuildSystem／MiniMapView 架構，不改圖片、素材腳底或 API。重新開始遠征即可使用新座標，無設定與存檔遷移；部署完整版本與新的 Service Worker 快取。回復前資料在 artifacts/route-v0697-backup，請逐檔比較，避免覆蓋其他工作。

6 項雙路測試與語法檢查通過；新增獨立路面取樣回歸、完整路線怪物截圖，見 artifacts/qa-twinpass/full-route-battle.png。全套當次為 375/377 通過，兩項旗幟／統領光環測試失敗，涉及另行修改中的軍團平衡，未在此地圖修正中改動。
# v0.74.0 本機介面

`BattleReportSystem.balanceReadiness()` 回傳 `ready`、`total`、`minimumPerStrategy`、`groups`、`missing` 與 `recommendations`。這是本機 JavaScript 介面，未新增網路 API。
# v0.75.0 本機介面

`Building.upgradeCost()` 的 `merit` 在目前等級 3／4 時回傳 1／2。`LootSystem.get('frontier-supplies').resources` 僅含 `gold:120`、`lumber:2`。兌換 API 不變。
# v0.76.0 本機介面

`BattleReportSystem` 新增 `recordMerit(source, amount)`、`recordExchange(direction, rate)`、`actualStrategy()` 與 `compatibleRecords()`。`analysis()` 新增 `actualStrategy`、`merit`、`spending.exchange`、`peakMerit`；完成紀錄新增版本與 `remainingMerit`。
# v0.77.0 章節存檔介面

`ChapterCheckpointSystem` 提供 `read()`、`capture(game)`、`restore(game, snapshot)`、`describe()` 與 `clear()`。格式版本為 `schema: 1`，合法波次僅為 10、20。
# v0.79.2 戰報相容性

無新增 API。新局的 `strategy` 欄位仍寫入 `free`，但不再由玩家開局介面設定。

## v0.80.0 內部介面

- `FactionSystem.FACTIONS.wild`：第四軍團原生 units/buildings。
- `ArmorySystem.recommend(id, targets)`：回傳最多三筆 `{target, score, reason}`。
- `ArmorySystem.compare(id, target)`：回傳可顯示的 stat rows 與原始特殊效果描述。
- `CombatUnit.tribalFrenzy`：戰鼓與大酋長共用的限時狂潮狀態。


## 0.83.0 · 大廳與獨立測試輪次

新增本機 ProfileStore、StoryCatalog、FrontierApp；Storage adapter 區分 profile 與 mode。沒有新增網路 API。 完整操作、限制、架構與回復步驟見 [P0 說明](LOBBY_P0_V083.md)。

## v0.83.3

ProfileStore profile 新增 wallet.gold、wallet.diamonds 非負安全整數欄位；缺欄位的舊存檔自動补零。TDGame.refreshRosterPreviews 重用 ArtSystem.preview；無新增 HTTP API。詳見 [v0.83.3](LOBBY_EXPEDITION_V0833.md)。

# 地精本機規則接口

`GoblinNetworkSystem.update(dt, items, economy, activeWave)` 從 BuildSystem items 重算連線；`activate(items)` 開始超載，`startWave()` 重設每波經濟額度，`snapshot()/restore(data)` 寫入／讀取可選檢查點狀態。無新 HTTP API、資料庫或對外權限。參數集中於 `GoblinNetworkSystem.RULES` 與 `ns.config.units/buildings`；見 [地精 V1](GOBLIN_FACTION_V1.md)。

英雄武器資料與商店介面仍使用既有 `EquipmentSystem.WEAPONS`、`ShopSystem.offer/buy` 及 `equipment.spear`；新增圖集欄位與階級見 [v0.84.5 武器紀錄](FACTION_HERO_WEAPONS_V0845.md)。


## 商城單一入口與雷霆戰王（0.6.1）

正式商城統一由 `td.html` 大廳或 `td.html?panel=shop` 進入；獨立 `shop.html` 與專用啟動程式已刪除，舊 4187 展示服務已停止。雷霆戰王沿用原有玩家檔案保存購買與裝備，四組動作已接入正式戰場。共用商城元件及既有收藏保留。

操作、API、部署、測試與回復限制見 [0.6.1 整合說明](shop/THUNDER_TD_V061.md)。

> v0.85.4：`TDGame.onHit` 將完整來源傳給 `CombatFeedbackSystem.hit`；後仰只改 `Monster.visualPosition()`，沒有外部 API 或存檔 schema 變動。詳見 [命中回饋交付](HIT_FEEDBACK_V0854.md)。
> v0.85.1：根目錄 `td.html` 已整合霜牙肖像與霜原盟族群像；介面與資產說明見[選角插畫交付](FROSTLAND_SELECTION_ART_V0851.md)。

v0.85.0 無新增網路 API。FrostStatusSystem 提供 apply／update／prepare／beforeHit／afterHit／death；FrostlandAnimation.queue／update 控制出手時間，FrostlandSprites 接 ArtSystem。Shop/Loot 依目前隊伍過濾軍械，存檔 schema 不變。完整接口與資料流見 [冰原 V1](FROSTLAND_FACTION_V1.md#i-core-與架構)。
> **v0.85.14：** 無新增 HTTP API；前端新增 `TutorialSystem`、`WaveSystem.holdPreparation()` 與 story profile 引導旗標。詳見 [第一章引導](CHAPTER1_ONBOARDING_V08514.md)。
> **v0.85.15：** 無新增 HTTP API 或 schema；教學波次轉場由既有 `acknowledgeReward()` 事件接入。詳見 [引導修正](CHAPTER1_ONBOARDING_V08515.md)。
> **v0.85.16：** 無新增 HTTP API 或 schema；僅擴充前端教學位置半徑與既有放置事件。詳見 [教學修正](CHAPTER1_ONBOARDING_V08516.md)。

> **v0.85.17：** 無新增 HTTP API、資料庫或 schema；新增的部署、商城開關與購買引導皆是既有前端方法的事件包裝。詳見 [教學操作修正](CHAPTER1_ONBOARDING_V08517.md)。
> **v0.85.21：** `TutorialSystem.onUnitSelected()` 管理先選士兵再升級；`dismissTutorialModal()` 安全收尾教學開啟的裝備／掉落面板。無 HTTP API 或存檔 schema 變更。詳見 [教學流程修正](CHAPTER1_ONBOARDING_V08521.md)。
# v0.85.48 支援光環介面

`BattleSynergySystem.applyHaste(target, rate, source)` 以最高值規則更新 `target.supportHaste`，並同步寫入 `target.supportHasteSource`。`TDGame` 讀取後在英雄／守軍選取卡顯示來源與百分比。沒有新增 HTTP API、帳號欄位或資料庫 migration。
