# 外觀商城 QA 報告（最新 0.4.0）

日期：2026-09-21。分支 feature/shop-ui；基底 7f6fa5c；前版 f0f4a8d。

| 項目 | 結果 |
| --- | --- |
| 全部 Node tests | 435 / 435 通過；包含既有商城 13 項、新增 Skin Lab 8 項 |
| npm run check 與本次 JavaScript syntax | 通過 |
| 商城 PC 1920×1080 / 1366×768 / 使用者 1204×919 | 通過；本機首屏素材就緒 384 / 263 / 276 ms |
| iPhone landscape 844×390 / 932×430 觸控模擬 | 通過；243 / 286 ms |
| 典藏捲動 | 箭頭、Home / End、桌面滑鼠拖曳、兩組尺寸原生 touch swipe 通過 |
| 異界來訪 | 整張卡可滑入、價格完整；選取再關閉保留位置；拖曳不誤選 |
| 商城 Safe Area | 左右 47px／底部 21px 注入測試；詳情、44px 主要操作不越界 |
| Skin Lab PC 1920×1080 / mobile 844×390 | 前後四組動作各四格同步、兩邊像素不同 |
| 比較頁操作 | 暫停、轉向、原尺寸、減少動態設定預設暫停通過 |
| 圖片失敗 | 刻意阻擋霜華圖，明示原版回退，不誤稱已換裝 |
| Console error / pageerror / HTTP 4xx+ | 商城五組正常流程、比較頁兩組正常流程皆為 0；圖片阻擋另測 |
| 存檔隔離 | 商城與比較頁 localStorage 哨兵完全不變、無額外儲存 |
| Core 隔離 | entities、systems、config、app、td.html/css、sw.js 相對基底無變更 |

商城既有流程仍驗證所有分類、收藏、取消購買／扣款、Owned／Equipped／卸下、Locked、價格待公布、重整重設、手機焦點循環、Safe Area。資料層仍驗證餘額不足、重複／並行購買、Adapter 失敗原子回復、CAS 衝突、Schema 與安全路徑。

Skin Lab 直接載入既有 Hero 與 ArtSystem，單元測試驗證真實 Hero.update 四組動作各格可達、唯讀 snapshot、繪製前後能力一致、原有 bounds/metrics 完全不變。新圖只使用獨立頁的新 metadata key。這是呈現與模型隔離驗證，**不等同正式皮膚完整戰局、裝備、復活、掉落和排名的端到端驗證**。

本輪修正手機 End 與進行中的平滑捲動干擾（Home / End 改用即時定位），以及比較頁霜華臉部裁切；對應完整瀏覽器測試重跑通過，PC、手機與前後比較截圖已實際檢視。

證據：

- [商城結果](../../artifacts/qa-cosmetic-shop/results.json)、[比較頁結果](../../artifacts/qa-skin-lab/results.json)
- [435 項單元測試](../../artifacts/qa-skin-lab/unit-results.txt)、[語法檢查](../../artifacts/qa-skin-lab/syntax-results.txt)
- [使用者尺寸的典藏最右側](../../artifacts/qa-cosmetic-shop/pc-user-1204x919-collection-right.png)、[手機典藏最右側](../../artifacts/qa-cosmetic-shop/iphone-844x390-collection-right.png)
- [PC 前後比較](../../artifacts/qa-skin-lab/pc-before-after.png)、[手機前後比較](../../artifacts/qa-skin-lab/iphone-before-after.png)、[原尺寸](../../artifacts/qa-skin-lab/pc-actual-size.png)

瀏覽器為本機 Microsoft Edge / Playwright；未有 WebKit runtime，也不是實體 iPhone Safari。Safe Area 模擬不能替代瀏海、旋轉、Safari 工具列與主畫面模式的實機測試。效能僅屬此工作站本機 HTTP。

正式接入、缺素材與合併風險見 [可行性文件](SKIN_FEASIBILITY_V030.md) 與 [合併注意事項](MERGE_NOTES.md)。

## Skin Lab 0.3.1

施法改用獨立四格素材與足點，修正裁切／鄰格碎片，鏡頭保留完整光效空間。新增 PNG 必須隨版部署；API、操作、管理、更新回復、架構與測試見 [施法修正交付](CAST_FIX_V031.md)。Core、存檔與付款範圍不變。
## Skin Lab 0.4.0：三英雄

完整 Node tests 439／439 通過（新增 4 項英雄造型測試）。PC 1920×1080／手機橫向 844×390：三英雄、四動作、四格同步、能力數值、暫停／轉向／原尺寸、無橫向溢出、localStorage 不變皆通過；正常流程 Console／pageerror／HTTP error 皆為 0。兩套獨立攻擊圖集各四格透明邊界皆 0，PC／手機與雙方向共 64 組繪製邊緣像素皆 0。快速切換、直接網址、缺圖回退與再切換恢復通過。

[結果 JSON](../../artifacts/qa-hero-looks/results.json)、[439 項測試](../../artifacts/qa-hero-looks/unit-results.txt)、[四格攻擊圖](../../artifacts/qa-hero-looks/attack-frames.png)。人工檢視 PC／手機兩套新造型截圖；實機 Safari 仍待驗收。詳細測試與限制見 [0.4.0 交付](HERO_LOOKS_V040.md)。

本版亦重跑既有 qa-skin-lab（PC／手機、四組同步動作、減少動態、素材失敗回退）、qa-skin-clipping（32 組霜華施法繪製），全部通過。npm run check 與新增／修改 JS 語法檢查通過。
