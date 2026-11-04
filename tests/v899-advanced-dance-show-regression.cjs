'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const v=load('components/visualizer/advancedDanceShowDirectorV899');
const dir=load('components/visualizer/aiConcertDirectorV895');
const bridge=load('components/visualizer/concertStageSyncV882');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let checks=0;const check=(label,fn)=>{try{fn();checks++}catch(e){e.message=`V899 ${label}: ${e.message}`;throw e;}};
const plan=dir.buildDirectorPlanV895({trackId:'dance-v899',durationMs:180000,source:'verified-v604',scenes:[
 {index:0,startMs:0,endMs:30000,section:'intro',intent:'opening'},
 {index:1,startMs:30000,endMs:60000,section:'verse',intent:'vocal'},
 {index:2,startMs:60000,endMs:90000,section:'hook',intent:'lift'},
 {index:3,startMs:90000,endMs:120000,section:'drop',intent:'impact'},
 {index:4,startMs:120000,endMs:150000,section:'break',intent:'breath'},
 {index:5,startMs:150000,endMs:180000,section:'finale',intent:'ending'}]});
const settings={...v.DEFAULT_DANCE_SHOW_V899};
const input=(patch={})=>({settings,plan,trackId:plan.trackId,durationMs:plan.durationMs,positionMs:75000,
 playing:true,autoEnabled:true,directorEnabled:true,danceEnabled:true,cameraEnabled:true,
 duo:true,count:2,tier:'high',reducedMotion:false,...patch});
const sample=p=>v.sampleDanceShowV899(input(p));
check('verified source',()=>{assert.equal(plan.source,'verified-v604');assert.equal(plan.scenes.length,6)});
check('defaults stable',()=>assert.deepEqual(v.normalizeDanceShowV899(null),settings));
for(const bad of [null,undefined,{},[],true,false,NaN,Infinity,0,-1,1,'','none',new Date()])
 check(`invalid settings ${String(bad)}`,()=>assert.deepEqual(v.normalizeDanceShowV899(bad),settings));
for(const style of ['cinematic','balanced','arena'])check(`valid style ${style}`,()=>assert.equal(v.normalizeDanceShowV899({style}).style,style));
for(const style of ['bad','',undefined,null,false,6,{},[]])check(`invalid style ${String(style)}`,()=>assert.equal(v.normalizeDanceShowV899({style}).style,'balanced'));
for(const intensity of [-80,-1,0,1,17.4,55.4,100,1200])check(`intensity clamp ${intensity}`,()=>assert.equal(v.normalizeDanceShowV899({intensity}).intensity,Math.round(Math.max(0,Math.min(100,intensity)))));
for(const intensity of [NaN,Infinity,-Infinity,null,undefined,'55'])check(`invalid intensity ${String(intensity)}`,()=>assert.equal(v.normalizeDanceShowV899({intensity}).intensity,55));
for(const k of ['enabled','formations','transitions','cameraSync','energyResponse','protectLyrics','protectFootwork'])
 check(`independent flag ${k}`,()=>{assert.equal(v.normalizeDanceShowV899({[k]:false})[k],false);assert.equal(v.normalizeDanceShowV899({[k]:'false'})[k],true)});
check('hook wide',()=>{const x=sample();assert.equal(x.active,true);assert.equal(x.formation,'wide');assert(x.spacing>0);assert.equal(x.depth,0)});
check('verse close',()=>{const x=sample({positionMs:45000});assert.equal(x.formation,'close');assert(x.spacing<0)});
check('intro diagonal',()=>{const x=sample({positionMs:15000});assert.equal(x.formation,'diagonal');assert(x.depth>0)});
check('drop wide',()=>assert.equal(sample({positionMs:105000}).formation,'wide'));
check('break close',()=>assert.equal(sample({positionMs:135000}).formation,'close'));
check('finale wide',()=>assert.equal(sample({positionMs:165000}).formation,'wide'));
check('single performer cannot change spacing',()=>{const x=sample({duo:false,count:1});assert.equal(x.spacing,0);assert.equal(x.depth,0);assert.equal(x.formation,'neutral')});
check('no invented clips or steps',()=>{const x=sample();assert(!('clip' in x));assert(!('motion' in x));assert(!('singer' in x));});
check('cue deterministic',()=>assert.deepEqual(sample(),sample()));
check('source immutable',()=>{sample();assert.equal(plan.scenes[2].startMs,60000);assert.equal(settings.intensity,55)});
check('scene boundary smooth',()=>{const x=sample({positionMs:60000});assert.equal(x.blend,0);assert.equal(x.spacing,0)});
check('scene before end smooth',()=>{const x=sample({positionMs:89999});assert(x.blend<.0001)});
check('no smoothing option',()=>assert(sample({settings:{...settings,transitions:false},positionMs:60000}).spacing>0));
check('no formation option',()=>assert.equal(sample({settings:{...settings,formations:false}}).spacing,0));
check('no camera option',()=>assert.equal(sample({settings:{...settings,cameraSync:false}}).cameraRate,1));
check('manual camera neutral',()=>assert.equal(sample({manualCamera:true}).cameraRate,1));
check('camera disabled neutral',()=>assert.equal(sample({cameraEnabled:false}).cameraRate,1));
check('no camera AND no formation disables',()=>assert.equal(sample({settings:{...settings,cameraSync:false,formations:false}}).active,false));
for(const [why,patch] of [
 ['off',{settings:{...settings,enabled:false}}],['zero intensity',{settings:{...settings,intensity:0}}],
 ['paused',{playing:false}],['not automatic',{autoEnabled:false}],['director off',{directorEnabled:false}],
 ['dance off',{danceEnabled:false}],['manual choreography',{manualDance:true}],['manual FX',{manualFx:true}],
 ['manual formation',{manualFormation:true}],['reduced motion',{reducedMotion:true}],['low tier',{tier:'low'}],
 ['blackout',{blackout:true}],['seek',{seekBlocked:true}],['foot lock',{footLocked:true}],
 ['collision',{collisionRisk:true}],['lyrics visible',{lyricsVisible:true}],
 ['plan missing',{plan:null}],['plan unverified',{plan:{...plan,source:'unavailable'}}],
 ['track different',{trackId:'wrong'}],['duration different',{durationMs:80000}],
 ['no id',{trackId:''}],['long id',{trackId:'a'.repeat(161)}],['invalid position',{positionMs:-1}],
 ['end',{positionMs:180000}],['nan position',{positionMs:NaN}],['nan duration',{durationMs:NaN}],
 ['too short',{durationMs:100}],['count 0',{count:0}],['count 5',{count:5}],['count float',{count:1.2}]
])check(`protection ${why}`,()=>{const x=sample(patch);assert.equal(x.active,false);assert.equal(x.cameraRate,1);assert.equal(x.spacing,0);assert.equal(x.depth,0)});
check('lyrics protection can be manually disabled',()=>assert(sample({lyricsVisible:true,settings:{...settings,protectLyrics:false}}).spacing>0));
check('foot protection can be manually disabled',()=>assert(sample({footLocked:true,settings:{...settings,protectFootwork:false}}).spacing>0));
check('low-intensity bounded',()=>assert(sample({settings:{...settings,intensity:5}}).spacing<sample().spacing));
for(const style of ['cinematic','balanced','arena'])check(`style reacts ${style}`,()=>assert(sample({settings:{...settings,style}}).spacing>=0));
check('arena wider than cinematic',()=>assert(sample({settings:{...settings,style:'arena'}}).spacing>sample({settings:{...settings,style:'cinematic'}}).spacing));
check('balanced lower than high',()=>assert(sample({tier:'balanced'}).spacing<sample().spacing));
const goodEnergy={trackId:plan.trackId,durationMs:plan.durationMs,positionMs:75000,samples:12,smoothed:.85,baseline:.43,trend:.4,bass:.8,pulse:.7,source:'live-normalized-audio'};
check('real measured energy used',()=>assert.equal(sample({energy:goodEnergy}).energyUsed,true));
check('real measured energy affects spacing',()=>assert.notEqual(sample({energy:goodEnergy}).spacing,sample().spacing));
for(const [key,energy] of [['wrong song',{...goodEnergy,trackId:'wrong'}],['stale',{...goodEnergy,positionMs:74200}],
 ['no samples',{...goodEnergy,samples:1}],['fabricated source',{...goodEnergy,source:'predicted'}],
 ['no energy',{...goodEnergy,smoothed:NaN}],['invalid trend',{...goodEnergy,trend:2}]])
 check(`energy ignored: ${key}`,()=>assert.equal(sample({energy}).energyUsed,false));
check('energy toggled off',()=>assert.equal(sample({energy:goodEnergy,settings:{...settings,energyResponse:false}}).energyUsed,false));
for(let n=0;n<=180000;n+=263)check(`stable bounds at ${n}`,()=>{const x=sample({positionMs:n});
 assert(Number.isFinite(x.spacing));assert(Math.abs(x.spacing)<=.25);assert(Math.abs(x.depth)<=.18);
 assert(x.cameraRate>=.95&&x.cameraRate<=1.03);assert(x.blend>=0&&x.blend<=1)});
check('export only verified plan',()=>{const e=JSON.parse(v.exportDanceShowV899(plan,settings));assert.equal(e.schema,'sonic-dance-show-v899');assert.equal(e.scenes.length,6);assert(!('singingSlots' in e.scenes[0]));});
check('refuse unverified export',()=>assert.equal(v.exportDanceShowV899({...plan,source:'unavailable'},settings),null));
check('no JSON for empty plan',()=>assert.equal(v.exportDanceShowV899({...plan,scenes:[]},settings),null));
const group=read('components/visualizer/GroupDancersV326SceneV492.tsx');
const actor=read('components/visualizer/DanceFormationActorsV492.tsx');
const camera=read('components/visualizer/StageCameraDirectorV289.tsx');
const deck=read('components/visualizer/LiveFxDeckV881.tsx');
const sync=read('components/visualizer/concertStageSyncV882.ts');
for(const [name,src,needle] of [['actor',actor,'sampleDanceShowV899({'],['camera',camera,'danceShowCameraV899=sampleDanceShowV899'],
 ['group integration',group,'groupDanceV899=sampleDanceShowV899'],
 ['group manual priority',group,'manualFormation:!!settings.trackId||settings!==props.autoMultiArtistGroupV442'],
 ['group collision protection',group,'collisionRisk:collisionSlotsV508.some'],
 ['group no compression',group,'groupDanceV899.spacing>0'],
 ['group x offset',group,'Math.sign(i-(settings.count-1)/2)*groupSpreadV899'],
 ['bridge',sync,'normalizeDanceShowV899(input.danceShowSettingsV899)'],['UI',deck,'Advanced Dance Show Director'],
 ['UI export',deck,'exportDanceShowV899Json'],['manual guard',actor,'manualFormation:!!manualPose||!!manualActive'],
 ['footlock guard',actor,'footLocked:readFootLockV322().enabled'],['position offsets',actor,'leadTarget[0]-=showDanceV899.spacing'],
 ['last camera guard',camera,'guardAutomaticCameraV351(danceCameraV898.pose,composition)'],
 ['camera rate',camera,'*danceShowCameraV899.cameraRate']])check(`integration ${name}`,()=>assert(src.includes(needle)));
check('bridge published settings',()=>{bridge.publishConcertStageSyncV882({trackId:plan.trackId,durationMs:plan.durationMs,playing:true,
 enabled:true,reducedMotion:false,intensity:.7,sceneSource:'verified',section:'hook',look:'neon',sceneStartMs:60000,
 sync:{stage:true,lights:true,dance:true},manual:null,manualId:0,manualStartMs:-1,
 directorPlanV895:plan,directorSettingsV895:{enabled:true,camera:true,dance:true,lights:true,led:true,stage:true,intensity:60,protectLyrics:true,style:'balanced'},
 danceShowSettingsV899:settings});assert.equal(bridge.readConcertStageSyncV882().danceShowSettingsV899.enabled,true);
 bridge.publishConcertStageSyncV882(null);});
console.log(`PASS V899 Advanced Dance Show Director: ${checks} checks`);
