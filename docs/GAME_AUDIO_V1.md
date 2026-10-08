# 遊戲音效完整接線 v1.0.0

> 發布更新（2026-10-08）：本功能已納入 v0.85.88 完整發布組合。以下保留獨立開發時的紀錄；目前版本、1055 項回歸測試及部署／回復流程以 [整合發布](FULL_RELEASE_V08588.md) 為準。

日期：2026-10-08。功能版號：package.json → gameAudioVersion=1.0.0。狀態：本機完成，尚未提交或發布 GitHub Pages。主版號沿用目前工作中的 0.85.88，不宣稱已部署。

## 需求與取捨

原版有英雄普攻、霜原狀態音與共用命中音，但多數技能、塔／士兵的發射、操作提示沒有完整接線。本次以原創 WebAudio 合成補齊，避免下載大型音檔、授權不明的遊戲素材，以及每次命中堆疊聲音。

這是可玩的合成音效版本，不是角色真人配音或錄製交響配樂。已有劇情九種情緒音樂、序章配樂與其獨立開關保留。進化技能沿用英雄／技能槽音色，不宣稱 132 套各自獨立製作的音檔。

## 完成範圍

- 11 位英雄 × Q/W/E/F，共 44 組多層音色；132 個原始、覺醒、超凡施法路徑檢查成功後只觸發一次技能事件。大酋長衝擊波、地精網路大絕、娜迦號令均納入。
- 10 軍團、51 種士兵、50 種塔與塔分支具有效音效設定。以 13 種攻擊材質（刀刃、弓弩、火銃、重砲、冰晶、火焰、雷電、潮水、暗影、自然、巨石、奧術、支援）加軍團與類型音色變化；不是為每兵種錄製獨立音檔。
- 射擊從 Projectile 真正建立時發声，涵蓋延遲動畫與召喚物；同一來源的多彈不重播。沒有投射物的塔技能由 TowerSkillSystem.fire 補接，與投射物共用去重。
- 輔助塔成功收入／折扣等訊號有提示；被動光環不循環轟炸聲音。
- 建造、升級、分支、購買／兌換、出售、裝備、戰利品、點擊、交易失敗、波次、首領、守成、勝敗、英雄受擊／倒下、怪物命中／倒下、城門失血。
- 依地圖 ID 分類風聲、海浪、餘燼、林地四種低音量環境底聲。未識別地圖使用林地預設；不是逐地圖錄製的自然環境音。
- 音效音量、環境聲開關／音量、試聽按鈕與獨立試聽頁；靜音、切到背景與離場停止音源。音效故障不改傷害或冷卻。

## 操作與設定

遊戲選單 → 設定 → 音效混音：調整音效音量、環境聲及環境音量，按「試聽音效」。原有「戰鬥音效」仍是所有新音效的總開關；劇情配樂另由劇情頁控制。預設音效 55%、環境比例 18%，先以低音量試聽。

開啟本機站台的 audio-preview.html 可逐一試聽英雄技能、材質與操作音；頁面有「停止所有聲音」，不修改角色或裝備。試聽頁初始音量 35%。調整試聽音量會保存同一裝置的混音偏好。

QA 另產生 artifacts/game-audio/audition.wav，依序是霜原 Q、地精 F、娜迦 W、戰牛 F、勝利，每段 2 秒。實際順序以 render-report.json 的 order 為準。

## 架構與 API

事件接點 → AudioIntegration → AudioCatalog（純音色資料） → GameAudio（節流、優先權、合成、混音） → WebAudio。舊 FrostlandAudio 入口保留為相容介面，使用同一 AudioContext，不另外疊一套播放器。

| 模組 | 責任 |
| --- | --- |
| src/td/systems/AudioCatalog.js | skill(hero,slot)、attack(actor,shot)、support(actor)、event(name)、ambience(map) |
| src/td/systems/GameAudio.js | play(cue)、projectile(shot)、skill(hero,slot)、event(name)、setVolume(0..1)、sync(game)、stop() |
| src/td/systems/AudioIntegration.js | 成功結果接線、舊音效相容、設定 UI 與生命週期 |
| src/td/audio-preview.js、audio-preview.html | 不涉及戰鬥狀態的試聽頁 |
| tests/td-game-audio.test.js | 覆蓋、去重、故障、靜音及遊戲結果相容性 |
| scripts/qa-game-audio.cjs | Edge 實播、密集要求及 OfflineAudioContext 音訊輸出檢查 |

無後端、無新 API 服務、無資料庫或存檔 schema 變更。偏好保存在 localStorage.heroFrontierAudioMixV1；既有總開關 heroFrontierFrostAudio 保留。讀寫設定失敗使用預設，不影響遊戲進度或權限。

## 效能與安全

一般音效最多 8 個合成聲源，重要技能／警報最多 12 個；重要音效可中止低優先來源，另有至多 1 個環境循環聲源。普通攻擊全域至少間隔 45ms、同一來源至少 80ms，同事件也有間隔。低優先声被略過屬設計，不是缺少音效。

噪音緩衝只建立一次；採私有固定序列，不消耗遊戲的 Math.random。音源結束或例外後斷線回收；混音壓縮器限制疊加峰值。沒有新增逐幀計時器，環境聲在既有 UI 更新時同步。瀏覽器需要玩家操作才啟動聲音；不嘗試繞過自動播放限制。

## 安裝與測試

沿用 Node.js 18+ 與既有靜態 HTTP 站，不新增遊戲套件依賴。開一個 PowerShell：

```powershell
$env:TD_TEST_PORT='4177'
npm run serve:test
```

在另一個終端執行 npm run test:audio、npm run check:audio、npm test、npm run check。瀏覽器驗收需專用 QA 環境提供 Playwright 與 Edge；本機 Codex 環境指令：

```powershell
$env:NODE_PATH='C:\Users\Owner\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
npm run qa:audio
```

已驗收：12 項新測試；73 組真實合成輸出皆非靜音、有限值且未削波；132 個成功施法路徑無重複技能事件。3,600 次密集要求最高 12 個即時音源，靜音後 0 個；該機測試播放排程 CPU 合計約 4.6ms（不是遊戲 FPS 保證）。獨立試聽頁已用 Edge 操作、截圖檢查。

全套 npm test 共 1,055 項通過；npm run check、check:audio、check:site 與 git diff --check 通過。

尚待玩家實際聽感驗收、iPhone Safari 真機與自然 50 波長局；客觀波形通過不代表已完成專業混音聽審。

## 發布、备份與回復

新增三支正式腳本已加 td.html 和 Service Worker，試聽頁與腳本也列入離線資源。verify:pages 已涵蓋試聽入口及其脚本。正式發布仍須統一主版號／SW 快取、跑 check:site、CI 測試及線上 verify:pages；目前未執行 push。

沿用玩家匯出／匯入備份。混音偏好是裝置設定，不在玩家進度中；必要時只重設 heroFrontierAudioMixV1，不清空 localStorage。

緊急回復可停用 td.html 末端 AudioCatalog、GameAudio、AudioIntegration 三個 script 入口，回到原有 FrostlandAudio；Projectile 的可選呼叫在 GameAudio 不存在時不執行。保留其他劇情、介面與部署修改，不整份覆蓋共用檔案。已發布時需另升快取版本並重新驗證。

## FAQ

- 沒聲音：先點畫面、確認戰鬥音效總開關與音量，檢查瀏覽器分頁／裝置靜音；劇情音樂有自己的開關。
- 暫停時海浪還在？本版會隨 UI 更新停環境聲；切回背景立即停止。
- 混戰不是每顆子彈都響？刻意節流並優先保留技能／警報，避免震耳與卡頓。
- 是否包含角色說話？沒有，本次是非語音音效；不冒充真人配音。
- 為何線上還一樣？本次仍是本機修補，未發布到 GitHub Pages。
