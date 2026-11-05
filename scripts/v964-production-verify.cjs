#!/usr/bin/env node
'use strict';
/** V964 production proof: inherited full gate MUST run fresh in this process.
 * Fail closed on any missing V964/V963/V962/V961 result, TypeScript or real build.
 */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const directory=path.join(root,'reports');
fs.mkdirSync(directory,{recursive:true});
const output=path.join(directory,'v964-production-proof.json');
try{fs.unlinkSync(output);}catch(e){if(e.code!=='ENOENT')throw e;}
const startedAt=new Date().toISOString();
const invocation=spawnSync(process.execPath,[path.join(root,'scripts/v963-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',windowsHide:true,shell:false,timeout:60*60*1000});
const read=(name)=>{try{return JSON.parse(fs.readFileSync(path.join(directory,name),'utf8'));}catch{return null;}};
const gate=read('v931-production-gate.json');const inherited=read('v963-production-proof.json');
const labels=['V964 verified post-peak recovery','V964 Next.js emitted output guard',
 'V964 core TypeScript','V963 verified bridge regression','V963 core TypeScript',
 'V962 narrative light curve','V962 core TypeScript','V961 core TypeScript',
 'Full TypeScript','Next.js production build'];
const checks=Object.fromEntries(labels.map(label=>[label,
 gate?.tests?.some(test=>test.label===label&&test.ok===true)===true]));
const passed=invocation.status===0&&!invocation.error&&inherited?.passed===true&&
 gate?.passed===true&&Object.values(checks).every(Boolean);
fs.writeFileSync(output,JSON.stringify({schema:'sonic-v964-production-proof-v1',
 platform:process.platform,node:process.version,startedAt,finishedAt:new Date().toISOString(),
 passed:Boolean(passed),checks,error:passed?null:invocation.error?.code||'PRODUCTION_GATE_NOT_CERTIFIED'},null,2)+'\n');
console.log('V964 '+(passed?'PASS: complete production certified':'FAIL: not production-certified'));
if(!passed)process.exitCode=1;
