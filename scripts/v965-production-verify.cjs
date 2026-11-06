#!/usr/bin/env node
'use strict';
/** V965: inherit every prior production regression + real TypeScript/Next build,
 * then independently verify actual emitted artifacts from THIS invocation.
 */
const fs=require('node:fs'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const {inspectBuild}=require('./check-next-build-v964.cjs');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'reports'),proof=path.join(dir,'v965-production-proof.json');
fs.mkdirSync(dir,{recursive:true});
try{fs.unlinkSync(proof)}catch(e){if(e.code!=='ENOENT')throw e}
const startedAt=new Date().toISOString();
const structure=spawnSync(process.execPath,[path.join(root,'tests/v966-project-structure-regression.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:30000});
// V972: verify the new purely virtual atmosphere before inherited full TypeScript/Next gate.
// This does not replace the existing production build or hide failures.
const atmosphereV972=spawnSync(process.execPath,[path.join(root,'tests/v972-volumetric-stage-regression.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:120000});
const run=spawnSync(process.execPath,[path.join(root,'scripts/v964-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:60*60*1000});
const read=name=>{try{return JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'))}catch{return null}};
const gate=read('v931-production-gate.json'),inherited=read('v964-production-proof.json');
const labels=['V972 volumetric stage atmosphere','V972 core TypeScript','V965 verified room wave','V965 public deployment smoke regression',
 'V965 core TypeScript','V964 verified post-peak recovery','V964 Next.js emitted output guard',
 'V964 core TypeScript','V963 verified bridge regression','V963 core TypeScript',
 'V962 narrative light curve','V962 core TypeScript','V961 core TypeScript',
 'Full TypeScript','Next.js production build'];
const checks=Object.fromEntries(labels.map(label=>[label,
 gate?.tests?.some(test=>test.label===label&&test.ok===true)===true]));
// The inherited V964 proof begins BEFORE this build; matching emitted .next
// files must have been created since that start, not from a previous job.
const buildStartMs=Date.parse(inherited?.startedAt||'');
const artifacts=(inherited?.passed===true&&Number.isFinite(buildStartMs)&&buildStartMs>0)
 ?inspectBuild(root,buildStartMs):{passed:false,issues:['No valid V964 proof'],appPageCount:0};
const productionPassed=atmosphereV972.status===0&&!atmosphereV972.error&&structure.status===0&&!structure.error&&run.status===0&&!run.error&&inherited?.passed===true&&gate?.passed===true&&
 Object.values(checks).every(Boolean)&&artifacts.passed;
// ZIP imports trigger this protected workflow; browser failures must fail its existing gate.
const browser=productionPassed
 ?require('./playwright-production.cjs').runProductionTests({existingBuildSince:buildStartMs})
 :{passed:false,error:'Production build gate failed; browser tests not run'};
// Short resource soak runs in the existing matrix, without adding another automatic workflow.
let soak={passed:false,error:'Browser checks failed; soak not run'};
if(productionPassed&&browser.passed===true){
 const result=spawnSync(process.execPath,[path.join(root,'scripts/playwright-soak.cjs'),'1'],{cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:6*60*1000});
 const data=read('playwright-soak/proof.json');const results=read('playwright-soak/results.json');
 soak={...data,passed:result.status===0&&!result.error&&data?.passed===true&&results?.stats?.expected===1&&results.stats.unexpected===0&&results.stats.skipped===0&&results.stats.flaky===0};
 fs.writeFileSync(path.join(dir,'v959-regression-logs/playwright-soak.log'),JSON.stringify({proof:soak,results},null,2)+'\n');
}
const passed=productionPassed&&browser.passed===true&&soak.passed===true;
fs.writeFileSync(proof,JSON.stringify({schema:'sonic-v965-production-proof-v1',
 platform:process.platform,node:process.version,startedAt,finishedAt:new Date().toISOString(),
 passed:Boolean(passed),playwright:browser,soak,v972AtmospherePassed:atmosphereV972.status===0&&!atmosphereV972.error,structurePassed:structure.status===0&&!structure.error,checks,artifact:{passed:artifacts.passed,appPageCount:artifacts.appPageCount,
 issues:artifacts.issues},error:passed?null:run.error?.code||'PRODUCTION_GATE_NOT_CERTIFIED'},null,2)+'\n');
console.log('V965 '+(passed?'PASS production certified':'FAIL no production approval'));
if(!passed)process.exitCode=1;
