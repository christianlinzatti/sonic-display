#!/usr/bin/env node
'use strict';
/** Metadata and integration proof; no cached test reports count as success. */
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1080(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  add('release',p.version==='0.1.0-v1080'&&p.sonicFeatureRelease==='v1080'&&p.sonicRoadmapRelease==='v1080');
  add('lockfile',lock.version===p.version&&lock.packages?.['']?.version===p.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.startsWith('npm run test:v1080 && npm run test:v1080:types &&'));
  add('focused',p.scripts['verify:v1080:focused']?.includes('verify:v1079:focused'));
  add('test',p.scripts['test:v1080']==='node tests/v1080-laser-experience-regression.cjs');
  add('types',p.scripts['test:v1080:types']==='tsc -p tests/tsconfig.v1080-core.json --noEmit');
  for(const f of ['lib/arena360LaserExperienceV1080.ts','tests/v1080-laser-experience-regression.cjs',
   'tests/tsconfig.v1080-core.json','scripts/v1080-release-readiness.cjs',
   'changelog/V1080-LASER-SHOW-EXPERIENCE-5.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage-plan',stage.includes('planLaserExperienceV1080({'));
  add('two-batches',(stage.match(/laserExperienceCueV1080={laserExperienceV1080}/g)||[]).length===2);
  add('manual',stage.includes("manualPattern:hologramPattern!=='auto'"));
  add('audio',stage.includes('beat:audio.beat')&&stage.includes('beatStrength:audio.beatStrength'));
  for(const f of ['components/visualizer/stages/ArenaLaserFansV1036.tsx',
   'components/visualizer/stages/ArenaLaserTunnelsV1039.tsx']){
   const src=read(f);add('geometry:'+f,src.includes('sampleLaserEndpointV1080('));
   add('gpu:'+f,(src.match(/<instancedMesh\b/g)||[]).length===1);
  }
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1080 Laser Show Experience 5.0'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1080-laser-experience-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1080-laser-experience-regression.cjs'));
  add('ci',read('.github/workflows/v965-room-wave-production.yml').includes('npm run test:v1080 && npm run test:v1080:types'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1080(root)'));
 }catch(e){console.error('V1080 readiness:',e.message);add('readable',false);}
 return {passed:checks.length>=20&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1080(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1080 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1080};
