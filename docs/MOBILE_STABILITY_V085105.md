# 手機穩定性修正 v0.85.105

2026-11-10（台灣），本機修正完成，未提交或推送 GitHub。針對使用者在 iPhone 桌面捷徑玩一陣子當掉的回報，依 [v104 調查](MOBILE_CRASH_AUDIT_V085104.md) 實作共用資源管理、縮圖失敗隔離與安全復原。沒有改英雄、軍團、商店價格、所有權、戰鬥數值、地圖規則或玩家存檔 schema。

## 玩家操作與 FAQ

圖片改成需要時載入。選擇新英雄／地圖後，原有開場等待及「重新載入圖片」按鈕仍有效；不需要清除資料、重新買造型或安裝新程式。開啟建造抽屜、傭兵或軍團卡片時才製作看得到的縮圖。縮圖畫布失敗會保留卡片原有圖示和文字，五秒後再允許嘗試，不影響戰鬥。

遇到未預期的顯示錯誤會出現「遊戲已安全暫停」，可按「重試畫面」、「返回大廳」或「匯出存檔備份」。重試先恢復 Canvas 狀態，畫面與 UI 都成功才恢復先前的暫停狀態。若錯誤發生於戰鬥運算，沒有「重試畫面」按鈕，避免把可能已部分執行的運算繼續跑；應先備份，再回大廳。沒有自動重新整理或自動刪存檔。

錯誤編號 HF-RENDER 為畫面路徑、HF-UI 為圖片進度更新 UI、HF-SIM 為模擬／更新階段。只在目前 game.runtimeFault 保留一筆訊息、堆疊與原暫停狀態，不上傳、不增加玩家存檔欄位。回大廳／重設會清除這筆暫時狀態。若是 iOS 直接終止網頁程序，JavaScript 面板無法保證出現；本版不能承諾所有 OS 終止都能復原。

更新後請確認顯示 v0.85.105。本機測試完成不表示現有公開網站或手機捷徑已更新；本輪沒有外部部署。遇到舊圖／舊版本先使用既有更新入口，保留玩家資料。

## 架構、資料夾與內部 API

新增 src/td/systems/ArtAssetStore.js，必須在 ArtSystem.js 之前載入，td.html 與 Worker 已同步。既有 ArtSystem 的 load／request／pump 呼叫入口保留，英雄、軍團與造型渲染器仍取得原生 Image，不需各自實作快取。沒有新增資料庫、網路服務或依賴套件。

```text
英雄／軍團／商城圖層 → ArtSystem.load(path)
                       ↓
                ArtAssetStore 穩定 Image 參考
                  路徑去重／按需載入
                  四路載入／有限重試
                  場景取消／閒置淘汰
                       ↓
           ready 檢查 → 原有 Canvas 渲染

可見卡片 → 384 臨時畫布 → 128 縮圖 → 32 筆快取
              ↓ finally 清為 0×0
           失敗留在縮圖層，退避五秒

TDGame.loop → 模擬／繪圖 → finally 維持單一 RAF 鏈
                 ↓ 例外
           停止模擬＋復原面板
```

| 入口 | 行為 |
| --- | --- |
| ArtSystem.load(path) | 相同路徑回傳同一原生 Image；建立 handle 不設定 src |
| image.ready | 讀取時要求該圖，並回傳是否完成；這個 getter 有按需載入副作用 |
| ArtSystem.request(image) | 明確要求載入，與首次載入共用四路限制 |
| ArtSystem.retryFailed() | 失敗三次後可手動重試，包含所有受管理的圖 |
| ArtSystem.maintainAssets() | 每秒最多一次執行閒置淘汰 |
| ArtSystem.beginScene() | 場景切換取消舊場景未完成工作；既有 Image 參考保持有效 |
| assetStore.stats() | 無載入副作用的 handle、ready、active、queued、RGBA 規模與預算統計 |
| TDGame.handleRuntimeFault(phase,error) | 暫停、保留單筆錯誤、顯示復原面板 |

不要為了列出統計遍歷所有 image.ready，否則會主動把全部圖片喚醒；應使用 stats。HTMLImageElement 原生 loading 是字串屬性，本版把下載狀態放在 manager record.loading 布林值，避免把原生 'auto' 誤判成下載中。這個相容性問題已加入測試。

載入超時二十秒、最多三次；重試間隔 300／600 ms，失敗後不在每幀無限重試。取消與逾時使用 token，過期 callback 不能讓已釋放圖重新計入 ready／容量。載入完成通知以 microtask 合併，避免同一批完成事件重複更新介面。

圖片預算採完整 RGBA 規模估算 128 MiB，並非實測 RAM 或 GPU 限制。剛使用的目前場景工作集保護五秒，防止大型有效軍隊反覆卸圖／重載；超過預算先釋放舊場景或閒置圖片，閒置三十秒也可釋放。這是軟預算，當目前必要工作集本身超標時不強制破壞它；極快連續換場仍可能有短暫尖峰。釋放會移除 Image 的 src、取消計時器與工作，重新使用同一參考可再載入。

卡片快取最多 32 張 128×128（約 2 MiB 像素容量）。每次製作完畢或失敗都把 384×384 臨時畫布清成 0×0；淘汰的快取也清空。隱藏卡片不載入／製作預覽，已隱藏的 DOM 縮圖移除。大廳或選角覆蓋戰場時，停止畫背後的戰場，不推進模擬。

## 根因、措施與限制（8D）

發生機制是共用 eager loading／無條件縮圖，以及例外跳過下一次 RAF 排程。已對應實作永久措施；Canvas=null 的具體故障從「拖停迴圈」改為「單一縮圖略過」。非隔離錯誤採安全暫停，不以吞錯繼續模擬。原玩家事件仍缺 iPhone 型號、iOS、當時版本與系統故障日誌，不能寫成已證實唯一原因。

漏檢原因是既有規則與動作測試缺資源門檻、原生 Image.loading 語義、getContext=null 及迴圈出錯驗收。新增 tests/td-mobile-stability.test.js 十項測試，涵蓋首次載入並行、路徑去重、重試、穩定參考重載、過期 callback、目前工作集、場景取消、隱藏卡片、Canvas=null 退避、縮圖上限、模擬／渲染錯誤與隱藏戰場。原有測試改成等待實際晚載完成，沒有移除商品／戰力／畫格斷言。

復發防線：新美術使用共享 load／request，不再回到建構子立即設定 src；新增卡片保留可見性及快取限制；新渲染保持 Canvas 狀態還原，局部表現失敗不改數值。迴圈故障測試應與資源測試一起作為發布門檻，不能只看規則測試綠燈。

本輪 D5／D6 程式與測試環境驗證完成，D7 加入可重現門檻；整體使用者事件的 D8 仍待實體 iPhone 桌面捷徑複驗，不宣稱永不當機。

## 安裝、設定、管理與驗收

沿用 README 的現有 Node 環境，沒有新增安裝或套件。啟動 npm run serve:test，開啟 http://127.0.0.1:4173/td-mobile.html。QA 使用環境既有 Playwright 與 Edge；NODE_PATH 指向既有 node_modules 即可，不需讓玩家安裝程式。

```text
node --test tests/td-mobile-stability.test.js
npm test
npm run check:site
npm run qa:mobile-stability
npm run qa:evolution-all
npm run qa:chief-skins
npm run qa:local-update
node scripts/verify-pages-release.cjs http://127.0.0.1:4173/
npm run qa:ios-player
```

瀏覽器 QA 先啟動本機 4173；qa:evolution-all 可用 EVOLUTION_QA_URL 指向本機 td.html，qa:mobile-stability 可用 MOBILE_STABILITY_QA_URL 指向同源 td-mobile.html。全部使用隔離測試資料，不對正式使用者存檔操作。測試工具故障注入僅限隔離 fixture。

本輪觀察與通過項目：

- npm test：1,215／1,215 通過，含十項新穩定性測試。
- 同樣 852×393、DPR3、touch 的實際手機 shell 入口：大廳完成載入不同 Image 12 張、首次戰鬥 19 張；v104 相應基線 117／119。首次戰鬥不同圖片約減少 84%。這是該取樣時點，不是所有關卡固定圖片數。
- v104 預覽 source 像素容量約 62.4 MiB，本版上限 2 MiB；DOM 顯示用 Canvas 另計。圖片寬高×4 估算不是作業系統實際記憶體。
- 11 英雄及全軍團輪流開場，114 個守軍／建築 fixture；每名英雄原型／覺醒／超凡各四狀態四影格，晚載期間沒有自然 JS 錯誤。原有全英雄 QA 另通過 44 組真實買石至進化、Lv.0 與 checkpoint、雙尺寸、缺圖及已購造型。
- 三款大酋長造型的真實購買、裝備重開、96 個動作、缺圖 fallback、三款預覽通過。
- 可見建造卡 getContext=null：局部 previewFault 存在、沒有 game runtimeFault、RAF 繼續前進；重新開啟有效。
- 70 隻高血量怪、24 士兵、×3、CPU 四倍節流、30 秒牆鐘：仍 playing。已載不同圖回落至約 15–21 張；不是半小時實機或硬體記憶體認證。
- 將閒置時間推進四十秒的受控測試，管理器 ready 可降為 0，再透過既有 Image／renderer 完成載回。
- 單次渲染例外：顯示 HF-RENDER、RAF 仍前進、按重試後恢復；單次模擬例外：顯示 HF-SIM、安全暫停、不能用畫面重試繼續模擬，返回大廳成功。
- 復原面板手機實際檢視：按鈕至少 44 px 高，viewport／scrollWidth 都是 852，無橫向溢出。
- v0.85.100 → 105 更新、淘汰舊 Worker 快取、保留既有資料與 44 頁驗證通過；本機 276 檔逐位元驗證通過。
- iOS 玩家包雙尺寸、正常錢包、管理者阻擋、備份匯入與重開持續性、無 Worker／JS 錯誤通過。未生成 Xcode 工程、IPA 或 TestFlight。

證據：artifacts/mobile-stability-v085105/report.json、mobile-battle.png、recovery-render.png；完整測試輸出 artifacts/mobile-stability-tests-v085105.txt，進化／造型／更新／iOS 輸出為 artifacts/mobile-stability-*.txt。

## 部署與回復

版本同步 package、HTML、Worker、更新入口、ProfileStore、FrontierApp 與戰報至 0.85.105。正式網站需成套部署新 ArtAssetStore、ArtSystem、TDGame 與 script／Worker 清單；不能只換版本字串。靜態計畫 823 檔，iOS 開發資源包 824 檔。沒有新增圖像、音檔或對外服務，沒有推送 GitHub。

native/ios/www 已產生 v105 玩家開發包；完整 v104 包保留在 artifacts/ios-backups/pre-mobile-stability-v085104。App Store 的發行者、客服、簽署、隱私／權利與真機缺項仍見 IOS_RELEASE_PREPARATION.md。

網站回復檔在 artifacts/mobile-stability-rollback-v085104，manifest 列出九個執行／入口／版本檔 SHA-256。ArtSystem、TDGame、td.html 從本輪保留的 v104 資源包原樣複製；其他檔只反轉本輪版本及 script 清單，保留之前大酋長等未提交工作。此為執行版本回復，不是整個 Git 工作區歷史快照。還原前另備份目前檔案及玩家 JSON，再將九檔依相對路徑成套複製回專案；不要刪素材、覆寫玩家資料或使用 reset --hard。新版穩定性測試不能混當舊版回復的功能保證，測試碼須配對版本。

iOS 回復前先確認來源／目的絕對路徑在本專案內，將目前 www 移至新的備份位置，才複製完整 v104 包回原位。新版源碼保留時，可重新執行 ios:prepare 產生 v105，但它會拒絕覆寫既有 www，須先備份。所有回復均先檢查 manifest 與版本，之後驗證選角、開場、圖片及存檔重開；不需要清除瀏覽器儲存。
