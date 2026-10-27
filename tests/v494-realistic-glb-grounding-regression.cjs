'use strict';
require('./helpers/threeAvatarSourcesV492.cjs').install();
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const M=load('components/visualizer/realisticGlbFootContactV494');
const foot={offsetX:.10,offsetZ:-.06,liftLeft:0,liftRight:0,rootSpeed:.12,weightShift:0};
const stable={tracked:true,leftPlanted:true,rightPlanted:true,leftConfidence:.96,rightConfidence:.90,leftDriftCm:.3,rightDriftCm:.4};
const pose={mode:'stand',depth:0};
const base={modelId:'model_123',trackId:'track_A',seconds:1,delta:1/60,
  footwork:foot,observation:stable,pose,playing:true,reducedMotion:false,
  manualPriority:false,automaticGroup:true,footLocked:false,quality:'high',
  calibration:M.DEFAULT_GLB_GROUND_CALIBRATION_V494};
const step=(state,values={})=>M.stepGlbGroundingV494({...base,state,...values});
let state=M.newGlbGroundStateV494();
let first=step(state);assert.equal(first.decision.active,true);
assert.equal(first.decision.modelId,'model_123');
assert.deepEqual(first,M.stepGlbGroundingV494({...base,state}),'pure deterministic');
state=first.state;
for(let i=0;i<180;i++){
 const result=step(state,{seconds:1+(i+1)/60});state=result.state;
 assert(result.decision.gain>=.12&&result.decision.gain<=1);
 assert(Math.abs(result.decision.offsetX)<=.10);
 assert(Math.abs(result.decision.offsetZ)<=.06);
}
assert(Math.abs(state.gain-.55)<.00001,'both planted settles to calibrated gain');
const lower=step(state,{seconds:4.1,pose:{mode:'crouch',depth:.36}});
assert.equal(lower.decision.phase,'lowering');
assert(lower.decision.gain<state.gain,'lowering dampens optional stage movement');
const rise=step(lower.state,{seconds:4.15,pose:{mode:'stand',depth:0}});
assert.equal(rise.decision.phase,'rising');
assert(rise.decision.gain<lower.decision.gain,'rising also calms optional movement');
const drift=step(state,{seconds:4.1,observation:{...stable,leftDriftCm:7}});
assert(drift.decision.gain<state.gain,'measured drift calms optional steps');
const noConfidence=step(state,{seconds:4.1,observation:{...stable,leftConfidence:.1,rightConfidence:.1}});
assert.equal(noConfidence.decision.support,'none');
assert(noConfidence.decision.gain>state.gain,'no confirmed contact means no fictitious braking');
const single=step(state,{seconds:4.1,observation:{...stable,leftPlanted:false}});
assert.equal(single.decision.support,'right');
for(const [key,value] of [['playing',false],['reducedMotion',true],['manualPriority',true],['automaticGroup',false],
 ['footLocked',true],['quality','low'],['trackId',''],['observation',{...stable,tracked:false}],['delta',NaN]]){
 const result=step(state,{seconds:4.1,[key]:value});
 assert.equal(result.decision.active,false,`guard ${key} must disable`);
 assert.equal(result.decision.offsetX,foot.offsetX,`guard ${key} preserves original offset`);
 assert.equal(result.decision.offsetZ,foot.offsetZ);
 assert.equal(result.decision.gain,1);
}
const seek=step(state,{seconds:.2});assert.equal(seek.state.lastSeconds,.2);
assert.equal(seek.decision.phase,'side-step');
const changeModel=step(state,{modelId:'different',seconds:4.1});
assert.equal(changeModel.state.modelId,'different');assert(changeModel.state.gain>state.gain);
const changeTrack=step(state,{trackId:'track_B',seconds:4.1});assert.equal(changeTrack.state.trackId,'track_B');
const stale=step(state,{seconds:20});assert(stale.state.gain>state.gain,'long discontinuity resets fade');
const unsound=step(state,{seconds:4.1,footwork:{...foot,offsetX:NaN}});
assert.equal(unsound.decision.active,false);assert.equal(unsound.decision.offsetX,0,'nonfinite motion is never forwarded to a stage root');
assert.deepEqual(M.normalizeGlbGroundCalibrationV494({stanceDamping:-200,transitionHoldMs:1e50,driftThresholdCm:NaN}),
 {enabled:true,stanceDamping:.1,transitionHoldMs:800,driftThresholdCm:4});
assert.equal(M.normalizeGlbGroundModelIdV494('normal-GLB_003'), 'normal-GLB_003');
for(const bad of ['../../../evil','a'.repeat(100),'https://example.com/a.glb',''])assert.equal(M.normalizeGlbGroundModelIdV494(bad),'');
const safe=M.normalizeGlbGroundCalibrationsV494({'model-1':{stanceDamping:.4},'not a model':{stanceDamping:0}});
assert.equal(safe['model-1'].stanceDamping,.4);assert.equal(safe['not a model'],undefined);
assert.equal(Object.getPrototypeOf(safe),null);
// Storage permissions/invalid JSON are graceful and settings are strictly scoped to a known model.
const before=global.window;
const store=new Map();const events=[];
global.window={localStorage:{getItem:(k)=>store.get(k)??null,setItem:(k,v)=>store.set(k,v)},
 dispatchEvent:(e)=>events.push(e.type)};
const oldEvent=global.Event;global.Event=class {constructor(type){this.type=type;}};
try{
 assert.equal(M.writeGlbGroundCalibrationV494('model-1',{stanceDamping:.35}).stanceDamping,.35);
 assert.equal(M.readGlbGroundCalibrationsV494()['model-1'].stanceDamping,.35);
 assert.deepEqual(events,[M.GLB_GROUND_CALIBRATION_EVENT_V494]);
 assert.equal(M.writeGlbGroundCalibrationV494('https://bad/url',{stanceDamping:.9}),null);
 store.set(M.GLB_GROUND_CALIBRATIONS_KEY_V494,'invalid json');
 assert.deepEqual(Object.keys(M.readGlbGroundCalibrationsV494()),[]);
}finally{global.window=before;global.Event=oldEvent;}
// Representative 30-minute 60-FPS simulated frame schedule; deterministic bounded values.
state=M.newGlbGroundStateV494();let min=1,max=0;let phaseCount=0;
for(let i=0;i<108000;i++){
 const second=i/60,depth=i%600<280?.30:0,offsetX=.045*Math.sin(i/39);
 const sample={...base,state,seconds:second,delta:1/60,
  pose:{mode:depth?'crouch':'stand',depth},footwork:{...foot,offsetX},
  observation:{...stable,leftPlanted:i%170>=20,rightPlanted:i%170<=150,leftDriftCm:i%100<6?6:.5}};
 const next=M.stepGlbGroundingV494(sample);
 if(next.decision.phase==='rising')phaseCount++;
 assert(Number.isFinite(next.decision.gain)&&next.decision.gain<=1&&next.decision.gain>=.12);
 assert(Math.abs(next.decision.offsetX)<=Math.abs(offsetX)+1e-12);
 min=Math.min(min,next.decision.gain);max=Math.max(max,next.decision.gain);state=next.state;
}
assert(min<.45&&max<=1&&phaseCount>20);
const scene=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
for(const token of ['stepGlbGroundingV494','newGlbGroundStateV494','GLB_GROUND_REPORT_EVENT_V494',
 'observation:groundV487.current[i].current','pose:lowInteractionPlanV483.plan.slots[i]',
 'groundDecisionsV494[i].offsetX','groundDecisionsV494[i].offsetZ',
 'calibrationsV494.current[modelId]','footLocked:footLock','GroupGroundObservationContextV487.Provider'])
 assert(scene.includes(token),`missing live V494: ${token}`);
assert.equal((scene.match(/useFrame\(/g)||[]).length,1,'same group frame loop, no extra loop');
for(const unchanged of ['targetX+(crewV458.slots[i]?.offsetX??0)','targetZ+(crewV458.slots[i]?.offsetZ??0)',
 'groundTravelV487[i]??1','g.position.y=0'])assert(scene.includes(unchanged),'unchanged stage target: '+unchanged);
const ui=fs.readFileSync('components/visualizer/GlbGroundingCalibrationPanelV494.tsx','utf8');
const controls=fs.readFileSync('components/visualizer/StageDirectorControlsV287.tsx','utf8');
assert(controls.includes('<GlbGroundingCalibrationPanelV494 />'));
for(const token of ['GLB_GROUND_REPORT_EVENT_V494','writeGlbGroundCalibrationV494','driftThresholdCm','stanceDamping','transitionHoldMs'])assert(ui.includes(token));
assert(!/(setInterval|requestAnimationFrame|useFrame\()/.test(ui));
const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)/)?.[1])>=494,'V494 test requires V494 or newer');
assert(pkg.scripts['build:preflight'].includes('npm run test:v494 && npm run test:v494:types && npm run test:v493'));
console.log('PASS V494: contact-aware optional GLB travel, safe reset/guards, per-model calibration, 30-minute simulation, stable render architecture');
