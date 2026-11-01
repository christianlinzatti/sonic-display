'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const file=path.join(root,rel),tr=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,
 compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});assert.equal(tr.diagnostics?.length??0,0,rel);
 const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(tr.outputText,file);return mod.exports;}
const {cameraTargetV784,createCameraControllerV784,summarizeCameraSceneV784}=load('services/monitoring/cameraSmoothnessV784.ts');
for(const frame of [0,41,42,85,86,128,129,173,174,214,215,239,240,481])for(const avatars of [2,4]){
 const v=cameraTargetV784(frame,avatars);assert(v.position.length===3&&v.target.length===3&&v.fov>20&&v.shot);
}
assert.equal(cameraTargetV784(0,2).shot,'wide');assert.equal(cameraTargetV784(42,2).shot,'lead-close');
assert.equal(cameraTargetV784(86,2).shot,'answer-close');assert.equal(cameraTargetV784(174,2).shot,'lyrics-wide');
for(const invalid of [-1,1.5,NaN])assert.throws(()=>cameraTargetV784(invalid,2));
const off=createCameraControllerV784('off'),on=createCameraControllerV784('on');
let smooth=[];for(let f=0;f<240;f++){
 const raw=off.sample(f,4),soft=on.sample(f,4);
 smooth.push([raw,soft]);assert(soft.position.every(Number.isFinite)&&soft.target.every(Number.isFinite));
 assert.equal(on.sample(f,4),soft,'same-frame sample must be idempotent');
}
const dist=(a,b)=>Math.hypot(...a.map((x,i)=>x-b[i]));
assert(dist(smooth[42][0].position,smooth[41][0].position)>1,'raw cinematic cut is significant');
assert(dist(smooth[42][1].position,smooth[41][1].position)<dist(smooth[42][0].position,smooth[41][0].position),'smoothing must reduce jump');
assert(dist(smooth[80][1].position,smooth[80][0].position)<.5,'camera must converge after cut');
on.reset();assert.deepEqual(on.sample(0,4).position,off.sample(0,4).position,'scene reset restores initial pose');
assert.deepEqual(on.sample(30,2).position,cameraTargetV784(30,2).position,'avatar-count change resets');
function sample(frame){return {frame,shot:cameraTargetV784(frame,4).shot,position:[frame<42?0:2,0,8],quaternion:frame<42?[0,0,0,1]:[0,.2,0,Math.sqrt(.96)],
 fov:45,lyricNdc:[0,.2],visiblePerformers:4};}
const shots=Array.from({length:240},(_,i)=>sample(i));const metrics=summarizeCameraSceneV784('cyberpunk-4glb',0,4,shots);
assert(metrics.hardCuts>0&&metrics.frames===240&&metrics.lyricOutOfSafePct===0&&metrics.p95PositionJerk>=0);
for(const mutate of [a=>a.splice(0,180),a=>a[5].frame=8,a=>a[10].lyricNdc=[NaN,0],a=>a[10].visiblePerformers=5,
 a=>a[10].quaternion=[0,0,0,Infinity]]){const invalid=structuredClone(shots);mutate(invalid);assert.throws(()=>summarizeCameraSceneV784('cyberpunk-4glb',0,4,invalid));}
const {reviewCameraRunsV784,CAMERA_ORDER_V784}=load('services/monitoring/cameraReviewV784.ts');
function records(){const env={userAgent:'Chrome hardware',renderer:'Example Hardware GPU',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false};
 return CAMERA_ORDER_V784.map(mode=>({status:'ok',report:{format:'sonic-concert-benchmark-v777',version:1,environment:{...env},
  config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',profileV779:'balanced',cameraV784:mode,passes:2,warmupFrames:60,sampleFrames:240,
   stages:['cyberpunk','rock','galaxy'],counts:[2,4],audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
  assets:{hashes:['a'.repeat(64)],bytes:[38000],animations:1,skinnedMeshes:1,mouthMorphs:1,mode:'user-glb'},
  scenes:[2,4].flatMap(avatarCount=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatarCount}glb`,stage,avatarCount,
   frames:478,fps:57,p95Ms:18,avgCalls:30,avgTriangles:100,maxGeometries:10,maxTextures:10,maxPrograms:1})))},
 cameraV784:{format:'sonic-camera-smoothness-v784',version:1,mode,environment:{...env},assets:{hashes:['a'.repeat(64)],mode:'user-glb'},
  config:{passes:2,sampleFrames:240,warmupFrames:60,timeline:'scripted-shots-240f-v784',sampling:'post-camera-projection-v784'},
  scenes:[0,1].flatMap(pass=>[2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatars}glb`,pass,avatars,
   frames:240,p95PositionStep:mode==='on'?.1:2,p95RotationStepDeg:mode==='on'?.3:9,p95PositionJerk:mode==='on'?.01:1,
   p95RotationJerkDeg:mode==='on'?.02:5,hardCuts:mode==='on'?0:4,lyricOutOfSafePct:mode==='on'?0:1,minVisiblePerformers:1,notes:[]}))))}}));}
const good=records(),res=reviewCameraRunsV784(good);
assert.equal(res.status,'ready',JSON.stringify(res.issues));assert.equal(res.rows.length,6);
assert(res.rows.every(r=>r.hardCutsOn<r.hardCutsOff&&r.p95RotationJerkOn<r.p95RotationJerkOff));
for(const mutate of [a=>a.pop(),a=>a[1].status='blocked',a=>a[2].report.config.cameraV784='off',
 a=>a[0].cameraV784.mode='on',a=>a[1].report.environment.renderer='Other GPU',a=>a[1].cameraV784.environment.renderer='Other GPU',
 a=>a[0].report.environment.softwareRenderer=true,a=>a[0].cameraV784.scenes.pop(),a=>a[0].cameraV784.scenes[1]={...a[0].cameraV784.scenes[0]},
 a=>a[0].report.scenes.pop(),a=>a[0].report.assets.hashes=['b'.repeat(64)],a=>a[0].report.scenes[0].fps=0,
 a=>a[3].cameraV784.scenes[2].hardCuts=NaN,a=>a[3].report.config.sampleFrames=180]){
 const bad=structuredClone(good);mutate(bad);assert.equal(reviewCameraRunsV784(bad).status,'blocked',String(mutate));}
const cli=require('../scripts/v784-camera-smoothness.cjs');assert(cli.localUrl('http://127.0.0.1:3000'));
for(const u of ['http://evil.test','http://127.0.0.1.evil.test','file:///etc/passwd'])assert(!cli.localUrl(u));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v784-'));
try{const input=path.join(tmp,'runs.json'),out=path.join(tmp,'result.json');fs.writeFileSync(input,JSON.stringify({runs:good}));
 const test=cp.spawnSync(process.execPath,[path.join(root,'scripts/v784-camera-smoothness.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(test.status,0,test.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).rows.length,6);
 assert(fs.readFileSync(out.replace('.json','.md'),'utf8').includes('Harte Schnitte'));
 fs.writeFileSync(input,JSON.stringify({runs:good.slice(0,1)}));const bad=cp.spawnSync(process.execPath,[path.join(root,'scripts/v784-camera-smoothness.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(bad.status,2,bad.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).status,'blocked');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
const fixture=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const token of ['CameraDirectorBenchmarkV784','controller.sample(clock.current.frame,avatars)','lyricNdc,visiblePerformers:visible','cameraSamplesV784','lastCameraReportV784','window.__sonicV784','cameraModeV784'])assert(fixture.includes(token),token);
const browser=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');
assert(browser.includes("u.searchParams.set('cameraV784',cameraV784)")&&browser.includes('record.cameraV784=camera'));
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:784|78[5-9]|79\d|[89]\d\d|\d{4,})$/);
for(const k of ['check:fast','build:preflight','check:release'])assert(pkg.scripts[k].includes('npm run test:v784 && npm run test:v784:types &&'),k);
console.log('PASS V784: scripted shots, smoothed position/aim/fov, projection evidence, 6-case camera reports, strict paired GPU/GLB validation and CLI');
