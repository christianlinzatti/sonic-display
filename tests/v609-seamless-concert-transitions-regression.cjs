'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSeamlessConcertTransitionV609:plan,refineAutoGroupTransitionsV609:groupPlan}=load('components/visualizer/seamlessConcertTransitionsV609');
const {evaluateGroupV326}=load('components/visualizer/multiAvatarStageDirectorV326');
let groups=0;const test=(name,fn)=>{try{fn();groups++}catch(e){e.message=`V609 ${name}: ${e.message}`;throw e}};
const acts=[
 {index:0,startMs:0,endMs:32000,section:'verse',chapter:'setup',motif:'portrait',repetition:0},
 {index:1,startMs:32000,endMs:44000,section:'build',chapter:'rise',motif:'ensemble',repetition:0},
 {index:2,startMs:44000,endMs:70000,section:'hook',chapter:'payoff',motif:'wide',repetition:0},
 {index:3,startMs:70000,endMs:102000,section:'verse',chapter:'develop',motif:'dialogue',repetition:1},
 {index:4,startMs:102000,endMs:128000,section:'hook',chapter:'payoff',motif:'ensemble',repetition:1},
 {index:5,startMs:128000,endMs:138000,section:'break',chapter:'respite',motif:'breath',repetition:0},
 {index:6,startMs:138000,endMs:172000,section:'drop',chapter:'payoff',motif:'wide',repetition:0},
 {index:7,startMs:172000,endMs:206000,section:'hook',chapter:'ending-arc',motif:'crescendo',repetition:2},
];
const soundtrack={trackId:'track-v609',source:'verified-v600',durationMs:206000,acts,genre:'hardstyle',endingSupported:true};
const cue=n=>({source:'verified-v600',active:true,act:n,chapter:acts[n].chapter,motif:acts[n].motif,
 repetition:acts[n].repetition,transition:1,dynamics:{camera:1,lighting:1,dance:1,lyrics:1}});
const input=(n=2,patch={})=>({narrative:{plan:soundtrack,cue:cue(n)},trackId:soundtrack.trackId,
 positionMs:acts[n].startMs+500,playing:true,reducedMotion:false,tier:'high',manualCamera:false,manualLighting:false,...patch});
const result=(n=2,patch={})=>plan(input(n,patch));
const off=result(2,{playing:false});
const point=(x,z=0)=>[x,0,z];
const autoGroup={enabled:true,songSync:true,count:4,trackId:soundtrack.trackId,bpm:128,snap:'bar',minSpacing:1.05,
 modelIds:['','','',''],cues:[
 {id:'auto-v442-intro',at:0,transition:.7,drop:false,focus:-1,formation:'line',positions:[point(-2),point(-.6),point(.6),point(2)]},
 {id:'auto-v442-hook',at:44,transition:.7,drop:false,focus:0,formation:'arc',positions:[point(-2.1),point(-.7),point(.7),point(2.1)]},
 {id:'v446-feature',at:102,transition:.6,drop:false,focus:1,formation:'stagger',positions:[point(-2,.2),point(-.7,.2),point(.7,-.2),point(2,-.2)]},
 {id:'v446-drop',at:138,transition:.5,drop:true,focus:-1,formation:'wide',positions:[point(-2.4),point(-.8),point(.8),point(2.4)]},
 ]};
const groupOpts={enabled:true,reducedMotion:false,tier:'high'};

test('entry from previous confirmed act slows camera and light',()=>{const p=result();assert.equal(p.edge,'entry');assert(p.cameraRate<1&&p.lightingRate<1)});
test('first song start is not a fabricated transition',()=>{const p=result(0,{positionMs:500});assert.equal(p.edge,'middle');assert.equal(p.cameraRate,1)});
test('exit before actual next act is smoothed',()=>{const p=result(2,{positionMs:acts[2].endMs-200});assert.equal(p.edge,'exit');assert(p.cameraRate<1&&p.lightingRate<1)});
test('middle of long hook retains pre-V609 camera rate',()=>{const p=result(2,{positionMs:55000});assert.equal(p.edge,'middle');assert.equal(p.cameraRate,1);assert.equal(p.lightingRate,1)});
test('at exact confirmed incoming boundary rate is continuous',()=>{const b=result(1,{positionMs:acts[1].endMs-1}),a=result(2,{positionMs:acts[2].startMs});assert(Math.abs(b.cameraRate-a.cameraRate)<.00001);assert(Math.abs(b.lightingRate-a.lightingRate)<.00001)});
test('rates vary smoothly as entrance ends',()=>{const p=[0,300,600,1000,1800,3000].map(ms=>result(2,{positionMs:44000+ms}).cameraRate);for(let i=1;i<p.length;i++)assert(p[i]>=p[i-1]);assert(p[0]>=.62&&p.at(-1)===1)});
test('verse-to-hook and hook-to-verse use same verified act boundary',()=>{for(const n of [1,2,3,4,5,6])assert(result(n).active)});
test('first gap excludes exit/entry instead of inventing transition',()=>{const shifted=acts.map(a=>({...a}));shifted[4].startMs+=2500;const p=result(3,{positionMs:101500,narrative:{plan:{...soundtrack,acts:shifted},cue:cue(3)}});assert.equal(p.cameraRate,1)});
test('last song end does not invent following act',()=>{const p=result(7,{positionMs:205900});assert.equal(p.cameraRate,1)});
test('manual camera gets exact unchanged camera speed',()=>assert.equal(result(2,{manualCamera:true}).cameraRate,1));
test('manual light gets exact unchanged light speed',()=>assert.equal(result(2,{manualLighting:true}).lightingRate,1));
test('both authored lanes disable the planner',()=>assert.deepEqual(result(2,{manualCamera:true,manualLighting:true}),off));
test('pause disables planner',()=>assert.deepEqual(result(2,{playing:false}),off));
test('reduced motion disables planner',()=>assert.deepEqual(result(2,{reducedMotion:true}),off));
test('low performance tier disables extra easing',()=>assert.deepEqual(result(2,{tier:'low'}),off));
test('balanced has smaller adjustment than high',()=>{const a=result(),b=result(2,{tier:'balanced'});assert(b.cameraRate>a.cameraRate);assert(b.lightingRate>a.lightingRate)});
test('foreign track rejected',()=>assert.deepEqual(result(2,{trackId:'another-track'}),off));
test('unverified cue rejected',()=>assert.deepEqual(result(2,{narrative:{plan:soundtrack,cue:{...cue(2),active:false}}}),off));
test('source unavailable rejected',()=>assert.deepEqual(result(2,{narrative:{plan:{...soundtrack,source:'unavailable'},cue:cue(2)}}),off));
test('unmatched chapter rejected',()=>assert.deepEqual(result(2,{narrative:{plan:soundtrack,cue:{...cue(2),chapter:'setup'}}}),off));
test('unmatched motif rejected',()=>assert.deepEqual(result(2,{narrative:{plan:soundtrack,cue:{...cue(2),motif:'portrait'}}}),off));
test('unmatched repetition rejected',()=>assert.deepEqual(result(2,{narrative:{plan:soundtrack,cue:{...cue(2),repetition:2}}}),off));
test('wrong track positions rejected',()=>{for(const at of [-1,Infinity,NaN,207000])assert.deepEqual(result(2,{positionMs:at}),off)});
test('time from a different act rejected',()=>assert.deepEqual(result(2,{positionMs:91000}),off));
test('invalid cue act rejected',()=>{for(const a of [-1,8,NaN,2.5])assert.deepEqual(result(2,{narrative:{plan:soundtrack,cue:{...cue(2),act:a}}}),off)});
test('invalid transition magnitude rejected',()=>{for(const t of [-1,1.01,NaN,Infinity])assert.deepEqual(result(2,{narrative:{plan:soundtrack,cue:{...cue(2),transition:t}}}),off)});
test('no adjacent act returns neutral multipliers',()=>{const p=result(0,{positionMs:10000});assert.equal(p.lightingRate,1)});
test('group auto cues get longer bounded smoothstep',()=>{const r=groupPlan(autoGroup,soundtrack,groupOpts);assert(r!==autoGroup);assert(r.cues[1].transition>.7);assert(r.cues[1].transition<=1.7)});
test('group only adjusts transitions, never positions, timestamps, focus or types',()=>{const r=groupPlan(autoGroup,soundtrack,groupOpts);for(let i=0;i<r.cues.length;i++){const a=autoGroup.cues[i],b=r.cues[i];for(const k of ['id','at','focus','drop','formation','positions'])assert.deepEqual(b[k],a[k])}});
test('explicit drop formations do not get extended',()=>{const r=groupPlan(autoGroup,soundtrack,groupOpts);assert.equal(r.cues[3].transition,.5)});
test('first cue remains untouched',()=>{const r=groupPlan(autoGroup,soundtrack,groupOpts);assert.equal(r.cues[0].transition,.7)});
test('zero-duration automatic cut remains a cut',()=>{const group={...autoGroup,cues:autoGroup.cues.map(c=>({...c}))};group.cues[1].transition=0;assert.equal(groupPlan(group,soundtrack,groupOpts).cues[1].transition,0)});
test('group transition never overlaps next cue',()=>{const r=groupPlan(autoGroup,soundtrack,groupOpts);for(let i=1;i<r.cues.length-1;i++)assert(r.cues[i].transition<=(r.cues[i+1].at-r.cues[i].at)*.45)});
test('group unchanged for manual cue id',()=>{const manual={...autoGroup,cues:autoGroup.cues.map(c=>({...c}))};manual.cues[2].id='manual';assert.equal(groupPlan(manual,soundtrack,groupOpts),manual)});
test('group unchanged when song id mismatches',()=>{const g={...autoGroup,trackId:'foreign'};assert.equal(groupPlan(g,soundtrack,groupOpts),g)});
test('group unchanged when songSync disabled',()=>{const g={...autoGroup,songSync:false};assert.equal(groupPlan(g,soundtrack,groupOpts),g)});
test('group unchanged when disabled',()=>{const g={...autoGroup,enabled:false};assert.equal(groupPlan(g,soundtrack,groupOpts),g)});
test('group unchanged at low tier, reduced motion, feature toggle off',()=>{for(const opts of [{tier:'low'},{reducedMotion:true},{enabled:false}])assert.equal(groupPlan(autoGroup,soundtrack,{...groupOpts,...opts}),autoGroup)});
test('group preserves existing V326 distance protection and smoothstep',()=>{const g=groupPlan(autoGroup,soundtrack,groupOpts);const mid=evaluateGroupV326(g,44+g.cues[1].transition/2);assert(mid.distance>=g.minSpacing-.001);assert(mid.blend>.49&&mid.blend<.51)});
test('small gaps never extend an existing transition into further overlap',()=>{const g={...autoGroup,cues:autoGroup.cues.map(c=>({...c}))};g.cues[2].at=44.9;const r=groupPlan(g,soundtrack,groupOpts);assert.equal(r.cues[1].transition,g.cues[1].transition)});
test('deterministic, immutable input, no frame-to-frame accumulated easing',()=>{const q=input();const before=JSON.stringify(q);assert.deepEqual(plan(q),plan(q));assert.equal(JSON.stringify(q),before);const j=JSON.stringify(autoGroup);groupPlan(autoGroup,soundtrack,groupOpts);assert.equal(JSON.stringify(autoGroup),j)});
test('camera runtime uses V609 for existing camera alpha, preserved cut flag',()=>{const s=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');assert(s.includes('planSeamlessConcertTransitionV609('));assert(s.includes('*sceneBlendV609.cameraRate'));assert(s.includes('editingPose||cutToCameraCueV400 ? 1'))});
test('both stage lighting rigs share V609, no new frame loop',()=>{for(const f of ['DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx']){const s=fs.readFileSync('components/visualizer/'+f,'utf8');assert(s.includes('planSeamlessConcertTransitionV609('));assert(s.includes('lightingBlendV609.lightingRate'));assert(s.includes('planDynamicConcertLightingV608('))}});
test('real auto group output feeds spotlight and ThreeAvatar, not just planner',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('refineAutoGroupTransitionsV609('));assert(s.includes('evaluateGroupV326(concertGroupV609,'));assert(s.includes('autoMultiArtistGroupV442={concertGroupV609'))});
test('no new rendering objects, requests, clocks or inferred song data',()=>{const s=fs.readFileSync('components/visualizer/seamlessConcertTransitionsV609.ts','utf8');assert.doesNotMatch(s,/useFrame|fetch\(|requestAnimationFrame|setInterval|Date\.now|performance\.now|Math\.random|new SpotLight|new ShaderMaterial|AudioContext/)});
let frames=0;for(let i=0;i<30000;i++){const n=i%acts.length,a=acts[n],pos=a.startMs+(i*137)%(a.endMs-a.startMs);
 const r=result(n,{positionMs:pos,tier:i%4?'high':'balanced',manualCamera:i%7===0,manualLighting:i%9===0});
 assert(Number.isFinite(r.cameraRate)&&r.cameraRate>=.62&&r.cameraRate<=1);
 assert(Number.isFinite(r.lightingRate)&&r.lightingRate>=.58&&r.lightingRate<=1);frames++}
test('30,000 finite and bounded full-song transitions',()=>assert.equal(frames,30000));
console.log(`PASS V609: ${groups} groups, ${frames} verified-timeline scene samples.`);
