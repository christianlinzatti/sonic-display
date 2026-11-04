#!/usr/bin/env node
'use strict';
const fs=require('node:fs');const path=require('node:path');const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const reports=path.join(root,'reports');fs.mkdirSync(reports,{recursive:true});
const file=path.join(reports,'v961-production-proof.json');
for(const report of [file,path.join(reports,'v960-production-proof.json')])try{fs.unlinkSync(report);}catch(e){if(e.code!=='ENOENT')throw e;}
const startedAt=new Date().toISOString();
const run=spawnSync(process.execPath,[path.join(root,'scripts/v960-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:60*60*1000});
let gate;try{gate=JSON.parse(fs.readFileSync(path.join(reports,'v931-production-gate.json'),'utf8'));}catch{gate=null;}
let v960;try{v960=JSON.parse(fs.readFileSync(path.join(reports,'v960-production-proof.json'),'utf8'));}catch{v960=null;}
const required=['V961 Govee concert governor regression','V961 core TypeScript','Full TypeScript','Next.js production build'];
const checks=Object.fromEntries(required.map(key=>[key,gate?.tests?.some(t=>t.label===key&&t.ok===true)===true]));
const passed=run.status===0&&!run.error&&gate?.passed===true&&v960?.passed===true&&Object.values(checks).every(Boolean);
fs.writeFileSync(file,JSON.stringify({schema:'sonic-v961-production-proof-v1',platform:process.platform,
 startedAt,finishedAt:new Date().toISOString(),passed:Boolean(passed),checks,
 error:passed?null:(run.error?.code||v960?.error||'PRODUCTION_GATE_NOT_CERTIFIED')},null,2)+'
');
console.log('V961 '+(passed?'PASS production verified':'FAIL production not certified'));
if(!passed)process.exitCode=1;
