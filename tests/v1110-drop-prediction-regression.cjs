#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1110-'));
const check=(label,fn)=>{fn();console.log('PASS V1110 '+label)};
try{
 let tsc;
 try{tsc=require.resolve('typescript/bin/tsc');}
 catch{tsc=require('node:module').globalPaths.map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);}
 if(!tsc)throw Error('TypeScript compiler unavailable; install dev dependencies with npm ci');
 const compile=spawnSync(process.execPath,[tsc,'-p',path.join(root,'tests/tsconfig.v1110-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',temp],
 {cwd:root,encoding:'utf8',timeout:70000,windowsHide:true});
 assert.equal(compile.status,0,(compile.error?.message||'')+'\n'+compile.stdout+'\n'+compile.stderr);
 const {readDropReadinessV1110,directDropRemixV1110,syncDropStoryV1110}=require(path.join(temp,'lib/aiDropPredictionV1110.js'));
 const {readMusicEmotionV1108,createMusicEmotionSessionV1108,collectMusicEmotionSampleV1108}=require(path.join(temp,'lib/aiMusicEmotionV1108.js'));
 const {localAiShowRemixV1106,normalizeAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(temp,'lib/arena360AiShowRemixV1106.js'));
 const {generateArenaShowPlanV1040}=require(path.join(temp,'lib/arena360ShowDesignerV1040.js'));
 const {composeConcertStoryV1109}=require(path.join(temp,'lib/aiConcertStoryV1109.js'));
 const context={microphoneActive:true,playing:true,reducedMotion:false};
 const low={volume:.40,bass:.36,mids:.41,highs:.33,energyEnvelope:.40,beatStrength:.46,attack:.24};
 const build={volume:.74,bass:.70,mids:.58,highs:.47,energyEnvelope:.76,beatStrength:.72,attack:.38};
 const hit={volume:.89,bass:.88,mids:.7,highs:.51,energyEnvelope:.91,beatStrength:.91,attack:.9};
 const lowEnd={volume:.14,bass:.13,mids:.2,highs:.15,energyEnvelope:.16,beatStrength:.12,attack:.14};
 const capture=(values,track='demo-track',dt=300)=>values.reduce((s,a,i)=>
  collectMusicEmotionSampleV1108(s,a,context,1000+i*dt,track),createMusicEmotionSessionV1108());
 const predict=(session)=>readDropReadinessV1110(session,readMusicEmotionV1108(session));
 const ramp=(a,b,n)=>Array.from({length:n},(_,i)=>Object.fromEntries(Object.keys(a).map(k=>[k,a[k]+(b[k]-a[k])*(i+1)/n])));
 const building=capture([...Array(10).fill(low),...ramp(low,build,14)]);
 const impact=capture([...Array(18).fill(low),...Array(6).fill(hit)]);
 const fading=capture([...Array(10).fill(hit),...ramp(hit,lowEnd,14)]);
 const steady=capture(Array(24).fill(build));
 check('temporal buildup is a tentative hint, not a fabricated future timestamp',()=>{
  const p=predict(building);
  assert(p, 'Expected measured local build-up');
  assert.equal(p.phase,'building');assert.equal(p.cue,'prepare');
  assert(p.energyRise>.08&&p.confidence>=.56&&p.confidence<=.82);
  assert.equal(p.source,'local-microphone');
  assert(!('predictedAtMs' in p));assert(!('secondsToDrop' in p));
  assert.match(p.message,/KÖNNTE/);
 });
 check('a strong impulse is ALREADY observed and not represented as future prediction',()=>{
  const p=predict(impact);assert(p);assert.equal(p.phase,'impact-observed');
  assert.equal(p.cue,'accent');assert.match(p.message,/bereits gemessen/);
 });
 check('steady and cooling signals make no speculative drop claims',()=>{
  const a=predict(steady),b=predict(fading);
  assert(a&&b);assert.equal(a.phase,'steady');assert.equal(a.cue,null);
  assert.equal(b.phase,'cooldown');assert.equal(b.cue,null);
 });
 check('insufficient, stale, silent, invalid, changed-track and paused readings fail closed',()=>{
  const tooShort=capture(Array(12).fill(hit));assert.equal(predict(tooShort),null);
  const noSound=capture([...Array(12).fill(low),...Array(12).fill({...low,volume:0})]);
  assert.equal(predict(noSound),null);
  const read=readMusicEmotionV1108(building);
  assert(read);
  assert.equal(readDropReadinessV1110({...building,trackKey:''},read),null);
  assert.equal(readDropReadinessV1110({...building,lastAtMs:building.lastAtMs+100},read),null);
  assert.equal(readDropReadinessV1110({...building,samples:building.samples.map((s,i)=>i===7?{...s,bass:NaN}:s)},read),null);
  assert.equal(readDropReadinessV1110({...building,samples:building.samples.map((s,i)=>i===7?{...s,atMs:building.samples[6].atMs}:s)},read),null);
  assert.equal(readDropReadinessV1110(building,{...read,ready:false}),null);
  assert.equal(readDropReadinessV1110(building,{...read,confidence:NaN}),null);
  assert.equal(readDropReadinessV1110(null,read),null);
  for(const mode of ['playing','microphoneActive','reducedMotion']){
   const switched={...context,[mode]:mode==='reducedMotion'?true:false};
   const s=collectMusicEmotionSampleV1108(building,hit,switched,building.lastAtMs+300,'demo-track');
   assert.equal(predict(s),null);
  }
  const changed=collectMusicEmotionSampleV1108(building,hit,context,building.lastAtMs+300,'different-track');
  assert.equal(predict(changed),null);
 });
 check('capped 360° drop staging preserves seven authored scenes and full timeline',()=>{
  let total=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,35,45,60,70,85])for(const cue of ['prepare','accent']){
   const plan=generateArenaShowPlanV1040({genre,durationMs:257000,title:'Benutzer-Titel'});
   const base=localAiShowRemixV1106('Intensiver Bühnenbogen',genre,cap);
   const old=JSON.stringify(base),saved=JSON.stringify(plan);
   const out=directDropRemixV1110(base,cue,cap);
   assert(out,JSON.stringify({genre,cap,cue}));assert(normalizeAiShowRemixV1106(out));
   assert(out.acts.every((a,i)=>a.intensity<=cap&&a.intensity>=0&&a.scene===base.acts[i].scene));
   assert(out.acts.every((a,i)=>i===0||Math.abs(a.intensity-out.acts[i-1].intensity)<=45));
   assert.equal(out.acts[2].deck,'spiral');assert.equal(out.acts[3].lasers,'tunnel');
   assert.equal(out.acts[4].dance,'calm');
   const applied=applyAiShowRemixV1106(plan,out,cap);assert(applied);
   assert.deepEqual(applied.segments.map(s=>[s.scene,s.id,s.start,s.end]),
    plan.segments.map(s=>[s.scene,s.id,s.start,s.end]));
   assert.equal(applied.title,plan.title);assert.equal(applied.durationMs,plan.durationMs);
   assert.equal(JSON.stringify(base),old);assert.equal(JSON.stringify(plan),saved);
   total++;
  }
  assert.equal(total,48);
 });
 check('story previews and recomputed quality agree with drop-directed cues',()=>{
  for(const arc of ['crescendo','waves','mystery','anthem']){
   const plan=generateArenaShowPlanV1040({genre:'hard'});
   const source=localAiShowRemixV1106('Show','hard',70);
   const story=composeConcertStoryV1109(plan,source,{arc,pacing:'balanced',intensityCap:70});
   assert(story);
   const changed=directDropRemixV1110(story.remix,'prepare',70);assert(changed);
   const merged=syncDropStoryV1110(story,changed);assert(merged);
   assert.deepEqual(merged.beats.map(x=>x.intensity),changed.acts.map(x=>x.intensity));
   assert.deepEqual(merged.beats.map(x=>x.camera),changed.acts.map(x=>x.camera));
   assert(merged.quality.safeTransitions);
   assert.deepEqual(merged.beats.map(x=>[x.start,x.end]),story.beats.map(x=>[x.start,x.end]));
  }
 });
 check('malformed proposed shows, unsafe cues and invalid caps are always rejected',()=>{
  const good=localAiShowRemixV1106('Show','hard',70);
  assert.equal(directDropRemixV1110(good,'strobe',70),null);
  assert.equal(directDropRemixV1110(good,'prepare',95),null);
  assert.equal(directDropRemixV1110(good,'accent',NaN),null);
  assert.equal(directDropRemixV1110(null,'prepare',70),null);
  assert.equal(directDropRemixV1110({...good,acts:good.acts.map((a,i)=>i===2?{...a,lasers:'govee'}:a)},'prepare',70),null);
  assert.equal(syncDropStoryV1110(null,good),null);
 });
 check('UI and browser audit require explicit opt-in, image evidence and zero external audio data',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const api=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
  const e2e=fs.readFileSync(path.join(root,'tests/e2e/ai-drop-prediction-v1110.spec.cjs'),'utf8');
  for(const text of ['V1110 AI Drop Prediction','readDropReadinessV1110(next,measured)',
   'directDropRemixV1110(story?.remix??remix,dropCue,cap)','Drop-Dramaturgie für nächste Vorschau vormerken',
   'onClick={acceptDropCue}','disabled={busy||sampling||!canSample||!dropReading?.cue',
   'Letzten Remix rückgängig machen','setDropCue(null)','Keine Audioaufzeichnung',
   'keine Audioübertragung'])assert(ui.includes(text),text);
  assert(!api.includes('readDropReadinessV1110'));
  assert(!api.includes('samples:')&&!api.includes('audio.metrics'));
  assert(e2e.includes('v1110-drop-radar-privacy-screenshot'));
  assert(e2e.includes('v1110-drop-preview-screenshot'));
 });
 console.log('PASS V1110 AI Drop Prediction · all deterministic regression groups');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
