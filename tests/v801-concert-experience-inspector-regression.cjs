'use strict';
require('./helpers/project-version-v651.cjs').assertProjectVersionAtLeast(801);
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectConcertExperienceV801:inspect}=load('components/visualizer/concertExperienceInspectorV801');
const {auditConcertExperienceV800:audit}=load('components/visualizer/concertExperienceMilestoneV800');
let passed=0;
function test(label,fn){try{fn();passed++}catch(error){error.message=`V801 ${label}: ${error.message}`;throw error;}}
const intents=['portrait','portrait','portrait','wide','rise','pulse','breath','dialogue','wide','ensemble'];
const scenes=intents.map((intent,index)=>({index,actIndex:index,startMs:index*11000,endMs:(index+1)*11000,
  intent,section:index===5?'drop':index===3?'hook':index===6?'break':'verse',
  role:index===5?'main-peak':index===3?'support-peak':index===6?'rest':'foundation',
  moment:index===5||index===3?'payoff':index===6?'breath':'focus',
  variation:1,emphasis:index===5?.95:index===3?.37:index===6?-.6:.1}));
const plan={source:'verified-storyboard',trackId:'song-1',durationMs:110000,scenes,peakAct:5};
const evidence={trackId:'song-1',durationMs:110000,avatarStage:true,performers:2,
  lyricsAvailable:true,lyricsSynced:true,manualDance:false,manualCamera:false,
  manualLighting:false,reducedMotion:false};
const run=(p=plan,e=evidence)=>inspect(p,audit(p),e);
const report=run();
test('one real verified whole-song report',()=>{
  assert.equal(report.source,'verified-plan');assert.equal(report.sceneCount,10);
  assert.equal(report.coverage,1);assert.equal(report.scenes.length,10);
  assert.equal(report.durationMs,110000);assert(Number.isInteger(report.structureScore));
});
test('specific repeated portrait finding',()=>{
 const f=report.findings.find(f=>f.code==='repeated-camera');
 assert.equal(f.lane,'camera');assert.equal(f.startMs,0);assert.equal(f.endMs,33000);
 assert.equal(f.sceneIndex,2);assert(report.scenes[2].findingIds.includes(f.id));
});
test('no invented dance quality',()=>{
 assert(report.scenes.every(s=>s.statuses.dance==='unverified'));
 assert(report.scenes.every(s=>s.statuses.lighting==='unverified'));
});
test('synced lyrics means only plan evidence',()=>assert(report.scenes.every(s=>s.statuses.lyrics==='planned')));
test('singers not automatically inferred',()=>assert(!report.findings.some(f=>f.message.includes('Sänger ist'))));
test('gap points at exact unstaged interval',()=>{
 const p={...plan,scenes:scenes.map((s,i)=>i===2?{...s,startMs:s.startMs+800}:s)};
 const f=run(p).findings.find(f=>f.code==='coverage-gap');
 assert(f);assert.equal(f.startMs,22000);assert.equal(f.endMs,22800);
 assert.equal(f.lane,'timeline');
});
test('missing outro anchors exact end',()=>{
 const p={...plan,scenes:scenes.map((s,i)=>i===9?{...s,endMs:s.endMs-3000}:s)};
 const f=run(p).findings.find(f=>f.code==='coverage-gap-end');
 assert(f);assert.equal(f.startMs,107000);assert.equal(f.endMs,110000);
});
test('no breath is scoped as global stage-layout limitation',()=>{
 const p={...plan,scenes:scenes.map((s,i)=>i===6?{...s,moment:'focus',role:'foundation'}:s)};
 const f=run(p).findings.find(f=>f.code==='missing-breath');
 assert(f);assert.equal(f.lane,'lighting');assert.equal(f.sceneIndex,null);
});
test('no secondary peak is noncritical information',()=>{
 const p={...plan,scenes:scenes.map((s,i)=>i===3?{...s,moment:'focus',role:'foundation'}:s)};
 const f=run(p).findings.find(f=>f.code==='missing-secondary-peak');
 assert(f);assert.equal(f.severity,'information');
});
test('lyrics missing labels absence instead of visual defect',()=>{
 const r=run(plan,{...evidence,lyricsAvailable:false,lyricsSynced:false});
 assert(r.findings.some(f=>f.code==='no-lyrics'&&f.severity==='information'));
 assert(r.scenes.every(s=>s.statuses.lyrics==='unverified'));
});
test('unsynced lyrics warns with recommendation',()=>{
 const r=run(plan,{...evidence,lyricsSynced:false});
 assert(r.findings.some(f=>f.code==='unsynced-lyrics'&&f.severity==='attention'));
});
test('manual controls protected, not reported as errors',()=>{
 const r=run(plan,{...evidence,manualDance:true,manualCamera:true,manualLighting:true});
 assert(r.scenes.every(s=>s.statuses.camera==='manual'&&s.statuses.dance==='manual'&&s.statuses.lighting==='manual'));
});
test('reduced-motion is a preference not a show failure',()=>{
 const r=run(plan,{...evidence,reducedMotion:true});
 assert(r.findings.some(f=>f.code==='reduced-motion'&&f.severity==='information'));
 assert.equal(r.summary.attention,report.summary.attention);
});
test('missing actual avatars is not forged clip failure',()=>{
 const r=run(plan,{...evidence,performers:0});
 assert(r.findings.some(f=>f.code==='no-performers'&&f.severity==='information'));
});
test('camera monotony uses actual storyboard kinds',()=>{
 const p={...plan,scenes:scenes.map((s,i)=>({...s,intent:i%2?'portrait':'wide'}))};
 assert(run(p).findings.some(f=>f.code==='low-shot-variety'));
 assert(run(p).structureScore<report.structureScore);
});
test('findings stable and deterministic',()=>assert.deepEqual(run(),run()));
test('input is not mutated',()=>{const before=JSON.stringify(plan);run();assert.equal(JSON.stringify(plan),before);});
for(const [name,p,e] of [
 ['old track',plan,{...evidence,trackId:'other'}],
 ['old duration',plan,{...evidence,durationMs:100000}],
 ['not verified',{...plan,source:'unavailable'},evidence],
 ['missing scenes',{...plan,scenes:[]},evidence],
 ['NaN duration',plan,{...evidence,durationMs:NaN}],
 ['negative performers',plan,{...evidence,performers:-2}],
 ['reordered scenes',{...plan,scenes:scenes.map((s,i)=>i===3?{...s,index:7}:s)},evidence],
 ['overlapping scenes',{...plan,scenes:scenes.map((s,i)=>i===2?{...s,startMs:20000}:s)},evidence],
])test('fail closed '+name,()=>assert.equal(run(p,e).source,'unavailable'));
let probes=0;
for(let t=0;t<2000;t++){
 const p=run();const s=p.scenes[Math.floor(t/200)];
 assert(s.startMs<=t*55&&s.endMs>=t*55);
 assert(p.structureScore>=0&&p.structureScore<=100);
 assert(p.findings.every(f=>f.startMs>=0&&f.endMs<=p.durationMs&&f.startMs<f.endMs));
 probes++;
}
test('2000 full-song deterministic timeline probes',()=>assert.equal(probes,2000));
test('no independent clock, GLB mutation or GPU loops',()=>{
 const s=fs.readFileSync('components/visualizer/concertExperienceInspectorV801.ts','utf8');
 assert(!/Date\.now|useFrame\s*\(|Math\.random|new AnimationMixer|requestAnimationFrame|localStorage|fetch\s*\(/.test(s));
});
test('dashboard visible in existing V751 panel',()=>{
 const s=fs.readFileSync('components/visualizer/ConcertQualityDashboardV751.tsx','utf8');
 assert(s.includes('ConcertExperienceInspectorPanelV801'));assert(s.includes('<ConcertExperienceInspectorPanelV801/>'));
});
test('stage publishing is a read-only branch before V670 guard',()=>{
 const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 assert(s.includes('inspectConcertExperienceV801('));
 assert(s.includes('publishConcertInspectorV801({at:Date.now(),progressMs'));
 const a=s.indexOf('const concertInspectionV801='),b=s.indexOf('const directedDynamicsV670=');assert(a>0&&a<b);
 assert(!s.includes('base:concertInspectionV801'));
});
test('UI provides per-scene navigation, filtering, and honest limitations',()=>{
 const s=fs.readFileSync('components/visualizer/ConcertExperienceInspectorPanelV801.tsx','utf8');
 for(const token of ['aria-pressed','setSelected','showInformation','setLane','Nicht gemessen','V751_OPEN_RENDER_QA_EVENT','Storyboard geprüft'])assert(s.includes(token),token);
});
const pkg=require('../package.json');
test('V801 release tests are first in all three gates',()=>{
 assert(/^0\.1\.0-v\d+$/.test(pkg.version));for(const k of ['build:preflight','check:fast','check:release'])
  assert(pkg.scripts[k].includes(/^0\.1\.0-v\d+$/.test(pkg.version)?'npm run test:v802 && npm run test:v802:types && npm run test:v801':'npm run test:v801 && npm run test:v801:types && npm run test:v800'),k);
});
console.log(`PASS V801: ${passed} test groups, ${probes} whole-song report probes`);
