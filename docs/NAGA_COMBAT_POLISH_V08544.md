# 娜迦戰場品質交付 v0.85.44

## 使用者可驗收結果

- 開始自由遠征後選擇破潮者・賽洛，Q/W/E/F 會顯示並使用娜迦專屬圖示與技能，不會出現人族圖示或通用分身／召喚效果。
- Q 會以潮門突進命中前線敵人；W 在英雄腳下產生青綠旋潮；E 為範圍內已部署的娜迦守軍加上潮環；F 在敵群上空落下萬潮三叉戟。
- 賽洛、潮汐衛士、鹽甲破殼者、深潮戰神、魔鬼魚翼襲者、毒沼潛獵者的動作會依逐幀量測邊界繪製。跨格的長槍、尾部、翼膜與水效可超出舊格線，但相鄰幀會由遮罩排除。
- 預設 ×1 僅跑一倍模擬。×3 仍在長時間低幀率時自動暫降 ×2，避免追趕迴圈堆積。

## 驗收命令

```powershell
node --test tests/td-naga-prototype.test.js tests/td-frame-pacing.test.js
npm run check
```

## 離線與回退

此版快取名稱為 `sky-strike-v0.85.44`，包含 `assets/td/naga/tidebreaker-skill-icons-v1.png`。如需回退，必須同時回退 JavaScript、CSS、`SpriteFrameBounds.js`、Service Worker 與版本標示；不可只替換單一圖檔，否則離線快取與技能呈現會不一致。
