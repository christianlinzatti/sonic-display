'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {advanceSongStructureV1088:advance}=load('lib/songStructureDetectionV1088');
const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const observed=(section='hook',start=30000,end=60000)=>({
 source:'measured-and-verified',section,sectionStartMs:start,sectionEndMs:end,nextSection:'verse',
 energy:.8,bass:.77,trend:.05,feel:'intense',genreDirection:'rap',rapVocalVerified:false,
 measuredBpm:null,verifiedSection:true,measuredAudio:true
});
const audio=(energy=.68,bass=.52,trend=.3)=>({source:'measured-audio',section:null,
 sectionStartMs:null,sectionEndMs:null,nextSection:null,energy,bass,trend,
 feel:'rising',genreDirection:'rap',rapVocalVerified:false,measuredBpm:null,
 verifiedSection:false,measuredAudio:true});
const obs=(at=40000,evidence=audio(),fields={})=>({trackId:'track-A',durationMs:210000,
 positionMs:at,playing:true,evidence,...fields});
let r=advance(null,obs(40000,observed()));
assert.equal(r.result.source,'verified-timeline');
assert.equal(r.result.label,'hook');
assert.equal(r.result.confidence,1);assert.equal(r.result.startMs,30000);
assert.equal(r.result.endMs,60000);assert.equal(r.result.nextLabel,'verse');
for(const name of ['verse','hook','build','drop','break']){
 r=advance(null,obs(42000,observed(name)));
 assert.equal(r.result.label,name);assert.equal(r.result.source,'verified-timeline');
}
for(const invalid of [obs(-1),obs(NaN),obs(210000),obs(40000,audio(),{playing:false}),
 obs(40000,audio(),{trackId:''}),obs(40000,audio(),{durationMs:0}),
 obs(40000,audio(),{durationMs:Infinity})]){
 const dropped=advance(r.state,invalid);assert.equal(dropped.state,null);assert.equal(dropped.result.source,'unavailable');
}
// Verified time windows and synthetic evidence mismatches never create cues.
for(const evidence of [observed('hook',30000,35000),observed('hook',NaN,70000),
 observed('unknown'),{...observed(),verifiedSection:false},null]){
 r=advance(null,obs(40000,evidence));assert.notEqual(r.result.source,'verified-timeline');
}
// A single energy peak or loud signal never counts as a measured hook/drop.
let state=null;
for(let t=10000;t<=14500;t+=500){r=advance(state,obs(t,audio()));state=r.state;}
assert.equal(r.result.label,'build');assert.equal(r.result.source,'audio-hypothesis');
assert(r.result.confidence>=.52&&r.result.confidence<=.72);
assert.equal(r.result.startMs,null);assert.equal(r.result.endMs,null);
assert.equal(r.result.nextLabel,null);
// Duplicate position, future timestamps, zero audio or seek cannot sustain hypotheses.
let repeated=advance(state,obs(14500,audio()));
assert.equal(repeated.result.source,'audio-hypothesis');
assert.equal(repeated.state.candidateObservations,state.candidateObservations);
assert.equal(advance(state,obs(25000,audio())).result.source,'unavailable');
assert.equal(advance(state,obs(5000,audio())).result.source,'unavailable');
assert.equal(advance(state,obs(15000,audio(0,0,0))).result.source,'unavailable');
assert.equal(advance(state,obs(15000,{...audio(),measuredAudio:false})).result.source,'unavailable');
// A quiet break requires a sustained falling measured envelope.
state=null;
for(let t=20000;t<=24000;t+=500){r=advance(state,obs(t,audio(.19,.14,-.27)));state=r.state;}
assert.equal(r.result.label,'break');assert.equal(r.result.source,'audio-hypothesis');
// Positive metadata or position alone must not create a hook/finale.
assert.equal(advance(null,obs(100,audio(.9,.96,.0))).result.label,null);
assert.equal(advance(null,obs(207000,null)).result.chapter,'ending');
assert.equal(advance(null,obs(207000,null)).result.label,null);
assert.equal(advance(null,obs(5000,null)).result.chapter,'opening');
assert.equal(advance(null,obs(80000,null)).result.chapter,'body');
// Track switch and pause must remove previously accepted evidence.
assert.equal(advance(state,obs(24000,audio(),{trackId:'track-B'})).result.source,'unavailable');
assert.equal(advance(state,obs(24000,audio(),{playing:false})).state,null);
const bad=[Infinity,NaN,-.01,1.01];
for(const value of bad){
 for(const key of ['energy','bass','trend']){
 const e=audio(),caseE={...e,[key]:value};
 assert.equal(advance(state,obs(24500,caseE)).result.source,'unavailable');
 }
}
// Large deterministic stress sweep across all major input variants, bounded output.
let samples=0,history=null;
for(let n=0;n<220000;n++){
 const pos=10000+(n%120)*250,section=(n%17===0)?observed('verse',0,210000):
  (n%5===0?audio(.17,.15,-.25):audio(.63,.54,.3));
 const next=advance(history,obs(pos,section,{trackId:'song-'+Math.floor(n/120)}));
 history=next.state;
 const v=next.result;
 assert(Number.isFinite(v.confidence)&&v.confidence>=0&&v.confidence<=1);
 assert(v.label===null||['verse','hook','build','drop','break'].includes(v.label));
 assert(v.source!=='audio-hypothesis'||v.label==='build'||v.label==='break');
 assert(v.source!=='verified-timeline'||v.confidence===1);
 assert(!history||Number.isFinite(history.positionMs));samples++;
}
const pkg=JSON.parse(read('package.json')),lock=JSON.parse(read('package-lock.json'));
assert(Number(/^0\.1\.0-v(\d+)$/.exec(pkg.version)?.[1]||0)>=1088);assert.equal(pkg.version,lock.version);
assert.equal(pkg.version,lock.packages[''].version);
assert(pkg.scripts.prebuild.includes('npm run test:v1088 && npm run test:v1088:types &&'));
const panel=read('components/visualizer/SongStructurePanelV1088.tsx');
const deck=read('components/visualizer/LiveFxDeckV881.tsx');
assert(deck.includes('<SongStructurePanelV1088 key={`v1088-${trackId}`'));assert(panel.includes('advanceSongStructureV1088('));
assert(panel.includes('getConcertTimelineV763()')&&panel.includes('readEnergyV896('));
const moduleText=read('lib/songStructureDetectionV1088.ts');
for(const banned of ['Math.random(', 'Date.now(', 'setInterval(', 'fetch(', 'localStorage.', 'navigator.', 'requestAnimationFrame('])
 assert(!moduleText.includes(banned),'No side effects: '+banned);
assert(read('scripts/v931-production-gate.cjs').includes('tests/v1088-song-structure-regression.cjs'));
assert(read('scripts/vercel-production-build.cjs').includes('tests/v1088-song-structure-regression.cjs'));
console.log('PASS V1088: '+samples+' bounded samples; timeline precedence, measured uncertainty, 3-second persistence, reset on pause/seek/track, no invented drops');
