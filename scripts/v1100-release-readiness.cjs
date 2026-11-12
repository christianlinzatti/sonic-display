#!/usr/bin/env node
'use strict';
const {hasFinalGoveeGovernor}=require('../lib/goveeSenderInvariant.cjs');
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1100(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',version>=1100&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('script',pkg.scripts['test:v1100']==='node tests/v1100-govee-room-zone-mixer-regression.cjs');
  add('types',pkg.scripts['test:v1100:types']==='tsc -p tests/tsconfig.v1100-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1100 && npm run test:v1100:types'));
  for(const p of ['lib/goveeRoomZoneMixerV1100.ts','components/GoveeRoomZoneMixerStudioV1100.tsx',
   'tests/v1100-govee-room-zone-mixer-regression.cjs','tests/tsconfig.v1100-core.json',
   'scripts/v1100-release-readiness.cjs','changelog/V1100-GOVEE-ROOM-ZONE-MIXER.md'])add('file:'+p,exists(p));
  const core=read('lib/goveeRoomZoneMixerV1100.ts');
  for(const fn of ['normalizeGoveeZoneMixerV1100','planGoveeZoneMixV1100','applyGoveeZoneMixV1100'])
   add('pure:'+fn,core.includes('function '+fn+'('));
  add('fail-closed',core.includes('!phase?.verified')&&core.includes('!base?.active'));
  add('no-new-sender',!['fetch(','setInterval(','setTimeout(','goveeBridgeRequestV909(','Date.now(','Math.random('].some(x=>core.includes(x)));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  add('route',sender.includes('planGoveeZoneMixV1100({settings:zoneMixerSettingsV1100')&&
   sender.includes('applyGoveeZoneMixV1100(roomDecisionV1096,zoneMixDecisionV1100)'));
  add('old-lan-sender',sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
  add('old-governor',hasFinalGoveeGovernor(sender));
  add('same-tick',sender.includes('zoneMixerSettingsV1100,')&&sender.includes('goveeShowEnabledV1042')); 
  add('event-cleanup',sender.includes('window.removeEventListener(GOVEE_ZONE_MIXER_EVENT_V1100,refresh)'));
  add('panel',read('components/GoveeLanPanelV909.tsx').includes('<GoveeRoomZoneMixerStudioV1100 config={config} devices={devices}/>'));
  add('preview-only',read('components/GoveeRoomZoneMixerStudioV1100.tsx').includes('Reine Vorschau'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1100-govee-room-zone-mixer-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1100-govee-room-zone-mixer-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1100(root)'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1100 Govee Room Zone Mixer')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1100);
 }catch(e){console.error(e);add('parse',false);}
 return {checks,passed:checks.length>=28&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1100(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1100 ${c.id}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1100};
