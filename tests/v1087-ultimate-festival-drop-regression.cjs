'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planUltimateFestivalDropV1087:plan,stepUltimateFestivalDropV1087:step,
 sampleUltimateFestivalDropV1087:sample,INITIAL_ULTIMATE_FESTIVAL_DROP_V1087:initial}=
 load('lib/arena360UltimateFestivalDropV1087');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const channels=()=>({shockwave:true,laser:true,led:true,confetti:true});
const input=(changes={})=>({enabled:true,stageIsArena:true,playing:true,reducedMotion:false,
 reactive:true,showDesignerEnabled:true,showDirectorEnabled:true,performanceTier:'high',
 observedSection:'drop',show:{active:true,scene:'hook',fade:.87,intensity:88,segmentIndex:3},
 progressMs:80000,durationMs:210000,strength:70,channels:channels(),...changes});
const good={beat:true,beatStrength:.95,bass:.85,energyEnvelope:.9};
const silent={beat:false,beatStrength:0,bass:0,energyEnvelope:0};
const cue=plan(input());
assert(cue.active&&cue.reason==='armed'&&cue.strength>0&&cue.strength<=.84);
assert.deepEqual(plan(input()),cue,'deterministic plan');
for(const changes of [{enabled:false},{stageIsArena:false},{playing:false},{reducedMotion:true},
 {reactive:false},{showDesignerEnabled:false},{showDirectorEnabled:false},{performanceTier:'low'},
 {performanceTier:null},{observedSection:'hook'},{observedSection:'verse'},{observedSection:null},
 {progressMs:-1},{progressMs:Infinity},{progressMs:210001},{durationMs:NaN},
 {durationMs:1000},{durationMs:1900000},{strength:0},{strength:Infinity},
 {show:null},{show:{...input().show,fade:NaN}},
 {show:{...input().show,segmentIndex:-1}},
 {channels:{shockwave:true,laser:false,led:false,confetti:false}}])
 assert(!plan(input(changes)).active,'fail closed '+JSON.stringify(changes));
const limited=plan(input({channels:{shockwave:true,laser:false,led:true,confetti:false}}));
assert(limited.active);
let state=step(initial,.016,cue,good,80000,'A');
assert.equal(state.eventCount,0,'first high beat primes edge detector');
state=step(state,.016,cue,silent,80100,'A');
state=step(state,.016,cue,{...good,beatStrength:.7},80300,'A');
assert.equal(state.eventCount,0,'weak beat is not a drop');
state=step(state,.016,cue,silent,80400,'A');
state=step(state,.016,cue,good,80500,'A');
assert.equal(state.eventCount,1,'measured beat edge must trigger exactly once');
assert(state.envelope>0);const pulse=sample(cue,state);
assert(pulse.visible&&pulse.shockwave>0&&pulse.led>0&&pulse.confetti>0&&pulse.laser>0);
assert.equal(sample(limited,state).confetti,0,'disabled confetti not reactivated');
assert.equal(sample(limited,state).laser,0,'disabled laser not reactivated');
for(let k=0;k<24;k++)state=step(state,.1,cue,k%2===0?silent:good,80500+k*100,'A');
assert.equal(state.eventCount,1,'no rapid retrigger within cooldown');
for(let k=24;k<180;k++)state=step(state,.1,cue,silent,80500+k*100,'A');
assert.equal(state.eventCount,1,'no artificial second event after cooldown expires');
assert.equal(state.envelope,0,'envelope decays without persistent full flash');
let reset=step(state,.016,cue,good,300,'B');
assert.equal(reset.eventCount,0,'track change wipes previous events');
assert.equal(reset.envelope,0,'track change wipes envelope');
reset=step(state,.016,cue,good,120000,'A');
assert.equal(reset.eventCount,0,'long seek wipes previous events');
reset=step(state,.016,cue,good,70000,'A');
assert.equal(reset.eventCount,0,'backward seek wipes previous events');
assert.equal(step(state,.016,plan(input({playing:false})),good,80500,'A').envelope,0);
const invalid=step(initial,Number.NaN,cue,good,Number.NaN,'A');
assert.equal(invalid.envelope,0);
let samples=0,last=initial;
for(let n=0;n<220000;n++){
 const scene=['intro','verse','build','hook','interlude','finale'][n%6];
 const p=plan(input({show:{...input().show,scene,intensity:1+n%100,fade:(n%1000+1)/1000},
  performanceTier:n%2===0?'balanced':'high'}));
 const beat=n%8===0;const progress=5000+n*7;
 last=step(last,.016,p,{beat,beatStrength:beat?.88:.0,bass:.67,energyEnvelope:.75},progress,'stress');
 const o=sample(p,last);
 assert(o.shockwave>=0&&o.shockwave<=.84&&o.laser<=.84&&o.led<=.84&&o.confetti<=.84);
 assert(Number.isFinite(last.envelope)&&Number.isFinite(last.ageSeconds));
 assert(last.eventCount>=0&&last.eventCount<=220000);samples++;
}
assert.equal(samples,220000);
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1087,'V1087 and newer releases');assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.includes('npm run test:v1087 && npm run test:v1087:types &&'));
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('planUltimateFestivalDropV1087({'));
assert(stage.includes('stepUltimateFestivalDropV1087('));
assert(stage.includes('ultimateFestivalDropStateV1087={ultimateFestivalDropStateV1087}'));
for(const f of ['ArenaLaserFansV1036.tsx','ArenaLaserTunnelsV1039.tsx','ArenaLedWallV1059.tsx',
 'ArenaFestivalAtmosphereV1084.tsx']){
 assert(read('components/visualizer/stages/'+f).includes('sampleUltimateFestivalDropV1087('),f);
}
assert(stage.includes('<ArenaUltimateFestivalDropV1087 cue='));
const moduleSource=read('lib/arena360UltimateFestivalDropV1087.ts');
for(const ban of ['Math.random(','Date.now(','fetch(','setInterval(','requestAnimationFrame(','navigator.'])
 assert(!moduleSource.includes(ban),'pure V1087 planner '+ban);
assert(read('context/UiPreferencesContext.tsx').includes('arenaUltimateFestivalDropEnabledV1087:false'));
assert(read('components/visualizer/ArenaShowDesignerPanelV1040.tsx').includes('arenaUltimateFestivalDropEnabledV1087:false'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1087-ultimate-festival-drop-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1087-ultimate-festival-drop-regression.cjs'));
console.log(`PASS V1087: ${samples} bounded show samples, shared beat edge, track/seek/quality/manual guards`);
