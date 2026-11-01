'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const load=(file)=>{const t=ts.transpileModule(read(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 a.equal(t.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
 const mod={exports:{}};new Function('module','exports','require',t.outputText)(mod,mod.exports,()=>{throw Error('runtime dependency forbidden')});return mod.exports;};
const bridge=load('components/visualizer/concertTimelineBridgeV763.ts');const old=load('services/stageContent/showTimelineV354.ts');
let count=0;const ok=(x,m)=>{a.ok(x,m);count++};const eq=(x,y,m)=>{a.deepEqual(x,y,m);count++};
const source={source:'verified-v604',trackId:'song-123',durationMs:180000,scenes:[
 {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:0,endMs:60000},
 {index:1,actIndex:1,section:'hook',intent:'ensemble',startMs:60000,endMs:120000},
 {index:2,actIndex:2,section:'drop',intent:'pulse',startMs:120000,endMs:180000}]};
eq(bridge.getConcertTimelineV763(),null,'initial null');
bridge.publishConcertTimelineV763(source,9000,true);
let snap=bridge.getConcertTimelineV763();ok(snap.source==='verified-v604'&&snap.scenes.length===3,'verified scenes visible');
eq(snap.progressMs,9000);eq(snap.playing,true);
const score={...old.DEFAULT_TIMELINE_V354,trackId:'song-123',durationMs:180000};
ok(bridge.canEditConcertTimelineV763(score,snap),'exact match can author');
ok(!bridge.canEditConcertTimelineV763({...score,trackId:''},snap),'cannot create global score');
ok(!bridge.canEditConcertTimelineV763({...score,trackId:'other'},snap),'other song not editable');
ok(!bridge.canEditConcertTimelineV763({...score,durationMs:180001},snap),'wrong duration blocked');
ok(!bridge.canEditConcertTimelineV763(score,null),'no active song');
for(const patch of [{source:'unavailable'},{scenes:[]},{scenes:[{...source.scenes[0],index:4}]},
 {scenes:[{...source.scenes[0],startMs:-1}]},{scenes:[{...source.scenes[0],endMs:200000}]},
 {scenes:[{...source.scenes[0],startMs:500,endMs:500}]},
 {scenes:[source.scenes[0],{...source.scenes[1],startMs:30000}]},
 {scenes:Array.from({length:481},(_,i)=>({...source.scenes[0],index:i,startMs:i*100,endMs:i*100+50}))}]){
 bridge.publishConcertTimelineV763({...source,...patch},10000,true);
 snap=bridge.getConcertTimelineV763();eq(snap.source,'unavailable','unsafe plan is not trusted');eq(snap.scenes.length,0,'unsafe scenes absent');
}
for(const patch of [{trackId:''},{durationMs:NaN},{durationMs:9000},{durationMs:1900000}]){
 bridge.publishConcertTimelineV763({...source,...patch},10000,true);
 eq(bridge.getConcertTimelineV763(),null,'no fake current song');
}
for(let i=0;i<40000;i++){
 const t=(i*103)%185000;bridge.publishConcertTimelineV763(source,t,i%3>0);snap=bridge.getConcertTimelineV763();
 eq(snap.progressMs,Math.min(t,180000),'progress finite clamped');
 ok(snap.scenes.length===3&&snap.trackId===source.trackId,'no drift');
 ok(bridge.canEditConcertTimelineV763(score,snap),'scope constant');
}
for(const lane of ['camera','lighting','dance','effects','lyrics','photos']){
 const base={...score,enabled:true};let s=old.addTimelineClipV354(base,lane,10000);
 ok(s.clips.length===1,'V354 lane available '+lane);
 s=old.updateTimelineClipV354(s,s.clips[0].id,{label:'Handgemacht',durationMs:6000});
 const result=old.evaluateTimelineV354(s,{trackId:'song-123',progressMs:11000,playing:true,reducedMotion:false,lyricsActive:true});
 ok(result.active&&result.activeLanes.includes(lane),'actual authored playback '+lane);
 ok(!old.evaluateTimelineV354(s,{trackId:'other',progressMs:11000,playing:true,reducedMotion:false,lyricsActive:true}).active,'never leak across songs');
 ok(!old.evaluateTimelineV354(s,{trackId:'song-123',progressMs:11000,playing:false,reducedMotion:false,lyricsActive:true}).active,'pause protection');
 eq(old.deleteTimelineClipV354(s,s.clips[0].id).clips.length,0,'delete');
}
const ui=read('components/visualizer/InteractiveConcertTimelineStudioV763.tsx');
for(const token of ['getConcertTimelineV763','CONCERT_TIMELINE_EVENT_V763','readTimelineV354','SHOW_TIMELINE_EVENT_V354',
 'canEditConcertTimelineV763','saveTimelineV354','addTimelineClipV354','updateTimelineClipV354','deleteTimelineClipV354','evaluateTimelineV354',
 'confirmReplacement','enabled:false','trackId:snapshot.trackId','V761','V354'])ok(ui.includes(token),'read/write integration '+token);
const stage=read('components/visualizer/VisualizerStage.tsx'),setting=read('components/SettingsPanel.tsx'),three=read('components/visualizer/ThreeAvatar.tsx');
ok(stage.includes('publishConcertTimelineV763(cinematicPlanV761,previewSecondV763*1000,isPlaying)'),'real V761 plan published');
ok(setting.includes('<InteractiveConcertTimelineStudioV763/>'),'settings entry point');
ok(three.includes('evaluateTimelineV354(showTimelineV354')&&three.includes('SHOW_TIMELINE_EVENT_V354'),'live show consumes edits');
ok(three.includes('manualLightingV763={authoredCueV354.active'),'authored lighting recognized');
ok(read('components/visualizer/DynamicStage.tsx').includes('authored:manualLightingV763||authoredLightsV386'),'V762 gobo disabled on manual lighting');
ok(ui.includes('Bestehende Show als JSON sichern'),'single-score backup before replacement');
ok(read('components/visualizer/cinematicScenicLightingV762.ts').includes('export type StageLightingSettingsV762=DynamicStageLightingSettingsV762'),'V762 public type alias compile safety');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
ok(Number(pkg.version.match(/^0\.1\.0-v(\d+)$/)?.[1]??0)>=763,'V763 or later compatible release');eq(lock.version,pkg.version);eq(lock.packages[''].version,pkg.version);
ok(pkg.scripts['check:fast'].includes('npm run test:v763 &&'),'V763 prebuild protected');
ok(read('.github/workflows/concert-validation-v571.yml').includes('npm run test:v763:ui-types'),'CI includes UI gate');
console.log('PASS V763 Interactive Concert Timeline Studio:',count.toLocaleString('en-US'),'assertions');
