'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentRapDuetV500:plan}=load('components/visualizer/intelligentRapDuetPerformanceV500');
const positions=[[-2,0,0],[-.7,0,-.2],[.7,0,.2],[2,0,0]];
const cue={active:true,style:'solo',lineIndex:-1,leadSlot:1,partnerSlot:null,
 singingSlots:[1],handoffFrom:0,phase:1,emphasis:.8,startMs:1000,endMs:5000,source:'none',count:4};
const input={cue,trackId:'trackA',cueTrackId:'trackA',progressMs:2400,count:4,positions,
 playing:true,reducedMotion:false,manualPriority:false,beat:.8,strength:80,tier:'high'};
const sample=(patch={})=>plan({...input,...patch});
const solo=sample();
assert(solo.active&&solo.kind==='solo'&&solo.slots.length===4);
assert.equal(solo.slots[1].role,'singing');
assert.equal(solo.slots[0].role,'handoff');
assert.equal(solo.slots[2].role,'listening');
assert.equal(solo.slots[1].look.yaw,0,'lead keeps facing audience');
assert(solo.slots[0].look.yaw>0,'outgoing vocalist looks towards the new lead');
assert(solo.slots[2].look.yaw<0,'supporter faces new lead');
assert.deepEqual(sample(),solo,'deterministic for a fixed time and stage');
const frozen=JSON.stringify(input);sample();assert.equal(JSON.stringify(input),frozen,'never modify input refs');
const handoff=sample({progressMs:1010});
assert(handoff.slots[2].look.weight<solo.slots[2].look.weight,'fresh entrances are feathered');
const tail=sample({progressMs:4970});
assert(tail.slots[2].look.weight<solo.slots[2].look.weight,'end of segment is feathered');
const duet=sample({cue:{...cue,style:'duet',singingSlots:[1,2],partnerSlot:2,handoffFrom:null}});
assert(duet.active&&duet.kind==='duet');
assert.equal(duet.slots[1].role,'singing');
assert.equal(duet.slots[2].role,'singing');
assert(duet.slots[1].look.yaw>0&&duet.slots[2].look.yaw<0,'duet partners acknowledge one another');
const hook=sample({cue:{...cue,style:'hook',singingSlots:[0,1,2,3],handoffFrom:null}});
assert(hook.active&&hook.slots.every(x=>x.role==='chorus'&&x.look.weight===0),'hook keeps eyes toward the crowd');
const reply=sample({cue:{...cue,style:'reply',singingSlots:[1],handoffFrom:0,partnerSlot:0}});
assert(reply.active&&reply.slots[0].role==='handoff'&&reply.slots[0].look.yaw>0);
const duo=sample({cue:{...cue,count:2,leadSlot:0,singingSlots:[0],handoffFrom:null},count:2,
 positions:[[-1,0,0],[1,0,0]]});
assert(duo.active&&duo.slots.length===2&&duo.slots[1].look.yaw<0,'2-avatar stage also supported');
const trio=sample({cue:{...cue,count:3,singingSlots:[1]},count:3,positions:positions.slice(0,3)});
assert(trio.active&&trio.slots.length===3,'3-avatar stage also supported');
for(const patch of [
 {trackId:'other'},{cueTrackId:'other'},{trackId:''},{playing:false},
 {reducedMotion:true},{manualPriority:true},{progressMs:1000-1},{progressMs:5000},
 {progressMs:Infinity},{count:1},{count:5},{positions:[[0,0,0]]},
 {positions:[...positions.slice(0,3),[NaN,0,0]]},
 {cue:{...cue,active:false}},{cue:{...cue,singingSlots:[8]}},
 {cue:{...cue,count:3}},{cue:{...cue,startMs:5000,endMs:1000}},
 {cue:{...cue,style:'duet',partnerSlot:null}},{cue:{...cue,style:'hook',singingSlots:[1]}},
 {cue:{...cue,handoffFrom:8}},{strength:0},
 ]){
 const out=sample(patch);
 assert.deepEqual(out,{active:false,kind:'off',slots:[]},`invalid or protected: ${Object.keys(patch)}`);
}
const low=sample({tier:'low'}),balanced=sample({tier:'balanced'});
assert(low.slots[0].look.weight<balanced.slots[0].look.weight);
assert(balanced.slots[0].look.weight<solo.slots[0].look.weight);
const bounds=sample({cue:{...cue,startMs:1000,endMs:100000},progressMs:42750,beat:1,strength:100});
for(const slot of bounds.slots){
 const {look,gesture}=slot;
 assert(Math.abs(look.yaw)<=.42&&Math.abs(look.eyeYaw)<=.11&&look.weight<=1);
 assert(gesture.leftLift<=.35&&gesture.rightLift<=.35&&Math.abs(gesture.lean)<=.05);
}
// Long-running pure evaluation uses no state, timers or mixer resources.
for(let t=0;t<30*60*1000;t+=317){
 const c={...cue,startMs:t-t%4000,endMs:t-t%4000+4000};
 const p=sample({cue:c,progressMs:t});
 assert(p.active===true&&p.slots.length===4);
}
const group=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
const duoSrc=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
for(const [label,src] of [['group',group],['duo',duoSrc]]){
 assert(src.includes('planIntelligentRapDuetV500('),`${label} must run the V500 planner`);
 assert(src.includes('combineCrewGesturesV452(')&&src.includes('combineCrewLooksV452('),`${label} must use safe upper-body overlays`);
 assert(src.includes('timeCueV496.active?props.lipSync?.vocalTimeTrackIdV496:props.lipSync?.rapDuetTrackIdV416'),`${label} must guard against cross-track singer cues`);
 assert(src.includes('!!manualCueV385.active'),`${label} protects manual singer roles`);
 if(label==='group')assert(src.includes('manualPriority:(settings!==props.autoMultiArtistGroupV442&&!!settings.trackId)'),
   'automatic V442 groups have trackIds and MUST NOT be misclassified as manually authored V326 stages');
}
const planner=fs.readFileSync('components/visualizer/intelligentRapDuetPerformanceV500.ts','utf8');
for(const forbidden of ['useFrame(', 'setInterval(', 'window.', 'fetch(', 'new AnimationMixer', 'localStorage']){
 assert(!planner.includes(forbidden),`pure planner must not use ${forbidden}`);
}
console.log('PASS V500: editorial solo/reply/duet/hook, 2–4 performers, track safety, manual priority, bounds, 30min, both stages');
