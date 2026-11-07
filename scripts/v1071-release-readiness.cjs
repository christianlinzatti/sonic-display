#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1071(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1071&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1071 && npm run test:v1071:types &&')); 
  add('focused',p.scripts['verify:v1071:focused']?.includes('verify:v1070:focused'));
  add('test-command',p.scripts['test:v1071']==='node tests/v1071-smart-concert-flow-regression.cjs');
  for(const f of ['lib/arena360SmartConcertFlowV1071.ts','tests/v1071-smart-concert-flow-regression.cjs',
   'tests/tsconfig.v1071-core.json','scripts/v1071-release-readiness.cjs',
   'changelog/V1071-SMART-CONCERT-FLOW-3.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaSmartConcertFlowEnabledV1071:false'));
  add('public-type',read('types/music.ts').includes('arenaSmartConcertFlowStrengthV1071'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaSmartConcertFlowStrengthV1071'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaSmartConcertFlowEnabledV1071='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1071 · Smart Concert Flow 3.0'));
  add('cast',read('components/visualizer/ThreeAvatar.tsx').includes('smartFlowCastV1071=planSmartConcertFlowV1071('));
  add('all-lanes',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('const flowLedV1071='));
  add('manual-rap',read('components/visualizer/ThreeAvatar.tsx').includes('props.lipSync?.rapSyllableEditsEnabledV420!==true'));
  add('no-new-meshes',!read('components/visualizer/stages/Arena360StageV1031.tsx').includes('name="v1071-extra'));
  add('no-beat-synthesis',!read('lib/arena360SmartConcertFlowV1071.ts').includes('audio.beat'));
  add('no-hardware',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360SmartConcertFlowV1071.ts')));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1071-smart-concert-flow-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1071-smart-concert-flow-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1071(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1071);
 }catch(e){console.error('V1071 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1071(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1071 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1071};
