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
assert.ok(['0.1.0-v315','0.1.0-v316','0.1.0-v317','0.1.0-v318','0.1.0-v319','0.1.0-v320','0.1.0-v321','0.1.0-v322','0.1.0-v324','0.1.0-v325','0.1.0-v326','0.1.0-v329','0.1.0-v330','0.1.0-v331','0.1.0-v332','0.1.0-v333','0.1.0-v334','0.1.0-v335','0.1.0-v336','0.1.0-v337','0.1.0-v338','0.1.0-v339','0.1.0-v340','0.1.0-v341','0.1.0-v342','0.1.0-v343','0.1.0-v346','0.1.0-v347','0.1.0-v349','0.1.0-v350','0.1.0-v351','0.1.0-v352','0.1.0-v353','0.1.0-v354','0.1.0-v355','0.1.0-v356','0.1.0-v357','0.1.0-v358','0.1.0-v359','0.1.0-v360','0.1.0-v361','0.1.0-v362','0.1.0-v363','0.1.0-v364','0.1.0-v365','0.1.0-v366','0.1.0-v367','0.1.0-v368','0.1.0-v369','0.1.0-v370','0.1.0-v371','0.1.0-v372','0.1.0-v373','0.1.0-v374','0.1.0-v375','0.1.0-v376','0.1.0-v377','0.1.0-v378','0.1.0-v379','0.1.0-v380','0.1.0-v381','0.1.0-v382','0.1.0-v383','0.1.0-v384','0.1.0-v385','0.1.0-v386','0.1.0-v387','0.1.0-v390','0.1.0-v391','0.1.0-v392','0.1.0-v393','0.1.0-v394','0.1.0-v395','0.1.0-v396','0.1.0-v397','0.1.0-v398','0.1.0-v399','0.1.0-v400','0.1.0-v401', '0.1.0-v402','0.1.0-v403','0.1.0-v404','0.1.0-v405','0.1.0-v406','0.1.0-v407','0.1.0-v408','0.1.0-v409','0.1.0-v411','0.1.0-v412','0.1.0-v413','0.1.0-v414','0.1.0-v415','0.1.0-v416','0.1.0-v417','0.1.0-v418','0.1.0-v419','0.1.0-v420','0.1.0-v422','0.1.0-v424','0.1.0-v425','0.1.0-v426'].includes(require('../package.json').version));
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
