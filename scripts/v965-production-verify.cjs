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
const run=spawnSync(process.execPath,[path.join(root,'scripts/v964-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:60*60*1000});
const read=name=>{try{return JSON.parse(fs.readFileSync(path.join(dir,name),'utf8'))}catch{return null}};
const gate=read('v931-production-gate.json'),inherited=read('v964-production-proof.json');
const labels=['V965 verified room wave','V965 public deployment smoke regression',
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
const passed=structure.status===0&&!structure.error&&run.status===0&&!run.error&&inherited?.passed===true&&gate?.passed===true&&
 Object.values(checks).every(Boolean)&&artifacts.passed;
fs.writeFileSync(proof,JSON.stringify({schema:'sonic-v965-production-proof-v1',
 platform:process.platform,node:process.version,startedAt,finishedAt:new Date().toISOString(),
 passed:Boolean(passed),structurePassed:structure.status===0&&!structure.error,checks,artifact:{passed:artifacts.passed,appPageCount:artifacts.appPageCount,
 issues:artifacts.issues},error:passed?null:run.error?.code||'PRODUCTION_GATE_NOT_CERTIFIED'},null,2)+'\n');
console.log('V965 '+(passed?'PASS production certified':'FAIL no production approval'));
if(!passed)process.exitCode=1;
