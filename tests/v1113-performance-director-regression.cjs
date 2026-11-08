#!/usr/bin/env node
'use strict';
/** V1113 real compiled TypeScript tests, no accounts, network or stage devices. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1113-'));
const check=(label,test)=>{test();console.log('PASS V1113 '+label)};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc');}
 catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);}
 if(!compiler)throw Error('TypeScript compiler required; npm ci must install dev dependencies');
 const compiled=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1113-core.json'),
   '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',temporary],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(compiled.status,0,compiled.stdout+'\n'+compiled.stderr+'\n'+(compiled.error?.message||''));
 const {PERFORMANCE_MODES_V1113,normalizePerformanceOptionsV1113,directPerformanceV1113,
  syncPerformancePersonalityV1113,samplePerformanceCueV1113}=require(path.join(temporary,'lib/aiPerformanceDirectorV1113.js'));
 const {AVATAR_CAST_V1112,AVATAR_PERSONALITIES_V1112,directAvatarPersonalityV1112}=
  require(path.join(temporary,'lib/aiAvatarPersonalityV1112.js'));
 const {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,sampleArenaShowPlanV1040}=
  require(path.join(temporary,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,normalizeAiShowRemixV1106,applyAiShowRemixV1106}=
  require(path.join(temporary,'lib/arena360AiShowRemixV1106.js'));
 const cast=()=>AVATAR_CAST_V1112.map(x=>({...x}));
 const create=(genre='rap',cap=70,profile='natural',expression=50)=>{
  const plan=generateArenaShowPlanV1040({genre,title:'Original von Nutzer',durationMs:234000});
  const remix=localAiShowRemixV1106('Ein großes Konzert',genre,cap);
  const personality=directAvatarPersonalityV1112(plan,remix,cast(),cap);
  assert(personality);
  return {plan,remix,personality,directed:directPerformanceV1113(plan,personality,
   {mode:profile,expression,intensityCap:cap})};
 };
 check('144 genre/mode/cap/expression combinations preserve original timeline and safe cues',()=>{
  let cases=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const mode of PERFORMANCE_MODES_V1113)for(const expression of [20,50,80]){
    const {plan,personality,directed}=create(genre,cap,mode,expression);
    assert(directed,JSON.stringify({genre,cap,mode,expression}));
    const untouched=[JSON.stringify(plan),JSON.stringify(personality)];
    assert(normalizeAiShowRemixV1106(directed.remix));
    assert.equal(directed.cues.length,7);
    assert.deepEqual(directed.cues.map(c=>[c.index,c.scene,c.start,c.end]),
     plan.segments.map((s,i)=>[i,s.scene,s.start,s.end]));
    assert(directed.quality.characterEnergyChanges);
    assert(directed.quality.safeTransitions&&directed.quality.continuousTimeline);
    assert.equal(directed.quality.chapters,7);
    assert.equal(directed.quality.soloChapters,5);
    assert.equal(directed.quality.ensembleChapters,2);
    assert(directed.quality.distinctGestures>=3);
    assert(directed.quality.maxPerformerEnergy<=cap);
    for(const cue of directed.cues){
     assert.equal(cue.performers.length,3);
     assert(cue.performers.every(m=>m.energy>=0&&m.energy<=cap));
     assert.equal(cue.camera,directed.remix.acts[cue.index].camera);
     assert.equal(cue.dance,directed.remix.acts[cue.index].dance);
     assert.equal(cue.intensity,directed.remix.acts[cue.index].intensity);
     if(cue.focusId)assert.equal(cue.performers.filter(p=>p.spotlight).length,1);
    }
    assert.equal(directed.cues[0].dance,'calm');
    assert.equal(directed.cues[4].dance,'calm');
    assert.equal(directed.cues[3].camera,'group');
    assert.equal(directed.cues[3].dance,'group');
    assert.equal(directed.cues[6].camera,'group');
    assert.equal(directed.cues[6].dance,'peak');
    const approved=applyAiShowRemixV1106(plan,directed.remix,cap);assert(approved);
    assert.deepEqual(approved.segments.map(s=>[s.id,s.scene,s.start,s.end]),
     plan.segments.map(s=>[s.id,s.scene,s.start,s.end]));
    assert.equal(approved.title,plan.title);assert.equal(approved.durationMs,plan.durationMs);
    assert.deepEqual([JSON.stringify(plan),JSON.stringify(personality)],untouched);
    cases++;
   }
  assert.equal(cases,144);
 });
 check('all four personalities receive distinct scene gestures and dynamic stage energy',()=>{
  const variants=AVATAR_PERSONALITIES_V1112.map(personality=>{
   const plan=generateArenaShowPlanV1040({genre:'rap'});
   const castMembers=cast();castMembers[0].personality=personality;
   const persona=directAvatarPersonalityV1112(plan,localAiShowRemixV1106('Show','rap',80),castMembers,80);
   return directPerformanceV1113(plan,persona,{mode:'dynamic',expression:80,intensityCap:80});
  });
  assert(variants.every(Boolean));
  assert.equal(new Set(variants.map(x=>x.cues[1].performers[0].gesture)).size,4);
  const show=variants[0];
  for(const member of show.cues[1].performers){
   assert(show.cues[4].performers.find(m=>m.id===member.id).energy<
    show.cues[6].performers.find(m=>m.id===member.id).energy);
  }
 });
 check('camera and group dance map to real approved V1040 playback with safety guards',()=>{
  const {plan,directed,personality}=create('hard',75,'dynamic',80);
  assert(directed);
  const aligned=syncPerformancePersonalityV1113(personality,directed);assert(aligned);
  assert.deepEqual(aligned.cues.map(c=>[c.camera,c.dance,c.intensity]),
   directed.cues.map(c=>[c.camera,c.dance,c.intensity]));
  const approved=applyAiShowRemixV1106(plan,directed.remix,75);assert(approved);
  for(let i=0;i<7;i++){
   const percent=(plan.segments[i].start+plan.segments[i].end)/2;
   const args={enabled:true,playing:true,reducedMotion:false,
    durationMs:plan.durationMs,progressMs:Math.round(percent*plan.durationMs)};
   const live=sampleArenaShowPlanV1040(approved,args);
   assert(live.active);assert.equal(live.camera,directed.cues[i].camera);
   assert.equal(live.dance,directed.cues[i].dance);
   assert.equal(sampleArenaShowPlanV1040(approved,{...args,playing:false}).active,false);
   assert.equal(sampleArenaShowPlanV1040(approved,{...args,reducedMotion:true}).active,false);
   assert.equal(sampleArenaShowPlanV1040(approved,{...args,enabled:false}).active,false);
  }
 });
 check('fixed authored boundaries remain exact and sampling is read-only',()=>{
  const {plan,personality}=create();
  plan.segments[0].end=.12;plan.segments[1].start=.12;
  assert(normalizeArenaShowPlanV1040(plan));
  const staged=directAvatarPersonalityV1112(plan,personality.remix,personality.cast,70);assert(staged);
  const directed=directPerformanceV1113(plan,staged,{mode:'cinematic',expression:50,intensityCap:70});assert(directed);
  const before=JSON.stringify(directed);
  assert.equal(samplePerformanceCueV1113(directed,.119).index,0);
  assert.equal(samplePerformanceCueV1113(directed,.12).index,1);
  assert.equal(samplePerformanceCueV1113(directed,1).index,6);
  assert.equal(JSON.stringify(directed),before);
  for(const p of [-.1,1.01,NaN,Infinity,'0.5',null,undefined])
   assert.equal(samplePerformanceCueV1113(directed,p),null);
  assert.equal(samplePerformanceCueV1113(null,.5),null);
 });
 check('malformed, forged or unsafe proposals never enter preview',()=>{
  const {plan,personality}=create();
  for(const opts of [null,[],{},
   {mode:'unknown',expression:50,intensityCap:70},
   {mode:'natural',expression:19,intensityCap:70},
   {mode:'natural',expression:55,intensityCap:70},
   {mode:'natural',expression:50,intensityCap:86},
   {mode:'natural',expression:NaN,intensityCap:70}]){
   assert.equal(normalizePerformanceOptionsV1113(opts),null);
   assert.equal(directPerformanceV1113(plan,personality,opts),null);
  }
  const safe={mode:'natural',expression:50,intensityCap:70};
  assert.equal(directPerformanceV1113(null,personality,safe),null);
  assert.equal(directPerformanceV1113(plan,null,safe),null);
  assert.equal(directPerformanceV1113(plan,{...personality,cues:personality.cues.slice(1)},safe),null);
  const forged={...personality,cues:personality.cues.map((c,i)=>i===1?{...c,scene:'spoof'}:c)};
  assert.equal(directPerformanceV1113(plan,forged,safe),null);
  const over={...personality,remix:{...personality.remix,acts:personality.remix.acts.map(a=>({...a,intensity:85}))}};
  assert.equal(directPerformanceV1113(plan,over,safe),null);
  assert.equal(syncPerformancePersonalityV1113(null,null),null);
 });
 check('UI has real opt-in, per-actor seven-phase rehearsal and explicit apply + undo',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const browser=fs.readFileSync(path.join(root,'tests/e2e/ai-performance-director-v1113.spec.cjs'),'utf8');
  for(const term of ['V1113 AI Performance Director','V1113 Bühnenperformance jetzt proben',
   'V1113 Performance Director Partitur','V1113 sieben Performance-Szenen',
   'directPerformanceV1113(base,personality','setPerformancePreview(null)',
   'Diese sieben Szenen in meinen Showplan übernehmen','Letzten Remix rückgängig machen'])
    assert(ui.includes(term),'missing UI '+term);
  for(const term of ['v1113-performance-score-screenshot','v1113-approved-undo-screenshot'])
    assert(browser.includes(term),'missing browser evidence '+term);
  assert(!fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8')
   .includes('aiPerformanceDirectorV1113'));
 });
 console.log('PASS V1113 AI Performance Director · robust typed score, controlled live cues and testable browser preview');
}finally{fs.rmSync(temporary,{recursive:true,force:true});}
