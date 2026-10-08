> **後續修補（2026-10-07）：** 線上新圖存在但載入約 15 秒，等待時原介面會空白；現已加入關卡／上一幕底圖、狀態提示與重試，詳見 [慢載修補](STORY_ART_LOADING_FIX_V1.md)。

# 劇情五幕逐幕配圖 v1.0.0（併入 v0.85.85）

## 需求、範圍與風險

玩家指出同一關每張劇情卡共用一張圖，尤其第三章「夜守校準」的「本關目標」仍顯示三人合照。目標是讓畫面隨敘事幕次改變，而不是只替換一張封面。範圍為第一至第四章 16 個可玩關卡及西境預告，共 86 幕；不改文字、戰鬥、解鎖條件或存檔。風險是新增 PNG 傳輸量與 AI 圖像的人物連貫性；以沿用既有合格素材、僅補 11 張缺口及自動測試控制。

## 架構與使用體驗

`src/td/app/StoryCatalog.js` 的 `storyBeatShots[mission.id]` 是唯一配圖來源，每關依「抵達／人物立場／本關目標／眼前選擇／守住之後」順序指定五張不同圖；赤岩關含一張額外尾聲，共六張。新增關卡若漏圖或在關內重複圖，建構資料時會拋出錯誤，不再無聲地回退到第一張。劇情頁仍保留既有橫向舞台、文字漸入、幕次指示、下一幕／返回章節按鈕；使用者不用重新學習。既有 `storyBeatPlans.cardImages` 只留作歷史資料，不再參與渲染。

沒有新增資料庫、HTTP API、權限或存檔欄位。資料流：`storyBeatShots` → `decorateStoryCards` → `StoryCatalog.missions[].storyCards[].image` → 原有劇情畫面。`sw.js` 將新增素材列入資產清單，圖片仍依現有策略按需載入及快取，不會在 Service Worker 安裝時預載所有大圖。首次開啟特定幕次需要連線；本次 11 張圖合計約 28.4 MiB，發布前應留意手機網路與圖片壓縮機會。

## 新增畫面與美術指令

所有畫面均為橫向電影式敘事圖，無文字、UI、水印或新世界觀線索；參照原有角色／場景素材，維持霜原狼族凜、王國雷恩、地精奇克、娜迦賽洛等已定身份。以任務、地點與動作作為生成指令，保存為：

| 章節 | 新圖與指令重點 |
| --- | --- |
| 第二章 | `chapter2-ember-road-rescue-v1.png`：烽火路救援傷員與車隊；`chapter2-stone-circle-escort-v1.png`：護送不露臉的見證者與封存紀錄；`chapter2-red-mesa-convoy-v1.png`：赤岩晨光下守護車隊過橋，不揭露新身份。 |
| 第三章 | `chapter3-white-trace-sample-v1.png`：保存霜痕樣本；`chapter3-echo-yard-receiver-v1.png`：修復接收儀與讀數；`chapter3-crossmark-records-v1.png`：交叉比對相矛盾的紀錄；`chapter3-nightwatch-defense-v1.png`：奇克操作校準台，凜與雷恩分守入口和城牆。 |
| 第四章 | `chapter4-tidegate-readings-v1.png`：潮門首次測讀；`chapter4-brineway-measurements-v1.png`：風暴中兩具儀器獨立量測；`chapter4-reef-records-v1.png`：兩岸資料在暗礁交會；`chapter4-observatory-archive-v1.png`：潮儀台封存原始紀錄。 |

以上路徑均位於 `assets/td/story/`。未新增核心角色、歷史定論或勢力設定；詳見既有 `WORLD_STORY_BIBLE_V1.md` 與 `STORY_VISUAL_CONTINUITY_AND_BEATS_V1.md`。

## QA 與發布

`node --test tests/td-prologue-cinematic.test.js tests/td-story-maps.test.js` 核對 17 組劇情逐幕不重複、檔案存在、橫向 PNG 尺寸及 Worker 清單，並保留人物連貫與禁用舊通用人臉圖檢查。瀏覽器逐幕載入 86 幕，確認沒有圖片或腳本錯誤；第三章「夜守校準」和第四章「潮門外流」的「本關目標」另以實際畫面核對文字、按鈕與新構圖。發布前仍應在實機橫向手機與慢速網路複驗首次載圖。

本機執行結果：`npm test` 997/997、`npm run check` 通過；瀏覽器 86/86 幕圖片載入成功且無頁面腳本錯誤。11 張新增 PNG 未進行有損重壓縮，以保留劇情美術細節；慢網首載風險仍列為發布前驗收項目。

本項素材與敘事資料版本 **v1.0.0** 併入應用 **v0.85.85**。程式、11 張圖片、`sw.js` 與文件應在同一提交及快取版本發布；Pages 線上檔案驗證狀態見 [整合交付](FULL_RELEASE_V08585.md)。實體手機與慢網首載仍待驗。回復須保留前一完整 Git 提交與玩家 JSON，成套還原；不要只回退配圖索引或刪除玩家資料。
