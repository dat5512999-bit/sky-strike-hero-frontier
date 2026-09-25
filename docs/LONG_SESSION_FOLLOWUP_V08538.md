# v0.85.38 長局模擬後續：倍速保護與缺木提示

## 需求與決策

固定時序探針顯示，10 FPS 下維持 ×3 會持續碰到每影格 12 次更新的安全上限。玩家會看到動畫與戰鬥時間節奏不一致。改以持續過載的實際略過時間作為判斷；短暫卡頓或切回分頁不改速度。玩家選擇的 ×3 保留，系統暫時以 ×2 運行並明示，連續穩定後恢復 ×3。

第 5 波的「有金無木」先補測實際經濟與部署規則，再決定提示。固定採購在第 5 波失敗；缺木時升級既有士兵的路線走完 30 波，但城門只剩 1 點；只額外雇一名免木材傭兵仍在第 5 波失敗。這些是固定位置、固定購買時機、自動戰鬥的機器策略，不代表玩家勝率。因此加入有可負擔升級時的提示，不改木材、敵軍或難度數值。

## 架構與介面

`FrameTimingSystem.js` 中的 `SpeedLoadGuard` 只讀每幀經過時間與累計略過量。×3 連續 1.5 秒內略過至少 250 ms 遊戲時間時轉為有效 ×2；有效 ×2 下連續 6 秒每影格不超過 55 ms 且沒有新增略過時間，才嘗試恢復 ×3。`TDGame.loop()` 用有效速度送入原計時器；效能面板也顯示有效速度。暫停、單幀超過 250 ms、或手動選擇其他倍速，都會清除觀察視窗。單幀上限與戰鬥數值保持原樣。

頂部倍速控制仍標示玩家選的 ×3；保護期間另外顯示「效能保護 ×2 → ×3」，並以輔助閱讀標籤說明目前是二倍速、穩定後回三倍速。木材為零、手上有可負擔的既有士兵升級且仍在對局時，指令說明追加「木材用完：選擇既有士兵升級，只花金幣」。密集怪群的控制狀態徽記會依序嘗試右、左、上方空位；沒有空位時略過該枚文字徽記，控制特效仍保留。沒有新的 API、資料庫、權限或存檔欄位。

## 可重現測試與結果

`node scripts/qa-long-session.cjs` 輸出 `artifacts/qa-long-session/results.json`。30 分鐘固定 10 FPS ×3：原計時略過 3,600,000 ms，保護後略過 3,000 ms，保護 17,985 影格；15 FPS ×3 全程無略過且不啟動保護。這是虛擬時序驗證，不能推論實機 FPS 或 GPU 負載。

安裝 Playwright 並有 Edge 的測試環境可執行 `node scripts/qa-browser-run.cjs --normal --strategy=baseline|upgrade|mercenary|mixed`。輸出 `artifacts/qa-long-session/browser-run-normal-*.json`，記錄每波城門、資源、守軍、操作和缺木提示。結果：baseline 第 5 波失敗；upgrade 第 30 波通過、城門 1/20；mercenary 第 5 波失敗；mixed 第 30 波通過、城門 1/20。全部沒有頁面錯誤。探針使用正式 `TDGame.update()`，但不模擬真人操作、畫面幀率、繪圖負擔或不同地圖；後段經濟盈餘亦受固定 26 名士兵上限影響，不宜用來直接改平衡。

`node --test tests/td-frame-pacing.test.js tests/td-accessibility-motion.test.js` 驗證長期過載、穩定恢復、暫停、單次卡頓與徽記避讓。`node scripts/qa-speed-status.cjs` 用 Edge 檢查桌面和橫向小視窗的標籤位置，截圖寫入 `artifacts/qa-long-session/`。`npm test` 與 `npm run check` 為發布前門檻。仍需在低中階 Android Chrome 與 iPhone Safari 實測霜原第 20／30 波熱機、狀態徽記擁擠時的可讀性，以及真人多套早期戰術。

## 安裝、更新與回復

沿用 Node.js 18+ 與靜態部署，無新執行期依賴。完整同步 `FrameTimingSystem.js`、`TDGame.js`、`td.html`、`td-accessibility.css`、`sw.js` 及版本標記；Service Worker 快取為 `sky-strike-v0.85.38`。舊畫面使用 `update.html` 更新後重開。回復到 v0.85.37 時同步回復以上檔案與快取版本；沒有玩家資料遷移。不要只回復倍速按鈕，否則提示與有效速度可能不一致。
