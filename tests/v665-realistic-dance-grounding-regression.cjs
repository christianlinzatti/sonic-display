'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/realisticDanceGroundingV665');
const base=()=>({headNod:.2,headTurn:.04,spineSway:.15,hipSway:.2,shoulderRoll:.3,
 followThrough:.1,headLag:.06,chestPulse:.25,armSwing:.31,legGroove:.35,
 footStep:.24,weightShift:.2,hipCounter:-.08,beatImpulse:.75,expressionJaw:.4,
 expressionBrow:.1,expressionEyeNarrow:.2,expressionHeadTilt:.03});
const full=(changes={})=>({settings:{enabled:true,strength:70,transitionMs:320},trackId:'track-a',modelId:'glb-a',seconds:10,delta:1/60,
 playing:true,reducedMotion:false,manualPriority:false,quality:'high',footIKEnabled:true,contactKnown:true,
 plantedLeft:false,plantedRight:false,poseDepth:0,poseClipActive:false,...changes});
const step=(state=v.newGroundingStateV665(),motion=base(),change={})=>v.stepRealisticGroundingV665(state,motion,full(change));
let n=0;function test(name,fn){try{fn();n++;}catch(e){e.message=`V665 ${name}: ${e.message}`;throw e;}}
test('disabled by default, no change to existing shows',()=>{assert.equal(v.DEFAULT_GROUNDING_SETTINGS_V665.enabled,false);const a=base(),out=step(v.newGroundingStateV665(),a,{settings:v.DEFAULT_GROUNDING_SETTINGS_V665});assert.strictEqual(out.motion,a);assert(!out.active);});
test('settings normalization is strict and bounded',()=>{
 assert.deepEqual(v.normalizeGroundingSettingsV665({enabled:1,strength:Infinity,transitionMs:Infinity}),v.DEFAULT_GROUNDING_SETTINGS_V665);
 assert.deepEqual(v.normalizeGroundingSettingsV665({enabled:true,strength:-200,transitionMs:-90}),{enabled:true,strength:0,transitionMs:120});
 assert.deepEqual(v.normalizeGroundingSettingsV665({enabled:true,strength:200,transitionMs:2000}),{enabled:true,strength:100,transitionMs:800});
 for(const x of [null,{},[],false,1,'no'])assert.equal(v.normalizeGroundingSettingsV665(x).enabled,false);
});
test('settings fail closed when storage is blocked',()=>{const old=global.window;global.window={localStorage:{getItem(){throw new Error('blocked');},setItem(){throw new Error('quota');}},dispatchEvent(){throw new Error('should never happen');}};try{assert.equal(v.refreshGroundingSettingsV665().enabled,false);assert.equal(v.writeGroundingSettingsV665({enabled:true}),false);assert.equal(v.readGroundingSettingsV665().enabled,false);}finally{global.window=old;v.refreshGroundingSettingsV665();}});
test('read/write explicit preferences safely',()=>{const old=global.window;const storage=new Map();global.Event=global.Event||class Event{constructor(type){this.type=type}};global.window={localStorage:{getItem:key=>storage.get(key)||null,setItem:(key,val)=>storage.set(key,val)},dispatchEvent() {}};try{assert(v.writeGroundingSettingsV665({enabled:true,strength:41,transitionMs:520}));assert.equal(v.refreshGroundingSettingsV665().strength,41);}finally{global.window=old;v.refreshGroundingSettingsV665();}});
for(const [name,patch] of Object.entries({paused:{playing:false},reduced:{reducedMotion:true},manual:{manualPriority:true},low:{quality:'low'},
 notIK:{footIKEnabled:false},unknown:{contactKnown:false},track:{trackId:''},model:{modelId:''},badTime:{seconds:NaN},negative:{seconds:-1},
 badDt:{delta:NaN},gap:{delta:.2},still:{settings:{enabled:true,strength:0,transitionMs:320}},disabled:{settings:{enabled:false,strength:70,transitionMs:320}},
 invalidPose:{poseDepth:NaN}}))test(`${name} bypass and state reset`,()=>{const original=base(),state=step().state,out=step(state,original,patch);assert.strictEqual(out.motion,original);assert.deepEqual(out.state,v.newGroundingStateV665());});
test('free feet remain entirely unchanged',()=>{const b=base(),o=step(v.newGroundingStateV665(),b);assert(o.active);assert.deepEqual(o.motion,b);});
test('single planted foot damps generated movement, never lifts',()=>{const a=step(v.newGroundingStateV665(),base(),{plantedLeft:true});assert(a.motion.footStep<base().footStep&&a.motion.weightShift<base().weightShift);});
test('both feet planted stabilizes more than one',()=>{const one=step(v.newGroundingStateV665(),base(),{plantedLeft:true}),both=step(v.newGroundingStateV665(),base(),{plantedLeft:true,plantedRight:true});for(const key of ['footStep','weightShift','legGroove'])assert(Math.abs(both.motion[key])<Math.abs(one.motion[key]));});
test('planted contact immediately damps without release lag',()=>{const s=step().state;const a=step(s,base(),{seconds:10.016,plantedRight:true});assert(a.motion.footStep<base().footStep);});
test('release from planted support is smooth but direct planting is immediate',()=>{
 const standing=step(v.newGroundingStateV665(),base(),{plantedLeft:true,plantedRight:true});
 const released=step(standing.state,base(),{seconds:10.016});
 assert(released.state.support>0&&released.state.support<1);
 assert(released.motion.footStep<base().footStep);
 let last=released.state.support,st=released.state;
 for(let i=2;i<150;i++){
  const o=step(st,base(),{seconds:10+i/60});
  assert(o.state.support<=last+1e-10);last=o.state.support;st=o.state;
 }
 assert(last<.0001);
 const replanted=step(st,base(),{seconds:12.5,plantedRight:true});
 assert(replanted.state.support>=.6);
});
test('invalid input settings cannot introduce NaN',()=>{
 const original=base();for(const settings of [
  {enabled:true,strength:Infinity,transitionMs:320},{enabled:true,strength:50,transitionMs:NaN}
 ]){const out=step(v.newGroundingStateV665(),original,{settings});assert.equal(out.active,false);assert.strictEqual(out.motion,original);}
});
test('no fictional crouch when pose cue has no selected clip',()=>{const a=step(v.newGroundingStateV665(),base(),{poseDepth:.55,poseClipActive:false});assert.equal(a.depth,0);assert.deepEqual(a.motion,base());});
test('actual low-pose selection transitions smoothly, not instant',()=>{const a=step(v.newGroundingStateV665(),base(),{poseDepth:.6,poseClipActive:true});assert(a.depth>0&&a.depth<.6);assert(a.motion.weightShift<base().weightShift);assert.equal(a.motion.expressionJaw,base().expressionJaw);});
test('transition converges smoothly in both directions',()=>{let state=v.newGroundingStateV665(),last=0;for(let i=0;i<120;i++){const a=step(state,base(),{seconds:10+i/60,poseDepth:.6,poseClipActive:true});assert(a.depth>=last-1e-10);last=a.depth;state=a.state;}assert(last>.58);for(let i=0;i<120;i++){const a=step(state,base(),{seconds:12+i/60,poseDepth:0,poseClipActive:false});assert(a.depth<=last+1e-10);last=a.depth;state=a.state;}assert(last<.01);});
test('song change resets old pose depth',()=>{const a=step(v.newGroundingStateV665(),base(),{poseDepth:.6,poseClipActive:true});const b=step(a.state,base(),{trackId:'another',seconds:1});assert.equal(b.depth,0);});
test('model change and seek clear prior pose interpolation',()=>{let a=step(v.newGroundingStateV665(),base(),{poseDepth:.6,poseClipActive:true});for(const c of [{modelId:'new'},{seconds:2},{seconds:12}])assert.equal(step(a.state,base(),c).depth,0);});
test('head, face, arms, vocals, beat not touched',()=>{const original=base();const a=step(v.newGroundingStateV665(),original,{plantedLeft:true,plantedRight:true,poseDepth:.5,poseClipActive:true});for(const key of ['headNod','headTurn','shoulderRoll','followThrough','headLag','chestPulse','armSwing','beatImpulse','expressionJaw','expressionBrow','expressionEyeNarrow','expressionHeadTilt'])assert.equal(a.motion[key],original[key],key);});
test('no amplification of any modified channels regardless of sign',()=>{let st=v.newGroundingStateV665();for(let i=0;i<500;i++){const source=base();for(const key of ['footStep','legGroove','weightShift','hipSway','spineSway','hipCounter'])source[key]=Math.sin(i*.83)*.8;const o=step(st,source,{seconds:10+i/60,plantedLeft:i%3===0,plantedRight:i%4===0,poseClipActive:true,poseDepth:i%10/20});st=o.state;for(const key of ['footStep','legGroove','weightShift','hipSway','spineSway','hipCounter'])assert(Math.abs(o.motion[key])<=Math.abs(source[key])+1e-10,key);}});
test('absent optional values remain absent',()=>{const src=base();delete src.hipCounter;delete src.footStep;const o=step(v.newGroundingStateV665(),src,{plantedLeft:true});assert.equal(o.motion.hipCounter,undefined);assert.equal(o.motion.footStep,undefined);});
test('invalid motion fails closed instead of NaN',()=>{for(const key of ['footStep','legGroove','weightShift','hipSway','spineSway','hipCounter']){const src=base();src[key]=NaN;const a=step(v.newGroundingStateV665(),src);assert.strictEqual(a.motion,src);assert(!a.active);}});
test('input and previous state remain unmodified',()=>{const source=base(),s=v.newGroundingStateV665(),inp=full({plantedLeft:true});const snap=JSON.stringify([source,s,inp]);const a=v.stepRealisticGroundingV665(s,source,inp);assert(a.active);assert.equal(JSON.stringify([source,s,inp]),snap);assert.notStrictEqual(a.motion,source);});
test('deterministic under seek and replay',()=>{const s=step(v.newGroundingStateV665(),base(),{poseDepth:.3,poseClipActive:true}).state;assert.deepEqual(step(s,base(),{seconds:10.016,poseDepth:.4,poseClipActive:true}),step(s,base(),{seconds:10.016,poseDepth:.4,poseClipActive:true}));});
test('15k GLB scenes bounded and finite',()=>{let st=v.newGroundingStateV665();for(let i=0;i<15000;i++){const result=step(st,base(),{seconds:10+i/60,poseDepth:(i%60)/120,poseClipActive:true,plantedLeft:i%7<3,plantedRight:i%11<5});st=result.state;for(const key of ['footStep','legGroove','weightShift','hipSway','spineSway'])assert(Number.isFinite(result.motion[key]));assert(result.depth>=0&&result.depth<=.65);}});
test('wired into existing final additive GLB pass before original IK',()=>{const src=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');assert(src.includes('stepRealisticGroundingV665('));assert(src.includes('selectedClip===lowClipV481&&!!actions[lowClipV481]'));assert(src.indexOf('stepGlbFootworkQualityV596(')<src.indexOf('stepRealisticGroundingV665('));assert(src.indexOf('stepRealisticGroundingV665(')<src.indexOf('stepGenreDanceV666('));assert(src.indexOf('stepGenreDanceV666(')<src.indexOf('filterMotionDebugLayers(advancedRapV685'));assert(src.indexOf('filterMotionDebugLayers(advancedRapV685')<src.indexOf('updateFootGrounding({'));assert.equal((src.match(/updateFootGrounding\(\{/g)||[]).length,1);});
test('V665 preferences are included in portable settings backup',()=>{
 const backup=load('services/settings/unifiedBackup');
 assert.equal(backup.groupForBackupKey(v.GROUNDING_SETTINGS_KEY_V665),'avatar');
 const entry=JSON.stringify({enabled:true,strength:70,transitionMs:320});
 const storage={length:1,key:()=>v.GROUNDING_SETTINGS_KEY_V665,getItem:()=>entry};
 assert.equal(backup.createUnifiedBackup(storage).entries[v.GROUNDING_SETTINGS_KEY_V665],entry);
});
test('one opt-in control in existing natural dance settings',()=>{const src=fs.readFileSync('components/visualizer/NaturalDanceControlsV320.tsx','utf8');assert(src.includes('change665({enabled:e.target.checked})'));assert(src.includes('V665 · Realistic Dance Grounding'));assert(src.includes('writeGroundingSettingsV665'));});
test('portable settings backup includes V665 calibration preferences',()=>{const src=fs.readFileSync('services/settings/unifiedBackup.ts','utf8');assert(src.includes('\"sonic-realistic-dance-grounding-v665\":\"avatar\"'));});
console.log('PASS V665 grounding regression:',n,'test groups, 15,000 scene samples');
