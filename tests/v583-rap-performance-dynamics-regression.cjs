'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planRapPerformanceDynamicsV583:plan,selectRapDynamicsMotifV583:motif}=load('components/visualizer/rapPerformanceDynamicsV583');
const {resolveVocalDanceAccentV472:base}=load('components/visualizer/vocalAwareChoreographyV472');
let passed=0;
function test(name,fn){try{fn();passed++;}catch(e){e.message=`V583 ${name}: ${e.message}`;throw e;}}
const mkWords=(text,start,interval)=>text.split(' ').map((word,index)=>({text:word,startMs:start+index*interval,endMs:start+index*interval+Math.min(130,interval*.8)}));
const lyrics={synced:true,lines:[
 {text:'Das ist der ruhige Einstieg',startMs:1000,endMs:4600,words:mkWords('Das ist der ruhige Einstieg',1300,650)},
 {text:'Und jetzt komme ich mit all den schnellen Worten',startMs:4800,endMs:6750,words:mkWords('Und jetzt komme ich mit all den schnellen Worten',4880,210)},
 {text:'Hook gemeinsam alle stehen zusammen',startMs:7000,endMs:9400,words:mkWords('Hook gemeinsam alle stehen zusammen',7120,430)},
 {text:'(Hey)',startMs:9600,endMs:10400,words:[{text:'Hey',startMs:9700,endMs:10050}]},
 {text:'Neue ruhige Zeile ohne einzelne Worte',startMs:11000,endMs:13600},
]};
const defaults={lyrics,trackId:'track-583-demo',slot:0,playing:true,rap:true,reducedMotion:false,authored:false,performanceTier:'high',section:'verse',offsetMs:0};
function sample(at,adjust={}){
 const arg={...defaults,...adjust,progressMs:at};
 const accent=base({lyrics:arg.lyrics,progressMs:at,playing:arg.playing,rap:arg.rap,
   reducedMotion:arg.reducedMotion,slot:arg.slot,section:arg.section,offsetMs:arg.offsetMs,
   authored:arg.authored,strength:.9});
 return {accent,result:plan(accent,arg)};
}
test('timed relaxed line',()=>{const x=sample(2400);assert(x.result.active);assert.equal(x.result.mode,'relaxed');assert.equal(x.result.evidence,'word-timestamps');});
test('timed dense line',()=>{const x=sample(5950);assert(x.result.active);assert.equal(x.result.mode,'dense');assert.equal(x.result.evidence,'word-timestamps');});
test('real pace change, not invented',()=>{const x=sample(5000);assert.equal(x.result.mode,'flow-transition');});
test('hook uses existing stage cue',()=>{const x=sample(8300,{section:'hook'});assert.equal(x.result.mode,'hook');});
test('hook does not infer a singer',()=>{const x=sample(8300,{section:'hook'});assert.equal(x.result.accent.role,x.accent.role);});
test('adlib is explicitly formatted text candidate',()=>{const x=sample(9970);assert.equal(x.result.mode,'adlib-text');assert.equal(x.result.evidence,'line-timestamp');});
test('no adlib vocal stem inference',()=>{const x=sample(9970);assert.equal(x.result.accent.role,x.accent.role);assert.equal(x.result.accent.confidence,x.accent.confidence);});
test('line only cannot claim fast flow',()=>{const x=sample(12200);assert.equal(x.result.mode,'verse');assert.equal(x.result.evidence,'line-timestamp');});
test('line index and word index preserved',()=>{const x=sample(5950);assert.equal(x.result.accent.lineIndex,x.accent.lineIndex);assert.equal(x.result.accent.wordIndex,x.accent.wordIndex);assert.equal(x.result.accent.source,x.accent.source);});
test('no mutation of original',()=>{const x=sample(5950);assert.notStrictEqual(x.result.accent,x.accent);assert.deepEqual(x.accent,base({lyrics,progressMs:5950,playing:true,rap:true,reducedMotion:false,slot:0,section:'verse',offsetMs:0,strength:.9}));});
test('source unchanged when inactive',()=>{const x=sample(0);assert.equal(x.result.active,false);assert.strictEqual(x.result.accent,x.accent);});
test('inactive background retains pointer',()=>{const x=sample(5950);const background={...x.accent,role:'background'};assert.strictEqual(plan(background,{...defaults,progressMs:5950}).accent,background);});
const gateValues=[
 ['paused',{playing:false}],['non rap',{rap:false}],['reduced motion',{reducedMotion:true}],
 ['manual timeline',{authored:true}],['low tier',{performanceTier:'low'}],
 ['unknown track',{trackId:''}],['no lyrics',{lyrics:null}],['unsynced lyrics',{lyrics:{...lyrics,synced:false}}],
 ['invalid progress',{progressMs:NaN}],['invalid slot',{slot:-1}],['slot beyond performer range',{slot:4}],
 ['fractional slot',{slot:.5}],['invalid offset',{offsetMs:Infinity}],['extreme offset',{offsetMs:4000}],
 ];
for(const [name,gates] of gateValues)test(`safe fallback ${name}`,()=>{
 const x=sample(5950);const input={...defaults,progressMs:5950,...gates};
 const z=plan(x.accent,input);assert.equal(z.active,false);assert.strictEqual(z.accent,x.accent);
});
for(const at of [0,999,4600,6750,6850,9400,10500,14500])test(`inactive gap ${at}`,()=>{
 const x=sample(at);assert.equal(x.result.active,false);assert.strictEqual(x.result.accent,x.accent);
});
for(const slot of [0,1,2,3])test(`bounded performer ${slot}`,()=>{
 for(const [ms,section] of [[2500,'verse'],[5000,'verse'],[6200,'verse'],[8400,'hook'],[9950,'verse']]){
  const x=sample(ms,{slot,section});assert(x.result.active);
  for(const k of ['head','chest','arms'])assert(Number.isFinite(x.result.accent[k])&&x.result.accent[k]>=0&&x.result.accent[k]<=({head:.055,chest:.09,arms:.11}[k]));
  assert(Math.abs(x.result.headTurn)<=.00701&&Math.abs(x.result.torsoSway)<=.00701);
 }
});
for(const slot of [0,1,2,3])test(`neighbor motif rotation slot ${slot}`,()=>{
 let prior='';for(let index=0;index<90;index++){const current=motif('track-583-demo',index,slot);assert(current!=='none');assert.notEqual(current,prior);prior=current;}
});
test('distinct same-line performers',()=>assert.equal(new Set([0,1,2,3].map(slot=>motif('track-583-demo',4,slot))).size,4));
test('same time and cast always deterministic',()=>assert.deepEqual(sample(5950).result,sample(5950).result));
test('seek forward and backward reproducible',()=>{const original=sample(5950).result;sample(9850);sample(11050);assert.deepEqual(sample(5950).result,original);});
test('phrase onset fades in',()=>{const first=sample(4881);const early=first.result;const late=sample(5150).result;assert(early.active&&late.active);assert(Math.abs(early.accent.arms-first.accent.arms)<.001);});
test('bounded adjacent-frame envelope',()=>{
 let prev=null;
 for(let ms=4900;ms<6100;ms+=10){const current=sample(ms);if(!current.result.active)continue;
 const offset=current.result.accent.arms-current.accent.arms;
 if(prev!==null)assert(Math.abs(offset-prev)<.022);prev=offset;}
});
test('adlib without timed words is not an invented high density rap',()=>{
 const x=sample(9950);assert.notEqual(x.result.mode,'dense');assert.equal(x.result.evidence,'line-timestamp');
});
const gltf=fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8');
const procedural=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
test('GLB live hook owns rap dynamics',()=>assert.match(gltf,/const dynamicRapV583=planRapPerformanceDynamicsV583\(vocalV472/));
test('GLB V516 receives dynamics',()=>assert.match(gltf,/synchronizeRapAccentV516\(dynamicRapV583\.accent/));
test('procedural live hook owns rap dynamics',()=>assert.match(procedural,/const rapDynamicsV583=planRapPerformanceDynamicsV583\(variationV474\.accent/));
test('procedural vocal receives dynamics',()=>assert.match(procedural,/coordinateRapDanceV526\(rapDynamicsV583\.accent/));
test('procedural offsets added once to upper body',()=>{assert.match(procedural,/variationV474\.headTurn\+rapDynamicsV583\.headTurn/);assert.match(procedural,/variationV474\.torsoSway\+rapDynamicsV583\.torsoSway/);});
test('no scheduling, network or new animation hooks',()=>assert.doesNotMatch(fs.readFileSync('components/visualizer/rapPerformanceDynamicsV583.ts','utf8'),/useFrame\(|requestAnimationFrame\(|setInterval\(|fetch\(/));
test('existing V474 remains in both renderer paths',()=>{assert.match(gltf,/resolveNaturalRapGestureV474\(enhanceRapAccentV473/);assert.match(procedural,/resolveNaturalRapGestureV474\(enhanceRapAccentV473/);});
console.log(`PASS V583: ${passed} rap dynamics, evidence, safety, no-repeat and live integration checks`);
