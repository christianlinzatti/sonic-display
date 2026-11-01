'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {auditConcertExperienceV800:audit}=load('components/visualizer/concertExperienceMilestoneV800');
const {inspectConcertExperienceV801:inspect}=load('components/visualizer/concertExperienceInspectorV801');
const {planConcertImprovementsV802:planFixes,previewConcertImprovementsV802:preview,
  prepareImprovementTimelineV802:prepare}=load('components/visualizer/concertImprovementAssistantV802');
let count=0;const check=(name,fn)=>{try{fn();count++}catch(e){e.message=`V802 ${name}: ${e.message}`;throw e;}};
const intents=['portrait','portrait','portrait','wide','rise','pulse','breath','dialogue','wide','ensemble'];
const scenes=intents.map((intent,index)=>({index,actIndex:index,startMs:index*11000,endMs:(index+1)*11000,
  intent,section:index===5?'drop':index===3?'hook':index===6?'break':'verse',
  role:index===5?'main-peak':index===3?'support-peak':index===6?'rest':'foundation',
  moment:index===5||index===3?'payoff':index===6?'breath':'focus',variation:1,
  emphasis:index===5?.95:index===3?.37:index===6?-.63:.1}));
const plan={source:'verified-storyboard',trackId:'track-v802',durationMs:110000,scenes,peakAct:5};
const evidence={trackId:plan.trackId,durationMs:plan.durationMs,avatarStage:true,performers:2,
  lyricsAvailable:true,lyricsSynced:true,manualDance:false,manualCamera:false,
  manualLighting:false,reducedMotion:false};
const baseAudit=audit(plan),report=inspect(plan,baseAudit,evidence);
const suggestions=planFixes(plan,baseAudit,report,evidence);
const camera=suggestions.find(x=>x.kind==='camera-intent');
check('verified V801 + V800 prerequisites',()=>{assert.equal(report.source,'verified-plan');assert.equal(baseAudit.source,'verified-show');});
check('prioritized issue list',()=>{assert(suggestions.length>0);assert(camera);assert(suggestions.every(x=>x.id&&x.reason&&x.proposal));});
check('camera draft tied to existing scene and actual verified duration',()=>{
 assert(Number.isInteger(camera.sceneIndex));const s=plan.scenes[camera.sceneIndex];
 assert.equal(camera.startMs,s.startMs);assert.equal(camera.endMs,s.endMs);
 assert.notEqual(camera.beforeIntent,camera.afterIntent);assert(camera.previewDelta>0);
});
check('camera draft protects real peak and break',()=>assert(suggestions.filter(x=>x.kind==='camera-intent')
 .every(x=>x.sceneIndex!==5&&x.sceneIndex!==6)));
check('real before-after V801 re-audit is improved',()=>{
 const p=preview(plan,baseAudit,report,evidence,[camera.id]);
 assert.equal(p.source,'verified-draft');assert.equal(p.changes.length,1);
 assert(p.after.structureScore>p.before.structureScore);
 assert.equal(p.after.durationMs,p.before.durationMs);assert.equal(p.after.sceneCount,p.before.sceneCount);
 assert.equal(p.after.coverage,p.before.coverage);
});
check('preview never mutates the source song storyboard',()=>{
 const before=JSON.stringify(plan);preview(plan,baseAudit,report,evidence,[camera.id]);
 assert.equal(JSON.stringify(plan),before);
});
check('preview is deterministic even across seeks',()=>{
 const x=preview(plan,baseAudit,report,evidence,[camera.id]);
 assert.deepEqual(x,preview(plan,baseAudit,report,evidence,[camera.id]));
});
check('manual camera disables automatic camera suggestions',()=>{
 const e={...evidence,manualCamera:true};const r=inspect(plan,baseAudit,e);
 assert(planFixes(plan,baseAudit,r,e).every(x=>x.kind!=='camera-intent'));
});
check('reduced motion disables camera proposal',()=>{
 const e={...evidence,reducedMotion:true};const r=inspect(plan,baseAudit,e);
 assert(planFixes(plan,baseAudit,r,e).every(x=>x.kind!=='camera-intent'));
});
check('no invented lyrics timestamps',()=>{
 const e={...evidence,lyricsSynced:false};const r=inspect(plan,baseAudit,e);
 const p=planFixes(plan,baseAudit,r,e);assert(p.some(x=>x.lane==='lyrics'&&x.kind==='manual-review'));
});
check('missing real scene intervals cannot be patched',()=>{
 const p={...plan,scenes:scenes.map((s,i)=>i===2?{...s,startMs:s.startMs+800}:s)};
 const a=audit(p),r=inspect(p,a,evidence);
 const suggestions=planFixes(p,a,r,evidence);
 assert(suggestions.some(x=>x.lane==='timeline'&&x.kind==='manual-review'));
 assert(suggestions.every(x=>x.lane!=='timeline'||x.kind==='manual-review'));
});
check('fail closed on stale or unavailable source',()=>{
 for(const changed of [{...plan,trackId:'other'},{...plan,durationMs:23000},
  {...plan,source:'unavailable'},{...plan,scenes:[]}]){
   assert.equal(planFixes(changed,baseAudit,report,evidence).length,0);
   assert.equal(preview(changed,baseAudit,report,evidence,[camera.id]).source,'unavailable');
  }
});
check('random unknown ids cannot fabricate changed shots',()=>{
 const p=preview(plan,baseAudit,report,evidence,['guess-scene-2']);
 assert.equal(p.changes.length,0);assert.equal(p.after.structureScore,report.structureScore);
});
check('manual review suggestions never produce silent actual changes',()=>{
 const p=preview(plan,baseAudit,report,evidence,suggestions.filter(x=>x.kind==='manual-review').map(x=>x.id));
 assert.equal(p.changes.length,0);assert.equal(p.after.structureScore,report.structureScore);
});
const original={version:1,enabled:true,name:'Bühnenprobe',durationMs:110000,trackId:plan.trackId,clips:[]};
const draft=preview(plan,baseAudit,report,evidence,[camera.id]);
check('explicit consent path adds V354 manual camera clip only',()=>{
 const result=prepare(original,draft);assert.equal(result.ok,true,result.reason);
 assert.equal(result.added,1);assert.equal(result.timeline.clips.length,1);
 const clip=result.timeline.clips[0];assert.equal(clip.lane,'camera');
 assert(['wide','medium','close','orbit'].includes(clip.value));
 assert(clip.startMs>camera.startMs&&clip.startMs+clip.durationMs<camera.endMs);
 assert.equal(result.timeline.trackId,original.trackId);
});
check('V354 original is never mutated',()=>{
 const source=JSON.stringify(original);prepare(original,draft);assert.equal(JSON.stringify(original),source);
});
check('no existing V354 show is silently replaced',()=>{
 const result=prepare({...original,enabled:false},draft);assert.equal(result.ok,false);
 assert.equal(result.timeline,null);
});
check('mismatched song cannot receive camera cue',()=>{
 for(const different of [{...original,trackId:'other'},{...original,durationMs:200000}]){
  assert.equal(prepare(different,draft).ok,false);
 }
});
check('existing camera overlap never overwritten',()=>{
 const existing={...original,clips:[{id:'manual-1',lane:'camera',startMs:0,durationMs:90000,value:'wide',label:'Manual'}]};
 const result=prepare(existing,draft);assert.equal(result.ok,false);assert.equal(result.timeline,null);
});
check('unrelated manual lighting cues remain preserved',()=>{
 const existing={...original,clips:[{id:'manual-light',lane:'lighting',startMs:2000,durationMs:3000,value:1.2,label:'Original'}]};
 const result=prepare(existing,draft);assert.equal(result.ok,true,result.reason);
 assert.deepEqual(result.timeline.clips[0],existing.clips[0]);
});
check('duplicate transfer does not silently append same cue',()=>{
 const once=prepare(original,draft);assert(once.ok);
 assert.equal(prepare(once.timeline,draft).ok,false);
});
check('unverified or empty draft cannot apply',()=>{
 assert.equal(prepare(original,preview(plan,baseAudit,report,evidence,[])).ok,false);
 assert.equal(prepare(original,{...draft,source:'unavailable'}).ok,false);
});
let probes=0;
check('reproducible whole-song preview sampling',()=>{
 for(let i=0;i<1800;i++){
  const time=i*110000/1800;
  const s=draft.after.scenes.find(s=>time>=s.startMs&&time<s.endMs);
  assert(s);assert(s.startMs<=time&&time<s.endMs);
  assert(draft.after.structureScore>=0&&draft.after.structureScore<=100);probes++;
 }
 assert.equal(probes,1800);
});
check('no independent clock/GPU/persistence in deterministic planner',()=>{
 const source=fs.readFileSync('components/visualizer/concertImprovementAssistantV802.ts','utf8');
 assert(!/Date\.now|requestAnimationFrame|useFrame\s*\(|Math\.random|localStorage|fetch\s*\(/.test(source));
});
check('panel in existing QA dashboard with explicit confirmation and revert',()=>{
 const dash=fs.readFileSync('components/visualizer/ConcertQualityDashboardV751.tsx','utf8');
 const panel=fs.readFileSync('components/visualizer/ConcertImprovementAssistantPanelV802.tsx','utf8');
 assert(dash.includes('<ConcertImprovementAssistantPanelV802 modelUrl={avatarModelUrl} avatarChoicesV805={avatarChoicesV805} stageTheme={stageTheme}/>'));
 for(const x of ['confirmed','Vorher','Nachher','Entwurf verwerfen','saveTimelineV354',
   'prepareImprovementTimelineV802','V354','readTimelineV354'])assert(panel.includes(x),x);
});
check('V801 inspector remains read-only stage branch',()=>{
 const source=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 assert(source.includes('concertInspectorEvidenceV802'));
 assert(source.includes('publishConcertInspectorV801({at:Date.now(),progressMs'));
 assert(source.indexOf('publishConcertInspectorV801')<source.indexOf('directedDynamicsV670'));
});
const pkg=require('../package.json');
check('version and all three mandatory release gates',()=>{
 assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|(?:80[0-9]|81[0-9]|82[0-9]|83[0-9]))$/.test(pkg.version));
 for(const key of ['build:preflight','check:fast','check:release'])
  assert(pkg.scripts[key].includes('npm run test:v802 && npm run test:v802:types && npm run test:v801'),key);
});
console.log(`PASS V802: ${count} groups; ${probes} deterministic timeline probes`);
