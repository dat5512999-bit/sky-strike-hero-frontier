# v0.71.3 GitHub 整合發布

本次發布包含第三張「暮秋遺跡 · 雙 U 型彎」、雙隘口道路校準，以及自 v0.64.0 以來已完成且相依的手機操作、角色動作、軍團與經濟、難度及積分功能。地圖設計與操作見 [暮秋遺跡](AUTUMN_RUINS_V0710.md)。版本與離線快取以 v0.71.3 為準，先前各節版號為功能開發記錄。

從 Git 暫存建立獨立發布副本後完成驗證，避免同工作區其他進行中修改影響發布內容：

- 390 項測試全數通過，語法檢查通過。
- 獨立副本以 4174 埠啟動，瀏覽器確認第三張選圖、載圖、完整路線實際怪物、重新挑戰、切圖、手機直橫向入口，無 JavaScript 錯誤。
- 180 隻怪物排隊與繪製抽樣 P95 約 5.7ms；這是本機瀏覽器抽樣，不代表所有手機 FPS。
- 證據：[測試](../artifacts/release-v0713/tests.txt)、[語法](../artifacts/release-v0713/check.txt)、[瀏覽器結果](../artifacts/release-v0713/browser-results.json)、[實際畫面](../artifacts/release-v0713/autumn-battle.png)。

發布目標為 origin/main，推送後由既有 GitHub Pages workflow 再驗證與部署。上一個遠端提交為 `89227f9`；回復可在乾淨副本簽出該提交或回復本次發布提交後重新部署，不使用強制推送。工作區備份與尚未完成的後續修改不包含在本次發布中。

更新者取得完整版本後執行 `npm test`、`npm run check`、`npm run serve:test`，開啟 `td.html` 並選擇暮秋遺跡。線上／PWA 更新後請關閉舊遊戲分頁再開啟；不要清除 localStorage 戰績。既有安裝、權限、備份與 API 使用方式沿用發布手冊。
