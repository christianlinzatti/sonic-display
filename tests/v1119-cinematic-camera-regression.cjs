#!/usr/bin/env node
'use strict';
/** Production TS compiled and exercised on real authored timelines, no mocks of camera logic. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1119-'));
const check=(label,fn)=>{fn();console.log('PASS V1119 '+label);};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc');}catch{
  compiler=require('node:module').globalPaths.map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 }
 if(!compiler){const loc=process.env.NODE_PATH||'';
  compiler=loc.split(path.delimiter).map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 }
 assert(compiler,'typescript compiler missing (npm ci required)');
 const compiled=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1119-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',windowsHide:true,timeout:90000});
 assert.equal(compiled.status,0,compiled.stdout+'\n'+compiled.stderr+'\n'+(compiled.error?.message||''));
 const {generateArenaShowPlanV1040}=require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const {CAMERA_STYLES_V1119,normalizeCameraOptionsV1119,directCinematicCameraV1119,cameraLivePresetV1119,
  sampleCameraCueV1119}=require(path.join(folder,'lib/aiCinematicCameraDirectorV1119.js'));
 const make=(genre='rap',cap=70,style='cinematic',strength=50)=>{
  const base=generateArenaShowPlanV1040({genre,durationMs:230000,title:'Safe camera story'});
  const remix=localAiShowRemixV1106('Cinematic 360 Grad Konzert',genre,cap);
  const options={style,strength,intensityCap:cap};
  return {base,remix,options,show:directCinematicCameraV1119(base,remix,options)};
 };
 check('256 genre × cap × camera style × strength combinations remain safe',()=>{
  let tested=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of CAMERA_STYLES_V1119)for(const strength of [20,40,60,80]){
    const {base,remix,show}=make(genre,cap,style,strength);
    assert(show,JSON.stringify({genre,cap,style,strength}));
    assert.equal(show.cues.length,7);assert.equal(show.quality.scenes,7);
    assert(show.quality.preservedTimeline&&show.quality.smoothExistingCamera);
    assert.equal(show.quality.hardwareCommands,0);assert.equal(show.quality.detectedVocals,0);
    const saved=applyAiShowRemixV1106(base,show.remix,cap);assert(saved);
    assert.deepEqual(saved.segments.map(s=>[s.id,s.start,s.end]),base.segments.map(s=>[s.id,s.start,s.end]));
    for(let i=0;i<7;i++){
     const old=remix.acts[i],next=show.remix.acts[i],cue=show.cues[i];
     for(const key of ['deck','floating','lasers','dance','intensity','scene'])assert.equal(next[key],old[key],key);
     assert.equal(cue.camera,next.camera);assert.equal(cue.source,'authored-timeline');
     assert.equal(cue.transition,'continuous-v1072');assert.equal(cue.manualCameraPriority,true);
     assert.equal(cue.shotDurationMinSeconds,10);assert.equal(cue.singerDetected,false);
     if(strength<40)assert.equal(next.camera,old.camera);
     assert.equal(cue.start,base.segments[i].start);assert.equal(cue.end,base.segments[i].end);
    }
    if(strength>=40)assert(show.quality.quietBreak&&show.quality.ensembleFinale);
    tested++;
   }
  assert.equal(tested,256);
 });
 check('four filmic styles, understandable artist/cast focus and a quiet scene',()=>{
  const looks=CAMERA_STYLES_V1119.map(style=>make('rap',70,style,80).show.cues.map(c=>c.camera).join(','));
  assert.equal(new Set(looks).size,4);
  for(const style of CAMERA_STYLES_V1119){
   const cues=make('hard',70,style,80).show.cues;
   assert.equal(cues[4].scene,'interlude');assert.equal(cues[4].camera,'wide');
   assert.equal(cues[6].camera,'group');
   assert(cues.filter(c=>c.camera==='orbit'||c.camera==='lead'||c.camera==='group').length>=3);
   assert(cues.every(c=>c.focus==='artist-unknown'||c.focus==='ensemble'||c.focus==='stage'));
  }
 });
 check('exact hand-authored boundaries and inputs remain immutable',()=>{
  const {base,remix,options}=make();
  const ends=[.06,.25,.39,.6,.74,.9,1];
  const altered={...base,segments:base.segments.map((s,i)=>({...s,start:i?ends[i-1]:0,end:ends[i]}))};
  const old=JSON.stringify(altered),original=JSON.stringify(remix);
  const out=directCinematicCameraV1119(altered,remix,options);assert(out);
  assert.deepEqual(out.cues.map(c=>[c.start,c.end]),altered.segments.map(s=>[s.start,s.end]));
  assert.deepEqual(applyAiShowRemixV1106(altered,out.remix,70).segments.map(s=>[s.start,s.end]),
   altered.segments.map(s=>[s.start,s.end]));
  assert.equal(JSON.stringify(altered),old);assert.equal(JSON.stringify(remix),original);
 });
 check('invalid intensity caps, unknown styles, broken remix and wrong scenes fail closed',()=>{
  const {base,remix,options}=make();
  for(const invalid of [null,undefined,{},[],{style:'drone',strength:50,intensityCap:70},
   {style:'cinematic',strength:0,intensityCap:70},{style:'festival',strength:55,intensityCap:70},
   {style:'artist',strength:90,intensityCap:70},{style:'immersive',strength:'50',intensityCap:70},
   {style:'festival',strength:50,intensityCap:0},{style:'artist',strength:40,intensityCap:Infinity}]){
   assert.equal(normalizeCameraOptionsV1119(invalid),null);
   assert.equal(directCinematicCameraV1119(base,remix,invalid),null);
   assert.equal(cameraLivePresetV1119(invalid),null);
  }
  assert.equal(directCinematicCameraV1119(null,remix,options),null);
  assert.equal(directCinematicCameraV1119(base,null,options),null);
  assert.equal(directCinematicCameraV1119(base,{...remix,acts:remix.acts.slice(1)},options),null);
  assert.equal(directCinematicCameraV1119(base,{...remix,acts:remix.acts.map((a,i)=>i===0?{...a,intensity:80}:a)},options),null);
 });
 check('live preset only switches on existing camera controllers within cap',()=>{
  const preset=cameraLivePresetV1119({style:'immersive',strength:80,intensityCap:45});assert(preset);
  assert.deepEqual(Object.keys(preset).sort(),[
   'arenaShowCameraEnabledV1043','arenaShowCameraStrengthV1043',
   'arenaCinematicCameraEnabledV1053','arenaCinematicCameraStrengthV1053',
   'arenaCameraDirectorEnabledV1072','arenaCameraDirectorStrengthV1072'].sort());
  assert(Object.values(preset).every(value=>value===true||value===45));
  assert(!Object.keys(preset).some(k=>/govee|pyro|strobe|spotify|microphone|lights|avatar/i.test(k)));
 });
 check('scene sampler respects exact timeline, invalid input and final frame',()=>{
  const show=make().show;
  for(const invalid of [-.01,1.01,NaN,Infinity,'0.5',undefined])assert.equal(sampleCameraCueV1119(show,invalid),null);
  assert.equal(sampleCameraCueV1119(null,.5),null);
  assert.equal(sampleCameraCueV1119(show,0).index,0);
  assert.equal(sampleCameraCueV1119(show,1).index,6);
  for(const cue of show.cues)assert.equal(sampleCameraCueV1119(show,(cue.start+cue.end)/2).index,cue.index);
 });
 check('UI exposes explicit approval, rollback, guarded live camera, preview and no automatic API call',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const needle of ['V1119 AI Cinematic Camera Director','V1119 Kamerafahrt jetzt proben',
   'V1119 Cinematic Camera Partitur','V1119 sieben Kameraszenen',
   'V1119 vorhandene filmische Kamerafahrten aktivieren','cameraLivePresetV1119',
   'cameraUndo.current','cameraEnabled||masterEnabled?directCinematicCameraV1119',
   'camera?.remix??holo?.remix??stage?.remix??finalRemix',
   'arenaCameraEnabledV1032','preferences.reducedMotion','arenaConcertDirectorEnabledV1048',
   'Kamera-Einstellungen wurden inzwischen manuell geändert'])assert(ui.includes(needle),needle);
  const source=fs.readFileSync(path.join(root,'lib/aiCinematicCameraDirectorV1119.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|new WebGL/i.test(source));
 });
}finally{fs.rmSync(folder,{recursive:true,force:true});}
