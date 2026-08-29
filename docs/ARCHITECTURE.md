# 系統架構

## 設計原則

- 純 HTML / CSS / JavaScript，無執行期依賴。
- 各實體只管理自身狀態；碰撞、生成、武器與流程由 systems 負責。
- `Game` 負責協調，不承載特定武器或敵人規則。
- 實體只保留碰撞與狀態；繪圖委派給目前的 Skin Pack，皮膚不影響傷害與平衡。
- Phase 1 不需要資料庫；遊戲重開即重設狀態。

## 資料夾

```text
index.html
styles.css
src/
  entities/    Player, Enemy, Bullet, Boss, PowerUp
  skins/       SkinRegistry 與內建外觀包
  systems/     Weapon, Collision, Spawner, GameState, Effects
  utils/       數學工具
  Game.js      遊戲協調與迴圈
  main.js      UI 啟動入口
tests/         Node 內建測試
docs/          操作、維運、API 與 QA 文件
```

## 模組關係

```text
main → Game → GameState
             ├─ Player ← Weapon → Bullet
             ├─ Spawner → Enemy
             ├─ Collision(Player, Bullet, Enemy)
             ├─ SkinRegistry → Player/Bullet/Enemy renderers
             └─ Effects
```

後續武器以策略物件擴充 `Weapon`，敵機以行為類別或策略擴充 `Enemy`；Boss 與 PowerUp 已保留獨立實體邊界，無需改寫玩家或碰撞核心。

Skin Registry 讓每個品牌／主題包保持獨立。外觀 renderer 只能讀取實體位置與外觀變體，不修改 HP、碰撞箱、速度或傷害。
