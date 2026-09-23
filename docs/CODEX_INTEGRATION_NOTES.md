# Codex Integration Notes — 分支暫停交接

> 主目錄整合狀態 v0.83.5：已接上 ProfileStore、實際敵人生成／部署、核准任務獎勵與序章回顧；不推論整章通關、不匯入 debug 資料。以下暫停與不 merge 說明為原分支交接歷史。 詳見 [商城與圖鑑整合交付](FEATURE_INTEGRATION_V0835.md)。

分支：`feature/codex-chronicle`。功能基準：`70175ee`，版本 `0.79.3-codex.3`／Codex 1.2.0。

功能提交完整；整理本文件前工作目錄乾淨。既有證據為 451 項測試通過及 Edge／Chrome PC、Mobile Landscape 測試通過；本次僅整理文件，沒有重跑功能測試或修改程式。

保留：PC 三欄、Chronicle 分類、Timeline、防劇透標題、Progressive Lore、Story Adapter／Event Mapping、Save Bridge、Battle Bridge、Debug Tool 與 Mobile Landscape。分支暫停，等待新的明確指示；不新增 UI、Canon、Chapter I 劇情或 Cinematic，不修改 Story Core，不 Merge 到 main。

以下為 **未來 Story Core Merge 後** 的正式接線清單，本次不執行：

## 1. Mission Event Mapping

- 注入正式 `getMission(id)` 與核准的 `StoryCodexMapping.events`，將 `mission-started:<id>`／`mission-completed:<id>` 對應既有 Codex actions、Chronicle milestones；不從示範任務推論劇情。
- Core 成功保存任務完成後，經 `bindStoryCore(source.subscribe)` 或 `hero-frontier:story` 發送 `{type:'mission-completed', id}`；擇一綁定。條件留在資料與 Adapter，不寫進 Mission UI。
- 接入現有 Battle Bridge 的實際 spawn／部署紀錄；取代 Core 在波次預告時寫入整波敵種的舊做法，避免未遇見就解鎖。

## 2. Chapter Complete Event

- 正式章節資料提供 `requiredMissionIds`、`rewards` 與 `ready`；目前 Chapter I／II 均保持 `ready:false`。
- 發送 `{type:'chapter-completed', id}`，由 `completeChapter(id)` 驗證所有必要任務並去重發獎。示範任務完成、Debug 獎勵模擬都不代表正式章節完成。

## 3. Hero / Faction Unlock

- 核對正式 Hero／Faction gameplay IDs；任務獎勵讀取原 `mission.rewards.heroes/factions`，章節獎勵讀取 Chapter Reward Data，沿用 `ProfileStore.unlocks`。
- Chapter I 已預留 `faction:arcanist`／`faction:rogue` 對應銀葉／暮影，正式接線時確認對照；Hero 名單由 Story Data 決定。Chapter II 的 `wild-horde` 僅為待接代號，不發出尚不存在的解鎖。

## 4. Cinematic Complete Callback

- 先由正式事件 `unlockCinematic` 登錄 ID；播放器真正播放完成後才發送 `{type:'cinematic-completed', id}`。取消或開始播放不算看完；不沿用舊 `startCinematic` 的開始旗標。
- 核對 Chronicle `cinematicId`、Catalog `cinematicProgress` 與 `integration.player.play`。已完成觀看重用原 `cinematics` 陣列中的 `cinematic:<id>`；播放器與資產未接妥前保持 Placeholder／Coming Soon。

## 5. Save Migration / Progress Sync

- Codex 頁面與 Battle Bootstrap 注入同一 active profile 的 `ProfileStore`；Profile 切換後重建 Bridge。重用 `completed/encountered/discovered/cinematics/unlocks`，其餘史料、已讀版本與去重資料保存於 `data.codexProgression`。
- 現有 Profile root `saveVersion:1` 與 extension `saveVersion:1` 保持相容；未來 Core schema 改動需在正式 migration 中處理。Standalone 活動 key 為 `heroFrontierProgressionV1`，舊 keys 保留作回復備份。
- Standalone → Profile 的進度轉移尚需正式決定目的 profile 與合併規則；目前不自動匯入，避免把舊解鎖帶入 New Game。同步須保留已取得片段、已讀狀態、事件 receipts，不能覆蓋舊史料或重複發獎。
- Merge 驗收：New Game → 實際遭遇 → 任務完成 → Chronicle／NEW → 閱讀 → 追加史料 → Save／Reload；另驗證章節獎勵、影片完成／中止、Profile 切換與重複事件。

完整 API、存檔欄位與回復步驟：[交付文件](STORY_CODEX_PROGRESSION_V1_UX_V1_2.md)。測試證據：`artifacts/qa-codex-v1.2/`。
