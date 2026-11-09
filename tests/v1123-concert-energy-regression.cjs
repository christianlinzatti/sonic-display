#!/usr/bin/env node
'use strict';
/** V1123: actual TypeScript module, current V1040 schema, V1108 observation safety, five channels. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1123-'));
function check(name,fn){fn();console.log('PASS V1123 '+name)}
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc')}catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync)}
 if(!compiler)compiler=(process.env.NODE_PATH||'').split(path.delimiter).map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 assert(compiler,'TypeScript compiler missing: npm ci required');
 const r=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1123-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',tmp],
  {cwd:root,encoding:'utf8',windowsHide:true,timeout:90000});
 assert.equal(r.status,0,r.stdout+'\n'+r.stderr+'\n'+(r.error?.message||''));
 const {generateArenaShowPlanV1040}=require(path.join(tmp,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(tmp,'lib/arena360AiShowRemixV1106.js'));
 const {ENERGY_STYLES_V1123,normalizeEnergyOptionsV1123,directConcertEnergyV1123,
  sampleConcertEnergyV1123,energyLivePresetV1123}=require(path.join(tmp,'lib/aiConcertEnergyDirectorV1123.js'));
 const make=(genre='rap',cap=70,style='balanced',strength=50,reading=null)=>{
  const base=generateArenaShowPlanV1040({genre,title:'V1123 energy regression',durationMs:210000});
  const remix=localAiShowRemixV1106('Five coordinated virtual stage channels',genre,cap);
  const options={style,strength,intensityCap:cap};
  return {base,remix,options,show:directConcertEnergyV1123(base,remix,options,reading)};
 };
 check('256 genre × cap × style × strength combinations keep seven cues, original times, bounded energy and quiet break',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,70,85])
  for(const style of ENERGY_STYLES_V1123)for(const strength of [20,40,60,80]){
   const {base,remix,show}=make(genre,cap,style,strength);
   assert(show,JSON.stringify({genre,cap,style,strength}));
   assert.equal(show.cues.length,7);assert.equal(show.quality.hardwareCommands,0);
   assert.equal(show.quality.predictedDrops,0);assert.equal(show.quality.existingVirtualRenderersOnly,true);
   assert.equal(show.measurementUsed,false);assert.equal(show.measurementConfidence,null);
   assert.deepEqual(applyAiShowRemixV1106(base,show.remix,cap).segments.map(x=>[x.start,x.end,x.id]),
    base.segments.map(x=>[x.start,x.end,x.id]));
   assert(show.cues[4].energy<=show.cues[3].energy*.5);
   for(let i=0;i<7;i++){
    const c=show.cues[i];assert.equal(c.start,base.segments[i].start);assert.equal(c.end,base.segments[i].end);
    assert.equal(c.scene,base.segments[i].scene);assert.equal(c.energy,show.remix.acts[i].intensity);
    assert(c.energy>=0&&c.energy<=cap);
    assert.deepEqual(Object.keys(c.channels).sort(),['atmosphere','camera','dance','lighting','stage']);
    assert(Object.values(c.channels).every(x=>Number.isInteger(x)&&x>=0&&x<=cap));
    assert.equal(c.actualSongSectionDetected,false);assert.equal(c.authoredTiming,true);
    assert.equal(c.visualOnly,true);
    if(i&&i!==4)assert(Math.abs(c.energy-show.cues[i-1].energy)<=45);
   }
   count++;
  }
  assert.equal(count,256);
 });
 check('four dramaturgies are genuinely distinct, rest is protected',()=>{
  const signatures=ENERGY_STYLES_V1123.map(style=>make('hard',85,style,70).show.cues.map(c=>c.energy).join('/'));
  assert.equal(new Set(signatures).size,4);
  for(const style of ENERGY_STYLES_V1123){
   const show=make('hard',85,style,70).show;
   assert.equal(show.cues[4].dance,'calm');assert.equal(show.cues[4].lasers,'halo');
   assert(show.cues[4].channels.atmosphere<show.cues[3].channels.atmosphere);
  }
 });
 check('manually edited, uneven song boundaries and original remix object are preserved',()=>{
  const {base,remix,options}=make(),ends=[.05,.21,.29,.64,.68,.91,1];
  const custom={...base,segments:base.segments.map((x,i)=>({...x,start:i?ends[i-1]:0,end:ends[i]}))};
  const before=JSON.stringify(custom),beforeRemix=JSON.stringify(remix);
  const show=directConcertEnergyV1123(custom,remix,options);
  assert(show);assert.equal(JSON.stringify(custom),before);assert.equal(JSON.stringify(remix),beforeRemix);
  assert.deepEqual(show.cues.map(x=>[x.start,x.end]),custom.segments.map(x=>[x.start,x.end]));
 });
 check('short V1108 local measurement may adjust <=4 points only with conservative opt-in confidence',()=>{
  const {base,remix,options,show:plain}=make('hard',85,'festival',70);
  const observed={ready:true,source:'local-microphone',confidence:.74,energy:.98,
   trend:'rising',durationMs:8900,sampleCount:32};
  const measured=directConcertEnergyV1123(base,remix,options,observed);
  assert(measured&&measured.measurementUsed);assert.equal(measured.measurementConfidence,.74);
  assert(measured.cues.every((c,i)=>Math.abs(c.energy-plain.cues[i].energy)<=4));
  for(const variant of [
   {...observed,ready:false},{...observed,confidence:.40},{...observed,source:'external'},
   {...observed,durationMs:90000},{...observed,sampleCount:2},{...observed,energy:NaN},
   {...observed,trend:'predict-drop'},null,
  ]){
   const fallback=directConcertEnergyV1123(base,remix,options,variant);
   assert(fallback);assert.equal(fallback.measurementUsed,false);
   assert.deepEqual(fallback.cues.map(x=>x.energy),plain.cues.map(x=>x.energy));
  }
 });
 check('smooth rehearsal interpolation is finite; invalid position fails closed',()=>{
  const show=make().show,at=show.cues[2].start;
  const before=sampleConcertEnergyV1123(show,at-1e-7),boundary=sampleConcertEnergyV1123(show,at);
  const middle=sampleConcertEnergyV1123(show,at+.003),end=sampleConcertEnergyV1123(show,at+.03);
  assert.equal(before.cue.index,1);assert.equal(boundary.cue.index,2);
  assert.equal(boundary.blend,0);assert.equal(boundary.energy,before.energy);
  assert(middle.blend>0&&middle.blend<1);assert.equal(end.blend,1);
  for(const x of [-.1,1.01,NaN,Infinity,'0.5',undefined])assert.equal(sampleConcertEnergyV1123(show,x),null);
  assert.equal(sampleConcertEnergyV1123(null,.5),null);
  assert.equal(sampleConcertEnergyV1123(show,1).cue.index,6);
 });
 check('unsupported modes, invalid input and over-limit proposals fail closed',()=>{
  const {base,remix,options}=make();
  for(const raw of [null,[],{}, {...options,style:'unrestricted'},
   {...options,strength:10},{...options,strength:100},{...options,strength:55},
   {...options,strength:Infinity},{...options,intensityCap:90},{...options,intensityCap:10}]){
   assert.equal(normalizeEnergyOptionsV1123(raw),null);
   assert.equal(directConcertEnergyV1123(base,remix,raw),null);
   assert.equal(energyLivePresetV1123(raw),null);
  }
  assert.equal(directConcertEnergyV1123(null,remix,options),null);
  assert.equal(directConcertEnergyV1123(base,null,options),null);
  assert.equal(directConcertEnergyV1123(base,{...remix,acts:remix.acts.slice(1)},options),null);
  assert.equal(directConcertEnergyV1123(base,{...remix,acts:remix.acts.map((x,i)=>i===3?{...x,intensity:85}:x)},options),null);
 });
 check('approved virtual-only preset coordinates flow, choreography, camera, stage, lighting and atmosphere',()=>{
  const preset=energyLivePresetV1123({style:'festival',strength:80,intensityCap:45});assert(preset);
  assert.deepEqual(Object.keys(preset).sort(),[
   'arenaSmartConcertFlowEnabledV1071','arenaSmartConcertFlowStrengthV1071',
   'arenaChoreographyEnabledV1041','arenaChoreographyStrengthV1041',
   'arenaShowCameraEnabledV1043','arenaShowCameraStrengthV1043',
   'arenaTransformingStageEnabledV1066','arenaTransformingStageStrengthV1066',
   'arenaLightingChoreographerEnabledV1060','arenaLightingChoreographerStrengthV1060',
   'arenaAtmosphereDirectorEnabledV1045','arenaAtmosphereDirectorStrengthV1045',
  ].sort());
  assert(Object.values(preset).every(x=>x===true||x===45));
  assert(!Object.keys(preset).some(x=>/govee|dmx|pyro|strobe|device|microphone|network/i.test(x)));
 });
 check('UI offers preview, safety guard, explicit live opt-in, no unapproved external audio or storage',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const k of ['V1123 AI Concert Energy Director','V1123 Konzertenergie jetzt proben',
   'V1123 Concert Energy Partitur','V1123 sieben Energieszenen',
   'V1123 vorhandene virtuelle Konzertregie aktivieren','energyLivePresetV1123',
   'energyEnabled||masterEnabled?directConcertEnergyV1123','energyUseMeasurement&&!sampling&&canSample',
   'energyUndo.current','setEnergyPreview(null)','V1123 Energieeinstellungen wurden inzwischen manuell verändert',
   "(preferences.arenaChoreographyFormationV1041??'auto')!=='auto'",'energyPreview&&<section',
   'arenaConcertDirectorEnabledV1048'])assert(ui.includes(k),k);
  const lib=fs.readFileSync(path.join(root,'lib/aiConcertEnergyDirectorV1123.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|api\/govee|new\s+WebGLRenderer\s*\(/i.test(lib));
 });
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log('PASS V1123 all concert energy regression groups');
