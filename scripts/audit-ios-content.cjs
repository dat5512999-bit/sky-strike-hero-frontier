'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {plan}=require('./build-static-site.cjs'),legal=require('./ios-legal.cjs');
const ROOT=path.resolve(__dirname,'..');
const {reviewAssets}=require('./ios-rights-review.cjs');
const RECORDS=['assets/audio/voices/bull/provider-rights.json','assets/audio/voices/bull/manifest.json','assets/td/shop/ART_MANIFEST.json','assets/td/shop/HERO_LOOKS_MANIFEST.json','assets/td/shop/FROST_PROTOTYPE_MANIFEST.json','assets/td/shop/FROST_CAST_MANIFEST.json','assets/td/shop/THUNDER_COMPLETE_MANIFEST.json','docs/EVOLUTION_ART_V085102.json'];
function strings(value){return typeof value==='string'?[value]:value&&typeof value==='object'?Object.values(value).flatMap(strings):[];}
function audit(root=ROOT){
  const source=plan(root),records=RECORDS.filter(f=>fs.existsSync(path.join(root,f))).map(file=>({file,values:strings(JSON.parse(fs.readFileSync(path.join(root,file),'utf8')))}));
  const assets=source.files.filter(f=>/\.(png|webp|jpg|jpeg|svg|wav|mp3|ogg|m4a|mp4|webm)$/i.test(f.path)).map(f=>({path:f.path,bytes:f.bytes,sha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(root,f.path))).digest('hex'),evidenceRecords:records.filter(r=>r.values.includes(f.path)).map(r=>r.file),rightsStatus:'pending-review'}));
  const config=JSON.parse(fs.readFileSync(path.join(root,'native/ios/legal-config.json'),'utf8'));
  const detailed=reviewAssets(root,assets);
  return{schema:2,toolVersion:require('../package.json').iosPreparationVersion,releaseReady:false,legalBlockers:legal.blockers(config),summary:{mediaFiles:assets.length,mediaBytes:assets.reduce((n,a)=>n+a.bytes,0),legacyDirectRecordMatches:assets.filter(a=>a.evidenceRecords.length).length,rightsCleared:0,...detailed.summary},providerChecks:detailed.providerChecks,proceduralAudio:detailed.proceduralAudio,evidenceRecords:records.map(r=>r.file),assets:detailed.assets,limits:detailed.limits};
}
module.exports={audit};
if(require.main===module){try{const args=process.argv.slice(2);if(args.some(a=>!['--release-check'].includes(a))||args.length>1)throw Error('用法：node scripts/audit-ios-content.cjs [--release-check]');const result=audit(),out=path.join(ROOT,'artifacts/ios-compliance');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'content-audit.json'),JSON.stringify(result,null,2));console.log(JSON.stringify({...result,assets:undefined},null,2));if(args.includes('--release-check')){console.error('尚不可送審：發行資料、素材權利及原生隱私盤點尚未完成。');process.exitCode=1;}}catch(error){console.error(error.message);process.exitCode=1;}}
