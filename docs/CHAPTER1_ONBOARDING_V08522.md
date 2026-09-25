# v0.85.22 第一章聚焦亮度與波次恢復

## 玩家操作

第一波結束後，王國獵手會被綠色光圈框住。畫面只會壓暗光圈以外的區域；光圈內的獵手與地面保持原來亮度，所以玩家能辨認目標並直接點選。選取後才會進入升級說明，且回收仍維持鎖定，避免示範士兵被誤賣。

第三波的戰利品等待仍是刻意的教學停點，但它會說明原因與下一步。玩家完成配裝、按跳過引導，或教學因例外被關閉時，遊戲會關閉教學開啟的彈窗、解除波次等待，並立即恢復進行；後續第四、第五波依正常倒數或「立即迎戰」開始，不會顯示無法理解的「已暫停」。

## 實作與架構

`TutorialSystem.positionUnitFocus()` 以地圖座標計算固定螢幕光圈。選取步驟不再顯示 `#td-tutorial-dim`；`#td-tutorial-unit-focus::before` 建立只覆蓋圈外的遮罩，讓單位本體留在透明開口中。這個覆蓋層不攔截滑鼠或觸控事件。

`TutorialSystem.dismissTutorialModal()` 是所有教學收尾的單一出口：隱藏由教學開啟的戰利品／配裝面板、重設 `game.paused` 與暫停鈕標示。`deactivate()` 接著呼叫 `WaveSystem.holdPreparation(false)`，確保不會遺留準備期鎖定。

```text
第一波結束 → 圈外壓暗、圈內獵手明亮 → 點選獵手 → 升級引導

第三波戰利品 → 配裝／跳過／收尾 → 關閉教學彈窗 + paused=false + 解除波次等待 → 下一波倒數
```

沒有新增資料庫、HTTP API、權限或存檔欄位；既有存檔可直接使用。

## 安裝、部署、回復與驗收

需求仍為 Node.js 18+，不新增相依套件。部署時需一併發布 `TutorialSystem.js`、`td-tutorial.css`、`TutorialIntegration.js`、版本顯示檔、`package.json`、`update.html` 與 `sw.js`，離線快取名稱為 `sky-strike-v0.85.22`。更新後重新開啟遊戲；若仍載入舊檔，先開啟 `update.html` 更新快取。

回復時需同時還原上述檔案與快取版號，避免 HTML 與 Service Worker 版本不一致。

QA：第一波後士兵本體保持明亮且可點選；完成或跳過所有教學分支後不顯示任何教學彈窗；第三波戰利品後繼續、跳過與例外收尾都會啟動下一波倒數；執行 `node --test tests/td-tutorial.test.js tests/td-story-maps.test.js tests/td-profiles-story.test.js`、`npm run check` 與 `git diff --check`。
