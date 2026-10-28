'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {createNaturalMotionFlowStateV614,planNaturalMotionFlowV614:plan}=load('components/visualizer/naturalMotionFlowV614');
const initial=createNaturalMotionFlowStateV614();
let count=0;
const test=(label,fn)=>{try{fn();count++;}catch(e){e.message=`V614 ${label}: ${e.message}`;throw e;}};
const base={trackId:'song',progressMs:12000,outgoingName:'dance1',incomingName:'dance2',outgoingDuration:3.4,
 incomingDuration:4.2,baseSeconds:.36,section:'verse',genre:'deutschrap',bpm:105,
 energy:.52,kickOnset:0,snareOnset:0,plantedLeft:false,plantedRight:false,
 automatic:true,playing:true,reducedMotion:false,quality:'high'};
const evalFlow=(extra={},state=initial)=>plan(state,{...base,...extra});
test('normal automatic switch is refined',()=>{const r=evalFlow();assert(r.enabled&&r.fadeSeconds>.36);assert.equal(r.style,'rap');});
test('no automatic clip selection',()=>{const x=evalFlow();assert(!('selectedClip' in x)&&!('entrySeconds' in x));});
test('break is softer than verse',()=>assert(evalFlow({section:'break'}).fadeSeconds>evalFlow().fadeSeconds));
test('quiet instrumental keeps supported motion smooth',()=>assert(evalFlow({section:'instrumental',energy:.10}).fadeSeconds>=evalFlow({section:'instrumental',energy:.80}).fadeSeconds));
test('build transitions have extra continuity',()=>assert(evalFlow({section:'build'}).fadeSeconds>evalFlow({section:'unknown'}).fadeSeconds));
test('hook keeps overlap',()=>assert(evalFlow({section:'hook'}).fadeSeconds>evalFlow({section:'unknown'}).fadeSeconds));
test('unmeasured drop does not assume strong kick',()=>{const x=evalFlow({section:'drop',kickOnset:0,snareOnset:0});assert(!x.acceleratedByOnset);});
test('measured drop onset is punchier',()=>{const a=evalFlow({section:'drop',kickOnset:.9}),b=evalFlow({section:'drop',kickOnset:.1});assert(a.acceleratedByOnset&&a.fadeSeconds<b.fadeSeconds);});
test('measured snare onset is also evidence',()=>assert(evalFlow({section:'drop',snareOnset:.7}).acceleratedByOnset));
test('NaN onset never invents a drop',()=>assert(!evalFlow({section:'drop',kickOnset:NaN,snareOnset:NaN}).acceleratedByOnset));
test('partial planted foot never shortens fade',()=>{const o=evalFlow(),p=evalFlow({plantedLeft:true});assert(p.fadeSeconds>=o.fadeSeconds&&p.style==='foot-contact');});
test('right foot contact is supported',()=>assert.equal(evalFlow({plantedRight:true}).style,'foot-contact'));
test('pose mismatch receives more overlap',()=>assert(evalFlow({matchScore:.9}).fadeSeconds>=evalFlow({matchScore:.1}).fadeSeconds));
test('rapid repeat clip switches keep flow',()=>{
 const one=evalFlow(),next=evalFlow({outgoingName:'dance2',incomingName:'dance3',progressMs:13000},one.state);
 assert(next.previousSwitchWasRapid&&next.fadeSeconds>=evalFlow({outgoingName:'dance2',incomingName:'dance3',progressMs:16000},one.state).fadeSeconds);
});
test('different track does not reuse rapid-switch history',()=>{
 const one=evalFlow(),next=evalFlow({trackId:'new song',outgoingName:'dance2',incomingName:'dance3',progressMs:12500},one.state);
 assert(!next.previousSwitchWasRapid&&next.state.trackId==='new song');
});
test('reverse playback seek skips smoothing',()=>{const one=evalFlow(),next=evalFlow({progressMs:10000,outgoingName:'dance2',incomingName:'dance3'},one.state);assert(!next.enabled&&next.state.lastChangeMs===10000);});
test('no changes for explicit choreography',()=>assert(!evalFlow({automatic:false}).enabled));
test('no changes if paused',()=>assert(!evalFlow({playing:false}).enabled));
test('no changes with reduced motion',()=>assert(!evalFlow({reducedMotion:true}).enabled));
test('no changes on low-quality tier',()=>assert(!evalFlow({quality:'low'}).enabled));
test('no changes for missing old clip',()=>assert(!evalFlow({outgoingName:null}).enabled));
test('no changes for same clip',()=>assert(!evalFlow({incomingName:'dance1'}).enabled));
test('unavailable next clip fails closed',()=>assert(!evalFlow({incomingDuration:null}).enabled));
test('unavailable previous duration fails closed',()=>assert(!evalFlow({outgoingDuration:NaN}).enabled));
test('tiny clips keep legacy',()=>assert(!evalFlow({incomingDuration:.25}).enabled));
test('bad base fails closed',()=>assert(!evalFlow({baseSeconds:NaN}).enabled));
test('invalid bpm does not create NaN',()=>assert(Number.isFinite(evalFlow({bpm:NaN}).fadeSeconds)));
test('high BPM bounded by musical beat',()=>assert(evalFlow({bpm:240,baseSeconds:1.5}).fadeSeconds<=.7751));
test('small clips cap duration',()=>assert(evalFlow({incomingDuration:.5,outgoingDuration:.5}).fadeSeconds<=.2101));
test('initial creation has no stale reference',()=>assert.deepEqual(initial,{trackId:null,lastClip:null,lastChangeMs:null,section:null}));
test('functional result does not mutate ref input',()=>{const frozen=Object.freeze({...initial});evalFlow({},frozen);assert.deepEqual(frozen,initial);});
test('authoring guard on actual V492 playback owner',()=>{
 const x=fs.readFileSync('components/visualizer/useGltfClipTransitionsV492.ts','utf8');
 assert(x.indexOf('const intelligentV565=')<x.indexOf('const flowV614='));
 assert(x.includes('automatic:autoV565'));
 assert(x.includes('if(flowV614.enabled)effectiveFadeDurationV311=flowV614.fadeSeconds;'));
 assert(x.indexOf('const flowV614=')<x.indexOf('nextAction.fadeIn(effectiveFadeDurationV311).play();'));
 assert(!x.match(/\b(flowV614\.select|flowV614\.entrySeconds)\b/));
});
test('GLB owner passes song time, section and track ID',()=>{
 const x=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
 assert(x.includes('trackIdV614:track?.id'));
 assert(x.includes('progressMsV614:cameraDirectorProgressMs??propsLipSyncV367?.progressMs'));
 assert(x.includes('musicSectionV565:showCue?.enabled?showCue.section:cameraDirectorSection'));
});
test('no additional per-frame state churn in the effect dependency list',()=>{
 const x=fs.readFileSync('components/visualizer/useGltfClipTransitionsV492.ts','utf8');
 const d=x.slice(x.lastIndexOf('}, [actions,'));
 assert(!d.includes('progressMsV614')&&!d.includes('energyV614'));
});
test('pure planner never takes over IK / mixer / singer assignment',()=>{
 const x=fs.readFileSync('components/visualizer/naturalMotionFlowV614.ts','utf8');
 assert.doesNotMatch(x,/requestAnimationFrame\s*\(|\buseFrame\s*\(|setTimeout\s*\(|setInterval\s*\(|new AnimationMixer\s*\(|Math.random\s*\(|Date.now\s*\(/);
});
let snapshots=0;
for(let t=0;t<200000;t+=97){for(const section of ['verse','break','build','hook','drop']){
 const r=evalFlow({progressMs:t,section,energy:(t%1000)/1000,bpm:60+t%160,plantedLeft:t%3===0,kickOnset:t%2===0?.71:0});
 assert(Number.isFinite(r.fadeSeconds)&&r.fadeSeconds>=.08&&r.fadeSeconds<=1.2);
 assert.deepEqual(r,evalFlow({progressMs:t,section,energy:(t%1000)/1000,bpm:60+t%160,plantedLeft:t%3===0,kickOnset:t%2===0?.71:0}));
 snapshots++;
}}
test('deterministic full-song transition samples',()=>assert(snapshots>10000));
console.log(`PASS V614: ${count} regression groups, ${snapshots} deterministic transition samples`);
