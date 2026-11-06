#!/usr/bin/env node
'use strict';
/** V1013: no-dependency release/CI preflight; runs BEFORE npm ci on both OSes.
 * No network, credentials, git mutation, or side effects on success.
 */
const fs=require('node:fs');
const path=require('node:path');
const REQUIRED=['v1010','v1011','v1012','v1013'];
const FEATURES={
 v1010:'tests/v1010-network-coordination-regression.cjs',
 v1011:'tests/v1011-network-dashboard-regression.cjs',
 v1012:'tests/v1012-network-health-regression.cjs',
 v1013:'tests/v1013-production-stability-regression.cjs',
};
const read=(root,file)=>fs.readFileSync(path.join(root,file),'utf8');
function inspectReleaseV1013(root){
 const checks=[];
 function check(id,ok,reason=''){checks.push({id,ok:Boolean(ok),reason});}
 let pkg,lock,workflow,gate,vercel,preflight;
 for(const [label,name] of Object.entries({pkg:'package.json',lock:'package-lock.json',
   workflow:'.github/workflows/v965-room-wave-production.yml',gate:'scripts/v931-production-gate.cjs',
   vercel:'scripts/vercel-production-build.cjs',preflight:'scripts/v959-source-preflight.cjs'})){
   try{const source=read(root,name); const parsed=(label==='pkg'||label==='lock')?JSON.parse(source):source;
     ({pkg:()=>pkg=parsed,lock:()=>lock=parsed,workflow:()=>workflow=parsed,gate:()=>gate=parsed,
       vercel:()=>vercel=parsed,preflight:()=>preflight=parsed})[label]();}
   catch(e){check('read:'+name,false,e.message);}
 }
 if(pkg&&lock){
   const version=/^0\.1\.0-v([1-9][0-9]*)$/.exec(pkg.version||'');
   check('version',Boolean(version&&Number(version[1])>=1013),'Current version must be >= V1013');
   check('release-metadata',Boolean(version&&pkg.sonicRoadmapRelease==='v'+version[1]&&
     pkg.sonicFeatureRelease==='v'+version[1]),'Package, feature and roadmap releases must match');
   check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version,
     'package.json / package-lock.json / root package must match');
   check('node-engine',pkg.engines?.node==='24.x'&&lock.packages?.['']?.engines?.node==='24.x',
     'Both package manifests must require Node 24.x');
   const prebuild=(pkg.scripts?.prebuild||'').split(/\s*&&\s*/);
   check('prebuild-current',Boolean(version&&prebuild[0]==='npm run test:v'+version[1]&&
     prebuild.at(-1)==='npm run check:fast'),'Current regression first; historic fast gate last');
   for(const item of REQUIRED){
     check('script:'+item,pkg.scripts?.['test:'+item]==='node '+FEATURES[item],
       'Regression script missing or rerouted');
     check('source:'+item,fs.existsSync(path.join(root,FEATURES[item])),FEATURES[item]);
   }
 }
 if(workflow){
   check('single-prod-matrix',workflow.includes('os: [ubuntu-24.04, windows-latest]')&&
     workflow.includes('node-version: \'24\'')&&workflow.includes('npm ci --include=dev --no-audit --no-fund')&&
     workflow.includes('node scripts/v965-production-verify.cjs'),
     'Keep real Linux/Windows production runner');
   check('real-production-gates',workflow.includes('Verify lockfile and cross-platform source names')&&
     workflow.includes('node scripts/v959-source-preflight.cjs')&&
     workflow.includes('Regressions, full TypeScript, production build and Playwright'),
     'Do not bypass TypeScript, Next.js or Playwright');
 }
 if(gate)for(const item of REQUIRED){
   check('full-ci:'+item,gate.includes(FEATURES[item]),
     'All recent features must run inside the mandatory V931 production matrix');
 }
 if(vercel)for(const item of REQUIRED){
   check('vercel:'+item,vercel.includes(FEATURES[item]),
     'All recent features must run inside Vercel production validation');
 }
 if(preflight)check('preinstall-hook',preflight.includes('inspectReleaseV1013(root)'),
   'V1013 checks must run before npm ci without installed dependencies');
 return {passed:checks.length>0&&checks.every(x=>x.ok),checks};
}
if(require.main===module){
 const root=path.resolve(__dirname,'..');const result=inspectReleaseV1013(root);
 for(const x of result.checks)console.log((x.ok?'PASS':'FAIL')+' V1013 '+x.id+(x.ok?'':': '+x.reason));
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1013};
