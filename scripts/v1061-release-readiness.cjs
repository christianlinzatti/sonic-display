#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1061(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||'');
  add('release-version',!!v&&Number(v[1])>=1061&&p.sonicRoadmapRelease==='v'+v[1]&&p.sonicFeatureRelease==='v'+v[1]);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1061 && npm run test:v1061:types &&'));
  add('focused',p.scripts['verify:v1061:focused'].includes('verify:v1060:focused'));
  for(const f of ['lib/naturalAvatarMotionV1061.ts','tests/v1061-natural-avatar-motion-regression.cjs',
    'tests/tsconfig.v1061-core.json','scripts/v1061-release-readiness.cjs',
    'changelog/V1061-NATURAL-AVATAR-MOTION-3.md'])add('file:'+f,exists(f));
  add('default-disabled',read('context/UiPreferencesContext.tsx').includes('arenaNaturalMotionEnabledV1061:false'));
  add('typed-preferences',read('types/music.ts').includes('arenaNaturalMotionStrengthV1061'));
  add('typed-props',read('components/visualizer/registry.tsx').includes('arenaNaturalMotionStrengthV1061'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaNaturalMotionEnabledV1061'));
  add('ui',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1061 · Natural Avatar Motion 3.0'));
  add('glb-integration',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('overlayNaturalMotionV1061('));
  add('procedural-integration',read('components/visualizer/ProceduralDancerAvatarV492.tsx').includes('planNaturalMotionV1061('));
  add('guard-preserved',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion'));
  add('footIK-preserved',read('components/visualizer/GltfDancerAvatarV492.tsx').includes('updateFootGrounding({delta'));
  add('CI',read('scripts/v931-production-gate.cjs').includes('tests/v1061-natural-avatar-motion-regression.cjs'));
  add('Vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1061-natural-avatar-motion-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1061'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1061);
  add('pure',!/(fetch\(|setInterval\(|setTimeout\(|Math\.random\(|Date\.now\(|WebSocket\(|localStorage)/.test(read('lib/naturalAvatarMotionV1061.ts')));
 }catch(e){console.error('V1061 release readiness:',e.message);add('readable',false);}
 return {checks,passed:checks.length>=22&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1061(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log((c.ok?'PASS':'FAIL')+' V1061 '+c.id);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1061};
