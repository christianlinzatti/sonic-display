'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedGroupV517:plan,groupPhrasePulseV517:pulse}=load('components/visualizer/advancedGroupPerformanceV517');
const pos=count=>Array.from({length:count},(_,i)=>[(i-(count-1)/2)*1.75,0,0]);
const form=(count,lead=0,moment='verse')=>({active:true,lead,moment,slots:Array.from({length:count},(_,i)=>({slot:i}))});
const cast=(count,lead=1,role='lead')=>({active:true,role,lineIndex:2,leadSlot:lead,
 singingSlots:role==='hook'?Array.from({length:count},(_,i)=>i):[lead],
 startMs:1000,endMs:5000,handoffFrom:null,phase:1,source:'word-timed',count});
const base={count:4,trackId:'track-deutschrap',seconds:2.75,progressMs:2750,bpm:132,
 positions:pos(4),playing:true,reducedMotion:false,manualPriority:false,
 tier:'high',beat:.7,energy:.65,section:'verse',formation:form(4,1)};
const visual=plan(base);
assert(visual.active&&visual.source==='visual-only'&&visual.lead===1&&visual.scene==='verse');
assert.equal(visual.slots[0].role,'background');
assert(visual.slots.some(x=>x.look.yaw!==0)&&visual.slots.some(x=>x.turnY!==0));
assert.deepEqual(plan(base),visual,'stateless seek should be deterministic');
const singer=cast(4,2,'feature');
const authored=plan({...base,cue:singer,cueTrackId:base.trackId,formation:null});
assert(authored.active&&authored.source==='authored-singer'&&authored.lead===2&&authored.scene==='feature');
assert(authored.slots[2].role==='lead'&&authored.slots[0].role==='support');
assert(authored.slots.every(x=>x.turnY===0),'authored vocalist never turns stage root');
for(const wrong of [{cueTrackId:'other-track'},{cueTrackId:undefined},
 {progressMs:990},{progressMs:5000},{cue:{...singer,count:2}},
 {cue:{...singer,leadSlot:8}},{cue:{...singer,singingSlots:[0]}},
 {cue:{...singer,singingSlots:[2,2]}},{cue:{...singer,endMs:1000}},
 {cue:{...singer,role:'rapper'}}]){
 const result=plan({...base,cue:singer,cueTrackId:base.trackId,...wrong});
 assert(!result.active,'invalid singer evidence must NOT fall back to a visual identity: '+JSON.stringify(wrong));
}
const duet={...base,count:2,positions:pos(2),formation:null,cueTrackId:base.trackId,
 cue:cast(2,0,'lead')};
const duo=plan(duet);
assert(duo.active&&duo.slots.length===2&&duo.slots.every(x=>x.turnY===0),'duo only gaze and accents');
assert(!plan({...duet,cue:null}).active,'two-person show needs explicit singer evidence');
const handoff=plan({...duet,progressMs:1280,cue:{...duet.cue,handoffFrom:1}});
assert(handoff.active&&handoff.scene==='handoff'&&handoff.lead===0);
assert(handoff.slots.every(x=>x.turnY===0));
const hook=plan({...duet,cue:cast(2,0,'hook')});
assert(hook.active&&hook.scene==='hook'&&hook.slots.every(x=>x.role==='chorus'&&x.look.yaw===0),
 'all assigned chorus members face the audience');
assert(!plan({...duet,cue:{...cast(2,0,'hook'),singingSlots:[0]}}).active,
 'partial hook assignment is not a recorded full chorus');
const drop=plan({...base,formation:form(4,0,'drop')});
assert(drop.active&&drop.scene==='drop'&&drop.slots.every(x=>x.look.yaw===0));
for(const wrong of [{trackId:''},{playing:false},{reducedMotion:true},{manualPriority:true},
 {tier:'low'},{count:5},{count:1},{seconds:-1},{seconds:NaN},
 {progressMs:NaN},{beat:NaN},{energy:Infinity},
 {positions:[[NaN,0,0],...pos(4).slice(1)]},{formation:form(3,0,'verse')},
 {formation:{...form(4),active:false}}]){
 assert(!plan({...base,...wrong}).active,'no motion without valid stage evidence: '+JSON.stringify(wrong));
}
const risky=plan({...base,risks:Array.from({length:4},()=>({risk:1,gestureScale:.3,accentScale:.2}))});
assert(risky.active&&risky.slots.every(s=>s.gesture.intensity===0&&s.gesture.leftLift===0&&s.turnY===0),
 'real V506/V508 collision risk suppresses optional V517 accents');
assert(plan({...base,tier:'balanced'}).slots.reduce((a,x)=>a+x.gesture.intensity,0)<
  visual.slots.reduce((a,x)=>a+x.gesture.intensity,0));
assert.equal(pulse(NaN,3,0),0);assert.equal(pulse(1,0,0),0);
assert.equal(pulse(4,4,0),pulse(0,4,0));
let cases=0,nonzero=0;
for(let k=0;k<38000;k++){
 const n=2+k%3,leader=(k>>7)%n,hookScene=k%11===0;
 const singerCast=cast(n,leader,hookScene?'hook':k%7===0?'feature':'lead');
 const authoredMode=k%5===0||n===2;
 const input={...base,count:n,seconds:k*.041,progressMs:1000+k%3900,
   positions:pos(n),formation:form(n,leader,k%17===0?'drop':hookScene?'hook':'verse'),
   cue:authoredMode?singerCast:null,cueTrackId:authoredMode?base.trackId:undefined,
   tier:k%3===0?'balanced':'high',beat:(k%97)/96,energy:(k%101)/100,
   risks:Array.from({length:n},(_,i)=>({risk:(k+i)%37===0?.8:0,gestureScale:1,accentScale:1}))};
 const result=plan(input);
 assert(result.active&&result.slots.length===n);
 for(const s of result.slots){
   assert(Number.isFinite(s.phase)&&Number.isFinite(s.look.yaw)&&Number.isFinite(s.gesture.intensity));
   assert(Math.abs(s.look.yaw)<=.065+1e-12&&Math.abs(s.turnY)<=.029+1e-12);
   assert(s.gesture.leftLift<=.024&&s.gesture.rightLift<=.024&&s.gesture.intensity<=.045);
   if(authoredMode)assert(s.turnY===0);
   if(s.gesture.intensity>0)nonzero++;
 }
 cases++;
}
assert(nonzero>100,'different performers should take real, bounded accents');
const groupSrc=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
const duoSrc=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
assert(groupSrc.includes('groupV517=planAdvancedGroupV517')&&
 groupSrc.includes('cue:selectedSingerV444')&&groupSrc.includes('formation:formationV495')&&
 groupSrc.indexOf('groupV517=planAdvancedGroupV517')>groupSrc.indexOf('collisionSlotsV508=Array.from'),
 '3/4-person system uses timed authored roles OR visual-only leader, with measured risk');
assert(duoSrc.includes('groupDuoV517=planAdvancedGroupV517')&&
 duoSrc.includes('cue:liveSingerCueV416')&&
 duoSrc.indexOf('groupDuoV517=planAdvancedGroupV517')>duoSrc.indexOf('motionDuoV508=planAnimatedCollisionV508')&&
 !duoSrc.includes('safeEnsembleTravelV517'),'duet never gets extra root travel');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=517,'V517 is preserved in the current release');
assert(pkg.scripts['build:preflight'].includes('npm run test:v517 && npm run test:v517:types && npm run test:v516')); 
console.log(`PASS V517 Advanced Group Performance Director: ${cases} ensemble/Deutschrap duet frames, manual cast evidence, chorus/front-facing, risk gating`);
