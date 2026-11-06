#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1024(root){
 const checks=[],check=(name,ok)=>checks.push({name,ok:!!ok});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try {
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const match=/^0\.1\.0-v([1-9]\d*)$/.exec(pkg.version||'');
  check('current-release',!!match&&Number(match[1])>=1024);
  check('metadata-consistency',!!match&&pkg.sonicFeatureRelease==='v'+match[1]&&pkg.sonicRoadmapRelease==='v'+match[1]);
  check('lockfile',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  check('node24',pkg.engines?.node==='24.x');
  check('prebuild-first',!!match&&pkg.scripts.prebuild.startsWith(`npm run test:v${match[1]} &&`));
  check('regression-script',pkg.scripts['test:v1024']==='node tests/v1024-ai-dance-choreography-regression.cjs');
  check('types-script',pkg.scripts['test:v1024:types']?.includes('aiDanceChoreographyV1024.ts'));
  for(const p of ['components/visualizer/aiDanceChoreographyV1024.ts',
   'components/visualizer/GltfDancerAvatarV492.tsx',
   'tests/v1024-ai-dance-choreography-regression.cjs',
   'changelog/V1024-AI-DANCE-CHOREOGRAPHY-4.md'])check('file:'+p,exists(p));
  const rig=read('components/visualizer/GltfDancerAvatarV492.tsx');
  check('frame-integrated',rig.includes('stepDanceChoreographyV1024(danceStateV1024.current,baseDebugMotionV1024'));
  check('ik-later',rig.indexOf('stepDanceChoreographyV1024(danceStateV1024.current')<rig.indexOf('updateFootGrounding({delta'));
  for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
   check('mandatory:'+p,read(p).includes('tests/v1024-ai-dance-choreography-regression.cjs'));
  check('preflight-hook',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1024(root)'));
  const titles=require('./version-action-titles-v1016.cjs').formatActionTitlesV1016(root,false);
  check('current-action-titles',titles.total>=25&&titles.changed===0);
  check('production-build',read('.github/workflows/v965-room-wave-production.yml').includes('node scripts/v965-production-verify.cjs'));
 }catch(error){check('readable',false);}
 return {passed:checks.length>=18&&checks.every(x=>x.ok),checks};
}
if(require.main===module){const result=inspectReleaseV1024(path.resolve(__dirname,'..'));
 for(const c of result.checks)console.log(`${c.ok?'PASS':'FAIL'} V1024 ${c.name}`);
 if(!result.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1024};
