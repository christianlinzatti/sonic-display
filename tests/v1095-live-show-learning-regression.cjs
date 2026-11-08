'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {generateArenaShowPlanV1040:generate,normalizeArenaShowPlanV1040:normalize,
 sampleArenaShowPlanV1040:sample}=load('lib/arena360ShowDesignerV1040');
const {EMPTY_LEARNING_V1095:EMPTY,normalizeLearningMemoryV1095:clean,
 showStyleSignatureV1095:signature,recordShowFeedbackV1095:feedback,
 suggestLiveShowV1095:suggest,learningSummaryV1095:summary,
 MAX_FEEDBACK_V1095:LIMIT,STORAGE_KEY_V1095:KEY}=load('lib/arena360LiveShowLearningV1095');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const plan=generate({genre:'Deutschrap',title:'PRIVATE TITLE NOT TO STORE',
 prompt:'PERSONAL PROMPT NOT TO STORE',durationMs:210000});
const original=JSON.stringify(plan);
assert.equal(clean(null).version,1095);assert.deepEqual(clean({version:999}),EMPTY);
assert.equal(feedback(EMPTY,null,1),null);assert.equal(feedback(EMPTY,plan,0),null);
let mem=feedback(EMPTY,plan,1);
assert(mem);assert.deepEqual(summary(mem),{liked:1,avoided:0,remembered:1});
const saved=JSON.stringify(mem);
for(const sensitive of ['PRIVATE TITLE','PERSONAL PROMPT','210000','act-1','songId','lyrics','audio'])
 assert(!saved.includes(sensitive),'personal metadata must not be persisted: '+sensitive);
assert.equal(saved.includes('"genre":"rap"'),true);
assert.deepEqual(clean(JSON.parse(saved)),mem,'safe and bounded JSON local storage');
mem=feedback(mem,plan,-1);
assert.deepEqual(summary(mem),{liked:0,avoided:1,remembered:1},'explicit dislikes replace earlier score');
mem=feedback(mem,plan,1);
assert.deepEqual(summary(mem),{liked:1,avoided:0,remembered:1});
let result=suggest(mem,plan);
assert(result);assert.equal(result.learned,true);
assert.deepEqual(result.plan.segments.map(s=>[s.start,s.end,s.scene,s.id,s.camera,s.dance]),
 plan.segments.map(s=>[s.start,s.end,s.scene,s.id,s.camera,s.dance]),
 'time boundaries, camera and choreography are always preserved');
assert.equal(result.plan.title,plan.title);assert.equal(result.plan.prompt,plan.prompt);
assert.equal(result.plan.durationMs,plan.durationMs);assert.equal(result.plan.genre,plan.genre);
assert.notEqual(JSON.stringify(result.plan),original,'suggestion differs from original');
assert.equal(JSON.stringify(plan),original,'suggestion never modifies current live plan');
assert(normalize(result.plan));
assert.equal(sample(result.plan,{enabled:true,playing:true,reducedMotion:false,progressMs:90000,durationMs:210000}).active,true,
 'variation is accepted by the live stage sampler, if explicitly applied');
const disliked=feedback(result.memory,result.plan,-1);
assert(disliked);const next=suggest(disliked,plan);assert(next);
assert.notDeepEqual(next.plan,result.plan,'explicitly disliked variation is not immediately repeated');
assert(!disliked.recent.includes('nonsense'));
assert.equal(suggest(EMPTY,null),null);
assert.equal(feedback(EMPTY,{...plan,durationMs:Infinity},1),null);
for(const bad of [
 '{',42, {version:1095,sequence:-1,feedback:[],recent:[]},
 {version:1095,sequence:Infinity,feedback:[],recent:[]},
 {version:1095,sequence:0,feedback:'oops',recent:[]},
 {version:1095,sequence:0,feedback:[],recent:['token:private']},
 {version:1095,sequence:0,feedback:[{...mem.feedback[0],signature:'fake'}],recent:[]},
 {version:1095,sequence:0,feedback:[{...mem.feedback[0],cues:[{}]}],recent:[]},
 {version:1095,sequence:0,feedback:[],recent:Array.from({length:8},()=> 's00000000')},
])assert.deepEqual(clean(bad),EMPTY,'untrusted persistent state must fail closed');
let previous=new Set();let state=EMPTY;
for(let i=0;i<12;i++){
 const x=suggest(state,plan);assert(x,'enough variations');
 const sig=signature(x.plan.segments.map(s=>({deck:s.deck,floating:s.floating,lasers:s.lasers,intensity:Math.round(s.intensity/5)*5})));
 assert(!previous.has(sig),'recent proposals should not repeat');
 previous.add(sig);if(previous.size>6)previous.delete(previous.values().next().value);
 state=x.memory;
}
assert(state.recent.length<=6);
// No feedback, no implicit learning. Memory only grows after explicit call.
assert.equal(state.feedback.length,0);
const favorites=[generate({genre:'Hardtekk'}),generate({genre:'Deutschrock'}),generate({genre:'Pop'})];
let many=EMPTY;
for(let i=0;i<52;i++){
 const base=favorites[i%3],x=suggest(many,base);
 assert(x);many=x.memory;
 many=feedback(many,x.plan,i%7===0?-1:1);assert(many);
}
assert(many.feedback.length<=LIMIT,'bounded local memory, even under repeated feedback');
assert.deepEqual(clean(JSON.parse(JSON.stringify(many))),many);
// Sample 120,000 deterministic proposals on several genres; never corrupt timelines.
let samples=0,cur=EMPTY;
for(let i=0;i<120000;i++){
 const base=favorites[i%3];const x=suggest(cur,base);assert(x);
 assert(normalize(x.plan));assert.equal(x.plan.durationMs,base.durationMs);
 for(let j=0;j<7;j++){
  const src=base.segments[j],dst=x.plan.segments[j];
  assert.equal(dst.start,src.start);assert.equal(dst.end,src.end);assert.equal(dst.scene,src.scene);
  assert.equal(dst.camera,src.camera);assert.equal(dst.dance,src.dance);
  assert(dst.intensity>=0&&dst.intensity<=100);
 }
 cur=x.memory;samples++;
 if(i%6000===5999)cur=EMPTY;
}
const ui=read('components/visualizer/LiveShowLearningPanelV1095.tsx');
for(const fragment of ['window.localStorage.getItem(STORAGE_KEY_V1095)',
 'window.localStorage.setItem(STORAGE_KEY_V1095,JSON.stringify(next))',
 'window.localStorage.removeItem(STORAGE_KEY_V1095)',
 'recordShowFeedbackV1095(', 'suggestLiveShowV1095(',
 'updatePreferences({arenaShowPlanV1040:visibleCandidate})',
 'nur als Vorschau erzeugt','Neue Show-Variante vorschlagen'])
 assert(ui.includes(fragment),'opt-in feedback UI missing '+fragment);
const core=read('lib/arena360LiveShowLearningV1095.ts');
for(const forbidden of ['Date.now(', 'Math.random(', 'fetch(', 'setInterval(', 'setTimeout(',
 'localStorage.', 'navigator.', 'requestAnimationFrame(', 'window.', 'Govee'])
 assert(!core.includes(forbidden),'pure learning planner has forbidden side effect: '+forbidden);
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(panel.includes('<LiveShowLearningPanelV1095/>'));
assert(read('components/visualizer/stages/Arena360StageV1031.tsx').includes('sampleArenaShowPlanV1040('));
assert.equal(KEY,'sonic-display-live-show-learning-v1095');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1])>=1095);assert.equal(lock.version,pkg.version);
assert.equal(lock.packages[''].version,pkg.version);
assert(pkg.scripts.prebuild.includes('npm run test:v1095 && npm run test:v1095:types &&'));
for(const file of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(file).includes('tests/v1095-live-show-learning-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1095(root)'));
console.log('PASS V1095: '+samples+' safe suggestions; explicit preferences, privacy, bounded history, novelty, manual approval, existing live stage');
