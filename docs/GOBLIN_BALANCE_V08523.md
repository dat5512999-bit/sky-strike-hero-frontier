# 地精工程團：判斷資訊與首波平衡（v0.85.23）

日期：2026-09-24。狀態仍為 **TESTABLE / STORY_LOCKED**；本次不增加劇情、解鎖、帳號權限、資料庫或存檔欄位。

## 玩家操作

地精沒有新增強制教學或指定開局。玩家仍可自行研究配置，但現在可直接看到決策結果：

- 游標帶著耗電裝置移動時，戰場預覽會顯示「預計供電 已用／容量」或「預計缺電」。判定與實際機座距離、容量及搶電順序相同。
- 選取動力機座會顯示目前「供電 已用／容量」。
- 奇克 Q「臨場改裝」固定選 210 範圍內最近的**已供電攻擊機械**；目標顯示淺綠虛線環 5 秒。奇克自身攻速 +30%，目標傷害 +42%、攻速 +20%。若沒有合格目標，Q 仍只強化奇克。
- 供電中的回收技師會用黃綠虛線連到 155 範圍內最近的可攻擊建築；同時只支援一座。

F「全網超載」的 5 秒爆發與 7 秒停機規則不變；這次沒有把地精改成固定建築順序。

## 平衡

| 項目 | 原值 | 新值 | 目的 |
| --- | ---: | ---: | --- |
| 奇克普攻 | 14 | 16 | 未完成電網時仍能參與首波。 |
| 連發火器手傷害 | 16 | 18 | 讓機座投資後有合理的首波火力餘裕。 |
| 鉚釘重射手 | 穿甲 | 穿甲、對重甲 +25% | 抵銷穿刺對重甲的類型劣勢，維持慢速遠距點殺定位。 |
| Q 目標攻速 | 0% | +20% | 讓改裝的短暫爆發可感知。 |

沒有更改價格、初始 240G／5 木、機座容量、回收站每波 72G 總上限、F 停機時間、英雄三階武器、軍械上限或掉落池。地精英雄仍沿用工程扳手及三次商店升級；軍械、掉落適用性與自由英雄 × 軍團組合沒有變動。戰報平衡版號更新為 `goblin-balance-v08523`，舊戰績會保留，但不會和新數值的比較樣本混用。

## 架構與內部介面

`GoblinNetworkSystem.preview(items, candidate)` 以與 `update()` 相同的距離與容量分配規則回傳 `{ powered, source, used, capacity }`，只供 Canvas 放置預覽和資訊面板使用，不寫入戰場狀態。

`engineerBoost` 保留既有的 Q 傷害狀態；新增暫態 `engineerHaste` 與 `engineerSupportTarget`。兩者每幀由 `GoblinNetworkSystem.update()` 重算／遞減，不存入檢查點。`CombatUnit`、`Building` 只讀取前者來計算攻速；`GoblinPresentation` 與網路繪圖只顯示結果。

`CombatUnit.attack()` 現在把 `bonusVsHeavy` 直接交給投射物，讓不經戰團連動的呼叫也保留重甲加成。沒有 HTTP API。

## 安裝、部署與還原

仍需 Node.js 18+ 與既有靜態伺服器，沒有新依賴或素材。發布時同步 `src/td/config.js`、`HeroRoster.js`、`GoblinNetworkSystem.js`、`BuildSystem.js`、`CombatUnit.js`、`Building.js`、`GoblinPresentation.js`、`TDGame.js`、`sw.js` 與版本檔；Service Worker 快取為 `sky-strike-v0.85.23`。

更新前可從設定匯出玩家資料。還原時以 Git revert（或逐檔還原上述程式與 `sw.js`）回到同一版本，再以 `update.html` 啟用舊快取；玩家存檔不需遷移，也不可刪除。

## QA

自動驗證：

```powershell
node --test tests/td-goblin-network.test.js tests/td-goblin-actions.test.js tests/td-faction-weapons.test.js tests/td-roster-balance.test.js
npm run check
npm test
```

人工驗收：以管理者自由遠征選地精，檢查游標帶著 1／2 耗電裝置時的供電／缺電預覽、機座容量、Q 對最近攻擊機械的光圈、技師對最近塔的連線、火器手首波、重射手打重甲、F 過熱與 W／冷凝站縮短停機；再確認奇克三階扳手、軍械庫、掉落和跨軍團組隊仍可用。
