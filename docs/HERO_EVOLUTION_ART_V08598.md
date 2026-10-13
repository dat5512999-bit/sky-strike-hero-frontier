# 戰牛進化造型與火焰試煉 v0.85.98

日期：2026-10-12。狀態：本機完成，尚未提交或部署 GitHub。

## 需求、範圍與設計

使用者確認戰牛外觀提案後，將兩階進化由幾何肩甲／披風疊圖改為完整角色動作圖。覺醒使用毛皮鍛甲，超凡使用金色牛首胸甲、紅色戰披與雙頭巨槌。戰牛取消浮空皇冠／徽記，保留地面階段光環、裝備效果與技能特效。其他十名英雄仍沿用原造型；本版不宣稱所有英雄已重製。

進化試煉改為火焰惡魔，沿用既有惡魔傭兵素材，但以獨立敵方渲染呈現，不顯示傭兵升級標誌、不套用友軍裝備。覺醒對手為「火焰惡魔・熔火魔將」，超凡對手為「火焰惡魔・煉獄魔王」。後者較大，地面火圈較亮，並非第二張全新惡魔圖集。原範圍攻擊改名「熔火爆發」，維持 1.1 秒預警、原傷害與原冷卻；未新增持續地火或新戰鬥機制。

## 玩家操作與 FAQ

1. 選戰牛進入遠征。通過第 20 波後，用 3 枚首領勳章買進化石。
2. 商店關閉，清場且英雄存活時自動召出熔火魔將。只有英雄及其召喚可傷害試煉 BOSS。
3. 紅圈蓄力時離開圈內，避免熔火爆發。失敗保留石頭，復活後按「免費挑戰 BOSS」。
4. 勝利才消耗石頭，等級與經驗歸 0、能力依既有規則強化，並切換覺醒毛皮鍛甲。
5. 通過第 50 波後，以 5 枚勳章再次買石，擊敗煉獄魔王後切換超凡戰神重甲。

已裝備「鋼鐵工頭」等商城造型時，付費造型優先，不會被預設進化圖覆蓋。此時進化能力與地面階段光環仍有效；取消裝備商城造型後會顯示該階的預設戰牛造型。付費造型並未新增兩張進化版。

若仍看見舊造型，先確認：英雄是戰牛、真的擊敗試煉 BOSS、未裝備商城造型、遊戲版本為 v0.85.98。素材下載失敗時會保留原戰牛，使用既有素材重試／更新入口即可；不要清除玩家存檔。

## 模組與 API

```text
HeroEvolutionSystem（既有購買／試煉／勝利／存檔）
 ├─ trialAppearance=fire-demon → EvolutionTrialArt → 既有火焰惡魔圖集
 ├─ bossAspect=flame → EnemyCombatSystem → 1.1 秒熔火爆發預警
 └─ hero.evolution.rank → BullWargodArt
                          ├─ 商城造型：原付費圖集
                          └─ 預設造型：BullEvolutionAtlas → 覺醒／超凡 PNG
```

- `BullEvolutionAtlas[1|2]`：`path / width / height / visible / worldHeight / frames`。每格是 `[sourceX, sourceY, width, height, footX, footY]`。資料唯讀。
- `ArtSystem.preloadBullEvolution(rank)`：預載指定階段，可回傳載入中的圖片；不阻止開局。
- `ArtSystem.drawBullEvolution(ctx, hero)`：只處理無商城造型的進化戰牛，成功回傳 true；未進化、載入中或失敗回傳 false，由既有戰牛圖接手。
- `EvolutionTrialArt.draw(art, ctx, monster)`：僅處理 `evolutionTrial && trialAppearance === 'fire-demon'`，否則 false。
- 新試煉的 `abilityLabel` 為「熔火爆發」；一般 BOSS 未提供此欄位仍顯示原名。
- 沒有新增伺服器、HTTP API、資料庫、帳號權限或儲存欄位。沿用章節檢查點 schema 1 與 `evolution.rank`，新外觀會套用既有已進化戰牛存檔。

## 素材與驗收規則

- `assets/td/evolution/bull-awakened-actions-v1.png`：1024×1536，20 個姿勢。
- `assets/td/evolution/bull-transcendent-actions-v1.png`：1122×1402，20 個姿勢。
- 姿勢列：待機、移動、攻擊、施法、受擊，每列 4 格。超凡施法採用可清楚辨認武器的來源第 0、2、3、0 格；第 1 格不投入實際施法循環。受擊列不是新增死亡動畫。
- 不強制等分格：原稿有不等距姿勢，使用 Alpha 量測矩形與腳底錨點。每格外擴 3 個來源像素保留抗鋸齒；alpha 小於 48 的少量邊緣殘留不視為實體輪廓。
- 顯示可見高度為覺醒 102、超凡 106 世界像素，脚底固定在英雄 y+16。沒有靠縮小角色隱藏越格。
- 透明背景、每格非空、四邊無實體截斷、沒有遺漏肢體／武器元件，皆由像素測試驗證。真實瀏覽器另外檢查左右鏡像、所有動作、滿階武器與元素核心。
- 不於動畫每幀掃描像素；圖集快取重用，繪圖時只選矩形並呼叫 drawImage。新增兩張 PNG，沒有每幀產生圖片或讀回 Canvas 像素。
- 素材使用內建 image_gen 製作，提示詞與修正紀錄見 [完整提示詞](HERO_EVOLUTION_ART_PROMPTS.json)。原圖未由腳本加工，廢棄版本不隨站點部署。

## 安裝、設定、部署與管理

不需安裝新程式或玩家依賴。沿用專案的 Node 18+，執行 `npm run serve:test`，開啟伺服器輸出的 `td.html` 網址。直接開啟 td.html 亦沿用既有離線支援。管理者無需手動更改玩家鑽石、勳章、等級或解鎖狀態。

新增 JS 在 td.html 依序載入，兩張 PNG 與 JS 已加入 sw.js。部署前執行 `npm run check:site`，再按既有部署手冊發佈完整站點；不能只上傳 PNG。更新入口、主畫面、戰報及 Service Worker 都使用 v0.85.98。不要手工刪除 localStorage 來更新素材。

## 備份與還原

部署前依 [備份還原手冊](BACKUP_RESTORE.md) 備份玩家資料與目前完整部署目錄。需要退回舊版時，在獨立目錄還原那份完整版本，再部署整個目錄；不要在含其他未提交劇情修改的工作區使用 reset 或 checkout 覆蓋。

本版不改存檔格式，還原 v0.85.97 程式仍可讀取等級、進化階段與裝備。若沒有 v0.85.97 完整備份，不應宣稱能精確重建該未提交狀態；先保存目前工作區再選擇已知完整發佈版本。

## 測試與交付

```sh
npm run test:evolution-art
npm run test:evolution
npm test
npm run check:evolution
npm run check:site
npm run qa:evolution-art
npm run qa:evolution-stone
```

瀏覽器 QA 使用既有 Playwright 與 Edge，無新增 npm 依賴；環境若不是預設 Node 模組路徑，使用本機既有 NODE_PATH 設定，不把開發者絕對路徑寫入專案。

- 專項：18 項通過（含新測試 8 項）。
- 全套：1,155 項通過。
- 真實瀏覽器：1280×800 與 852×393，兩階買石、生成火焰惡魔、實際擊殺回呼、Lv.0 存檔、無橫向溢出、無頁面例外。
- 畫面證據：`artifacts/evolution-art/bull-evolution-in-game.png`、兩張動作檢視圖、4 張試煉與 4 張成功畫面，及 report.json。
- 這些流程使用加速波次測試配置；不宣稱已完成每個英雄的完整難度平衡或實機 iPhone 效能驗收。

尚未處理：其他英雄的全新進化動作圖、付費造型的專屬進化版、額外火焰技能、GitHub 發佈。
