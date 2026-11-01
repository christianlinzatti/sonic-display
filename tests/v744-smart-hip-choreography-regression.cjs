'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const cache={};
function load(name){if(cache[name])return cache[name];
 const file='components/visualizer/'+name+'.ts';
 const result=ts.transpileModule(read(file),{fileName:file,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(result.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0,name+' transpilation');
 const mod={exports:{}};
 new Function('module','exports','require',result.outputText)(mod,mod.exports,(p)=>{
  if(p.startsWith('./'))return load(p.slice(2));throw Error('Unexpected module '+p);
 });return cache[name]=mod.exports;
}
const v=load('smartHipChoreographyV744'), genre=load('genreHipIntelligenceV742'), studio=load('hipMotionStudioV738');
let checks=0;
const check=(c,msg)=>{assert.ok(c,msg);checks++};
const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++};
const input=(patch={})=>{
 const seconds=patch.seconds??0, section=patch.section??'verse',style=patch.style??'deutschrap';
 const hip=patch.originalHip??{mode:'auto',strength:55,speed:100};
 const plan=genre.directGenreHipV742({hip,studio:studio.DEFAULT_HIP_STUDIO_V738,
  config:{enabled:true,style,strength:70},genre:style,section,seconds,bpm:patch.bpm??120,
  playing:true,reducedMotion:false});
 return {plan,originalHip:hip,seconds,section,bpm:120,trackId:'A',playing:true,reducedMotion:false,...patch};
};
const sample=(s,p={})=>v.directSmartHipV744(s,input(p));
eq(v.normalizeSmartHipV744(null),v.DEFAULT_SMART_HIP_V744);
eq(v.normalizeSmartHipV744({enabled:'yes',variety:-12,dynamics:Infinity,phraseBeats:25}),{enabled:false,variety:0,dynamics:65,phraseBeats:8});
eq(v.normalizeSmartHipV744({enabled:true,variety:200,dynamics:-3,phraseBeats:16}),{enabled:true,variety:100,dynamics:0,phraseBeats:16});
for(const [section,expected] of [['INTRO','intro'],['break','break'],['bridge','break'],['verse','verse'],['pre-chorus','build'],['build-up','build'],['buildup','build'],['riser','build'],['HOOK','hook'],['drop','drop'],['outro','outro']])
 eq(v.classifyHipSectionV744(section),expected,'classify '+section);
for(const style of ['deutschrap','hardtekk','hardstyle','rock','pop']){
 for(const section of ['intro','verse','hook','build','drop','break','outro']){
  const s=v.createSmartHipStateV744();let prev=null;let changed=0;const choices=new Set();
  for(let phrase=0;phrase<48;phrase++){
   const args={style,section,seconds:phrase*4+3.1,trackId:'album:A',settings:{enabled:true,variety:100,dynamics:70,phraseBeats:8}};
   for(let sub=0;sub<3;sub++)sample(s,{...args,seconds:phrase*4+sub+.01});
   const r=sample(s,args);
   check(r.active,`active ${style}:${section}`);check(r.section===section,'section retained');
   check(['Hip_Sway','Hip_Circle','Hip_Bounce'].includes(r.mode),'recognized clip');
   check(r.mode!==prev,'neighboring motifs must differ at full variety');
   check(r.hip.mode===r.mode,'V738 receives selected mode');
   check(r.hip.strength>=0&&r.hip.strength<=100,'hip amplitude bounded');
   for(const k of ['swayStrength','circleStrength','bounceStrength'])check(r.studio[k]>=0&&r.studio[k]<=150,'gain bounded');
   choices.add(r.mode);if(prev!==null&&r.mode!==prev)changed++;prev=r.mode;
   const identical=sample(s,{...args,seconds:args.seconds+.08});
   eq(identical.mode,r.mode,'frame-invariant phrase choice');
  }
  check(choices.size>=2,'several motions used');check(changed===47,'no consecutive repetition');
 }
}
const nochange=(patch={})=>{
 const s=v.createSmartHipStateV744();const r=sample(s,patch);
 check(!r.active,'must bypass');eq(r.hip,r.plan??input(patch).plan.hip,'must not overwrite original plan');
};
for(const settings of [{enabled:false},{enabled:true,variety:70,dynamics:0},{enabled:true,variety:0,dynamics:0}]){
 const s=v.createSmartHipStateV744();const a=sample(s,{settings,seconds:8.1});
 if(!settings.enabled){check(!a.active,'disabled');continue;}
 check(a.active,'configured automation');check(Number.isFinite(a.hip.strength),'safe intensity');
}
for(const patch of [
 {playing:false},{reducedMotion:true},{manualPriority:true},{seconds:-1},{seconds:NaN},
 {originalHip:{mode:'Hip_Circle',strength:50,speed:100}},
 {originalHip:{mode:'auto',strength:0,speed:100}},
 {plan:{...input().plan,active:false}}
 ]){
 const s=v.createSmartHipStateV744();const r=sample(s,patch);check(!r.active,'authored/manual/reduced/unavailable blocks V744');
 eq(r.hip,input(patch).plan.hip,'bypass leaves V742 intact');
}
for(const section of ['build','hook','drop','intro']){
 const s=v.createSmartHipStateV744();const a=sample(s,{seconds:2,section});
 const b=sample(s,{seconds:3,section});
 check(a.hip.strength>=0&&b.hip.strength<=100,'bounded dramaturgy');
 if(section==='build')check(b.hip.strength>=a.hip.strength,'build rise');
}
// Track changes, seeks, pauses, and abnormal timestamps must not reuse old motifs.
for(const [a,b] of [[{seconds:50},{seconds:0}],[{seconds:20},{seconds:50}],[{seconds:12,trackId:'A'},{seconds:12,trackId:'B'}]]){
 const s=v.createSmartHipStateV744();sample(s,a);const result=sample(s,b);
 check(result.active&&s.lastTrack===(b.trackId??'A'),'clock reset safe');
}
for(const seconds of [0,.00001,999,86400,1e15,Number.MAX_VALUE]){
 const r=sample(v.createSmartHipStateV744(),{seconds,bpm:Number.MAX_VALUE,section:'build'});
 check(Number.isFinite(r.hip.strength)&&Number.isFinite(r.phrase),'safe extreme timestamps');
}
// Exercise the actual V738 transition and grounding contracts across sections.
for(const style of ['deutschrap','hardtekk','hardstyle','rock','pop']){
 const state=v.createSmartHipStateV744(),blend=studio.createHipStudioStateV738();
 for(let i=0;i<1600;i++){
  const seconds=i/30,section=i<250?'intro':i<650?'verse':i<900?'build':i<1250?'hook':'drop';
  const p=sample(state,{seconds,section,style});
  const frame=studio.sampleHipStudioV738(blend,{settings:p.hip,studio:p.studio,
   seconds,delta:1/30,trackId:'long-song',bpm:135,section,genre:style,
   playing:true,reducedMotion:false,footIKEnabled:true,contactKnown:true,
   plantedLeft:true,plantedRight:false});
  for(const value of Object.values(frame.pose))check(Number.isFinite(value)&&Math.abs(value)<=.12,'bounded V738 pose');
  check(frame.pose.ankleCounter===0,'V737 planted ankle unchanged');
 }
}
const live=read('components/visualizer/GltfDancerAvatarV492.tsx'),preview=read('components/visualizer/AvatarEditor.tsx');
const panel=read('components/SettingsPanel.tsx'),prefs=read('context/UiPreferencesContext.tsx');
check(live.includes('directSmartHipV744(smartHipV744.current')&&live.includes('plan:smartHipPlanV744')&&live.includes('settings:ensembleHipPlanV745.hip')&&live.includes('studio:ensembleHipPlanV745.studio'),'live pipeline connected');
check(preview.includes('directSmartHipV744(smartStateV744.current')&&preview.includes('plan:smartHipPlanV744')&&preview.includes('settings:ensembleHipPlanV745.hip')&&preview.includes('studio:ensembleHipPlanV745.studio'),'same preview pipeline');
check(panel.includes('Smart Choreography 3.0')&&panel.includes('avatarSmartHipV744'),'settings UI');
check(preview.includes('value="build"')&&preview.includes('value="outro"'),'section preview');
check(prefs.includes('avatarSmartHipV744:{enabled:true')&&read('types/music.ts').includes('avatarSmartHipV744?'),'persisted typed defaults');
console.log(`PASS: V744 smart choreography ${checks} checks`);
