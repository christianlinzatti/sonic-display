'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {newNaturalLowPoseStateV482:initial,stepNaturalLowPoseV482:step,newLowClipStateV482:newClip,stepLowClipV482:clip}=load('components/visualizer/naturalLowPoseTransitionsV482');
const input={depth:.25,mode:'crouch',seconds:0,slot:0,beat:.7,playing:true,reducedMotion:false,manualPriority:false};
let s=initial();
const during=[];
for(let i=0;i<90;i++){
 step(s,{...input,seconds:i/60},1/60);
 during.push(s.depth);
 assert(s.depth>=0&&s.depth<=.26);
 assert(s.torsoShift>=-.038&&s.torsoShift<=.038);
}
assert(during[0]>0&&during[0]<.05,'no abrupt snap into crouch');
assert(during[5]<during[45],'descent is progressive');
assert(Math.abs(s.depth-.25)<.003,'target reached');
const partner=initial();for(let i=0;i<90;i++)step(partner,{...input,slot:1,seconds:i/60},1/60);
assert.notEqual(Math.round(s.torsoShift*1e5),Math.round(partner.torsoShift*1e5),'partners have different gentle torso shifts');
let maxStep=0;
for(let i=0;i<75;i++){const before=s.depth;step(s,{...input,depth:0,mode:'stand',seconds:2+i/60},1/60);maxStep=Math.max(maxStep,Math.abs(s.depth-before));}
assert(maxStep<.025,'standing up must be smooth');
assert(s.depth<.003,'complete recovery');
for(let i=0;i<60;i++)step(s,{...input,seconds:3+i/60},1/60);
assert(s.depth>.20);
step(s,{...input,playing:false},1/60);
assert(s.depth>.0&&s.depth<.26,'pause starts recovery rather than snapping');
for(let i=0;i<120;i++)step(s,{...input,manualPriority:true},1/60);
assert(s.depth<.001,'manual priority restores neutral pose');
const large=initial();step(large,input,120);assert(large.depth>=0&&large.depth<=.26,'tab switch large delta bounded');
const broken=initial();for(let i=0;i<40;i++)step(broken,{...input,depth:NaN,seconds:NaN,beat:Infinity},NaN);
assert(Object.values(broken).every(Number.isFinite));
// Clip hysteresis: no false GLB foot transformations, only existing clip names.
const c=newClip();assert.equal(clip(c,'Imported: Squat',1/60,'song-a',false),'Imported: Squat');
assert.equal(clip(c,'Imported: Kneel',1/60,'song-a',false),'Imported: Squat');
for(let i=0;i<50;i++)clip(c,'Imported: Kneel',1/60,'song-a',false);
assert.equal(clip(c,'Imported: Kneel',1/60,'song-a',false),'Imported: Kneel');
assert.equal(clip(c,null,1/60,'song-a',false),null,'stand must cancel squat promptly');
assert.equal(clip(c,'Imported: Squat',1/60,'song-a',false),'Imported: Squat');
assert.equal(clip(c,'Imported: Squat',1/60,'song-a',true),null,'manual override immediately cancels');
assert.equal(clip(c,'Imported: Squat',1/60,'song-b',false),'Imported: Squat','track change resets hold');
assert.equal(clip(c,'Imported: Kneel',1/60,'song-c',false),'Imported: Kneel','new song never inherits previous hold');
assert.equal(clip(c,'Imported: Kneel',1/60,'',false),null,'no track => no autonomous motion');
// Simulate 30 min at bounded sampled cadence; no unbounded states or memory history.
const long=initial();for(let i=0;i<108000;i++){
 const mode=i%450<280?'low-bounce':'stand';
 step(long,{...input,mode,depth:mode==='stand'?0:.20,seconds:i/60,slot:i%4},1/60);
 if(i%125===0)assert(Object.values(long).every(Number.isFinite));
}
assert(Object.values(long).every(Number.isFinite));
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
assert(avatar.includes('stepNaturalLowPoseV482(naturalLowV482.current'));
assert(avatar.includes('solveProceduralLowLegV481(lowV482.depth)'));
assert(avatar.includes('root.current.position.y=baseRootYV482.current-lowV482.depth'));
assert(avatar.includes('stepLowClipV482(clipLatchV482.current'));
assert(avatar.includes('findLowPoseClipV481(names,cue.mode)'));
assert(avatar.includes('const selectedClip=lowClipV481 && actions[lowClipV481]'));
assert(avatar.includes('manualPriority:!!selectedSingerV444'));
const source=fs.readFileSync('components/visualizer/naturalLowPoseTransitionsV482.ts','utf8');
assert(!/fetch\(|setInterval\(|Date\.now\(|Math\.random\(/.test(source));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=482);
assert(pkg.scripts['build:preflight'].includes('npm run test:v482 && npm run test:v482:types'));
console.log('PASS V482: smooth pelvis/knee coupling, torso weight shifts, GLB clip hysteresis & overrides, 30-minute stability, stage wiring');
