const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Module=require('node:module');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cache=new Map();
function load(rel){
 const full=path.resolve(root,rel.endsWith('.ts')?rel:rel+'.ts');
 if(cache.has(full))return cache.get(full).exports;
 const code=fs.readFileSync(full,'utf8');
 const transpiled=ts.transpileModule(code,{fileName:full,reportDiagnostics:true,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(transpiled.diagnostics?.filter(d=>d.category===ts.DiagnosticCategory.Error).length??0,0,rel);
 const mod=new Module(full,module);mod.filename=full;mod.paths=Module._nodeModulePaths(path.dirname(full));cache.set(full,mod);
 const localRequire=mod.require.bind(mod);
 mod.require=id=>id.startsWith('./')?load(path.relative(root,path.resolve(path.dirname(full),id))):localRequire(id);
 mod._compile(transpiled.outputText,full);return mod.exports;
}
const {resolveVocalPerformanceQualityV374}=load('components/visualizer/vocalPerformanceQualityV374');
const {VOCAL_TIMING_DEMO_V373}=load('components/visualizer/vocalSyncDiagnosticsV373');
const lyrics=VOCAL_TIMING_DEMO_V373;
const opt={style:'rap',genre:'Deutschrap',lipStrength:100,mouthSmoothnessV374:65,qualityEnabledV374:true,
  naturalArticulationEnabledV384:true,articulationStrengthV384:85,lipSealV384:95,jawStabilityV384:80};
const run=(ms,extra={})=>resolveVocalPerformanceQualityV374(lyrics,ms,true,{...opt,...extra});
const baseline=ms=>run(ms,{naturalArticulationEnabledV384:false});
const starts=run(724),old=baseline(724);
assert.equal(starts.confidence,'word');
assert.equal(starts.articulationV384.active,true);
assert.equal(starts.articulationV384.bilabial,'initial');
assert.ok(starts.face.lipsClosed>=old.face.lipsClosed,'B lips closure reinforced');
assert.ok(starts.face.jaw<=1-starts.face.lipsClosed*.985+1e-9,'jaw must not force lips apart');
const last=run(1079);
assert.equal(last.articulationV384.bilabial,'final','word-final M closure');
assert.ok(last.face.lipsClosed>baseline(1079).face.lipsClosed);
const fastLyrics={...lyrics,lines:[{startMs:0,endMs:1550,text:'Mein Beat pumpt mega',words:[
 {text:'Mein',startMs:100,endMs:340},{text:'Beat',startMs:360,endMs:610},
 {text:'pumpt',startMs:630,endMs:875},{text:'mega',startMs:900,endMs:1150}]}]};
const pClosure=resolveVocalPerformanceQualityV374(fastLyrics,655,true,opt);
assert.equal(pClosure.articulationV384.bilabial,'initial','P starts with bilabial closure');
const pBaseline=resolveVocalPerformanceQualityV374(fastLyrics,655,true,{...opt,naturalArticulationEnabledV384:false});
assert.ok(pClosure.face.lipsClosed>=pBaseline.face.lipsClosed);
const beat=resolveVocalPerformanceQualityV374(fastLyrics,400,true,opt);
const oldBeat=resolveVocalPerformanceQualityV374(fastLyrics,400,true,{...opt,naturalArticulationEnabledV384:false});
assert.equal(beat.articulationV384.rapid,true);
assert.ok(beat.articulationV384.jawDamping>0,'rap jaw stability');
assert.ok(beat.face.jaw<=oldBeat.face.jaw,'stabilized jaw opening');
for(const ms of [701,780,1121,1555,1685,2310,2400,2800,4810,5650,6430]){
 const pose=run(ms).face;
 for(const key of ['jaw','wide','round','lipsClosed','smile','brow','blink','cheek','squint']){
  assert.ok(Number.isFinite(pose[key])&&pose[key]>=0&&pose[key]<=1,`${ms} ${key} bounded`);
 }
 assert.ok(pose.jaw+pose.lipsClosed*.985<=1+1e-9,'no jaw/closure conflict');
}
// Inactive data never invents articulation and yields precisely the old facial pose.
for(const ms of [3500,7600,8000]){
 const next=run(ms);
 assert.equal(next.articulationV384.active,false);
 assert.deepEqual(next.face,baseline(ms).face);
}
const line=run(8040);assert.equal(line.confidence,'line');assert.equal(line.articulationV384.active,false);
for(const [playing,options] of [[false,{}],[true,{reducedMotion:true}],[true,{qualityEnabledV374:false}],[true,{naturalArticulationEnabledV384:false}],[true,{articulationStrengthV384:0}]]){
 const got=resolveVocalPerformanceQualityV374(lyrics,724,playing,{...opt,...options});
 assert.equal(got.articulationV384.active,false);
}
for(const strength of [0,20,60,100]){
 const item=run(720,{lipSealV384:strength});assert.ok(item.articulationV384.closure>=0&&item.articulationV384.closure<=1);
}
assert.equal(run(724,{lipSealV384:0}).face.lipsClosed,baseline(724).face.lipsClosed,"zero lip-seal strength leaves legacy closure intact");
const seekA=run(1540),seekB=run(725),seekC=run(1540);
assert.deepEqual(seekA,seekC,'seek-safe, no mutable clock');assert.notDeepEqual(seekA.face,seekB.face);
assert.equal(run(724,{qualityEnabledV374:false}).face.lipsClosed,baseline(724).face.lipsClosed);
const opts=['naturalArticulationEnabledV384','articulationStrengthV384','lipSealV384','jawStabilityV384'];
for(const f of ['components/visualizer/ThreeAvatar.tsx','components/visualizer/VocalRigV368.tsx','components/visualizer/VisualizerStage.tsx','components/visualizer/registry.tsx','components/visualizer/VocalSyncInspectorV373.tsx']){
 const src=read(f);for(const key of opts)assert.ok(src.includes(key),`${f}: ${key}`);
}
for(const key of ['avatarNaturalArticulationEnabledV384','avatarArticulationStrengthV384','avatarLipSealV384','avatarJawStabilityV384']){
 assert.ok(read('types/music.ts').includes(key));assert.ok(read('context/UiPreferencesContext.tsx').includes(key));assert.ok(read('components/SettingsPanel.tsx').includes(key));
}
const rig=read('components/visualizer/VocalRigV368.tsx');
assert.ok(rig.includes('current.current.jaw=Math.min(current.current.jaw'),'protect jaw during frame smoothing');
assert.ok(read('components/visualizer/VocalSyncInspectorV373.tsx').includes('v384-articulation-diagnostic'));
const pkg=JSON.parse(read('package.json'));
assert.ok(Number(String(pkg.version).match(/^0\.1\.0-v(\d+)$/)?.[1])>=384);assert.ok(pkg.scripts['verify:offline'].includes('test:v384'));
assert.ok(read('README.md').includes('V384-NATURAL-VOCAL-ARTICULATION.md'));
console.log('PASS V384 natural articulation: B/P/M closure, rap jaw stabilization, vowel continuity, fallback, reduced motion, deterministic seek, V383 profile compatibility and settings');
