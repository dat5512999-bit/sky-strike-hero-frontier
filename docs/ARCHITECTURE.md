# 系統架構

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
               EconomySystem, BuildSystem
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
                 ├─ BuildSystem → CombatUnit（可移動）/ Building（固定）→ Projectile
                 ├─ CommandSystem → NavigationSystem(A*) → CombatUnit Order
                 ├─ LayoutSystem → body[data-layout] → Desktop/Mobile CSS
                 ├─ Hero → Projectile / Nova / Intercept
                 ├─ ArtSystem → Background / Atlases / Keep
                 ├─ EconomySystem → Build / Upgrade / Sell / Kill / Wave Reward
                 └─ Base Health → Leak → Victory / Game Over
```

`WaveCatalog` 提供不可變的 15 波設計資料；`WaveSystem` 依序執行 `preparing → spawning → clearing → reward`，結算事件只發出一次，再自動進入下一次準備。`Monster` 自行沿節點移動；`CommandSystem` 透過 `NavigationSystem` 將目的地轉為避障路徑，`CombatUnit` 執行訂單，`Building` 固定索敵；`TDGame` 只協調事件與 UI，收支交由 `EconomySystem`。

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
