# 管理者手冊

## 0.62.0 計分與戰績維護

速度分由 `BattleReportSystem.targetTime()` 與 `timeBonus()` 集中管理；目前提早基準時間每秒 5 分，完成該波才入分，失敗波沒有速度獎勵。`finalize(victory)` 只在整場結束時寫入 `heroFrontierScoreRecordsV1`，保留最高分與最近 20 場。清除瀏覽器網站資料會刪除戰績；部署或更新靜態檔案不會主動清除。

修改速度公式時須同時檢查不同敵量、難度倍率、10／20 秒比較、失敗波、重複結算與 localStorage 不可用等情況。積分仍不得影響 Economy、Loot 或 Upgrade。

## 0.61.0 維護重點

手機 Gesture 分工由 `BattlefieldCamera` 與 `TDGame.attachInput()` 協作：Camera 只攔截空地／雙指手勢，英雄起手與建造狀態交回 Gameplay。不得讓觸控 `pointerdown` 直接呼叫 `confirmPlacement()`。資源兌換統一由 `ShopSystem.exchange()` 呼叫 `EconomySystem`，固定匯率常數是 `MERIT_GOLD_RATE=1000`。

積分由既有 `BattleReportSystem` 擴充，不另建第二份戰報。`KILL_SCORES`、`DIFFICULTY_MULTIPLIERS`、每波加扣分集中在該模組；調整公式後必須重跑各難度、漏怪、英雄倒下及戰敗測試。評分不得直接修改 Economy、Loot 或 Upgrade。

## 0.60.1 返回流程維護

HERO FRONTIER 內部不得再以 `href="index.html"` 表示「返回模式選擇」；`index.html` 是另一款飛機遊戲，不是 TD 模式選單。戰鬥與結算回遠征頁統一呼叫 `TDGame.returnToOpening()`，由它關閉 Menu 後沿用既有 `reset()`。如未來需要跨產品入口，必須使用明確的「離開 HERO FRONTIER」文案並另行確認，不得混用遠征返回功能。

## 0.60.0 HUD 縮放維護

桌面縮放適配集中在 `td-combat.css` 的 0.60.0 區段。不要對 `.td-game-shell` 或整個 HUD 使用 `transform: scale()`；瀏覽器縮放已經改變 CSS Viewport，再做整體縮放會破壞 fixed 定位與輸入換算。寬螢幕斷點只放大個別邊緣元件，1199px 以下與低高度斷點則以 `left: calc(50% - 寬度/2)` 置中 `.hud-controls`。修改後至少驗證 1920×900／DPR 1、1280×600／DPR 1.5、960×450／DPR 2，並確認 Wave、控制列、資源列互不重疊且暫停鍵在最右側。

## 0.59.0 選角素材維護

英雄立繪路徑／焦點位於 `src/td/systems/HeroRoster.js` 的 `selectionArt`／`selectionFocus`；軍團橫幅位於 `FactionSystem.js` 的同名欄位；難度場景與圖集分區位於 `TDDifficultySystem.js` 的 `selectionArt`／`selectionPosition`。替換圖片時請維持英雄直式、軍團超寬橫式與難度 2×2 圖集用途，並同步加入 `sw.js`。不要把圖片 URL 寫入事件處理器，也不要用英雄戰鬥 Sprite 代替選角立繪。

## 0.58.0 維護重點

怪物隊列由 `Monster.routeDistance`、`Monster.minimumHeadway()` 與 `TDGame.updateMonsterConvoy()` 控制。它只限制後方怪物當幀可前進距離，不得改成互推、側移或碰撞；調整間距後要同時測試快／慢混編與 ×1／×2／×3。地圖的 `heroVulnerable` 決定敵軍是否可攻擊英雄與 HUD 是否顯示 HP，新增地圖時必須明確設定。

建造排序只改按鈕 CSS `order`，BuildSystem 名冊及價格資料仍是唯一來源；桌面使用完整 Grid，手機仍使用橫向 Scroll。軍械與戰利品是同一 DOM 與同一流程的 CSS 緊湊化，請勿另建 Mobile Modal。`barracks`、`grove`、`graveyard` 的九宮格已含升級旗幟，不能再呼叫通用 `drawRank()` 疊圖。正式地圖最大縮放為 1.65；要再提高必須先提供維持 1536×1024 座標比例的 2× 素材。

## 0.57.0 維護重點

正式地圖資產是 `assets/td/beginner-valley-v1.png`，固定為 1536×1024；不得用 CSS 或 Canvas 將它非等比例拉伸。地圖幾何集中於 `src/td/maps.js`：路線、出生點、城門、草地多邊形與 Safe Area 必須隨圖片版本一起維護。`BattlefieldCamera` 只負責 Viewport，不得建立 PC／Mobile 各自的道路或建造規則。

士兵的正式契約為部署後永久固定。UI、鍵盤或舊 `CommandSystem` 呼叫都不可改變 `CombatUnit.x/y`；英雄移動仍由 `Hero` 處理。發布前至少執行 `npm run check`、`npm test`、`git diff --check`，並在桌面與手機橫向檢查道路、合法部署、小地圖和單位旁升級／回收。

## 0.55.0 士兵規則維護（2026-09-15，本機）

士兵進攻由 `CombatUnit.update()` 的射程內自動索敵處理，敵人對玩家傷害則維持英雄與城門流程。不要為士兵恢復追擊、承傷、負傷歸隊或強制兵種數量上限。`BuildSystem` 每次合法放置建立獨立士兵；軍械以 `ArmorySystem.owned` 物品副本 ID 與 `assignments` 持有人對照，販售單位時由既有 `onRemove` 釋放裝備。修改裝備適用類型或效果時，應確認固定部署的士兵實際能受益。

## 0.54.3 商城與技能分區（2026-09-14，本機）

維護商店入口時保留唯一 `td-shop-open` ID；開啟、暫停、快捷鍵 R 及商店權限仍走 `TDGame` 原流程。只調整 DOM 位置與表現，不修改商品或交易數值。

## 0.54.2 士兵升級圖塊（2026-09-14，本機）

本版僅改 `ArtSystem.drawCombatUnit/drawRank` 的守軍呈現及測試。維護時檢查 Lv.2～5 守軍輪廓不被程式多邊形蓋住；不需修改資料、權限或伺服器。

## 0.54.1 英雄小卡（2026-09-14，本機）

此次僅調整 td.html、td.css、td-combat.css 的既有英雄 HUD。確認同一組 `td-hero-*`、`td-stat-*` ID 沒有複製，`src/td/main.js` 與 TDGame 更新流程未改。部署需同步三個 UI 檔與 sw.js；無權限、帳號或資料遷移。

## 0.54.0 小地圖與快捷面板（2026-09-14，本機）

新增 MiniMapView 純呈現模組，從既有地形快取／地圖定義／鏡頭讀值，不儲存新玩家資料。檢查 td.html、td-combat.css、MiniMapView.js 與 sw.js 同步部署。沒有資料庫、帳號、權限或設定遷移。

## 0.53.0 戰鬥 HUD（2026-09-14，本機）

這次只改 HTML 圖示與 CSS 排版，四個資源 ID、原暫停／選單按鈕及事件不變。沒有新設定、資料遷移、帳號或權限變更。

## 0.52.0 地圖構圖與部署體驗（2026-09-14，本機）

本版只變更地表、開局鏡頭構圖與部署提示；不需要新設定、帳號、API 或資料遷移。確認 assets/td/frontier-ground-v2.png 一併存在。中央折返覆蓋偏強的觀察及未驗事項記於 MAP_DEPLOYMENT_V052.md。

## 0.51.0 HUD／地景呈現（2026-09-14，本機）

新增兩張本機裝飾圖，不新增管理端或網路服務。若新圖未就緒，地景沿用原素材、技能沿用文字圖符；兩者不參與開局coreStatus必要美術判斷。現有retryFailed納入新圖。

## 0.50.0 大地圖原型（2026-09-14，本機）

新增 maps.js、FrontierTerrain.js，未增加服務、帳號或管理後台。地圖開局選擇，戰鬥中不得切換；保留 classic 作比對基線。新圖僅路線原型，30波平衡與真機效能仍待驗收。


## 最新：0.49.0 鏡頭原型

0.49.0新增src/td/systems/BattlefieldCamera.js，需和td.html、td-combat.css、TDGame.js、main.js同步更新。未新增後端、權限或数据库。此版只驗證鏡頭，不可把Canvas像素尺寸當作擴大的可部署世界。

## 0.48.0 維護提醒

本次是呈現層更新，無帳號、資料庫或後台變更。新增 `td-combat.css` 必須和 HTML、main.js、sw.js 一起部署；既有未提交玩法改動不屬於這次 HUD 修改。不要單獨回退整個工作目錄。

## v0.47.0 戰鬥介面與建造流程維護（本機續作）

先執行 `npm test`、`npm run check`。橫式判斷在 `LayoutSystem`，UI 入口在 `src/td/main.js`；建造真正扣款仍由 `BuildSystem.placeQueued()` 執行。若收到誤建回報，依序檢查選卡、Canvas 點位、`stagePlacement()`、`confirmPlacement()` 與原扣款入口；目前綠色合法位置單擊即提交，已無第二個確認按鈕。手機選單可手動切換電腦／手機介面。詳見 [續作進度](COMBAT_EXPERIENCE_V2_PROGRESS.md)與 [Camera／Canvas 盤點](BATTLEFIELD_CAMERA_CANVAS_AUDIT.md)。此版未更動權限、後端或存檔結構。

## v0.46.0 塔定位維護

新塔的 `config.buildings.role` 必須描述已實作能力，不可只用美術名稱暗示毒傷、暈眩或光環。戰鼓增益由 `BuildSystem.applyTowerSupport()` 每步重算、不疊加；調整 `allyHaste` 後應重新檢查跨軍團守軍、軍械攻速與售塔回復。召喚塔的各項召喚設定留在 `config.buildings`，共用 `TowerSkillSystem` 與 `Summon`；若改 `summonInterval`，需一起驗證有效存續與上限，不只驗證設定值。獅翼弩砲的 `priorityTargets` 應只列現有 Monster type。發版前跑 `npm run check`、`npm test`，並實玩前／中／後波；未經使用者要求不推送 GitHub。

## v0.45.0 英雄／軍團資料維護

英雄 ID 與技能在 `HeroRoster`／`Hero`，開局英雄狀態仍由 `ProfessionSystem` 保存；軍團名冊與可建權限在 `FactionSystem.FACTIONS`。新增軍團或英雄時分別更新開局卡、圖片預載與測試，不應靠相同 ID 自動綁定。`TDGame.lastRun` 現保存 `profession`（英雄 ID）與 `faction`（軍團 ID），沒有持久存檔、帳號、資料庫或權限。調整塔進階時需測實際 `TowerSkillSystem.fire()` 投射物，不能只驗說明文字。發版前執行 `npm run check`、`npm test` 並在 PC／手機介面實玩；只有使用者明確要求才推送 GitHub。

## v0.44.2 敵軍視覺維護

怪物 `x/y/index` 是戰鬥座標，不可為了排隊效果改寫。若調整 `Monster.visualPosition()` 的列距／轉角插值，須重新檢查 `tests/td-enemy-readability.test.js` 與 `tests/td-readability-preview.html` 的 12／20／30、混合及 Boss 截圖。新增大型怪時檢查視覺遮擋與血條高度；不需修改 Wave 或碰撞。此版本沒有資料庫、帳號或權限變更。

## v0.44.1 巡林者武器圖層維護

`ArtSystem.drawHunterWeapon()` 以武器圖集或軍械庫獅心弓繪製同一個手持圖層；調整姿勢請檢查 idle／walk／attack 四格、左右鏡像及原圖比例。`drawHero()` 在可繪製換裝武器時選無武器底圖，`drawGearPieces()` 對巡林者略過已繪製的軍械庫武器，其他護甲／戰器照舊。沒有資料庫、權限或數值改動；修改圖層後提升 Service Worker 快取並跑換弓回歸測試。

## v0.44.0 UI 維護重點

開局選擇與戰鬥狀態仍由 `TDGame` 管理；難度倍率在 `TDDifficultySystem`，勿在卡片寫第二套數值。`main.js` 依 `LayoutSystem.resolved()` 把**同一批** `[data-build-type]` 按鈕在桌機 Drawer 與手機原指揮網格之間搬移，不複製建造資料；分類只用 `data-build-category` 篩選，實際費用／放置仍走 `BuildSystem`。新增建築時同時檢查 Drawer 分類、手機原格、CSS 圖集與 PWA 清單。重開只呼叫 `TDGame.reset()`；再挑戰在重置後重新套用上一局難度／英雄／軍團。沒有資料庫、帳號、權限或遊戲存檔遷移。

## v0.43.0 維護重點

當時版本曾有守軍追擊／回防；0.55.0 已移除，請勿照舊恢復。新增士兵仍須由既有 `BuildSystem` 建立，不另開 Auto Battle。索敵類型在 `TargetSelector.STRATEGIES`，新增選項時同步更新 `td.html` 與測試。載圖回歸已修正；不要為了進場而繞過完整圖片門檻。

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

`WaveCatalog.js` 是 30 波編成與清場獎勵的唯一來源，`WaveSystem.js` 仍只管理 `preparing → spawning → clearing → reward → complete`。後期生命成長採 `1 + 前14波×10.5% + 後15波×7%`；不要在 `TDGame` 硬編波數。調整後至少驗證第 15／16 波曲線銜接、六個 Boss 波總耐久、每三波 Loot、Lv.15、第三十波勝利與四難度士兵定點規則。

## v0.33.0 守軍恢復營運參數

這是 v0.33.0 的歷史規則。0.55.0 已移除 `unitRecovery`、士兵倒地／歸隊與永久陣亡；現在 `BuildSystem.onRemove` 只在玩家販售等主動移除流程釋放裝備。勿再引用當時的恢復參數。

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

敵方攻擊集中於 `EnemyCombatSystem.js`；英雄復活參數在 `config.hero`。`config.units` 舊士兵生命／護甲欄位保留相容但不參與承傷。調整 Boss 傷害或冷卻時應驗證其仍只傷英雄，並保留 1.1 秒可讀前搖。不要讓一般怪取得 `combatRole`，除非波次設計明確需要其反擊。

## v0.24.0 黃金 15 波

難度倍率統一由 `TDDifficultySystem.js` 管理，波次只由 `WaveCatalog.js` 管理，敵人鄰近能力只由 `EnemyTraitSystem.js` 管理。調整祭司治療或旗手光環後，至少測試多名同類同場不會無限疊加；調整盾衛時應以 `effectiveHealth()` 驗證傷害回饋。正式發布前保留標準模式為預設，並人工完成至少一次第 5、10、15 波。

## v0.31.0 軍械管理

裝備表集中於 `ArmorySystem.js`，不得把倍率直接寫入英雄或守軍基礎表。新裝備必須指定欄位、相容類型、圖集格位及說明，並測試不相容目標。軍械為本局狀態；若未來加入永久收藏，需另行設計版本化存檔，不可直接把目前 `owned` 陣列寫入既有偏好鍵。

## v0.32.0 唯一軍械

`assignments` 是唯一持有關係的權威資料；不得只改角色 `gear` 而繞過 `equip()`／`unequip()`。新增角色永久離場流程時必須觸發 `BuildSystem.onRemove` 或明確呼叫 `releaseTarget()`。英雄倒下屬可復活狀態，不應回收裝備。

## v0.32.1 PWA 管理

射擊模式與塔防模式分別使用 `manifest.webmanifest`、`td.webmanifest`，但共用同一組 PNG 圖示。修改 manifest、啟動網址或圖示後必須同步提升 Service Worker 快取版本，避免已安裝裝置長期停留舊資產。

v0.32.2 由 Pages 工作流程自動執行首次 enablement；維護者仍應在 Actions 確認部署成功，不可只以 push 成功視為上線。
