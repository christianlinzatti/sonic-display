#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {attestProductionV1103,REQUIRED}=require('../lib/releaseAttestationV1103.cjs');
const {execFileSync}=require('node:child_process');
// Tests that source validation works in the same way on Windows and Ubuntu.
// Isolated TypeScript guard is compiled in memory with the system tsc available
// from npm ci in CI, or with the installed TypeScript compiler for local smoke.
const ts=require('node:child_process');
const source=read('lib/releaseSourceGuardV1103.ts');
assert(source.includes('export function auditSourcePathsV1103('));
assert(source.includes('export function auditReleaseMetadataV1103('));
assert(!source.includes('fetch(')&&!source.includes('setInterval('));
const release=JSON.parse(read('package.json'));
const releaseVersion=Number(/^0\.1\.0-v(\d+)$/.exec(release.version)?.[1]||0);
assert(releaseVersion>=1103);
assert.equal(release.sonicFeatureRelease,'v'+releaseVersion);
assert.equal(release.sonicRoadmapRelease,'v'+releaseVersion);
const lock=JSON.parse(read('package-lock.json'));
assert.equal(lock.version,release.version);assert.equal(lock.packages[''].version,release.version);
assert.equal(release.engines.node,'24.x');
// Directory inventory: no install caches are part of a distributable ZIP.
const entries=[];let symlinks=0;
function walk(dir=''){
 for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  if(!dir&&['.git','node_modules','.next','reports'].includes(e.name))continue;
  const rel=dir?dir+'/'+e.name:e.name;
  if(e.isSymbolicLink()){symlinks++;continue;}
  if(e.isDirectory())walk(rel);else if(e.isFile())entries.push(rel);
 }
}
walk();assert.equal(symlinks,0,'Release cannot contain ambiguous symlinks');
assert(entries.length>2500&&entries.length<10000);
// Catch case collisions, traversal and Windows reserved path names without
// using OS-specific PATH access. Detection code is itself typechecked below.
const invalid=['../bad','/absolute','foo\\bar','folder//file','folder/../file',
 'folder/a.','folder/a ','CON','NUL.txt','PRN','COM1.md','LPT9','a:b',
 'dir/<foo>','hello\u0000x','folder/aux.txt'];
const os=require('node:os');
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1103-paths-'));
try{
 let compiler='';try{compiler=require.resolve('typescript/bin/tsc')}catch{}
 const args=['--target','ES2022','--module','CommonJS','--skipLibCheck','--strict','--outDir',tmp,'lib/releaseSourceGuardV1103.ts'];
 // On Windows execute the JS compiler through node, never spawn a .cmd shim.
 const result=ts.spawnSync(compiler?process.execPath:'tsc',compiler?[compiler,...args]:args,
  {cwd:root,encoding:'utf8',shell:false,windowsHide:true,timeout:45000});
 assert.equal(result.status,0,'Cannot compile V1103 path guard: '+result.stderr+' '+result.stdout);
 const {auditSourcePathsV1103,auditReleaseMetadataV1103}=require(path.join(tmp,'releaseSourceGuardV1103.js'));
 const verified=auditSourcePathsV1103(entries);
 assert(verified.passed,'Source paths are unsafe: '+JSON.stringify(verified.errors));
 assert.equal(verified.files,entries.length);
 for(const file of invalid)assert(!auditSourcePathsV1103(['ok.ts',file]).passed,`Invalid path allowed: ${file}`);
 assert(!auditSourcePathsV1103(['Foo.ts','foo.ts']).passed);
 assert(!auditSourcePathsV1103(['e\u0301.ts','\u00e9.ts']).passed);
 assert(!auditSourcePathsV1103(['a'.repeat(241)]).passed);
 assert.deepEqual(auditReleaseMetadataV1103(release,lock),[]);
 assert(auditReleaseMetadataV1103({...release,engines:{node:'22.x'}},lock).includes('node24-engine'));
 assert(auditReleaseMetadataV1103(release,{...lock,version:'0.1.0-v999'}).includes('lockfile-version'));
}finally{fs.rmSync(tmp,{recursive:true,force:true});}
const validRevision='a'.repeat(40),now=Date.now(),date=n=>new Date(now-n).toISOString();
function fixture(){
 const stats={expected:3,unexpected:0,skipped:0,flaky:0};
 const gate={passed:true,tests:[...REQUIRED.map(label=>({label,ok:true})),
  ...Array.from({length:30},(_,i)=>({label:'Additional '+i,ok:true}))]};
 const browser={schema:'sonic-playwright-production-v1',passed:true,
  startedAt:date(250000),finishedAt:date(220000),buildId:'fresh-build-123',stats};
 const proof={schema:'sonic-v965-production-proof-v1',passed:true,platform:'linux',node:'v24.22.2',release:'v1103',revision:validRevision,
  startedAt:date(600000),finishedAt:date(120000),playwright:{...browser},
  soak:{passed:true},artifact:{passed:true,appPageCount:7},
  checks:Object.fromEntries(Array.from({length:15},(_,i)=>['mandatory'+i,true]))};
 return {pkg:{version:'0.1.0-v1103',sonicRoadmapRelease:'v1103',sonicFeatureRelease:'v1103'},
  revision:validRevision,proof,gate,inherited:{passed:true,platform:'linux',startedAt:date(500000)},
  browser,soak:{passed:true},soakResults:{stats:{expected:1,unexpected:0,skipped:0,flaky:0}},now,
  runtimeVersion:'v24.22.2',runtimePlatform:'linux'};
}
const base=fixture(),attested=attestProductionV1103(base);
assert(attested.passed&&attested.failed.length===0);
function reject(mutator,expected){const test=fixture();mutator(test);const r=attestProductionV1103(test);assert(!r.passed);if(expected)assert(r.failed.includes(expected),`${expected}: ${r.failed}`);}
reject(x=>{x.pkg.sonicFeatureRelease='v1102'},'matching-current-release');
reject(x=>{x.revision='master'},'exact-source-revision');
reject(x=>{x.proof.revision='b'.repeat(40)},'proof-matches-exact-imported-revision');
reject(x=>{x.proof.release='v1102'},'proof-matches-exact-imported-revision');
reject(x=>{x.proof.node='v22.16.0'},'actual-node24-runtime');
reject(x=>{x.runtimeVersion='v22.16.0'},'actual-node24-runtime');
reject(x=>{x.runtimePlatform='win32'},'recognised-ci-platform');
reject(x=>{x.proof.platform='freebsd'},'recognised-ci-platform');
reject(x=>{x.proof.passed=false},'v965-proof-present-and-passed');
reject(x=>{x.inherited.passed=false},'inherited-proof-passed');
reject(x=>{x.gate.passed=false},'regression-gate-fully-passed');
reject(x=>{x.gate.tests[0].ok=false},'regression-gate-fully-passed');
reject(x=>{x.gate.tests[0].skipped=true},'regression-gate-fully-passed');
reject(x=>{x.gate.tests=[]},'regression-gate-fully-passed');
reject(x=>{x.browser.passed=false},'browser-proof-complete');
reject(x=>{x.browser.stats.expected=0},'browser-proof-complete');
reject(x=>{x.browser.stats.skipped=1},'browser-proof-complete');
reject(x=>{x.browser.stats.flaky=1},'browser-proof-complete');
reject(x=>{x.browser.stats.unexpected=1},'browser-proof-complete');
reject(x=>{x.browser.buildId='older-build'},'browser-same-build');
reject(x=>{x.proof.playwright.passed=false},'browser-same-build');
reject(x=>{x.soak.passed=false},'short-soak-passed');
reject(x=>{x.soakResults.stats.skipped=1},'short-soak-real-case');
reject(x=>{x.soakResults.stats.expected=0},'short-soak-real-case');
reject(x=>{x.proof.artifact.passed=false},'build-artifacts-verified');
reject(x=>{x.proof.artifact.appPageCount=0},'build-artifacts-verified');
reject(x=>{x.proof.checks.mandatory1=false},'every-mandatory-v965-check');
reject(x=>{x.browser.startedAt=date(700000)},'fresh-monotonic-timestamps');
reject(x=>{x.proof.finishedAt=date(800000)},'fresh-monotonic-timestamps');
reject(x=>{x.proof.startedAt=date(9*60*60*1000);x.proof.finishedAt=date(7*60*60*1000);x.inherited.startedAt=date(8*60*60*1000);x.browser.startedAt=date(7.5*60*60*1000);x.browser.finishedAt=date(7.25*60*60*1000)},'fresh-monotonic-timestamps');
// A successful certificate cannot be manufactured from missing reports.
for(const key of ['proof','gate','inherited','browser','soak','soakResults','pkg'])reject(x=>{x[key]=null});
const requiredSource=['scripts/v1103-production-attestation.cjs','lib/releaseAttestationV1103.cjs',
 'lib/releaseSourceGuardV1103.ts','scripts/v1103-release-readiness.cjs',
 'tests/tsconfig.v1103-core.json','changelog/V1103-PRODUCTION-STABILITY-AUTOMATED-RELEASE.md'];
for(const f of requiredSource)assert(entries.includes(f),`Missing V1103 source ${f}`);
const verify=read('scripts/v965-production-verify.cjs');
assert(verify.includes('attestCurrentBuildV1103')&&verify.includes('V1103_EVIDENCE_NOT_CERTIFIED'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1103-production-release-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1103-production-release-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1103(root)'));
const workflow=read('.github/workflows/v965-room-wave-production.yml');
assert(workflow.includes('Active imported release (regression and isolated type checks)'));
assert(workflow.includes('reports/*production-proof.json'));
console.log(`PASS V1103 ${entries.length} distributable source paths, ${invalid.length} adversarial names, ${REQUIRED.length} mandatory checks; 30+ evidence failure scenarios; fail-closed certification`);
