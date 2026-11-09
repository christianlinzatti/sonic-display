#!/usr/bin/env node
'use strict';
/** V1126 – real multi-director score and fail-closed virtual opt-in. */
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1126-'));
const test=(name,fn)=>{fn();console.log('PASS V1126 '+name)};
try{
 const compiler=(()=>{try{return require.resolve('typescript/bin/tsc')}catch{return '/opt/nvm/versions/node/v22.16.0/lib/node_modules/typescript/bin/tsc'}})();
 assert(fs.existsSync(compiler),'TypeScript unavailable – npm ci required');
 fs.mkdirSync(path.join(tmp,'types'));
 const compiled=spawnSync(process.execPath,[compiler,'--typeRoots',path.join(tmp,'types'),'-p',
  path.join(root,'tests/tsconfig.v1126-core.json'),'--noEmit','false','--module','commonjs',
  '--moduleResolution','node','--outDir',tmp],{encoding:'utf8',cwd:root,timeout:90000,windowsHide:true});
 assert.equal(compiled.status,0,compiled.stdout+'\n'+compiled.stderr+'\n'+(compiled.error?.message||''));
 const get=n=>require(path.join(tmp,'lib',n+'.js'));
 const {generateArenaShowPlanV1040}=get('arena360ShowDesignerV1040');
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=get('arena360AiShowRemixV1106');
 const {directStageTransformationV1117}=get('aiStageTransformationV1117');
 const {directHolographicShowV1118}=get('aiHolographicStageDirectorV1118');
 const {directCinematicCameraV1119}=get('aiCinematicCameraDirectorV1119');
 const {directDynamicLightingV1120}=get('aiDynamicLightingConductorV1120');
 const {directImmersiveTransitionsV1121}=get('aiImmersiveSceneTransitionsV1121');
 const {directConcertAtmosphereV1122}=get('aiConcertAtmosphereDirectorV1122');
 const {directConcertEnergyV1123}=get('aiConcertEnergyDirectorV1123');
 const {directAudienceEnergySyncV1124}=get('aiAudienceEnergySyncV1124');
 const {directFestivalCrowdV1125}=get('aiFestivalCrowdDirectorV1125');
 const {MASTER_STYLES_V1126,normalizeMasterOptionsV1126,masterDirectorOptionsV1126,
  directFestivalShowMasterV1126,sampleFestivalShowMasterV1126,
  festivalShowMasterLivePresetV1126}=get('aiFestivalShowMasterV1126');
 const make=(genre='hard',style='festival',strength=50,cap=70,segments=null)=>{
  const original=generateArenaShowPlanV1040({genre,title:'V1126 Festival Show Master',durationMs:240000});
  const base=segments?{...original,segments:original.segments.map((s,i)=>({...s,start:i?segments[i-1]:0,end:segments[i]}))}:original;
  const remix=localAiShowRemixV1106('Immersive Festival Show Master',genre,cap);
  const options={style,strength,intensityCap:cap},o=masterDirectorOptionsV1126(options);
  assert(o);
  const stage=directStageTransformationV1117(base,remix,o.stage);
  const holo=stage&&directHolographicShowV1118(base,stage.remix,o.holo);
  const camera=holo&&directCinematicCameraV1119(base,holo.remix,o.camera);
  const lighting=camera&&directDynamicLightingV1120(base,camera.remix,o.lighting);
  const transition=lighting&&directImmersiveTransitionsV1121(base,lighting.remix,o.transition);
  const atmosphere=transition&&directConcertAtmosphereV1122(base,transition.remix,o.atmosphere);
  const energy=atmosphere&&directConcertEnergyV1123(base,atmosphere.remix,o.energy);
  const audience=energy&&directAudienceEnergySyncV1124(base,energy.remix,o.audience,energy);
  const festival=audience&&directFestivalCrowdV1125(base,audience.remix,o.festival,audience);
  const modules={stage,holo,camera,lighting,transition,atmosphere,energy,audience,festival};
  const show=festival&&directFestivalShowMasterV1126(base,festival.remix,options,modules);
  return {base,remix,options,modules,show};
 };
 test('256 coordinated nine-director concerts preserve authored boundaries',()=>{
  let checked=0;
  for(const genre of ['rap','hard','rock','pop'])for(const style of MASTER_STYLES_V1126)
  for(const strength of [20,40,60,80])for(const cap of [35,55,70,85]){
   const {base,show,modules}=make(genre,style,strength,cap);
   assert(show,JSON.stringify({genre,style,strength,cap}));
   assert.equal(show.quality.directors,9);assert.equal(show.quality.transitions,6);
   assert.equal(show.quality.hardwareCommands,0);assert.equal(show.quality.detectedSingers,0);
   assert.deepEqual(show.scenes.map(s=>[s.start,s.end]),base.segments.map(s=>[s.start,s.end]));
   assert.equal(show.scenes.length,7);
   assert(show.scenes.every((s,i)=>s.index===i&&s.energy<=cap&&s.maxCrowdLight<=65));
   assert(show.scenes[4].energy<=show.scenes[3].energy*.5);
   assert(modules.festival.scenes.every(s=>s.sectors.length===8));
   checked++;
  }
  assert.equal(checked,256);
 });
 test('four styles select distinct synchronized lighting, camera and spatial shows',()=>{
  const results=MASTER_STYLES_V1126.map(style=>{
   const s=make('hard',style,60,85);assert(s.show);
   return JSON.stringify(s.show.scenes.map(x=>[x.camera,x.hologram,x.lighting,x.maxCrowdLight]));
  });
  assert.equal(new Set(results).size,4);
 });
 test('manual custom timing is preserved without mutating any original inputs',()=>{
  const times=[.08,.19,.37,.54,.63,.78,1];const result=make('rap','rap',60,75,times);
  assert(result.show);
  assert.deepEqual(result.show.scenes.map(x=>x.end),times);
  assert.deepEqual(result.modules.energy.cues.map(x=>x.end),times);
  assert.deepEqual(applyAiShowRemixV1106(result.base,result.modules.festival.remix,75).segments.map(x=>x.end),times);
 });
 test('current scene sampling is deterministic, including exact boundaries',()=>{
  const {show}=make();assert(show);
  assert.equal(sampleFestivalShowMasterV1126(show,0).index,0);
  assert.equal(sampleFestivalShowMasterV1126(show,1).index,6);
  for(let i=1;i<7;i++)assert.equal(sampleFestivalShowMasterV1126(show,show.scenes[i].start).index,i);
  for(const invalid of [-1,1.1,NaN,Infinity,undefined,null,'0.5'])
   assert.equal(sampleFestivalShowMasterV1126(show,invalid),null);
 });
 test('independent director, crowd or transition tampering is rejected',()=>{
  const {base,options,modules}=make();const final=modules.festival.remix;
  assert.equal(directFestivalShowMasterV1126(base,final,options,
   {...modules,lighting:{...modules.lighting,cues:modules.lighting.cues.map((x,i)=>i===3?{...x,end:x.end+.001}:x)}}),null);
  assert.equal(directFestivalShowMasterV1126(base,final,options,
   {...modules,transition:{...modules.transition,cues:modules.transition.cues.slice(1)}}),null);
  assert.equal(directFestivalShowMasterV1126(base,final,options,
   {...modules,transition:{...modules.transition,cues:modules.transition.cues.map((x,i)=>i===2?{...x,atMs:x.atMs+400}:x)}}),null);
  assert.equal(directFestivalShowMasterV1126(base,final,options,
   {...modules,festival:{...modules.festival,scenes:modules.festival.scenes.map((x,i)=>i===2?{...x,sectors:[999,...x.sectors.slice(1)]}:x)}}),null);
  assert.equal(directFestivalShowMasterV1126(base,final,options,
   {...modules,energy:{...modules.energy,cues:modules.energy.cues.map((x,i)=>i===4?{...x,energy:99}:x)}}),null);
  assert.equal(directFestivalShowMasterV1126(base,final,options,{...modules,holo:null}),null);
 });
 test('malformed strengths, styles and caps fail closed without a preview or preset',()=>{
  const {base,modules}=make();const remix=modules.festival.remix;
  for(const raw of [null,{},[],{style:'unknown',strength:50,intensityCap:70},
   {style:'rap',strength:55,intensityCap:70},{style:'rap',strength:Infinity,intensityCap:70},
   {style:'rap',strength:50,intensityCap:25},{style:'rap',strength:50,intensityCap:'70'}]){
   assert.equal(normalizeMasterOptionsV1126(raw),null);
   assert.equal(masterDirectorOptionsV1126(raw),null);
   assert.equal(festivalShowMasterLivePresetV1126(raw),null);
   assert.equal(directFestivalShowMasterV1126(base,remix,raw,modules),null);
  }
 });
 test('one virtual-only preset keeps all shared strengths <=55 and excludes hardware',()=>{
  for(const style of MASTER_STYLES_V1126)for(const strength of [20,40,60,80]){
   const preset=festivalShowMasterLivePresetV1126({style,strength,intensityCap:85});
   assert(preset);assert(Object.keys(preset).length>=45);
   assert.equal(preset.arenaFestivalCrowdEnabledV1125,true);
   assert.equal(preset.arenaHolographicConcertEnabledV1068,true);
   assert.equal(preset.arenaSmartConcertFlowEnabledV1071,true);
   assert(Object.entries(preset).filter(([k,v])=>typeof v==='number').every(([k,v])=>v<=55));
   assert(Object.keys(preset).every(k=>!/(govee|strobe|microphone|pyro|physical|speaker|audio)/i.test(k)));
  }
 });
 test('real panel wires explicit probe, confirmation, conflict-safe undo, remote + offline support',()=>{
  const src=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  assert(src.includes('V1126 komplette Festivalshow jetzt proben'));
  assert(src.includes('V1126 vorhandene virtuelle Festivalregie aktivieren'));
  assert(src.includes('V1126 vorherige Show-Einstellungen wiederherstellen'));
  assert(src.includes('masterOnly||masterEnabled'));
  assert(src.includes('const mastered=masterEnabled?directFestivalShowMasterV1126'));
  assert(src.includes('if(projection!==\'auto\'&&projection!==preset.arenaProjectionModeV1085)'));
  assert(src.includes('Object.entries(saved.after).every'));
  const ts=require('typescript');
  const parsed=ts.transpileModule(src,{fileName:'AiShowRemixPanelV1106.tsx',reportDiagnostics:true,
   compilerOptions:{jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}});
  assert.equal(parsed.diagnostics.length,0,parsed.diagnostics.map(d=>ts.flattenDiagnosticMessageText(d.messageText,' ')).join('\n'));
 });
 console.log('V1126 Festival Show Master – all checks passed');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
