# API 文件（內部模組介面）

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
| `Tower` | `config`、`update`、`upgrade`、`sellValue` | 索敵、發射、等級與回收價值 |
| `Projectile` | `update`、`hit` | 單體／範圍傷害與緩速效果 |
| `Hero` | `setTarget`、`update`、`castNova` | 玩家移動、自動攻擊、攔截與主動技能 |
| `PathSystem` | `draw` | 固定道路節點與道路繪製 |
| `ArtSystem` | `load`、`drawBackground`、`drawTower`、`drawUnit`、`drawKeep` | 本機美術資產載入、atlas 裁切與城堡合成 |
| `WaveSystem` | `composition`、`start`、`update`、`label` | 20 波組成、生成佇列與清場狀態 |
| `BuildSystem` | `selectAt`、`build`、`upgrade`、`sell`、`towers` | 合法塔座與建造經濟 |
| `TDGame` | `startWave`、`buildTower`、`castNova`、`onKill`、`update` | 協調波次、英雄、塔、經濟、城門與結算 |

## Skin Pack 介面

每個 pack 必須包含 `id`、`name`、`icon`、`accent`、`secondary`、`background`、`star`、`effect`，以及 `renderers.player`、`renderers.bullet`、`renderers.enemy`。呼叫 `SkyStrike.skins.register(pack)` 後即可被選擇；詳細範例見外觀包製作指南。
