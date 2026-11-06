#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {inspectReleaseV1013}=require('../scripts/v1013-release-readiness.cjs');
const {resolveMetadata}=require('../scripts/production-workflow-metadata.cjs');
const root=path.resolve(__dirname,'..');
const required=['package.json','package-lock.json','.github/workflows/v965-room-wave-production.yml',
 'scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs','scripts/v959-source-preflight.cjs',
 ...['v1010-network-coordination','v1011-network-dashboard','v1012-network-health','v1013-production-stability']
    .map(n=>'tests/'+n+'-regression.cjs')];
const fixture=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1013-'));
function mutate(name,fn){const file=path.join(fixture,name);const original=fs.readFileSync(file,'utf8');
 try{const changed=fn(original);fs.writeFileSync(file,changed);
   const result=inspectReleaseV1013(fixture);assert.equal(result.passed,false,name+' must fail closed');
   assert(result.checks.some(x=>!x.ok),name+' must report a failed check');
 }finally{fs.writeFileSync(file,original);}}
try{
 for(const rel of required){const target=path.join(fixture,rel);
   fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,rel),target);}
 let result=inspectReleaseV1013(fixture);assert.equal(result.passed,true,JSON.stringify(result.checks.filter(x=>!x.ok)));
 console.log('PASS V1013 valid release metadata and network regressions in both gates');
 mutate('package.json',s=>{const p=JSON.parse(s);p.sonicFeatureRelease='v1012';return JSON.stringify(p);});
 console.log('PASS V1013 rejects stale feature metadata');
 mutate('package-lock.json',s=>{const p=JSON.parse(s);p.packages[''].version='0.1.0-v1012';return JSON.stringify(p);});
 console.log('PASS V1013 rejects drifted npm root lockfile');
 mutate('package.json',s=>{const p=JSON.parse(s);const current=p.version.split('-v')[1];p.scripts.prebuild=p.scripts.prebuild.replace('test:v'+current,'test:v'+(Number(current)-1));return JSON.stringify(p);});
 console.log('PASS V1013 rejects historical prebuild entry point');
 mutate('scripts/v931-production-gate.cjs',s=>s.replace('tests/v1012-network-health-regression.cjs','tests/obsolete-v1012.cjs'));
 console.log('PASS V1013 rejects omitted network regression in full CI');
 mutate('scripts/vercel-production-build.cjs',s=>s.replace('tests/v1013-production-stability-regression.cjs','tests/obsolete-v1013.cjs'));
 console.log('PASS V1013 rejects omitted release regression in Vercel');
 mutate('scripts/v959-source-preflight.cjs',s=>s.replace('inspectReleaseV1013(root)','null'));
 console.log('PASS V1013 rejects missing pre-install validation');
 mutate('.github/workflows/v965-room-wave-production.yml',s=>s.replace('os: [ubuntu-24.04, windows-latest]','os: [ubuntu-24.04]'));
 console.log('PASS V1013 rejects missing Windows CI runner');
 const p=JSON.parse(fs.readFileSync(path.join(fixture,'package.json'),'utf8'));
 const revision='a'.repeat(40);const expectedRelease='V'+p.version.split('-v')[1];assert.deepEqual(resolveMetadata(p,{revision,expectedRelease,expectedRevision:revision}),{release:expectedRelease,revision});
 assert.throws(()=>resolveMetadata({...p,sonicFeatureRelease:'v1012'},{revision}),/Feature release/);
 assert.throws(()=>resolveMetadata(p,{revision,expectedRevision:'b'.repeat(40)}),/revision differs/);
 console.log('PASS V1013 exact revision and feature release validation');
}finally{fs.rmSync(fixture,{recursive:true,force:true});}
const current=inspectReleaseV1013(root);
assert.equal(current.passed,true,JSON.stringify(current.checks.filter(x=>!x.ok)));
console.log('V1013 Production Build Stabilization: PASS '+current.checks.length+' source gates plus negative fixtures');
