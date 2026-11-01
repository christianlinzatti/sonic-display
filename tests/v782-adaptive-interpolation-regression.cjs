'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),cp=require('node:child_process'),os=require('node:os');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
function load(rel){const p=path.join(root,rel),res=ts.transpileModule(fs.readFileSync(p,'utf8'),{fileName:p,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(res.diagnostics?.length??0,0,rel);const m=new Module(p,module);m.filename=p;m.paths=Module._nodeModulePaths(path.dirname(p));m._compile(res.outputText,p);return m.exports;}
const {createPoseInterpolationV782:create}=load('services/monitoring/adaptiveAnimationInterpolationV782.ts');
const v=(n=0)=>({x:n,y:0,z:0,set(x,y,z){this.x=x;this.y=y;this.z=z;}}),q=()=>({x:0,y:0,z:0,w:1,set(x,y,z,w){this.x=x;this.y=y;this.z=z;this.w=w;}});
function node(){return {position:v(),quaternion:q(),scale:v(1),morphTargetInfluences:[0,0]};}
const obj=node(),calls=[];
const runner=create([obj],t=>{calls.push(t);obj.position.set(t*60,0,0);obj.scale.set(1+t,1,1);
 obj.quaternion.set(0,0,Math.sin(t*Math.PI/2),Math.cos(t*Math.PI/2));obj.morphTargetInfluences=[t*10,t*20];},3);
for(let f=0;f<=120;f++){
 runner.sample(f);
 assert(Math.abs(obj.position.x-f)<1e-5,`position interpolates at frame ${f}`);
 assert(Math.abs(obj.morphTargetInfluences[0]-f/6)<1e-5,`morph interpolates at frame ${f}`);
 assert(Math.abs(Math.hypot(obj.quaternion.x,obj.quaternion.y,obj.quaternion.z,obj.quaternion.w)-1)<1e-5);
}
assert(runner.stats().mixerSamples<60,'Mixer samples should be less than display frames');
assert.equal(runner.stats().appliedFrames,121);
runner.sample(1);assert(Math.abs(obj.position.x-1)<1e-5,'restarts after frame reset');
runner.sample(120);assert(Math.abs(obj.position.x-120)<1e-5,'supports skipped frames');
runner.reset();runner.sample(0);assert.equal(obj.position.x,0);
assert.throws(()=>create([],()=>{},2));assert.throws(()=>create([node()],()=>{},1));assert.throws(()=>runner.sample(-1));
// Opposite quaternion signs are the same rotation. The shortest arc must be used.
const opposite=node();let qt=0;const short=create([opposite],t=>{qt++;opposite.quaternion.set(0,0,0,t===0?1:-1)},2);
short.sample(1);assert(Math.abs(opposite.quaternion.w)>0.99);assert.equal(qt,2);
// Every two or three frames: real mixer samples, every frame: interpolated update.
for(const stride of [2,3]){const n=node(),calls=[];const interp=create([n],t=>{calls.push(t);n.position.set(t*60,0,0)},stride);
 for(let frame=0;frame<120;frame++)interp.sample(frame);
 assert.equal(interp.stats().appliedFrames,120);assert(interp.stats().mixerSamples<=Math.ceil(120/stride)+2);
 assert(Math.abs(n.position.x-119)<1e-4);}
const {V782_ORDER,reviewInterpolationV782:review}=load('services/monitoring/interpolationReviewV782.ts');
function sampleRuns(){const env={userAgent:'Test Browser',renderer:'Hardware GPU',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false};
 return V782_ORDER.map(([profile,mode])=>({status:'ok',profileV779:profile,
 report:{format:'sonic-concert-benchmark-v777',version:1,environment:{...env},
  config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',profileV779:profile,interpolationV782:mode,passes:2,warmupFrames:60,sampleFrames:120,
   stages:['cyberpunk','rock','galaxy'],counts:[2,4],audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
  assets:{hashes:['a'.repeat(64)],bytes:[38000],animations:1,skinnedMeshes:1,mouthMorphs:1,mode:'user-glb'},
  scenes:[2,4].flatMap(avatarCount=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatarCount}glb`,stage,avatarCount,
   frames:238,fps:60,p95Ms:16.5,avgCalls:30,avgTriangles:100,maxGeometries:10,maxTextures:10,maxPrograms:1})))},
 motionV781:{format:'sonic-motion-smoothness-v781',version:1,profile,environment:{...env},assets:{hashes:['a'.repeat(64)],mode:'user-glb'},
  config:{passes:2,warmupFrames:60,sampleFrames:120,cue:'deterministic-synthetic-beat-v1',sampling:'post-mixer-world-bones-v1',frameRateHint:60},
  scenes:[0,1].flatMap(pass=>[2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatars}glb`,pass,profile,avatars,
   frames:120,samples:avatars*120,poseHoldPct:mode==='on'?12:56,p95PoseJerkDeg:mode==='on'?1:4,mouthHoldPct:mode==='on'?10:48,
   vocalErrorMean:mode==='on'?.10:.26,p95FrameMs:16.5,p95FrameDeltaMs:1,feetTracked:0,footContactSamples:0,footSlipEvents:null,notes:[]}))))}}));}
const records=sampleRuns(),result=review(records);
assert.equal(result.status,'ready',JSON.stringify(result.issues));assert.equal(result.rows.length,12);
assert(result.rows.every(x=>x.poseHoldOn<x.poseHoldOff&&x.mouthHoldOn<x.mouthHoldOff));
for(const mutate of [r=>r.pop(),r=>r[0].report.config.interpolationV782='on',r=>r[1].report.assets.hashes=['b'.repeat(64)],
 r=>r[2].report.environment.renderer='Other GPU',r=>r[3].report.environment.softwareRenderer=true,
 r=>r[0].motionV781.scenes.pop(),r=>r[1].motionV781.environment.renderer='Other GPU',
 r=>r[4].motionV781.scenes[1]={...r[4].motionV781.scenes[0]},r=>r[6].report.scenes.pop()]){
 const broken=structuredClone(records);mutate(broken);if(review(broken).status!=='blocked')console.error('NOT BLOCKED',mutate.toString());assert.equal(review(broken).status,'blocked','invalid evidence must fail closed');}
const cli=require('../scripts/v782-animation-interpolation.cjs');assert(cli.localUrl('http://127.0.0.1:3000'));
for(const u of ['http://evil.test','http://127.0.0.1.evil.test','file:///etc/passwd'])assert(!cli.localUrl(u));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v782-'));
try{const src=path.join(tmp,'runs.json'),out=path.join(tmp,'result.json');fs.writeFileSync(src,JSON.stringify({runs:records}));
 const res=cp.spawnSync(process.execPath,[path.join(root,'scripts/v782-animation-interpolation.cjs'),'--assess-only',`--input=${src}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(res.status,0,res.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).rows.length,12);
 assert(fs.readFileSync(out.replace('.json','.md'),'utf8').includes('Pose-Holds'));
 fs.writeFileSync(src,JSON.stringify({runs:records.slice(0,1)}));
 const blocked=cp.spawnSync(process.execPath,[path.join(root,'scripts/v782-animation-interpolation.cjs'),'--assess-only',`--input=${src}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(blocked.status,2);assert.equal(JSON.parse(fs.readFileSync(out)).status,'blocked');
}finally{fs.rmSync(tmp,{recursive:true,force:true})}
const fixture=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const tok of ['createPoseInterpolationV782','poseInterpolatorV782.sample(clock.current.frame)','interpolationModeV782','mouthBlendV782.current[i]=next','mixer.update(animationStride/60)','motionSamplesV781','interpolationV782={interpolationV782}'])assert(fixture.includes(tok),tok);
const browser=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');assert(browser.includes("u.searchParams.set('interpolationV782',interpolationV782)"));
const model=fs.readFileSync(path.join(root,'services/monitoring/concertBenchmarkV777.ts'),'utf8');assert(model.includes("'interpolationV782','lipGuardV783','cameraV784'"));assert(model.includes("'lyricsV785'"));
const legacy=fs.readFileSync(path.join(root,'services/monitoring/motionSmoothnessV781.ts'),'utf8');assert(legacy.includes('performance.config?.interpolationV782!==undefined'));
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:782|78[3-9]|79\d|[89]\d\d|\d{4,})$/);
for(const key of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[key].includes('npm run test:v782 && npm run test:v782:types &&'),key);
console.log('PASS V782: GLB transforms and morphs interpolated with bounded mixer sampling, resets, quaternion shortest path, fail-closed paired real-browser evidence, CLI and legacy isolation');
