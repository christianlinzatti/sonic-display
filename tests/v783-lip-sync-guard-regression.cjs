'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),cp=require('node:child_process'),os=require('node:os');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const file=path.join(root,rel),trans=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,
 compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
 assert.equal(trans.diagnostics?.length??0,0,rel);const mod=new Module(file,module);mod.filename=file;mod.paths=Module._nodeModulePaths(path.dirname(file));mod._compile(trans.outputText,file);return mod.exports;}
const {createLipSyncGuardV783:create}=load('services/monitoring/lipSyncQualityGuardV783.ts');
const guard=create();let values=[];
for(let i=0;i<170;i++){
 const target=i%15<6?.95:i%15<10?.1:0;
 const v=guard.sample(i,target);assert(Number.isFinite(v)&&v>=0&&v<=1);
 if(values.length)assert(Math.abs(v-values.at(-1))<=.28001,'bounded maximum jaw motion per frame');
 values.push(v);assert.equal(guard.sample(i,0),v,'repeated RAF logical frame must be idempotent');
}
assert(guard.stats().frames===170&&guard.stats().inputTransitions>10&&guard.stats().clampedSteps>0);
assert(guard.stats().maxJump<=.2801);
const last=guard.value();assert.equal(guard.sample(170,Number.NaN),last,'invalid input must freeze safely');
assert.equal(guard.stats().invalidInputs,1);
assert.throws(()=>guard.sample(-1,0));assert.throws(()=>guard.sample(2.5,0));
guard.sample(2,.9);assert.equal(guard.stats().frames,1,'time rollback resets the filter');
guard.reset();assert.equal(guard.value(),0);assert.equal(guard.stats().frames,0);
const silent=create();for(let f=0;f<100;f++)assert.equal(silent.sample(f,0),0,'quiet vocal stays closed');
const skipped=create();skipped.sample(0,0);const step=skipped.sample(3,1);assert(step>0&&step<=.84001,'bounded recovery from skipped frames');
const {reviewLipSyncGuardV783:review,V783_ORDER}=load('services/monitoring/lipSyncGuardReviewV783.ts');
function records(){const env={userAgent:'Real Test Browser',renderer:'Hardware GPU',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false};
 return V783_ORDER.map(([profile,mode])=>({status:'ok',profileV779:profile,
  report:{format:'sonic-concert-benchmark-v777',version:1,environment:{...env},
   config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',profileV779:profile,interpolationV782:'on',lipGuardV783:mode,passes:2,warmupFrames:60,sampleFrames:120,
    stages:['cyberpunk','rock','galaxy'],counts:[2,4],audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
   assets:{hashes:['a'.repeat(64)],bytes:[38000],animations:1,skinnedMeshes:1,mouthMorphs:1,mode:'user-glb'},
   scenes:[2,4].flatMap(avatarCount=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatarCount}glb`,stage,avatarCount,
    frames:238,fps:60,p95Ms:16.5,avgCalls:30,avgTriangles:100,maxGeometries:10,maxTextures:10,maxPrograms:1})))},
  motionV781:{format:'sonic-motion-smoothness-v781',version:1,profile,environment:{...env},assets:{hashes:['a'.repeat(64)],mode:'user-glb'},
   config:{passes:2,warmupFrames:60,sampleFrames:120,cue:'deterministic-synthetic-beat-v1',sampling:'post-mixer-world-bones-v1',frameRateHint:60},
   scenes:[0,1].flatMap(pass=>[2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatars}glb`,pass,profile,avatars,
    frames:120,samples:avatars*120,poseHoldPct:12,p95PoseJerkDeg:1,mouthHoldPct:mode==='on'?9:39,
    vocalErrorMean:mode==='on'?.10:.26,p95FrameMs:16.5,p95FrameDeltaMs:1,feetTracked:0,footContactSamples:0,footSlipEvents:null,notes:[]}))))}}));}
const good=records(),assessed=review(good);assert.equal(assessed.status,'ready',JSON.stringify(assessed.issues));assert.equal(assessed.rows.length,12);
assert(assessed.rows.every(r=>r.mouthHoldsOn<r.mouthHoldsOff&&r.warnings.length===0));
for(const mutation of [a=>a.pop(),a=>a[0].status='blocked',a=>a[0].report.config.lipGuardV783='on',
 a=>a[1].report.config.interpolationV782='off',a=>a[1].report.assets.hashes=['b'.repeat(64)],
 a=>a[2].report.environment.renderer='different GPU',a=>a[3].report.environment.softwareRenderer=true,
 a=>a[4].motionV781.scenes.pop(),a=>a[1].motionV781.environment.renderer='different GPU',
 a=>a[5].motionV781.scenes[1]={...a[5].motionV781.scenes[0]},a=>a[6].report.scenes.pop(),
 a=>a[0].report.scenes[1]={...a[0].report.scenes[0]},a=>a[2].motionV781.scenes[0].mouthHoldPct=NaN,
 a=>a[0].report.assets.mouthMorphs=0,a=>a[0].report.scenes[0].fps=0]){
 const broken=structuredClone(good);mutation(broken);assert.equal(review(broken).status,'blocked',String(mutation));
}
const cli=require('../scripts/v783-lip-sync-guard.cjs');assert(cli.localUrl('http://127.0.0.1:3000'));
for(const url of ['http://evil.test','http://127.0.0.1.evil.test','file:///etc/passwd'])assert(!cli.localUrl(url));
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v783-'));
try{
 const input=path.join(tmp,'runs.json'),out=path.join(tmp,'report.json');fs.writeFileSync(input,JSON.stringify({runs:good}));
 const result=cp.spawnSync(process.execPath,[path.join(root,'scripts/v783-lip-sync-guard.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).rows.length,12);
 assert(fs.readFileSync(out.replace('.json','.md'),'utf8').includes('Mund-Holds'));
 fs.writeFileSync(input,JSON.stringify({runs:good.slice(0,1)}));
 const invalid=cp.spawnSync(process.execPath,[path.join(root,'scripts/v783-lip-sync-guard.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(invalid.status,2,invalid.stderr);assert.equal(JSON.parse(fs.readFileSync(out)).status,'blocked');
}finally{fs.rmSync(tmp,{force:true,recursive:true})}
const fixture=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const token of ['createLipSyncGuardV783','lipGuardStateV783.sample(clock.current.frame,cue)','poseInterpolatorV782?.sample(clock.current.frame)','lipGuardV783={lipGuardV783}','lipGuardV783:lipModeV783','lipGuardStateV783.reset()'])assert(fixture.includes(token),token);
const browser=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');assert(browser.includes("u.searchParams.set('lipGuardV783',lipGuardV783)"));
const report=fs.readFileSync(path.join(root,'services/monitoring/concertBenchmarkV777.ts'),'utf8');assert(report.includes("'interpolationV782','lipGuardV783','cameraV784'")&&report.includes("'stages'"));
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:783|78[4-9]|79\d|[89]\d\d|\d{4,})$/);
for(const key of ['check:fast','build:preflight','check:release'])assert(pkg.scripts[key].includes('npm run test:v783 && npm run test:v783:types &&'));
console.log('PASS V783: per-frame bounded lip guards, fast attack/release, invalid cues, scene resets, paired real GLB/hardware fail-closed evidence, CLI and mode isolation');
