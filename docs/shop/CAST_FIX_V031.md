# Skin Lab 0.3.1：施法裁切修正

前版 a67f098。問題有兩層：霜華使用原版圖的裁切遮罩且擴張採樣範圍，導致輪廓被切與鄰格碎片混入；預覽只依待機高度放大，施法上舉光效超出 canvas。

## 修正與操作

進入 skin-lab.html，重新整理後選「施法」。四格施法改用獨立 frost-cast-prototype-v1.png，每格指定來源矩形與足點，不繼承原版 cuts / Path2D。新圖第三格光束較寬，因此不能直接按 2×2 等分取樣。待機、移動與攻擊仍保留既有試作圖；原版 Hero / ArtSystem / SpriteFrameBounds 原檔沒有修改。

預覽相機合併兩種造型所有動作與左右朝向的顯示範圍，固定縮放並預留上下左右空間。放大倍率可能比前版小，確保完整光效可見；不改動畫時序、技能範圍、碰撞或戰鬥數值。

## 架構與 API

```mermaid
flowchart LR
  Hero[同一 Hero 狀態] --> Renderer[Skin Lab 呈現 Adapter]
  Renderer --> Existing[原版及非施法：ArtSystem]
  Renderer --> Cast[霜華施法：專用四格與足點]
  Cast --> Fit[兩種造型全動作包圍範圍]
  Existing --> Fit
  Fit --> Canvas[固定相機與安全留白]
```

PreviewModel.js 匯出 castLayout（src、referenceSize、bodyHeight、frames）。每格是 [x,y,width,height,anchorX,anchorY]；數值僅限美術座標。createRenderer(engine,image,castImage) 在霜華施法時使用專用圖片，其餘交回既有 ArtSystem 方法。presentationBounds / fitCamera 計算呈現範圍，不操作 Hero 屬性。舊 prototype 註冊不再複製執行期 Path2D 快取，也不再把取樣矩形一律擴張 12px。

這取代 0.3.0 可行性文件中「施法仍沿用原圖切格並擴張 12px」的試作方式。正式多造型動畫 frame contract 仍需整合分支定案，不能將本頁 Adapter 當作已接 Combat Core。

## 安裝、管理、部署、更新與回復

無新增套件、資料庫、HTTP API、權限、存檔與帳號設定；啟動方式沿用商城手冊。部署必須包含新的 frost-cast-prototype-v1.png 與同版 src/td/skin-lab，不能只替換 HTML。新資產與原提示見 [FROST_CAST_MANIFEST.json](../../assets/td/shop/FROST_CAST_MANIFEST.json)，使用內建 image_gen 生成。原圖完整保留。

若畫面仍裁切，先重新整理並確認載入 0.3.1；若顯示素材失敗，檢查新增 PNG 是否部署與 URL 大小寫。專用施法圖載入失敗會明示回退原版，避免繼續展示有問題的舊施法圖。美術仍是試作，正式上線前需逐格動作與獨立技能特效驗收。

備份此次 commit 與新增素材；本頁沒有持久資料需要遷移。可 git revert 本次修正或另開 a67f098 worktree 回看舊版，不 reset 主工作目錄。合併需保留 P0/P1 的 Core 版本，接入範圍與上一版相同，不合併 main。

## 測試清單

- npm test：435 項通過；新增無舊遮罩的四格採樣、鏡頭範圍與唯讀模型回歸測試。
- node scripts/qa-skin-clipping.cjs：四個來源矩形邊緣均透明，PC／mobile、兩種造型、兩個方向、四格，共 32 組沒有像素碰到 canvas 邊界。
- node scripts/qa-skin-lab.cjs：PC 1920×1080、mobile 844×390 四組動作同步、暫停／轉向／原尺寸、Console、存檔哨兵、圖片失敗與 reduced-motion。
- JavaScript 語法檢查；Core 原檔 diff 為空。商城版面及購買邏輯未變更。

證據：[逐格畫面](../../artifacts/qa-skin-lab/cast-all-frames-fixed.png)、[裁切像素檢查](../../artifacts/qa-skin-lab/clipping-results.json)、[前版問題](../../artifacts/qa-skin-lab/cast-clipping-before.png)、[完整比較頁結果](../../artifacts/qa-skin-lab/results.json)。瀏覽器使用 Edge；手機為觸控模擬，非實體 iPhone Safari。
