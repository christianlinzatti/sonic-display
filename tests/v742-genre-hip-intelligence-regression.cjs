'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const mods={};
function load(name){if(mods[name])return mods[name];
 const file='components/visualizer/'+name+'.ts';
 const transpiled=ts.transpileModule(read(file),{fileName:file,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
 assert.equal(transpiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,name+' syntax');
 const mod={exports:{}};
 new Function('module','exports','require',transpiled.outputText)(mod,mod.exports,(p)=>{
  if(p.startsWith('./'))return load(p.slice(2));throw new Error('Unexpected external import '+p);
 });return mods[name]=mod.exports;
}
const v742=load('genreHipIntelligenceV742');
const v738=load('hipMotionStudioV738');
let checks=0;
const check=(value,message)=>{assert(value,message);++checks};
const eq=(a,b,message)=>{assert.deepEqual(a,b,message);++checks};
const defaultInput={config:{...v742.DEFAULT_GENRE_HIP_V742},hip:{mode:'auto',strength:50,speed:100},
 studio:{...v738.DEFAULT_HIP_STUDIO_V738},genre:'deutschrap',section:'verse',
 seconds:8,bpm:120,playing:true,reducedMotion:false,manualPriority:false};
const plan=(changes={})=>v742.directGenreHipV742({...defaultInput,...changes});
eq(v742.normalizeGenreHipV742(null),v742.DEFAULT_GENRE_HIP_V742);
eq(v742.normalizeGenreHipV742({enabled:false,style:'invalid',strength:Infinity}),{enabled:false,style:'auto',strength:60});
eq(v742.normalizeGenreHipV742({enabled:'yes',style:'hardtekk',strength:999}),{enabled:false,style:'hardtekk',strength:100});
for(const [s,wanted] of [['Intro','quiet'],['build-up BREAK','quiet'],['Hook','hook'],['refrain','hook'],['DROP','drop'],['verse','verse'],['','verse']])
 eq(v742.classifyGenreHipSectionV742(s),wanted,'classify '+s);
for(const style of ['deutschrap','hardtekk','hardstyle','rock','pop']){
 const results=new Set();
 for(const section of ['intro','verse','hook','drop']){
  for(let p=0;p<12;p++){
   const result=plan({config:{enabled:true,style,strength:85},section,seconds:p*4,bpm:120});
   check(result.active&&result.style===style,'genre active '+style);
   check(['Hip_Sway','Hip_Circle','Hip_Bounce'].includes(result.mode),'valid selected clip');
   check(result.hip.mode===result.mode,'selected hip fed to blend');
   check(result.hip.strength>=0&&result.hip.strength<=100,'bounded strength');
   for(const k of ['swayStrength','circleStrength','bounceStrength'])check(result.studio[k]>=0&&result.studio[k]<=150,'bounded studio strength');
   results.add(result.mode);
  }
 }
 check(results.size>=2,style+' must have variety');
}
check(plan({genre:'German Rap'}).active,'real world German Rap recognized');
check(plan({genre:'Hardtekk'}).style==='hardtekk','hardtekk recognized');
check(plan({genre:'Rock'}).style==='rock','rock recognized');
check(plan({genre:'experimental'}).active===false,'unknown genre is not guessed');
for(const configPatch of [{enabled:false},{strength:0}]){
 const v=plan({config:{...defaultInput.config,...configPatch}});
 check(!v.active&&v.hip.mode==='auto','disabled falls back without replacing mode');
}
for(const patch of [
 {hip:{mode:'off',strength:50,speed:100}},
 {hip:{mode:'Hip_Circle',strength:50,speed:100}},
 {hip:{mode:'Hip_Bounce',strength:50,speed:100}},
 {hip:{mode:'auto',strength:0,speed:100}},
 {playing:false},{reducedMotion:true},{manualPriority:true},
 {seconds:-1},{seconds:NaN}
]){
 const r=plan(patch);check(!r.active,'explicit/manual/reduced/invalid must bypass');
 check(r.hip.mode===(patch.hip?.mode??'auto'),'preserves explicit mode');
}
const base=plan();
for(const seconds of [0,0.01,1.1,8.9,45,86400,1e19,Number.MAX_VALUE]){
 const r=plan({seconds,bpm:Number.MAX_VALUE});
 check(Number.isFinite(r.hip.strength)&&Number.isFinite(r.studio.swayStrength),'finite huge times');
}
for(const sourceStyle of ['deutschrap','hardtekk','hardstyle','rock','pop']){
 for(const plantedLeft of [false,true])for(const plantedRight of [false,true]){
  const hipState=v738.createHipStudioStateV738();
  for(let i=0;i<1400;i++){
   const seconds=i/30;
   const d=plan({config:{enabled:true,style:sourceStyle,strength:80},genre:sourceStyle,
    section:i%240<70?'intro':i%240<130?'verse':i%240<175?'hook':'drop',seconds,bpm:130});
   const frame=v738.sampleHipStudioV738(hipState,{settings:d.hip,studio:d.studio,seconds,
    bpm:130,genre:sourceStyle,section:'verse',delta:1/30,trackId:'demo',
    playing:true,reducedMotion:false,footIKEnabled:true,contactKnown:true,
    plantedLeft,plantedRight});
   for(const [name,value] of Object.entries(frame.pose)){
    check(Number.isFinite(value),'finite '+name);
    check(Math.abs(value)<=.12,'safe V735 maximum '+name);
   }
   if(plantedLeft||plantedRight)check(frame.pose.ankleCounter===0,'planted ankle unchanged');
  }
 }
}
for(const sourceStyle of ['deutschrap','hardtekk','hardstyle','rock','pop']){
 const p=plan({config:{enabled:true,style:sourceStyle,strength:80},genre:sourceStyle});
 const noIk=v738.sampleHipStudioV738(v738.createHipStudioStateV738(),{settings:p.hip,studio:p.studio,
  seconds:2,bpm:120,genre:sourceStyle,section:'hook',delta:.1,playing:true,reducedMotion:false,
  footIKEnabled:false,contactKnown:false});
 check(noIk.pose.hipVertical===0&&noIk.pose.hipLateral===0,'no IK => no pelvis translation');
}
const motion=read('components/visualizer/GltfDancerAvatarV492.tsx');
const preview=read('components/visualizer/AvatarEditor.tsx');
const settings=read('components/SettingsPanel.tsx');
const prefs=read('context/UiPreferencesContext.tsx');
const types=read('types/music.ts');
check(motion.includes('directGenreHipV742({')&&motion.includes('plan:genreHipV742')&&motion.includes('plan:smartHipPlanV744')&&motion.includes('settings:ensembleHipPlanV745.hip')&&motion.includes('studio:ensembleHipPlanV745.studio'),'V742 plan reaches live studio through V744');
check(motion.includes('manualPriority:hipManualPriorityV735'),'manual show precedence');
check(preview.includes('plan:genreHipPlanV742')&&preview.includes('hipSection={studioSectionV742}')&&preview.includes('plan:smartHipPlanV744')&&preview.includes('settings:ensembleHipPlanV745.hip'),'V742 plan reaches preview through V744');
check(settings.includes('Genre Dance Intelligence · V742')&&settings.includes('avatarGenreHipV742'),'settings integration');
check(prefs.includes('avatarGenreHipV742:{enabled:true,style:"auto",strength:60}'),'persistent defaults');
check(types.includes('avatarGenreHipV742?'),'typed persistent preference');
console.log(`PASS V742 Genre Dance Intelligence: ${checks} checks (5 genres, sections, foot contacts, priority, boundary values)`);
