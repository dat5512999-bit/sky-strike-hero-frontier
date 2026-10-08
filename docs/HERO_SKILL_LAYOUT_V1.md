# 英雄技能卡排版修補 v1.0.0

> 發布更新（2026-10-08）：本功能已納入 v0.85.88 完整發布組合。以下保留獨立開發時的紀錄；目前版本、1055 項回歸測試及部署／回復流程以 [整合發布](FULL_RELEASE_V08588.md) 為準。

日期：2026-10-07。狀態：本機完成驗收，尚未發布 GitHub Pages。功能版號記錄於 package.json 的 heroSkillLayoutVersion；主程式版本仍為 0.85.87。

## 需求、原因與設計

組建遠征隊頁的大酋長技能圖示偏小且沉到框底，名稱溢出。盤點 11 位英雄發現霜原、大酋長、地精、娜迦、矮人、龍族、埃及、戰牛共 8 位受影響。守誓者、森語者、影行者使用舊式圖示，未出現同樣溢出。

HeroSkillPresentation 的真實 i／em 元件受到 td-expedition.css 舊版高優先級 display:block、頂部 padding 覆蓋。76px 卡片被先推下 52px，再排 26px 圖示與名稱，必然溢出；小螢幕也有同類衝突。素材存在，造型不是原因。

採最小共用修補：只針對遠征頁 data-icon-art=true 的技能卡，恢復兩列 Grid、清除舊留白和偽元素、允許卡片隨文字增高。桌面圖示 42px、卡片至少 76px；寬度 ≤1000px 或高度 ≤600px 時圖示 23px、卡片至少 48px。技能名稱可換行，提示保留。不重做美術、不動戰鬥技能列或數值。

## 架構、資料與 API

HeroRoster（名稱／提示／圖集） → HeroSkillPresentation（i 圖示＋em 名稱） → td-expedition.css（本次共用排版）。CosmeticArt 只換英雄肖像，沿用同一技能卡。

- 正式變更：td-expedition.css 尾端具名區段；package.json 新增功能版號與 qa:hero-skills 指令。
- 回歸測試：tests/td-hero-skill-layout.test.js。
- 真實瀏覽器驗收：scripts/qa-hero-skill-layout.cjs；產物在忽略追蹤的 artifacts/hero-skill-layout。
- 無新增資料夾架構、資料庫、HTTP API、存檔欄位、網路請求或權限；不改角色解鎖與商城資格。無逐幀程式或額外美術載入成本。

## 玩家與管理者操作

自由遠征 → 選擇戰場 → 組建遠征隊 → 切換英雄，查看「核心技能」。切換造型後相同技能仍應完整顯示。手機維持橫向，不需要新設定，也不要為此清除玩家存檔。

新增技能名稱時保留完整文字與 title 提示，不用固定高度裁切名稱。管理者不需新增權限或資料設定；之後修改開局 CSS 必須重跑下列幾何驗收。

## 安裝、測試與驗收

遊戲沿用 Node.js 18+、npm run serve:test，瀏覽器開啟伺服器回報網址的 td.html。沒有新增遊戲執行依賴。

```powershell
$env:TD_TEST_PORT='4177'
npm run serve:test
```

另開終端執行 npm test 與 npm run check。瀏覽器驗收需 Playwright 套件及 Edge；若不在環境內，先在專用 QA 環境提供這兩項工具，不需改玩家端依賴。Codex 附帶執行環境可用：

```powershell
$env:NODE_PATH='C:\Users\Owner\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules'
npm run qa:hero-skills
```

可用 HERO_SKILL_QA_URL 指定其他測試站網址。腳本使用隔離瀏覽器、停用 Service Worker，不讀寫玩家既有存檔。

已完成：

- 11 位原始英雄＋13 套英雄造型 × 5 個視窗（1440×900、1280×720、925×908、844×390、667×375），120 組全部通過。
- 檢查三張技能卡、名稱／提示／圖集一致、圖示尺寸、名稱與圖示不越框、不重疊、不出現雙重圖示；8 張專用圖集成功解碼。
- 往返新式／舊式英雄的單元測試通過；瀏覽器無 pageerror。
- 桌面及手機橫向截圖人工檢視通過；npm test 共 1036 項通過、npm run check 與 git diff --check 通過。
- 手機結果為 Edge 視窗模擬，尚非 iPhone Safari 實機驗收。

## 發布、快取、回復與 FAQ

本次尚未發布。發布時將 CSS 與版本交付一併納入既有 Pages 工作流程，統一更新主版號與 Service Worker 快取，再執行 npm run verify:pages 確認線上檔案相符；只有 push 成功不代表 Pages 已更新。

不涉及存檔遷移，既有匯出／匯入備份方式不變。回復本修補時只撤回 td-expedition.css 尾端的 Explicit atlas icons 區段、功能版號及新增 QA 指令／檔案；不要覆蓋其他未提交變更。已發布後須另升快取版本重新部署，不能清除玩家資料代替版本回復。

圖示還在框底？先確認是否仍開著未更新的線上版；檢查 CSS 已包含新區段，再重跑驗收。這不是缺圖，無須重畫技能圖集。其他造型會改善嗎？會，8 位英雄的造型沿用同一共用修補。
