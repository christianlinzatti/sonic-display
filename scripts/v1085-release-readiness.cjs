#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1085(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8'),exists=f=>fs.existsSync(path.join(root,f));
 try{
  const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0);
  add('release',v>=1085&&pkg.sonicFeatureRelease==='v'+v&&pkg.sonicRoadmapRelease==='v'+v);
  add('lock',pkg.version===lock.version&&pkg.version===lock.packages?.['']?.version);
  add('engine',pkg.engines?.node==='24.x');
  add('prebuild',pkg.scripts.prebuild.includes('npm run test:v1085 && npm run test:v1085:types &&'));
  add('test',pkg.scripts['test:v1085']==='node tests/v1085-projection-mapping-regression.cjs');
  add('types',pkg.scripts['test:v1085:types']==='tsc -p tests/tsconfig.v1085-core.json --noEmit');
  for(const f of ['lib/arena360ProjectionMappingV1085.ts','components/visualizer/stages/ArenaProjectionMappingV1085.tsx',
    'tests/v1085-projection-mapping-regression.cjs','tests/tsconfig.v1085-core.json','scripts/v1085-release-readiness.cjs',
    'changelog/V1085-PROJECTION-MAPPING.md'])add('file:'+f,exists(f));
  const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
  add('stage',stage.includes('planProjectionMappingV1085({'));
  add('rotation',stage.indexOf('surface="floor"')>stage.indexOf('ref={turntable}'));
  add('scenery',stage.indexOf('surface="scenery"')<stage.indexOf('ref={turntable}'));
  add('dynamic-check',stage.includes('sceneryEnabled:dynamicArchitectureEnabledV1082&&dynamicArchitectureV1082.active'));
  add('satellites',read('components/visualizer/stages/ArenaFloatingPlatformsV1038.tsx').includes('mappingCueV1085'));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaProjectionEnabledV1085:false'));
  add('clear-all',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaProjectionEnabledV1085:false'));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1085-projection-mapping-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1085-projection-mapping-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1085(root)'));
  add('architecture',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1085);
 }catch(e){console.error('V1085 readiness',e);add('readable',false);}
 return {passed:checks.length>=22&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1085(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1085 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1085};
