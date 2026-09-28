# 中立戰神・奧魯姆 v0.85.67

## 玩家操作

在自由遠征的英雄清單選擇「戰神・奧魯姆」，再任選一個軍團。他是中立英雄，沒有軍團限定，也不會把自己的技能加成授予任何軍團單位。

- Q「破陣天墜」：跳入前線，以巨槌震擊半徑 72 的敵軍。
- W「戰神震域」：在原地維持六秒的地面震域；特效在戰場座標繪製，不裁切在角色格內。
- E「不滅戰意」：只提升奧魯姆自身六秒的傷害與攻速。
- F「戰神裁決」：對前線群體進行重槌裁決。

商城的「戰神重槌・元素核心」只會在選擇奧魯姆時出現。首次購買核心會自動裝配；已買核心再次點選可免費切換。一次只能裝一枚：火焰球造成範圍灼擊、冷凍球強緩速、雷球連鎖、暗影球處決低生命目標。

## 實作與資料

- 英雄設定：`ProfessionSystem`、`HeroRoster`、`HeroUltimateSystem`。
- 三階重槌：`EquipmentSystem.WEAPONS.bull`，沿用既有 `spear` 商店鍛造流程，價格 100/160/220G。
- 核心：`EquipmentSystem.CORES` 和 `ShopSystem`；已購核心保存在本局英雄 `equipment.cores`，啟用核心為 `equipment.core`，不另建平行背包。
- 美術：`assets/td/neutral/bull-wargod-actions-5x5-v1.png` 是 5×5 RGBA 動作圖集；`BullWargodArt` 使用 5 欄裁切。`assets/td/neutral/bull-wargod-skill-icons-v2.png` 是 Q／W／E／F 共用的 2×2 技能圖集；地面震域與裁決由 `HeroSkillVFX` 的世界座標效果處理，避免「角色被方框框住」。
- 存檔：既有玩家和新玩家都會自動取得 `bull` 英雄解鎖；不變更軍團資料與既有裝備欄位的讀取方式。

## QA、部署與回復

執行 `node --test tests/td-bull-wargod.test.js`、`npm run check`、`npm test`。確認圖集為 RGBA、25 格皆有內容、商城核心只在戰牛選取時顯示、所有軍團可搭配，且核心不會套用到其他英雄。

發佈必須同步 `BullWargodArt.js`、英雄／商店／投射／特效程式、三張 PNG、`td.html` 和 `sw.js`；快取名稱為 `sky-strike-v0.85.68`。回復時完整回退到 v0.85.67 的程式和快取，不可只回退單一圖片或 `sw.js`。
