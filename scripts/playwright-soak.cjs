#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path'),{spawnSync}=require('node:child_process');
const {stageReferenceAvatar}=require('./playwright-production.cjs');
const {inspectBuild}=require('./check-next-build-v964.cjs');
const root=path.resolve(__dirname,'..'),args=process.argv.slice(2);
const minutes=Number(args[0]||60);
if(args.length>1||!Number.isFinite(minutes)||minutes<1||minutes>480)throw Error('Usage: node scripts/playwright-soak.cjs [minutes: 1..480]. Run a production build first.');
const build=inspectBuild(root);if(!build.passed)throw Error('Production build missing: '+build.issues.join(', '));
const directory=path.join(root,'reports/playwright-soak');fs.mkdirSync(directory,{recursive:true});
const startedAt=new Date().toISOString();let cleanup=()=>{},passed=false,error;
try{
 cleanup=stageReferenceAvatar(root);
 const run=spawnSync(process.execPath,[path.join(root,'node_modules/@playwright/test/cli.js'),'test','--config=config/playwright.soak.cjs'],{cwd:root,stdio:'inherit',shell:false,timeout:(minutes+5)*60000,env:{...process.env,NODE_ENV:'production',SONIC_SOAK_MINUTES:String(minutes)}});
 passed=run.status===0&&!run.error;if(!passed)error=run.error?.message||'Soak test failed';
}catch(e){error=e.message;}finally{try{cleanup();}catch(e){passed=false;error=e.message;}}
fs.writeFileSync(path.join(directory,'proof.json'),JSON.stringify({passed,error,minutes,startedAt,finishedAt:new Date().toISOString(),buildId:fs.readFileSync(path.join(root,'.next/BUILD_ID'),'utf8').trim()},null,2)+'\n');
if(!passed)process.exitCode=1;
