# 0.64.0 驗收紀錄（2026-09-17）

## 結論與邊界

`npm test`：306／306 通過。`npm run check`：所有列出的遊戲腳本語法通過。名稱搜尋在執行期檔案／UI／操作文件沒有不合理舊名稱；CHANGELOG 保留歷史。ID、存檔 key 不變，沒有以中文名稱判斷玩法的分支。

瀏覽器使用本機 Windows Edge Chromium headless。手機部分包含真正派發的多點 Touch/Pointer 事件，但仍是桌面瀏覽器模擬，不是實體 iPhone 或 Android。沒有把 CPU 計時宣稱為手機 FPS／GPU 效能，也沒有宣稱做過真人盲測。

## 自動化覆蓋

- `tests/td-faction-builds.test.js`：15 項，涵蓋名稱／ID、射擊數量、印記、易傷、衝鋒錨點、穿甲目標、折射防循環、熊生命週期、所有來源死亡、漏怪排除、亡魂、通用召喚 Buff、DOT 擴散、機器人分支、折扣回收。
- `tests/td-joystick.test.js`：10 項，涵蓋 360°／死區、既有移速、Bounds／建築、取消／旋轉、對話框、Hero 替換、PC 隔離等。
- `tests/td-vfx.test.js`：13 項，詳見下表。
- 其餘既有測試繼續檢查固定士兵、獨立裝備、HUD、相機、敵人間距、計分保存、離線資產、圖集與射擊模式。

| VFX 場景 | 驗證內容 |
| --- | --- |
| 1. Chain Lightning | 雷電武器 proc 接實際 chainPoints；不重複目標，Canvas 逐段線路 |
| 2. 火砲爆炸 | 拋物線繪製；多受害者只產一次爆炸，半徑等於真實 splash |
| 3. 小型機器人 | 成形 → 接近 → 0.18 秒警示 → 自爆 |
| 4. 大型機器人 | 0.65 秒蓄能，100 世界單位 AOE，明顯較大的外觀與衝擊 |
| 5. 暗影召喚 | 紫色法陣／聚魂／淡入，0.55 秒成形期間不攻擊 |
| 6. 森林召喚 | 綠色葉形粒子／自然成形，三階熊外觀 |
| 7. Soul 收集 | 真實死亡位置到收集建築；數值不因粒子上限減少 |
| 8. 瘟疫／DOT | 綠霧、易傷符文、感電弧，非單靠頭頂 Icon |
| 9. 冰霜／Slow | 身邊冰晶；根脈另用藤蔓，狀態過期移除 |
| 10. Buff／Aura | 短暫小型腳下提示；完整範圍只在選取／部署 |
| 11. Critical | 額外火花與 Sprite 微震，不改世界座標／Camera |
| 12. 大量死亡 | 300 次死亡事件仍受預算限制，Boss／魔法類區分並按時清理 |
| 13. 多效果同時 | 混合召喚、DOT、爆破、鏈擊；繪製安全、不改傷害結果 |

同一套正式 renderer 的固定場景圖：[VFX Gallery](../artifacts/qa-v064/vfx-gallery.png)。這是開發測試組圖，不是新遊戲模式，也不是用概念圖冒充實際渲染。

## 瀏覽器檢查

`scripts/qa-mobile-joystick.cjs`：

- 844×390：按住移動、放開不再前進、搖桿不拖相機、第二指召喚技能可用。
- 空地 Pan、雙指 Pinch 不移動英雄；暫停立即清理搖桿，恢復需重新按住。
- 568×320、667×375、844×390、932×430：搖桿、英雄摘要、建造鍵、技能列不相交。
- 直橫旋轉重新計算；PC 無搖桿且原滑鼠移動可用。無 pageerror。
- 截圖／結果保存在 `artifacts/qa-v063/`（搖桿開發階段的既有資料夾，最終仍在 0.64.0 程式重跑）。

`scripts/qa-battle-vfx.cjs`：

- 三個新英雄／軍團的實際開局流程可用；暗影軍團商店有 16 張跨族／特殊契約預覽，沒有 enemyOnly。
- 桌面王國建造頁 14 張卡可見（6 士兵 + 8 建築）；圖集與文字無重複占位。
- 844×390 商店框在 viewport 內，傭兵區內部捲動，不超出底部；[手機傭兵預覽](../artifacts/qa-v064/mercenary-previews-mobile.png)。
- 混合實戰 fixture：180 怪物、14 位部署單位／建築、42 召喚物，連續 240 次 update/draw。是為壓力刻意擺放，不代表玩家可以在道路違規部署。
- 最後量測完整結果以 [results.json](../artifacts/qa-v064/results.json) 為準；樣本曾測得 PC 平均約 4.35ms / P95 5.80ms，Mobile viewport 約 3.63ms / P95 4.60ms。每次執行會因機器與隨機戰鬥稍有變動。
- 上述時間僅為桌面 CPU 的更新／Canvas 指令提交，不含完整 GPU frame／真機節流；feedback 保持 PC ≤140、Mobile ≤90，Synergy visuals ≤100，沒有 JS pageerror。

## 重跑方式

在專案根目錄：

```powershell
npm test
npm run check
npm run serve:test
```

保持伺服器終端開啟，在另一個終端執行：

```powershell
# 瀏覽器 QA 為選用開發依賴，不是遊戲執行依賴；需要電腦已裝 Edge。
npm install --no-save --package-lock=false playwright
node scripts/qa-mobile-joystick.cjs
node scripts/qa-battle-vfx.cjs
```

本次使用已存在的 Playwright runtime，沒有提交 node_modules／lockfile。腳本阻擋 Service Worker，以測當前工作樹；正式 PWA 更新另按部署手冊檢查 Cache 名與重新載入。

## 尚未宣稱完成的驗證

- 實體 iOS Safari、Android Chrome 的長時間溫控／GPU／省電模式。
- 真人盲測「不用數字能辨認」；本次完成顏色、軌跡、範圍與事件對應及實際截圖檢查。
- 所有難度完整 30 波通關平衡；V1 新值是可測起點，不宣稱完整平衡定稿。
- 新角色完整骨架或逐幀跑步動畫；本版是透明姿態與程序化 VFX。

## 修改檔案導覽

新增：HeroJoystick.js、BattleSynergySystem.js、faction-builds-v1.png、td-joystick／td-faction-builds／td-vfx 測試、共用 runtime 測試 helper、兩支瀏覽器 QA 腳本及本規格／報告。

調整：TDGame、main、config；Hero／CombatUnit／Building／Monster／Projectile／Summon；HeroRoster／ProfessionSystem／FactionSystem；Build／TowerSkill／TowerEvolution／Armory／Art／CombatFeedback／BattlefieldCamera／WaveCatalog；td.html／td-combat.css；package／sw；對應既有測試。

同步：README、操作／管理／API／FAQ／架構／安裝／部署／備份還原／設定／更新／美術／測試清單與 CHANGELOG。完整變更清單可用本版 Git commit 的 Files changed 檢視。
