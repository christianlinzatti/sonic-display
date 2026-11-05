#!/usr/bin/env node
'use strict';
/** Small fail-closed Vercel gate: true production React environment, full TS and
 * Next.js. The exhaustive historical prebuild remains mandatory in GitHub CI.
 * Do NOT call npm run build here (it recursively launches 100s of legacy tests).
 */
const path=require('node:path');
const fs=require('node:fs');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const proof=path.join(root,'reports','vercel-production-proof.json');
const startedAt=new Date().toISOString();
const results=[];
const env={...process.env,NODE_ENV:'production',CI:'true',NEXT_TELEMETRY_DISABLED:'1',
  // Applied to the real Next.js build (and never to local dev).
  SONIC_LOW_MEMORY_BUILD:'1'};
function run(label,relative,args=[],timeout=15*60*1000){
  console.log('VERCEL_PRODUCTION_GATE '+label);
  const started=Date.now();
  const r=spawnSync(process.execPath,[path.join(root,relative),...args],{
    cwd:root,env,stdio:'inherit',shell:false,windowsHide:true,timeout});
  const ok=r.status===0&&!r.error;
  results.push({label,ok,elapsedMs:Date.now()-started});
  if(!ok)throw new Error(label+' failed, exit='+r.status+', error='+(r.error?.message||'none'));
}
function report(passed,error){
  fs.mkdirSync(path.dirname(proof),{recursive:true});
  fs.writeFileSync(proof,JSON.stringify({schema:'sonic-vercel-production-v1',
    startedAt,finishedAt:new Date().toISOString(),node:process.version,
    env:process.env.VERCEL_ENV||'local-production',passed,tests:results,error},null,2)+'\n');
}
try {
  if(Number(process.versions.node.split('.')[0])!==24) {
    throw new Error('Vercel must use Node 24.x; got '+process.version);
  }
  run('Source and lockfile preflight','scripts/v959-source-preflight.cjs');
  run('React 19 production/development parity','tests/react-act-compat-regression.cjs');
  run('V981 Concert Performance Intelligence 2.0','tests/v981-concert-performance-intelligence-regression.cjs');
  run('V980 Concert Quality & Performance Director','tests/v980-concert-quality-director-regression.cjs');
  run('V979 Intelligent Live Show Director 3.0','tests/v979-intelligent-live-show-director-regression.cjs');
  run('V978 Smart Concert Atmosphere 2.0','tests/v978-smart-concert-atmosphere-regression.cjs');
  run('V977 Smart Concert Storytelling','tests/v977-concert-storytelling-regression.cjs');
  run('V976 Intelligent Concert Transitions','tests/v976-intelligent-concert-transitions-regression.cjs');
  run('V975 Adaptive Concert Energy Director','tests/v975-adaptive-concert-energy-regression.cjs');
  run('V973 Living Audience 3.0 and Pi crowd budget','tests/v973-living-audience-regression.cjs');
  run('V972 layered atmospheric stage and Pi budget','tests/v972-volumetric-stage-regression.cjs');
  run('V971 Alexa and Govee onboarding + standalone bridge','tests/v971-integration-setup-regression.cjs');
  run('V970 Alexa & Govee opt-in room looks','tests/v970-alexa-govee-regression.cjs');
  run('V970 signed Govee Alexa intents','tests/v970-alexa-lambda-regression.cjs');
  run('V969 Smart Concert Presets','tests/v969-smart-concert-presets-regression.cjs');
  run('V969 signed Alexa intents','tests/v969-alexa-lambda-regression.cjs');
  run('V968 Alexa focused concert visuals','tests/v968-alexa-concert-regression.cjs');
  run('V968 authenticated Lambda intents','tests/v968-alexa-lambda-regression.cjs');
  run('V967 Alexa virtual concert bridge','tests/v967-alexa-integration-regression.cjs');
  run('V967 signed Alexa relay','tests/v967-alexa-relay-route-regression.cjs');
  run('V966 immersive concert','tests/v966-immersive-concert-regression.cjs');
  run('V966 clean project structure','tests/v966-project-structure-regression.cjs');
  run('V965 verified room wave','tests/v965-room-wave-regression.cjs');
  run('V965 deployment smoke regression','tests/v965-vercel-deployment-smoke-regression.cjs');
  run('V964 verified peak recovery','tests/v964-peak-recovery-regression.cjs');
  run('V964 Next.js artifact regression','tests/v964-next-build-artifact-regression.cjs');
  run('V963 verified transition bridge','tests/v963-verified-transition-bridge-regression.cjs');
  run('V962 narrative regression','tests/v962-concert-narrative-regression.cjs');
  run('V961 light governor regression','tests/v961-govee-concert-governor-regression.cjs');
  run('Vercel deployment configuration regression','tests/vercel-production-parity-regression.cjs');
  run('V981 Performance Intelligence isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v981-core.json','--noEmit']);
  run('V980 Concert Quality Director isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v980-core.json','--noEmit']);
  run('V979 Intelligent Live Show Director 3.0 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v979-core.json','--noEmit']);
  run('V978 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v978-core.json','--noEmit']);
  run('V977 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v977-core.json','--noEmit']);
  run('V976 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v976-core.json','--noEmit']);
  run('V973 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v973-core.json','--noEmit']);
  run('V972 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v972-core.json','--noEmit']);
  run('V971 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v971-core.json','--noEmit']);
  run('V970 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v970-core.json','--noEmit']);
  run('V969 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v969-core.json','--noEmit']);
  run('V968 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v968-core.json','--noEmit']);
  run('V967 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v967-core.json','--noEmit']);
  run('V966 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v966-core.json','--noEmit']);
  run('V965 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v965-core.json','--noEmit']);
  run('V964 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v964-core.json','--noEmit']);
  run('V963 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v963-core.json','--noEmit']);
  run('Full TypeScript','node_modules/typescript/bin/tsc',['--noEmit']);
  const buildStartedAt=Date.now();
  console.log('VERCEL_PRODUCTION_GATE Memory profile: 1 worker CPU, webpack memory optimizations, no persistent webpack cache');
  run('Real Next.js production build','node_modules/next/dist/bin/next',['build'],30*60*1000);
  run('Real Next.js emitted artifact verification','scripts/check-next-build-v964.cjs',[String(buildStartedAt)]);
  report(true,null);
  console.log('VERCEL_PRODUCTION_GATE PASS: full TypeScript and Next.js output built');
} catch(error) {
  report(false,error.message);
  console.error('VERCEL_PRODUCTION_GATE FAIL: '+error.message);
  process.exitCode=1;
}
