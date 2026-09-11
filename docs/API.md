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
| `CombatUnit` | `issueCommand`、`stop`、`holdPosition`、`update`、`upgrade` | 執行移動／攻擊移動／固守訂單、四態動畫、索敵與升級 |
| `Building` | `config`、`update`、`upgrade`、`sellValue` | 固定弩塔／寒霜塔／火砲塔的索敵與攻擊 |
| `Projectile` | `update`、`hit` | 單體／範圍傷害與緩速效果 |
| `Hero` | `setTarget`、`update`、`castNova` | 玩家移動、自動攻擊、攔截與主動技能 |
| `PathSystem` | `draw` | 固定道路節點與道路繪製 |
| `LayoutSystem` | `select`、`restore`、`resolved`、`apply`、`onResize` | 自動／電腦／手機模式、偏好保存與版面狀態 |
| `NavigationSystem` | `findPath`、`segmentClear`、`nearestOpen` | 30px 導航格、建築障礙、八方向 A* 與路徑簡化 |
| `CommandSystem` | `arm`、`issue`、`hold`、`stop`、`reset` | 管理目前指令模式並把目的地與路徑交給單位 |
| `ArtSystem` | `load`、`drawBackground`、`drawCombatUnit`、`drawBuilding`、`drawUnit` | 本機美術載入、4×4 動作圖集與建築圖集裁切 |
| `ProfessionSystem` | `choose`、`current`、`reset` | 三職業選擇與單局職業鎖定 |
| `WaveCatalog` | `total`、`get` | 15 波名稱、敵軍編成、威脅、提示與清場獎勵資料 |
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

`Hero.takeDamage(amount)` 回傳實際傷害，倒下後由 `updateDowned(dt)` 計時復活。`CombatUnit.takeDamage(amount)` 套用護甲並在歸零時退出戰鬥；`BuildSystem.removeDefeated()` 清除完成死亡動畫的單位。`EnemyCombatSystem.update(dt, monsters, hero, defenders, hooks)` 集中處理敵軍攻擊、Boss 階段、增援與踐踏前搖；hooks 只通知 UI 與回饋，不修改經濟。

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
