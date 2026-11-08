#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1112-'));
const check=(label,fn)=>{fn();console.log('PASS V1112 '+label)};
try{
 let tsc;
 try{tsc=require.resolve('typescript/bin/tsc');}
 catch{tsc=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync);}
 if(!tsc)throw Error('TypeScript compiler missing; run npm ci first');
 const build=spawnSync(process.execPath,[tsc,'-p',path.join(root,'tests/tsconfig.v1112-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(build.status,0,build.stdout+'\n'+build.stderr+'\n'+(build.error?.message||''));
 const {AVATAR_CAST_V1112,AVATAR_PERSONALITIES_V1112,normalizeAvatarCastV1112,
  directAvatarPersonalityV1112,sampleAvatarPersonalityV1112,syncPersonalityConductorV1112}=
  require(path.join(folder,'lib/aiAvatarPersonalityV1112.js'));
 const {generateArenaShowPlanV1040,sampleArenaShowPlanV1040}=
  require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106,normalizeAiShowRemixV1106}=
  require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 const {conductAiShowV1111}=require(path.join(folder,'lib/aiLiveShowConductorV1111.js'));
 const cast=()=>AVATAR_CAST_V1112.map(m=>({...m}));
 check('validates the three original GLBs and rejects unknown IDs, duplicate or malformed personas',()=>{
  assert.deepEqual(normalizeAvatarCastV1112(cast()),cast());
  for(const x of [null,{},[],cast().slice(0,2),[...cast(),cast()[0]],
   cast().map((a,i)=>i===0?{...a,id:'https://fake-avatar.invalid/'}:a),
   cast().map((a,i)=>i===0?{...a,personality:'drop-strobe'}:a),
   cast().map((a,i)=>i===0?{...a,label:'Injected <html>'}:a),
   [cast()[1],cast()[0],cast()[2]],
   cast().map((a,i)=>i===1?{...a,id:cast()[0].id}:a)]){
   assert.equal(normalizeAvatarCastV1112(x),null);
  }
 });
 check('1024 genre/personality/cap combinations keep approved show structure and bounded cues',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,70,85])
   for(const a of AVATAR_PERSONALITIES_V1112)for(const b of AVATAR_PERSONALITIES_V1112)
   for(const c of AVATAR_PERSONALITIES_V1112){
    const original=generateArenaShowPlanV1040({genre,title:'Original title',durationMs:234000});
    const source=localAiShowRemixV1106('Konzert','rap',cap);
    const proposal=conductAiShowV1111(original,source,{mode:'cinematic',intensityCap:cap,surprise:true});
    assert(proposal);
    const members=cast();members[0].personality=a;members[1].personality=b;members[2].personality=c;
    const unchanged=[JSON.stringify(original),JSON.stringify(proposal.remix),JSON.stringify(members)];
    const result=directAvatarPersonalityV1112(original,proposal.remix,members,cap);
    assert(result,'rejected '+genre+cap+a+b+c);
    assert(normalizeAiShowRemixV1106(result.remix));
    assert.equal(result.cues.length,7);assert.equal(result.quality.featuredPerformers,3);
    assert.equal(result.quality.ensembleMoments,2);
    assert(result.quality.safeTransitions&&result.quality.continuousTimeline);
    assert.equal(result.cues[0].dance,'calm');assert.equal(result.cues[4].dance,'calm');
    assert.equal(result.cues[3].dance,'group');assert.equal(result.cues[6].dance,'peak');
    assert.equal(result.cues[3].camera,'group');assert.equal(result.cues[6].camera,'group');
    assert.equal(result.cues[1].focusId,members[0].id);
    assert.equal(result.cues[2].focusId,members[1].id);
    assert.equal(result.cues[5].focusId,members[2].id);
    const applied=applyAiShowRemixV1106(original,result.remix,cap);assert(applied);
    assert.deepEqual(applied.segments.map(s=>[s.id,s.scene,s.start,s.end]),
     original.segments.map(s=>[s.id,s.scene,s.start,s.end]));
    assert.equal(applied.title,original.title);assert.equal(applied.durationMs,original.durationMs);
    assert(result.cues.every((cue,i)=>cue.camera===result.remix.acts[i].camera&&
     cue.dance===result.remix.acts[i].dance&&cue.intensity===result.remix.acts[i].intensity&&
     cue.intensity<=cap&&cue.performers.length===3));
    assert.deepEqual([JSON.stringify(original),JSON.stringify(proposal.remix),JSON.stringify(members)],unchanged);
    count++;
   }
  assert.equal(count,1024);
 });
 check('each personality has visible camera/dance differences on real authored scene',()=>{
  const plan=generateArenaShowPlanV1040({genre:'rap'});
  const show=localAiShowRemixV1106('Show','rap',70);
  const variants=AVATAR_PERSONALITIES_V1112.map(personality=>{
   const members=cast();members[0].personality=personality;
   return directAvatarPersonalityV1112(plan,show,members,70);
  });
  assert(variants.every(Boolean));
  const distinct=new Set(variants.map(x=>x.cues[1].camera+'/'+x.cues[1].dance));
  assert(distinct.size>=3);
  assert(variants[1].cues[1].dance==='peak');
  assert(variants[3].cues[1].dance==='calm');
 });
 check('stable sampling follows hand-authored timings and is read-only',()=>{
  const plan=generateArenaShowPlanV1040({genre:'rock',durationMs:400000});
  const show=directAvatarPersonalityV1112(plan,localAiShowRemixV1106('Show','rock',70),cast(),70);
  assert(show);
  for(const p of [0,.05,.17,.33,.5,.75,.999,1]){
   const sampled=sampleAvatarPersonalityV1112(show,p);assert(sampled);
   assert.equal(sampled.index,Math.min(6,plan.segments.findIndex(s=>p<s.end)<0?6:plan.segments.findIndex(s=>p<s.end)));
  }
  for(const p of [-1,1.01,NaN,Infinity,'0.3',null,undefined])
   assert.equal(sampleAvatarPersonalityV1112(show,p),null);
  assert.equal(sampleAvatarPersonalityV1112(null,.5),null);
 });
 check('rehearsal can be synchronized with V1111, approved playback still obeys safety gates',()=>{
  const plan=generateArenaShowPlanV1040({genre:'hard'});
  const original=conductAiShowV1111(plan,localAiShowRemixV1106('Hardtekk','hard',70),
   {mode:'festival',intensityCap:70,surprise:true});assert(original);
  const profile=directAvatarPersonalityV1112(plan,original.remix,cast(),70);assert(profile);
  const aligned=syncPersonalityConductorV1112(original,profile);assert(aligned);
  assert.deepEqual(aligned.cues.map(c=>[c.camera,c.dance]),profile.cues.map(c=>[c.camera,c.dance]));
  assert.equal(aligned.quality.synchronizedActs,7);
  const applied=applyAiShowRemixV1106(plan,profile.remix,70);assert(applied);
  for(let index=0;index<7;index++){
   const p=(plan.segments[index].start+plan.segments[index].end)/2;
   const args={enabled:true,playing:true,reducedMotion:false,
    durationMs:plan.durationMs,progressMs:Math.floor(p*plan.durationMs)};
   const cue=sampleArenaShowPlanV1040(applied,args);assert(cue.active);
   assert.equal(cue.camera,profile.cues[index].camera);
   assert.equal(cue.dance,profile.cues[index].dance);
   assert.equal(sampleArenaShowPlanV1040(applied,{...args,playing:false}).active,false);
   assert.equal(sampleArenaShowPlanV1040(applied,{...args,reducedMotion:true}).active,false);
   assert.equal(sampleArenaShowPlanV1040(applied,{...args,enabled:false}).active,false);
  }
 });
 check('rejects unsafe cap, invalid source and forged actor roles without writes',()=>{
  const plan=generateArenaShowPlanV1040({genre:'hard'});
  const remix=localAiShowRemixV1106('Show','hard',70);
  for(const cap of [-1,29,86,100,NaN,Infinity,70.5,'70'])
   assert.equal(directAvatarPersonalityV1112(plan,remix,cast(),cap),null);
  assert.equal(directAvatarPersonalityV1112(null,remix,cast(),70),null);
  assert.equal(directAvatarPersonalityV1112(plan,null,cast(),70),null);
  assert.equal(directAvatarPersonalityV1112(plan,{...remix,acts:remix.acts.slice(1)},cast(),70),null);
  assert.equal(directAvatarPersonalityV1112({...plan,segments:plan.segments.slice(1)},remix,cast(),70),null);
  assert.equal(syncPersonalityConductorV1112(null,null),null);
 });
 check('UI provides explicit preview/consent, three selectors and real Chromium tests',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const api=fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8');
  const browser=fs.readFileSync(path.join(root,'tests/e2e/ai-avatar-personality-v1112.spec.cjs'),'utf8');
  for(const fragment of ['V1112 AI Avatar Personality','directAvatarPersonalityV1112(base,staged,cast,cap)',
   'V1112 Avatar-Performance jetzt proben','V1112 Avatar Personality Partitur',
   'V1112 sieben Charakter-Szenen','setPersonalityPreview(null)',
   'Diese sieben Szenen in meinen Showplan übernehmen','Letzten Remix rückgängig machen'])
    assert(ui.includes(fragment),fragment);
  assert(!api.includes('aiAvatarPersonalityV1112'));
  for(const fragment of ['v1112-personality-rehearsal-screenshot','v1112-personality-approved-undo-screenshot'])
   assert(browser.includes(fragment));
 });
 console.log('PASS V1112 AI Avatar Personality · typed cast profiles, safe show cues and browser coverage');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
