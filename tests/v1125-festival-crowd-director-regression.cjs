#!/usr/bin/env node
'use strict';
/** V1125 · Real deterministic spatial show cues and live renderer wiring checks. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1125-'));
function check(name,fn){fn();console.log('PASS V1125 '+name)}
try{
 let compiler;try{compiler=require.resolve('typescript/bin/tsc')}catch{
  compiler='/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc';}
 assert(fs.existsSync(compiler),'TypeScript unavailable: run npm ci');
 fs.mkdirSync(path.join(tmp,'types'),{recursive:true});
 const run=spawnSync(process.execPath,[compiler,'--typeRoots',path.join(tmp,'types'),'-p',
  path.join(root,'tests/tsconfig.v1125-core.json'),'--noEmit','false',
  '--module','commonjs','--moduleResolution','node','--outDir',tmp],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(run.status,0,run.stdout+'\n'+run.stderr+'\n'+(run.error?.message||''));
 const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=require(path.join(tmp,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(tmp,'lib/arena360AiShowRemixV1106.js'));
 const {directAudienceEnergySyncV1124}=require(path.join(tmp,'lib/aiAudienceEnergySyncV1124.js'));
 const {FESTIVAL_CROWD_STYLES_V1125,normalizeFestivalCrowdOptionsV1125,
  directFestivalCrowdV1125,sampleFestivalCrowdV1125,festivalCrowdLivePresetV1125,
  planFestivalCrowdLiveV1125,sampleFestivalCrowdSectorV1125}=require(path.join(tmp,'lib/aiFestivalCrowdDirectorV1125.js'));
 const make=(genre='hard',cap=70,style='ripple',strength=50,linked=false)=>{
  const base=generateArenaShowPlanV1040({genre,title:'V1125 festival',durationMs:200000});
  const remix=localAiShowRemixV1106('Acht Sektoren und Künstlerwechsel',genre,cap);
  const audience=linked?directAudienceEnergySyncV1124(base,remix,{style:'wave',strength:50,intensityCap:cap}):null;
  return {base,remix,audience,show:directFestivalCrowdV1125(base,remix,{style,strength,intensityCap:cap},audience)};
 };
 check('256 combinations: 7 scenes x 8 bounded sectors, no timing changes',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,70,85])
  for(const style of FESTIVAL_CROWD_STYLES_V1125)for(const strength of [20,40,60,80]){
   const {base,remix,show}=make(genre,cap,style,strength);
   assert(show,JSON.stringify({genre,cap,style,strength}));
   assert.equal(show.quality.scenes,7);assert.equal(show.quality.sectors,8);
   assert.equal(show.quality.performers,3);assert.equal(show.quality.existingInstances,true);
   assert.deepEqual(show.scenes.map(s=>[s.start,s.end]),base.segments.map(s=>[s.start,s.end]));
   assert.deepEqual(applyAiShowRemixV1106(base,show.remix,cap).segments.map(s=>[s.start,s.end]),
    base.segments.map(s=>[s.start,s.end]));
   assert.equal(JSON.stringify(show.remix),JSON.stringify(remix));
   for(const s of show.scenes){assert.equal(s.sectors.length,8);
    assert(s.sectors.every(v=>Number.isInteger(v)&&v>=0&&v<=Math.min(65,cap)));}
   assert(Math.max(...show.scenes[4].sectors)<=Math.max(...show.scenes[3].sectors)*.5);
   count++;
  }
  assert.equal(count,256);
 });
 check('four sector styles produce four distinct spatial patterns',()=>{
  const layouts=FESTIVAL_CROWD_STYLES_V1125.map(style=>make('hard',85,style,80).show.scenes[3].sectors.join(','));
  assert.equal(new Set(layouts).size,4,layouts.join('\n'));
 });
 check('three fixed role focuses, alternating duet and ensemble; no singer detection',()=>{
  const show=make().show;
  assert.deepEqual(show.scenes.map(s=>s.focusLabel),[
   'Neon Pulse','Neon Pulse','Festival Nova','Gesamtes Ensemble','Gesamtes Ensemble','Chrome Beat','Gesamtes Ensemble']);
  assert(show.scenes.every(s=>s.noDetectedSinger===true));
 });
 check('optional V1124 link accepts only current scene timing and intensities',()=>{
  const {base,remix,audience,show}=make('rap',70,'spotlight',60,true);assert(show.linkedAudience);
  const malformed={...audience,scenes:audience.scenes.map((s,i)=>i===2?{...s,end:s.end+.02}:s)};
  assert.equal(directFestivalCrowdV1125(base,remix,{style:'spotlight',strength:60,intensityCap:70},malformed),null);
  const other={...remix,acts:remix.acts.map((a,i)=>i===2?{...a,intensity:a.intensity-1}:a)};
  assert.equal(directFestivalCrowdV1125(base,other,{style:'spotlight',strength:60,intensityCap:70},audience),null);
 });
 check('manual authored timing and source immutable',()=>{
  const {base,remix}=make('pop',85);const breaks=[.06,.18,.34,.47,.65,.83,1];
  const authored={...base,segments:base.segments.map((s,i)=>({...s,start:i?breaks[i-1]:0,end:breaks[i]}))};
  const before=JSON.stringify(authored),bremix=JSON.stringify(remix);
  const show=directFestivalCrowdV1125(authored,remix,{style:'duet',strength:80,intensityCap:85});assert(show);
  assert.deepEqual(show.scenes.map(s=>[s.start,s.end]),authored.segments.map(s=>[s.start,s.end]));
  assert.equal(JSON.stringify(authored),before);assert.equal(JSON.stringify(remix),bremix);
 });
 check('boundary preview cross-fades consistently, invalid positions rejected',()=>{
  const show=make().show;
  for(let i=1;i<7;i++){
   const edge=show.scenes[i].start;
   const prev=sampleFestivalCrowdV1125(show,edge-1e-7),now=sampleFestivalCrowdV1125(show,edge);
   assert.equal(now.scene.index,i);assert.equal(now.blend,0);assert.deepEqual(prev.sectors,now.sectors);
   assert(sampleFestivalCrowdV1125(show,edge+.005).blend>0);
  }
  assert.equal(sampleFestivalCrowdV1125(show,1).scene.index,6);
  for(const invalid of [-1,1.01,NaN,Infinity,null,undefined,'0.5'])assert.equal(sampleFestivalCrowdV1125(show,invalid),null);
 });
 check('fail-closed invalid styles, intensities and missing originals',()=>{
  const {base,remix}=make();const valid={style:'ripple',strength:50,intensityCap:70};
  for(const options of [null,[],{}, {...valid,style:'strobe'},{...valid,strength:25},
   {...valid,strength:Infinity},{...valid,intensityCap:90},{...valid,intensityCap:'70'}]){
   assert.equal(normalizeFestivalCrowdOptionsV1125(options),null);
   assert.equal(directFestivalCrowdV1125(base,remix,options),null);
   assert.equal(festivalCrowdLivePresetV1125(options),null);
  }
  assert.equal(directFestivalCrowdV1125(null,remix,valid),null);
  assert.equal(directFestivalCrowdV1125(base,null,valid),null);
  assert.equal(directFestivalCrowdV1125(base,{...remix,acts:remix.acts.slice(1)},valid),null);
 });
 check('live cue only with valid show, playback, safe modes and capable GPU',()=>{
  const {base}=make();const show=sampleArenaShowPlanV1040(base,{enabled:true,playing:true,
   reducedMotion:false,progressMs:140000,durationMs:200000});assert(show.active);
  const input={enabled:true,playing:true,reducedMotion:false,reactive:true,audienceEnabled:true,
   phoneSyncEnabled:true,phoneMode:'wave',performanceTier:'balanced',show,style:'stadium',strength:45};
  const cue=planFestivalCrowdLiveV1125(input);assert(cue,JSON.stringify(show));
  assert.equal(cue.sectors.length,8);
  const sample=sampleFestivalCrowdSectorV1125(cue,.7,2.2);
  assert(sample.light>=.7&&sample.light<=1&&sample.arms>=0&&sample.arms<=.11&&sample.rise<=.045);
  assert.deepEqual(sampleFestivalCrowdSectorV1125(null,.7,2.2),{light:1,rise:0,arms:0,head:0});
  for(const flags of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
   {audienceEnabled:false},{phoneSyncEnabled:false},{phoneMode:'manual'},
   {performanceTier:'low'},{show:null},{strength:99}])
   assert.equal(planFestivalCrowdLiveV1125({...input,...flags}),null,JSON.stringify(flags));
  assert.equal(sampleFestivalCrowdSectorV1125(cue,NaN,1).light,1);
 });
 check('live preferences only existing virtual effects and new 3D overlay, capped and reversible',()=>{
  const preset=festivalCrowdLivePresetV1125({style:'duet',strength:80,intensityCap:40});
  assert(preset);assert.equal(preset.arenaFestivalCrowdStrengthV1125,40);
  assert.equal(preset.arenaFestivalCrowdStyleV1125,'duet');
  assert.equal(preset.arenaAvatarAudienceEnabledV1074,true);
  assert(Object.keys(preset).every(k=>!/(govee|dmx|device|network|microphone|strobe|sound)/i.test(k)));
 });
 check('actual fixed-instance renderer applies spatial sample to phones, bands, arms and body',()=>{
  const filename='components/visualizer/stages/ArenaAudienceV1032.tsx';
  const ui=fs.readFileSync(path.join(root,filename),'utf8');
  for(const fragment of ['planFestivalCrowdLiveV1125({','compileFestivalCrowdFrameV1127(festivalCrowdCueV1127',
   '*spatialV1125.light','spatialV1125.arms+reaction.arms','const rise=spatialV1125.rise+',
   'readFestivalCrowdSectorV1127(spatialFrameV1127,phoneSectorsV1127[i]).light'])assert(ui.includes(fragment),fragment);
  assert(!ui.includes('new InstancedMesh')); // existing useMemo fixed count only
  for(const stage of ['components/visualizer/VisualizerStage.tsx','components/visualizer/ThreeAvatar.tsx',
   'components/visualizer/stages/index.tsx','components/visualizer/stages/Arena360StageV1031.tsx'])
   assert(/festivalCrowdEnabledV1125|FestivalCrowdEnabledV1125/.test(fs.readFileSync(path.join(root,stage),'utf8')),stage);
 });
 check('UI opt-in, safe undo, actual 3D target and no new fetch/audio interval',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const fragment of ['V1125 AI Festival Crowd Director 2.0','V1125 Acht-Sektoren-Festival jetzt proben',
   'V1125 Festival Crowd Director Partitur','V1125 sieben Festival-Szenen',
   'V1125 virtuelle Acht-Sektoren-Regie aktivieren','festivalUndo.current','festivalCrowdLivePresetV1125',
   'setFestivalPreview(festival)','festivalEnabled||masterEnabled?directFestivalCrowdV1125',
   'V1125 Publikumseinstellungen wurden manuell verändert'])assert(ui.includes(fragment),fragment);
  const lib=fs.readFileSync(path.join(root,'lib/aiFestivalCrowdDirectorV1125.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|api\/govee|new\s+WebGLRenderer/i.test(lib));
 });
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log('PASS V1125 festival crowd director 2.0');
