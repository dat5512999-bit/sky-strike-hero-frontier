# v0.85.96 GitHub 完整發布紀錄

2026-10-11。使用者要求完整更新 GitHub，完成後繼續製作後續劇情。本次發布包含自 v0.85.88 後尚未上線的角色音效、戰牛語音、手機 HUD 修正、44 頁新版漫畫、分段故事入口及相關文件。未新增戰鬥數值或刪除舊通關資料。

## 發布狀態

已完成發布。正式提交 `361419b199b067bcf9a5922c99545f29dc5b5cdb`，回復標籤 `v0.85.96`；[Pages 工作流程 38127822736](https://github.com/dat5512999-bit/sky-strike-hero-frontier/actions/runs/38127822736) 已成功。正式入口為 [英雄邊境 v0.85.96](https://dat5512999-bit.github.io/sky-strike-hero-frontier/td.html?release=0.85.96)。

發布驗證文件提交 `c3018bf6d2bae4458762122c8b3d19dba9b94242` 亦已推送，[後續工作流程 38133363720](https://github.com/dat5512999-bit/sky-strike-hero-frontier/actions/runs/38133363720) 已完成且成功；正式遊戲檔案及版本不變。

本機另向正式站執行 `verify:pages`：233 檔、239 次內容雜湊比對通過；包含 44 張 WebP、五段語音、遊戲入口及一般／帶版本網址的 Worker。四尺寸線上布局驗收通過，主按鈕可見且外層不捲動。`qa-pages-update.cjs` 使用獨立 Edge 設定檔，更新後程式與 Worker 都為 0.85.96、舊測試快取已移除、localStorage 測試資料保留；測試起始站已為 0.85.96，故這不是實際舊 Worker 升級或 Safari 真機的證明。

## 發布與回復範圍

目的儲存庫為 `dat5512999-bit/sky-strike-hero-frontier`，沿用 `main` 及現有 GitHub Pages Actions。發布前遠端與本機基底均為 `cbc40b7`，無分岔；此提交保留作上一個線上版本的回復點。正式網站使用 `scripts/build-static-site.cjs` 的清單，排除 concepts、參考圖及 QA 資料。

原圖、修稿與提示詞會保存於原始碼儲存庫供回復，但不進入正式網站。沒有上傳本機瀏覽器設定、帳號密鑰或玩家存檔。新版本沿用玩家隔離資料，舊書籤保留。

## 逐檔線上驗證

`scripts/verify-pages-release.cjs` 除既有 HTML、JS、CSS、Worker 與特效外，新增從正式 Catalog 讀取全部 44 張 WebP，並檢查戰牛五段 WAV、語音清單及來源權利紀錄。檢查以內容雜湊比對本機，不只判斷 HTTP 200 或畫面版本號；入口與 Worker 同時驗證一般網址及帶版號網址。純文字檔正規化 CRLF／LF，圖片與音訊保留原始 bytes 比對。

語音供應者的[中文頁面](https://voice-generator.com/text-to-speech/chinese)於本日仍列明允許商業使用，[服務條款](https://voice-generator.com/terms)仍標示 Kokoro／Apache 2.0。這是供應者聲明的複核，不是獨立法律保證；原台詞及處理方式保留在素材清單。

## 玩家更新方式

部署確認後開啟正式遊戲，版本應為 0.85.96。劇情模式可見「新版故事／既有挑戰」、九段漫畫與固定觀看按鈕。若仍舊版，先用遊戲既有更新入口重新載入，不要刪除網站資料或重開新存檔。iPhone Safari／主畫面模式仍需玩家實機驗收。

## 驗收與續作邊界

發布前重跑完整測試、語法與靜態清單；既有桌機及橫向手機 QA 見 [漫畫驗收](STORY_MANGA_V08596.md)。部署完成前不開始新的漫畫圖稿，避免把未驗收續篇混入這一版。續篇另存新檔與製作紀錄，承接第 44 頁，維持三位英雄外貌及已確認因果，不提前用作者旁白揭露核心真相。
