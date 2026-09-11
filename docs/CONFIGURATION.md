# 設定手冊

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

`src/td/config.js` 集中管理 720×720 戰場、道路節點、起始 240G／5 木材、20 點城門生命、三職業價格／傷害／射程、護甲相剋與英雄能力；`wave.firstPreparation` 與 `wave.preparation` 分別是 18 秒首波準備及 12 秒後續整備。怪物原始數值位於 `Monster.js` 的 `TYPES`，每波 HP 目前成長 10.5%。15 波名稱、編成、提示、威脅與清場獎勵位於 `WaveCatalog.js`，不要在 `TDGame` 或 `WaveSystem` 硬編波表。

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

英雄復活時間、生命比例及守護時間位於 `config.hero.respawnTime`、`respawnHealth`、`invulnerability`。守軍基礎 `health`、`armor` 位於 `config.units`。敵人 `combatRole`、`attackRange`、`attackDamage`、`attackInterval` 位於 `Monster.TYPES`；Boss 階段門檻、踐踏倍率與冷卻集中於 `EnemyCombatSystem`。調整後必須驗證第 5／10／15 波。

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
