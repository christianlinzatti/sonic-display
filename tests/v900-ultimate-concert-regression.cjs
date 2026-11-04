'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/ultimateConcertExperienceV900');
const d=load('components/visualizer/aiConcertDirectorV895');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let checks=0;const check=(name,fn)=>{try{fn();checks++}catch(e){e.message=`V900 ${name}: ${e.message}`;throw e;}};
const inputScenes=[
 ['intro',0,14000,'opening'],['verse',14000,40000,'vocal'],['verse',40000,65000,'vocal'],
 ['hook',65000,90000,'lift'],['hook',90000,112000,'lift'],['build',112000,137000,'rise'],
 ['drop',137000,165000,'impact'],['break',165000,189000,'breath'],
 ['verse',189000,218000,'vocal'],['build',218000,242000,'rise'],
 ['drop',242000,270000,'impact'],['finale',270000,300000,'end']
];
const direct=d.buildDirectorPlanV895({trackId:'concert-v900',durationMs:300000,source:'verified-v604',
 scenes:inputScenes.map(([section,startMs,endMs,intent],index)=>({index,section,startMs,endMs,intent}))});
const plan=v.buildUltimatePlanV900(direct),settings={...v.DEFAULT_ULTIMATE_V900};
const input=(patch={})=>({settings,plan,trackId:plan.trackId,durationMs:plan.durationMs,
 positionMs:52000,playing:true,autoEnabled:true,directorEnabled:true,tier:'high',reducedMotion:false,...patch});
const sample=p=>v.sampleUltimateV900(input(p));
check('source evidence',()=>assert.equal(plan.source,'verified-v604'));
check('all twelve scenes preserved',()=>assert.equal(plan.scenes.length,12));
check('peak count from verified scenes only',()=>assert.equal(plan.peakCount,3));
check('first act',()=>assert.equal(plan.scenes[0].act,'opening'));
check('last act',()=>assert.equal(plan.scenes.at(-1).act,'climax'));
check('variation count',()=>assert(plan.variationCount>=1));
check('repeat lens alternates',()=>assert.notEqual(plan.scenes[1].motif,plan.scenes[2].motif));
check('repeat hook lens alternates',()=>assert.notEqual(plan.scenes[3].lens,plan.scenes[4].lens));
check('scene count stable',()=>assert.deepEqual(v.buildUltimatePlanV900(direct),plan));
check('input untouched',()=>assert.equal(direct.scenes[0].section,'intro'));
check('defaults stable',()=>assert.deepEqual(v.normalizeUltimateV900(null),settings));
for(const bad of [null,undefined,{},[],true,false,NaN,Infinity,0,1,-1,'','off',new Date()])
 check(`invalid config ${String(bad)}`,()=>assert.deepEqual(v.normalizeUltimateV900(bad),settings));
for(const mode of ['cinematic','balanced','festival'])
 check(`valid mode ${mode}`,()=>assert.equal(v.normalizeUltimateV900({style:mode}).style,mode));
for(const mode of ['none','',undefined,null,false,4,{},[]])
 check(`invalid mode ${String(mode)}`,()=>assert.equal(v.normalizeUltimateV900({style:mode}).style,'balanced'));
for(const val of [-20,-1,0,.49,12.3,65.7,100,120,1e6])
 check(`clamped intensity ${val}`,()=>assert.equal(v.normalizeUltimateV900({intensity:val}).intensity,
  Math.round(Math.min(100,Math.max(0,val)))));
for(const val of [NaN,Infinity,-Infinity,undefined,null,'65'])
 check(`invalid intensity ${String(val)}`,()=>assert.equal(v.normalizeUltimateV900({intensity:val}).intensity,65));
for(const key of ['enabled','protectLyrics','smoothTransitions','contrast','energyResponse','camera','dance','lights','led','stage']){
 check(`flag false ${key}`,()=>assert.equal(v.normalizeUltimateV900({[key]:false})[key],false));
 check(`flag invalid ${key}`,()=>assert.equal(v.normalizeUltimateV900({[key]:'false'})[key],true));
}
for(const [pos,motif] of [[5000,'stage-reveal'],[20000,'portrait'],[52000,'lyric-space'],
 [75000,'ensemble-wide'],[98500,'ensemble-wide'],[125000,'stage-reveal'],
 [150000,'impact'],[177000,'breathing'],[200000,'portrait'],[250000,'impact'],[290000,'finale']])
 check(`scene motif ${pos}`,()=>assert.equal(sample({positionMs:pos}).motif,motif));
check('verse dims visual wall',()=>assert(sample().ledGain<1));
check('verse prioritizes reader',()=>assert(sample().stageGain<1));
check('finale has headroom',()=>assert(sample({positionMs:287000}).ledGain>sample().ledGain));
check('last peak greater than first',()=>assert(sample({positionMs:256000}).stageGain>sample({positionMs:150000}).stageGain));
check('every scene retains source index',()=>assert.deepEqual(plan.scenes.map(s=>s.index),direct.scenes.map(s=>s.index)));
check('repeated lens modifies camera pacing',()=>assert.notEqual(sample({positionMs:25000}).cameraRate,sample({positionMs:51000}).cameraRate));
check('cue deterministic',()=>assert.deepEqual(sample(),sample()));
check('entry fades',()=>assert.equal(sample({positionMs:40000}).ledGain,1));
check('end fades',()=>assert(sample({positionMs:64999}).ledGain>.999));
check('no fade option',()=>assert(sample({positionMs:40000,settings:{...settings,smoothTransitions:false}}).ledGain<1));
check('cinematic slower transition than festival',()=>assert(sample({positionMs:40700,settings:{...settings,style:'cinematic'}}).ledGain>sample({positionMs:40700,settings:{...settings,style:'festival'}}).ledGain));
check('contrast off less dimming',()=>assert(sample({settings:{...settings,contrast:false}}).ledGain>sample().ledGain));
check('strength zero neutral',()=>{const x=sample({settings:{...settings,intensity:0}});assert.equal(x.active,false);assert.equal(x.ledGain,1)});
check('manual camera neutral',()=>assert.equal(sample({manualCamera:true}).cameraRate,1));
check('manual dance neutral',()=>assert.equal(sample({manualDance:true}).danceGain,1));
check('manual lighting protects light and led',()=>{const x=sample({manualLighting:true});assert.equal(x.lightGain,1);assert.equal(x.ledGain,1)});
for(const key of ['camera','dance','lights','led','stage'])
 check(`individual disabled channel ${key}`,()=>{const x=sample({settings:{...settings,[key]:false}});assert.equal(x[key==='camera'?'cameraRate':key==='dance'?'danceGain':key==='lights'?'lightGain':key==='led'?'ledGain':'stageGain'],1)});
for(const key of ['lyricsProtected','lyricsVisible','vocalFocus'])check(`lyrics guard ${key}`,()=>{const x=sample({[key]:true});
 assert.equal(x.cameraRate,1);assert.equal(x.lightGain,1);assert.equal(x.ledGain,1);assert.equal(x.stageGain,1)});
check('lyrics guard may be disabled explicitly',()=>assert(sample({lyricsVisible:true,settings:{...settings,protectLyrics:false}}).ledGain<1));
for(const [why,patch] of [
 ['off',{settings:{...settings,enabled:false}}],['pause',{playing:false}],['no auto',{autoEnabled:false}],
 ['director off',{directorEnabled:false}],['motion reduction',{reducedMotion:true}],['low tier',{tier:'low'}],
 ['seek',{seekBlocked:true}],['blackout',{blackout:true}],['manual FX',{manualFx:true}],
 ['no channels',{settings:{...settings,camera:false,dance:false,lights:false,led:false,stage:false}}],
 ['missing',{plan:null}],['unverified',{plan:{...plan,source:'unavailable'}}],
 ['wrong track',{trackId:'bad'}],['wrong duration',{durationMs:200000}],['invalid id',{trackId:''}],
 ['too long id',{trackId:'x'.repeat(161)}],['negative',{positionMs:-1}],['after song',{positionMs:300000}],
 ['NaN position',{positionMs:NaN}],['NaN duration',{durationMs:NaN}],['short duration',{durationMs:3}],
 ])check(`safety ${why}`,()=>{const x=sample(patch);assert.equal(x.active,false);assert.equal(x.ledGain,1);assert.equal(x.cameraRate,1);assert.equal(x.danceGain,1)});
const goodEnergy={trackId:plan.trackId,durationMs:plan.durationMs,positionMs:52000,samples:10,smoothed:.7,baseline:.35,trend:.35,bass:.8,pulse:.9,source:'live-normalized-audio'};
check('real energy used',()=>assert.equal(sample({energy:goodEnergy}).energyUsed,true));
check('real energy modulates LED gain',()=>assert.notEqual(sample({energy:goodEnergy}).ledGain,sample().ledGain));
for(const [label,energy] of [['wrong song',{...goodEnergy,trackId:'wrong'}],['stale',{...goodEnergy,positionMs:53000}],
 ['fabricated',{...goodEnergy,source:'predicted'}],['samples',{...goodEnergy,samples:2}],
 ['nan',{...goodEnergy,smoothed:NaN}],['trend',{...goodEnergy,trend:5}],['negative',{...goodEnergy,smoothed:-.4}]])
 check(`energy ignored ${label}`,()=>assert.equal(sample({energy}).energyUsed,false));
check('turn energy off',()=>assert.equal(sample({energy:goodEnergy,settings:{...settings,energyResponse:false}}).energyUsed,false));
for(const pos of Array.from({length:1001},(_,n)=>n*300))check(`bounded 300ms sample ${pos}`,()=>{
 const x=sample({positionMs:pos});
 for(const k of ['cameraRate','danceGain','lightGain','ledGain','stageGain'])assert(x[k]>=.62&&x[k]<=1,`${k}=${x[k]}`);
 assert(Number.isFinite(x.transition)&&x.transition>=0&&x.transition<=1);
});
for(const invalid of [null,undefined,{},[],{...direct,source:'unavailable'},
 {...direct,trackId:''},{...direct,durationMs:100},
 {...direct,scenes:[]},
 {...direct,scenes:[{...direct.scenes[0],startMs:-1}]},
 {...direct,scenes:[{...direct.scenes[0],endMs:NaN}]},
 {...direct,scenes:[direct.scenes[0],{...direct.scenes[1],startMs:100}]},
 {...direct,scenes:[{...direct.scenes[0],section:'fake-drop'}]}
])check('reject invalid evidence',()=>assert.equal(v.buildUltimatePlanV900(invalid).source,'unavailable'));
check('export confirmed only',()=>{const x=JSON.parse(v.exportUltimatePlanV900(plan,settings));assert.equal(x.schema,'sonic-ultimate-concert-v900');assert.equal(x.scenes.length,12);assert.equal(x.peakCount,3);assert(!('inventedBeats' in x));});
check('export refuses unverified',()=>assert.equal(v.exportUltimatePlanV900({...plan,source:'unavailable'},settings),null));
check('published signal contains authorized plan',()=>{
 bridge.publishConcertStageSyncV882({trackId:plan.trackId,durationMs:plan.durationMs,playing:true,enabled:true,reducedMotion:false,
  intensity:1,sceneSource:'verified',section:'verse',look:'cinema',sceneStartMs:0,manual:null,manualId:0,manualStartMs:-1,
  sync:{stage:true,lights:true,dance:true},ultimatePlanV900:plan,ultimateSettingsV900:settings});
 const x=bridge.readConcertStageSyncV882();assert.equal(x.ultimatePlanV900,plan);assert.deepEqual(x.ultimateSettingsV900,settings);
 bridge.publishConcertStageSyncV882(null);
});
check('bridge refuses wrong song plan',()=>{
 bridge.publishConcertStageSyncV882({trackId:'new-track',durationMs:plan.durationMs,playing:true,enabled:true,reducedMotion:false,
  intensity:1,sceneSource:'verified',section:'verse',look:'cinema',sceneStartMs:0,manual:null,manualId:0,manualStartMs:-1,
  sync:{stage:true,lights:true,dance:true},ultimatePlanV900:plan});
 assert.equal(bridge.readConcertStageSyncV882().ultimatePlanV900,null);bridge.publishConcertStageSyncV882(null);
});
for(const [file,text] of [
 ['components/visualizer/DynamicStage.tsx','ultimateStageV900.ledGain'],
 ['components/visualizer/DynamicStage.tsx','ultimateStageV900.stageGain'],
 ['components/visualizer/DynamicStage.tsx','ultimateStageV900.lightGain'],
 ['components/visualizer/StageCameraDirectorV289.tsx','ultimateCameraV900.cameraRate'],
 ['components/visualizer/VisualizerStage.tsx','ultimateDanceV900.danceGain'],
 ['components/visualizer/LiveFxDeckV881.tsx','V900 · Ultimate Concert Experience 5.0'],
 ['components/visualizer/LiveFxDeckV881.tsx','ultimatePlanV900'],
 ['components/visualizer/concertStageSyncV882.ts','snapshot.ultimatePlanV900===next.ultimatePlanV900'],
 ['.github/workflows/v832-continuous-validation.yml','test:v900'],
])check(`integration ${file} ${text}`,()=>assert(read(file).includes(text)));
check('package version',()=>assert.match(JSON.parse(read('package.json')).version,/^0\.1\.0-v(?:900|901|902|903|904|905|906|907|908|9\d\d\d)$/));
console.log(`PASS V900 Ultimate Concert Experience: ${checks} checks`);
