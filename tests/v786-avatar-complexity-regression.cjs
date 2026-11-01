'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const Module=require('node:module'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const {parseGlbV786,profileGlbV786,matchConcertBenchmarkV786}=require('../services/monitoring/avatarComplexityV786.cjs');
function loadTs(file){const f=path.join(root,file);const compiled=ts.transpileModule(fs.readFileSync(f,'utf8'),{fileName:f,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});const mod=new Module(f,module);mod.filename=f;mod.paths=Module._nodeModulePaths(path.dirname(f));mod._compile(compiled.outputText,f);return mod.exports;}
const {summarizeAvatarGeometryV786}=loadTs('services/monitoring/avatarComplexitySummaryV786.ts');
const real=fs.readFileSync(path.join(root,'public/benchmark/v777-reference-performer.glb'));
const profile=profileGlbV786(real,'v777-reference-performer.glb');
assert.equal(profile.format,'sonic-avatar-complexity-v786');
assert.equal(profile.sourceBytes,real.length);
assert.equal(profile.scene.triangles,1106,'reference GLB geometry is real, not guessed');
assert.equal(profile.scene.estimatedMeshDrawCalls,2);
assert(profile.scene.usedSkinJoints>=3);assert(profile.morph.mouthCandidates.includes('mouthOpen'));
assert.equal(profile.animations.clips,1);assert.equal(profile.animations.channels,3);
assert.equal(profile.hotspots.reduce((s,x)=>s+x.sceneTriangles,0),profile.scene.triangles);
assert.equal(profile.sha256.length,64);
const quad=summarizeAvatarGeometryV786(profile,4);assert.equal(quad.theoreticalTriangles,4424);
assert.equal(quad.unbatchedPrimitiveDrawUpper,8);assert.equal(quad.sharedTextureScenarioBytes,0);
assert.throws(()=>summarizeAvatarGeometryV786(profile,3));assert.throws(()=>summarizeAvatarGeometryV786({...profile,scene:{...profile.scene,triangles:Infinity}},4));
assert.throws(()=>summarizeAvatarGeometryV786({...profile,scene:{...profile.scene,triangles:Number.MAX_SAFE_INTEGER}},4));
const makeGlb=(gltf,binary=Buffer.alloc(0))=>{const json=Buffer.from(JSON.stringify(gltf));const padded=Buffer.concat([json,Buffer.alloc((4-json.length%4)%4,0x20)]);const paddedBin=Buffer.concat([binary,Buffer.alloc((4-binary.length%4)%4)]);
 const out=Buffer.alloc(12+8+padded.length+(binary.length?8+paddedBin.length:0));out.writeUInt32LE(0x46546c67);out.writeUInt32LE(2,4);out.writeUInt32LE(out.length,8);
 out.writeUInt32LE(padded.length,12);out.writeUInt32LE(0x4e4f534a,16);padded.copy(out,20);
 if(binary.length){const at=20+padded.length;out.writeUInt32LE(paddedBin.length,at);out.writeUInt32LE(0x004e4942,at+4);paddedBin.copy(out,at+8);}return out;};
const png=Buffer.alloc(33);Buffer.from([137,80,78,71,13,10,26,10]).copy(png);png.writeUInt32BE(13,8);png.write('IHDR',12);png.writeUInt32BE(256,16);png.writeUInt32BE(128,20);
const base={asset:{version:'2.0'},scene:0,scenes:[{nodes:[0,1]}],nodes:[{mesh:0},{mesh:0}],meshes:[{name:'Doubled',primitives:[{mode:4,attributes:{POSITION:0},indices:1,material:0}]}],accessors:[{count:4,type:'VEC3'},{count:6,type:'SCALAR'}],
 materials:[{pbrMetallicRoughness:{baseColorTexture:{index:0}}}],textures:[{source:0}],images:[{mimeType:'image/png',bufferView:0}],bufferViews:[{buffer:0,byteLength:png.length}],buffers:[{byteLength:png.length}]};
const doubled=profileGlbV786(makeGlb(base,png),'dup.glb');
assert.equal(doubled.scene.triangles,4,'two nodes reference same mesh, four triangles total');
assert.equal(doubled.scene.vertexReferences,8);assert.equal(doubled.scene.estimatedMeshDrawCalls,2);
assert.equal(doubled.resources.usedImageCount,1);assert.equal(doubled.resources.unknownTextureEstimates,0);
assert.equal(doubled.textures[0].width,256);assert.equal(doubled.textures[0].height,128);
assert.equal(doubled.resources.estimatedRgba8MipBytes,Math.round(256*128*4*4/3));
assert.equal(summarizeAvatarGeometryV786(doubled,4).sharedTextureScenarioBytes,doubled.resources.estimatedRgba8MipBytes);
const fan=structuredClone(base);fan.meshes[0].primitives[0].mode=6;assert.equal(profileGlbV786(makeGlb(fan,png)).scene.triangles,8,'fan = 6 indices -> 4 triangles x2');
for(const edit of [v=>{v.nodes[0].children=[1];v.nodes[1].children=[0]},v=>{v.meshes[0].primitives[0].indices=99},v=>{v.scenes[0].nodes=[99]},
 v=>{v.scenes=[]},v=>{v.accessors[1].count=7},v=>{v.nodes[0].skin=0},v=>{v.buffers[0].byteLength=9999}]){
 const v=structuredClone(base);edit(v);assert.throws(()=>profileGlbV786(makeGlb(v,png)),String(edit));}
for(const mutate of [v=>v.writeUInt32LE(42,0),v=>v.writeUInt32LE(77,8),v=>v.writeUInt32LE(999999,12),v=>v.writeUInt32LE(0,16),v=>v.writeUInt32LE(3,4)]){
 const broken=Buffer.from(makeGlb(base,png));mutate(broken);assert.throws(()=>parseGlbV786(broken));}
const concert={format:'sonic-concert-benchmark-v777',version:1,environment:{renderer:'Real GPU / WebGL',softwareRenderer:false},
 config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1'},assets:{hashes:[profile.sha256]},
 scenes:['cyberpunk','rock','galaxy'].flatMap(stage=>[2,4].map(n=>({id:`${stage}-${n}glb`,frames:240,fps:45,p95Ms:23,avgCalls:40,avgTriangles:25000})))};
assert.equal(matchConcertBenchmarkV786([profile],concert).status,'measured');
for(const mutate of [r=>r.assets.hashes=['a'.repeat(64)],r=>r.environment.softwareRenderer=true,r=>r.scenes.pop(),r=>r.scenes[0].fps=0,
 r=>r.scenes[0].avgTriangles=-1,r=>r.scenes[1].id=r.scenes[0].id,r=>r.config.fixtureId='modified']){
 const broken=structuredClone(concert);mutate(broken);assert.equal(matchConcertBenchmarkV786([profile],broken).status,'blocked',String(mutate));}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v786-'));
try {const input=path.join(dir,'reference.glb'),benchmark=path.join(dir,'benchmark.json'),out=path.join(dir,'summary.json');fs.writeFileSync(input,real);fs.writeFileSync(benchmark,JSON.stringify(concert));
 let result=cp.spawnSync(process.execPath,[path.join(root,'scripts/v786-avatar-complexity.cjs'),`--glb=${input}`,`--benchmark=${benchmark}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);const payload=JSON.parse(fs.readFileSync(out));assert.equal(payload.avatars[0].scene.triangles,1106);assert.equal(payload.benchmark.status,'measured');
 assert(fs.readFileSync(out.replace('.json','.md'),'utf8').includes('Dreiecke'));
 const bad=structuredClone(concert);bad.assets.hashes=['c'.repeat(64)];fs.writeFileSync(benchmark,JSON.stringify(bad));
 result=cp.spawnSync(process.execPath,[path.join(root,'scripts/v786-avatar-complexity.cjs'),`--glb=${input}`,`--benchmark=${benchmark}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(result.status,2,'mismatching benchmark should explicitly fail its CLI exit status');assert.equal(JSON.parse(fs.readFileSync(out)).benchmark.status,'blocked');
 result=cp.spawnSync(process.execPath,[path.join(root,'scripts/v786-avatar-complexity.cjs'),`--glb=${path.join(dir,'missing.glb')}`],{encoding:'utf8'});assert.equal(result.status,1);
}finally{fs.rmSync(dir,{recursive:true,force:true})}
const page=fs.readFileSync(path.join(root,'components/visualizer/AvatarComplexityReviewV786.tsx'),'utf8');
for(const term of ['accept=".json,application/json"','summarizeAvatarGeometryV786','mouthCandidates','measured','Schaetzung','GLB-Statistik'].slice(0,4))assert(page.includes(term),term);
const pkg=require('../package.json');assert(/^0\.1\.0-v(?:786|78[7-9]|79\d|[8-9]\d\d)$/.test(pkg.version));
for(const k of ['check:fast','build:preflight','check:release'])assert(pkg.scripts[k].includes('npm run test:v786 && npm run test:v786:types &&'),k);
assert(pkg.scripts['benchmark:v786:avatar'].includes('v786-avatar-complexity.cjs'));
console.log('PASS V786: real skinned GLB, geometry instancing, images, malformed GLB, hash-matched GPU evidence, fail-closed CLI, dashboard and pipelines');
