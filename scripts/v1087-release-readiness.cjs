#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1087(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',version>=1087&&pkg.sonicFeatureRelease==='v'+version&&pkg.sonicRoadmapRelease==='v'+version);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages[''].version);
  add('engine',pkg.engines.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1087 && npm run test:v1087:types &&'));
  add('test',pkg.scripts['test:v1087']==='node tests/v1087-ultimate-festival-drop-regression.cjs');
  add('types',pkg.scripts['test:v1087:types']==='tsc -p tests/tsconfig.v1087-core.json --noEmit');
  for(const f of ['lib/arena360UltimateFestivalDropV1087.ts',
   'components/visualizer/stages/ArenaUltimateFestivalDropV1087.tsx',
   'tests/v1087-ultimate-festival-drop-regression.cjs',
   'tests/tsconfig.v1087-core.json','scripts/v1087-release-readiness.cjs',
   'changelog/V1087-ULTIMATE-FESTIVAL-DROP.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('plan',stage.includes('planUltimateFestivalDropV1087({'));
  add('shared-clock',stage.includes('stepUltimateFestivalDropV1087('));
  add('renderer:wave',stage.includes('<ArenaUltimateFestivalDropV1087 cue='));
  for(const fx of ['ArenaLedWallV1059.tsx','ArenaLaserFansV1036.tsx',
   'ArenaLaserTunnelsV1039.tsx','ArenaFestivalAtmosphereV1084.tsx'])
   add('renderer:'+fx,read('components/visualizer/stages/'+fx).includes('sampleUltimateFestivalDropV1087('));
  add('manual',stage.includes("ledWallPatternV1059==='auto'")&&stage.includes("hologramPattern==='auto'"));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaUltimateFestivalDropEnabledV1087:false'));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arena-v1087-ultimate-festival-drop'));
  add('clear-all',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaUltimateFestivalDropEnabledV1087:false'));
  add('plumbing',read('components/visualizer/ThreeAvatar.tsx').includes('ultimateFestivalDropEnabledV1087={props.arenaUltimateFestivalDropEnabledV1087'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1087-ultimate-festival-drop-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1087-ultimate-festival-drop-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1087(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1087);
 }catch(e){console.error('V1087 readiness:',e);add('readable',false)}
 return {passed:checks.length>=25&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1087(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1087 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1087};
