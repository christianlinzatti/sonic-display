'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/interactiveConcertControlV1001');
const {transpileModule,ScriptTarget,ModuleKind,JsxEmit,DiagnosticCategory}=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..'),read=x=>fs.readFileSync(path.join(root,x),'utf8');
let passed=0;
function test(label,fn){fn();passed++;console.log('PASS V1001 '+label);}
const current={stage:{enabled:true,intensity:60},camera:{enabled:true,intensity:50},
 dance:{enabled:true,intensity:55},lights:{enabled:true,intensity:45}};
const context={trackId:'spotify-good',durationMs:187000,playing:true,autoEnabled:true,verified:true,
 reducedMotion:false,manual:false,seekBlocked:false,controlsReady:true};
const chosen={stage:true,camera:true,dance:true,lights:true};
const plan=(values=current,c=context,preset='festival',strength=70,selected=chosen)=>m.touchPlanV1001(values,c,preset,strength,selected);
test('plan uses only four existing virtual intensity lanes',()=>{
 const p=plan();assert.deepEqual(m.TOUCH_LANES_V1001,['stage','camera','dance','lights']);
 assert.deepEqual(Object.keys(p.after),m.TOUCH_LANES_V1001);
 assert(p.diffs.length>0&&p.diffs.every(d=>Number.isFinite(d.after)&&d.after>=0&&d.after<=100));
});
test('neutral balanced profile does not round an existing manual intensity',()=>{
 const manual={...current,camera:{enabled:true,intensity:47}};
 const p=plan(manual,context,'balanced',50);
 assert.equal(p.after.camera.intensity,47);
 assert.equal(p.diffs.length,0);
});
test('disabled effects never become active, and are never changed',()=>{
 const p=plan({...current,dance:{enabled:false,intensity:55},stage:{enabled:false,intensity:60}});
 assert.deepEqual(p.after.stage,{enabled:false,intensity:60});
 assert.deepEqual(p.after.dance,{enabled:false,intensity:55});
 assert(!p.diffs.some(x=>x.lane==='stage'||x.lane==='dance'));
});
test('unchecked lane retains intensity and enabled state',()=>{
 const p=plan(current,context,'finale',85,{...chosen,camera:false,lights:false});
 assert.equal(p.after.camera.intensity,current.camera.intensity);
 assert.equal(p.after.lights.intensity,current.lights.intensity);
 assert(p.diffs.every(x=>x.lane==='stage'||x.lane==='dance'));
});
test('all four touch presets show distinct bounded results',()=>{
 const results=m.TOUCH_PRESETS_V1001.map(s=>plan(current,context,s,50).after.stage.intensity);
 assert(results[0]<results[1]&&results[1]<results[2]&&results[2]<results[3]);
});
test('touch intensity is clamped, snapped to 5 and avoids NaN',()=>{
 assert.equal(m.normalizeTouchStrengthV1001(-300),0);
 assert.equal(m.normalizeTouchStrengthV1001(900),100);
 assert.equal(m.normalizeTouchStrengthV1001(Infinity),50);
 assert.equal(m.normalizeTouchStrengthV1001(null),50);
 assert.equal(m.normalizeTouchStrengthV1001(52),50);
});
test('untrusted inputs cannot bypass normalization',()=>{
 assert.equal(plan(current,context,'made-up',50),null);
 assert.equal(plan({...current,lights:{enabled:true,intensity:Infinity}}),null);
 assert.equal(plan({...current,camera:{enabled:'yes',intensity:50}}),null);
});
test('requires verified, song-bound, ready playback and no manual motion',()=>{
 for(const patch of [{playing:false},{autoEnabled:false},{verified:false},{manual:true},{seekBlocked:true},
   {controlsReady:false},{reducedMotion:true},{trackId:''},{durationMs:0},{durationMs:Infinity},
   {durationMs:2000000},{trackId:'x'.repeat(161)}]){
   assert.equal(plan(current,{...context,...patch}),null,JSON.stringify(patch));
 }
});
test('preview never directly mutates its input snapshot',()=>{
 const frozen={stage:Object.freeze({...current.stage}),camera:Object.freeze({...current.camera}),
  dance:Object.freeze({...current.dance}),lights:Object.freeze({...current.lights})};Object.freeze(frozen);
 const p=plan(frozen);assert(p);assert.equal(frozen.stage.intensity,60);
 assert(!m.touchValuesEqualV1001(p.after,frozen));
});
test('explicit two-step compare-and-swap for apply and undo',()=>{
 const p=plan();assert(m.canCommitTouchV1001(p,current,context));
 assert(!m.canCommitTouchV1001(p,p.after,context));
 assert(m.canUndoTouchV1001(p,p.after,context));
 assert(!m.canUndoTouchV1001(p,current,context));
});
test('stale or changed song rejects apply and undo',()=>{
 const p=plan();
 for(const patch of [{trackId:'another'},{durationMs:187001},{playing:false},{manual:true},{seekBlocked:true},{verified:false}]){
  assert(!m.canCommitTouchV1001(p,current,{...context,...patch}));
  assert(!m.canUndoTouchV1001(p,p.after,{...context,...patch}));
 }
 assert(!m.canCommitTouchV1001(p,{...current,camera:{...current.camera,intensity:40}},context));
 assert(!m.canUndoTouchV1001(p,{...p.after,lights:{...p.after.lights,intensity:45}},context));
});
test('10,000 simulated user plans never change enabled flags or unselected lanes',()=>{
 const presets=m.TOUCH_PRESETS_V1001;
 for(let i=0;i<10000;i++){
  const values=Object.fromEntries(m.TOUCH_LANES_V1001.map((lane,j)=>[lane,{enabled:(i+j)%7!==0,intensity:(i*19+j*5)%101}]));
  const selected={stage:i%2===0,camera:true,dance:i%3===0,lights:i%5===0};
  const p=plan(values,context,presets[i%4],i%101,selected);assert(p);
  for(const k of m.TOUCH_LANES_V1001){
   assert.equal(p.after[k].enabled,values[k].enabled);
   assert(Number.isFinite(p.after[k].intensity)&&p.after[k].intensity>=0&&p.after[k].intensity<=100);
   if(!values[k].enabled||!selected[k])assert.equal(p.after[k].intensity,values[k].intensity);
  }
 }
});
test('new touch interface uses existing controllers and requires confirmation',()=>{
 const ui=read('components/visualizer/InteractiveConcertControlV1001.tsx');
 const deck=read('components/visualizer/LiveFxDeckV881.tsx');
 for(const phrase of ['Änderungen anzeigen','Vorschau übernehmen','Letzte Touch-Änderung rückgängig','aria-pressed','type="range"',
 'canCommitTouchV1001','canUndoTouchV1001'])assert(ui.includes(phrase),phrase);
 for(const phrase of ['<InteractiveConcertControlV1001','updateCinemaV992({intensity:','updateChoreographyV993({intensity:',
  'updateAtmosphere({intensity:','setImmersiveSettingsV1000({...prior,intensity:','verified:directorPlanV895.source'])assert(deck.includes(phrase),phrase);
});
test('controller has no direct Spotify, network, hardware or rendering authority',()=>{
 const files=['components/visualizer/interactiveConcertControlV1001.ts','components/visualizer/InteractiveConcertControlV1001.tsx'];
 for(const f of files){const s=read(f);
  for(const forbidden of ['fetch(', '/api/govee','/api/spotify','/api/alexa','new Audio(',
   'requestAnimationFrame(', 'useFrame(', 'setInterval(', 'setTimeout(', 'navigator.mediaDevices'])assert(!s.includes(forbidden),`${f} ${forbidden}`);
 }
});
test('source TS/TSX transpiles cleanly, with no test-only declaration shims',()=>{
 for(const f of ['components/visualizer/interactiveConcertControlV1001.ts','components/visualizer/InteractiveConcertControlV1001.tsx',
  'components/visualizer/LiveFxDeckV881.tsx']){
  const r=transpileModule(read(f),{fileName:f,reportDiagnostics:true,compilerOptions:{target:ScriptTarget.ES2022,module:ModuleKind.CommonJS,jsx:JsxEmit.ReactJSX}});
  assert.equal((r.diagnostics||[]).filter(d=>d.category===DiagnosticCategory.Error).length,0,f);
 }
});
test('release metadata and Vercel / GitHub gates include V1001',()=>{
 const p=JSON.parse(read('package.json'));
 const release=Number(p.version.match(/-v(\d+)$/)?.[1]);
 assert(release>=1001);assert.equal(p.sonicRoadmapRelease,`v${release}`);assert.equal(p.sonicFeatureRelease,`v${release}`);
 assert.equal(p.scripts['build:next'],'next build');
 assert(p.scripts.prebuild.includes('npm run test:v1001 && npm run test:v1001:types'));
 assert(read('scripts/vercel-production-build.cjs').includes('V1001 Interactive Concert Control'));
 assert(read('.github/workflows/v1001-touch-production-validation.yml').includes('npm run build:next'));
});
console.log('PASS V1001 '+passed+' groups');
