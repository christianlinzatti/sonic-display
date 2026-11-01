'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {normalizeConcertQualityV750:normalize,DEFAULT_CONCERT_QUALITY_V750:defaults,
 planIntegratedConcertQualityV750:plan,scaleAutomaticPercentV750:scale,
 strengthenReadabilityV750:reading,NEUTRAL_CONCERT_QUALITY_V750:neutral}=
 load('components/visualizer/integratedConcertQualityV750');
let checks=0;
const eq=(a,b,m)=>{assert.deepEqual(a,b,m);checks++;};
const ok=(x,m)=>{assert.ok(x,m);checks++;};
const base={settings:defaults,trackId:'track-750',durationMs:185000,progressMs:45000,
 playing:true,reducedMotion:false,section:'verse',tier:'high',ensembleCount:1,
 lyricVisible:false,lyricSynced:false,activeLineLength:0,
 verifiedVocal:false,manualDance:false,manualCamera:false,manualLighting:false,repeatedAct:false};
const passive=plan(base);
eq(normalize(),defaults);
eq(normalize({strength:NaN,enabled:undefined}),defaults);
eq(normalize({strength:Infinity,enabled:null}),defaults);
eq(normalize({strength:-1,protectLyrics:null}),{...defaults,strength:0});
eq(normalize({strength:200,enabled:false}),{...defaults,strength:100,enabled:false});
eq(plan({...base,settings:{enabled:false}}),neutral);
eq(plan({...base,settings:{strength:0}}),neutral);
for(const bad of [
 {trackId:''},{durationMs:0},{durationMs:NaN},{durationMs:-10},
 {progressMs:-1},{progressMs:Infinity},{progressMs:185000},
 {playing:false},{reducedMotion:true},{ensembleCount:0},{ensembleCount:5},
 {ensembleCount:1.4},{activeLineLength:-1},{activeLineLength:1.1},
 {activeLineLength:10001},{tier:'extreme'}])eq(plan({...base,...bad}),neutral,JSON.stringify(bad));
for(const section of ['intro','verse','build','hook','drop','break','outro','unknown',null]){
 const cue=plan({...base,section});
 eq(cue.mode,({intro:'calm',break:'calm',verse:'verse',build:'build',hook:'hook',drop:'drop',outro:'outro'})[section]||'balanced');
 ok(cue.camera<=1&&cue.lighting<=1&&cue.vocal<=1&&cue.dance<=1);
}
const lyric=plan({...base,lyricVisible:true,lyricSynced:true,activeLineLength:94,section:'drop',ensembleCount:4,tier:'low',verifiedVocal:true});
ok(lyric.active);eq(lyric.reason,'lyrics');ok(lyric.readabilityBonus>0);
ok(lyric.camera<passive.camera);ok(lyric.lighting<passive.lighting);ok(lyric.lyricsAccent<1);
ok(lyric.vocal>=.82);ok(lyric.dance>=.65);
const notTimed=plan({...base,lyricVisible:true,lyricSynced:false,activeLineLength:94});
eq(notTimed.readabilityBonus,0);
const notVisible=plan({...base,lyricVisible:false,lyricSynced:true,activeLineLength:94});
eq(notVisible.readabilityBonus,0);
const notCurrent=plan({...base,lyricVisible:true,lyricSynced:true,activeLineLength:0});
eq(notCurrent.readabilityBonus,0);
const noLyricProtection=plan({...base,lyricVisible:true,lyricSynced:true,activeLineLength:94,settings:{protectLyrics:false}});
eq(noLyricProtection.readabilityBonus,0);
const noAdaptive=plan({...base,lyricVisible:true,lyricSynced:true,activeLineLength:90,tier:'low',ensembleCount:4,settings:{adaptiveLoad:false}});
ok(noAdaptive.pressure<lyric.pressure);
const noSingerPriority=plan({...base,verifiedVocal:true,settings:{protectPerformance:false}});
ok(noSingerPriority.camera>=plan({...base,verifiedVocal:true}).camera);
for(const manual of [{manualCamera:true},{manualLighting:true},{manualDance:true},
 {manualCamera:true,manualLighting:true,manualDance:true}]){
 const c=plan({...base,lyricVisible:true,lyricSynced:true,activeLineLength:99,tier:'low',ensembleCount:4,...manual});
 if(manual.manualCamera)eq(c.camera,1);
 if(manual.manualLighting)eq(c.lighting,1);
 if(manual.manualDance)eq(c.dance,1);
}
eq(scale(75,1),75);eq(scale(75,.4),30);eq(scale(120,.5),50);eq(scale(-3,.5),0);
eq(scale(45,Infinity),45);eq(scale(NaN,.5),0);eq(reading(91,15),100);
eq(reading(55,NaN),55);eq(reading(55,10),65);
// All tracks and phrases are deterministic, seek-safe and pure; no state leaks
// across different songs or arbitrary playback seek orders.
const frames=['intro','verse','build','hook','drop','break','outro','unknown'];
for(let i=0;i<60000;i++){
 const input={...base,section:frames[i%8],trackId:`track-${i%3}`,
  progressMs:(i*79)%184999,ensembleCount:1+i%4,tier:['high','balanced','low'][i%3],
  lyricVisible:i%5!==0,lyricSynced:i%7!==0,activeLineLength:i%103,
  verifiedVocal:i%11===0,manualDance:i%13===0,manualCamera:i%17===0,
  manualLighting:i%19===0,playing:i%23!==0,reducedMotion:i%37===0,
  repeatedAct:i%29===0,settings:{...defaults,strength:i%101}};
 const out=plan(input);
 checks++;
 for(const key of ['camera','lighting','dance','vocal','lyricsAccent']){
  ok(Number.isFinite(out[key])&&out[key]>=0&&out[key]<=1,`${key}: ${out[key]}`);
 }
 ok(Number.isFinite(out.readabilityBonus)&&out.readabilityBonus>=0&&out.readabilityBonus<=20);
 ok(Number.isFinite(out.pressure)&&out.pressure>=0&&out.pressure<=.82);
 if(input.manualCamera)eq(out.camera,1);
 if(input.manualLighting)eq(out.lighting,1);
 if(input.manualDance)eq(out.dance,1);
 if(!input.playing||input.reducedMotion||input.settings.strength===0)eq(out,neutral);
 const after=plan(input);eq(out,after,'determinism / no per-frame mutable state');
}
// Wire checks protect actual stage path; a standalone pure planner would not
// fulfill the V750 integration requirement.
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const dancer=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
const vocal=fs.readFileSync('components/visualizer/gltfVocalPerformanceV492.ts','utf8');
const lyrics=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const settings=fs.readFileSync('components/SettingsPanel.tsx','utf8');
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');
const ui=fs.readFileSync('types/music.ts','utf8');
for(const s of [
 [stage,'planIntegratedConcertQualityV750('],
 [stage,'performanceCameraV747:coordinatedCameraV750'],
 [stage,'performanceLightingV749={coordinatedLightingV750}'],
 [stage,'performanceV748:coordinatedLyricsV750'],
 [stage,'performanceSettingsV750={coordinatedLyricsV750}'],
 [stage,'qualityDanceGainV750:applyTuneMultiplierV755(qualityV750.dance'],
 [stage,'qualityVocalGainV750:applyTuneMultiplierV755(qualityV750.vocal'],
 [stage,'manualCamera:manualQualityV670.camera'],
 [stage,'manualLighting:manualQualityV670.lighting'],
 [dancer,'qualityDanceGainV750??1'],
 [vocal,'qualityVocalGainV750??1'],
 [lyrics,'performanceSettingsV750??preferences.lyricsPerformanceV748'],
 [settings,'V750 · Integrated Concert Quality'],
 [registry,'qualityDanceGainV750?:number'],
 [ui,'concertQualityV750?:']])ok(s[0].includes(s[1]),'wiring missing '+s[1]);
console.log('PASS V750 Integrated Concert Quality:',checks,'checks');
