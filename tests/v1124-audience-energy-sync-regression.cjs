#!/usr/bin/env node
'use strict';
/** Executable V1124 regression: planned crowd score, real V1044/V1073 adapters, safe UI. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1124-'));
const check=(label,fn)=>{fn();console.log('PASS V1124 '+label)};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc')}catch{
  compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);
 }
 if(!compiler)compiler=(process.env.NODE_PATH||'').split(path.delimiter).map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);
 if(!compiler)compiler='/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc';
 assert(fs.existsSync(compiler),'TypeScript compiler not available (npm ci required)');
 fs.mkdirSync(path.join(tmp,'types'),{recursive:true});
 const compiled=spawnSync(process.execPath,[compiler,'--typeRoots',path.join(tmp,'types'),'-p',
  path.join(root,'tests/tsconfig.v1124-core.json'),'--noEmit','false',
  '--module','commonjs','--moduleResolution','node','--outDir',tmp],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(compiled.status,0,compiled.stdout+'\n'+compiled.stderr+'\n'+(compiled.error?.message||''));
 const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=require(path.join(tmp,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(tmp,'lib/arena360AiShowRemixV1106.js'));
 const {directConcertEnergyV1123}=require(path.join(tmp,'lib/aiConcertEnergyDirectorV1123.js'));
 const {AUDIENCE_STYLES_V1124,normalizeAudienceOptionsV1124,directAudienceEnergySyncV1124,
  sampleAudienceEnergySyncV1124,audienceLivePresetV1124}=require(path.join(tmp,'lib/aiAudienceEnergySyncV1124.js'));
 const {planAudienceExperienceV1073,sampleAudienceExperienceV1073}=require(path.join(tmp,'lib/arena360AudienceExperienceV1073.js'));
 const {planArenaAudienceV1044,sampleArenaAudienceV1044}=require(path.join(tmp,'lib/arena360AudienceDirectorV1044.js'));
 const make=(genre='hard',cap=70,style='wave',strength=50,useEnergy=false)=>{
  const base=generateArenaShowPlanV1040({genre,title:'V1124 audience test',durationMs:200000});
  const remix=localAiShowRemixV1106('Festival audience waves',genre,cap);
  const energy=useEnergy?directConcertEnergyV1123(base,remix,{style:'festival',strength:60,intensityCap:cap}):null;
  const candidate=energy?.remix??remix;
  return {base,candidate,energy,show:directAudienceEnergySyncV1124(base,candidate,
   {style,strength,intensityCap:cap},energy)};
 };
 check('256 genre x cap x style x strength combinations preserve scenes and bounded audience cues',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,70,85])
  for(const style of AUDIENCE_STYLES_V1124)for(const strength of [20,40,60,80]){
   const {base,candidate,show}=make(genre,cap,style,strength);
   assert(show,JSON.stringify({genre,cap,style,strength}));
   assert.equal(show.scenes.length,7);assert.equal(show.quality.noHardware,true);
   assert.equal(show.quality.noAudioGeneration,true);assert.equal(show.quality.noAddedCrowdInstances,true);
   assert.equal(show.quality.quietBreak,true);assert.equal(show.energyLinked,false);
   assert.deepEqual(applyAiShowRemixV1106(base,show.remix,cap).segments.map(c=>[c.id,c.start,c.end]),
    base.segments.map(c=>[c.id,c.start,c.end]));
   assert.equal(JSON.stringify(show.remix),JSON.stringify(candidate));
   assert(show.scenes[4].channels.phones<=show.scenes[3].channels.phones*.5);
   assert(show.scenes[4].channels.arms<=show.scenes[3].channels.arms*.5);
   for(let i=0;i<7;i++){
    const scene=show.scenes[i];const baseScene=base.segments[i];
    assert.equal(scene.scene,baseScene.scene);
    assert.equal(scene.start,baseScene.start);assert.equal(scene.end,baseScene.end);
    assert.equal(scene.authoredTiming,true);assert.equal(scene.verifiedBeat,false);
    assert.deepEqual(Object.keys(scene.channels).sort(),['arms','attention','cheer','phones','wristbands']);
    assert(Object.values(scene.channels).every(v=>Number.isInteger(v)&&v>=0&&v<=cap&&v<=65));
   }
   count++;
  }
  assert.equal(count,256);
 });
 check('four genuinely different audience styles and a quiet mid-song break',()=>{
  const curves=AUDIENCE_STYLES_V1124.map(style=>JSON.stringify(make('hard',85,style,80).show.scenes.map(s=>s.channels)));
  assert.equal(new Set(curves).size,4);
  for(const style of AUDIENCE_STYLES_V1124){
   const cues=make('hard',85,style,80).show.scenes;
   assert(cues[4].channels.cheer<cues[3].channels.cheer);
   assert(cues[6].channels.phones>cues[4].channels.phones);
  }
 });
 check('V1123 energy can be linked only to a matching timeline and existing remix',()=>{
  const {base,candidate,energy}=make('hard',70,'wave',60,true);
  const linked=directAudienceEnergySyncV1124(base,candidate,{style:'festival',strength:60,intensityCap:70},energy);
  assert(linked);assert.equal(linked.energyLinked,true);
  assert.deepEqual(linked.scenes.map(s=>s.energy),energy.cues.map(s=>s.energy));
  const invalid={...energy,cues:energy.cues.map((cue,i)=>i===1?{...cue,end:cue.end+.01}:cue)};
  assert.equal(directAudienceEnergySyncV1124(base,candidate,{style:'wave',strength:60,intensityCap:70},invalid),null);
  assert.equal(directAudienceEnergySyncV1124(base,localAiShowRemixV1106('different','hard',70),
   {style:'wave',strength:60,intensityCap:70},energy),null);
 });
 check('manual scene boundaries and originals remain unchanged',()=>{
  const {base,candidate}=make('rap',85);
  const boundaries=[.05,.23,.31,.56,.61,.86,1];
  const modified={...base,segments:base.segments.map((s,i)=>({...s,start:i?boundaries[i-1]:0,end:boundaries[i]}))};
  const initial=JSON.stringify(modified),proposal=JSON.stringify(candidate);
  const show=directAudienceEnergySyncV1124(modified,candidate,{style:'rap',strength:80,intensityCap:85});
  assert(show);
  assert.deepEqual(show.scenes.map(s=>[s.start,s.end]),modified.segments.map(s=>[s.start,s.end]));
  assert.equal(JSON.stringify(modified),initial);assert.equal(JSON.stringify(candidate),proposal);
 });
 check('smooth preview at each scene boundary; invalid positions are refused',()=>{
  const show=make().show;
  for(let i=1;i<7;i++){
   const edge=show.scenes[i].start;
   const prev=sampleAudienceEnergySyncV1124(show,edge-1e-7),at=sampleAudienceEnergySyncV1124(show,edge);
   assert.equal(at.scene.index,i);assert.equal(at.blend,0);
   assert.deepEqual(at.channels,prev.channels);
   const after=sampleAudienceEnergySyncV1124(show,edge+.004);assert(after.blend>0&&after.blend<=1);
  }
  assert.equal(sampleAudienceEnergySyncV1124(show,1).scene.index,6);
  for(const invalid of [-1,1.001,NaN,Infinity,undefined,'0.5',null])assert.equal(sampleAudienceEnergySyncV1124(show,invalid),null);
  assert.equal(sampleAudienceEnergySyncV1124(null,.5),null);
 });
 check('malformed options, invalid proposals and unknown modes fail closed',()=>{
  const {base,candidate}=make();const valid={style:'wave',strength:50,intensityCap:70};
  for(const invalid of [null,[],{}, {...valid,style:'strobe'}, {...valid,strength:5},
   {...valid,strength:55},{...valid,strength:Infinity},{...valid,intensityCap:95},{...valid,intensityCap:10},
   {...valid,intensityCap:'70'}]){
   assert.equal(normalizeAudienceOptionsV1124(invalid),null);
   assert.equal(directAudienceEnergySyncV1124(base,candidate,invalid),null);
   assert.equal(audienceLivePresetV1124(invalid),null);
  }
  assert.equal(directAudienceEnergySyncV1124(null,candidate,valid),null);
  assert.equal(directAudienceEnergySyncV1124(base,null,valid),null);
  assert.equal(directAudienceEnergySyncV1124(base,{...candidate,acts:candidate.acts.slice(1)},valid),null);
 });
 check('real V1044 and V1073 crowd engines respect pause, manual light modes, reduced motion and low GPU',()=>{
  const {base}=make('rap');const show=sampleArenaShowPlanV1040(base,{enabled:true,playing:true,
   reducedMotion:false,progressMs:89000,durationMs:200000});
  assert.equal(show.active,true);
  const opts={enabled:true,stageIsArena:true,audienceEnabled:true,phoneEnabled:true,
   showDesignerEnabled:true,showDirectorEnabled:true,playing:true,reducedMotion:false,
   phoneMode:'wave',performanceTier:'balanced',show,trackId:'test-track',progressMs:89000,
   durationMs:200000,strength:50,genre:'rap'};
  const live=planAudienceExperienceV1073(opts);
  assert(live.active,JSON.stringify(live));
  assert(sampleAudienceExperienceV1073(live,0,3,.6).light<=.72);
  for(const flags of [{playing:false},{reducedMotion:true},{phoneMode:'manual'},{performanceTier:'low'}])
   assert.equal(planAudienceExperienceV1073({...opts,...flags}).active,false);
  const v1044=planArenaAudienceV1044({enabled:true,stageIsArena:true,phoneEnabled:true,
   show,playing:true,reducedMotion:false,phoneMode:'wave',performanceTier:'balanced',
   trackId:'test-track',progressMs:89000,strength:50,genre:'rap'});
  assert(v1044.active);assert(sampleArenaAudienceV1044(v1044,0,3,.25)<=1);
  assert.equal(planArenaAudienceV1044({enabled:true,stageIsArena:true,phoneEnabled:true,
   show,playing:true,reducedMotion:true,phoneMode:'wave',trackId:'test-track',progressMs:89000}).active,false);
 });
 check('live preset uses only bounded EXISTING visual crowd modules, no hardware or microphone',()=>{
  const keys=['arenaAudienceDirectorEnabledV1044','arenaAudienceDirectorStrengthV1044',
   'arenaAudienceExperienceEnabledV1073','arenaAudienceExperienceStrengthV1073',
   'arenaCrowdEnergyEnabledV1075','arenaCrowdEnergyStrengthV1075',
   'arenaCrowdHarmonyEnabledV1092','arenaCrowdHarmonyStrengthV1092'].sort();
  const preset=audienceLivePresetV1124({style:'rap',strength:80,intensityCap:45});
  assert.deepEqual(Object.keys(preset).sort(),keys);
  assert(Object.values(preset).every(v=>v===true||v===45));
  assert(!Object.keys(preset).some(key=>/govee|dmx|strobe|pyro|device|microphone|network|audio/i.test(key)));
 });
 check('UI has opt-in, preview, secure undo, no extra audio/network/storage or direct Govee',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const fragment of ['V1124 AI Audience Energy Sync','V1124 Publikumswellen jetzt proben',
   'V1124 Audience Energy Sync Partitur','V1124 sieben Publikumswellen',
   'V1124 vorhandene virtuelle Publikumsregie aktivieren','setAudiencePreview(audience)',
   'audienceEnabled?directAudienceEnergySyncV1124','audienceLivePresetV1124',
   'setAudiencePreview(null)','audienceUndo.current','arenaPhoneModeV1033',
   'preferences.reducedMotion','V1124 Publikumseinstellungen wurden inzwischen manuell verändert'])
   assert(ui.includes(fragment),fragment);
  const source=fs.readFileSync(path.join(root,'lib/aiAudienceEnergySyncV1124.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|api\/govee|new\s+WebGLRenderer/i.test(source));
 });
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log('PASS V1124 all audience sync regression groups');
