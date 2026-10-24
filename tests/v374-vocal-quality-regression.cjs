require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const cache=new Map();
function load(file){
 const full=path.resolve(root,file);
 if(cache.has(full))return cache.get(full).exports;
 const source=fs.readFileSync(full,'utf8');
 const compiled=ts.transpileModule(source,{fileName:full,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(compiled.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,'transpile '+file);
 const mod=new Module(full,module);mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));cache.set(full,mod);
 const requireNative=mod.require.bind(mod);
 mod.require=name=>name.startsWith('./')?load(path.join(path.relative(root,path.dirname(full)),`${name}.ts`)):requireNative(name);
 mod._compile(compiled.outputText,full);return mod.exports;
}
const {resolveVocalPerformanceQualityV374:resolve}=load('components/visualizer/vocalPerformanceQualityV374.ts');
const {resolveCoordinatedVocalV372:base}=load('components/visualizer/vocalPerformanceDirectorV372.ts');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
 {startMs:1000,endMs:2250,text:'Bam schnell hier!',words:[
  {text:'Bam',startMs:1000,endMs:1220},
  {text:'schnell',startMs:1230,endMs:1480},
  {text:'hier!',startMs:1510,endMs:2130}]},
 {startMs:2450,endMs:3500,text:'Worte rappen wir',words:[
  {text:'Worte',startMs:2450,endMs:2720},
  {text:'rappen',startMs:2740,endMs:3000},
  {text:'wir',startMs:3030,endMs:3480}]},
 {startMs:3600,endMs:4000,text:'♪'},
 {startMs:4300,endMs:5100,text:'Ohne Wortdaten'},
]};
const opts={genre:'Deutschrap',style:'rap',lipStrength:90,bodyStrength:100,alignment:70};
const at=(time,more={},playing=true)=>resolve(lyrics,time,playing,{...opts,...more});
const vocal=at(1390);
assert.equal(vocal.confidence,'word');
assert.equal(vocal.vocal.activeWord,'schnell');
assert.equal(vocal.qualityV374.rapidWord,true);
assert.equal(vocal.qualityV374.role,'solo');
assert.ok(vocal.qualityV374.gestureGain<1);
const old=base(lyrics,1390,true,opts);
assert.ok(Math.abs(vocal.body.leftArm)<Math.abs(old.body.leftArm));
assert.deepEqual(at(1390,{qualityEnabledV374:false}).body,old.body);
assert.deepEqual(at(1390,{qualityEnabledV374:false}).face,old.face);
assert.equal(at(1390,{mouthSmoothnessV374:0}).qualityV374.mouthMix,0);
assert.ok(at(1390,{mouthSmoothnessV374:100}).qualityV374.mouthMix>0);
assert.equal(at(1390,{rapGestureCalmV374:0}).qualityV374.gestureGain,1);
assert.ok(at(1390,{rapGestureCalmV374:100}).qualityV374.gestureGain < at(1390,{rapGestureCalmV374:10}).qualityV374.gestureGain);
assert.equal(at(1390,{style:'singing'}).qualityV374.gestureGain,1,'singing is not rap-filtered');
assert.equal(at(1040).face.lipsClosed,base(lyrics,1040,true,opts).face.lipsClosed,'B/M/P closure is preserved exactly');
for(const time of [50,2270,3690,5300]){
 const cur=at(time); const legacy=base(lyrics,time,true,opts);
 assert.equal(cur.face.jaw,legacy.face.jaw,'no invented jaw in gaps');
 assert.deepEqual(cur.body,legacy.body,'no gestures fabricated in gaps');
}
const line=at(4600);assert.equal(line.confidence,'line');assert.deepEqual(line.body,base(lyrics,4600,true,opts).body);
assert.equal(at(1390,{},false).face.jaw,0);
assert.equal(at(1390,{},false).body.emphasis,0);
assert.equal(at(1390,{reducedMotion:true}).face.jaw,0);
assert.equal(at(1390,{bodyEnabled:false}).body.emphasis,0);
assert.deepEqual(at(1390),at(1390),'deterministic playback-clock-only');
const duo={ensembleCountV374:2,ensembleModeV374:'lead'};
const lead=at(1390,{...duo,avatarSlot:0});
const backing=at(1390,{...duo,avatarSlot:1});
assert.equal(lead.qualityV374.role,'lead');assert.equal(backing.qualityV374.role,'backing');
assert.ok(backing.qualityV374.gestureGain<lead.qualityV374.gestureGain);
const cr={ensembleCountV374:2,ensembleModeV374:'call-response'};
assert.equal(at(1390,{...cr,avatarSlot:0}).qualityV374.role,'lead');
assert.equal(at(1390,{...cr,avatarSlot:1}).qualityV374.role,'backing');
assert.equal(at(2810,{...cr,avatarSlot:1}).qualityV374.role,'lead');
assert.equal(at(2810,{...cr,avatarSlot:0}).qualityV374.role,'backing');
assert.ok(at(1390,{...cr,avatarSlot:1}).face.jaw<at(1390,{...cr,avatarSlot:0}).face.jaw);
assert.equal(at(1390,{ensembleCountV374:4,ensembleModeV374:'balanced',avatarSlot:3}).qualityV374.role,'ensemble');
assert.equal(at(1390,{...duo,avatarSlot:0,timingOffsetMs:100}).effectiveTimeMs,1490);
assert.equal(at(1390,{...duo,avatarSlot:0,timingOffsetMs:100,qualityEnabledV374:false}).effectiveTimeMs,1490);
for(const file of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VocalRigV368.tsx']) {
 const src=fs.readFileSync(path.join(root,file),'utf8');
 assert.match(src,/resolveVocalPerformanceQualityV374/,'shared runtime resolver '+file);
 assert.match(src,/ensembleCountV374/,'multi dancer options '+file);
}
assert.match(fs.readFileSync(path.join(root,'components/visualizer/ThreeAvatar.tsx'),'utf8'),/ensembleCountV374:settings.count/);
assert.match(fs.readFileSync(path.join(root,'components/visualizer/VocalSyncInspectorV373.tsx'),'utf8'),/avatarVocalMouthSmoothnessV374/);
assert.match(fs.readFileSync(path.join(root,'components/visualizer/VocalSyncInspectorV373.tsx'),'utf8'),/previewDancersV374/);
assert.match(fs.readFileSync(path.join(root,'components/visualizer/VisualizerStage.tsx'),'utf8'),/qualityEnabledV374:preferences.avatarVocalQualityEnabledV374/);
assert.match(fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8'),/V374 · Vocal Performance Quality Engine/);
const pkg=require('../package.json');assert.ok(Number(pkg.version.match(/v(\d+)$/)?.[1])>=374, "version newer than v374");assert.match(pkg.scripts['verify:offline'],/test:v374/);
console.log('PASS V374: coarticulation, closure, calm rap, singer-agnostic lead/backing, call response, multi-avatar, pause, word/line/none, reduced motion, settings, inspector');
