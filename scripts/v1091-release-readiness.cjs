#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1091(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try {
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('metadata',version>=1091&&p.sonicRoadmapRelease==='v'+version&&p.sonicFeatureRelease==='v'+version);
  add('lockfile',p.version===l.version&&l.version===l.packages[''].version);
  add('runtime',p.engines.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v1091 && npm run test:v1091:types &&'));
  add('scripts',p.scripts['test:v1091']==='node tests/v1091-story-arc-regression.cjs'&&
    p.scripts['test:v1091:types']==='tsc -p tests/tsconfig.v1091-core.json --noEmit');
  for(const file of ['lib/arena360StoryArcDirectorV1091.ts','tests/v1091-story-arc-regression.cjs',
   'tests/tsconfig.v1091-core.json','scripts/v1091-release-readiness.cjs',
   'changelog/V1091-SMART-CONCERT-STORY-ARC.md'])add('file:'+file,exists(file));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('frame-state',stage.includes('storyArcStateV1091.current=stepStoryArcV1091('));
  add('manual-modes',stage.includes("ledWallPatternV1059==='auto'")&&stage.includes("hologramPattern==='auto'"));
  for(const file of ['ArenaLedWallV1059.tsx','ArenaLaserFansV1036.tsx','ArenaLaserTunnelsV1039.tsx'])
   add('renderer:'+file,read('components/visualizer/stages/'+file).includes('sampleStoryArcGainV1091(storyArcStateV1091?.current)'));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arena-v1091-story-arc'));
  add('off-by-default',read('context/UiPreferencesContext.tsx').includes('arenaStoryArcEnabledV1091:false'));
  add('bridge',read('components/visualizer/stages/index.tsx').includes('storyArcEnabledV1091={storyArcEnabledV1091}')&&
    read('components/visualizer/ThreeAvatar.tsx').includes('storyArcEnabledV1091={props.arenaStoryArcEnabledV1091 ?? false}'));
  add('types',read('types/music.ts').includes('arenaStoryArcEnabledV1091?:boolean;')&&
    read('components/visualizer/registry.tsx').includes('arenaStoryArcEnabledV1091?:boolean;'));
  const action=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',action.includes('V1091 Smart Concert Story Arc Director')||action.includes('Active imported release (regression and isolated type checks)'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1091-story-arc-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1091-story-arc-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1091(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1091);
 }catch(e){add('parse',false);console.error(e)}
 return {passed:checks.length>=23&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1091(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1091 ${c.id}`);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1091};
