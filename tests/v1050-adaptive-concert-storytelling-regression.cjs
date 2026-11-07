'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040,editArenaShowSegmentV1040}=load('lib/arena360ShowDesignerV1040');
const {directAdaptiveStoryV1050:direct}=load('lib/arena360AdaptiveStorytellingV1050');
const plan=generateArenaShowPlanV1040({genre:'Hardtekk',durationMs:240000});
function at(index,fraction=.5,changes={}){
 const seg=plan.segments[index];
 const progressMs=Math.round((seg.start+(seg.end-seg.start)*fraction)*240000);
 const show=sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,
  progressMs,durationMs:240000,observedSection:'verse'});
 assert.equal(show.segmentIndex,index);
 return {enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
  show,plan,trackId:'track:1050',progressMs,durationMs:240000,strength:80,performanceTier:'high',...changes};
}
const chapters=['prologue','establish','tension','release','breath','reprise','finale'];
for(let i=0;i<7;i++){
 const input=at(i),result=direct(input);
 assert(result.active);assert.equal(result.chapter,chapters[i]);
 assert(result.show.intensity<=input.show.intensity);
 assert.equal(result.show.segmentIndex,i);
 assert.equal(result.show.scene,input.show.scene);
 for(const key of ['deck','dance','lasers','fade','active','segmentIndex'])
  assert.deepEqual(result.show[key],input.show[key],`Unexpected edit of ${key}`);
 assert.deepEqual(direct(input),direct(input),'deterministic: no per-frame random scene');
}
const breath=direct(at(4));
const hook=direct(at(3));
assert(breath.intensityGain<hook.intensityGain,'interlude must breathe');
const early=direct(at(6,.25));
const late=direct(at(6,.96));
assert.equal(late.chapter,'afterglow');
assert(late.intensityGain<early.intensityGain,'end credits fade');
assert.equal(late.show.camera,'wide','finale pulls back to the arena, only for automatic camera');
assert.equal(late.show.floating,'wave','automatic floating stage settles');
const changed=editArenaShowSegmentV1040(plan,'act-7',{camera:'lead',floating:'orbit',intensity:12});
const original=at(6,.96);
const edited={...original,plan:changed,show:sampleArenaShowPlanV1040(changed,{enabled:true,
 playing:true,reducedMotion:false,progressMs:original.progressMs,durationMs:240000,observedSection:'verse'})};
const result=direct(edited).show;
assert.equal(result.camera,'lead','never override manually edited camera');
assert.equal(result.floating,'orbit','never override manually edited floating mode');
assert(result.intensity<=edited.show.intensity,'never brighten manual intensity');
const upstream={...original,show:{...original.show,camera:'lead',floating:'orbit'}};
assert.equal(direct(upstream).show.camera,'lead','keep V1048 suggestion');
assert.equal(direct(upstream).show.floating,'orbit','keep V1048 suggestion');
const offCases=[{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{performanceTier:'low'},{strength:0},{trackId:''},{trackId:null},
 {progressMs:-1},{progressMs:NaN},{progressMs:241000},{durationMs:NaN},
 {plan:null},{plan:{...plan,segments:[]}},{show:{...original.show,active:false}},
 {show:{...original.show,intensity:NaN}},{show:{...original.show,fade:Infinity}},
 {show:{...original.show,segmentIndex:99}},{show:{...original.show,scene:'intro'}}];
for(const patch of offCases){
 const input={...original,...patch};const out=direct(input);
 assert.equal(out.active,false,JSON.stringify(patch));
 assert.deepEqual(out.show,input.show,'inactive must return original cue');
}
for(let i=0;i<700;i++){
 const progress=i/699;
 const index=plan.segments.findIndex(s=>progress<s.end);
 const segment=Math.min(6,index<0?6:index);
 const arg=at(segment,.5,{progressMs:Math.round(progress*240000)});
 arg.show=sampleArenaShowPlanV1040(plan,{enabled:true,playing:true,reducedMotion:false,
  progressMs:arg.progressMs,durationMs:240000,observedSection:'verse'});
 const out=direct(arg);
 assert(out.active);assert(Number.isFinite(out.intensityGain));
 assert(out.intensityGain<=1&&out.intensityGain>=0);
 assert(out.show.intensity<=arg.show.intensity&&out.show.intensity>=0);
}
const balanced=direct(at(4,.5,{performanceTier:'balanced'}));
assert(balanced.intensityGain>=breath.intensityGain,'balanced should use less modulation');
const all=['components/visualizer/stages/Arena360StageV1031.tsx',
 'components/visualizer/ThreeAvatar.tsx','components/GoveeMusicSyncV909.tsx'];
for(const file of all){
 const body=read(file);
 assert(body.includes('directAdaptiveStoryV1050'),`No V1050 layer in ${file}`);
 assert(body.indexOf('directAdaptiveStoryV1050({')<body.indexOf('directLiveConcertV1049({'),
  `Story must be composed before live V1049 in ${file}`);
}
for(const file of ['components/visualizer/VisualizerStage.tsx','components/visualizer/ArenaShowDesignerPanelV1040.tsx',
 'types/music.ts','context/UiPreferencesContext.tsx'])assert(read(file).includes('arenaStorytellingEnabledV1050'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaStorytellingEnabledV1050:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1050 · Adaptive Concert Storytelling'));
assert(read('components/GoveeMusicSyncV909.tsx').includes('show:storyGoveeShowV1050'));
for(const banned of ['fetch(', 'setTimeout(', 'setInterval(', 'WebSocket(', 'Math.random(',
 'Date.now(', 'performance.now(', 'localStorage', 'navigator.', 'document.'])
 assert(!read('lib/arena360AdaptiveStorytellingV1050.ts').includes(banned),'Unexpected side effect '+banned);
console.log('PASS V1050 · 7 chapters, intentional breath, finale afterglow, bounded intensity, manual edits, track safety, full song sampling, Govee integration');
