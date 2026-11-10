'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {hash,classify,reviewAssets}=require('../scripts/ios-rights-review.cjs');
test('owner image declaration is attached without treating voice files or missing generation records as approved',()=>{
  const review={ownerDeclaration:{externalImagesUsed:false,statement:'project-created'}};
  assert(classify({path:'assets/new.png'},[],review).ownerDeclaration);assert.equal(classify({path:'assets/audio/voices/bull/q-v1.wav'},[],review).ownerDeclaration,null);assert.equal(classify({path:'assets/new.png'},[],review).releaseApproved,false);
});
test('rights review distinguishes provider evidence, production references and missing sources without granting approval',()=>{
  const records=[{file:'prompts.json',hash:'abc',type:'production-record',paths:new Set(['assets/a.png'])},{file:'notes.md',hash:'def',type:'documentation-reference',paths:new Set(['assets/b.png'])}];
  for(const [path,status]of [['assets/a.png','production-record-found'],['assets/b.png','documentation-found'],['assets/c.png','source-evidence-needed'],['assets/audio/voices/bull/q-v1.wav','provider-permission-found']]){const r=classify({path,sha256:'abc'},records,{});assert.equal(r.rightsStatus,status);assert.equal(r.releaseApproved,false);assert(r.nextAction);}
});
test('replacing a visually reviewed image invalidates its current inspection status',()=>{
  const review={visualInspections:[{path:'assets/a.png',sha256:'old',releaseApproved:false}]};assert.equal(classify({path:'assets/a.png',sha256:'old'},[],review).visualInspection.current,true);assert.equal(classify({path:'assets/a.png',sha256:'new'},[],review).visualInspection.current,false);
});
test('eight actual inspected covers retain exact hashes and procedural audio sources exist',()=>{
  const review=require('../native/ios/rights-evidence.json');assert.equal(review.visualInspections.length,8);for(const r of review.visualInspections){assert.equal(hash(fs.readFileSync(r.path)),r.sha256);assert.equal(r.releaseApproved,false);}for(const p of review.proceduralAudio.sources)assert(fs.existsSync(p),p);
  const result=reviewAssets(process.cwd(),review.visualInspections.map(r=>({path:r.path,sha256:r.sha256})));assert.equal(result.summary.visuallyInspectedCurrent,8);assert.equal(result.summary.releaseApproved,0);
});
