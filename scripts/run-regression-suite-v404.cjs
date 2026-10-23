'use strict';
/** Fast but equivalent execution of the exact commands listed in verify:offline.
 * The historic npm run chain remains supported; this runner avoids starting npm
 * 150+ times. Each test still runs in its own clean Node child process.
 */
const assert=require('node:assert/strict');
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const pkg=require('../package.json');
const visited=[];
function run(script,depth=0){
  assert(depth<8,`Circular npm script dependency: ${script}`);
  const command=pkg.scripts[script];
  assert(command,`Unknown test script: ${script}`);
  for(const part of command.split(/\s*&&\s*/).map(s=>s.trim()).filter(Boolean)){
    const nested=part.match(/^npm\s+run\s+(\S+)$/);
    if(nested){run(nested[1],depth+1);continue;}
    const matches=part.match(/^node\s+(.+)$/);
    assert(matches,`Unsupported test command in ${script}: ${part}`);
    const args=matches[1].split(/\s+/).filter(Boolean);
    const result=spawnSync(process.execPath,args,{cwd:root,encoding:'utf8',timeout:45000,
      env:{...process.env,CI:process.env.CI||'1'}});
    const label=`${script}: ${args.at(-1)}`;
    if(result.status!==0){
      console.error(`FAIL ${label}`);
      if(result.stdout)process.stdout.write(result.stdout);
      if(result.stderr)process.stderr.write(result.stderr);
      if(result.error)console.error(result.error.message);
      process.exit(1);
    }
    visited.push(label);
    console.log(`PASS ${label}`);
  }
}
run('verify:offline');
console.log(`PASS full offline regression: ${visited.length} isolated test invocations`);
