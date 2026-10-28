'use strict';
/** Run every atomic package.json `test:*` script without recursively running
 * smoke/aggregate suites. Independent tests continue after failures. The exit
 * code is nonzero if *any* registered test failed. Runs locally, no services.
 */
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const scripts=require('../package.json').scripts;
const tests=Object.entries(scripts)
 .filter(([name,cmd])=>name.startsWith('test:')&&!name.startsWith('test:all')&&
   !name.startsWith('test:smoke:')&&!/\bnpm\s+run\s+/.test(cmd)&&
   /^[a-zA-Z0-9:_.-]+$/.test(name))
 .map(([name])=>name)
 .sort((a,b)=>{
   const ai=/^test:v(\d+)/.exec(a),bi=/^test:v(\d+)/.exec(b);
   if(ai&&bi)return Number(ai[1])-Number(bi[1])||a.localeCompare(b);
   if(ai)return -1;if(bi)return 1;return a.localeCompare(b);
 });
if(process.argv.includes('--list')){
 console.log(tests.join('\n'));
 console.log(`\n${tests.length} individually registered test scripts`);
 process.exit(0);
}
const failed=[];
console.log(`Running ${tests.length} individual tests; failures will not stop later tests.`);
for(const [index,name] of tests.entries()){
 console.log(`\n[${index+1}/${tests.length}] ${name}`);
 const onWin=process.platform==='win32';
 const result=spawnSync(onWin?(process.env.ComSpec||'cmd.exe'):'npm',
   onWin?['/d','/s','/c',`npm run ${name}`]:['run',name],
   {cwd:root,stdio:'inherit',env:process.env});
 if(result.error||result.status!==0){
   failed.push({name,status:result.status,error:result.error?.message});
   console.error(`FAILED ${name}: ${result.error?.message??`exit code ${result.status}`}`);
 }
}
console.log(`\nRESULT: ${tests.length-failed.length}/${tests.length} passed; ${failed.length} failed.`);
for(const f of failed)console.error(` - ${f.name}: ${f.error??f.status}`);
if(failed.length)process.exitCode=1;
