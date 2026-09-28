# 霜原士兵動作補齊 · Motion 1.0.0

日期：2026-09-28。僅更新既有六兵種的待機／攻擊呈現，不新增兵種、不改英雄、傷害、射程、攻速、碰撞或存檔。尚未推送 GitHub 或部署。

## 玩家操作與 FAQ

重新載入 `td.html`、進入霜原軍團戰場並部署士兵即可使用；不需重新開始帳號或購買外觀。

- 六種士兵由各四張共用姿勢改為每種獨立 16 格：8 格待機、8 格攻擊，共 96 格。
- 狼人肩部／手臂、獵手披風與拉弓、薩滿手杖與施法、巨熊起身拍擊、長毛巨獸重踏均有獨立姿勢。極凍鳥待機也會持續振翅。
- 動畫仍為 2D 逐格圖，並非改成 3D 模型；仍以左右鏡像轉向，沒有宣稱完成多方向模型。
- 背景是真正 Alpha，並非把背景色塗掉。幀之間的留白不影響戰場角色尺寸。
- 看到舊姿勢：先確認新版檔案與快取，重新載入；新圖失敗時會用舊圖繼續遊戲，不阻塞開局。
- 待機與攻擊只代表外觀，不新增待機傷害或攻擊次數。命中釋放仍使用原攻擊動作 45% 的時點。

## 管理者驗收介面

執行 `npm run serve:test`，開啟 `http://127.0.0.1:4173/frostland-soldier-preview.html`。
選擇待機或攻擊，使用正常／¼ 速度、原尺寸／1.6 倍、暫停、前進一格、左右翻面與來源邊界檢查。
「重試載入」僅重試本頁失败圖片。此頁無存檔寫入、無 API、無權限修改，遊戲選單沒有入口；靜態 URL 本身並不是受登入保護的管理後台。
本次臨時預覽服務使用 4175；重新啟動則依上方預設 4173。

## 架構與 API

```text
CombatUnit.update(dt)
  └─ FrostlandAnimation.update：持續視覺時鐘 + 原有攻擊事件
      └─ motionPose：待機 0–7／攻擊 8–15／陰影與離地高度
ArtSystem.drawCombatUnit
  └─ FrostlandSprites：依兵種懶載入，一次 drawImage
      ├─ FrostlandMotionAtlas：逐幀來源框、腳底／腳部中心、統一比例
      └─ 載入失敗 → 原 soldier-actions-v1.png → 原有備援畫法
```

- 新增 `FrostlandAnimation.motionPose(unit)` 回傳 `{index,phase,clock,flying,lift,shadowWidth,shadowAlpha,impact}`。`pose()` 舊介面維持不變，英雄不受影響。
- `frostVisualTime` 是本局物件的暫態秒數，狀態切換不重設；`dt=0` 時不推進，非霜原士兵不增加欄位。
- `FrostlandSprites.motionAtlas(art,type)` 懶載入並快取六份新圖；載入成功失效該兵種預覽快取，既有 retry／failure 介面仍可列出新圖。
- `FrostlandMotionAtlas.js` 是衍生資料。`npm run measure:frostland-motion` 從 PNG 測量，不修改原始圖片。若連通身體不是 16 個或來源框重疊，產生器拒絕輸出。
- 不新增伺服器 API、資料庫或網路權限。

## 美術來源與檔案

使用內建 imagegen，依原 `assets/td/frostland/soldier-actions-v1.png` 的六個角色生成，再以 imagegen 修正留白；沒有使用 CLI／API fallback。
最終檔案：`assets/td/frostland/{frostWolf,frostBear,frostBird,frostHunter,frostShaman,frostMammoth}-motion-v2.png`。
每張 1254×1254 RGBA，4×4 排列；使用量測框，不硬切 313.5px 方格。提示詞與布局修正記於 `docs/FROSTLAND_MOTION_PROMPTS.json`。
原 v1 素材保留作為退回方案。透明度低至 1/255 的圖邊量化雜點不在實際採樣框內；沒有可見身體碰到整張圖外緣。

## 安裝、設定、更新與部署

1. 使用 Node.js 18 以上，在專案根目錄執行 `npm run test:frostland-motion`。
2. 本更新不新增 npm 套件或外部服務，不需要 API key。
3. 一起發佈六份 PNG、`FrostlandMotionAtlas.js`、`FrostlandAnimation.js`、`FrostlandSprites.js`、`td.html` 和 `sw.js`；驗收頁可另外保留給開發使用。
4. 保留現有 script 順序：Animation → 原 Atlas → MotionAtlas → Sprites。
5. 快取版號增加 `-frost-motion-1`；發佈時若另有新版本，保留其版本前綴並更新快取，不回退其他人的更新。新圖已加入 ASSETS。
6. 部署前做整合驗收；本地通過不代表已部署。舊開啟中的戰場需重新載入才使用新腳本。

## 備份、版本與還原

模組版本 `package.json:frostlandMotionVersion=1.0.0`，不覆寫其他功能的主版本號。
部署前備份上節列出的檔案。要暫時回到原士兵外觀，從 `td.html`／預覽頁移除 `FrostlandMotionAtlas.js` 的 script 引用，再更新快取版號並重新載入；Sprites 會回到保留的 v1 圖集。不要整檔還原混有其他開發工作的 package／td／sw 檔案，也不要清除玩家存檔。

## 測試與效能紀錄

- 最終 `npm run test:frostland-motion`：15 項通過（新動畫 4 項、單位 VFX 8 項、其他軍團動畫 3 項），涵蓋 96 幀、RGBA、唯一姿勢、來源框不重疊、待機循環、暫停、原命中時序、Lv.1／5、0／200% 加速、退役取消、左右鏡像、載入失敗備援及其他軍團回歸。初次連同 `td-frostland.test.js` 的四檔聯測為 37 項通過；其他工作同步更新第三章後，全測中的舊霜原故事斷言出現失敗，不能將初次 37 項視為此後任一版本保證。
- 瀏覽器驗收：六份圖集成功載入；檢查待機、蓄力、出手、逐格、邊界及鏡像。截圖存放 `artifacts/frostland-motion/`。
- 六 PNG 合計 7,510,630 bytes；全載入約 36 MiB RGBA 解碼記憶體（不含瀏覽器額外開銷），僅部署相應兵種時懶載入，不每幀重建圖片或 Canvas。
- 120 士兵 × 600 tick 的動畫與模擬 Canvas 呼叫：本機平均約 0.20ms、P95 約 0.28ms／tick；**不是 GPU／手機 FPS 測試**。
- 全專案 `npm test`：835 項、832 通過、3 失敗。輸出保留 `artifacts/frostland-motion-tests.log`。失敗為 `td-autumn` 地圖數量 14／10、`td-map` 正式地圖清單，以及 `td-frostland` 舊「故事不解鎖霜原」斷言；皆涉及正在變更的地圖／故事資料，未在本次動畫工作中調整，不能宣稱全專案綠燈。
- 待實機驗收：手機 GPU 與低記憶體裝置、完整 50 波長時間戰鬥、正式主機離線更新。這些不能用單元測試或預覽截圖替代。

## 驗收清單

- [x] 六兵種維持既有身份、配色與裝備方向。
- [x] 各自有 8 格待機及 8 格攻擊，不是只晃動一張圖。
- [x] 翅膀／長弓／長牙／手杖的完整身體來源框通過程式檢查。
- [x] 腳底定位、原尺寸、左右鏡像與載入備援。
- [x] 命中事件不增加、戰鬥屬性不改、存檔無迁移。
- [ ] 手機實機 FPS 與 50 波壓力驗收。
- [ ] 解決其他工作中的整合測試失敗後再部署。
