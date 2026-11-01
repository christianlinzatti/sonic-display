'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module'),os=require('node:os'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),ts=require('./typescript-loader.cjs');
const filename=path.join(root,'services/monitoring/concertQualityProfilesV779.ts');
const compiled=ts.transpileModule(fs.readFileSync(filename,'utf8'),{fileName:filename,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(compiled.diagnostics?.length??0,0);
const m=new Module(filename,module);m.filename=filename;m.paths=Module._nodeModulePaths(path.dirname(filename));m._compile(compiled.outputText,filename);
const {QUALITY_PROFILE_IDS_V779:ids,QUALITY_PROFILES_V779:p,resolveConcertProfileV779:resolve,plannedProfileOrderV779:order,assessProfileSweepV779:assess}=m.exports;
assert.deepEqual(ids,['cinematic','balanced','economy']);
assert.equal(resolve(null),'cinematic');assert.equal(resolve('balanced'),'balanced');
for(const id of ['malicious','Cinematic','../evil',1])assert.throws(()=>resolve(id));
assert(p.cinematic.danceFx.trails&&p.cinematic.danceFx.footprints);
assert(p.economy.stageReducedMotion&&!p.economy.danceFx.enabled);
assert(p.cinematic.animationStride<p.balanced.animationStride&&p.balanced.animationStride<p.economy.animationStride);
assert.deepEqual(order(2),['cinematic','balanced','economy','economy','balanced','cinematic']);
assert.equal(order(3).length,9);for(const n of [0,1,7,2.5])assert.throws(()=>order(n));
const SCENES=['cyberpunk','rock','galaxy'];const COUNTS=[2,4];
const report=(profile='cinematic',num=0)=>({format:'sonic-concert-benchmark-v777',version:1,label:`V779-${profile}`,measuredAt:'2026-10-31T01:00:00.000Z',
 environment:{userAgent:'Chromium',renderer:'GPU Test',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false},
 config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',profileV779:profile,stages:SCENES,counts:COUNTS,passes:2,warmupFrames:60,sampleFrames:180,audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
 assets:{urls:['/benchmark/real.glb'],hashes:['a'.repeat(64)],bytes:[1500000],animations:5,skinnedMeshes:3,mouthMorphs:2,mode:'user-glb'},
 scenes:COUNTS.flatMap(avatars=>SCENES.map(stage=>({id:`${stage}-${avatars}glb`,stage,avatarCount:avatars,
 frames:358,fps:profile==='cinematic'?(avatars===4?35:55):(profile==='balanced'?(avatars===4?47:61):60),
 p95Ms:profile==='cinematic'?(avatars===4?28:18):(profile==='balanced'?(avatars===4?21:16):15),
 avgCalls:profile==='cinematic'?130:profile==='balanced'?110:95,avgTriangles:100000,
 maxGeometries:30,maxTextures:8,maxPrograms:7})))
});
const runs=order(2).map((profile,i)=>({status:'ok',profileV779:profile,browser:{hidden:false,canvasCount:1},report:report(profile,i)}));
const ready=assess(runs,45,4);
assert.equal(ready.status,'ready');assert.equal(ready.recommendedProfile,'balanced','balanced is highest-fidelity passing four avatars at 45 fps');
assert.equal(ready.twoAvatarAlternative,'cinematic');assert.equal(ready.rows.length,18);
assert.equal(ready.assetsMode,'user-glb');assert.equal(ready.rows.find(r=>r.profile==='cinematic'&&r.avatars===4).passed,false);
assert.equal(assess(runs,60,2).recommendedProfile,'balanced');
assert.equal(assess(runs,30,4).recommendedProfile,'cinematic');
assert.equal(assess(runs,60,4).recommendedProfile,'economy');
const checkBlocked=(alter,label)=>{const x=structuredClone(runs);alter(x);const r=assess(x,45,4);assert.equal(r.status,'blocked',label);assert.equal(r.recommendedProfile,null,label);assert.equal(r.rows.length,0,label)};
checkBlocked(x=>x.pop(),'missing round');
checkBlocked(x=>x[0].status='blocked','blocked browser');
checkBlocked(x=>x[0].profileV779='economy','wrong order');
checkBlocked(x=>x[0].report.config.profileV779='balanced','profile spoofing');
checkBlocked(x=>x[0].report.scenes.pop(),'missing scene');
checkBlocked(x=>x[0].report.scenes[0].fps=NaN,'nonfinite FPS');
checkBlocked(x=>x[0].report.scenes[0].p95Ms=-2,'invalid P95');
checkBlocked(x=>x[0].report.scenes[0].avgCalls=0,'no calls');
checkBlocked(x=>x[2].report.assets.hashes=['b'.repeat(64)],'changed asset');
checkBlocked(x=>x[1].report.environment.renderer='different GPU','changed renderer');
checkBlocked(x=>x[1].report.environment.viewport='1920x1080','changed viewport');
checkBlocked(x=>x[1].report.config.sampleFrames=90,'different frames');
checkBlocked(x=>x[0].report.environment.softwareRenderer=true,'software GPU');
checkBlocked(x=>x[0].browser.hidden=true,'hidden browser');
checkBlocked(x=>x[0].browser.canvasCount=2,'extra canvases');
checkBlocked(x=>x[0].report.assets.mode='wrong','invalid rig mode');
const noisy=structuredClone(runs);noisy[5].report.scenes[0].p95Ms*=1.4;
const noise=assess(noisy,45,4);assert.equal(noise.status,'ready');
assert(noise.rows.some(r=>r.unstable));assert.equal(noise.rows.find(r=>r.profile==='cinematic'&&r.avatars===2&&r.stage==='cyberpunk').passed,false);
const ref=structuredClone(runs);for(const r of ref)r.report.assets.mode='reference';
assert.equal(assess(ref,45,4).assetsMode,'reference');assert(assess(ref,45,4).notes.join(' ').includes('Hardware-Kaufentscheidung'));
for(const scenario of [[],[runs[0]],{}])assert.equal(assess(scenario,45,4).status,'blocked');
assert.equal(assess(runs,12,4).status,'blocked');
const bench=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const needle of ['profileV779','resolveConcertProfileV779','QUALITY_PROFILES_V779','governorModeV788!==null?governorBudgetV788:profile','effectiveStageV788.stageStrength','effectiveStageV788.stageReactive','settings={effectiveStageV788.danceFx}','animationStride={profile.animationStride}','mixer.update(animationStride/60)','profile:()=>refProfile.current'])assert(bench.includes(needle),needle);
assert(fs.readFileSync(path.join(root,'app/diagnostics/concert-profiles/page.tsx'),'utf8').includes('ConcertQualityProfilesV779'));
assert(fs.readFileSync(path.join(root,'components/visualizer/ConcertQualityProfilesV779.tsx'),'utf8').includes('assessProfileSweepV779'));
assert(!bench.includes('new WebGLRenderer')&&!bench.includes('setInterval('));
const runner=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');
assert(runner.includes("u.searchParams.set('profileV779',qualityProfile)"));assert(runner.includes('applied!==qualityProfile'));assert(runner.includes('record.profileV779=qualityProfile'));
const cli=require('../scripts/v779-quality-sweep.cjs');assert(cli.localUrl('http://127.0.0.1:3000'));
for(const u of ['http://evil.example','file:///etc/passwd','http://127.0.0.1.attacker.net','http://user@localhost'])assert(!cli.localUrl(u),u);
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v779-reg-'));
try{
 const input=path.join(dir,'runs.json'),out=path.join(dir,'quality-sweep.json');fs.writeFileSync(input,JSON.stringify(runs));
 const cliRun=cp.spawnSync(process.execPath,[path.join(root,'scripts/v779-quality-sweep.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`,'--target=45','--avatars=4'],{encoding:'utf8'});
 assert.equal(cliRun.status,0,cliRun.stderr);
 const result=JSON.parse(fs.readFileSync(out,'utf8'));assert.equal(result.recommendedProfile,'balanced');assert.match(fs.readFileSync(out.replace(/\.json$/,'')+'.md','utf8'),/Balanced|balanced/);
 fs.writeFileSync(input,JSON.stringify({runs:[{status:'blocked',profileV779:'cinematic'}]}));
 const cliBlocked=cp.spawnSync(process.execPath,[path.join(root,'scripts/v779-quality-sweep.cjs'),'--assess-only',`--input=${input}`,`--out=${out}`],{encoding:'utf8'});
 assert.equal(cliBlocked.status,2);assert.equal(JSON.parse(fs.readFileSync(out,'utf8')).status,'blocked');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
const pkg=require('../package.json');assert(/^0\.1\.0-v(?:779|7[8-9]\d|[89]\d\d|\d{4,})$/.test(pkg.version),'V779+ version');
for(const key of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[key].includes('npm run test:v779 && npm run test:v779:types &&'),key);
console.log('PASS V779: real quality profiles, reversed profile sequence, strict complete browser evidence, reproducible settings, 2/4 GLB recommendation, instability, local CLI & package checks');
