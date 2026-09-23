# Prologue Cinematic V1 素材交付插槽

ID：`prologue_before_shattered_peace`；名稱：《曾經的和平》。目前沒有正式影片或正式 Key Frame。

這個資料夾就是網站上的 `/assets/cinematics/prologue/`。播放器使用相對路徑，以支援子目錄部署及 `file://`。

| 時間（秒） | 正式檔名 |
| --- | --- |
| 0–6 | shot_01_world.webp |
| 6–14 | shot_02_cooperation.webp |
| 14–23 | shot_03_shared_city.webp |
| 23–31 | shot_04_silverleaf_prince.webp |
| 31–38 | shot_05_conspiracy.webp |
| 38–44 | shot_06_shadow_district.webp |
| 44–48 | shot_07_assassination.webp |
| 48–53 | shot_08_prince_death.webp |
| 53–58 | shot_09_war_begins.webp |
| 58–60 | shot_10_title.webp |

正式影片放 `prologue_zh_tw.mp4`。字幕放 `subtitles/zh-TW.vtt`、`subtitles/en.vtt`、`subtitles/ja.vtt`。英文與日文目前只有空白 WebVTT 插槽，不代表已完成翻譯。

`manifest.json` 是可提供給製作團隊的資料匯出，包含全部 Shot、字幕、角色與地點 Reference。`cinematic.schema.json` 定義字幕、角色、地點及 Shot 結構。角色的 null 欄位不得當成生成指令；應先核准參考圖，填寫 revision、referenceAsset 及所有 continuity 欄位（無武器時明確填寫「無」），再改為 approved。Shot 05 的手與不明人影沒有角色 Reference，禁止綁定為首相或兇手。

資料唯一編輯來源是 `src/td/cinematic/PrologueData.js`。修改後執行 `node scripts/export-prologue-manifest.cjs`，並同步更新 WebVTT。影片與圖片不在離線安裝清單中，缺少任一素材都可預覽／跳過。替換素材後應更新快取版本並重新驗收。

完整操作及整合文件：[PROLOGUE_CINEMATIC_V1](../../../docs/PROLOGUE_CINEMATIC_V1.md)。
