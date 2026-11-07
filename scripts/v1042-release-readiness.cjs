#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1042(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]);
  add('version',v>=1042&&p.sonicFeatureRelease===`v${v}`&&p.sonicRoadmapRelease===`v${v}`);
  add('lock',p.version===lock.version&&p.version===lock.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith(`npm run test:${p.sonicFeatureRelease} &&`)&&
   p.scripts.prebuild.includes('npm run test:v1042 && npm run test:v1042:types && npm run test:v1041'));
  add('script-tests',p.scripts['test:v1042']==='node tests/v1042-govee-show-integration-regression.cjs'&&
   p.scripts['test:v1042:types']==='tsc -p tests/tsconfig.v1042-core.json --noEmit');
  for(const file of ['lib/goveeShowSyncV1042.ts','components/GoveeMusicSyncV909.tsx',
   'components/visualizer/ArenaShowDesignerPanelV1040.tsx','context/UiPreferencesContext.tsx',
   'types/music.ts','tests/v1042-govee-show-integration-regression.cjs','tests/tsconfig.v1042-core.json',
   'changelog/V1042-INTELLIGENT-GOVEE-CONCERT-INTEGRATION.md',
   '.github/workflows/v1042-intelligent-govee-show-validation.yml'])add('file:'+file,exists(file));
  add('opt-in-off',read('context/UiPreferencesContext.tsx').includes('goveeShowSyncEnabledV1042:false'));
  add('govee-existing-lan-loop',read('components/GoveeMusicSyncV909.tsx').includes('applyGoveeShowV1042')&&
   read('components/GoveeMusicSyncV909.tsx').includes("goveeBridgeRequestV909(config,'/command'"));
  add('scene-editor',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('goveeShowSyncEnabledV1042'));
  add('safe-light-model',['manualOverride','savedShowActive','recovering','groupUnisonActive',
   'higherPrioritySyncActive'].every(x=>read('lib/goveeShowSyncV1042.ts').includes(x)));
  add('no-second-clock',!['fetch(','setInterval(','setTimeout(','WebSocket(','localStorage'].some(x=>
   read('lib/goveeShowSyncV1042.ts').includes(x)));
  add('producer-regressions',read('scripts/v931-production-gate.cjs').includes('tests/v1042-govee-show-integration-regression.cjs')&&
   read('scripts/vercel-production-build.cjs').includes('tests/v1042-govee-show-integration-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1042(root)'));
  add('manual-workflow',!read('.github/workflows/v1042-intelligent-govee-show-validation.yml').includes('  push:')&&
   read('.github/workflows/v1042-intelligent-govee-show-validation.yml').includes('ubuntu-24.04, windows-latest'));
  add('shared-arena',read('.github/workflows/v1032-live-arena-validation.yml').includes('npm run test:v1042'));
  add('v1038-typecheck-fix',read('components/visualizer/DynamicStage.tsx').includes('arena360: {base:'));
 }catch(err){console.error('V1042 release failure:',err.message);add('read-source',false)}
 return {passed:checks.length>=23&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const x=inspectReleaseV1042(path.resolve(__dirname,'..'));
 for(const c of x.checks)console.log(`${c.ok?'PASS':'FAIL'} V1042 ${c.name}`);
 if(!x.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1042};
