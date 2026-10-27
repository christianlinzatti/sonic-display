'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planUltimateConcertV600:plan,actAtV600:at,sampleUltimateConcertV600:sample,
 refineAutomaticConcertGroupV600:group}=load('components/visualizer/ultimateConcertDirectorV600');
const {layoutV326:layout}=load('components/visualizer/multiAvatarStageDirectorV326');
let passed=0;
function test(name,fn){try{fn();passed++;}catch(e){e.message=`V600 ${name}: ${e.message}`;throw e;}}
const section=(startMs,durationMs,label,confidence=.98)=>({startMs,durationMs,label,confidence});
const analysis={schema:'sonic-track-analysis-v318',trackId:'song-A',sections:[
 section(0,25000,'verse'),section(25000,18000,'build'),section(43000,25000,'hook'),
 section(68000,14000,'break'),section(82000,27000,'verse'),section(109000,26000,'hook'),
 section(135000,24000,'drop'),section(159000,21000,'break')
 ]};
const origin={trackId:'song-A',durationMs:180000,genre:'deutschrap',analysis};
const p=plan(origin);
const base={active:true,genre:'deutschrap',section:'hook',source:'imported',dance:1,camera:1,lighting:1,lyrics:.075,evidence:'labeled'};
const inp={trackId:'song-A',progressMs:50000,playing:true,reducedMotion:false,tier:'high',enabled:true,
 manualDance:false,manualCamera:false,manualLighting:false,lyricsProtected:false,base};
const run=(x={})=>sample(p,{...inp,...x});
test('builds bounded authored whole-song arc',()=>{assert.equal(p.source,'authored');assert.equal(p.acts.length,8);assert.equal(p.durationMs,180000);});
test('explicit source and genre carried, not invented',()=>assert.equal(p.genre,'deutschrap'));
test('all section boundaries exactly as supplied',()=>assert.deepEqual(p.acts.map(a=>[a.startMs,a.endMs]),analysis.sections.map(s=>[s.startMs,s.startMs+s.durationMs])));
test('verse, build, hook, break and drop labels retained',()=>assert.deepEqual(p.acts.map(a=>a.section),analysis.sections.map(s=>s.label)));
test('same song, same output every invocation',()=>assert.deepEqual(run(),run()));
test('binary search resolves intro and last interval',()=>{assert.equal(at(p,0).index,0);assert.equal(at(p,179999).index,7);});
test('boundary maps forward with no flash',()=>{assert.equal(at(p,42999).section,'build');assert.equal(at(p,43000).section,'hook');});
test('time outside track does not resolve a scene',()=>{for(const ms of [-1,NaN,Infinity,180000])assert.equal(at(p,ms),null);});
test('different repeated hooks vary shot',()=>assert.notEqual(p.acts[2].shot,p.acts[5].shot));
test('adjacent acts do not repeat the same shot',()=>{for(let i=1;i<p.acts.length;i++)assert.notEqual(p.acts[i].shot,p.acts[i-1].shot);});
test('moment builds within a verified act and then releases',()=>{
 assert.equal(run({progressMs:43200}).moment,'opening');assert.equal(run({progressMs:54000}).moment,'develop');
 assert.equal(run({progressMs:60700}).moment,'peak');assert.equal(run({progressMs:67200}).moment,'release');
});
test('camera, dance and lighting values remain bounded',()=>{for(const v of [run().dynamics.camera,run().dynamics.lighting,run().dynamics.dance])assert(v>=.88&&v<=1.12);});
test('same input object is not mutated',()=>{const before=JSON.stringify(base);run();assert.equal(JSON.stringify(base),before);});
test('lyric glow remains exact; no word timing adjustments',()=>assert.equal(run().dynamics.lyrics,base.lyrics));
test('manual switches individually protect dance camera lighting',()=>{const d=run({manualDance:true,manualCamera:true,manualLighting:true}).dynamics;assert.equal(d.dance,1);assert.equal(d.camera,1);assert.equal(d.lighting,1);});
test('lyric priority attenuates stage energy',()=>assert(Math.abs(run({lyricsProtected:true}).dynamics.lighting-1)<Math.abs(run().dynamics.lighting-1)));
test('balanced tier is calmer than high',()=>assert(Math.abs(run({tier:'balanced'}).dynamics.lighting-1)<Math.abs(run().dynamics.lighting-1)));
for(const x of [{playing:false},{enabled:false},{reducedMotion:true},{tier:'low'},
 {trackId:'different'},{progressMs:-1},{progressMs:NaN},{progressMs:180000}])test(`protected ${JSON.stringify(x)}`,
 ()=>{const r=run(x);assert.equal(r.active,false);assert.strictEqual(r.dynamics,base);});
test('inactive source does not generate concert',()=>{const r=run({base:{...base,active:false}});assert.equal(r.active,false);});
test('estimated live section never mistaken for authored cue',()=>{
 const q=plan({...origin,analysis:null});const r=sample(q,{...inp,base:{...base,evidence:'estimated',source:'live'}});
 assert.equal(q.source,'playback-only');assert.equal(r.source,'playback-only');assert.equal(r.section,null);assert.equal(r.shot,'off');
});
test('live estimated contour gentle without cue fake labels',()=>{
 const q=plan({...origin,analysis:null});const v=sample(q,{...inp,base:{...base,evidence:'estimated',source:'live'}}).dynamics;
 assert(Math.abs(v.camera-1)<.004);assert(Math.abs(v.lighting-1)<.004);
});
test('stale V318 runtime label cannot inject falsely confirmed shot',()=>{
 const r=run({base:{...base,section:'drop',evidence:'estimated'}});
 assert.equal(r.section,null);assert.equal(r.shot,'off');assert.equal(r.source,'playback-only');
});
test('out-of-order imported high-confidence labels still sampled chronologically',()=>{
 const q=plan({...origin,analysis:{...analysis,sections:[analysis.sections[5],analysis.sections[0],analysis.sections[3]]}});
 assert.deepEqual(q.acts.map(a=>a.section),['verse','break','hook']);
 assert.equal(at(q,90000),null);
});
test('authored sections with wrong track never enabled',()=>assert.equal(plan({...origin,analysis:{...analysis,trackId:'song-B'}}).acts.length,0));
test('bad label and low confidence discarded',()=>{
 const q=plan({...origin,analysis:{...analysis,sections:[section(0,20000,'hook',.4),section(25000,20000,'synthesized')]}});
 assert.equal(q.acts.length,0);
});
test('unknown sections do not become invented hooks',()=>{
 const q=plan({...origin,analysis:{...analysis,sections:[section(30000,20000,'hook')]}});
 assert.equal(at(q,0),null);assert.equal(at(q,50000),null);
});
test('overlapping or too-short sections ignored',()=>{
 const q=plan({...origin,analysis:{...analysis,sections:[section(0,30000,'verse'),section(20000,6000,'hook'),section(30000,1000,'drop')]}});
 assert.equal(q.acts.length,1);
});
test('no duration yields no changes',()=>assert.equal(plan({...origin,durationMs:0}).acts.length,0));
test('unknown genre yields no invented arc',()=>assert.equal(plan({...origin,genre:'other'}).acts.length,0));
test('hardstyle and hardtekk have deterministic different concert variations',()=>{
 const a=plan({...origin,genre:'hardstyle'}),b=plan({...origin,genre:'hardtekk'});
 assert.notDeepEqual(a.acts.map(x=>x.shot),b.acts.map(x=>x.shot));
});
const groupBase={enabled:true,count:4,songSync:true,trackId:'song-A',bpm:120,snap:'off',minSpacing:1.12,
 modelIds:['','','',''],cues:[
 {id:'auto-v442-0-0',at:0,formation:'line',focus:0,drop:false,transition:0,positions:layout('line',4)},
 {id:'auto-v442-1-25000',at:25,formation:'line',focus:1,drop:false,transition:.65,positions:layout('line',4)},
 {id:'auto-v442-2-43000',at:43,formation:'wide',focus:-1,drop:true,transition:.65,positions:layout('wide',4)},
 {id:'auto-v442-3-82000',at:82,formation:'line',focus:2,drop:false,transition:.65,positions:layout('line',4)}
 ]};
test('automatic group may align formation to verified concert act',()=>{
 const g=group(groupBase,p);assert.notStrictEqual(g,groupBase);assert.equal(g.cues.length,groupBase.cues.length);
 assert.deepEqual(g.cues.map(x=>x.at),groupBase.cues.map(x=>x.at));
 assert.deepEqual(g.cues.map(x=>x.focus),groupBase.cues.map(x=>x.focus));
});
test('group never modifies manual singer focus, transition or timestamps',()=>{
 const g=group(groupBase,p);for(let i=0;i<g.cues.length;i++){
  for(const key of ['id','at','transition','focus','drop'])assert.equal(g.cues[i][key],groupBase.cues[i][key]);
 }
});
test('authored hook wide formation protected',()=>assert.deepEqual(group(groupBase,p).cues[2],groupBase.cues[2]));
test('manual group IDs protected',()=>assert.strictEqual(group({...groupBase,cues:groupBase.cues.map(c=>({...c,id:'manual-1'}))},p).cues[0].formation,'line'));
test('disabled groups unchanged',()=>{const g={...groupBase,enabled:false};assert.strictEqual(group(g,p),g);});
test('other track group unchanged',()=>{const g={...groupBase,trackId:'other'};assert.strictEqual(group(g,p),g);});
test('group without real authored plan unchanged',()=>assert.strictEqual(group(groupBase,plan({...origin,analysis:null})),groupBase));
test('manual priority and invalid group off',()=>assert.equal(group(null,p),null));
test('no original cue timestamps added or removed',()=>{const g=group(groupBase,p);assert.deepEqual(g.cues.map(c=>c.id),groupBase.cues.map(c=>c.id));});
test('existing auto group stage passes through same V326 geometry',()=>assert.deepEqual(layout('arc',4).length,4));
test('live V568/V577 chain now followed by V600 without replacing V528',()=>{
 const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 assert.match(s,/varyConcertDirectorV577\(smartConcertV568/);
 assert.match(s,/sampleUltimateConcertV600\(concertArcPlanV600/);
 assert.match(s,/concertDynamicsPercentV502\([^\n]*,directedDynamicsV60(?:0|4)\.dance\)/);
 assert(s.includes('cameraDirectorIntensity={concertDynamicsPercentV502('));
 assert(s.includes('directedDynamicsV604.camera')&&s.includes('base:directedDynamicsV600'));
 assert(s.includes('directedDynamicsV604.lighting'));
 assert(s.includes('refineAutomaticConcertGroupV600(multiArtistGroupV442,concertArcPlanV600)'));
});
test('no new audio listeners, network, or animation frames',()=>{
 const s=fs.readFileSync('components/visualizer/ultimateConcertDirectorV600.ts','utf8');
 assert.doesNotMatch(s,/requestAnimationFrame|setInterval|addEventListener|fetch\(|Math\.random|localStorage/);
});
for(let i=0;i<18000;i++){
 const ms=(i*533)%180000;
 const c=sample(p,{...inp,progressMs:ms,base:{...base,section:at(p,ms)?.section??'verse'}});
 assert(Number.isFinite(c.dynamics.dance)&&Number.isFinite(c.dynamics.camera)&&Number.isFinite(c.dynamics.lighting));
 for(const k of ['dance','camera','lighting'])assert(c.dynamics[k]>=.88&&c.dynamics[k]<=1.12);
 assert.equal(c.dynamics.lyrics,.075);
}
test('18k whole-song samples bounded and deterministic',()=>assert(p.acts.length===8));
console.log(`PASS V600: ${passed} groups, 18,000 whole-song samples, authored controls protected.`);
