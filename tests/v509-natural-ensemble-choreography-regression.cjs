'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planNaturalEnsembleV509:plan,ensemblePulseV509:pulse,safeEnsembleTravelV509:travel}=
  load('components/visualizer/naturalEnsembleChoreographyV509');
const form=(count,lead=0,moment='verse')=>({active:true,moment,lead,slots:Array.from({length:count},(_,slot)=>({
  slot,role:slot===lead?'lead':'background',offsetZ:0,turnY:0,leftLift:0,
  rightLift:0,shoulder:0,lookYaw:0,intensity:.4,
}))});
const positions=count=>Array.from({length:count},(_,i)=>[(i-(count-1)/2)*1.55,0,0]);
const base={mode:'automatic-group',count:4,trackId:'track-A',seconds:14.25,bpm:140,
  positions:positions(4),playing:true,reducedMotion:false,manualPriority:false,
  tier:'high',beat:.65,energy:.7,footLocked:false,formation:form(4)};
const normal=plan(base);
assert(normal.active&&normal.slots.length===4&&normal.kind==='verse');
assert(normal.slots.every((slot,i)=>slot.slot===i&&Math.abs(slot.turnY)<=.052&&
  Math.abs(slot.offsetZ)<=.053&&Math.abs(slot.gesture.leftLift)<=.022));
assert(normal.slots.some(s=>s.phase>0),'musical stagger must produce movement');
assert(normal.slots.some(s=>s.turnY!==0),'background actors acknowledge V495 visual lead');
assert.deepEqual(plan(base),plan(base),'pure deterministic planner');
assert(!plan({...base,trackId:''}).active);
assert(!plan({...base,playing:false}).active);
assert(!plan({...base,reducedMotion:true}).active);
assert(!plan({...base,manualPriority:true}).active);
assert(!plan({...base,tier:'low'}).active);
assert(!plan({...base,mode:'authored-duet'}).active);
assert(!plan({...base,count:5}).active);
assert(!plan({...base,seconds:NaN}).active);
assert(!plan({...base,positions:[[0,0,NaN],...positions(4).slice(1)]}).active);
assert(!plan({...base,formation:{...form(4),lead:-1}}).active);
assert(!plan({...base,formation:{...form(4),slots:[]}}).active);
assert(!plan({...base,formation:{...form(4),active:false}}).active);
assert(!plan({...base,footLocked:true}).slots.some(s=>s.offsetZ!==0));
const hooked=plan({...base,formation:form(4,1,'hook')});
assert(hooked.active&&hooked.kind==='hook'&&hooked.slots.every(s=>s.turnY===0),
  'hooks should stay audience facing');
const dropped=plan({...base,formation:form(4,2,'drop')});
assert(dropped.active&&dropped.kind==='drop');
const close=plan({...base,risks:Array.from({length:4},()=>({risk:.9,accentScale:.1,gestureScale:.2}))});
assert(close.slots.every(s=>s.offsetZ===0&&s.turnY===0&&
  s.gesture.leftLift===0&&s.gesture.rightLift===0),'near collisions suppress extra V509 accents');
const mid=plan({...base,tier:'balanced'});
assert(mid.slots.reduce((s,x)=>s+x.gesture.intensity,0)<
  normal.slots.reduce((s,x)=>s+x.gesture.intensity,0),'balanced less active than high');
const duetSlot=(intent)=>({intent,look:{yaw:0,pitch:0,eyeYaw:0,weight:0},
  gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0}});
const duet={mode:'authored-duet',count:2,trackId:'track-A',cueTrackId:'track-A',
  seconds:8.1,bpm:96,positions:positions(2),playing:true,reducedMotion:false,
  manualPriority:false,tier:'high',beat:.8,energy:.8,
  interaction:{active:true,kind:'duet',slots:[duetSlot('duet'),duetSlot('listener')]}};
const duetPlan=plan(duet);
assert(duetPlan.active&&duetPlan.slots.length===2&&
  duetPlan.slots.every(x=>x.offsetZ===0&&x.turnY===0),
  'authored duo gets facial/look/gesture accents only, never root movement');
assert(!plan({...duet,cueTrackId:'other-track'}).active,'never invent singer for another song');
assert(!plan({...duet,interaction:{...duet.interaction,active:false}}).active);
assert(!plan({...duet,manualPriority:true}).active);
assert(!plan({...duet,mode:'automatic-group'}).active);
assert(!plan({...duet,interaction:{...duet.interaction,slots:[duetSlot('listener'),duetSlot('listener')]}}).active);
const duetHook=plan({...duet,interaction:{active:true,kind:'hook',slots:[duetSlot('chorus'),duetSlot('chorus')]}});
assert(duetHook.active&&duetHook.kind==='hook'&&duetHook.slots.every(s=>s.offsetZ===0&&s.turnY===0),
  'verified two-singer hook is coordinated without extra stage travel');
assert.equal(pulse(NaN,2,0),0);
assert.equal(pulse(1,NaN,0),0);
assert(Math.abs(pulse(5,5,0)-pulse(0,5,0))<1e-10,'clock based phrase loops smoothly');
const grounded={active:true,phase:'walking',support:'none',gain:1,driftCm:1};
const slot={...normal.slots[0],offsetZ:.04};
assert(travel(slot,grounded,{risk:0,accentScale:1,gestureScale:1})>0);
for(const bad of [{...grounded,active:false},{...grounded,support:'both'},
 {...grounded,phase:'lowering'},{...grounded,phase:'rising'},
 {...grounded,phase:'low'},{...grounded,driftCm:5},
 {...grounded,gain:NaN}])assert.equal(travel(slot,bad,undefined),0);
assert.equal(travel(slot,undefined,undefined),0,'missing IK observation blocks travel');
assert.equal(travel(slot,grounded,{risk:.15,accentScale:.5,gestureScale:.5}),0,
  'V506 high risk vetoes travel even if V494 is open');
assert(Math.abs(travel({...slot,offsetZ:999},grounded,undefined))<=.02);
let iterations=0,maxRoot=0,maxTurn=0;
for(let k=0;k<36000;k++){
  const count=3+k%2,secs=k*.019,lead=Math.floor(k/270)%count;
  const caseInput={...base,count,seconds:secs,positions:positions(count),
    formation:form(count,lead,k%4===0?'hook':k%11===0?'drop':'verse'),
    beat:(k%73)/72,energy:(k%97)/96,risks:Array.from({length:count},(_,i)=>({
      risk:(k+i)%26===0?.8:0,accentScale:1,gestureScale:1}))};
  const result=plan(caseInput);
  assert(result.active&&result.slots.length===count);
  for(const s of result.slots){
    maxRoot=Math.max(maxRoot,Math.abs(s.offsetZ));maxTurn=Math.max(maxTurn,Math.abs(s.turnY));
    assert(Number.isFinite(s.phase)&&Number.isFinite(s.gesture.intensity));
    assert(Math.abs(s.offsetZ)<=.053+1e-9);
    assert(Math.abs(s.turnY)<=.052+1e-9);
    assert(Math.abs(travel(s,grounded,caseInput.risks[s.slot]))<=.02+1e-9);
  }
  iterations++;
}
assert(maxRoot>0&&maxTurn>0);
const groupSrc=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
const duoSrc=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
assert(groupSrc.includes("mode:'automatic-group'")&&groupSrc.includes('safeEnsembleTravelV509(')&&
  groupSrc.includes('+roleTravelV495+finalDepthV506+depthV509'),
  'automatic group wires real depth and active foot support');
assert(groupSrc.indexOf('ensembleV509=planNaturalEnsembleV509')>
  groupSrc.indexOf('collisionSlotsV508=Array.from'),
  'new choreography respects merged V506/V508 hazard results');
assert(duoSrc.includes("mode:'authored-duet'")&&
  duoSrc.indexOf('ensembleDuoV509=planNaturalEnsembleV509')<duoSrc.indexOf('collisionDuoV506='),
  'duo addition is softened by the existing V506/V508 collision layer');
assert(!duoSrc.includes('safeEnsembleTravelV509'),'no automatic duet root translation');
console.log('PASS V509 Natural Ensemble Choreography: 36,000 3/4-avatar frames, manual/vocal evidence guards, collision and foot IK');
