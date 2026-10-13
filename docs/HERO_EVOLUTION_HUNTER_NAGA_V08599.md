# 王國／娜迦進化造型 v0.85.99

2026-10-13。本機完成，未提交、未上傳 GitHub。這一批僅包含王國雷恩、娜迦賽洛的覺醒與超凡；加上既有戰牛，目前三名英雄有專用進化動作圖，其餘八名未重製。

## 產品規劃與 UX

目標是打贏進化試煉後，角色本體出現可辨識的變化，不再只靠浮空徽記或幾何肩甲。雷恩覺醒為白毛披肩、青綠獵裝與銀弓，超凡為露面銀金誓約甲與大型戰弓；賽洛覺醒為青鱗潮衛與斜持潮戟，超凡為深海銀金甲、珍珠胸飾與大型潮鰭。

設計保留英雄戰鬥身分（雷恩仍為弓手，娜迦仍為蛇尾持戟者），不改軍團自由搭配。雷恩選角肖像原本拿劍盾，與弓手實戰不一致；本批沒有擴大修改既有肖像。新造型以實戰設定為準。

順序為角色辨識 → 產圖與修稿 → Alpha／切格驗證 → 共用渲染 → 進化／商城／存檔回歸 → 桌面與手機尺寸 QA。曾退回過於接近原貌的雷恩稿與武器靠近邊緣的娜迦稿；成品未以縮小戰場人物掩蓋截圖。

## 玩家操作與 FAQ

1. 選擇雷恩或賽洛，使用任意軍團開始遠征。
2. 通過第 20 波後，用 3 枚首領勳章購買進化石；清場、英雄存活時自動召喚火焰惡魔。
3. 打贏才進化為覺醒，等級與經驗歸 0、裝備保留；失敗保留石頭，復活後免費重試。
4. 通過第 50 波後，以 5 枚勳章購石並擊敗第二階試煉，切換超凡。
5. 既有進化存檔不必重打：讀取後依儲存的階段顯示新造型。

買石價格、BOSS、試煉難度、技能、同等級能力增益均沿用既有規則，並非本版新增。沒有贈送鑽石、解鎖英雄或修改玩家帳號。

**為何沒有看到新外觀？** 先確認版本為 v0.85.99、真的擊敗試煉，而不只是買石。已裝備的商城造型優先，取消裝備後才顯示預設進化造型；付費造型本身未新增覺醒／超凡圖。載圖中或失敗會顯示原角色，請用既有更新／素材重試入口，不要刪除存檔。

**武器升級還有效嗎？** 初始武器與三階升級的購買、傷害、箭跡、連鎖、濺射及攻擊光痕保留。進化圖內的弓／戟屬於該階整套角色，不另外在上面重疊第二把職業武器；裝備軍械仍沿用原本的道具疊圖。這一批沒有逐一重畫每種武器等級與進化階的排列組合。

## 架構、資料與 API

```text
既有 evolution.rank／章節存檔（schema 1 不變）
  └─ ArtSystem.drawHero
       ├─ 已裝備商城造型 → 既有 CosmeticArt／CrossworldSkinArt
       ├─ 雷恩／賽洛進化 → HeroEvolutionSpriteAtlas → 4 張 PNG
       │                    └─ HeroEvolutionSpriteArt（腳底錨點、左右鏡像）
       └─ 未進化／新圖未就緒 → 原角色渲染器
HeroEvolutionPresentation → 保留施法、進化瞬間與狀態特效；不再畫兩人的舊徽記／幾何披甲
Hero.draw → 保留裝備攻擊光痕與地面階段光環
```

- `src/td/systems/HeroEvolutionSpriteAtlas.js`：唯讀 `hunter|naga → 1|2 → path,width,height,visible,worldHeight,frames`。每格 `[x,y,w,h,footX,footY]`；不是強制等分格。
- `ArtSystem.preloadHeroEvolution(type,rank)`：回傳快取圖片，不支援的角色／階段回傳 null。coreStatus 背景預載，試煉開始再次確保載入，不列為開局必要資產。
- `ArtSystem.drawHeroEvolutionSprite(ctx,hero)`：符合角色、階段、無付費造型且圖片 ready 才回傳 true。失敗／載入中回傳 false，原渲染器接手；try/finally 保證變換復原。
- `failedAssets/retryFailed` 納入本批圖片。載入後重用同一張 Image，每幀不掃描像素或建立離屏圖片。
- 無新增 HTTP API、資料庫、帳號權限、後端服務或玩家存檔欄位。沒有新增設定步驟。

## 素材製作與邊界

內建 image_gen 生成並修稿，真透明背景；原始 PNG 直接複製，沒有腳本改圖。完整提示詞／來源矩形見 [素材紀錄](HERO_EVOLUTION_HUNTER_NAGA_PROMPTS.json)。正式檔案在 `assets/td/evolution/`：

- `hunter-awakened-actions-v1.png`
- `hunter-transcendent-actions-v1.png`
- `naga-awakened-actions-v1.png`
- `naga-transcendent-actions-v1.png`

每張 1254×1254、16 姿勢，列序為待機／移動／攻擊／施法。娜迦既有施法時間仍使用第 0–2 格，未改動畫計時或技能機制；第 3 格是收勢備用。受擊回到待機本體並沿用受傷閃光；死亡沿用既有復活倒數，不冒充新增死亡動畫。

Alpha >= 48 視為實體，逐姿勢外擴 3 像素保留抗鋸齒。64 格均有真透明空間，矩形邊界无實體裁切、矩形外沒有遺漏實體像素。脚底錨點取下段身體範圍，娜迦超凡 visible 使用不包含高舉武器的本體高度以免本體縮小。雷恩兩階本體高度 82／86，娜迦 100／104 世界像素。

## 安裝、部署、管理與回復

無新依賴、無須安裝其他軟體。沿用 [安裝手冊](INSTALLATION.md) 的 Node 環境與 `npm run serve:test`，開啟輸出的網址再進入 td.html；直接開啟 td.html 亦可測試。管理者不需改存檔或重新發放進化石。

td.html 在商城造型模組後載入兩個新 JS，sw.js 加入兩個 JS 及四張 PNG；各版本入口統一為 v0.85.99。新增 PNG 約 7.6 MB（十進位），使用既有離線快取策略。部署須依 [部署手冊](DEPLOYMENT.md) 整包發布，勿只換圖或只換 HTML；更新後先驗證版本、圖片與讀檔，保留本機資料。

發布前依 [備份還原手冊](BACKUP_RESTORE.md) 保存完整部署目錄與玩家資料。要回復 v0.85.98，須在独立目錄還原那一版完整備份後整包部署；存檔 schema 不變。v0.85.98 尚無獨立提交，沒有完整備份時不可宣稱能精確回復那個未提交工作區，也不可 reset 覆蓋同時存在的劇情修改。

## QA 與交付

```sh
npm run test:evolution-art
npm run check:evolution-sprites
npm run check:evolution
npm run check:site
npm test
npm run qa:evolution-hunter-naga
```

QA 使用本機既有 Playwright／Edge，必要時指定已安裝的 NODE_PATH；不要求玩家安裝。結果：專項 24／24、全套 1,161／1,161；語法與站點檔案檢查通過。

瀏覽器驗證兩英雄 × 兩階 × 1280×800／852×393，共 8 組真實購石按鈕、火焰惡魔生成、真實擊殺回呼、消耗石頭、Lv.0 保存及重新讀取。另驗證所有姿勢、左右鏡像、Lv.3 武器與相容軍械、付費造型優先、圖片失敗回退、無頁面例外及橫向溢出。證據位於 `artifacts/evolution-hunter-naga/`，包括對照圖、動作表、成功通知／戰場截圖與 report.json。

限制：使用加速波次配置，不代表完成全部難度平衡、iPhone 真機效能或 Safari 實測。其餘八名英雄、付費造型的進化版、肖像一致化與 GitHub 發布均不在本批交付內。
