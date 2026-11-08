#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1093(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const number=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('metadata',number>=1093&&pkg.sonicFeatureRelease==='v'+number&&pkg.sonicRoadmapRelease==='v'+number);
  add('lockfile',lock.version===pkg.version&&lock.packages[''].version===pkg.version);
  add('node24',pkg.engines.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1093 && npm run test:v1093:types &&'));
  add('scripts',pkg.scripts['test:v1093']==='node tests/v1093-genre-show-intelligence-regression.cjs'&&
   pkg.scripts['test:v1093:types']==='tsc -p tests/tsconfig.v1093-core.json --noEmit');
  for(const f of ['lib/arena360GenreShowIntelligenceV1093.ts','tests/v1093-genre-show-intelligence-regression.cjs',
   'tests/tsconfig.v1093-core.json','scripts/v1093-release-readiness.cjs',
   'changelog/V1093-GENRE-SHOW-INTELLIGENCE.md'])add('file:'+f,exists(f));
  const core=read('lib/arena360GenreShowIntelligenceV1093.ts');
  for(const genre of ['deutschrap','hardtekk','deutschrock','pop'])add('profile:'+genre,core.includes(genre+':{intro:'));
  add('conservative',core.includes("return energy<.23&&scene!=='intro'?'break':scene"));
  add('stage',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('stepGenreShowV1093('));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arena-v1093-genre-show'));
  add('default',read('context/UiPreferencesContext.tsx').includes('arenaGenreShowEnabledV1093:false'));
  add('types',read('types/music.ts').includes('arenaGenreShowEnabledV1093?:boolean')&&
      read('components/visualizer/registry.tsx').includes('arenaGenreShowEnabledV1093?:boolean'));
  for(const renderer of ['ArenaLedWallV1059','ArenaLaserFansV1036','ArenaLaserTunnelsV1039','ArenaAudienceV1032'])
   add('renderer:'+renderer,read('components/visualizer/stages/'+renderer+'.tsx').includes('sampleGenreShowGainV1093('));
  const workflow=read('.github/workflows/v965-room-wave-production.yml');
  add('ci',workflow.includes('V1093 Genre Show Intelligence')||workflow.includes('Active imported release (regression and isolated type checks)'));
  add('gate',read('scripts/v931-production-gate.cjs').includes('tests/v1093-genre-show-intelligence-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1093-genre-show-intelligence-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1093(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1]||0)>=1093);
 }catch(e){console.error(e);add('parse',false)}
 return {passed:checks.length>=26&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1093(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1093 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1093};
