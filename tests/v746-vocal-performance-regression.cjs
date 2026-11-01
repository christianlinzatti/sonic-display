'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const source=fs.readFileSync(path.join(root,'components/visualizer/vocalPerformanceDirectorV746.ts'),'utf8');
const result=ts.transpileModule(source,{fileName:'vocalPerformanceDirectorV746.ts',compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0);
const moduleV={exports:{}};
new Function('module','exports','require',result.outputText)(moduleV,moduleV.exports,()=>{throw Error('Unexpected runtime import')});
const v=moduleV.exports;
let checks=0;
function ok(x,msg){assert.ok(x,msg);checks++;}
function eq(a,b,msg){assert.deepEqual(a,b,msg);checks++;}
const cue={headPitch:-.018,headYaw:.007,headTilt:.004,eyeYaw:0,chestLean:0,leftArm:0,rightArm:0,confidence:'word',mode:'rap',emphasis:.35};
const vocal={confidence:'word',style:'rap',jaw:.8,headAccent:.12};
const base={settings:v.DEFAULT_VOCAL_PERFORMANCE_V746,body:cue,vocal,role:'singer',playing:true,reducedMotion:false,manualBodyPriority:false,bodyEnabled:true,gesturesEnabled:true,genre:'deutschrap',focus:.7,section:'verse'};
const resolve=(patch={})=>v.directVocalPerformanceV746({...base,...patch});
eq(v.normalizeVocalPerformanceV746(),v.DEFAULT_VOCAL_PERFORMANCE_V746);
eq(v.normalizeVocalPerformanceV746({enabled:'invalid',strength:-4,head:Infinity,gestures:150,rapEmphasis:NaN}),{enabled:false,strength:0,head:65,gestures:100,rapEmphasis:75});
for(let count=1;count<=4;count++)for(let slot=0;slot<count;slot++)for(const singer of [0,1,2,3]){
 const matched=slot===singer;
 const role=v.resolveVocalRoleV746({count,slot,trackId:'T',cueTrackIds:['T'],authoredCueActive:true,assignedSlots:[singer]});
 eq(role,count===1?'singer':matched?'singer':'backing','explicit singer never confused with dancer lead');
 const answer=resolve({role});
 ok(answer.active===(role==='singer'),'only sung line triggers added body');
 if(!answer.active)eq(answer.body,cue,'backing untouched');
}
for(let count=2;count<=4;count++)for(let slot=0;slot<count;slot++){
 for(const patch of [{trackId:'X',cueTrackIds:['T'],authoredCueActive:true,assignedSlots:[slot]},
  {trackId:'',cueTrackIds:['T'],authoredCueActive:true,assignedSlots:[slot]},
  {trackId:'T',cueTrackIds:['T'],assignedSlots:[slot]},
  {trackId:'T',cueTrackIds:['T'],authoredCueActive:false,timedCueActive:false}]){
  eq(v.resolveVocalRoleV746({count,slot,...patch}),'unassigned','no invented vocal identity');
 }
 eq(v.resolveVocalRoleV746({count,slot,trackId:'T',cueTrackIds:['T'],timedCueActive:true}),'singer','authored timed singer');
}
for(const patch of [{role:'backing'},{role:'unassigned'},{playing:false},{reducedMotion:true},
 {manualBodyPriority:true},{bodyEnabled:false},{settings:{enabled:false}},
 {settings:{strength:0}},{vocal:{...vocal,confidence:'none'}},{vocal:{...vocal,confidence:'line'}},
 {vocal:{...vocal,style:'silent'}},{vocal:{...vocal,jaw:0,headAccent:0},focus:0}]){
 const output=resolve(patch);ok(!output.active,'no overlay in unsupported state');eq(output.body,cue,'preserve input');
}
for(const genre of ['deutschrap','rap','hardtekk','hardstyle','rock','pop'])
for(const section of ['intro','verse','hook','drop','outro','build'])
for(const strength of [0,1,25,65,100])for(const jaw of [0,.05,.1,.5,1,Number.NaN,Infinity,-Infinity])
for(const focus of [0,.3,1,Infinity]){
 const r=resolve({genre,section,settings:{...base.settings,strength},vocal:{...vocal,jaw},focus});
 ok(Number.isFinite(r.intensity)&&r.intensity>=0&&r.intensity<=1,'intensity bounded');
 for(const key of ['headPitch','headYaw','headTilt','chestLean','leftArm','rightArm'])
  ok(Number.isFinite(r.body[key])&&Math.abs(r.body[key])<=.201,'safe joint rotation');
 eq(r.body.eyeYaw,cue.eyeYaw,'eyes remain owned by previous system');
 ok(r.body===cue||r.body!==cue&&r.body.mode===cue.mode,'preserve mode and role');
}
const weak=resolve({settings:{...base.settings,head:0,gestures:0}});
ok(weak.active,'head and gesture controls do not affect mouth');
eq(weak.body,cue,'at zero channel gain the original body is unchanged');
const hook=resolve({section:'hook'}),verse=resolve({section:'verse'});
ok(hook.intensity>verse.intensity,'hook emphasizes stronger');
const scenes=['components/visualizer/gltfVocalPerformanceV492.ts','components/SettingsPanel.tsx','types/music.ts','context/UiPreferencesContext.tsx'];
for(const file of scenes){const text=fs.readFileSync(path.join(root,file),'utf8');ok(text.includes('V746')||text.includes('avatarVocalPerformanceV746'),'runtime/settings type integration: '+file)}
const integration=fs.readFileSync(path.join(root,scenes[0]),'utf8');
ok(integration.includes('directVocalPerformanceV746')&&integration.includes('resolveVocalRoleV746')&&integration.includes('body:vocalPerformanceV746.body')&&integration.includes('applyVocalStageOverlayV371(rigTargets.current,syncedBodyV757.body'),'verified stage overlay integration');
ok(!source.includes('Math.random')&&!source.includes('Date.now'),'deterministic cues');
console.log('PASS V746 Vocal Performance 2.0: '+checks+' checks');
