'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const {pages,validate,blockers}=require('../scripts/ios-legal.cjs');
const config={publisherName:null,supportEmail:null,privacyPolicyUrl:null,supportUrl:null,policyApproved:false};
test('offline legal pages clearly disclose undecided contact details without fake addresses',()=>{
  const p=pages(config);assert.equal(blockers(config).length,5);assert(p['ios-privacy.html'].includes('開發版說明'));assert(p['ios-support.html'].includes('尚未公布'));assert(!p['ios-support.html'].includes('mailto:'));for(const html of Object.values(p))assert(!/<script|<link|<img|<iframe/.test(html));
});
test('publisher strings are escaped, invalid or executable public links are rejected',()=>{
  const p=pages({...config,publisherName:'<script>alert(1)</script>',supportEmail:'help@example.com'});assert(p['ios-support.html'].includes('&lt;script&gt;'));assert(p['ios-support.html'].includes('mailto:help@example.com'));
  for(const value of ['javascript:alert(1)','http://example.com','https://user:password@example.com'])assert.throws(()=>validate({...config,privacyPolicyUrl:value}));assert.throws(()=>validate({...config,supportEmail:'x" onclick="oops'}));
});
test('iOS legal screens compile and remain reachable from player settings',()=>{
  const s=require('../scripts/ios-player-mode.cjs').playerApp(fs.readFileSync('src/td/app/FrontierApp.js','utf8'));new vm.Script(s);assert(s.includes("b('ios-privacy','隱私與本機資料說明')"));assert(s.includes("b('ios-support','客服與常見問題')"));assert(s.includes("b('settings','返回設定')"));
});
test('offline disclosure distinguishes bounded local diagnostics from full player backups',()=>{
 const p=pages(config);assert(p['ios-privacy.html'].includes('32768 字元'));assert(p['ios-privacy.html'].includes('不會自動上傳'));assert(p['ios-support.html'].includes('匯出診斷資訊'));assert(p['ios-privacy.html'].includes('診斷與玩家備份是不同檔案'));
});
