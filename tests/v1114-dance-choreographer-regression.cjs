#!/usr/bin/env node
'use strict';
/** V1114 real compiled TS regression – no network or external accounts. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1114-'));
const check=(label,fn)=>{fn();console.log('PASS V1114 '+label)};
try {
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc');}
 catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);}
 if(!compiler)throw Error('TypeScript compiler required; run npm ci first');
 const ts=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1114-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(ts.status,0,ts.stdout+'\n'+ts.stderr+'\n'+(ts.error?.message||''));
 const {DANCE_STYLES_V1114,normalizeDanceOptionsV1114,choreographDanceV1114,resolveDanceClipSuggestionV1114,
  syncDancePerformanceV1114,sampleDanceCueV1114}=require(path.join(folder,'lib/aiDanceChoreographerV1114.js'));
 const {CREW_IDS,CREW_DEFAULT,normalizeCrewSettings,stepCrew,newCrewState}=require(path.join(folder,'components/visualizer/sonicCrewDirector.js'));
 const {directAvatarPersonalityV1112,AVATAR_CAST_V1112}=require(path.join(folder,'lib/aiAvatarPersonalityV1112.js'));
 const {directPerformanceV1113}=require(path.join(folder,'lib/aiPerformanceDirectorV1113.js'));
 const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040,normalizeArenaShowPlanV1040}=require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const create=(genre='hard',cap=70,style='expressive',profile='natural',expression=50)=>{
  const plan=generateArenaShowPlanV1040({genre,title:'Bestehende Originalshow',durationMs:201000});
  const remix=localAiShowRemixV1106('Konzert',genre,cap);
  const cast=AVATAR_CAST_V1112.map(x=>({...x}));
  const personality=directAvatarPersonalityV1112(plan,remix,cast,cap);
  const performance=directPerformanceV1113(plan,personality,{mode:profile,expression,intensityCap:cap});
  return {plan,remix,personality,performance,dance:choreographDanceV1114(plan,performance,{style,intensityCap:cap})};
 };
 check('576 combinations across music genres, dance styles, director modes and safe intensity bounds',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of DANCE_STYLES_V1114)for(const profile of ['natural','dynamic','cinematic'])
    for(const expression of [20,50,80]){
     const {plan,performance,dance}=create(genre,cap,style,profile,expression);
     assert(dance,JSON.stringify({genre,cap,style,profile,expression}));
     assert.equal(dance.cues.length,7);
     assert.equal(dance.quality.performers,3);
     assert.equal(dance.quality.differentForms,4);
     assert(dance.quality.withinCap&&dance.quality.continuousTimeline&&dance.quality.safeTransitions);
     assert(dance.quality.individualClips>=3);
     assert.deepEqual(dance.cues.map(x=>[x.index,x.scene,x.start,x.end]),
      plan.segments.map((x,i)=>[i,x.scene,x.start,x.end]));
     assert(dance.cues.every(x=>x.members.length===3&&new Set(x.members.map(m=>m.id)).size===3));
     assert(dance.cues.every(x=>x.members.every(m=>m.energy<=cap&&m.energy>=0)));
     assert.equal(dance.cues[2].form,'canon');
     assert.deepEqual(dance.cues[2].members.map(m=>m.beatOffset),[0,2,4]);
     assert.equal(dance.cues[3].form,'duet');
     assert.equal(dance.cues[3].members.filter(m=>m.lead).length,2);
     assert.equal(dance.cues[6].dance,'peak');
     assert.equal(dance.cues[4].dance,'calm');
     const copied=syncDancePerformanceV1114(performance,dance);
     assert(copied);assert.equal(copied.cues[4].dance,'calm');
     const approved=applyAiShowRemixV1106(plan,dance.remix,cap);
     assert(approved);assert.deepEqual(approved.segments.map(x=>[x.id,x.start,x.end]),
      plan.segments.map(x=>[x.id,x.start,x.end]));
     assert.equal(approved.title,plan.title);assert.equal(approved.durationMs,plan.durationMs);
     count++;
    }
  assert.equal(count,576);
 });
 check('per-avatar choreography suggestions resolve only to real loaded animation names',()=>{
  const {plan,performance}=create('hard',70,'expressive');
  const ids=performance.cues[0].performers.map(x=>x.id);
  const availableClipsByMember={
   [ids[0]]:['idle_breathe','Dance_House'],
   [ids[1]]:['dance-house'],
   [ids[2]]:['Dance_FestivalBounce'],
  };
  const dance=choreographDanceV1114(plan,performance,{
   style:'expressive',intensityCap:70,availableClipsByMember,
  });
  assert(dance);
  assert.equal(dance.cues[0].members[0].clipSuggestion,'idle_breathe');
  assert.equal(dance.cues[0].members[1].clipSuggestion,'');
  assert.equal(dance.cues[0].members[2].clipSuggestion,'');
  assert.equal(dance.cues[1].members[0].clipSuggestion,'Dance_House');
  assert.equal(dance.cues[1].members[1].clipSuggestion,'dance-house');
  assert.equal(dance.cues[1].members[2].clipSuggestion,'Dance_FestivalBounce');
  const realNames=new Set(Object.values(availableClipsByMember).flat());
  assert(dance.cues.every(c=>c.members.every(m=>!m.clipSuggestion||realNames.has(m.clipSuggestion))));
  assert.equal(resolveDanceClipSuggestionV1114(['Dance_HipHop','Dance_House'],['dance-house']),'dance-house');
  assert.equal(resolveDanceClipSuggestionV1114(['Dance_HipHop'],['Idle_Breathe']),'');
  assert.equal(normalizeDanceOptionsV1114({style:'festival',intensityCap:70,
   availableClipsByMember:{avatar:['Dance_House',3]}}),null);
  assert.equal(normalizeDanceOptionsV1114({style:'festival',intensityCap:70,
   availableClipsByMember:{avatar:'Dance_House'}}),null);
 });
 check('four ensemble forms, meaningful spotlight rotation, read-only score sampling',()=>{
  const {dance}=create();assert(dance);
  assert.deepEqual([...new Set(dance.cues.map(c=>c.form))].sort(),['canon','duet','solo','unison']);
  assert.equal(dance.cues[1].members.filter(m=>m.lead).length,1);
  assert.equal(dance.cues[5].members.filter(m=>m.lead).length,1);
  const before=JSON.stringify(dance);
  assert.equal(sampleDanceCueV1114(dance,0).index,0);
  assert.equal(sampleDanceCueV1114(dance,dance.cues[0].end).index,1);
  assert.equal(sampleDanceCueV1114(dance,1).index,6);
  for(const x of [-1,1.0001,NaN,Infinity,null,'0.5',undefined])assert.equal(sampleDanceCueV1114(dance,x),null);
  assert.equal(JSON.stringify(dance),before);
 });
 check('new Stage Crew story mode changes ACTUAL embedded clip names by observed song sections',()=>{
  const settings=normalizeCrewSettings({enabled:true,reactions:true,mode:'story'});
  assert.equal(settings.mode,'story');
  const clips=['Idle_Breathe','Dance_NeonCircuit','Dance_FestivalFlow','Dance_PopLock','Dance_Groove','Dance_House','Dance_FestivalBounce','Dance_Techno'].map(name=>({name,duration:6}));
  const base={modelId:CREW_IDS[0],clips,trackId:'song-demo',progressMs:32000,bpm:120,
   energy:.8,genre:'rap',slot:0,count:3,playing:true,reducedMotion:false,manualPriority:false,settings};
  const run=(section,slot=0,patch={})=>stepCrew(newCrewState(),{...base,...patch,slot,
   modelId:CREW_IDS[slot],section}).plan;
  assert.equal(run('intro').clip,'Idle_Breathe');
  assert.equal(run('verse',0).clip,'Dance_House'); // non-leading spotlight slot uses the deterministic groove/house support pool
  assert.equal(run('hook',0).clip,'Dance_House');
  assert.equal(run('hook',1).offset,-2);
  assert.equal(run('hook',2).offset,-4);
  assert.equal(run('drop',0).clip,'Dance_FestivalBounce');
  assert.equal(run('drop',1).clip,'Dance_FestivalBounce');
  assert.equal(run('drop',2).clip,'Dance_FestivalBounce');
  assert.equal(run('hook',0,{manualPriority:true}).active,false);
  assert.equal(run('drop',0,{reducedMotion:true}).active,false);
  assert.equal(run('drop',0,{playing:false}).active,false);
  assert.equal(run('drop',0,{clips:[]}).active,false);
  assert.deepEqual(normalizeCrewSettings({mode:'unsafe',enabled:0}),CREW_DEFAULT);
  // Verify the names used by live story mode exist in the bundled real GLB files.
  for(const slug of ['neon-pulse','festival-nova','chrome-beat']){
   const asset=fs.readFileSync(path.join(root,'public/avatars/sonic',slug+'.glb'));
   for(const name of ['Dance_House','Dance_Groove','Dance_FestivalBounce','Idle_Breathe'])
    assert(asset.includes(Buffer.from(name)),slug+' missing real clip '+name);
  }
 });
 check('artificial or unsafe inputs rejected without mutating original plan',()=>{
  const {plan,performance}=create();const before=JSON.stringify(plan);
  const valid={style:'expressive',intensityCap:70};
  for(const opts of [null,[],{},
   {style:'unknown',intensityCap:70},
   {style:'festival',intensityCap:100},
   {style:'festival',intensityCap:20},
   {style:'festival',intensityCap:NaN},
   {style:'festival',intensityCap:70.5}]){
   assert.equal(normalizeDanceOptionsV1114(opts),null);
   assert.equal(choreographDanceV1114(plan,performance,opts),null);
  }
  assert.equal(choreographDanceV1114(null,performance,valid),null);
  assert.equal(choreographDanceV1114(plan,null,valid),null);
  assert.equal(choreographDanceV1114(plan,{...performance,cues:performance.cues.slice(1)},valid),null);
  assert.equal(choreographDanceV1114(plan,{...performance,cues:performance.cues.map((c,i)=>i===3?{...c,intensity:-3}:c)},valid),null);
  assert.equal(choreographDanceV1114(plan,{...performance,cues:performance.cues.map((c,i)=>i===3?{...c,performers:[c.performers[0],c.performers[0],c.performers[2]]}:c)},valid),null);
  assert.equal(JSON.stringify(plan),before);
  assert(normalizeArenaShowPlanV1040(plan));
  assert.equal(syncDancePerformanceV1114(null,null),null);
 });
 check('real show cue ignores paused, disabled, reduced-motion and keeps exact scene times',()=>{
  const {plan,dance}=create('hard',70,'festival');assert(dance);
  const approved=applyAiShowRemixV1106(plan,dance.remix,70);assert(approved);
  for(const c of dance.cues){
   const mid=(c.start+c.end)/2;const input={enabled:true,playing:true,reducedMotion:false,
    durationMs:plan.durationMs,progressMs:Math.round(mid*plan.durationMs)};
   assert.equal(sampleArenaShowPlanV1040(approved,input).dance,c.dance);
   assert.equal(sampleArenaShowPlanV1040(approved,{...input,playing:false}).active,false);
   assert.equal(sampleArenaShowPlanV1040(approved,{...input,reducedMotion:true}).active,false);
   assert.equal(sampleArenaShowPlanV1040(approved,{...input,enabled:false}).active,false);
  }
 });
 check('UI offers deliberate rehearsal, separate live crew opt-in, safe undo and Chromium coverage',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const crew=fs.readFileSync(path.join(root,'components/visualizer/SonicCrewControls.tsx'),'utf8');
  const browser=fs.readFileSync(path.join(root,'tests/e2e/ai-dance-choreographer-v1114.spec.cjs'),'utf8');
  for(const text of ['V1114 AI Dance Choreographer','V1114 Tanzchoreografie jetzt proben',
   'V1114 Dance Choreographer Partitur','V1114 sieben Tanzszenen',
   'V1114 Stage-Crew-Automatik für echte GLB-Clips aktivieren',
   'Früheren Stage-Crew-Modus wiederherstellen','choreographDanceV1114(base,performance',
   'setDancePreview(null)','Diese sieben Szenen in meinen Showplan übernehmen'])
   assert(ui.includes(text),'missing UI '+text);
  assert(crew.includes('<option value="story">V1114 Auto-Choreografie'));
  for(const text of ['v1114-dance-rehearsal-screenshot','v1114-crew-undo-screenshot'])assert(browser.includes(text));
  assert(!fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8').includes('aiDanceChoreographerV1114'));
 });
 console.log('PASS V1114 AI Dance Choreographer 4.0: 576 combinations, real GLB crew mode, safe timeline and opt-in');
} finally {fs.rmSync(folder,{recursive:true,force:true});}
