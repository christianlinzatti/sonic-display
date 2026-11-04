'use strict';
/** V960 deterministic concert continuity + system safety tests, no browser/hardware needed. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=pathName=>fs.readFileSync(path.join(root,pathName),'utf8');
function loadTypescript(file,imports={}){
 const compiled=ts.transpileModule(read(file),{fileName:file,reportDiagnostics:true,
  compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 assert.equal(compiled.diagnostics.length,0,`${file} syntax diagnostics`);
 const m={exports:{}};
 vm.runInNewContext(compiled.outputText,{module:m,exports:m.exports,require(name){
  if(imports[name])return imports[name];
  throw Error(`Unexpected runtime import ${name}`);
 }},{filename:file,timeout:10000});
 return m.exports;
}
const v958=loadTypescript('lib/ultimateConcertRoadmapV958.ts');
const v=loadTypescript('lib/concertContinuityV960.ts',{'@/lib/ultimateConcertRoadmapV958':v958});
const options={...v958.DEFAULT_CONCERT_V958,enabled:true,hardwareSync:true,virtualFx:true,
 transitionsV960:true,compactFxV960:true,strength:60};
const input={trackId:'spotify:verified',progressMs:25000,durationMs:140000,
 phase:'hook',sectionIndex:2,sectionStartMs:24000,verified:true,genre:'Deutschrap',
 energy:.7,bass:.5,lyricsVisible:false,reducedMotion:false};
const prior=v958.composeConcertSceneV958({...input,phase:'verse',sectionIndex:1,
 progressMs:13000,sectionStartMs:9000},options);
const now=v958.composeConcertSceneV958(input,options);
const analysis={schema:'sonic-track-analysis-v318',trackId:input.trackId,durationMs:input.durationMs,
 tempo:90,timeSignature:4,beats:[],bars:[],importedAt:0,source:'test',
 sections:[{label:'verse',startMs:0,durationMs:9000,confidence:.95},
 {label:'verse',startMs:9000,durationMs:15000,confidence:.91},
 {label:'hook',startMs:24000,durationMs:16000,confidence:.94},
 {label:'drop',startMs:40000,durationMs:12000,confidence:.98}]};
const json=x=>JSON.parse(JSON.stringify(x));
let count=0;
function test(label,fn){try{fn();count++;console.log('PASS V960 '+label);}catch(error){console.error('FAIL V960 '+label);throw error;}}
const apply=(patch={},prev=prior,nowScene=now,opts=options,policy={})=>v.applyConcertContinuityV960(nowScene,prev,
  patch.elapsedMs===undefined?1000:patch.elapsedMs,opts,policy);
const priorWith=v.previousVerifiedConcertSceneV960({analysis,trackId:input.trackId,sectionIndex:2,
 durationMs:input.durationMs,genre:input.genre,energy:input.energy,bass:input.bass,
 lyricsVisible:false,reducedMotion:false,settings:options});

test('V960 settings stay disabled for existing users',()=>{
 const saved=v958.normalizeConcertRoadmapV958({enabled:true,virtualFx:true});
 assert.equal(saved.transitionsV960,false);assert.equal(saved.compactFxV960,false);
});
test('V960 opt-in values survive V958 local normalization',()=>{
 const saved=v958.normalizeConcertRoadmapV958(options);
 assert.equal(saved.transitionsV960,true);assert.equal(saved.compactFxV960,true);
});
test('V960 preserves exact V958 schema and storage key',()=>{
 assert.equal(v958.DEFAULT_CONCERT_V958.schema,'ultimate-concert-v958');
 assert.equal(v958.CONCERT_ROADMAP_KEY_V958,'sonic-display:ultimate-concert-v958');
});
test('V960 disabled returns same scene object',()=>assert.equal(apply({},prior,now,{...options,enabled:false}).scene,now));
test('V960 transition opt-out returns same scene if compact off',()=>assert.equal(apply({},prior,now,{...options,transitionsV960:false,compactFxV960:false}).scene,now));
test('V960 no previous verified section keeps camera if only transition is enabled',()=>{
 const result=apply({},null,now,{...options,compactFxV960:false});
 assert.equal(result.active,false);assert.equal(result.scene,now);
});
test('V960 real verified V318 predecessor can be reconstructed',()=>{
 assert.ok(priorWith);assert.equal(priorWith.verified,true);assert.equal(priorWith.phase,'verse');
});
test('V960 wrong track never claims previous section',()=>{
 const previous=v.previousVerifiedConcertSceneV960({analysis,trackId:'other',sectionIndex:2,
  durationMs:140000,genre:'rap',energy:.6,bass:.4,lyricsVisible:false,reducedMotion:false,settings:options});
 assert.equal(previous,null);
});
test('V960 first section has no preceding scene',()=>{
 const args={analysis,trackId:input.trackId,durationMs:140000,genre:'rap',energy:.5,bass:.3,lyricsVisible:false,reducedMotion:false,settings:options};
 assert.equal(v.previousVerifiedConcertSceneV960({...args,sectionIndex:0}),null);
});
test('V960 missing/unlabeled real sections do not create imaginary transition',()=>{
 const a=json(analysis);delete a.sections[1].label;
 const p=v.previousVerifiedConcertSceneV960({analysis:a,trackId:input.trackId,sectionIndex:2,durationMs:140000,
  genre:'rap',energy:.5,bass:.3,lyricsVisible:false,reducedMotion:false,settings:options});assert.equal(p,null);
});
test('V960 low-confidence real source is rejected',()=>{
 const a=json(analysis);a.sections[1].confidence=.49;
 const p=v.previousVerifiedConcertSceneV960({analysis:a,trackId:input.trackId,sectionIndex:2,durationMs:140000,
  genre:'rap',energy:.5,bass:.3,lyricsVisible:false,reducedMotion:false,settings:options});assert.equal(p,null);
});
test('V960 low-confidence current source is rejected',()=>{
 const a=json(analysis);a.sections[2].confidence=.1;
 const p=v.previousVerifiedConcertSceneV960({analysis:a,trackId:input.trackId,sectionIndex:2,durationMs:140000,
  genre:'rap',energy:.5,bass:.3,lyricsVisible:false,reducedMotion:false,settings:options});assert.equal(p,null);
});
test('V960 noncontiguous or overlapping sections are rejected',()=>{
 const args={trackId:input.trackId,sectionIndex:2,durationMs:140000,
  genre:'rap',energy:.5,bass:.3,lyricsVisible:false,reducedMotion:false,settings:options};
 for(const start of [29000,20000]){
  const a=json(analysis);a.sections[2].startMs=start;
  assert.equal(v.previousVerifiedConcertSceneV960({...args,analysis:a}),null);
 }
});
test('V960 no fabricated cross-track scene from edited imported analysis',()=>{
 const a=json(analysis);a.trackId='other';
 const p=v.previousVerifiedConcertSceneV960({analysis:a,trackId:input.trackId,sectionIndex:2,durationMs:140000,
  genre:'rap',energy:.5,bass:.3,lyricsVisible:false,reducedMotion:false,settings:options});assert.equal(p,null);
});
test('V960 deterministic transition duration for genres',()=>{
 assert.equal(v.concertTransitionDurationV960('drop','Deutschrap'),950);
 assert.ok(v.concertTransitionDurationV960('drop','Hardtekk')<950);
 assert.ok(v.concertTransitionDurationV960('break','Deutschrap')>v.concertTransitionDurationV960('build','Deutschrap'));
});
test('V960 begins with stable smooth alpha 0',()=>{
 const result=apply({elapsedMs:0});assert.equal(result.active,true);assert.equal(result.blend,0);
});
test('V960 mid-transition has a bounded partial blend',()=>{
 const t=v.concertTransitionDurationV960('hook','deutschrap');
 const result=apply({elapsedMs:t/2});assert.ok(result.blend>.4&&result.blend<.6);
});
test('V960 completion settles to full current intensity',()=>{
 const result=apply({elapsedMs:8000});assert.equal(result.blend,1);
 assert.equal(result.scene.intensity,now.intensity);
});
test('V960 bad elapsedMs is clamped',()=>{
 assert.equal(apply({elapsedMs:-400}).blend,0);
 assert.equal(apply({elapsedMs:Infinity}).blend,0);
});
test('V960 smooth function monotone across 1000 sampled instants',()=>{
 let previous=0;const dur=v.concertTransitionDurationV960('hook','deutschrap');
 for(let i=0;i<1000;i++){const result=apply({elapsedMs:dur*i/999});
  assert.ok(result.blend+1e-12>=previous);previous=result.blend;}
});
test('V960 current phase and verified flag never change',()=>{
 const r=apply();assert.equal(r.scene.phase,'hook');assert.equal(r.scene.verified,true);
});
test('V960 never writes into source scene or settings',()=>{
 const before=json({now,prior,options});apply();assert.deepEqual(json({now,prior,options}),before);
});
test('V960 no new fixtures, timer or network commands in pure implementation',()=>{
 const s=read('lib/concertContinuityV960.ts');for(const forbidden of [/\bfetch\s*\(/,/\bsetInterval\s*\(/,/\bsetTimeout\s*\(/,/\blocalStorage\b\s*\./,/goveeBridgeRequestV909\s*\(/,/requestAnimationFrame\s*\(/])
  assert.doesNotMatch(s,forbidden);
});
test('V960 authored stage takes precedence',()=>{
 const r=apply({},prior,now,options,{manualStage:true});assert.equal(r.scene,now);assert.equal(r.active,false);
});
test('V960 saved V912 show takes precedence',()=>{
 const r=apply({},prior,now,options,{savedShowActive:true});assert.equal(r.scene,now);assert.equal(r.active,false);
});
test('V960 explicitly authored timeline cue takes precedence',()=>{
 const original={...now,timelineOverride:true};const r=apply({},prior,original);
 assert.equal(r.scene,original);assert.equal(r.active,false);
});
test('V960 unverified scene cannot be promoted into verified stage cue',()=>{
 const original={...now,verified:false};const r=apply({},prior,original);
 assert.equal(r.scene,original);assert.equal(r.active,false);
});
test('V960 unverified previous scene blocks transition',()=>{
 const r=apply({}, {...prior,verified:false},now,{...options,compactFxV960:false});
 assert.equal(r.scene,now);assert.equal(r.active,false);
});
test('V960 first-section V958 composer behavior remains backward compatible',()=>{
 assert.equal(now.effects.length<=3,true);
 assert.equal(v958.mixConcertRoomLookV937({color:{r:100,g:40,b:50},brightness:60},now,'rhythm',
 {...options,hardwareSync:false},{savedShowActive:false,authoredStageActive:false}).brightness,60);
});
test('V960 compact profile uses at most 2 virtual FX',()=>{
 const r=apply({},prior,{...now,effects:['beams','lasers','fog','sweep','bass-impact']});
 assert.ok(r.scene.effects.length<=2);
});
test('V960 normal profile never exceeds 3 existing FX',()=>{
 const r=apply({},prior,{...now,effects:['beams','lasers','fog','sweep','bass-impact']},{...options,compactFxV960:false});
 assert.ok(r.scene.effects.length<=3);
});
test('V960 reduced-motion strips fast or flashy virtual FX',()=>{
 const r=apply({},prior,{...now,effects:['beams','lasers','sweep','fog','confetti']},options,{reducedMotion:true});
 assert.ok(r.scene.effects.every(f=>['beams','fog'].includes(f)));assert.ok(r.scene.effects.length<=1);
});
test('V960 transition startup suppresses bass impact and finale paper',()=>{
 const r=apply({elapsedMs:0},prior,{...now,effects:['bass-impact','confetti','streamers','beams']});
 assert.ok(r.scene.effects.every(f=>!['bass-impact','confetti','streamers'].includes(f)));
});
test('V960 automatic adjacent camera repeat is avoided without modifying manual formations',()=>{
 const same={...now,camera:prior.camera,formation:prior.formation};
 const r=apply({},prior,same);
 assert.equal(r.autoVaried,true);assert.notEqual(r.scene.camera,prior.camera);
 assert.equal(r.scene.formation,same.formation);
});
test('V960 anti-repeat honors already distinct camera',()=>{
 const other={...now,camera:prior.camera==='close'?'wide':'close'};
 const r=apply({},prior,other);assert.equal(r.autoVaried,false);assert.equal(r.scene.camera,other.camera);
});
test('V960 preview audit reports real phase changes',()=>{
 const r=v.concertContinuityAuditV960([prior,now,{...now,phase:'drop',effects:[]}]);
 assert.equal(r.phaseChanges,2);assert.equal(r.scenes,3);assert.equal(r.overBudget,0);
});
test('V960 report flags excessive effect lists',()=>{
 const report=v.concertContinuityAuditV960([{...now,effects:['beams','lasers','sweep','fog']}]);
 assert.equal(report.overBudget,1);
});
test('V960 no extra LAN dispatch or timer was added in Govee sync',()=>{
 const s=read('components/GoveeMusicSyncV909.tsx');
 assert.equal((s.match(/goveeBridgeRequestV909\(config,'\/command'/g)||[]).length,1);
 assert.ok(s.includes('previousVerifiedConcertSceneV960('));
 assert.ok(s.includes('applyConcertContinuityV960('));
});
test('V960 V354 manual priority code remains',()=>{
 const s=read('components/visualizer/ThreeAvatar.tsx');
 assert.ok(s.includes('authored:authoredCueV354.active'));
 assert.ok(s.includes('manualStage:authoredCueV354.active||authoredEnabled'));
});
test('V960 existing R3F render loop is reused',()=>{
 const s=read('components/visualizer/ConcertFestivalFxV958.tsx');
 assert.equal((s.match(/useFrame\s*\(/g)||[]).length,1);
 assert.doesNotMatch(s,/setInterval\s*\(/);
 assert.ok(s.includes('applyConcertContinuityV960('));
});
test('V960 user opt-ins exposed in Concert Roadmap Studio',()=>{
 const s=read('components/ConcertRoadmapStudioV958.tsx');
 assert.ok(s.includes('transitionsV960:e.target.checked'));
 assert.ok(s.includes('compactFxV960:e.target.checked'));
 assert.ok(s.includes('Keine bestätigte Songanalyse'));
});
test('V960 production gate includes real V960 suite and isolated types',()=>{
 const s=read('scripts/v931-production-gate.cjs');
 assert.ok(s.includes('tests/v960-concert-continuity-regression.cjs'));
 assert.ok(s.includes('tests/tsconfig.v960-core.json'));
});
test('V960 production wrapper never approves without full TypeScript and Next.js',()=>{
 const s=read('scripts/v960-production-verify.cjs');
 for(const item of ['sawRegression','sawTypes','sawFullTypes','sawBuild','gate?.passed===true',"process.exitCode=1"])
  assert.ok(s.includes(item),item);
});
test('V960 GitHub workflow requires Windows and Linux and fail-closed production gate',()=>{
 const s=read('.github/workflows/v960-concert-continuity.yml');
 for(const item of ['ubuntu-24.04','windows-latest','npm ci --no-audit --no-fund',
 'node scripts/v960-production-verify.cjs','SONIC_TEST_CONCURRENCY','actions/upload-artifact@v4'])
  assert.ok(s.includes(item),item);
});
test('V960 legacy V929 regression is restored in Windows/Linux CI',()=>{
 const s=read('.github/workflows/v832-continuous-validation.yml');
 assert.ok(s.includes('npm run test:v929 && npm run test:v929:types && npm run test:v929:ui-types'));
});
let samples=0;
for(let i=0;i<5000;i++){
 const progress=(i*137)%7500;
 const settings={...options,transitionsV960:i%7!==0,compactFxV960:i%3===0};
 const prev={...prior,verified:i%11!==0};
 const cur={...now,verified:i%13!==0,effects:['beams','lasers','fog']};
 const old=json(cur);const result=apply({elapsedMs:progress},prev,cur,settings);
 assert.equal(result.scene.verified,cur.verified);
 assert.ok(result.scene.effects.length<=3);
 assert.ok(result.blend>=0&&result.blend<=1);
 assert.ok(result.scene.intensity>=0&&result.scene.intensity<=1);
 assert.deepEqual(json(cur),old);
 samples++;
}
console.log(`V960 concert continuity: ${count} groups PASS, ${samples} deterministic scenarios PASS`);
