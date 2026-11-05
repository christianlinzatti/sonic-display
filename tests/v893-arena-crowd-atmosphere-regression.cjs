"use strict";
const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/arenaCrowdAtmosphereV893');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=x=>fs.readFileSync(path.resolve(__dirname,'..',x),'utf8');
let checks=0;function check(label,run){try{run();checks++;}catch(e){e.message='V893 '+label+': '+e.message;throw e;}}
const atmosphere={trackId:'track-crowd',durationMs:185000,source:'verified-v604',palette:'electric',scenes:[
 {index:0,startMs:0,endMs:20000,section:'intro',intent:'wide',name:'Intro'},
 {index:1,startMs:20000,endMs:65000,section:'verse',intent:'portrait',name:'Verse'},
 {index:2,startMs:65000,endMs:85000,section:'build',intent:'rise',name:'Rise'},
 {index:3,startMs:85000,endMs:109000,section:'drop',intent:'pulse',name:'Drop'},
 {index:4,startMs:109000,endMs:134000,section:'break',intent:'breath',name:'Breath'},
 {index:5,startMs:134000,endMs:158000,section:'hook',intent:'ensemble',name:'Hook'},
 {index:6,startMs:158000,endMs:185000,section:'finale',intent:'wide',name:'Finale'},
]};
const plan=v.buildArenaCrowdPlanV893(atmosphere);
const settings={...v.DEFAULT_ARENA_CROWD_V893};
const base={active:true,count:56,movement:.16,phoneOpacity:.22,lightGain:.16,phase:1.2,primary:'#18ddee',secondary:'#aa44ff'};
const run=(positionMs=88000,patch={})=>v.planArenaCrowdV893({base,plan,settings,trackId:'track-crowd',durationMs:185000,
 positionMs,playing:true,autoEnabled:true,tier:'high',reducedMotion:false,genre:'Hardtekk',energy:.8,kick:.92,...patch});
check('default style and permissions',()=>{assert.equal(settings.enabled,true);assert.equal(settings.style,'auto');assert.equal(settings.intensity,60);});
check('seven verified chapters',()=>{assert.equal(plan.source,'verified-v604');assert.deepEqual(plan.scenes.map(s=>s.section),['intro','verse','build','drop','break','hook','finale']);});
check('plan immutable',()=>{const before=JSON.stringify(atmosphere);v.buildArenaCrowdPlanV893(atmosphere);assert.equal(JSON.stringify(atmosphere),before);});
check('plan deterministic',()=>assert.deepEqual(v.buildArenaCrowdPlanV893(atmosphere),plan));
for(const raw of [undefined,null,[],false,'bad',{},0,NaN,Infinity])check('normalize '+String(raw),()=>assert.deepEqual(v.normalizeArenaCrowdV893(raw),settings));
for(const style of ['auto','cinematic','balanced','festival'])check('style '+style,()=>assert.equal(v.normalizeArenaCrowdV893({style}).style,style));
for(const bad of ['flash','loud','',42,null,{}])check('style rejected '+String(bad),()=>assert.equal(v.normalizeArenaCrowdV893({style:bad}).style,'auto'));
for(const intensity of [-50,-0.8,0,3.2,64.6,100,900])check('intensity capped '+intensity,()=>assert.equal(v.normalizeArenaCrowdV893({intensity}).intensity,Math.max(0,Math.min(100,Math.round(intensity)))));
for(const bad of ['55',NaN,Infinity,-Infinity,null])check('invalid intensity '+String(bad),()=>assert.equal(v.normalizeArenaCrowdV893({intensity:bad}).intensity,60));
for(const key of ['enabled','phones','waves','silhouettes','protectLyrics'])check('boolean '+key,()=>{assert.equal(v.normalizeArenaCrowdV893({[key]:false})[key],false);assert.equal(v.normalizeArenaCrowdV893({[key]:'false'})[key],true);});
for(const [label,patch] of [
 ['no plan',{plan:null}],['unverified',{plan:{...plan,source:'unavailable'}}],
 ['other track',{trackId:'other'}],['other plan track',{plan:{...plan,trackId:'other'}}],
 ['other duration',{durationMs:184000}],['other plan duration',{plan:{...plan,durationMs:184000}}],
 ['paused',{playing:false}],['off',{settings:{...settings,enabled:false}}],['zero',{settings:{...settings,intensity:0}}],
 ['master off',{autoEnabled:false}],['reduced',{reducedMotion:true}],['seek',{seekBlocked:true}],
 ['blackout',{blackout:true}],['manual light',{manualLighting:true}],['manual fx',{manualFx:true}],['manual camera',{manualCamera:true}],
 ['low',{tier:'low'}],['base off',{base:{...base,active:false}}],['one person',{base:{...base,count:1}}],
 ['too many people',{base:{...base,count:999}}],['not integer',{base:{...base,count:2.5}}],
 ['invalid cue',{base:{...base,phoneOpacity:NaN}}],['invalid time',{positionMs:NaN}],
 ['negative time',{positionMs:-1}],['at end',{positionMs:185000}],['outside scene',{positionMs:186000}],
 ])check('protection '+label,()=>assert.deepEqual(run(88000,patch),{...(patch.base||base),...v.ARENA_CROWD_OFF_V893}));
for(const [when,label] of [[5000,'intro'],[28000,'verse'],[71000,'build'],[88000,'drop'],[120000,'break'],[145000,'hook'],[175000,'finale']])
 check('chapter '+label,()=>{const c=run(when);assert.equal(c.arenaMoodV893,label);assert.equal(c.arenaActiveV893,true);});
check('hardtekk festival more lively',()=>assert(run(88000).arenaWaveV893>run(88000,{genre:'Deutschrap'}).arenaWaveV893));
check('style cinema lower than festival',()=>assert(run(88000,{settings:{...settings,style:'cinematic'}}).arenaPhonePulseV893<run(88000,{settings:{...settings,style:'festival'}}).arenaPhonePulseV893));
check('balanced less than high',()=>assert(run(88000,{tier:'balanced'}).arenaWaveV893<run(88000).arenaWaveV893));
check('energy responsive bounded',()=>{const a=run(88000,{energy:0,kick:0});const b=run(88000,{energy:1,kick:1});assert(b.arenaWaveV893>a.arenaWaveV893);});
for(const guard of ['lyricsProtected','lyricsVisible','vocalFocus'])check('lyrics/camera quiet '+guard,()=>{
 const c=run(88000,{[guard]:true});assert(c.arenaWaveV893<run().arenaWaveV893);assert(c.arenaPhonePulseV893<run().arenaPhonePulseV893);});
check('lyrics guard optional',()=>assert.equal(run(88000,{settings:{...settings,protectLyrics:false},lyricsVisible:true}).arenaWaveV893,run(88000,{settings:{...settings,protectLyrics:false}}).arenaWaveV893));
for(const key of ['phones','waves','silhouettes'])check('independent user switch '+key,()=>{
 const c=run(88000,{settings:{...settings,[key]:false}});
 assert.equal(c[key==='phones'?'arenaPhonePulseV893':key==='waves'?'arenaWaveV893':'arenaSilhouetteV893'],0);
});
check('no phones resurrected',()=>{const c=run(88000,{base:{...base,phoneOpacity:0}});assert.equal(c.arenaPhonePulseV893,0);assert.equal(c.phoneOpacity,0);});
check('no silhouettes resurrected',()=>{const c=run(88000,{base:{...base,lightGain:0}});assert.equal(c.arenaSilhouetteV893,0);assert.equal(c.lightGain,0);});
check('no dance resurrected',()=>{const c=run(88000,{base:{...base,movement:0}});assert.equal(c.arenaWaveV893,0);assert.equal(c.movement,0);});
check('quiet break quieter than drop',()=>assert(run(120000).arenaWaveV893<run(88000).arenaWaveV893));
check('fade in/out avoids sudden chapter cuts',()=>{assert(!run(85000).arenaActiveV893);assert(run(86000).arenaPhonePulseV893>0);assert(!run(108999).arenaActiveV893);});
check('no source cannot create verified plan',()=>assert.equal(v.buildArenaCrowdPlanV893({...atmosphere,source:'unavailable'}).source,'unavailable'));
for(const bad of ['',{length:0},null])check('invalid track '+String(bad),()=>assert.equal(v.buildArenaCrowdPlanV893({...atmosphere,trackId:bad}).source,'unavailable'));
check('overlap discarded',()=>assert.equal(v.buildArenaCrowdPlanV893({...atmosphere,scenes:[atmosphere.scenes[0],{...atmosphere.scenes[1],startMs:15000}]}).scenes.length,1));
check('no counterfeit sections',()=>assert.equal(v.buildArenaCrowdPlanV893({...atmosphere,scenes:[{...atmosphere.scenes[0],section:'imagined-drop'}]}).source,'unavailable'));
check('export verified',()=>{const o=JSON.parse(v.exportArenaCrowdV893(plan,settings));assert.equal(o.schema,'sonic-arena-crowd-v893');assert.equal(o.scenes.length,7);});
check('no unverifiable export',()=>assert.equal(v.exportArenaCrowdV893({...plan,source:'unavailable'},settings),null));
check('no empty export',()=>assert.equal(v.exportArenaCrowdV893({...plan,scenes:[]},settings),null));
check('deterministic through song',()=>{for(let time=0;time<185000;time+=173){const c=run(time);assert(c.movement<=.22&&c.phoneOpacity<=.38&&c.lightGain<=.25);assert(c.arenaWaveV893<=.25&&c.arenaPhonePulseV893<=.55&&c.arenaSilhouetteV893<=.16);}});
check('no new drawcalls',()=>{const src=read('components/visualizer/VirtualConcertCrowdV815.tsx');assert(src.includes('phone.setColorAt'));assert(src.includes('arenaWave'));assert(src.includes('20 Hz'));assert(!src.includes('new Color('+'cue.'));});
check('stage after concert arc',()=>{const src=read('components/visualizer/DynamicStage.tsx');assert(src.includes('planArenaCrowdV893'));assert(src.indexOf('planArenaCrowdV893({')>src.indexOf('applyConcertArcCrowdV880('));assert(src.includes('manualCamera:cameraNarrativeV605?.manualCamera'));});
check('UI persisted',()=>{const src=read('components/visualizer/LiveFxDeckV881.tsx');for(const value of ['ARENA_CROWD_KEY_V893','arenaReadyV893','setArenaSettingsV893','arenaPlanV893','V893 · Arena Crowd Atmosphere','exportArenaCrowdV893'])assert(src.includes(value),value);});
check('bridge verification',()=>{const input={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:85000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},arenaSettingsV893:settings,arenaPlanV893:plan};bridge.publishConcertStageSyncV882(input);assert.deepEqual(bridge.readConcertStageSyncV882().arenaPlanV893,plan);assert.deepEqual(bridge.readConcertStageSyncV882().arenaSettingsV893,settings);bridge.publishConcertStageSyncV882(null);});
check('bridge declines wrong song',()=>{const input={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:85000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},arenaSettingsV893:settings,arenaPlanV893:{...plan,trackId:'wrong'}};bridge.publishConcertStageSyncV882(input);assert.equal(bridge.readConcertStageSyncV882().arenaPlanV893,null);bridge.publishConcertStageSyncV882(null);});
check('no timers network or physical outputs',()=>{const src=read('components/visualizer/arenaCrowdAtmosphereV893.ts');for(const forbidden of ['setTimeout(', 'setInterval(', 'fetch(', 'navigator.', 'Math.random(', 'requestAnimationFrame(', 'strobeGain', 'hardware'])assert(!src.includes(forbidden),forbidden);});
check('lockfile version',()=>{const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('v').at(-1))>=893);assert.equal(lock.version,pkg.version);assert.equal(lock.packages[''].version,pkg.version);});
check('CI test registered',()=>{const flow=read('.github/workflows/v832-continuous-validation.yml');assert(flow.includes('V893 Arena Crowd Atmosphere'));});
console.log('V893 Arena Crowd Atmosphere PASS: '+checks+' checks');
