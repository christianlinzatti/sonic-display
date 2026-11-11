#!/usr/bin/env node
'use strict';
const path=require('node:path');
const {spawnSync}=require('node:child_process');
/** A successful real launch proves the installed runtime; optional fonts must not force apt. */
function prepareChromium({run,platform=process.platform}){
 if(!run('Download pinned Chromium',['node_modules/@playwright/test/cli.js','install','chromium']))throw Error('Chromium download failed');
 if(run('Probe headless Chromium',['scripts/prepare-playwright-chromium.cjs','--probe']))return;
 if(platform!=='linux')throw Error('Chromium launch probe failed');
 if(!run('Install missing Chromium system dependencies',['node_modules/@playwright/test/cli.js','install-deps','chromium']))throw Error('Chromium system dependency installation failed');
 if(!run('Verify repaired headless Chromium',['scripts/prepare-playwright-chromium.cjs','--probe']))throw Error('Chromium launch probe still fails after installing dependencies');
}
async function probe(){
 const {chromium}=require('@playwright/test');
 const browser=await chromium.launch({headless:true,timeout:30000,...(process.env.GITHUB_ACTIONS!=='true'&&process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH}:{})});
 try{const page=await browser.newPage();await page.setContent('<title>Chromium ready</title>');if(await page.title()!=='Chromium ready')throw Error('Chromium page probe failed');}
 finally{await browser.close();}
 console.log('PASS real headless Chromium launch and page render');
}
if(require.main===module){
 if(process.argv[2]==='--probe')probe().catch(error=>{console.error(error.message);process.exitCode=1;});
 else try{
  const root=path.resolve(__dirname,'..');
  prepareChromium({run(label,args){console.log(label);const result=spawnSync(process.execPath,[path.join(root,args[0]),...args.slice(1)],{cwd:root,stdio:'inherit',shell:false,timeout:args.includes('--probe')?45000:4*60*1000});return result.status===0&&!result.error;}});
 }catch(error){console.error(error.message);process.exitCode=1;}
}
module.exports={prepareChromium};
