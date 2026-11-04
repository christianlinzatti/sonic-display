'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/epicDropExperienceV892');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
let count=0;function test(name,fn){try{fn();count++;}catch(e){e.message='V892 '+name+': '+e.message;throw e;}}
const moment={trackId:'sonic-892',durationMs:150000,source:'verified-v604',moments:[
 {id:'1-rise',sceneIndex:1,kind:'rise',startMs:20000,endMs:35000,label:'Rise'},
 {id:'2-drop',sceneIndex:2,kind:'drop',startMs:40000,endMs:58000,label:'Drop'},
 {id:'3-hook',sceneIndex:3,kind:'hook',startMs:68000,endMs:80000,label:'Hook'},
 {id:'4-drop',sceneIndex:4,kind:'drop',startMs:90000,endMs:105000,label:'Second Drop'},
 {id:'5-finale',sceneIndex:5,kind:'finale',startMs:145000,endMs:150000,label:'Finale'},
]};
const plan=v.buildEpicDropPlanV892(moment);
const settings={...v.DEFAULT_EPIC_DROP_V892};
const sample=(time=41000,patch={})=>v.sampleEpicDropV892({plan,settings,trackId:'sonic-892',durationMs:150000,
 positionMs:time,playing:true,autoEnabled:true,reducedMotion:false,tier:'high',...patch});
test('default on, nonstrobing coordinated show',()=>{assert.equal(settings.enabled,true);assert.equal(settings.style,'balanced');assert.equal(settings.intensity,65);});
test('verified show source',()=>assert.equal(plan.source,'verified-v604'));
test('filter non drops',()=>assert.deepEqual(plan.beats.map(x=>x.kind),['drop','drop','finale']));
test('explicit timeline is not mutated',()=>{const a=JSON.stringify(moment);v.buildEpicDropPlanV892(moment);assert.equal(JSON.stringify(moment),a);});
test('plan sorted and deterministic',()=>assert.deepEqual(v.buildEpicDropPlanV892(moment),plan));
test('unverified rejected',()=>assert.deepEqual(v.buildEpicDropPlanV892({...moment,source:'unavailable'}).beats,[]));
test('empty track rejected',()=>assert.equal(v.buildEpicDropPlanV892({...moment,trackId:''}).source,'unavailable'));
for(const raw of [undefined,null,{},[],false,'foo',NaN,0,Infinity])test('normalize '+String(raw),()=>assert.deepEqual(v.normalizeEpicDropV892(raw),settings));
for(const style of ['cinematic','balanced','festival'])test('accept '+style,()=>assert.equal(v.normalizeEpicDropV892({style}).style,style));
for(const val of [-30,0,44.6,100,333])test('clamp intensity '+val,()=>assert.equal(v.normalizeEpicDropV892({intensity:val}).intensity,Math.min(100,Math.max(0,Math.round(val)))));
for(const val of ['50',NaN,Infinity,-Infinity,null])test('invalid intensity '+val,()=>assert.equal(v.normalizeEpicDropV892({intensity:val}).intensity,65));
for(const bad of ['loud','strobe','<script>',12,null])test('invalid style '+bad,()=>assert.equal(v.normalizeEpicDropV892({style:bad}).style,'balanced'));
for(const flag of ['enabled','protectLyrics','stage','led','laser','spotlight','pyro','dance','camera']){
 test('normalize boolean '+flag,()=>{assert.equal(v.normalizeEpicDropV892({[flag]:false})[flag],false);assert.equal(v.normalizeEpicDropV892({[flag]:'false'})[flag],settings[flag]);});
}
for(const [time,phase] of [[39999,'idle'],[40000,'idle'],[40350,'impact'],[40900,'drive'],[42700,'release'],[44100,'idle'],[90100,'impact'],[91000,'drive'],[146000,'drive'],[149900,'idle']])
 test('playback '+time,()=>assert.equal(sample(time).phase,phase));
test('all channels modulated in drop',()=>{const c=sample(41000);for(const f of ['ringGain','ledGain','laserGain','spotlightGain','pyroGain','danceGain'])assert(c[f]>1,f);assert(c.cameraRate<1);});
test('does not create a new moment outside drop',()=>assert.deepEqual(sample(72000),v.EPIC_DROP_OFF_V892));
test('staged palette',()=>{assert(sample(40400).ringGain>sample(42000).ringGain);assert(sample(41000).laserGain>sample(40400).laserGain);});
test('cinematic lower than festival',()=>assert(sample(41000,{settings:{...settings,style:'festival'}}).power>sample(41000,{settings:{...settings,style:'cinematic'}}).power));
test('balanced tier lower',()=>assert(sample(41000,{tier:'balanced'}).power<sample(41000).power));
test('lyrics protection preserves muted moment',()=>{const a=sample(41000,{lyricsProtected:true});assert(a.active);assert(a.power<sample(41000).power);assert.equal(a.cameraRate,1);assert.equal(a.spotlightGain,1);});
test('lyrics opt out',()=>assert.equal(sample(41000,{lyricsProtected:true,settings:{...settings,protectLyrics:false}}).power,sample(41000).power));
test('manual lighting keeps visual stage only',()=>{const c=sample(41000,{manualLighting:true});assert(c.active);for(const f of ['ledGain','laserGain','spotlightGain','pyroGain'])assert.equal(c[f],1);assert(c.ringGain>1);});
test('manual camera leaves other channels untouched',()=>{const c=sample(41000,{manualCamera:true});assert.equal(c.cameraRate,1);assert(c.ledGain>1);});
test('manual dancer leaves automatic stage ring',()=>{const c=sample(41000,{manualDance:true});assert.equal(c.danceGain,1);assert(c.ringGain>1);});
for(const key of ['stage','led','laser','spotlight','pyro','dance','camera'])test('disabled channel '+key,()=>{const c=sample(41000,{settings:{...settings,[key]:false}});const field=key==='stage'?'ringGain':key==='camera'?'cameraRate':key+'Gain';assert.equal(c[field],1);});
for(const [name,patch] of [
 ['off',{settings:{...settings,enabled:false}}],['zero',{settings:{...settings,intensity:0}}],['master',{autoEnabled:false}],
 ['pause',{playing:false}],['reduced',{reducedMotion:true}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],['manualFX',{manualFx:true}],
 ['low',{tier:'low'}],['track',{trackId:'another'}],['duration',{durationMs:120000}],
 ['missing',{plan:null}],['unverified',{plan:{...plan,source:'unavailable'}}],['stale',{plan:{...plan,trackId:'another'}}],
 ['wrongDuration',{plan:{...plan,durationMs:120000}}],['NaN',{positionMs:NaN}],['infinite',{positionMs:Infinity}],
 ['negative',{positionMs:-100}],['afterSong',{positionMs:150000}],['tooShort',{durationMs:9000}],['tooLong',{durationMs:2400000}],
 ])test('guard '+name,()=>assert.deepEqual(sample(41000,patch),v.EPIC_DROP_OFF_V892));
test('power and boosts are capped across the whole song',()=>{for(let t=0;t<150000;t+=151){const c=sample(t,{settings:{...settings,intensity:100,style:'festival'}});assert(c.power>=0&&c.power<=1);assert(c.ringGain<=1.3);assert(c.ledGain<=1.2);assert(c.laserGain<=1.2);assert(c.spotlightGain<=1.1);assert(c.pyroGain<=1.13);assert(c.danceGain<=1.07);assert(c.cameraRate>=.77);}});
test('export verified cues',()=>{const raw=v.exportEpicDropPlanV892(plan,settings);const o=JSON.parse(raw);assert.equal(o.schema,'sonic-epic-drop-experience-v892');assert.equal(o.beats.length,3);assert(!raw.includes('strobeGain'));});
test('export missing denied',()=>assert.equal(v.exportEpicDropPlanV892({...plan,source:'unavailable'},settings),null));
test('export empty denied',()=>assert.equal(v.exportEpicDropPlanV892({...plan,beats:[]},settings),null));
test('bridge field added',()=>{bridge.publishConcertStageSyncV882({trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,
 sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:40000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},epicPlanV892:plan,epicSettingsV892:settings});
 assert.deepEqual(bridge.readConcertStageSyncV882().epicSettingsV892,settings);
 assert.deepEqual(bridge.readConcertStageSyncV882().epicPlanV892,plan);
 bridge.publishConcertStageSyncV882(null);});
test('bridge declines stale plans',()=>{bridge.publishConcertStageSyncV882({trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,
 sceneSource:'verified',section:'drop',look:'neon',sceneStartMs:40000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},epicPlanV892:{...plan,trackId:'wrong'},epicSettingsV892:settings});
 assert.equal(bridge.readConcertStageSyncV882().epicPlanV892,null);bridge.publishConcertStageSyncV882(null);});
test('UI is real, persisted, guarded',()=>{const s=read('components/visualizer/LiveFxDeckV881.tsx');for(const k of ['EPIC_DROP_KEY_V892','setEpicSettingsV892','epicReadyV892','epicSettingsV892:normalizeEpicDropV892','epicPlanV892','V892 · Epic Drop Experience','exportEpicDropPlanV892'])assert(s.includes(k),k);});
test('stage applies only existing gains',()=>{const s=read('components/visualizer/DynamicStage.tsx');for(const k of ['sampleEpicDropV892({','ringOpacity:Math.min(.46','laserShowV888.power*epicV892.laserGain','ledCreativeV886.power*epicV892.ledGain','livePyroV891.current.active'])assert(s.includes(k),k);});
test('camera uses the existing automatic camera only',()=>{const s=read('components/visualizer/StageCameraDirectorV289.tsx');assert(s.includes('v892Camera.cameraRate'));assert(s.includes('manualCamera:!!(editingPose'));});
test('dancers are automatic and capped',()=>{const s=read('components/visualizer/VisualizerStage.tsx');assert(s.includes('epicDanceGainV892'));assert(s.includes('Math.min(1.12'));assert(s.includes('manualDance:manualQualityV670.dance'));});
test('no timers, hardware, strobe or network',()=>{const s=read('components/visualizer/epicDropExperienceV892.ts');assert(!/setInterval\(|setTimeout\(|fetch\(|WebSocket\(|navigator\.serial|strobeGain|new SpotLight|new Camera/.test(s));});
test('package versions agree',()=>{const a=JSON.parse(read('package.json')),b=JSON.parse(read('package-lock.json'));assert.match(a.version,/^0\.1\.0-v(?:892|893|894|895|896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(b.version,a.version);assert.equal(b.packages[''].version,a.version);});
test('CI wired',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('npm run test:v892:ui-types')));
test('Windows checks wired',()=>assert(read('scripts/verify-v892-windows.ps1').includes('verify:v892:focused')));
console.log(`V892 Epic Drop Experience: PASS ${count} checks`);
