'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSmartConcertDynamicsV502:plan,classifyConcertGenreV502:classify,
  concertDynamicsPercentV502:percent,concertDynamicsEnergyV502:motion}=load('components/visualizer/smartConcertDynamicsV502');
const defaults={trackId:'track-A',progressMs:30600,playing:true,enabled:true,reducedMotion:false,
  genre:'Deutschrap',section:'hook',source:'imported',hasSectionLabels:true,
  sectionStartMs:30000,energy:.84,kick:.75,tier:'high',lyricFocus:false,
  lyricsVisible:true,manualDance:false,manualCamera:false,manualLighting:false,manualLyrics:false};
const sample=(changes={})=>plan({...defaults,...changes});
assert.equal(classify('Deutsch-Rap'),'deutschrap');
assert.equal(classify('German Hip-Hop'),'deutschrap');
assert.equal(classify('RAWSTYLE'),'hardstyle');
assert.equal(classify('Hardstyle'),'hardstyle');
assert.equal(classify('Hardtekk'),'hardtekk');
assert.equal(classify('Hard Tekno'),'hardtekk');
assert.equal(classify('synthpop'),'pop');
assert.equal(classify(null),'other');
const rap=sample();
assert(rap.active && rap.genre==='deutschrap' && rap.evidence==='labeled');
assert(rap.dance>1&&rap.camera>1&&rap.lighting>1&&rap.lyrics>0);
assert.deepEqual(rap,sample(),'same musical clock produces same composition');
assert.equal(sample({section:'hook',progressMs:30000}).dance,1,'imported section fade starts neutral');
assert(sample({section:'hook',progressMs:30125}).dance<rap.dance,'starts with smoothstep transition');
assert(sample({section:'break'}).dance<1,'break breathes without cancelling audio');
assert(sample({genre:'Hardstyle',section:'drop'}).lighting>sample({genre:'Hardstyle',section:'verse'}).lighting);
assert(sample({genre:'Hardtekk',section:'verse'}).dance>sample({genre:'Hardstyle',section:'verse'}).dance);
const live=sample({source:'live',hasSectionLabels:false,sectionStartMs:null});
assert(live.active && live.evidence==='estimated');
assert(live.camera<=rap.camera&&live.dance<=rap.dance,'never claim unverified live structure is authoritative');
for(const patch of [{playing:false},{enabled:false},{reducedMotion:true},{trackId:''},
  {progressMs:NaN},{progressMs:-1},{genre:'ambient'}]){
  const a=sample(patch);
  assert(!a.active && a.dance===1&&a.camera===1&&a.lighting===1&&a.lyrics===0);
}
assert.equal(sample({manualDance:true}).dance,1);
assert.equal(sample({manualCamera:true}).camera,1);
assert.equal(sample({manualLighting:true}).lighting,1);
assert.equal(sample({manualLyrics:true}).lyrics,0);
assert.equal(sample({lyricsVisible:false}).lyrics,0);
assert(sample({lyricFocus:true}).lyrics<=rap.lyrics,'lyrics first: lower visual stimulation');
assert.equal(sample({tier:'low'}).lyrics,0);
assert(sample({tier:'low'}).dance<rap.dance);
assert.equal(percent(0,1.12),0,'disabled channel stays disabled');
assert.equal(percent(75,1),75);
assert(percent(100,1.2)<=100);
assert.equal(motion(.5,{...rap,dance:1}),.5);
assert(motion(.6,rap)>.6);
assert.equal(motion(Infinity,rap),0);
const snapshot=JSON.stringify(defaults);sample();assert.equal(JSON.stringify(defaults),snapshot,'pure function must not edit inputs');
for(let i=0;i<18000;i++){
  const a=sample({progressMs:i*100,section:['verse','hook','build','drop','break'][i%5],
    genre:['Deutschrap','Hardstyle','Hardtekk'][i%3],tier:['low','balanced','high'][i%3],
    source:i%2?'live':'imported',energy:i%2?Infinity:(i%100)/100,kick:i%3?-.4:1.3});
  assert(Number.isFinite(a.dance)&&a.dance>=.88&&a.dance<=1.12);
  assert(Number.isFinite(a.camera)&&a.camera>=.91&&a.camera<=1.095);
  assert(Number.isFinite(a.lighting)&&a.lighting>=.90&&a.lighting<=1.11);
  assert(Number.isFinite(a.lyrics)&&a.lyrics>=0&&a.lyrics<=.12);
}
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const kinetic=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const scene=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
assert.match(stage,/planSmartConcertDynamicsV502\(/);
assert.match(stage,/section:directedSection,source:musicTimeline\.source/);
assert.match(stage,/manualDance:preferences\.visualizerMode!=="avatar"\|\|!rapDanceAllowedV437/);
assert.match(stage,/preferences\.lyricsVisible&&preferences\.lyricsImmersiveEnabled/);
assert.match(stage,/concertDynamicsEnergyV502\(\s*concertMotionEnergyV464/);
assert.match(stage,/avatarAnimationIntensity=\{concertDynamicsPercentV502/);
assert.match(stage,/cameraDirectorIntensity=\{concertDynamicsPercentV502/);
assert.match(stage,/stageLightStrength=\{concertDynamicsPercentV502/);
assert.match(stage,/concertLyricAccentV502:(?:dynamicsV502|directedDynamicsV568|directedDynamicsV604)\.lyrics/);
assert.match(kinetic,/concertLyricAccentV502/);
assert.match(scene,/concertAccentV502/);
assert.match(registry,/concertLyricAccentV502\?:number/);
assert.match(css,/\.lyrics\.v502-concert-lyrics/);
console.log('PASS V502 concert genre cues, protected overrides, visual wiring, 18,000 bounded timeline samples');
