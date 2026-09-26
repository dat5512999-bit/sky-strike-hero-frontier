# 2-2〈燼道相逢〉建造格校對工具 · v0.85.50

## 目的

讓關卡設計者能在正式地圖上逐格確認「這裡可以蓋塔」，而不是猜測隱藏的多邊形判定。工具只做審核與交接，不會直接改動玩家的可建區。

## 使用方式

1. 直接開啟根目錄的 `emberroad-grid-editor.html`。
2. 綠色代表目前確認可建；點擊非紅色格可切換。金色內框是程式現有允許的格子；暗色格可作為新增候選。
3. 紅色斜線為道路、障礙或邊界，已鎖定不可選。
4. 選完後按「複製 JSON」貼回對話，或按「下載 JSON」交給關卡整合流程。

## 架構與安全界線

`emberroad-grid-editor.html` → `EmberroadGridEditor.js` → `EmberroadGridModel.js` → `maps.js` 的 `emberroad` 正式資料。模型重用道路距離、障礙多邊形、可建多邊形與 `buildFootprint` 採樣規則；格子尺寸為 64px，地圖為 24×16 格。

輸出是 `hero-frontier-grid-v1` JSON，包含格列與格心座標。這不是玩家存檔，也不會自動覆蓋 `maps.js`。收到標註後，整合時須將選取格轉換成完整 `buildAreas`，並重新驗收道路、障礙、塔間距與實際部署。

## QA

執行：

```powershell
node --test tests/td-emberroad-grid-editor.test.js tests/td-story-maps.test.js
npm run check
```

測試覆蓋 24×16 尺寸、鎖定格、既有可建格、輸出排除鎖定格，以及離線頁面的還原／清空／複製／下載入口。真人校對仍需由關卡設計者依畫面選格完成。

## 安裝、部署與回復

無套件、伺服器、資料庫、API 或存檔遷移。部署時須同版提供 HTML、兩個 `src/td/map-tools/` 腳本，以及 `maps.js` 和地圖 PNG。若回復，須將這些工具檔與版本／Service Worker 一同回到相同版本；玩家存檔不受影響。
