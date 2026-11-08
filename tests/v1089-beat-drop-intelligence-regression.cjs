'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {stepBeatDropIntelligenceV1089:step,INITIAL_BEAT_STATE_V1089:INITIAL}=
 load('lib/beatDropIntelligenceV1089');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const quiet={beat:false,beatStrength:.1,bass:.31,energyEnvelope:.27,attack:.02,kickAccentIntensity:.0};
const peak={beat:true,beatStrength:.96,bass:.89,energyEnvelope:.91,attack:.87,kickAccentIntensity:.8};
const input=(updates={})=>({enabled:true,playing:true,reducedMotion:false,reactive:true,
 precision:'balanced',trackId:'track-A',progressMs:80000,deltaSeconds:.016,audio:quiet,...updates});
assert.equal(step(INITIAL,input({enabled:false})).decision,'disabled');
assert.equal(step(INITIAL,input({playing:false})).decision,'disabled');
assert.equal(step(INITIAL,input({reducedMotion:true})).decision,'disabled');
assert.equal(step(INITIAL,input({reactive:false})).decision,'disabled');
for(const updates of [{trackId:''},{trackId:'x'.repeat(161)},{progressMs:NaN},
 {progressMs:-1},{deltaSeconds:Infinity},{deltaSeconds:-.1},{deltaSeconds:.3},
 {precision:'super-strict'}])assert.equal(step(INITIAL,input(updates)).decision,'invalid');
for(const key of ['beatStrength','bass','energyEnvelope','attack','kickAccentIntensity'])
 for(const value of [-1,1.01,NaN,Infinity])
  assert.equal(step(INITIAL,input({audio:{...peak,[key]:value}})).decision,'invalid');
const primed=step(INITIAL,input({audio:peak}));
assert.equal(primed.decision,'priming');assert.equal(primed.qualifiedBeat,false);
let state=step(INITIAL,input()).state;
let result=step(state,input({audio:peak,progressMs:80100}));
assert.equal(result.decision,'qualified');assert.equal(result.qualifiedBeat,true);
assert(result.confidence>.75&&result.confidence<=1);
state=result.state;
result=step(state,input({audio:peak,progressMs:80100}));
assert.equal(result.decision,'held','held beat may not re-trigger');
state=step(state,input({audio:quiet,progressMs:80200})).state;
result=step(state,input({audio:peak,progressMs:80300}));
assert.equal(result.decision,'refractory','edge too soon');
let t=80400;
for(let n=0;n<120;n++){state=step(state,input({audio:{...quiet,bass:.82,energyEnvelope:.83},progressMs:t})).state;t+=40;}
assert.equal(step(state,input({audio:{...peak,attack:.02,kickAccentIntensity:0,energyEnvelope:.84},progressMs:t})).qualifiedBeat,false,
 'steady loud audio without attack is not a new high-confidence accent');
const strict=step(state,input({audio:peak,precision:'strict',progressMs:t}));
assert(strict.qualifiedBeat,'distinct strong kick is accepted by strict mode');
assert.equal(step(strict.state,input({audio:quiet,progressMs:t+100,trackId:'B'})).decision,'priming');
assert.equal(step(strict.state,input({audio:quiet,progressMs:t-900})).decision,'priming');
assert.equal(step(strict.state,input({audio:quiet,progressMs:t+13000})).decision,'priming');
assert.equal(step(strict.state,input({audio:quiet,playing:false})).state.lastProgressMs,-1);
assert.equal(step(strict.state,input({enabled:false})).state.events,0);
// The analyzer NEVER invents a beat: high bass/energy without an observed beat is inert.
state=step(INITIAL,input()).state;
result=step(state,input({audio:{...peak,beat:false}}));
assert.equal(result.qualifiedBeat,false);assert.equal(result.decision,'no-beat');
// 200,000 state transitions: finite confidence, bounded cooldown, no repeating held pulses.
state=INITIAL;let samples=0,qualified=0;
for(let n=0;n<200000;n++){
 const beat=(n%31===1),high=(n%93!==5);
 const audio=beat?{...peak,beatStrength:high?.91:.3}:{...quiet,energyEnvelope:.38};
 const next=step(state,input({trackId:'stress-'+Math.floor(n/10000),
  progressMs:1000+n*16,deltaSeconds:.016,audio,precision:n%2?'strict':'balanced'}));
 state=next.state;samples++;qualified+=Number(next.qualifiedBeat);
 assert(Number.isFinite(next.confidence)&&next.confidence>=0&&next.confidence<=1);
 assert(Number.isFinite(state.energyBaseline)&&state.energyBaseline>=0&&state.energyBaseline<=1);
 assert(Number.isFinite(state.bassBaseline)&&state.bassBaseline>=0&&state.bassBaseline<=1);
 assert(Number.isFinite(state.refractorySeconds)&&state.refractorySeconds>=0&&state.refractorySeconds<=.32);
 assert(!next.qualifiedBeat||next.decision==='qualified');
 assert(!next.qualifiedBeat||audio.beat===true);
 assert(state.events>=0&&state.events<=1000000);
}
assert(qualified>0&&qualified<samples/10,'measured accents are selective');
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(/^0\.1\.0-v(\d+)$/.test(pkg.version)&&Number(pkg.version.match(/v(\d+)$/)[1])>=1089);assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.includes('npm run test:v1089 && npm run test:v1089:types &&'));
const src=read('lib/beatDropIntelligenceV1089.ts');
for(const banned of ['Math.random(', 'Date.now(', 'fetch(', 'setTimeout(', 'setInterval(', 'localStorage.', 'navigator.', 'requestAnimationFrame('])
 assert(!src.includes(banned),'pure classifier cannot perform IO or synthesize beats: '+banned);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('stepBeatDropIntelligenceV1089('));
assert(stage.includes('beat:measuredBeatV1089.qualifiedBeat'));
assert(stage.includes('planUltimateFestivalDropV1087({'));
assert(stage.includes('ultimateFestivalDropCueV1087,qualifiedAudioV1089'));
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(panel.includes('arena-v1089-beat-intelligence'));
assert(panel.includes('arenaBeatIntelligenceEnabledV1089:false'));
assert(read('context/UiPreferencesContext.tsx').includes('arenaBeatIntelligenceEnabledV1089:false'));
assert(read('components/visualizer/ThreeAvatar.tsx').includes('beatIntelligenceEnabledV1089={props.arenaBeatIntelligenceEnabledV1089'));
const bridge=read('components/visualizer/stages/index.tsx');
const registry=read('components/visualizer/registry.tsx');
const stageUi=read('components/visualizer/VisualizerStage.tsx');
for(const key of ['ultimateFestivalDropEnabledV1087','ultimateFestivalDropStrengthV1087',
 'beatIntelligenceEnabledV1089','beatIntelligencePrecisionV1089']){
 assert(bridge.includes(`${key}={${key}}`),'StageEnvironment forwards '+key);
}
assert(registry.includes('arenaUltimateFestivalDropEnabledV1087?:boolean;'));
assert(registry.includes('arenaBeatIntelligenceEnabledV1089?:boolean;'));
assert(stageUi.includes('arenaUltimateFestivalDropEnabledV1087={preferences.arenaUltimateFestivalDropEnabledV1087'));
assert(stageUi.includes('arenaBeatIntelligenceEnabledV1089={preferences.arenaBeatIntelligenceEnabledV1089'));
assert(stage.includes('beatIntelligenceEnabledV1089=false'));

assert(read('scripts/v931-production-gate.cjs').includes('tests/v1089-beat-drop-intelligence-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1089-beat-drop-intelligence-regression.cjs'));
console.log(`PASS V1089: ${samples} bounded samples, ${qualified} measured beat edges, strict/balanced gates, pause/seek/track resets, V1087 authority`);
