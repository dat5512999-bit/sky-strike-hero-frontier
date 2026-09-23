# v0.85.2 邊境對戰移除與驗收工具

2026-09-23。正式遊戲仍以 `td.html`／`td-mobile.html` 為入口。此版移除獨立的邊境對戰原型，不更動 HERO FRONTIER 的戰鬥、Story、存檔或商城規則。

## 變更與架構

- 刪除 `versus.html`、`versus.css`、`src/versus/`、專用背景圖及原型測試。原型沒有獨立的玩家存檔、資料庫或 API，不需資料遷移。
- `sw.js` 不再預存原型檔案，快取名稱更新至 `sky-strike-v0.85.2`；啟用新版 Service Worker 後會刪除舊的 `sky-strike-v*` 快取。舊分頁仍可能暫時持有舊頁面，應關閉後重新開啟。
- 共用的 HERO FRONTIER 圖集保留，因為主遊戲仍使用它們。Git 舊版歷史仍可追溯，但不屬於目前交付目錄。
- 專案內其他功能分支的 worktree 仍可能保有舊版原型；它們不是目前交付目錄。日後合併那些分支時須確認不會重新帶回原型檔案或快取項目。
- `frostland-preview.html` 是霜牙英雄和霜原盟族動作驗收工具，補上商城 `ThunderKing.js` 的載入順序，避免 `SkinCatalog.js` 在瀏覽器呼叫不存在的 `require`。它不建立自己的玩家存檔或付款 API。
- `codex-dev.html` 與 `CodexDebug.js` 是本機圖鑑測試工具；除錯指令只在 loopback 網址的該頁啟用。玩家圖鑑仍為 `codex.html`，正式包必須排除開發圖鑑和除錯腳本。

## 安裝、使用與部署

1. 以完整靜態檔案取代舊部署，確認伺服器上沒有舊的 `versus.html`、`versus.css`、`src/versus/` 和專用背景圖；增量上傳不會自動移除舊檔案。
2. 在專案執行 `npm run serve:test`，以 `http://127.0.0.1:4173/td.html` 使用遊戲。霜原動作驗收可直接開啟 `http://127.0.0.1:4173/frostland-preview.html`，並切換待機、移動、攻擊、施法及技能按鈕。
3. 開發圖鑑只在本機 `http://127.0.0.1:4173/codex-dev.html` 使用，正式部署排除該頁與 `src/td/codex/CodexDebug.js`。
4. 發布後重新載入並讓新版 Service Worker 啟用；檢查 `td.html` 正常、原型 URL 回傳 404、霜原驗收頁沒有 Console Error。離線檢查須在新快取安裝完成後進行。

## 測試與復原

執行 `npm run check`、`npm run check:frostland`、`npm test`。重點檢查主遊戲入口、離線清單不含原型、原型 URL 不可開啟、霜原驗收頁四種動作與技能、開發圖鑑只限本機。沒有新增資料權限或網路 API。

本次驗證：語法檢查、霜原檢查、相關 60 項測試通過；瀏覽器桌面與 844×390 橫向畫面無 Console Error，原型網址回傳 404。Service Worker 安裝後只有 `sky-strike-v0.85.2` 快取，150 個預存項目沒有對戰檔。完整測試 560 項中 559 項通過；唯一失敗是既有的 `td-story-maps.test.js`，冰原地圖有效建塔點 79 個低於該測試門檻，與本次移除和驗收頁修復無關。

回復上一版時應還原同一版的整份靜態檔案與 Service Worker，避免 HTML 與腳本版本混用；先備份當前玩家存檔。Git 可找回原型程式，但回復會重新帶回已移除功能，不能只恢復單一頁面。主遊戲既有玩家資料格式未變，不需要清除站點資料。
