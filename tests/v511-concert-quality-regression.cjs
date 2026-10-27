'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {captureStageSafetyV511:capture,stageSafetyStatusV511:status,
 optionalBodySampleHzV511:hz,EMPTY_STAGE_SAFETY_V511:empty,STAGE_SAFETY_LIMIT_V511:limit}=
 load('components/visualizer/concertStageQualityV511');
const budget=(enabled,level)=>({enabled,level});
for(const tier of ['high','balanced','low']){
 const baseline=tier==='high'?12:tier==='balanced'?7:0;
 for(const count of [1,2,3,4]){
  assert.equal(hz(tier,budget(false,'eco'),count),baseline,'no Pi opt-in changes');
  assert.equal(hz(tier,budget(true,'full'),count),baseline);
  assert.equal(hz(tier,budget(true,'balanced'),count),tier==='low'?0:count<3?baseline:Math.min(baseline,6));
  assert.equal(hz(tier,budget(true,'eco'),count),tier==='low'?0:count<3?baseline:4);
 }
}
const neutral=()=>({risk:0,gestureScale:1,accentScale:1,closestSurface:Infinity});
const close=()=>({risk:.82,gestureScale:.41,accentScale:.63,closestSurface:-.04});
const motion=(count,pairs=0,near=0,slots=Array.from({length:count},neutral))=>({active:near>0,pairsChecked:pairs,nearPairs:near,slots});
const args=(at,plan=motion(4,6))=>({at,plan,source:'group',avatars:4,playing:true,visible:true});
assert.deepEqual(status(empty,Date.now()).status,'no-data');
let state=capture(empty,args(1000));
assert.equal(state.readings.length,1);assert.equal(status(state,1200).status,'measured');
assert.strictEqual(capture(state,args(1900)),state,'no repeat inside one second');
assert.strictEqual(capture(state,args(1000)),state,'no duplicate');
assert.strictEqual(capture(state,{...args(2000),playing:false}),state,'no pause sampling');
assert.strictEqual(capture(state,{...args(2000),visible:false}),state,'no hidden sampling');
assert.strictEqual(capture(state,{...args(NaN)}),state);
assert.strictEqual(capture(state,{...args(2000),avatars:5}),state);
assert.strictEqual(capture(state,args(2000,motion(4,7))),state,'impossible pair count rejected');
assert.strictEqual(capture(state,args(2000,motion(4,2,3))),state,'invalid near count rejected');
assert.strictEqual(capture(state,args(2000,motion(4,3,0,[{...neutral(),risk:NaN}]))),state);
state=capture(state,args(2000,motion(4,0)));
assert.equal(status(state,2100).status,'unverified','zero measurements are NOT collision-free');
state=capture(state,args(3000,motion(4,1)));
assert.equal(status(state,3100).status,'partial','one checked pair is insufficient for four avatars');
state=capture(state,args(4000,motion(4,6,1,[close(),neutral(),neutral(),neutral()])));
assert.equal(status(state,4100).status,'close');
assert.equal(state.readings.at(-1).closestSurface,-.04);
assert.equal(status(state,9500).status,'no-data','outdated readings must not be displayed as safe');
assert.equal(status(state,3500).status,'no-data','time reversal invalidates cached sample');
let tested=0;
for(let i=0;i<32000;i++){
 const number=2+i%3;
 const pairs=number*(number-1)/2;
 const verified=i%7===0?0:i%5===0?Math.max(1,pairs-1):pairs;
 const near=i%13===0&&verified>0?1:0;
 const arr=Array.from({length:number},(_,j)=>j===i%number&&near?close():neutral());
 const t=8000+i*1001;
 const before=state;
 state=capture(state,{source:number===2?'duo':'group',avatars:number,at:t,
  playing:true,visible:true,plan:motion(number,verified,near,arr)});
 assert.notStrictEqual(state,before);
 assert(state.readings.length<=limit&&state.readings.length>0);
 const last=state.readings.at(-1);
 assert(Number.isFinite(last.maxRisk)&&last.maxRisk>=0&&last.maxRisk<=1);
 assert(last.checkedPairs<=last.possiblePairs);
 const s=status(state,t+500);
 assert(s.status===(!verified?'unverified':near?'close':verified<pairs?'partial':'measured'));
 tested++;
}
const d=fs.readFileSync('components/visualizer/DanceFormationActorsV492.tsx','utf8');
const g=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
const hook=fs.readFileSync('components/visualizer/useAnimatedCollisionSamplingV508.ts','utf8');
const glb=fs.readFileSync('components/visualizer/GltfDancerAvatarV492.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/RenderDiagnosticsPanel.tsx','utf8');
for(const [label,text,token] of [['duo',d,'recordStageSafetyV511({at:Date.now(),source:"duo"'],['group',g,'recordStageSafetyV511({at:Date.now(),source:"group"'],['hook',hook,'optionalBodySampleHzV511('],['glb',glb,'castCount:propsLipSyncV367?.ensembleCountV374??1'],['UI',ui,'<ConcertStageQualityPanelV511 />']])assert(text.includes(token),label+' connected to real scene');
assert(d.indexOf('recordStageSafetyV511(')>d.indexOf('motionDuoV508=planAnimatedCollisionV508'));
assert(g.indexOf('recordStageSafetyV511(')>g.indexOf('motionV508=planAnimatedCollisionV508'));
assert(hook.includes('readPiConcertBudgetV479()')&&hook.includes('if(tier===\'low\')return'));
const source=fs.readFileSync('components/visualizer/ConcertStageQualityPanelV511.tsx','utf8');
assert(source.includes('Nicht prüfbar')&&source.includes('Geprüfte Avatar-Paare'));
const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));
assert(/^0\.1\.0-v5(?:1[1-9]|[2-9][0-9])$/.test(pkg.version),'V511+ package version');
assert(pkg.scripts['build:preflight'].includes('npm run test:v511 && npm run test:v511:types && npm run test:v510'));
console.log(`PASS V511 Concert Quality: ${tested} deterministic ensemble windows, explicit measurement coverage, Pi opt-in cadence, duo/group/GLB/diagnostics wiring`);
