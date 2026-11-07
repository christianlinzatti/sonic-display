#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1069(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),num=Number(v?.[1]);
  add('version',num>=1069&&p.sonicRoadmapRelease==='v'+num&&p.sonicFeatureRelease==='v'+num);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v'+num+' && npm run test:v'+num+':types &&'));
  add('focused',p.scripts['verify:v1069:focused']?.includes('verify:v1068:focused'));
  add('test-command',p.scripts['test:v1069']==='node tests/v1069-epic-drop-regression.cjs');
  for(const f of ['lib/arena360EpicDropV1069.ts','tests/v1069-epic-drop-regression.cjs',
   'tests/tsconfig.v1069-core.json','scripts/v1069-release-readiness.cjs',
   'changelog/V1069-EPIC-DROP-EXPERIENCE.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaEpicDropEnabledV1069:false'));
  add('public-type',read('types/music.ts').includes('arenaEpicDropStrengthV1069'));
  add('component-type',read('components/visualizer/registry.tsx').includes('arenaEpicDropStrengthV1069'));
  add('stage-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaEpicDropEnabledV1069='));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1069 · Epic Drop Experience'));
  add('no-meshes',!read('components/visualizer/stages/ArenaCinematicFinaleV1046.tsx').includes('name="v1069-extra'));
  add('measured-event',read('lib/arena360EpicDropV1069.ts').includes("i.observedSection!=='drop'"));
  add('beat-gate',read('lib/arena360EpicDropV1069.ts').includes('i.previousBeat===false'));
  add('pyro-safety',read('components/visualizer/stages/ArenaVirtualPyroV1035.tsx').includes('stepArenaPyroV1035(state.current,dt,'));
  add('manual-led',read('lib/arena360EpicDropV1069.ts').includes("i.ledPattern==='auto'"));
  add('one-frame',read('components/visualizer/stages/ArenaCinematicFinaleV1046.tsx').match(/useFrame\(/g)?.length===1);
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1069-epic-drop-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1069-epic-drop-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1069(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1069);
  add('pure',!/(fetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage)/.test(read('lib/arena360EpicDropV1069.ts')));
 }catch(e){console.error('V1069 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1069(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1069 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1069};
