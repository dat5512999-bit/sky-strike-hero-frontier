# 世界圖鑑軍團肖像交付（v0.85.30）

## 目的

修正世界圖鑑「軍團」頁的兩個辨識問題：舊王國、月影與暗影縮圖是超寬低解析橫圖，放入直式卡時會被裁切並顯得模糊；荒野部族與地精工程團沒有縮圖對照，因此顯示空白。霜原也改為與其他軍團相同的專用直式圖，避免卡片和詳情使用不同構圖。

## 使用方式

1. 從大廳按「世界圖鑑」。
2. 在左側按「軍團」。
3. 六張軍團卡都應有清晰直式肖像；按任一張後，右側詳情橫幅會使用同一張軍團肖像。
4. 若仍是空白或舊的模糊橫幅，從「設定與測試 → 更新並重新開啟」更新至 v0.85.30。此流程不會刪除玩家進度。

## 資產與資料流程

| 軍團 | 圖鑑肖像 |
| --- | --- |
| 王國遠征軍 | `assets/td/codex/faction-hunter-v2.jpg` |
| 月影守望者 | `assets/td/codex/faction-arcanist-v2.jpg` |
| 暗影軍團 | `assets/td/codex/faction-rogue-v2.jpg` |
| 荒野部族 | `assets/td/codex/faction-wild-v2.jpg` |
| 地精工程團 | `assets/td/codex/faction-goblin-v2.jpg` |
| 霜原盟族 | `assets/td/codex/faction-frostland-v2.jpg` |

所有檔案皆為直式高解析 JPEG，並控制為適合圖鑑載入的檔案大小。`FactionSystem.FACTIONS[id].codexArt` 是詳情的唯一來源；`CodexCatalog` 優先讀取此欄位成為 `entry.art`；`thumbnails.js` 對應同一檔案提供卡片圖。選角頁原有的 `selectionArt` 維持不動，因此不影響開場、戰鬥、軍團解鎖或數值。

```text
FactionSystem.codexArt
        │
        ├── CodexCatalog.entry.art ──> 右側詳情
        └── thumbnails[faction:id] ─> 左側卡片
```

## 驗收與測試

- 執行 `npm run check`。
- 執行 `npm test`；`td-codex.test.js` 會確認六個軍團均有專用 PNG、卡片與詳情來源一致，且圖片至少 1000×1200、為直式構圖。
- 手動檢查桌面與手機橫向：六張卡不空白、不拉伸，按卡切換詳情時圖片不跳回舊橫幅。
- 離線快取名稱為 `sky-strike-v0.85.30`；更新後重新開頁，重複進入圖鑑確認圖片仍可載入。

## 邊界、回復與維護

本版沒有新增帳號、後端、HTTP API、權限、存檔欄位、解鎖條件或戰鬥數值。回復時必須讓六張圖片、`FactionSystem.js`、`CodexCatalog.js`、`thumbnails.js`、`sw.js`、版本標示回到同一版本；不要只替換圖片而保留新版快取名稱。先用既有「匯出完整備份」保留玩家資料；本次回復不需遷移或刪除資料。

新增軍團時，必須同時新增高解析直式 `codexArt`、縮圖對照和測試名冊；不可重用戰場 Sprite 或把超寬選角橫圖硬塞進直式圖鑑卡。
