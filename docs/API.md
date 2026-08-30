# API 文件（內部模組介面）

所有模組掛載於全域 `SkyStrike` 命名空間，以支援直接由 `file://` 開啟。

| 模組 | 主要介面 | 責任 |
|---|---|---|
| `Player` | `setTarget`、`update`、`takeDamage`、`draw` | 玩家移動、HP、受傷狀態 |
| `Enemy` | `update`、`takeDamage`、`draw` | 普通敵機行為與 HP |
| `Bullet` | `update`、`draw` | Phase 1 玩家子彈 |
| `EnemyBullet` | `update`、`draw` | 敵方瞄準彈與彈幕投射物 |
| `PowerUp` | `update`、`draw` | 技能果實移動與外觀 |
| `Weapon` | `update`、`reset` | 自動射擊節奏與子彈建立 |
| `Collision` | `resolvePlayerBullets`、`resolvePlayerEnemies` | 碰撞配對與結果通知 |
| `Spawner` | `update`、`currentInterval`、`reset` | 敵機生成與難度漸進 |
| `GameState` | `start`、`pause`、`resume`、`end`、`registerKill`、`breakCombo` | 流程、分數、Combo、倍率與最高紀錄 |
| `Effects` | `burst`、`update`、`draw` | 輕量擊破視覺效果 |
| `SkinRegistry` | `register`、`all`、`select`、`restore`、`current`、`draw` | 外觀包註冊、選擇、保存與繪圖委派 |
| `InputController` | `canvasPoint`、`touchTarget`、Pointer handlers | 桌面絕對定位與手機相對拖曳 |
| `SkillSystem` | `update`、`spawn`、`maybeDrop`、`collect`、`level`、`status` | 果實生成、Lv.1～3、限時技能、護盾與清場 |
| `DifficultySystem` | `all`、`current`、`select`、`restore` | 難度資料、選擇與本機保存 |
| `ChallengeSystem` | `reset`、`update`、`onKill`、`onPlayerDamaged`、`status` | 限時事件狀態機與龍果獎勵 |
| `Game` | `start`、`togglePause`、`update`、`draw` | 組合各模組與遊戲迴圈 |

`Boss` 仍是後續擴充點；`PowerUp` 已由技能與事件系統生成。事件完成時建立 `dragonfruit`，一般隨機生成不包含此類型。

## Skin Pack 介面

每個 pack 必須包含 `id`、`name`、`icon`、`accent`、`secondary`、`background`、`star`、`effect`，以及 `renderers.player`、`renderers.bullet`、`renderers.enemy`。呼叫 `SkyStrike.skins.register(pack)` 後即可被選擇；詳細範例見外觀包製作指南。
