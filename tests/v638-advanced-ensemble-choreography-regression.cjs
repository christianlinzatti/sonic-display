'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAdvancedEnsembleV638:plan,safeEnsembleDepthV638:safe,ensemblePhraseV638:pulse}=load('components/visualizer/advancedEnsembleChoreographyV638');
const count=4;
const positions=[[-2.25,0,0],[-.75,0,0],[.75,0,0],[2.25,0,0]];
const zeroLook=()=>({yaw:0,pitch:0,eyeYaw:0,weight:0});
const stageLook=()=>({yaw:.018,pitch:0,eyeYaw:.005,weight:.04});
const zeroGesture=()=>({leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0});
const formation=(n=count,lead=1)=>({active:true,moment:'verse',lead,slots:Array.from({length:n},(_,slot)=>({slot}))});
const group=(n=count,scene='verse',source='visual-only',lead=1)=>({active:true,scene,source,lead,slots:Array.from({length:n},(_,i)=>({slot:i,role:i===lead?'lead':i%2===0?'support':'background',look:i===lead?zeroLook():stageLook(),gesture:zeroGesture(),turnY:0,phase:0}))});
const baseInput=(n=count,opts={})=>({base:group(n,'verse',n===2?'authored-singer':'visual-only',1),formation:formation(n),
 trackId:'confirmed-track',cueTrackId:'confirmed-track',count:n,seconds:13.2,progressMs:13200,bpm:128,
 positions:positions.slice(0,n),playing:true,reducedMotion:false,manualPriority:false,
 tier:'high',beat:.8,energy:.72,footLocked:false,genre:'deutschrap',
 risks:Array.from({length:n},()=>({risk:0,accentScale:1,gestureScale:1})),...opts});
const run=(n=count,diff={})=>plan(baseInput(n,diff));
const ground={active:true,phase:'moving',support:'left',gain:1,driftCm:0.1};
let tests=0,samples=0;
function test(label,fn){try{fn();tests++;}catch(error){error.message=`V638 ${label}: ${error.message}`;throw error;}}
function no(n=count,opts={}){assert.deepEqual(run(n,opts),{active:false,pattern:'off',source:'none',lead:-1,slots:[]});}
test('automatic four avatars produce an active coherent plan',()=>{const a=run();assert(a.active&&a.slots.length===4&&a.source==='visual-only');});
test('automatic three avatars are supported',()=>{const x=run(3,{positions:positions.slice(0,3),formation:formation(3),base:group(3)});assert(x.active&&x.slots.length===3);});
test('two artists require authored singer evidence',()=>{const x=run(2,{positions:positions.slice(0,2)});assert(x.active&&x.pattern==='duet-response');});
test('automatic two artists never invent a vocal lead',()=>no(2,{base:group(2,'verse','visual-only')}));
test('no inferred singer from an inactive group source',()=>no(4,{base:group(4,'verse','none')}));
test('verified singer assignment survives into output unchanged',()=>{const b=group(4,'feature','authored-singer',2);const x=run(4,{base:b});assert.equal(x.source,'authored-singer');assert.equal(x.lead,2);x.slots.forEach((s,i)=>assert.equal(s.role,b.slots[i].role));});
test('different vocal track must not stage a duet',()=>no(2,{cueTrackId:'other-song'}));
test('missing cue track must not stage a duet',()=>no(2,{cueTrackId:null}));
test('missing stage track always neutral',()=>no(4,{trackId:null}));
test('blank track never produces movement',()=>no(4,{trackId:'   '}));
test('authored singer cues cannot fall back to visual formation',()=>no(4,{base:group(4,'verse','authored-singer'),cueTrackId:'different'}));
test('visual ensemble demands existing V495 formation',()=>no(4,{formation:null}));
test('inactive V495 formation cannot stage avatars',()=>no(4,{formation:{...formation(),active:false}}));
test('V495 leader and V517 leader must agree',()=>no(4,{formation:formation(4,0)}));
test('V495 cast size must agree',()=>no(4,{formation:formation(3)}));
test('stage count must be bounded',()=>{for(const n of [-1,0,1,5,200,2.5,NaN])no(n,{count:n})});
test('group slot indices must match incoming count',()=>no(4,{base:{...group(),slots:group().slots.map((s,i)=>({...s,slot:i===2?3:i}))}}));
test('group lead index validated',()=>{for(const lead of [-1,4,NaN])no(4,{base:group(4,'verse','visual-only',lead),formation:formation(4,lead)})});
test('missing physical positions veto',()=>no(4,{positions:positions.slice(0,3)}));
test('NaN and Inf positions veto',()=>{for(const value of [NaN,Infinity,-Infinity])no(4,{positions:[...positions.slice(0,3),[value,0,0]]});});
test('stage playback disabled',()=>no(4,{playing:false}));
test('reduced motion disables extra choreography',()=>no(4,{reducedMotion:true}));
test('manual choreography remains authoritative',()=>no(4,{manualPriority:true}));
test('low power tier disables V638',()=>no(4,{tier:'low'}));
test('invalid audio beat or energy veto',()=>{for(const v of [-.1,1.01,NaN,Infinity]){no(4,{beat:v});no(4,{energy:v})}});
test('invalid song time veto',()=>{for(const value of [-1,NaN,Infinity]){no(4,{seconds:value});no(4,{progressMs:value})}});
test('separate playback clocks cannot mix',()=>{no(4,{seconds:24,progressMs:13200});no(4,{seconds:13.2,progressMs:0})});
test('seek and replay are deterministic',()=>{const x=run(4,{seconds:37.2,progressMs:37200});assert.deepEqual(x,run(4,{seconds:37.2,progressMs:37200}));});
test('song timestamps yield changing phrase patterns',()=>{const a=run(4,{seconds:5,progressMs:5000}),b=run(4,{seconds:11,progressMs:11000});assert.notDeepEqual(a.slots,b.slots);});
test('verse has lead counterpoint motif',()=>assert.equal(run().pattern,'lead-counterpoint'));
test('hooks alternate wings and unison on later phrase',()=>{const base=group(4,'hook');const a=run(4,{seconds:4,progressMs:4000,base});const b=run(4,{seconds:9,progressMs:9000,base});assert.equal(a.pattern,'alternating-wings');assert.equal(b.pattern,'unison-finale');});
test('drop scenes can use alternating wings with existing V517 authority',()=>assert.equal(run(4,{base:group(4,'drop')}).pattern,'alternating-wings'));
test('duet and chorus do not change stage roots',()=>{for(const scene of ['verse','hook','feature','handoff']){const x=run(2,{base:group(2,scene,'authored-singer',1)});assert(x.active);for(const s of x.slots){assert.equal(s.depthHintZ,0);assert.equal(s.turnY,0);assert.equal(s.look.yaw===0||Number.isFinite(s.look.yaw),true)}}});
test('authored four-performer cast does not relocate roots',()=>{const a=run(4,{base:group(4,'hook','authored-singer')});assert(a.active);for(const s of a.slots){assert.equal(s.depthHintZ,0);assert.equal(s.turnY,0)}});
test('foot-lock prevents extra stage travel at planning time',()=>{for(const s of run(4,{footLocked:true}).slots)assert.equal(s.depthHintZ,0)});
test('high risk suppresses new gestures and depth',()=>{const x=run(4,{risks:Array.from({length:4},()=>({risk:1,accentScale:0,gestureScale:0}))});assert(x.active);x.slots.forEach(s=>{assert.equal(s.gesture.intensity,0);assert.equal(s.depthHintZ,0);});});
test('collision risk suppresses per-actor depth',()=>{const r=Array.from({length:4},(_,i)=>({risk:i===0?.3:0,accentScale:1,gestureScale:1}));assert.equal(run(4,{risks:r}).slots[0].depthHintZ,0)});
test('malformed collision risk fails closed',()=>{for(const value of [NaN,Infinity,-.5,1.2]){const risk=Array.from({length:4},(_,i)=>({risk:i===0?value:0,accentScale:1,gestureScale:1}));const x=run(4,{risks:risk});assert.equal(x.slots[0].gesture.intensity,0);assert.equal(x.slots[0].depthHintZ,0);assert.equal(safe(x,x.slots[0],ground,risk[0]),0);}});
test('vocal near-look never invents a target',()=>{const a=run();assert.equal(a.slots[1].look.yaw,0);assert.equal(a.slots[1].look.weight,0);});
test('approved V517 existing gaze may be gently strengthened',()=>{const x=run();const possible=x.slots.filter(s=>s.slot!==1);assert(possible.some(s=>s.look.weight>0));for(const s of possible)assert(s.look.yaw>=0&&s.look.yaw<=.006)});
test('zero-weight look prevents new direction',()=>{const b=group();b.slots.forEach(s=>s.look={...stageLook(),weight:0});const x=run(4,{base:b});x.slots.forEach(s=>assert.equal(s.look.yaw,0));});
test('weaker balanced quality gives less group gesture amplitude',()=>{const a=run(),b=run(4,{tier:'balanced'});assert(b.slots.reduce((s,x)=>s+x.gesture.intensity,0)<a.slots.reduce((s,x)=>s+x.gesture.intensity,0));});
test('hardtekk gets more rhythmic reaction than deutschrap',()=>{const a=run(),b=run(4,{genre:'hardtekk'});assert(b.slots.reduce((s,x)=>s+x.gesture.intensity,0)>a.slots.reduce((s,x)=>s+x.gesture.intensity,0));});
test('no new gesture at exact phrase crest ends',()=>{assert.equal(pulse(0,5,0),0);assert.equal(pulse(5,5,0),0);assert(pulse(2.5,5,0)>.99)});
test('invalid phrase inputs safe and finite',()=>{for(const v of [NaN,Infinity,-1])assert.equal(pulse(v,5,0),0);assert.equal(pulse(1,0,0),0);});
test('phrase supports arbitrary seeking without state',()=>assert.equal(pulse(71,4.2,.23),pulse(71,4.2,.23)));
test('authorized group has contact-gated shallow depth',()=>{const x=run(4,{seconds:13,progressMs:13000});const v=x.slots.map(s=>safe(x,s,ground,{risk:0,accentScale:1,gestureScale:1}));assert(v.some(t=>t!==0));v.forEach(t=>assert(t>=-.014&&t<=.01));});
test('duet never obtains depth even with valid foot report',()=>{const x=run(2);x.slots.forEach(s=>assert.equal(safe(x,s,ground,undefined),0))});
test('absent and inactive contact reports prohibit depth',()=>{const x=run();x.slots.forEach(s=>{assert.equal(safe(x,s,null,null),0);assert.equal(safe(x,s,{...ground,active:false},null),0)})});
test('both planted feet prohibit depth',()=>{const x=run();x.slots.forEach(s=>assert.equal(safe(x,s,{...ground,support:'both'},null),0))});
test('kneeling and recovering phases prohibit depth',()=>{const x=run();for(const phase of ['lowering','low','rising'])for(const s of x.slots)assert.equal(safe(x,s,{...ground,phase},null),0)});
test('drift and untrusted gain prohibit travel',()=>{const x=run();for(const bad of [NaN,Infinity,4,-1])x.slots.forEach(s=>assert.equal(safe(x,s,{...ground,driftCm:bad},null),0));for(const bad of [NaN,Infinity])x.slots.forEach(s=>assert.equal(safe(x,s,{...ground,gain:bad},null),0));});
test('risk >= 0.12 prevents additional depth',()=>{const x=run();x.slots.forEach(s=>assert.equal(safe(x,s,ground,{risk:.12,accentScale:1,gestureScale:1}),0))});
test('low contact gain scales depth',()=>{const x=run();const slot=x.slots.find(s=>Math.abs(s.depthHintZ)>.00001);assert(slot);const full=safe(x,slot,ground,undefined);const half=safe(x,slot,{...ground,gain:.5},undefined);assert(Math.abs(half)<Math.abs(full));});
test('no input mutation',()=>{const input=baseInput();const original=JSON.stringify(input);const x=plan(input);assert(x.active);assert.equal(JSON.stringify(input),original)});
test('group runtime uses exactly its existing frame loop',()=>{const s=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');assert(s.includes('const ensembleV638=planAdvancedEnsembleV638('));assert(s.includes('safeEnsembleDepthV638(ensembleV638'));assert(s.includes('+depthV509+depthV638'));assert(s.includes('combineCrewGesturesV452('));assert.equal((s.match(/useFrame\(/g)||[]).length,1);});
test('duet runtime has no new root travel',()=>{const s=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');assert(s.includes('const duoEnsembleV638=planAdvancedEnsembleV638('));assert(s.includes('duoEnsembleV638.slots[0].gesture'));assert(!s.includes('safeEnsembleDepthV638'));});
test('planner has no new mixers, GLB writes, loops or network',()=>{const s=fs.readFileSync('components/visualizer/advancedEnsembleChoreographyV638.ts','utf8');for(const forbidden of ['useFrame(', 'fetch(', 'requestAnimationFrame(', 'setTimeout(', 'setInterval(', 'Math.random(', 'new AnimationMixer', 'Date.now('])assert(!s.includes(forbidden))});
for(let i=0;i<12000;i++){
 const n=2+i%3,ts=(i*0.073)%280;
 const source=n===2?'authored-singer':'visual-only',scene=['verse','hook','drop','handoff'][i%4];
 const x=run(n,{count:n,seconds:ts,progressMs:ts*1000,positions:positions.slice(0,n),
   base:group(n,scene,source,1),formation:formation(n),beat:(i%101)/100,energy:(i%83)/82,
   tier:i%3===0?'balanced':'high',genre:['deutschrap','hardtekk','rock'][i%3]});
 assert.equal(x.active,true);assert.equal(x.slots.length,n);
 for(const s of x.slots){
  const values=[...Object.values(s.gesture),...Object.values(s.look),s.turnY,s.depthHintZ,s.phase];
  assert(values.every(Number.isFinite));assert(Math.abs(s.turnY)<=.00301);
  assert(s.depthHintZ>=-.04901&&s.depthHintZ<=.03101);
  assert(s.gesture.leftLift<=.022001&&s.gesture.rightLift<=.022001);
  assert(s.gesture.intensity<=.038001);assert(s.look.weight<=.014001);
  if(source==='authored-singer')assert.equal(s.depthHintZ,0);
  const travel=safe(x,s,ground,{risk:0,accentScale:1,gestureScale:1});
  assert(Number.isFinite(travel)&&travel>=-.014001&&travel<=.010001);
 }
 samples++;
}
test('12,000 sampled ensemble decisions are finite and bounded',()=>assert.equal(samples,12000));
console.log(`PASS V638: ${tests} regression groups, ${samples} simulated 2–4-actor ensemble states, runtime wiring and contact safety`);
