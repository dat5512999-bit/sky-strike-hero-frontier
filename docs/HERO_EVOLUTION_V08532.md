# 英雄進化 v0.85.32

## 玩家流程

1. 第 5／10／15 波首領各掉 1 枚「首領勳章」。這是獨立資源，不會被士兵升級所用的功勳扣除。
2. 第 20 波守成後，商城開放用 3 枚首領勳章購買覺醒進化石。
3. 展開「英雄資訊」，按「發起覺醒試煉」。試煉只能由英雄造成傷害；塔與士兵不會代打。
4. 擊敗依英雄職業調整耐久的試煉首領，即進入覺醒 Lv.1。等級重置，但保留進化前生命底線，並以進化倍率確保 Lv.1 戰力不低於進化前高等級英雄。
5. Q／W／E／F 會替換為覺醒技能組；英雄腳下增加細緻職業色光環與星徽，不覆蓋商城造型。

超凡資料已設定為第 50 波、5 枚首領勳章與第二套四招技能。現有自由遠征資料表仍止於第 30 波，因此本版不宣稱超凡已可在正式一局中取得；31–50 波、難度曲線與完整戰力模擬需在後續波次內容一起驗收後開放。

## 系統資料流

```text
首領擊破 → EconomySystem.emblems → 商城進化石
  → HeroEvolutionSystem 專屬試煉 → Hero.evolution
  → Q/W/E/F 技能替換、生命底線、戰場徽記
```

`HeroEvolutionSystem` 集中六英雄的兩階技能名稱、說明、冷卻、試煉耐久與進化倍率；`HeroRoster` 仍保有未進化技能；`EquipmentSystem` 的三階職業武器與 `ArmorySystem` 的士兵軍械不變。進化石不是裝備，沒有新增平行武器欄位。

## 存檔與回復

章節存檔保留 `EconomySystem.emblems` 與 `Hero.evolution`。舊存檔沒有這兩個欄位時，系統以 0 枚勳章／未進化安全回退。版本快取為 `sky-strike-v0.85.32`；若仍看見舊技能或商城，關閉舊分頁後重新開啟 `td.html`。

## QA

- `node --test tests/td-hero-evolution.test.js tests/td-chapter-checkpoint.test.js`
- `node --test tests/td-frostland.test.js tests/td-chapter-checkpoint.test.js`
- `npm run check`

手動驗收：完成第 20 波後檢查勳章數、商城進化石、試煉期間塔的傷害無效、覺醒後四個技能名稱與特效、手機／桌機的英雄資訊按鈕，以及讀取第 20 波章節存檔後資源與進化石仍在。
