# v0.85.19 第一章掉落與配裝新手教學

## 交付結果

第一章第一關的引導不再只用文字提到裝備。第三波守成後，玩家必須按亮起的「獅心王弓」領取掉落，系統選取王國獵手，接著按「裝備」和軍械面板內亮起的「裝上」。完成真正的 `ArmorySystem.equip()` 後才算教學完成。

每個唯一目標會暫時移至 `body`，固定在原本的畫面座標並維持事件處理器；黑幕因此無法壓暗它。完成、返回上一步或跳過時，placeholder 會把控制項放回原本容器與樣式。部署、掉落、配裝步驟會暫時停用其他選項，避免新手誤按而離開正確流程。

## 玩家操作

1. 第一關部署王國獵手、開啟商城並購買指定武器，再按「立即迎戰」。
2. 第一波後可查看升級，繼續守住第二、第三波。
3. 第三波結算畫面中按亮起的「獅心王弓」。軍械波必定出現此獎勵；其他精英敵人仍可能在一般流程掉落裝備。
4. 系統已選好王國獵手。按亮起的「裝備」，在軍械庫按亮起的「裝上」。每個士兵限穿一件；獅心王弓立即提高攻擊、射程與目標數。
5. 「跳過引導」會移除黑幕、聚焦控制項與暫停狀態，戰鬥可照常繼續；任務頁可重玩教學。

## 架構與 API

`TutorialSystem` 管理階段、遮罩與回復；不直接改寫掉落或軍械規則。`TutorialIntegration` 監聽既有 `claimLoot`、`openEquipmentPicker` 與 `ArmorySystem.equip` 成功結果，再通知教學前進。`ArmoryUI` 將實際持有的物品 id 輸出為 `data-equip-gear`，支援重複物品 id（例如 `lion-bow#2`）。沒有 HTTP API、資料庫或存檔 schema 變更。

```text
第三波完成 → LootSystem / claimLoot → TutorialSystem.onLootClaim
       → 選取 hunter → openEquipmentPicker → onEquipmentPickerOpened
       → ArmorySystem.equip(lion-bow, hunter) → onEquipmentEquipped → 完成
```

## 安裝、部署、回復

需求仍是 Node.js 18+ 與既有靜態站流程，沒有新增套件或設定。部署必須同時包含 `src/td/systems/TutorialSystem.js`、`src/td/app/TutorialIntegration.js`、`src/td/systems/ArmoryUI.js`、`td-tutorial.css`、`src/td/app/StoryCatalog.js`、`td.html`、`update.html`、`package.json`、版本顯示檔與 `sw.js`。快取名稱為 `sky-strike-v0.85.19`。

更新後重新開啟遊戲頁；若仍看到舊黑幕行為，先用 `update.html` 取得新 Service Worker，再重開頁面。本版沒有資料遷移。回復時將上述檔案與快取名稱一起回復到同一版本；不要只回退單一教學腳本。

## 管理與 QA 清單

- 確認亮起的王國獵手卡、商城入口、立即迎戰、獅心王弓、裝備及裝上按鈕均比黑幕亮、可點擊，且其他選項不可誤點。
- 確認第三波領取獅心王弓後已選取獵手；只有成功把弓裝到獵手才結束引導。
- 按關閉配裝面板時，提示應回到「裝備」；按跳過或完成後沒有殘留黑幕、placeholder 或停住的倒數。
- 執行 `node --test tests/td-tutorial.test.js`、`npm run check` 及 `git diff --check`；實機以重玩新手引導驗收桌機與手機橫向版面。

## 常見問題

**亮起的卡片還是變暗？** 確認開場為 v0.85.19，更新 Service Worker 後再開頁面。目標本身會在黑幕上方，非目標控制項則預期保持變暗。

**我拿到弓但教學沒有結束？** 需要先按獵手的「裝備」，再按弓旁的「裝上」。只領取掉落不算完成。
