# 地圖行動正式美術 v1.0.0

2026-10-07；v0.85.87。使用內建 image_gen 工具（非 CLI／外部 API）。

五張 PNG 的透明 alpha 已以像素測試確認；每幀矩形從實際主體量測，沒有把透明留白當作主體尺寸。水閘四幀按同一效果時鐘開合與循環，水流泡沫使用有界 Canvas 動畫。生成素材以使用者提供的遊戲截图為風格參考，不包含新人物；原圖留在生成目錄，正式副本隨遊戲交付。

## 機關圖集

正式檔案：[mechanisms-v1.png](../assets/td/adventure/mechanisms-v1.png)。完整最終提示詞：

```text
Use case: stylized-concept. Asset type: ONE production game sprite atlas, a coherent four-frame 2x2 sheet of interaction mechanisms. Primary request: painterly medieval fantasy tower-defense map props matching the attached game map: worn blue-gray coastal stone, bronze mechanisms, muted natural colors, warm upper-left daylight, elevated isometric three-quarter overhead view (around 50 degrees downward). Four equal square cells, row-major: top-left compact stone-and-bronze sluice with vertical wooden gate, a visible brass handwheel and a tiny turquoise water outlet; top-right rugged stone ice-dam mechanism with frosted blue crystals and a lever; bottom-left timber-and-rope rockfall winch with a loaded stone basket; bottom-right ancient weathered rune-stone pulse mechanism with restrained lavender inlays. These are believable small physical structures seen from the same game camera, NOT UI symbols, cards, icons, abstract circles or flat vector signs. Each object fully contained in its cell, roughly same visual scale, centered with ground contact at 82% of its cell height, 12% padding all around, no overlap between cells. True transparent background including grid gaps; only a tight soft contact shadow under each object. No checkerboard painted into pixels. No terrain scenery, people, text, labels, grids, borders, logos or watermark. High readability when rendered 90px wide. Reference image is for map style and camera only; do not reproduce the hero or placeholder sign.
```

## 修復地標圖集

正式檔案：[beacons-v1.png](../assets/td/adventure/beacons-v1.png)。完整最終提示詞：

```text
Use case: stylized-concept. Asset type: ONE coherent four-frame state atlas for repairable game landmarks, equal 2x2 cells on true transparent background. Match the painterly medieval fantasy tower-defense screenshot's worn blue-gray stone, natural moss and warm bronze details, muted outdoor colors, upper-left daylight, elevated isometric three-quarter overhead camera around 50 degrees down. Row-major cells: top-left a compact ruined watch beacon, a short stone masonry tower with broken unlit brazier, weathered wood brace; top-right the exact same watch beacon repaired with straight masonry, intact golden brazier lit with a modest orange flame; bottom-left a compact ancient rune-stone pulse apparatus with a cracked circular bronze frame and dark crystal core, unpowered; bottom-right the exact same apparatus repaired and softly glowing lavender, no excessive bloom. Same perspective, scale, object footprint and bottom-center ground anchor within each pair. Each structure wholly inside its own cell with transparent margins and no overlapping cells. Real physical game structures with painterly textures, not flat UI icons or signage. No people, background landscape, extra scenery, text, labels, cell borders, checkerboard, logos or watermark. At small 90px render size the damaged versus repaired state must remain legible. Reference screenshot for style only; do not copy its hero or placeholder.
```

## 支援道具圖集

正式檔案：[support-v1.png](../assets/td/adventure/support-v1.png)。完整最終提示詞：

```text
Use case: stylized-concept. Asset type: ONE coherent four-cell 2x2 game support-prop sprite atlas on genuinely transparent background. Style: painterly medieval fantasy tower-defense environment props, worn gray coastal stone and warm weathered timber, restrained moss, upper-left natural daylight, elevated isometric overhead camera around50degrees down, clear realistic texture matching the supplied game screenshot. Equal square cells row-major: top-left a small damaged supply handcart with two wood wheels, folded cream canvas tarp and two wooden supply boxes, stranded but repairable; top-right a small archival field chest containing open parchment records and bound observation notebooks, no readable lettering; bottom-left a modest trader's physical supply stall with short canvas canopy, stacked closed wood crates and two burlap sacks, NO merchant or human figure; bottom-right a stone-mounted wooden water barrel and a short bronze outlet pipe for putting out road smoke. Objects fully contained within each cell with transparent margins, similar tabletop-prop gameplay scale, bottom-center ground contact at about82% cell height. True alpha in every background and grid gap, minimal contact shadows only. No background landscape or terrain slab, no people, heroes or extra characters, no UI icon symbols, label text, borders, grid lines, checkerboard, logos or watermark. Render small but usable as believable in-world objects, NOT flat vector signs.
```

## 平台狀態圖集

正式檔案：[platforms-v1.png](../assets/td/adventure/platforms-v1.png)。完整最終提示詞：

```text
Use case: stylized-concept. Asset type: ONE coherent four-frame environmental deployment-platform state sprite atlas, regular2x2equal square cells with genuine transparent background. Painted medieval fantasy tower-defense map cutouts, worn blue-gray stone, muted moss, weathered wooden planks, upper-left daylight, elevated isometric three-quarter overhead camera around50degrees down matching the supplied game screenshot. Row-major: top-left a small round gray-stone deployment pad covered by shallow translucent frosted ice and a little snow, sealed cold state; top-right exactly same stone pad after thaw, exposed dry flagstones, same footprint and camera; bottom-left a compact oval wooden-and-stone coastal deployment platform at high tide, translucent turquoise shallow water covering its floor and modest foam around edge, unavailable state; bottom-right the exact same coastal platform after low tide, floor boards dry and visible, a little wet edge, same footprint and camera. All four platforms horizontally spread low-height terrain props, consistent bottom-center ground anchors, fully within their cells with generous transparent margins; no tall buildings or terrain scenery. Match cell pairs precisely, no viewpoint drift. No square UI plates, abstract symbols, people, text, labels, grid, borders, checkerboard, logos or watermark. Real usable game-floor assets with clean alpha, not scene illustrations.
```

## 水閘動畫圖集

正式檔案：[water-action-v1.png](../assets/td/adventure/water-action-v1.png)。完整最終提示詞：

```text
Use case: stylized-concept. Asset type: ONE four-frame animation sprite atlas on genuinely transparent background, regular 2x2 equal square cells. Reference Image 1 is the style and exact design anchor: use ONLY its TOP LEFT stone-and-bronze water sluice, same worn gray stone pillars, same timber gate and brass handwheel. Do not redesign it and do not include the other three mechanisms. All four frames show precisely the same sluice from precisely the same elevated isometric three-quarter overhead camera, identical footprint, scale, lighting, stone pillars and ground anchor. Animate ONLY timber gate height, wheel angle and outgoing water. Frame row-major: 1 closed timber gate covering outlet, wheel at rest, no outward stream except a tiny dark pool; 2 gate raised halfway vertically and handwheel turned, narrow beginning gush; 3 gate fully raised, broad bright turquoise stream rushing downward/outward through outlet with white foam pattern A; 4 gate still fully raised at exactly same height with different downstream white foam and ripples pattern B so frames3/4 make a flowing loop. Gate top must remain wholly inside each cell even raised. Clear solid opaque timber plank door in closed state. Painted fantasy game cutouts, matching attached original texture, same camera about50degrees down. Every structure wholly within its own cell, transparent margin all around and transparent gaps between cells, minimal tight contact shadow only. No environment background, people, icons, signage, text, labels, cell grid, borders, checkerboard, logos or watermark. Make four functional game animation frames, not a concept scene or storyboard.
```

## 驗收與限制

- 水閘、修復地標、冰封／退潮平台、補給與交易道具均使用已保存的正式素材。
- 所有幀有實際透明背景、非空主體及合法裁切範圍，素材已列入離線快取。
- 不改地圖道路、戰鬥座標、英雄造型及故事人物身份。
- 圖集是預繪插畫，不是 3D 模型或流體物理。水閘開合為四幀動畫，水流另以沿路泡沫補連續動感。
- 實際 iPhone 長局效能仍需裝置驗收，不以桌面測試替代。
