#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1101(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',version>=1101&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('script',pkg.scripts['test:v1101']==='node tests/v1101-govee-scene-transition-regression.cjs');
  add('types',pkg.scripts['test:v1101:types']==='tsc -p tests/tsconfig.v1101-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1101 && npm run test:v1101:types'));
  for(const p of ['lib/goveeSceneTransitionV1101.ts','components/GoveeSceneTransitionStudioV1101.tsx',
   'tests/v1101-govee-scene-transition-regression.cjs','tests/tsconfig.v1101-core.json',
   'scripts/v1101-release-readiness.cjs','changelog/V1101-GOVEE-SCENE-TRANSITION-SMOOTHER.md'])add('file:'+p,exists(p));
  const core=read('lib/goveeSceneTransitionV1101.ts');
  for(const fn of ['normalizeGoveeTransitionV1101','planGoveeSceneTransitionV1101','applyGoveeSceneTransitionV1101'])
   add('pure:'+fn,core.includes('function '+fn+'('));
  add('fail-closed',core.includes('!phase?.verified')&&core.includes('!base?.active'));
  add('no-network-timers',!['fetch(','setInterval(','setTimeout(','goveeBridgeRequestV909(','Date.now(','Math.random('].some(x=>core.includes(x)));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  add('route',sender.includes('planGoveeSceneTransitionV1101({settings:transitionSettingsV1101')&&
   sender.includes('applyGoveeSceneTransitionV1101(roomDecisionV1096,transitionDecisionV1101)'));
  add('old-lan-sender',sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
  add('old-governor',(sender.includes('governConcertLookV961(previous,roomLookV1096,')||(sender.includes('applyConcertLightV1154(roomLookV1096,coordinationDecisionV1154,')&&sender.includes('governConcertLookV961(previous,coordinatedLookV1154,'))));
  add('live-settings',sender.includes('zoneMixerSettingsV1100,transitionSettingsV1101,choreographerSettingsV1102,coordinationV1154,goveeShowEnabledV1042'));
  add('event-cleanup',sender.includes('window.removeEventListener(GOVEE_TRANSITION_EVENT_V1101,refresh)'));
  add('panel',read('components/GoveeLanPanelV909.tsx').includes('<GoveeSceneTransitionStudioV1101 config={config} devices={devices}/>'));
  add('preview-only',read('components/GoveeSceneTransitionStudioV1101.tsx').includes('Reine Vorschau'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1101-govee-scene-transition-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1101-govee-scene-transition-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1101(root)'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1101 Govee Scene Transition Smoother')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1101);
 }catch(e){console.error(e);add('parse',false);}
 return {checks,passed:checks.length>=28&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1101(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1101 ${c.id}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1101};
