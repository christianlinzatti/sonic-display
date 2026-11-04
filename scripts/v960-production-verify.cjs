#!/usr/bin/env node
'use strict';
/** V960 fail-closed wrapper around the V931/959 full gate. */
const fs=require('node:fs');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const dir=path.join(root,'reports');
const target=path.join(dir,'v960-production-proof.json');
fs.mkdirSync(dir,{recursive:true});
const runStarted=new Date().toISOString();
for(const file of [target,path.join(dir,'v959-build-proof.json'),path.join(dir,'v931-production-gate.json')]){
 try{fs.unlinkSync(file);}catch(err){if(err.code!=='ENOENT')throw err;}
}
const result=spawnSync(process.execPath,[path.join(root,'scripts/v959-production-verify.cjs')],{
 cwd:root,env:process.env,stdio:'inherit',shell:false,windowsHide:true,timeout:60*60*1000});
function readJSON(file){try{return JSON.parse(fs.readFileSync(file,'utf8'));}catch{return null;}}
const base=readJSON(path.join(dir,'v959-build-proof.json'));
const gate=readJSON(path.join(dir,'v931-production-gate.json'));
const sawRegression=gate?.tests?.some(t=>t.label==='V960 concert continuity regression'&&t.ok===true);
const sawTypes=gate?.tests?.some(t=>t.label==='V960 core TypeScript'&&t.ok===true);
const sawFullTypes=gate?.tests?.some(t=>t.label==='Full TypeScript'&&t.ok===true);
const sawBuild=gate?.tests?.some(t=>t.label==='Next.js production build'&&t.ok===true);
const passed=result.status===0&&!result.error&&base?.passed===true&&gate?.passed===true&&
  sawRegression&&sawTypes&&sawFullTypes&&sawBuild;
const proof={schema:'sonic-v960-production-proof-v1',startedAt:runStarted,finishedAt:new Date().toISOString(),
 passed:Boolean(passed),platform:process.platform,node:process.version,
 parallelWorkers:gate?.regressionConcurrency??null,
 checks:{regression:Boolean(sawRegression),coreTypeScript:Boolean(sawTypes),fullTypeScript:Boolean(sawFullTypes),nextBuild:Boolean(sawBuild)},
 error:passed?null:(result.error?.code||base?.error||'PRODUCTION_GATE_NOT_CERTIFIED')};
fs.writeFileSync(target,JSON.stringify(proof,null,2)+'\n');
console.log('V960 '+(passed?'PASS: complete production gate':'FAIL: no production approval'));
if(!passed)process.exitCode=1;
