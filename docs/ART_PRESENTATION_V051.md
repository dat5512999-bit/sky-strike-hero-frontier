# 0.51.0 HUD 與地景呈現

## 範圍與交付

- PM：降低遮擋與文字負擔，保持原玩法。不以縮小整個網頁冒充改版。
- 架構：沿用td.html既有按鈕及handlers、ArtSystem載入與重試、FrontierTerrain快取。沒有新增系統、API、DB。
- UX：波次情報／鏡頭原生折疊；英雄HP/MP並列；技能保留文字／快捷鍵／冷卻；建造分類和關閉同行。Esc收合情報與鏡頭，但查看模式是否啟用仍以原鏡頭控制為準。
- 地景：原創平面地表、少量地面石紋、邊緣森林／石面；程序道路和碎石仍嚴格沿用Path。沒有河流、高牆、橋梁、可碰撞建築或新地形阻擋。
- 不改：世界1280×900、Path、Monster、TargetSelector、戰鬥數值、經濟、士兵規則、裝備、掉落。

## 素材來源與提示詞

使用內建imagegen（非CLI／API），生成後複製進專案；沒有覆蓋原素材。新增圖均為可選呈現，不阻塞coreStatus。PNG約3.3MB地面及圖集，沿用延後圖片快取。

### assets/td/frontier-ground-v1.png

參考既有assets/td/human-td-battlefield-v2.png的材質，不沿用其道路。

提示詞：

Use case: stylized-concept. Asset type: production terrain base texture for an original dark-fantasy RTS tower defense, not a mockup. Landscape 1280:900 aspect ratio. Supporting style reference: attached existing game battlefield, match its high-angle orthographic pre-rendered painted 3D grass/stone/pine texture, olive green, slate, aged gold palette. Create a NEW ROADLESS battlefield ground plate. Camera straight high overhead, no horizon. Entire interior is flat traversable ground: richly varied mossy grass, short grass, small patches of worn earth, scattered flat stone paving remnants sunk flush with ground, sparse tiny plants, subdued long soft shadows and natural color variation, three gently differentiated clearing areas. No interior standing obstacles, no houses, trees, cliffs or water inside the central 94% of the picture. A very narrow irregular forest and dark rocky ridge frame ONLY within the outermost 3% left/right/bottom and 5% top borders. Border decoration must be cropped by frame so the field remains very open. Premium modern indie RTS hand-painted environment quality, detailed but quiet ground to allow soldiers readability. Critical: NO ROADS, NO PATHS, NO TRAILS, no winding shapes, no UI, no text, no arrows, no figures, no towers, no grid. Road will be drawn by the game. Avoid obvious repeated texture tiles, avoid photographic landscape, avoid dramatic empty black corners. This is a terrain ground material, not a map concept illustration.

### assets/td/hero-skill-icons-v1.png

原創4×4圖集。列0/1/2為hunter/arcanist/rogue，欄0/1/2/3為Q/W/E/F；列3欄0為商店。其餘3格本輪不接新功能。

提示詞：

Use case: stylized-concept. Production original dark fantasy RTS ability icon ATLAS, not a UI screenshot. Square 1024x1024 divided into EXACT 4 columns and 4 rows of equal square cells, no gaps no outer margins, each cell fills its 256x256 area. NO text NO letters NO numbers NO borders. Every icon on a near-black richly colored textured background, detailed hand-painted game art, a bold instantly readable central symbol filling 75% of its cell. Strong silhouettes and magical glow with restrained saturation.
Exact row-major content:
Row 1: three silver flying arrows with emerald trails; steel hunting jaw trap surrounded by vines; realistic snarling gray wolf head with green eyes; a golden storm of many descending arrows.
Row 2: blue radial frost explosion crystal; forked blue-white chain lightning; translucent blue humanoid stone elemental; enormous violet-blue icy falling star.
Row 3: red silver dagger slashing diagonally; billowing poison smoke in dark violet green; hooded shadow rogue mirrored into two silhouettes; swirling shadow vortex of purple blades.
Row 4: warmly illuminated medieval merchant tower with gold coins; ornate closed iron equipment chest; crossed bronze military banners; pale gold compass rose.
Unify as professional dark fantasy independent RTS game icons, readable at 40px. No existing franchise logo, no characters from existing games. Exact aligned uniform 4x4 grid, NO gutters, NO type.

## QA與限制

227項測試通過、語法check通過。已驗證三英雄圖示來源和背景位置、建造扣款、商店、冷卻、鏡頭收合／全圖、橫直向切換。1920×1080與1366×767頂列不互相重疊，845×390建造列約171px高。圖片延遲就緒會重製地景快取一次，後續不逐幀生成碎石。

IAB現有80%縮放截圖有裁切，不能把DOM邊界檢查當成完整像素QA。待真機觸控、Edge、極矮視窗、長局效能。沒有宣稱正式地景美術已完成或與概念圖一比一相同。素材只改善地面材質與圖示，不取代未來正式場景構圖工作。

## 接續與回復

本機0.51.0，未提交／未發布。保留前輪dirty tree；勿reset。後續先人工驗收介面與角色比例，再決定場景構圖。若要加河流／橋／城門，需先對齊可部署區與導航，不能只畫在合法草地上。
