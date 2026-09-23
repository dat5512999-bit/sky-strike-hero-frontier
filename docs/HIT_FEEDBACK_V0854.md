# 命中回饋 v0.85.4

日期：2026-09-23。這一版只提升 HERO FRONTIER 的戰鬥呈現；傷害、命中判定、碰撞、射程、移動、路線、存檔格式、權限、資料庫與網路 API 都不變。

## 玩家操作手冊

進入任一戰鬥後，普通命中會在怪物受攻擊的一側出現短暫的武器色軌跡與方向性火花，並留下極小的腳下塵土；怪物以短暫後仰和半透明殘影表現受擊。箭矢、冰霜、自然、雷電與混沌／近戰會使用不同色調或形狀。暴擊沿用橘色傷害字與較多火花。

這是自動呈現，沒有新增按鈕、設定或操作成本。怪物沒有命中率／閃避，故不會顯示「未命中」。

## 管理與設定

不需修改設定值或存檔。若要檢查效果，管理者可由自由遠征開戰，分別使用箭矢、冰霜技能、自然系效果與近戰／混沌攻擊，確認接觸點、後仰、血條和傷害數字均可讀。

## 程式接口與架構

`TDGame.onHit(monster, damage, critical, projectile)` 現在將完整投射物來源交給 `CombatFeedbackSystem.hit`。後者由來源座標計算接觸點、色彩類型與純視覺後仰；`Monster.visualPosition()` 將短暫偏移只提供繪製、血條與特效讀取。

```text
Projectile / 技能
       │ onHit（來源方向）
       ▼
TDGame.onHit ──► CombatFeedbackSystem.hit
                         │ 接觸火花、殘留軌跡、塵土
                         ▼
                  Monster.setHitKick
                         │ 僅 visualPosition
                         ▼
              Monster.draw（殘影＋本體）
```

`Monster.x/y` 仍是唯一的路線、碰撞、目標選擇與傷害判定座標；因此視覺後仰不能推開怪物，也不會改變平衡。沒有 HTTP API 或外部權限。

## 安裝、部署、更新與回復

需要 Node.js 18+，沒有新增套件或素材。更新時完整部署 `src/td/entities/Monster.js`、`src/td/systems/CombatFeedbackSystem.js`、`src/td/TDGame.js`、`sw.js` 和 `package.json`；Service Worker 快取名稱已升至 `sky-strike-v0.85.4`。使用者重新整理或關閉舊分頁後，讓新版離線快取接管。

更新前先匯出玩家備份並記錄目前 Git commit。此版沒有存檔遷移；若要回復，還原同一版的完整靜態檔案或以 `git revert` 撤銷本功能的 commit，之後重新執行測試。不要在有未提交修改的工作目錄使用 `git reset --hard`。

## QA 測試清單

1. `node --test tests/td-vfx.test.js`：方向接觸點、純視覺後仰、塵土與既有 VFX 回歸。
2. `npm run check`：語法檢查。
3. `npm test`：全專案回歸。
4. 手動開啟 `td.html`：普通、暴擊、連鎖、範圍、冰霜與群怪命中均不遮蔽血條；暫停／手機橫向不出錯。
5. 驗證命中前後 `Monster.x/y`、路線進度、傷害與金幣獎勵不因畫面後仰改變。

## FAQ

**怪物真的被擊退了嗎？** 沒有。後仰與殘影只存在約 0.12 秒（暴擊 0.16 秒），碰撞與移動座標不變。

**為什麼沒有未命中？** 本遊戲目前沒有命中率系統；攻擊抵達判定範圍即為命中。

**大量敵人會卡頓嗎？** 塵土沿用既有手機與桌面特效上限，整體效果佇列也維持既有上限。
