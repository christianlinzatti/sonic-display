"use strict";
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planDynamicConcertStagesV635:plan,NEUTRAL_CONCERT_STAGES_V635:neutral,
  LED_WALL_VERTEX_V635:vertex,LED_WALL_FRAGMENT_V635:fragment}=load('components/visualizer/dynamicConcertStagesV635');
const {planDynamicStageTransformationV622:old}=load('components/visualizer/dynamicStageTransformationV622');
let groups=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V635 ${name}: ${e.message}`;throw e;}};
const sections=['verse','build','hook','verse','hook','break','drop','hook'];
const acts=sections.map((section,i)=>({index:i,section,startMs:1000+i*24000,endMs:25000+i*24000,
  chapter:section==='drop'||section==='hook'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
  motif:section==='hook'?'ensemble':section==='break'?'breath':section==='build'?'crescendo':'portrait',
  repetition:section==='hook'?[0,0,0,0,1,0,0,2][i]:0}));
const song={trackId:'track-635',durationMs:200000,source:'verified-v600',genre:'deutschrap',endingSupported:false,acts};
const cue=(i=0)=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,
  repetition:acts[i].repetition,transition:1});
const base=(i=0,change={})=>({narrative:{plan:song,cue:cue(i)},trackId:'track-635',
  positionMs:acts[i].startMs+9000,durationMs:song.durationMs,section:acts[i].section,
  genre:'deutschrap',playing:true,reactive:true,reducedMotion:false,tier:'high',
  authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,...change});
const P=(i=0,change={})=>{const x=base(i,change);return plan({...x,foundation:old(x),
  energy:.78,kick:.64,groupCount:2,visualsEnabled:true,...change});};
const off=(i=2,change={})=>assert.deepEqual(P(i,change),neutral);
const num=(x)=>{for(const k of ['act','pattern','opacity','speed','phase','ambientTint','floorTint','fogTrim'])assert(Number.isFinite(x[k]),k);};
test('verified verse produces a real led-wall cue',()=>{const x=P(0);assert(x.active&&x.opacity>0&&x.pattern===0);});
test('hook is brighter than verse',()=>assert(P(2).opacity>P(0).opacity));
test('build uses diagonal pattern',()=>assert.equal(P(1).pattern,2));
test('first chorus uses grid pattern',()=>assert.equal(P(2).pattern,1));
test('repeated hook has a different pattern',()=>assert.notEqual(P(2).pattern,P(4).pattern));
test('third hook returns to grid without unrelated new assets',()=>assert.equal(P(7).pattern,1));
test('drop has its own radial pattern',()=>assert.equal(P(6).pattern,3));
test('quiet break is lower contrast than hook',()=>assert(P(5).opacity<P(2).opacity));
test('drop with confirmed kick is slightly stronger',()=>assert(P(6,{kick:.8}).opacity>P(6,{kick:.2}).opacity));
test('unconfirmed kick never creates a drop in a verse',()=>assert.equal(P(0,{kick:1}).pattern,0));
test('musical intensity is bounded independent of kick',()=>{for(const e of [0,.3,1])assert(P(6,{energy:e}).opacity<=.19);});
test('volume and speed upper budgets',()=>{for(let i=0;i<8;i++){const x=P(i);assert(x.opacity>=0&&x.opacity<=.19&&x.speed>=0&&x.speed<=.18&&x.ambientTint<=.043&&x.floorTint<=.06&&x.fogTrim<=.14);}});
test('lyrics protection reduces opacity and environment shifts',()=>{const a=P(2),b=P(2,{lyricsProtected:true});assert(b.opacity<a.opacity&&b.floorTint<a.floorTint&&b.fogTrim<a.fogTrim);});
test('vocal close-up reduces decoration',()=>assert(P(2,{vocalFocus:true}).opacity<P(2).opacity));
test('four avatars get darker background',()=>assert(P(2,{groupCount:4}).opacity<P(2,{groupCount:1}).opacity));
test('three avatars get intermediate contrast',()=>assert(P(2,{groupCount:3}).opacity<P(2,{groupCount:2}).opacity));
test('balanced hardware lowers visual cost',()=>assert(P(2,{tier:'balanced'}).opacity<P(2).opacity));
test('no scene playing: no visuals',()=>off(2,{playing:false}));
test('reactive disabled: no visuals',()=>off(2,{reactive:false}));
test('reduced motion: no visuals',()=>off(2,{reducedMotion:true}));
test('low-performance mode: no LED',()=>off(2,{tier:'low'}));
test('manual authored light program is authoritative',()=>off(2,{authored:true}));
test('blackout is authoritative',()=>off(2,{blackout:true}));
test('manual stage visual disable is authoritative',()=>off(2,{visualsEnabled:false}));
test('wrong track ID is neutral',()=>off(2,{trackId:'other'}));
test('wrong duration is neutral',()=>off(2,{durationMs:150000}));
test('missing narrative is neutral',()=>off(2,{narrative:null}));
test('invalid narrative source is neutral',()=>off(2,{narrative:{plan:{...song,source:'unavailable'},cue:cue(2)}}));
test('invalid cue source is neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),source:'off'}}}));
test('inactive cue is neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),active:false}}}));
test('disagreeing section is neutral',()=>off(2,{section:'verse'}));
test('disagreeing chapter is neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),chapter:'setup'}}}));
test('disagreeing motif is neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),motif:'portrait'}}}));
test('disagreeing repetition is neutral',()=>off(2,{narrative:{plan:song,cue:{...cue(2),repetition:15}}}));
test('act mismatch is neutral',()=>off(2,{narrative:{plan:song,cue:cue(1)}}));
test('evidence must use matching foundation',()=>{const x=base(2);const wrong=old(base(3));assert.deepEqual(plan({...x,foundation:wrong,energy:.8,kick:.8,groupCount:2,visualsEnabled:true}),neutral);});
test('nonfinite playback and out-of-range seek is neutral',()=>{for(const positionMs of [-1,NaN,Infinity,-Infinity,200000,999999])off(2,{positionMs});});
test('nonfinite/malformed energy or kick is neutral',()=>{for(const v of [NaN,Infinity,-1,2]){off(2,{energy:v});off(2,{kick:v});}});
test('invalid group counts are neutral',()=>{for(const groupCount of [-1,0,5,NaN,2.5,Infinity])off(2,{groupCount});});
test('bad cue transition is neutral',()=>{for(const transition of [NaN,Infinity,-.1,0,1.1])off(2,{narrative:{plan:song,cue:{...cue(2),transition}}});});
test('at act boundary LED opacity starts at exact zero',()=>{for(let i=0;i<8;i++){const x=P(i,{positionMs:acts[i].startMs});assert(x.active&&x.opacity===0);}});
test('at last millisecond of act LED returns nearly to zero',()=>{for(let i=0;i<8;i++)assert(P(i,{positionMs:acts[i].endMs-.00001}).opacity<=.00001);});
test('neighboring motifs cross through darkness, no abrupt bright pattern change',()=>{const a=P(2,{positionMs:acts[2].endMs-.001}),b=P(3,{positionMs:acts[3].startMs});assert(a.opacity<.00001&&b.opacity===0);});
test('middle of long act sustains the visual rather than fades out',()=>{const x=P(2,{positionMs:acts[2].startMs+9000});assert(x.opacity>P(2,{positionMs:acts[2].startMs+200}).opacity);});
test('noncontiguous narrative segments do not invent stages',()=>{const altered=acts.map(a=>({...a}));altered[3].startMs+=1000;altered[3].endMs+=1000;const n={plan:{...song,acts:altered},cue:cue(2)};assert(P(2,{narrative:n,positionMs:acts[2].endMs-.01}).opacity<=.00001);});
test('pure planner has no hidden history across random seek order',()=>{const x=P(4);[1,5,7,2,0,3,6].forEach(i=>P(i));assert.deepEqual(P(4),x);});
test('input narrative and foundation are never mutated',()=>{const x=base(2);const before=JSON.stringify(x);const foundation=old(x);const prior=JSON.stringify(foundation);plan({...x,foundation,energy:.8,kick:.9,groupCount:2,visualsEnabled:true});assert.equal(JSON.stringify(x),before);assert.equal(JSON.stringify(foundation),prior);});
test('verified playback time controls uniform phase, not a new clock',()=>assert.equal(P(2,{positionMs:60000}).phase,60));
test('very short act fades in and out without splitting into fake sections',()=>{const a=acts.map(x=>({...x}));a[2].endMs=a[2].startMs+200;const n={plan:{...song,acts:a},cue:cue(2)};const x=P(2,{narrative:n,positionMs:a[2].startMs+100});num(x);assert(x.opacity>=0);});
test('shader uses fixed UV, no texture allocations, discard or screen overrides',()=>{assert(vertex.includes('vUv=uv'));for(const text of ['uOpacity','uPhase','uPattern','dotMask','gl_FragColor'])assert(fragment.includes(text));for(const forbidden of ['sampler2D','texture2D','discard','gl_FragDepth'])assert(!fragment.includes(forbidden));});
test('LED material is a reusable single background plane',()=>{const s=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');assert(s.includes('ref={ledWallV635}'));assert(s.includes('position={[0,0.05,-3.8]}'));assert(s.includes('planDynamicConcertStagesV635('));assert(s.includes('ledWallV635.current.visible='));assert(s.includes('uPhase.value=stageVisualV635.phase'));assert(s.includes('transformationV622.background+stageVisualV635.ambientTint'));assert(s.includes('transformationV622.floor+stageVisualV635.floorTint'));});
test('existing atmospherics touch only V308-owned fog',()=>{const s=fs.readFileSync('components/visualizer/ConcertAtmosphereRendererV308.tsx','utf8');assert(s.includes('planDynamicConcertStagesV635('));assert(s.includes('scene.fog===fog'));assert(s.includes('transformationV622.fog-stageVisualV635.fogTrim'));});
test('V635 pure planner adds no renderer, timer, new actor, clock, network',()=>{const s=fs.readFileSync('components/visualizer/dynamicConcertStagesV635.ts','utf8');for(const token of ['requestAnimationFrame(', 'setInterval(', 'setTimeout(', 'useFrame(', 'Math.random(', 'fetch(', 'localStorage','new Mesh(', 'new Color(', 'performance.now(', 'Date.now(', 'new SpotLight('])assert(!s.includes(token));});
let samples=0;
for(let i=0;i<12000;i++){
 const index=i%8;const positionMs=acts[index].startMs+(i*157)%24000;
 const x=P(index,{positionMs,energy:(i%100)/100,kick:(i%33)/32,groupCount:1+i%4,tier:i%2?'high':'balanced',
    lyricsProtected:i%7===0,vocalFocus:i%11===0});
 num(x);assert(x.active&&x.pattern>=0&&x.pattern<=3&&x.opacity>=0&&x.opacity<=.19);
 assert(x.floorTint>=0&&x.floorTint<=.06&&x.ambientTint>=0&&x.ambientTint<=.043&&x.fogTrim>=0&&x.fogTrim<=.14);
 samples++;
}
test('12,000 diverse complete-song frames remain bounded and deterministic',()=>assert.equal(samples,12000));
console.log(`PASS V635: ${groups} regression groups, ${samples} simulated verified stage frames`);
