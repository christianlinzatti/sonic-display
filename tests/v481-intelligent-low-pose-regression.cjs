'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_LOW_POSE_V481:settings,normalizeLowPoseV481:normalize,
 planLowPosesV481:plan,findLowPoseClipV481:findClip,solveProceduralLowLegV481:solve}=load('components/visualizer/intelligentLowPoseV481');
const input={settings,count:4,trackId:'demo-4',seconds:11,cueSeconds:10,focus:0,drop:false,section:'verse',genre:'Deutschrap',beat:.72,kick:.65,energy:.7,playing:true,reducedMotion:false,automaticGroup:true,manualPriority:false,lyricsForeground:false,tier:'high'};
const a=plan(input);
assert.equal(a.active,true);
assert(a.slots.filter(s=>s.depth>.001).length<=2);
assert.equal(a.slots[0].mode,'stand','lead should remain up during verses');
assert.deepEqual(plan(input),a,'pure deterministic playback');
assert(a.slots.some(s=>s.mode==='crouch'||s.mode==='kneel'||s.mode==='rap-lean'));
const replay=plan({...input,seconds:11});assert.deepEqual(replay,a);
const hook=plan({...input,drop:true,section:'hook',cueSeconds:10,seconds:11,energy:.95});
assert.equal(hook.slots.filter(s=>s.depth>.01).length,4,'explicit high-energy hook sync');
assert(hook.slots.every(s=>s.mode==='crouch'));
for(const patch of [{settings:{...settings,synchronizedDrops:false}},{tier:'low'},{kick:0,beat:0}]){
 const out=plan({...input,...patch,drop:true,section:'hook'});
 assert(out.slots.filter(s=>s.depth>.01).length<=2,'no invented full-ensemble drop');
}
const low=plan({...input,tier:'low'}),strong=plan({...input,settings:{...settings,intensity:'strong'}}),subtle=plan({...input,settings:{...settings,intensity:'subtle'}});
assert(low.slots.filter(s=>s.depth>.001).length<=1);
assert(strong.slots.reduce((v,s)=>v+s.depth,0)>subtle.slots.reduce((v,s)=>v+s.depth,0));
const near=plan({...input,seconds:10.1});
assert(near.slots.reduce((v,s)=>v+s.depth,0)<a.slots.reduce((v,s)=>v+s.depth,0),'ease into squat');
for(const patch of [
 {playing:false},{reducedMotion:true},{manualPriority:true},{automaticGroup:false},
 {lyricsForeground:true},{count:2},{count:5},{trackId:''},{seconds:NaN},
 {beat:NaN},{kick:-1},{settings:{...settings,enabled:false}},
]){
 const out=plan({...input,...patch});assert.equal(out.active,false,JSON.stringify(patch));
 assert(out.slots.every(s=>s.mode==='stand'&&s.depth===0));
}
for(let i=0;i<108000;i+=13){ // 30 minutes at ~60 sampled windows (seek deterministic)
 const s=plan({...input,seconds:i/60+1,cueSeconds:Math.floor(i/240)*4,focus:Math.floor(i/1000)%4,drop:i%15===0});
 assert.equal(s.slots.length,4);
 assert(s.slots.every(x=>Number.isFinite(x.depth)&&x.depth>=0&&x.depth<=.58));
}
assert.deepEqual(normalize({intensity:'wild',maxConcurrent:100,enabled:false,synchronizedDrops:false}),{enabled:false,intensity:'medium',maxConcurrent:2,synchronizedDrops:false});
assert.deepEqual(normalize(null),settings);
for(let i=0;i<=260;i++){
 const rig=solve(i/1000);
 assert(Math.abs(rig.ankleError)<1e-10,'nominal ankle height unchanged');
 assert(rig.kneeAngle>=0&&rig.kneeAngle<=1.6);
 assert(Math.abs(rig.kneeAngle-2*rig.hipAngle)<1e-12);
}
assert(Number.isFinite(solve(NaN).hipAngle));
const clips=['Idle','Library: imported Crouching Down','Imported: kneel down','Squat Bounce','Rap Dance'];
assert.equal(findClip(clips,'crouch'),'Library: imported Crouching Down');
assert.equal(findClip(clips,'kneel'),'Imported: kneel down');
assert.equal(findClip(clips,'low-bounce'),'Squat Bounce');
assert.equal(findClip(clips,'stand'),null);
assert.equal(findClip(['Idle','Dance 1'],'crouch'),null,'missing clip => never fake GLB crouch');
const avatar=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/MultiAvatarStageStudioV326.tsx','utf8');
assert(avatar.includes('planLowPosesV481({'));
assert(avatar.includes('const selectedClip=lowClipV481 && actions[lowClipV481]'));
assert(avatar.includes('<GroupLowPoseContextV481.Provider value={lowPosesV481.current[i]}>'));
assert(avatar.includes('solveProceduralLowLegV481(lowV482.depth)') || avatar.includes('solveProceduralLowLegV481(lowerV481)'), 'two-joint procedural crouch survives V482 finishing');
assert(avatar.includes('manualPriority:!!selectedSingerV444'));
assert(ui.includes('<LowPoseControlsV481/>'));
assert(!/fetch\(|setInterval\(/.test(fs.readFileSync('components/visualizer/intelligentLowPoseV481.ts','utf8')));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1])>=481, 'V481 behavior must persist in V482+');
assert(pkg.scripts['build:preflight'].includes('npm run test:v481 && npm run test:v481:types'));
console.log('PASS V481: actual clip lookup, procedural two-leg crouch wiring, staggered 4-avatar verses, protected manuals, gated sync drops, playback replay, bounded 30-min check');
