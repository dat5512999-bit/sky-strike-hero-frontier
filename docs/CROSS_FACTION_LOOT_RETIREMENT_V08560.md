# 跨軍團戰利品解鎖退役 · v0.85.60

日期：2026-09-27
狀態：本機完成，未部署

## 目的與範圍

新一局遠征的戰利品不再解鎖其他軍團的核心兵種或建築，避免掉落卡改變已選軍團的編制。此版只處理獎勵來源；傭兵館、軍團名冊、戰鬥數值、地圖、手機操作與既有裝備均不變。

退役的歷史卡為：`dragon-egg`（翡翠幼龍）、`bone-contract`（骷髏衛士／靈魂收割塔）及 `royal-armory`（重裝盾衛）。它們保留在 `LootSystem.ITEMS` 並標記 `legacy:true`，因此舊戰利歷史、章節存檔與舊記錄仍能顯示原名稱；新獎勵池不會再發放。

第 10、15 波原本的固定跨族解鎖改為各一份 `frontier-supplies`。補給只提供既有的金幣與木材，不改變 `FactionSystem` 可建清單。里程碑以保存於既有 `loot.claimed` 的 `milestone-10`／`milestone-15` 標記防止同一波重複領取。

## 玩家操作

玩家不需要學習新按鈕。新局在第 10、15 波後只會獲得「邊境補給」，不會出現翡翠龍、幽骨契約或王國軍械箱的選擇。傭兵館仍維持原樣，這次沒有移除、增加或重新排序傭兵。

## 架構與內部介面

```text
Wave 10 / 15 結算
  → LootSystem.milestone()
  → milestone-{wave} 防重複標記
  → LootSystem.grant('frontier-supplies')
  → EconomySystem（既有金幣／木材）

createOffers() / 歷史存檔
  → legacy:true 卡片不進新獎勵池
  → 舊 claimed / history 仍可用 ITEMS 查名
```

`LootSystem` 的公開呼叫參數不變；`milestone(wave, context)` 在第 10、15 波的回傳物由跨族解鎖卡改為 `frontier-supplies`。沒有 HTTP API、資料庫、帳號、權限或存檔 schema 變更。

## 安裝、部署與更新

不需新增套件或設定。版本升為 `0.85.60`，Service Worker 快取鍵為 `sky-strike-v0.85.60`。部署時需一起發布 `package.json`、`sw.js`、`src/td/systems/LootSystem.js`、測試與本文件；玩家以既有更新頁完成新版快取啟用，不應清除網站資料。

## 備份、還原與相容性

更新前可依 [備份與還原手冊](BACKUP_RESTORE.md) 匯出瀏覽器資料。更新不會移除進行中舊局已解鎖的外族單位，也不會重寫舊 `loot.history`；它只阻止新局取得新的跨族解鎖卡。若回退到 v0.85.59，請先備份玩家資料；舊版會再次將這些卡視為可發放內容。

## FAQ

**為什麼沒有翡翠龍卵或幽骨契約？** 它們已退役，讓所選軍團維持自己的核心編制。

**傭兵館被刪除了嗎？** 沒有。本次不更動傭兵館。

**舊存檔中的翡翠龍或靈魂塔會消失嗎？** 不會；既有存檔保持可讀且不強制收回內容。

## 測試清單

1. 每個軍團呼叫 `createOffers()`，不得取得三張退役跨族解鎖卡。
2. 第 10、15 波各取得一次 `frontier-supplies`，重複呼叫同一波不得重複領取。
3. 第 10、15 波後不得新增 `dragon`、`skeleton` 或 `soul` 到王國軍團的可建清單。
4. 舊 `legacy` 物件仍可透過 `LootSystem.ITEMS` 讀取。
5. 執行 `node --test tests/td-core.test.js tests/td-field-loot.test.js`、`npm run check` 與 `npm test`。
