# v0.85.13 第一章圖像劇情卡與線索推進

## 產品目的與範圍

第一章四個目前可玩的任務，皆在開戰前提供三張短劇情卡，將原本只靠一行任務說明的敘事，改為玩家可自行翻閱的「場景、人物、目的」節奏。每關勝利後，結算畫面會追加一段「線索推進」，把玩家帶到下一關的調查動機。

本版只補齊已開放的第一章，沒有新增第二章、英雄、軍團、戰鬥數值、存檔欄位或真兇定論。故事持續保留三個核心界線：王子之死尚未破案、禁忌歷史不是現代暮影族有罪的證明、王城內的命令來源仍待調查。

## 第一章內容節奏

| 任務 | 三幕內容 | 勝利後的線索推進 |
| --- | --- | --- |
| 烽火初燃 | 邊境示警 → 雷恩的誓言 → 受命的王國士兵 | 殘缺命令名冊顯示有人正利用王國混亂。 |
| 溪谷餘音 | 抵達銀葉溪谷 → 查閱舊盟約 → 護送記錄撤離 | 銀葉與暮影曾共同封存危險技術，但不足以判定王子之死。 |
| 舊城疑雲 | 聆聽暮影證言 → 查看封存遺物 → 護送證人離城 | 沒有證據證明現代暮影重啟禁忌；有人希望調查停在這裡。 |
| 裂谷守望 | 進入冰原裂谷 → 發出護送訊號 → 守住最後橋頭 | 殘存調度紀錄指出王城另有不受禁衛軍管轄的命令系統。 |

## 原創 Key Art 資產

| 任務 | 檔案 |
| --- | --- |
| 烽火初燃 | `kingdom-border-at-dusk-v2.png`、`rhen-oathkeeper-v2.png`、`kingdom-checkpoint-order-v2.png` |
| 溪谷餘音 | `silverleaf-valley-arrival-v2.png`、`silverleaf-record-study-v2.png`、`silverleaf-bridge-escort-v2.png` |
| 舊城疑雲 | `shadowfall-testimony-v2.png`、`shadowfall-archive-reliquary-v2.png`、`shadowfall-evacuation-v2.png` |
| 裂谷守望 | `frostborn-chasm-route-v2.png`、`frostborn-bridge-signal-v2.png`、`frostborn-last-bridge-v2.png` |

所有檔案位於 `assets/td/story/`，以 built-in ImageGen 生成；共通約束是高階奇幻遊戲 Key Art、16:9、左側保留繁中劇情文字空間、無文字、無商標、無浮水印。v2 另受 `chapter1-hero-continuity-v1.png` 與 [角色連貫規格](STORY_CHARACTER_CONTINUITY_V1.md) 約束，主英雄的五官、髮型、眼色、種族特徵和原版裝備輪廓必須與遊戲未套造型選角圖一致。v1 檔案僅作可回復備份。銀葉畫面表現謹慎合作；暮影畫面以平民、證言與撤離取代反派視覺；冰原畫面著重護送與守橋，而非提前指認命令的來源。

## 玩家操作

1. 開啟 `td.html` → 劇情模式 → 選取已解鎖的第一章任務 → 「開始挑戰」。第一關首次會先播放或跳過序章，之後進入三張戰前劇情卡。
2. 每張卡可按「下一幕」前進；最後一張按「開始戰鬥」。任一張皆可按「跳過並出征」，卡片不自動翻頁。
3. 章節頁的每一關都有「回顧本關劇情」。回顧可快速翻頁或返回章節，不會進戰鬥、不會修改存檔。
4. 勝利結算的「線索推進」是調查方向，不是最終真相；請依序通關解鎖下一關。

## 系統與資料流

```mermaid
flowchart LR
  A[StoryCatalog missions[].storyCards] --> B[FrontierApp 劇情卡畫面]
  C[第一關序章完成或已看過] --> B
  B -->|最後一張或跳過| D[既有 launchStory 戰鬥入口]
  E[章節頁回顧本關劇情] --> B
  B -->|回顧結束| F[章節頁]
  D -->|勝利| G[ResultScreen 線索推進]
```

`src/td/app/StoryCatalog.js` 為每個任務保存劇情卡、短句、圖片與勝利後線索；`src/td/app/FrontierApp.js` 保存目前所選關卡，管理翻頁、跳過、回顧及正確進入該關戰鬥；`src/td/systems/ResultScreen.js` 在故事模式勝利時顯示線索；`td-lobby.css` 與 `td-result.css` 負責排版及多行結果文字。沒有資料庫、HTTP API、新權限或存檔格式變更。

## 安裝、更新與部署

沿用 Node.js 18+ 與靜態網站部署。開發者執行 `npm run check`、`npm test`，再執行 `npm run serve:test`，於瀏覽器開啟 `http://127.0.0.1:4173/td.html`。玩家不需額外安裝或設定。部署時必須同步更新程式、十二張第一章圖片、Service Worker 與版本資訊；使用既有 `update.html` 更新入口。更新前可在大廳設定匯出完整備份，雖然本次沒有存檔格式變更。

## 驗收與排錯

- 四個可玩任務各有三張可解碼圖片、可翻頁、可跳過，最後一張會進入所選關卡而非第一關。
- 回顧任何已解鎖關卡會回到章節頁，且不寫入存檔。
- 故事模式勝利的結果卡會顯示該關「線索推進」。
- 文字和按鈕在桌機、橫向與直向手機容器均不可被裁切；`prefers-reduced-motion` 會停用動畫。
- 圖片失效時仍有文字及操作按鈕；若畫面仍是舊版，使用大廳設定的更新入口重試。
- `node --test tests/td-prologue-cinematic.test.js tests/td-story-maps.test.js` 驗證劇情、線索與解鎖；`scripts/qa-story-cards.cjs` 可在有 Playwright、Edge 與本機測試伺服器時做瀏覽器驗收。

## 回復與後續

先保留玩家匯出備份，再對本版提交執行 `git revert <提交>`，一起回復程式、圖片、CSS 與文件；不要清除瀏覽器玩家資料。第二章仍不可進入。要擴寫後續章節前，須先核定新的戲劇事件與史料揭露時機，不可把本章的懷疑、傳聞或未驗證遺物改寫為定論。
