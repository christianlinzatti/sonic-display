#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planUltimateConcertFinaleV1070:plan,OFF_ULTIMATE_FINALE_V1070:OFF,
 FINALE_LANES_V1070:LANES}=load('lib/arena360UltimateFinaleV1070');
const cue={active:true,scene:'finale',segmentIndex:6,intensity:90,fade:1,
 deck:'fan',floating:'rise',lasers:'tunnel',camera:'group',dance:'peak'};
const enabled=Object.fromEntries(LANES.map(k=>[k,true]));
const opts={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 reactive:true,showDesignerEnabled:true,showDirectorEnabled:true,trackId:'song-1070',
 progressMs:190000,durationMs:210000,strength:70,performanceTier:'high',
 show:cue,channels:enabled};
assert.deepEqual(LANES,['deck','floating','holograms','lasers','led','cast','camera']);
assert.equal(plan(opts).phase,'gather');
const phases=[['gather',.900,'performers'],['rise',.945,'platforms'],
 ['climax',.980,'panorama'],['bow',.997,'bow']];
for(const [phase,p,focus] of phases){
 const score=plan({...opts,progressMs:p*210000});
 assert.equal(score.active,true);assert.equal(score.phase,phase);assert.equal(score.focus,focus);
 assert.deepEqual(score,plan({...opts,progressMs:p*210000}),'must be deterministic');
 for(const lane of LANES)assert(score[lane]>=.18&&score[lane]<=1,`out of budget: ${lane}`);
}
// Continuous at phase boundaries: bounded changes even if the React tree re-renders.
for(const boundary of [.88,.905,.925,.965,.985,.992]){
 const a=plan({...opts,progressMs:(boundary-1e-6)*210000});
 const b=plan({...opts,progressMs:(boundary+1e-6)*210000});
 if(boundary!==.88)for(const lane of LANES)assert(Math.abs(a[lane]-b[lane])<.002,`${lane} discontinuity at ${boundary}`);
}
for(const bad of [
 {enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{showDesignerEnabled:false},{showDirectorEnabled:false},
 {performanceTier:'low'},{trackId:''},{trackId:null},
 {progressMs:-1},{progressMs:NaN},{progressMs:Infinity},
 {progressMs:10000},{progressMs:220000},{durationMs:20000},{durationMs:NaN},
 {strength:0},{strength:-1},{strength:81},{strength:NaN},{strength:Infinity},
 {show:null},{show:{...cue,scene:'hook'}},{show:{...cue,scene:'verse'}},
 {show:{...cue,segmentIndex:4}},{show:{...cue,active:false}},
 {show:{...cue,fade:0}},{show:{...cue,fade:NaN}},{show:{...cue,fade:1.2}},
 {show:{...cue,intensity:0}},{show:{...cue,intensity:NaN}},
 {show:{...cue,intensity:110}},{channels:{}},
 ])assert.equal(plan({...opts,...bad}).active,false,'fail closed: '+JSON.stringify(bad));
assert.equal(plan({...opts,progressMs:184800}).active,true,'88% begins finale');
assert.deepEqual(plan({...opts,enabled:false}),OFF);
const at=.905*210000;
const high=plan({...opts,progressMs:at,strength:80,performanceTier:'high'});
const low=plan({...opts,progressMs:at,strength:15,performanceTier:'high'});
const balanced=plan({...opts,progressMs:at,strength:80,performanceTier:'balanced'});
for(const lane of LANES){
 assert(high[lane]<=low[lane]&&low[lane]<=1,`strength does not amplify ${lane}`);
 assert(balanced[lane]>=high[lane],`GPU balanced cannot demand brighter/more complex ${lane}`);
 const absent=plan({...opts,progressMs:at,channels:{...enabled,[lane]:false}});
 assert.equal(absent[lane],1,'manual/toggled off lane must stay neutral: '+lane);
}
// Repeated scores and all channel masks, including only-cast/camera score variants.
for(let t=0;t<21000;t++){
 const p=.88001+(t%10000)/10000*.11997;
 const strength=(t%80)+1;
 const channels=Object.fromEntries(LANES.map((k,j)=>[k,((t+j*3)>>j&1)===1]));
 if(!Object.values(channels).some(Boolean))channels.cast=true;
 const c=plan({...opts,progressMs:210000*p,strength,
  performanceTier:t%2===0?'balanced':'high',channels,
  show:{...cue,intensity:1+t%100,fade:.05+(t%19)/20}});
 assert(c.active,`must remain active ${t}`);
 for(const lane of LANES){
  assert(Number.isFinite(c[lane])&&c[lane]>=.18&&c[lane]<=1,`${lane} ${t}`);
  if(!channels[lane])assert.equal(c[lane],1,`${lane} off ${t}`);
 }
}
const planner=read('lib/arena360UltimateFinaleV1070.ts');
for(const banned of ['Math.random(','Date.now(','fetch(','setTimeout(','setInterval(',
 'requestAnimationFrame(','WebSocket(','localStorage','goveeBridgeRequest'])
 assert(!planner.includes(banned),'deterministic no hardware/timer: '+banned);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('const ultimateFinaleV1070=planUltimateConcertFinaleV1070('));
for(const s of ['stageFormationV1066.active','floatingExperienceV1067.active',
 'holographicConcertV1068.active','coordinatedLasersV1060.active','coordinatedLedV1060.active',
 'finaleStageV1070','finaleFloatingV1070','finaleHologramsV1070','finaleLasersV1070','finaleLedV1070'])
 assert(stage.includes(s),'connected existing lane: '+s);
assert(stage.includes('epicDropCueV1069={epicDropV1069}'),'existing measured V1069 gate untouched');
const cast=read('components/visualizer/ThreeAvatar.tsx');
assert(cast.includes('finaleCastV1070=planUltimateConcertFinaleV1070('));
assert(cast.includes('finaleCastV1070.camera*smartFlowCastV1071.camera,')&&cast.includes('finaleCastV1070.cast*smartFlowCastV1071.cast,'));
assert(cast.includes("(props.arenaChoreographyFormationV1041??'auto')==='auto'"));
assert(cast.includes('props.arenaShowDirectorEnabledV1034??true'));
for(const p of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/visualizer/stages/index.tsx',
 'components/visualizer/stages/Arena360StageV1031.tsx'])
 assert(read(p).includes('UltimateFinale')||read(p).includes('ultimateFinale'),p);
assert(read('context/UiPreferencesContext.tsx').includes('arenaUltimateFinaleEnabledV1070:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1070 · Ultimate Concert Finale 2.0'));
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1070-ultimate-finale-regression.cjs'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1070);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
console.log('PASS V1070: 21,000 continuity/safety scores, four finale phases, seven existing lanes, disabled/manual protections');
