'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v883=load('components/visualizer/intelligentConcertMomentsV883');
const v882=load('components/visualizer/concertStageSyncV882');
const {buildConcertMomentsV883:build,planConcertMomentV883:plan,
 normalizeConcertMomentsV883:normalize,DEFAULT_CONCERT_MOMENTS_V883:defaults,
 exportConcertMomentsV883:serialize}=v883;
let n=0;
function check(label,fn){try{fn();n++}catch(e){e.message=`V883 ${label}: ${e.message}`;throw e}}
const scenes=[
 {index:0,startMs:0,endMs:32000,section:'verse',intent:'portrait'},
 {index:1,startMs:32000,endMs:53000,section:'build',intent:'rise'},
 {index:2,startMs:53000,endMs:74000,section:'drop',intent:'pulse'},
 {index:3,startMs:74000,endMs:102000,section:'hook',intent:'wide'},
 {index:4,startMs:102000,endMs:120000,section:'outro',intent:'wide'},
];
const timeline={trackId:'song',durationMs:120000,source:'verified-v604',scenes};
const momentPlan=build({timeline,trackId:'song',durationMs:120000});
const activeAt=(positionMs,options={})=>plan({plan:momentPlan,trackId:'song',durationMs:120000,
 positionMs,playing:true,reducedMotion:false,settings:defaults,autoEnabled:true,...options});
check('default settings protect accessibility',()=>assert.deepEqual(defaults,{enabled:true,style:'balanced',showOverlay:true,showCountdown:true}));
check('settings normalize malformed values',()=>{
 for(const v of [null,[],true,'bad',{},42])assert.deepEqual(normalize(v),defaults);
});
check('settings explicitly preserve user switches',()=>assert.deepEqual(normalize({enabled:false,style:'festival',showOverlay:false,showCountdown:false}),
 {enabled:false,style:'festival',showOverlay:false,showCountdown:false}));
check('invalid style rejected',()=>assert.equal(normalize({style:'strobe'}).style,'balanced'));
check('only verified V604 timeline gets a plan',()=>assert.equal(momentPlan.source,'verified-v604'));
check('expected hook/drop/finale remain, irrelevant verse ignored',()=>{
 assert(momentPlan.moments.some(m=>m.kind==='drop'));
 assert(momentPlan.moments.some(m=>m.kind==='finale'));
 assert(!momentPlan.moments.some(m=>m.section==='verse'));
});
check('max six moments, at least 18.5 seconds apart',()=>{
 assert(momentPlan.moments.length<=6);
 for(let i=1;i<momentPlan.moments.length;i++)assert(momentPlan.moments[i].startMs-momentPlan.moments[i-1].startMs>=18500);
});
check('peaks prioritized over busy builds/hooks when close',()=>{
 assert(momentPlan.moments.some(m=>m.kind==='drop'&&m.startMs===53000));
 assert(momentPlan.moments.every(m=>m.kind!=='rise'||Math.abs(m.startMs-53000)>=18500));
});
check('four-act spacing prevents all six effects during opening half',()=>{
 const dense=Array.from({length:24},(_,i)=>({index:i,startMs:i*10000,endMs:(i+1)*10000,
  section:i%3===0?'drop':i%3===1?'hook':'build',intent:i%3===2?'rise':'pulse'}));
 const p=build({timeline:{trackId:'long',durationMs:240000,source:'verified-v604',scenes:dense},
  trackId:'long',durationMs:240000});
 assert(p.moments.length<=6);
 for(let slot=0;slot<4;slot++)assert(p.moments.filter(m=>Math.floor(m.startMs/60000)===slot).length<=2);
 assert(p.moments.some(m=>m.startMs>=120000));
});
check('breath and portrait must never generate show accents',()=>{
 const p=build({timeline:{...timeline,scenes:scenes.map((s,i)=>i===2?{...s,intent:'breath'}:s)},
  trackId:'song',durationMs:120000});
 assert(!p.moments.some(m=>m.kind==='drop'&&m.startMs===53000));
});
check('no made-up events outside verified intervals',()=>{
 for(const m of momentPlan.moments){const scene=scenes[m.sceneIndex];
 assert(m.startMs>=scene.startMs&&m.endMs<=scene.endMs);}
});
check('verified closing scene offers restrained finale within it',()=>{
 const finale=momentPlan.moments.find(m=>m.kind==='finale');assert(finale);
 assert.equal(finale.startMs,113800);assert.equal(finale.endMs,120000);
});
check('no finale when last scene does not cover song end',()=>{
 const p=build({timeline:{...timeline,scenes:[...scenes.slice(0,-1),{...scenes[4],endMs:115000}]},trackId:'song',durationMs:120000});
 assert(!p.moments.some(m=>m.kind==='finale'));
});
check('no finale when scene has unprotected portrait',()=>{
 const p=build({timeline:{...timeline,scenes:[...scenes.slice(0,-1),{...scenes[4],intent:'portrait'}]},trackId:'song',durationMs:120000});
 assert(!p.moments.some(m=>m.kind==='finale'));
});
check('no finale on last verse or break',()=>{
 for(const section of ['verse','break']){
 const p=build({timeline:{...timeline,scenes:[...scenes.slice(0,-1),{...scenes[4],section}]},trackId:'song',durationMs:120000});
 assert(!p.moments.some(m=>m.kind==='finale'));}
});
check('stale track id removes moments',()=>assert.equal(build({timeline,trackId:'different',durationMs:120000}).moments.length,0));
check('stale duration removes moments',()=>assert.equal(build({timeline,trackId:'song',durationMs:121000}).moments.length,0));
check('unverified source removes moments',()=>assert.equal(build({timeline:{...timeline,source:'unavailable'},trackId:'song',durationMs:120000}).moments.length,0));
check('overlapping scenes cannot trigger moments',()=>assert.equal(build({timeline:{...timeline,scenes:[scenes[0],{...scenes[1],startMs:31000},...scenes.slice(2)]},trackId:'song',durationMs:120000}).moments.length,0));
check('nonfinite scene endpoints cannot trigger moments',()=>assert.equal(build({timeline:{...timeline,scenes:scenes.map((s,i)=>i===2?{...s,endMs:Infinity}:s)},trackId:'song',durationMs:120000}).moments.length,0));
check('empty or missing timeline fails closed',()=>{
 assert.equal(build({timeline:null,trackId:'song',durationMs:120000}).source,'unavailable');
 assert.equal(build({timeline:undefined,trackId:'song',durationMs:120000}).moments.length,0);
});
check('off initially, next moment exists',()=>{
 const q=activeAt(10000);assert.equal(q.kind,null);assert(q.next);assert(q.secondsUntilNext>0);
});
check('active drop at verified boundary',()=>{
 const q=activeAt(53300);assert.equal(q.kind,'drop');assert(q.power>0&&q.power<=1);
});
check('no active moment before its exact timestamp',()=>assert.equal(activeAt(52999).kind,null));
check('moment ends after short bounded effect lifetime',()=>assert.equal(activeAt(59000).kind,null));
check('song finale activates only near actual end',()=>{
 assert.equal(activeAt(110000).kind,null);assert.equal(activeAt(115000).kind,'finale');
});
check('paused show never renders a moment or countdown',()=>{
 const q=activeAt(53300,{playing:false});assert.equal(q.kind,null);assert.equal(q.next,null);
});
check('reduced motion disables everything',()=>assert.equal(activeAt(53300,{reducedMotion:true}).kind,null));
check('master auto off disables everything',()=>assert.equal(activeAt(53300,{autoEnabled:false}).kind,null));
check('moments disabled independently',()=>assert.equal(activeAt(53300,{settings:{...defaults,enabled:false}}).kind,null));
check('song change can never replay stale moment',()=>assert.equal(activeAt(53300,{trackId:'next'}).kind,null));
check('duration change can never replay stale moment',()=>assert.equal(activeAt(53300,{durationMs:119000}).kind,null));
check('out of range clock is rejected',()=>{
 for(const p of [NaN,Infinity,-1,121600])assert.equal(activeAt(p).next,null);
});
check('seek backward does not keep future moment active',()=>assert.equal(activeAt(20000).kind,null));
check('style controls a bounded cinematic and festival envelope',()=>{
 const cinematic=activeAt(53800,{settings:{...defaults,style:'cinematic'}});
 const festival=activeAt(53800,{settings:{...defaults,style:'festival'}});
 assert(cinematic.power<festival.power);assert(festival.power<=1);
});
check('quiet scene gets no moment',()=>assert.equal(activeAt(1000).kind,null));
check('exports visual suggestions rather than guessed beats',()=>{
 const obj=JSON.parse(serialize(momentPlan,defaults));
 assert.equal(obj.schema,'sonic-concert-moments-v883');assert.equal(obj.source,'verified-v604-concert-timeline');
 assert.equal(obj.moments.length,momentPlan.moments.length);assert(!Object.hasOwn(obj,'beats'));
});
check('cannot export missing verified plan',()=>assert.equal(serialize(build({timeline:null,trackId:'song',durationMs:120000}),defaults),null));
const signal={trackId:'song',durationMs:120000,playing:true,reducedMotion:false,enabled:true,
 intensity:1,sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:53000,
 manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},
 momentKind:'drop',momentStartMs:53000,momentWeight:1};
const clock={trackId:'song',durationMs:120000,positionMs:53900,playing:true,reducedMotion:false,tier:'high'};
const stage=(sig={},time={})=>v882.planConcertStageV882({...signal,...sig},{...clock,...time});
check('V883 drop reaches actual V882 3D cue',()=>{
 const q=stage();assert(q.ringOpacity>0&&q.beamGain>1&&q.danceGain>1);
});
check('V883 finale emits 3D confetti with fixed renderer',()=>{
 const q=stage({section:'outro',look:'arena',sceneStartMs:102000,momentKind:'finale',momentStartMs:113800},
 {positionMs:115000});assert(q.confettiOpacity>0&&q.confettiProgress>0&&q.confettiProgress<1);
});
check('manual FX overrides automatic moment instead of double firing',()=>{
 const manual=stage({manual:'confetti',manualId:8,manualStartMs:53000});
 const baseline=stage({momentKind:null,manual:'confetti',manualId:8,manualStartMs:53000});
 assert.deepEqual(manual,baseline);
});
check('manual priority is exercised on active overlap',()=>{
 const q=stage({manual:'shockwave',manualId:7,manualStartMs:53000});
 const qBase=stage({momentKind:null,manual:'shockwave',manualId:7,manualStartMs:53000});
 assert.deepEqual(q,qBase);
});
check('authored lighting/blackout and lyrics still win',()=>{
 const q=stage({}, {manualLighting:true,lyricsProtected:true});assert.equal(q.beamGain,1);
 const dark=stage({}, {blackout:true});assert.deepEqual(dark,v882.OFF_CONCERT_STAGE_V882);
});
check('reduced motion/pause/low GPU tier remain protected',()=>{
 assert.equal(stage({}, {reducedMotion:true}).ringOpacity,0);
 assert.equal(stage({}, {playing:false}).ringOpacity,0);
 assert.equal(stage({}, {tier:'low'}).ringOpacity,0);
});
check('dance accents remain bounded (<=12%)',()=>{
 for(const kind of ['rise','hook','drop','finale'])for(let i=0;i<5200;i+=67){
  const q=stage({momentKind:kind},{positionMs:53000+i});assert(q.danceGain>=1&&q.danceGain<=1.12);}
});
check('light gain never exceeds V882 maximum (no strobe)',()=>{
 for(const kind of ['rise','hook','drop','finale'])for(let i=0;i<5200;i+=67){
  const q=stage({momentKind:kind},{positionMs:53000+i});assert(q.beamGain>=1&&q.beamGain<=1.3);}
});
check('wrong track disables all channels',()=>assert.deepEqual(stage({}, {trackId:'another'}),v882.OFF_CONCERT_STAGE_V882));
check('unverified source cannot trigger V883 stage cue',()=>{
 const q=stage({sceneSource:'unavailable',look:'none',section:'drop'});
 assert.equal(q.ringOpacity,0);assert.equal(q.danceGain,1);
});
check('V882 store rejects invalid invented moment payload',()=>{
 v882.publishConcertStageSyncV882({...signal,momentStartMs:-1});assert.equal(v882.readConcertStageSyncV882().momentKind,null);
 v882.publishConcertStageSyncV882({...signal,sceneSource:'unavailable'});assert.equal(v882.readConcertStageSyncV882().momentKind,null);
 v882.publishConcertStageSyncV882(signal);assert.equal(v882.readConcertStageSyncV882().momentKind,'drop');
 v882.publishConcertStageSyncV882(null);
});
const ui=fs.readFileSync('components/visualizer/LiveFxDeckV881.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
check('full V883 show is wired into real V881 live deck',()=>{
 for(const v of ['buildConcertMomentsV883','planConcertMomentV883','exportConcertMomentsV883',
  'concert-moment-options-v883','concert-moments-list-v883','concert-moment-banner-v883'])assert(ui.includes(v),v);
});
check('new 3D cues go through bounded V882 dispatcher',()=>{
 assert(ui.includes('momentKind:momentCue.kind,momentStartMs:momentCue.startMs'));
 assert(ui.includes('publishConcertStageSyncV882({trackId,durationMs,playing'));
});
check('new settings stored independently and guarded on errors',()=>{
 assert(ui.includes('CONCERT_MOMENTS_KEY_V883'));
 assert(ui.includes('window.localStorage.setItem(CONCERT_MOMENTS_KEY_V883'));
 assert(ui.includes('catch {setStorageError(true);}'));
});
check('prefers-reduced-motion disables the banner even in CSS',()=>{
 assert(css.includes('.concert-moment-banner-v883{display:none!important;animation:none!important}'));
 assert(ui.includes('playing,reducedMotion:motionOff,settings:momentSettings'));
});
check('no forced camera, new strobe, or new 3D scene allocations',()=>{
 const core=fs.readFileSync('components/visualizer/intelligentConcertMomentsV883.ts','utf8');
 assert(!core.includes('useFrame(')&&!core.includes('WebGLRenderer'));
 assert(ui.includes('type="button" onClick={exportMoments}'));
});
console.log(`V883 Intelligent Concert Moments: ${n}/${n} tests PASS`);
