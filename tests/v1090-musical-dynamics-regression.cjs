'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {stepMusicalDynamicsV1090:step,INITIAL_MUSICAL_DYNAMICS_V1090:INITIAL,
 sampleMusicalDynamicsGainV1090:sample}=load('lib/arena360MusicalDynamicsV1090');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
const quiet={energyEnvelope:.14,bass:.17,beat:false,beatStrength:.1,attack:.05};
const normal={energyEnvelope:.48,bass:.38,beat:false,beatStrength:.3,attack:.18};
const high={energyEnvelope:.91,bass:.9,beat:true,beatStrength:.95,attack:.88};
const input=(o={})=>({enabled:true,playing:true,reducedMotion:false,reactive:true,
 performanceTier:'balanced',trackId:'song1',progressMs:30000,deltaSeconds:.016,
 strength:55,style:'balanced',observedSection:'verse',audio:quiet,...o});
for(const o of [{enabled:false},{playing:false},{reducedMotion:true},{reactive:false},
 {performanceTier:'low'},{performanceTier:null},{strength:0}]){
 const r=step(INITIAL,input(o));assert.equal(r.active,false);assert.equal(sample(r.state),1);
}
for(const o of [{trackId:''},{trackId:'x'.repeat(161)},{progressMs:-1},{progressMs:NaN},
 {deltaSeconds:-1},{deltaSeconds:.4},{strength:-1},{strength:81},{style:'invalid'}])
 assert.equal(step(INITIAL,input(o)).active,false);
for(const key of ['energyEnvelope','bass','beatStrength','attack'])
 for(const value of [-1,1.1,Infinity,NaN])
  assert.equal(step(INITIAL,input({audio:{...high,[key]:value}})).reason,'audio');
assert.equal(step(INITIAL,input({audio:{...high,beat:'yes'}})).reason,'audio');
let s=step(INITIAL,input()).state;
assert.equal(s.gain,1,'song starts at existing brightness, no discontinuity');
let prior=s.gain;
for(let i=1;i<=240;i++){
 const r=step(s,input({progressMs:30000+i*16}));
 assert(r.active);assert(r.state.gain<=prior+1e-12,'quiet light must not brighten');
 assert(r.state.gain>=.38&&r.state.gain<=1);s=r.state;prior=s.gain;
}
assert(s.gain<.80,'sustained quiet portion should noticeably reduce light');
let next=step(s,input({progressMs:34000,audio:high,observedSection:'drop'}));
assert(next.state.gain>=s.gain&&next.state.gain<=1,'beat can only restore original brightness');
assert(next.state.phase==='accent');
assert(next.state.gain-s.gain<.05,'no abrupt jump to a fullscreen flash');
let state=next.state;
for(let i=1;i<=240;i++)state=step(state,input({progressMs:34000+i*16,audio:high})).state;
assert(state.gain>.94,'bright climax eventually restores normal light without overshoot');
assert.equal(step(state,input({progressMs:30000,audio:high})).reason,'priming','backwards seek primes gain=1');
assert.equal(step(state,input({progressMs:55000,audio:high})).reason,'priming','large seek primes gain=1');
assert.equal(step(state,input({trackId:'song2',audio:quiet})).reason,'priming');
assert.equal(step(state,input({playing:false})).state.lastProgressMs,-1);
assert.equal(step(state,input({enabled:false})).state.gain,1);
const unobserved=step(s,input({progressMs:34000,audio:{...normal,beat:false},observedSection:'drop'}));
assert.notEqual(unobserved.state.phase,'accent','an authored drop cannot make up a beat');
assert(sample({gain:10})===1&&sample({gain:-2})===.38&&sample(undefined)===1);
let count=0, prev=INITIAL;
for(let i=0;i<260000;i++){
 const section=i%79===0?'drop':i%13===0?'build':'verse';
 const audio=i%19===0?high:i%6===0?normal:quiet;
 const out=step(prev,input({trackId:'song-'+Math.floor(i/20000),progressMs:i*17,
  deltaSeconds:i%7===0?.019:.016,style:i%3===0?'cinematic':i%3===1?'festival':'balanced',
  strength:i%81,observedSection:section,audio}));
 assert(Number.isFinite(out.state.gain)&&out.state.gain>=.38&&out.state.gain<=1);
 assert(Number.isFinite(out.state.target)&&out.state.target>=.38&&out.state.target<=1);
 assert(out.state.phase!=='accent'||(audio.beat&&audio.attack>=.62&&audio.beatStrength>=.76));
 count++;prev=out.state;
}
const source=read('lib/arena360MusicalDynamicsV1090.ts');
for(const forbidden of ['Math.random(', 'Date.now(', 'fetch(', 'setTimeout(', 'setInterval(',
 'localStorage.', 'navigator.', 'requestAnimationFrame('])
 assert(!source.includes(forbidden),'pure stage transition planner may not perform IO: '+forbidden);
const stage=read('components/visualizer/stages/Arena360StageV1031.tsx');
assert(stage.includes('musicalDynamicsStateV1090.current=stepMusicalDynamicsV1090('));
assert(stage.includes("ledWallPatternV1059==='auto'"));
assert(stage.includes("hologramPattern==='auto'"));
assert(stage.includes('musicalDynamicsStateV1090={hologramPattern')&&stage.includes('musicalDynamicsStateV1090={ledWallPattern'));
for(const component of ['ArenaLedWallV1059.tsx','ArenaLaserFansV1036.tsx','ArenaLaserTunnelsV1039.tsx']){
 const text=read('components/visualizer/stages/'+component);
 assert(text.includes('sampleMusicalDynamicsGainV1090(musicalDynamicsStateV1090?.current)'),component+' reads shared frame gain');
 assert(!text.includes('setInterval(')&&!text.includes('setTimeout('),'no added ticker');
}
const bridge=read('components/visualizer/stages/index.tsx');
for(const key of ['musicalDynamicsEnabledV1090','musicalDynamicsStrengthV1090','musicalDynamicsStyleV1090'])
 assert(bridge.includes(`${key}={${key}}`),'bridge forwards '+key);
const preference=read('context/UiPreferencesContext.tsx'),panel=read('components/visualizer/ArenaShowDesignerPanelV1040.tsx');
assert(preference.includes('arenaMusicalDynamicsEnabledV1090:false'));
assert(panel.includes('arena-v1090-musical-dynamics')&&panel.includes('arenaMusicalDynamicsEnabledV1090:false'));
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(/^0\.1\.0-v(\d+)$/.test(pkg.version));assert(Number(pkg.version.match(/v(\d+)$/)[1])>=1090);
assert.equal(pkg.version,lock.version);assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.startsWith('npm run test:v1090 && npm run test:v1090:types &&'));
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1090-musical-dynamics-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1090-musical-dynamics-regression.cjs'));
console.log(`PASS V1090: ${count} finite phase/gain samples, smooth crossfades, manual priority, no fabricated beat/drop, pause/seek/track guards`);
