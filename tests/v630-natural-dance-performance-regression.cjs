'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalDancePerformanceV630:plan}=load('components/visualizer/naturalDancePerformanceV630');
let count=0;const test=(label,fn)=>{try{fn();count++}catch(e){e.message=`V630 ${label}: ${e.message}`;throw e;}};
const names=['mixamorigHips','mixamorigLeftUpLeg','mixamorigRightUpLeg','mixamorigLeftLeg','mixamorigRightLeg','mixamorigLeftFoot','mixamorigRightFoot'];
const track=(name,angle=0,duration=4)=>({name:`${name}.quaternion`,times:new Float32Array([0,duration]),values:new Float32Array([0,0,0,1,0,Math.sin(angle/2),0,Math.cos(angle/2)]),getValueSize:()=>4});
const clip=(angle=0,duration=4)=>({duration,tracks:names.map((n,i)=>track(n,i%2===0?angle:angle*.82,duration))});
const source=clip(0),close=clip(.09),far=clip(1.7);
const base={outgoing:source,incoming:far,outgoingSeconds:1.5,incomingSeconds:2,baseSeconds:.32,bpm:112,plantedLeft:false,plantedRight:false,rapidSwitch:false,automatic:true,playing:true,reducedMotion:false,quality:'high'};
const run=(x={})=>plan({...base,...x});
test('real GLB lower-body mismatch smooths the automatic switch',()=>{const r=run();assert(r.enabled);assert.equal(r.style,'pose-continuity');assert(r.fadeSeconds>.32);assert(r.comparedJoints>=4);});
test('small pose gap leaves existing crossfade unchanged',()=>{const r=run({incoming:close});assert(!r.enabled);assert.equal(r.fadeSeconds,.32);});
test('no motion matching based on filenames',()=>assert(!('selectedClip' in run())&&!('entrySeconds' in run())));
test('left planted foot extends blend but does not change IK',()=>{const a=run(),b=run({plantedLeft:true});assert(b.fadeSeconds>=a.fadeSeconds);assert(b.plantedProtected);assert.equal(b.style,'foot-contact');});
test('right foot is protected',()=>assert(run({plantedRight:true}).plantedProtected));
test('both feet are protected',()=>assert(run({plantedLeft:true,plantedRight:true}).plantedProtected));
test('rapid switching slightly improves continuity',()=>assert(run({rapidSwitch:true}).fadeSeconds>=run().fadeSeconds));
test('normal changes are deterministic',()=>assert.deepEqual(run(),run()));
test('does not mutate real keyframe arrays',()=>{const arr=Array.from(source.tracks[0].values);run();assert.deepEqual(Array.from(source.tracks[0].values),arr);});
test('manual choreography unaffected',()=>assert.equal(run({automatic:false}).enabled,false));
test('pause unaffected',()=>assert.equal(run({playing:false}).enabled,false));
test('reduced motion unaffected',()=>assert.equal(run({reducedMotion:true}).enabled,false));
test('low-quality unaffected',()=>assert.equal(run({quality:'low'}).enabled,false));
test('medium quality supported',()=>assert(run({quality:'balanced'}).enabled));
test('missing outgoing clip ignored',()=>assert.equal(run({outgoing:null}).enabled,false));
test('missing incoming clip ignored',()=>assert.equal(run({incoming:null}).enabled,false));
test('missing outgoing time ignored',()=>assert.equal(run({outgoingSeconds:null}).enabled,false));
test('invalid incoming time ignored',()=>assert.equal(run({incomingSeconds:NaN}).enabled,false));
test('invalid outgoing duration ignored',()=>assert.equal(run({outgoing:{...source,duration:NaN}}).enabled,false));
test('invalid incoming duration ignored',()=>assert.equal(run({incoming:{...far,duration:Infinity}}).enabled,false));
test('sub-second unsupported clips ignored',()=>assert.equal(run({incoming:clip(1.7,.20)}).enabled,false));
test('NaN base seconds ignored',()=>assert.equal(run({baseSeconds:NaN}).enabled,false));
test('zero base seconds ignored',()=>assert.equal(run({baseSeconds:0}).enabled,false));
test('no leg evidence ignored',()=>assert.equal(run({incoming:{duration:4,tracks:[track('jaw',1)]}}).enabled,false));
test('one-sided rig ignored',()=>assert.equal(run({incoming:{duration:4,tracks:far.tracks.filter(t=>!t.name.includes('Right'))}}).enabled,false));
test('fewer than four comparable joints ignored',()=>assert.equal(run({incoming:{duration:4,tracks:far.tracks.slice(0,3)}}).enabled,false));
test('nan keyframe values ignored',()=>{const c=clip(1.7);c.tracks[2].values[4]=NaN;assert(Number.isFinite(run({incoming:c}).fadeSeconds));});
test('NaN keyframe timing ignored',()=>{const c=clip(1.7);c.tracks[2].times[1]=NaN;assert(Number.isFinite(run({incoming:c}).fadeSeconds));});
test('invalid last keyframe treated as unsupported',()=>{const c=clip(1.7);c.tracks[0].times[1]=-1;assert(Number.isFinite(run({incoming:c}).fadeSeconds));});
test('mismatched value counts ignored',()=>{const c=clip(1.7);c.tracks[0].values=new Float32Array([0,0,0,1]);assert(Number.isFinite(run({incoming:c}).fadeSeconds));});
test('unrecognized animation roles do not fabricate evidence',()=>{const c=clip(1.7);c.tracks=c.tracks.map(t=>({...t,name:'Unknown.'+t.name}));assert.equal(run({incoming:c}).enabled,false);});
test('already capped musical fade never shortened',()=>{const r=run({baseSeconds:1.1,bpm:240});assert.equal(r.fadeSeconds,1.1);assert(!r.enabled);});
test('short action caps smoothing, never entire clip',()=>{const r=run({incoming:clip(1.7,.9),outgoing:clip(0,.9),baseSeconds:.28,bpm:100});assert(r.fadeSeconds<=.9*.42+.0001);});
test('invalid bpm produces finite fade',()=>assert(Number.isFinite(run({bpm:NaN}).fadeSeconds)));
test('no exact foot contact signal from detected clip names',()=>assert(!('feetLocked' in run())));
test('hook lives on existing motion transition path',()=>{
 const s=fs.readFileSync('components/visualizer/useGltfClipTransitionsV492.ts','utf8');
 assert(s.includes('planNaturalDancePerformanceV630({'));
 assert(s.indexOf('const flowV614=')<s.indexOf('const naturalPerformanceV630='));
 assert(s.indexOf('const naturalPerformanceV630=')<s.indexOf('nextAction.fadeIn(effectiveFadeDurationV311).play();'));
 assert(s.includes('incomingSeconds:nextAction.time'));
 assert(s.includes('automatic:autoV565&&!manualSelectionV565'));
 assert(s.includes('if(naturalPerformanceV630.enabled)effectiveFadeDurationV311=naturalPerformanceV630.fadeSeconds;'));
 assert(!s.includes('nextAction.time=naturalPerformanceV630'));
});
test('existing automatic motion chooser retains repeat avoidance and priority',()=>{
 const s=fs.readFileSync('components/visualizer/genreAwareMotionDirectorV536.ts','utf8');
 assert(s.includes('state.recent.slice(-2)'));
 const x=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert(x.includes('genreMotionV536 && actions[genreMotionV536]'));
 assert(x.indexOf('clipChoiceV328 && actions[clipChoiceV328]')<x.indexOf('genreMotionV536 && actions[genreMotionV536]'));
});
test('new policy has no extra animation scheduler or model mutation',()=>{
 const s=fs.readFileSync('components/visualizer/naturalDancePerformanceV630.ts','utf8');
 assert(!/requestAnimationFrame\s*\(|\buseFrame\s*\(|setTimeout\s*\(|new AnimationMixer\s*\(|\.reset\s*\(|\.fadeIn\s*\(|Math.random\s*\(/.test(s));
});
let snapshots=0;
for(let j=0;j<2500;j++)for(const quality of ['high','balanced'])for(const planted of [false,true]){
 const r=run({quality,plantedLeft:planted,incomingSeconds:j%400/100,bpm:75+j%140,baseSeconds:.16+(j%26)/100,
  rapidSwitch:j%4===0});
 assert(Number.isFinite(r.fadeSeconds)&&r.fadeSeconds>=.08&&r.fadeSeconds<=1.2);
 assert.deepEqual(r,run({quality,plantedLeft:planted,incomingSeconds:j%400/100,bpm:75+j%140,baseSeconds:.16+(j%26)/100,
  rapidSwitch:j%4===0}));snapshots++;
}
test('10k deterministic real-track transition scenarios',()=>assert.equal(snapshots,10000));
console.log(`PASS V630: ${count} regression groups, ${snapshots} deterministic lower-body transition samples`);
