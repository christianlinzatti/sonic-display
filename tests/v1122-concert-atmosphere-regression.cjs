#!/usr/bin/env node
'use strict';
/** V1122: Compile the actual planner, then protect authored timing, realism and consent. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1122-'));
function check(name,fn){fn();console.log('PASS V1122 '+name)}
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc')}catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync)}
 if(!compiler)compiler=(process.env.NODE_PATH||'').split(path.delimiter).map(x=>path.join(x,'typescript/bin/tsc.js')).find(fs.existsSync);
 assert(compiler,'TypeScript compiler missing: npm ci required');
 const r=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1122-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',tmp],
  {cwd:root,encoding:'utf8',windowsHide:true,timeout:90000});
 assert.equal(r.status,0,r.stdout+'\n'+r.stderr+'\n'+(r.error?.message||''));
 const {generateArenaShowPlanV1040}=require(path.join(tmp,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(tmp,'lib/arena360AiShowRemixV1106.js'));
 const {ATMOSPHERE_STYLES_V1122,normalizeAtmosphereOptionsV1122,directConcertAtmosphereV1122,
  sampleConcertAtmosphereV1122,atmosphereLivePresetV1122}=require(path.join(tmp,'lib/aiConcertAtmosphereDirectorV1122.js'));
 const make=(genre='rap',cap=70,style='cinematic',strength=50)=>{
  const base=generateArenaShowPlanV1040({genre,title:'V1122 atmosphere regression',durationMs:210000});
  const remix=localAiShowRemixV1106('Schöne virtuelle Bühnenatmosphäre',genre,cap);
  const options={style,strength,intensityCap:cap};
  return {base,remix,options,show:directConcertAtmosphereV1122(base,remix,options)};
 };
 check('256 genre x caps x style x strengths preserve artists, song boundaries and source remix',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,70,85])
  for(const style of ATMOSPHERE_STYLES_V1122)for(const strength of [20,40,60,80]){
   const {base,remix,show}=make(genre,cap,style,strength);
   assert(show,JSON.stringify({genre,cap,style,strength}));
   assert.equal(show.cues.length,7);assert.deepEqual(show.remix,remix);
   assert.equal(show.quality.hardwareCommands,0);assert.equal(show.quality.detectedDrops,0);
   assert(show.quality.quietBreak&&show.quality.lyricsReadable&&show.quality.existingRenderersOnly);
   assert.deepEqual(applyAiShowRemixV1106(base,show.remix,cap).segments.map(x=>[x.start,x.end,x.id]),
    base.segments.map(x=>[x.start,x.end,x.id]));
   show.cues.forEach((c,i)=>{
    assert.equal(c.start,base.segments[i].start);assert.equal(c.end,base.segments[i].end);
    assert.equal(c.scene,base.segments[i].scene);
    assert(c.fog>=0&&c.fog<=65&&c.particles>=0&&c.particles<=70&&c.depth>=0&&c.depth<=75);
    assert(c.airflow>=0&&c.airflow<=65&&c.lyricsClearance>=55);
    assert.equal(c.authoredTiming,true);assert.equal(c.actualSongEventDetected,false);
   });
   count++;
  }
  assert.equal(count,256);
 });
 check('authored nonuniform scene boundaries are preserved byte-for-byte',()=>{
  const {base,remix,options}=make();const ends=[.06,.26,.29,.64,.70,.92,1];
  const edited={...base,segments:base.segments.map((s,i)=>({...s,start:i?ends[i-1]:0,end:ends[i]}))};
  const snapshot=JSON.stringify(edited),remixSnapshot=JSON.stringify(remix);
  const show=directConcertAtmosphereV1122(edited,remix,options);
  assert(show);assert.equal(JSON.stringify(edited),snapshot);assert.equal(JSON.stringify(remix),remixSnapshot);
  assert.deepEqual(show.cues.map(c=>[c.start,c.end]),edited.segments.map(c=>[c.start,c.end]));
 });
 check('each of four looks is distinct and quiet break is subdued',()=>{
  const signatures=[];
  for(const style of ATMOSPHERE_STYLES_V1122){
   const show=make('rap',70,style,70).show;
   signatures.push(JSON.stringify(show.cues.map(c=>[c.fog,c.particles,c.depth,c.airflow,c.look])));
   assert(show.cues[4].fog<show.cues[3].fog);
   assert(show.cues[4].particles<show.cues[3].particles);
   assert(show.cues[4].depth<show.cues[3].depth);
  }
  assert.equal(new Set(signatures).size,4);
 });
 check('sample is smooth at scene boundary, clamped and fail closed',()=>{
  const show=make().show;const b=show.cues[1].start;
  const before=sampleConcertAtmosphereV1122(show,b-0.000001),start=sampleConcertAtmosphereV1122(show,b);
  const middle=sampleConcertAtmosphereV1122(show,b+.004);
  const end=sampleConcertAtmosphereV1122(show,b+.03);
  assert.equal(before.cue.index,0);assert.equal(start.cue.index,1);
  assert.equal(start.transition,0);assert.deepEqual([start.fog,start.particles,start.depth],
   [before.fog,before.particles,before.depth]);
  assert(middle.transition>0&&middle.transition<1);
  assert.equal(end.transition,1);assert.equal(end.fog,show.cues[1].fog);
  for(const x of [-1,1.01,NaN,Infinity,'0.5',undefined])assert.equal(sampleConcertAtmosphereV1122(show,x),null);
  assert.equal(sampleConcertAtmosphereV1122(null,.4),null);
  assert.equal(sampleConcertAtmosphereV1122(show,1).cue.index,6);
 });
 check('invalid requests and oversized intensity always fail closed',()=>{
  const {base,remix,options}=make();
  for(const raw of [null,{},[],{...options,style:'smoke-machine'},{...options,strength:15},
   {...options,strength:100},{...options,strength:NaN},{...options,intensityCap:101},
   {...options,intensityCap:29}]){
   assert.equal(normalizeAtmosphereOptionsV1122(raw),null);
   assert.equal(directConcertAtmosphereV1122(base,remix,raw),null);
   assert.equal(atmosphereLivePresetV1122(raw),null);
  }
  assert.equal(directConcertAtmosphereV1122(null,remix,options),null);
  assert.equal(directConcertAtmosphereV1122(base,null,options),null);
  assert.equal(directConcertAtmosphereV1122(base,{...remix,acts:remix.acts.slice(0,6)},options),null);
  assert.equal(directConcertAtmosphereV1122(base,{...remix,acts:remix.acts.map((a,i)=>i===3?{...a,intensity:85}:a)},options),null);
 });
 check('user-enabled preset touches only established bounded virtual atmosphere keys',()=>{
  const preset=atmosphereLivePresetV1122({style:'festival',strength:80,intensityCap:45});assert(preset);
  assert.deepEqual(Object.keys(preset).sort(),[
   'arenaAtmosphereDirectorEnabledV1045','arenaAtmosphereDirectorStrengthV1045',
   'arenaVolumetricLightingEnabledV1058','arenaVolumetricLightingStrengthV1058',
   'arenaFestivalFxEnabledV1084','arenaFestivalFxStrengthV1084'].sort());
  assert(Object.values(preset).every(x=>x===true||x===45));
  assert(!Object.keys(preset).some(x=>/govee|dmx|device|hardware|strobe|pyro|physical/i.test(x)));
 });
 check('UI has explicit preview, separate consent, manual-mode guard and conflict-safe undo',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  for(const k of ['V1122 AI Concert Atmosphere Director','V1122 Atmosphäre jetzt proben',
   'V1122 Concert Atmosphere Partitur','V1122 sieben Atmosphärenszenen',
   'V1122 vorhandene virtuelle Atmosphäre aktivieren','atmosphereLivePresetV1122',
   "(preferences.arenaFestivalFxModeV1084??'auto')!=='auto'",'atmosphereUndo.current',
   'atmosphereEnabled||masterEnabled?directConcertAtmosphereV1122','setAtmospherePreview(null)',
   'V1122 Atmosphäre wurde inzwischen manuell geändert'])assert(ui.includes(k),k);
  const lib=fs.readFileSync(path.join(root,'lib/aiConcertAtmosphereDirectorV1122.ts'),'utf8');
  assert(!/\bfetch\s*\(|localStorage|navigator\.mediaDevices|setInterval|Math\.random|new\s+WebGLRenderer\s*\(|api\/govee/i.test(lib));
 });
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
console.log('PASS V1122 all atmosphere regression groups');
