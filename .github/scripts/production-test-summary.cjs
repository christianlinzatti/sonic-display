'use strict';
const fs=require('node:fs'),path=require('node:path');
function read(root,file){try{return JSON.parse(fs.readFileSync(path.join(root,'reports',file),'utf8'));}catch{return null;}}
const cell=v=>String(v??'').replace(/[|\r\n]/g,' ').replace(/</g,'&lt;');
function summary(root){
 const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
 const gate=read(root,'v931-production-gate.json'),proof=read(root,'v965-production-proof.json'),browser=read(root,'playwright-production/proof.json');
 const soak=read(root,'playwright-soak/proof.json');
 const rows=gate?.tests??[],stats=browser?.stats;
 const lines=[`## ${cell(pkg.sonicRoadmapRelease||pkg.version)} · Production test results`,
 `Source: \`${cell(process.env.SONIC_TEST_REVISION||process.env.GITHUB_SHA)}\` · ${cell(process.platform)}`,
 '',`**Overall: ${proof?.passed===true?'PASS':'NOT CERTIFIED'}**`,
 '',`- Regression, type and build checks: ${rows.filter(x=>x.ok).length}/${rows.length}${gate?'':' — report missing; stage not reached'}`,
 `- Playwright: ${stats?.expected??0} passed, ${stats?.unexpected??0} failed, ${stats?.skipped??0} skipped, ${stats?.flaky??0} flaky${browser?'':' — report missing; stage not reached'}`,
 `- Resource soak: ${soak?(soak.passed?'PASS':'FAIL'):'not run'}${soak?.minutes?` (${soak.minutes} minute run)`:''}`,
 '', 'The full suite belongs to this workflow. Deployment reachability runs separately and does not certify the test suite.',
 '', 'Additional feature regression steps above are independent mandatory checks; an earlier failed step can prevent the build/browser stages from running.',
 '', '<details><summary>Each recorded regression, type and build check</summary>','', '| Check | Result | Seconds |','| --- | --- | ---: |'];
 for(const x of rows)lines.push(`| ${cell(x.label)} | ${x.ok?'PASS':'FAIL'} | ${((x.elapsedMs??0)/1000).toFixed(1)} |`);
 lines.push('','</details>','','Reports are uploaded as the production artifact even when a step fails. A missing report is not a passing test.','');
 return lines.join('\n');
}
if(require.main===module){const text=summary(path.resolve(__dirname,'../..'));console.log(text);if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,text);}
module.exports={summary};
