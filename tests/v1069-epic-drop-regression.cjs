#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {planEpicDropV1069:plan,acceptEpicDropBeatV1069:beatGate,
 sampleEpicDropLedAccentV1069:accent,OFF_EPIC_DROP_V1069:OFF}=load('lib/arena360EpicDropV1069');
const show={active:true,scene:'hook',segmentIndex:3,intensity:85,fade:1,
 deck:'fan',floating:'orbit',lasers:'tunnel',camera:'group',dance:'group'};
const opts={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
 showDesignerEnabled:true,showDirectorEnabled:true,observedSection:'drop',show,
 trackId:'song-1',progressMs:92000,durationMs:210000,strength:70,
 performanceTier:'high',genre:'hard',effects:{finale:true,led:true,pyro:true},ledPattern:'auto'};
const cue=plan(opts);
assert(cue.active&&cue.genre==='hard'&&cue.shockPower>0&&cue.confettiCount>0&&cue.ledAccent>0&&cue.pyroTint>0);
assert.deepEqual(plan(opts),cue,'deterministic plan');
for(const scene of ['intro','verse','build','hook','interlude','finale']){
 // The planned scene never claims to be a detected drop.
 assert.equal(plan({...opts,observedSection:'hook',show:{...show,scene}}).active,false);
 const c=plan({...opts,show:{...show,scene}});
 assert(c.active,`observed real drop remains necessary and sufficient in chapter ${scene}`);
}
for(const g of ['hard','rap','rock','pop'])assert.equal(plan({...opts,genre:g}).genre,g);
assert.equal(plan({...opts,genre:'unknown'}).genre,'pop');
for(const bad of [
 {enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},{reactive:false},
 {showDesignerEnabled:false},{showDirectorEnabled:false},{observedSection:'hook'},
 {observedSection:'verse'},{observedSection:'build'},{observedSection:null},
 {performanceTier:'low'},{trackId:''},{show:null},{show:{...show,active:false}},{show:{...show,scene:'drop'}},
 {show:{...show,fade:0}},{show:{...show,fade:NaN}},{show:{...show,fade:2}},
 {show:{...show,intensity:0}},{show:{...show,intensity:200}},
 {strength:0},{strength:81},{strength:NaN},{strength:Infinity},
 {progressMs:-1},{progressMs:NaN},{progressMs:250000},{durationMs:20000},{durationMs:NaN},
 {effects:{finale:false,led:false,pyro:false}},
 {effects:{finale:false,led:true,pyro:false},ledPattern:'pulse'},
 ]) assert.equal(plan({...opts,...bad}).active,false,'fails closed: '+JSON.stringify(bad));
const noFinale=plan({...opts,effects:{finale:false,led:true,pyro:false}});
assert(noFinale.active&&noFinale.shockPower===0&&noFinale.confettiCount===0&&noFinale.ledAccent>0);
const noLed=plan({...opts,ledPattern:'equalizer'});
assert(noLed.active&&noLed.ledAccent===0,'manual LED pattern preserved');
const noPyro=plan({...opts,effects:{finale:true,led:true,pyro:false}});
assert.equal(noPyro.pyroTint,0,'disabled pyro is not enabled');
assert(plan({...opts,performanceTier:'balanced'}).power<cue.power,'GPU tier reduction');
assert(plan({...opts,strength:20}).power<cue.power,'strength reduction');
assert.deepEqual(OFF,{active:false,power:0,shockPower:0,confetti:0,confettiCount:0,
 ledAccent:0,pyroTint:0,cooldownSeconds:2.8,genre:'pop'});
const beat={cue,beat:true,previousBeat:false,cooldownSeconds:0,
 beatStrength:.82,bass:.76,energy:.7};
assert(beatGate(beat),'verified measured drop rising edge');
for(const invalid of [
 {beat:false},{previousBeat:true},{cooldownSeconds:1.4},
 {cooldownSeconds:NaN},{beatStrength:.71},{beatStrength:NaN},{beatStrength:1.1},
 {bass:.57},{bass:-1},{energy:.47},{energy:Infinity},{cue:OFF},
 ]) assert(!beatGate({...beat,...invalid}),'no fabricated beat on '+JSON.stringify(invalid));
assert(accent(0,cue)>0&&accent(.5,cue)<accent(0,cue)&&accent(.91,cue)===0);
assert.equal(accent(NaN,cue),0);assert.equal(accent(-.5,cue),0);
for(let k=0;k<22000;k++){
 const c=plan({...opts,strength:(k%80)+1,performanceTier:k%3===0?'balanced':'high',
  genre:['rap','hard','rock','pop'][k%4],
  show:{...show,scene:['intro','verse','build','hook','interlude','finale'][k%6],intensity:(k%99)+1,fade:(k%90+1)/100},
  progressMs:k*7%210000});
 assert(c.active&&c.power>=0&&c.power<=1&&c.shockPower>=0&&c.shockPower<=.54&&
  c.confetti>=0&&c.confetti<=.42&&c.confettiCount>=0&&c.confettiCount<=72&&
  c.ledAccent>=0&&c.ledAccent<=.28&&c.pyroTint>=0&&c.pyroTint<=.24);
 assert(Number.isFinite(c.power)&&Number.isFinite(c.shockPower));
 for(const age of [0,.15,.45,.88,1,NaN]){
  const a=accent(age,c);assert(Number.isFinite(a)&&a>=0&&a<=.28);
 }
}
const planner=read('lib/arena360EpicDropV1069.ts');
for(const banned of ['Math.random(','Date.now(','fetch(','setTimeout(','setInterval(',
 'requestAnimationFrame(','WebSocket(','localStorage','goveeBridgeRequest'])
 assert(!planner.includes(banned),'pure deterministic planner: '+banned);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('observedSection:section'),'observed section forwarded');
assert(stage.includes('epicDropCueV1069={epicDropV1069}'));
assert(stage.includes('ledPattern:ledWallPatternV1059'),'manual LED patterns respected');
assert(stage.includes('effects:{finale:cinematicFinaleEnabled&&dropEnabled'),'disabled finale cannot be reenabled');
const finale=read('components/visualizer/stages/ArenaCinematicFinaleV1046.tsx');
assert.equal((finale.match(/useFrame\(/g)||[]).length,1,'reuse existing finale frame owner');
assert(finale.includes('acceptEpicDropBeatV1069('));
assert(finale.includes('Math.min(96,Math.max(0,paperCount))'));
assert(finale.includes('Math.min(.28,(1-fraction)*shockPower*.43)'));
assert(finale.includes('shockAge.current=9;dropAge.current=9'),'seek/track reset');
assert.equal((finale.match(/<instancedMesh/g)||[]).length,1,'reuse original confetti batch');
assert.equal((finale.match(/<ringGeometry/g)||[]).length,1,'reuse original shockwave ring');
const led=read('components/visualizer/stages/ArenaLedWallV1059.tsx');
assert(led.includes('sampleEpicDropLedAccentV1069(')&&led.includes('colorA.lerp(accentColor,accent)'));
assert(led.includes('if(afterA>beforeA&&afterA>0)colorA.multiplyScalar(beforeA/afterA)'),'LED luminance is never increased');
assert.equal((led.match(/useFrame\(/g)||[]).length,1,'existing LED loop');
assert.equal((led.match(/<instancedMesh/g)||[]).length,1,'existing LED pixel batch');
const pyro=read('components/visualizer/stages/ArenaVirtualPyroV1035.tsx');
assert(pyro.includes('stepArenaPyroV1035(state.current,dt,')&&pyro.includes('.lerp(gold,colorBlend)'));
assert.equal((pyro.match(/useFrame\(/g)||[]).length,1,'pyro cooldown owner is unchanged');
for(const p of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx'])
 assert(read(p).includes('EpicDrop')||read(p).includes('epicDrop'),p);
assert(read('context/UiPreferencesContext.tsx').includes('arenaEpicDropEnabledV1069:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1069 · Epic Drop Experience'));
for(const f of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(f).includes('tests/v1069-epic-drop-regression.cjs'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1069);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1069: 22,000 bounded drop plans, real-section/beat gates, cooldown, GPU and manual priority, no extra meshes or hardware');
