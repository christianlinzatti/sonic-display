'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('./typescript-loader.cjs');
const filename=path.join(root,'services/monitoring/concertBenchmarkV777.ts');
const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length??0,0);
const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));mod._compile(compiled.outputText,filename);
const {CONCERT_CASES_V777:cases,V777_REFERENCE_GLB,syntheticConcertCueV777:cue,normalizeGlbPathV777:pathOk,summarizeConcertCaseV777:summary,compareConcertReportsV777:compare}=mod.exports;
assert.equal(cases.length,6);assert.equal(new Set(cases.map(x=>x.id)).size,6);
for(const n of [2,4])assert.equal(cases.filter(c=>c.avatarCount===n).length,3);
assert.equal(pathOk('/models/avatar.glb'),'/models/avatar.glb');
for(const v of ['http://evil.com/avatar.glb','//example.com/x.glb','/../s.glb','/a/%2e%2e/b.glb','/a%2Fhidden.glb','/x\\z.glb','/x.glb?a=1','/x.gltf','x.glb',null])assert.throws(()=>pathOk(v),/GLB/);
assert.equal(cue(0).beat,true);assert.equal(cue(1).beat,false);assert.equal(cue(26).beat,true);assert(cue(5).vocal>=0&&cue(5).vocal<=1);
assert.deepEqual(cue(104),cue(104));assert.equal(cue(5000).beat,5000%26===0);
const sample=(ms=16,calls=30)=>({ms,calls,triangles:2000,geometries:55,textures:12,programs:8,contextLost:false});
const frames=Array.from({length:100},(_,i)=>sample(i<95?16:40));
const r=summary(cases[0],frames);assert.equal(r.frames,100);assert.equal(r.p95Ms,16);assert(r.fps>50&&r.fps<65);
assert.equal(summary(cases[1],[...Array(30)].map((_,i)=>sample(16,i%2?10:20))).avgCalls,15);
for(const x of [[],Array(29).fill(sample()),Array(60).fill(sample(0)),Array(60).fill(sample(16,-1)),Array(60).fill(sample(16,0)),Array(60).fill({...sample(),contextLost:true})])assert.throws(()=>summary(cases[0],x),/Renderframes|Draw Calls/);
const asset={urls:[V777_REFERENCE_GLB],hashes:['abcdef'],bytes:[12345],animations:1,skinnedMeshes:1,mouthMorphs:1,mode:'reference'};
const report=(label,add=0)=>({format:'sonic-concert-benchmark-v777',version:1,label,measuredAt:'2026-10-31',
 environment:{userAgent:'Chromium V777',renderer:'GPU X',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false},
 config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',stages:['cyberpunk','rock','galaxy'],counts:[2,4],passes:2,warmupFrames:60,sampleFrames:180,
    audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
 assets:structuredClone(asset),scenes:cases.map(c=>({...r,...c,fps:r.fps+add,avgCalls:r.avgCalls-add,frames:358}))});
const before=report('V776'),after=report('V777',-1);const diff=compare(before,after);
assert.equal(diff.status,'comparable');assert.equal(diff.rows.length,6);
assert.equal(diff.rows[0].callsPct, +(1/30*100).toFixed(1));
for(const [key,v] of [['renderer','new GPU'],['viewport','1920x1080'],['userAgent','new browser'],['dpr',2],['antialias',true],['softwareRenderer',true]]){
 const x=structuredClone(after);x.environment[key]=v;assert.equal(compare(before,x).status,'incompatible',key);
}
for(const [key,v] of [['passes',3],['fixtureId','other'],['warmupFrames',40],['counts',[2]],['audioMode','microphone'],['lyricsMode','actual']]){
 const x=structuredClone(after);x.config[key]=v;assert.equal(compare(before,x).status,'incompatible',key);
}
for(const [key,v] of [['hashes',['different']],['bytes',[100]],['animations',0],['skinnedMeshes',0],['mouthMorphs',0],['mode','user-glb']]){
 const x=structuredClone(after);x.assets[key]=v;assert.equal(compare(before,x).status,'incompatible',key);
}
const differentPath=structuredClone(after);differentPath.assets.urls=['/elsewhere/same-exact.glb'];assert.equal(compare(before,differentPath).status,'comparable','content hashes, not filenames');
const missing=structuredClone(after);missing.scenes.pop();assert.equal(compare(before,missing).status,'incompatible');
const frameLost=structuredClone(after);frameLost.scenes[0].frames--;assert.equal(compare(before,frameLost).status,'incompatible');
const doubled=structuredClone(after);doubled.scenes[1]={...doubled.scenes[0]};assert.equal(compare(before,doubled).status,'incompatible');
// Validate the actual shipped binary glTF: skinned geometry, clips, face morph, correct buffers.
const binary=fs.readFileSync(path.join(root,'public/benchmark/v777-reference-performer.glb'));
assert.equal(binary.toString('ascii',0,4),'glTF');assert.equal(binary.readUInt32LE(4),2);assert.equal(binary.readUInt32LE(8),binary.length);
assert.equal(binary.toString('ascii',16,20),'JSON');
const gltf=JSON.parse(binary.toString('utf8',20,20+binary.readUInt32LE(12)).trim());
assert.equal(gltf.asset.version,'2.0');assert(gltf.skins[0].joints.length>=3);
assert(gltf.animations[0].channels.length>=3);assert(gltf.meshes[0].primitives[0].attributes.JOINTS_0!==undefined);
assert(gltf.meshes[1].primitives[0].targets?.length>0);assert(gltf.meshes[1].extras.targetNames.includes('mouthOpen'));
assert.equal(binary.readUInt32LE(20+binary.readUInt32LE(12)),gltf.buffers[0].byteLength);
const scene=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const s of ['useGLTF(url)','cloneSkinnedScene(scene)','new AnimationMixer(clone)','morphTargetInfluences','disposeClonedAvatarSkeletonsV654','<DanceFX','<StageEnvironment','<DynamicStage','<Text','syntheticConcertCueV777','assetChecksV777','SHA-256','CONCERT_CASES_V777','dpr={1}','shadows={false}','onReady','GlbErrorBoundaryV777'])assert(scene.includes(s),s);
assert(scene.includes('960 × 540')&&scene.includes("get('concertBenchV777')==='1'"));
assert(!scene.includes('new WebGLRenderer')&&!scene.includes('setInterval('));
const runner=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');
assert(runner.includes('Runtime.evaluate')&&runner.includes('localUrl(root)')&&runner.includes('window.__sonicV777.run('));
assert(runner.includes('result.scenes?.length!==6')&&runner.includes('record.status=\'blocked\''));
const cli=fs.readFileSync(path.join(root,'scripts/v777-compare-concerts.cjs'),'utf8');assert(cli.includes('compareConcertReportsV777')&&cli.includes("result.status!=='comparable'"));
const installer=require('../scripts/v777-install-concert-harness.cjs'),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v777-install-'));
try{fs.writeFileSync(path.join(tmp,'package.json'),JSON.stringify({name:'sonic-display',version:'0.1.0-v776'}));
 fs.mkdirSync(path.join(tmp,'components/visualizer'),{recursive:true});fs.writeFileSync(path.join(tmp,'components/visualizer/original.ts'),'original');
 assert.equal(installer.install(tmp).length,5);assert.equal(fs.readFileSync(path.join(tmp,'components/visualizer/original.ts'),'utf8'),'original');
 assert.throws(()=>installer.install(tmp),/existiert bereits/);
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:77[6-9]|7[89]\d|[89]\d\d|\d{4,})$/);
for(const name of ['check:fast','build:preflight'])assert(pkg.scripts[name].includes('npm run test:v777 && npm run test:v777:types &&'));
console.log('PASS V777: 6 concert cases, GLB binary/skinning/morphs, synthetic stimulus, strict hashes, real browser/CDP, safe backport, cleanup and release wiring');
