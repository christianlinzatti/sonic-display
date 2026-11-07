#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1078(root){
 const checks=[],add=(id,ok)=>checks.push({id,ok:Boolean(ok)});
 const read=p=>fs.readFileSync(path.join(root,p),'utf8');
 const exists=p=>fs.existsSync(path.join(root,p));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const version=Number(/^0\.1\.0-v(\d+)$/.exec(p.version)?.[1]||0);
  add('version',version>=1078&&p.sonicRoadmapRelease==='v'+version&&p.sonicFeatureRelease==='v'+version);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild',p.scripts.prebuild.includes('npm run test:v1078 && npm run test:v1078:types &&'));
  add('focused',p.scripts['verify:v1078:focused']?.includes('verify:v1077:focused'));
  add('test',p.scripts['test:v1078']==='node tests/v1078-natural-dance-intelligence-regression.cjs');
  for(const f of ['lib/naturalDanceIntelligenceV1078.ts','tests/v1078-natural-dance-intelligence-regression.cjs',
   'tests/tsconfig.v1078-core.json','scripts/v1078-release-readiness.cjs',
   'changelog/V1078-NATURAL-DANCE-INTELLIGENCE-4.md'])add('file:'+f,exists(f));
  add('default-off',read('context/UiPreferencesContext.tsx').includes('arenaNaturalDanceEnabledV1078:false'));
  add('public-type',read('types/music.ts').includes('arenaNaturalDanceStrengthV1078'));
  add('registry',read('components/visualizer/registry.tsx').includes('arenaNaturalDanceStrengthV1078'));
  add('ui-prop',read('components/visualizer/VisualizerStage.tsx').includes('arenaNaturalDanceEnabledV1078='));
  add('panel',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1078 · Natural Dance Intelligence 4.0'));
  const glb=read('components/visualizer/GltfDancerAvatarV492.tsx');
  add('dancer',glb.includes("arenaNaturalDanceEnabledV1078&&stageTheme==='arena360'"));
  add('pre-phrase',glb.includes('refineNaturalDanceV1078(baseDebugMotionV1024,')&&
    glb.includes('stepDanceChoreographyV1024(danceStateV1024.current,naturalDanceV1078.motion'));
  add('pre-ik',glb.indexOf('refineNaturalDanceV1078(baseDebugMotionV1024,')<
    glb.indexOf('refineNaturalFootworkRigV839(naturalFootworkV839.current,debugMotion'));
  const source=read('lib/naturalDanceIntelligenceV1078.ts');
  add('manual',source.includes('p.manualPriority'));
  add('low-tier',source.includes("p.quality==='low'"));
  add('contact-evidence',source.includes('!p.footIKEnabled||!p.contactKnown'));
  add('no-step-when-planted',source.includes('footGain=both||onePlanted?0:1'));
  add('genre',source.includes('deutschrap|hip.?hop|trap|drill'));
  add('bounded',source.includes('clamp(wave*.032*intensity*gain*hipGain')&&source.includes('function add('));
  add('no-clip',!source.includes('new AnimationMixer(')&&!source.includes('setTimeout('));
  add('production',read('scripts/v931-production-gate.cjs').includes('tests/v1078-natural-dance-intelligence-regression.cjs'));
  add('vercel',read('scripts/vercel-production-build.cjs').includes('tests/v1078-natural-dance-intelligence-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1078(root)'));
  add('docs',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1078);
 }catch(e){console.error('V1078 readiness:',e.message);add('readable',false)}
 return {passed:checks.length>=27&&checks.every(c=>c.ok),checks};
}
if(require.main===module){const r=inspectReleaseV1078(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log(`${c.ok?'PASS':'FAIL'} V1078 ${c.id}`);
 if(!r.passed)process.exitCode=1;
}
module.exports={inspectReleaseV1078};
