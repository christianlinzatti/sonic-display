'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const d=load('components/visualizer/qualityAutoTunerV755');
let checks=0;
const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};
const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
const zero=1793450000000;
const telemetry=(at,fps=61,p95=18,extra={})=>({
 at,metricsAt:at-60,fps,frameMs:1000/fps,p95FrameMs:p95,samples:56,
 qualityTier:'balanced',renderWidthPx:1920,renderHeightPx:1080,
 avatars:[{slot:0,loaded:true}],...extra,
});
const inp=(at,fps=61,p95=18,extra={})=>({enabled:true,playing:true,reducedMotion:false,
 avatarStage:true,trackId:'song-a',expectedAvatars:1,visual:'ok',
 probe:telemetry(at,fps,p95),now:at+100,...extra});
const advance=(state,at,fps=61,p95=18,extra={})=>d.advanceQualityTuneV755(state,inp(at,fps,p95,extra));
const eff=(state,extra={})=>d.effectiveQualityTuneV755(state,{
 enabled:true,playing:true,reducedMotion:false,avatarStage:true,trackId:'song-a',
 now:state.lastAt+100,...extra});
let state=advance({...d.INITIAL_TUNE_V755},zero);
eq(state.level,0);eq(state.reason,'waiting');
for(let i=1;i<=2;i++){state=advance(state,zero+i*1000,35,38);eq(state.level,0);}
state=advance(state,zero+3000,35,38);eq(state.level,1);
ok(eff(state).camera<eff(state).dance);ok(eff(state).lighting<eff(state).vocal);
const frozen=state;
eq(advance(state,zero+3000,35,38),frozen,'duplicate probe cannot ramp');
eq(advance(state,zero+3001,35,38,{probe:telemetry(zero+3001,35,38,{metricsAt:zero+2940})}),frozen,'duplicated renderer metrics cannot ramp');
state=advance(state,zero+4000,35,38);state=advance(state,zero+5000,35,38);
eq(state.level,1);
state=advance(state,zero+6000,35,38);eq(state.level,2);
for(let i=7;i<=9;i++)state=advance(state,zero+i*1000,35,38);
eq(state.level,3);
for(let i=10;i<=17;i++)state=advance(state,zero+i*1000,60,18);
eq(state.level,2,'minimum dwell and five healthy samples recover one level');
for(let i=18;i<=25;i++)state=advance(state,zero+i*1000,60,18);
eq(state.level,1);
for(let i=26;i<=33;i++)state=advance(state,zero+i*1000,60,18);
eq(state.level,0);eq(eff(state).active,false);
// A new session cannot inherit old attenuation.
const high=advance(state,zero+34000,29,40,{trackId:'song-b'});
eq(high.level,0);eq(high.reason,'waiting');
// Changes to quality tier, resolution, number of avatars, track, playback or motion reset immediately.
const critical=advance(state,zero+35000,20,42,{probe:telemetry(zero+35000,20,42,{renderWidthPx:1280})});
eq(critical.level,0);
for(const overrides of [
 {enabled:false},{playing:false},{reducedMotion:true},{avatarStage:false},
 {trackId:''},{trackId:'new-song'},{expectedAvatars:2},
 {probe:telemetry(zero+35000,25,40,{fps:null})},
 {probe:telemetry(zero+35000,25,40,{p95FrameMs:null})},
 {probe:telemetry(zero+35000,25,40,{metricsAt:zero+30000})},
 {probe:telemetry(zero+35000,25,40,{avatars:[{slot:0,loaded:false}]})},
 {probe:telemetry(zero+35000,25,40,{qualityTier:'invalid'})},
 {probe:telemetry(zero+35000,25,40,{renderHeightPx:0})},
 {probe:telemetry(zero+35000,25,40,{samples:3})},
 {now:zero+43000},
]){
 const value=d.advanceQualityTuneV755(state,inp(zero+35000,25,40,overrides));
 eq(value.level,0,'invalid evidence must be neutral');
}
const safe=eff({...state,level:3,lastAt:zero+34000,visual:'critical'},{now:zero+34100});
eq(safe.level,3);eq(safe.visualGuard,true);
ok(safe.camera>=.52&&safe.lighting>=.46&&safe.dance>=.78&&safe.vocal>=.94);
eq(eff(state,{enabled:false}),d.NEUTRAL_TUNE_FACTORS_V755);
eq(eff(state,{now:state.lastAt+9000}),d.NEUTRAL_TUNE_FACTORS_V755);
eq(eff(state,{trackId:'other'}),d.NEUTRAL_TUNE_FACTORS_V755);
eq(eff(state,{playing:false}),d.NEUTRAL_TUNE_FACTORS_V755);
eq(eff(state,{reducedMotion:true}),d.NEUTRAL_TUNE_FACTORS_V755);
// Visual warning by itself makes minor, bounded conservative attenuation only after a real sample.
const vis=advance({...d.INITIAL_TUNE_V755},zero,61,18,{visual:'attention'});
ok(eff(vis).active);eq(eff(vis).level,0);eq(eff(vis).visualGuard,true);
// Deterministic mixed signals with no invented frame readings, no increase of intensity.
for(let i=0;i<20000;i++){
 const frame=zero+i*1000;
 const fps=25+(i*31%40),p95=18+(i*17%25);
 const sample=inp(frame,fps,p95,{trackId:'sim',expectedAvatars:1});
 const n=d.advanceQualityTuneV755({...d.INITIAL_TUNE_V755},sample);
 const f=d.effectiveQualityTuneV755(n,{enabled:true,playing:true,reducedMotion:false,
 avatarStage:true,trackId:'sim',now:frame+100});
 for(const k of ['camera','lighting','dance','vocal','lyricsAccent']){
  ok(Number.isFinite(f[k])&&f[k]>=0&&f[k]<=1);
  ok(d.applyTuneMultiplierV755(.8,f[k])<=.8);
 }
}
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const dashboard=fs.readFileSync('components/visualizer/ConcertQualityDashboardV751.tsx','utf8');
const panel=fs.readFileSync('components/visualizer/QualityAutoTunePanelV755.tsx','utf8');
const benchmark=fs.readFileSync('components/visualizer/RealConcertBenchmarkPanelV753.tsx','utf8');
for(const s of ['useConcertQualityV466','assessVisualQualityV754','advanceQualityTuneV755',
 'effectiveQualityTuneV755','qualityDanceGainV750:applyTuneMultiplierV755',
 'qualityVocalGainV750:applyTuneMultiplierV755','data-v755-level','manualQualityV670.camera?1',
 'manualQualityV670.lighting?1',
 '(preferences.avatarHipDanceModeV735!==undefined&&preferences.avatarHipDanceModeV735!=="auto")'])ok(stage.includes(s),s);
for(const [source,needle] of [[dashboard,'<QualityAutoTunePanelV755/>'],
 [panel,'setQualityAutoTuneEnabledV755'],[panel,'TUNE_TTL_MS_V755'],
 [benchmark,'autoTuneEnabledV755'],[benchmark,'V755 Auto-Tuning für vergleichbare Benchmark-Messungen ausschalten']])ok(source.includes(needle),needle);
const store=fs.readFileSync('components/visualizer/qualityAutoTuneStoreV755.ts','utf8');
ok(store.includes('let enabled=false'));ok(!store.includes('localStorage'));
ok(!stage.includes('setPerformanceTierV755'));ok(!panel.includes('setQualityTier'));
console.log('PASS V755 Smart Quality Auto-Tuning:',checks.toLocaleString('en-US'),'assertions');
