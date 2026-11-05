'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const logic=load('components/visualizer/autoImprovementDirectorV1003');
const qa=load('components/visualizer/concertQualityAssuranceV1002');
const {transpileModule,ScriptTarget,ModuleKind,JsxEmit,DiagnosticCategory}=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
let passed=0;function test(name,fn){fn();passed++;console.log('PASS V1003 '+name);}
const inspection={source:'verified-plan',trackId:'track-1',durationMs:200000,coverage:1,
 sceneCount:5,structureScore:80,scenes:[{intent:'close'},{intent:'close'},{intent:'close'}],
 findings:[{code:'repeated-camera'},{code:'missing-breath'}],summary:{attention:2,information:0,unverifiedLanes:2}};
const base={now:100000,planAt:99500,playing:true,plan:inspection,renderAt:99800,
 fps:20,p95FrameMs:61,warnings:[],targetFps:45,governorAt:99900,governorActive:true};
const report=(p={})=>qa.reviewConcertQualityV1002({...base,...p});
const ctx={trackId:'track-1',durationMs:200000,playing:true,autoEnabled:true,verified:true,
 reducedMotion:false,manual:false,seekBlocked:false,controlsReady:true};
const before={stage:{enabled:true,intensity:80},camera:{enabled:true,intensity:65},
 dance:{enabled:true,intensity:65},lights:{enabled:true,intensity:70}};
const ev={now:100000,planTrackId:'track-1',planAt:99500,renderAt:99800,progressMs:85000};
const make=(r=report(),s=before,c=ctx,e=ev)=>logic.planAutoImprovementV1003(r,s,c,e);
const can=(p,c=ctx,e=ev,r=report(),s=before)=>logic.canCommitAutoImprovementV1003(p,s,c,e,r);
test('uses current verified song and V1002 findings',()=>{
 const p=make();assert(p);assert.equal(p.trackId,'track-1');
 assert(p.advice.some(a=>a.code==='camera-repetition'&&!a.automatable));
 assert(p.advice.some(a=>a.code==='performance-slow'&&a.automatable));
});
test('only existing enabled optional stage and light intensity are reduced',()=>{
 const p=make();assert.equal(p.after.stage.intensity,65);assert.equal(p.after.lights.intensity,60);
 assert.equal(p.after.camera.intensity,65);assert.equal(p.after.dance.intensity,65);
 assert.deepEqual(p.diffs.map(x=>x.lane),['stage','lights']);
 assert(p.diffs.every(x=>x.after<x.before));
});
test('high frame variance alone produces smaller bounded reductions',()=>{
 const r=report({fps:44,p95FrameMs:50});const p=make(r);
 assert(p.triggerCodes.includes('frame-variance'));
 assert(!p.triggerCodes.includes('performance-slow'));
 assert.equal(p.after.stage.intensity,70);assert.equal(p.after.lights.intensity,65);
});
test('camera and scene issues never invent timecodes, changes or a camera command',()=>{
 const r=report({renderAt:90000});const p=make(r);
 assert(p.advice.some(x=>x.code==='camera-repetition'));
 assert.equal(p.diffs.length,0);assert(!can(p,ctx,ev,r));
});
test('no known song or stale V1002 plan means no proposal',()=>{
 assert.equal(make(report(),before,ctx,{...ev,planTrackId:'track-2'}),null);
 assert.equal(make(report(),before,ctx,{...ev,planAt:88000}),null);
 assert.equal(make(report({planAt:88000})),null);
});
test('unverified or stale runtime evidence never changes virtual settings',()=>{
 const r=report({renderAt:90000});const p=make(r);
 assert.equal(p.diffs.length,0);assert.equal(p.after.stage.intensity,before.stage.intensity);
 assert.equal(make(report({fps:null})).diffs.length,0);
});
test('manual, pause, reduced motion, seek and inactive automation block modifications',()=>{
 for(const patch of [{manual:true},{playing:false},{reducedMotion:true},{seekBlocked:true},
  {autoEnabled:false},{verified:false},{controlsReady:false}]){
  const c={...ctx,...patch},p=make(report(),before,c);
  assert(p);assert.equal(p.diffs.length,0,JSON.stringify(patch));
  assert(!can(p,c));
 }
});
test('disabled controls are never enabled',()=>{
 const s={...before,stage:{enabled:false,intensity:80},lights:{enabled:false,intensity:70}};
 const p=make(report(),s);assert.equal(p.diffs.length,0);
 assert.equal(p.after.stage.enabled,false);assert.equal(p.after.lights.enabled,false);
});
test('commit requires same song, settings, fresh evidence, unchanged problem',()=>{
 const p=make();assert(can(p));
 assert(!can(p,{...ctx,trackId:'track-2'}));
 assert(!can(p,ctx,{...ev,now:120001}));
 assert(!can(p,ctx,{...ev,progressMs:200000}));
 assert(!can(p,ctx,{...ev,progressMs:83000}));
 assert(!can(p,ctx,ev,report({fps:50,p95FrameMs:18})));
 assert(!can(p,ctx,ev,report(),{...before,lights:{enabled:true,intensity:75}}));
});
test('undo is compare-and-swap, safe after pause, not across a song change',()=>{
 const p=make();assert(logic.canUndoAutoImprovementV1003(p,p.after,ctx));
 assert(logic.canUndoAutoImprovementV1003(p,p.after,{...ctx,playing:false}));
 assert(!logic.canUndoAutoImprovementV1003(p,p.after,{...ctx,trackId:'track-2'}));
 assert(!logic.canUndoAutoImprovementV1003(p,p.after,{...ctx,manual:true}));
 assert(!logic.canUndoAutoImprovementV1003(p,before,ctx));
});
test('malformed non-finite values cannot leak to preview',()=>{
 for(const bad of [NaN,Infinity,-1,101]){
  const s={...before,stage:{enabled:true,intensity:bad}};
  assert.equal(make(report(),s),null);
 }
});
test('10,000 legal configurations stay within original bounds and never boost effects',()=>{
 for(let i=0;i<10000;i++){
  const s={stage:{enabled:i%2===0,intensity:i%101},
   camera:{enabled:true,intensity:(i*3)%101},dance:{enabled:true,intensity:(i*7)%101},
   lights:{enabled:i%3===0,intensity:(i*13)%101}};
  const p=make(report(),s);assert(p);
  for(const k of ['stage','camera','dance','lights']){
   assert.equal(p.after[k].enabled,s[k].enabled);
   assert(p.after[k].intensity>=0&&p.after[k].intensity<=s[k].intensity);
  }
  for(const d of p.diffs)assert(['stage','lights'].includes(d.lane));
 }
});
test('AI output cannot generate executable changes, share sensitive metadata or write hardware',()=>{
 const ui=read('components/visualizer/AutoImprovementDirectorV1003.tsx');
 assert(ui.includes("'/api/ai/concert-qa'"));assert(ui.includes('aiConcertQaPayloadV1002(report)'));
 assert(ui.includes('normalizeQaAiResponseV1002'));assert(ui.includes('canCommitAutoImprovementV1003'));
 assert(ui.includes('onChange(preview.after)'));
 for(const term of ['/api/govee','/api/spotify','saveTimeline','navigator.mediaDevices','requestAnimationFrame('])
  assert(!ui.includes(term),term);
 const pure=read('components/visualizer/autoImprovementDirectorV1003.ts');
 assert(!pure.includes('fetch('));assert(!pure.includes('localStorage'));
});
test('new component uses V1001 guarded state and the V1002 verified evidence source',()=>{
 const live=read('components/visualizer/LiveFxDeckV881.tsx');
 assert(live.includes('AutoImprovementDirectorV1003'));
 assert(live.includes('context={touchContextV1001} current={touchValuesV1001}'));
 assert(live.includes('onChange={applyTouchValuesV1001}'));
 const ui=read('components/visualizer/AutoImprovementDirectorV1003.tsx');
 assert(ui.includes('reviewConcertQualityV1002'));assert(ui.includes('useConcertInspectorV801'));
 assert(ui.includes('useConcertQualityV466'));
});
test('new planner and UI transpile without syntax errors',()=>{
 for(const f of ['components/visualizer/autoImprovementDirectorV1003.ts',
  'components/visualizer/AutoImprovementDirectorV1003.tsx','components/visualizer/LiveFxDeckV881.tsx']){
  const r=transpileModule(read(f),{fileName:f,reportDiagnostics:true,
   compilerOptions:{target:ScriptTarget.ES2022,module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX}});
  assert.equal((r.diagnostics||[]).filter(d=>d.category===DiagnosticCategory.Error).length,0,f);
 }
});
test('V1003 release has build gates and docs',()=>{
 const p=JSON.parse(read('package.json'));
 assert.equal(p.version,'0.1.0-v1003');assert.equal(p.sonicFeatureRelease,'v1003');
 assert.equal(p.sonicRoadmapRelease,'v1003');
 assert(p.scripts.prebuild.startsWith('npm run test:v1003 && npm run test:v1003:types'));
 assert(read('scripts/vercel-production-build.cjs').includes('V1003 AI Auto-Improvement Director'));
 assert(read('.github/workflows/v1003-auto-improvement-validation.yml').includes('npm run build:next'));
 assert(read('ARCHITECTURE.md').includes('V1003'));
});
console.log('PASS V1003 '+passed+' groups');
