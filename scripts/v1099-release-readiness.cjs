#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1099(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('version',version>=1099&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('script',pkg.scripts['test:v1099']==='node tests/v1099-govee-live-beat-accent-regression.cjs');
  add('types',pkg.scripts['test:v1099:types']==='tsc -p tests/tsconfig.v1099-core.json --noEmit');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1099 && npm run test:v1099:types &&'));
  for(const file of ['lib/goveeLiveBeatAccentV1099.ts','components/GoveeBeatAccentStudioV1099.tsx',
   'tests/v1099-govee-live-beat-accent-regression.cjs','tests/tsconfig.v1099-core.json',
   'scripts/v1099-release-readiness.cjs','changelog/V1099-GOVEE-LIVE-BEAT-ACCENT.md'])add('file:'+file,exists(file));
  const core=read('lib/goveeLiveBeatAccentV1099.ts');
  for(const fn of ['normalizeGoveeBeatAccentV1099','planGoveeBeatAccentV1099','applyGoveeBeatAccentV1099'])
   add('pure:'+fn,core.includes('function '+fn+'('));
  add('verified',core.includes('p?.verified')&&core.includes("p.phase!=='hook'&&p.phase!=='drop'"));
  add('fresh-beat',core.includes('input.microphoneActive!==true')&&core.includes('input.beatObserved!==true')&&core.includes('input.sampleAgeMs>600'));
  add('no-lan',!['fetch(','setInterval(','goveeBridgeRequestV909(','Date.now(','Math.random('].some(x=>core.includes(x)));
  const sender=read('components/GoveeMusicSyncV909.tsx');
  add('route',sender.includes('planGoveeBeatAccentV1099({settings:beatAccentSettingsV1099')&&
   sender.includes('applyGoveeBeatAccentV1099(roomDecisionV1096,beatAccentDecisionV1099)'));
  add('governor',sender.includes('governConcertLookV961(previous,roomLookV1096,'));
  add('sender',sender.includes("goveeBridgeRequestV909(config,'/command','POST'"));
  add('settings-update',sender.includes('waveSettingsV1097,journeySettingsV1098,beatAccentSettingsV1099'));
  add('listener-cleanup',sender.includes('window.removeEventListener(GOVEE_BEAT_ACCENT_EVENT_V1099,refresh)'));
  add('ui',read('components/GoveeLanPanelV909.tsx').includes('<GoveeBeatAccentStudioV1099 config={config} devices={devices}/>'));
  add('preview',read('components/GoveeBeatAccentStudioV1099.tsx').includes('Reine Vorschau'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1099-govee-live-beat-accent-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1099-govee-live-beat-accent-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1099(root)'));
  const wf=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',wf.includes('V1099 Govee Live Beat Accent')||wf.includes('Active imported release (regression and isolated type checks)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1099);
 }catch(e){console.error(e);add('parse',false);}
 return {checks,passed:checks.length>=28&&checks.every(x=>x.ok)};
}
if(require.main===module){const x=inspectReleaseV1099(path.resolve(__dirname,'..'));
 for(const check of x.checks)console.log(`${check.ok?'PASS':'FAIL'} V1099 ${check.id}`);
 if(!x.passed)process.exitCode=1;}
module.exports={inspectReleaseV1099};
