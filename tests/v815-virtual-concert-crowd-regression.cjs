'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planVirtualConcertCrowdV815:plan,createVirtualCrowdLayoutV815:layout,CROWD_MAX_V815:MAX}=load('components/visualizer/virtualConcertCrowdPlannerV815');
const {planConcertFxV810,normalizeConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const settings=normalizeConcertFxV810({intensity:100,crowdIntensity:100,quality:'ultra',crowdDensity:'arena'});
const fx={active:true,reason:'music',genre:'hardtekk',section:'drop',laserOpacity:.15,ribbonGain:.2,ledGain:.4,ledStyle:3,phase:12,primary:'#00ffff',secondary:'#ff00ff',bass:.8,mids:.5,highs:.7};
const input={fx,settings,tier:'high',lyricsProtected:false,vocalFocus:false,groupCount:1,energy:.88,kick:.94,crowdBudget:1};
let n=0;function check(name,fn){try{fn();n++;}catch(e){e.message=name+': '+e.message;throw e;}}
const on=plan(input);
check('verified drop creates bounded audience',()=>{assert(on.active);assert.equal(on.count,MAX);assert(on.movement>0&&on.movement<=.22);assert(on.phoneOpacity>0&&on.phoneOpacity<=.34);});
check('no crowd without trusted parent FX',()=>{for(const patch of [{active:false},{reason:'unverified'},{reason:'guarded'}])assert(!plan({...input,fx:{...fx,...patch}}).active)});
check('no crowd during paused, manual, blackout, reduced motion and out of song',()=>{
 const base={settings,genre:'Hardtekk',section:'drop',progressMs:5000,startMs:0,endMs:10000,active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.88,kick:.94,bass:.85,mids:.5,highs:.7,ledBudget:1,laserBudget:1};
 for(const patch of [{playing:false},{authored:true},{blackout:true},{reducedMotion:true},{verified:false},{progressMs:-1},{tier:'low'}]){
  const parent=planConcertFxV810({...base,...patch});assert(!plan({...input,fx:parent,tier:patch.tier??'high'}).active);
 }
});
check('off toggles',()=>{assert(!plan({...input,settings:{...settings,virtualCrowd:false}}).active);assert(!plan({...input,settings:{...settings,crowdIntensity:0}}).active);assert.equal(plan({...input,settings:{...settings,crowdPhones:false}}).phoneOpacity,0)});
check('invalid inputs fail closed',()=>{for(const patch of [{groupCount:0},{groupCount:5},{groupCount:1.4},{crowdBudget:NaN},{energy:NaN},{kick:NaN},{crowdBudget:0},{tier:'low'}])assert(!plan({...input,...patch}).active)});
check('genres and song progression',()=>{assert(plan({...input,fx:{...fx,section:'verse'}}).movement<on.movement);assert(plan({...input,fx:{...fx,genre:'rap'}}).movement<on.movement);assert(plan({...input,fx:{...fx,section:'break'}}).lightGain<on.lightGain);});
check('kick animates audience',()=>assert(plan({...input,kick:0,energy:0}).movement<on.movement));
check('lyrics and vocal protection',()=>{assert(plan({...input,lyricsProtected:true}).lightGain<on.lightGain);assert(plan({...input,vocalFocus:true}).lightGain<on.lightGain);assert(plan({...input,groupCount:4}).lightGain<on.lightGain)});
check('tier / quality reduce draw count and intensity',()=>{const perf=plan({...input,settings:{...settings,quality:'performance'}});const balanced=plan({...input,tier:'balanced'});assert(perf.count<on.count&&perf.movement<on.movement);assert(balanced.count<on.count&&balanced.movement<on.movement);});
check('sparse / arena difference',()=>assert(plan({...input,settings:{...settings,crowdDensity:'sparse'}}).count<on.count));
check('layout is deterministic and avoids center performer lane',()=>{const crowd=layout();assert.equal(crowd.length,MAX);assert(crowd.every(p=>Math.abs(p.x)>=3&&Number.isFinite(p.z)&&Number.isFinite(p.y)));assert.deepEqual(crowd,layout())});
check('deterministic planner / no input mutation',()=>{const before=JSON.stringify(input);assert.deepEqual(plan(input),on);assert.equal(JSON.stringify(input),before)});
check('settings migration respects old backups',()=>{const old=normalizeConcertFxV810({enabled:true,ledWall:false});assert.equal(old.virtualCrowd,true);assert.equal(old.crowdDensity,'balanced');assert.equal(normalizeConcertFxV810({crowdIntensity:Infinity}).crowdIntensity,65)});
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');const renderer=fs.readFileSync('components/visualizer/VirtualConcertCrowdV815.tsx','utf8');const ui=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
check('3D integration and independent settings',()=>{assert(stage.includes('<VirtualConcertCrowdV815 cueRef={crowdCueV815}/>'));assert(stage.includes('planVirtualConcertCrowdV815'));assert(ui.includes('crowdPhones'));assert(ui.includes('crowdDensity'))});
check('3 original crowd meshes and one opt-in V996 stick overlay, no lights',()=>{assert.equal((renderer.match(/<instancedMesh /g)||[]).length,4);assert(renderer.includes('v996-virtual-crowd-glowsticks'));assert(renderer.includes('visible={false}'));assert(!renderer.includes('<pointLight'));assert(!renderer.includes('<spotLight'));assert(renderer.includes('depthWrite={false}'))});
console.log(`PASS V815: ${n} concert crowd, gating, quality, performance and integration tests`);
