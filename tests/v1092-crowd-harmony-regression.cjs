'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {stepCrowdHarmonyV1092:step,INITIAL_CROWD_HARMONY_V1092:INITIAL,
 sampleCrowdHarmonyV1092:sample}=load('lib/arena360CrowdHarmonyV1092');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
const quiet={energyEnvelope:.18,bass:.20,beat:false,beatStrength:.2,attack:.1};
const normal={energyEnvelope:.57,bass:.46,beat:false,beatStrength:.1,attack:.1};
const accent={energyEnvelope:.90,bass:.84,beat:true,beatStrength:.94,attack:.88};
const args=(over={})=>({enabled:true,playing:true,reducedMotion:false,reactive:true,
 phoneSyncEnabled:true,phoneMode:'wave',performanceTier:'balanced',trackId:'song',
 progressMs:7000,durationMs:175000,deltaSeconds:.016,strength:55,style:'balanced',
 sceneHint:'steady',audio:quiet,...over});
for(const v of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
 {strength:0},{phoneSyncEnabled:false},{phoneMode:'pulse'},
 {phoneMode:'chase'},{performanceTier:'low'},{performanceTier:null}]){
 const out=step(INITIAL,args(v));
 assert(!out.active);assert.equal(sample(out.state,1).phoneGain,1);
}
for(const v of [{trackId:''},{trackId:'a'.repeat(170)},{progressMs:-1},{progressMs:220000},
 {durationMs:0},{durationMs:NaN},{deltaSeconds:Infinity},{deltaSeconds:.9},
 {strength:-1},{strength:81},{style:'bad'}])assert(!step(INITIAL,args(v)).active);
for(const field of ['energyEnvelope','bass','beatStrength','attack'])for(const v of [-1,2,NaN,Infinity])
 assert.equal(step(INITIAL,args({audio:{...accent,[field]:v}})).reason,'audio');
assert.equal(step(INITIAL,args({audio:{...accent,beat:'yes'}})).reason,'audio');
let state=step(INITIAL,args()).state;
assert.equal(sample(state,0).phoneGain,1,'first valid frame does not dim');
for(let i=1;i<=250;i++){
 const next=step(state,args({progressMs:7000+i*16}));
 assert(next.active);assert(!next.beatAccent);assert(next.state.lightGain<=state.lightGain+1e-9);
 state=next.state;
}
assert(state.lightGain<.9,'measured quiet energy dims existing crowd phones');
for(let angle=-Math.PI;angle<=Math.PI;angle+=.07){
 const x=sample(state,angle);
 assert(x.phoneGain>=.5&&x.phoneGain<=1);
 assert(x.rise>=0&&x.rise<=.05);
 assert(Math.abs(x.head)<=.022);
}
let hit=step(state,args({progressMs:11100,audio:accent,sceneHint:'steady'}));
assert(hit.beatAccent,'strong observed rising beat produces accent');
assert(hit.state.accent>0);
const held=step(hit.state,args({progressMs:11116,audio:accent,sceneHint:'accent'}));
assert(!held.beatAccent,'held beat cannot retrigger');
const empty=step(held.state,args({progressMs:11132,audio:normal,sceneHint:'accent'}));
const retrigger=step(empty.state,args({progressMs:11148,audio:accent,sceneHint:'accent'}));
assert(!retrigger.beatAccent,'too-early beat edge is rejected');
const fake=step(state,args({progressMs:11100,sceneHint:'accent',audio:normal}));
assert(!fake.beatAccent,'story arc labels cannot fabricate a real beat');
for(const v of [{trackId:'next'},{progressMs:2000},{progressMs:55000}])
 assert.equal(step(state,args(v)).reason,'priming');
assert.equal(sample(undefined,0).phoneGain,1);
assert.equal(sample(state,Infinity).phoneGain,1);
let curr=INITIAL;
for(let i=0;i<190000;i++){
 const a=i%37===0?accent:i%5===0?normal:quiet;
 const result=step(curr,args({trackId:'s'+Math.floor(i/13000),progressMs:(i*17)%168000,
  audio:a,strength:i%81,style:i%3===0?'balanced':i%3===1?'festival':'cinematic',
  sceneHint:i%7===0?'accent':i%5===0?'building':'quiet'}));
 const s=result.state;
 assert(s.lightGain>=.55&&s.lightGain<=1&&Number.isFinite(s.energyAverage));
 assert(s.accent>=0&&s.accent<=.18&&s.sway>=0&&s.sway<=.05);
 if(result.beatAccent)assert(a.beat&&a.beatStrength>=.76&&a.attack>=.68);
 if(i%19===0){const angle=(i%131)*.081;const sampleResult=sample(s,angle);
  assert(sampleResult.phoneGain>=.5&&sampleResult.phoneGain<=1);}
 curr=s;
}
const core=read('lib/arena360CrowdHarmonyV1092.ts');
for(const f of ['Date.now(', 'Math.random(', 'fetch(', 'setTimeout(', 'setInterval(',
 'localStorage.', 'navigator.', 'requestAnimationFrame('])assert(!core.includes(f));
const crowd=read('components/visualizer/stages/ArenaAudienceV1032.tsx');
assert(crowd.includes('crowdHarmonyV1092.current=')&&crowd.includes('stepCrowdHarmonyV1092('));
assert(crowd.includes('sampleCrowdHarmonyV1092(harmonyV1092.state,angle).phoneGain'));
assert(crowd.includes('sampleCrowdHarmonyV1092(harmonyV1092.state,Math.atan2(m.z,m.x))'));
assert(crowd.includes('phones.current?.setColorAt(i,')&&crowd.includes('sample.light*harmonyBand'));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('crowdHarmonyEnabledV1092={crowdHarmonyEnabledV1092&&showDesignerEnabled&&showDirectorEnabled}'));
assert(stage.includes('storyArcStateV1091={storyArcEnabledV1091?storyArcStateV1091:undefined}'));
for(const suffix of ['Enabled','Strength','Style']){
 const setting='arenaCrowdHarmony'+suffix+'V1092';const wire='crowdHarmony'+suffix+'V1092';
 assert(read('types/music.ts').includes(setting+'?:'));
 assert(read('components/visualizer/registry.tsx').includes(setting+'?:'));
 assert(read('components/visualizer/VisualizerStage.tsx').includes(setting+'={preferences.'+setting));
 assert(read('components/visualizer/ThreeAvatar.tsx').includes(wire+'={props.'+setting));
 assert(read('components/visualizer/stages/index.tsx').includes(wire+'={'+wire+'}'));
}
assert(read('context/UiPreferencesContext.tsx').includes('arenaCrowdHarmonyEnabledV1092:false'));
const panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(panel.includes('arena-v1092-crowd-harmony')&&panel.includes('arenaCrowdHarmonyEnabledV1092:false'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]??0)>=1092);assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.includes('npm run test:v1092 && npm run test:v1092:types &&'));
for(const s of ['scripts/v931-production-gate.cjs','scripts/vercel-production-build.cjs'])
 assert(read(s).includes('tests/v1092-crowd-harmony-regression.cjs'));
assert(read('scripts/v959-source-preflight.cjs').includes('inspectReleaseV1092(root)'));
console.log('PASS V1092: 190000 song-scoped crowd states; dim-only phones and wristbands; manual, seek, pause, and audio guards');
