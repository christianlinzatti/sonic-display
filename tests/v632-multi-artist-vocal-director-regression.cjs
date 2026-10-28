'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planMultiArtistVocalV632:plan,multiArtistMouthTargetV632:target}=load('components/visualizer/multiArtistVocalDirectorV632');
let groups=0;
const test=(name,fn)=>{try{fn();groups++;}catch(e){e.message=`V632 ${name}: ${e.message}`;throw e;}};
const cue={active:true,leadSlot:1,singingSlots:[1],handoffFrom:0,phase:.5,startMs:1000,endMs:3000,count:3};
const args={trackId:'song-1',cueTrackId:'song-1',timeMs:1300,playing:true,enabled:true,manualStage:false,count:3,cue,scene:'solo'};
const run=(patch={})=>plan({...args,...patch});
const sample=run();
test('verified 3-avatar solo role',()=>assert.deepEqual(sample.role,['listener','lead','listener']));
test('listener has no automatic vocal target',()=>{assert.equal(target(sample,0,'jaw',.8),0);assert.equal(target(sample,2,'wide',.4),0);});
test('incoming lead starts near normal vocal intensity',()=>assert(sample.mouthGains[1]>=.92&&sample.mouthGains[1]<=1));
test('the outgoing singer does not keep the singing animation',()=>assert.equal(sample.mouthGains[0],0));
test('genuine duet uses both singers, third is listener',()=>{const p=run({cue:{...cue,singingSlots:[0,1],handoffFrom:null},scene:'duet'});assert.deepEqual(p.role,['duet','lead','listener']);assert(p.mouthGains[0]>.8&&p.mouthGains[0]<1);});
test('chorus with four singers',()=>{const p=run({count:4,cue:{...cue,count:4,singingSlots:[0,1,2,3],handoffFrom:null},scene:'hook'});assert(p.active);assert.deepEqual(p.role,['duet','lead','duet','duet']);assert(p.mouthGains.every(v=>v>.8));});
test('explicit adlib backing remains subtler than lead',()=>{const p=run({cue:{...cue,singingSlots:[1,2],handoffFrom:null},scene:'adlib'});assert.deepEqual(p.role,['listener','lead','backing']);assert.equal(p.mouthGains[2],.62);});
test('reply focus is assigned only to responder',()=>{const p=run({cue:{...cue,leadSlot:2,singingSlots:[2],handoffFrom:1},scene:'reply'});assert.deepEqual(p.role,['listener','listener','lead']);});
test('non-mouth channels including lip seal untouched',()=>{for(const c of ['lipsClosed','blink','brow','smile','squint','cheek','head'])assert.equal(target(sample,0,c,.7),.7);});
test('authored GLB mouth sources and camera preview untouched',()=>{for(const s of [0,1,2])assert.equal(target(sample,s,'jaw',.7,true),.7);});
test('original cue is never mutated',()=>{const original=JSON.stringify(cue);run();assert.equal(JSON.stringify(cue),original);});
test('wrong track neutral',()=>assert(!run({cueTrackId:'other'}).active));
test('empty track neutral',()=>assert(!run({trackId:''}).active));
test('paused playback neutral',()=>assert(!run({playing:false}).active));
test('disabled singing effect neutral',()=>assert(!run({enabled:false}).active));
test('manual choreography wins',()=>assert(!run({manualStage:true}).active));
test('invalid count neutral',()=>{for(const count of [0,1,5,NaN,2.5])assert(!run({count}).active);});
test('count mismatch neutral',()=>assert(!run({count:4}).active));
test('cue with missing lead neutral',()=>assert(!run({cue:{...cue,singingSlots:[0,2]}}).active));
test('duplicate singers are rejected',()=>assert(!run({cue:{...cue,singingSlots:[1,1]}}).active));
test('negative singer index rejected',()=>assert(!run({cue:{...cue,singingSlots:[-1,1]}}).active));
test('overflow singer index rejected',()=>assert(!run({cue:{...cue,singingSlots:[1,3]}}).active));
test('invalid lead index rejected',()=>assert(!run({cue:{...cue,leadSlot:4}}).active));
test('invalid cue count rejected',()=>assert(!run({cue:{...cue,count:2}}).active));
test('seek before section neutral',()=>assert(!run({timeMs:999}).active));
test('exact section end neutral',()=>assert(!run({timeMs:3000}).active));
test('invalid and negative times neutral',()=>{for(const t of [-1,NaN,Infinity])assert(!run({timeMs:t}).active);});
test('invalid cue intervals neutral',()=>{for(const changes of [{startMs:-1},{endMs:1000},{endMs:900},{endMs:NaN}])assert(!run({cue:{...cue,...changes}}).active);});
test('source scene names remain editorial',()=>assert(!run({scene:'diarized'}).active));
test('reduced motion keeps singer and removes handoff emphasis',()=>{const p=run({reducedMotion:true});assert(p.active);assert.equal(p.handoffFrom,null);assert.equal(p.mouthGains[1],1);});
test('later handoff phase increases lead gain deterministically',()=>{const a=run({cue:{...cue,phase:.05}});const b=run({cue:{...cue,phase:.95}});assert(a.mouthGains[1]<b.mouthGains[1]);});
test('handoff not carried beyond cue opening',()=>{const p=run({timeMs:2300});assert.equal(p.handoffFrom,null);assert.equal(p.mouthGains[1],1);});
test('no future guessed cast outside authored interval',()=>assert(!run({timeMs:13000}).active));
test('all automatic jaw/wide/round gains bounded',()=>{for(const c of ['jaw','wide','round'])for(const slot of [0,1,2]){const v=target(sample,slot,c,.89);assert(v>=0&&v<=1);}});
test('out-of-range inputs remain unchanged',()=>{for(const t of [-1,1.4,NaN,Infinity])assert(Object.is(target(sample,1,'jaw',t),t));});
test('unknown avatar slot remains unchanged',()=>{for(const s of [-1,4,NaN,2.2])assert.equal(target(sample,s,'jaw',.4),.4);});
test('neutral scene never modifies lipsync',()=>assert.equal(target(run({playing:false}),0,'jaw',.7),.7));
test('V632 shares one cue for GLB and procedural',()=>{
 const g=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
 const a=fs.readFileSync('components/visualizer/VocalRigV368.tsx','utf8');
 const b=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
 assert(g.includes('multiArtistVocalRefV632.current=planMultiArtistVocalV632({'));
 assert(g.includes('manualVocalCueRefV385,multiArtistVocalRefV632,concertCueRefV386'));
 assert(a.includes('const directedTargetV632=multiArtistMouthTargetV632('));
 // V644 optionally replaces only the manually annotated mouth interval; V632
 // remains the normal default when no valid opt-in mark is present.
 assert(a.includes('alignedMouthV644??directedTargetV632'));
 assert(a.includes('(finalMouthTargetV644-current.current[c])'));
 assert(b.includes('directedMouthV632.jaw')&&b.includes('directedMouthV632.wide')&&b.includes('directedMouthV632.round'));
});
test('V632 preserves original manual, V496 and V416 precedence',()=>{
 const s=fs.readFileSync('components/visualizer/GroupDancersV326SceneV492.tsx','utf8');
 assert(s.indexOf('const timeCueV496=')<s.indexOf('const rapDuetCueV416='));
 assert(s.includes('enabled:props.lipSync?.vocalTimeEnabledV496===true&&!manualCueV385.active'));
 assert(s.includes('enabled:props.lipSync?.rapDuetEnabledV416===true&&!manualCueV385.active&&!timeCueV496.active'));
});
test('no guessed vocal source or extra frame loop',()=>{
 const s=fs.readFileSync('components/visualizer/multiArtistVocalDirectorV632.ts','utf8');
 assert(!/requestAnimationFrame\s*\(|useFrame\s*\(|Math.random\s*\(|performance.now\s*\(|\.morphTargetInfluences\s*\[/.test(s));
});
let samples=0;
for(let i=0;i<8000;i++){
 const n=2+i%3,lead=i%n,extra=i%5===0?Array.from({length:n},(_,x)=>x):[lead];
 const scene=extra.length===n&&n>1?'hook':'solo';
 const timeMs=1000+i%1950;const cue={active:true,count:n,leadSlot:lead,singingSlots:extra,
   startMs:1000,endMs:3000,phase:(i%101)/100,handoffFrom:(lead+1)%n};
 const p=plan({trackId:'song',cueTrackId:'song',count:n,playing:true,enabled:true,timeMs,cue,scene});
 assert(p.active&&p.mouthGains.length===n&&p.mouthGains.every(x=>x>=0&&x<=1));
 for(let slot=0;slot<n;slot++){
  const v=target(p,slot,'jaw',(i%101)/100);
  assert(Number.isFinite(v)&&v>=0&&v<=1);
  if(!extra.includes(slot))assert.equal(v,0);
 }
 samples++;
}
test('8000 simulated deterministic three-scene singer transitions',()=>assert.equal(samples,8000));
console.log(`PASS V632: ${groups} regression groups, ${samples} simulated multi-artist role frames`);
