'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs'); const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const file='components/visualizer/advancedEnsembleDirectorV760.ts';
const compiled=ts.transpileModule(read(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
a.equal(compiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const m={exports:{}};new Function('module','exports','require',compiled.outputText)(m,m.exports,()=>{throw Error('unexpected runtime import');});
const v=m.exports;let checks=0;
function ok(value,msg){a.ok(value,msg);checks++}function eq(x,y,msg){a.deepEqual(x,y,msg);checks++}
const settings={...v.DEFAULT_ENSEMBLE_V760,enabled:true};
const base={active:true,source:'visual-only',scene:'verse',lead:0,slots:Array.from({length:4},(_,slot)=>({slot,role:slot?'support':'lead',look:{yaw:slot?.24:0,weight:slot?.4:0}}))};
const formation={active:true,lead:0,slots:Array.from({length:4},(_,slot)=>({slot}))};
const positions=[[-2.4,0,0],[-.8,0,0],[.8,0,0],[2.4,0,0]];
const input={settings,base,formation,count:4,trackId:'song',seconds:20,bpm:120,positions,playing:true,reducedMotion:false,manualPriority:false,tier:'high',footLocked:false,section:'verse',beat:.8,energy:.7};
const run=(patch={})=>v.planAdvancedEnsembleV760({...input,...patch});
eq(v.normalizeEnsembleV760(null),v.DEFAULT_ENSEMBLE_V760);
eq(v.normalizeEnsembleV760({enabled:true,strength:-1,phraseBars:3,transitions:900,rotateLead:false,travel:false}),{enabled:true,strength:0,phraseBars:8,transitions:100,rotateLead:false,travel:false});
ok(!v.DEFAULT_ENSEMBLE_V760.enabled,'default off: opt-in');
for(const patch of [
 {settings:{...settings,enabled:false}},{settings:{...settings,strength:0}},
 {base:{...base,source:'authored-singer'}},{base:{...base,active:false}},
 {formation:{...formation,active:false}},{formation:null},{formation:{...formation,lead:1}},
 {trackId:''},{playing:false},{reducedMotion:true},{manualPriority:true},
 {tier:'low'},{footLocked:true},{count:2},{count:5},{seconds:-1},{seconds:NaN},
 {bpm:0},{bpm:Infinity},{bpm:260},{beat:-1},{beat:2},{energy:2},
 {positions:[[-1,0,0]]},{positions:[[-1,0,0],[0,0,0],[NaN,0,0],[3,0,0]]}
]){const r=run(patch);ok(!r.active,'bypass '+Object.keys(patch).join(','));eq(r.slots,[],'no modified slots on bypass');}
for(const section of ['verse','hook','chorus','drop','build','bridge','intro']){
 const r=run({section,seconds:14});ok(r.active,'section active '+section);
 if(section==='hook'||section==='chorus')eq(r.pattern,'unison','all hook cues unison');
 if(section==='drop')eq(r.pattern,'wings','drops wings');
}
const preview1=v.previewEnsembleV760({seconds:0,bpm:120,count:4,lead:0,section:'verse',settings});
const preview2=v.previewEnsembleV760({seconds:16.01,bpm:120,count:4,lead:0,section:'verse',settings});
ok(preview1.visualLead!==preview2.visualLead,'visual lead rotates at 8-bar boundary');
eq(v.previewEnsembleV760({seconds:16.01,bpm:120,count:4,lead:0,section:'verse',settings:{...settings,rotateLead:false}}).visualLead,0,'lead rotation optional');
const ground={active:true,gain:1,support:'none',phase:'dance',driftCm:1};
const goodRisk={risk:.01,accentScale:1,gestureScale:1};
const none=run({risks:[goodRisk,goodRisk,goodRisk,goodRisk]});ok(none.active,'plan enabled');
for(const slot of none.slots){ok(Math.abs(slot.depthHintZ)<=.036,'bounded depth');ok(Math.abs(slot.turnY)<=.002,'bounded yaw');ok(slot.gesture.leftLift<=.017,'bounded arms');ok(slot.gesture.shoulder<=.012,'bounded shoulder');ok(slot.look.weight<=.012,'bounded gaze');
 const offset=v.safeEnsembleDepthV760(none,slot,ground,goodRisk);ok(Math.abs(offset)<=.010001,'depth max 1cm');
 for(const g of [{...ground,active:false},{...ground,gain:NaN},{...ground,support:'both'},{...ground,phase:'low'},{...ground,phase:'lowering'},{...ground,driftCm:4}])eq(v.safeEnsembleDepthV760(none,slot,g,goodRisk),0,'ground veto');
 eq(v.safeEnsembleDepthV760(none,slot,ground,{...goodRisk,risk:.8}),0,'collision veto');
}
// Seek/replay deterministic, not a mutable state machine.
for(let i=0;i<12000;i++){
 const count=i%2?3:4,seconds=(i*37)%480,section=['verse','hook','drop','build'][i%4];
 const b={...base,slots:base.slots.slice(0,count)};
 const f={...formation,slots:formation.slots.slice(0,count)};
 const p=positions.slice(0,count);
 const r=run({base:b,formation:f,positions:p,count,seconds,section});
 ok(r.active&&r.slots.length===count,'all cast slots');
 const repeat=run({base:b,formation:f,positions:p,count,seconds,section});eq(r,repeat,'same input stable');
 ok(r.slots.every((s,j)=>s.slot===j),'index stable');
 ok(r.slots.every(s=>Number.isFinite(s.depthHintZ)&&Number.isFinite(s.gesture.leftLift)),'finite');
 ok(r.slots.filter(s=>s.visualRole==='front').length===1,'one visual front role');
 const badRisk=run({base:b,formation:f,positions:p,count,seconds,section,risks:p.map(()=>({risk:.9,accentScale:1,gestureScale:1}))});
 ok(badRisk.slots.every(s=>s.depthHintZ===0&&s.gesture.leftLift===0),'risk suppresses extra accents');
}
const scene=read('components/visualizer/GroupDancersV326SceneV492.tsx');
for(const symbol of ['readEnsembleV760','ENSEMBLE_EVENT_V760','planAdvancedEnsembleV760','safeEnsembleDepthV760','depthV638+depthV760'])ok(scene.includes(symbol),'live scene '+symbol);
ok(scene.indexOf('planAdvancedEnsembleV760(')>scene.indexOf('planAdvancedEnsembleV638('),'after V638');
ok(scene.indexOf('planAdvancedEnsembleV760(')<scene.indexOf('planFeatureDuetPerformanceV687('),'before authored duet');
ok(scene.indexOf('softenCollisionGestureV506(')>scene.indexOf('planAdvancedEnsembleV760('),'collision softening last');
ok(scene.includes('formationApproach(g.position.x,targetX+'),'lateral lanes kept');
ok(!read(file).includes('window.')||read(file).includes('localStorage'),'stored settings only, pure plan');
const studio=read('components/visualizer/MultiAvatarStageStudioV326.tsx');ok(studio.includes('<AdvancedEnsembleControlsV760'),'editor integrated');
ok(read('services/settings/unifiedBackup.ts').includes('\"sonic-advanced-ensemble-v760\":\"avatar\"'),'portable backup includes new settings');
const ui=read('components/visualizer/AdvancedEnsembleControlsV760.tsx');ok(ui.includes('simuliert')&&ui.includes('Visuelle Führungsrolle'),'preview honest');
const pkg=JSON.parse(read('package.json'));ok(/^0\.1\.0-v(?:76\d|7[7-9]\d|[89]\d\d)$/.test(pkg.version),'release >= V760');ok(pkg.scripts['check:fast'].includes('npm run test:v760'),'prebuild V760 test gate');
console.log(`PASS V760 Advanced Ensemble Director: ${checks.toLocaleString('en-US')} checks`);
