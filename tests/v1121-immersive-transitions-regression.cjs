#!/usr/bin/env node
'use strict';
/** Compile the real V1121 source and test boundaries, privacy and live opt-in. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1121-'));
function check(name,fn){fn();console.log('PASS V1121 '+name)}
try{
 let compiler;try{compiler=require.resolve('typescript/bin/tsc');}catch{
  compiler=require('node:module').globalPaths.map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 }
 if(!compiler)compiler=(process.env.NODE_PATH||'').split(path.delimiter).map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 assert(compiler,'TypeScript compiler missing: run npm ci first');
 const out=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1121-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',dir],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(out.status,0,out.stdout+'\n'+out.stderr+'\n'+(out.error?.message||''));
 const {generateArenaShowPlanV1040}=require(path.join(dir,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(dir,'lib/arena360AiShowRemixV1106.js'));
 const {TRANSITION_STYLES_V1121,normalizeTransitionOptionsV1121,
  directImmersiveTransitionsV1121,sampleImmersiveTransitionV1121,transitionLivePresetV1121}
  =require(path.join(dir,'lib/aiImmersiveSceneTransitionsV1121.js'));
 const make=(genre='rap',cap=70,style='cinematic',strength=50,duration='balanced')=>{
  const base=generateArenaShowPlanV1040({genre,title:'V1121 transition test',durationMs:210000});
  const remix=localAiShowRemixV1106('Fließende 360-Grad Konzertshow',genre,cap);
  const options={style,strength,duration,intensityCap:cap};
  return {base,remix,options,show:directImmersiveTransitionsV1121(base,remix,options)};
 };
 check('288 genre × cap × style × strength × duration combinations preserve timing and assets',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,70])
   for(const style of TRANSITION_STYLES_V1121)for(const strength of [20,50,80])
   for(const duration of ['short','balanced','long']){
    const {base,remix,show}=make(genre,cap,style,strength,duration);
    assert(show,JSON.stringify({genre,cap,style,strength,duration}));
    assert.equal(show.cues.length,6);
    assert.equal(show.quality.hardwareCommands,0);assert.equal(show.quality.detectedDrops,0);
    assert(show.quality.noOverlappingWindows&&show.quality.originalTiming);
    assert.deepEqual(show.remix,remix);
    assert.deepEqual(applyAiShowRemixV1106(base,show.remix,cap).segments.map(s=>[s.id,s.start,s.end]),
     base.segments.map(s=>[s.id,s.start,s.end]));
    show.cues.forEach((cue,i)=>{
     const left=base.segments[i],right=base.segments[i+1];
     assert(cue.startMs>=0&&cue.endMs<=base.durationMs);
     assert.equal(cue.atMs,Math.round(left.end*base.durationMs));
     assert.equal(cue.from,left.scene);assert.equal(cue.to,right.scene);
     assert(cue.durationMs>0&&cue.durationMs<=2100*80/60+2);
     assert.equal(cue.newLiveTimeline,false);assert.equal(cue.actualSongEventDetected,false);
     if(i)assert(cue.startMs>show.cues[i-1].endMs);
    });count++;
   }
  assert.equal(count,288); // 4 genres × 2 caps × 4 styles × 3 strengths × 3 durations
 });
 check('changed author boundaries constrain windows instead of rewriting song time',()=>{
  const {base,remix,options}=make();const ends=[.04,.20,.22,.67,.69,.94,1];
  const edited={...base,segments:base.segments.map((s,i)=>({...s,start:i?ends[i-1]:0,end:ends[i]}))};
  const before=JSON.stringify(edited),beforeRemix=JSON.stringify(remix);
  const show=directImmersiveTransitionsV1121(edited,remix,options);assert(show);
  assert.equal(show.cues.length,6);assert.equal(JSON.stringify(edited),before);
  assert.equal(JSON.stringify(remix),beforeRemix);
  for(let i=0;i<6;i++){
   const cue=show.cues[i], leftMs=(edited.segments[i].end-edited.segments[i].start)*edited.durationMs;
   const rightMs=(edited.segments[i+1].end-edited.segments[i+1].start)*edited.durationMs;
   assert(cue.durationMs<=Math.round(Math.min(leftMs,rightMs)*.44)+2);
  }
 });
 check('interpolation is continuous, bounded and deterministic at every seam',()=>{
  const show=make().show;
  for(const cue of show.cues){
   const at=(ms)=>sampleImmersiveTransitionV1121(show,ms/show.durationMs);
   const start=at(cue.startMs),middle=at(cue.atMs),end=at(cue.endMs);
   assert.equal(start.blend,0);assert.equal(middle.blend,.5);assert.equal(end.blend,1);
   assert(Math.abs(middle.intensityPreview-Math.round((cue.intensityFrom+cue.intensityTo)/2))<=1);
   assert.equal(start.phase,'anticipation');assert.equal(middle.phase,'handoff');
   for(const x of [start,middle,end]){
    for(const k of ['camera','stage','hologram','lighting']){
     const from=x[k+'FromGain'],to=x[k+'ToGain'];
     assert(from>=0&&from<=1&&to>=0&&to<=1);
     assert(Math.abs(from+to-1)<1e-9);
    }
   }
  }
 });
 check('four styles have genuinely distinct, continuous fade characteristics',()=>{
  const values=[];
  for(const style of TRANSITION_STYLES_V1121){
   const show=make('rap',70,style,50,'balanced').show;
   const cue=show.cues[0];
   const at=cue.startMs+Math.round(cue.durationMs*.25);
   const sample=sampleImmersiveTransitionV1121(show,at/show.durationMs);
   assert(sample&&sample.blend>0&&sample.blend<.5);values.push(sample.blend.toFixed(5));
  }
  assert.equal(new Set(values).size,4);
 });
 check('rehearsal is inactive away from seams and for invalid values',()=>{
  const show=make().show;assert.equal(sampleImmersiveTransitionV1121(null,.2),null);
  for(const bad of [-1,.1/0,NaN,Infinity,1.01,'0.1',undefined])assert.equal(sampleImmersiveTransitionV1121(show,bad),null);
  assert.equal(sampleImmersiveTransitionV1121(show,0),null);
  assert.equal(sampleImmersiveTransitionV1121(show,1),null);
  const between=(show.cues[1].endMs+show.cues[2].startMs)/2;
  assert.equal(sampleImmersiveTransitionV1121(show,between/show.durationMs),null);
 });
 check('invalid inputs and oversized intensity fail closed',()=>{
  const {base,remix,options}=make();
  for(const raw of [null,{},[],{...options,style:'strobe'},
   {...options,duration:'hours'},{...options,strength:55},{...options,strength:0},
   {...options,intensityCap:100},{...options,intensityCap:NaN}]){
    assert.equal(normalizeTransitionOptionsV1121(raw),null);
    assert.equal(directImmersiveTransitionsV1121(base,remix,raw),null);
    assert.equal(transitionLivePresetV1121(raw),null);
   }
  assert.equal(directImmersiveTransitionsV1121(null,remix,options),null);
  assert.equal(directImmersiveTransitionsV1121(base,null,options),null);
  assert.equal(directImmersiveTransitionsV1121(base,{...remix,acts:remix.acts.slice(1)},options),null);
  assert.equal(directImmersiveTransitionsV1121(base,{...remix,acts:remix.acts.map((a,i)=>i===3?{...a,intensity:85}:a)},options),null);
 });
 check('live opt-in contains only established, bounded virtual renderer keys',()=>{
  const preset=transitionLivePresetV1121({style:'festival',strength:80,duration:'long',intensityCap:45});assert(preset);
  assert.deepEqual(Object.keys(preset).sort(),[
   'arenaSmartConcertFlowEnabledV1071','arenaSmartConcertFlowStrengthV1071',
   'arenaShowCameraEnabledV1043','arenaShowCameraStrengthV1043',
   'arenaCameraDirectorEnabledV1072','arenaCameraDirectorStrengthV1072',
   'arenaCinematicLightingEnabledV1056','arenaCinematicLightingStrengthV1056',
   'arenaTransformingStageEnabledV1066','arenaTransformingStageStrengthV1066',
   'arenaFloatingExperienceEnabledV1067','arenaFloatingExperienceStrengthV1067',
   'arenaHolographicConcertEnabledV1068','arenaHolographicConcertStrengthV1068'].sort());
  assert(Object.values(preset).every(x=>x===true||x===45));
  assert(!Object.keys(preset).some(k=>/govee|dmx|physical|strob|pyro|microphone|spotify|flash/i.test(k)));
 });
 check('UI requires explicit preview and guarded live opt-in; no network in local planner',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const needle of ['V1121 AI Immersive Scene Transitions','V1121 Übergänge jetzt proben',
   'V1121 Immersive Scene Transitions Partitur','V1121 sechs Szenenübergänge',
   'V1121 vorhandene virtuelle Übergangsregie aktivieren','transitionLivePresetV1121',
   'transitionUndo.current','transitionEnabled||masterEnabled?directImmersiveTransitionsV1121',
   'transitionPreview','preferences.reducedMotion','arenaHologramPatternV1039',
   'V1121 Übergangseinstellungen wurden inzwischen manuell geändert']){
    assert(ui.includes(needle),needle);
   }
  const src=fs.readFileSync(path.join(root,'lib/aiImmersiveSceneTransitionsV1121.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|new WebGL/i.test(src));
 });
}finally{fs.rmSync(dir,{recursive:true,force:true});}
