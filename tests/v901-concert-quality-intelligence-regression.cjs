'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const q=load('components/visualizer/concertQualityIntelligenceV901');
const v=load('components/visualizer/ultimateConcertExperienceV900');
const d=load('components/visualizer/aiConcertDirectorV895');
const t=load('components/visualizer/concertQualityTelemetryV826');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
let checks=0;
function check(name,fn){try{fn();checks++;}catch(e){e.message=`V901 ${name}: ${e.message}`;throw e;}}
const scenes=[['intro',0,12000,'opening'],['verse',12000,55000,'vocal'],['build',55000,80000,'rise'],['hook',80000,110000,'lift'],['drop',110000,150000,'impact'],['outro',150000,180000,'breath']];
const director=d.buildDirectorPlanV895({trackId:'concert-v901',durationMs:180000,source:'verified-v604',scenes:scenes.map(([section,startMs,endMs,intent],index)=>({index,section,startMs,endMs,intent}))});
const plan=v.buildUltimatePlanV900(director);
const cue=(ms=34000)=>v.sampleUltimateV900({plan,settings:v.DEFAULT_ULTIMATE_V900,trackId:plan.trackId,durationMs:180000,positionMs:ms,
 playing:true,autoEnabled:true,directorEnabled:true,reducedMotion:false,tier:'high'});
const make=(patch={})=>({trackId:'concert-v901',durationMs:180000,positionMs:34000,playing:true,reducedMotion:false,
 autoEnabled:true,directorEnabled:true,ultimateEnabled:true,plan,cue:cue(),renderer:null,
 cameraEnabled:true,danceEnabled:true,lightsEnabled:true,ledEnabled:true,fxEnabled:true,
 lyricsGuard:true,cameraLyricsGuard:true,danceFootGuard:true,energyExpected:false,...patch});
const evaluate=(patch={})=>q.evaluateConcertQualityV901(make(patch));
const live={...t.EMPTY_QUALITY_SNAPSHOT_V826,available:true,playing:true,verified:true,targetFps:60,
 fps:59.2,frameMs:16.8,p95FrameMs:18.9,sampleCount:31,pressure:.12,status:'healthy'};
check('plan confirmed',()=>assert.equal(plan.source,'verified-v604'));
check('default normalization',()=>assert.deepEqual(q.normalizeQualitySettingsV901({}),q.DEFAULT_QUALITY_SETTINGS_V901));
for(const raw of [null,undefined,NaN,Infinity,-Infinity,false,true,2,-1,'off',[],new Date()])
 check(`normalize invalid ${String(raw)}`,()=>assert.deepEqual(q.normalizeQualitySettingsV901(raw),q.DEFAULT_QUALITY_SETTINGS_V901));
for(const key of ['enabled','showRenderer','showChecks','showRecommendations']){
 check(`disabled ${key}`,()=>assert.equal(q.normalizeQualitySettingsV901({[key]:false})[key],false));
 check(`invalid boolean ${key}`,()=>assert.equal(q.normalizeQualitySettingsV901({[key]:'false'})[key],true));
}
for(const [value,result] of [[-10,1],[0,1],[1,1],[6.6,7],[12,12],[99,12]])
 check(`bound findings ${value}`,()=>assert.equal(q.normalizeQualitySettingsV901({maxFindings:value}).maxFindings,result));
for(const value of [NaN,Infinity,null,'4',{},[]])
 check(`invalid findings ${String(value)}`,()=>assert.equal(q.normalizeQualitySettingsV901({maxFindings:value}).maxFindings,6));
check('active mode',()=>assert.equal(evaluate().mode,'active'));
check('scene identity',()=>assert.equal(evaluate().sceneIndex,1));
check('five labeled lanes',()=>assert.deepEqual(evaluate().lanes.map(l=>l.id),['camera','lyrics','dance','lights','fx']));
check('no synthetic score',()=>assert(!('score' in evaluate())));
check('no fake frames',()=>assert.equal(evaluate().fps,null));
check('missing frames hint',()=>assert(evaluate().findings.some(f=>f.id==='no-frames')));
check('text explicitly unmeasured',()=>assert(evaluate().unmeasured.some(x=>x.includes('Lyrics'))));
check('healthy live frames',()=>{const x=evaluate({renderer:live});assert.equal(x.frameEvidence,true);assert.equal(x.fps,59.2);assert.equal(x.severity,'none')});
check('fps frame times from live store',()=>{const x=evaluate({renderer:live});assert.equal(x.frameMs,16.8);assert.equal(x.p95FrameMs,18.9);assert.equal(x.pressure,.12)});
check('non-song scoped label',()=>assert(evaluate({renderer:live}).measured.some(x=>x.includes('nicht songbezogen'))));
check('critical frame evidence',()=>{const x=evaluate({renderer:{...live,fps:17,status:'critical'}});assert.equal(x.severity,'critical');assert(x.findings.some(f=>f.id==='fps-critical'))});
check('warning frame evidence',()=>{const x=evaluate({renderer:{...live,fps:37,status:'warning'}});assert.equal(x.severity,'warning');assert(x.findings.some(f=>f.id==='fps-warning'))});
check('pressure warning',()=>assert(evaluate({renderer:{...live,pressure:.81}}).findings.some(f=>f.id==='fx-pressure')));
check('p95 spikes warning',()=>assert(evaluate({renderer:{...live,p95FrameMs:50}}).findings.some(f=>f.id==='frame-spikes')));
check('stale renderer disabled when paused',()=>assert.equal(evaluate({playing:false,renderer:live}).frameEvidence,false));
check('renderer not playing',()=>assert.equal(evaluate({renderer:{...live,playing:false}}).fps,null));
check('unavailable renderer',()=>assert.equal(evaluate({renderer:{...live,available:false}}).fps,null));
for(const [label,patch] of [['nan fps',{fps:NaN}],['negative fps',{fps:-1}],['zero fps',{fps:0}],
 ['bad fps',{fps:10000}],['bad frameMs',{frameMs:NaN}],['negative frames',{frameMs:-4}],
 ['invalid p95',{p95FrameMs:NaN}],['bad pressure',{pressure:-1}],['high pressure',{pressure:1.2}],
 ['zero samples',{sampleCount:0}],['bad target',{targetFps:55}]])
 check(`reject invalid renderer ${label}`,()=>assert.equal(evaluate({renderer:{...live,...patch}}).frameEvidence,false));
for(const [label,patch,mode] of [
 ['paused',{playing:false},'paused'],['reduced motion',{reducedMotion:true},'disabled'],
 ['auto off',{autoEnabled:false},'disabled'],['director off',{directorEnabled:false},'disabled'],
 ['V900 off',{ultimateEnabled:false},'disabled'],['no plan',{plan:null},'no-evidence'],
 ['unverified plan',{plan:{...plan,source:'unavailable'}},'no-evidence'],
 ['wrong track',{trackId:'wrong'},'no-evidence'],['no id',{trackId:''},'no-evidence'],
 ['overlong id',{trackId:'x'.repeat(161)},'no-evidence'],['wrong duration',{durationMs:190000},'no-evidence'],
 ['invalid duration',{durationMs:NaN},'no-evidence'],['short duration',{durationMs:30},'no-evidence'],
 ['negative position',{positionMs:-1},'no-evidence'],['invalid position',{positionMs:NaN},'no-evidence'],
 ['beyond song',{positionMs:180000},'no-evidence'],['no scenes',{plan:{...plan,scenes:[]}},'no-evidence']])
 check(`mode ${label}`,()=>assert.equal(evaluate(patch).mode,mode));
check('inactive channels not warnings',()=>assert.equal(evaluate({cameraEnabled:false,danceEnabled:false,lightsEnabled:false,ledEnabled:false,fxEnabled:false}).severity,'none'));
check('inactive camera',()=>assert.equal(evaluate({cameraEnabled:false}).lanes[0].state,'inactive'));
check('inactive dance',()=>assert.equal(evaluate({danceEnabled:false}).lanes[2].state,'inactive'));
check('inactive lighting',()=>assert.equal(evaluate({lightsEnabled:false,ledEnabled:false}).lanes[3].state,'inactive'));
check('inactive fx',()=>assert.equal(evaluate({fxEnabled:false}).lanes[4].state,'inactive'));
check('missing lyric protection',()=>assert.equal(evaluate({lyricsGuard:false}).lanes[1].state,'attention'));
check('no camera lyric protection',()=>assert.equal(evaluate({cameraLyricsGuard:false}).lanes[1].state,'attention'));
check('lyrics warning in portrait',()=>assert(evaluate({lyricsGuard:false}).findings.some(f=>f.id==='lyrics-guard')));
check('lyrics warning in lyric-space',()=>assert(evaluate({positionMs:35000,cue:cue(35000),lyricsGuard:false}).findings.some(f=>f.id==='lyrics-guard')));
check('no lyric warning on drop',()=>assert(!evaluate({positionMs:125000,cue:cue(125000),lyricsGuard:false}).findings.some(f=>f.id==='lyrics-guard')));
check('missing dance foot protection',()=>assert(evaluate({danceFootGuard:false}).findings.some(f=>f.id==='foot-guard')));
check('dance warning not when dance disabled',()=>assert(!evaluate({danceFootGuard:false,danceEnabled:false}).findings.some(f=>f.id==='foot-guard')));
check('energy unknown not hallucinated',()=>assert(evaluate({energyExpected:true}).findings.some(f=>f.id==='energy')));
check('no energy expectation',()=>assert(!evaluate({energyExpected:false}).findings.some(f=>f.id==='energy')));
check('cue mismatch becomes neutral',()=>assert.equal(evaluate({cue:{...cue(),sceneIndex:5}}).lanes[0].state,'unknown'));
check('inactive cue becomes neutral',()=>assert.equal(evaluate({cue:{...cue(),active:false}}).lanes[0].state,'unknown'));
check('no duplicate finding ids',()=>{const x=evaluate({renderer:{...live,status:'critical',pressure:.9,p95FrameMs:72},lyricsGuard:false,danceFootGuard:false});assert.equal(new Set(x.findings.map(f=>f.id)).size,x.findings.length)});
check('finding limit max 12',()=>assert(evaluate({renderer:{...live,status:'critical',pressure:.9,p95FrameMs:72},lyricsGuard:false,danceFootGuard:false,energyExpected:true}).findings.length<=12));
for(let ms=0;ms<180000;ms+=313){check(`song sweep ${ms}`,()=>{
 const x=evaluate({positionMs:ms,cue:cue(ms),renderer:live});
 assert.equal(x.mode,'active');assert.equal(x.lanes.length,5);assert(x.sceneIndex>=0);assert(x.frameEvidence);assert(x.findings.length<=12);
});}
check('manual export schema',()=>{const data=JSON.parse(q.exportConcertQualityV901(evaluate({renderer:live}),q.DEFAULT_QUALITY_SETTINGS_V901));assert.equal(data.schema,'sonic-concert-quality-intelligence-v901');assert.equal(data.type,'manual-diagnostic-snapshot');assert(!('trackId' in data));assert.equal(data.report.fps,59.2)});
check('no hidden vocal detection',()=>assert(!q.exportConcertQualityV901(evaluate(),q.DEFAULT_QUALITY_SETTINGS_V901).includes('singingIdentity')));
for(const [p,needle] of [
 ['components/visualizer/LiveFxDeckV881.tsx','<ConcertQualityIntelligencePanelV901'],
 ['components/visualizer/LiveFxDeckV881.tsx','ultimatePlanV900} cue={ultimateCueV900}'],
 ['components/visualizer/ConcertQualityIntelligencePanelV901.tsx','useSyncExternalStore'],
 ['components/visualizer/ConcertQualityIntelligencePanelV901.tsx','V901 · Concert Quality Intelligence 2.0'],
 ['components/visualizer/ConcertQualityIntelligencePanelV901.tsx','V901 Diagnose-Momentaufnahme als JSON exportieren'],
 ['components/visualizer/concertQualityIntelligenceV901.ts','actual lyrics/pose quality'],
 ['.github/workflows/v832-continuous-validation.yml','test:v901'],
 ['scripts/verify-v901-windows.ps1','verify:v901:focused'],
 ['ARCHITECTURE.md','**Dokumentationsstand:** V908']])
 check(`wiring ${p}`,()=>assert(read(p).includes(needle)));
check('package consistency',()=>{const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));assert.match(pkg.version,/^0\.1\.0-v(?:901|902|903|904|905|906|907|908)$/);assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version)});
console.log(`PASS V901 Concert Quality Intelligence: ${checks} checks`);
