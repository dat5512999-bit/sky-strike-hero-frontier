# 系統架構

> v0.73.0：開局策略標籤 → BattleReportSystem.run；BuildSystem 實付／折扣、Projectile 有效傷害與 BattleSynergy 支援來源 → analysis；finalize 寫入本機歷史 → historyComparison 依同配置篩選。

> v0.72.0：`BuildSystem／Projectile → TDGame → BattleReportSystem → 本機戰報 UI／localStorage`。遙測只讀取成功交易與實際有效傷害，不回寫戰鬥系統。

> v0.71.4：`TDDifficultySystem.reward` 傳入 `EconomySystem`，同時縮放擊殺賞金與清關金；`WaveSystem.bountyScale` 只抵銷不同敵量造成的賞金膨脹。回收與商店兌換保持獨立。

> v0.71.3：難度選擇 → `TDDifficultySystem` 輸出 Wave 倍率與內容許可 → `WaveSystem` 生成編成；`TDGame` 顯示／攔截建造，`FactionSystem` 攔截跨族傭兵。

## 0.71.1 難度積分資料流

`BattleReportSystem.multiplier → wave.score → finalize → bestByMapDifficulty[map][difficulty]`，同時更新 `bestByMap[map]` 全難度最高分。V2 遷移只根據 `runs[].difficulty` 回填分難度紀錄，缺少難度的舊場次只保留在全難度資料。

## 0.71.0 暮秋遺跡與整合發布

新增第三張「暮秋遺跡 · 雙 U 型彎」，採縮窄第一個內圈的確認版本。遠征頁可直接選擇，沿用英雄／軍團／波次及地圖獨立戰績；路線、建造區、小地圖與离線資產同步，無新帳號、API 或設定。完整安裝、更新、架構圖、備份回復與測試見 [發布手冊](AUTUMN_RUINS_V0710.md)。

> v0.70.0：`CombatUnit` 與 `Building` 各自以基礎造價及等級倍率產生升級原價，`BuildSystem` 再統一套用範圍折扣、原子扣款及實際投入紀錄；出售依實際投入計算 70% 回收。

## 0.69.9 定位規則

重甲與斬殺倍率沿用 Projectile 命中管線；女妖詛咒與統領攻速由 BattleSynergySystem 管理；支援建築依 Building 等級產生倍率。資料流與邊界見 [定位調整](ROSTER_BALANCE_V1.md)。

## 0.69.8 地圖獨立積分

分數仍由 BattleReportSystem 計算，TDGame.beginRun 傳入 map／mapName。結算流程：run.map → bestByMap[map] 比較／更新 → 各地圖保留最近 20 場 → localStorage V2；顯示端讀取當前地圖 bestScore。無新 HTTP API 或資料庫，未知舊地圖資料獨立保存。

## 0.69.6 士兵裝備顯示修正

呈現流程：CombatUnit.draw → ArtSystem.drawCombatUnit → 原角色動畫 → 還原縮放／翻轉 → drawSoldierEquipmentBadge。裝備數值仍由 ArmorySystem 管理；小標記與角色動畫分離，無資料庫或 API 變更。

> 0.69.2：`CombatUnit/Summon state → ArtSystem.ACTION_PATHS → 4×4 action atlas → SpriteFrameBounds` 為新增的戰鬥動作資料流。詳見 [UNIT_ACTIONS_V0692.md](UNIT_ACTIONS_V0692.md)。

## 0.68.5 馭獸師與熊戰鬥動作（2026-09-17）

恢復馭獸師原本的鹿角、肩鳥與綠袍設計，新增待機及施法畫格；三階熊新增踏步與撲咬畫格，近戰命中顯示爪痕。使用既有 state、frameClock、attackTimer 切換，無資料庫、API 或權限變更。完整安裝、更新、回復與測試方式見 [動作更新紀錄](NATURE_MOTION_V0685.md)。


## 0.68.4 森靈馭獸師造型（2026-09-17）

馭獸師資料流：combatUnits.beastmaster → drawCombatUnitSprite → drawBeastmaster → 靜態矩形裁切 → 現有士兵縮放；preview 共用繪製入口。無執行時像素讀取。


## 0.68.0 雙隘口要塞（2026-09-17）

WaveSystem 交替指派地圖路線，Monster 保存各自路線，TDGame 處理分支獨立排隊與共用末段間距；BuildSystem 與 MiniMapView 共用 routes。完整架構圖見下方規格。

詳見 [第二張地圖規格、操作與回復](TWIN_PASS_V0680.md)。

## 0.67.0 終極士兵（2026-09-17）

沿用 FactionSystem → CombatUnit → BattleSynergy → Projectile；ArtSystem 以實測四格來源框繪製終極士兵，其他兵種沿用既有圖集。架構圖見終極士兵專章。

詳見[終極士兵操作、架構與驗收](ULTIMATE_SOLDIERS_V1.md)。

## 0.66.5 直接開檔修復（2026-09-17）

修正版資料流：素材 → 暫存 Canvas 繪製 → PREVIEW_BOUNDS 靜態邊界 → 等比例卡片預覽。執行時無 getImageData，file:// 與 HTTP 共用相同流程。


## 0.66.4 建造預覽對齊（2026-09-17）

預覽資料流：TDGame.updateUi → ArtSystem.preview → 384px 暫存繪圖 → 可見像素邊界 → 128px 預覽 Canvas → 四列卡片。每種類只掃描一次；不在戰場繪製迴圈掃描像素。無資料庫變更。


## 0.66.2 選取用途說明（2026-09-17）

用途資料流：config／單位 config() → TDGame.selectionPurpose → updateSelectionPurpose → td-selection-purpose。沿用現有選取與部署狀態，不新增資料庫或儲存格式。


## 0.66.1 新手谷地美術（2026-09-17）

仍由 maps → ArtSystem → FrontierTerrain → Camera → Canvas 繪製；MiniMapView 共用相同素材。沒有新增資料庫或模組。

詳見 [地圖更新、架構與回復手冊](MAP_ART_V0661.md)。

## 0.65.0 手機介面修正（2026-09-17）

介面與戰鬥仍共用同一份 TDGame，沒有新資料庫或 API。手機容器只處理 viewport 與方向；觸控座標由瀏覽器轉換，不另外改寫搖桿、鏡頭、迷你地圖座標。

```mermaid
flowchart LR
  Entry[td.html] --> Detect[mobile-entry.js]
  Detect -->|小型觸控頂層| Shell[td-mobile.html]
  Shell -->|同源 iframe / 保留實例| Game[td.html 遊戲]
  Detect -->|桌面或已內嵌| Game
  Game --> Layout[LayoutSystem / CSS]
  Game --> Input[TDGame 觸控]
  Input --> Preview[BuildSystem 預覽 / 確認]
```

## 0.64.0 增量架構（不重寫戰鬥）

資料夾沿用 `src/td/entities`、`src/td/systems`、`assets/td`、`tests`、`scripts`；只新增 HeroJoystick、BattleSynergySystem 兩個系統模組及測試／QA 腳本，無資料庫或 HTTP API。

```text
Touch 搖桿 → HeroJoystick → Navigation 檢查 → Hero.setTarget → Hero.update
PC／英雄拖曳 ──────────────────────────────→ Hero.setTarget
固定士兵／塔 → 原 Attack → Projectile → TDGame.onHit / onKill
召喚系統 ───────────────→ Projectile          ├─ 既有資源／戰績
                                            ├─ BattleSynergy：印記／魂／DOT
                                            └─ CombatFeedback：有限 Canvas VFX
```

沒有第二套英雄移動、傷害、經濟或存檔系統。新能力採資料旗標與 Hook；UI 和預覽仍共用既有選擇／建造按鈕。完整 [規格](FACTION_BUILDS_V1.md) 與 [測試證據](RELEASE_V064_QA.md)。

以下保留歷次架構變更。

## 0.62.0 清場速度與持久化資料流

```text
WaveSystem.onStart
  └─ 敵量 + 出兵間隔 + 波次 → targetTime → BattleReport.current.parTime
Gameplay update(dt)
  └─ 僅戰鬥進行且未暫停時計入 current.time
Wave clear
  └─ timeBonus + 擊殺／通關／無傷 − 損失 → 難度倍率 → Wave score
Run end
  └─ finalize(success | failure)
       ├─ 結算 Overlay：結果／總分／評級／最佳紀錄
       └─ localStorage：最高分 + 最近 20 場
```

持久化只發生在整場結束，不把中途離開誤列為完成戰績。積分紀錄與經濟、戰利品及建造模組保持單向讀取與低耦合。

## 0.61.0 Input 與 Score 資料流

```text
Touch Pointer
├─ 起手命中 Hero ─→ TDGame：拖曳英雄
├─ Build pending ──→ TDGame：位置預覽 → 明確確認
└─ 空地／雙指 ─────→ BattlefieldCamera：Pan／Pinch Zoom

Monster Kill／Leak／Hero Down／Wave Finish
                    ↓
            BattleReportSystem
             ├─ 原逐波戰報
             └─ Score + Grade
                    ↓
        右側積分小圖塊／戰報表格／結算文字

Shop UI → ShopSystem → EconomySystem（金幣 ⇄ 功勳）
```

評分層只讀取戰鬥事件，不寫回 Economy 或 Unit 能力。手機與 PC 共用同一套 World／Build／Report 資料，只在輸入手勢和顯示密度上分流。

## 0.60.1 HERO FRONTIER 內部返回

```text
戰鬥選單／結算／選角重設
          ↓
TDGame.returnToOpening()
          ↓
關閉 Menu → 原 TDGame.reset() → td.html 遠征選擇

index.html（另一款遊戲）── 不參與
```

此修正重用既有狀態重設與 Opening DOM，沒有加入 Router、主選單 Manager 或跨遊戲狀態共享。

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

`index.html` 與塔防入口保持同一個靜態站台與 Service Worker scope，但各自連到獨立 manifest。塔防 manifest 從 `td-mobile.html` 啟動，再由同源 iframe 載入 `td.html`；Android 與 iOS 因此共用橫向容器、離線資產與更新週期。圖示輸出由 `scripts/build-app-icons.ps1` 從版本化原圖機械式產生。

v0.32.2 的 CI/CD 仍維持單一 `main → test → Pages` 管線，僅在 Configure Pages 階段允許第一次建立站台，不增加執行期服務或資料庫。


## v0.66.0 戰旗光環

沿用 entities、systems、tests 資料夾；無資料庫或新增 API。

```text
戰旗 config / 位置 / 存活 → BattleSynergySystem.flagRate
  ├─ CombatUnit.config / Hero.combatConfig → Projectile
  ├─ drawFlag → 腳下雙環與旗標
  └─ TDGame.updateUi → 狀態、普攻分解與範圍人數
```
判定即時計算，不保存容易過期的戰旗狀態；範圍包含邊界。


## 0.66.2 角色比例（2026-09-17）

角色素材 → scripts/measure-unit-sprites.cjs（離線 alpha 量測）→ ArtSystem.SPRITE_METRICS + 體型設定 → 各 draw 方法 → Canvas。每組動畫採固定倍率，避免逐幀尺寸跳動；英雄與武器共用變換。遊戲迴圈不掃描圖片像素。


## v0.66.3 侵蝕特效

沿用 src/td/systems/CombatFeedbackSystem.js，未新增資料庫、素材或 HTTP API。

```text
BattleSynergy 真實易傷／瘟疫 → Monster 狀態
  ├─ 原 takeDamage／DOT → 傷害計算（不變）
  ├─ updateCorrosion → Map 視覺生命週期
  │    └─ ground → 怪物繪製 → air → 血條
  └─ drawCorrosionBadge → 易傷／瘟疫圖示
```
每輪線性同步敵人狀態；移除、死亡與 reset 釋放 Map 參照。

## 0.66.4 波次提示

波次預告改為怪物縮圖、數量與威脅標籤，新增入口倒數與短暫開戰提醒。操作、設定、架構、API、部署、還原與驗證方式見 [波次提示文件](WAVE_HUD_V0664.md)。


## 0.67.1 手機波次版面修正

修正波次與倒數重疊、速度列出界，縮小手機提示面板；無操作、設定或資料格式變更。原因、架構、更新、還原及觸控版面驗證見 [版面修正文件](WAVE_LAYOUT_V0671.md)。


## 0.68.1 波次避讓與預覽修正

波次改為靠左小列，預告按需展開，戰鬥提示可點穿；修正三種終極士兵卡片裁切。操作、API、架構、部署、還原與測試見 [版本文件](EDGE_WAVE_PREVIEW_V0681.md)。



## v0.68.2 藤蔓纏繞

沿用 systems、entities、tests，無資料庫或新檔案載入順序。

```text
BattleSynergy.rootPulse → Monster.rootTime → 原定身移動判定
                              └→ Feedback.updateRoots → roots Map
                                   ├→ ground：破土與碎屑
                                   └→ air：纏腿粗藤、葉片與縮回
nature burst → explosion(style=nature) → 放射藤枝
```
特效不寫入傷害、怪物位置或定身秒數。

## 0.68.3 士兵尺寸微調（2026-09-17）

我方部署士兵統一放大 12%，保留相對體型與腳底錨點；英雄、怪物、召喚物和卡片大小維持原設定。無新增操作、設定、API、權限或資料格式。ArtSystem.drawCombatUnit → 腳底縮放 → drawCombatUnitSprite；預覽直接使用未放大的 sprite 方法，避免再次裁切。

安裝與部署流程不變，完整更新後關閉舊分頁再開啟。package.json 與 Service Worker 快取更新至 0.68.3。修改前 ArtSystem.js、package.json、sw.js 保存在 artifacts/soldier-v0683-backup/；若需還原，將 ArtSystem.js 放回 src/td/systems/，其餘放回根目錄，已有後續修改時先比較合併，部署使用新的快取名稱。

驗證：342 項測試通過；全角色圖在 artifacts/qa-unit-scale/roster.png；三種終極士兵的六張卡片預覽仍完整。此版本只改畫面尺寸，射程、攻擊、碰撞與移動數值不變。


## v0.69.0 英雄技能與動畫完整顯示

新增 systems/HeroSkillVFX.js 與 SpriteFrameBounds.js，無資料庫。

```text
成功施法 → HeroSkillVFX.emit → updateFields 倒數 → TDGame.draw
原始 PNG → 離線 measure-animation-frames → SpriteFrameBounds
ArtSystem.drawFrame → 跨格取圖／鄰幀排除 → 原座標顯示
```
SpriteFrameBounds 在 ArtSystem 前載入；HeroSkillVFX 在 HeroRoster 前載入，皆加入離線快取。
## 0.69.1 掉落架構

死亡事件、地面物品、軍械庫與商城的資料流見 [版本文件](FIELD_LOOT_SHOP_V0691.md)。

## 0.69.7 雙隘口路線校準

依正式圖片的鋪石路面重新取樣上下道路中心，修正彎道偏向路緣；共用末段長度同步計算。沿用 maps → Monster／BuildSystem／MiniMapView 架構，不改圖片、素材腳底或 API。重新開始遠征即可使用新座標，無設定與存檔遷移；部署完整版本與新的 Service Worker 快取。回復前資料在 artifacts/route-v0697-backup，請逐檔比較，避免覆蓋其他工作。

6 項雙路測試與語法檢查通過；新增獨立路面取樣回歸、完整路線怪物截圖，見 artifacts/qa-twinpass/full-route-battle.png。全套當次為 375/377 通過，兩項旗幟／統領光環測試失敗，涉及另行修改中的軍團平衡，未在此地圖修正中改動。
