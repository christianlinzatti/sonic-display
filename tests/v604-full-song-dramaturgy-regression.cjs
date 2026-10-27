'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planUltimateConcertV600,sampleUltimateConcertV600,refineAutomaticConcertGroupV600}=load('components/visualizer/ultimateConcertDirectorV600');
const {planFullSongDramaturgyV604:plan,narrativeActAtV604:at,
 sampleFullSongDramaturgyV604:sample,refineAutomaticGroupV604:group}=load('components/visualizer/fullSongConcertDramaturgyV604');
const {layoutV326}=load('components/visualizer/multiAvatarStageDirectorV326');
let tests=0;
function test(name,fn){try{fn();tests++}catch(err){err.message=`V604 ${name}: ${err.message}`;throw err;}}
const section=(startMs,durationMs,label,confidence=.98)=>({startMs,durationMs,label,confidence});
const original={schema:'sonic-track-analysis-v318',trackId:'verified-A',sections:[
 section(0,23000,'verse'),section(23000,16000,'build'),section(39000,24000,'hook'),
 section(63000,17000,'break'),section(80000,28000,'verse'),section(108000,24000,'hook'),
 section(132000,21000,'drop'),section(153000,27000,'hook')]};
const make=(genre='deutschrap',analysis=original)=>planUltimateConcertV600({trackId:'verified-A',durationMs:180000,genre,analysis});
const v600=make(),p=plan(v600);
const base={active:true,genre:'deutschrap',section:'hook',source:'imported',dance:1,camera:1,lighting:1,lyrics:.072,evidence:'labeled'};
const opts={trackId:'verified-A',progressMs:50000,playing:true,reducedMotion:false,tier:'high',enabled:true,
  manualDance:false,manualCamera:false,manualLighting:false,lyricsProtected:false};
const sampled=(ms=50000,over={})=>{
 const act=v600.acts.find(a=>a.startMs<=ms&&ms<a.endMs);
 const b={...base,section:act?.section??'verse'};
 const confirmed=sampleUltimateConcertV600(v600,{...opts,progressMs:ms,base:b});
 return sample(p,{...opts,progressMs:ms,base:confirmed.dynamics,confirmedV600:confirmed,...over});
};
test('V600 verified imported acts only',()=>assert.equal(p.source,'verified-v600'));
test('original 8 sections remain byte-for-byte semantically aligned',()=>assert.deepEqual(p.acts.map(x=>[x.startMs,x.endMs,x.section]),v600.acts.map(x=>[x.startMs,x.endMs,x.section])));
test('bounded chapters preserve imported labels',()=>assert.deepEqual(p.acts.map(x=>x.section),['verse','build','hook','break','verse','hook','drop','hook']));
test('repeated hooks increment repetition without artificial metadata',()=>assert.deepEqual(p.acts.filter(a=>a.section==='hook').map(a=>a.repetition),[0,1,2]));
test('first hook and second hook get different motifs',()=>assert.notEqual(p.acts[2].motif,p.acts[5].motif));
test('songtime distinguishes opening and development',()=>assert.equal(p.acts[0].chapter,'setup'));
test('build-up evidence maps to rise',()=>assert.equal(p.acts[1].chapter,'rise'));
test('break is a respite with negative lighting lift',()=>{assert.equal(p.acts[3].chapter,'respite');assert(p.acts[3].lightGain<0)});
test('multiple hooks map to payoff',()=>assert.equal(p.acts[5].chapter,'payoff'));
test('finale only an ending-arc, never an invented outro label',()=>{assert.equal(p.endingSupported,true);assert.equal(p.acts[7].chapter,'ending-arc');assert.equal(p.acts[7].section,'hook')});
test('missing duration coverage never invents ending-arc',()=>{const q=plan(make('deutschrap',{...original,sections:original.sections.slice(0,-1)}));assert(!q.endingSupported);assert(q.acts.every(a=>a.chapter!=='ending-arc'))});
test('single late act does not imply a full-song finale',()=>{const q=plan(make('deutschrap',{...original,sections:[section(160000,20000,'hook')]}));assert(!q.endingSupported)});
test('hook without verified source not embellished',()=>assert.equal(plan(make('deutschrap',null)).source,'unavailable'));
test('mismatched V318 track never creates act',()=>assert.equal(plan(make('deutschrap',{...original,trackId:'song-X'})).acts.length,0));
test('low confidence label never creates act',()=>assert.equal(plan(make('deutschrap',{...original,sections:[section(0,180000,'hook',.2)]})).acts.length,0));
test('non-overlapping long intervals stay sorted',()=>assert(p.acts.every((a,i)=>i===0||a.startMs>=p.acts[i-1].endMs)));
test('never repeats consecutive active motifs except deliberate pause or ending',()=>{for(let i=1;i<p.acts.length;i++)if(!['respite','ending-arc'].includes(p.acts[i].chapter))assert.notEqual(p.acts[i].motif,p.acts[i-1].motif)});
test('repeating the same plan is deterministic',()=>assert.deepEqual(plan(v600),p));
test('different genres keep same evidence boundaries',()=>{for(const genre of ['hardstyle','hardtekk'])assert.deepEqual(plan(make(genre)).acts.map(x=>[x.startMs,x.endMs]),p.acts.map(x=>[x.startMs,x.endMs]))});
test('V604 can have different genre intensity and motif choices',()=>assert.notDeepEqual(plan(make('hardstyle')).acts.map(x=>x.lightGain),p.acts.map(x=>x.lightGain)));
test('binary search picks exact scene and following scene',()=>{assert.equal(at(p,62999).index,2);assert.equal(at(p,63000).index,3)});
test('binary search never creates gaps or out-of-range acts',()=>{for(const x of [-1,NaN,Infinity,180000])assert.equal(at(p,x),null)});
test('real unlabeled song gap remains null',()=>{const q=plan(make('deutschrap',{...original,sections:[section(20000,22000,'verse'),section(120000,20000,'hook')]}));assert.equal(at(q,80000),null)});
test('invalid V600 index fails validation rather than faking sections',()=>{const q={...v600,acts:v600.acts.map((x,i)=>i===2?{...x,index:7}:x)};assert.equal(plan(q).source,'unavailable')});
test('overlapping forged V600 sections fail closed',()=>{const q={...v600,acts:v600.acts.map((x,i)=>i===1?{...x,startMs:20000}:x)};assert.equal(plan(q).source,'unavailable')});
test('excessive section count fails closed',()=>{const q={...v600,acts:Array(161).fill(v600.acts[0])};assert.equal(plan(q).source,'unavailable')});
test('mid-hook changes existing dynamics conservatively',()=>{const r=sampled();assert(r.active);assert(r.dynamics.lighting>1);assert(r.dynamics.lighting<=1.12)});
test('first and later hooks use nonidentical narrative gains',()=>{const a=sampled(51000),b=sampled(119000);assert.notEqual(a.dynamics.lighting,b.dynamics.lighting)});
test('light damping occurs during documented breaks',()=>{const r=sampled(72000);assert(r.active);assert(r.dynamics.lighting<1)});
test('gentle actual song ending lift supported by verified labels only',()=>{const r=sampled(166000);assert.equal(r.chapter,'ending-arc');assert(r.dynamics.lighting>1)});
test('V604 transition begins at zero and fades in',()=>{assert.equal(sampled(39000).transition,0);assert(sampled(39400).transition<sampled(42000).transition)});
test('V604 transition releases gracefully before next section',()=>{assert.equal(sampled(62999).transition,0);assert.equal(sampled(63000).transition,0)});
test('start and end extra gains equal original V600 baseline',()=>{const r=sampled(39000);const a=sampleUltimateConcertV600(v600,{...opts,progressMs:39000,base});assert.deepEqual(r.dynamics,a.dynamics)});
test('never modifies lyric glow or karaoke clocks',()=>assert.equal(sampled().dynamics.lyrics,.072));
test('all manual channel overrides protected',()=>{const r=sampled(50000,{manualDance:true,manualCamera:true,manualLighting:true});const b=sampled(50000);const baseline=sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics;assert.deepEqual([r.dynamics.dance,r.dynamics.camera,r.dynamics.lighting],[baseline.dance,baseline.camera,baseline.lighting]);assert(b.dynamics.camera!==r.dynamics.camera)});
test('manual stage light unaffected individually',()=>assert.equal(sampled(50000,{manualLighting:true}).dynamics.lighting,sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting));
test('reduced motion is identity',()=>{const r=sampled(50000,{reducedMotion:true});assert(!r.active);assert.equal(r.dynamics.lighting,sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting)});
test('low tier is identity',()=>{const r=sampled(50000,{tier:'low'});assert(!r.active);assert.equal(r.dynamics.lighting,sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting)});
test('disabled director is identity',()=>{const r=sampled(50000,{enabled:false});assert(!r.active);assert.equal(r.dynamics.lighting,sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting)});
test('paused music is identity',()=>{const r=sampled(50000,{playing:false});assert(!r.active);assert.equal(r.dynamics.lighting,sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting)});
test('wrong track is identity',()=>{const r=sampled(50000,{trackId:'other'});assert(!r.active);assert.equal(r.dynamics.lighting,sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting)});
test('unknown song time never changes baseline',()=>{const r=sampled(250000);assert(!r.active)});
test('balanced tier has lower impact than high',()=>{const a=sampled(50000),b=sampled(50000,{tier:'balanced'});const baseline=sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting;assert(Math.abs(b.dynamics.lighting-baseline)<Math.abs(a.dynamics.lighting-baseline))});
test('lyric priority strongly reduces intensity',()=>{const a=sampled(50000),b=sampled(50000,{lyricsProtected:true});const baseline=sampleUltimateConcertV600(v600,{...opts,progressMs:50000,base}).dynamics.lighting;assert(Math.abs(b.dynamics.lighting-baseline)<Math.abs(a.dynamics.lighting-baseline))});
test('runtime V600 evidence must independently confirm section',()=>{const r=sampled(50000,{confirmedV600:{...sampled(50000),source:'off',active:false}});assert(!r.active)});
test('stale V600 section cannot select scene',()=>{const r=sampled(50000,{confirmedV600:{...sampled(50000),source:'authored',section:'verse',active:true}});assert(!r.active)});
test('valid plan but V600 estimated source refused',()=>{const r=sampled(50000,{confirmedV600:{...sampled(50000),source:'playback-only',active:true}});assert(!r.active)});
test('base V600 data never mutated',()=>{const b={...base};sampled(50000,{base:b});assert.deepEqual(b,base)});
test('very high input dynamics never grow beyond clamp',()=>{const r=sampled(50000,{base:{...base,camera:1.12,lighting:1.12,dance:1.12}});for(const k of ['camera','dance','lighting'])assert(r.dynamics[k]<=1.12)});
test('genre-specific sampled gains stay below safe envelope',()=>{for(const genre of ['hardstyle','hardtekk']){const q=plan(make(genre));assert(q.acts.every(a=>Math.abs(a.lightGain)<=.03&&Math.abs(a.danceGain)<=.03))}});
const groupBase={enabled:true,count:4,songSync:true,trackId:'verified-A',bpm:120,snap:'off',minSpacing:1.12,modelIds:['','','',''],cues:[
 {id:'auto-v442-0-0',at:0,formation:'line',focus:0,drop:false,transition:0,positions:layoutV326('line',4)},
 {id:'auto-v442-1-23000',at:23,formation:'line',focus:1,drop:false,transition:.7,positions:layoutV326('line',4)},
 {id:'auto-v442-2-39000',at:39,formation:'wide',focus:-1,drop:true,transition:.65,positions:layoutV326('wide',4)},
 {id:'auto-v442-3-80000',at:80,formation:'line',focus:2,drop:false,transition:.65,positions:layoutV326('line',4)}]};
const groupOpts={enabled:true,reducedMotion:false,tier:'high'};
test('automatic group reuses existing timestamps',()=>{const result=group(groupBase,p,groupOpts);assert.deepEqual(result.cues.map(x=>x.at),groupBase.cues.map(x=>x.at))});
test('automatic group never rewrites singer focus, drop or animation timing',()=>{const result=group(groupBase,p,groupOpts);for(const [i,x] of result.cues.entries())for(const key of ['id','at','focus','drop','transition'])assert.deepEqual(x[key],groupBase.cues[i][key])});
test('explicit hook-drop preserved',()=>assert.deepEqual(group(groupBase,p,groupOpts).cues[2],groupBase.cues[2]));
test('manual cast IDs protected',()=>{const manual={...groupBase,cues:groupBase.cues.map(c=>({...c,id:'manual-edit'}))};assert.strictEqual(group(manual,p,groupOpts),manual)});
test('same cues on another track are untouched',()=>{const wrong={...groupBase,trackId:'different'};assert.strictEqual(group(wrong,p,groupOpts),wrong)});
test('no group changes with reduced motion',()=>assert.strictEqual(group(groupBase,p,{...groupOpts,reducedMotion:true}),groupBase));
test('low Pi tier leaves group untouched',()=>assert.strictEqual(group(groupBase,p,{...groupOpts,tier:'low'}),groupBase));
test('disabled director preserves group',()=>assert.strictEqual(group(groupBase,p,{...groupOpts,enabled:false}),groupBase));
test('three and four performers supported without new cues',()=>{for(const count of [3,4]){const g={...groupBase,count,modelIds:Array(count).fill(''),cues:groupBase.cues.map(c=>({...c,positions:layoutV326(c.formation,count)}))};const out=group(g,p,groupOpts);assert.equal(out.cues.length,4);assert(out.cues.every(c=>c.positions.length===count))}});
test('null group remains null',()=>assert.equal(group(null,p,groupOpts),null));
test('V600 formation decisions can feed V604 without duplicate stage controllers',()=>{const prev=refineAutomaticConcertGroupV600(groupBase,v600);const next=group(prev,p,groupOpts);assert.equal(next.cues.length,prev.cues.length)});
test('one new full-song planner and one live sampler integrated in real stage',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('planFullSongDramaturgyV604(concertArcPlanV600)'));assert(s.includes('sampleFullSongDramaturgyV604(fullSongPlanV604'));assert(s.includes('confirmedV600:concertArcV600,base:directedDynamicsV600'));assert(s.includes('refineAutomaticGroupV604(concertGroupV600,fullSongPlanV604'))});
test('V604 final intensities actually reach existing dance camera light and group',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');for(const key of ['directedDynamicsV604.dance','directedDynamicsV604.camera','directedDynamicsV604.lighting','autoMultiArtistGroupV442={concertGroupV609}'])assert(s.includes(key));assert(s.includes('refineAutoGroupTransitionsV609(concertGroupV604,fullSongPlanV604'))});
test('no animation loop, fetch, randomized show, global timers, overrides or tokens',()=>{const s=fs.readFileSync('components/visualizer/fullSongConcertDramaturgyV604.ts','utf8');assert.doesNotMatch(s,/requestAnimationFrame|setInterval|setTimeout|addEventListener|fetch\(|Math\.random|localStorage|spotify_access_token/i)});
for(let i=0;i<40000;i++){
 const ms=(i*3197)%180000;const s=sampled(ms);
 for(const key of ['dance','camera','lighting'])assert(Number.isFinite(s.dynamics[key])&&s.dynamics[key]>=.88&&s.dynamics[key]<=1.12);
 assert.equal(s.dynamics.lyrics,.072);
}
test('40,000 simulated full-song samples bounded',()=>assert.equal(p.acts.length,8));
console.log(`PASS V604: ${tests} test groups, 40,000 whole-song samples, no fabricated cues.`);
