# 主線登場六頁與連續漫畫審閱

2026-10-10，漫畫審閱內容版 0.8.0。新增第 13–18 頁彩色漫畫，接續既有 12 頁前導，現在可連續審閱 18 頁。44 頁規劃尚有 26 頁未繪製；王子遇害及後续戰爭仍只在分鏡劇本，並非已完成畫面。圖稿均待作者辨認驗收，未加入正式遊戲、未發布 GitHub。

## 本批故事與美術

| 頁 | 畫面重點 | 不能誤讀的界線 |
| --- | --- | --- |
| 13 | 王子查看商戶排程、壞車輪及卸貨台 | 他在理解問題，不是責怪某族，也未當選共同統治者 |
| 14 | 固定車輪、調整卸貨、交回修繕記錄 | 解決靠多方協作，不是英雄魔法包辦 |
| 15 | 希爾芙送午餐，姐弟在市集旁吃飯 | 公主就是遊戲英雄；王子有親人與日常習慣 |
| 16 | 王子向老王報告，談穩妥交接後的出行 | 老王仍在位，沒有交冠或已出發 |
| 17 | 維菈鑽研資料，被提醒漏回修繕安排後承擔 | 不提前使用禁術，不設定老人失蹤原因，也不把漏辦指向後面戰時通道 |
| 18 | 雷恩保留傷者通道，親衛循使團預留路線通過 | 禁衛與皇族親衛不同，但沒有把所有親衛畫成反派 |

三名英雄逐一對照 HeroRoster 原版 `hero-hunter-selection-v1.png`、`hero-arcanist-selection-v1.png`、`hero-rogue-selection-v1.png`。王子與銀葉王沿用原有候選板，未宣稱作者已定稿。配角不新增正史名字或親属關係，膚色不作族群善惡、時代或禁術代碼。

第 17 頁 v2 去除模型擅加的具名修繕清單；第 18 頁 v2 增加「皇族親衛」身分框並刪除醫療招牌錯字、保留圖示。兩頁初稿均保留。每張 1536×1024、四格彩色，PNG 原圖保留，WebP 品質 94 不縮尺寸。新六張 WebP 合計 3,944,436 bytes；18 張合計 12,540,704 bytes。只預載下一張，不把所有圖一起解碼。

內建 image_gen 製作；完整提示詞、修圖提示詞、原始輸出與採用路徑保存在 `assets/td/concepts/story-comic-v2/main-production-13-18-v1.json`。沒有使用 CLI/API 產圖。

## 閱讀與設定

沿用 Node 18+ 及既有 `npm run serve:test`。PowerShell 在專案根目錄設定 `$env:TD_TEST_PORT='4189'` 後啟動服務；若服務已存在則直接開啟。網頁只綁本機，沒有開放公開伺服器。

審閱地址：`http://127.0.0.1:4189/assets/td/concepts/story-comic-v2/review.html#page=v2-main-13`。這個連結直接從新主線開始；不含 hash 的網址優先使用原有審閱書籤。請透過 HTTP，不直接雙擊 HTML。

上一頁／下一頁、頁目錄、方向鍵、Home／End、放大拖看、逐句文字與全螢幕繼續適用。手機維持橫向；整頁優先看構圖，細字請放大或看逐句。末頁清楚標示尚未畫出的頁數，不稱全篇完成。

若已開著舊審閱頁，重新整理一次載入新閱讀器及目錄。不要刪存檔。舊前導書籤 `v2-prologue-NN` 保留；新增 `v2-main-NN` 使用同一獨立 key `hf-story-v2-review-bookmark`，與玩家通關無關。指定 hash 只接受目錄存在的 id，錯誤 hash 不執行、不寫入網址。

## 架構與資料契約

```text
前導 production 清單 ─┐
主線 production 清單 ─┴→ prepare-review.cjs → 18張 review/*.webp
前導 prologue-catalog（保留）＋主線資料 → review-catalog.json → review.html
                                                               ↓
                                               作者辨認 → 未來正式整合
```

審閱器改讀 `review-catalog.json`，原 `prologue-catalog.json` 保留作前 12 頁快照。總規劃 plannedPages=44；pages 必須從 1 開始連續，不能缺頁、重複或讓頁號和檔名不符。每頁沿用 id/title/era/image/text/reviewStatus，可加 storyPage 與 group。

圖路徑只允許 `review/prologue-01..12.webp`、`review/main-13..44.webp`。禁止外部 URL、越界檔名與 query；DOM 用 textContent。不新增資料庫、雲端 API、登入或玩家權限，也不引入正式遊戲模組。內容讀取失敗可重試，圖片失敗仍可用逐句或翻頁；儲存、全螢幕權限拒絕可正常降級。

## 重建與維護

一般閱讀不需要額外套件。重建副本需 Node 可解析 sharp，瀏覽器 QA 需 Playwright 與 Edge；可使用已配置工作區依賴，未配置環境請先在独立工具環境安裝並設定 NODE_PATH，不把個人快取路徑寫成所有人的安裝位置。

```powershell
npm run prepare:story-review
npm run test:story-review
npm run qa:story-review
npm test
```

QA 預設服務 4189，其他埠用 STORY_V2_REVIEW_QA_URL 指定。之後新增批次時，增加 production 清單及轉圖來源，接到 review-catalog 的下一個連續頁；逐句依實際圖中氣泡，不直接照搬長劇本。已畫頁數不等於作者核准數，不得自動切換 production 的 userApproved。

## 品質驗收

AI 美術審閱逐頁比對三英雄原圖、王子跨頁、老王外觀、說話者與四格因果；這不是使用者辨認測試，也不是人類專家背書。測試結果、限制與待作者確認事項以本節及 `artifacts/story-v2-review/results.json` 為準。

2026-10-10：完整回歸 1,101 項全過；審閱器 8 項與既有敘事 5 項全過。三尺寸皆讀完 18 頁並驗證下列操作及異常情境，零未預期 console error／pageerror。刻意中止請求的網路訊息獨立記錄，不冒稱完全沒有網路錯誤。已目視桌機與手機第 15、18 頁截圖，完整頁面未裁切；手机整頁細字偏小，須放大／逐句閱讀。

- 審閱器回歸涵蓋動態 1–44 頁、序號、路徑白名單、重複與缺頁、舊書籤、hash 注入／錯誤編碼、正式發布排除。
- 瀏覽器檢查 18 頁解碼、12→13 轉場、跳新章、翻頁、逐句、拖曳、續讀、載圖／目錄中止重試、storage／fullscreen 拒絕。
- 測試尺寸為 Edge 1365×900、844×390、667×375；手機模擬不是 iPhone Safari 真機結論。
- 作者仍需遮名字辨認英雄、確認王子與老王候選臉、判斷六頁節奏與對白；未繪主線不列為已驗收。

## 版本部署與回復

新增 `storyReviewVersion: 0.8.0`，保留前導製作 0.7.0、設定 0.6.0；遊戲仍 0.85.95、正式漫畫仍 1.0.0。不改戰鬥、商品、角色或存檔。正式 build 仍排除 concepts，因此本批不會出現在 GitHub Pages；沒有執行 push／部署。

備份主線 PNG v1/v2、production 與 review-catalog、三份審閱器／測試檔及本文。單頁回復只改採用 source，再重建 WebP；不要重置工作區或刪玩家資料。若回復僅前導合集，保留新版讀取器、以 12 個既有頁目錄及 plannedPages=44 產生 review-catalog，即可繼續辨識旧書籤；不存在的主線書籤會回首頁，不改正式進度。

## 下一段

第 19 頁從王子赴公共會所核對日常公務開始，再演出襲擊、救援、封存、疑似術式與傳言變形。先鎖定閱覽室動線、屏風、第一救援者，不能臨時變臉或讓焦紋時間矛盾失去可核對性。不提前畫出真兇徽章，不以維菈招牌技能暗示她犯案。
