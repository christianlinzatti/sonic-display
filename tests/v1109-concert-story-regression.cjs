#!/usr/bin/env node
'use strict';
/** V1109: executable deterministic narrative tests, no network or credentials. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const temp=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1109-'));
const check=(name,fn)=>{fn();console.log('PASS V1109 '+name)};
try{
 let tscScript;
 try{tscScript=require.resolve('typescript/bin/tsc');}
 catch{tscScript=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);}
 if(!tscScript)throw Error('TypeScript compiler unavailable; install dependencies with npm ci');
 fs.mkdirSync(path.join(temp,'type-roots'),{recursive:true});
 const compiler=spawnSync(process.execPath,[tscScript,'--typeRoots',path.join(temp,'type-roots'),'-p',path.join(root,'tests/tsconfig.v1109-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',temp],
 {cwd:root,encoding:'utf8',timeout:60000,windowsHide:true});
 assert.equal(compiler.status,0,compiler.stderr+'\n'+compiler.stdout+' '+(compiler.error?.message||''));
 const {composeConcertStoryV1109,normalizeConcertStoryOptionsV1109,STORY_ARCS_V1109,STORY_PACING_V1109}=require(path.join(temp,'lib/aiConcertStoryV1109.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106,normalizeAiShowRemixV1106}=require(path.join(temp,'lib/arena360AiShowRemixV1106.js'));
 const {generateArenaShowPlanV1040,normalizeArenaShowPlanV1040,sampleArenaShowPlanV1040}=require(path.join(temp,'lib/arena360ShowDesignerV1040.js'));
 check('all 4 arcs, 3 timings, 4 genres and 6 caps generate safe seven-act timelines',()=>{
  let total=0;
  for(const arc of STORY_ARCS_V1109)for(const pacing of STORY_PACING_V1109)
   for(const genre of ['rap','hard','rock','pop'])for(const intensityCap of [30,35,45,60,70,85]){
    const base=generateArenaShowPlanV1040({genre,durationMs:270000,title:'Meine Show'});
    const initial=localAiShowRemixV1106('Atmosphärischer Aufbau und großes Finale',genre,intensityCap);
    const before=JSON.stringify(base);
    const options={arc,pacing,intensityCap};
    const result=composeConcertStoryV1109(base,initial,options);
    assert(result,JSON.stringify({genre,...options}));
    assert.equal(result.remix.acts.length,7);assert.equal(result.beats.length,7);
    assert(normalizeAiShowRemixV1106(result.remix));
    assert(result.remix.acts.every(act=>act.intensity<=intensityCap));
    assert(result.quality.safeTransitions&&result.quality.continuousTimeline);
    assert(result.quality.quietMoments>=2);
    assert(result.quality.cameraVariety>=3);
    assert(result.quality.stageVariety>=3);
    assert(result.quality.dramaticRange>0);
    assert.deepEqual(result.beats.map(x=>x.scene),base.segments.map(x=>x.scene));
    assert.deepEqual(result.beats.map(x=>[x.start,x.end]),base.segments.map(x=>[x.start,x.end]));
    assert(result.beats.every(x=>x.description.length>8&&x.title.length>2));
    assert.equal(JSON.stringify(base),before,'Composer may not mutate the base or its timings');
    assert(result.remix.acts.every(a=>a.note.length<=145));
    total++;
   }
  assert.equal(total,288);
 });
 check('arcs and pacing materially change the dramatic shape',()=>{
  const plan=generateArenaShowPlanV1040({genre:'hard'});
  const src=localAiShowRemixV1106('dramatic','hard',80);
  const levels=(arc,pacing)=>composeConcertStoryV1109(plan,src,{arc,pacing,intensityCap:80}).remix.acts.map(a=>a.intensity);
  assert.equal(new Set(STORY_ARCS_V1109.map(arc=>levels(arc,'balanced').join(','))).size,4);
  assert.equal(new Set(STORY_PACING_V1109.map(pacing=>levels('crescendo',pacing).join(','))).size,3);
  const crescendo=levels('crescendo','balanced');
  assert(crescendo[0]<crescendo[1]&&crescendo[1]<crescendo[2]&&crescendo[2]<crescendo[3]);
  assert(crescendo[4]<crescendo[3]&&crescendo[6]>=crescendo[5]);
 });
 check('custom timeline boundaries, IDs, user duration and title remain intact on apply',()=>{
  let plan=generateArenaShowPlanV1040({genre:'rap',durationMs:297000,title:'Meine 360° Show'});
  plan={...plan,segments:plan.segments.map((s,i)=>i===0?{...s,end:.12}:i===1?{...s,start:.12}:s)};
  assert(normalizeArenaShowPlanV1040(plan));
  const before=JSON.stringify(plan);
  const story=composeConcertStoryV1109(plan,localAiShowRemixV1106('cinematic','rap',75),
   {arc:'mystery',pacing:'slow-burn',intensityCap:65});
  assert(story);
  const next=applyAiShowRemixV1106(plan,story.remix,65);
  assert(next);assert.equal(next.title,plan.title);assert.equal(next.durationMs,297000);
  assert.deepEqual(next.segments.map(x=>[x.id,x.scene,x.start,x.end]),plan.segments.map(x=>[x.id,x.scene,x.start,x.end]));
  assert.equal(JSON.stringify(plan),before);
  assert.equal(sampleArenaShowPlanV1040(next,{enabled:true,playing:false,reducedMotion:false,progressMs:250000,durationMs:297000}).active,false);
  assert.equal(sampleArenaShowPlanV1040(next,{enabled:true,playing:true,reducedMotion:true,progressMs:250000,durationMs:297000}).active,false);
 });
 check('malformed inputs, dangerous scenes, huge values and discontinuous timelines fail closed',()=>{
  const plan=generateArenaShowPlanV1040({genre:'hard'});
  const src=localAiShowRemixV1106('drama','hard',70);
  const good={arc:'crescendo',pacing:'balanced',intensityCap:70};
  for(const options of [null,{},[],{...good,arc:'drop'}, {...good,pacing:'off'},
   {...good,intensityCap:100},{...good,intensityCap:0},{...good,intensityCap:Infinity},
   {...good,intensityCap:60.5},{...good,intensityCap:'70'}]){
   assert.equal(normalizeConcertStoryOptionsV1109(options),null);
   assert.equal(composeConcertStoryV1109(plan,src,options),null);
  }
  for(const bad of [null,{}, {...src,acts:src.acts.slice(1)},
   {...src,acts:src.acts.map((a,i)=>i===1?{...a,lasers:'device-command'}:a)},
   {...src,acts:src.acts.map((a,i)=>i===1?{...a,intensity:NaN}:a)}])
   assert.equal(composeConcertStoryV1109(plan,bad,good),null);
  const invalid={...plan,segments:plan.segments.map((s,i)=>i===2?{...s,start:.20}:s)};
  assert.equal(composeConcertStoryV1109(invalid,src,good),null);
  assert.equal(composeConcertStoryV1109(null,src,good),null);
 });
 check('real UI integrates explicit preview, OpenAI opt-in and undo without new device writes',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const api=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
  for(const key of ['composeConcertStoryV1109(base,remix,storyOptions())',
   'Storybogen lokal entwerfen','V1109 Storybogen Vorschau','V1109 sieben Storyphasen',
   'setStoryPreview(stagedStory?syncDropStoryV1110(stagedStory,lighting?.remix??camera?.remix??holo?.remix??stage?.remix??finalRemix):null)',
   'storyEnabled?storyFor(proposal):null',
   'updatePreferences({arenaShowPlanV1040:result})','Letzten Remix rückgängig machen'])
   assert(ui.includes(key),`Missing V1109 integration ${key}`);
  assert(!ui.includes('fetch(\'/api/govee/'));
  assert(!ui.includes('NEXT_PUBLIC_OPENAI_API_KEY'));
  assert(!api.includes('aiConcertStoryV1109'));
  const e2e=fs.readFileSync(path.join(root,'tests/e2e/ai-concert-story-v1109.spec.cjs'),'utf8');
  assert(e2e.includes('v1109-story-preview-screenshot'));
  assert(e2e.includes('v1109-story-undo-screenshot'));
 });
 console.log('PASS V1109 AI Concert Story Engine · all safety and narrative integration groups');
}finally{fs.rmSync(temp,{recursive:true,force:true})}
