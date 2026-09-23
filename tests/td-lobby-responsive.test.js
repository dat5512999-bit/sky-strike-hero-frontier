'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {load}=require('./helpers/td-runtime.cjs');
test('compact wallet retains currency identity and full balances for assistive technology',()=>{
  const {ns}=load(),app=Object.create(ns.systems.FrontierApp.prototype);
  for(const [kind,label] of [['gold','帳戶金幣'],['diamonds','鑽石']]){
    const html=app.walletButton(kind,1234567);
    assert.ok(html.includes('aria-label="'+label+'：1,234,567"'));
    assert.ok(html.includes('title="'+label+'：1,234,567"'));
    assert.match(html,/<i aria-hidden="true"/);
    assert.match(html,/<span>1,234,567<\/span>/);
    assert.doesNotMatch(html,/<small>/);
    assert.match(html,/data-action="wallet"/);
  }
});
