#!/usr/bin/env node
'use strict';
/** Compiles and exercises actual V1117 TS; no shallow mock of the real planner. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1117-'));
const check=(name,fn)=>{fn();console.log('PASS V1117 '+name)};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc')}catch{
  compiler=require('node:module').globalPaths.map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 }
 if(!compiler){const cmd=spawnSync('tsc',['--version'],{encoding:'utf8',shell:process.platform==='win32'});
  if(cmd.status===0){const location=process.env.NODE_PATH||'';
   compiler=location.split(path.delimiter).map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
  }
 }
 assert(compiler,'typescript compiler missing (npm ci required)');
 const compile=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1117-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',windowsHide:true,timeout:90000});
 assert.equal(compile.status,0,compile.stdout+'\n'+compile.stderr+'\n'+(compile.error?.message||''));
 const {generateArenaShowPlanV1040,applyAiShowRemixV1106}=(()=>{
  const a=require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
  const b=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
  return {...a,...b};
 })();
 const {localAiShowRemixV1106}=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const {STAGE_STYLES_V1117,normalizeStageOptionsV1117,directStageTransformationV1117,
  stageLivePresetV1117,sampleStageCueV1117}=require(path.join(folder,'lib/aiStageTransformationV1117.js'));
 const make=(genre='rap',cap=70,style='kinetic',strength=50)=>{
  const base=generateArenaShowPlanV1040({genre,durationMs:215000,title:'V1117 safe song'});
  const remix=localAiShowRemixV1106('Cinematic Show',genre,cap);
  const options={style,strength,intensityCap:cap};
  return {base,remix,options,show:directStageTransformationV1117(base,remix,options)};
 };
 check('256 genre/style/cap/strength cases keep all authored boundaries and non-stage fields',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of STAGE_STYLES_V1117)for(const strength of [20,40,60,80]){
    const {base,remix,show}=make(genre,cap,style,strength);
    assert(show,JSON.stringify({genre,cap,style,strength}));
    assert.equal(show.cues.length,7);assert.equal(show.quality.scenes,7);
    assert(show.quality.preservedTimeline&&show.quality.quietBreak&&show.quality.smoothTransitions);
    assert.equal(show.quality.hardwareCommands,0);
    const saved=applyAiShowRemixV1106(base,show.remix,cap);
    assert(saved);assert.equal(saved.durationMs,base.durationMs);assert.equal(saved.title,base.title);
    assert.deepEqual(saved.segments.map(s=>[s.id,s.start,s.end,s.intensity,s.camera,s.dance]),
     base.segments.map((s,i)=>[s.id,s.start,s.end,remix.acts[i].intensity,remix.acts[i].camera,remix.acts[i].dance]));
    for(let i=0;i<7;i++){
     const cue=show.cues[i],act=show.remix.acts[i],old=remix.acts[i];
     assert.equal(cue.source,'authored-timeline');assert.equal(cue.physicalStage,false);
     assert.equal(cue.transition,'soft-crossfade');
     assert.equal(act.intensity,old.intensity);assert.equal(act.camera,old.camera);
     assert.equal(act.dance,old.dance);assert.equal(cue.intensity,old.intensity);
     assert(cue.intensity<=cap);
     if(strength<30)assert.equal(act.floating,old.floating);
     if(strength<60)assert.equal(act.lasers,old.lasers);
    }
    count++;
   }
  assert.equal(count,256);
 });
 check('stage profiles vary and have a quiet interlude without fake drop scheduling',()=>{
  const patterns=STAGE_STYLES_V1117.map(style=>make('rap',70,style,80).show.cues.map(c=>
   [c.deck,c.floating,c.lasers].join('/')).join('|'));
  assert.equal(new Set(patterns).size,4);
  for(const style of STAGE_STYLES_V1117){
   const cues=make('rap',70,style,80).show.cues;
   assert.equal(cues[4].scene,'interlude');assert.equal(cues[4].deck,'halo');
   assert.equal(cues[4].floating,'wave');
   assert(new Set(cues.map(c=>c.deck)).size>=2);
  }
 });
 check('user edited timeline is preserved exactly and no mutation leaks',()=>{
  const {base,remix,options}=make();
  // Editable V1094 boundaries: use a different valid contiguous seven-section schedule.
  const ends=[.06,.26,.39,.59,.74,.9,1];
  const changed={...base,segments:base.segments.map((s,i)=>({...s,start:i?ends[i-1]:0,end:ends[i]}))};
  const old=JSON.stringify(changed),previous=JSON.stringify(remix);
  const stage=directStageTransformationV1117(changed,remix,options);
  assert(stage);
  assert.deepEqual(stage.cues.map(c=>[c.start,c.end]),changed.segments.map(s=>[s.start,s.end]));
  assert.equal(JSON.stringify(changed),old);assert.equal(JSON.stringify(remix),previous);
  const saved=applyAiShowRemixV1106(changed,stage.remix,70);
  assert.deepEqual(saved.segments.map(s=>[s.start,s.end]),changed.segments.map(s=>[s.start,s.end]));
 });
 check('invalid payloads and over-limit incoming designs are rejected fail closed',()=>{
  const {base,remix,options}=make();
  for(const invalid of [null,undefined,{},[],
   {style:'laser',strength:50,intensityCap:70},
   {style:'kinetic',strength:85,intensityCap:70},
   {style:'kinetic',strength:55,intensityCap:70},
   {style:'kinetic',strength:0,intensityCap:70},
   {style:'kinetic',strength:'50',intensityCap:70},
   {style:'kinetic',strength:50,intensityCap:101},
   {style:'kinetic',strength:50,intensityCap:NaN}]){
   assert.equal(normalizeStageOptionsV1117(invalid),null);
   assert.equal(directStageTransformationV1117(base,remix,invalid),null);
   assert.equal(stageLivePresetV1117(invalid),null);
  }
  assert.equal(directStageTransformationV1117(null,remix,options),null);
  assert.equal(directStageTransformationV1117(base,null,options),null);
  assert.equal(directStageTransformationV1117(base,{...remix,acts:remix.acts.slice(1)},options),null);
  assert.equal(directStageTransformationV1117(base,{...remix,acts:remix.acts.map((a,i)=>
   i===1?{...a,intensity:80}:a)},options),null);
 });
 check('stage preset only enables existing virtual effects within bounded values',()=>{
  const p=stageLivePresetV1117({style:'floating',strength:80,intensityCap:45});
  assert(p);assert.deepEqual(Object.keys(p).sort(),[
   'arenaTransformingStageEnabledV1066','arenaTransformingStageStrengthV1066',
   'arenaFloatingExperienceEnabledV1067','arenaFloatingExperienceStrengthV1067',
   'arenaDynamicArchitectureEnabledV1082','arenaDynamicArchitectureStrengthV1082',
   'arenaEpicTransformationEnabledV1086','arenaEpicTransformationStrengthV1086'].sort());
  assert(Object.values(p).every(v=>v===true||v===45));
  assert(!Object.keys(p).some(k=>/govee|pyro|strobe|real|spotify|microphone/i.test(k)));
 });
 check('clock-based preview sampling rejects unknown positions and samples final frame',()=>{
  const show=make().show;
  assert.equal(sampleStageCueV1117(show,-.01),null);
  assert.equal(sampleStageCueV1117(show,Number.NaN),null);
  assert.equal(sampleStageCueV1117(show,Infinity),null);
  assert.equal(sampleStageCueV1117(null,.5),null);
  assert.equal(sampleStageCueV1117(show,1.1),null);
  assert.equal(sampleStageCueV1117(show,0).index,0);
  assert.equal(sampleStageCueV1117(show,1).index,6);
  for(const c of show.cues){assert.equal(sampleStageCueV1117(show,(c.start+c.end)/2).index,c.index);}
 });
 check('React UI has a separate rehearsal, approval, conflict safe undo and no background AI',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const token of ['V1117 AI Stage Transformation','V1117 Bühnenverwandlung jetzt proben',
   'V1117 Stage Transformation Partitur','V1117 sieben Bühnenverwandlungen',
   'V1117 vorhandene virtuelle Bühnenverwandlung aktivieren',
   'stageLivePresetV1117','stageUndo.current','stageEnabled?directStageTransformationV1117',
   'stage?.remix??finalRemix','preferences.reducedMotion','arenaConcertDirectorEnabledV1048',
   'Bühneneinstellungen wurden manuell geändert'])assert(ui.includes(token),token);
  const code=fs.readFileSync(path.join(root,'lib/aiStageTransformationV1117.ts'),'utf8');
  assert(!/\bfetch\s*\(/.test(code));assert(!/localStorage|navigator\.mediaDevices|setInterval/.test(code));
 });
}finally{fs.rmSync(folder,{recursive:true,force:true});}
