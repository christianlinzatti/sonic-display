#!/usr/bin/env node
'use strict';
/** V962 fails closed unless all regressions, isolated/full TypeScript and Next.js passed. */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const reports=path.join(root,'reports');
fs.mkdirSync(reports,{recursive:true});
const target=path.join(reports,'v962-production-proof.json');
try{fs.unlinkSync(target);}catch(e){if(e.code!=='ENOENT')throw e;}
const startedAt=new Date().toISOString();
const run=spawnSync(process.execPath,[path.join(root,'scripts/v961-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:60*60*1000});
function parsed(file){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return null;}}
const gate=parsed(path.join(reports,'v931-production-gate.json'));
const base=parsed(path.join(reports,'v961-production-proof.json'));
const mandatory=['V962 narrative light curve','V962 core TypeScript','V961 core TypeScript','Full TypeScript','Next.js production build'];
const checks=Object.fromEntries(mandatory.map(label=>[label,
 gate?.tests?.some(test=>test.label===label&&test.ok===true)===true]));
const passed=run.status===0&&!run.error&&base?.passed===true&&gate?.passed===true&&Object.values(checks).every(Boolean);
const evidence={schema:'sonic-v962-production-proof-v1',platform:process.platform,node:process.version,
 startedAt,finishedAt:new Date().toISOString(),passed:Boolean(passed),checks,
 error:passed?null:(run.error?.code||base?.error||'PRODUCTION_GATE_NOT_CERTIFIED')};
fs.writeFileSync(target,JSON.stringify(evidence,null,2)+'\n');
console.log(`V962 ${passed?'PASS: production certified':'FAIL: no production approval'}`);
if(!passed)process.exitCode=1;
