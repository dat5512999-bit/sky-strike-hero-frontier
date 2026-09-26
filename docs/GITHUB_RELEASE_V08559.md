# GitHub 整合發佈 v0.85.59

## 內容與需求

本次將既有本機修改整合發佈，不另加英雄、軍團或改動使用者已儲存的地圖。包含七族塔樓材質特效、士兵特效與出手同步、Canvas 狀態修正、電腦介面節流／地圖與浮字快取、手機模擬器、英雄進化、首領圖集、後段波次與娜迦可靠性修正。細節見各版本交付紀錄。

發佈前公開站讀到 v0.85.44，本機 main 有 6 筆未推送提交及後續工作區修改。不能將本機更新或 push 成功視為網站已更新。

## 玩家安裝、設定與更新

1. 以 Chrome／Safari 開啟 https://dat5512999-bit.github.io/sky-strike-hero-frontier/update.html?release=0.85.59 ，保持連線，等待更新完成自動進入大廳。
2. 大廳版本應顯示 v0.85.59。更新失敗時留在更新頁按重試，不清除網站資料。
3. 手機正式入口是 `td-mobile.html`；直向開啟會旋轉同一份 `td.html` 遊戲。電腦入口是 `td.html`。手機可依瀏覽器提示加入主畫面。
4. 手機模擬器 `mobile-simulator.html` 的「直向開啟」共用 `td-mobile.html`，橫向檢視共用 `td.html`，不是另一套遊戲 UI。
5. 若同版本仍有版型差異，先在遊戲選單將版型選為「自動」。模擬器不讀桌機版型偏好；真機保留玩家自行選擇。螢幕大小、Safari 網址列、安全區、安裝提示及既有存檔畫面仍可能不同；請提供網址與截圖再比對，不宣稱真機像素完全一致。

玩家進度、裝備和購買資料仍存於原瀏覽器同源儲存，無帳號、資料庫或存檔格式遷移。不同瀏覽器／本機網址與 GitHub 網址不共用進度。更新後須重開舊分頁；不會把正在運行的戰局熱換成新程式。

## 管理者安裝與部署

需要 Git、Node.js 18 以上及此 GitHub 專案推送權限。遊戲和測試無需額外 npm 套件；原生 Canvas 視覺基準的額外依賴請依各 QA 文件安裝。

```text
npm run check
npm test
git push origin main
npm run verify:pages
```

main 推送觸發 `.github/workflows/pages.yml`；GitHub Pages 使用 GitHub Actions 發佈來源。確認「Verify game」「Deploy」「Verify live release」均成功，且工作流程 head_sha 是本次提交。

`verify:pages` 可接受另一個部署目錄 URL：`npm run verify:pages -- https://example.org/game/`。只讀取站台和專案檔，不讀取瀏覽器或玩家存檔；錯誤回報缺檔 HTTP 狀態或內容不一致，並以非零狀態結束。CI 遇 CDN 傳播延遲最多重試四次，仍失敗不回報成功。

公開 Pages 僅為靜態站，無地圖寫入 API。地圖後台仍透過本機 `npm run studio` 使用；GitHub 遊戲載入 `published-maps.js` 中已儲存的格線／路線，不會讀取其他瀏覽器的私人草稿。

## 架構與 API

```text
main 提交 → 全套測試 → Pages 靜態部署 → HTTP 檔案雜湊校驗
                                      ├─ td-mobile.html → td.html
                                      ├─ mobile-simulator.html → 同一手機／遊戲入口
                                      └─ update.html → SW 版本握手 → 新版大廳
```

版本標記同步於 package、SW、大廳、開局、更新頁與戰報；快取鍵為 `sky-strike-v0.85.59`。SW 安裝先重取遊戲程式並完成快取，更新頁以 `GAME_VERSION` 訊息確認實際啟用版本。圖集依原有策略按需快取。

新增維運函式（`scripts/verify-pages-release.cjs`）：`releaseFiles()` 產生入口／直接引用程式與樣式及重點新圖集清單；`digest(bytes,file)` 計算 SHA-256，文字只正規化 CRLF；`verify(base,fetcher,files)` 以六路並行讀取比對並回傳版本／檔案數。入口與 SW 同時檢查一般網址及版本查詢網址，避免只檢查繞過快取的地址。無新增遊戲 API 或伺服器資料庫。

## QA 與限制

- `npm run check` 通過；`npm test` 共 810 項全部通過。
- 原始地圖的繪畫地標測試隔離已發佈覆蓋資料；新增正式 script 順序整合測試，驗證所有已存格線、路線、怪物路徑、實際建塔及佔位碰撞，未變更使用者地圖。
- 新增真機自動版型與同尺寸模擬器的邏輯一致性測試；沿用更新失敗保留存檔／版本握手測試。
- 線上檔案核對不等於瀏覽器視覺測試、實機觸控或 FPS 測量。電腦效能數據仍是原生 Canvas 基準，詳見 `DESKTOP_PERFORMANCE_V1.md`。
- 人工驗收：同一版本／存檔與版型選擇下核對手機首頁；再於電腦 ×2 倍敵人聚集時檢查卡頓。尚不能保證所有電腦完全無卡頓。

## 備份與回復

保留 Git 歷史及發佈前提交 `304ff93`；發佈前線上提交為 `4b3d3b17f8b68c07f54ad216bb57055dc1feff9f`。玩家儲存資料不納入 Git；不可用清除網站資料當更新手段。地圖後台的本機歷史備份位於忽略追蹤的 `artifacts/map-history/`，正式發佈內容則隨 Git 版本保存。

若要回退已推送版本，先備份新工作，透過新回復提交恢復所需版本內容（不 force push、不 reset 使用者工作），並使用新的遞增版本及 SW 快取鍵再走測試與部署。不能只換旧 sw.js 而混用其他新版檔案。

## FAQ

「GitHub 已更新但看不到？」先核對 Actions 精確提交、部署校驗結果與大廳版本。更新頁失敗則檢查網路與 CDN，不能當作更新成功。

「模擬器與手機不同？」先核對版本與網址，再看版型偏好、螢幕尺寸、既有進度和瀏覽器安裝提示。若仍不同，保留兩張截圖及完整網址比較。

「手機效能一定一樣嗎？」不一定。模擬器使用電腦運算與滑鼠，不代表手機硬體、Safari 手勢或效能。
