#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1056(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:Boolean(ok)});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||''),pre=p.scripts.prebuild;
  add('metadata',!!v&&Number(v[1])>=1056&&p.sonicFeatureRelease==='v'+v[1]&&p.sonicRoadmapRelease==='v'+v[1]);
  add('lockfile',p.version===l.version&&p.version===l.packages?.['']?.version);
  add('node24',p.engines?.node==='24.x');
  add('prebuild first',pre.includes('npm run test:v1056 && npm run test:v1056:types && npm run test:v1055'));
  add('prior-focused',p.scripts['verify:v1056:focused'].includes('verify:v1055:focused'));
  for(const f of ['lib/arena360CinematicLightingV1056.ts','tests/v1056-cinematic-lighting-regression.cjs',
   'tests/tsconfig.v1056-core.json','scripts/v1056-release-readiness.cjs',
   'changelog/V1056-CINEMATIC-CONCERT-LIGHTING-2.md'])add('file '+f,exists(f));
  add('default off',read('context/UiPreferencesContext.tsx').includes('arenaCinematicLightingEnabledV1056:false'));
  add('typed preferences',read('types/music.ts').includes('arenaCinematicLightingStrengthV1056'));
  add('typed props',read('components/visualizer/registry.tsx').includes('arenaCinematicLightingStrengthV1056'));
  add('UI opt-in',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1056 · Cinematic Concert Lighting 2.0'));
  add('visualizer wiring',read('components/visualizer/VisualizerStage.tsx').includes('arenaCinematicLightingEnabledV1056'));
  add('stage forwarding',read('components/visualizer/stages/index.tsx').includes('cinematicLightingEnabledV1056={cinematicLightingEnabledV1056}'));
  add('real stage planner',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planCinematicLightingV1056('));
  add('existing two spots',read('components/visualizer/stages/ArenaLightsV1032.tsx').includes('getWorldPosition(out)'));
  add('v931 production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1056-cinematic-lighting-regression.cjs'));
  add('vercel production gate',read('scripts/vercel-production-build.cjs').includes('tests/v1056-cinematic-lighting-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1056'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1056);
  add('side-effect-free director',!/(fetch\(|setTimeout\(|setInterval\(|Math\.random\(|new SpotLight|WebSocket\(|Date\.now\()/.test(read('lib/arena360CinematicLightingV1056.ts')));
 }catch(error){console.error(error);add('source available',false);}
 return {checks,passed:checks.length>=22&&checks.every(x=>x.ok)};
}
if(require.main===module){const r=inspectReleaseV1056(path.resolve(__dirname,'..'));
 for(const x of r.checks)console.log((x.ok?'PASS':'FAIL')+' V1056 '+x.name);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1056};
