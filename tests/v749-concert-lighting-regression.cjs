'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {DEFAULT_PERFORMANCE_LIGHTING_V749:defaults,normalizePerformanceLightingV749:normalize,
 planPerformanceLightingV749:plan,advancePerformanceLightingV749:advance,
 createPerformanceLightingStateV749:initial}=load('components/visualizer/performanceLightingDirectorV749');
let checks=0;const ok=(v,msg)=>{assert.ok(v,msg);checks++;};
const eq=(a,b,msg)=>{assert.deepEqual(a,b,msg);checks++;};
const cast={active:true,moment:'handoff',keyGain:1,fillGain:1,beamGain:1,spotGain:1,hazeGain:1,sweepGain:1,
 fogNearOffset:0,fogFarOffset:0,leftSingerSlot:0,rightSingerSlot:1,focusStrength:.6};
const options={settings:defaults,cast,section:'verse',energy:.75,kick:.4,playing:true,reactive:true,reducedMotion:false,
 tier:'high',authored:false,blackout:false,lyricsProtected:false,groupCount:2,cameraFocus:true};
eq(normalize(),defaults);eq(normalize({strength:Infinity,transitionMs:NaN}),defaults);
eq(normalize({strength:-10,transitionMs:10000,dropAccents:null}),{...defaults,strength:0,transitionMs:2500});
const singer=plan(options);ok(singer.active);eq(singer.scene,'handoff');eq(singer.reason,'v551-cast');eq(singer.focusSlot,0);eq(singer.partnerSlot,1);
ok(singer.key>=1&&singer.fill>1&&singer.beam<1&&singer.sweep<1);
const absent=plan({...options,cast:null});eq(absent.focusSlot,null);eq(absent.partnerSlot,null);ok(absent.scene!=='vocal');
const intro=plan({...options,cast:null,section:'verse',cameraFocus:false});eq(intro.scene,'calm');
eq(plan({...options,cast:null,section:'hook',cameraFocus:false}).scene,'hook');
eq(plan({...options,cast:null,section:'build',cameraFocus:false}).scene,'build');
eq(plan({...options,cast:null,section:'drop',cameraFocus:false,kick:.85}).scene,'drop');
eq(plan({...options,cast:null,section:'drop',cameraFocus:false,kick:.01}).scene,'calm');
for(const settings of [{enabled:false},{strength:0}])ok(!plan({...options,settings}).active);
for(const v of [{playing:false},{reactive:false},{reducedMotion:true},{authored:true},{blackout:true},{tier:'low'},
 {energy:-1},{energy:NaN},{energy:Infinity},{energy:2},{kick:-1},{kick:NaN},{kick:Infinity},{kick:2},
 {groupCount:0},{groupCount:5},{groupCount:1.5}]){
 const cue=plan({...options,...v});ok(!cue.active,'fails closed '+JSON.stringify(v));eq(cue.focusSlot,null);
}
for(const castMod of [{...cast,leftSingerSlot:3},{...cast,rightSingerSlot:4},{...cast,focusStrength:NaN},
 {...cast,focusStrength:0},{...cast,focusStrength:3},{...cast,active:false}]){
 const c=plan({...options,cast:castMod});ok(c.focusSlot===null||c.focusSlot===0);
 if(c.focusSlot===null)ok(c.reason!=='v551-cast');
}
for(const section of ['verse','hook','build','drop','break'])for(const lyricsProtected of [true,false]){
 const cue=plan({...options,section,lyricsProtected,cast:null,kick:.8});
 if(lyricsProtected){ok(cue.beam<=1);ok(cue.sweep<=1);ok(cue.fill>=1);}
 for(const key of ['key','fill','beam','sweep'])ok(Number.isFinite(cue[key]));
}
let state=initial();for(let i=0;i<150;i++){
 advance(state,singer,1/60,900);checks++;ok(state.key<=singer.key+1e-9);ok(state.beam>=singer.beam-1e-9);
}ok(state.key>1);const old={...state};advance(state,{...singer,active:false},1/60,900);eq(state,initial());
advance(state,singer,0,900);eq(state,initial());advance(state,singer,1/60,NaN);ok(state.key>1);
// 40,000 frame permutations: bounded on five stages, 1-4 performers, and a variety of sources.
const sections=['verse','hook','build','drop','break'];
for(let i=0;i<40000;i++){
 const section=sections[i%sections.length],playing=i%19!==0,authored=i%17===0,
  blackout=i%31===0,reducedMotion=i%47===0,lyricsProtected=i%3===0,groupCount=1+i%4,
  kick=(i*17%97)/96,energy=(i*7%101)/100;
 const c=plan({...options,section,playing,authored,blackout,reducedMotion,lyricsProtected,
  groupCount,kick,energy,cameraFocus:i%7===0,cast:i%11===0?cast:null,
  settings:{...defaults,strength:i%101}});
 checks++;
 for(const [k,a,b] of [['key',.96,1.055],['fill',.97,1.09],['beam',.75,1.12],['sweep',.72,1.08]]){
  assert.ok(c[k]>=a-1e-8&&c[k]<=b+1e-8,`${k} ${c[k]}`);
 }
 if(!playing||authored||blackout||reducedMotion){assert.equal(c.active,false);assert.equal(c.focusSlot,null);}
 if(c.focusSlot!==null){assert.ok(c.focusSlot>=0&&c.focusSlot<groupCount);assert.ok(c.reason==='v551-cast');}
 if(lyricsProtected&&c.active){assert.ok(c.beam<=1+1e-9);assert.ok(c.sweep<=1+1e-9);}
 const frame=advance(state,c,1/60,250+(i%45)*50);
 assert.ok(frame.key>=.96-1e-8&&frame.key<=1.055+1e-8);
 assert.ok(frame.fill>=.97-1e-8&&frame.fill<=1.09+1e-8);
 assert.ok(frame.beam>=.75-1e-8&&frame.beam<=1.12+1e-8);
 assert.ok(frame.sweep>=.72-1e-8&&frame.sweep<=1.08+1e-8);
}
const source=(file)=>fs.readFileSync(file,'utf8');
const stage=source('components/visualizer/DynamicStage.tsx');
const three=source('components/visualizer/ThreeAvatar.tsx');
const visual=source('components/visualizer/VisualizerStage.tsx');
const reg=source('components/visualizer/registry.tsx');
const pref=source('context/UiPreferencesContext.tsx');
const settings=source('components/SettingsPanel.tsx');
for(const token of ['planPerformanceLightingV749','advancePerformanceLightingV749','lightingMixV749Now.key',
 'lightingMixV749Now.beam','lightingMixV749Now.sweep','performanceLightingV749?:PerformanceLightingSettingsV749'])ok(stage.includes(token),token);
for(const [file,text] of [['ThreeAvatar',three],['VisualizerStage',visual],['registry',reg]])ok(text.includes('performanceLightingV749'),file);
ok(pref.includes('avatarPerformanceLightingV749:{enabled:true'));ok(settings.includes('V749 · Concert Lighting Director'));
ok(stage.includes('authored:authoredLightsV386'));ok(stage.includes('blackout:timelineCue.blackout'));
console.log(`PASS V749 Concert Lighting Director: ${checks} checks (40,000 deterministic frames)`);
