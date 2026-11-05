#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const ts=require('typescript');
const root=path.resolve(__dirname,'..');
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function compiled(file,jsx=false){
 const result=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,
   jsx:jsx?ts.JsxEmit.ReactJSX:ts.JsxEmit.Preserve}});
 assert(!result.diagnostics?.some(x=>x.category===ts.DiagnosticCategory.Error),file+' syntax');
 return result.outputText;
}
function run(file,deps={}){
 const module={exports:{}};
 vm.runInNewContext(compiled(file),{module,exports:module.exports,Set,Map,Math,Number,JSON,
  require:id=>{if(id in deps)return deps[id];throw Error('Unknown dependency '+id);}});
 return module.exports;
}
const timeline=run('services/stageContent/showTimelineV354.ts');
const v982=run('lib/immersiveAiDirectorV982.ts');
const v983=run('lib/aiSongIntelligenceV983.ts',{'./immersiveAiDirectorV982':v982});
const storyCore=run('lib/aiConcertStoryV984.ts',{'./aiSongIntelligenceV983':v983,'./immersiveAiDirectorV982':v982});
const v985=run('lib/predictiveShowTimelineV985.ts',{
 './aiConcertStoryV984':storyCore,'../services/stageContent/showTimelineV354':timeline});
const insight=v983.localSongInsightV983({title:'Live',artist:'Demo',genre:'Deutschrap',durationMs:200000});
const story=storyCore.localConcertStoryV984(insight,'festival');
const raw={trackId:'spotify-track-abc',durationMs:200000,progressMs:18000,playing:true,source:'verified-v604',
 scenes:[
  {index:0,actIndex:0,section:'verse',intent:'portrait',startMs:10000,endMs:30000},
  {index:1,actIndex:1,section:'hook',intent:'ensemble',startMs:50000,endMs:70000},
  {index:2,actIndex:2,section:'build',intent:'rise',startMs:85000,endMs:105000},
  {index:3,actIndex:3,section:'drop',intent:'pulse',startMs:140000,endMs:158000},
  {index:4,actIndex:4,section:'break',intent:'breath',startMs:179000,endMs:195000},
 ]};
const snapshot=()=>structuredClone(raw);
const scenes=v985.proposePredictiveCuesV985(raw,story,raw.trackId,raw.durationMs);
let checks=0;
function test(title,fn){fn();checks++;console.log('PASS V985 '+title);}
test('confirmed source and song identity required',()=>{
 assert(v985.verifiedConcertSnapshotV985(raw,raw.trackId,raw.durationMs));
 for(const change of [{source:'unavailable'}, {trackId:'different'},{durationMs:220000},
  {scenes:[]},{scenes:[{...raw.scenes[0],section:'outro'}]},
  {scenes:[{...raw.scenes[0],intent:'teleport'}]},
  {scenes:[{...raw.scenes[0],startMs:NaN}]},
  {scenes:[raw.scenes[0],{...raw.scenes[1],startMs:15000,index:1}]},
  {scenes:[{...raw.scenes[0],endMs:200001}]},
  {scenes:[{...raw.scenes[0],actIndex:99.5}]}]){
  const bad={...snapshot(),...change};
  assert.equal(v985.verifiedConcertSnapshotV985(bad,raw.trackId,raw.durationMs),false);
  assert.equal(v985.proposePredictiveCuesV985(bad,story,raw.trackId,raw.durationMs).length,0);
 }
 assert.equal(v985.proposePredictiveCuesV985(raw,story,'wrong',raw.durationMs).length,0);
});
test('five-act motifs decorate confirmed boundaries, not hypothetical AI timestamps',()=>{
 assert(scenes.length>8);
 assert.deepEqual([...new Set(scenes.map(x=>x.storyAct))],[1,2,3,4,5]);
 const starts=new Set(raw.scenes.map(x=>x.startMs));
 assert(scenes.every(x=>starts.has(x.clip.startMs)));
 assert(scenes.every(x=>x.clip.startMs+x.clip.durationMs<=raw.durationMs));
 assert(!scenes.some(x=>x.clip.startMs===0||x.clip.startMs===2000));
 assert(scenes.every(x=>/^v985-\d+-(camera|lighting|dance|effects)$/.test(x.clip.id)));
 assert.equal(v985.proposePredictiveCuesV985(raw,{...story,acts:[]},raw.trackId,raw.durationMs).length,0);
});
test('camera and energy are bounded, effects only on verified drop',()=>{
 assert(scenes.find(x=>x.clip.id==='v985-0-camera').clip.value==='close');
 assert(scenes.find(x=>x.clip.id==='v985-1-camera').clip.value==='wide');
 const dance=scenes.filter(x=>x.clip.lane==='dance');assert.equal(dance.length,1);
 assert.equal(dance[0].section,'hook');
 const effects=scenes.filter(x=>x.clip.lane==='effects');assert.equal(effects.length,1);
 assert.equal(effects[0].section,'drop');
 assert(scenes.filter(x=>x.clip.lane==='lighting').every(x=>x.clip.value>=.65&&x.clip.value<=1.35));
 assert(effects.every(x=>x.clip.value<=1.25));
 assert(!scenes.some(x=>'hardware' in x.clip||'govee' in x.clip));
});
test('anticipation is preview-only, resets on pause and seeking',()=>{
 const all=scenes.filter(x=>x.clip.startMs>=50000);
 const soon=v985.previewPredictiveCuesV985(all,49500,true,true);
 assert.equal(soon.state,'upcoming');assert.equal(soon.secondsUntil,.5);
 assert.equal(soon.next.clip.startMs,50000);
 assert.equal(v985.previewPredictiveCuesV985(all,49500,false,true).state,'paused');
 assert.equal(v985.previewPredictiveCuesV985(all,49500,true,false).state,'no-evidence');
 assert.equal(v985.previewPredictiveCuesV985(all,51000,true,true).state,'live');
 assert.equal(v985.previewPredictiveCuesV985(all,200000,true,true).state,'idle');
 assert.equal(v985.previewPredictiveCuesV985(all,0,true,true).state,'idle');
});
test('review imports selected cues without enabling playback or modifying existing clips',()=>{
 const base=timeline.sanitizeTimelineV354({...timeline.DEFAULT_TIMELINE_V354,
  trackId:raw.trackId,durationMs:raw.durationMs,clips:[]});
 const approved=scenes.slice(0,3).map(x=>x.clip.id);
 const result=v985.importPredictiveCuesV985(base,raw,story,approved);
 assert.equal(result.added,3);assert.equal(result.score.enabled,false);
 assert.equal(result.score.clips.length,3);
 assert.equal(JSON.stringify(result.score.clips.map(x=>x.startMs)),'[10000,10000,50000]');
 assert.equal(v985.importPredictiveCuesV985(result.score,raw,story,approved).added,0);
 assert.equal(v985.importPredictiveCuesV985(base,raw,story,['unknown']).invalid,1);
 assert.equal(v985.importPredictiveCuesV985(base,{...raw,source:'unavailable'},story,approved).added,0);
});
test('manual scores win lane conflicts and unrelated songs never modified',()=>{
 const manual={id:'manual',lane:'camera',startMs:11000,durationMs:2000,value:'orbit',label:'manual'};
 const base=timeline.sanitizeTimelineV354({...timeline.DEFAULT_TIMELINE_V354,trackId:raw.trackId,
  durationMs:raw.durationMs,enabled:true,clips:[manual]});
 const result=v985.importPredictiveCuesV985(base,raw,story,
  ['v985-0-camera','v985-0-lighting','v985-1-camera']);
 assert.equal(result.conflicts,1);assert.equal(result.added,2);assert.equal(result.score.enabled,true);
 assert.deepEqual(JSON.parse(JSON.stringify(result.score.clips[0])),manual);
 const wrong=v985.importPredictiveCuesV985({...base,trackId:'other-track'},raw,story,['v985-0-camera']);
 assert.equal(wrong.added,0);assert.equal(wrong.score.trackId,'other-track');
});
test('invalid or duplicate selections and clip limits are bounded',()=>{
 const base=timeline.sanitizeTimelineV354({...timeline.DEFAULT_TIMELINE_V354,trackId:raw.trackId,durationMs:raw.durationMs,clips:[]});
 const repeat=v985.importPredictiveCuesV985(base,raw,story,['v985-1-camera','v985-1-camera']);
 assert.equal(repeat.added,1);
 assert.equal(v985.importPredictiveCuesV985(base,raw,story,Array(97).fill('v985-0-camera')).added,0);
 assert.equal(v985.importPredictiveCuesV985(base,raw,story,['x'.repeat(37)]).added,0);
});
test('new UI, integration, and existing source files all parse',()=>{
 for(const file of ['lib/predictiveShowTimelineV985.ts','components/visualizer/PredictiveShowTimelineV985.tsx',
  'components/visualizer/ConcertStoryDirectorV984.tsx','components/visualizer/SongIntelligencePanelV983.tsx',
  'components/visualizer/LiveFxDeckV881.tsx'])compiled(file,file.endsWith('.tsx'));
 const ui=read('components/visualizer/PredictiveShowTimelineV985.tsx');
 const host=read('components/visualizer/ConcertStoryDirectorV984.tsx');
 assert(host.includes('<PredictiveShowTimelineV985 key={trackId}'));
 assert(ui.includes('getConcertTimelineV763()'));
 assert(ui.includes('importPredictiveCuesV985(latest,current,story,selected)'));
 assert(ui.includes('createConcertSongV764(trackId,durationMs)'));
 for(const bad of ['fetch(','navigator.bluetooth','govee/command','setInterval(','requestAnimationFrame('])
  assert(!ui.includes(bad));
});
test('V985 registered in CI, Vercel and focused TypeScript check',()=>{
 const pkg=JSON.parse(read('package.json'));
 assert(/^v\d+$/.test(pkg.sonicRoadmapRelease)&&Number(pkg.sonicRoadmapRelease.slice(1))>=985);
 assert(pkg.scripts.prebuild.includes('npm run test:v985 && npm run test:v985:types &&'));
 assert(pkg.scripts['test:v985']);assert(pkg.scripts['test:v985:types']);
 assert(read('scripts/vercel-production-build.cjs').includes("run('V985 Predictive Show Timeline'"));
 assert(read('.github/workflows/v832-continuous-validation.yml').includes('V985 Predictive Show Timeline'));
 const config=JSON.parse(read('tests/tsconfig.v985-core.json'));
 assert(config.files.includes('../lib/predictiveShowTimelineV985.ts'));
});
console.log('V985 PASS: '+checks+' checks');
