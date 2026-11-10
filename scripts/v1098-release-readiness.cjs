#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1098(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const ver=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',ver>=1098&&pkg.sonicFeatureRelease==='v'+ver&&pkg.sonicRoadmapRelease==='v'+ver);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('script',pkg.scripts['test:v1098']==='node tests/v1098-govee-color-journey-regression.cjs');
  add('types',pkg.scripts['test:v1098:types']==='tsc -p tests/tsconfig.v1098-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1098 && npm run test:v1098:types &&'));
  for(const p of ['lib/goveeColorJourneyV1098.ts','components/GoveeColorJourneyStudioV1098.tsx',
   'tests/v1098-govee-color-journey-regression.cjs','tests/tsconfig.v1098-core.json',
   'scripts/v1098-release-readiness.cjs','changelog/V1098-GOVEE-IMMERSIVE-COLOR-JOURNEY.md'])add('file:'+p,exists(p));
  const core=read('lib/goveeColorJourneyV1098.ts');
  for(const marker of ['normalizeGoveeJourneyV1098','planGoveeColorJourneyV1098','applyGoveeColorJourneyV1098'])
   add('pure:'+marker,core.includes('function '+marker+'('));
  add('verified-phase',core.includes('phase?.verified')&&core.includes('base.phase!==phase.phase'));
  add('safe-overlay',core.includes('base.mix*decision.mixFactor')&&core.includes('base.brightnessFactor*decision.brightnessFactor'));
  add('no-extra-lan',!core.includes('setInterval(')&&!core.includes('fetch(')&&!core.includes('goveeBridgeRequestV909('));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  add('authorized-route',sender.includes('planGoveeColorJourneyV1098({settings:journeySettingsV1098')&&
   sender.includes('applyGoveeColorJourneyV1098(roomDecisionV1096,journeyDecisionV1098)'));
  add('existing-governor',(sender.includes('governConcertLookV961(previous,roomLookV1096,')||(sender.includes('applyConcertLightV1154(roomLookV1096,coordinationDecisionV1154,')&&sender.includes('governConcertLookV961(previous,coordinatedLookV1154,'))));
  add('existing-sender',sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
  add('live-update',sender.includes('waveSettingsV1097,journeySettingsV1098'));
  add('cleanup',sender.includes('window.removeEventListener(GOVEE_JOURNEY_EVENT_V1098,refresh)'));
  add('ui',read('components/GoveeLanPanelV909.tsx').includes('<GoveeColorJourneyStudioV1098 config={config} devices={devices}/>'));
  add('preview',read('components/GoveeColorJourneyStudioV1098.tsx').includes('Reine Vorschau'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1098-govee-color-journey-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1098-govee-color-journey-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1098(root)'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1098 Govee Immersive Color Journey')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1098);
 }catch(e){console.error(e);add('parse',false);}
 return {checks,passed:checks.length>=27&&checks.every(x=>x.ok)};
}
if(require.main===module){const a=inspectReleaseV1098(path.resolve(__dirname,'..'));
 for(const c of a.checks)console.log(`${c.ok?'PASS':'FAIL'} V1098 ${c.id}`);
 if(!a.passed)process.exitCode=1;}
module.exports={inspectReleaseV1098};
