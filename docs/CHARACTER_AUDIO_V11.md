# 角色戰鬥音效與語音接入

## 目前版本：v0.85.92／音效 1.4.0

2026-10-09：補齊其餘八名英雄的普攻、命中與 Q/W/E/F，共 48 個動作。全部十一名英雄目前共有 66 個材質動作音效。這批是原創程序合成，不是實物錄音，也沒有新增人物台詞；塔、士兵、怪物、傷害、冷卻、進度均不改。戰牛、地精與娜迦的既有配方、材質保持原樣。本機完成，未提交、推送或部署。

### 產品規劃與音色設計

目標是提高角色辨識度，而非增加播放數量。先補材質庫，再接動作配方及新舊試聽，最後驗證節流與舊音色相容性。沿用現有音效架構，不增資料庫、HTTP API 或新資料夾；不需登入、安裝工具或外部素材服務。音色喜好需玩家聽審，數值測試不能證明已達電影或錄音素材品質。

| 角色 | 音色方向 |
| --- | --- |
| 王國獵手 | 弓弦、木質命中、連射、集結號角 |
| 精靈 | 奧術共鳴、晶體碎裂、寒霜、雷光 |
| 暗影 | 短促刀刃、低沉影霧、連續斬擊 |
| 大酋長 | 木槌、部族戰鼓、號角、烈火；不是人聲戰吼 |
| 霜原 | 冰刃、冰裂、寒風、北境號角 |
| 矮人 | 鍛鐵重擊、爐火、符文、金屬共鳴 |
| 龍脈 | 雷裂、烈焰、刀刃、低沉號角；不是錄製龍吼 |
| 埃及島 | 沙粒摩擦、彎刃、古老金屬、秘術共鳴 |

### 操作、架構與 API

沿用 `npm run serve:test`，在 `http://127.0.0.1:4173/audio-preview.html` 先降低音量，再用「快速前往角色」跳到專屬區塊，試聽普攻／命中或技能新舊比較。「停止所有聲音」立即停止。遊戲內只需開啟戰鬥音效，不需要逐角色設定；人物語音音量仍獨立，只有戰牛提供台詞。

```text
十一名英雄：普攻／命中／成功施法
  → AudioCatalog.character(hero, attack|hit|q|w|e|f)
  → GameAudio（節流、優先度、普通 8／重要 12 聲道上限）
    ├─ 戰牛 → BullAudioMaterials（原樣）
    └─ 其餘十名 → CharacterAudioMaterials（22 材質 × 3 變體）
  → 音效匯流排 → 主輸出
戰牛台詞 → HeroVoice → 本站 WAV → 獨立語音匯流排
```

新增 bow／wood／blade／veil／leaves／crystal／frost／arcane／drum／horn／steel／flame／thunder／sand 十四種材質。每個 context 延遲生成、最多快取 66 個 character buffer，戰牛庫另計；不使用戰鬥 Math.random。`CharacterAudioMaterials.buffer(ctx,name,variant)` 與 `AudioCatalog.character` 的呼叫形式不變，未知材質或動作仍回傳 null；舊技能配方保留於 `AudioCatalog.skill(hero,slot,true)`。每個動作最多四層，護盾／免疫提示與錯誤回收維持原有機制。

### 驗收與試聽產物

- `npm run test:audio`：47 項通過；`npm test`：1,078 項通過。
- `tests/td-roster-audio.test.js` 覆蓋全部 66 個動作、八名新增英雄實際路由、缺少配音時不發請求。`tests/fixtures/td-approved-audio-v13.json` 保存擴充前的配方及 8 kHz 波形 SHA-256；戰牛／地精／娜迦均完全一致。
- `npm run check:audio`、`npm run check:site`（732 個發布檔）通過。
- `npm run qa:audio` 使用既有 Playwright／Edge，伺服器指定 `TD_TEST_PORT=4177`。139 組聲音均非靜音、有限且峰值低於 0.99；3,600 次請求最多 12 個聲道，停止後歸零。五段戰牛配音、降音量及停止功能維持通過；十名非戰牛角色手機試聽按钮與 390px 無橫向溢出通過。
- `artifacts/game-audio/<hero>-audition.wav`：十名非戰牛英雄各有十二秒試聽，順序普攻、命中、Q、W、E、F，每段兩秒。
- `remaining-heroes-audition.wav`：十六秒大絕組曲，順序為獵手、精靈、暗影、大酋長、霜原、矮人、龍脈、埃及島。這些 WAV 從正式合成器輸出，只作試聽，不是遊戲額外載入素材。報告為 `render-report.json`。

尚未完成人耳逐項核可、iPhone 真機／省電模式混音驗收。桌機的短程壓力檢查不能取代長時間手機實玩；本次不宣稱已升級所有塔、士兵或怪物音色。

### 更新、部署、備份與排錯

版本識別同步 0.85.92，`gameAudioVersion=1.4.0`，Service Worker 快取 `sky-strike-v0.85.92`。依部署手冊整包發布程式、HTML、素材與 sw.js；本次沒有執行 GitHub 上傳。玩家不需新增安裝或權限，首次更新需連線，快取完成後材質可離線生成。

更新前保留完整上一版程式與存檔；若已備份 v0.85.91，可整包回復以撤回本批八名英雄而保留前三名音色。不要混用新版 AudioCatalog 與舊材質庫，不要清除網站資料。`artifacts/game-audio` 不納入 Git，需另行備份或重跑 QA 產生。

完全無聲時先確認戰鬥音效開關、音量、頁面是否在前景，並點擊一次解鎖瀏覽器音訊。普攻偶爾被省略是聲道及冷卻保護，不會影響傷害。沒有其他英雄台詞屬預期；本次只製作戰鬥音效。

## 歷史版本：v0.85.91／音效 1.3.0

2026-10-09：地精／娜迦為其他角色音效第一批，本機完成，未提交或部署。只變更這兩名英雄的普攻、命中與 Q/W/E/F，不變更塔、士兵、傷害、冷卻、戰牛材質或已核可配音。其他英雄待後續批次，不宣稱全部完成。本批是原創程序合成材質，不是錄製音效或新增台詞。

### 使用與設計

沿用既有安裝方式，`npm run serve:test` 後開啟 `http://127.0.0.1:4173/audio-preview.html`。新增兩個角色區塊，每個有普攻、命中及舊版／新版 Q/W/E/F；先降低音量再比較。實戰開啟戰鬥音效即可，沒有額外開關、帳號或安裝。

| 角色 | 普攻／命中 | Q | W | E | F |
| --- | --- | --- | --- | --- | --- |
| 地精 | 鉚釘發射與短金屬卡榫 | 改裝齒輪與動力啟動 | 短開閥聲與蒸汽洩壓 | 機偶裝配與啟動 | 全網啟動、卡榫與洩壓爆發 |
| 娜迦 | 破水與濺水 | 突刺破水與浪擊 | 旋流起伏 | 海螺號令與水流 | 浪潮衝擊、回流與號角尾聲 |

地精全網超載是機械增益，不使用導彈連爆代替；娜迦領域只在成功施放時發聲，不會每次傷害跳字持續觸發技能聲。命中音仍受 0.2 秒／低優先度聲道節流，護盾及免疫保留原有提示。

### 架構與 API

`src/td/systems/CharacterAudioMaterials.js` 獨立於戰牛音色庫，提供 rivet／ratchet／steam／motor／splash／current／conch／breaker 八種材質，每種三個變體。`buffer(ctx,name,variant=0)` 每個 AudioContext 首次使用才建立並快取，未知材質回傳 null，不消耗戰鬥 Math.random。各 buffer 峰值正規化至 0.8、首尾淡出，沒有外部素材或授權依賴；約 24 個 buffer 為同一 context 的快取上限。

```text
地精／娜迦普攻、命中、成功施法
  → AudioCatalog.character(hero, action)
  → GameAudio（冷卻／8 至 12 聲道上限／優先度）
  → CharacterAudioMaterials 快取 → 音效匯流排 → 主輸出
戰牛仍使用 BullAudioMaterials；已完成語音仍走 HeroVoice
```

`AudioCatalog.character(hero,action)` 回傳 cue 或 null，action 為 attack／hit／q／w／e／f；bull 委派既有設計。技能舊版比較仍用 `AudioCatalog.skill(hero,slot,true)`。新 layer 的 `materialBank:'character'` 讓 GameAudio 選擇正確庫，不混用或覆寫戰牛材質。新增模組已列入 td.html、audio-preview.html 與離線預快取。沒有資料庫、HTTP API、存檔欄位或額外權限改動。

### QA 與產物

全專案 1,073 項通過，音效專項共 42 項；新增 `tests/td-goblin-naga-audio.test.js` 覆蓋八種材質、三變體快取、有限峰值／首尾、十二種動作、實戰音效路由、護盾免疫與失敗回收。原有測試繼續覆蓋 44 個基礎／88 個進化技能單次接線及傷害／冷卻不受音效影響。

瀏覽器驗收 `npm run qa:audio`（既有 Playwright／Edge，伺服器 TD_TEST_PORT=4177），會額外輸出 `artifacts/game-audio/goblin-audition.wav` 與 `naga-audition.wav`；每檔六段、每段兩秒，順序為普攻、命中、Q、W、E、F。新舊逐句比較在試聽頁。數值／功能 QA 不等於人耳聽審，iPhone 真機、省電模式與戰場混音聽感仍需試玩。

本次 Edge 實測 91 組聲音有限、非靜音且峰值低於 0.99，播放後聲道歸零；3,600 次請求最多 12 個聲道。兩名英雄手機版新大招按鈕可播放、390px 無水平溢出；戰牛五段配音、語音降音量與停止也通過。`check:audio`、`check:site`（732 檔）及 `git diff --check` 通過。

### 更新、維護與回復

遊戲版本 0.85.91、音效 1.3.0、快取 sky-strike-v0.85.91，版本識別點一併更新。遵循部署手冊整包發布，包含新模組及入口清單；本次未 GitHub 推送。初次載入／更新需連線，核心快取完成後音效可離線生成。

維護時修改 AudioCatalog 的動作分層或 CharacterAudioMaterials 的材質，再跑 `npm run test:audio`、`npm run check:audio`、`npm test`、`npm run check:site` 和瀏覽器 QA。回復前備份存檔與整包版本，回復 v0.85.90 的程式、HTML、版本識別和 sw.js，可撤回本批而保留戰牛配音；不能只刪除新模組而留下引用，也不應清除網站存檔。

常見問題：普攻混戰偶爾未發聲是聲道／節流保護，不是攻擊失效；只聽到技能聲沒有地精／娜迦台詞是預期，這批没有人物配音。若完全無聲，先檢查總開關、音效音量、頁面是否在背景及瀏覽器是否已因點擊解鎖音訊。

## 前一版本：v0.85.90／音效 1.2.0

2026-10-08：使用者已確認粗獷 v2 聲線，五段 AI 配音已接入，本機完成、未提交或發布。不是真人錄音，也不是聲音模仿／克隆。以下 1.1.0 章節保留為歷史；其中「待配音」已由本節取代。

### 玩家操作

開啟 `audio-preview.html`，先降低「試聽音量」，往下找到五個人物語音按鈕。選角「這條防線，交給我。」、Q 短促發力聲、W「休想越過！」、E「還沒結束！」、F「接下這一槌！」。選角使用已核可 WAV 的原檔；其餘採同一聲線及後製。Q 用短促「哈」製作發力聲，不會朗讀舞台指示。

試聽頁可連續比較、不受戰鬥冷卻限制，音量滑桿同時控制試聽音效與語音；「停止所有聲音」立即取消。遊戲裡仍維持單句播放、普通台詞至少 12 秒、大招同句 25 秒間隔與大招優先；冷卻可能令剛施放的技能只有音效沒有台詞，屬正常。

在遊戲選單同時開啟「戰鬥音效」及「人物語音」，人物語音滑桿需大於零。進度、裝備、傷害和其他英雄未變；玩家不需安裝程式、模型、外掛或登入外部服務。

### 素材、來源與維護

五段單聲道 24 kHz／16-bit PCM WAV 位於 `assets/audio/voices/bull/`，每段約 1.75–3.29 秒，合計 619,014 bytes（約 605 KiB）。`manifest.json` 記錄台詞、生成參數、後製濾鏡、長度及 SHA-256；`provider-rights.json` 記錄網站商用聲明與條款位置。供應商為 Voice-Generator.com，聲線 zm_yunjian、速度 0.9；經降三個半音、平行飽和及低頻共鳴處理。上線前仍須複核供應商權利聲明，不能把網站聲明當作第三方權利保證。

來源：[中文生成頁](https://voice-generator.com/text-to-speech/chinese)、[條款](https://voice-generator.com/terms)。製作使用其公開頁面原有免登入雲端介面，沒有安裝新工具；遊戲執行只讀取本地 WAV，不接觸該服務。

製作原始檔在 `artifacts/voice-audition/`，此目錄被 Git 忽略，需另行備份。`node scripts/prepare-bull-voice.cjs` 預設離線，重用既有檔案、不覆蓋已存在 WAV，輸出來源清單；必須已有原始檔及 FFmpeg／ffprobe（這次使用電腦原有工具）。只有明確加上 `--generate-online` 才生成缺少的原始音檔；不登入、不自動安裝、不繞過限流或授權錯誤。選角核可檔需另外保留 `bull-select-rough-v2.wav`，不能默默重新生成取代。

### 介面與架構增量

`HeroVoice.play(hero,slot,{preview:false})` 新增可選 preview。預設完全保留戰鬥限制；只有試聽 UI 傳入 true，略過冷卻且不寫入戰鬥冷卻紀錄，仍遵守靜音、背景、裝置狀態及非同步取消保護。尚無素材的英雄回傳 false。

```text
製作（只在開發時）：免登入網頁服務 → 原始 MP3 → 原有 FFmpeg 後製 → WAV + manifest
執行：選角／技能 → HeroVoice → 本站 WAV／離線快取 → 獨立音量 → 主輸出
試聽：按鈕 → 同一 HeroVoice（preview 模式）→ 同一 WAV
```

### QA、更新與回復

音效專項 37 項、全專案 1,068 項通過。新增 WAV 格式／長度／音量峰值／雜湊／Service Worker 納入及試聽不污染戰鬥冷卻的測試；五檔均可解碼、非靜音、峰值低於 0.82。Edge 實際載入全部五段、連續切換六次含重播選角、停止與 390px 手機試聽佈局通過；另有 79 組既有音效渲染檢查。報告在 `artifacts/game-audio/render-report.json`。音色方向由使用者確認選角樣本，其餘台詞及 iPhone 真機聽感可繼續微調，不宣稱已人工聽審全部內容。

發布需整包包含五 WAV、manifest／來源聲明、程式及新版 Service Worker；主版號與更新頁、存檔標記、戰報／大廳同步 0.85.90，快取 sky-strike-v0.85.90，音效版號 1.2.0。沒有存檔結構改動，無新資料庫或權限。五 WAV 預快取後可離線，首次載入／更新仍需連線。

更新前備份存檔、程式與聲音來源；若需回復，回到上一個完整版本包（含版本識別與 sw.js），不要混用舊程式及新版配音目錄清單，不刪除網站資料。只想停用配音可在設定關閉人物語音；不需要回復程式。

## 歷史紀錄：音效 1.1.0（下文並非目前素材狀態）

2026-10-08 · 遊戲 v0.85.89 · gameAudioVersion 1.1.0 · 本機修改，未提交／推送／部署。

## 產品範圍與交付狀態

目標是讓戰牛的聲音更有武器重量與角色辨識度。先完成一名角色供玩家比較，再決定其他英雄方向。本次不改玩法、傷害、掉落、商店或劇情；不加入新英雄。

已完成：普攻揮槌、命中與 Q/W/E/F 的原創程序合成材質音效；獨立語音播放介面；設定及新舊試聽頁。聲音由揮動、鐵器共鳴、重擊、碎石、低頻壓力和蓄力六種材質組成，每種有三個快取變體。

尚未完成：人物實際錄音與主觀聽感定稿。目前所有語音 src 為 null，UI 明確標示「待配音」，不會請求假檔案、不使用瀏覽器機械朗讀，也不把合成音效宣稱成真人／錄製素材。後續需要交付可合法使用的聲音錄音；本次未呼叫付費配音服務。

## 使用與安裝

1. 使用 Node.js 18 以上，在專案根目錄執行 `npm run serve:test`。
2. 開啟 `http://127.0.0.1:4173/audio-preview.html`，先把音量調低。
3. 試聽「新版：揮槌／命中」，再逐對比較舊版與新版 Q、W、E、F。停止按鈕及切到背景都會取消播放。
4. 進入遊戲，選戰牛並開啟戰鬥音效。遊戲選單 → 設定有獨立人物語音音量／開關；目前沒有錄音，因此不會有人聲。

音效音量設為零不會關閉未來的人物語音；戰鬥音效總開關關閉則兩者都停止。劇情音樂維持自己的開關。試聽不更動角色進度。

## 架構與資料

```text
普攻／命中／技能事件 → AudioIntegration → AudioCatalog
                                           ↓
                          GameAudio ← BullAudioMaterials（依音訊 context 快取）
                              ↓
                         音效增益匯流排 ───┐
                                         ├→ 共用主增益／壓縮器 → 裝置
選角／技能 → HeroVoice → 語音增益 ─────────┘
```

- `src/td/systems/BullAudioMaterials.js`：六種材質、三種變體，獨立種子亂數，不消耗戰鬥 Math.random；首次使用建立 buffer，後續重用。
- `src/td/systems/HeroVoice.js`：語音台詞／本地路徑、非同步解碼快取、單一播放、取消票號及冷卻。
- `AudioCatalog.js`：戰牛攻擊和技能層配置；其他英雄保持原樣。
- `AudioIntegration.js`：既有戰鬥事件接線、選角及 UI；音效錯誤不更動原動作結果。
- `src/td/audio-preview.js` 與 `audio-preview.html`：對照試聽和素材狀態。
- 無伺服器、資料庫或新增權限。`heroFrontierVoiceV1` 僅存語音 volume／enabled；原存檔及鑽石不變。

## 前端 API 與配音規格

`BullAudioMaterials.buffer(ctx, name, variant=0)` 回傳 AudioBuffer 或未知材質的 null；`warm(ctx)` 可供離線工具預先建立全套。即時播放只建立所需材質。

`AudioCatalog.bull(action)` 的 action 為 attack／hit／q／w／e／f。`AudioCatalog.skill('bull', slot, true)` 僅供比較舊版。

`HeroVoice.play(hero, slot)` 回傳 Promise<boolean>；缺檔、靜音、冷卻、背景或載入失敗回傳 false。`stop()` 取消播放及未完成載入的後續播放；`setVolume(0..1)` 調整並儲存。總音訊開關仍由 FrostlandAudio 管理。

戰牛台詞：選角「這條防線，交給我。」；Q 短促發力低吼；W「休想越過！」；E「還沒結束！」；F「接下這一槌！」。這些只是待製作台詞，不是錄音成果。

實際交付後，把檔案放入 `assets/audio/voices/bull/`，在 catalog 對應 src 填入相對路徑，例如 `assets/audio/voices/bull/select.wav`。檔名限英文字母、數字、底線及連字號；支援 wav／mp3／m4a／ogg，需以目標瀏覽器實際解碼為準。每段最多 2 MiB、8 秒；推薦短句、去除前段靜音、避免爆音，並另保存原始錄音及授權來源。請求 6 秒超時，解碼失败不中斷遊戲。

一次最多一段語音；普通語音共用至少 12 秒間隔，大招優先且同句 25 秒間隔。不排隊重播；大招可中斷一般語音。語音播放時戰鬥音效降至原匯流排的 38%，结束恢復。背景、離開、重設、總靜音或暫停會取消；暫停檢查沿用 updateUi 節奏。

## QA 與重現

- `npm run check:audio`：六支音效腳本語法。
- `npm run test:audio`：35 項通過，含戰牛命中／護盾／免疫接線、音量獨立、靜音、冷卻、競爭載入、離場取消、節點建立失敗回收。
- `npm test`：全專案 1,066 項通過，沒有失敗或跳過。
- `npm run check`、`npm run check:site`：共用程式語法與靜態發布檔案檢查通過；發布清單 724 檔。`git diff --check` 通過。
- 瀏覽器 QA：設定 `TD_TEST_PORT=4177` 執行測試伺服器；另在有 Playwright 與 Edge 的環境執行 `npm run qa:audio`。此 QA 不是遊戲執行必需依賴。
- Edge 實測 79 組聲音樣本為有限、非靜音且峰值小於 0.99；3,600 次請求最高 12 個音效聲道；靜音後歸零。獨立語音設定正常，390px 試聽頁無水平溢出，頁面 JS 錯誤為零。
- 產物在 `artifacts/game-audio/`：`render-report.json`、桌面／手機截圖及 `bull-comparison.wav`。比較音檔每段 2 秒：新揮槌、新命中、舊 Q、新 Q、舊 W、新 W、舊 E、新 E、舊 F、新 F。
- 上述為數值／功能驗證，不代表已由人耳認可音色。iPhone 真機、省電模式、來電中斷、耳機與喇叭聽感仍待手動驗收。真人錄音尚不存在，因此實際錄音品質未驗收。

## 版本、部署與回復

主版號同步 package.json、sw.js、update.html、選角／大廳、存檔版本標記及戰報；資料結構沒有改動。音效模組版號由 1.0.0 升為 1.1.0。使用新快取 `sky-strike-v0.85.89`，兩個新模組納入離線核心。

目前沒有執行 GitHub 推送或部署。發布前完成手動聽感確認、`npm run check:site` 和全測試，按既有部署手冊整包發布，不能只上傳單一腳本。日後新增實際語音檔時，還須明確決定是否加到 sw.js 離線預快取；本版不預快取不存在的音檔。

回復前先匯出存檔並保存整個新版目錄／Git 差異；回復上一個完整發布版本（v0.85.88）的程式、版本識別和 Service Worker，按更新頁流程重新載入。不要刪除瀏覽器網站資料來處理聲音問題，以免移除玩家存檔。新語音偏好留在 localStorage 也不影響舊版；勿使用 reset --hard 覆蓋其他未提交工作。

## 常見問題

無聲：先點擊試聽解鎖瀏覽器音訊，檢查裝置音量、戰鬥音效總開關及音效滑桿；不要直接用 file:// 取代本機 HTTP 伺服器測試語音下載。

人物沒有說話：目前是預期行為，尚未交付錄音。加入素材後若無聲，檢查 HTTP 路徑、格式、大小、秒數與冷卻；重複點擊不會堆積語音。

覺得聲音仍不像想要的重量：先在比較頁確認是攻擊、命中或哪個技能，再調整單一材質；不要直接把所有英雄改成同一種重低音。
