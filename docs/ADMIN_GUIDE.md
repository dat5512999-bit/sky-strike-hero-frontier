# 管理者手冊

本遊戲無帳號、伺服器、資料庫或管理後台。只使用瀏覽器 `localStorage` 保存外觀包 ID、難度 ID、最高分與歷史最高 Combo，不包含身分資料，也不上傳。管理工作僅包含保存發行檔、確認瀏覽器相容性及依 `CHANGELOG.md` 辨識版本。

可調整參數集中於 `src/config.js`：玩家、子彈、敵人、武器與生成速度。修改後必須執行 `npm test`、`npm run check`，並同步更新文件與版本號。

外觀包定義位於 `src/skins`。品牌合作素材上線前應確認商標、角色、包裝與音效授權；未取得授權時使用原創名稱與圖形。

玩法平衡分為 `config.js` 的共用參數、`DifficultySystem.js` 的模式經濟／防線上限、`StageDirector.js` 的波次詞綴、`Spawner.js` 的敵人預設與權重、`SkillSystem.js` 的果實規則，以及 `ChallengeSystem.js` 的事件狀態。每次調整至少測試標準與無雙各 60 秒，確認防線、四詞綴、威脅 1～5、事件成功／失敗、龍果、鳳梨稀有度與手機可讀性。

視覺效能主要由 `BattlefieldRenderer.js` 的星流／光塵及 `Effects.js` 的同時粒子數決定。若手機掉幀，應優先減少粒子數或 shadow blur，不可為了效能改大碰撞箱或降低敵人邏輯更新頻率。公開版本需維持敵我子彈顏色差異與減少閃爍的短生命週期。

關卡營運參數位於 `StageDirector.js`，Boss 戰鬥參數位於 `Boss.js`，支援單位位於 `SupportSystem.js`。調整後至少驗證第 1～6 波，確認四詞綴、逃脫扣損、鏡像／星靈核心、Boss 進場與轉階段、擊破晉級及兩種失敗結算。100 波目前不保存伺服器進度，沒有後台跳關功能。

塔防營運參數位於 `src/td/config.js`、`Monster.js` 與 `WaveSystem.js`。發布前必須驗證 `config.units`／`config.buildings` 分流、人物移動與動作切換、A* 建築繞行、移動／攻擊移動／固守／停止、建築道路禁建、三種塔形、資源不足、Lv.5、回收、漏怪及 15 波結算。塔防不保存單局進度，也沒有後台、帳號或付費經濟。

塔防美術由 `ArtSystem.js` 與 `assets/td` 管理。角色圖集必須為 4×4 並維持腳底註冊點；更換 PNG 前需檢查尺寸、透明 Alpha、著作權來源與手機載入量，新增檔名也要加入 `sw.js`。
