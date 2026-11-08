'use strict';
/** V1103 - strict, independent certificate for a single real Windows/Ubuntu CI job.
 * Can never convert a skipped browser test, a missing report, or a stale artifact
 * into success. This is an audit of evidence, NOT a substitute for running tests.
 */
const REQUIRED=['Full TypeScript','Next.js production build','V961 core TypeScript',
 'V962 core TypeScript','V963 core TypeScript','V964 core TypeScript','V965 core TypeScript'];
function isObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
function dateMs(v){const ms=typeof v==='string'?Date.parse(v):NaN;return Number.isFinite(ms)?ms:NaN}
function cleanStats(v){return isObject(v)&&Number.isInteger(v.expected)&&v.expected>0&&
 v.unexpected===0&&v.skipped===0&&v.flaky===0}
function attestProductionV1103({pkg,revision,proof,gate,inherited,browser,soak,soakResults,now=Date.now(),runtimeVersion=process.version,runtimePlatform=process.platform}){
 const checks=[];const check=(name,ok)=>checks.push({name,ok:ok===true});
 const version=/^0\.1\.0-v(\d+)$/.exec(typeof pkg?.version==='string'?pkg.version:'');
 check('matching-current-release',Boolean(version&&Number(version[1])>=1103&&
  pkg.sonicFeatureRelease===`v${version[1]}`&&pkg.sonicRoadmapRelease===`v${version[1]}`));
 check('exact-source-revision',typeof revision==='string'&&/^[0-9a-f]{40}$/.test(revision));
 check('proof-matches-exact-imported-revision',proof?.revision===revision&&proof?.release===pkg?.sonicRoadmapRelease);
 check('actual-node24-runtime',/^v24\./.test(runtimeVersion)&&proof?.node===runtimeVersion);
 check('recognised-ci-platform',['win32','linux'].includes(runtimePlatform)&&proof?.platform===runtimePlatform);
 check('v965-proof-present-and-passed',isObject(proof)&&proof.schema==='sonic-v965-production-proof-v1'&&proof.passed===true);
 check('inherited-proof-passed',isObject(inherited)&&inherited.passed===true&&inherited.platform===proof?.platform);
 check('regression-gate-fully-passed',isObject(gate)&&gate.passed===true&&Array.isArray(gate.tests)&&
  gate.tests.length>=20&&gate.tests.every(x=>x&&x.ok===true&&x.skipped!==true));
 for(const label of REQUIRED)check('mandatory:'+label,gate?.tests?.some(t=>t?.label===label&&t.ok===true)===true);
 check('browser-proof-complete',isObject(browser)&&browser.schema==='sonic-playwright-production-v1'&&browser.passed===true&&cleanStats(browser.stats));
 check('browser-same-build',Boolean(proof?.playwright?.passed===true&&proof.playwright.buildId&&
  proof.playwright.buildId===browser?.buildId&&JSON.stringify(browser?.stats)===JSON.stringify(proof.playwright?.stats)));
 check('short-soak-passed',isObject(soak)&&soak.passed===true&&proof?.soak?.passed===true);
 check('short-soak-real-case',cleanStats(soakResults?.stats)&&soakResults.stats.expected===1);
 check('build-artifacts-verified',proof?.artifact?.passed===true&&Number.isInteger(proof.artifact.appPageCount)&&proof.artifact.appPageCount>0);
 check('every-mandatory-v965-check',isObject(proof?.checks)&&Object.keys(proof.checks).length>=10&&
  Object.values(proof.checks).every(x=>x===true));
 const started=dateMs(proof?.startedAt),finished=dateMs(proof?.finishedAt),browserStart=dateMs(browser?.startedAt),browserFinish=dateMs(browser?.finishedAt);
 const inheritedStart=dateMs(inherited?.startedAt);
 check('fresh-monotonic-timestamps',Number.isFinite(started)&&Number.isFinite(finished)&&
  Number.isFinite(inheritedStart)&&Number.isFinite(browserStart)&&Number.isFinite(browserFinish)&&
  started<=inheritedStart&&inheritedStart<=browserStart&&browserStart<=browserFinish&&
  browserFinish<=finished&&finished<=now&&now-finished<6*60*60*1000);
 const failed=checks.filter(x=>!x.ok).map(x=>x.name);
 return {schema:'sonic-v1103-production-attestation-v1',release:version?`V${version[1]}`:'invalid',revision,
  platform:proof?.platform||'unknown',node:proof?.node||'unknown',passed:failed.length===0,
  checks,failed};
}
module.exports={attestProductionV1103,cleanStats,REQUIRED};
