'use strict';
const {spawn}=require('node:child_process'),fs=require('node:fs'),path=require('node:path');
function runCaptured(executable,args,file,timeoutMs){return new Promise(resolve=>{
 fs.mkdirSync(path.dirname(file),{recursive:true});const out=fs.createWriteStream(file);const child=spawn(executable,args,{stdio:['ignore','pipe','pipe'],shell:false});let timedOut=false,kill;
 for(const source of [child.stdout,child.stderr])source.on('data',chunk=>{out.write(chunk);process.stdout.write(chunk);});
 const timer=setTimeout(()=>{timedOut=true;child.kill('SIGINT');kill=setTimeout(()=>child.kill('SIGKILL'),15000);},timeoutMs);
 child.on('error',error=>{out.write(error.message);});child.on('close',code=>{clearTimeout(timer);clearTimeout(kill);out.end(()=>resolve(timedOut?124:code??1));});
});}
if(require.main===module)runCaptured(process.execPath,[require.resolve('@playwright/test/cli'),'test','--config=config/playwright.production.cjs'],'reports/playwright-production/browser-console.log',90*60*1000).then(code=>process.exitCode=code);
module.exports={runCaptured};
