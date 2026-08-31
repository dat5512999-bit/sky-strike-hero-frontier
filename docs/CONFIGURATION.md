# 設定手冊

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

`src/td/config.js` 集中管理 720×720 戰場、道路節點、八個塔座、起始 190G、20 點城門生命、20 波上限、三塔價格／傷害／射程與英雄能力。怪物原始數值位於 `Monster.js` 的 `TYPES`，每波 HP 目前成長 10.5%。波次內容位於 `WaveSystem.composition()`。

調整經濟時至少驗證：第一波可蓋兩座基礎塔、霜語加遊俠後仍可完成第一波、升級不會使金幣為負、出售返還總投入 70%、Boss 漏怪扣 5 點。自由新增道路節點時必須維持首尾在畫面外，並重測全部塔座不與道路重疊。

塔防正式美術位於 `assets/td`：`forest-valley-v1.png`、`towers-atlas-v1.png`、`units-atlas-v1.png`、`frontier-keep-v1.png`。圖集順序已硬編碼於 `ArtSystem.js`，不可任意交換格子。替換資產時須保留透明 Alpha、相同列數與一致鏡頭角度；新增檔名則同步更新 `sw.js`。
