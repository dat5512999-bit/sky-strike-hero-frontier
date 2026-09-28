# v0.85.71 手機沉浸式全螢幕

版本：0.85.71 · 日期：2026-09-28。狀態：本機實作與自動驗收完成；實體 iPhone／Android 裝置仍待驗收。

## 玩家操作

更新後請從 `update.html` 完成更新、關閉所有舊戰場分頁，再由主畫面圖示開啟「英雄塔防」。支援 `fullscreen` 的已安裝 PWA 會直接隱藏時間、電量、訊號與瀏覽器列。若從一般瀏覽器開啟，按「開始遠征」或「嘗試切換橫向顯示」時會提出全螢幕請求；使用者拒絕時仍可正常遊玩。

Android／支援 Web App Manifest `fullscreen` 的平台會使用整個可用螢幕。iPhone／iPad 的主畫面 Web App 由系統決定狀態列是否顯示；Safari 的 standalone 行為可能仍保留該列。此時本版改用不透明深色狀態列與安全區保留，並在直向殼旋轉遊戲時將遊戲面從安全區之後開始，時間／電量不會壓在戰場、技能或按鈕上。若需要 iOS 上保證完全不顯示狀態列，必須以原生 App／受控 WebView 發佈，純網站不能強制覆寫作業系統。

## 架構與設定

`td.webmanifest` 的 `display` 與 `display_override` 皆將 `fullscreen` 放在第一順位，失敗時才回退 `standalone`。`src/td/main.js` 僅在玩家點擊既有開始／橫向按鈕時呼叫 `document.documentElement.requestFullscreen({ navigationUI: 'hide' })`，並沿用既有橫向方向鎖定；不會在未經互動時嘗試全螢幕。

`td-mobile.html` 讀取實際的 `safe-area-inset-top`。直向外殼必須旋轉橫向遊戲時，會為系統列保留物理頂部空間並把 iframe 向下位移；iOS 的狀態列採 `black`，不再以半透明文字直接蓋住戰場。沒有新增資料庫、權限、帳號、API 或玩家存檔欄位。

## 安裝、部署與回復

部署要同步 `td.webmanifest`、`td-mobile.html`、`td.html`、`src/td/main.js`、入口版號和 `sw.js`。確認 Service Worker 快取是 `sky-strike-v0.85.71`。舊快取不會自動套用新 manifest；必須關閉舊分頁後從主畫面重新開啟。更新不需清除網站資料。

若需回復，必須一起回復 manifest、手機殼、主程式與 Service Worker 版號；只改快取名稱會造成入口與顯示模式不一致。回復不影響 localStorage 存檔。

## QA

`npm run test:mobile` 驗證 manifest 全螢幕優先順序、手機殼安全區、直向旋轉位移及使用者手勢全螢幕請求；`npm run check` 和 `npm test` 驗證整體程式與離線資產。實體驗收仍需 Android Chrome 與 iPhone Safari 各以「瀏覽器」和「加入主畫面」兩種入口確認：狀態列是否隱藏或隔離、首波開始後全螢幕是否正常、橫向切換、劉海／動態島、安全手勢區及重新整理後的存檔。
