'use strict';
const assert=require('node:assert/strict');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertFxV810:normalize,planConcertFxV810:plan,concertFxGenreV810:genre}=load('components/visualizer/concertFxStudioV810');
const base={settings:{enabled:true,quality:'ultra',intensity:100},genre:'Hardtekk',section:'drop',
 progressMs:5000,startMs:0,endMs:10000,active:true,verified:true,playing:true,reactive:true,
 reducedMotion:false,authored:false,blackout:false,lyricsProtected:false,vocalFocus:false,
 groupCount:1,tier:'high',energy:.85,kick:.9,bass:.95,mids:.5,highs:.65,ledBudget:1,laserBudget:1};
let n=0;function check(name,fn){try{fn();n++;}catch(e){e.message=name+': '+e.message;throw e;}}
check('hardtekk genre',()=>assert.equal(genre('Viennatek / Hardtekk'),'hardtekk'));
check('rap and NDH genres',()=>{assert.equal(genre('Deutschrap'),'rap');assert.equal(genre('Industrial Metal'),'rock')});
check('custom color validation and clamping',()=>{const s=normalize({quality:'random',intensity:600,primary:'javascript:bad'});assert.equal(s.intensity,100);assert.equal(s.quality,'balanced');assert(s.primary.startsWith('#'))});
const on=plan(base);
check('drop has laser and LED',()=>{assert(on.active);assert(on.laserOpacity>0);assert(on.ledGain>0);assert.equal(on.reason,'music')});
for(const [name,patch] of Object.entries({paused:{playing:false},noEvidence:{verified:false},
 manual:{authored:true},blackout:{blackout:true},reduced:{reducedMotion:true},low:{tier:'low'},
 before:{progressMs:-1},after:{progressMs:10000},invalidTime:{progressMs:NaN},invalidInput:{energy:NaN},
 noStage:{active:false},notReactive:{reactive:false},disabled:{settings:{enabled:false}}})){
 check(name,()=>{const c=plan({...base,...patch});assert.equal(c.active,false);assert.equal(c.laserOpacity,0);assert.equal(c.ledGain,0);});}
check('lyrics protector',()=>assert(plan({...base,lyricsProtected:true}).laserOpacity<on.laserOpacity));
check('face protection',()=>assert(plan({...base,vocalFocus:true}).laserOpacity<on.laserOpacity));
check('four performers',()=>assert(plan({...base,groupCount:4}).laserOpacity<on.laserOpacity));
check('balanced tier',()=>assert(plan({...base,tier:'balanced'}).laserOpacity<on.laserOpacity));
check('quality order',()=>{const perf=plan({...base,settings:{...base.settings,quality:'performance'}});const bal=plan({...base,settings:{...base.settings,quality:'balanced'}});assert(perf.laserOpacity<bal.laserOpacity&&bal.laserOpacity<on.laserOpacity)});
check('verse has no laser',()=>assert.equal(plan({...base,section:'verse'}).laserOpacity,0));
check('audio peak matters',()=>assert(plan({...base,kick:0,energy:0,bass:0}).laserOpacity<on.laserOpacity));
check('disabled ribbons',()=>assert.equal(plan({...base,settings:{...base.settings,ribbons:false}}).ribbonGain,0));
check('disabled led',()=>assert.equal(plan({...base,settings:{...base.settings,ledWall:false}}).ledGain,0));
check('ribbons work without laser fans',()=>{const x=plan({...base,settings:{...base.settings,lasers:false}});assert(x.ribbonGain>0&&x.laserOpacity>0)});
check('performance avoids extra laser draw calls',()=>{const x=plan({...base,settings:{...base.settings,quality:'performance'}});assert.equal(x.laserOpacity,0);assert(x.ledGain>0)});
check('seek-stable with no input mutation',()=>{const copy=JSON.stringify(base);assert.deepEqual(plan(base),on);assert.equal(JSON.stringify(base),copy)});
check('edge fade',()=>assert(plan({...base,progressMs:20}).laserOpacity<on.laserOpacity));
console.log(`PASS V810 FX planner: ${n} tests`);
