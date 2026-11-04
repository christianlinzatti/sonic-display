'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/musicalEnergyIntelligenceV896');
const dir=load('components/visualizer/aiConcertDirectorV895');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=p=>fs.readFileSync(path.resolve(__dirname,'..',p),'utf8');
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=`V896 ${name}: ${e.message}`;throw e;}}
const settings={...v.DEFAULT_ENERGY_V896};
const atmosphere={trackId:'measured-track',durationMs:180000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:30000,section:'verse',intent:'portrait'},
 {index:1,startMs:30000,endMs:60000,section:'build',intent:'rise'},
 {index:2,startMs:60000,endMs:90000,section:'drop',intent:'pulse'},
 {index:3,startMs:90000,endMs:120000,section:'hook',intent:'ensemble'},
 {index:4,startMs:120000,endMs:180000,section:'outro',intent:'rest'}]};
const plan=dir.buildDirectorPlanV895(atmosphere);
const audio=(energyEnvelope=.6,bass=.6,attack=.3,kickAccentIntensity=.2)=>({energyEnvelope,bass,attack,kickAccentIntensity});
const frame=(positionMs=70000,audioValue=audio(),patch={})=>({trackId:'measured-track',durationMs:180000,positionMs,playing:true,audio:audioValue,...patch});
function series(start=68000,n=20,step=120,values=audio()){
 let s=null;
 for(let j=0;j<n;j++)s=v.advanceEnergyV896(s,frame(start+j*step,typeof values==='function'?values(j):values));
 return s;
}
const state=series();
const sample=(patch={})=>v.sampleEnergyV896({state,plan,settings,trackId:state.trackId,
 durationMs:state.durationMs,positionMs:state.positionMs,playing:true,autoEnabled:true,
 directorEnabled:true,tier:'high',reducedMotion:false,...patch});
check('default measured-energy module is enabled, but never invents sound',()=>{assert.equal(settings.enabled,true);assert.equal(v.advanceEnergyV896(null,frame(1200,audio(0,0,0,0))),null);});
check('settings stable default',()=>assert.deepEqual(v.normalizeEnergyV896(undefined),settings));
for(const bad of [null,undefined,[],false,'yes',0,NaN,Infinity,{},new Date()])check('invalid settings '+String(bad),()=>assert.deepEqual(v.normalizeEnergyV896(bad),settings));
for(const style of ['subtle','balanced','expressive'])check('style '+style,()=>assert.equal(v.normalizeEnergyV896({style}).style,style));
for(const style of [null,'fast','strobe',88,{},[]])check('invalid style '+String(style),()=>assert.equal(v.normalizeEnergyV896({style}).style,'balanced'));
for(const val of [-20,0,4.3,40.4,85,99.9,100,999])check('sensitivity clamp '+val,()=>assert.equal(v.normalizeEnergyV896({sensitivity:val}).sensitivity,Math.max(0,Math.min(100,Math.round(val)))));
for(const val of [null,NaN,Infinity,'50',-Infinity])check('invalid sensitivity '+String(val),()=>assert.equal(v.normalizeEnergyV896({sensitivity:val}).sensitivity,60));
for(const flag of ['enabled','protectLyrics','dynamics','bass','camera','dance','lights','led'])check('boolean '+flag,()=>{assert.equal(v.normalizeEnergyV896({[flag]:false})[flag],false);assert.equal(v.normalizeEnergyV896({[flag]:'false'})[flag],true);});
check('normalized audio source',()=>{assert(state);assert.equal(state.source,'live-normalized-audio');assert(state.samples>=3);});
check('finite bounded EMA',()=>{assert(state.smoothed>=0&&state.smoothed<=1);assert(state.baseline>=0&&state.baseline<=1);assert(state.bass>=0&&state.bass<=1);});
check('real silence not a fake beat',()=>assert.equal(v.advanceEnergyV896(state,frame(state.positionMs+100,audio(0,0,0,0))),null));
for(const obj of [null,undefined,{}, {energyEnvelope:.7}, {bass:.3}, {energyEnvelope:NaN,bass:.2},
 {energyEnvelope:Infinity,bass:.2},{energyEnvelope:-.1,bass:.2},{energyEnvelope:1.001,bass:.2},
 {energyEnvelope:.5,bass:NaN},{energyEnvelope:.5,bass:-.1},{energyEnvelope:.5,bass:1.01},
 {energyEnvelope:.5,bass:.5,attack:5},{energyEnvelope:.5,bass:.5,kickAccentIntensity:Infinity}])
 check('invalid audio '+JSON.stringify(obj),()=>assert.equal(v.advanceEnergyV896(state,{...frame(70500),audio:obj}),null));
for(const patch of [
 {trackId:''},{trackId:'x'.repeat(161)},{durationMs:NaN},{durationMs:0},{durationMs:1800001},
 {positionMs:NaN},{positionMs:-1},{positionMs:180000},{playing:false}])
 check('invalid playback '+JSON.stringify(patch),()=>assert.equal(v.advanceEnergyV896(state,frame(70500,audio(),patch)),null));
check('same audio progress tick does not reset EMA',()=>assert.equal(v.advanceEnergyV896(state,frame(state.positionMs)),state));
check('R3F elapsed frame advances even at fixed Spotify progress',()=>{const x=v.advanceEnergyV896(state,{...frame(state.positionMs,audio(.93,.8)),elapsedMs:16});assert(x.samples===state.samples+1);assert(x.positionMs===state.positionMs);assert(x.smoothed>state.smoothed);});
check('one-second Spotify polling tick does not reset live energy',()=>{const x=v.advanceEnergyV896(state,{...frame(state.positionMs+1000,audio(.8,.8)),elapsedMs:16});assert.equal(x.samples,state.samples+1);});
check('track switch resets sample count',()=>{const s=v.advanceEnergyV896(state,frame(70300,audio(),{trackId:'other'}));assert.equal(s.samples,1);assert.equal(s.trackId,'other');});
check('duration switch resets sample count',()=>assert.equal(v.advanceEnergyV896(state,frame(70300,audio(),{durationMs:150000})).samples,1));
check('large seek resets baseline',()=>{const s=v.advanceEnergyV896(state,frame(90000,audio(.9,.9)));assert.equal(s.samples,1);assert.equal(s.baseline,.9);});
check('rewind resets baseline',()=>assert.equal(v.advanceEnergyV896(state,frame(1000,audio(.2,.2))).samples,1));
check('beat pulse decays without kick',()=>{const a=v.advanceEnergyV896(null,frame(50000,audio(.6,.6,1,1)));const b=v.advanceEnergyV896(a,frame(50400,audio(.6,.6,0,0)));assert(b.pulse<a.pulse);assert(b.pulse>0);});
check('short-term rise affects positive trend',()=>{const s=series(66000,30,130,j=>j<18?audio(.23,.18,0,0):audio(.92,.8,.8,.6));assert(s.trend>.05);});
check('long-term baseline adapts',()=>{const s=series(50000,180,300, j=>j<60?audio(.25,.1,0,0):audio(.8,.8,.1,.2));assert(s.baseline>.25);assert(s.baseline<.81);});
check('all playback metrics finite under extremes',()=>{let s=null;for(let j=0;j<1400;j++){s=v.advanceEnergyV896(s,frame(1000+j*120,audio(j%2,1-j%2,j%7===0?1:0,0)));for(const k of ['smoothed','baseline','bass','pulse'])assert(Number.isFinite(s[k])&&s[k]>=0&&s[k]<=1);assert(Number.isFinite(s.trend));}});
check('verified measured activation',()=>{const c=sample();assert(c.active);assert.equal(c.source,'measured');assert(c.mood);});
for(const [name,patch] of [
 ['disabled',{settings:{...settings,enabled:false}}],['zero sensitivity',{settings:{...settings,sensitivity:0}}],
 ['no measurements',{state:null}],['invalid state source',{state:{...state,source:'fake'}}],
 ['too few samples',{state:{...state,samples:2}}],['unverified plan',{plan:{...plan,source:'unavailable'}}],
 ['missing plan',{plan:null}],['wrong track',{trackId:'different'}],['wrong state track',{state:{...state,trackId:'different'}}],
 ['wrong plan track',{plan:{...plan,trackId:'different'}}],['wrong duration',{durationMs:170000}],
 ['stale frame',{positionMs:state.positionMs+1000}],['negative progress',{positionMs:-1}],
 ['pause',{playing:false}],['global auto off',{autoEnabled:false}],['director off',{directorEnabled:false}],
 ['reduced motion',{reducedMotion:true}],['low tier',{tier:'low'}],['seek',{seekBlocked:true}],
 ['blackout',{blackout:true}],['manual FX',{manualFx:true}],
 ['no channels',{settings:{...settings,camera:false,dance:false,lights:false,led:false}}],
 ['no metric kinds',{settings:{...settings,dynamics:false,bass:false}}],
 ['invalid smoothed',{state:{...state,smoothed:Infinity}}],['invalid trend',{state:{...state,trend:NaN}}],
 ['invalid pulse',{state:{...state,pulse:-1}}],
 ])check('hard guard '+name,()=>assert.deepEqual(sample(patch),v.ENERGY_OFF_V896));
check('no scene inventing',()=>assert.deepEqual(sample({plan:{...plan,scenes:[]}}),v.ENERGY_OFF_V896));
check('manual camera neutral',()=>assert.equal(sample({manualCamera:true}).cameraRate,1));
check('manual dance neutral',()=>assert.equal(sample({manualDance:true}).danceGain,1));
check('manual lighting neutral',()=>{const x=sample({manualLighting:true});assert.equal(x.lightGain,1);assert.equal(x.ledGain,1);});
check('lyrics protect lights and camera',()=>{const x=sample({lyricsProtected:true});assert.equal(x.cameraRate,1);assert.equal(x.lightGain,1);});
check('lyrics reduce LED',()=>assert(Math.abs(sample({lyricsVisible:true}).ledGain-1)<=Math.abs(sample().ledGain-1)));
check('lyrics protection can be switched off',()=>assert.equal(sample({lyricsProtected:true,settings:{...settings,protectLyrics:false}}).lightGain,sample({settings:{...settings,protectLyrics:false}}).lightGain));
for(const [key,gain] of [['camera','cameraRate'],['dance','danceGain'],['lights','lightGain'],['led','ledGain']])
 check('channel '+key,()=>assert.equal(sample({settings:{...settings,[key]:false}})[gain],1));
check('subtle quieter than expressive',()=>assert(Math.abs(sample({settings:{...settings,style:'subtle'}}).ledGain-1)<Math.abs(sample({settings:{...settings,style:'expressive'}}).ledGain-1)));
check('balanced tier reduces strength',()=>assert(Math.abs(sample({tier:'balanced'}).danceGain-1)<Math.abs(sample().danceGain-1)));
check('verse music does not exceed drop music',()=>{const verseState={...state,positionMs:19500},x=sample({state:verseState,positionMs:19500});assert(Math.abs(x.ledGain-1)<Math.abs(sample().ledGain-1));});
check('quiet measurements can gently reduce impact',()=>{const q=series(68000,20,120,audio(.05,.015,0,0)),a=sample({state:q,positionMs:q.positionMs});assert(a.active);assert(a.ledGain<=1);});
check('trend label is bounded',()=>{for(const x of [.02,.2,.5,.85]){const s={...state,smoothed:x};assert(['quiet','steady','rising','high'].includes(sample({state:s}).mood));}});
check('bounded modifiers across 10k measured samples',()=>{for(let j=0;j<10000;j++){const s={...state,smoothed:(j%100)/100,baseline:((j*37)%100)/100,bass:((j*53)%100)/100,pulse:((j*19)%100)/100,trend:((j%200)-100)/100};const c=sample({state:s});for(const k of ['cameraRate','danceGain','lightGain','ledGain'])assert(Number.isFinite(c[k])&&c[k]>=.91&&c[k]<=1.10);}});
check('song-scoped live bridge',()=>{v.publishEnergyV896(state);assert.equal(v.readEnergyV896(state.trackId,state.durationMs,state.positionMs),state);assert.equal(v.readEnergyV896('other',state.durationMs,state.positionMs),null);assert.equal(v.readEnergyV896(state.trackId,state.durationMs,1),null);v.publishEnergyV896(null);assert.equal(v.readEnergyV896(state.trackId,state.durationMs,state.positionMs),null);});
check('verified snapshot export only',()=>{assert.equal(v.exportEnergyV896(null,settings),null);assert.equal(v.exportEnergyV896({...state,samples:2},settings),null);const j=JSON.parse(v.exportEnergyV896(state,settings));assert.equal(j.schema,'sonic-musical-energy-v896');assert.equal(j.source,'live-normalized-audio');assert.match(j.note,/NOT a full-song/);assert(!('scenes' in j));});
check('no external AI or render objects',()=>{const src=read('components/visualizer/musicalEnergyIntelligenceV896.ts');for(const word of ['Math.random(', 'fetch(', 'WebSocket(', '<mesh', 'new THREE.', 'requestAnimationFrame(', 'setInterval('])assert(!src.includes(word),word);});
check('song-scoped bridge settings',()=>{const b={trackId:plan.trackId,durationMs:plan.durationMs,playing:true,reducedMotion:false,enabled:true,intensity:1,sceneSource:'verified',section:'drop',look:'arena',sceneStartMs:60000,manual:null,manualId:0,manualStartMs:-1,sync:{stage:true,lights:true,dance:true},directorPlanV895:plan,directorSettingsV895:dir.DEFAULT_DIRECTOR_V895,energySettingsV896:{...settings,style:'expressive'}};bridge.publishConcertStageSyncV882(b);assert.equal(bridge.readConcertStageSyncV882().energySettingsV896.style,'expressive');bridge.publishConcertStageSyncV882(null);});
check('stage uses measured real audio',()=>{const src=read('components/visualizer/DynamicStage.tsx');for(const x of ['advanceEnergyV896(', 'energyEnvelope:audio.energyEnvelope','elapsedMs:Math.max(','publishEnergyV896(', 'sampleEnergyV896({','energyCueV896.ledGain','energyCueV896.lightGain'])assert(src.includes(x),x);});
check('camera guarded measured bridge',()=>{const src=read('components/visualizer/StageCameraDirectorV289.tsx');assert(src.includes('readEnergyV896('));assert(src.includes('energyCameraV896.cameraRate'));});
check('dance guarded measured bridge',()=>{const src=read('components/visualizer/VisualizerStage.tsx');assert(src.includes('readEnergyV896('));assert(src.includes('energyDanceCueV896.danceGain'));});
check('live deck UI/settings/diagnostics',()=>{const src=read('components/visualizer/LiveFxDeckV881.tsx');for(const x of ['ENERGY_KEY_V896','energyReadyV896','V896 · Musical Energy Intelligence','Live-Audio: Energie','exportEnergyV896Json','energySettingsV896'])assert(src.includes(x),x);});
check('CI V896 explicit gate',()=>assert(read('.github/workflows/v832-continuous-validation.yml').includes('V896 Musical Energy Intelligence')));
check('manifest/lockfile match',()=>{const p=JSON.parse(read('package.json')),l=JSON.parse(read('package-lock.json'));assert.match(p.version,/^0\.1\.0-v(?:896|897|898|899|900|901|902|903|904|905|906|907|908)$/);assert.equal(l.version,p.version);assert.equal(l.packages[''].version,p.version);});
console.log(`V896 Musical Energy Intelligence PASS: ${checks} checks`);
