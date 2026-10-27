'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const M=load('components/visualizer/multiAvatarFormationDirectorV495');
const positions=[[-2.0,0,0],[-.7,0,.1],[.7,0,.1],[2.0,0,0]];
const base={trackId:'track_v495',seconds:10,delta:1/60,count:4,positions,focus:1,section:'verse',drop:false,
 energy:.7,beat:.8,kick:.4,bpm:128,playing:true,reducedMotion:false,automaticGroup:true,manualPriority:false,
 footLocked:false,quality:'high'};
const fresh=()=>M.newFormationStateV495();
const step=(state,extra={})=>M.stepMultiAvatarFormationV495({...base,state,...extra});
let result=step(fresh());
assert.deepEqual(result,step(fresh()),'same inputs yield the same output');
assert.equal(result.plan.active,true);
assert.equal(result.plan.moment,'verse');
assert.equal(result.plan.lead,1);
assert.deepEqual(result.plan.slots.map(x=>x.role),['background','lead','support','background']);
assert(result.plan.slots.every(x=>x.offsetZ===0),'starts at zero after track change');
let state=result.state;
for(let frame=0;frame<200;frame++){
 result=step(state,{seconds:10+(frame+1)/60});state=result.state;
}
assert(result.plan.slots[1].offsetZ<0,'lead advances modestly');
assert(result.plan.slots[2].offsetZ<0,'support follows with a smaller forward cue');
assert(result.plan.slots.every(x=>Math.abs(x.offsetZ)<=.11),'safe depth bounds');
assert(result.plan.slots.every(x=>Math.abs(x.turnY)<=.04),'safe rotation bounds');
assert(result.plan.slots[1].rightLift>result.plan.slots[3].rightLift,'lead has visible gestures');
assert(result.plan.slots[2].leftLift>result.plan.slots[3].leftLift,'support responds');
const hook=step(state,{seconds:13.35,section:'hook'});
assert.equal(hook.plan.moment,'hook');
assert(hook.plan.slots.every(x=>x.offsetZ<=0),'hook group motion is coordinated');
const drop=step(hook.state,{seconds:13.4,drop:true,beat:1,kick:1});
assert.equal(drop.plan.moment,'drop');
assert(drop.plan.slots[1].intensity>=drop.plan.slots[3].intensity);
const noFocus=step(state,{seconds:13.35,focus:-1});
assert.equal(noFocus.plan.lead,1,'leader does not twitch on short changes');
const afterLong=step(noFocus.state,{seconds:25,focus:-1});
assert(afterLong.plan.lead>=0&&afterLong.plan.lead<4);
const shortGap=step(noFocus.state,{seconds:14,focus:-1});
assert.equal(shortGap.plan.lead,1);
const manualFocus=step(noFocus.state,{seconds:13.4,focus:3});
assert.equal(manualFocus.plan.lead,3,'stage focus still takes priority');
for(const [name,overrides] of Object.entries({
 manual:{manualPriority:true},disabled:{automaticGroup:false},paused:{playing:false},
 reduced:{reducedMotion:true},tier:{quality:'low'},invalidTrack:{trackId:''},
 missingPos:{positions:positions.slice(0,2)},count:{count:2},broken:{delta:NaN},seek:{seconds:NaN},
 badCoords:{positions:[[NaN,0,0],...positions.slice(1)]},
 })) {
 const r=step(state,{seconds:13.35,...overrides});
 assert.equal(r.plan.active,false,`${name} must gate automatic director`);
 assert(r.plan.slots.every(x=>x.offsetZ===0&&x.intensity===0));
}
assert(step(state,{seconds:13.35,footLocked:true}).plan.slots.every(x=>x.offsetZ===0));
const swapped=step(state,{trackId:'another_track',seconds:16});
assert.equal(swapped.state.trackId,'another_track');
assert(swapped.plan.slots.every(x=>x.offsetZ===0),'new track starts at zero');
const seek=step(state,{seconds:.4});
assert(seek.plan.slots.every(x=>x.offsetZ===0),'backward seeks are neutral');
const gap=step(state,{seconds:40});
assert(gap.plan.slots.every(x=>x.offsetZ===0),'large discontinuity resets fade');
const stance={active:true,phase:'dance',support:'both',gain:.7,driftCm:.5};
const moving={...stance,support:'right'};
const floating={...stance,support:'none'};
const slot=result.plan.slots[1];
assert.equal(M.safeFormationTravelV495(slot,stance),0,'two planted feet must not be translated');
assert.equal(M.safeFormationTravelV495(slot,{...stance,phase:'rising',support:'right'}),0);
assert.equal(M.safeFormationTravelV495(slot,{...stance,phase:'lowering',support:'right'}),0);
assert.equal(M.safeFormationTravelV495(slot,{...stance,phase:'low',support:'right'}),0);
assert.equal(M.safeFormationTravelV495(slot,{...moving,driftCm:5}),0);
assert.equal(M.safeFormationTravelV495(slot,{...moving,active:false}),0);
assert.equal(M.safeFormationTravelV495(slot,undefined),0);
assert(Math.abs(M.safeFormationTravelV495(slot,moving))<Math.abs(slot.offsetZ));
assert(Math.abs(M.safeFormationTravelV495(slot,floating))<Math.abs(slot.offsetZ));
assert(Math.abs(M.safeFormationTravelV495(slot,moving))<=.055);
let longState=fresh();let activeFrames=0;let dropFrames=0;let changeCount=0;let priorLead=-1;
for(let frame=0;frame<108000;frame++){
 const seconds=frame/60,phase=frame%1200;
 const response=M.stepMultiAvatarFormationV495({...base,state:longState,seconds,focus:-1,
  section:phase<600?'verse':phase<850?'hook':'drop',drop:phase>=850,
  beat:Math.max(0,Math.sin(frame/18)),kick:Math.max(0,Math.sin(frame/30)),
  energy:.45+.3*Math.sin(frame/190)});
 longState=response.state;
 assert(response.plan.slots.length===4);
 for(const s of response.plan.slots){
  assert(Number.isFinite(s.offsetZ)&&Math.abs(s.offsetZ)<=.11);
  assert(Number.isFinite(s.turnY)&&Math.abs(s.turnY)<=.04);
  assert(s.intensity>=0&&s.intensity<=.1);
 }
 assert.equal(response.plan.slots.filter(s=>s.role==='lead').length,1);
 if(response.plan.active)activeFrames++;
 if(response.plan.moment==='drop')dropFrames++;
 if(priorLead!==-1&&priorLead!==response.plan.lead)changeCount++;
 priorLead=response.plan.lead;
}
assert(activeFrames>100000&&dropFrames>10000);
assert(changeCount>2&&changeCount<350,'long-running lead selection stays phrase-stable');
const scene=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
for(const token of ['stepMultiAvatarFormationV495','formationStateV495.current','safeFormationTravelV495',
 'formationV495.slots[i]','groundDecisionsV494[i]','roleTravelV495',
 'automaticGroup:settings===props.autoMultiArtistGroupV442',
 "props.avatarMotionMode==='choreography'",'props.lipSync?.manualVocalEnabledV385===true',
 'g.position.y=0','GroupFootSupportContextV486.Provider','GroupGroundObservationContextV487.Provider']) {
 assert(scene.includes(token),`V495 integration missing: ${token}`);
}
assert(scene.includes('(settings!==props.autoMultiArtistGroupV442&&!!settings.trackId)'),
 'an automatic song-scoped group must not be mistaken for a manual stage');
assert.equal((scene.match(/useFrame\(/g)||[]).length,1,'no extra frame loop');
assert(!/new AnimationMixer|\.getWorldPosition/.test(fs.readFileSync('components/visualizer/multiAvatarFormationDirectorV495.ts','utf8')),
 'pure director must not own mixer or foot measurements');
const pkg=require('../package.json');
assert(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1])>=495);
assert(pkg.scripts['build:preflight'].includes('npm run test:v495 && npm run test:v495:types && npm run test:v494'));
console.log('PASS V495: phase-stable ensemble roles, manual priority, contact-safe choreography, seek resets, 30-minute simulation');
