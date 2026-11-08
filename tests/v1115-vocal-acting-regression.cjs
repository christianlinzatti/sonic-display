#!/usr/bin/env node
'use strict';
/** Compile actual TypeScript and test the V1115 score, safe presets and UI wiring. */
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),folder=fs.mkdtempSync(path.join(os.tmpdir(),'sonic-v1115-'));
const check=(name,fn)=>{fn();console.log('PASS V1115 '+name)};
try{
 let compiler;
 try{compiler=require.resolve('typescript/bin/tsc')}
 catch{compiler=require('node:module').globalPaths.map(p=>path.join(p,'typescript/bin/tsc.js')).find(fs.existsSync)}
 if(!compiler)throw Error('Missing TypeScript compiler: run npm ci');
 const compile=spawnSync(process.execPath,[compiler,'-p',path.join(root,'tests/tsconfig.v1115-core.json'),
  '--noEmit','false','--module','commonjs','--moduleResolution','node','--outDir',folder],
  {cwd:root,encoding:'utf8',timeout:90000,windowsHide:true});
 assert.equal(compile.status,0,compile.stdout+'\n'+compile.stderr+'\n'+(compile.error?.message||''));
 const {VOCAL_STYLES_V1115,normalizeVocalOptionsV1115,directVocalActingV1115,
  sampleVocalCueV1115,vocalPresetV1115}=require(path.join(folder,'lib/aiVocalActingV1115.js'));
 const {AVATAR_CAST_V1112,directAvatarPersonalityV1112}=require(path.join(folder,'lib/aiAvatarPersonalityV1112.js'));
 const {directPerformanceV1113,syncPerformancePersonalityV1113}=require(path.join(folder,'lib/aiPerformanceDirectorV1113.js'));
 const {choreographDanceV1114,syncDancePerformanceV1114}=require(path.join(folder,'lib/aiDanceChoreographerV1114.js'));
 const {generateArenaShowPlanV1040}=require(path.join(folder,'lib/arena360ShowDesignerV1040.js'));
 const {localAiShowRemixV1106,applyAiShowRemixV1106}=require(path.join(folder,'lib/arena360AiShowRemixV1106.js'));
 function create(genre='rap',cap=70,style='rap',expression=50,danceStyle='expressive'){
  const plan=generateArenaShowPlanV1040({genre,title:'Originalsong',durationMs:189000});
  const remix=localAiShowRemixV1106('Konzert',genre,cap);
  const personality=directAvatarPersonalityV1112(plan,remix,AVATAR_CAST_V1112.map(x=>({...x})),cap);
  const performance=directPerformanceV1113(plan,personality,{mode:'natural',expression:50,intensityCap:cap});
  const dance=choreographDanceV1114(plan,performance,{style:danceStyle,intensityCap:cap});
  const aligned=syncDancePerformanceV1114(performance,dance);
  return {plan,remix,personality,performance:aligned,dance,
   vocal:directVocalActingV1115(plan,aligned,dance,{style,expression,intensityCap:cap})};
 }
 check('192 valid combinations; real cue alignment, energy caps, varied stage roles',()=>{
  let count=0;
  for(const genre of ['rap','hard','rock','pop'])for(const cap of [30,45,65,85])
   for(const style of VOCAL_STYLES_V1115)for(const expression of [20,50,70,80]){
    const {plan,vocal,dance}=create(genre,cap,style,expression);
    assert(vocal,JSON.stringify({genre,cap,style,expression}));
    assert.equal(vocal.cues.length,7);
    assert.equal(vocal.quality.performers,3);
    assert(vocal.quality.continuousTimeline&&vocal.quality.safeEnergy&&vocal.quality.roleChanges);
    assert.equal(vocal.quality.verifiedSingerAssignments,0);
    assert.deepEqual(vocal.cues.map(c=>[c.index,c.scene,c.start,c.end]),plan.segments.map((s,i)=>[i,s.scene,s.start,s.end]));
    assert(vocal.cues.every(c=>c.members.length===3&&c.members.every(m=>m.energy<=cap&&m.lipSource==='existing-lyric-engine'&&m.hasVerifiedSingerAssignment===false)));
    assert(vocal.cues[3].members.filter(m=>m.act==='duet').length===2);
    assert(vocal.cues[4].members.every(m=>m.act==='breath'));
    assert.equal(vocal.cues[6].intent,'drop');
    const saved=applyAiShowRemixV1106(plan,dance.remix,cap);
    assert(saved);assert.equal(saved.durationMs,plan.durationMs);
    assert.deepEqual(saved.segments.map(s=>[s.id,s.start,s.end]),plan.segments.map(s=>[s.id,s.start,s.end]));
    count++;
   }
  assert.equal(count,192);
 });
 check('lip-sync preset controls ONLY existing bounded preference fields',()=>{
  for(const style of VOCAL_STYLES_V1115)for(const expression of [20,50,80]){
   const p=vocalPresetV1115({style,expression,intensityCap:70});assert(p);
   assert.equal(p.avatarLipSyncMode,'lyrics');assert.equal(p.avatarLipSyncEnabled,true);
   assert(p.avatarFacialExpressionV368<=65&&p.avatarFacialExpressionV368>=20);
   assert(p.avatarVocalBodyStrengthV371<=70&&p.avatarVocalCoordinationStrengthV372<=75);
   assert.equal(p.avatarVocalStyleV368,style==='rap'?'rap':style==='melodic'?'singing':'auto');
   assert(!Object.keys(p).some(k=>/manual|assign|viseme|stem|microphone|govee|audio/i.test(k)));
  }
 });
 check('malformed inputs and fake singer/cast timings rejected without mutation',()=>{
  const {plan,performance,dance}=create(); const snap=JSON.stringify(plan);
  for(const invalid of [null,[],{},
   {style:'noise',expression:50,intensityCap:70},
   {style:'rap',expression:75,intensityCap:70},
   {style:'rap',expression:80,intensityCap:99},
   {style:'rap',expression:50,intensityCap:NaN},
   {style:'rap',expression:'50',intensityCap:70}]){
   assert.equal(normalizeVocalOptionsV1115(invalid),null);
   assert.equal(vocalPresetV1115(invalid),null);
   assert.equal(directVocalActingV1115(plan,performance,dance,invalid),null);
  }
  const valid={style:'rap',expression:50,intensityCap:70};
  assert.equal(directVocalActingV1115(null,performance,dance,valid),null);
  assert.equal(directVocalActingV1115(plan,null,dance,valid),null);
  assert.equal(directVocalActingV1115(plan,performance,null,valid),null);
  assert.equal(directVocalActingV1115(plan,{...performance,cues:performance.cues.slice(1)},dance,valid),null);
  assert.equal(directVocalActingV1115(plan,{...performance,cues:performance.cues.map((c,i)=>i===3?{...c,performers:[c.performers[0],c.performers[0],c.performers[2]]}:c)},dance,valid),null);
  assert.equal(directVocalActingV1115(plan,performance,{...dance,cues:dance.cues.map((c,i)=>i===2?{...c,start:.2}:c)},valid),null);
  assert.equal(JSON.stringify(plan),snap);
 });
 check('read-only preview scrubbing follows exact song boundaries',()=>{
  const {vocal}=create();assert(vocal);
  const source=JSON.stringify(vocal);
  assert.equal(sampleVocalCueV1115(vocal,0).index,0);
  assert.equal(sampleVocalCueV1115(vocal,vocal.cues[0].end).index,1);
  assert.equal(sampleVocalCueV1115(vocal,1).index,6);
  for(const value of [-1,1.1,NaN,Infinity,undefined,null,'0.5'])assert.equal(sampleVocalCueV1115(vocal,value),null);
  assert.equal(JSON.stringify(vocal),source);
 });
 check('bundled Stage Crew rigs have no invented mouth morphs, visemes or jaw bones',()=>{
  for(const name of ['neon-pulse','festival-nova','chrome-beat']){
   const b=fs.readFileSync(path.join(root,'public/avatars/sonic',name+'.glb'));
   const jsonLength=b.readUInt32LE(12),gltf=JSON.parse(b.subarray(20,20+jsonLength).toString('utf8').trim());
   assert(gltf.animations.some(a=>a.name==='Dance_Groove'));
   assert(gltf.nodes.some(n=>n.name==='Head'));
   assert(!gltf.nodes.some(n=>/jaw|mouth/i.test(n.name??'')));
   assert(!gltf.meshes.some(m=>(m.primitives||[]).some(p=>Array.isArray(p.targets)&&p.targets.length>0)));
  }
 });
 check('explicit settings consent, conflict-safe undo and browser tests are wired',()=>{
  const ui=fs.readFileSync(path.join(root,'components/visualizer/AiShowRemixPanelV1106.tsx'),'utf8');
  const e2e=fs.readFileSync(path.join(root,'tests/e2e/ai-vocal-acting-v1115.spec.cjs'),'utf8');
  for(const part of ['V1115 AI Vocal Acting','V1115 Vocal Acting jetzt proben',
   'V1115 Vocal Acting Partitur','V1115 sieben Vocal-Szenen',
   'V1115 Vocal-Preset für vorhandene Lip-Sync-Engine aktivieren',
   'Frühere Vocal-Regler wiederherstellen','signature!==baseSignature',
   'preferences.reducedMotion','vocalUndo.current','withVocal('])assert(ui.includes(part),part);
  assert(!fs.readFileSync(path.join(root,'app/api/ai/show-remix/route.ts'),'utf8').includes('aiVocalActingV1115'));
  assert(e2e.includes('v1115-vocal-score-screenshot')&&e2e.includes('v1115-vocal-preset-undo-screenshot'));
 });
 console.log('PASS V1115: 192 valid combinations, bounded existing lyric controls, no fake singer identification');
}finally{fs.rmSync(folder,{recursive:true,force:true});}
