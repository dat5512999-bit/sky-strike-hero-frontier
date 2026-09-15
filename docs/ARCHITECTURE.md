# 系統架構

## 0.60.0 瀏覽器縮放與 HUD 密度

```text
Browser Zoom
   ↓ 改變 CSS Viewport／DPR
CSS media query
   ├─ Wide desktop：放大個別邊緣 HUD
   └─ Narrow／short：緊湊 HUD＋控制列置中

World／Camera／Canvas／Input ── 不變
```

此版沿用單一 DOM、單一 Gameplay 與單一 Responsive CSS。沒有新增 Scale Manager 或第二套 PC UI，也不以父層 transform 模擬瀏覽器縮放；因此地圖座標和 fixed 控件不會被額外的座標系影響。

## 0.59.0 遠征選角 Presentation

```text
HeroRoster.selectionArt ─────┐
FactionSystem.selectionArt ─┼─ TDGame.attachDifficultyUi
Difficulty.selectionArt ────┘          │
                                       └─ CSS custom properties → 選角卡背景

原 Hero／Faction／Difficulty ID → 原選擇流程 → 原 Build／Combat
```

美術 metadata 只屬 Presentation seam；英雄立繪、軍團橫幅與難度圖集互相獨立。沒有新增選角 Manager、網路圖片服務、資料庫或 PC／Mobile 分支邏輯。

## 0.58.0 戰場清晰度補強

```text
WaveSystem → Monster.routeDistance → TDGame.updateMonsterConvoy
                    │                         │
                    └── x/y 世界座標不變 ←── maxAdvance（僅限制後車）
                                               ├─ Target / Projectile / AoE / Chain
                                               └─ Path / Gate / Leak

Map.heroVulnerable ─┬─ false → EnemyCombat 不攻擊 Hero、HUD 隱藏 HP
                    └─ true  → 沿用既有受傷／倒下／復活

Build data → Faction permission → cost/wood display order
                                ├─ Desktop full Grid
                                └─ Mobile horizontal Drawer
```

本版沒有新增 CollisionSystem、ModalSystem、第二套 Mobile BuildSystem 或地圖座標。軍械／戰利品只更換 Presentation；正式 1536×1024 Map 仍是 World。

## 0.57.0 戰場與固定部署架構

```text
beginner-valley-v1.png（1536×1024 正式 World）
        + maps.js（Path / Build Areas / Safe Area）
        ├─ BattlefieldCamera → PC / Laptop / Mobile Viewport
        ├─ WaveSystem → Monster（單列、逐隻）→ PathSystem
        ├─ BuildSystem → Building（固定）
        │             └→ CombatUnit（固定、自動攻擊、一人一裝備）
        └─ MiniMapView（同一 World 的縮圖）

Hero（可移動） ─┐
CombatUnit（固定）├→ Projectile / Damage / Feedback
Building（固定） ┘
```

核心約束：Map 與 Viewport 分離；世界座標不隨裝置改變。正式地圖、迷你地圖、索敵、投射物、AoE、Chain 與建造判定讀取同一套座標，沒有 PC／Mobile Gameplay 分支。`FrontierTerrain` 的動態光影僅屬 Presentation。

## 0.55.0 士兵定點架構（2026-09-15，本機）

`BuildSystem` 在合法位置建立各自獨立的 `CombatUnit` → `CombatUnit` 使用既有 `TargetSelector` 鎖定射程內目標 → 沿用 `Projectile` 傷害與特效。怪物沿 `Monster` 路徑前進，不因士兵改速；`EnemyCombatSystem` 只把英雄視為可承傷角色。這是 0.55.0 歷史架構；0.57.0 已停用士兵的 `CommandSystem`／`NavigationSystem` 移動接縫。裝備由 `ArmorySystem.owned`（實體副本）→ `assignments`（唯一持有人）→ `CombatUnit.gear`（最多一格）串接；沒有新 Manager、資料庫或網路 API。英雄與塔沿用原架構。

## 0.54.3 商城與技能分區（2026-09-14，本機）

`td.html` 的唯一商店按鈕移至 `.td-quick-rail`；`TDGame` 保留原開店事件與 R 鍵路徑。`.td-hero-dock` 僅呈現 Q／W／E／F，`TDGame` 把大絕名稱與冷卻秒數分別寫入文字及 `.skill-cooldown`。遊戲邏輯和 UI 表現仍分離。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

`CombatUnit` 等級資料 → `ArtSystem.drawCombatUnit` 的素材輪廓光 → `drawRank` 腳邊標記；召喚物沿用同一非建築標記。建築仍走原 `drawBuilding/drawRank(building=true)`。繪圖與攻擊／升級計算保持分離。

## 0.54.1 英雄小卡（2026-09-14，本機）

原 `Hero / TDGame.updateUi` → 同一批 DOM ID；常駐層顯示頭像、等級、HP／MP，`<details class="hero-more">` 按需顯示 XP、能力、裝備。`td-combat.css` 僅控制 PC／橫向邊緣 HUD 外觀，`td.css` 提供手機直向內容；不涉及世界座標或戰鬥系統。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

`maps + FrontierTerrain.cache + Monster/Building/Hero` → `MiniMapView.draw` → 右上 Canvas；小地圖點擊 → 原 `BattlefieldCamera.focus`。右側選取圖塊 → 原 `.selection-details`；軍械圖塊 → 原 `TDGame.openArmory`。手機直向不用右側圖塊；不新增地圖座標、索敵、建造或戰鬥系統。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

TDGame 資源／暫停狀態 → 原 DOM ID → td-combat.css 邊緣戰鬥呈現。暫停鍵仍在原 hud-controls 節點，CSS 視覺定位到右上資源列；手機直向走 td.css 原佈局。無第二套控制器。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

共用關係：maps.path → Monster／BuildSystem／FrontierTerrain；BuildSystem.placementIssue → canPlaceAt＋錯誤說明；ArtSystem.frontierGround → 靜態地表快取；BuildSystem.pending → 地表提示；maps.openingFocus → 既有 Camera 首次取景。只抽取原判定結果，不新增導航、物理或 Manager。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

ArtSystem原載入器 → frontierGround → FrontierTerrain靜態離屏快取；ns.config.path仍同時驅動實際移動與道路畫面。ArtSystem.skillIcons.ready + Hero.classType → TDGame.updateUi的body資料屬性 → CSS圖集位置。折疊使用原生details，同一批按鈕保留原事件；未建立新Manager。

## 0.50.0 大地圖原型（2026-09-14，本機）

開局地圖選擇 → TDGame.chooseMap → maps.apply 更新唯讀 config（width/height/path/heroSpawn/mapId/roadClearance/roadUnits）；同一份 path → Monster 移動／BuildSystem 禁建／FrontierTerrain 繪圖；config尺寸 → NavigationSystem 與 BattlefieldCamera。戰鬥世界與鏡頭座標分離。未新增第二套遊戲、導航、建造或傷害系統。舊TDGame固定720地景分支僅保留給classic。


## 最新：0.49.0 鏡頭原型

0.49.0：Pointer → canvasPoint → Camera.screenToWorld → 原建造／指令；原世界圖像 → Camera.begin變換 → 原draw → Camera.end還原。Canvas backing尺寸是視窗解析度，不再代表世界大小；世界仍由ns.config.width/height定義。PC／橫向共用相同鏡頭與玩法，直式沿用720畫布。大地圖的導航／路線／美術尚未改動。

## 0.48.0 UI 分層

`LayoutSystem → main.js（呈現旗標）→ td-combat.css → 同一 DOM 控件 → 原 TDGame／BuildSystem`。

英雄能力折疊保留原數值 ID；建造卡移動重用原 DOM，不複製事件。新增樣式不改渲染器、世界座標、索敵或傷害。下一階段候選為大地圖＋鏡頭，必須先驗證螢幕座標與世界座標雙向換算，不能只放大背景。

## v0.47.0 戰鬥版面與建造流程

```text
LayoutSystem ── desktop / mobile + portrait / landscape ── td.css
       │                                             │
       └─ main.js 搬動同一批建造卡至 Drawer／舊指令格 ┘

建造卡 → TDGame.queueDeploy → BuildSystem.queue
Canvas 指標移動 → BuildSystem.updatePointer → 半透明預覽＋射程
Canvas 點合法位置 → BuildSystem.stagePlacement → TDGame.confirmPlacement → BuildSystem.confirmPlacement
                                      └→ 原 placeQueued → Economy.spend → Building／CombatUnit
取消／無效位置 → 不進入 placeQueued、不扣資源
```

Hero、Wave、Projectile、塔攻擊與數值管線未改；桌面與手機共用同一 `TDGame`／`BuildSystem`。Canvas 邏輯地圖仍是 720×720 正方形，橫式版只重排 UI、不伸縮或裁切遊戲座標。P3 只補銀葉 Q 的有效目標檢查，P4 只整理建造卡的第一／第二層資訊；完整座標耦合與未來方案見 [Battlefield／Camera／Canvas Audit](BATTLEFIELD_CAMERA_CANVAS_AUDIT.md)。

## v0.46.0 塔定位最小補強

`config.buildings.role → TDGame 建造卡／Tooltip` 顯示塔的用途；`BuildSystem.applyTowerSupport()` 每個戰鬥步進從現有建築計算附近守軍的最高戰鼓攻速增益，`CombatUnit.config()` 換算為攻擊間隔，無疊加或永久狀態。獅翼弩砲只在 `Building.update()` 對既有目標清單增加支援怪優先序，其他塔仍按路徑進度。幽骨召喚殿與冥燈墓園將持續、距離、速度、傷害、上限等資料放在既有 `config.buildings`，`TowerSkillSystem.fire()` 繼續產生既有 `Summon`。沒有新 Manager、資料庫、HTTP API 或存檔格式。

## v0.45.0 英雄 × 軍團最小解耦

`開局 UI → TDGame.selectedProfession / selectedFaction → ProfessionSystem + HeroRoster / FactionSystem`。前者保留英雄身份、技能、武器與召喚；後者提供 `FactionSystem.available/allows` 給既有 `BuildSystem`、建造 UI 與傭兵館。`LootSystem` 接收兩個 ID，英雄決定入門軍械、軍團決定自身內容；`BattleReportSystem` 記錄兩者。沒有新資料夾、資料庫、HTTP API 或通用 Effect Engine。`TDGame.chooseProfession` 沿用名稱以減少改動，未來若新增 Hero Registry 可再考慮命名整理。塔進階僅在 `TowerEvolutionSystem.apply` 與 `TowerSkillSystem.fire` 修正個別分支的實際投射物設定，不觸及全域 `Projectile` 命中公式。

## v0.44.2 敵軍視覺編隊

`WaveSystem → Monster.update → Monster.x/y/index` 仍是唯一邏輯路徑；`TargetSelector / Projectile / AoE / Chain / Tower / Hero` 照舊讀 `x/y`。繪圖使用 `Monster.visualPosition()` 由道路切線求法線、固定三列錯位與小幅前後變化；`TDGame.draw()` 依視覺深度繪怪，再獨立繪製條件式 HP Bar。`Projectile.chainPoints`、`CombatFeedbackSystem` 只將顯示端點對齊視覺位置，不反寫傷害座標。沒有物理碰撞、第二條路徑、新資料庫或 API。

## v0.44.1 巡林者換裝圖層

`Hero.gear.weapon`／`Hero.equipment.spear` → `ArtSystem.drawHero()` 選無武器底圖 → `drawHunterWeapon()` 優先軍械庫弓、否則職業弓 → `drawGearPieces(..., skipWeapon)` 補畫非武器裝備。此流程只改 Canvas 繪製，不反寫 `Hero` 或 `ArmorySystem`，也不改投射物與傷害資料流。

## v0.44.0 UI/UX 資料流

```mermaid
flowchart LR
  Layout[LayoutSystem: PC / Mobile] --> Surface[main.js: 同一批建造按鈕搬移]
  Opening[開局卡片] --> TDGame[TDGame 狀態與介面]
  Surface --> TDGame
  TDGame --> Build[既有 BuildSystem / EconomySystem]
  TDGame --> Wave[既有 Wave / Hero / Combat]
  Menu[⚙ 遊戲選單] --> TDGame
  TDGame --> Reset[既有 reset + 上局設定重套]
```

開局為全視窗選擇層，戰鬥為 PC 寬戰場＋右指揮欄或既有 Mobile 底部面板；兩者共用 `TDGame`、建造資料和數值。Canvas 保持 720×720 邏輯座標，只改 CSS 顯示尺寸與周邊版型，不擴地圖、不拉伸座標。桌機 Drawer 只移動既有建造 DOM，不另建 BuildSystem。無資料庫／外部 API／新網路服務。

## v0.43.0 守軍指揮與選角容錯

`CommandSystem → CombatUnit.issueCommand → 導航／駐守點`；無手動命令時 `CombatUnit → TargetSelector → 既有攻擊／Projectile`。有效目標保留鎖定，死亡、越界或路徑失敗才重選；追擊超界則走原 `NavigationSystem` 返回駐守點。英雄與建築仍保留各自現行索敵，沒有第二套戰鬥引擎。圖片改回 `ArtSystem.load → Image.src／onload → coreStatus → 選角進場`，不經 v0.41.0 的按需佇列作首次載入，也不繞過完整圖片門檻。靜態前端，無資料庫或伺服器 API。

## v0.42.0 資源與控場資料流

`config.buildings → FactionSystem.available → BuildSystem.queue/place → Building.upgradeCost（依建造價）→ EconomySystem.spend → TDGame 選取價格`。攻擊走原有 `Building.update → TowerSkillSystem.fire → Projectile.hit → Monster.applySlow/takeDamage`；`Projectile` 先讀取敵人原有強緩速狀態，再套新緩速與 `bonusVsSlowed`，避免一顆子彈自我觸發連攜。`TDDifficultySystem.veteran → WaveSystem.spawnInterval / Monster.healthRate` 只改第三難，不更動其他難度。`ArtSystem` 沿用冰塔圖集並加王國冰徽；無資料庫、HTTP API 或存檔 schema 變更。

## v0.41.0 大絕與圖片生命週期

`F／觸控按鈕 → TDGame.castUltimate → HeroUltimateSystem → Projectile.hit → 命中／擊殺／經濟與回饋`；大絕設定集中一個模組，原 Q／W／E、商店、怪物與塔不用重寫。`選角／畫面繪製 → ArtSystem 按需請求（4 並行、失敗重試）→ coreStatus 確認地圖＋首波怪物＋所選英雄 → 進戰場`；`Service Worker` 僅預存 HTML／CSS／JS／圖示，戰場圖片使用時快取。無資料庫與新伺服器。

## v0.40.1 透明換裝修復

`ShopSystem 購買弓 → hero.equipment.spear → ArtSystem.drawHero(v4 真透明底圖) → drawClassWeapon(武器層)`。只替換美術來源與 Service Worker 快取，戰鬥傷害、裝備持有與存檔結構不變。

## v0.40.0 軍團與敵軍擴編

`FactionSystem.FACTIONS → config.units → BuildSystem → CombatUnit → ArtSystem.combatUnits`。新六兵僅擴資料與圖像路由，移動、攻擊、升級、軍械、商店互斥沿用既有系統。敵軍路徑為 `WaveCatalog → WaveSystem → Monster.TYPES → EnemyCombatSystem/ArtSystem.enemyActions`，三個新職責透過既有怪物攻擊角色運作。`td.html/td.css` 提供建造與傭兵呈現；`sw.js` 快取八張新增 PNG。無資料庫、外部 API 或持久資料 schema 改動。

## v0.39.0 裝備、召喚與手機資料流

`ShopSystem → hero.equipment → EquipmentSystem.weapon/projectileOptions → Hero Attack → Projectile → Monster`；特殊武器只組合既有連鎖與濺射，不另建傷害系統。視覺走 `EquipmentSystem.weapon → ArtSystem 無武器底圖 + class-weapons-atlas`。召喚走 `Hero/TowerSkillSystem → Summon(form) → ArtSystem.drawSummon → 4×4 atlas`。傭兵走 `FactionSystem.available/allows → canHire → TDGame.updateUi → BuildSystem.queueMercenary`。手機版則由 `LayoutSystem → body[data-layout]` 與 `main.js → body[data-mobile-panel]` 控制，與遊戲迴圈完全分離。

## v0.38.0（2026-09-12）

所有難度皆為 30 關，城門數字表示耐久。選角 Canvas 與戰場共用 ArtSystem.drawHero，圖片載入後持續重繪預覽。難度摘要由 TDDifficultySystem 與 WaveCatalog 即時產生。

```mermaid
flowchart LR
  Difficulty[TDDifficultySystem] --> Menu[難度卡摘要]
  Catalog[WaveCatalog 關卡總數] --> Menu
  Difficulty --> WaveSystem --> Monster[Monster 血量與護盾]
  Difficulty --> Economy[EconomySystem 擊殺及過關金幣]
  Art[ArtSystem.drawHero] --> Preview[選角 Canvas]
  Art --> Battlefield[戰場英雄]
```

沿用現有 src/td/systems、entities、tests、docs 結構；沒有新增資料庫或外部服務。

## v0.36.0 兵種擴充資料流

新守軍不新增 System：`FactionSystem → BuildSystem.queue/placeQueued → CombatUnit → ArtSystem.combatUnits`。數值、陣營清單與圖像註冊仍分離；knight／treant／golem 沿用準備期導航、選取、升級、軍械與出售。當時版本的負傷恢復在 0.55.0 已移除。敵軍仍走 `WaveCatalog → Monster → EnemyTrait/EnemyCombat → ArtSystem.enemyActions`，未改寫波次狀態機。

## v0.35.0 英雄與十三塔資料流

`Hero.classType → ArtSystem` 現在使用專屬英雄圖集，`CombatUnit.type → ArtSystem.combatUnits` 則維持普通守軍圖集，從素材層根治英雄與招募單位同外觀。新塔仍走 `FactionSystem → BuildSystem → Building → TowerSkillSystem／TowerEvolutionSystem → ArtSystem`，沒有新增第二套建造或經濟系統。`faction-towers-v2.png` 僅提供三欄塔族、三列 Lv.1／3／5 模型。

## v0.34.0 三十波資料流

現有 `WaveCatalog → WaveSystem → TDGame` 關係不變。新增內容只擴充資料列；`WaveSystem` 依 `catalog.total()` 自動處理第 30 波完成，`TDGame` 只協調結算與 UI。`Monster` 使用分段生命曲線，`EnemyCombatSystem` 依 Boss 波次選擇既有敵種作為第二階段援軍。Loot、Economy、BattleReport、Difficulty、Armory 與建造模組都沒有複製或重寫。

## v0.33.0 負傷恢復資料流

`TDDifficultySystem.unitRecovery → TDGame.applyDifficulty() → BuildSystem.setUnitRecovery() → CombatUnit.takeDamage()/updateRecovery()`。一般難度的負傷實體仍留在 `BuildSystem.items`，但不出現在 `combatUnits()`，因此不會索敵、擋怪或被敵軍選為目標；倒數完成後保留同一實體歸隊。只有永久陣亡或玩家遣散才經 `onRemove → ArmorySystem.releaseTarget()`，避免誤清養成與唯一軍械。沒有新增資料庫、API 或大型 System。

## 設計原則

- 純 HTML / CSS / JavaScript，無執行期依賴。
- 各實體只管理自身狀態；碰撞、生成、武器與流程由 systems 負責。
- `Game` 負責協調，不承載特定武器或敵人規則。
- 實體只保留碰撞與狀態；繪圖委派給目前的 Skin Pack，皮膚不影響傷害與平衡。
- `Spawner` 只決定威脅與敵人組合，`SkillSystem` 只管理果實及技能，不把規則塞入 Game loop。
- `GameState` 統一處理 Combo、分數倍率與最高紀錄，避免 Enemy 或 UI 自行計分。
- `DifficultySystem` 提供資料驅動的模式設定，`Spawner`、`Enemy`、`SkillSystem` 與 `ChallengeSystem` 只讀取目前模式。
- `ChallengeSystem` 只處理事件狀態機與獎勵生成，不直接改寫敵人或玩家規則。
- `BattlefieldRenderer` 只負責背景層次與環境氣氛；不建立敵人、修改速度或參與碰撞。
- `Effects` 使用有上限生命週期的粒子、衝擊波與震動強度，所有物件會在到期後移除。
- `StageDirector` 管理波次、倒數、防線耐久、詞綴、Boss 進出與固定獎勵，不直接生成一般敵機。
- `SupportSystem` 管理分身／戰寵等級、位置、射擊及繪製，使用既有 `Bullet` 與碰撞流程。
- 不需要資料庫；局內狀態於重開時重設，偏好與紀錄只存於瀏覽器。
- `TowerFrontier` 是獨立命名空間；塔防不讀寫 `SkyStrike` 的玩家、波次或碰撞狀態，避免雙模式互相污染。
- `ArtSystem` 非同步載入塔防背景、建築圖集、4×4 單位動作圖集與守護城堡；`CombatUnit` 只提供動畫狀態與影格，不知道實際檔名。
- `ProfessionSystem` 管理單局職業鎖定與職業說明，不直接修改怪物或經濟；職業戰鬥差異由資料驅動的塔設定處理。
- `NavigationSystem` 只建立導航格、建築障礙與 A* 路徑；`CommandSystem` 將 UI 指令轉成單位訂單，兩者不負責傷害或經濟。
- `LayoutSystem` 管理塔防介面偏好、700px 自動判斷與 `data-layout` 狀態；CSS 只依狀態排版，不接觸遊戲物件。
- `WaveCatalog` 只保存關卡資料；`WaveSystem` 只管理波次生命週期；`EconomySystem` 是塔防金幣、木材與功勳的唯一收支入口。

## 資料夾

```text
index.html
td.html / td.css   英雄塔防獨立入口與響應式 UI
styles.css
src/
  entities/    Player, Enemy, Bullet, Boss, PowerUp
  skins/       SkinRegistry 與內建外觀包
  systems/     Weapon, Collision, Spawner, DifficultySystem, SkillSystem,
               ChallengeSystem, StageDirector, SupportSystem,
               BattlefieldRenderer, GameState, Effects
                InputController（滑鼠絕對定位／觸控相對拖曳）
  utils/       數學工具
  Game.js      遊戲協調與迴圈
  main.js      UI 啟動入口
  td/
    entities/  Monster, Projectile, CombatUnit, Building, Hero
    systems/   ArtSystem, ProfessionSystem, PathSystem, LayoutSystem,
               NavigationSystem, CommandSystem, WaveCatalog, WaveSystem,
               EconomySystem, BuildSystem, EnemyCombatSystem
    TDGame.js  塔防流程協調、UI 與 Canvas 繪製
tests/         Node 內建測試
docs/          操作、維運、API 與 QA 文件
manifest.webmanifest / sw.js   PWA 與離線快取
.github/workflows/pages.yml    Pages 驗證與部署
```

## 模組關係

```text
main → Game → GameState
             ├─ DifficultySystem → Spawner/Enemy/SkillSystem/ChallengeSystem
             ├─ Player ← Weapon → Bullet
             ├─ Spawner → Enemy
             │             └─ EnemyBullet
             ├─ SkillSystem → PowerUp → Weapon/Player/Enemy
             ├─ ChallengeSystem → PowerUp(Dragonfruit)
             ├─ StageDirector → Affix/Defense → Spawner/Enemy/Boss
             │                └─ Boss / PowerUp(Support Core)
             ├─ SupportSystem → Bullet
             ├─ BattlefieldRenderer → Skin Pack colors
             ├─ GameState → Combo/Multiplier/High Score
             ├─ Collision(Player, Bullet, Enemy, EnemyBullet, PowerUp)
             ├─ SkinRegistry → Player/Bullet/Enemy renderers
             └─ Effects
```

後續武器以策略物件擴充 `Weapon`，敵機以行為類別或策略擴充 `Enemy`；Boss 與 PowerUp 已保留獨立實體邊界，無需改寫玩家或碰撞核心。

100 波不是 100 份硬編碼腳本。`StageDirector` 依波次計算章節、戰區、一般波時長、詞綴、Boss 類型與支援獎勵；`modifiers()` 將生命、速度、射速與雙生機率交給生成／敵人流程，`onEnemyEscaped()` 集中處理防線損傷。後續可加入章節設定物件，覆蓋特定波次的背景、敵人權重、事件或 Boss 行為。

Skin Registry 讓每個品牌／主題包保持獨立。外觀 renderer 只能讀取實體位置、旋轉、動畫時間與外觀變體，不修改 HP、碰撞箱、速度或傷害。背景與粒子共用系統讀取目前皮膚色票，因此新皮膚不必重寫完整特效管線。

## 塔防資料流

```text
td/main → TDGame → WaveSystem → WaveCatalog
                 │          └→ Monster → Path
                 ├─ ProfessionSystem → 單局職業鎖定
                 ├─ BuildSystem → CombatUnit（固定）/ Building（固定）→ Projectile
                 ├─ CommandSystem / NavigationSystem（舊相容接縫，不改士兵位置）
                 ├─ LayoutSystem → body[data-layout] → Desktop/Mobile CSS
                 ├─ Hero → Projectile / Nova / Intercept / Respawn
                 ├─ EnemyCombatSystem → Hero damage / Boss phase（士兵不承傷）
                 ├─ ArtSystem → Background / Atlases / Keep
                 ├─ EconomySystem → Build / Upgrade / Sell / Kill / Wave Reward
                 └─ Base Health → Leak → Victory / Game Over
```

`WaveCatalog` 提供不可變的 30 波設計資料；`WaveSystem` 依序執行 `preparing → spawning → clearing → reward`，結算事件只發出一次，再自動進入下一次準備。`Monster` 自行沿節點移動；`CommandSystem` 透過 `NavigationSystem` 將目的地轉為避障路徑，`CombatUnit` 執行訂單，`Building` 固定索敵；`TDGame` 只協調事件與 UI，收支交由 `EconomySystem`。

角色圖集固定為 4 欄×4 列，列順序是待機、行走、攻擊、受擊／死亡；建築圖集固定為弩塔、寒霜塔、火砲塔三欄。背景採 720×720 座標，更換素材時需同步驗證裁切、Alpha、道路與禁建距離。

## v0.17.0 英雄與指揮介面

英雄資料流：頭像／F1 → TDGame.selectHero → Hero.selected／setTarget → Hero 動作狀態 → ArtSystem.drawHero；蓄力完成 → 原 Projectile 傷害流程。升級 → 原等級與經濟 → ArtSystem.drawRank。HTML 顯示招募／命令分類，CSS 依 data-panel／data-selection 顯示相關操作；桌面戰場左側、指令右側，手機直向排列。

## v0.18.0 英雄技能與種族塔

既有職業、波次、導航及經濟保留，新增低耦合技能／商店／召喚模組，無新資料庫。

```text
UI → TDGame → Hero → Projectile
             ├→ ShopSystem → EconomySystem + Hero.equipment
             └→ Building → TowerSkillSystem → Projectile / Summon
Projectile → TDGame.onKill → EconomySystem + owner.registerKill
ArtSystem → 既有圖集 / faction-towers-v1.png 三階塔圖
```

## v0.19.0 英雄流派與傭兵館

沿用原本遊戲循環，新增流派資料與地面技能，不重建戰鬥架構。

```text
開場流派 → ProfessionSystem + Hero.chooseClass → HeroRoster
商店傭兵 → BuildSystem.queueMercenary → placeQueued → CombatUnit
CombatUnit → NavigationSystem / CommandSystem / 既有升級回收
HeroRoster → Projectile / fields / Summon → 既有擊殺結算
ArtSystem → 原有英雄／獵手／盜賊動作圖集 + 階級裝甲
```

沒有新增資料庫；局內狀態不存檔。

## v0.20.0 敵軍動作第一階段

```text
Monster.update → 實際路程 → 八幀走路 + 左右朝向
Monster.takeDamage → 四幀受擊 / active=false
TDGame.onKill → 一次獎勵 + corpses（上限60）
corpses → updateDeath → 倒地淡出 → 一秒移除
ArtSystem.drawMonster → 三種透明動作圖集
```

純本機視覺與狀態擴充，沿用原有經濟、波次、碰撞與資料保存方式。

## v0.21.0 RTS 指揮介面

```text
td.html HUD 控制 → src/td/main.js DOM 綁定 → TDGame
TDGame.updateUi → Wave／Hero／Economy 狀態 → HUD 與 Cooldown CSS
速度按鈕 → TDGame.setGameSpeed → loop 的 dt 倍率 → 原有 update
LayoutSystem → body[data-layout] → td.css 桌面雙欄／手機直向
```

本階段不新增遊戲領域模組、不改資料庫（仍無資料庫），也不讓 CSS 反向依賴戰鬥邏輯。

## v0.22.0 戰鬥回饋

```text
Projectile／Hero 技能 → Monster.takeDamage → onHit(實際傷害、剋制)
onHit → CombatFeedbackSystem → 傷害字／命中星芒
TDGame.onKill → EconomySystem + Gold／死亡回饋
Monster.health → displayHealth（視覺插值）→ 雙層血條
```

回饋模組不持有經濟或傷害規則，移除它不會改變戰鬥結果。

## v0.23.0 戰鬥生命週期

```text
Monster movement → EnemyCombatSystem → target policy / Boss phase
                                      ├→ Hero.takeDamage → downed → timed respawn
                                      └→ 士兵不承傷（0.55.0 起）
EnemyCombatSystem hooks → TDGame → CombatFeedbackSystem / UI
```

一般怪仍只前進；攻擊職責按 `combatRole` 分為攻城、英雄獵殺與 Boss。`EnemyCombatSystem` 只處理敵方目標與攻擊時序，不負責獎勵或建造。英雄自行管理復活；0.55.0 起士兵不會死亡或由 `BuildSystem` 戰敗移除。

## v0.24.0 黃金 15 波

```text
開場難度按鈕 → TDDifficultySystem → TDGame.applyDifficulty
                                    ├→ WaveSystem：整備／生成間隔／Monster 數值
                                    ├→ EconomySystem：擊殺與清波獎勵
                                    └→ TDGame：城門上限與 UI

WaveCatalog → Monster(type) → EnemyTraitSystem
                              ├→ warder：屏障先吸收傷害
                              ├→ healer：定期治療鄰近傷兵
                              └→ commander：鄰近敵軍移速／護甲光環
```

`TDDifficultySystem` 只提供成套倍率，不知道波次內容；`EnemyTraitSystem` 只計算鄰近能力，不處理移動、獎勵或死亡。既有 `WaveSystem`、`EconomySystem` 與 `Monster` 保持資料流單向。專案仍無資料庫與遠端 API，難度是單局狀態。

## v0.27.0 職業武器資料流

```text
Hero.classType + Hero.equipment.spear → EquipmentSystem.weapon / nextWeapon
                                      ├→ ShopSystem：下一階名稱、價格與購買結果
                                      ├→ TDGame.updateUi：英雄卡、商店圖示與稀有度
                                      └→ Hero / HeroRoster：彈道色與純視覺簽名特效
```

`EquipmentSystem` 是只讀配置與繪圖層；裝備等級仍由既有 `Hero.equipment` 保存，金錢仍只由 `EconomySystem` 扣除。沒有加入背包、資料庫或遠端 API，因此可逐步替換成真正的手持武器動畫而不改商店介面。

## v0.28.0 暗影英雄逐幀掛點

```text
Hero.equipment.spear > 0
  → ArtSystem 選擇 rogue-actions-unarmed-v2
  → state + frame 查詢左右手掛點
  → class-weapons-atlas-v1 裁切左右武器
  → 同一角色鏡像座標系繪製
```

只有在無武器底圖與武器圖集都載入完成時才啟用真正換裝；任一素材未完成會繼續使用舊 `rogue-actions-v1.png`，避免短暫空手或畫面缺失。掛點只屬於 `ArtSystem`，不進入戰鬥判定。

## v0.30 玩家軍團資料流

`ProfessionSystem` 決定英雄職業，`FactionSystem` 以同一 ID 提供本族可用的單位與建築；`LootSystem` 只透過 `FactionSystem.unlock()` 增加可用項目，不修改建造器。`BuildSystem` 繼續負責排隊、合法位置、扣款、升級與回收，因此新種族不需要複製經濟或放置邏輯。

此段記錄 v0.30 當時的 7 種可移動守軍；0.57.0 起 `CombatUnit` 統一為固定守軍，仍保留 Lv.1～5、熟練度與攻擊動畫。`Building` 負責固定塔；`TowerSkillSystem` 處理塔種差異，`TowerEvolutionSystem` 於 Lv.3 套用二選一設定修正。`ArtSystem` 依單位狀態、等級、塔階與分支選擇圖格，素材未 ready 時仍回退 Canvas 圖形。

英雄 XP 保存在 `Hero` 實體，不新增全域存檔。`TDGame.onKill()` 只在第一次合法擊殺時同時分派金錢、來源單位熟練與英雄 XP，避免範圍／連鎖攻擊重複結算。

## v0.31 軍械資料流

`LootSystem` 只產生戰利品選項，選取軍械時呼叫 `ArmorySystem.obtain()`；`TDGame` 負責暫停、目標選取與軍械庫 DOM。`Hero`／`CombatUnit` 各自保存三個裝備欄，查詢戰鬥設定時才由 `ArmorySystem.apply()` 建立修正副本，因此不改寫 `config.js` 基礎數值，也不影響其他實體。

`ArtSystem.drawGearPieces()` 從 `equipment-atlas-v1.png` 裁切掛件；狼騎由半獸人及既有戰狼兩套 4×4 動作圖集共用狀態與影格合成。素材未 ready 時仍繪製原單位，裝備數值不依賴美術載入。軍械目前為單局記憶體狀態，沒有資料庫、API 或存檔遷移。

## v0.32 唯一裝備生命週期

`ArmorySystem.assignments` 以裝備 ID 指向單一角色；轉裝先移除舊角色欄位，再配置新目標。角色只保存自己的 `gear` 欄位，戰鬥查詢仍走 `apply()`。`BuildSystem` 僅提供通用 `onRemove` hook，`TDGame.attachArmoryUi()` 才把它連到 `releaseTarget()`，避免建造模組反向依賴軍械庫。

出售與死亡清除共用離場 hook；英雄倒下不觸發，因英雄仍會復活。生命型裝備的穿戴／卸下會重新查詢 config、補上新增上限或把超額生命夾回新上限，避免轉裝後留下幽靈數值。

## v0.32.1 雙入口 PWA

`index.html` 與 `td.html` 保持同一個靜態站台與 Service Worker scope，但各自連到獨立 manifest。這讓兩種模式共用離線資產與更新週期，同時保有不同安裝名稱及啟動頁；圖示輸出由 `scripts/build-app-icons.ps1` 從版本化原圖機械式產生。

v0.32.2 的 CI/CD 仍維持單一 `main → test → Pages` 管線，僅在 Configure Pages 階段允許第一次建立站台，不增加執行期服務或資料庫。
