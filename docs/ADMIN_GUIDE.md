# 管理者手冊

## v0.44.0 UI 維護重點

開局選擇與戰鬥狀態仍由 `TDGame` 管理；難度倍率在 `TDDifficultySystem`，勿在卡片寫第二套數值。`main.js` 依 `LayoutSystem.resolved()` 把**同一批** `[data-build-type]` 按鈕在桌機 Drawer 與手機原指揮網格之間搬移，不複製建造資料；分類只用 `data-build-category` 篩選，實際費用／放置仍走 `BuildSystem`。新增建築時同時檢查 Drawer 分類、手機原格、CSS 圖集與 PWA 清單。重開只呼叫 `TDGame.reset()`；再挑戰在重置後重新套用上一局難度／英雄。沒有資料庫、帳號、權限或遊戲存檔遷移。

## v0.43.0 維護重點

`CombatUnit` 保有命令與自動攻擊，只新增守軍追擊／回防狀態；新增士兵須由既有 `BuildSystem` 建立，不另開 Auto Battle。索敵類型在 `TargetSelector.STRATEGIES`，新增選項時同步更新 `td.html` 與測試。此次回歸與 v0.41.0 的按需載圖佇列相關，已恢復直接載圖；不要為了進場而繞過完整圖片門檻。測試伺服器的圖片 MIME 也已補正。無帳號、資料庫、權限或存檔遷移。

## v0.42.0 平衡維護

老兵壓力只在 `TDDifficultySystem.MODES.veteran` 調整；塔原價與控制／連攜屬性在 `config.buildings`，階梯倍數在 `Building.upgradeCost()`，擊殺門檻在 `TowerSkillSystem.THRESHOLDS`。調整任一值時請同時查第 1／13／20／30 波的可花金、漏怪、是否仍有兩種以上可行編成；不能只看血量倍率或單塔 DPS。新塔必須同步 `FactionSystem`、`td.html`、`ArtSystem`、`td.css`、離線快取與測試。此版沿用現有本機資料，不需要管理權限或資料遷移。

## v0.41.0 載入與平衡維護

調整三英雄大絕請改 `HeroUltimateSystem.ULTIMATES` 與 `cast`，保持冷卻高於 Q／W／E、空場不扣冷卻、傷害走 `Projectile.hit`。此段的「按需載入」是 v0.41.0 舊策略，已在 v0.43.0 因 0/3 回歸撤回；目前新增關鍵首波圖時仍須更新 `ArtSystem.coreStatus`。手機圖片失敗先確認資產 URL 與載入事件，勿只看降級圖就判定美術檔不存在。

## v0.40.1 透明圖維護

王國英雄有武器底圖仍用 `hero-hunter-actions-v2.png`；購買武器後必須改用真正透明的 `hero-hunter-actions-unarmed-v4.png`，再由 `ArtSystem.drawClassWeapon` 疊上武器。禁止把影像編輯器的棋盤預覽當作 PNG 背景匯出；新增圖集需逐格檢查 Alpha，不只看 PNG 色彩型態。舊 v3 留作歷史資產但不再於執行時或離線快取引用。

## v0.40.0 維護重點

六名新守軍仍由 `config.units` 定義，陣營名單在 `FactionSystem.FACTIONS`；新增圖集只接入 `ArtSystem.combatUnits`，不複製建造或傷害系統。三名新敵軍在 `Monster.js` 設定，30 波來源為 `WaveCatalog.js`。新增角色時須同時檢查建造與傭兵 HTML、CSS 圖像、Service Worker 清單及測試；本次無帳號、權限或伺服器資料遷移。

## v0.39.0 維護重點

所有 `new Summon` 入口都必須提供 `form`；英雄使用 hunter／arcanist／rogue，塔使用 crypt／graveyard。召喚圖路由只放在 `ArtSystem.drawSummon`。傭兵可見性由 `FactionSystem.canHire()` 決定，HTML 只列九種三族正式兵；戰利專屬半獸人不重複販售。玩法型武器透過 `EquipmentSystem.projectileOptions()` 組合現有 Projectile 欄位。手機面板狀態存於 `towerFrontierMobilePanel`，只影響 UI，不得進入戰鬥狀態。

## v0.38.0（2026-09-12）

平衡設定集中於 src/td/systems/TDDifficultySystem.js。變更後檢查三十關血量與金幣排序，勿另行手改選單數字；其內容由設定生成。保留本機修改前備份 artifacts/before-v0.38.0.zip。

## v0.36.0 守軍與敵軍素材

新增單位資料仍集中於 `config.units`，陣營歸屬只由 `FactionSystem.FACTIONS` 決定；`CombatUnit` 沿用既有命令、負傷、Lv.1～5、熟練與軍械流程。`ArtSystem.combatUnits` 新增 knight／treant／golem，`enemyActions` 新增 shaman／healer／boss。新增角色時必須同步 HTML 建造按鈕、CSS 肖像、Service Worker、PNG 資產及回歸測試，不得另建平行建造系統。

## v0.35.0 美術與建造資料

英雄專屬圖集由 `ArtSystem.heroHunter／hero／heroRogue` 選擇，普通守軍繼續使用 `combatUnits`，不可再讓英雄回退共用守軍圖集。三座新塔的數值位於 `config.buildings`，開局歸屬位於 `FactionSystem.FACTIONS`，分支與熟練行為分別由 `TowerEvolutionSystem`、`TowerSkillSystem` 管理。新增或移除塔時必須同步 `td.html`、`td.css`、`sw.js` 與測試。

## v0.34.0 三十波營運

`WaveCatalog.js` 是 30 波編成與清場獎勵的唯一來源，`WaveSystem.js` 仍只管理 `preparing → spawning → clearing → reward → complete`。後期生命成長採 `1 + 前14波×10.5% + 後15波×7%`；不要在 `TDGame` 硬編波數。調整後至少驗證第 15／16 波曲線銜接、六個 Boss 波總耐久、每三波 Loot、Lv.15、第三十波勝利與四難度的守軍恢復規則。

## v0.33.0 守軍恢復營運參數

四難度的 `unitRecovery` 位於 `src/td/systems/TDDifficultySystem.js`，包含 `enabled`、`time`、`health`、`guard`。`BuildSystem` 只把該策略配置到新舊作戰單位；`CombatUnit` 擁有倒地、倒數與歸隊狀態。永久離場才可觸發 `BuildSystem.onRemove` 回收唯一軍械，負傷期間不得呼叫 `releaseTarget()`。調整後至少驗證裝備單位負傷、倒數、原位置歸隊、戰報統計與災厄永久陣亡。

> v0.30.0 無新增帳號、後端或資料庫。英雄 XP、戰利品、跨族解鎖與單位熟練皆為單局狀態；重新開始會重置，原本的本機介面偏好與射擊模式紀錄不受影響。

本遊戲無帳號、伺服器、資料庫或管理後台。只使用瀏覽器 `localStorage` 保存外觀包 ID、難度 ID、最高分與歷史最高 Combo，不包含身分資料，也不上傳。管理工作僅包含保存發行檔、確認瀏覽器相容性及依 `CHANGELOG.md` 辨識版本。

可調整參數集中於 `src/config.js`：玩家、子彈、敵人、武器與生成速度。修改後必須執行 `npm test`、`npm run check`，並同步更新文件與版本號。

外觀包定義位於 `src/skins`。品牌合作素材上線前應確認商標、角色、包裝與音效授權；未取得授權時使用原創名稱與圖形。

玩法平衡分為 `config.js` 的共用參數、`DifficultySystem.js` 的模式經濟／防線上限、`StageDirector.js` 的波次詞綴、`Spawner.js` 的敵人預設與權重、`SkillSystem.js` 的果實規則，以及 `ChallengeSystem.js` 的事件狀態。每次調整至少測試標準與無雙各 60 秒，確認防線、四詞綴、威脅 1～5、事件成功／失敗、龍果、鳳梨稀有度與手機可讀性。

視覺效能主要由 `BattlefieldRenderer.js` 的星流／光塵及 `Effects.js` 的同時粒子數決定。若手機掉幀，應優先減少粒子數或 shadow blur，不可為了效能改大碰撞箱或降低敵人邏輯更新頻率。公開版本需維持敵我子彈顏色差異與減少閃爍的短生命週期。

關卡營運參數位於 `StageDirector.js`，Boss 戰鬥參數位於 `Boss.js`，支援單位位於 `SupportSystem.js`。調整後至少驗證第 1～6 波，確認四詞綴、逃脫扣損、鏡像／星靈核心、Boss 進場與轉階段、擊破晉級及兩種失敗結算。100 波目前不保存伺服器進度，沒有後台跳關功能。

塔防營運參數位於 `src/td/config.js`、`Monster.js` 與 `WaveCatalog.js`；`WaveSystem.js` 只管理等待、準備、出兵、清場、結算與完成狀態，`EconomySystem.js` 統一處理花費、擊殺、波次獎勵及回收。發布前必須驗證下一波預告、18／12 秒準備、立即開波、清場只結算一次、Boss 波強度、人物移動、A* 繞行、資源不足、Lv.5、回收與漏怪。塔防不保存單局進度，也沒有後台、帳號或付費經濟。

塔防美術由 `ArtSystem.js` 與 `assets/td` 管理。角色圖集必須為 4×4 並維持腳底註冊點；更換 PNG 前需檢查尺寸、透明 Alpha、著作權來源與手機載入量，新增檔名也要加入 `sw.js`。

發布 v0.16 之後還需分別選擇自動、電腦、手機介面完成一次煙霧測試，確認波次預告不遮擋按鈕、切換不會重設戰局；重新整理後應恢復最後選擇。若 `localStorage` 被停用，介面應回退自動模式而不是阻止遊戲啟動。

## v0.17.0 英雄與指揮介面

本版新增 hero-actions-v1.png 透明動作圖集。維護時驗證 F1／頭像選取、取消部署不扣款、右鍵不觸發左鍵建造、英雄蓄力目標失效、暫停／繼續、命令分類及三種版面。升級裝飾不改戰鬥倍率。無新增帳號、資料庫、權限或外部 API。

## v0.18.0 英雄技能與種族塔

新增 TowerSkillSystem、ShopSystem、Summon 與 faction-towers-v1.png，無資料庫、帳號、外部 API 或付費服務。平衡調整需同時檢查擊殺歸屬、召喚上限、出售後召喚消失、裝備購買與重新開始清除局內狀態。

## v0.19.0 英雄流派與傭兵館

v0.19.0 新增 HeroRoster.js。流派仍沿用 hunter／arcanist／rogue ID；不要改 ID 破壞圖片映射。傭兵重用 CombatUnit 與導航，pending.mercenary 標記特殊價格；totalSpent 必須記錄實付額以正確回收。無新服務、帳號、權限或資料庫。

## v0.20.0 敵軍動作第一階段

新增三個enemy-*-actions-v1.png；Monster生命週期仍以active控制戰鬥，TDGame.corpses只用於一秒視覺殘留、上限60。不可讓屍體重新參與碰撞、漏怪或金錢結算。無新服務或權限。

## v0.21.0 RTS 指揮介面

HUD DOM ID 是 `TDGame` 與畫面的相容契約，不可重複或任意改名。`gameSpeed` 只允許 1、2、3；模擬仍由同一 update 流程推進。藍色列是三招技能的「冷卻能量」摘要，不是可消耗 MP。發布前需分別驗證桌面、手機、暫停、三段速度、Q／W／E／R 與 Console。

## v0.22.0 戰鬥回饋

`CombatFeedbackSystem` 的 `items` 上限為 120；效能不足時先降低碎屑數量或生命週期，不得省略實際傷害計算。暴擊只表示既有護甲剋制倍率至少 1.25。新增攻擊路徑時必須傳遞 `onHit`，並驗證一次命中只產生一次傷害回饋與一次擊殺獎勵。

## v0.23.0 戰鬥生命週期

敵方攻擊集中於 `EnemyCombatSystem.js`；英雄復活參數在 `config.hero`，守軍生命／護甲在 `config.units`。調整 Boss 傷害或冷卻時應同時驗證三個 Boss 波，並保留 1.1 秒可讀前搖。不要讓一般怪取得 `combatRole`，除非波次設計明確需要其反擊。

## v0.24.0 黃金 15 波

難度倍率統一由 `TDDifficultySystem.js` 管理，波次只由 `WaveCatalog.js` 管理，敵人鄰近能力只由 `EnemyTraitSystem.js` 管理。調整祭司治療或旗手光環後，至少測試多名同類同場不會無限疊加；調整盾衛時應以 `effectiveHealth()` 驗證傷害回饋。正式發布前保留標準模式為預設，並人工完成至少一次第 5、10、15 波。

## v0.31.0 軍械管理

裝備表集中於 `ArmorySystem.js`，不得把倍率直接寫入英雄或守軍基礎表。新裝備必須指定欄位、相容類型、圖集格位及說明，並測試不相容目標。軍械為本局狀態；若未來加入永久收藏，需另行設計版本化存檔，不可直接把目前 `owned` 陣列寫入既有偏好鍵。

## v0.32.0 唯一軍械

`assignments` 是唯一持有關係的權威資料；不得只改角色 `gear` 而繞過 `equip()`／`unequip()`。新增角色永久離場流程時必須觸發 `BuildSystem.onRemove` 或明確呼叫 `releaseTarget()`。英雄倒下屬可復活狀態，不應回收裝備。

## v0.32.1 PWA 管理

射擊模式與塔防模式分別使用 `manifest.webmanifest`、`td.webmanifest`，但共用同一組 PNG 圖示。修改 manifest、啟動網址或圖示後必須同步提升 Service Worker 快取版本，避免已安裝裝置長期停留舊資產。

v0.32.2 由 Pages 工作流程自動執行首次 enablement；維護者仍應在 Actions 確認部署成功，不可只以 push 成功視為上線。
