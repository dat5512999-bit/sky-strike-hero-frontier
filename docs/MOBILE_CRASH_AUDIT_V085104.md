# iPhone 桌面捷徑當機評估 · v0.85.104

後續修正：2026-11-10 已依本報告完成 [v0.85.105 程式與驗收](MOBILE_STABILITY_V085105.md)，仍待實體 iPhone 複驗。後續初期測試曾覆寫 artifacts/mobile-crash-audit/report.json；原 v104 保留證據以 first-probe-report.json 及 console.txt 為準，首輪提前結束限制見本文末段；不再把該 report.json 當成 v104 完整壓測證據。v105 正式證據另存 artifacts/mobile-stability-v085105。本報告下方保留原調查時點判定。

日期：2026-11-10（台灣）。本輪為調查與方案交付，沒有改正式遊戲程式、遊戲規則、存檔、版本或部署，也未推送 GitHub。診斷腳本僅存於被 Git 忽略的 artifacts/mobile-crash-audit。工作區原有 v101–104 未提交變更保持原樣。

## 判定與產品範圍

使用者回報手機玩一陣子會當掉，觸發情境不記得，已確認使用「iPhone／桌面捷徑」。目前尚未知型號、iOS 版本、當時遊戲版本，以及症狀是畫面停止、重新載入或退回桌面。這些未知事項不阻礙檢查共用程式。

結論：確認大量非必要的啟動圖片／縮圖工作，以及一次縮圖 Canvas 建立失敗即可停止遊戲迴圈的缺口。前者是手機記憶體壓力的重要嫌疑；後者已以受控故障重現。尚未取得使用者手機的原始故障／系統日誌，因此不能把它們寫成該次事件的唯一根因，也沒有宣稱已修好。

範圍以使用者正在玩的 HERO FRONTIER 塔防為主：行動入口、iframe、啟動與卡片、英雄／進化技能、場景重開、戰鬥更新、特效／彈體清理、商城、劇情選單、音訊生命週期、儲存、Worker 與既有長局檢查。未逐關人工通關、未驗證所有道具組合；射擊模式不是本輪實戰壓測主體。

## D1–D2：執行環境與證據界限

單一執行者依產品、架構、UI、測試與維護角度調查，沒有虛構獨立 QA 或核准。

- Windows 的既有 Edge／Playwright，隔離瀏覽器資料；不讀使用者正式帳號。沒有安裝軟體。
- 行動設定：852×393、DPR 3、touch、coarse pointer。從 td.html 進入，確實轉到 td-mobile.html，再測實際 td.html?mobileShell=1 子畫面。不是單純縮小桌機畫面。
- CPU 4 倍節流只用於場景與戰鬥壓測；不能當成某一款 iPhone 的效能換算。
- 瀏覽器測試阻擋 Service Worker，避免測試 origin 的快取干擾。Worker 僅作原碼／既有測試檢查，沒有據此宣稱已驗證 iPhone 離線安裝與復原。
- 本機未提供 WebKit 執行檔，沒有為此下載；沒有連接實體 iPhone，也未模擬作業系統直接終止 WebContent。
- 網路工具未成功讀取現有 GitHub Pages 的版本，因此本報告針對本機 v0.85.104；不推定使用者桌面捷徑已更新到相同版本。

## D3：調查圍堵

只在測試資料和本機 HTTP 回應中進行實驗。故障注入及圖片延後載入實驗沒有寫回 src。原有玩家資料、圖片、商品、數值、音效與所有權不受影響。測試結束關閉自建瀏覽器，停止本輪測試伺服器。未建立背景監控。

## D4：發生原因與證據

### 1. 啟動就處理大量當下看不到的美術：已量測，手機故障原因仍待實機確認

ArtSystem.js:4 的建構子呼叫大量 load；load 在第 37 行立即設定 Image.src。第 38–39 行雖有四路佇列，但首次 load 已開始載入，request 看到 loading=true 就返回，所以四路限制沒有管到首次載入。

TDGame.js:260 對所有建造按鈕呼叫 preview；第 261 行在設定傭兵 button.hidden 之前先 preview。ArtSystem.preview 第 63–82 行不檢查目前是否看得到卡片，並為每個成功預覽保留 384×384 source canvas。這使未選軍團、隱藏抽屜和沒開過的傭兵也建立圖片與畫布。

實際行動入口樣本（report.json）：

| 時點 | 不同 Image 圖片完成載入 | 預覽快取 | 快取 source 畫布像素容量 |
| --- | ---: | ---: | ---: |
| 初始大廳 | 117 | 111 | 65,470,464 bytes（約 62.4 MiB） |
| 初次戰鬥 | 119 | 111 | 同上 |
| 切換場景及壓測後 | 142 | 111 | 同上 |

另有約 151 個 DOM Canvas，初始樣本其像素容量約 16.4 MiB。這不包含上表快取裡未插入 DOM 的 source canvas。

把不同圖片的原始寬×高×4 相加，大廳約 703.5 MiB、最後約 853.7 MiB。這是「若各原圖以完整 RGBA 展開」的規模估算，**不是實測 RAM、GPU 記憶體或 iPhone 駐留量**：瀏覽器可能延後解碼、丟棄解碼快取、縮放儲存或共用資源。圖片下載大小、JS heap 和圖片展開規模也不是同一指標；不能直接把它們相加宣稱手機用了多少 RAM。

同一瀏覽器的受控 A/B（loading-comparison.json）：僅透過 route 回應替換，將 load 改成延後且同路徑共用、preview 只處理有排版矩形的卡片。沒有壓縮、重畫或移除遊戲內容。

| 同一入口與時點 | 原程式 | 診斷實驗 |
| --- | ---: | ---: |
| 初次戰鬥不同圖片 | 119 | 24 |
| 其完整 RGBA 規模估算 | 750,244,748 bytes | 150,969,556 bytes |
| 尚未開啟建造卡的 source 預覽快取 | 111 | 0 |
| JavaScript 錯誤 | 0 | 0 |

這確認大量工作可以延後，不等於已交付可發布的 lazy loader；實驗未驗證全部晚載、重試、切換與斷網相容性。

### 2. 一個渲染例外就永久停住影格：已確認的韌性缺口

TDGame.loop 第 398 行先 draw，第 400 行才排下一次 requestAnimationFrame。任何未被上層處理的 update／draw 例外，都會跳過下一次排程。部分特定英雄已做局部隔離，但共用縮圖、一般渲染和主迴圈仍有相同擴散途徑。

在隔離頁面只注入一次 AUDIT_SYNTHETIC_RENDER_FAILURE，之後還原 draw；兩次相隔 200 ms 的 lastTime 完全相同，確認 RAF 停止。這個受控注入證明擴散機制，不能用它宣稱已找到自然發生的技能錯誤。

### 3. 縮圖 Canvas 無法建立時，例外會拖停戰鬥：已確認的具體程式路徑

ArtSystem.preview 第 68–73 行建立 384×384 canvas，未確認 getContext 回傳值就呼叫畫圖。診斷中僅讓其中一次 384×384 getContext 回傳 null，得到原生 TypeError：

```text
Cannot read properties of null (reading 'save')
ArtSystem.drawCombatUnitSprite (ArtSystem.js:153)
 → ImperialFactionArt / CosmeticArt
 → ArtSystem.preview (ArtSystem.js:73)
 → TDGame.updateUi (TDGame.js:260)
 → 遊戲迴圈不再排下一幀
```

lifecycle-report.json 的 injected=true、rafStopped=true，lastTime=8224.3 在 300 ms 間隔內不變。這是受控資源失敗重現，未聲稱使用者手機當時確實回傳 null。

此測試與第二點相互支持：圖片／Canvas 壓力增加資源失敗風險，而目前沒有讓縮圖局部退化的防線；小圖失敗會擴散成整場停止。WebKit 官方的歷史議題也記錄過 Canvas 分配失敗與頁面總記憶體問題，但不拿歷史版本的限制值套到現代 iPhone：[官方議題](https://bugs.webkit.org/show_bug.cgi?id=195325)。它只支持失效模式具有實際可能性，不證明本次使用者事件來源。

### 4. 跨場景資源缺少統一預算：確認保留策略，未證明無限洩漏

ensureMapAsset 會保留選過的地圖；各模組的 imperialImages、heroEvolutionImages、cosmeticImages 等依路徑快取，沒有統一的像素／容量預算與場景淘汰。來源種類受內容總量限制，不能稱為無限成長洩漏；但手機從一場玩到商城、換英雄、換地圖後，基準資源集合會增大。20 次商城／劇情選單切換未發現 DOM 或事件監聽持續增長，不能把問題籠統寫成「商城漏記憶體」。

FrontierTerrain 已限制單張 filteredMap、CombatTextCache 已有像素與筆數上限、CombatFeedback／HeroSkillVFX／音效 voices 已有上限，這些既有防線保留。主迴圈在大廳暫停模擬後仍 draw；這是額外耗電／工作，未證明為本次當機原因。

### 漏檢與復發途徑

原有 1,205 項測試本輪全過。既有長局腳本明確是 headless 模擬，省略 Canvas、GPU、音效及手機；英雄動作測試即使真實瀏覽器成功，也沒有資源預算、getContext=null 與主迴圈單次故障門檻。因此「規則測試全過」不足以排除這類手機故障。這也是前輪交付驗證的缺口，不能歸因於玩家操作錯誤。

新增每款英雄、造型或卡片，若繼續加入啟動建構子／無條件 preview，會再次放大同一壓力。只修個別技能、只縮小某一張新圖，沒有封住共用來源。退回仍有 eager load 的版本也會帶回問題。

## D5：建議開發模組與順序（未實作）

| 順序 | 模組／架構 | 玩家體驗與失敗處理 | 驗收 |
| --- | --- | --- | --- |
| 1 | ArtSystem.preview 與共用 Canvas 保護 | 畫布失敗顯示既有圖示／文字，略過該縮圖；戰鬥、數值與存檔不受影響 | 注入 null 後 UI 可繼續、RAF 前進、不每幀重試造成風暴 |
| 2 | 單一資源管理器＋可見卡片才預覽 | 初始只載共用必要圖、所選英雄／軍團／地圖；卡片顯示載入狀態與重試 | 首次未打開建造抽屜不建立全軍團 source 快取，並測所有軍團晚載相容性 |
| 3 | 圖片、縮圖的共用預算與生命週期 | 保住本場必要圖，淘汰閒置預覽／歷史場景；回到需要處可重新載入 | 重複換圖／英雄／商城後資源回到可解釋的平台，不刪玩家已購資料 |
| 4 | 迴圈故障分級與安全恢復 | 表現層局部失敗可略過；模擬錯誤須安全暫停，顯示重試／回大廳與錯誤編號 | 單次例外不靜默凍結；不採無條件吞錯繼續錯誤模擬 |
| 5 | 輕量本機診斷與 iPhone 驗收 | 最後畫面、版本、錯誤與階段摘要可匯出；不記錄完整玩家資料、不上傳 | 真正桌面捷徑持續遊玩、鎖屏、切回、旋轉、離線、儲存不足與晚載失敗可區辨 |

本方案不需要新資料庫或網路 API。共享資源管理層集中圖片載入、路徑去重、並行數、重試及可淘汰資源；既有 ArtSystem／商城／預覽模組透過它取得圖，避免每模組自行保留另一份。具體容量應依量測與清晰度決定，不在未測手機前任意指定全裝置通用 RAM 門檻。若新增診斷紀錄，另定有限筆數、資料欄位、刪除與匯出操作。

## D6：本輪測試結果

- npm test：1,205／1,205 通過，輸出 artifacts/mobile-audit-tests-v085104.txt。
- 真實 Canvas 技能掃描：11 英雄×原型／覺醒／超凡×Q/W/E/F，共 132 組配置；128 組滿足施放條件，4 組因測試場景缺條件未發動。每組掃描 121 個動畫時間點，沒有自然例外或局部 fault 紀錄。未發動的四組為原型霜原 F、地精 F、矮人 E、龍族 E，不能稱為四組技能成功施放；也未把掃描等同每種裝備組合全覆蓋。
- 場景重開：3 輪×11 英雄，共 33 次，搭配不同軍團及地圖、4 倍 CPU 節流，沒有自然例外。
- 壓測：70 隻高血量敵人、24 士兵、×3、4 倍 CPU 節流、30 秒牆鐘。高城門血量和敵人高血量只限 fixture，避免提前結束；結束仍 playing、RAF 持續。彈體約 13–16、feedback 約 19–41，沒有在此窗口發現失控累積。這是短時間壓力取樣，不是半小時實機遊玩。
- lifecycle：商城所有商品逐項選取、退出，劇情選單、大廳，連續 20 輪；關閉後 shop DOM=0。第 5／10／15／19 輪強制 GC 後 Nodes=3920、listeners=1419，JS heap 約 5.2 MB，沒有此組操作的持續 DOM／監聽洩漏證據；不排除 Safari 圖像／GPU／音訊生命週期問題。
- 儲存注入 QuotaExceededError：顯示可理解提示，serialized 不變、沒有未攔截錯誤。僅覆蓋 FrontierApp.run 包覆的寫入，不能推定所有儲存入口已測。
- 兩組故障注入：單次 draw 例外及縮圖 getContext=null，均確認停止 RAF；這兩個結果是應修項，不寫成通過的穩定性驗收。
- qa:long-session：18 組模擬，沒有 timeout；含各 FPS／倍速的 30 分鐘時間規則推演。這個既有工具省略完整敵人技能、Canvas、音訊、手機及商城，不能取代 iPhone 驗收。

沒有用重跑現有全綠測試來掩蓋新發現，也沒有為了讓故障測試綠燈而放寬斷言。

## D7–D8：後續驗收、回復與未結案

目前為「調查完成，永久措施待實作，使用者原始事件根因尚未確認」。正式修正後，應把這次的兩個失敗案例轉為會擋發布的回歸測試，再驗證所有英雄、軍團、商品、晚載、重試、缺圖、存檔與版本更新；需要的新依賴應先評估，這輪沒有新增。

iPhone 桌面捷徑要獨立驗證，不用桌面 Chrome 的 heap 綠燈代替。Apple 官方支援在 Mac Safari 的 Home Screen Web Apps 入口檢視桌面網頁 App，記錄資源、時間軸與錯誤：[檢視 iOS／iPadOS](https://developer.apple.com/documentation/safari-developer-tools/inspecting-ios)、[Web Inspector](https://developer.apple.com/documentation/safari-developer-tools/web-inspector)。原始故障如為作業系統終止，還需相應裝置系統證據；不保證 JS 全域錯誤事件能捕捉程序死亡。

建議交付成功條件：從捷徑開始，前期／20 波後／商城換裝／章節切換、背景恢復至少形成一段連續實機紀錄；沒有被動重新載入或停住，局部圖片失敗可恢復，玩家資料保留。量測時同步記錄裝置型號、iOS、遊戲與 Worker 版本、是否 standalone；沒有這些資料不宣稱同一問題已完全結案。

本輪未修改正式程式，不需版本回退；診斷腳本／報告刪除也不影響遊戲。未來實作需成套備份原碼與發布包，保留玩家 JSON，再升版與同步標準文件；不以清除快取／存檔、換手機或重裝當作根因修正。

## 證據與重現

artifacts/mobile-crash-audit/report.json、loading-comparison.json、lifecycle-report.json、mobile-battle.png、console.txt，以及三個同目錄 cjs 診斷腳本。first-probe-report.json 保留首輪短測試，該輪城門未提高、遊戲提前結束；正式壓測判定以 report.json 修正後 fixture 為準。

本機重現：先啟動 npm run serve:test（127.0.0.1:4173）；在已有 Playwright／Edge 環境中執行 node artifacts/mobile-crash-audit/run.cjs、compare-loading.cjs、lifecycle.cjs。後兩個故障測試會在隔離測試分頁故意停止 RAF，屬預期診斷，不操作使用者瀏覽器資料。NODE_PATH 依現有執行環境設定，不應為重現直接對正式 origin 或使用者存檔做注入。
