'use strict';
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function validate(config){
  for(const key of ['publisherName','supportEmail','privacyPolicyUrl','supportUrl'])if(config[key]!==null&&(typeof config[key]!=='string'||!config[key].trim()))throw Error('無效的發行資料：'+key);
  if(config.supportEmail!==null&&!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(config.supportEmail))throw Error('客服信箱格式不正確');
  for(const key of ['privacyPolicyUrl','supportUrl'])if(config[key]!==null){const u=new URL(config[key]);if(u.protocol!=='https:'||u.username||u.password)throw Error('公開政策與客服頁必須使用 HTTPS');}
  if(typeof config.policyApproved!=='boolean')throw Error('policyApproved 必須為 boolean');
  return config;
}
function blockers(config){validate(config);return ['publisherName','supportEmail','privacyPolicyUrl','supportUrl'].filter(k=>!config[k]).concat(config.policyApproved?[]:['policyApproved']);}
function pages(config){
  validate(config);const contact=config.supportEmail?'<a href="mailto:'+escape(config.supportEmail)+'">'+escape(config.supportEmail)+'</a>':'客服信箱尚未公布（開發版）';
  const publisher=config.publisherName?escape(config.publisherName):'發行者名稱尚未定案（開發版）';
  const shell=(title,body)=>'<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>'+title+'</title><style>html{color-scheme:dark}body{margin:0;padding:20px;background:#102127;color:#eee6d4;font:16px/1.7 system-ui,sans-serif;overflow-wrap:anywhere}main{max-width:760px;margin:auto}h1{font-size:25px}h2{font-size:19px}a{color:#9be6f1}.notice{padding:12px;background:#4a321d}</style></head><body><main><h1>'+title+'</h1>'+body+'</main></body></html>';
  const notice=blockers(config).length?'<p class="notice">開發版說明：發行者聯絡資料及政策確認尚未完成，本頁不能代替正式上架的公開政策與客服網址。</p>':'';
  return {
    'ios-privacy.html':shell('隱私與本機資料說明',notice+'<p>發行者：'+publisher+'</p><h2>遊戲在裝置保存什麼</h2><p>本開發版以本機儲存保存劇情與關卡進度、英雄與軍團解鎖、遊戲貨幣、造型紀錄、裝備、戰績、閱讀紀錄及音效與畫面設定，用於續玩與呈現遊戲內容。</p><h2>本機診斷</h2><p>遊戲另在本機保存最近三次開啟的診斷摘要，包含版本、平台類型、波次、英雄、有限的最近操作與錯誤類別／程式行號。每次最多 64 筆事件，全部序列化內容上限 32768 字元，不記錄完整存檔、原始裝置識別碼、網址或原始錯誤訊息，也不會自動上傳。可在設定中匯出或清除診斷紀錄；診斷與玩家備份是不同檔案。儲存不足時可能只能暫存在頁面內。</p><h2>連線與第三方服務</h2><p>目前檢視的遊戲程式沒有接入廣告、追蹤、遠端帳號或分析服務；語音與圖像由 App 內附資源讀取，排行榜目前也是本機戰績。正式原生 SDK 仍待安裝後盤點，App Store 隱私標籤須依最終版本確認。</p><h2>備份與保留</h2><p>匯出會產生包含進度、貨幣與造型紀錄的 JSON 檔，由你選擇保存位置；請勿任意公開。匯入會替換現有進度，並在本機保留匯入前資料。備份不會自動上傳給開發者。Safari 與 App 的資料不會自動共用。</p><h2>刪除資料</h2><p>目前尚未提供 App 內清除全部資料功能。刪除 App 可能使本機進度遺失；若要保留進度請先備份，備份檔須自行刪除。系統或個人雲端備份行為依裝置設定而定。</p><h2>聯絡與政策變更</h2><p>'+contact+'。正式發行前會依實際功能、SDK 與發行者資料更新本說明。</p>'),
    'ios-support.html':shell('遊戲支援與常見問題',notice+'<p>發行者：'+publisher+'</p><p>'+contact+'</p><h2>進度如何備份</h2><p>回到大廳的設定，選擇「匯出玩家備份」並妥善保存檔案。還原時選擇「匯入玩家備份」。目前只接受 iOS 玩家格式，不能匯入開發者或管理者備份；真機的檔案操作仍待驗收。</p><h2>看不到原本 Safari 的進度</h2><p>App 與 Safari 使用不同的本機儲存。這個開發版沒有自動轉移功能，請保留原本的遊戲資料與備份。</p><h2>遊戲卡住或沒有聲音</h2><p>先確認裝置音量與音訊輸出，再回到大廳。重新開啟前，若可以操作請先匯出備份。不要為了排錯直接刪除 App 或清除資料。</p><h2>回報問題時</h2><p>可先在設定選擇「匯出診斷資訊」，再提供遊戲版本、iPhone 型號、iOS 版本及發生步驟。診斷檔須由你自行選擇是否分享，遊戲不會自動送出。截圖前遮住私人資訊；不必提供 Apple 密碼、驗證碼或完整備份檔。</p><h2>商城與付費</h2><p>目前商城使用遊戲貨幣，此開發版未提供真錢購買鑽石、訂閱或 Apple 內購。未來如增加付費功能，會更新交易與支援說明。</p>')
  };
}
module.exports={validate,blockers,pages};
