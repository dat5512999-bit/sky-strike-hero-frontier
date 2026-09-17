# 設定手冊

## 0.64.0 能力與搖桿設定

不需環境變數。改名來源為 HeroRoster／ProfessionSystem／FactionSystem；請保留 hunter/arcanist/rogue ID。單位價格與能力旗標在 config.js，分支在 TowerEvolutionSystem；完整常數見 [Build V1](FACTION_BUILDS_V1.md)。

手機搖桿依既有 Layout 的 mobile + landscape 顯示；設定 → 介面模式仍可手動選擇。尺寸由 td-combat.css 控制，中心死區由 HeroJoystick 的 0.16 控制，移速只讀 Hero.combatConfig().speed。不得為觸控另設移速／數值。

VFX 上限集中在 CombatFeedback、BattleSynergy、TDGame 與 Summon 渲染入口；沒有新增 Graphics Quality 選單。

## 0.62.0 速度計分參數

`BattleReportSystem.TIME_POINTS_PER_SECOND=5` 控制提早一秒的獎勵；`targetTime(wave, enemyCount, spawnInterval)` 以 `18 + 敵量 × 出兵間隔 × 1.15 + 波次 × 0.8` 估算，最低 20 秒。未提供敵量時使用 `28 + 波次 × 1.5` 的相容估算。速度分先和擊殺／通關／無傷分合併、扣除損失，再乘難度倍率。`MAX_RECORDS=20` 控制本機歷史長度；修改時必須同步測試、FAQ 與戰報文案。

## 0.61.0 觸控與評分設定

正式新手地圖的 `mobileInitialZoom` 為 `1.5`，只影響手機初始 Camera，不改 World Coordinate 或建造判定。金幣／功勳固定匯率位於 `EconomySystem.MERIT_GOLD_RATE`。擊殺分值位於 `BattleReportSystem.KILL_SCORES`，難度倍率位於 `DIFFICULTY_MULTIPLIERS`；每波通關／無傷獎勵及漏怪／城門／英雄倒下扣分集中在 `finish()`。這些目前不是玩家設定，修改後需同步測試與文件。

## 0.60.1 返回行為

沒有新增設定開關。HERO FRONTIER 的內部返回固定回到 `td.html` 遠征選擇；不允許用 Layout、裝置或玩家設定切回另一款遊戲。若未來新增真正的產品入口頁，應另設明確 URL 與離開確認。

## 0.60.0 HUD 密度設定

沒有新增玩家設定或環境變數。HUD 密度由 `td-combat.css` 依 CSS Viewport 自動判斷：寬度至少 2200px 且高度至少 1100px 才使用放大元件；一般 1920×1080 桌面維持緊湊介面；1199px 以下或低高度使用更緊湊的元件。這些數值只屬 Presentation，不得寫回 Camera、World 或戰鬥設定。

## 0.59.0 選角圖片設定

圖片不使用環境變數或外部 URL。英雄、軍團與難度分別由 `HeroRoster.js`、`FactionSystem.js`、`TDDifficultySystem.js` 的 `selectionArt` 指定；`selectionFocus` 調整單張圖片裁切焦點，難度共用圖集則由 `selectionPosition` 選取象限。所有路徑需相對專案根目錄並加入 `sw.js`。

## 0.57.0 地圖與部署設定

正式地圖定義位於 `src/td/maps.js` 的 `beginner`。`width/height` 必須保持 1536×1024 並與 `assets/td/beginner-valley-v1.png` 一致；`path`、`spawn`、`gate`、`heroSpawn`、`roadClearance`、`buildAreas`、`safeArea` 與 `camera` 都是資料設定。PC／Mobile 不得建立不同副本。士兵永久固定是核心規則，不提供玩家開關；`CommandSystem` 只保留相容接縫，不能改變士兵座標。

## 0.55.0 士兵規則設定（2026-09-15，本機）

固定部署、射程內自動索敵、不承傷與一人一裝備是遊戲規則，無玩家設定開關。士兵攻擊、射程、攻速與價格沿用 `src/td/config.js`；軍械適用兵種與效果位於 `ArmorySystem.ITEMS`。`health`／`armor`／`speed` 舊欄位暫留資料相容，但士兵不會承傷或移動。沒有新增環境變數。

## 0.54.3 商城與技能分區（2026-09-14，本機）

無新設定；PC／手機版沿用原介面模式切換。R 仍開商店，F 仍施放大絕；技能、商品與數值配置不變。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

不需新設定；升級後角色使用原素材與裝備，等級顯示由程式自動處理。畫質、速度及操作模式設定不變。

## 0.54.1 英雄小卡（2026-09-14，本機）

無新增設定項。既有自動／電腦／手機模式與 F1 操作保持不變；「詳細資訊」是本局頁面上的臨時展開狀態，不需設定或存檔。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

沒有新增玩家設定。既有「自動／電腦／手機」模式照常使用；小地圖與快捷圖塊在 PC／手機橫向的邊緣戰鬥介面顯示，手機直向維持既有面板。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

不新增設定項。既有「自動／電腦／手機」介面切換繼續有效；戰鬥 PC／橫向共用緊湊列，手機直向維持原資源顯示。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

可調整 maps.js 的 frontier.openingFocus 和 zones 呈現資料；它們不修改世界、道路或合法建造區。道路仍 55 單位禁建，邊界與間距沿用，沒有新增障礙設定。ArtSystem.frontierGround 使用 v2 地表。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

UI樣式集中在td-combat.css最新V0.51區段。hero-skill-icons-v1.png為4×4：列0巡林者、列1守護者、列2刀鋒，欄0/1/2/3對應Q/W/E/F；列3欄0商店。未改職業／技能config。完整素材提示詞見ART_PRESENTATION_V051.md。

## 0.50.0 大地圖原型（2026-09-14，本機）

maps.js 定義 classic 720×720 與 frontier 1280×900；新圖 roadUnits=true、roadClearance=55，沿用42水平／62頂部／46底部部署邊距。兩圖路線長度約2017.831，怪物速度未改。新增地圖須同時提供 path、出生點、地景及通行測試，不能只拉伸背景。


## 最新：0.49.0 鏡頭原型

0.49.0 鏡頭不新增持久設定：放大上限2.2倍、backing DPR上限1.5；基本細節模式填滿視窗，全圖模式完整容納地圖。重新開始清除查看／跟隨／縮放狀態。直式手機自動停用鏡頭呈現。

## 0.48.0 介面設定

戰鬥中從右上齒輪 → 設定 → 介面模式，仍沿用 `towerFrontierLayout` 記憶。電腦與手機橫向採邊緣 HUD；手機直向採原版。沒有新增戰鬥數值或鏡頭設定。

## v0.47.0 橫式與介面選擇

設定選單的「自動」在寬度 ≤700 或「粗指標、橫向、高度 ≤700」時使用手機介面；玩家仍可手動選電腦／手機，選擇儲存在 `towerFrontierLayout`。手機橫式使用戰場側欄與同一建造 Drawer；直式保留舊指令面板並提示轉橫向。價格、攻速、射程、波次與其他平衡參數沒有改動。

## v0.46.0 塔定位參數

`src/td/config.js` 的 `buildings[*].role` 是建造卡短標籤。戰鼓堡 `allyHaste=.08`、`allyHasteRadius=165`，塔級提高少量增益，皇家指揮所分支為 `.15` 並擴大範圍；多塔取最大值而非相加。獅翼弩砲 `priorityTargets` 依序為祭司、旗手、術士、怨靈、Boss，目標不在射程內仍不會攻擊。召喚殿與墓園各自使用 `summonInterval/CapBase/Duration/Damage/Range/Speed/LeashBonus`；數值改動需同時觀察出怪速度、召喚存續與傷害。沒有新增環境變數、資料庫或部署設定。

## v0.45.0 英雄與軍團組合

可選英雄 ID 由 `HeroRoster.CLASSES` 定義，可選軍團 ID 由 `FactionSystem.FACTIONS` 定義；目前各 3 個，未使用資料庫或環境變數。建造權限依軍團 `units/buildings` 清單與戰利品解鎖，不再依英雄 ID。`LootSystem.createOffers(wave,heroId,factionId)` 的第三波入門軍械依英雄；已屬本族的龍卵或幽骨純解鎖不入抽選池，跨軍團仍可取得。塔進階的 `burstRadius` 是第 4 擊範圍倍率，常規投射物仍按既有 `splash`；`chainChance/chainStyle` 控制英雄武器觸發。調整後應重跑 `npm test`，不要在 UI 複製同套規則。

## v0.44.2 怪群視覺參數

`Monster.visualPosition()` 固定三列 `0／-1／+1`，一般怪側向 20 Canvas 單位、大型怪 23，前後錯位最多 5，轉角前後 42 單位平滑轉向。這些是繪製參數，不是怪物速度、碰撞、道路或波次設定；調整時必須保留 `x/y/index` 並重跑視覺及戰鬥回歸測試。無環境變數或資料庫設定。

## v0.42.0 塔與老兵平衡

`Building.upgradeCost()` 依 `config.buildings[type].cost × [2.8,4.2,6.2,8.4]` 計價並四捨五入至 10G；只有最後一階需 1 功勳。林地弩塔原價 100G、升級 280／420／620／840G。`CombatUnit.upgradeCost()` 則依 `config.units[type].cost × [1,1.3,1.7,2.2]` 計價並取整至 5G；升至 Lv.4／Lv.5 另需 1／2 功勳。塔熟練門檻在 `TowerSkillSystem.THRESHOLDS=[0,8,22,45,80]`。冰／荊棘／毒塔的 `slow`（移速倍率）與 `slowTime` 位於 `config.buildings`；強緩速判定為命中前 `slowFactor<=.8`，增傷率由輸出塔的 `bonusVsSlowed` 控制。老兵 `healthGrowth=.03`、`spawnRate=.78`，第 1→30 波血量 165%→309%；其他難度不變。可用上述資料逐項微調，不需修改資料庫或 API。

## v0.41.0 可調參數

大絕的 `cooldown`、`range`、`radius`、基礎傷害與緩速位於 `HeroUltimateSystem.js`。圖片載入同時上限 4 張、單張 20 秒逾時、最多 3 次嘗試位於 `ArtSystem.js`；`sw.js` 的 `PRECACHE` 排除 `assets/td` 大圖。沒有新增環境變數或伺服器設定。

## v0.40.1 圖集設定

`ArtSystem.heroHunterUnarmed` 指向 v4 透明 4×4 圖集；`sw.js` 快取名稱為 `sky-strike-v0.40.1`。不需調整武器數值、資料庫或環境變數。

## v0.40.0 守軍／敵軍調整

新兵的費用、木材、HP、攻擊、射程、速度、特殊欄位皆在 `src/td/config.js` 的 `units`；成長名稱與長戟衛節奏在 `CombatUnit.js`。敵人速度、護甲、獎勵與 siege／hunter 職責位於 `Monster.js`，每波數量和預告在 `WaveCatalog.js`。調整後請檢查 30 波仍每五波有 Boss、跨族商店不出售本族、新兵能升級與出售。

## v0.39.0 武器、傭兵與手機設定

玩法型武器位於 `EquipmentSystem.WEAPONS`：`chainChance/chain/chainRange` 組成雷擊，`splash/style` 組成魔焰斬。平衡時只改這些欄位，不要在 `Hero` 複製傷害公式。傭兵候選由 HTML 提供、`FactionSystem.canHire()` 依目前可建造名單篩選。手機／電腦模式仍由 `towerFrontierLayout` 保存，精簡／展開另由 `towerFrontierMobilePanel` 保存。

## v0.38.0（2026-09-12）

本版倍率以同關標準為基準，金幣包括擊殺及過關；起始資源、木材與功勳不變。

| 難度 | 城門耐久 | 血量第1→30關 | 攻擊／漏怪傷害倍率 | 移速 | 金幣 | 出兵間隔 |
|---|---:|---:|---:|---:|---:|---:|
| 見習 | 25 | 82% | 72% | 96% | 114% | 108% |
| 標準 | 20 | 100% | 100% | 100% | 100% | 100% |
| 老兵 | 18 | 165%→309% | 140% | 108% | 85% | 78% |
| 災厄 | 15 | 240%→518% | 190% | 114% | 70% | 68% |

血量／護盾倍率 = enemyHealth × (1 + healthGrowth × (wave - 1))；老兵 healthGrowth=.03，災厄=.04。間隔越小出兵越密；漏怪傷害至少 1 並四捨五入。此表取代舊版難度係數。

## v0.36.0 守軍設定

三族開局各有 3 名守軍與 4 座建築。`knight` 是混沌近戰暈緩、`treant` 是魔法範圍緩速、`golem` 是高耐久混沌範圍重擊；成本、木材、生命、護甲、傷害、射程、攻速與移速位於 `src/td/config.js`。本族清單位於 `FactionSystem.js`。調整時須保留「騎士前排、樹靈控制、魔像重擊」的區隔，避免三者收斂成同一個最佳數值模板。

## v0.35.0 建築設定

三族開局各有 2 名守軍與 4 座建築。`ballista` 為雙發遠程穿刺、`moonwell` 為連鎖魔法緩速、`plague` 為範圍混沌腐化；成本仍同時受金幣與木材限制。數值位於 `src/td/config.js`，本族可用清單位於 `FactionSystem.js`。不要只在 HTML 增加按鈕，否則建造器會拒絕未知類型。

## v0.34.0 三十波設定

塔防總波數以 `WaveCatalog.WAVES.length` 為執行權威，`config.totalWaves` 同步為 30。第 1～15 波生命每波 +10.5%，第 16～30 波每波改為 +7%；擊殺收益仍沿用原本每波 +2.5%，木材與功勳繼續限制建築數量與高階升級。後半 Boss 基準出兵間隔由 0.72 秒逐步縮至第 30 波 0.57 秒，但不低於 0.52 秒。

## v0.33.0 塔防守軍恢復

此為 v0.33.0 歷史參數，0.55.0 已移除 `unitRecovery`。所有難度的士兵都不承傷，難度仍由敵軍倍率、資源與城門耐久區分。

> v0.30.0：基礎單位／建築數值位於 `src/td/config.js`；三族開局清單位於 `FactionSystem.FACTIONS`；Boss 戰利品位於 `LootSystem.ITEMS`；塔分支位於 `TowerEvolutionSystem.BRANCHES`。新增項目時需同步資料、UI、離線快取與測試。

## 一般玩家

不需帳號、網路、音效裝置、資料庫或瀏覽器權限。外觀與難度選擇會嘗試寫入瀏覽器本機儲存空間；禁止儲存也不影響遊玩。建議以 1280×720 或更高解析度、100% 瀏覽器縮放遊玩。

## 開發者平衡設定

所有可調數值集中在 `src/config.js`：

- `player`：尺寸、速度、HP、受傷無敵秒數。
- `bullet`：尺寸、速度、傷害。
- `enemy`：尺寸、速度、HP、分數。
- `weapon.fireInterval`：自動射擊間隔，越小射速越快。
- `spawner`：初始／最低生成間隔與難度提升時間。
- `skills`：限時技能基礎秒數；各難度的果實週期與掉落率由 `DifficultySystem.js` 管理。

修改後依序執行 `npm run check`、`npm test`，再按 `docs/TEST_CHECKLIST.md` 手動驗證；同時更新版本號與 `CHANGELOG.md`。

外觀包不在 `config.js` 調整，請依 `docs/SKIN_PACK_GUIDE.md` 註冊，以免把視覺設定耦合到戰鬥平衡。

行動裝置設計基準為 Canvas 480×720，由 CSS 等比例縮放。請勿直接更改 Canvas 內部尺寸；若變更，須同步測試 `InputController` 的座標換算、各皮膚繪圖與所有碰撞箱。

四種模式定義於 `DifficultySystem.js`。`threatStep`、`spawnMultiplier`、`enemySpeed` 控制敵軍；`firstFruit`、`fruitInterval`、`dropChance` 與 `weights` 控制果實經濟；`unlimited` 控制限時技能；`challengeInterval` 與 `challengeScale` 控制事件。果實權重總和必須維持 1。

果實等級上限與各級效果位於 `SkillSystem.js`、彈道與連射間隔位於 `Weapon.js`。Combo 目前每 5 次擊破增加倍率、最高 ×5，定義於 `GameState.js`。調整分數公式時需重新檢查高威脅敵人的分數膨脹。

事件規則位於 `ChallengeSystem.js`。龍果只能由事件完成產生，不加入一般果實權重；這條規則可維持特殊獎勵的辨識度。

## 視覺設定

分層背景的星星數、光塵數、速度與透明度位於 `BattlefieldRenderer.js`；爆炸粒子數、生命週期與震動衰減位於 `Effects.js`。這些數值只影響視覺，但調高粒子數前必須在中階手機測試無雙模式。

玩家傾斜量位於 `Player.js`，敵機類型標記位於 `Enemy.js`，果實光環位於 `PowerUp.js`。主題色仍由 `SkinPacks.js` 提供，請勿將特定皮膚色寫入共用背景系統。

## 關卡與支援設定

`StageDirector.js` 的 `totalWaves` 為 100，`isBossWave` 控制每 5 波 Boss，`chapter` 每 10 波換章，`waveDuration` 控制一般波出兵時間。修改規則時須測試第 1、3、5、10、100 波與遠征完成狀態。

防線上限由 `DifficultySystem.js` 的 `defenseIntegrity` 控制。四種符文位於 `StageDirector.js` 的 `AFFIXES`，可調整 `speed`、`health`、`fireRate`、`twinChance` 與分數補償；新增詞綴時必須同時確認 HUD 短名、色彩、可反制性與自動測試。避免同時大幅提高速度、HP 與數量。

Boss 基礎 HP、波次成長、射擊冷卻、瞄準散角與各階段彈數位於 `Boss.js`。`SupportSystem.js` 控制分身數量、分身／戰寵傷害和射速。支援子彈仍使用玩家子彈碰撞流程，調高數量前須測試無雙模式效能。

## 英雄塔防參數

`src/td/config.js` 集中管理 720×720 戰場、道路節點、起始 240G／5 木材、20 點城門生命、三職業價格／傷害／射程、護甲相剋與英雄能力；`wave.firstPreparation` 與 `wave.preparation` 分別是 18 秒首波準備及 12 秒後續整備。怪物原始數值位於 `Monster.js` 的 `TYPES`，生命採前 15 波 10.5%、後 15 波 7% 的分段線性成長。30 波名稱、編成、提示、威脅與清場獎勵位於 `WaveCatalog.js`，不要在 `TDGame` 或 `WaveSystem` 硬編波表。

調整經濟時透過 `EconomySystem`，並至少驗證：開局可部署兩名基礎單位、開波不提前發資源、清場只結算一次、波次木材補給正確、Lv.4～5 會消耗功勳、出售返還總投入 70%、Boss 漏怪扣 5 點。調整波表後須確認第 5／10／15 波含 Boss 且估算總耐久高於前一波。修改道路節點時必須維持首尾在畫面外，並重測 `BuildSystem.canPlaceAt()` 的 55px 禁建距離。

v0.13 主要角色素材為 `ranger-actions-v1.png`、`arcanist-actions-v1.png`、`rogue-actions-v1.png`。每張固定 4×4：待機、行走、攻擊、受擊／死亡各一列。建築使用 `towers-atlas-v1.png` 的弩塔／寒霜塔／火砲塔三欄。替換時須保留透明 Alpha、正方形 cell、角色註冊點與一致鏡頭，並同步更新 `sw.js`。

`config.units` 管理可移動單位的速度、傷害、射程與成本；`config.buildings` 管理固定建築。新增類型時不可混用兩份設定，否則道路禁建與移動指令會套用錯誤。

`NavigationSystem` 預設使用 30px 導航格、46px 建築避障半徑與八方向 A*。若修改角色／建築圖像尺寸，須同步檢查 `cellSize`、`obstacleRadius`、斜向防切角、不可達目的地提示與手機點按精度；數值不應小於建築可見底座半徑。

塔防介面模式由 `LayoutSystem.js` 管理，偏好鍵為 `towerFrontierLayout`，可用值是 `auto`、`desktop`、`mobile`。自動模式的 700px 判斷應與 `td.css` 響應式斷點同步修改；不要只改其中一處。手動電腦模式在小螢幕允許水平捲動，避免壓縮 Canvas 座標與操作命中區。

## v0.17.0 英雄與指揮介面

英雄動作素材固定 4 欄 × 4 列，idle／walk／attack／cast，保留 Alpha 與比例。Hero 的刺擊長 0.36 秒、前 0.18 秒蓄力，施法動作長 0.56 秒；既有傷害和技能冷卻不變。ArtSystem.drawRank 管理肩甲、旗幟、符文與徽記。CSS 手機斷點仍配合 LayoutSystem 的 700px。

## v0.18.0 英雄技能與種族塔

config.buildings 新增 storm／totem／crypt。技能倍率與擊殺門檻位於 TowerSkillSystem；商店物品與價格位於 ShopSystem；英雄技能冷卻在 Hero；召喚物壽命與追擊範圍由呼叫端提供。改值後執行 npm test 與 npm run check。

## v0.19.0 英雄流派與傭兵館

英雄流派普攻、名稱、顏色、技能說明位於HeroRoster.CLASSES；獵手與盜賊技能行為位於HeroRoster.cast。商店傭兵金幣為config.units.cost×1.5向上取整，木材0，定義於BuildSystem.pendingCost；UI價格須一致。召喚物form決定戰狼／元素／分身繪圖。

## v0.20.0 敵軍動作第一階段

Monster.update中的stride控制完整步態需要的路程：步兵64、疾行獸74、重裝80。受擊0.24秒，死亡視覺1秒。ArtSystem.drawMonster四乘四圖集前兩列走路、第三列受擊、第四列倒地。保持來源格長寬比。

## v0.23.0 戰鬥生命週期

英雄復活時間、生命比例及守護時間位於 `config.hero.respawnTime`、`respawnHealth`、`invulnerability`。`config.units` 的士兵 `health`／`armor` 是舊版相容欄位，不控制現行承傷。敵人 `combatRole`、`attackRange`、`attackDamage`、`attackInterval` 位於 `Monster.TYPES`；Boss 階段門檻、踐踏倍率與冷卻集中於 `EnemyCombatSystem`。

## v0.24.0 黃金 15 波

四種難度的 `enemyHealth`、`enemySpeed`、`enemyDamage`、`reward`、`baseHealth`、`preparation` 與 `spawnRate` 集中在 `TDDifficultySystem.js`。不得只改 UI 文案；各倍率必須維持正數，且更高難度的城門生命與整備時間不應高於較低難度。

盾衛、祭司、旗手的基礎數值位於 `Monster.TYPES`；光環範圍／倍率與治療週期／比例位於 `EnemyTraitSystem.js`。15 波實際組合只改 `WaveCatalog.js`。平衡時先調波表和倍率，避免把例外硬編進 `TDGame`。

## v0.31.0 軍械設定

九件裝備的 `slot`、`types`／`heroes`、`mods`、稱號與圖集 `column`／`row` 位於 `ArmorySystem.ITEMS`。乘算欄位為 damage、range、interval、speed、health；加算欄位為 armor、shots、splash、chain、bountyBonus。第 3 波保證裝備及每 3 波軍械規則位於 `LootSystem.createOffers()`。

## v0.32.0 分配規則

每個裝備 ID 僅能有一名持有人；轉裝及卸裝免費，鼓勵整備期調度而不增加額外貨幣。若要加入轉裝成本或戰鬥中鎖定，應在 `TDGame` 操作層實作，不要破壞 `ArmorySystem` 的資料一致性。

## v0.32.1 安裝設定

應用名稱、啟動頁、色彩與 Android 圖示在兩份 manifest 設定；iOS 名稱與 Touch Icon 在各 HTML `<head>` 設定。重新產生尺寸時執行 `scripts/build-app-icons.ps1 -SourcePath assets/icons/app-icon-source-v1.png`，不可只放大低解析度圖示。

Pages 首次啟用由 `.github/workflows/pages.yml` 的 `enablement: true` 控制；已存在的 Pages Site 會沿用原設定。
