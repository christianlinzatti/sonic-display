'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'components/visualizer/beatBassHipMotionV743.ts'),'utf8');
const transpiled=ts.transpileModule(source,{fileName:'beatBassHipMotionV743.ts',compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
assert.equal(transpiled.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const mod={exports:{}};
new Function('module','exports','require',transpiled.outputText)(mod,mod.exports,()=>{throw Error('Unexpected runtime import')});
const v=mod.exports;let checks=0;
function check(pred,msg){assert(pred,msg);checks++}
const base={hipPitch:0,hipRoll:0,hipLateral:0,hipVertical:0,spineCounter:0,kneeCounter:0,ankleCounter:0};
const defaults={pose:base,mode:'Hip_Bounce',settings:v.DEFAULT_BEAT_BASS_V743,seconds:1,delta:.016,
 bpm:145,genre:'hardstyle',section:'drop',kick:1,beat:1,bass:.5,attack:.5,
 playing:true,reducedMotion:false,manualPriority:false,footIKEnabled:true,contactKnown:true,plantedLeft:false,plantedRight:false,trackId:'track1'};
const frame=(s,patch={})=>v.sampleBeatBassV743(s,{...defaults,...patch});
assert.deepEqual(v.normalizeBeatBassV743(null),v.DEFAULT_BEAT_BASS_V743);checks++;
assert.deepEqual(v.normalizeBeatBassV743({enabled:'yes',strength:Infinity,kick:-1,bass:400,sensitivity:NaN}),{enabled:false,strength:55,kick:0,bass:100,sensitivity:50});checks++;
for(const patch of [{playing:false},{reducedMotion:true},{manualPriority:true},{mode:'off'},
 {mode:'auto'},{poseStrength:0},{poseStrength:NaN},{seconds:-1},{seconds:Infinity},{delta:-1},{delta:Infinity},
 {settings:{...v.DEFAULT_BEAT_BASS_V743,enabled:false}},
 {settings:{...v.DEFAULT_BEAT_BASS_V743,strength:0}},
 {settings:{...v.DEFAULT_BEAT_BASS_V743,bass:0,kick:0}}]){
 const s=v.createBeatBassStateV743();frame(s);let out=frame(s,patch);
 check(!out.active,'inactive '+JSON.stringify(patch));check(out.kickEnvelope===0&&out.bassEnvelope===0,'inactive resets envelopes');
 check(out.pose.hipPitch===base.hipPitch,'inactive preserves animation');
}
const warmed=v.createBeatBassStateV743();for(let i=0;i<15;i++)frame(warmed,{seconds:1+i*.016});
check(warmed.kickEnvelope>.01,'real kick received');check(warmed.bassEnvelope>.01,'real bass received');
frame(warmed,{trackId:'another',seconds:2,kick:0,beat:0,bass:0,attack:0});
check(warmed.kickEnvelope===0&&warmed.bassEnvelope===0,'track change discards old audio accents');
for(let i=0;i<12;i++)frame(warmed,{trackId:'another',seconds:2+i*.016});
frame(warmed,{trackId:'another',seconds:.1,kick:0,beat:0,bass:0,attack:0});
check(warmed.kickEnvelope===0,'seek discards previous kick');
for(let i=0;i<12;i++)frame(warmed,{seconds:1+i*.016});
frame(warmed,{seconds:15,kick:0,beat:0,bass:0,attack:0});
check(warmed.bassEnvelope===0,'big clock jump clears bass');
function run(patch,count=30){const s=v.createBeatBassStateV743();let out;
 for(let i=0;i<count;i++)out=frame(s,{...patch,seconds:(patch.seconds??4)+i*.016});return out;}
const strong=run({mode:'Hip_Bounce',kick:1,beat:1,bass:0,attack:0,genre:'hardstyle'});
const silent=run({mode:'Hip_Bounce',kick:0,beat:0,bass:0,attack:0,genre:'hardstyle'});
check(strong.pose.hipVertical<silent.pose.hipVertical,'kick accent increases downward bounce');
check(!silent.active,'no phantom kick from BPM only');
const lowStrength=run({mode:'Hip_Bounce',poseStrength:.1,kick:1,beat:1,bass:0,attack:0});
check(lowStrength.pose.hipVertical>strong.pose.hipVertical,'V738 intensity also limits V743 audio response');
const sway=run({mode:'Hip_Sway',kick:0,beat:0,attack:0,bass:1,genre:'deutschrap'});
check(sway.active&&Math.abs(sway.pose.hipRoll)>.00001,'rap sway responds to measured bass');
const circle=run({mode:'Hip_Circle',kick:0,beat:0,attack:0,bass:1,genre:'hardtekk'});
check(circle.active&&Math.abs(circle.pose.hipPitch)>.00001,'tekk circle responds to bass');
for(const mode of ['Hip_Sway','Hip_Circle','Hip_Bounce'])for(const genre of ['deutschrap','hardtekk','hardstyle','rock','pop','unrecognized'])
 for(const section of ['intro','verse','hook','drop'])for(const foot of ['planted','free','noik','unknown']){
  const s=v.createBeatBassStateV743();
  for(let i=0;i<40;i++){
   const out=frame(s,{mode,genre,section,seconds:i*.024,delta:.024,bpm:i%2?190:65,
     kick:(i%4)/3,bass:(i%7)/6,beat:(i%5)/4,attack:(i%6)/5,
     footIKEnabled:foot!=='noik',contactKnown:foot!=='unknown',plantedLeft:foot==='planted',plantedRight:foot==='planted'});
   const pose=out.pose;
   for(const [key,lo,hi] of [['hipRoll',-.12,.12],['hipPitch',-.1,.1],['hipLateral',-.018,.018],['hipVertical',-.022,.016],['spineCounter',-.12,.12],['kneeCounter',-.1,.1],['ankleCounter',-.1,.1]]){
    check(Number.isFinite(pose[key])&&pose[key]>=lo-1e-10&&pose[key]<=hi+1e-10,`bounded ${mode}/${genre}/${section}/${foot}/${key}`);
   }
   if(foot==='noik'||foot==='unknown')check(pose.hipLateral===0&&pose.hipVertical===0,'without IK no pelvis translation');
   if(foot==='planted')check(pose.ankleCounter===0,'stance foot untouched');
  }
 }
const worst=[NaN,-Infinity,Infinity,Number.MAX_VALUE,-200,400,null,undefined];
for(const raw of worst)for(const mode of ['Hip_Sway','Hip_Bounce','Hip_Circle']){
 const out=run({mode,seconds:1000,delta:.016,kick:raw,beat:raw,bass:raw,attack:raw,bpm:raw},2);
 check(Object.values(out.pose).every(x=>typeof x==='number'&&Number.isFinite(x)),'bad audio input does not poison rig');
}
// Explicit scene integration: enforce source of signal and no phantom preview demo on live stage.
const live=fs.readFileSync(path.join(root,'components/visualizer/GltfDancerAvatarV492.tsx'),'utf8');
const preview=fs.readFileSync(path.join(root,'components/visualizer/AvatarEditor.tsx'),'utf8');
const settings=fs.readFileSync(path.join(root,'components/SettingsPanel.tsx'),'utf8');
check(live.includes('sampleBeatBassV743(beatBassV743.current')&&live.includes('kick:audio.kickAccentIntensity')&&live.includes('bass:audio.bass'),'live stage receives real audio signals');
check(live.indexOf('sampleBeatBassV743(')<live.indexOf('sampleNaturalBodyV740({'),'new dynamics feed V740');
check(preview.includes('sampleBeatBassV743(beatStateV743.current')&&preview.includes('demoBeatV743?'),'preview offers explicit demo');
check(preview.includes('manualPriority:!!clip'),'authored preview clip retains priority');
check(settings.includes('Beat &amp; Bass Motion · V743')&&settings.includes('avatarBeatBassV743'),'persisted settings UI present');
console.log(`PASS V743 Beat & Bass Motion: ${checks.toLocaleString('en-US')} assertions (audio, limits, priorities, integration)`);
