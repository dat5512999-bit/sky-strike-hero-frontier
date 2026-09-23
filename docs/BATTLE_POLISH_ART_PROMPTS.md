# v0.85.5 美術提示詞集

模式：內建 ImageGen；用途：stylized-concept，正式遊戲 raster 資產，非外觀概念占位圖。

## 塔樓圖集生成規格

Production transparent 4 columns × 2 rows atlas, landscape 2:1. Seven frost-clan tower sprites in exact equal square cells, bottom-right empty. No text, grid, border or ground tiles. Detailed hand-painted isometric 35-degree fantasy RTS architecture, stone, wood, bone and turquoise ice. Isolated silhouettes, centered within each cell, consistent ground baseline, no neighboring overlap. Row one: luminous frost crystal spire; blizzard altar with three crystals and swirling ice orb; massive wood/bone ballista firing an ice spear; wolf-headed shaman totem. Row two: tall violet-blue rune obelisk; aurora arch and floating magical orb; monumental glacier core cannon fortress; empty. Actual transparent alpha background.

輸出：`assets/td/frostland/towers-atlas-v1.png`。正式渲染器按 4×2 格序讀取，沒有在程式中重新繪製／修改生成圖片。

## 技能圖示提示詞

Create a production game skill icon atlas, exact 2 by 2 equal square cells, square canvas. Four completely painted premium dark fantasy RTS ability icons, crisp bold readable silhouettes when 72 pixels wide, detailed icy materials, vibrant cyan blue with subtle gold. Each icon fills its cell with its OWN very dark teal vignette background, no text, letters, borders, gutters or UI. Top left: glowing ice rune hunter's sigil shaped as a wolf eye inside six-point icy frost crystal, magical marked prey. Top right: dynamic diagonal ornate ice spear violently piercing dark stone, exploding sharp ice fragments and white-hot cyan core. Bottom left: three snarling spectral arctic wolves charging, largest howling wolf head in foreground, green cyan mist. Bottom right: epic winter aurora spiraling above sharp ice spires, bright turquoise polar vortex and snowstorm. Visually distinct, polished hand-painted game art, not flat vectors or line icons. Exact grid boundaries halfway across width and height.

輸出：`assets/td/frostland/skill-icons-v1.png`。Q / W / E / F 對應左上／右上／左下／右下。

## 戰鬥特效圖集提示詞

Use case: stylized-concept. Production transparent VFX sprite atlas for a polished fantasy RTS game. Exactly 2 columns x 2 rows, equal square cells, no objects crossing cells, generous transparent gutters, all artwork centered within 80 percent of each cell. Genuinely transparent alpha background, no checkerboard or black rectangular background. No text or UI. Top-left: single tall jagged ice crystal cluster with 3 asymmetrical spikes, detailed glassy fractured cyan blue translucent ice, frost vein textures, bright white sharp edges, small broken shards around its grounded base; isometric 35 degree perspective. Top-right: intense radial impact explosion of many flying broken ice chunks and shards, bright white cyan core fading smoothly to full alpha transparency, frozen vapor wisps and short luminous streaks, no large opaque disc. Bottom-left: long diagonal frost spear streak slash made of magical white-blue energy and snow vapor, thick tapering trail, crisp center fading edges. Bottom-right: sweeping crescent-shaped aurora mist arc of pale mint and turquoise, white snow speckles, painterly light wisps fading to transparency. Hand-painted premium game effects with strong realistic material detail readable at 64-128 pixels, NOT low-poly triangular vector shapes. Four isolated cutouts at exact quadrant centers.

輸出：`assets/td/frostland/spell-effects-v1.png`。透明度保留；以 Canvas 分層和比例裁切播放，不改傷害判定。
