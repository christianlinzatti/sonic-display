#!/usr/bin/env node
'use strict';
/** Real compiled TS logic tests, fail closed and no network / hardware. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1111-'));
const check=(label,fn)=>{fn();console.log('PASS V1111 '+label)};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc');}
 catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);}
 if(!compiler)throw Error('TypeScript compiler unavailable; npm ci must install dev dependencies');
 const run=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1111-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',timeout:70000,windowsHide:true});
 assert.equal(run.status,0,run.stdout+'\n'+run.stderr+'\n'+(run.error?.message||''));
 const {CONDUCTOR_MODES_V1111,normalizeConductorOptionsV1111,conductAiShowV1111,sampleConductorCueV1111}=
  require(path.join(folder,'lib/aiLiveShowConductorV1111.js'));
 const {localAiShowRemixV1106,normalizeAiShowRemixV1106,applyAiShowRemixV1106}=
  require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,sampleArenaShowPlanV1040}=
  require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {composeConcertStoryV1109}=require(path.join(folder,'lib/aiConcertStoryV1109.js'));
 const {directDropRemixV1110,syncDropStoryV1110}=require(path.join(folder,'lib/aiDropPredictionV1110.js'));
 const opts={mode:'cinematic',intensityCap:70,surprise:true};
 check('144 genre/mode/cap/surprise combinations preserve synchronized seven-scene musical intentions',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,35,45,60,70,85])
   for(const mode of CONDUCTOR_MODES_V1111)for(const surprise of [false,true]){
    const plan=generateArenaShowPlanV1040({genre,durationMs:277000,title:'Meine User Show'});
    const source=localAiShowRemixV1106('Große Konzertregie und finales Licht',genre,cap);
    const previous=JSON.stringify(plan),old=JSON.stringify(source);
    const result=conductAiShowV1111(plan,source,{mode,intensityCap:cap,surprise});
    assert(result,JSON.stringify({genre,cap,mode,surprise}));
    assert(normalizeAiShowRemixV1106(result.remix));
    assert.equal(result.cues.length,7);assert.equal(result.quality.synchronizedActs,7);
    assert(result.quality.cameraVariety>=3);
    assert(result.quality.continuousTimeline&&result.quality.safeTransitions);
    assert(result.quality.quietContrast&&result.quality.controlledFinale);
    assert(result.cues.every((cue,i)=>cue.index===i&&cue.scene===plan.segments[i].scene&&
     cue.start===plan.segments[i].start&&cue.end===plan.segments[i].end&&cue.intensity<=cap&&cue.intensity>=0&&
     cue.intensity===result.remix.acts[i].intensity&&cue.camera===result.remix.acts[i].camera&&
     cue.dance===result.remix.acts[i].dance&&cue.deck===result.remix.acts[i].deck&&
     cue.floating===result.remix.acts[i].floating&&cue.lasers===result.remix.acts[i].lasers));
    assert.equal(result.cues[2].camera,'orbit');assert.equal(result.cues[2].lasers,'spiral');
    assert.equal(result.cues[3].camera,'group');assert.equal(result.cues[3].dance,'group');
    assert.equal(result.cues[4].dance,'calm');assert.equal(result.cues[4].lasers,'halo');
    assert.equal(result.cues[6].dance,'peak');assert.equal(result.cues[6].camera,'group');
    assert.equal(result.cues[5].camera,surprise?'orbit':'lead');
    const applied=applyAiShowRemixV1106(plan,result.remix,cap);
    assert(applied&&normalizeArenaShowPlanV1040(applied));
    assert.deepEqual(applied.segments.map(s=>[s.id,s.scene,s.start,s.end]),
     plan.segments.map(s=>[s.id,s.scene,s.start,s.end]));
    assert.equal(applied.title,plan.title);assert.equal(applied.durationMs,plan.durationMs);
    assert.equal(JSON.stringify(plan),previous);assert.equal(JSON.stringify(source),old);
    count++;
   }
  assert.equal(count,144);
 });
 check('live playback stays with established V1040 sampler and playback/reduced-motion guards',()=>{
  const plan=generateArenaShowPlanV1040({genre:'hard'});
  const source=localAiShowRemixV1106('Concert','hard',70);
  const produced=conductAiShowV1111(plan,source,opts);assert(produced);
  const real=applyAiShowRemixV1106(plan,produced.remix,70);
  for(const i of [0,1,2,3,4,5,6]){
   const progress=Math.round(((plan.segments[i].start+plan.segments[i].end)/2)*plan.durationMs);
   const cue=sampleArenaShowPlanV1040(real,{enabled:true,playing:true,reducedMotion:false,
    progressMs:progress,durationMs:plan.durationMs});
   assert(cue.active);assert.equal(cue.segmentIndex,i);
   assert.equal(cue.camera,produced.cues[i].camera);assert.equal(cue.lasers,produced.cues[i].lasers);
   assert.equal(cue.floating,produced.cues[i].floating);assert.equal(cue.dance,produced.cues[i].dance);
   assert.equal(sampleArenaShowPlanV1040(real,{enabled:true,playing:false,reducedMotion:false,
    progressMs:progress,durationMs:plan.durationMs}).active,false);
   assert.equal(sampleArenaShowPlanV1040(real,{enabled:true,playing:true,reducedMotion:true,
    progressMs:progress,durationMs:plan.durationMs}).active,false);
   assert.equal(sampleArenaShowPlanV1040(real,{enabled:false,playing:true,reducedMotion:false,
    progressMs:progress,durationMs:plan.durationMs}).active,false);
  }
 });
 check('virtual rehearsal responds to user-authored exact boundaries without controlling playback',()=>{
  let plan=generateArenaShowPlanV1040({genre:'rap',durationMs:321000,title:'Manuelle Grenzen'});
  plan={...plan,segments:plan.segments.map((s,i)=>i===0?{...s,end:.12}:i===1?{...s,start:.12}:s)};
  assert(normalizeArenaShowPlanV1040(plan));
  const out=conductAiShowV1111(plan,localAiShowRemixV1106('Story','rap',70),opts);assert(out);
  assert.equal(sampleConductorCueV1111(out,0).index,0);
  assert.equal(sampleConductorCueV1111(out,.1199).index,0);
  assert.equal(sampleConductorCueV1111(out,.12).index,1);
  assert.equal(sampleConductorCueV1111(out,.4299).index,2);
  assert.equal(sampleConductorCueV1111(out,.43).index,3);
  assert.equal(sampleConductorCueV1111(out,1).index,6);
  for(const bad of [-1,1.001,NaN,Infinity,'0.3',null,undefined])
   assert.equal(sampleConductorCueV1111(out,bad),null);
  assert.equal(sampleConductorCueV1111(null,.5),null);
 });
 check('existing story and drop directing remains compatible and quality beats stay synchronized',()=>{
  for(const arc of ['crescendo','waves','mystery','anthem'])for(const mode of CONDUCTOR_MODES_V1111){
   const plan=generateArenaShowPlanV1040({genre:'hard'});
   const initial=localAiShowRemixV1106('Konzert','hard',70);
   const story=composeConcertStoryV1109(plan,initial,{arc,pacing:'balanced',intensityCap:70});assert(story);
   const drop=directDropRemixV1110(story.remix,'prepare',70);assert(drop);
   const show=conductAiShowV1111(plan,drop,{...opts,mode});assert(show);
   const aligned=syncDropStoryV1110(story,show.remix);assert(aligned);
   assert.deepEqual(aligned.beats.map(b=>[b.camera,b.dance,b.intensity]),
    show.cues.map(c=>[c.camera,c.dance,c.intensity]));
   assert.deepEqual(aligned.beats.map(b=>[b.start,b.end]),show.cues.map(c=>[c.start,c.end]));
   assert(aligned.quality.safeTransitions);
  }
 });
 check('invalid AI data and unsafe caps/modes are rejected, without falling back to commands',()=>{
  const plan=generateArenaShowPlanV1040({genre:'hard'});
  const remix=localAiShowRemixV1106('Show','hard',70);
  for(const o of [null,{},[],{...opts,mode:'govee'}, {...opts,surprise:'true'},
   {...opts,intensityCap:100},{...opts,intensityCap:0},{...opts,intensityCap:70.5},
   {...opts,intensityCap:Infinity},{...opts,mode:null}]){
    assert.equal(normalizeConductorOptionsV1111(o),null);
    assert.equal(conductAiShowV1111(plan,remix,o),null);
  }
  assert.equal(conductAiShowV1111(null,remix,opts),null);
  assert.equal(conductAiShowV1111({...plan,segments:plan.segments.slice(0,5)},remix,opts),null);
  assert.equal(conductAiShowV1111(plan,{...remix,acts:remix.acts.map((a,i)=>i===3?{...a,deck:'fireworks'}:a)},opts),null);
  assert.equal(conductAiShowV1111(plan,{...remix,acts:remix.acts.map((a,i)=>i===3?{...a,intensity:100}:a)},opts),null);
  assert.equal(conductAiShowV1111(plan,remix,{...opts,intensityCap:30}),null);
 });
 check('UI requires deliberate preview and apply; browser specs attach real screenshot evidence',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const api=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
  const e2e=fs.readFileSync(path.join(root,'tests/e2e/ai-live-conductor-v1111.spec.cjs'),'utf8');
  for(const needle of ['V1111 AI Live Show Conductor','conductAiShowV1111(base,dropped.staged,',
   'sampleConductorCueV1111(conductorPreview,previewPercent)','Konzertregie jetzt proben',
   'V1111 Konzertregie Partitur','V1111 sieben koordinierte Regie-Cues',
   'Diese sieben Szenen in meinen Showplan übernehmen','Letzten Remix rückgängig machen',
   'setConductorPreview(null)','updatePreferences({arenaShowPlanV1040:result})'])
   assert(ui.includes(needle),needle);
  for(const fragment of ['v1111-conductor-rehearsal-screenshot','v1111-conductor-approved-undo-screenshot'])
   assert(e2e.includes(fragment),fragment);
  assert(!ui.includes("fetch('/api/govee"));
  assert(!api.includes('aiLiveShowConductorV1111'));
  assert(!api.includes('audio.metrics'));
 });
 console.log('PASS V1111 AI Live Show Conductor · all deterministic safety and show-integration groups');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
