#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1070(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1070&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v'+num+' && npm run test:v'+num+':types &&'));
  add('focused',p.scripts['verify:v1070:focused']?.includes('verify:v1069:focused'));
  add('test-command',p.scripts['test:v1070']==='node tests/v1070-ultimate-finale-regression.cjs');
  for(const f of ['lib/arena360UltimateFinaleV1070.ts','tests/v1070-ultimate-finale-regression.cjs',
   'tests/tsconfig.v1070-core.json','scripts/v1070-release-readiness.cjs',
   'changelog/V1070-ULTIMATE-CONCERT-FINALE-2.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaUltimateFinaleEnabledV1070:false'));
  add('public-type',read('types/music.ts').includes('arenaUltimateFinaleStrengthV1070'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaUltimateFinaleStrengthV1070'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaUltimateFinaleEnabledV1070='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1070 · Ultimate Concert Finale 2.0'));
  add('cast',read('components/visualizer/ThreeAvatar.tsx').includes('finaleCastV1070=planUltimateConcertFinaleV1070('));
  add('all-lanes',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('const finaleLedV1070='));
  add('no-new-meshes',!read('components/visualizer/stages/Arena360StageV1031.tsx').includes('name="v1070-extra'));
  add('no-beat-synthesis',!read('lib/arena360UltimateFinaleV1070.ts').includes('audio.beat'));
  add('manual-choreo',read('components/visualizer/ThreeAvatar.tsx').includes("(props.arenaChoreographyFormationV1041??'auto')==='auto'"));
  add('no-hardware',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360UltimateFinaleV1070.ts')));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1070-ultimate-finale-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1070-ultimate-finale-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1070(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1070);
 }catch(e){console.error('V1070 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1070(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1070 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1070};
