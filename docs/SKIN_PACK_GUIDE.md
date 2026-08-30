# 外觀包製作指南

> v0.9 說明：波次符文與防線 HUD 屬於共用戰鬥資訊層，會讀取外觀主色但不允許外觀包改變詞綴倍率、防線上限或 Boss 彈幕。

> v0.10 說明：現有 Skin Registry 僅服務飛機模式。塔防未開放主題包介面；若未來加入，必須另建 TD Theme Registry，不能讓飛機皮膚直接改寫塔或怪物數值。

## 目標

外觀包成套替換玩家、兩種交替彈體、敵人、擊破色、背景與 HUD 色彩，但不得改變碰撞箱、HP、速度、射速、傷害或分數。

## Pack 結構

```javascript
SkyStrike.skins.register({
  id: 'my-pack',
  name: '我的主題',
  icon: '⭐',
  accent: '#55eeff',
  secondary: '#ffcc55',
  background: ['#102030', '#030609'],
  star: '#ffffff',
  effect: '#ff6688',
  renderers: {
    player(ctx, entity) { /* 以 entity.x / entity.y 為中心繪圖 */ },
    bullet(ctx, entity) { /* entity.variant 為 0 或 1 */ },
    enemy(ctx, entity) { /* 繪製普通敵機外觀 */ }
  }
});
```

將新檔放在 `src/skins`，並於 `index.html` 在 `SkinPacks.js` 之後、實體檔之前載入。若外觀數量持續增加，建議每個合作品牌使用獨立檔案與唯一 ID。

## 設計規範

- 造型中心對準 `entity.x`、`entity.y`，玩家約 38×52、敵人約 38×42。
- 子彈可為 18×24 左右的視覺，但核心碰撞仍維持 6×18。
- renderer 必須成對使用 `ctx.save()`／`ctx.restore()`，不可污染其他物件的 Canvas 狀態。
- 優先使用 Canvas 向量；若載入圖片，須有載入失敗替代造型並維持離線可用。
- 亮度與敵我辨識必須清楚，不能讓皮膚造成玩法優勢。
- 玩家 renderer 可讀取 `entity.rotation` 與 `entity.engineTime` 製作傾斜及尾焰動畫；只能讀取，不能回寫移動狀態。
- `BattlefieldRenderer` 會自動使用 pack 的 `accent`、`secondary`、`background` 與 `star`，新增皮膚時必須同時檢查背景對比。
- 敵方子彈固定維持紅色系，不應跟隨主題改成與玩家子彈相近的顏色。

## 品牌與授權

品牌名稱、Logo、角色、包裝、商標色組合、圖片與音效可能各自受保護。開發品牌包前建立素材清單與授權證明；沒有授權時使用原創名稱、配色與造型，不冒充官方合作。

## 驗收

1. 執行 `npm run check` 與 `npm test`。
2. 在開始畫面選擇新包，確認 `aria-pressed` 狀態與 HUD 顏色。
3. 驗證玩家、兩種彈體、敵人和擊破效果。
4. 重新整理確認選擇可恢復。
5. 確認 Console 無 Error，並在低高度視窗檢查選單沒有溢出。
