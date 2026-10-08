# v0.85.88 整合發布（2026-10-08）

## 完整交付

音效（44 組英雄技能音色、士兵／塔攻擊、操作／戰況、混音及環境聲）、英雄技能卡排版、劇情慢載備圖與失敗重試、故事漫畫閱讀器同版發布。保留 v0.85.87 地圖行動、既有進度及戰鬥橫向设计。沒有新增付費、權限、HTTP API 或資料庫遷移。

## 安裝、設定與操作

Node.js 環境執行 npm run serve:test，依終端網址開啟 td.html。正式站使用 GitHub Pages 的 td.html，audio-preview.html 可逐項試聽。點擊頁面解鎖音訊，再由遊戲設定調整混音；劇情配樂獨立開關。首次接手依 INSTALLATION.md、USER_GUIDE.md、ADMIN_GUIDE.md 操作。

## 架構與 API

成功遊戲事件 → AudioIntegration → AudioCatalog → GameAudio → WebAudio；FrostlandAudio 共用 context。StoryCatalog → StoryComicBook → FrontierApp → 圖片載入／StoryMusic。技能卡僅修正作用域內 CSS。音效偏好 heroFrontierAudioMixV1 與玩家進度分開，不需要環境變數或新執行階段依賴。詳細介面見 API.md 與 GAME_AUDIO_V1.md。

## 發布與 QA

主版號、HTML、ProfileStore、戰報、更新頁及 Worker 快取均為 0.85.88。完整提交後推送 main，由 Deploy GitHub Pages 進行語法檢查、測試、打包、部署與線上雜湊驗證。須以此提交的 Actions 成功和線上比對結果判定部署完成，不以 push 成功代替。

發布前 npm run check、check:release、check:audio、check:site 通過；npm test **1055/1055** 通過。qa:audio 通過 73 組非零無削波音訊、3600 次請求的資源上限與靜音清理；qa:hero-skills 通過 11 位英雄、13 套造型、5 種尺寸共 120 組。發布包 722 檔約 796 MB，排除概念稿與參考圖。

部署後執行 npm run verify:pages，比對正常網址／版本網址、HTML／CSS／JS／Worker 及劇情圖片；另用新瀏覽器工作階段檢查入口、漫畫與音效模組。

## 更新、FAQ 與回復

若線上仍見舊畫面，先確認工作流程成功，結束戰鬥並關閉舊分頁，再開 update.html 更新快取；不要刪除玩家 localStorage。沒有聲音先檢查裝置、音效總開關與音量，再點擊畫面。

發布前基準提交 bd8698d（v0.85.87 加站台整理），本次標籤 v0.85.88。更新前可匯出玩家 JSON。回退時以新提交恢復基準完整程式／資產，採用更高修復版號及新 Worker 快取，重走測試與部署；不可 force push 或清除玩家資料。存檔以遊戲匯入功能還原，細節見 BACKUP_RESTORE.md。

## 驗收界線

音效為原創合成，非真人配音或每兵種獨立錄音；自動測試不代表主觀聽感已由玩家認可。實體 iPhone Safari、長時間遊玩與玩家聽感仍需真機驗收。各功能文件保留早期驗收數字與開發狀態，本頁為整合版本的發布依據。
