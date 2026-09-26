# 開發者地圖後台（工具 1.0.1／地圖格式 1）

## 安裝與開啟

需要 Node.js 18 以上，不需新增套件或資料庫。雙擊專案根目錄 `start-developer-studio.cmd`，或在專案執行 `npm run studio`。保留終端機，開啟 http://127.0.0.1:4174/developer-studio.html 。關閉服務請按 Ctrl+C；重新開機後再啟動即可。連接埠已占用時先確認是否已有後台在執行。

遊戲沒有後台入口。管理後台只綁定 127.0.0.1，本機作業系統使用者能管理此專案；不是遠端帳密登入系統。舊的 file:// 管理者檔案門檻只供離線編輯使用。

## 把之前已儲存的內容移過來

1. 回到原本使用的格線編輯頁，重新整理，按頂端「匯出已存設定（保留原資料）」。
2. 若也使用過路線編輯頁，請在該原頁面同樣匯出。file:// 頁面可能分別保存資料，不能假設兩頁共用儲存區。
3. 到本機後台選「匯入舊頁設定」，檢查地圖名稱、可建格數及路點數，按「確認寫入正式地圖」。
4. 多份匯出檔逐份匯入。格線與路線只更新各自提供的部分，不會互相清空。同一張地圖同類資料以最後確認發佈的檔案為準。
5. 開啟遊戲驗證，重新整理並開始新局。原始繪畫背景不會變色；變動的是塔位判定與怪物移動路線。

相容新版完整匯出包 `hero-frontier-map-package-v1`，也接受舊 `hero-frontier-grid-v2` 單地圖 JSON。匯出不刪除原本瀏覽器資料。尚未匯入前，無法自動從其他瀏覽器或 file:// 頁面取得你的私人儲存資料。

## 日常操作

從本機工作台開啟建造格或路點編輯器。格線可選所有正式地圖、以滾輪或按鈕縮放、把原本紅格標綠。路線可拖曳金色點、插入或刪除中間點，方向鍵可微調；出生點與城門固定。「新增轉彎點」開啟後可連續加點，切換地圖也保留開啟狀態，直到再次按下按鈕關閉；選取或拖曳既有節點不會額外插入新點。官方原始路段保留；新增改動段會驗證邊界、最短間距及障礙。

按一次「儲存到遊戲」即直接把目前這張地圖寫入專案，不再要求第二次確認；顯示 r1、r2… 版本號並備份舊版。每張地圖改完請先儲存再換圖；路線驗證失敗會保留編輯內容並提示問題，寫入期間停用重複儲存與換圖。無本機服務時只允許儲存離線草稿，必須匯出匯入才能發佈。正式遊戲只讀已發佈資料，瀏覽器舊草稿不再能覆蓋正式版。重新整理 td.html 並開始新局後，格線與路線即可生效。匯入舊檔與還原整版仍保留確認步驟。

兩個頁面同時編輯時，落後版本會收到「其他頁面已發佈新版本」而拒絕覆蓋。請先保留草稿／匯出，再重新整理並合併；不要重複按存檔。既有開局不會中途搬移怪物。

## 資料與架構

```text
本機管理頁 ── 預覽／確認 ──> 127.0.0.1:4174 管理 API
                                    │ 驗證全部地圖、比對版本
                                    ├─> artifacts/map-history/<revision>.json
                                    └─> src/td/map-tools/published-maps.js（單檔原子替換）
                                                   │
td.html ──> MapLayoutOverrides ──> BuildSystem       │
        └─> MapRouteOverrides ──> PathSystem／WaveSystem／Monster
```

地圖原始美術與 `maps.js` 作為基準保留；可發佈差異位於 `published-maps.js`，傳統 script 載入支援直接開啟遊戲。根物件為 `{schemaVersion:1,revision,publishedAt,maps}`；每個地圖可有 `layout:{cellSize:64,buildable:[{column,row}]}` 與 `routes:[[{x,y}]]`。多路地圖共同末段長度會重算；壓力區路點索引依原地理錨點映射到新路線。地圖背景畫面不會重新生成。

後台可寫入的正式目標固定為一個資料檔，路徑不由瀏覽器傳入。服務驗證 Host／Origin／工作階段 token、1 MB 上限、地圖名稱、座標與路線；禁止透過 HTTP 讀取 scripts、備份、測試與 .git。多地圖任一筆無效即全批拒絕。Service Worker 不快取管理 API。

## API（僅供本機維護）

- `GET /api/studio/state`：回傳 `{token,state,history}`，Cache-Control: no-store。
- `POST /api/studio/publish`：`{baseRevision,changes:{emberroad:{layout?,routes?}}}`；只合併提供的欄位，成功回傳 `{state}`。
- `POST /api/studio/restore`：`{baseRevision,revision}`；還原整份地圖版本，建立一個新的版本。
- POST 需要同源 Origin、application/json 與 `X-Studio-Token`；400 資料錯誤、403 權限／來源、409 過期版本、413 過大、500 讀寫失敗。失敗不會回報儲存成功。

## 備份、回復及版本管理

每次寫入前，舊版存入 `artifacts/map-history/<revision>.json`。工作台選備份版本後按「還原選取的全部地圖版本」，查看確認內容再還原；還原本身也是新版本，可再還原回先前狀態。備份是整份地圖設定，不是單一地圖。r0 為尚未發佈任何差異的原始狀態。

請備份 `published-maps.js` 與整個 map-history 資料夾。artifacts 依現有規則不提交 Git；正式差異檔應隨專案提交。工具版號 1.0.1 與自動增加的地圖 revision 分開，避免與其他同步開發的遊戲版本互相覆寫。

## 部署、更新及常見问题

- 發佈是寫入這份本機專案；已上線網站需執行原本的網站部署，才會收到新地圖。
- 正式交付必須包含 td.html、published-maps.js、MapLayoutOverrides.js、MapRouteModel.js、MapRouteOverrides.js、BuildSystem.js 與新版 sw.js。遊戲不需要執行管理服務。
- 公開靜態網站可排除 developer-studio.html、map-grid-editor.html、emberroad-grid-editor.html、route-editor.html、MapPublisher.js、MapRouteEditor.js、EmberroadGridEditor.js、scripts/developer-server.cjs、啟動器與 artifacts 備份。勿將本機服務改綁到 0.0.0.0 供外網使用。
- 「地圖仍未變」：核對正式版本是否增加、是否發佈正確地圖、是否重新整理遊戲且開始新局；綠格不會畫到戰場背景。
- 「匯出 0 張地圖」：請回原瀏覽器的原編輯頁匯出，工作台可能沒有那頁的 file:// 儲存區。不要清除瀏覽器資料。
- 「無法連線」：啟動器終端機須保持開啟；核對 4174 是否被占用。
- 「讀寫失敗」：檢查專案寫入權限、磁碟空間與備份檔；既有正式檔不應被手動修改成非支援格式。

## 測試清單

- 1.0.1 已在獨立副本驗證：模式只開一次連續新增兩點、拖曳不誤加、切換地圖保留模式、手動關閉、格線及路線各按一次儲存即產生版本與備份；正式使用者資料未被測試改動。

- `npm run test:maps`：正式發佈、新遊戲實例、怪物路徑、塔位、備份／還原、部分合併、並行衝突、惡意／損壞資料與跨站拒絕。
- `npm run qa:maps`：需要 Playwright 及 Edge；獨立專案副本操作真實按鈕，驗證舊存檔匯出匯入、格線發佈、拖曳路點、全新瀏覽器載入與還原。截圖位於 artifacts/map-publishing。
- `npm test` 與 `npm run check`：全專案回歸與語法檢查。
- 人工驗收：發佈自己的地圖、新局嘗試綠格／非綠格建造、觀察第一波實際走線、檢查匯流與風道／煙障仍在合適位置。

### 本次驗收紀錄（2026-09-26）

地圖相關 11 項自動測試及 Edge 真實操作均通過，語法檢查通過。全專案當次 736 項中 734 通過；兩項英雄進化測試失敗（td-hero-evolution.test.js 的試煉與覺醒 Q），以記憶體中排除所有地圖工具腳本的入口重跑，仍重現同樣失敗。這些同步開發中的進化變更未由本次地圖後台修改。瀏覽器 QA 在獨立副本執行，沒有將示範格線發佈至使用者專案；既有 file:// 私有存檔仍需依上面步驟匯入。
