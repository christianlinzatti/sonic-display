#!/usr/bin/env node
'use strict';
/** Compile and exercise actual V1120 source, including safety boundaries. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1120-'));
function check(name,fn){fn();console.log('PASS V1120 '+name)}
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc');}catch{
  compiler=require('node:module').globalPaths.map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 }
 if(!compiler)compiler=(process.env.NODE_PATH||'').split(path.delimiter).map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 assert(compiler,'TypeScript compiler missing: run npm ci first');
 const out=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1120-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',dir],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(out.status,0,out.stdout+'\n'+out.stderr+'\n'+(out.error?.message||''));
 const {generateArenaShowPlanV1040}=require(path.join(dir,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(dir,'lib/arena360AiShowRemixV1106.js'));
 const {LIGHTING_STYLES_V1120,normalizeLightingOptionsV1120,directDynamicLightingV1120,
  lightingLivePresetV1120,sampleLightingCueV1120}=require(path.join(dir,'lib/aiDynamicLightingConductorV1120.js'));
 const make=(genre='rap',cap=70,style='cinematic',strength=50)=>{
  const base=generateArenaShowPlanV1040({genre,durationMs:230000,title:'Bounded stage lighting'});
  const remix=localAiShowRemixV1106('Filmisch ruhiges Licht, starkes Finale',genre,cap);
  const options={style,strength,intensityCap:cap};
  return {base,remix,options,show:directDynamicLightingV1120(base,remix,options)};
 };
 check('256 genre × cap × lighting style × strength cases, safety and original timeline',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of LIGHTING_STYLES_V1120)for(const strength of [20,40,60,80]){
    const {base,remix,show}=make(genre,cap,style,strength);
    assert(show,JSON.stringify({genre,cap,style,strength}));
    assert.equal(show.cues.length,7);assert.equal(show.quality.scenes,7);
    assert(show.quality.quietBreak&&show.quality.fadeSafe&&show.quality.preservedTimeline);
    assert.equal(show.quality.hardwareCommands,0);assert.equal(show.quality.detectedDrops,0);
    const saved=applyAiShowRemixV1106(base,show.remix,cap);assert(saved);
    assert.deepEqual(saved.segments.map(s=>[s.id,s.start,s.end]),base.segments.map(s=>[s.id,s.start,s.end]));
    for(let i=0;i<7;i++){
     const previous=remix.acts[i],next=show.remix.acts[i],cue=show.cues[i];
     assert(cue.virtualBrightness>=0&&cue.virtualBrightness<=cap);
     assert.equal(cue.actualSongSectionDetected,false);
     for(const key of ['deck','floating','camera','dance','intensity','scene'])assert.equal(next[key],previous[key]);
     if(strength<40)assert.equal(next.lasers,previous.lasers);
     assert.equal(cue.lasers,next.lasers);
     assert.equal(cue.camera,next.camera);
     if(i>0)assert(Math.abs(cue.virtualBrightness-show.cues[i-1].virtualBrightness)<=45);
    }
    count++;
   }
  assert.equal(count,256);
 });
 check('authored scene boundaries and source objects preserved exactly',()=>{
  const {base,remix,options}=make();const ends=[.05,.26,.4,.58,.71,.91,1];
  const modified={...base,segments:base.segments.map((s,i)=>({...s,start:i?ends[i-1]:0,end:ends[i]}))};
  const oldBase=JSON.stringify(modified),oldRemix=JSON.stringify(remix);
  const planned=directDynamicLightingV1120(modified,remix,options);assert(planned);
  assert.deepEqual(planned.cues.map(c=>[c.start,c.end]),modified.segments.map(s=>[s.start,s.end]));
  assert.equal(JSON.stringify(modified),oldBase);assert.equal(JSON.stringify(remix),oldRemix);
 });
 check('different light vocabularies, quiet interlude and no real color claim',()=>{
  assert.equal(LIGHTING_STYLES_V1120.length,4);
  const words=LIGHTING_STYLES_V1120.map(style=>make('rap',70,style,80).show.cues[1].chapter);
  assert.equal(new Set(words).size,4);
  for(const style of LIGHTING_STYLES_V1120){
   const cues=make('rap',85,style,80).show.cues;
   assert.equal(cues[4].look,'rest');assert(cues[4].virtualBrightness<=cues[3].virtualBrightness/2);
   assert.equal(cues[6].look,'ensemble');
   assert(new Set(cues.map(c=>c.look)).size>=3);
  }
 });
 check('invalid inputs and malformed scene remixes fail closed',()=>{
  const {base,remix,options}=make();
  for(const raw of [null,undefined,{},[],{style:'dmx',strength:50,intensityCap:70},
   {style:'festival',strength:0,intensityCap:70},{style:'festival',strength:55,intensityCap:70},
   {style:'festival',strength:90,intensityCap:70},{style:'festival',strength:'40',intensityCap:70},
   {style:'festival',strength:40,intensityCap:110},{style:'festival',strength:40,intensityCap:NaN}]){
   assert.equal(normalizeLightingOptionsV1120(raw),null);
   assert.equal(directDynamicLightingV1120(base,remix,raw),null);
   assert.equal(lightingLivePresetV1120(raw),null);
  }
  assert.equal(directDynamicLightingV1120(null,remix,options),null);
  assert.equal(directDynamicLightingV1120(base,null,options),null);
  assert.equal(directDynamicLightingV1120(base,{...remix,acts:remix.acts.slice(1)},options),null);
  assert.equal(directDynamicLightingV1120(base,{...remix,acts:remix.acts.map((a,i)=>i===1?{...a,intensity:80}:a)},options),null);
 });
 check('live opt-in only enables established virtual light renderers',()=>{
  const preset=lightingLivePresetV1120({style:'festival',strength:80,intensityCap:45});assert(preset);
  assert.deepEqual(Object.keys(preset).sort(),[
   'arenaCinematicLightingEnabledV1056','arenaCinematicLightingStrengthV1056',
   'arenaVolumetricLightingEnabledV1058','arenaVolumetricLightingStrengthV1058',
   'arenaLedWallEnabledV1059','arenaLedWallStrengthV1059',
   'arenaLightingChoreographerEnabledV1060','arenaLightingChoreographerStrengthV1060'].sort());
  assert(Object.values(preset).every(v=>v===true||v===45));
  assert(!Object.keys(preset).some(k=>/govee|pyro|strobe|spotify|dmx|hardware|microphone|physical/i.test(k)));
 });
 check('current rehearsal position is sampled from authored boundaries',()=>{
  const show=make().show;assert(show);
  for(const invalid of [-.01,1.01,NaN,Infinity,'0.5',undefined])assert.equal(sampleLightingCueV1120(show,invalid),null);
  assert.equal(sampleLightingCueV1120(null,.5),null);
  assert.equal(sampleLightingCueV1120(show,0).index,0);
  assert.equal(sampleLightingCueV1120(show,1).index,6);
  for(const cue of show.cues)assert.equal(sampleLightingCueV1120(show,(cue.start+cue.end)/2).index,cue.index);
 });
 check('UI has opt-in preview, explicit separate live consent, rollback and privacy',()=>{
  const src=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const needle of ['V1120 AI Dynamic Lighting Conductor','V1120 Lichtshow jetzt proben',
   'V1120 Dynamic Lighting Partitur','V1120 sieben Lichtszenen',
   'V1120 vorhandene virtuelle Lichtregie aktivieren','lightingLivePresetV1120',
   'lightingUndo.current','lightingEnabled||masterEnabled?directDynamicLightingV1120',
   'lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix',
   'arenaLightsEnabledV1032','preferences.reducedMotion','arenaConcertDirectorEnabledV1048',
   'V1120 Licht-Einstellungen wurden inzwischen manuell geändert'])assert(src.includes(needle),needle);
  const code=fs.readFileSync(path.join(root,'lib/aiDynamicLightingConductorV1120.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|new WebGL/i.test(code));
 });
}finally{fs.rmSync(dir,{recursive:true,force:true});}
