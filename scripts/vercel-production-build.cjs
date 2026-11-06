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
let browser=null;
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
    env:process.env.VERCEL_ENV||'local-production',passed,tests:results,playwright:browser,error},null,2)+'\n');
}
try {
  run('V1028 Immersive Concert FX 5.0','tests/v1028-immersive-concert-fx-regression.cjs');
  run('V1027 Govee Concert Sync 3.0','tests/v1027-govee-concert-sync-regression.cjs');
  run('V1026 Intelligent Stage Lighting 4.0','tests/v1026-intelligent-stage-lighting-regression.cjs');
  run('V1025 Cinematic Camera Intelligence 4.0','tests/v1025-cinematic-camera-intelligence-regression.cjs');
  run('V1024 AI Dance Choreography 4.0','tests/v1024-ai-dance-choreography-regression.cjs');
  run('V1023 Advanced Rap Performance 6.0','tests/v1023-advanced-rap-performance-regression.cjs');
  run('V1022 AI Live Show Adaptation','tests/v1022-live-show-adaptation-regression.cjs');
  run('V1017 intelligent cache manager','tests/v1017-intelligent-cache-regression.cjs');
  run('V1017 release readiness','scripts/v1017-release-readiness.cjs');
  run('V1016 offline experience and Actions release titles','tests/v1016-smart-offline-regression.cjs');
  run('V1015 adaptive request intelligence','tests/v1015-adaptive-network-regression.cjs');
  run('V1015 release readiness','scripts/v1015-release-readiness.cjs');
  run('V1014 network diagnostics 2.0','tests/v1014-network-diagnostics-regression.cjs');
  run('V1014 release readiness','scripts/v1014-release-readiness.cjs');
  run('V1013 production stability and release metadata','tests/v1013-production-stability-regression.cjs');
  run('V1013 pre-install release readiness','scripts/v1013-release-readiness.cjs');
  run('V1012 network health & auto recovery','tests/v1012-network-health-regression.cjs');
  run('V1011 network performance dashboard','tests/v1011-network-dashboard-regression.cjs');
  run('V1010 central network governor','tests/v1010-network-coordination-regression.cjs');
  run('V1009 private avatar resources','tests/v1009-avatar-resources-regression.cjs');
  run('V1009 native providers and background deadlines','tests/v1009-network-regression.cjs');
  run('V1008 receiver lifecycle','tests/v1008-receiver-regression.cjs');
  run('V1008 voice features and dialogs','tests/v1008-voice-regression.cjs');
  run('V1008 all artists and batch undo','tests/v1008-batch-regression.cjs');
  run('V1008 signed result relay','tests/v1008-relay-regression.cjs');
  run('V1007 Alexa artist receiver lifecycle','tests/v1007-alexa-artist-receiver-regression.cjs');
  run('V1007 Alexa artist follow and unfollow','tests/v1007-alexa-artist-regression.cjs');
  run('V1006 real avatar browser fixtures','tests/v1006-avatar-production-regression.cjs');
  if(Number(process.versions.node.split('.')[0])!==24) {
    throw new Error('Vercel must use Node 24.x; got '+process.version);
  }
  run('Source and lockfile preflight','scripts/v959-source-preflight.cjs');
  run('V1021 Genre Intelligence 3.0','tests/v1021-genre-intelligence-regression.cjs');
  run('V1020 AI Concert Storytelling','tests/v1020-concert-storytelling-regression.cjs');
  run('V1019 Predictive Concert Director','tests/v1019-predictive-concert-regression.cjs');
  run('V1018 AI Song Understanding 2.0','tests/v1018-song-understanding-regression.cjs');
  run('React 19 production/development parity','tests/react-act-compat-regression.cjs');
  run('V752 negative fixture build integrity','tests/v752-build-integrity-regression.cjs');
  run('V1004 Production Reliability 2.0','tests/v1004-production-reliability-regression.cjs');
  run('V908 historical camera and FX CI assertions','tests/v908-live-avatar-fx-verification-regression.cjs');
  run('V925 historical Govee Festival FX CI assertions','tests/v925-govee-festival-fx-regression.cjs');
  run('V929 historical Govee troubleshooting CI assertions','tests/v929-govee-troubleshooting-regression.cjs');
  run('V1003 AI Auto-Improvement Director','tests/v1003-auto-improvement-regression.cjs');
  run('V1002 Concert Quality Assurance','tests/v1002-concert-quality-assurance-regression.cjs');
  run('V1002 Concert QA authenticated API','tests/v1002-concert-qa-api-regression.cjs');
  run('V1001 Interactive Concert Control','tests/v1001-interactive-concert-control-regression.cjs');
  run('V1000 Immersive Concert Coordination','tests/v1000-immersive-coordination-regression.cjs');
  run('V999 Intelligent Performance Governor','tests/v999-performance-governor-regression.cjs');
  run('V998 Live AI Concert Assistant','tests/v998-live-ai-concert-regression.cjs');
  run('V997 Continuous Concert Flow','tests/v997-continuous-concert-flow-regression.cjs');
  run('V996 Virtual Crowd Experience','tests/v996-virtual-crowd-experience-regression.cjs');
  run('V995 Duet & Ensemble 3.0','tests/v995-duet-ensemble-regression.cjs');
  run('V994 Vocal Performance Intelligence','tests/v994-vocal-performance-intelligence-regression.cjs');
  run('V993 AI Choreography Director','tests/v993-ai-choreography-director-regression.cjs');
  run('V992 Cinematic Camera Director 3.0','tests/v992-cinematic-camera-director-regression.cjs');
  run('V991 Bass Impact Physics','tests/v991-bass-impact-physics-regression.cjs');
  run('V990 Living LED Wall 3.0','tests/v990-living-led-wall-regression.cjs');
  run('V989 Volumetric Atmosphere 2.0','tests/v989-volumetric-atmosphere-regression.cjs');
  run('V988 Holographic Stage Portal','tests/v988-holographic-stage-portal-regression.cjs');
  run('V987 Govee Immersive Sync 2.0','tests/v987-govee-immersive-sync-regression.cjs');
  run('V986 AI Atmosphere Designer','tests/v986-ai-atmosphere-designer-regression.cjs');
  run('V985 Predictive Show Timeline','tests/v985-predictive-show-timeline-regression.cjs');
  run('V984 AI concert story director','tests/v984-ai-concert-story-regression.cjs');
  run('V983 AI song intelligence','tests/v983-ai-song-intelligence-regression.cjs');
  run('V982 immersive AI director','tests/v982-immersive-ai-show-regression.cjs');
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
  run('V1014 network diagnostics isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/networkCoordinatorV1010.ts','lib/networkDiagnosticsV1014.ts','lib/networkHealthV1012.ts']);
  run('V1012 health and governor isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/networkCoordinatorV1010.ts','lib/networkJsonV1010.ts','lib/networkHealthV1012.ts']);
  run('V1010 network governor isolated TypeScript','node_modules/typescript/bin/tsc',['--noEmit','--strict','--target','es2022','--moduleResolution','bundler','--module','esnext','--skipLibCheck','--lib','dom,es2022','lib/networkCoordinatorV1010.ts','lib/networkJsonV1010.ts']);
  run('V1002 QA Core isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v1002-core.json','--noEmit']);
  run('V1003 Auto Improvement isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v1003-core.json','--noEmit']);
  run('V1001 Touch Controller isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v1001-core.json','--noEmit']);
  run('V1000 Immersive Concert Coordination isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v1000-core.json','--noEmit']);
  run('V999 Concert Governor isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v999-core.json','--noEmit']);
  run('V997 Continuous Concert Flow isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v997-core.json','--noEmit']);
  run('V996 Virtual Crowd Experience isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v996-core.json','--noEmit']);
  run('V995 Duet & Ensemble 3.0 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v995-core.json','--noEmit']);
  run('V994 Vocal Performance Intelligence isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v994-core.json','--noEmit']);
  run('V993 AI Choreography Director isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v993-core.json','--noEmit']);
  run('V992 Cinematic Camera Director 3.0 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v992-core.json','--noEmit']);
  run('V991 Bass Impact Physics isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v991-core.json','--noEmit']);
  run('V990 Living LED Wall 3.0 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v990-core.json','--noEmit']);
  run('V989 Volumetric Atmosphere 2.0 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v989-core.json','--noEmit']);
  run('V988 Holographic Stage Portal isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v988-core.json','--noEmit']);
  run('V987 Govee Immersive Sync 2.0 isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v987-core.json','--noEmit']);
  run('V986 AI Atmosphere Designer isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v986-core.json','--noEmit']);
  run('V985 Predictive Show Timeline isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v985-core.json','--noEmit']);
  run('V984 Concert Story Director isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v984-core.json','--noEmit']);
  run('V983 AI Song Intelligence isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v983-core.json','--noEmit']);
  run('V982 Immersive AI Director isolated TypeScript','node_modules/typescript/bin/tsc',['-p','tests/tsconfig.v982-core.json','--noEmit']);
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
  // The existing parity workflow covers source pushes/PRs beyond ZIP imports.
  // Real Vercel deployments keep the build-only path.
  if(process.env.GITHUB_ACTIONS==='true') {
    browser=require('./playwright-production.cjs').runProductionTests({existingBuildSince:buildStartedAt});
    if(!browser.passed)throw new Error('Playwright production browser gate failed');
  }
  report(true,null);
  console.log('VERCEL_PRODUCTION_GATE PASS: full TypeScript and Next.js output built');
} catch(error) {
  report(false,error.message);
  console.error('VERCEL_PRODUCTION_GATE FAIL: '+error.message);
  process.exitCode=1;
}
