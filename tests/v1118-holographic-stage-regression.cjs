#!/usr/bin/env node
'use strict';
/** Runs compiled production TypeScript; exercises real V1039/V1068/V1081/V1085 handoff. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1118-'));
const check=(name,fn)=>{fn();console.log('PASS V1118 '+name)};
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
 const compile=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1118-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',windowsHide:true,timeout:90000});
 assert.equal(compile.status,0,compile.stdout+'\n'+compile.stderr+'\n'+(compile.error?.message||''));
 const {generateArenaShowPlanV1040}=require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const {HOLOGRAM_STYLES_V1118,normalizeHologramOptionsV1118,directHolographicShowV1118,
  hologramLivePresetV1118,sampleHologramCueV1118}=require(path.join(folder,'lib/aiHolographicStageDirectorV1118.js'));
 const make=(genre='rap',cap=70,style='spectral',strength=50)=>{
  const base=generateArenaShowPlanV1040({genre,durationMs:216000,title:'V1118 safe concert'});
  const remix=localAiShowRemixV1106('Immersive Show',genre,cap);
  const options={style,strength,intensityCap:cap};
  return {base,remix,options,show:directHolographicShowV1118(base,remix,options)};
 };
 check('256 combinations preserve timing, cast/camera/dance/stage and hard intensity caps',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of HOLOGRAM_STYLES_V1118)for(const strength of [20,40,60,80]){
    const {base,remix,show}=make(genre,cap,style,strength);
    assert(show,JSON.stringify({genre,cap,style,strength}));
    assert.equal(show.cues.length,7);assert.equal(show.quality.scenes,7);
    assert(show.quality.preservedTimeline&&show.quality.quietBreak&&show.quality.opticalOnly);
    assert.equal(show.quality.hardwareCommands,0);
    assert(show.quality.noGeneratedAvatars);
    const saved=applyAiShowRemixV1106(base,show.remix,cap);
    assert(saved);assert.equal(saved.title,base.title);assert.equal(saved.durationMs,base.durationMs);
    assert.deepEqual(saved.segments.map(s=>[s.id,s.start,s.end]),base.segments.map(s=>[s.id,s.start,s.end]));
    for(let i=0;i<7;i++){
     const a=show.remix.acts[i],old=remix.acts[i],cue=show.cues[i];
     assert.equal(a.camera,old.camera);assert.equal(a.dance,old.dance);assert.equal(a.deck,old.deck);
     assert.equal(a.floating,old.floating);assert.equal(a.intensity,old.intensity);
     assert(a.intensity<=cap);assert.equal(cue.intensity,a.intensity);
     assert.equal(cue.start,base.segments[i].start);assert.equal(cue.end,base.segments[i].end);
     assert.equal(cue.source,'authored-timeline');assert.equal(cue.visualOnly,true);
     assert.equal(cue.virtualPerformerClones,false);
     if(strength<50)assert.equal(a.lasers,old.lasers);
    }
    count++;
   }
  assert.equal(count,256);
 });
 check('four distinct supported projection styles and restrained interlude',()=>{
  assert.equal(HOLOGRAM_STYLES_V1118.length,4);
  const projection=HOLOGRAM_STYLES_V1118.map(style=>make('rap',70,style,80).show.quality.projectedPattern);
  assert.deepEqual(new Set(projection),new Set(['aurora','lattice','ripple','orbit']));
  for(const style of HOLOGRAM_STYLES_V1118){
   const c=make('rap',70,style,80).show.cues;
   assert.equal(c[4].look,'breath');assert.equal(c[4].opticalDancers,'breath');
   assert.equal(c[3].look,'duet');assert.equal(c[6].look,'finale');
   assert(new Set(c.map(x=>x.look)).size>=5);
  }
 });
 check('user-edited seven-scene boundaries remain unchanged, source data immutable',()=>{
  const {base,remix,options}=make();
  const ends=[.07,.26,.41,.61,.73,.89,1];
  const revised={...base,segments:base.segments.map((s,i)=>({...s,start:i?ends[i-1]:0,end:ends[i]}))};
  const baseBefore=JSON.stringify(revised),remixBefore=JSON.stringify(remix);
  const result=directHolographicShowV1118(revised,remix,options);assert(result);
  assert.deepEqual(result.cues.map(c=>[c.start,c.end]),revised.segments.map(s=>[s.start,s.end]));
  const saved=applyAiShowRemixV1106(revised,result.remix,70);assert(saved);
  assert.deepEqual(saved.segments.map(s=>[s.start,s.end]),revised.segments.map(s=>[s.start,s.end]));
  assert.equal(JSON.stringify(revised),baseBefore);assert.equal(JSON.stringify(remix),remixBefore);
 });
 check('reject invalid options, damaged plans, invalid acts, and exceeding the cap',()=>{
  const {base,remix,options}=make();
  for(const bad of [null,undefined,{},[],{style:'real-clone',strength:50,intensityCap:70},
   {style:'duet',strength:0,intensityCap:70},{style:'duet',strength:55,intensityCap:70},
   {style:'duet',strength:90,intensityCap:70},{style:'duet',strength:'40',intensityCap:70},
   {style:'duet',strength:40,intensityCap:110},{style:'duet',strength:40,intensityCap:NaN}]){
   assert.equal(normalizeHologramOptionsV1118(bad),null);
   assert.equal(directHolographicShowV1118(base,remix,bad),null);
   assert.equal(hologramLivePresetV1118(bad),null);
  }
  assert.equal(directHolographicShowV1118(null,remix,options),null);
  assert.equal(directHolographicShowV1118(base,null,options),null);
  assert.equal(directHolographicShowV1118(base,{...remix,acts:remix.acts.slice(1)},options),null);
  assert.equal(directHolographicShowV1118(base,{...remix,acts:remix.acts.map((a,i)=>i===1?{...a,intensity:80}:a)},options),null);
 });
 check('live preset only enables existing virtual assets and is bounded to selected cap',()=>{
  const preset=hologramLivePresetV1118({style:'cosmic',strength:80,intensityCap:45});
  assert(preset);
  assert.deepEqual(Object.keys(preset).sort(),[
   'arenaHologramsEnabledV1039','arenaHologramStrengthV1039',
   'arenaHolographicConcertEnabledV1068','arenaHolographicConcertStrengthV1068',
   'arenaHolographicDancersEnabledV1081','arenaHolographicDancersStrengthV1081',
   'arenaProjectionEnabledV1085','arenaProjectionStrengthV1085','arenaProjectionModeV1085'].sort());
  assert.equal(preset.arenaProjectionModeV1085,'orbit');
  assert(Object.values(preset).every(v=>v===true||v===45||v==='orbit'));
  assert(!Object.keys(preset).some(k=>/govee|pyro|strobe|spotify|hardware|microphone|remote/i.test(k)));
 });
 check('current scene sampler rejects unknown time, handles exactly 100%',()=>{
  const show=make().show;
  for(const invalid of [NaN,Infinity,-.1,1.1,undefined,'0.5'])assert.equal(sampleHologramCueV1118(show,invalid),null);
  assert.equal(sampleHologramCueV1118(null,.5),null);
  assert.equal(sampleHologramCueV1118(show,0).index,0);
  assert.equal(sampleHologramCueV1118(show,1).index,6);
  for(const c of show.cues)assert.equal(sampleHologramCueV1118(show,(c.start+c.end)/2).index,c.index);
 });
 check('UI maintains opt-in, conflict-safe undo, preview and explicit safeguards',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const needle of ['V1118 AI Holographic Stage Director','V1118 Hologramm-Show jetzt proben',
   'V1118 Holographic Stage Partitur','V1118 sieben holografische Szenen',
   'V1118 vorhandene virtuelle Hologramm-Show aktivieren','hologramLivePresetV1118',
   'holoUndo.current','holoEnabled||masterEnabled?directHolographicShowV1118',
   'holo?.remix??stage?.remix??finalRemix','arenaHologramPatternV1039',
   'arenaProjectionModeV1085','preferences.reducedMotion','arenaConcertDirectorEnabledV1048',
   'Hologramm-Einstellungen wurden inzwischen manuell geändert'])assert(ui.includes(needle),needle);
  const code=fs.readFileSync(path.join(root,'lib/aiHolographicStageDirectorV1118.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|new WebGL/i.test(code));
 });
}finally{fs.rmSync(folder,{recursive:true,force:true});}
