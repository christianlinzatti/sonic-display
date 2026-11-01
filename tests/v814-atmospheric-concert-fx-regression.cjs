'use strict';const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planAtmosphericConcertFxV814:plan}=load('components/visualizer/atmosphericConcertFxV814');
const {normalizeConcertFxV810,planConcertFxV810}=load('components/visualizer/concertFxStudioV810');
const settings=normalizeConcertFxV810({intensity:100,quality:'ultra'});
const fx={active:true,reason:'music',genre:'rock',section:'hook',laserOpacity:.12,ribbonGain:.2,ledGain:.35,ledStyle:4,phase:9,primary:'#ffac00',secondary:'#fff000',bass:.8,mids:.5,highs:.5};
const input={settings,fx,lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',hazeBudget:1};
const on=plan(input);let n=0;function check(k,fn){try{fn();n++;}catch(e){e.message=k+': '+e.message;throw e;}}
check('visible bounded effects',()=>{assert(on.active);assert(on.floorOpacity>0&&on.floorOpacity<=.17);assert(on.shaftsOpacity>0&&on.shaftsOpacity<=.09)});
check('reduced/off on invalid / low',()=>{assert(!plan({...input,tier:'low'}).active);assert(!plan({...input,fx:{...fx,active:false}}).active);assert(!plan({...input,hazeBudget:NaN}).active);assert(!plan({...input,settings:{...settings,atmosphericFx:false}}).active)});
check('preserve portrait and lyrics',()=>{assert(plan({...input,lyricsProtected:true}).floorOpacity<on.floorOpacity);assert(plan({...input,vocalFocus:true}).floorOpacity<on.floorOpacity);assert(plan({...input,groupCount:4}).floorOpacity<on.floorOpacity)});
check('genres and song form',()=>{assert(plan({...input,fx:{...fx,genre:'rap'}}).floorOpacity<on.floorOpacity);assert(plan({...input,fx:{...fx,section:'break'}}).floorOpacity<on.floorOpacity)});
check('quality and performance',()=>{const perf=plan({...input,settings:{...settings,quality:'performance'}});assert(perf.floorOpacity>0);assert.equal(perf.shaftsOpacity,0);assert(plan({...input,tier:'balanced'}).floorOpacity<on.floorOpacity)});
check('toggle independently',()=>{assert.equal(plan({...input,settings:{...settings,floorHaze:false}}).floorOpacity,0);assert.equal(plan({...input,settings:{...settings,lightShafts:false}}).shaftsOpacity,0)});
check('cap in case bad values',()=>{const x=plan({...input,settings:{...settings,intensity:999},hazeBudget:999});assert(x.floorOpacity<=.17&&x.shaftsOpacity<=.09)});
check('ambient-only on performance independently from LED',()=>{
 const src={settings:{...settings,quality:'performance',ledWall:false,lasers:false,ribbons:false,lyricsProjection:false},genre:'Deutschrock',section:'hook',progressMs:5000,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:1,tier:'high',energy:.8,kick:.8,bass:.8,mids:.7,highs:.6,ledBudget:1,laserBudget:1};
 const standalone=planConcertFxV810(src);assert(standalone.active);assert(plan({...input,fx:standalone,settings:src.settings}).floorOpacity>0);
});
check('determinism',()=>assert.deepEqual(plan(input),plan(input)));
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const shader=fs.readFileSync('components/visualizer/atmosphereShaderV814.ts','utf8');
check('rendering reuses V308 scene fog',()=>{assert(stage.includes('v814-floor-haze'));assert(stage.includes('v814-backstage-light-shafts'));assert(!stage.includes('scene.fog=new Fog'));assert(stage.includes('planAtmosphericConcertFxV814'));});
check('bounded shader no raymarch',()=>{assert(shader.includes('gl_FragColor'));assert(shader.includes('clamp(shape*uOpacity,0.0,.17)'));assert(!shader.includes('for(int'))});
console.log(`PASS V814: ${n} atmospheric quality, performance and integration tests`);
