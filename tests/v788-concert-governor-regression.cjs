'use strict';
/** Real source policy checks, paired fail-closed data review, local CLI, browser wiring. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),Module=require('node:module');
const ts=require('./typescript-loader.cjs'),root=path.resolve(__dirname,'..');
function load(rel){const file=path.join(root,rel),b=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(b.outputText,file);return m.exports}
const {createConcertGovernorV788,GOVERNOR_BUDGETS_V788}=load('services/monitoring/concertQualityGovernorV788.ts');
assert.equal(GOVERNOR_BUDGETS_V788.length,3);
for(const v of GOVERNOR_BUDGETS_V788){assert.deepEqual(v.protected,{avatarAnimation:true,lipSync:true,lyrics:true,camera:true,leadPerformer:true})}
assert.equal(GOVERNOR_BUDGETS_V788[0].danceFx.trails,true);
assert.equal(GOVERNOR_BUDGETS_V788[1].danceFx.trails,false);
assert.equal(GOVERNOR_BUDGETS_V788[2].danceFx.enabled,false);
for(const input of [[61,'on'],[45,'maybe'],[0,'off']])assert.throws(()=>createConcertGovernorV788(...input));
const low=createConcertGovernorV788(45,'on'),disabled=createConcertGovernorV788(45,'off');
for(let i=0;i<240;i++){const t=i<160?32:7;low.step(t);disabled.step(t)}
assert(low.snapshot('rock-4glb',0,4).transitions.some(t=>t.to===1));
assert(low.snapshot('rock-4glb',0,4).transitions.some(t=>t.to===2));
assert.deepEqual(disabled.snapshot('rock-4glb',0,4).levelFrames,[240,0,0]);
assert.equal(disabled.snapshot('rock-4glb',0,4).transitions.length,0);
const recovering=createConcertGovernorV788(45,'on');for(let i=0;i<240;i++)recovering.step(32);for(let i=0;i<300;i++)recovering.step(8);
assert(recovering.snapshot('cyberpunk-2glb',0,2).transitions.some(t=>t.reason==='sustained-recovery'));
const neutral=createConcertGovernorV788(45,'on');for(let i=0;i<240;i++)neutral.step(1000/45);assert.equal(neutral.level,0,'hysteresis should prevent unnecessary switches');
const broken=createConcertGovernorV788(45,'on');broken.step(NaN);broken.step(0);assert.equal(broken.snapshot('x',0,2).invalidFrames,2);
const {reviewConcertGovernorV788,GOVERNOR_ORDER_V788}=load('services/monitoring/concertGovernorReviewV788.ts');
const ids=[2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatars}glb`,stage,avatars})));
function fixture(){return GOVERNOR_ORDER_V788.map(mode=>{
 const env={userAgent:'Chrome real GPU',renderer:'NVIDIA / Hardware WebGL',viewport:'960x540',dpr:1,antialias:false,softwareRenderer:false},hashes=['a'.repeat(64)];
 return {status:'ok',browser:{hidden:false,canvasCount:1},report:{format:'sonic-concert-benchmark-v777',version:1,environment:structuredClone(env),
 config:{fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',profileV779:'cinematic',interpolationV782:'on',lipGuardV783:'on',cameraV784:'on',lyricsV785:'on',governorV788:mode,targetV788:45,
 stages:['cyberpunk','rock','galaxy'],counts:[2,4],passes:2,warmupFrames:60,sampleFrames:240,audioMode:'deterministic-synthetic-beat-v1',lyricsMode:'synthetic-3d-text-v1',lipMode:'named-morph-v1'},
 assets:{hashes,bytes:[38000],animations:1,skinnedMeshes:1,mouthMorphs:1,mode:'user-glb'},
 scenes:ids.map(({id,stage,avatars})=>({id,stage,avatarCount:avatars,frames:478,fps:mode==='on'?46:40,p95Ms:mode==='on'?21:26,avgCalls:30,avgTriangles:10000,maxGeometries:10,maxTextures:10,maxPrograms:5}))},
 governorV788:{format:'sonic-concert-governor-v788',version:1,mode,target:45,environment:structuredClone(env),assets:{hashes:[...hashes],mode:'user-glb'},
 config:{passes:2,warmupFrames:60,sampleFrames:240,profile:'cinematic',protect:'avatar-mouth-lyrics-camera-v1',windowFrames:24},
 scenes:[0,1].flatMap(pass=>ids.map(({id,avatars})=>({id,pass,avatars,frames:240,finalLevel:mode==='on'?1:0,
  levelFrames:mode==='on'?[48,192,0]:[240,0,0],transitions:mode==='on'?[{frame:48,from:0,to:1,reason:'frame-budget-exceeded',windowP95Ms:26}]:[],invalidFrames:0,windowCount:10})))}}
})}
const good=fixture(),report=reviewConcertGovernorV788(good,45);
assert.equal(report.status,'ready',report.issues.join(' | '));assert.equal(report.rows.length,6);
assert(report.rows.every(r=>r.fpsOn>r.fpsOff&&r.switches===4&&r.levelOneFrames===768));
for(const mutate of [a=>a.pop(),a=>a[0].status='blocked',a=>a[1].browser.hidden=true,a=>a[0].report.environment.softwareRenderer=true,
 a=>a[3].report.environment.renderer='Other GPU',a=>a[1].report.assets.hashes=['b'.repeat(64)],
 a=>a[1].governorV788.assets.hashes=['c'.repeat(64)],a=>a[0].report.config.targetV788=60,a=>a[1].report.config.profileV779='economy',
 a=>a[0].report.scenes.pop(),a=>a[2].governorV788.scenes.pop(),a=>a[0].report.scenes[0].p95Ms=NaN,
 a=>a[1].governorV788.scenes[0].levelFrames=[300,0,0],a=>a[1].governorV788.scenes[0].transitions[0].to=2,
 a=>a[1].governorV788.scenes[0].invalidFrames=1,a=>a[0].governorV788.scenes[0].transitions=[{frame:30,from:0,to:1,reason:'frame-budget-exceeded',windowP95Ms:30}]]){
 const bad=structuredClone(good);mutate(bad);assert.equal(reviewConcertGovernorV788(bad,45).status,'blocked',String(mutate))}
assert.equal(reviewConcertGovernorV788([],45).status,'blocked');
const cli=require('../scripts/v788-concert-quality-governor.cjs');assert(cli.localUrl('http://localhost:3000'));
for(const url of ['http://evil.example','file:///etc/passwd','http://127.0.0.1.evil.test'])assert(!cli.localUrl(url));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v788-'));
try{const input=path.join(dir,'runs.json'),output=path.join(dir,'review.json');fs.writeFileSync(input,JSON.stringify({runs:good}));
 let res=cp.spawnSync(process.execPath,[path.join(root,'scripts/v788-concert-quality-governor.cjs'),'--assess-only',`--input=${input}`,`--out=${output}`,`--target=45`],{encoding:'utf8'});
 assert.equal(res.status,0,res.stderr);assert.equal(JSON.parse(fs.readFileSync(output)).status,'ready');assert(fs.readFileSync(output.replace('.json','.md'),'utf8').includes('Draw Calls'));
 fs.writeFileSync(input,JSON.stringify({runs:good.slice(0,1)}));res=cp.spawnSync(process.execPath,[path.join(root,'scripts/v788-concert-quality-governor.cjs'),'--assess-only',`--input=${input}`,`--out=${output}`],{encoding:'utf8'});
 assert.equal(res.status,2,res.stderr);assert.equal(JSON.parse(fs.readFileSync(output)).status,'blocked');
 }finally{fs.rmSync(dir,{recursive:true,force:true})}
const fixtureSource=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const tok of ['ConcertGovernorProbeV788','createConcertGovernorV788','collector.current.governorEnabledV788','governorScenesV788','window.__sonicV788','effectiveStageV788.stageStrength','settings={effectiveStageV788.danceFx}','animationStride={profile.animationStride}','lipGuardV783={lipGuardV783}','modeV785={lyricsModeV785 as LyricsModeV785|null}'])assert(fixtureSource.includes(tok),tok);
const browser=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');
assert(browser.includes("u.searchParams.set('governorV788',governorV788)"));assert(browser.includes('record.governorV788=governor'));
assert(fs.readFileSync(path.join(root,'app/diagnostics/concert-governor/page.tsx'),'utf8').includes('ConcertGovernorReviewV788'));
const pkg=require('../package.json');assert(/^0\.1\.0-v(?:788|789|79\d|[8-9]\d\d)$/.test(pkg.version));for(const k of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[k].includes('npm run test:v788 && npm run test:v788:types &&'),k);
console.log('PASS V788: real-frame hysteresis/cooldown, protected performers/lyrics/lip-sync, strict GPU/GLB pairing, CLI/dashboard/bridge and release gates');
