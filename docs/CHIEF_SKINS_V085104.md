# 大酋長三款商城造型重製 v0.85.104

2026-11-07，本機完成，未提交或推送 GitHub。延續使用者確認的野髮、滄桑獸人臉、精悍露肌與破甲拼補身份，重新製作既有三款造型的立繪與完整動作，讓購買前後及戰場角色一致。沒有增加商品或改變戰力。

## 產品與操作

| 既有 ID | 名稱 | 價格（鑽石） | 保留的主題 |
| --- | --- | --- | --- |
| thunder-king | 雷霆戰王 | 1280 | 銀鋼拼甲、深藍披風、藍色斧刃 |
| bone-emperor | 冥骨帝王 | 1280 | 象牙骨板、紫色布料、翡翠裝飾 |
| night-owl-warden | 夜梟巡守 | 1680 | 紫黑梟羽、開放面部的額飾 |

商城選大酋長商品可查看新立繪，已購買者直接裝備即可；不需要重新購買、刪存檔或重設進度。造型實驗室三款都可選，支援待機、行走、攻擊與施法。進化外觀偏好沿用原規則，選擇進化外觀時顯示本體的覺醒／超凡；選擇商城造型時顯示已裝備商品。

故障排除：若網頁仍顯示舊圖，先確認遊戲版本 0.85.104，從既有更新入口更新後重新開啟。不要清除玩家資料。若顯示進化本體，檢查外觀偏好及目前裝備。缺圖會回到本體渲染，不會改寫購買紀錄。

## 正式素材與製作紀錄

每組各有一張立繪、一張四列四欄動作圖；每列四格，依序待機、行走、攻擊、施法，共 48 個完整姿勢。

- assets/td/shop/thunder-chief-portrait-v2.png
- assets/td/shop/thunder-chief-actions-v4.png
- assets/td/shop/bone-chief-portrait-v2.png
- assets/td/shop/bone-chief-actions-v2.png
- assets/td/shop/night-owl-warden-portrait-v2.png
- assets/td/shop/night-owl-warden-actions-v2.png

使用內建 imagegen，以已確認的大酋長及各款新立繪為參考，要求真透明背景；輸出原樣複製，未用像素編輯程式修改。完整提示與逐格量測見 [製作紀錄](CHIEF_SKINS_PROMPTS_V085104.json)。原有 ART／HERO_LOOKS／THUNDER_COMPLETE 製作清單保留歷史，這三款的現行資料以本文件及 ChiefSkinAtlas 為準。

所有新圖已實際檢視，動作圖逐格量測確認 16 個隔離角色、沒有越框；非正方形圖集以實際矩形裁切。舊素材仍保留本機，靜態發布與 iOS 打包排除退役的三款造型圖。這是身份一致性與相似性改善，不代表法律核准。故事合成插畫、漫畫與影片中的舊大酋長仍是後續獨立工作。

## 架構與 API

```text
src/td/shop/ChiefSkinAtlas.js（不可變的逐格來源框、腳底點）
  ├─ ThunderKing / SkinCatalog → 商品及立繪
  ├─ HeroLooks → 三款試裝 → ChiefPreview
  ├─ CosmeticArt → 雷霆／冥骨 → 同一預覽渲染器
  └─ CrossworldSkinArt → 夜梟 → 同一預覽渲染器
                         ↓
                  既有武器／軍械疊圖
```

FrontierChiefSkinAtlas[skinId] 提供 form 與 layouts。form 包含 path、實際 width/height、visible、worldHeight=92 及 16 個 frames；layouts 分為 motion 八格、attack 四格、cast 四格。每格來源框與 anchor 於製作時量測，執行時不掃描像素。ChiefPreview.createChiefRenderer 接收已載入圖及對應 layouts，Canvas 狀態以 try/finally 還原；未就緒走既有本體 fallback。

瀏覽器先載入 ChiefSkinAtlas，再載入 ThunderKing、ChiefPreview 與相關渲染器。Node 工具使用同份 module.exports。沒有新增資料庫、網路 API、依賴套件或玩家存檔欄位；商品 ID、價格、所有權、裝備鍵、能力、進化規則保持相容。

## 安裝、設定與測試

沿用專案現有 Node 環境及 README 的啟動設定，不需安裝新程式。啟動 npm run serve:test 後開啟 http://127.0.0.1:4173/td.html。單獨預覽網址為 /skin-lab.html?hero=chief&skin=商品ID。

驗收指令：

```text
npm test
npm run check:site
npm run qa:chief-skins
npm run qa:evolution-all
npm run qa:local-update
node scripts/verify-pages-release.cjs http://127.0.0.1:4173/
npm run qa:ios-player
npm run ios:audit
```

瀏覽器 QA 使用環境既有 Playwright 與 Edge，NODE_PATH 指向既有執行環境的 node_modules；不新增安裝。需先啟動本機測試伺服器。若使用其他埠，依各 QA 腳本的 URL 環境變數設定。

本輪結果：

- 全套 1,205 項測試通過，包括新增四項重製測試；涵蓋三款 × 三進化階 × 四狀態 × 四影格 × 左右方向共 288 次渲染、裁切、裝備、舊存檔與發布清單。
- 真實瀏覽器三次購買總扣 4240、重買拒絕、裝備／重新開啟保留；96 個含左右方向及最高階裝備的姿勢、三款缺圖 fallback、三款獨立預覽通過，沒有 JS 錯誤。購買只在隔離測試存檔操作，未改使用者帳號。
- 全 11 英雄、桌機／手機共 44 組買石至進化流程與商城造型相容驗證通過。
- 本機 275 檔逐位元驗證通過；v0.85.100 → 104 更新、舊快取淘汰與玩家資料保留通過。
- iOS 玩家包雙尺寸、存檔重開、備份匯入、管理者入口封鎖與無 Worker 通過。這不是 iPhone 真機或 App Store 認證。
- 網站發布計畫 822 檔、865940737 bytes；iOS 開發包 823 檔、來源 865908791 bytes。權利盤點 562 媒體，未自動簽署任何法律核准。

視覺證據與購買報告：artifacts/chief-skins；全英雄進化證據：artifacts/evolution-all。

## 部署、管理與回復

版本同步為 0.85.104，包含 Worker、更新入口、ProfileStore 與戰報。正式發布需包含六張新圖、共享 metadata 及所有引用變更，不能只替換商城立繪。build-static-site 的排除規則保留新六檔、排除同三款退役圖，verify-pages-release 逐檔核對新圖內容。未進行 GitHub 推送或外部部署。

native/ios/www 已重新產生 0.85.104 獨立玩家開發包，上一份完整 0.85.103 保留在 artifacts/ios-backups/pre-chief-skins-v085103。仍未建立／簽署 Xcode 工程、IPA 或 TestFlight；發行者、客服信箱與送審缺項見 IOS_RELEASE_PREPARATION.md。

備份玩家資料使用既有匯出功能。若需回復畫面，先備份目前原始碼與資源包，再成套還原商城 metadata、預覽、渲染器、所有引用及發布排除規則；舊圖本機仍在，不要只改一個檔名。回復原生資源包前先將目前 www 移至新的專案內備份目錄，驗證來源與目的絕對路徑後，再複製已保留的 v103 包。禁止覆寫玩家存檔、強制清儲存或用 reset --hard 丟棄其他未提交工作。回復後重新驗證圖片載入、三款裝備與存檔重開。
