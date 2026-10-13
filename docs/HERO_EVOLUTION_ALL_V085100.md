# 全英雄進化外觀 v0.85.100

> 發布更新：2026-10-13 已推送 GitHub 並完成 Pages 部署，提交 30e0e12、標籤 v0.85.100；263 檔／269 次線上內容比對通過。見 [正式發布紀錄](GITHUB_RELEASE_V085100.md)。以下「本機／未上傳」保留為製作當時狀態。

2026-10-13。本機實作，未提交、未推送 GitHub。承接 v0.85.98 戰牛及 v0.85.99 王國／娜迦，本批補完其餘八名英雄；現在全部 11 名英雄都有覺醒與超凡本體動作圖。

## 產品規劃、設計與範圍

需求是「每位英雄進化後都真的改變外觀」，不是再增加浮空徽章。本批保留種族、體型與戰鬥職業，採兩階可辨識的服裝、武器與輪廓；不改技能強度、BOSS 難度、商店價格、掉落、解鎖條件或軍團組合。沒有新英雄、配音或付費造型進化版。

順序：比對既有戰鬥角色 → 每名英雄兩階素材 → 逐格 Alpha 與裁切檢查 → 共用渲染資料 → 進化／商城／存檔回歸 → 實際尺寸目視與手機版驗證 → 文件及版本更新。精靈超凡曾因與覺醒太相似而重製；冰原、龍族及埃及的長武器／披風間距另行修稿。

| 英雄 | 覺醒的主要辨識 | 超凡的主要辨識 |
| --- | --- | --- |
| 森語者・希爾芙 | 翡翠葉紋長袍、銀葉肩甲 | 白銀披肩、深色內袍、藍晶法杖 |
| 影行者・維菈 | 紫黑兜帽、月牙雙匕 | 露出銀髮、酒紅羽肩、分叉長披風 |
| 大酋長・戈爾 | 骨飾鐵甲、雙刃戰斧 | 黑金重甲、獠牙肩甲、赤紅披風 |
| 銅齒・奇克 | 銅鋼工裝、雙筒能源背包 | 黃銅外骨骼、橘紅核心、重型工具 |
| 霜牙・凜 | 銀甲、白毛披肩、冰晶長槍 | 深藍銀甲、冰晶肩甲、長毛披風 |
| 符石監軍・巴隆 | 銀鋼符文甲、青綠符錘 | 黑金堡壘甲、赤紅披風、熔鑄符錘 |
| 蒼穹使者・賽爾 | 銀藍鱗甲、折翼、晶槍 | 金白甲、深藍袍、金飾長槍 |
| 曦陽守衛・納芙拉 | 白金披袍、青金胸甲、彎刀 | 黑金甲、金羽肩飾、赤紅披風 |
| 守誓者・雷恩 | 沿用 v0.85.99 白毛披肩銀弓 | 沿用銀金誓約甲戰弓 |
| 破潮者・賽洛 | 沿用 v0.85.99 青鱗潮戟 | 沿用深海銀金甲潮鰭 |
| 戰神・奧魯姆 | 沿用 v0.85.98 毛皮鍛甲 | 沿用戰神重甲 |

英雄以實際戰鬥設定為準，既有選角肖像未擴大重畫。地精核心／進化狀態文字由 y+36 移至 y+60，避開 y+29..34 血條和 y+46 英雄標籤；不改能量計算。

## 玩家操作、管理與 FAQ

1. 使用已解鎖的任意英雄開始遠征；管理者沿用既有全英雄權限。
2. 通過第 20 波後，以 3 枚首領勳章購買进化石。清場且英雄存活時召喚火焰惡魔。
3. 打贏才覺醒：等級與經驗歸 0，裝備保留，同等級能力優於未進化；失敗保留石頭，可免費重試。
4. 通過第 50 波後，以 5 枚勳章購買第二階石並通過試煉，獲得超凡外觀。
5. 既有進化存檔讀取後自動套用，不必重新購石或重打。

以上進度／數值均為沿用規則。本批不修改玩家帳號、貨幣、英雄擁有權或存檔 schema。

**為何買石後沒換造型？** 買石不是直接進化，必須擊敗試煉。已裝備的商城造型優先，取消装備後才顯示預設進化造型。請核對本機版本 v0.85.100；GitHub 線上版尚未更新。

**為何短暫看見原造型？** 新圖尚在載入或失敗時回退原渲染，角色不消失、不阻止開局。使用既有更新／素材重試入口；不要清除存檔。

**武器、軍械還有效嗎？** 三階武器的價格、能力、投射物／攻擊光痕保留；軍械相容、道具疊圖及效果不變。進化本體包含固定繪製的該階武器，不在其上另疊一把職業武器；未新增「每種武器等級 × 每種進化」全排列貼圖。

## 架構、資料夾及 API

```text
購石 → 既有 HeroEvolutionSystem 火焰惡魔試煉
       → 勝利更新 evolution.rank、Lv.0 與章節存檔
       → ArtSystem.drawHero
           ├─ 已裝備商城造型 → 原商城造型渲染
           ├─ 戰牛進化 → BullEvolutionAtlas（2 張）
           ├─ 其餘十英雄進化 → HeroEvolutionSpriteAtlas（20 張）
           │                   └─ HeroEvolutionSpriteArt
           └─ 初始／圖未就緒 → 原角色渲染
Hero.draw → 裝備光痕、血條、地面階段圈
HeroEvolutionPresentation → 施法、變身、狀態文字；全部英雄停用舊浮空徽記／幾何披甲
```

- `assets/td/evolution/`：本批新增八英雄 × 兩階共 16 張 PNG、256 個姿勢；加上既有 6 張，總共 22 張、360 個來源姿勢（戰牛含受擊列）。
- `HeroEvolutionSpriteAtlas.js`：新增 arcanist、rogue、chief、goblin、frostland、dwarf、dragonkin、egypt；唯讀 rank 1/2 的 path、width、height、visible、worldHeight、frames。
- 逐格資料 `[x,y,w,h,footX,footY]`；每張 1254×1254、4×4 概念布局，以實測矩形切圖，不強制等分。列序待機／移動／攻擊／施法。
- `ArtSystem.preloadHeroEvolution(type,rank)` 回傳快取 Image；不支援回 null。`drawHeroEvolutionSprite(ctx,hero)` 成功繪圖回 true，商城造型、未進化、載入失敗等回 false，原渲染接手。
- 初始 coreStatus 背景預載目前英雄兩階，試煉開始確保預載；不是必載關卡資產。`failedAssets/retryFailed` 保留重試路徑。無每幀像素掃描或重新建立圖集。
- 受擊沿用原閃光；死亡沿用復活倒數。本批八名未新增死亡動作，也未改動畫時序。
- `scripts/inspect-evolution-atlas.cjs` 是唯讀量測工具，輸出 JSON，不編輯 PNG。`tests/td-evolution-hunter-naga.test.js` 保留既有檔名，但已擴展驗證全部十名共用圖集英雄。
- 無新資料庫、HTTP API、後端、網路金鑰、玩家存檔欄位或權限設定。軍械與商城購買流程仍為原模組。

素材使用內建 image_gen 生成與修稿，生成原檔直接複製，未以脚本改圖。完整提示詞、來源檔及逐格量測見 [製作紀錄](HERO_EVOLUTION_ALL_PROMPTS.json)。Alpha ≥48 視為實體，矩形外擴 3 像素；全部 320 共用圖集姿勢驗證邊界不切實體、無遺漏實體像素。允許極低 Alpha 邊緣殘值，並用實際深色背景目視複核。

## 安裝、設定、更新與回復

遊戲無新安裝項目，不需要登入素材網站。沿用 Node 18+：

```sh
npm run serve:test
```

開啟 http://127.0.0.1:4173/td.html。新玩家依 [安裝手冊](INSTALLATION.md) 建立原有環境即可；本批無額外設定。

版本入口、ProfileStore、戰報與 service worker 均為 0.85.100。新增 PNG 共 **27,014,275 bytes（27.0 MB）**，已列入離線快取；首次更新可能較久，不改既有快取策略。正式部署依 [部署手冊](DEPLOYMENT.md) 整包發布，勿只換 HTML 或單張圖。靜態發佈檢查含 821 檔；尚未上傳 GitHub。

發布前依 [備份還原手冊](BACKUP_RESTORE.md) 保存完整版本目錄，從管理頁匯出玩家存檔。回復必須使用獨立目錄中的上一版完整備份，整包驗證、部署，不要清除玩家資料。schema 1 不變。v0.85.99 沒有獨立 Git 提交；沒有事先完整備份時，不能宣稱可精確回復那個未提交工作區。請勿 reset 覆蓋並存的劇情修改。

另提供本次九個執行檔的範圍限定回退覆蓋檔：`artifacts/evolution-all/rollback-runtime-v08599/`。依其中 README 先備份、在獨立副本驗證再整包部署，可回到上一批三名英雄專用進化圖的執行狀態；不刪除新 PNG 或存檔。它是本次變更的反向重建，不是完整原始碼快照，也不回退新版測試／文件；日後若修改相同檔案須先比對。

## QA 與交付清單

```sh
npm run test:evolution-art
npm run check:evolution-sprites
npm run check:evolution
npm run check:site
npm test
npm run qa:evolution-all
```

瀏覽器 QA 沿用已有 Playwright 與 Microsoft Edge；玩家不需安裝它們。可指定 `EVOLUTION_QA_URL=http://127.0.0.1:4173/td.html`，未指定時使用本機 file URL。依本機既有環境設定 NODE_PATH，不將機器路徑寫入程式。

- 全套測試 **1,163／1,163** 通過；進化美術專項含全英雄覆蓋與血條避讓。語法、站點檔案與 diff 空白檢查通過。
- 使用隔離瀏覽器管理者 fixture，且逐次斷言实际 classType／profession：全部 11 英雄 × 两階 × 1280×800／852×393，共 44 組真購石按鈕、火焰惡魔生成、真實擊殺回呼、石頭消耗、Lv.0、存檔及讀檔。
- 初始／覺醒／超凡同倍率比較，旁放王國獵手檢查英雄與士兵比例；每名英雄兩階完整動作／左右鏡像／Lv.3 武器與相容軍械疊圖；所有新增姿勢均目視。
- 11 英雄圖片失敗回退、8 套既有可選商城造型優先；無頁面 JS 例外、無橫向溢出。單元測試同時覆蓋其他英雄的造型優先判斷。
- 截圖及 report.json：`artifacts/evolution-all/`（不部署測試帳號或瀏覽器資料）。
- 驗收使用加速波次與高傷害試煉擊殺，不代表完整難度平衡；尚未做 iPhone 真機、Safari、低階手機記憶體與離線首次下載實测。這些仍是上線前檢查項，不宣稱由桌面手機尺寸模擬替代。

本機實際造型對照：[精靈](../artifacts/evolution-all/arcanist-in-game.png)、[暗影](../artifacts/evolution-all/rogue-in-game.png)、[酋長](../artifacts/evolution-all/chief-in-game.png)、[地精](../artifacts/evolution-all/goblin-in-game.png)、[冰原](../artifacts/evolution-all/frostland-in-game.png)、[矮人](../artifacts/evolution-all/dwarf-in-game.png)、[龍族](../artifacts/evolution-all/dragonkin-in-game.png)、[埃及](../artifacts/evolution-all/egypt-in-game.png)。若是新 clone，執行 QA 可重新產生。
