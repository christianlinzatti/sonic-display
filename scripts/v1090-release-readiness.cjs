#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1090(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',v>=1090&&pkg.sonicFeatureRelease==='v'+v&&pkg.sonicRoadmapRelease==='v'+v);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages[''].version);
  add('node24',pkg.engines.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1090 && npm run test:v1090:types &&'));
  add('scripts',pkg.scripts['test:v1090']==='node tests/v1090-musical-dynamics-regression.cjs'&&
   pkg.scripts['test:v1090:types']==='tsc -p tests/tsconfig.v1090-core.json --noEmit');
  for(const f of ['lib/arena360MusicalDynamicsV1090.ts','tests/v1090-musical-dynamics-regression.cjs',
    'tests/tsconfig.v1090-core.json','scripts/v1090-release-readiness.cjs',
    'changelog/V1090-MUSICAL-DYNAMICS-SHOW-TRANSITIONS.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('frame-state',stage.includes('musicalDynamicsStateV1090.current=stepMusicalDynamicsV1090('));
  add('manual',stage.includes("ledWallPatternV1059==='auto'")&&stage.includes("hologramPattern==='auto'"));
  for(const file of ['ArenaLedWallV1059.tsx','ArenaLaserFansV1036.tsx','ArenaLaserTunnelsV1039.tsx']){
   add('renderer:'+file,read('components/visualizer/stages/'+file)
    .includes('sampleMusicalDynamicsGainV1090(musicalDynamicsStateV1090?.current)'));
  }
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arena-v1090-musical-dynamics'));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaMusicalDynamicsEnabledV1090:false'));
  add('bridge',read('components/visualizer/stages/index.tsx').includes('musicalDynamicsEnabledV1090={musicalDynamicsEnabledV1090}')&&
   read('components/visualizer/ThreeAvatar.tsx').includes('musicalDynamicsEnabledV1090={props.arenaMusicalDynamicsEnabledV1090'));
  add('typed',read('types/music.ts').includes('arenaMusicalDynamicsEnabledV1090?:boolean;')&&
   read('components/visualizer/registry.tsx').includes('arenaMusicalDynamicsEnabledV1090?:boolean;'));
  add('ci',read('.github/workflows/v965-room-wave-production.yml').includes('V1090 Musical Dynamics & Show Transitions')||
   read('.github/workflows/v965-room-wave-production.yml').includes('Active imported release (regression and isolated type checks)'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1090-musical-dynamics-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1090-musical-dynamics-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1090(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1090);
 }catch(error){console.error('V1090 readiness:',error);add('readable',false)}
 return {passed:checks.length>=23&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1090(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1090 ${c.id}`);
 if(!result.passed)process.exitCode=1;}
module.exports={inspectReleaseV1090};
