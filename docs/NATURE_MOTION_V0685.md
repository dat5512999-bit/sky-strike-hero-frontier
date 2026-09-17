# 0.68.5 馭獸師與熊的戰鬥動作

保留原始圖集設計；停止使用上版簡化造型。馭獸師維持定點，會轉向敵人並播放四格施法；熊依 idle / walk / attack 顯示站立、交替踏步、張口揮爪。三種成長造型各自擁有畫格。朝向使用左右翻轉，不是八方向圖集。

熊的傷害、攻擊間隔、範圍及高階濺射保留；投射物以極短飛行時間結算近戰並留下短爪痕，不再播放飛行法球。

架構：CombatUnit/Summon 狀態 → ArtSystem.drawBeastmaster/drawBear → 靜態動作矩形；Summon 攻擊 → Projectile claw → 命中爪痕。靜態邊界離線量測，直接開檔不需讀取 Canvas 像素。

安裝與更新：保留整份資料夾後完整更新，直接開 td.html 或 npm run serve:test。離線快取 sky-strike-v0.68.5 包含 beastmaster-actions-v3.png 和 bear-actions-v2.png。無存檔遷移；重新開啟頁面載入新素材。

備份回復：artifacts/nature-motion-backup 保存本次修改前檔案，依相對路徑覆回可恢復前版；保留原素材與 localStorage。

驗證：npm test（345 通過）、npm run check 通過。scripts/qa-nature-motion.cjs 直接開檔檢查實際施法、行走與攻擊狀態並擷取連續畫面；artifacts/qa-nature-motion/playback.html 可播放。另驗證預覽與直接 HTML 無瀏覽器錯誤。

生成工具：內建 imagegen，以 faction-builds-v1.png 為身份參照。
提示一：transparent 4 columns x 2 rows druid sprite sheet; preserve silver hair antlers shoulder owl green gold robe crystal staff; four idle poses and four distinct spellcast poses (raise staff, lean extend, release nature spark, recover); fixed scale and ground baseline, no text or scenery.
提示二：transparent 4 columns x 3 rows bear sheet; rows original cub, leaf armored bear, antler rune elder; columns stand, running gait A, running gait B, open-mouth bite/swiping paw; preserve designs with articulated leg/jaw changes, same scale within each row, no labels or scenery.
