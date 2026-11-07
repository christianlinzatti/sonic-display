#!/usr/bin/env node
'use strict';
const fs=require('node:fs'),path=require('node:path');
function inspectReleaseV1059(root){
 const checks=[],add=(name,ok)=>checks.push({name,ok:!!ok});
 const read=f=>fs.readFileSync(path.join(root,f),'utf8');
 const exists=f=>fs.existsSync(path.join(root,f));
 try{
  const p=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
  const v=/^0\.1\.0-v(\d+)$/.exec(p.version||'');
  add('metadata',!!v&&Number(v[1])>=1059&&p.sonicRoadmapRelease==='v'+v[1]&&p.sonicFeatureRelease==='v'+v[1]);
  add('lockfile',p.version===lock.version&&p.version===lock.packages?.['']?.version);
  add('Node24',p.engines?.node==='24.x');
  add('prebuild first',p.scripts.prebuild.includes('npm run test:v1059 && npm run test:v1059:types && npm run test:v1058'));
  add('previous focused tests',p.scripts['verify:v1059:focused'].includes('verify:v1058:focused'));
  for(const f of ['lib/arena360LedWallV1059.ts','components/visualizer/stages/ArenaLedWallV1059.tsx',
   'tests/v1059-led-wall-regression.cjs','tests/tsconfig.v1059-core.json',
   'scripts/v1059-release-readiness.cjs','changelog/V1059-ADVANCED-LED-WALL-4.md'])add('file '+f,exists(f));
  add('default off',read('context/UiPreferencesContext.tsx').includes('arenaLedWallEnabledV1059:false'));
  add('typed preference',read('types/music.ts').includes('arenaLedWallPatternV1059'));
  add('typed prop',read('components/visualizer/registry.tsx').includes('arenaLedWallPatternV1059'));
  add('UI',read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1059 · Advanced LED Wall 4.0'));
  add('visualizer',read('components/visualizer/VisualizerStage.tsx').includes('arenaLedWallEnabledV1059'));
  add('stage prop',read('components/visualizer/stages/index.tsx').includes('ledWallEnabledV1059={ledWallEnabledV1059}'));
  add('stage planner',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('planLedWallV1059('));
  add('stage renderer',read('components/visualizer/stages/Arena360StageV1031.tsx').includes('<ArenaLedWallV1059'));
  add('instanced renderer',read('components/visualizer/stages/ArenaLedWallV1059.tsx').includes('<instancedMesh'));
  add('production gate',read('scripts/v931-production-gate.cjs').includes('tests/v1059-led-wall-regression.cjs'));
  add('Vercel gate',read('scripts/vercel-production-build.cjs').includes('tests/v1059-led-wall-regression.cjs'));
  add('preflight',read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1059'));
  add('documentation',Number(/\*\*Dokumentationsstand:\*\* V(\d+)/.exec(read('ARCHITECTURE.md'))?.[1])>=1059);
  add('pure director',!/(fetch\(|setTimeout\(|setInterval\(|Math\.random\(|new SpotLight|WebSocket\(|Date\.now\(|localStorage)/.test(read('lib/arena360LedWallV1059.ts')));
 }catch(error){console.error('V1059 release inspection:',error.message);add('readable',false);}
 return {checks,passed:checks.length>=23&&checks.every(c=>c.ok)};
}
if(require.main===module){const r=inspectReleaseV1059(path.resolve(__dirname,'..'));
 for(const c of r.checks)console.log((c.ok?'PASS':'FAIL')+' V1059 '+c.name);
 if(!r.passed)process.exitCode=1;}
module.exports={inspectReleaseV1059};
