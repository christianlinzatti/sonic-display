'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/virtualCrowdExperienceV996');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.join(__dirname,'..',f),'utf8');
const base={active:true,count:56,movement:.16,phoneOpacity:.22,lightGain:.17,phase:4.2,primary:'#35bbef',secondary:'#ad68fc'};
const plan={source:'verified-v604',trackId:'song-996',durationMs:180000,scenes:[
 {index:0,startMs:0,endMs:30000,section:'intro',intent:'wide',look:'Intro'},
 {index:1,startMs:30000,endMs:80000,section:'verse',intent:'portrait',look:'Verse'},
 {index:2,startMs:80000,endMs:100000,section:'build',intent:'rise',look:'Build'},
 {index:3,startMs:100000,endMs:125000,section:'drop',intent:'peak',look:'Drop'},
 {index:4,startMs:125000,endMs:145000,section:'hook',intent:'ensemble',look:'Hook'},
 {index:5,startMs:145000,endMs:180000,section:'finale',intent:'wide',look:'Finale'},
]};
const settings={...v.DEFAULT_CROWD_EXPERIENCE_V996,enabled:true};
const fx={active:true,reason:'music',section:'drop',genre:'hardtekk',phase:2.3,primary:base.primary,secondary:base.secondary};
const sceneAt=time=>plan.scenes.find(s=>time>=s.startMs&&time<s.endMs)?.section||'off';
function run(time=112000,patch={}){return v.planCrowdExperienceV996({base,plan,fx:{...fx,section:sceneAt(time)},settings,
 trackId:'song-996',durationMs:180000,positionMs:time,playing:true,autoEnabled:true,
 tier:'high',reducedMotion:false,seekBlocked:false,blackout:false,
 manualLighting:false,manualFx:false,manualCamera:false,lyricsProtected:false,vocalFocus:false,
 energy:.82,kick:.81,...patch});}
let checks=0;const check=(name,fn)=>{try{fn();checks++;console.log('PASS V996 '+name)}catch(e){e.message='V996 '+name+': '+e.message;throw e;}};
check('explicitly opt-in defaults, strict normalization',()=>{
 assert.equal(v.DEFAULT_CROWD_EXPERIENCE_V996.enabled,false);
 assert.equal(v.normalizeCrowdExperienceV996({enabled:'true'}).enabled,false);
 assert.equal(v.normalizeCrowdExperienceV996({style:'flash'}).style,'subtle');
 assert.equal(v.normalizeCrowdExperienceV996({style:'arena'}).style,'arena');
 assert.equal(v.normalizeCrowdExperienceV996({intensity:Infinity}).intensity,55);
 for(const [raw,expected] of [[-100,0],[1000,100],[42.7,43]])assert.equal(v.normalizeCrowdExperienceV996({intensity:raw}).intensity,expected);
 for(const key of ['glowsticks','waves','reactions','protectLyrics']){
  assert.equal(v.normalizeCrowdExperienceV996({[key]:false})[key],false);
  assert.equal(v.normalizeCrowdExperienceV996({[key]:'false'})[key],true);
 }
});
check('verified drop creates bounded reactions, baseline unchanged',()=>{
 const before=JSON.stringify(base),out=run();assert.equal(out.crowdActiveV996,true);
 assert.equal(out.crowdModeV996,'celebration');assert(out.crowdWaveV996>0);
 assert(out.crowdReactionV996>0);assert(out.crowdGlowV996>0);
 assert(out.crowdSticksV996<=24);assert.equal(JSON.stringify(base),before);
 for(const k of Object.keys(base))assert.deepEqual(out[k],base[k]);
});
check('song sections are not guessed and scenes fade smoothly',()=>{
 for(const [time,mode] of [[10000,'calm'],[60000,'groove'],[90000,'wave'],[112000,'celebration'],[130000,'celebration'],[160000,'celebration']]){
  const a=run(time);assert.equal(a.crowdModeV996,mode);assert(a.crowdActiveV996,time+' '+mode);
 }
 assert.equal(run(100000).crowdActiveV996,false);
 assert.equal(run(124999).crowdActiveV996,false);
 assert.equal(run(100500).crowdGlowV996<run(112000).crowdGlowV996,true);
 assert.equal(run(112000,{fx:{...fx,section:'verse'}}).crowdActiveV996,false);
});
check('no unverifiable scene can activate the audience',()=>{
 for(const patch of [
  {plan:null},{plan:{...plan,source:'unavailable'}},
  {plan:{...plan,trackId:'old'}},{plan:{...plan,durationMs:180001}},
  {trackId:'new'}, {durationMs:179999},{fx:{...fx,reason:'prediction'}},
  {fx:{...fx,active:false}},
 ])assert.equal(run(112000,patch).crowdActiveV996,false,JSON.stringify(patch));
});
check('pauses, seeks, manual shows, blackout and camera permissions win',()=>{
 for(const patch of [
  {playing:false},{autoEnabled:false},{seekBlocked:true},{blackout:true},
  {manualLighting:true},{manualFx:true},{manualCamera:true},
  {reducedMotion:true},{tier:'low'}, {lyricsProtected:true},{vocalFocus:true},
  {settings:{...settings,enabled:false}},{settings:{...settings,intensity:0}},
  {base:{...base,active:false}},{base:{...base,count:1}},
  {base:{...base,count:500}},{base:{...base,count:NaN}},
  {positionMs:NaN},{positionMs:-1},{positionMs:180000},
  {energy:NaN},{kick:Infinity},{kick:-1},{energy:1.5},
 ]){
  const b=patch.base??base;
  assert.deepEqual(run(112000,patch),{...b,...v.CROWD_OFF_V996},JSON.stringify(patch));
 }
});
check('individual effects can be disabled without turning on other lanes',()=>{
 for(const [switchKey,signal] of [['waves','crowdWaveV996'],['reactions','crowdReactionV996'],['glowsticks','crowdGlowV996']]){
  const a=run(112000,{settings:{...settings,[switchKey]:false}});
  assert.equal(a[signal],0);if(switchKey==='glowsticks')assert.equal(a.crowdSticksV996,0);
 }
 const c=run(112000,{settings:{...settings,protectLyrics:false},lyricsProtected:true});
 assert.equal(c.crowdActiveV996,true);
});
check('measured kick is required for accent, not for authored scene wave',()=>{
 const a=run(112000,{kick:0}),b=run(112000,{kick:.9});
 assert.equal(a.crowdReactionV996,0);assert(b.crowdReactionV996>0);
 assert(a.crowdWaveV996>0);
});
check('performance governor preserves density and balanced budget',()=>{
 const high=run(),balanced=run(112000,{tier:'balanced'});
 assert.equal(balanced.count,base.count);assert(balanced.crowdSticksV996<=12);
 assert(high.crowdSticksV996<=24);assert(balanced.crowdGlowV996<high.crowdGlowV996);
 assert.equal(run(112000,{base:{...base,count:8}}).crowdSticksV996,4);
 assert.equal(run(112000,{base:{...base,lightGain:0}}).crowdSticksV996,0);
 assert.equal(run(112000,{base:{...base,movement:0}}).crowdWaveV996,0);
});
check('10,000 bounded deterministic frames, no strobes or synthetic sound',()=>{
 for(let k=0;k<10000;k++){
  const time=(k*139)%179999,energy=((k*17)%101)/100,kick=((k*31)%101)/100;
  const a=run(time,{energy,kick});
  assert(Number.isFinite(a.crowdPhaseV996));
  assert(a.crowdWaveV996>=0&&a.crowdWaveV996<=.035);
  assert(a.crowdReactionV996>=0&&a.crowdReactionV996<=.03);
  assert(a.crowdGlowV996>=0&&a.crowdGlowV996<=.32);
  assert(Number.isInteger(a.crowdSticksV996)&&a.crowdSticksV996>=0&&a.crowdSticksV996<=24);
  assert.deepEqual(a,run(time,{energy,kick}));
 }
});
check('track-scoped bridge and clear on stop',()=>{
 const sig={...bridge.OFF_CONCERT_SIGNAL_V882,trackId:'song-996',durationMs:180000,
  playing:true,enabled:true,intensity:.8,sceneSource:'verified',sceneStartMs:100000,
  crowdSettingsV996:{...settings,intensity:500,style:'invalid'}};
 bridge.publishConcertStageSyncV882(sig);
 assert.equal(bridge.readConcertStageSyncV882().crowdSettingsV996.intensity,100);
 assert.equal(bridge.readConcertStageSyncV882().crowdSettingsV996.style,'subtle');
 bridge.publishConcertStageSyncV882({...sig,crowdSettingsV996:{...settings,enabled:false}});
 assert.equal(bridge.readConcertStageSyncV882().crowdSettingsV996.enabled,false);
 bridge.publishConcertStageSyncV882(null);
 assert.equal(bridge.readConcertStageSyncV882().enabled,false);
});
check('UI, render and stage are actually integrated in correct priority order',()=>{
 const ui=read('components/visualizer/LiveFxDeckV881.tsx'),stage=read('components/visualizer/DynamicStage.tsx'),
  render=read('components/visualizer/VirtualConcertCrowdV815.tsx');
 for(const phrase of ['CROWD_EXPERIENCE_KEY_V996','crowdSettingsV996','crowdReadyV996',
  'setCrowdSettingsV996','V996 · Virtual Crowd Experience','protectLyrics'])assert(ui.includes(phrase),phrase);
 assert(stage.indexOf('planCrowdExperienceV996({')>stage.indexOf('planLivingAudienceV973({'));
 assert(stage.indexOf('planCrowdExperienceV996({')>stage.indexOf('planArenaCrowdV893({'));
 for(const phrase of ['v996-virtual-crowd-glowsticks','args={[undefined,undefined,24]}',
  'sticks.instanceMatrix.needsUpdate=true','crowdReactionV996'])assert(render.includes(phrase),phrase);
 assert.equal((render.match(/v996-virtual-crowd-glowsticks/g)||[]).length,1);
});
check('no extra crowd engine, network or physical hardware output',()=>{
 const planner=read('components/visualizer/virtualCrowdExperienceV996.ts');
 for(const bad of ['setInterval(', 'setTimeout(', 'fetch(', 'Math.random(', 'AudioContext(',
  'navigator.', 'govee', 'strobe', 'requestAnimationFrame('])assert(!planner.includes(bad),bad);
 const src=read('components/visualizer/VirtualConcertCrowdV815.tsx');
 assert.equal((src.match(/useFrame\(/g)||[]).length,1);
 assert(!src.includes('Math.random('));
});
check('release version and npm commands',()=>{
 const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
 assert.match(pkg.version,/^0\.1\.0-v(?:99[6-9]|[1-9][0-9]{3,})$/);assert.equal(lock.version,pkg.version);
 assert.equal(lock.packages[''].version,pkg.version);
 assert(pkg.scripts.prebuild.includes('npm run test:v996 && npm run test:v996:types'));
 assert(pkg.scripts['test:v996'].includes('v996-virtual-crowd-experience-regression.cjs'));
 const vercel=read('scripts/vercel-production-build.cjs');assert(vercel.includes('V996 Virtual Crowd Experience'));
});
console.log('V996 Virtual Crowd Experience PASS: '+checks+' groups');
