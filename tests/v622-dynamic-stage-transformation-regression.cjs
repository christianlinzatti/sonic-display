"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planDynamicStageTransformationV622:plan,NEUTRAL_STAGE_TRANSFORMATION_V622:off}=load('components/visualizer/dynamicStageTransformationV622');
let passed=0;function test(name,fn){try{fn();passed++;}catch(e){e.message=`V622 ${name}: ${e.message}`;throw e;}}
const sections=['verse','build','hook','verse','hook','break','drop'];
const acts=sections.map((section,i)=>({index:i,section,startMs:1000+i*30000,endMs:31000+i*30000,
 chapter:section==='hook'||section==='drop'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
 motif:i===4?'ensemble':i===5?'breath':'portrait',repetition:i===4?1:0}));
const narrativePlan={source:'verified-v600',trackId:'song-v622',durationMs:220000,genre:'hardtekk',endingSupported:false,acts};
const cue=i=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,
 repetition:acts[i].repetition,transition:1});
function input(i=0,patch={}){return {narrative:{plan:narrativePlan,cue:cue(i)},
 trackId:'song-v622',positionMs:acts[i].startMs+10000,durationMs:220000,section:acts[i].section,
 genre:'hardtekk',playing:true,reactive:true,reducedMotion:false,tier:'high',authored:false,
 blackout:false,lyricsProtected:false,vocalFocus:false,...patch};}
const value=(i=0,patch={})=>plan(input(i,patch));
const near=(a,b,epsilon=.0001)=>assert(Math.abs(a-b)<epsilon,`${a} vs ${b}`);
test('confirmed cue produces stage mood',()=>{let x=value();assert(x.active);assert(x.background>0);});
test('verse is calmer than hook',()=>assert(value(0).accent<value(2).accent));
test('build warms before drop',()=>assert(value(1).tone>value(0).tone));
test('drop holds genre-specific cool ambience for hardtekk',()=>assert(value(6).tone<0));
test('hardstyle drop is warm',()=>assert(value(6,{genre:'hardstyle'}).tone>0));
test('rock verse warmer than hardtekk verse',()=>assert(value(0,{genre:'rock'}).tone>value(0).tone));
test('second hook varies first hook tone',()=>assert.notEqual(value(2).tone,value(4).tone));
test('break is quieter and more atmospheric',()=>assert(value(5).accent<value(2).accent&&value(5).fog>value(2).fog));
test('scene tint always bounded',()=>{for(let i=0;i<7;i++){const x=value(i);assert(x.background<=.16&&x.floor<=.18&&x.accent<=.82);}});
test('protecting dense lyrics reduces decoration',()=>{const a=value(2),b=value(2,{lyricsProtected:true});assert(b.background<a.background&&b.accent<a.accent);});
test('face focus reduces environment effects',()=>assert(value(2,{vocalFocus:true}).accent<value(2).accent));
test('balanced hardware lowers scene transformation',()=>assert(value(2,{tier:'balanced'}).background<value(2).background));
test('no narrative is neutral',()=>assert.deepEqual(value(2,{narrative:null}),off));
test('wrong track never transforms scene',()=>assert.deepEqual(value(2,{trackId:'other'}),off));
test('wrong duration never transforms scene',()=>assert.deepEqual(value(2,{durationMs:100000}),off));
test('paused means off',()=>assert.deepEqual(value(2,{playing:false}),off));
test('reactive toggle means off',()=>assert.deepEqual(value(2,{reactive:false}),off));
test('manual lighting means off',()=>assert.deepEqual(value(2,{authored:true}),off));
test('blackout means off',()=>assert.deepEqual(value(2,{blackout:true}),off));
test('reduced motion means off',()=>assert.deepEqual(value(2,{reducedMotion:true}),off));
test('low quality means off',()=>assert.deepEqual(value(2,{tier:'low'}),off));
test('wrong section cannot fake hook',()=>assert.deepEqual(value(2,{section:'verse'}),off));
test('inactive cue means off',()=>assert.deepEqual(value(2,{narrative:{plan:narrativePlan,cue:{...cue(2),active:false}}}),off));
test('unverified source means off',()=>assert.deepEqual(value(2,{narrative:{plan:{...narrativePlan,source:'unavailable'},cue:cue(2)}}),off));
test('invalid cue source means off',()=>assert.deepEqual(value(2,{narrative:{plan:narrativePlan,cue:{...cue(2),source:'off'}}}),off));
test('wrong cue act metadata means off',()=>{for(const k of [{act:7},{chapter:'setup'},{motif:'ensemble'},{repetition:5}])assert.deepEqual(value(2,{narrative:{plan:narrativePlan,cue:{...cue(2),...k}}}),off)});
test('invalid cue transition means off',()=>{for(const t of [-.1,1.1,NaN,Infinity])assert.deepEqual(value(2,{narrative:{plan:narrativePlan,cue:{...cue(2),transition:t}}}),off);});
test('invalid progress is off',()=>{for(const positionMs of [-5,NaN,Infinity,220000,300000])assert.deepEqual(value(2,{positionMs}),off);});
test('time gaps do not invent stage cues',()=>assert.deepEqual(value(2,{positionMs:acts[2].startMs-50}),off));
test('zero transition has no visible transform',()=>{const x=value(2,{narrative:{plan:narrativePlan,cue:{...cue(2),transition:0}}});assert(x.active);for(const k of ['accent','background','floor','fog'])assert.equal(x[k],0);});
test('pure input is not mutated',()=>{const x=input(2),before=JSON.stringify(x);plan(x);assert.equal(JSON.stringify(x),before);});
test('deterministic results after seeking',()=>{const before=value(4);value(0);value(6);value(1);assert.deepEqual(value(4),before);});
test('adjacent hook/verse boundaries interpolate continuously',()=>{
 const end=value(2,{positionMs:acts[2].endMs-.001});
 const begin=value(3,{positionMs:acts[3].startMs});
 near(end.tone,begin.tone,.00001);near(end.accent,begin.accent,.00001);near(end.background,begin.background,.00001);
});
test('noncontiguous act boundaries never crossfade',()=>{
 const altered=acts.map(a=>({...a}));altered[3].startMs+=200;altered[3].endMs+=200;
 const changed={...narrativePlan,acts:altered};
 const target={plan:changed,cue:{...cue(2)}};
 const before=value(2,{narrative:target,positionMs:acts[2].endMs-20});
 near(before.tone,value(2,{narrative:target,positionMs:acts[2].startMs+10000}).tone);
});
test('timing window ends well before next cue',()=>near(value(2,{positionMs:acts[2].startMs+3000}).tone,value(2,{positionMs:acts[2].startMs+10000}).tone));
test('all scene coefficients remain finite over complete simulated song',()=>{
 let examined=0;
 for(let i=0;i<7;i++)for(let t=acts[i].startMs;t<acts[i].endMs;t+=13){
   const x=value(i,{positionMs:t});for(const k of ['tone','accent','background','floor','fog','blend'])assert(Number.isFinite(x[k]));examined++;
 }
 assert(examined>15000);console.log(`V622 sampled ${examined} verified song frames`);
});
test('runtime integrates pure V622 plan in existing rigs',()=>{
 for(const name of ['DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx','ConcertDetailStageV555.tsx']){
  const s=fs.readFileSync(`components/visualizer/${name}`,'utf8');
  assert(s.includes('planDynamicStageTransformationV622('),name);
  assert(s.includes('transformationV622.'),name);
 }
});
test('existing stage models and shader counts unchanged',()=>{
 const d=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');assert(d.includes('<color attach="background"'));assert(d.includes('floorMaterialV622'));
 const m=fs.readFileSync('components/visualizer/ConcertDetailStageV555.tsx','utf8');assert(m.includes('uTint'));assert(m.includes('planPiConcertStageFxV602(baselineV601,piQualityV602)'));assert(m.includes('composeStageFxV621('));
});
test('fog transform only modifies owned stage fog',()=>{
 const s=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');assert(s.includes('scene.fog===fog'));assert(s.includes('fog.color.lerp('));
});
test('no new GLB assets lights clocks timers API or GPU materials',()=>{
 const s=fs.readFileSync('components/visualizer/dynamicStageTransformationV622.ts','utf8');
 for(const token of ['useFrame(', 'setInterval(', 'setTimeout(', 'Math.random(', 'fetch(', 'new Color(', 'new ShaderMaterial(', 'new SpotLight(', 'requestAnimationFrame(', 'localStorage'])assert(!s.includes(token),token);
});
console.log(`PASS V622 dynamic stage transformation: ${passed} regression groups`);
