'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
function load(f){
 const src=read(f),out=ts.transpileModule(src,{fileName:f,reportDiagnostics:true,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(out.diagnostics?.length??0,0);
 const mod={exports:{}};
 new Function('module','exports','require',out.outputText)(mod,mod.exports,()=>({}));
 return mod.exports;
}
const {concertLipTimingV561:timing,planConcertLipPreviewV561:plan,concertLipSongClockV561:clock}=load('components/visualizer/concertLipPreviewV561.ts');
const lines={synced:true,provider:'lrclib',plainText:null,lines:[{startMs:1000,endMs:3200,text:'Wir sind hier',words:[]}]};
const words={...lines,lines:[{...lines.lines[0],words:[{text:'Wir',startMs:1000,endMs:1200},{text:'sind',startMs:1400,endMs:1750}]}]};
const song={lyrics:words,trackId:'track',progressMs:1000,fetchedAt:10000,durationMs:180000,isPlaying:true,connected:true,offsetMs:0};
let n=0;
const test=(title,fn)=>{fn();console.log('PASS V561',title);n++};
test('word-level timestamps preferred to line-only',()=>{assert.equal(timing(words),'word');assert.equal(timing(lines),'line')});
test('plain or unsynced lyrics cannot pretend to have timestamps',()=>{
 assert.equal(timing({...words,synced:false}),'none');assert.equal(timing({...words,lines:[]}), 'none');
 assert.equal(timing({...words,lines:[{startMs:NaN,text:'Hi',words:[]}]}),'none');
});
test('untrusted invalid word marks never qualify',()=>{
 assert.equal(timing({...lines,lines:[{startMs:1000,text:'Hey',words:[{text:'yo',startMs:-1,endMs:1200}]}]}),'line');
 assert.equal(timing({...lines,lines:[{startMs:1000,text:'Hey',words:[{text:'yo',startMs:1000,endMs:999}]}]}),'line');
});
test('real song timing is distinguished from demo',()=>{
 assert.equal(plan('song',true,false,song).source,'song');assert.equal(plan('song',true,false,song).timing,'word');
 assert.equal(plan('song',true,false,{...song,lyrics:lines}).timing,'line');
 assert.equal(plan('rap',true,false,song).source,'demo-rap');
 assert.equal(plan('singing',true,false,song).source,'demo-singing');
});
test('manual off/pause/reduced-motion overrides all sources',()=>{
 assert.equal(plan('off',true,false,song).source,'off');
 assert.equal(plan('song',false,false,song).source,'off');
 assert.equal(plan('rap',true,true,song).source,'off');
});
test('song requires real connected metadata and valid synced lyric clock',()=>{
 for(const broken of [{...song,trackId:null},{...song,connected:false},{...song,lyrics:null},{...song,lyrics:{...words,synced:false}}])
  assert.equal(plan('song',true,false,broken).source,'off');
 assert.equal(plan('song',true,false,{...song,isPlaying:false}).source,'off');
});
test('player clock extrapolates only within freshness guard',()=>{
 assert.deepEqual(clock(song,10400),{progressMs:1400,playing:true});
 assert.deepEqual(clock(song,31000),{progressMs:0,playing:false});
 assert.deepEqual(clock(song,8900),{progressMs:0,playing:false});
});
test('lyrics offset honored and bounded',()=>{
 assert.equal(clock({...song,offsetMs:250},10400).progressMs,1650);
 assert.equal(clock({...song,offsetMs:999999},10400).progressMs,16400);
 assert.equal(clock({...song,offsetMs:-2000},10400).progressMs,0);
});
test('paused, disconnected, NaN and duration end never animate',()=>{
 assert.equal(clock({...song,isPlaying:false},10400).playing,false);
 assert.equal(clock({...song,connected:false},10400).playing,false);
 assert.equal(clock({...song,progressMs:NaN},10400).playing,false);
 assert.equal(clock({...song,progressMs:180000},10400).playing,false);
});
test('clock does not mutate Spotify state object',()=>{
 const before=JSON.stringify(song);clock(song,10888);assert.equal(JSON.stringify(song),before);
});
test('real GLB preview renders the SAME facial renderer as the live GLB',()=>{
 const glb=read('components/visualizer/PreviewGlbPortraitV560.tsx');
 const live=read('components/visualizer/GltfDancerAvatarV492.tsx');
 assert.match(glb,/import \{VocalRigV368\}/);assert.match(glb,/<VocalRigV368/);
 assert.match(live,/<VocalRigV368/);
 assert.match(glb,/cloneSkinnedScene\(scene\)/);
 assert.match(glb,/scanFacialRigV370\(model\)/);
});
test('facial demo reaches the actual morph renderer and leaves production pathway unchanged',()=>{
 const rig=read('components/visualizer/VocalRigV368.tsx');
 assert.match(rig,/\? target\[c\] : lipV546\.active/);
 assert.match(rig,/morph\.mesh\.morphTargetInfluences/);
 assert.match(rig,/sampleFacialDemoV370/);
});
test('preview only runs when opt-in and recognized mouth mapping exists',()=>{
 const glb=read('components/visualizer/PreviewGlbPortraitV560.tsx');
 assert.match(glb,/diagnosticsV561\.mouthSupported&&lipPlanV561\.source!=='off'/);
 assert.match(glb,/onDiagnosticsV561\?\.\(diagnosticsV561\)/);
 assert.match(glb,/session\.dispose\(\)/);
});
test('preview song time is not invented from local beat demo',()=>{
 const glb=read('components/visualizer/PreviewGlbPortraitV560.tsx');
 assert.match(glb,/QUIET_AUDIO_V561/);
 assert.match(glb,/concertLipSongClockV561\(songV561,Date\.now\(\)\)/);
 assert.match(glb,/profileV370=\{profileV561\}/);
});
test('studio provides source switches and states without changing player',()=>{
 const stage=read('components/visualizer/StagePreviewModal.tsx');
 for(const t of ['Deutschrap-Demo','Gesangs-Demo','Aktueller Song','Mund-Rig','onGlbDiagnosticsV561','lipModeV561','songV561'])assert.ok(stage.includes(t),t);
 assert.match(stage,/disabled=\{mode==='song'/);
 assert.match(stage,/preferences\.avatarFacialProfilesV370/);
 assert.match(stage,/preferences\.lyricsOffsetMs/);
 assert.doesNotMatch(stage,/(?:seekTo|pausePlayback|playSpotify)\(/);
});
test('manual facial mappings recognize unlabelled GLB mouth morphs',()=>{
 const {scanFacialRigV370,bindingsForFacialProfileV370}=load('components/visualizer/facialRigStudioV370.ts');
 const fake={name:'FaceMesh',morphTargetDictionary:{UnknownBlend:0},morphTargetInfluences:[0]};
 const model={traverse(fn){fn(fake)}};
 const scan=scanFacialRigV370(model);
 assert.equal(scan.targets.length,1);
 assert.equal(scan.targets[0].suggestion,null);
 assert.equal(bindingsForFacialProfileV370(scan,{}).length,0);
 const manual=bindingsForFacialProfileV370(scan,{mapping:{jaw:'FaceMesh#0::UnknownBlend'}});
 assert.equal(manual[0].channel,'jaw');
 const disabled=bindingsForFacialProfileV370(scan,{mapping:{jaw:'none'}});
 assert.equal(disabled.length,0);
 const glb=read('components/visualizer/PreviewGlbPortraitV560.tsx');
 assert.match(glb,/bindingsForFacialProfileV370\(scanV561,profileV561\)/);
});
test('no new shadow lights or custom animation loops',()=>{ 
 const glb=read('components/visualizer/PreviewGlbPortraitV560.tsx');
 assert.doesNotMatch(glb,/<(?:spotLight|directionalLight|pointLight)/);
 assert.doesNotMatch(glb,/requestAnimationFrame|setInterval|setTimeout/);
});
test('changed TypeScript components transpile successfully',()=>{
 for(const f of ['components/visualizer/PreviewGlbPortraitV560.tsx','components/visualizer/StagePreviewModal.tsx','components/visualizer/VocalRigV368.tsx']){
 const out=ts.transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(out.diagnostics?.length??0,0,f);
 }
});
console.log(`PASS V561 ${n} regression cases`);
