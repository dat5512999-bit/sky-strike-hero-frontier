# v0.85.105 整合發布紀錄

2026-11-10（台灣）。依使用者「一起更新到 GitHub」的要求，整合先前未推送的 v0.85.101–105 工作。發布狀態：已推送 main，GitHub Pages 部署及正式站驗證成功。

程式提交：[27a5bb73a0c4e3c8f2adce4b1ce3988271748c33](https://github.com/dat5512999-bit/sky-strike-hero-frontier/commit/27a5bb73a0c4e3c8f2adce4b1ce3988271748c33)。[GitHub Actions 執行紀錄](https://github.com/dat5512999-bit/sky-strike-hero-frontier/actions/runs/42806156408) 全步驟成功，包含自動測試、打包、部署及 Verify live release。正式站回報 version=0.85.105、276 檔／282 次請求的內容驗證通過。

[開始遊戲](https://dat5512999-bit.github.io/sky-strike-hero-frontier/td.html)；[手機入口](https://dat5512999-bit.github.io/sky-strike-hero-frontier/td-mobile.html)。版本標記 v0.85.105 對應上述已通過 CI 的程式提交；後續僅補文件紀錄，不更動網站程式或素材。

## 本輪內容

- 全英雄進化流程、能力與 Lv.0 銜接、外觀偏好及比較介面改善；地精、矮人與大酋長進化動作更新。
- 大酋長野髮本體、覺醒／超凡，以及雷霆戰王、冥骨帝王、夜梟巡守三款既有商城造型重製。商品價格、所有權與玩家存檔保持相容。
- 手機圖片按需共用載入、有限重試、場景取消、閒置淘汰、小型縮圖快取、Canvas 失敗隔離，以及安全暫停與復原。
- iOS 玩家包準備工具、離線隱私／支援頁產生器與素材來源盤點。原生簽署、發行者／客服資料、權利核准、App Store 送審與 iPhone 實機驗收仍待完成。

## 發布前證據

本機 npm test 1,215／1,215 通過，語法／發布／音效檢查通過。手機 shell 壓測、44 組全英雄買石進化、三款大酋長購買裝備、更新保留資料、iOS 玩家包檢查已完成，詳見 [手機穩定性交付](MOBILE_STABILITY_V085105.md) 及其引用文件。手機尺寸的 Edge 測試不代表 iPhone 實機認證。

正式網站使用現有 main → GitHub Actions → Pages 流程，CI 會重跑語法、測試、網站打包及正式站逐檔比對。發布包包含現行美術及程式；本機 artifacts、瀏覽器資料、歷史回復包、native/ios/www 與已退役美術不會因這次提交而全部上傳到網站。iOS 原始設定與工具會提交，產生的 www 包仍留在本機。

## 玩家更新與回復

使用原遊戲網址及既有更新入口，確認顯示 v0.85.105。資料、造型所有權及既有進度不需清除。若手機仍出現凍結／重載，記錄錯誤編號、iPhone 型號、iOS 版本與當下畫面，保留存檔。

本輪之前 main 為 46e1a730ccf1b1c27ee0eb1fccf8e90061bee06c（v0.85.100 的發布紀錄）。回復手機修正至本機 v104 的九檔回復資料及完整 iOS 舊包位置見 [回復說明](MOBILE_STABILITY_V085105.md)。正式站回復需先保留目前提交及玩家資料，再以配對版本重新部署；不要以 reset --hard 或清除瀏覽器資料丟棄工作與進度。
