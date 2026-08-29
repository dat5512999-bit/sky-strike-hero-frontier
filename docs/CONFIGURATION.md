# 設定手冊

## 一般玩家

Phase 1 無需設定：不需帳號、網路、音效裝置、資料庫或瀏覽器權限。外觀選擇會嘗試寫入瀏覽器本機儲存空間；禁止儲存也不影響遊玩。建議以 1280×720 或更高解析度、100% 瀏覽器縮放遊玩。

## 開發者平衡設定

所有可調數值集中在 `src/config.js`：

- `player`：尺寸、速度、HP、受傷無敵秒數。
- `bullet`：尺寸、速度、傷害。
- `enemy`：尺寸、速度、HP、分數。
- `weapon.fireInterval`：自動射擊間隔，越小射速越快。
- `spawner`：初始／最低生成間隔與難度提升時間。

修改後依序執行 `npm run check`、`npm test`，再按 `docs/TEST_CHECKLIST.md` 手動驗證；同時更新版本號與 `CHANGELOG.md`。

外觀包不在 `config.js` 調整，請依 `docs/SKIN_PACK_GUIDE.md` 註冊，以免把視覺設定耦合到戰鬥平衡。

行動裝置設計基準為 Canvas 480×720，由 CSS 等比例縮放。請勿直接更改 Canvas 內部尺寸；若變更，須同步測試 `InputController` 的座標換算、各皮膚繪圖與所有碰撞箱。
