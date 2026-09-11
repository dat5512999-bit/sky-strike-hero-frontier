# 安裝手冊

> v0.30.0 新增的種族單位、三族大型建築與戰狼圖集均已保存於 `assets/td/`，不需另外下載素材或安裝套件。更新後若仍看到舊版，請關閉分頁後重新開啟，或清除該站台的 Service Worker 快取。

## 遊玩安裝

1. 將整個專案資料夾複製到 Windows 電腦。
2. 確認資料夾結構完整，不要只複製 `index.html`。
3. 安裝最新版 Chrome 或 Edge。
4. 雙擊 `index.html` 即可，不需網路與伺服器；開始畫面應同時顯示四種難度、六套外觀與「突破 100 波遠征」說明。開始標準模式後右下角應顯示「防線 5 / 5」。
5. 塔防模式可從開始畫面的連結進入，也可直接雙擊 `td.html`；應顯示人族邊境戰場、職業選擇、240G、5 木材、0 功勳與 20/20 城門。
6. 確認 `assets/td` 包含戰場、建築、敵軍及三張 `*-actions-v1.png`；缺少時遊戲仍會顯示簡化圖形，但不屬於完整 v0.16 美術交付。
7. 使用頂端「介面」選單輪流切換自動、電腦、手機，確認戰局不會重開；重新整理後應維持最後選擇。
8. 選職後確認顯示 18 秒準備與下一波情報，按「立即開始」可跳過倒數；部署一名職業守軍與一座防禦塔，再確認移動、攻擊移動、固守與停止。

## 開發環境（選用）

安裝 Node.js 18 或更新版本後，在專案根目錄執行 `npm test`。本專案不需 `npm install`。

## 手機

手機不需安裝檔。部署至 GitHub Pages 後，以 Safari／Chrome 開啟公開網址；需要類似 App 的體驗時選擇「加入主畫面」。iOS 與 Android 的選單名稱可能略有不同。

## v0.17.0 英雄與指揮介面

完整複製新版檔案，確認 assets/td/hero-actions-v1.png 存在。開啟 td.html，選職後應看到女英雄與固定頭像、霜環、招募／建造分類。點頭像再點地面可控制英雄；按暫停能安心練習部署。

## v0.18.0 英雄技能與種族塔

安裝方式不變：完整下載專案後開啟 td.html，或 npm run serve:test 後開啟 http://127.0.0.1:4173/td.html。必須保留新增三個 JS 模組與 assets/td/faction-towers-v1.png。無新增套件或帳號要求。

## v0.19.0 英雄流派與傭兵館

安裝方式不變，開啟td.html或執行npm run serve:test。完整下載時須包含 src/td/systems/HeroRoster.js；無新增套件。首次進入直接選英雄、招募守軍或傭兵、部署後開始第一波。

## v0.20.0 敵軍動作第一階段

安裝方式不變。完整下載專案須包含assets/td/enemy-grunt-actions-v1.png、enemy-runner-actions-v1.png、enemy-brute-actions-v1.png。開啟td.html可玩，無新增套件。

## v0.21.0 RTS 指揮介面

安裝方式與需求不變，無新增套件。開啟 `td.html` 後應看到黑鐵金框 HUD、頂部速度鍵與右側英雄指揮面板；若仍見舊介面，HTTP／GitHub Pages 使用者請重新載入以更新 Service Worker 快取。

## v0.22.0 戰鬥回饋

無新增套件。完整下載須包含 `src/td/systems/CombatFeedbackSystem.js`；進入戰鬥後應看到傷害與 Gold 跳字。若頁面空白，確認此檔案與 `td.html` 的載入順序完整。

## v0.23.0 戰鬥生命週期

不需新增套件或資料庫。確認 `src/td/systems/EnemyCombatSystem.js` 存在，並由 `td.html` 在 `TDGame.js` 前載入；若更新後仍見舊行為，重新整理一次讓 v0.23.0 Service Worker 接管。

## v0.24.0 黃金 15 波

安裝條件不變。完整專案必須包含 `TDDifficultySystem.js` 與 `EnemyTraitSystem.js`，兩者均需在 `TDGame.js` 前由 `td.html` 載入。HTTP 或 GitHub Pages 更新後重新整理，看到四個難度選項即代表 v0.24.0 已載入。

## v0.31.0 戰地軍械

無新增套件、伺服器或資料庫。完整下載需含 `src/td/systems/ArmorySystem.js` 與 `assets/td/items/equipment-atlas-v1.png`；兩者已列入 `td.html` 及離線快取。選角後看到選取卡下方「軍械庫」即代表新版已載入。

## v0.32.0 唯一軍械

安裝需求不變。更新後軍械庫上方應看到武器／護甲／戰器三個欄位；若未出現，重新整理以更新 `sky-strike-v0.32.0` 離線快取。
