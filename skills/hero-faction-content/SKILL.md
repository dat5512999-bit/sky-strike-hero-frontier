---
name: hero-faction-content
description: Extend HERO FRONTIER with a playable hero or faction while preserving existing weapon upgrades, shops, loot, equipment, art, saves, and tests. Use for new heroes, factions, or their item progression; not for unrelated UI or balance edits.
---

# HERO FRONTIER 英雄與軍團內容

先讀取目前實作與相關文件，確認需求是新增英雄、軍團，還是兩者都有。英雄和軍團可以自由組隊；不要因名稱相同就把兩者綁死。以現有系統為基準，保留舊存檔相容性。

## 開發順序

1. 定義角色與軍團的定位、可用單位、技能和裝備相容對象，確認哪些內容是正式設定、哪些仍是概念。
2. 新英雄沿用 `EquipmentSystem` 的職業武器架構：一件初始武器，以及在戰鬥商店購買的 **三個連續升級階段**（Lv.1／Lv.2／Lv.3）。每階要有名稱、稀有度、描述、實際效果和能辨認的視覺表現；`ShopSystem` 的既有 `spear` 商品顯示下一階，滿級停止購買。不要另造平行的武器購買或存檔欄位。先對照既有英雄的價格和成長規則，特例須有明確玩法理由。
3. 軍團士兵裝備沿用 `ArmorySystem` 的取得、適用、比較、裝備與歸還流程；專屬與跨軍團通用裝備都要明列相容類型。英雄武器升級與士兵軍械是兩條不同進度，不互相代替。
4. 戰鬥商店（`ShopSystem`）提供適用的武器升級與軍械；怪物掉落／波次獎勵（`LootSystem`）先檢查目前英雄、軍團及可使用單位，避免把完全無法裝備的專屬軍械當成獎勵。保留可用的通用獎勵，並讓卡片說明適用者與效果。獨立外觀商城只處理外觀，除非使用者另有要求。
5. 補齊角色、武器、道具圖示及戰場辨識；檢查選角、商城、掉落、軍械庫、戰場與窄螢幕的一致性。不要用圖示或文案宣稱尚未實作的效果。
6. 測試三階升級及滿級、經濟不足、掉落適用性、裝備轉移、跨英雄×軍團組合、舊存檔，以及新效果的實際戰鬥結果。同步更新相關玩家文件、API／架構說明、測試清單與更新紀錄；只宣告實際完成的內容。

## 目前專案位置

- 英雄武器與投射效果：`src/td/systems/EquipmentSystem.js`
- 戰鬥商店：`src/td/systems/ShopSystem.js`
- 可裝備軍械：`src/td/systems/ArmorySystem.js`
- 波次獎勵與怪物掉落：`src/td/systems/LootSystem.js`
- 英雄／軍團設定：`src/td/systems/ProfessionSystem.js`、`src/td/systems/FactionSystem.js`

檔案與規則可能演進；每次先確認現況，不照舊清單盲目新增。
