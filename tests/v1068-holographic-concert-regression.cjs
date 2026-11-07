#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {planHolographicConcertV1068:plan,sampleHolographicConcertV1068:sample,
 OFF_HOLOGRAM_V1068:OFF,REST_HOLOGRAM_V1068:REST}=load('lib/arena360HolographicConcertV1068');
const show={active:true,scene:'hook',segmentIndex:3,intensity:88,fade:1,
 deck:'fan',floating:'orbit',lasers:'tunnel',camera:'group',dance:'group'};
const opts={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
 showDesignerEnabled:true,showDirectorEnabled:true,hologramsEnabled:true,
 portalPattern:'auto',performanceTier:'high',progressMs:72000,durationMs:210000,
 strength:65,show};
const cue=plan(opts);
assert(cue.active&&cue.look==='duet'&&cue.power>0);
assert.deepEqual(cue,plan(opts),'deterministic cue');
const looks=[['intro','awakening'],['verse','reflection'],['build','vortex'],
 ['hook','duet'],['interlude','breath'],['finale','finale']];
for(const [scene,look] of looks){
 const c=plan({...opts,show:{...show,scene}});
 assert(c.active&&c.look===look,scene);
 const o=Array.from({length:9},(_,i)=>sample(i,9,c));
 assert(o.some(v=>v.echo>0),scene+' shows the performer silhouette');
 assert(o.every(v=>Math.abs(v.radial)<=.05&&Math.abs(v.rise)<=.09&&
  Math.abs(v.rotation)<=.095&&v.scale>=.94&&v.scale<=1.10&&
  v.echo>=0&&v.echo<=1&&v.glow>=0&&v.glow<=.084),scene+' bounds');
}
assert.equal(plan({...opts,floatCueV1067:{active:true,formation:'crown',phase:.18,power:.5},
 stageCueV1066:{active:true,shape:'bloom',phase:.7,amount:.6}}).phase,.18);
assert.equal(plan({...opts,stageCueV1066:{active:true,shape:'bloom',phase:.7,amount:.6}}).sync,'stage');
assert.equal(plan({...opts,floatCueV1067:{active:false,formation:'crown',phase:.3,power:.5}}).sync,'show');
assert.equal(plan(opts).phase,72000/210000);
assert(plan({...opts,performanceTier:'balanced'}).power<cue.power,'GPU reduction');
assert(plan({...opts,strength:20}).power<cue.power,'strength reduction');
for(const invalid of [
 {enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{showDesignerEnabled:false},{showDirectorEnabled:false},
 {hologramsEnabled:false},{portalPattern:'spiral'},{portalPattern:'halo'},
 {portalPattern:'tunnel'},{performanceTier:'low'},{strength:0},
 {strength:NaN},{strength:Infinity},{strength:81},{progressMs:-1},
 {progressMs:NaN},{progressMs:Infinity},{progressMs:250000},{durationMs:NaN},
 {durationMs:20000},{durationMs:Infinity},{show:null},
 {show:{...show,active:false}},{show:{...show,scene:'drop'}},
 {show:{...show,scene:null}},{show:{...show,intensity:0}},
 {show:{...show,intensity:101}},{show:{...show,intensity:NaN}},
 {show:{...show,fade:0}},{show:{...show,fade:NaN}},
 {show:{...show,fade:1.5}},
 ]){
 const off=plan({...opts,...invalid});
 assert.equal(off.active,false,'fails closed '+JSON.stringify(invalid));
 assert.deepEqual(sample(0,9,off),REST);
}
for(let k=0;k<12000;k++){
 const scene=looks[k%looks.length][0];
 const c=plan({...opts,progressMs:(k*137)%210000,strength:(k%80)+1,
  show:{...show,scene,intensity:(k%90)+1,fade:(k%99+1)/100},
  performanceTier:k%2?'balanced':'high'});
 for(let j=0;j<9;j++){
  const o=sample(j,9,c);
  assert(Object.values(o).every(Number.isFinite),'finite output');
  assert(Math.abs(o.radial)<=.05&&Math.abs(o.rise)<=.09);
  assert(Math.abs(o.rotation)<=.095&&o.echo>=0&&o.echo<=1);
  assert(o.glow>=0&&o.glow<=.084&&o.scale>=.94&&o.scale<=1.10);
  // V1039 portals have minimum radius 3.57 m; stage floor extends <= 2.83m.
  assert(3.57+o.radial-.35>2.83,'projection stays outside the cast floor');
 }
}
const pure=read('lib/arena360HolographicConcertV1068.ts');
for(const banned of ['Math.random(','Date.now(','fetch(','setTimeout(',
 'setInterval(','requestAnimationFrame(','WebSocket(','localStorage','goveeBridgeRequest'])
 assert(!pure.includes(banned),'pure show planner: '+banned);
const render=read('components/visualizer/stages/ArenaHologramPortalsV1039.tsx');
assert.equal((render.match(/useFrame\(/g)||[]).length,1,'same existing frame owner');
assert(render.includes('sampleHolographicConcertV1068('),'per-portal offsets');
assert(render.includes('tier!==\'low\'&&concertCueV1068?.active'),'low-tier GPU guard');
assert(render.includes('instancedMesh ref={echoes}'),'one silhouette batch');
assert(render.includes('silhouetteGeometry.dispose()'),'GPU geometry disposed');
assert(render.includes('Math.min(.49,sample.light+fx.glow)'),'original ring brightness cap');
assert(render.includes('Math.min(.30,fx.echo*.28)'),'bounded silhouettes');
assert(!render.includes('pointLight')&&!render.includes('spotLight')&&!render.includes('fetch('));
for(const f of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx'])
 assert(read(f).includes('HolographicConcert')||read(f).includes('holographicConcert'),f);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('portalPattern:hologramPattern'),'manual selection wins');
assert(stage.includes('stageCueV1066:stageFormationV1066,floatCueV1067:floatingExperienceV1067'));
assert(stage.includes('concertCueV1068={flowHologramsV1071}'));
assert(stage.includes('holographicConcertV1068.power*ultimateFinaleV1070.holograms')); // bounded V1070 forwarding
assert(stage.indexOf('<ArenaHologramPortalsV1039')<stage.indexOf('ref={turntable}'),
 'virtual silhouettes and portals are world-fixed, outside the cast transform');
assert(read('context/UiPreferencesContext.tsx').includes('arenaHolographicConcertEnabledV1068:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1068 · Holographic Concert FX 3.0'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1068-holographic-concert-regression.cjs'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert.ok(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1068);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1068: 108,000 bounded hologram samples, six show looks, V1066/V1067 sync, manual/GPU guards and one instanced silhouette batch');
