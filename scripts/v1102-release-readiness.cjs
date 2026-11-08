#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1102(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8'),exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',version>=1102&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('script',pkg.scripts['test:v1102']==='node tests/v1102-govee-scene-zone-regression.cjs');
  add('types',pkg.scripts['test:v1102:types']==='tsc -p tests/tsconfig.v1102-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1102 && npm run test:v1102:types'));
  for(const p of ['lib/goveeSceneZoneChoreographerV1102.ts','components/GoveeSceneZoneStudioV1102.tsx',
   'tests/v1102-govee-scene-zone-regression.cjs','tests/tsconfig.v1102-core.json',
   'scripts/v1102-release-readiness.cjs','changelog/V1102-GOVEE-SCENE-ZONE-CHOREOGRAPHER.md'])add('file:'+p,exists(p));
  const core=read('lib/goveeSceneZoneChoreographerV1102.ts');
  for(const fn of ['normalizeGoveeChoreographerV1102','planGoveeSceneZoneV1102','applyGoveeSceneZoneV1102'])
   add('pure:'+fn,core.includes('function '+fn+'('));
  add('fail-closed',core.includes('!phase?.verified')&&core.includes('!base?.active'));
  add('no-sender-or-timers',!['fetch(','setInterval(','setTimeout(','goveeBridgeRequestV909(','Date.now(','Math.random('].some(x=>core.includes(x)));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  add('route',sender.includes('planGoveeSceneZoneV1102({settings:choreographerSettingsV1102')&&
   sender.includes('applyGoveeSceneZoneV1102(roomDecisionV1096,sceneZoneDecisionV1102)'));
  add('same-tick',sender.includes('transitionSettingsV1101,choreographerSettingsV1102,goveeShowEnabledV1042'));
  add('last-governor',sender.includes('governConcertLookV961(previous,roomLookV1096,'));
  add('last-sender',sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
  add('listener-cleanup',sender.includes('window.removeEventListener(GOVEE_CHOREOGRAPHER_EVENT_V1102,refresh)'));
  add('panel',read('components/GoveeLanPanelV909.tsx').includes('<GoveeSceneZoneStudioV1102 config={config} devices={devices}/>'));
  add('preview-only',read('components/GoveeSceneZoneStudioV1102.tsx').includes('Reine Vorschau')&&
   !read('components/GoveeSceneZoneStudioV1102.tsx').includes('goveeBridgeRequestV909('));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1102-govee-scene-zone-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1102-govee-scene-zone-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1102(root)'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1102 Govee Scene Zone Choreographer')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1102);
 }catch(e){console.error(e);add('parse',false);}
 return {checks,passed:checks.length>=27&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1102(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1102 ${c.id}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1102};
