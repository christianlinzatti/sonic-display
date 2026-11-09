import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {readFileSync} from 'node:fs';
import {AnimationMixer,Vector3,Quaternion,Group,Bone} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {CREW_IDS,CREW_DEFAULT,newCrewState,stepCrew,crewClipTime,normalizeCrewSettings}=load('components/visualizer/sonicCrewDirector.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const assets=await Promise.all(['neon-pulse','festival-nova','chrome-beat'].map(async slug=>{const b=readFileSync(`public/avatars/sonic/${slug}.glb`);return new GLTFLoader().parseAsync(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'');}));
const base={modelId:CREW_IDS[0],clips:assets[0].animations,trackId:'song-a',progressMs:0,bpm:120,energy:.55,section:'verse',genre:'techno',slot:0,count:1,playing:true,reducedMotion:false,manualPriority:false,settings:CREW_DEFAULT};
const run=(patch={},state=newCrewState())=>stepCrew(state,{...base,...patch});
for(const [patch,reason] of [[{playing:false},'paused'],[{reducedMotion:true},'reduced-motion'],[{manualPriority:true},'manual'],[{trackId:null},'no-song-clock'],[{progressMs:NaN},'no-song-clock'],[{progressMs:-1},'no-song-clock'],[{modelId:'custom'},'other-model'],[{settings:{...CREW_DEFAULT,enabled:false}},'disabled'],[{clips:[]},'missing-clips']])assert.equal(run(patch).plan.reason,reason);
assert.equal(run().plan.clip,'Dance_Techno');assert.equal(run({section:'verse',genre:'hip-hop'}).plan.clip,'Dance_HipHop');assert.equal(run({section:'hook'}).plan.clip,'Dance_NeonCircuit');assert.equal(run({section:'drop'}).plan.clip,'Dance_Shuffle');assert.equal(run({section:'intro'}).plan.clip,'Idle_Breathe');
assert.equal(run({modelId:CREW_IDS[1],clips:assets[1].animations,section:'intro'}).plan.clip,'Gesture_Wave');
assert.equal(run({modelId:CREW_IDS[1],clips:assets[1].animations,section:'intro',settings:{...CREW_DEFAULT,reactions:false}}).plan.clip,'Idle_Breathe');
assert.equal(run({modelId:CREW_IDS[2],clips:assets[2].animations,section:'hook'}).plan.clip,'Dance_PopLock');
assert.equal(run({bpm:null}).plan.reason,'tempo-fallback');assert.equal(run({bpm:Infinity}).plan.bpm,120);
assert.deepEqual(normalizeCrewSettings({mode:'untrusted',enabled:0}),CREW_DEFAULT);
const solo=run({section:'hook',settings:{...CREW_DEFAULT,mode:'unison'},count:1});
assert.equal(run({section:'hook',settings:{...CREW_DEFAULT,mode:'unison'},count:3,progressMs:1000},solo.state).plan.clip,'Dance_House','Adding dancers must reset the solo hold');
// Sub-bar noise and fast section changes cannot restart the selection.
let state=newCrewState(),switches=0,last=null;
for(let ms=0;ms<9000;ms+=100){const next=run({progressMs:ms,section:ms<1000?'verse':'hook'},state);if(next.plan.clip!==last){last=next.plan.clip;switches++;}state=next.state;}
assert.equal(switches,2);assert.notEqual(last,'Dance_Techno','Next phrase must introduce a different real clip');
let reset=run({progressMs:100,trackId:'song-b',section:'drop'},state);assert.equal(reset.plan.clip,'Dance_Shuffle');assert.equal(reset.state.position,100);
reset=run({progressMs:0,section:'intro'},state);assert.equal(reset.plan.clip,'Idle_Breathe');
// Integrating a changed tempo does not rescale the entire already-played song.
let tempo=run({progressMs:60000});const changed=run({progressMs:60200,bpm:160},tempo.state);
assert.ok(changed.plan.beat-tempo.plan.beat<.6);
for(const tempoBpm of [80,120,180]) for(const mode of ['unison','canon','spotlight']){
 const states=CREW_IDS.map(()=>newCrewState()),mixers=assets.map(g=>new AnimationMixer(g.scene)),actions=Array(3).fill(null),names=Array(3).fill(null);
 for(let frame=0;frame<2400;frame++){
  const pos=frame/60*1000,part=pos<16000?'hook':'drop';const plans=[];
  for(let slot=0;slot<3;slot++){
   const next=run({modelId:CREW_IDS[slot],clips:assets[slot].animations,progressMs:pos,bpm:tempoBpm,section:part,slot,count:3,settings:{...CREW_DEFAULT,mode}},states[slot]);states[slot]=next.state;plans.push(next.plan);
   assert.ok(assets[slot].animations.some(c=>c.name===next.plan.clip));
   if(names[slot]!==next.plan.clip){actions[slot]?.stop();actions[slot]=mixers[slot].clipAction(assets[slot].animations.find(c=>c.name===next.plan.clip)).reset().play();names[slot]=next.plan.clip;}
   actions[slot].time=crewClipTime(next.plan,actions[slot].getClip().duration);mixers[slot].update(0);
   assets[slot].scene.updateMatrixWorld(true);
   const foot=assets[slot].scene.getObjectByName('LeftFoot').getWorldPosition(new Vector3());assert.ok(foot.toArray().every(Number.isFinite));
  }
  if(mode==='unison'){assert.equal(names[0],names[1]);assert.equal(names[1],names[2]);assert.ok(Math.abs(actions[0].time-actions[2].time)<1e-5);}
  if(mode==='canon'){assert.equal(names[0],'Dance_House');assert.ok(Math.abs(((actions[0].time-actions[1].time+4)%4)-1)<1e-5);}
  if(mode==='spotlight')assert.ok(/Neon|Laser|FestivalFlow|DiscoStar|PopLock|Clockwork/.test(names[plans[0].leader]));
 }
 mixers.forEach(m=>m.stopAllAction());
 console.log(`${mode} @ ${tempoBpm} BPM: 40s / 2400 actual GLB mixer frames; coordinated clips, finite feet and correct clock phases PASS`);
}
// Our reaction never accumulates when no mixer writes a new pose and releases cleanly.
for(let i=0;i<3;i++){
 const root=new Group(),head=new Bone(),led=new Bone();head.name='Head';led.name='FaceLedBar0';root.add(head,led);
 const refs=prepareCrewReaction(root),p=run({modelId:CREW_IDS[i],clips:assets[i].animations}).plan;
 for(let n=0;n<1000;n++)applyCrewReaction(refs,p,n/60,.9);
 assert.ok(new Quaternion().angleTo(head.quaternion)<.08);assert.ok(led.scale.y<1.13);
 applyCrewReaction(refs,{...p,active:false},0,0);assert.ok(new Quaternion().angleTo(head.quaternion)<1e-5);assert.ok(led.scale.distanceTo(new Vector3(1,1,1))<1e-5);
}
console.log('Manual priority, reduced motion, missing clocks/clips, track changes, seeks, anti-jitter, tempo continuity and reaction cleanup PASS');
