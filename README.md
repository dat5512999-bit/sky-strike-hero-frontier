# 蒼穹突擊（Sky Strike）

一款可直接在 Windows 的 Chrome / Edge 遊玩的 2D 縱向飛機射擊遊戲。此版本為 **Phase 1 最小可玩版（v0.1.0）**。

## 目前功能

- 滑鼠平滑控制玩家戰機，並限制於畫面邊界。
- 自動單發直線射擊。
- 普通敵機由畫面上方生成並向下移動。
- 子彈／敵機與玩家／敵機碰撞、HP、短暫無敵與擊破效果。
- 分數、死亡、暫停與重新開始。
- 完全本機執行，不需登入、伺服器或第三方套件。

## 立即開始

1. 在專案資料夾雙擊 `index.html`。
2. 使用 Chrome 或 Edge 開啟。
3. 按「開始任務」，移動滑鼠操控戰機。

詳細說明見 [使用者操作手冊](docs/USER_GUIDE.md) 與 [安裝手冊](docs/INSTALLATION.md)。

## 開發與測試

需要 Node.js 18 以上版本：

```powershell
npm test
npm run check
```

## 版本範圍

本版只實作 Phase 1。背景正式卷動、更多敵機、敵方子彈、道具、武器、Boss、音效與完整粒子效果依規劃留待後續 Phase，未提前混入本版。

## 文件索引

- [系統架構](docs/ARCHITECTURE.md)
- [API 文件](docs/API.md)
- [管理者手冊](docs/ADMIN_GUIDE.md)
- [設定手冊](docs/CONFIGURATION.md)
- [版本更新手冊](docs/UPDATE_GUIDE.md)
- [部署手冊](docs/DEPLOYMENT.md)
- [備份還原手冊](docs/BACKUP_RESTORE.md)
- [測試清單](docs/TEST_CHECKLIST.md)
- [FAQ](docs/FAQ.md)
- [更新紀錄](CHANGELOG.md)
