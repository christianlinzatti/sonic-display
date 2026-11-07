#!/usr/bin/env node
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const {planSmartConcertFlowV1071:plan,FLOW_LANES_V1071:LANES,NEUTRAL_FLOW_V1071:OFF}=load('lib/arena360SmartConcertFlowV1071');
const {generateArenaShowPlanV1040:generate}=load('lib/arena360ShowDesignerV1040');
const template=generate({genre:'Deutschrap',durationMs:210000,prompt:'Dramatische Rap-Show'});
const sample=p=>{
 const index=Math.min(6,Math.max(0,template.segments.findIndex(s=>p<s.end)===-1?6:template.segments.findIndex(s=>p<s.end)));
 const s=template.segments[index];
 return {active:true,scene:s.scene,segmentIndex:index,intensity:s.intensity,fade:1,
  deck:s.deck,floating:s.floating,lasers:s.lasers,camera:s.camera,dance:s.dance};
};
const channels=Object.fromEntries(LANES.map(lane=>[lane,true]));
const options={enabled:true,stageIsArena:true,playing:true,reducedMotion:false,reactive:true,
 showDesignerEnabled:true,showDirectorEnabled:true,trackId:'v1071-track-A',
 progressMs:21000,durationMs:210000,performanceTier:'high',strength:70,plan:template,channels,show:sample(.10)};
const at=(p,patch={})=>plan({...options,progressMs:p*210000,show:sample(p),...patch});
assert.deepEqual(LANES,['deck','floating','holograms','lasers','led','cast','camera','rap']);
assert.deepEqual(at(.1),at(.1),'no wall-clock/random dependence');
assert.equal(at(.1).chapter,'verse-one');
assert.equal(at(.77).chapter,'verse-two');
assert.equal(at(.97).chapter,'finale');
assert.equal(at(.97).focus,'finale');
assert.equal(at(.11).focus,'vocal');
assert.equal(at(.33).focus,'energy');
assert.equal(at(.5).focus,'ensemble');
assert.equal(at(.67).focus,'atmosphere');
assert.equal(at(.11).rap,1,'rap must not be dimmed for rap genre');
assert.notEqual(at(.11).deck,at(.77).deck,'verses deliberately have different looks');
for(const key of ['enabled','stageIsArena','playing','reactive','showDesignerEnabled','showDirectorEnabled']){
 assert.deepEqual(at(.5,{[key]:false}),OFF,`${key} must fail closed`);
}
for(const patch of [{reducedMotion:true},{performanceTier:'low'},
 {trackId:''},{progressMs:-1},{progressMs:210001},{progressMs:NaN},
 {durationMs:0},{durationMs:Infinity},{strength:0},{strength:81},{strength:NaN},
 {show:null},{show:{...sample(.5),active:false}},{plan:null},
 {plan:{...template,segments:[]}},{channels:{}},
 {show:{...sample(.5),scene:'verse'}},
 {show:{...sample(.5),segmentIndex:999}}]){
 assert.deepEqual(at(.5,patch),OFF,`fail closed ${JSON.stringify(patch).slice(0,80)}`);
}
// Channels explicitly disabled by user or upstream remain NEUTRAL.
for(const lane of LANES){
 const masked={...channels,[lane]:false};
 const mix=at(.5,{channels:masked});assert.equal(mix[lane],1,`manual: ${lane}`);
}
assert.deepEqual(at(.5,{channels:Object.fromEntries(LANES.map(lane=>[lane,false]))}),OFF);
const boundaries=[.085,.29,.43,.62,.76,.88];
for(const b of boundaries){
 const left=at(b-1e-8),right=at(b+1e-8);
 assert(right.transition,`enter gradual mix at ${b}`);
 for(const lane of LANES)
  assert(Math.abs(left[lane]-right[lane])<.002,`discontinuous ${lane} at ${b}: ${left[lane]} ${right[lane]}`);
}
// Within each chapter this planner is mathematically continuous and never raises an independent effect.
for(const genre of ['Deutschrap','Hardtekk','Deutschrock','Pop']){
 const variant=generate({genre,prompt:'Mehr Kontraste',durationMs:210000});
 for(let k=0;k<5000;k++){
  const p=(k+.3)/5000;
  const index=variant.segments.findIndex(s=>p<s.end);
  const idx=index<0?6:index,s=variant.segments[idx];
  const cue={...sample(p),scene:s.scene,segmentIndex:idx};
  const result=plan({...options,plan:variant,show:cue,progressMs:p*210000,trackId:'track-'+genre});
  assert.equal(result.active,true,`${genre} @${p}`);
  for(const lane of LANES){
   assert(Number.isFinite(result[lane])&&result[lane]>=.5&&result[lane]<=1,`budget ${genre} ${lane} ${p}`);
  }
 }
}
assert(at(.5,{performanceTier:'balanced'}).lasers>=at(.5).lasers,
 'balanced tier never increases attenuation');
assert(at(.5,{strength:30}).lasers>=at(.5,{strength:70}).lasers,
 'lower settings mean lower impact');
// V1070 owns the finale: once the crossfade ends, all gains are neutral.
for(const p of [.9,.95,.98,.999]){
 const result=at(p);for(const lane of LANES)assert.equal(result[lane],1,'handoff to V1070: '+lane);
}
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
const cast=read('components/visualizer/ThreeAvatar.tsx');
const display=read('components/visualizer/VisualizerStage.tsx');
for(const token of ['planSmartConcertFlowV1071(','const flowStageV1071=','const flowFloatingV1071=',
 'const flowHologramsV1071=','const flowLasersV1071=','const flowLedV1071=','cue={flowLedV1071}',
 'laserCueV1057={flowLasersV1071}','floatingCueV1067={flowFloatingV1071}',
 'stageCueV1066={flowStageV1071}','concertCueV1068={flowHologramsV1071}'])
 assert(stage.includes(token),'V1071 stage channel: '+token);
for(const token of ['smartFlowCastV1071=planSmartConcertFlowV1071(','smartFlowCastV1071.camera',
 'smartFlowCastV1071.cast','rapFlowGainV1071=smartFlowCastV1071.rap',
 'props.lipSync?.rapSyllableEditsEnabledV420!==true'])
 assert(cast.includes(token),'V1071 cast channel: '+token);
for(const name of ['types/music.ts','components/visualizer/registry.tsx',
 'context/UiPreferencesContext.tsx','components/visualizer/VisualizerStage.tsx',
 'components/visualizer/ThreeAvatar.tsx'])
 assert(read(name).includes('arenaSmartConcertFlowStrengthV1071'),name);
assert(read('components/visualizer/stages/index.tsx').includes('smartConcertFlowStrengthV1071'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaSmartConcertFlowEnabledV1071:false'));
assert(display.includes('arenaSmartConcertFlowEnabledV1071='));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('V1071 · Smart Concert Flow 3.0'));
for(const p of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(p).includes('tests/v1071-smart-concert-flow-regression.cjs'));
const planner=read('lib/arena360SmartConcertFlowV1071.ts');
assert(!/(?:\bfetch\(|Math\.random\(|Date\.now\(|setInterval\(|setTimeout\(|WebSocket\(|localStorage|audio\.beat|GoveeClient)/.test(planner));
assert(/^0\.1\.0-v\d+$/.test(require(path.join(root,'package.json')).version));
console.log('PASS V1071: 20,000 continuity/budget samples, seven chapters, eight lanes, manual locks, neutral V1070 handoff');
