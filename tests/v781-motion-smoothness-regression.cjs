'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),os=require('node:os'),cp=require('node:child_process'),Module=require('node:module');
const root=path.resolve(__dirname,'..'),ts=require('./typescript-loader.cjs');
const file=path.join(root,'services/monitoring/motionSmoothnessV781.ts');
const js=ts.transpileModule(fs.readFileSync(file,'utf8'),{fileName:file,reportDiagnostics:true,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS}});
assert.equal(js.diagnostics?.length??0,0);
const m=new Module(file,module);m.filename=file;m.paths=Module._nodeModulePaths(path.dirname(file));m._compile(js.outputText,file);
const {summarizeMotionSceneV781:summarize,reviewMotionRunsV781:review}=m.exports;
const q=a=>[0,0,Math.sin(a/2),Math.cos(a/2)];
function samples(stride=1,withFeet=true,count=2){return Array.from({length:120},(_,frame)=>Array.from({length:count},(_,slot)=>{
 const aligned=Math.floor(frame/stride)*stride;const vocal=Math.abs(Math.sin(frame*.4))*.8;
 return {frame,slot,hip:q(Math.sin(aligned*.13)*.22),upper:q(Math.sin(aligned*.15)*.19),mouth:Math.abs(Math.sin(aligned*.4))*.7,vocal,
  leftFoot:withFeet?[slot,0,Math.sin(frame*.1)*.002]:null,rightFoot:withFeet?[slot+.3,0,.0]:null};})).flat()}
const times=Array(120).fill(16.2),sum=summarize('rock-2glb',0,'cinematic',2,samples(),times);
assert.equal(sum.frames,120);assert.equal(sum.samples,240);assert.equal(sum.feetTracked,4);assert(sum.footContactSamples>=20);
assert.equal(sum.footSlipEvents,0);assert(sum.poseHoldPct<30,'cinematic poses should change');
const bal=summarize('rock-2glb',0,'balanced',2,samples(2),times);
const eco=summarize('rock-2glb',0,'economy',2,samples(3),times);
assert(bal.poseHoldPct>sum.poseHoldPct);assert(eco.poseHoldPct>bal.poseHoldPct);
assert(eco.mouthHoldPct>sum.mouthHoldPct);
const missingFeet=summarize('rock-4glb',0,'cinematic',4,samples(1,false,4),times);
assert.equal(missingFeet.footSlipEvents,null);assert.equal(missingFeet.feetTracked,0);
assert(missingFeet.notes.some(s=>s.includes('nicht auswertbar')));
const sliding=samples();for(const s of sliding){if(s.frame%2===1)s.leftFoot[0]+=.1}
assert(summarize('rock-2glb',0,'cinematic',2,sliding,times).footSlipEvents>0);
for(const bad of [[],samples().slice(0,50),samples().map(s=>({...s,mouth:NaN})),samples().map(s=>({...s,hip:[1,1,1,1]}))])assert.throws(()=>summarize('rock-2glb',0,'cinematic',2,bad,times));
const dup=samples();dup[0].frame=1;assert.throws(()=>summarize('rock-2glb',0,'cinematic',2,dup,times),/Doppelte/);
const order=['cinematic','balanced','economy','economy','balanced','cinematic'];
function records(){return order.map(profile=>({status:'ok',profileV779:profile,motionV781:{format:'sonic-motion-smoothness-v781',version:1,profile,
 environment:{userAgent:'Chromium Test',renderer:'Physical GPU',viewport:'960x540',dpr:1,softwareRenderer:false},
 assets:{hashes:['a'.repeat(64)],mode:'user-glb'},config:{passes:2,sampleFrames:120,warmupFrames:60,cue:'deterministic-synthetic-beat-v1',sampling:'post-mixer-world-bones-v1',frameRateHint:60},
 scenes:[0,1].flatMap(pass=>[2,4].flatMap(avatars=>['cyberpunk','rock','galaxy'].map(stage=>
   summarize(`${stage}-${avatars}glb`,pass,profile,avatars,samples(profile==='cinematic'?1:profile==='balanced'?2:3,false,avatars),times))))},
 report:{format:'sonic-concert-benchmark-v777',version:1,
  environment:{userAgent:'Chromium Test',renderer:'Physical GPU',viewport:'960x540',dpr:1,softwareRenderer:false,antialias:false},
  assets:{hashes:['a'.repeat(64)],mode:'user-glb'},
  config:{profileV779:profile,fixtureId:'v777-stages-glb-dance-lips-lyrics-fx-v1',passes:2,sampleFrames:120,warmupFrames:60},
  scenes:[2,4].flatMap(avatarCount=>['cyberpunk','rock','galaxy'].map(stage=>({id:`${stage}-${avatarCount}glb`,fps:55,frames:238,avgCalls:30})))}
 }));}
let runs=records(),r=review(runs);assert.equal(r.status,'ready',r.issues.join(';'));assert.equal(r.rows.length,18);
assert(r.rows.every(x=>x.footSlipEvents===null));assert(r.rows.some(x=>x.warnings.some(w=>w.includes('nicht verfügbar'))));
for(const mutate of [x=>x.pop(),x=>x[0].motionV781.scenes.pop(),x=>x[1].motionV781.assets.hashes[0]='other',
 x=>x[1].motionV781.environment.renderer='Other GPU',x=>x[0].motionV781.environment.softwareRenderer=true,
 x=>x[4].profileV779='cinematic',x=>x[3].report.scenes.pop(),x=>x[3].report.assets.hashes=['b'.repeat(64)],x=>x[2].motionV781.scenes[1]={...x[2].motionV781.scenes[0]}]){
 const clone=structuredClone(runs);mutate(clone);assert.equal(review(clone).status,'blocked','tampered report must block');}
const cli=require('../scripts/v781-motion-smoothness.cjs');assert(cli.localUrl('http://127.0.0.1:3000'));
for(const u of ['http://evil.test','http://127.0.0.1.evil.test','file:///etc/passwd','http://a@localhost'])assert(!cli.localUrl(u));
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v781-test-'));
try{
 const input=path.join(dir,'runs.json'),output=path.join(dir,'review.json');fs.writeFileSync(input,JSON.stringify({runs}));
 const ok=cp.spawnSync(process.execPath,[path.join(root,'scripts/v781-motion-smoothness.cjs'),'--assess-only',`--input=${input}`,`--out=${output}`],{encoding:'utf8'});
 assert.equal(ok.status,0,ok.stderr);assert.equal(JSON.parse(fs.readFileSync(output)).rows.length,18);
 assert(fs.readFileSync(path.join(dir,'review.md'),'utf8').includes('Mund-Holds'));
 fs.writeFileSync(input,JSON.stringify({runs:[{status:'blocked'}]}));const blocked=cp.spawnSync(process.execPath,[path.join(root,'scripts/v781-motion-smoothness.cjs'),'--assess-only',`--input=${input}`,`--out=${output}`],{encoding:'utf8'});
 assert.equal(blocked.status,2);assert.equal(JSON.parse(fs.readFileSync(output)).status,'blocked');
}finally{fs.rmSync(dir,{recursive:true,force:true})}
const fixture=fs.readFileSync(path.join(root,'components/visualizer/ConcertBenchmarkV777.tsx'),'utf8');
for(const token of ['motionEnabledV781','motionSessionV781','motionSamplesV781','mixer.setTime(clock.current.frame/60)','__sonicV781','getWorldQuaternion','getWorldPosition','summarizeMotionSceneV781','motionModeV781','mixer.update(animationStride/60)'])assert(fixture.includes(token),token);
const browser=fs.readFileSync(path.join(root,'scripts/v777-concert-benchmark-browser.cjs'),'utf8');
for(const token of ['--motionV781','motionV781','window.__sonicV781?.report()','record.motionV781=motion'])assert(browser.includes(token),token);
const page=fs.readFileSync(path.join(root,'app/diagnostics/motion-smoothness/page.tsx'),'utf8');assert(page.includes('MotionSmoothnessReviewV781'));
const pkg=require('../package.json');assert.match(pkg.version,/^0\.1\.0-v(?:78\d|79\d|[89]\d\d|\d{4,})$/);
for(const name of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[name].includes('npm run test:v781 && npm run test:v781:types &&'),name);
console.log('PASS V781: real post-mixer bone/morph measurements, cadence, frame pacing, optional foot-contact evidence, fail-closed six-profile cross-check, CLI, diagnostics');
