#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1097(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',version>=1097&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lock',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('regression',pkg.scripts['test:v1097']==='node tests/v1097-govee-spatial-waves-regression.cjs');
  add('types',pkg.scripts['test:v1097:types']==='tsc -p tests/tsconfig.v1097-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1097 && npm run test:v1097:types &&'));
  for(const f of ['lib/goveeSpatialWavesV1097.ts','components/GoveeSpatialWavesStudioV1097.tsx',
   'tests/v1097-govee-spatial-waves-regression.cjs','tests/tsconfig.v1097-core.json',
   'scripts/v1097-release-readiness.cjs','changelog/V1097-GOVEE-SPATIAL-LIGHT-WAVES.md'])add('file:'+f,exists(f));
  const core=read('lib/goveeSpatialWavesV1097.ts');
  for(const f of ['normalizeGoveeWavesV1097','planGoveeSpatialWaveV1097','applyGoveeSpatialWaveV1097'])
   add('pure:'+f,core.includes('function '+f+'('));
  add('safe-overlay',core.includes('clamp(base.mix*envelope,0,base.mix)')&&core.includes('base.brightnessFactor'));
  add('verified',core.includes('phase?.verified')&&core.includes('base.phase!==phase.phase'));
  add('no-network',!core.includes('setInterval(')&&!core.includes('fetch(')&&!core.includes('goveeBridgeRequestV909('));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  add('existing-plan',sender.includes('planGoveeRoomV1096({settings:roomSettingsV1096'));
  add('new-wave',sender.includes('planGoveeSpatialWaveV1097({settings:waveSettingsV1097'));
  add('new-apply',sender.includes('applyGoveeSpatialWaveV1097(roomDecisionV1096,waveDecisionV1097)'));
  add('same-look',sender.includes('applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,'));
  add('same-governor',sender.includes('governConcertLookV961(previous,roomLookV1096,'));
  add('same-sender',sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
  add('cleanup',sender.includes('window.removeEventListener(GOVEE_WAVES_EVENT_V1097,refresh)'));
  add('ui',read('components/GoveeLanPanelV909.tsx').includes('<GoveeSpatialWavesStudioV1097 config={config} devices={devices}/>'));
  add('preview',read('components/GoveeSpatialWavesStudioV1097.tsx').includes('Reine Vorschau'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1097 Govee Spatial Light Waves')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1097-govee-spatial-waves-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1097-govee-spatial-waves-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1097(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1097);
 }catch(e){console.error(e);add('parse',false)}
 return {passed:checks.length>=27&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1097(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log(`${c.ok?'PASS':'FAIL'} V1097 ${c.id}`);
 if(!report.passed)process.exitCode=1;}
module.exports={inspectReleaseV1097};
