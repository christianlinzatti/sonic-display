#!/usr/bin/env node
'use strict';
/** Compile the real TS implementation: verify interactions, safety and real UI wiring. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1116-'));
const check=(label,fn)=>{fn();console.log('PASS V1116 '+label)};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc')}catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync)}
 if(!compiler)throw Error('Missing TypeScript compiler: npm ci required');
 const build=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1116-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(build.status,0,build.stdout+'\n'+build.stderr+'\n'+(build.error?.message||''));
 const {INTERACTION_STYLES_V1116,normalizeInteractionOptionsV1116,directArtistInteractionV1116,
  liveArtistPresetV1116,sampleInteractionCueV1116}=require(path.join(folder,'lib/aiArtistInteractionV1116.js'));
 const {AVATAR_CAST_V1112,directAvatarPersonalityV1112}=require(path.join(folder,'lib/aiAvatarPersonalityV1112.js'));
 const {directPerformanceV1113}=require(path.join(folder,'lib/aiPerformanceDirectorV1113.js'));
 const {choreographDanceV1114,syncDancePerformanceV1114}=require(path.join(folder,'lib/aiDanceChoreographerV1114.js'));
 const {directVocalActingV1115}=require(path.join(folder,'lib/aiVocalActingV1115.js'));
 const {generateArenaShowPlanV1040}=require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const create=(genre='rap',cap=70,style='dialogue',strength=50)=>{
  const base=generateArenaShowPlanV1040({genre,title:'Song',durationMs:213000});
  const remix=localAiShowRemixV1106('Show',genre,cap);
  const personality=directAvatarPersonalityV1112(base,remix,AVATAR_CAST_V1112.map(x=>({...x})),cap);
  const performance=directPerformanceV1113(base,personality,{mode:'natural',expression:50,intensityCap:cap});
  const dance=choreographDanceV1114(base,performance,{style:'expressive',intensityCap:cap});
  const aligned=syncDancePerformanceV1114(performance,dance);
  const vocal=directVocalActingV1115(base,aligned,dance,{style:'rap',expression:50,intensityCap:cap});
  return {base,performance:aligned,dance,vocal,show:directArtistInteractionV1116(base,aligned,dance,vocal,{style,strength,intensityCap:cap})};
 };
 check('256 genre/style/cap/strength combinations preserve timeline, cast, devices and song identity',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of INTERACTION_STYLES_V1116)for(const strength of [20,40,60,80]){
    const {base,show,dance}=create(genre,cap,style,strength);
    assert(show,JSON.stringify({genre,cap,style,strength}));
    assert.equal(show.cues.length,7);assert.equal(show.quality.performers,3);
    assert(show.quality.continuousTimeline&&show.quality.safeIntensity&&show.quality.leadChanges>=2);
    assert(show.quality.partnerMoments>=3&&show.quality.cameraVariety>=3&&show.quality.quietMoments>=2);
    assert.equal(show.quality.verifiedSingerAssignments,0);assert.equal(show.quality.physicalEyeTracking,false);
    assert.deepEqual(show.cues.map(c=>[c.index,c.scene,c.start,c.end]),base.segments.map((s,i)=>[i,s.scene,s.start,s.end]));
    assert(show.cues.every(c=>!c.physicalLookAt&&!c.verifiedSinger&&c.cueSource==='planned-timeline'&&c.intensity<=cap));
    assert(show.cues.filter(c=>c.partnerId).every(c=>c.leadId!==c.partnerId&&c.observerId!==c.leadId&&c.observerId!==c.partnerId));
    const saved=applyAiShowRemixV1106(base,show.remix,cap);
    assert(saved);assert.equal(saved.durationMs,base.durationMs);
    assert.deepEqual(saved.segments.map(s=>[s.id,s.start,s.end]),base.segments.map(s=>[s.id,s.start,s.end]));
    for(let i=0;i<7;i++){
     assert.equal(saved.segments[i].lasers,dance.remix.acts[i].lasers);
     assert.equal(show.remix.acts[i].dance,dance.remix.acts[i].dance);
     assert.equal(show.remix.acts[i].floating,dance.remix.acts[i].floating);
     assert.equal(show.remix.acts[i].deck,dance.remix.acts[i].deck);
     assert.equal(show.remix.acts[i].intensity,dance.remix.acts[i].intensity);
    }
    count++;
   }
  assert.equal(count,256);
 });
 check('all interaction modes produce distinct live rehearsal forms, including safe breath',()=>{
  const cases=INTERACTION_STYLES_V1116.map(style=>create('rap',70,style,50).show.cues.map(c=>c.kind).join('|'));
  assert.equal(new Set(cases).size,4);
  for(const style of INTERACTION_STYLES_V1116){
   const cues=create('rap',70,style,50).show.cues;
   assert.equal(cues[4].kind,'breath');assert.equal(cues[0].kind,'entrance');
   assert.equal(cues[6].kind,'ensemble');
   assert(cues.some(c=>['duet','response','challenge','handoff'].includes(c.kind)));
  }
 });
 check('reject malformed options and stale, contradictory or invented cues without mutation',()=>{
  const {base,performance,dance,vocal}=create(); const original=JSON.stringify(base);
  const valid={style:'dialogue',strength:50,intensityCap:70};
  for(const wrong of [undefined,null,[],{},
   {style:'unknown',strength:50,intensityCap:70},
   {style:'dialogue',strength:45,intensityCap:70},
   {style:'dialogue',strength:100,intensityCap:70},
   {style:'dialogue',strength:50,intensityCap:99},
   {style:'dialogue',strength:'50',intensityCap:70}]){
   assert.equal(normalizeInteractionOptionsV1116(wrong),null);
   assert.equal(directArtistInteractionV1116(base,performance,dance,vocal,wrong),null);
   assert.equal(liveArtistPresetV1116(wrong),null);
  }
  assert.equal(directArtistInteractionV1116(null,performance,dance,vocal,valid),null);
  assert.equal(directArtistInteractionV1116(base,null,dance,vocal,valid),null);
  assert.equal(directArtistInteractionV1116(base,performance,null,vocal,valid),null);
  assert.equal(directArtistInteractionV1116(base,performance,dance,null,valid),null);
  assert.equal(directArtistInteractionV1116(base,{...performance,cues:performance.cues.slice(1)},dance,vocal,valid),null);
  assert.equal(directArtistInteractionV1116(base,performance,{...dance,cues:dance.cues.map((c,i)=>i===3?{...c,start:.17}:c)},vocal,valid),null);
  assert.equal(directArtistInteractionV1116(base,performance,dance,{...vocal,cues:vocal.cues.map((c,i)=>i===2?{...c,members:c.members.map((m,j)=>j===0?{...m,hasVerifiedSingerAssignment:true}:m)}:c)},valid),null);
  assert.equal(JSON.stringify(base),original);
 });
 check('existing V1079 is the ONLY live output and is intensity bounded',()=>{
  for(const style of INTERACTION_STYLES_V1116)for(const cap of [30,70,85])for(const strength of [20,50,80]){
   const p=liveArtistPresetV1116({style,intensityCap:cap,strength});
   assert(p&&p.arenaLiveArtistEnabledV1079);
   assert(p.arenaLiveArtistStrengthV1079>=20&&p.arenaLiveArtistStrengthV1079<=cap);
   assert.deepEqual(Object.keys(p).sort(),['arenaLiveArtistEnabledV1079','arenaLiveArtistStrengthV1079']);
  }
  const v1079=fs.readFileSync(path.join(root,'lib/arena360LiveArtistInteractionV1079.ts'),'utf8');
  assert(v1079.includes('lyric'));assert(v1079.includes('reducedMotion'));
 });
 check('sampling obeys exact scene boundaries and never mutates data',()=>{
  const {show}=create();const snap=JSON.stringify(show);
  assert.equal(sampleInteractionCueV1116(show,0).index,0);
  assert.equal(sampleInteractionCueV1116(show,show.cues[2].start).index,2);
  assert.equal(sampleInteractionCueV1116(show,1).index,6);
  for(const p of [-1,1.1,NaN,Infinity,null,undefined,'0.4'])assert.equal(sampleInteractionCueV1116(show,p),null);
  assert.equal(JSON.stringify(show),snap);
 });
 check('UI opt-in/undo, old V1115, browser screenshots and no new server AI calls',()=>{
  const source=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const e2e=fs.readFileSync(path.join(root,'tests/e2e/ai-artist-interaction-v1116.spec.cjs'),'utf8');
  for(const token of ['V1116 AI Artist Interaction','V1116 Künstlerinteraktionen jetzt proben',
    'V1116 Artist Interaction Partitur','V1116 sieben Künstlerinteraktionen',
    'V1116 vorhandene Live-Artist-Interaktion aktivieren','Frühere Live-Interaktion wiederherstellen',
    'interactionUndo.current','signature!==baseSignature','preferences.reducedMotion',
    'withInteraction(','V1115 AI Vocal Acting','vocalPresetV1115'])assert(source.includes(token),token);
  assert(e2e.includes('v1116-score-screenshot')&&e2e.includes('v1116-live-consent-undo-screenshot'));
  assert(!fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8').includes('aiArtistInteractionV1116'));
 });
 console.log('PASS V1116: 256 controlled combinations, stage-cue handoffs and opt-in V1079 live interactions');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
