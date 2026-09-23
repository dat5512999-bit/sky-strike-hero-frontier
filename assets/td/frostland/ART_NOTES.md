# Frostland V1 asset handoff

Generated with the built-in `image_gen` tool on 2026-09-22. Original PNG outputs are preserved; no raster recoloring, cutting, or alpha processing scripts were applied. Runtime drawing uses measured source rectangles, clip cuts, and hand anchors. `scripts/measure-frostland-atlases.cjs` reads pixels and writes metadata only.

The user-provided faction poster was a material and silhouette reference. Its lettering, history, and named races are not treated as confirmed canon.

| File | Grid / content | Generation source basename |
|---|---|---|
| hero-actions-v1.png | 4×4, idle / walk / unarmed spear thrust / cast, 16 distinct poses | exec-f330bb5c-70f4-4c9e-84fe-8f55b830d458.png |
| soldier-actions-v1.png | 4×6, wolf / bear / bird / hunter / shaman / mammoth, ready / windup / release / recover | exec-8b69020f-4f67-4235-9bfc-bc5ac7c956a4.png |
| ../items/frostland-spears-v1.png | 4×1, bone / frost steel / violet aurora / green winter crown | exec-a0b105fa-8a0f-4d96-832f-c4bf93deee0c.png |

Generation briefs: dark fantasy isometric game characters; consistent right-facing perspective, full silhouettes, transparent background, no labels or UI; muted leather, fur, bone and metal with ice/aurora accents. Hero leaves weapon separate for runtime attachment. Soldier poses must visibly articulate limbs, wings, bow, staff and mammoth weight. The initial soldier output was followed by an image-generation alpha-background edit preserving the figures. These are handoff briefs, not a claim of bit-exact reproducibility of a stochastic generation.

`FrostlandAtlas.js` and `artifacts/frostland/atlas-audit.json` record dimensions, alpha fractions, per-frame hashes and clipping. Full-body component measurements preserve hands, wings and bows crossing nominal grid boundaries; clips exclude neighboring body fragments. SVG files remain prototype slots/fallbacks, not the live hero/soldier animation. Seven towers use distinct native Canvas geometry; four skill icons are native SVG.

To inspect: serve the project and open `/frostland-preview.html`. Check all states, four weapons, every soldier, Frozen and winter effects. Renderer boundaries can be adjusted in metadata generation without modifying the source PNGs. As of v0.85.1, selection portraits use dedicated paintings; combat retains the articulated atlases.

## Selection paintings — v0.85.1

Built-in image_gen, 2026-09-22. Exact prompts and source basenames: `artifacts/frostland/selection-art-prompts.json`. Originals are copied unchanged into the project.

- `hero-selection-v1.png`: werewolf hunter portrait with bone armor and hunting spear.
- `faction-selection-v1.png`: northern alliance group key art, six representative silhouettes.

CSS supplies context-specific cropping; these paintings do not replace battle animation frames. Visual concept only, not a story canon update.
