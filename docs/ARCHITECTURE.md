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

## 資料夾

```text
index.html
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
