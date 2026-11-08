#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1088(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)}),
 read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const n=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',n>=1088&&pkg.sonicFeatureRelease==='v'+n&&pkg.sonicRoadmapRelease==='v'+n);
  add('lockfile',pkg.version===lock.version&&pkg.version===lock.packages[''].version);
  add('node24',pkg.engines.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.startsWith('npm run test:v1088 && npm run test:v1088:types &&'));
  add('test',pkg.scripts['test:v1088']==='node tests/v1088-song-structure-regression.cjs');
  add('types',pkg.scripts['test:v1088:types']==='tsc -p tests/tsconfig.v1088-core.json --noEmit');
  add('focused',pkg.scripts['verify:v1088:focused'].includes('npm run test:v1087'));
  for(const f of ['lib/songStructureDetectionV1088.ts','components/visualizer/SongStructurePanelV1088.tsx',
   'tests/v1088-song-structure-regression.cjs','tests/tsconfig.v1088-core.json',
   'scripts/v1088-release-readiness.cjs','changelog/V1088-SMART-SONG-STRUCTURE-DETECTION.md'])add('file:'+f,exists(f));
  const deck=read('components/visualizer/LiveFxDeckV881.tsx');
  add('panel',deck.includes('<SongStructurePanelV1088 key={`v1088-${trackId}`'));
  add('evidence',read('components/visualizer/SongStructurePanelV1088.tsx').includes('understandSongV1018('));
  const core=read('lib/songStructureDetectionV1088.ts');
  add('debounce',core.includes('elapsed<3000||candidateObservations<4'));
  add('guards',core.includes('!input.playing')&&core.includes('dt<=1600'));
  add('authority',core.includes("source:'audio-hypothesis'")&&core.includes("source:'verified-timeline'"));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1088-song-structure-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1088-song-structure-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1088(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1088);
 }catch(e){console.error('V1088 release readiness:',e);add('readable',false)}
 return {passed:checks.length>=22&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1088(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1088 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1088};
