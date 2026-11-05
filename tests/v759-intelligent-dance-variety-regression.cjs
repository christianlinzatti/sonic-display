'use strict';
const a=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const ts=require('./typescript-loader.cjs');const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const f='components/visualizer/intelligentDanceVarietyV759.ts';
const compiled=ts.transpileModule(read(f),{fileName:f,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
a.equal(compiled.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
const m={exports:{}};new Function('module','exports','require',compiled.outputText)(m,m.exports,()=>{throw Error('runtime import unexpected');});
const v=m.exports;let checks=0;function ok(c,message){a.ok(c,message);checks++}function eq(x,y,message){a.deepEqual(x,y,message);checks++}
const channels=['headNod','shoulderRoll','chestPulse','armSwing','spineSway','followThrough','torsoTwist','counterArm','leftArmAccent','rightArmAccent'];
const original={headNod:.25,headTurn:.4,shoulderRoll:.2,chestPulse:.35,armSwing:.28,spineSway:.1,followThrough:.12,torsoTwist:.04,counterArm:.06,leftArmAccent:.05,rightArmAccent:.07,hipSway:.6,footStep:.7,legGroove:.3,weightShift:.9,beatImpulse:.1,headLag:.15,expressionJaw:.55,expressionBrow:.44,expressionEyeNarrow:.02,expressionHeadTilt:.05,hipRoll:.2,hipVertical:-.05,hipLateral:.03,naturalLeftLeg:.13,naturalRightAnkle:.1};
const input={trackId:'song-A',modelId:'glb-A',slot:0,seconds:0,delta:1/60,bpm:120,section:'verse',genre:'Deutschrap',settings:v.DEFAULT_DANCE_VARIETY_V759,playing:true,reducedMotion:false,manualPriority:false,qualityGain:1,quality:'high'};
const run=(state,patch={},base=original)=>v.stepDanceVarietyV759(state,base,{...input,...patch});
eq(v.normalizeDanceVarietyV759(null),v.DEFAULT_DANCE_VARIETY_V759);
eq(v.normalizeDanceVarietyV759({enabled:false,strength:-1,variety:999,phraseBeats:7,transition:NaN}),{enabled:false,strength:0,variety:100,phraseBeats:8,transition:65});
for(const patch of [{settings:{enabled:false}},{settings:{strength:0}},{settings:{variety:0}},{playing:false},{reducedMotion:true},{manualPriority:true},{quality:'low'},{trackId:''},{modelId:''},{seconds:-1},{seconds:NaN},{delta:0},{delta:1},{bpm:0},{bpm:Infinity},{bpm:261},{slot:-1},{slot:4},{slot:.4},{qualityGain:0},{qualityGain:2}]){
 const state=v.createDanceVarietyStateV759();const r=run(state,patch);ok(!r.active,JSON.stringify(patch));eq(r.motion,original,'bypass leaves same motion');eq(r.state,v.createDanceVarietyStateV759(),'bypass clears history');}
for(const k of channels){const bad={...original,[k]:NaN};ok(!run(v.createDanceVarietyStateV759(),{},bad).active,'nonfinite '+k)}
const state=v.createDanceVarietyStateV759();const motifs=[];
for(let i=0;i<45*60;i++){
 const sec=i<15*60?'verse':i<26*60?'hook':i<39*60?'drop':'quiet';
 const r=run(state,{seconds:i/60,section:sec});
 ok(r.active&&r.phrase>=0,'active');
 ok(r.motif!==null,'has motif');
 for(const [k,value] of Object.entries(original)){
  ok(Number.isFinite(r.motion[k]),'finite '+k);
  if(channels.includes(k))ok(Math.abs(r.motion[k]/value-1)<=.150001,'bounded expressive '+k);
  else ok(r.motion[k]===value,'protected '+k);
 }
 if(i===0||r.motif!==motifs.at(-1))motifs.push(r.motif);
 Object.assign(state,r.state);
}
ok(new Set(motifs).size>=4,'variety over entire song');
const history=v.createDanceVarietyStateV759();let prev=null;
for(let phrase=0;phrase<24;phrase++){
 let r;for(let frame=0;frame<240;frame++){r=run(history,{seconds:phrase*4+frame/60});Object.assign(history,r.state);}
 ok(r.motif!==prev,'no adjacent repetition');prev=r.motif;
}
for(const section of ['verse','hook','drop','intro','break','bridge']){
 const r=run(v.createDanceVarietyStateV759(),{seconds:1,section});ok(r.active,'section supported');
}
const followed=v.createDanceVarietyStateV759();run(followed,{seconds:4});const old=followed.motif;
const restart=run(followed,{seconds:0});ok(restart.active&&restart.state.phrase===0,'seek resets');
const different=run(followed,{trackId:'other-track',seconds:3});ok(different.active&&different.state.trackId==='other-track','track change resets');
const stop=run(followed,{playing:false,seconds:4});eq(stop.state,v.createDanceVarietyStateV759());
// Re-entrance after pause / stale timestamps must not preserve false previous motifs.
let seed=42;const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
for(let i=0;i<30000;i++){
 const s=v.createDanceVarietyStateV759();const section=['verse','hook','drop','bridge'][Math.floor(rnd()*4)];
 const r=run(s,{seconds:rnd()*900,bpm:65+rnd()*125,slot:Math.floor(rnd()*4),section,
  settings:{enabled:true,strength:Math.floor(rnd()*101),variety:Math.floor(rnd()*101),phraseBeats:[4,8,16][Math.floor(rnd()*3)],transition:Math.floor(rnd()*101)},qualityGain:.2+rnd()*.8});
 for(const k of Object.keys(original)){
  ok(Number.isFinite(r.motion[k]),'no NaN');
  if(!channels.includes(k))ok(r.motion[k]===original[k],'never modifies rig safety channels');
  else ok(Math.abs(r.motion[k])<=Math.abs(original[k])*1.150001,'bound');
 }
}
eq(original.headNod,.25,'input never mutated');
const live=read('components/visualizer/GltfDancerAvatarV492.tsx'), preview=read('components/visualizer/AvatarEditor.tsx');
ok(live.includes('stepDanceVarietyV759(varietyStateV759.current,choreographyV993.motion')&&live.includes('sampleChoreographyV993(genreV666Result.motion'),'live stage integrated after V666 through V993');
ok(live.includes('refineNaturalDanceRigV684(varietyV759.motion'),'V684 reads variety');
ok(live.indexOf('stepDanceVarietyV759(')<live.indexOf('updateFootGrounding('),'original IK still owns last stage');
ok(preview.includes('stepDanceVarietyV759(varietyStateV759.current,previewMotionV758'),'GLB preview integrated');
ok(preview.includes('applyAvatarRigMotion(targets,previewVarietyV759.motion,delta)'),'preview renders new motion');
for(const f of ['components/SettingsPanel.tsx','context/UiPreferencesContext.tsx','types/music.ts'])ok(read(f).includes('avatarDanceVarietyV759'),'config '+f);
ok(read('components/SettingsPanel.tsx').includes('Intelligent Dance Variety · V759'),'UI controls');
console.log(`PASS V759 Intelligent Dance Variety: ${checks.toLocaleString('en-US')} checks; ${motifs.length} phase changes`);
