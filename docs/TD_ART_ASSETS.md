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

## v0.26.0 分享素材歸檔與垂直切片

- 原始候選圖保存於本機 `assets/td/reference/share-2026-09-10/`，由該資料夾的 `README.md` 記錄內容及加工狀態；遊戲不直接載入候選圖，Git 倉庫也會忽略此本機參考封存。
- `assets/td/enemy-orc-grunt-actions-v2.png`：1254×1254 RGBA，4×4；前兩列八格行走、第三列受擊、第四列死亡，取代普通邊境步兵的顯示素材。
- `assets/td/items/weapons-atlas-v5.png`：1536×1024 RGBA，4×2；八把武器依普通、稀有、史詩與傳說方向準備，目前尚未接入戰鬥數值。
- `scripts/chroma-key.ps1`：將生成階段的純綠背景轉為真正透明 Alpha，並清除綠幕邊緣污染。輸入必須是專為去背產生的純綠素材，不應對一般圖片直接套用。

## v0.27.0 三職業武器九宮格

- 輸出：`assets/td/items/class-weapons-atlas-v1.png`，1536×1024 RGBA，3 欄 × 3 列。
- 欄位依序為精良、史詩、傳說；列依序為獵手長弓、奧術法杖、盜賊雙刃。
- 生成模式：imagegen 全新生成，以 `weapons-atlas-v5.png` 作為風格參考；要求固定九宮格、純綠背景、無字、無框與完整安全邊距，再用 `scripts/chroma-key.ps1` 轉為真正 Alpha。
- 最終提示摘要：original fantasy RTS inventory weapon atlas；row 1 steel/frostwood/dragonfire bows，row 2 crystal/storm/holy-star staffs，row 3 steel/shadow/demonfang paired blades；classic hand-painted low-poly RTS miniature、upper-left light、equal cells、no characters/UI/text/logo。

## v0.28.0 暗影英雄無武器底圖

- 輸出：`assets/td/rogue-actions-unarmed-v2.png`，1254×1254 RGBA，4 欄 × 4 列。
- 生成方式：內建 imagegen 的 precise-object-edit，以 `rogue-actions-v1.png` 為編輯目標；只移除每格匕首與烘焙斬擊，保留角色、衣著、姿勢、格位與鏡頭。生成器第一次輸出棋盤格背景，第二次只改為純 `#00FF00`，再以 `scripts/chroma-key.ps1` 轉成真正透明 Alpha。
- 正式提示摘要：remove only every dagger/blade/weapon and baked slash arc from all 16 cells；reconstruct natural empty gloved hands；preserve identity, poses, foot positions, scale and spacing；flat chroma background cleanup；no weapon/effect/text/logo。
- 四角 Alpha 驗證皆為 0。原 `rogue-actions-v1.png` 不刪除，作為制式裝備與載入失敗回退。

## v0.17 英雄動作素材

新增 `assets/td/hero-actions-v1.png`（1254×1254、RGBA），內建 imagegen 生成的原創女英雄四態圖集。完整提示及限制見 [HERO_ART_PROMPT.md](HERO_ART_PROMPT.md)。圖集與頭像均離線使用；升級肩甲、戰旗與符文由 Canvas 繪製。

## v0.18.0 種族塔三階圖集

輸出：`assets/td/faction-towers-v1.png`。使用 imagegen 建立原創透明點陣素材。三欄依序為精靈雷塔、獸族祖靈柱、亡靈召喚殿；三列為初階／進階／終階，裁切列界線比例為0、0.311、0.624、1。保留長寬比，不拉伸角色。

生成提示：

Use case: stylized-concept. Production transparent PNG game sprite atlas for original classic fantasy RTS tower defense. Exactly 3 columns by 3 rows of 9 independent tower models in equal square cells, square whole image. TRUE transparent alpha background, no ground/background or text/grid/labels. Fixed three-quarter TOP-DOWN isometric camera looking down ~40 degrees. Each tower centered within its cell, 18 percent clear padding on ALL sides, complete base and spires inside own cell, consistent scale, feet at y80 percent. Column1 elegant elven storm spire, white carved stone with leafy copper gold curved arches and floating cyan lightning crystals. Column2 orcish ancestral totem, massive reddish timber, tusks, leather, tribal masks, amber spirit fire, no people. Column3 undead summoning crypt, dark purple stone mausoleum with skull gate, ribbed bone arches and spectral violet lanterns, no people. Row1 simple base towers. Row2 visibly upgraded towers same identities with extra structures/tusks/crystal satellites, more ornate. Row3 ultimate versions with imposing reinforced bases, additional wings/arches/horns and brighter energy crowns, still fit own cell. Painterly pre-rendered low-poly game texture aesthetic, readable at 100px, original designs, muted stone/wood materials contrasting small colored magic accents. No overlap between cells, all cells equal spacing, NO cast shadows outside models, no floor tiles or checkerboard.

## v0.20.0 敵军動作圖集

使用內建 imagegen 工具生成並保留透明 alpha，未覆寫舊圖。

### grunt

保存路徑：`assets/td/enemy-grunt-actions-v1.png`

最終提示：

Use case: stylized-concept. Asset type: production 2D RTS sprite animation sheet, original fantasy game enemy, transparent PNG with real alpha, no background, no grid lines or words. EXACT layout: 4 columns by 4 rows, 16 equal square cells. Each cell contains the SAME character at identical camera, consistent size and materials, feet anchored 80% down in cell, full body with safe margins. Rows 1 and 2 = eight consecutive locomotion keyframes, alternating limbs and clear step cycles (not identical poses), facing right, slight 3/4 overhead game camera. Row 3 = four hit reaction keyframes, flinch then recover. Row 4 = four non-gory death keyframes, stagger kneel fall then motionless on ground, maintain original scale and foot ground anchor. Classic hand-painted low-poly fantasy RTS miniature aesthetic, muted earthy colors, clearly readable silhouette, upper-left lighting, no glow, no baked shadow, not a concept illustration. No Warcraft characters or logos. Armored enemy foot soldier, battered dark steel helmet, rusty red tabard, round wooden shield and short sword. Distinct marching legs and swinging shield arm.

### runner

保存路徑：`assets/td/enemy-runner-actions-v1.png`

最終提示：

Use case: stylized-concept. Asset type: production 2D RTS sprite animation sheet, original fantasy game enemy, transparent PNG with real alpha, no background, no grid lines or words. EXACT layout: 4 columns by 4 rows, 16 equal square cells. Each cell contains the SAME character at identical camera, consistent size and materials, feet anchored 80% down in cell, full body with safe margins. Rows 1 and 2 = eight consecutive locomotion keyframes, alternating limbs and clear step cycles (not identical poses), facing right, slight 3/4 overhead game camera. Row 3 = four hit reaction keyframes, flinch then recover. Row 4 = four non-gory death keyframes, stagger kneel fall then motionless on ground, maintain original scale and foot ground anchor. Classic hand-painted low-poly fantasy RTS miniature aesthetic, muted earthy colors, clearly readable silhouette, upper-left lighting, no glow, no baked shadow, not a concept illustration. No Warcraft characters or logos. Lean four-legged armored wolf beast, charcoal grey fur with tawny mane, brown leather harness. Eight running frames include tucked legs and extended gallop, paws clearly articulate. Anatomically coherent four legs.

### brute

保存路徑：`assets/td/enemy-brute-actions-v1.png`

最終提示：

Use case: stylized-concept. Asset type: production 2D RTS sprite animation sheet, original fantasy game enemy, transparent PNG with real alpha, no background, no grid lines or words. EXACT layout: 4 columns by 4 rows, 16 equal square cells. Each cell contains the SAME character at identical camera, consistent size and materials, feet anchored 80% down in cell, full body with safe margins. Rows 1 and 2 = eight consecutive locomotion keyframes, alternating limbs and clear step cycles (not identical poses), facing right, slight 3/4 overhead game camera. Row 3 = four hit reaction keyframes, flinch then recover. Row 4 = four non-gory death keyframes, stagger kneel fall then motionless on ground, maintain original scale and foot ground anchor. Classic hand-painted low-poly fantasy RTS miniature aesthetic, muted earthy colors, clearly readable silhouette, upper-left lighting, no glow, no baked shadow, not a concept illustration. No Warcraft characters or logos. Massive hunched two-legged stone-armored ogre beast, slate violet-grey rock plates, thick muscular limbs, heavy fists, brown belt. Eight slow weighty walking frames with alternate heavy footfalls, consistent anatomy.

## v0.30.0 玩家軍團與戰狼

- `faction-shield-v1.png`、`faction-skeleton-v1.png`、`faction-dragon-v1.png`：王國盾衛、幽骨劍士、翡翠幼龍 4×4 動作圖集。
- `enemy-orc-grunt-actions-v2.png`：本版保留給玩家解鎖的赤牙勇士；普通敵軍恢復使用 `enemy-grunt-actions-v1.png`，避免敵我外觀相同。
- `faction-structures-v1.png`：1224×1224 RGBA 九宮格；三欄為王國戰鼓堡、翠靈古樹、冥燈墓園，三列為基礎、進階、終階。
- `war-wolf-actions-v1.png`：1448×1088 RGBA，4×4；列順序為待機、奔跑、撲咬、受擊／倒地。生成時先輸出純綠背景，再由 `scripts/chroma-key.ps1` 轉成真正透明 Alpha；`war-wolf-actions-source-v1.png` 保留作為可重製來源。

戰狼最終提示摘要：original armored forest war wolf companion，classic hand-painted low-poly fantasy RTS miniature，three-quarter top-down camera，exact 4 columns × 4 rows；row 1 idle breathing，row 2 running cycle，row 3 bite/lunge，row 4 hit/fall；same anatomy, scale, lighting and ground anchor in every cell；solid chroma green background，no text/grid/UI/logo。由內建 imagegen 全新生成，未複製既有遊戲角色或素材。

## v0.31.0 戰地軍械圖集

- `assets/td/items/equipment-atlas-v1.png`：1254×1254 透明 RGBA 九宮格。由左至右、由上至下為獅心王弓、不落獅盾、先鋒戰鼓、翡翠龍心、月銀古杖、常青冠冕、赤牙狼騎戰鞍、幽骨王冠、噬魂冥燈。
- 用於戰利品、軍械庫與角色掛件；CSS 與 Canvas 共用相同 3×3 座標，不含文字、Logo 或既有遊戲素材。

最終提示摘要：original dark-fantasy RTS equipment icon atlas，transparent background，exact 3×3 equal cells，nine unique centered isolated items in fixed order，hand-painted low-poly miniature readability，consistent upper-left warm lighting，no text/UI/grid/logo，original fantasy designs and not copied Warcraft assets。由內建 imagegen 生成並保存為正式本機資產。

## v0.32.0 唯一軍械介面

本版沒有生成或替換美術資產，沿用 `equipment-atlas-v1.png`。新增的三欄裝備盤、持有人標記、已裝備／轉裝／不相容狀態皆以 HTML／CSS 呈現，確保桌面與手機共用同一套圖集並避免重複素材。

## v0.32.1 手機 App Icon

- `assets/icons/app-icon-source-v1.png`：內建 imagegen 生成的原始方形圖，金翼盾徽中央為飛行器，下方為王城，代表雙模式玩法。
- `app-icon-1024.png`、`app-icon-512.png`、`app-icon-192.png`、`apple-touch-icon-180.png`：由 `scripts/build-app-icons.ps1` 高品質縮放，構圖核心保留於中央安全區。
- 最終提示摘要：original premium dark-fantasy mobile game icon，gold winged shield、sky fighter、stone fortress、cyan energy trail、deep navy／forest background，centered maskable safe zone，no text/logo/watermark/copyrighted character。

v0.32.2 沒有改動美術輸出，只修正 GitHub Pages 首次發布設定。
