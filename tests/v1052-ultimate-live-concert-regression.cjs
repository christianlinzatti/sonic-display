'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040,editArenaShowSegmentV1040}=load('lib/arena360ShowDesignerV1040');
const {directUltimateConcertV1052:direct}=load('lib/arena360UltimateConcertV1052');
const plan=generateArenaShowPlanV1040({genre:'Deutschrap',durationMs:232000});
function inputFor(index,fraction=.50){
 const segment=plan.segments[index],durationMs=232000;
 const progressMs=Math.round((segment.start+(segment.end-segment.start)*fraction)*durationMs);
 const show=sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,progressMs,durationMs,observedSection:'verse'});
 return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
  show,plan,trackId:'spotify:v1052-test',progressMs,durationMs,strength:80,performanceTier:'high'};
}
const chapters=[];
for(let i=0;i<7;i++){
 const input=inputFor(i),cue=direct(input);
 assert.equal(cue.active,true,`chapter ${i} must be active`);
 assert.equal(cue.reason,'planned');assert.equal(cue.chapter,i);chapters.push(cue);
 assert.deepEqual(cue,direct(input),'every subsystem gets same deterministic score');
 assert(cue.energy>=0&&cue.energy<=1);
 for(const gain of [cue.stageGain,cue.crowdGain,cue.cameraGain,cue.choreoGain]){
  assert(Number.isFinite(gain)&&gain>=.38&&gain<=1,'safe bounded gain');
 }
 assert(cue.show.intensity<=input.show.intensity,'never exceed author intensity');
 assert(cue.show.intensity>=0,'never below zero');
 const {intensity:_,...oldShow}=input.show,{intensity:__,...newShow}=cue.show;
 assert.deepEqual(newShow,oldShow,'authored camera, dance, lasers and stage modes unchanged');
}
assert.equal(chapters[3].focus,'ensemble');
assert.equal(chapters[4].focus,'breath');
assert.equal(chapters[6].focus,'ensemble');
assert(chapters[4].energy<chapters[3].energy,'interlude rests');
assert(chapters[4].energy<chapters[6].energy,'finale returns to strong energy');
for(let i=0;i<6;i++)if(chapters[i].focus!=='ensemble'&&chapters[i+1].focus!=='ensemble'&&chapters[i+1].focus!=='breath'){
 assert.notEqual(chapters[i].focus,chapters[i+1].focus,'rotate focus');
}
const outro=direct(inputFor(6,.98));
assert(outro.energy<chapters[6].energy,'smooth afterglow after climax');
const alternatives=Array.from({length:12},(_,i)=>direct({...inputFor(1),trackId:`spotify:alternate-song-${i}`}));
assert(alternatives.some(a=>a.focus!==chapters[1].focus),'different tracks can have distinct focus');
for(let i=1;i<7;i++){
 const pre=inputFor(i-1,.9999),post=inputFor(i,.0001);
 pre.show={...pre.show,intensity:Math.max(1,pre.show.intensity),fade:Math.max(.01,pre.show.fade)};
 post.show={...post.show,intensity:Math.max(1,post.show.intensity),fade:Math.max(.01,post.show.fade)};
 const before=direct(pre),after=direct(post);
 assert(before.active&&after.active,'valid neighboring chapters');
 // The master envelope crosses the boundary smoothly; V1040 owns its own entry fade.
 assert(Math.abs(before.energy-after.energy)<.015,'smooth chapter transition '+i);
}
for(const patch of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{performanceTier:'low'},{trackId:null},{trackId:''},{durationMs:0},
 {durationMs:NaN},{progressMs:-1},{progressMs:Infinity},{progressMs:260000},
 {strength:0},{show:{...inputFor(1).show,active:false}},
 {show:{...inputFor(1).show,intensity:Infinity}},{show:{...inputFor(1).show,fade:NaN}},
 {show:{...inputFor(1).show,scene:'finale'}},{show:{...inputFor(1).show,segmentIndex:99}},
 {plan:null}]){
 const input={...inputFor(1),...patch},cue=direct(input);
 assert.equal(cue.active,false,'gate '+Object.keys(patch)[0]);
 assert.strictEqual(cue.show,input.show,'inactive never modifies show object');
 assert.equal(cue.stageGain,1);assert.equal(cue.cameraGain,1);
}
const balanced=direct({...inputFor(1),performanceTier:'balanced'});
assert(balanced.stageGain>=chapters[1].stageGain,'balanced less aggressive than high');
const manuallyEdited=editArenaShowSegmentV1040(plan,'act-4',{camera:'lead',dance:'calm',lasers:'halo',floating:'wave',deck:'halo',intensity:29});
const editedIn=inputFor(3);editedIn.plan=manuallyEdited;
editedIn.show=sampleArenaShowPlanV1040(manuallyEdited,{enabled:true,playing:true,reducedMotion:false,progressMs:editedIn.progressMs,durationMs:editedIn.durationMs});
const editedOut=direct(editedIn);
assert(editedOut.active);assert.equal(editedOut.show.camera,'lead');assert.equal(editedOut.show.dance,'calm');
assert.equal(editedOut.show.lasers,'halo');assert.equal(editedOut.show.floating,'wave');
assert.equal(editedOut.show.deck,'halo');assert(editedOut.show.intensity<=29);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const avatar=read('components/visualizer/ThreeAvatar.tsx');
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(stage.includes('directUltimateConcertV1052({'),'stage linked');
assert(avatar.includes('directUltimateConcertV1052({'),'avatar/camera linked');
assert(stage.includes('gain:plannedCrowdV1051.gain*ultimateConcertV1052.crowdGain'),'audience stays bounded');
assert(avatar.includes('ultimateConcertV1052.cameraGain')&&avatar.includes('ultimateConcertV1052.choreoGain'));
assert(panel.includes('V1052 · Ultimate Live Concert Experience'));
for(const f of ['components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx',
 'components/visualizer/ArenaShowDesignerPanelV1040.tsx','context/UiPreferencesContext.tsx','types/music.ts']){
 assert(read(f).includes('arenaUltimateConcertEnabledV1052'),'missing preference wiring: '+f);
}
assert(read('context/UiPreferencesContext.tsx').includes('arenaUltimateConcertEnabledV1052:false'),'default opt-out');
for(const forbidden of ['fetch(', 'setInterval(', 'setTimeout(', 'WebSocket(', 'Math.random(',
 'localStorage', 'navigator.', 'document.', 'Date.now(']){
 assert(!read('lib/arena360UltimateConcertV1052.ts').includes(forbidden),'no planner side effect '+forbidden);
}
console.log('PASS V1052 · 7 coordinated chapters, shared score, track variation, chapter crossfades, afterglow, opt-in, manual priorities, bounded gains, accessibility and performance');
