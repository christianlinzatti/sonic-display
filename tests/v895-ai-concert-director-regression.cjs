'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/aiConcertDirectorV895');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
let checks=0;
function test(label,fn){try{fn();checks++;}catch(e){e.message=`V895 ${label}: ${e.message}`;throw e;}}
const scenes=[
 {index:0,startMs:0,endMs:20000,section:'intro',intent:'wide'},
 {index:1,startMs:20000,endMs:50000,section:'verse',intent:'portrait'},
 {index:2,startMs:50000,endMs:76000,section:'verse',intent:'portrait'},
 {index:3,startMs:76000,endMs:99000,section:'build',intent:'rise'},
 {index:4,startMs:99000,endMs:119000,section:'drop',intent:'pulse'},
 {index:5,startMs:119000,endMs:143000,section:'break',intent:'breath'},
 {index:6,startMs:143000,endMs:169000,section:'hook',intent:'ensemble'},
 {index:7,startMs:169000,endMs:195000,section:'finale',intent:'wide'},
 {index:8,startMs:195000,endMs:210000,section:'outro',intent:'rest'},
];
const atmosphere={trackId:'v895-track',durationMs:210000,source:'verified-v604',scenes};
const plan=v.buildDirectorPlanV895(atmosphere),settings={...v.DEFAULT_DIRECTOR_V895};
const run=(ms=107000,patch={})=>v.sampleDirectorV895({plan,settings,trackId:'v895-track',durationMs:210000,
 positionMs:ms,playing:true,autoEnabled:true,reducedMotion:false,tier:'high',...patch});
test('default enabled but no fabricated cues',()=>assert.equal(settings.enabled,true));
test('normalized default stable',()=>assert.deepEqual(v.normalizeDirectorV895(undefined),settings));
for(const raw of [null,undefined,{},false,'yes',[],NaN,Infinity,0])test('reject corrupt settings '+String(raw),()=>assert.deepEqual(v.normalizeDirectorV895(raw),settings));
for(const mode of ['balanced','cinematic','festival'])test('style '+mode,()=>assert.equal(v.normalizeDirectorV895({style:mode}).style,mode));
for(const bad of [null,'fast',88,'strobe',{},[]])test('reject style '+String(bad),()=>assert.equal(v.normalizeDirectorV895({style:bad}).style,'balanced'));
for(const value of [-3,0,12.8,50,99.9,100,1000])test('clamp intensity '+value,()=>assert.equal(v.normalizeDirectorV895({intensity:value}).intensity,Math.min(100,Math.max(0,Math.round(value)))));
for(const value of [null,NaN,Infinity,'50',-Infinity])test('invalid intensity '+String(value),()=>assert.equal(v.normalizeDirectorV895({intensity:value}).intensity,60));
for(const flag of ['enabled','protectLyrics','camera','dance','lights','led','stage'])test('boolean '+flag,()=>{assert.equal(v.normalizeDirectorV895({[flag]:false})[flag],false);assert.equal(v.normalizeDirectorV895({[flag]:'false'})[flag],true);});
test('verified scene plan',()=>assert.deepEqual(plan.scenes.map(s=>s.focus),['stage','performer','lyrics','stage','impact','lyrics','ensemble','impact','lyrics']));
test('no fabricated singer IDs',()=>assert(!JSON.stringify(plan).includes('speakerId')));
test('source untouched',()=>{const before=JSON.stringify(atmosphere);v.buildDirectorPlanV895(atmosphere);assert.equal(JSON.stringify(atmosphere),before);});
test('deterministic and no random',()=>assert.deepEqual(v.buildDirectorPlanV895(atmosphere),plan));
for(const bad of [null,undefined,'',{},['bad']])test('reject track '+String(bad),()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,trackId:bad}).source,'unavailable'));
for(const durationMs of [0,9000,Infinity,NaN,1800001])test('invalid song duration '+String(durationMs),()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,durationMs}).source,'unavailable'));
test('unverified plan',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,source:'unavailable'}).source,'unavailable'));
test('missing scenes',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:[]}).source,'unavailable'));
test('overlap is rejected',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:[scenes[0],{...scenes[1],startMs:19000}]}).scenes.length,1));
test('invented section is rejected',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:[{...scenes[0],section:'unverified-drop'}]}).source,'unavailable'));
test('timestamp outside song',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:[{...scenes[0],endMs:999999}]}).source,'unavailable'));
test('bad scene index',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:[{...scenes[0],index:-2}]}).source,'unavailable'));
test('bad intent',()=>assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:[{...scenes[0],intent:'a'.repeat(90)}]}).source,'unavailable'));
test('scene cap 64',()=>{const many=Array.from({length:100},(_,index)=>({index,startMs:index*2000,endMs:(index+1)*2000,section:'verse',intent:'rap'}));assert.equal(v.buildDirectorPlanV895({...atmosphere,scenes:many}).scenes.length,64);});
for(const [name,patch] of [
 ['disabled',{settings:{...settings,enabled:false}}],['zero',{settings:{...settings,intensity:0}}],
 ['all channels disabled',{settings:{...settings,camera:false,dance:false,lights:false,led:false,stage:false}}],
 ['missing plan',{plan:null}],['unverified plan',{plan:{...plan,source:'unavailable'}}],
 ['wrong track',{trackId:'not-the-track'}],['wrong plan track',{plan:{...plan,trackId:'other'}}],
 ['wrong duration',{durationMs:200000}],['wrong plan duration',{plan:{...plan,durationMs:200000}}],
 ['pause',{playing:false}],['auto off',{autoEnabled:false}],['motion off',{reducedMotion:true}],
 ['low tier',{tier:'low'}],['seek',{seekBlocked:true}],['blackout',{blackout:true}],
 ['manual FX',{manualFx:true}],['nan position',{positionMs:NaN}],
 ['negative position',{positionMs:-1}],['past song',{positionMs:210100}],
])test('hard guard '+name,()=>assert.deepEqual(run(107000,patch),v.DIRECTOR_OFF_V895));
for(const [ms,focus] of [[5000,'stage'],[27000,'performer'],[57000,'lyrics'],[81000,'stage'],[104000,'impact'],[127000,'lyrics'],[153000,'ensemble'],[182000,'impact'],[203000,'lyrics']])
 test('scene focus '+focus+' at '+ms,()=>{const c=run(ms);assert.equal(c.focus,focus);assert.equal(c.active,true);});
test('gaps do not invent scenes',()=>assert.deepEqual(run(20500,{plan:v.buildDirectorPlanV895({...atmosphere,scenes:[scenes[0],{...scenes[1],startMs:30000}]})}),v.DIRECTOR_OFF_V895));
test('impact intensifies LED vs lyrics',()=>assert(run(105000).ledGain>run(130000).ledGain));
test('ensemble increases dance vs lyrics',()=>assert(run(153000).danceGain>run(130000).danceGain));
test('portrait protects stage',()=>assert(run(36000).stageGain<run(104000).stageGain));
test('impact camera slows',()=>assert(run(104000).cameraRate<1));
test('manual camera stays neutral',()=>assert.equal(run(104000,{manualCamera:true}).cameraRate,1));
test('manual choreography stays neutral',()=>assert.equal(run(153000,{manualDance:true}).danceGain,1));
test('manual lighting stays neutral',()=>{const c=run(104000,{manualLighting:true});assert.equal(c.lightGain,1);assert.equal(c.ledGain,1);});
test('lyrics camera stays neutral',()=>assert.equal(run(153000,{lyricsProtected:true}).cameraRate,1));
test('vocal focus camera stays neutral',()=>assert.equal(run(153000,{vocalFocus:true}).cameraRate,1));
test('lyrics LED attenuated',()=>assert(run(104000,{lyricsVisible:true}).ledGain<run(104000).ledGain));
test('protection can be disabled',()=>assert.equal(run(104000,{lyricsVisible:true,settings:{...settings,protectLyrics:false}}).ledGain,run(104000,{settings:{...settings,protectLyrics:false}}).ledGain));
for(const k of ['camera','dance','lights','led','stage'])test('individual toggle '+k,()=>{const c=run(153000,{settings:{...settings,[k]:false}});assert.equal(c[({camera:'cameraRate',dance:'danceGain',lights:'lightGain',led:'ledGain',stage:'stageGain'})[k]],1);});
test('low tier excluded, balanced tier reduced',()=>{assert.equal(run(153000,{tier:'low'}).active,false);assert(run(153000,{tier:'balanced'}).ledGain<run(153000).ledGain);});
test('festival more expressive than cinematic',()=>assert(run(153000,{settings:{...settings,style:'festival'}}).danceGain>run(153000,{settings:{...settings,style:'cinematic'}}).danceGain));
test('scene boundary smooth no strobe',()=>{assert.equal(run(99000).ledGain,1);assert(run(99950).ledGain>=1);assert.equal(run(119000).ledGain,1);});
test('entire song bounded finite neutral at all non-cue times',()=>{for(let ms=0;ms<=210000;ms+=97){const c=run(ms);for(const k of ['cameraRate','danceGain','lightGain','ledGain','stageGain']){assert(Number.isFinite(c[k]));assert(c[k]>=.75&&c[k]<=1.12,k);}}});
test('plan exports only verified',()=>assert.equal(v.exportDirectorV895({...plan,source:'unavailable'},settings),null));
test('empty plan not exported',()=>assert.equal(v.exportDirectorV895({...plan,scenes:[]},settings),null));
test('schema is transparent about AI limitations',()=>{const doc=JSON.parse(v.exportDirectorV895(plan,settings));assert.equal(doc.schema,'sonic-ai-concert-director-v895');assert.equal(doc.scenes.length,9);assert.match(doc.note,/Regelbasierte/);});
test('only existing gain multipliers',()=>{const src=read('components/visualizer/aiConcertDirectorV895.ts');for(const forbidden of ['fetch(', 'WebSocket(', 'setInterval(', 'setTimeout(', 'Math.random(', 'requestAnimationFrame(', '<spotLight', 'navigator.'])assert(!src.includes(forbidden),forbidden);});
test('bridge publishes song-scoped plan',()=>{const s={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:99000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},directorPlanV895:plan,directorSettingsV895:settings};bridge.publishConcertStageSyncV882(s);assert.deepEqual(bridge.readConcertStageSyncV882().directorPlanV895,plan);bridge.publishConcertStageSyncV882(null);});
test('bridge rejects cross-song plan',()=>{const s={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:99000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},directorPlanV895:{...plan,trackId:'wrong'},directorSettingsV895:settings};bridge.publishConcertStageSyncV882(s);assert.equal(bridge.readConcertStageSyncV882().directorPlanV895,null);bridge.publishConcertStageSyncV882(null);});
test('stage integrates spotlight ring and led',()=>{const src=read('components/visualizer/DynamicStage.tsx');for(const part of ['sampleDirectorV895({','concertDirectorV895.lightGain','concertDirectorV895.ledGain','concertDirectorV895.stageGain'])assert(src.includes(part),part);});
test('automatic camera integration',()=>{const src=read('components/visualizer/StageCameraDirectorV289.tsx');assert(src.includes('directorCameraV895.cameraRate'));assert(src.includes('manualCamera:!!(editingPose'));});
test('automatic dancer integration',()=>{const src=read('components/visualizer/VisualizerStage.tsx');assert(src.includes('concertDirectorDanceV895.danceGain'));assert(src.includes('manualDance:manualQualityV670.dance'));});
test('live deck settings and export',()=>{const src=read('components/visualizer/LiveFxDeckV881.tsx');for(const part of ['DIRECTOR_KEY_V895','directorReadyV895','setDirectorSettingsV895','V895 · AI Concert Director 3.0','exportDirectorV895Json','directorPlanV895'])assert(src.includes(part),part);});
test('CI has v895 job',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('V895 AI Concert Director 3.0')));
test('lockfile version consistent',()=>{const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));assert.match(p.version,/^0\.1\.0-v(?:895|896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version);});
console.log(`V895 AI Concert Director 3.0 PASS: ${checks} checks`);
