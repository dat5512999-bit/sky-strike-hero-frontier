# 蒼穹突擊（Sky Strike）

一款可在電腦與手機瀏覽器遊玩的 2D 縱向飛機射擊遊戲。此版本為 **難度與技能果實垂直切片（v0.4.0）**。

## 目前功能

- 滑鼠平滑控制玩家戰機，並限制於畫面邊界。
- 自動單發直線射擊。
- 普通敵機由畫面上方生成並向下移動。
- 子彈／敵機與玩家／敵機碰撞、HP、短暫無敵與擊破效果。
- 分數、死亡、暫停與重新開始。
- 6 套可即時切換的外觀包；玩家、雙彈體、敵人、特效、背景與 HUD 會成套更換。
- 外觀選擇保存在本機，包含會交替射出漢堡與薯條的「歡樂速食」。
- 手機相對拖曳操作、瀏海安全區、直向提示與 44px 觸控按鈕。
- GitHub Pages 自動部署、可加入主畫面及首次載入後離線啟動。
- 五級威脅曲線，逐步加入高速、追蹤、射擊與大型菁英敵機。
- 敵方瞄準彈與菁英三向彈幕。
- 草莓散射、香蕉連射、葡萄護盾、鳳梨清場四種技能果實。
- 完全本機執行，不需登入、伺服器或第三方套件。

## 立即開始

1. 在專案資料夾雙擊 `index.html`。
2. 使用 Chrome 或 Edge 開啟。
3. 按「開始任務」，移動滑鼠操控戰機。

手機使用手指在遊戲畫面任意位置拖曳；戰機依拖曳距離移動，手指不必壓在戰機上。

詳細說明見 [使用者操作手冊](docs/USER_GUIDE.md) 與 [安裝手冊](docs/INSTALLATION.md)。

## 開發與測試

需要 Node.js 18 以上版本：

```powershell
npm test
npm run check
```

## 版本範圍

本版以 Phase 1 為基底，並因實際遊玩回饋加入 Phase 2 的敵人難度與 Phase 3 的首批技能果實垂直切片。完整背景卷動、全部敵人／武器、Boss、音效與完整粒子效果仍留待後續 Phase。

## 文件索引

- [系統架構](docs/ARCHITECTURE.md)
- [API 文件](docs/API.md)
- [外觀包製作指南](docs/SKIN_PACK_GUIDE.md)
- [管理者手冊](docs/ADMIN_GUIDE.md)
- [設定手冊](docs/CONFIGURATION.md)
- [版本更新手冊](docs/UPDATE_GUIDE.md)
- [部署手冊](docs/DEPLOYMENT.md)
- [備份還原手冊](docs/BACKUP_RESTORE.md)
- [測試清單](docs/TEST_CHECKLIST.md)
- [FAQ](docs/FAQ.md)
- [更新紀錄](CHANGELOG.md)
