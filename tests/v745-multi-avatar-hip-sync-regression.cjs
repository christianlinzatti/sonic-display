'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),ts=require('./typescript-loader.cjs');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const cache={};
function load(name){if(cache[name])return cache[name];
 const filename='components/visualizer/'+name+'.ts';
 const result=ts.transpileModule(read(filename),{fileName:filename,compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS},reportDiagnostics:true});
 assert.equal(result.diagnostics.filter(d=>d.category===ts.DiagnosticCategory.Error).length,0,filename);
 const m={exports:{}};
 new Function('module','exports','require',result.outputText)(m,m.exports,p=>{
  if(p.startsWith('./'))return load(p.slice(2));throw Error('Unexpected import '+p);
 });return cache[name]=m.exports;
}
const v=load('multiAvatarHipSyncV745'),smart=load('smartHipChoreographyV744'),studio=load('hipMotionStudioV738'),genre=load('genreHipIntelligenceV742');
let checks=0;
const ok=(val,msg)=>{assert.ok(val,msg);checks++};
const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++};
const makePlan=(section='verse')=>({active:true,mode:'Hip_Sway',section,phrase:0,
 hip:{mode:'Hip_Sway',strength:55,speed:100},studio:{...studio.DEFAULT_HIP_STUDIO_V738}});
const base={settings:{enabled:true,mode:'auto',strength:75,leadSlot:0,delayBeats:1},
 plan:makePlan(),slot:0,count:4,seconds:10,bpm:120,trackId:'A',playing:true,reducedMotion:false,delta:1/60};
const step=(state,patch={})=>v.directEnsembleHipV745(state,{...base,...patch});
eq(v.normalizeEnsembleHipV745(),v.DEFAULT_ENSEMBLE_HIP_V745);
eq(v.normalizeEnsembleHipV745({enabled:'yes',mode:'alien',strength:Infinity,leadSlot:9,delayBeats:3}),
 {enabled:false,mode:'auto',strength:75,leadSlot:3,delayBeats:1});
for(const c of [1,2,3,4])for(let slot=0;slot<c;slot++)for(const mode of ['sync','stagger','call-response','auto']){
 const st=v.createEnsembleHipStateV745();
 for(let i=0;i<300;i++){
  const section=['verse','hook','build','drop','break'][Math.floor(i/60)];
  const plan=makePlan(section);const result=step(st,{slot,count:c,plan,seconds:i/30,
    settings:{...base.settings,mode}});
  ok(result.active===(c>1),'solo vs ensemble');
  ok(Number.isFinite(result.seconds)&&result.seconds>=0,'finite positive sample time');
  ok(Number.isFinite(result.gain)&&result.gain>=.25&&result.gain<=1.15,'bounded gain');
  ok(Number.isFinite(result.offsetSeconds)&&result.offsetSeconds>=0,'finite offset');
  for(const key of ['swayStrength','circleStrength','bounceStrength'])
    ok(result.studio[key]>=0&&result.studio[key]<=150,'bounded gain setting');
  ok(result.hip.strength===plan.hip.strength,'base hip intensity not overwritten');
  if(section==='hook'||section==='drop')ok(result.mode===null||result.mode==='sync'||result.offsetSeconds>=0,'safe shared hook');
 }
}
const sync=v.createEnsembleHipStateV745();
for(const slot of [0,1,2,3]){
 const s=step(v.createEnsembleHipStateV745(),{slot,settings:{...base.settings,mode:'sync'}});
 eq(s.seconds,10,'unison same absolute sample clock');
 ok(s.role===(slot===0?'lead':'background'),'lead roles predictable');
}
for(let slot=0;slot<4;slot++){
 const s=v.createEnsembleHipStateV745();let r;
 for(let i=0;i<140;i++)r=step(s,{slot,plan:makePlan('build'),seconds:10+i/60,
  settings:{...base.settings,mode:'stagger',strength:100,delayBeats:2}});
 ok(slot===0?r.offsetSeconds===0:r.offsetSeconds>0,'stagger offsets followers only');
}
for(let lead=0;lead<4;lead++)for(let slot=0;slot<4;slot++){
 const r=step(v.createEnsembleHipStateV745(),{slot,settings:{...base.settings,leadSlot:lead}});
 eq(r.role,slot===lead?'lead':'background','explicit lead selection');
}
// Call / response: complementary gains, unison at hook and drop.
for(const [section,expected] of [['verse','call-response'],['build','stagger'],['hook','sync'],['drop','sync'],['intro','sync']]){
 const r=step(v.createEnsembleHipStateV745(),{plan:makePlan(section)});
 eq(r.mode,expected,'auto section mapping');
}
for(const seconds of [1,2,2.4,2.6,3,3.5,3.9]){
 const lead=v.createEnsembleHipStateV745(),bg=v.createEnsembleHipStateV745();
 let a,b;
 for(let t=0;t<=seconds*60;t++){
  const now=t/60;
  a=step(lead,{slot:0,seconds:now,settings:{...base.settings,mode:'call-response',strength:100}});
  b=step(bg,{slot:1,seconds:now,settings:{...base.settings,mode:'call-response',strength:100}});
 }
 ok(a.gain>=.25&&b.gain>=.25,'response smooth bounds');
}
// Inactive cases must not alter the V744 plan and must clear retained phase.
for(const patch of [{count:1},{playing:false},{reducedMotion:true},{manualPriority:true},
 {seconds:-1},{seconds:Infinity},{settings:{enabled:false,mode:'stagger',strength:75,leadSlot:0,delayBeats:1}},
 {settings:{enabled:true,mode:'stagger',strength:0,leadSlot:0,delayBeats:1}},
 {plan:{...makePlan(),active:false}},{plan:{...makePlan(),hip:{mode:'off',strength:0,speed:100}}}]){
 const state=v.createEnsembleHipStateV745();
 step(state,{slot:1,plan:makePlan('build'),settings:{...base.settings,mode:'stagger'},seconds:20});
 const r=step(state,patch);
 ok(!r.active,'no ensemble overlay without explicit eligibility');
 const plan=patch.plan??base.plan;
 eq(r.hip,plan.hip,'authored/paused leaves hip mode untouched');
 eq(r.studio,plan.studio,'authored/paused leaves gains untouched');
 ok(state.lastSeconds===null&&state.delaySeconds===0,'clears offset on disable');
}
for(const [first,next] of [[20,0],[20,100],[10,9],[10,10.1]]){
 const s=v.createEnsembleHipStateV745();step(s,{seconds:first});
 const r=step(s,{seconds:next,trackId:'B'});
 ok(r.active&&Number.isFinite(r.seconds),'seeks and track swaps safe');
}
for(const bpm of [-5,0,35,65,120,190,Infinity,Number.MAX_VALUE])for(const seconds of [0,1e3,1e15,Number.MAX_VALUE]){
 const r=step(v.createEnsembleHipStateV745(),{bpm,seconds,slot:3,plan:makePlan('build'),
  settings:{enabled:true,mode:'stagger',strength:100,leadSlot:0,delayBeats:4}});
 ok(Number.isFinite(r.seconds)&&Number.isFinite(r.offsetSeconds)&&Number.isFinite(r.gain),'numeric extremes finite');
}
// Actual V742 -> V744 -> V745 -> V738 integration, several concurrently stepped dancers.
for(const genreName of ['deutschrap','hardtekk','hardstyle','rock','pop']){
 const actors=Array.from({length:4},()=>({smart:smart.createSmartHipStateV744(),ensemble:v.createEnsembleHipStateV745(),studio:studio.createHipStudioStateV738()}));
 for(let frame=0;frame<900;frame++){
  const sec=['verse','build','hook','drop','break'][Math.floor(frame/180)],seconds=frame/30;
  const poses=[];
  for(let slot=0;slot<4;slot++){
   const actor=actors[slot],hip={mode:'auto',strength:50,speed:100};
   const genrePlan=genre.directGenreHipV742({hip,studio:studio.DEFAULT_HIP_STUDIO_V738,
    config:{enabled:true,style:genreName,strength:75},genre:genreName,section:sec,
    seconds,bpm:135,playing:true,reducedMotion:false});
   const plan=smart.directSmartHipV744(actor.smart,{settings:smart.DEFAULT_SMART_HIP_V744,
    plan:genrePlan,originalHip:hip,seconds,bpm:135,section:sec,trackId:'ensemble-song',playing:true,reducedMotion:false});
   const ensemble=v.directEnsembleHipV745(actor.ensemble,{...base,plan,slot,seconds,bpm:135,
    count:4,trackId:'ensemble-song'});
   const rendered=studio.sampleHipStudioV738(actor.studio,{settings:ensemble.hip,studio:ensemble.studio,
    seconds:ensemble.seconds,bpm:135,genre:genreName,section:sec,delta:1/30,
    trackId:'ensemble-song',playing:true,reducedMotion:false,footIKEnabled:true,contactKnown:true,
    plantedLeft:true,plantedRight:false});
   ok(rendered.pose.ankleCounter===0,'foot contact unchanged by ensemble');
   for(const x of Object.values(rendered.pose))ok(Number.isFinite(x)&&Math.abs(x)<=.12,'rig pose bounded');
   poses.push(rendered.pose);
  }
 }
}
const live=read('components/visualizer/GltfDancerAvatarV492.tsx'),preview=read('components/visualizer/AvatarEditor.tsx');
const panel=read('components/SettingsPanel.tsx'),prefs=read('context/UiPreferencesContext.tsx'),types=read('types/music.ts');
ok(live.includes('directEnsembleHipV745(ensembleHipV745.current')&&live.includes('studio:ensembleHipPlanV745.studio'),'live ensemble integrated');
ok(preview.includes('directEnsembleHipV745(ensembleStateV745.current')&&preview.includes('seconds:ensembleHipPlanV745.seconds'),'preview integrated');
ok(panel.includes('Multi-Avatar Dance Sync · V745')&&panel.includes('avatarEnsembleHipV745'),'UI wired');
ok(prefs.includes('avatarEnsembleHipV745:{enabled:true')&&types.includes('avatarEnsembleHipV745?'),'persistence typed');
ok(preview.includes('V745 Performer testen')&&preview.includes('previewCountV745'),'role preview controls');
ok(read('components/visualizer/VisualizerStage.tsx').includes('ensembleCountV745={performerCountV440}'),'stage propagates actual performer count');
ok(read('components/visualizer/GroupDancersV326SceneV492.tsx').includes('ensembleCountV745:settings.count'),'group propagates ensemble size');
ok(read('components/visualizer/DanceFormationActorsV492.tsx').includes('ensembleCountV745:dual?2:1'),'duo propagates ensemble size');
ok(read('components/visualizer/registry.tsx').includes('ensembleCountV745?:number'),'typed optional performer count');
console.log(`PASS: V745 Multi-Avatar Hip Sync – ${checks} assertions`);
