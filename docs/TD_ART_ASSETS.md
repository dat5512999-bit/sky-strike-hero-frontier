# 塔防正式美術資產與生成提示

## 來源與授權邊界

v0.11 與 v0.12 的 PNG 使用內建圖片生成工具製作，再複製進專案。使用者附圖與經典 RTS 僅作完成度、鏡頭、戰場密度及操作氛圍參考；沒有把參考圖當成編輯目標，也沒有複製其角色、建築、Logo、介面或文字。資產提示均要求原創、無商標、無浮水印。

## 資產清單

| 檔案 | 尺寸 | 用途 |
|---|---:|---|
| `forest-valley-v1.png` | 1254×1254 RGB | 森林峽谷、石板路與水景背景 |
| `towers-atlas-v1.png` | 1774×887 RGBA | 橫向三格：遊俠、霜語、星火塔 |
| `units-atlas-v1.png` | 1536×1024 RGBA | 3×2：英雄、步兵、獵犬／巨獸、術士、首領 |
| `frontier-keep-v1.png` | 1304×1206 RGBA | 道路終點守護城堡 |
| `human-td-battlefield-v2.png` | 1254×1254 PNG | 經典 RTS 人族邊境、循環泥路與自由建造草地 |
| `ranger-actions-v1.png` | 1254×1254 RGBA | 獵手 4×4 動作圖集 |
| `arcanist-actions-v1.png` | 1244×1264 RGBA | 奧術師 4×4 動作圖集，繪製時保持 cell 原始比例 |
| `rogue-actions-v1.png` | 1254×1254 RGBA | 盜賊 4×4 動作圖集 |

## 最終提示詞摘要

### v2 人族 TD 戰場

`stylized-concept`／square game environment：原創早期 2000 年代奇幻 RTS 戰場；低彩度草地、泥路、森林岩壁、木牆、軍營、農田與右下石城門；45 度正交俯視、道路連續、保留大面積可建造草地；無角色、塔、發光塔座、文字、Logo、商標、浮水印或可辨識既有作品建築。

### v2 三職業人物

`stylized-concept`／transparent sprite atlas：同列三名原創人物——狼肩長弓獵手、藍袍火杖奧術師、黑紅雙刃盜賊；早期 PC RTS 低多邊形手繪預渲染、45 度俯視、相同比例、真正透明背景；無場景、框線、文字、Logo、商標、浮水印或既有角色。

### 戰場背景

`stylized-concept`／production-ready HTML5 TD environment：高品質原創奇幻森林峽谷，55 度斜俯視、左上暖日光、PBR 插畫化 3D；連續蜜色石板 S 路、立體岩壁、瀑布、草地、野花與粉色花樹；道路從左上至右下，塔區保持開放；無角色、塔、UI、文字、Logo、商標或浮水印。

### 三塔圖集

`stylized-concept`／transparent sprite atlas：同一列三座原創塔——木金遊俠弩塔、青藍冰晶霜語塔、黑鐵熔火星火炮塔；55 度斜俯視、左上光、等比例石基、緊貼接地陰影；真正透明背景，無場景、角色、文字、Logo、商標或浮水印。

### 六單位圖集

`stylized-concept`／transparent 3×2 character atlas：翠綠披風長槍英雄、紅甲步兵、金色獵犬、紫晶岩甲巨獸、綠焰術士、大型赤紅首領；同一斜俯視鏡頭、方向、比例與左上光；完整全身、透明背景、無 UI、文字、Logo、商標或浮水印。

### 守護城堡

`stylized-concept`／transparent building sprite：原創石木邊境城堡，綠旗銀葉徽記、石塔、板岩屋頂、暖窗與強化拱門；55 度斜俯視，城門朝左上，道路終點用緊湊輪廓；透明背景，無角色、道路、UI、文字、Logo、商標或浮水印。

## 替換規則

替換背景時必須重校 `src/td/config.js` 的道路與建築禁區。角色 atlas 必須維持 4×4，列順序固定為 idle／walk／attack／hit-death，並確保每格角色比例、大小與腳底註冊點一致。所有資產都必須保存於專案並加入 `sw.js`；遊戲執行期不依賴遠端生成服務。

## v0.17 英雄動作素材

新增 `assets/td/hero-actions-v1.png`（1254×1254、RGBA），內建 imagegen 生成的原創女英雄四態圖集。完整提示及限制見 [HERO_ART_PROMPT.md](HERO_ART_PROMPT.md)。圖集與頭像均離線使用；升級肩甲、戰旗與符文由 Canvas 繪製。
