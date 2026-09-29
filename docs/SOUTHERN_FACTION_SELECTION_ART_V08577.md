# 南方軍團選擇視覺交付

版本：0.85.77。狀態：本機完成，尚未部署。

## 範圍

使用者要求補齊英雄與軍團的圖像。本專案先前已提供三位新英雄，以及矮人／龍族士兵和武器的透明 4×4 戰鬥圖集；本版補上先前缺少的「軍團代表視覺」。

|對象|戰鬥圖|軍團選擇圖|檔案|
|---|---|---|---|
|矮人符文堡壘|英雄、4 士兵、武器：4×4|已完成：符文堡壘群像|`assets/td/dwarf/faction-selection-v1.png`|
|龍脈議庭|英雄、4 士兵、武器：4×4|已完成：龍脈議庭群像|`assets/td/dragonkin/faction-selection-v1.png`|
|埃及島|單一英雄、武器：4×4|不適用|尚未授權埃及軍團|

軍團選擇圖是方形、不透明的介面插圖；它們不是透明 4×4 戰鬥 Sprite Sheet，因此不混入角色動作圖的尺寸驗收。

## 介面與快取

`FactionSystem` 將兩個軍團的 `selectionArt` 指向其專屬圖片，選角面板會直接顯示。兩項資產列入 `sw.js` 的預快取；快取名稱為 `sky-strike-v0.85.77`，更新後會取得新圖。

## 驗證與還原

- `node --test tests/td-southern-factions.test.js tests/td-southern-skill-8d.test.js`：20 項通過，包含圖片存在、快取清單與選角資料驗證。
- `npm run check`：通過。

如需還原，請建立僅回退本版圖片、`FactionSystem`、`sw.js` 與版本／文件的反向 Git 提交；不要使用硬重設覆蓋其他進行中的工作。
