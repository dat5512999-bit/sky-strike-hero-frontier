# v0.85.53 iPhone 15 Pro Max 手機預覽器

## 目的

`mobile-simulator.html` 是開發與驗收工具，以 iPhone 15 Pro Max 的 viewport 檢查 HERO FRONTIER。它不是第二套遊戲、也不會改變戰鬥、帳號、存檔或正式手機入口。

## 使用方式

1. 在桌機開啟 `mobile-simulator.html`。
2. 預設「直向開啟」以 430 × 932 CSS viewport 載入正式 `td-mobile.html`；這會走與手機相同的直向開啟與遊戲旋轉流程。
3. 「橫向戰場」以 932 × 430 CSS viewport 直接載入 `td.html`，適合集中檢查戰鬥 HUD、彈窗與安全區。
4. 使用「重新載入」回到初始畫面；「全螢幕」可放大預覽；「開啟實機入口」會另開原本的 `td-mobile.html`。

預覽與正式遊戲使用相同 origin，因此可讀到現有測試存檔；預覽參數只讓 `LayoutSystem` 在這個 iframe 使用手機版型，且不讀寫 `towerFrontierLayout` 或 `towerFrontierMobilePanel`，不會污染玩家偏好。

## 架構與限制

```text
mobile-simulator.html
  └─ src/td/mobile-simulator.js
      ├─ 直向開啟：iframe: td-mobile.html?preview=iphone15promax
      │   └─ iframe: td.html?preview=iphone15promax（正式旋轉流程）
      └─ 橫向戰場：iframe: td.html?preview=iphone15promax
          └─ LayoutSystem（暫時強制 mobile，無 localStorage）
```

- `mobile-simulator.css` 只畫外層裝置與縮放，不複製遊戲 UI。
- 裝置會依瀏覽器可用空間等比縮放，但 iframe 內部維持選取模式的真實 viewport，避免把桌機寬度誤當成手機 viewport。
- 此工具能驗收手機 CSS、安全區預留、按鈕密度與彈窗位置；無法重現 iOS Safari 網址列高度、真實 GPU 效能、震動或原生手勢，這些必須由真機驗收。

## 部署與回復

GitHub Pages 會隨 `main` 自動部署此頁。Service Worker 快取名稱和預覽頁／樣式／腳本必須一同更新，避免舊手機繼續拿到過期殼層。要回復，使用 `git revert` 回復本版提交後推送 `main`；不需要刪除任何玩家資料。

## 測試清單

- [x] 直向模式走同一個 `td-mobile.html` 正式入口，不是遊戲複本。
- [x] 橫向模式直接載入同一個 `td.html`；兩種入口都帶 `preview=iphone15promax`。
- [x] 預覽模式強制手機版型，且不寫入玩家版型偏好。
- [x] 小螢幕等比縮放、重新載入與全螢幕控制存在。
- [x] HTML、CSS、腳本納入離線殼層與自動化測試。
