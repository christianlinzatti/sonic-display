#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1096(root){
 const checks=[],add=(id,x)=>checks.push({id,ok:!!x});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('metadata',version>=1096&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lock',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('scripts',pkg.scripts['test:v1096']==='node tests/v1096-govee-room-lighting-regression.cjs'&&
   pkg.scripts['test:v1096:types']==='tsc -p tests/tsconfig.v1096-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1096 && npm run test:v1096:types &&')||
   (version>1096&&pkg.scripts.prebuild.includes('npm run test:v1096 && npm run test:v1096:types &&')));
  for(const f of ['lib/goveeRoomLightingV1096.ts','components/GoveeRoomLightingStudioV1096.tsx',
   'tests/v1096-govee-room-lighting-regression.cjs','tests/tsconfig.v1096-core.json',
   'scripts/v1096-release-readiness.cjs','changelog/V1096-GOVEE-ROOM-LIGHTING-5.md'])add('file:'+f,exists(f));
  const core=read('lib/goveeRoomLightingV1096.ts');
  for(const name of ['normalizeGoveeRoomV1096','planGoveeRoomV1096','applyGoveeRoomV1096'])
   add('pure:'+name,core.includes('function '+name+'('));
  add('bounded',core.includes("strength:40,style:'balanced'")&&core.includes("clamp(s.strength/100*.17")&&core.includes('0,.12'));
  add('confirmed',core.includes('input.phase?.verified')&&core.includes('Object.hasOwn(PHASE_ENERGY'));
  add('no-network',!core.includes('goveeBridgeRequestV909(')&&!core.includes('setInterval(')&&!core.includes('fetch('));
  const runtime=read('components/GoveeMusicSyncV909.tsx');
  add('live-plan',runtime.includes('planGoveeRoomV1096({settings:roomSettingsV1096'));
  add('live-apply',runtime.includes('applyGoveeRoomV1096(showLookV1042,previous,roomDecisionV1096,'));
  add('last-governor',runtime.includes('governConcertLookV961(previous,roomLookV1096,'));
  add('precedence',runtime.includes('syncDecisionV1027.active||authoredDecisionV1042.active'));
  add('no-second-sender',!core.includes('goveeBridgeRequestV909('));
  const ui=read('components/GoveeRoomLightingStudioV1096.tsx');
  add('ui-opt-in',ui.includes('checked={settings.enabled}')&&ui.includes('saveGoveeRoomV1096(safe)'));
  add('ui-preview',ui.includes('Reine Vorschau (keine LAN-Kommandos)'));
  add('ui-mounted',read('components/GoveeLanPanelV909.tsx').includes('<GoveeRoomLightingStudioV1096 config={config} devices={devices}/>'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1096 Govee Room Lighting')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1096-govee-room-lighting-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1096-govee-room-lighting-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1096(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1096);
 }catch(e){console.error(e);add('parse',false)}
 return {passed:checks.length>=29&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const report=inspectReleaseV1096(path.resolve(__dirname,'..'));
 for(const c of report.checks)console.log((c.ok?'PASS':'FAIL')+' V1096 '+c.id);
 if(!report.passed)process.exitCode=1;}
module.exports={inspectReleaseV1096};
