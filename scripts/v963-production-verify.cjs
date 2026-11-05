#!/usr/bin/env node
'use strict';
/** Fail closed: require V963 and all V962/V961/960 inherited regressions,
 * full TypeScript, and a real Next.js production build in this very invocation. */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const reports=path.join(root,'reports');
fs.mkdirSync(reports,{recursive:true});
const report=path.join(reports,'v963-production-proof.json');
try{fs.unlinkSync(report);}catch(e){if(e.code!=='ENOENT')throw e;}
const startedAt=new Date().toISOString();
const run=spawnSync(process.execPath,[path.join(root,'scripts/v962-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:60*60*1000});
const load=(file)=>{try{return JSON.parse(fs.readFileSync(path.join(reports,file),'utf8'));}catch{return null;}};
const gate=load('v931-production-gate.json'),base=load('v962-production-proof.json');
const labels=['V963 verified bridge regression','V963 core TypeScript',
 'V962 narrative light curve','V962 core TypeScript','V961 core TypeScript',
 'Full TypeScript','Next.js production build'];
const checks=Object.fromEntries(labels.map(label=>[label,
 gate?.tests?.some(test=>test.label===label&&test.ok===true)===true]));
const passed=run.status===0&&!run.error&&base?.passed===true&&gate?.passed===true&&
 Object.values(checks).every(Boolean);
fs.writeFileSync(report,JSON.stringify({schema:'sonic-v963-production-proof-v1',
 platform:process.platform,node:process.version,startedAt,finishedAt:new Date().toISOString(),
 passed:Boolean(passed),checks,error:passed?null:(run.error?.code||base?.error||'PRODUCTION_GATE_NOT_CERTIFIED')},null,2)+'\n');
console.log(`V963 ${passed?'PASS production certified':'FAIL no production approval'}`);
if(!passed)process.exitCode=1;
