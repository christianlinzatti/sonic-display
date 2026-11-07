#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1049(root){
 const checks=[],add=(label,ok)=>checks.push({name:label,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const release=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',release>=1049&&p.sonicFeatureRelease==='v'+release&&p.sonicRoadmapRelease==='v'+release);
  add('lock',p.version===lock.version&&p.version===lock.packages[''].version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v1049 && npm run test:v1049:types && npm run test:v1048')||
   (release>1049&&p.scripts.prebuild.includes('&& npm run test:v1049 && npm run test:v1049:types && npm run test:v1048')));
  add('focused',p.scripts['verify:v1049:focused'].includes('verify:v1048:focused'));
  for(const f of ['lib/arena360LiveConcertIntelligenceV1049.ts','tests/v1049-live-concert-intelligence-regression.cjs',
   'tests/tsconfig.v1049-core.json','changelog/V1049-LIVE-CONCERT-INTELLIGENCE-ENGINE.md'])add('file:'+f,exists(f));
  // Protected GitHub workflows are not installed from a project ZIP. Rely on imported production gates.
  add('import-safe-ci',exists('.github/workflows/v1049-live-concert-validation.yml')||
   (read('scripts/v931-production-gate.cjs').includes('tests/v1049-live-concert-intelligence-regression.cjs')&&
    read('scripts/vercel-production-build.cjs').includes('tests/v1049-live-concert-intelligence-regression.cjs')));
  for(const f of ['components/visualizer/stages/Arena360StageV1031.tsx',
    'components/visualizer/ThreeAvatar.tsx','components/GoveeMusicSyncV909.tsx'])
   add('client:'+f,read(f).includes('directLiveConcertV1049'));
  add('opt-in',read('context/UiPreferencesContext.tsx').includes('arenaLiveConcertEnabledV1049:false'));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1049 · Live Concert Intelligence'));
  add('govee freshness',read('components/GoveeMusicSyncV909.tsx').includes('sampleAgeMs:now-state.observedAt'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1049-live-concert-intelligence-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1049-live-concert-intelligence-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1049'));
  add('no extra IO',!/(fetch\(|setInterval\(|setTimeout\(|WebSocket\(|Math\.random\()/.test(read('lib/arena360LiveConcertIntelligenceV1049.ts')));
 }catch(e){console.error('V1049 readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=20&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1049(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1049 ${c.name}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1049};
