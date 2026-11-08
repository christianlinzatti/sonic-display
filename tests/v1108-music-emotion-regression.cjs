#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1108-'));
try {
 const result=spawnSync(process.platform==='win32'?'tsc.cmd':'tsc',[
  '-p',path.join(root,'tests/tsconfig.v1108-core.json'),'--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',temp
 ],{cwd:root,encoding:'utf8',timeout:30000,windowsHide:true});
 assert.equal(result.status,0,result.error?.message||result.stdout+'\n'+result.stderr);
 const {estimateMeasuredMoodV1108,isMusicMoodHintV1108,createMusicEmotionSessionV1108,
  collectMusicEmotionSampleV1108,readMusicEmotionV1108,suggestCreativeDirectionV1108}=require(path.join(temp,'lib/aiMusicEmotionV1108.js'));
 const context={microphoneActive:true,playing:true,reducedMotion:false};
 const loud={volume:.85,bass:.8,mids:.6,highs:.35,energyEnvelope:.85,beatStrength:.9,attack:.8};
 const quiet={volume:.15,bass:.05,mids:.15,highs:.12,energyEnvelope:.11,beatStrength:.03,attack:.12};
 let a=estimateMeasuredMoodV1108(loud,context);
 assert(a&&a.source==='local-microphone'&&a.mood==='intense'&&a.confidence<=.78);
 a=estimateMeasuredMoodV1108(quiet,context);
 assert(a&&a.mood==='calm');
 console.log('PASS V1108 measured energetic vs quiet local heuristics');
 for(const invalid of [{...context,microphoneActive:false},{...context,playing:false},{...context,reducedMotion:true}])
  assert.equal(estimateMeasuredMoodV1108(loud,invalid),null);
 for(const bad of [{...loud,volume:NaN},{...loud,bass:Infinity},{...loud,highs:-2},{...loud,beatStrength:1.1},
  {...loud,volume:0},{...loud,energyEnvelope:0}])assert.equal(estimateMeasuredMoodV1108(bad,context),null);
 console.log('PASS V1108 no microphone, pause, reduced-motion, silent/invalid signal fail closed');
 for(const x of ['none','calm','atmospheric','focused','euphoric','intense'])assert(isMusicMoodHintV1108(x));
 for(const x of ['','device-control',{},null,NaN,'drop'])assert(!isMusicMoodHintV1108(x));
 console.log('PASS V1108 safe mood label enumeration');
 const panel=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
 assert(panel.includes('collectMusicEmotionSampleV1108(old,audio.metrics'));
 assert(panel.includes('readMusicEmotionV1108(next)'));
 assert(panel.includes('suggestCreativeDirectionV1108(reading)'));
 assert(panel.includes('Lokale Musikanalyse starten'));
 assert(panel.includes('Regievorschlag bewusst übernehmen'));
 assert(panel.includes('setSampling(false)'));
 assert(panel.includes('createMusicEmotionSessionV1108()'));
 assert(panel.includes('audio.active&&music.isPlaying&&!preferences.reducedMotion&&!!currentTrack'));
 assert(panel.includes('keine Audioübertragung'));
 assert(!fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8').includes('audio.metrics'));
 console.log('PASS V1108 only explicit opt-in may influence the bounded director; no raw audio reaches AI');
 const low={volume:.25,bass:.2,mids:.27,highs:.16,energyEnvelope:.23,beatStrength:.22,attack:.24};
 const high={volume:.85,bass:.82,mids:.55,highs:.56,energyEnvelope:.88,beatStrength:.86,attack:.75};
 const capture=(samples,track='track-A',dt=300)=>samples.reduce((session,values,i)=>
   collectMusicEmotionSampleV1108(session,values,context,1000+dt*i,track),createMusicEmotionSessionV1108());
 const rising=capture([...Array(9).fill(low),...Array(19).fill(high)]);
 const risingReading=readMusicEmotionV1108(rising);
 assert(risingReading,'Must recognize several seconds of non-silent energy');
 assert.equal(risingReading.trend,'rising');
 assert.equal(risingReading.ready,true);
 assert(risingReading.sampleCount>=20&&risingReading.durationMs>=4500&&risingReading.durationMs<=20000);
 assert(risingReading.confidence<=.85&&risingReading.confidence>=.52);
 assert(risingReading.peakEnergy>=risingReading.energy);
 const suggested=suggestCreativeDirectionV1108(risingReading);
 assert(suggested&&suggested.contrast<=80&&suggested.surprise<=70&&suggested.mood===risingReading.mood);
 console.log('PASS V1108 robust 20-second temporal estimate, rising energy and bounded creative recommendation');
 const falling=capture([...Array(9).fill(high),...Array(19).fill(low)]);
 assert.equal(readMusicEmotionV1108(falling).trend,'falling');
 const steady=capture(Array(28).fill(high));
 assert.equal(readMusicEmotionV1108(steady).trend,'steady');
 assert.equal(readMusicEmotionV1108(capture(Array(11).fill(high))),null);
 assert.equal(readMusicEmotionV1108(capture(Array(16).fill(high),'track-B',100)),null);
 assert.equal(suggestCreativeDirectionV1108(null),null);
 assert.equal(suggestCreativeDirectionV1108({...risingReading,ready:false}),null);
 assert.equal(suggestCreativeDirectionV1108({...risingReading,confidence:NaN}),null);
 console.log('PASS V1108 rising/falling/steady trends, insufficient duration and uncertain data fail-closed');
 let switched=collectMusicEmotionSampleV1108(rising,high,context,rising.lastAtMs+400,'track-B');
 assert.equal(switched.samples.length,1);
 assert.equal(switched.trackKey,'track-B');
 assert.equal(collectMusicEmotionSampleV1108(rising,high,{...context,playing:false},rising.lastAtMs+400,'track-A').samples.length,0);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,{...context,microphoneActive:false},rising.lastAtMs+400,'track-A').samples.length,0);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,{...context,reducedMotion:true},rising.lastAtMs+400,'track-A').samples.length,0);
 assert.equal(collectMusicEmotionSampleV1108(rising,{...high,bass:NaN},context,rising.lastAtMs+400,'track-A').samples.length,0);
 assert.equal(collectMusicEmotionSampleV1108(rising,{...high,volume:0},context,rising.lastAtMs+400,'track-A').samples.length,0);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,context,rising.lastAtMs+5000,'track-A').samples.length,1);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,context,rising.lastAtMs-200,'track-A').samples.length,1);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,context,rising.lastAtMs+100,'track-A'),rising);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,context,NaN,'track-A').samples.length,0);
 assert.equal(collectMusicEmotionSampleV1108(rising,high,context,rising.lastAtMs+400,'').samples.length,0);
 assert(readMusicEmotionV1108(createMusicEmotionSessionV1108())===null);
 const long=capture(Array(500).fill(high));
 assert(long.samples.length<=81&&long.samples.at(-1).atMs-long.samples[0].atMs<=20000);
 console.log('PASS V1108 track switching, pause, microphone loss, invalid audio and long-run memory are safely bounded');
 const api=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
 for(const sensitive of ['samples:','sampleCount:','energyEnvelope:','beatStrength:','trackKey:'])
  assert(!api.includes(sensitive),'Raw analysis data must never be sent from the API: '+sensitive);
 const browser=fs.readFileSync(path.join(root,'tests/e2e/ai-creative-producer-v1107.spec.cjs'),'utf8');
 assert(browser.includes('v1108-opt-in-microphone-off-screenshot'));
 assert(browser.includes("name:'Lokale Musikanalyse starten'"));
 const e2e=fs.readFileSync(path.join(root,'tests/e2e/ai-music-emotion-v1108.spec.cjs'),'utf8');
 assert(e2e.includes('v1108-opt-in-privacy-screenshot'));
 assert(e2e.includes('v1108-offline-concert-preview-screenshot'));
 assert(e2e.includes("getByRole('button',{name:'Lokale Musikanalyse starten'})"));
 console.log('PASS V1108 privacy, UI gating and visual regression coverage');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
