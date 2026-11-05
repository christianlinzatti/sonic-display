'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const qa=load('components/visualizer/concertQualityAssuranceV1002');
const {transpileModule,ScriptTarget,ModuleKind,JsxEmit,DiagnosticCategory}=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(root,x),'utf8');
let pass=0;function test(name,fn){fn();pass++;console.log('PASS V1002 '+name);}
const plan={source:'verified-plan',trackId:'song-abc',durationMs:180000,coverage:1,
 sceneCount:5,structureScore:85,summary:{attention:0,information:0,unverifiedLanes:2},
 scenes:[{intent:'wide'},{intent:'close'},{intent:'medium'},{intent:'wide'},{intent:'close'}],findings:[]};
const base={now:10000,planAt:9900,playing:true,plan,renderAt:9950,fps:48,p95FrameMs:19,
 warnings:[],targetFps:45,governorAt:9900,governorActive:true};
const review=(patch={})=>qa.reviewConcertQualityV1002({...base,...patch});
test('independent plan and measured render evidence when fresh',()=>{
 const r=review();assert.equal(r.source,'local-evidence');assert.equal(r.planAvailable,true);
 assert.equal(r.runtimeAvailable,true);assert.equal(r.structureScore,85);
 assert.equal(r.measuredFps,48);assert.equal(r.cameraIntentCount,3);
 assert(r.unverified.some(s=>s.includes('Lip-Sync')));
});
test('stale plan never displays a numeric score or inferred camera variety',()=>{
 const r=review({planAt:3000});assert.equal(r.planAvailable,false);assert.equal(r.structureScore,null);
 assert.equal(r.cameraIntentCount,null);assert(r.findings.some(f=>f.code==='missing-plan'));
});
test('song pause hides plan and render statistics',()=>{
 const r=review({playing:false});assert.equal(r.structureScore,null);assert.equal(r.measuredFps,null);
});
test('unverified plan never masquerades as a quality score',()=>{
 const r=review({plan:{...plan,source:'unavailable',structureScore:100}});
 assert.equal(r.structureScore,null);assert.equal(r.planAvailable,false);
});
test('stale or invalid WebGL probe is marked unknown rather than zero FPS',()=>{
 for(const patch of [{renderAt:4000},{fps:null},{fps:NaN},{fps:Infinity},{p95FrameMs:0},
  {p95FrameMs:Infinity},{fps:1000},{renderAt:10100}]){
  const r=review(patch);assert.equal(r.measuredFps,null,JSON.stringify(patch));
  assert(r.findings.some(f=>f.code==='render-unavailable'));
 }
});
test('low measured fps is a genuine runtime concern, not song quality claim',()=>{
 const r=review({fps:21,p95FrameMs:65});
 assert(r.findings.some(f=>f.code==='performance-slow'&&f.severity==='important'));
 assert(r.findings.some(f=>f.code==='frame-variance'));
 assert.equal(r.structureScore,85);
});
test('supported fps targets adjust thresholds without infinite or negative values',()=>{
 for(let i=0;i<10000;i++){
  const r=review({fps:10+(i%130),p95FrameMs:2+(i%120),targetFps:[30,45,60][i%3]});
  assert(r.measuredFps!==null&&r.measuredP95!==null);
  assert(r.findings.length>0&&r.findings.length<=9);
  assert(r.findings.every(f=>['plan','runtime','unknown'].includes(f.evidence)));
 }
});
test('only documented V801 codes generate plan improvement observations',()=>{
 const r=review({plan:{...plan,coverage:.91,findings:[
  {code:'repeated-camera'}, {code:'low-shot-variety'}, {code:'missing-breath'},
  {code:'unsynced-lyrics'}, {code:'coverage-gap'}, {code:'unknown'}]}});
 for(const code of ['coverage-gap','camera-repetition','camera-variety','missing-break','lyrics-unverified'])
  assert(r.findings.some(f=>f.code===code),code);
 assert(!r.findings.some(f=>f.code==='unknown'));
});
test('repeated findings are deduplicated and ranked by priority',()=>{
 const r=review({fps:16,p95FrameMs:85,plan:{...plan,coverage:.9,
  findings:[{code:'repeated-camera'},{code:'repeated-camera'},{code:'repeated-camera'}]}});
 assert.equal(r.findings.filter(f=>f.code==='camera-repetition').length,1);
 const rank={important:0,improve:1,info:2};
 for(let i=1;i<r.findings.length;i++)assert(rank[r.findings[i-1].severity]<=rank[r.findings[i].severity]);
});
test('warnings only indicate optional projection diagnostics, not pixel inspection',()=>{
 const r=review({warnings:['Head outside canvas']});
 assert(r.findings.some(f=>f.code==='visual-projection'&&f.evidence==='runtime'));
 assert(!r.findings.some(f=>/phonem|mouth/i.test(f.title)));
});
test('AI payload contains only a strict finite aggregate and never song metadata',()=>{
 const payload=qa.aiConcertQaPayloadV1002(review({fps:20,p95FrameMs:60}));
 assert.deepEqual(Object.keys(payload),['planAvailable','runtimeAvailable','structureScore','sceneCount','targetFps','fps','p95FrameMs','codes']);
 assert(!JSON.stringify(payload).includes('song-abc'));
 assert(!Object.values(payload).some(x=>typeof x==='string'));
 assert(!payload.codes.includes('performer-unverified'));
});
test('model text output is validated and limited to three suggestions',()=>{
 assert(qa.normalizeQaAiResponseV1002({summary:'Die geplante Struktur kann abwechslungsreicher sein.',
  suggestions:['Kamera-Intents im Szenenplan abwechseln.']}));
 for(const bad of [null,{}, {summary:'short',suggestions:['hello world']},
  {summary:'Genügend Text vorhanden.',suggestions:[]},
  {summary:'Genügend Text vorhanden.',suggestions:['a'.repeat(250)]},
  {summary:'Genügend Text vorhanden.',suggestions:['Valid item 123','Valid item 456','Valid item 789','Valid item 000']}])
  assert.equal(qa.normalizeQaAiResponseV1002(bad),null);
});
test('UI is read-only and opt-in; it does not mutate timelines or lights',()=>{
 const s=read('components/visualizer/ConcertQualityAssurancePanelV1002.tsx');
 for(const phrase of ['<section','reviewConcertQualityV1002','KI-Empfehlungen anfordern','aiConcertQaPayloadV1002','aria-label'])assert(s.includes(phrase),phrase);
 for(const forbidden of ['setImmersiveSettingsV1000','saveTimelineV354','updateCamera','updateChoreography','/api/govee','/api/spotify','requestAnimationFrame('])assert(!s.includes(forbidden),forbidden);
 assert(read('components/visualizer/ConcertQualityDashboardV751.tsx').includes('<ConcertQualityAssurancePanelV1002 now={now}/>'));
});
test('optional AI API authenticates, limits payload, never executes commands',()=>{
 const s=read('app/api/ai/concert-qa/route.ts');
 for(const phrase of ['getValidSession','createHash','OPENAI_API_KEY','new URL(request.url).origin','content-length',
  'valid(data)','store:false','AbortSignal.timeout','normalizeQaAiResponseV1002','additionalProperties:false','Cache-Control'])assert(s.includes(phrase),phrase);
 for(const forbidden of ['saveTimeline','setImmersive','/api/govee','/api/alexa','playback.seek','new Audio('])assert(!s.includes(forbidden),forbidden);
});
test('new TS, TSX and server route transpile cleanly',()=>{
 const paths=['components/visualizer/concertQualityAssuranceV1002.ts',
 'components/visualizer/ConcertQualityAssurancePanelV1002.tsx',
 'components/visualizer/ConcertQualityDashboardV751.tsx',
 'app/api/ai/concert-qa/route.ts'];
 for(const f of paths){const r=transpileModule(read(f),{fileName:f,reportDiagnostics:true,
  compilerOptions:{target:ScriptTarget.ES2022,module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX}});
  assert.equal((r.diagnostics||[]).filter(d=>d.category===DiagnosticCategory.Error).length,0,f);}
});
test('V1002 metadata, prebuild, Vercel and workflow gate are connected',()=>{
 const p=JSON.parse(read('package.json'));
 assert(Number(p.version.match(/-v(\d+)/)?.[1])>=1002);
 assert(Number(p.sonicFeatureRelease.match(/v(\d+)/)?.[1])>=1002);
 assert(Number(p.sonicRoadmapRelease.match(/v(\d+)/)?.[1])>=1002);
 assert(p.scripts.prebuild.includes('npm run test:v1002 && npm run test:v1002:api && npm run test:v1002:types'));
 assert(p.scripts['test:v1002']);assert(p.scripts['test:v1002:types']);
 assert(read('scripts/vercel-production-build.cjs').includes('V1002 Concert Quality Assurance'));
 assert(read('.github/workflows/v1002-quality-assurance-validation.yml').includes('npm run build:next'));
});
console.log('PASS V1002 '+pass+' groups');
