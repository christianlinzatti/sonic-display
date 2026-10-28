const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.join(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
function load(file,requireFn=()=>{throw Error('unexpected runtime dependency')}){
  const code=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const module={exports:{}};new Function('module','exports','require',code)(module,module.exports,requireFn);return module.exports;
}
const p=load('components/visualizer/danceImprovementAssistantV315.ts');
const quality=()=>({enabled:true,variety:60,minHoldSeconds:14,dancerFocus:70,fxCeiling:75});
const dance=()=>({enabled:true,intensity:55,style:'auto',expressiveArms:true,bodyGroove:true,plantedFootSafety:true});
const performance=()=>({enabled:true,style:'auto',fluidity:60,balance:55,footProtection:75,transitionPolish:65});
const config=()=>({quality:quality(),dance:dance(),performance:performance()});
const sample=(time,options={})=>({atMs:time,section:'verse',shot:'wide',formation:'solo',energy:.7,kick:.8,fx:.45,light:.5,
  movement:.25,beatResponse:.5,footImpulse:.2,hasGroundContact:true,phaseConfidence:.7,source:'gltf',...options});
const review=(samples,over={})=>({trackId:'track',trackLabel:'Test',durationMs:180000,recording:true,samples,summary:{},...over});
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(315);
assert.equal(p.planDanceImprovementsV315(review([]),config()).status,'insufficient');
const baseline=Array.from({length:24},(_,i)=>sample(i*1500));
assert.equal(p.planDanceImprovementsV315(review(baseline),config()).status,'no-issues','never invents quality problems');
assert.equal(p.planDanceImprovementsV315(review(baseline,{trackId:''}),config()).status,'insufficient');
const rapid=baseline.map((s,i)=>({...s,shot:i<3?'wide':i<5?'hero':i<7?'groove':'groove'}));
let plan=p.planDanceImprovementsV315(review(rapid),config());
assert.ok(plan.suggestions.some(s=>s.id==='camera-pacing'&&s.after===20));
assert.equal(plan.suggestions.find(s=>s.id==='camera-pacing').field,'quality.minHoldSeconds');
assert.equal(p.planDanceImprovementsV315(review(rapid.map((s,i)=>({...s,section:i<3?'verse':i<5?'hook':'drop'}))),config()).suggestions.some(s=>s.id==='camera-pacing'),false,'section transitions cannot be fixed by minHoldSeconds');
const staticShot=Array.from({length:45},(_,i)=>sample(i*1500));
assert.ok(p.planDanceImprovementsV315(review(staticShot),config()).suggestions.some(s=>s.id==='camera-variety'));
const loudBreaks=baseline.map((s,i)=>({...s,section:i>=5?'break':'verse',fx:i>=5?.93:.3}));
plan=p.planDanceImprovementsV315(review(loudBreaks),config());
assert.ok(plan.suggestions.some(s=>s.id==='fx-restraint'&&s.after===65));
const foot=baseline.map((s,i)=>({...s,footImpulse:i<16?.84:.16,hasGroundContact:true}));
assert.ok(p.planDanceImprovementsV315(review(foot),config()).suggestions.some(s=>s.id==='foot-guard'&&s.after===85));
const quiet=baseline.map(s=>({...s,energy:.9,movement:.07}));
assert.ok(p.planDanceImprovementsV315(review(quiet),config()).suggestions.some(s=>s.id==='dance-presence'&&s.after===63));
const unstable=baseline.map((s,i)=>({...s,movement:i%2?.86:.04}));
assert.ok(p.planDanceImprovementsV315(review(unstable),config()).suggestions.some(s=>s.id==='movement-smoothing'));
const disabled=config();disabled.quality.enabled=false;disabled.performance.enabled=false;disabled.dance.enabled=false;
assert.equal(p.planDanceImprovementsV315(review([...loudBreaks,...foot]),disabled).status,'no-issues','never re-enables intentionally disabled subsystems');
const input=config();const updated=p.withImprovementValueV315(input,'performance.footProtection',88);
assert.equal(input.performance.footProtection,75,'pure previews must not mutate originals');
assert.equal(updated.performance.footProtection,88);
assert.equal(updated.quality.fxCeiling,75);
const second=p.withImprovementValueV315(updated,'quality.fxCeiling',60);
assert.equal(second.quality.fxCeiling,60);
// Test the production writer against stubbed persistence/event modules; no browser mocks needed.
let current=config(),writes={quality:0,dance:0,performance:0};
const stubs={
  './smartShowQualityV310':{readShowQualitySettingsV310:()=>current.quality,writeShowQualitySettingsV310:v=>{current={...current,quality:v};writes.quality++}},
  './danceQualityV307':{refreshDanceQualitySettings:()=>current.dance,writeDanceQualitySettings:v=>{current={...current,dance:v};writes.dance++}},
  './advancedDancePerformanceV311':{refreshDancePerformanceV311:()=>current.performance,writeDancePerformanceV311:v=>{current={...current,performance:v};writes.performance++}},
  './danceImprovementAssistantV315':p};
const actions=load('components/visualizer/danceImprovementActionsV315.ts',id=>{if(!(id in stubs))throw Error(id);return stubs[id]});
let suggested=p.planDanceImprovementsV315(review(loudBreaks),current).suggestions;
assert.equal(suggested.length,1);
const before=JSON.stringify(current); assert.ok(suggested[0].before!==suggested[0].after);assert.equal(JSON.stringify(current),before,'generating suggestion cannot write');
current={...current,quality:{...current.quality,fxCeiling:80}};
assert.equal(actions.applyImprovementSuggestionsV315(suggested).ok,false,'reject stale preview');
assert.equal(current.quality.fxCeiling,80);
current=config();
let applied=actions.applyImprovementSuggestionsV315(suggested);
assert.equal(applied.ok,true);assert.equal(current.quality.fxCeiling,65);assert.equal(writes.dance,0);assert.equal(writes.performance,0);
assert.deepEqual(actions.undoImprovementSuggestionsV315(applied.undo),{restored:1,skipped:0});assert.equal(current.quality.fxCeiling,75);
applied=actions.applyImprovementSuggestionsV315(suggested);
current={...current,quality:{...current.quality,fxCeiling:52}};
assert.deepEqual(actions.undoImprovementSuggestionsV315(applied.undo),{restored:0,skipped:1},'never overwrite a manual edit after apply');
assert.equal(current.quality.fxCeiling,52);
assert.equal(actions.applyImprovementSuggestionsV315([]).ok,false);
const ui=read('components/visualizer/VisualDanceImprovementStudioV315.tsx');
for(const token of ['"use client"','Aufzeichnung analysieren','Ausgewählte Änderungen übernehmen','Änderungen rückgängig machen','Änderungen beibehalten','Bisher','Vorgeschlagen','aria-live','onChange','Grafischer Vergleich'])assert.ok(ui.includes(token),`missing UI ${token}`);
assert.ok(read('components/visualizer/StageDirectorControlsV287.tsx').includes('<VisualDanceImprovementStudioV315 />'));
assert.ok(read('app/globals.css').includes('.dance-improvement-v315-preview'));
assert.ok(read('README.md').includes('V315'));
console.log('PASS V315 deterministic diagnostics, evidence thresholds, honest before/after preview, user-approved writes, stale-value rejection, conflict-safe undo, UI integration');
