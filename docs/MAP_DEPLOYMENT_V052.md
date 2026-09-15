# 地圖構圖與部署體驗 V2 — v0.52.0

## 範圍與設計

在現有 1280×900 銀葉隘口上改善辨識，不建立新遊戲系統。
西側入口／彎道使用較乾的草土；中央折返與城門側使用平整石板；其他區域保留草地。
這些是平地，不是高台、可阻擋的森林或城墙。未加入橋、河道、實體城堡或新地形障礙。
未更改單位 Scale；避免同時改動視覺體型、點選半徑和战鬥距離。
使用 imagegen 生成原創地表 V2，沿用 FrontierTerrain 繪路，沒有把 AI 圖片當成碰撞資料。

## 實作與檔案

- assets/td/frontier-ground-v2.png：新版圖；v1 保留。
- src/td/systems/ArtSystem.js：原 frontierGround 欄位改載 v2，沿用 load／retry；不增加開局必要條件。
- src/td/systems/FrontierTerrain.js：地表／道路紋理靜態快取；建造時的淡紅道路、邊界虛線、三區提示是動態覆層。無新碰撞。
- src/td/maps.js：西側提示從 (325,290) 改到合法 (325,400)；中央改名「中央折返」，避免暗示高台；openingFocus (640,300)。
- src/td/systems/BattlefieldCamera.js：首次取景讀地圖 openingFocus，無資料的原圖仍跟原英雄；拖曳／縮放／跟隨不變。
- src/td/systems/BuildSystem.js：抽出原 canPlaceAt 判定為 placementIssue，canPlaceAt 仍回傳 boolean；另有 placementMessage，不複製判定。
- src/td/TDGame.js：传入既有 build 給地景；無效點擊顯示實際原因。
- tests/td-map.test.js：新增3項測試，擴充快取／提示測試。
- tests/td-ui-flow.test.js：補測試替身 placementMessage；原失敗是替身缺少新讀取方法，非正式遊戲缺方法。
- package.json、sw.js、操作與維護文件同步。

## 不變條件

Path 全節點、1280×900、路長 2017.831375、怪物速度／HP／數量、塔與英雄射程／傷害／經濟、投射物／AoE／Chain、士兵追擊／攔截沿用。
新版無新增障礙，沒有縮減可用部署面積；原圖仍可選。
士兵固定部署、無敵、不攔怪及裝備新規則仍是另階段，未混入。

## 位置覆蓋分析

按每段約1世界單位中點取樣，統計「Lv1攻擊半徑內的道路總長」，不等於DPS、勝率或同時命中數：

| 位置 | 弩塔172射程 | 冰塔150射程 | 火砲142射程 |
| --- | ---: | ---: | ---: |
| 西側彎道 (325,400) | 250 | 198 | 178 |
| 中央折返 (810,355) | 560 | 386 | 349 |
| 城門防線 (1100,640) | 344 | 275 | 243 |

中央可多次接觸相同敵人，西側較早削血，城門負責補漏。中央過強是待實戰驗證的風險，未因本轮美術工作擅自改路或加減傷害。
三區只是建議，不限制玩家在其他合法草地部署，也沒有區域額外buff。

## QA

- 開始前227／227；完成後230／230；npm run check及git diff --check通過。
- 部署判定對照原公式：兩種類型、全地圖16×12間距取樣（12312個點位判定）皆一致，涵蓋已有建物。
- 原四種敵人×1／×2／×3行進時間、道路禁建、路徑進度、座標往返、重開、既有戰鬥案例仍通過。
- 區域中心均能合法放塔／兵；開場英雄與進軍路段在1920×1080、1366×768、845×390的可見位置，單位大小不改。
- 地景靜態快取不因每frame重建；建造覆層不改Path，取消後停止繪製。
- Node Canvas 離線微測量各200次：靜態地景每次約0.56ms，含建造覆層約0.88ms。只代表本機離線繪製成本，不是瀏覽器／手機FPS或完整遊戲效能。
- 瀏覽器：1920×1080和1366×767.5滿幅Canvas無水平溢出；845×390手機模式Drawer約171px、選卡後收合；390×845無水平溢出。
- 本機建造：道路拒絕，240G／5木不變；合法西側弩塔140G／3木；手機選兵後取消仍140G／3木。Console未見error。
- 預覽服務一度隨環境重置而關閉，重新啟動4173後恢復；不是圖片缺檔。
- 內嵌瀏覽器80%縮放的截圖裁切問題仍存在：只能用部分畫面＋DOM幾何驗證，不能宣稱全幅像素QA通過。
- 真機觸控、安全區、Edge、30波勝率、多兵種比例、長時間FPS尚未驗證。

## 預覽與回復

完整地形是直接執行 FrontierTerrain 匯出的渲染圖，不是戰鬥截圖：
C:/Users/Owner/.codex/visualizations/2026/08/29/01a04afe-59e7-7220-9ed7-410949f42784/frontier-map-v052.png

v1圖未刪除；可沿既有ArtSystem欄位回指v1做美術A/B；切回classic使用原圖。
不 reset/discard 多輪未提交內容。沒有commit、push或GitHub發布。

## 圖片生成紀錄

使用內建 image_gen（非CLI）。
編輯目標：assets/td/frontier-ground-v1.png。
生成來源：C:/Users/Owner/.codex/generated_images/01a04afe-59e7-7220-9ed7-410949f42784/exec-907486bd-1e27-4aad-82ee-5d0f1da88385.png
專案最終路徑：C:/Users/Owner/Documents/ChatGPT/飛機小遊戲/assets/td/frontier-ground-v2.png

完整提示詞：

Use case: stylized-concept. Asset: HERO FRONTIER game terrain ground texture V2, landscape ratio 1280:900. Input image is edit target and style reference. Preserve its top-down RTS hand-painted realistic miniature dark-fantasy grass style and lighting, but improve flat ground composition into distinct deployment regions: western left quarter more trampled ochre meadow, upper-middle dark mossy grass, center-right around 63% x / 40% y a modest irregular area of FLUSH ancient slate paving with moss between stones, lower-right around 86% x / 71% y weathered pale courtyard paving fading into meadow, lower-left lush darker open grass. All these are FLAT WALKABLE ground, not raised platforms or circular pads. Keep central 94 percent open unobstructed terrain. Trees and raised rocks ONLY in the outermost 3 percent border; none in interior. Leave left edge at 20% height and right edge at 83% height open for game road entry and exit. No roads or paths: game draws exact road separately. No units, towers, walls, cliffs, water, bridges, buildings, text, UI, grid, circles or boundary lines. Rich natural irregular texture transitions, coherent scale, subtle variation, avoid repetitive flat field; unobtrusive enough to clearly read game units. Do not depict fake routes. Full bleed production terrain texture.

## 下一步，不自動實作

先人工驗收新版地景與鏡頭比例。若要加入真正橋梁、城牆與森林地標，先定義其視覺佔地與現有合法部署區的關係，需批准再改障礙／路線。
中央區覆蓋差異應獨立做實戰A/B，而不是在美術版偷偷平衡。
