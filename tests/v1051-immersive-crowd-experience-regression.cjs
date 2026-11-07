'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=load('lib/arena360ShowDesignerV1040');
const {planCrowdExperienceV1051:plan,sampleCrowdExperienceV1051:sample}=load('lib/arena360CrowdExperienceV1051');
const showPlan=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs:240000});
const durations=240000;
function scene(index,fraction=.5){
 const segment=showPlan.segments[index];
 const progressMs=Math.round((segment.start+(segment.end-segment.start)*fraction)*durations);
 return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
  audienceEnabled:true,show:sampleArenaShowPlanV1040(showPlan,{enabled:true,
   playing:true,reducedMotion:false,progressMs,durationMs:durations,observedSection:'verse'}),
  trackId:'spotify:concert-v1051',progressMs,durationMs:durations,strength:80,performanceTier:'high'};
}
const expected=['calm','ripple','anticipation','singalong','rest','ripple','ovation'];
for(let i=0;i<7;i++){
 const cue=plan(scene(i));
 assert(cue.active,'show chapter '+i);assert.equal(cue.mood,expected[i]);
 assert.deepEqual(cue,plan(scene(i)),'deterministic, no frame randomness');
 assert(cue.gain>=0&&cue.gain<=.8);
 for(const time of [0,.2,1,3,7,25])for(let angle=-Math.PI;angle<=Math.PI+.001;angle+=Math.PI/10){
  const {rise,arms,light}=sample(cue,angle,time);
  assert([rise,arms,light].every(Number.isFinite));
  assert(rise>=0&&rise<=.8);
  assert(arms>=0&&arms<=.8);
  assert(light>=0&&light<=1);
 }
}
const riff=plan(scene(1));
const outra=plan(scene(6));
assert.notEqual(sample(riff,-2,3).arms,sample(riff,1,3).arms,'arms travel spatially around arena');
assert.notEqual(sample(riff,-2,3).rise,sample(riff,1,3).rise,'360 degree wave');
const rest=plan(scene(4));
assert(sample(rest,1,3).arms<sample(outra,1,3).arms,'interlude quieter than finale');
const otherTrack=plan({...scene(1),trackId:'spotify:alternate-song'});
assert.notEqual(otherTrack.phase,riff.phase,'per-track pattern variation');
assert.deepEqual(sample(null,0,0),{rise:0,arms:0,light:.5});
assert.deepEqual(sample(riff,Infinity,0),{rise:0,arms:0,light:.5});
assert.deepEqual(sample(riff,0,NaN),{rise:0,arms:0,light:.5});
const cases=[{enabled:false},{stageIsArena:false},{audienceEnabled:false},
 {playing:false},{reducedMotion:true},{reactive:false},{performanceTier:'low'},
 {trackId:''},{trackId:null},{progressMs:-1},{progressMs:NaN},
 {progressMs:250000},{durationMs:0},{durationMs:Infinity},{strength:0},
 {show:null},{show:{...scene(1).show,active:false}},
 {show:{...scene(1).show,intensity:NaN}},
 {show:{...scene(1).show,fade:Infinity}}];
for(const patch of cases)assert.equal(plan({...scene(1),...patch}).active,false,JSON.stringify(patch));
assert(plan({...scene(1),performanceTier:'balanced'}).gain<riff.gain);
for(let i=0;i<=100;i++){
 const cue=plan({...scene(6),progressMs:i*2400});
 assert(!cue.active||Number.isFinite(sample(cue,1,i*.24).rise));
}
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const audience=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
assert(stage.includes('planCrowdExperienceV1051({')&&stage.includes('crowdCueV1051={crowdCueV1051}'));
assert(audience.includes('sampleCrowdExperienceV1051('));
assert(audience.includes('v1051-audience-cheer-arms'),'instanced arms visibly present');
assert(audience.includes("phoneMode==='wave'"),'manual phone mode must retain priority');
assert(audience.includes('budget.current'), 'reuse capped audience tick');
for(const f of ['components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx','types/music.ts','context/UiPreferencesContext.tsx']){
 assert(read(f).includes('arenaCrowdExperienceEnabledV1051'),`missing settings wiring in ${f}`);
}
assert(read('context/UiPreferencesContext.tsx').includes('arenaCrowdExperienceEnabledV1051:false'));
for(const banned of ['Math.random(', 'fetch(', 'setTimeout(', 'setInterval(', 'WebSocket(',
 'localStorage','document.','navigator.','Date.now('])
 assert(!read('lib/arena360CrowdExperienceV1051.ts').includes(banned),`unexpected planner side effect: ${banned}`);
console.log('PASS V1051 · 7 crowd moods, 360-degree wave, cheering arms, song variety, bounded gestures, privacy, manual phone controls, accessibility and performance guards');
