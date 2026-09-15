# API 文件（內部模組介面）

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

- `Building.upgradeCost()` 回傳 `{gold,merit}` 或 Lv.5 的 `null`；`gold` 為塔原價乘 `[2.8,4.2,6.2,8.4]` 後取整至 10G，`merit` 僅 Lv.4→5 為 1。`BuildSystem.upgrade(economy)` 仍原子性扣款，失敗不升級。
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
- `td.webmanifest`：塔防獨立安裝資訊，`id` 與 `start_url` 均為 `./td.html`。
- 圖示來源固定為 192／512 PNG；iOS HTML 入口另使用 180 PNG Apple Touch Icon。

v0.32.2 的 GitHub Pages 部署契約要求 `actions/configure-pages@v5` 傳入 `enablement: true`，讓全新倉庫可建立 Pages Site。
