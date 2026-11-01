'use strict';
/** Deterministic behavior + UI wiring. No fake GLB/GPU visual assertions. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const get=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const modules={};
function load(rel){
 if(modules[rel])return modules[rel];
 const result=ts.transpileModule(get(rel),{fileName:rel,compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022},reportDiagnostics:true});
 assert.equal(result.diagnostics.filter(x=>x.category===ts.DiagnosticCategory.Error).length,0);
 const m={exports:{}};new Function('module','exports','require',result.outputText)(m,m.exports,dep=>{
  if(dep==='./hipDanceV735')return load('components/visualizer/hipDanceV735.ts');
  throw Error('unexpected dependency '+dep);
 });
 return modules[rel]=m.exports;
}
const {createHipStudioStateV738,resetHipStudioV738,normalizeHipStudioV738,
 sampleHipStudioV738}=load('components/visualizer/hipMotionStudioV738.ts');
const {sampleHipDanceV735}=load('components/visualizer/hipDanceV735.ts');
const channels=['hipPitch','hipRoll','hipLateral','hipVertical','spineCounter','kneeCounter','ankleCounter'];
const input={settings:{mode:'Hip_Circle',strength:70,speed:100},seconds:1.2,delta:1/60,bpm:125,
 genre:'deutschrap',section:'hook',playing:true,reducedMotion:false,
 footIKEnabled:true,contactKnown:true,plantedLeft:true,plantedRight:true,
 trackId:'song-A',studio:{transitionSeconds:.4,rhythm:'normal',swayStrength:100,circleStrength:100,bounceStrength:100}};
let checks=0;
const assertFinite=({pose})=>{for(const key of channels){assert(Number.isFinite(pose[key]),`${key} not finite`);checks++;}
 assert(Math.abs(pose.hipPitch)<=.100001);assert(Math.abs(pose.hipRoll)<=.120001);
 assert(Math.abs(pose.hipLateral)<=.018001);assert(Math.abs(pose.hipVertical)<=.022001);
 assert.equal(pose.ankleCounter,0);checks+=5;};
assert.deepEqual(normalizeHipStudioV738({swayStrength:-200,circleStrength:1000,bounceStrength:NaN,
 transitionSeconds:Infinity,rhythm:'huh'}),{transitionSeconds:.4,swayStrength:0,circleStrength:150,bounceStrength:100,rhythm:'normal'});
checks++;
// At the same song timestamp, individual intensity does not bleed into other modes.
for(const [mode,key] of [['Hip_Sway','swayStrength'],['Hip_Circle','circleStrength'],['Hip_Bounce','bounceStrength']]){
 const state=createHipStudioStateV738();
 let last;for(let i=0;i<80;i++)last=sampleHipStudioV738(state,{...input,seconds:1+i/60,
 settings:{...input.settings,mode},studio:{...input.studio,[key]:0}});
 assert.equal(last.effectiveStrength,0);
 for(const k of channels)assert.equal(last.pose[k],0);checks+=8;
 const raw=sampleHipDanceV735({...input,settings:{...input.settings,mode},seconds:1.7});
 assertFinite({pose:raw});
}
// Every mode can be selected and sampled with 3 tempo subdivisions, with and without IK.
for(const mode of ['Hip_Sway','Hip_Circle','Hip_Bounce','auto'])
for(const rhythm of ['half','normal','double'])
for(const footIKEnabled of [true,false]){
 const state=createHipStudioStateV738();
 for(let i=0;i<240;i++){
  const f=sampleHipStudioV738(state,{...input,settings:{...input.settings,mode},
   seconds:i/60,footIKEnabled,contactKnown:footIKEnabled,
   studio:{...input.studio,rhythm}});
  assertFinite(f);
  if(!footIKEnabled){assert.equal(f.pose.hipVertical,0);assert.equal(f.pose.hipLateral,0);checks+=2;}
 }
}
// C0 continuity when an automatic phrase changes and manual switches mid-transition.
{
 const state=createHipStudioStateV738();const near=[];
 for(let i=0;i<80;i++)near.push(sampleHipStudioV738(state,{...input,seconds:i/60}));
 const prior=near.at(-1).pose;
 const changed=sampleHipStudioV738(state,{...input,seconds:80/60,settings:{...input.settings,mode:'Hip_Sway'}});
 const target=sampleHipDanceV735({...input,seconds:80/60,settings:{...input.settings,mode:'Hip_Sway'}});
 for(const k of channels){assert(Math.abs(changed.pose[k]-prior[k])<=Math.abs(target[k]-prior[k])*.006);checks++;}
 assert(changed.blend<.01);
 const another=sampleHipStudioV738(state,{...input,seconds:81/60,settings:{...input.settings,mode:'Hip_Bounce'}});
 for(const k of channels)assert(Math.abs(another.pose[k]-changed.pose[k])<.001),checks++;
}
// Support constraints must apply immediately even across unfinished crossfades.
{
 const state=createHipStudioStateV738();
 for(let i=0;i<12;i++)sampleHipStudioV738(state,{...input,seconds:1+i/60,
  plantedLeft:false,plantedRight:false,settings:{...input.settings,mode:'Hip_Sway'}});
 const contact=sampleHipStudioV738(state,{...input,seconds:1.2,
  plantedLeft:true,plantedRight:true,settings:{...input.settings,mode:'Hip_Circle'}});
 assert.equal(contact.pose.ankleCounter,0);checks++;
 const noIk=sampleHipStudioV738(state,{...input,seconds:1.2167,footIKEnabled:false,
  contactKnown:false,settings:{...input.settings,mode:'Hip_Bounce'}});
 assert.equal(noIk.pose.hipLateral,0);assert.equal(noIk.pose.hipVertical,0);checks+=2;
}
// A real AUTO phrase boundary must change mode without jumping the pelvis.
{
 const state=createHipStudioStateV738();let before=null,after=null;
 for(let i=0;i<500;i++){
  const sample=sampleHipStudioV738(state,{...input,settings:{...input.settings,mode:'auto'},
   seconds:i/60,genre:'hardstyle'});
  if(i===460)before=sample;
  if(i===461)after=sample;
 }
 assert(before&&after);
 // At 125 BPM, the 960-beat denominator makes a phrase ~7.68s.
 assert.notEqual(before.mode,after.mode,'automatic phrase must choose a fresh hip mode');
 for(const k of channels)assert(Math.abs(after.pose[k]-before.pose[k])<.0035,k+' seam');
 checks+=8;
}
// Pause, reduced motion, authored clips, off, invalid clock and discontinuities cannot leak a previous pose.
for(const override of [{playing:false},{reducedMotion:true},{manualPriority:true},
 {settings:{...input.settings,mode:'off'}},{seconds:NaN},{seconds:-1},{settings:{...input.settings,strength:0}}]){
 const state=createHipStudioStateV738();
 for(let i=0;i<45;i++)sampleHipStudioV738(state,{...input,seconds:i/60});
 const f=sampleHipStudioV738(state,{...input,...override});
 assert.equal(f.mode,'off');assert.equal(state.mode,null);assert.deepEqual(Object.values(f.pose),Array(7).fill(0));checks+=3;
}
for(const override of [{trackId:'song-B'},{seconds:1000},{seconds:-1}]){
 const state=createHipStudioStateV738();
 for(let i=0;i<45;i++)sampleHipStudioV738(state,{...input,seconds:1+i/60});
 const f=sampleHipStudioV738(state,{...input,seconds:1.75,...override});
 assert(f.blend<.01||f.mode==='off');checks++;
}
// Determinism with identical input stream and resets, finite huge song clock.
for(const seconds of [Number.MAX_VALUE,1e15,1e9,86400,1,0]){
 const s=createHipStudioStateV738();assertFinite(sampleHipStudioV738(s,{...input,seconds}));
 resetHipStudioV738(s);assert.equal(s.mode,null);checks++;
}
const live=get('components/visualizer/GltfDancerAvatarV492.tsx');
const preview=get('components/visualizer/AvatarEditor.tsx');
const panel=get('components/SettingsPanel.tsx');
const prefs=get('context/UiPreferencesContext.tsx');
const types=get('types/music.ts');
assert.match(live,/sampleHipStudioV738\(hipStudioV738.current/);
assert.match(preview,/sampleHipStudioV738\(hipStateV738.current/);
assert.match(live,/manualPriority:hipManualPriorityV735/);
assert(live.indexOf('sampleHipStudioV738(')<live.indexOf('blendHipDanceV735('));
assert(live.indexOf('blendHipDanceV735(')<live.indexOf('applyAvatarRigMotion(rigTargets.current'));
assert(live.indexOf('applyAvatarRigMotion(rigTargets.current')<live.indexOf('updateFootGrounding({'));
assert.equal((live.match(/updateFootGrounding\(\{/g)||[]).length,1);
assert(preview.indexOf('applyAvatarRigMotion(targets')<preview.indexOf('updateFootIK(footIK.current'));
assert.match(preview,/Kontakt links/);assert.match(preview,/hipMode \? 0 : pulse/);
assert.match(panel,/Hip Motion Studio · V738/);
for(const k of ['transitionSeconds','swayStrength','circleStrength','bounceStrength','rhythm'])assert(panel.includes(k),k);
assert(prefs.includes('avatarHipStudioV738')&&types.includes('avatarHipStudioV738'));
checks+=17;
console.log(`PASS V738 — ${checks.toLocaleString('en-US')} numeric and integration assertions (no browser/GLB claim)`);
