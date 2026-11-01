'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveConcertComparisonV803:compare}=load('components/visualizer/visualConcertComparisonV803');
const {auditConcertExperienceV800:audit}=load('components/visualizer/concertExperienceMilestoneV800');
const {inspectConcertExperienceV801:inspect}=load('components/visualizer/concertExperienceInspectorV801');
const {planConcertImprovementsV802:fixes,previewConcertImprovementsV802:preview,
 prepareImprovementTimelineV802:prepare}=load('components/visualizer/concertImprovementAssistantV802');
let count=0;const test=(name,cb)=>{try{cb();count++;}catch(err){err.message=`V803 ${name}: ${err.message}`;throw err;}};
const intents=['portrait','portrait','portrait','wide','rise','pulse','breath','dialogue','wide','ensemble'];
const scenes=intents.map((intent,index)=>({index,actIndex:index,startMs:index*11000,endMs:(index+1)*11000,
 intent,section:index===5?'drop':index===3?'hook':index===6?'break':'verse',
 role:index===5?'main-peak':index===3?'support-peak':index===6?'rest':'foundation',
 moment:index===5||index===3?'payoff':index===6?'breath':'focus',variation:1,
 emphasis:index===5?.95:index===3?.37:index===6?-.63:.1}));
const plan={source:'verified-storyboard',trackId:'verified-803',durationMs:110000,scenes,peakAct:5};
const evidence={trackId:plan.trackId,durationMs:plan.durationMs,avatarStage:true,performers:2,
 lyricsAvailable:true,lyricsSynced:true,manualDance:false,manualCamera:false,
 manualLighting:false,reducedMotion:false};
const a=audit(plan),report=inspect(plan,a,evidence),choices=fixes(plan,a,report,evidence);
const camera=choices.find(c=>c.kind==='camera-intent');
assert(camera,'requires a real camera improvement from V802');
const draft=preview(plan,a,report,evidence,[camera.id]);
const sceneIndex=camera.sceneIndex;
const at=camera.startMs+3200;
const ready=compare(plan,draft,sceneIndex,at);
const invalid=(p,d,i,t)=>assert.equal(compare(p,d,i,t),null);
test('verified source supports review',()=>{assert.equal(draft.source,'verified-draft');assert.equal(ready.source,'verified-preview');});
test('identity exactly inherited from verified plan',()=>{assert.equal(ready.trackId,plan.trackId);assert.equal(ready.sceneIndex,sceneIndex);assert.equal(ready.progressMs,at);});
test('original camera intent matches V790',()=>assert.equal(ready.before,plan.scenes[sceneIndex].intent));
test('candidate camera intent matches V802',()=>assert.equal(ready.after,camera.afterIntent));
test('two real perspective poses are different',()=>{assert.notDeepEqual(ready.beforePose,ready.afterPose);assert(ready.beforePose.z>0&&ready.afterPose.z>0);});
test('both perspectives have finite, bounded FOV and positions',()=>{for(const p of [ready.beforePose,ready.afterPose]){
 assert(Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z));
 assert(p.z>=2.5&&p.z<=8&&p.fov>=30&&p.fov<=55&&Number.isFinite(p.targetY));
}});
test('same song position shared by both 3D passes',()=>assert(ready.progressMs>=ready.startMs&&ready.progressMs<ready.endMs));
test('time is bounded inside verified scene',()=>{const lo=compare(plan,draft,sceneIndex,camera.startMs);
 const hi=compare(plan,draft,sceneIndex,camera.endMs-1);
 assert.equal(lo.progressMs,camera.startMs+600);assert.equal(hi.progressMs,camera.endMs-600);
});
test('time rejects NaN/infinity, outside scene',()=>{for(const v of [NaN,Infinity,-Infinity,at+110000,-1])invalid(plan,draft,sceneIndex,v);});
test('unavailable plan fails closed',()=>invalid({...plan,source:'unavailable'},draft,sceneIndex,at));
test('null plan and draft fail closed',()=>{invalid(null,draft,sceneIndex,at);invalid(plan,null,sceneIndex,at);});
test('source track mismatch fails closed',()=>invalid({...plan,trackId:'another-track'},draft,sceneIndex,at));
test('source duration mismatch fails closed',()=>invalid({...plan,durationMs:100000},draft,sceneIndex,at));
test('changed before track fails closed',()=>invalid(plan,{...draft,before:{...draft.before,trackId:'wrong'}},sceneIndex,at));
test('changed after track fails closed',()=>invalid(plan,{...draft,after:{...draft.after,trackId:'wrong'}},sceneIndex,at));
test('changed after duration fails closed',()=>invalid(plan,{...draft,after:{...draft.after,durationMs:50000}},sceneIndex,at));
test('unapproved scene never receives a shot',()=>invalid(plan,draft,6,69000));
test('unavailable draft fails closed',()=>invalid(plan,{...draft,source:'unavailable'},sceneIndex,at));
test('unavailable V801 source fails closed',()=>invalid(plan,{...draft,before:{...draft.before,source:'unavailable'}},sceneIndex,at));
test('modified V790 source intent fails closed',()=>invalid({...plan,scenes:scenes.map(s=>s.index===sceneIndex?{...s,intent:'ensemble'}:s)},draft,sceneIndex,at));
test('modified scene timestamps fail closed',()=>invalid(plan,{...draft,changes:draft.changes.map(c=>({...c,startMs:c.startMs+1}))},sceneIndex,at));
test('scene after song end rejected',()=>invalid({...plan,scenes:scenes.map(s=>s.index===sceneIndex?{...s,endMs:plan.durationMs+1}:s)},draft,sceneIndex,at));
test('no fake changed shot',()=>invalid(plan,{...draft,changes:draft.changes.map(c=>({...c,after:c.before}))},sceneIndex,at));
test('invalid indices rejected',()=>{for(const idx of [-2,1.5,Infinity,999])invalid(plan,draft,idx,at);});
test('duplicate proposals fail closed',()=>invalid(plan,{...draft,changes:[...draft.changes,...draft.changes]},sceneIndex,at));
test('empty identity fails closed',()=>invalid({...plan,trackId:''},draft,sceneIndex,at));
test('pure planner never mutates user input',()=>{const p=JSON.stringify(plan),d=JSON.stringify(draft);compare(plan,draft,sceneIndex,at);
 assert.equal(JSON.stringify(plan),p);assert.equal(JSON.stringify(draft),d);});
test('reproducibility across seeks',()=>{const first=compare(plan,draft,sceneIndex,at);compare(plan,draft,sceneIndex,at+300);
 assert.deepEqual(compare(plan,draft,sceneIndex,at),first);});
test('no fabricated pixel-based quality score',()=>assert(!('qualityScore' in ready)&&!('fps' in ready)));
test('existing manual V354 transfer still explicitly guarded',()=>{const current={version:1,enabled:true,name:'Bühnenprobe',durationMs:plan.durationMs,trackId:plan.trackId,clips:[]};
 const result=prepare(current,draft);assert.equal(result.ok,true,result.reason);assert.equal(result.timeline.clips[0].lane,'camera');});
let probes=0;
test('2400 deterministic same-song scene probes',()=>{for(let n=0;n<2400;n++){
 const progress=camera.startMs+600+(n/2399)*(camera.endMs-camera.startMs-1201);
 const c=compare(plan,draft,sceneIndex,progress);assert.equal(c.source,'verified-preview');
 assert(c.progressMs>=c.startMs&&c.progressMs<c.endMs);probes++;
}});
const read=file=>fs.readFileSync(file,'utf8');
test('3D render mounted only after explicit user click',()=>{const s=read('components/visualizer/VisualConcertComparisonPanelV803.tsx');
 for(const x of ['setOpen','open&&<CameraComparisonCanvasV803','dynamic(','onClick={()=>setOpen','aria-expanded={open}'])assert(s.includes(x),x);
});
test('one shared WebGL canvas, scissor rendering to compare cameras',()=>{const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const x of ['<Canvas','setScissorTest(true)','gl.render(scene,cam)','getDrawingBufferSize','setScissorTest(false)','<DynamicStage','<FrozenGlb'])assert(s.includes(x),x);
 assert.equal((s.match(/<Canvas\s/g)||[]).length,1);
});
test('single GLB model shared and skeleton cleanup',()=>{const s=read('components/visualizer/CameraComparisonCanvasV803.tsx');
 for(const x of ['cloneSkinnedScene','disposeClonedAvatarSkeletonsV654','mixer.setTime','usePreviewGltfCacheV654'])assert(s.includes(x),x);
});
test('read-only, no video stream, no live camera edits',()=>{const s=read('components/visualizer/CameraComparisonCanvasV803.tsx')+
 read('components/visualizer/VisualConcertComparisonPanelV803.tsx');
 assert(!/captureStream|saveTimelineV354|applyManualCamera|publishConcertInspectorV801|localStorage|requestAnimationFrame/.test(s));
});
test('original V802 panel performs confirmation, includes comparison',()=>{const s=read('components/visualizer/ConcertImprovementAssistantPanelV802.tsx');
 assert(s.includes('selectedChanges>0')&&s.includes('<VisualConcertComparisonPanelV803')&&s.includes('safePreview&&plan'));
 assert(s.includes('confirmed')&&s.includes('prepareImprovementTimelineV802'));
});
test('real selected GLB propagated by settings',()=>{const s=read('components/SettingsPanel.tsx');
 assert(s.includes('avatarModelUrl={currentAvatar?.url??null}'));
 assert(read('components/visualizer/ConcertQualityDashboardV751.tsx').includes('modelUrl={avatarModelUrl}'));
});
test('clear transparency about not equal to live show',()=>{const s=read('components/visualizer/VisualConcertComparisonPanelV803.tsx');
 assert(s.includes('keine Live-Kameraaufzeichnung')&&s.includes('nicht simuliert'));
});
test('V803 pure planner has no side effects',()=>{const s=read('components/visualizer/visualConcertComparisonV803.ts');
 assert(!/localStorage|Date\.now|new (WebGLRenderer|Scene)|requestAnimationFrame|fetch\s*\(/.test(s));
});
const pkg=require('../package.json');
test('v803 is first in mandatory release gates',()=>{assert(/^0\.1\.0-v(?:850|849|848|847|846|845|844(?:\.1)?|843|842|841|840|(?:80[0-9]|81[0-9]|82[0-9]|83[0-9]))$/.test(pkg.version));
 for(const k of ['build:preflight','check:fast','check:release'])assert(pkg.scripts[k].includes('npm run test:v803 && npm run test:v803:types && npm run test:v802'),k);
});
console.log(`PASS V803: ${count} test groups, ${probes} reproducible full-scene samples`);
