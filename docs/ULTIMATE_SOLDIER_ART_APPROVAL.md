# 終極士兵美術定稿 v1

2026-09-17：使用者確認三張概念圖「非常好 OK」。以下為已核准的造型參考，尚非可直接載入戰場的透明動畫圖集。

| 軍團 | 單位 | 確認圖 |
| --- | --- | --- |
| 月影 | 翡翠古龍 | [圖片](../assets/td/concepts/emerald-ancient-dragon-approved-v1.png) |
| 王國 | 皇家重裝統領 | [圖片](../assets/td/concepts/royal-commander-approved-v1.png) |
| 暗影 | 深淵魂鋼魔像 | [圖片](../assets/td/concepts/soulsteel-golem-approved-v1.png) |

## 已確認的方向

- 翡翠古龍：成年、強壯四足、巨大雙翼、銀色月紋護甲、翡翠吐息。製作小尺寸素材時保留龍角、胸甲、雙翼輪廓。
- 皇家重裝統領：白金重甲、獅徽巨鎚、藍色披風。保留巨鎚與寬肩輪廓。
- 深淵魂鋼魔像：黑鐵巨軀、巨大雙拳、紫色靈魂核心。保留非人形構造感及胸口核心。
- 舊 assets/td/faction-dragon-v1.png 按使用者要求規劃轉作敵方怪物，原始檔保留。

## 接入狀態（已由 0.67.0 更新）

三位已製作透明圖集並接入招募、技能與戰鬥，舊龍已轉為 wildDragon 敵軍。詳見 [0.67.0](ULTIMATE_SOLDIERS_V1.md)。以下段落保留概念圖核准當時的歷史狀態。

### 核准當時

本次僅保存已核准概念圖及決策，沒有修改遊戲規則、軍團名單、怪物波次或執行版本。舊龍目前仍未在程式中轉為敵方。

後續需依核准圖製作透明背景、統一視角及動作圖集，驗證實際戰場尺寸下的辨識度，再接入 ArtSystem、單位資料、敵方波次與測試。不可直接將有背景的大幅概念圖當作完成的遊戲動畫。價格與技能尚屬前次提案，造型確認不代表數值已測得平衡。

## 生成紀錄

使用內建 imagegen，非 CLI。三張原始生成圖保留於生成目錄，專案副本位於 assets/td/concepts/。

提示詞要點：同系列手繪感 3D 奇幻 RTS 全身單位確認圖、深藍灰背景、清楚輪廓、無文字。

- Dragon: powerful adult Emerald Ancient Dragon; muscular chest, four legs, two enormous wings, ivory horns, emerald scales, silver elven armor, cyan moon magic, emerald breath glow; majestic and intimidating.
- Commander: Royal Heavy-armored Commander; ivory steel plate, royal gold trim, blue cloak, lion-crested crowned helmet, massive two-handed sunsteel warhammer, restrained command aura.
- Golem: Abyssal Soulsteel Golem; jagged black iron and obsidian plates, massive fists, planted legs, spectral skull face, violet soul furnace, magical cracks and broken chains.
