'use strict';
/** Offline analysis of actual V777 browser report JSON (no browser, network or telemetry). */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('../tests/typescript-loader.cjs');
const fileName=path.resolve(__dirname,'../services/monitoring/concertQualityAdvisorV778.ts');
const output=ts.transpileModule(fs.readFileSync(fileName,'utf8'),{
 fileName,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}}).outputText;
const mod=new Module(fileName,module);mod.filename=fileName;mod.paths=Module._nodeModulePaths(path.dirname(fileName));mod._compile(output,fileName);
const {assessConcertQualityV778,summarizeConcertQualityComparisonV778}=mod.exports;
const {compareFiles}=require('./v777-compare-concerts.cjs');
const arg=(k,d)=>process.argv.find(s=>s.startsWith(`--${k}=`))?.slice(k.length+3)??d;
function loadJson(file){const stat=fs.statSync(file);if(stat.size>5*1024*1024)throw Error('JSON > 5 MB: '+file);return JSON.parse(fs.readFileSync(file,'utf8'))}
function asMarkdown(advice,compare){
 const lines=['# Sonic Display V778 – Concert Performance Quality Advisor','',
  `Status: **${advice.status}** · FPS-Ziel: **${advice.targetFps}**`,'',
  ...advice.issues.map(s=>'- '+s),''];
 if(advice.status!=='ready')return lines.join('\n')+'\n';
 lines.push('## Messwerte','', '| Bühne | GLBs | FPS | P95 ms | Draw Calls | Ziel |', '|---|---:|---:|---:|---:|---|');
 for(const s of advice.cases)lines.push(`| ${s.stage} | ${s.avatars} | ${s.fps} | ${s.p95Ms} | ${s.drawCalls} | ${s.targetReached?'ja':'nein'} |`);
 lines.push('','## Empfehlung','',`Darstellerzahl: ${advice.recommendedAvatars??'nicht durch Ziel gedeckt'}. Profil zum Testen: ${advice.recommendedQuality}.`,'',
  ...advice.recommendations.map(x=>'- '+x),'','## Hardwareevidenz','',advice.hardwareVerdict,'',
  '## Aussagegrenzen','',...advice.notes.map(x=>'- '+x));
 if(compare)lines.push('','## Vorher/nachher','',compare.summary,'',...compare.warnings.map(x=>'- '+x));
 return lines.join('\n')+'\n';
}
function main(){
 const input=arg('input',null);if(!input)throw Error('Aufruf: --input=artifacts/v777/current.json [--target=30|45|60] [--before=...] [--out=...]');
 const target=Number(arg('target','60'));
 const advice=assessConcertQualityV778(loadJson(input),target);
 let comparison=null;
 const before=arg('before',null);
 if(before&&advice.status==='ready'){
  const oldAssessment=assessConcertQualityV778(loadJson(before),target);
  comparison=oldAssessment.status==='blocked'
   ?{status:'incompatible',summary:'Älterer V777-Bericht ungültig; keine Verbesserung berechenbar.',improved:0,regressed:0,neutral:0,warnings:oldAssessment.issues}
   :summarizeConcertQualityComparisonV778(compareFiles(before,input));
 }
 const report={...advice,comparison,assessedAt:new Date().toISOString()};
 const out=path.resolve(arg('out','artifacts/v778/advice.json'));
 fs.mkdirSync(path.dirname(out),{recursive:true});
 fs.writeFileSync(out,JSON.stringify(report,null,2)+'\n');
 const md=out.replace(/\.json$/i,'')+'.md';fs.writeFileSync(md,asMarkdown(advice,comparison));
 console.log('V778 Quality Advisor:',advice.status);
 console.log('FPS-Ziel:',advice.targetFps,'| GLBs:',advice.recommendedAvatars??'nicht nachgewiesen','| Profilversuch:',advice.recommendedQuality??'—');
 if(advice.status==='ready')for(const g of advice.groups)console.log(g.avatars+' GLBs:',g.targetReached?'Ziel erreicht':'Ziel verfehlt',
   '/ min FPS:',g.minFps,'/ P95 max:',g.maxP95Ms,'/ kritisch:',g.worstStage);
 for(const text of advice.status==='blocked'?advice.issues:advice.notes)console.log('-',text);
 if(comparison)console.log('V777 Vergleich:',comparison.status,'–',comparison.summary);
 console.log('Berichte:',out,md);
 if(advice.status==='blocked'||comparison?.status==='incompatible')process.exitCode=2;
 return report;
}
if(require.main===module){try{main()}catch(e){console.error('V778 BLOCKED:',String(e?.message||e));process.exitCode=1}}
module.exports={loadJson,asMarkdown,main};
