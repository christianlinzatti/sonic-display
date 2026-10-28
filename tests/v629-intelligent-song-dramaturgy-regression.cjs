'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentSongDramaturgyV629:compile,sampleIntelligentSongDramaturgyV629:sample}=load('components/visualizer/intelligentSongDramaturgyV629');
const {planConcertExperienceV628}=load('components/visualizer/concertExperienceV628');
const {planUltimateConcertDramaturgyV623}=load('components/visualizer/ultimateConcertDramaturgyV623');
let count=0;const test=(name,fn)=>{try{fn();count++}catch(e){e.message=`V629 ${name}: ${e.message}`;throw e}};
const sections=['verse','hook','verse','build','hook','break','drop','verse','hook','verse','build','hook'];
const motifs=['portrait','wide','dialogue','ensemble','ensemble','breath','wide','portrait','ensemble','dialogue','ensemble','crescendo'];
const chapter=['setup','payoff','develop','rise','payoff','respite','payoff','develop','payoff','develop','rise','ending-arc'];
const repeats={};const acts=sections.map((section,index)=>{const repetition=repeats[section]??0;repeats[section]=repetition+1;return {index,startMs:index*18000+2000,endMs:(index+1)*18000+2000,section,
 chapter:chapter[index],motif:motifs[index],repetition,
 danceGain:0,cameraGain:0,lightGain:0};});
const narrative={source:'verified-v600',trackId:'artist-track-629',durationMs:219000,genre:'deutschrap',acts,endingSupported:true};
const story=compile(narrative);
const cueFor=(idx,t=.82)=>({active:true,source:'verified-v600',act:idx,chapter:acts[idx].chapter,
 motif:acts[idx].motif,repetition:acts[idx].repetition,transition:t});
const input=(idx=0,patch={})=>{
 const x={trackId:narrative.trackId,durationMs:narrative.durationMs,positionMs:acts[idx].startMs+acts[idx].endMs/2-acts[idx].startMs/2,
 section:acts[idx].section,playing:true,reducedMotion:false,tier:'high',lyricsProtected:false,
 manualDance:false,manualCamera:false,manualLighting:false,
 narrative:{plan:narrative,cue:cueFor(idx)},...patch};
 const base=planUltimateConcertDramaturgyV623({...x,energy:.8,kick:.8});
 const experience=planConcertExperienceV628({...x,base});
 return {...x,plan:story,experience};
};
const run=(idx=0,patch={})=>sample(input(idx,patch));
const OFF=x=>{assert.equal(x.active,false);assert.equal(x.beat,null);assert.equal(x.envelope,0)};

test('compiles complete verified song',()=>{assert.equal(story.source,'verified-v604');assert.equal(story.acts.length,12);assert.equal(story.trackId,narrative.trackId);});
test('counts all four verified hooks',()=>assert.equal(story.hookCount,4));
test('first hook is ensemble',()=>{assert.equal(story.acts[1].beat,'first-hook');assert.equal(story.acts[1].emphasis,'ensemble');});
test('second hook emphasizes performer',()=>{assert.equal(story.acts[4].beat,'reprise');assert.equal(story.acts[4].emphasis,'performer');});
test('third hook chooses conversation',()=>{assert.equal(story.acts[8].beat,'third-hook');assert.equal(story.acts[8].emphasis,'conversation');});
test('fourth hook cycles to alternate performer',()=>assert.equal(story.acts[11].beat,'verified-finale'));
test('verified finale only at proven last act',()=>{assert(story.hasVerifiedFinale);assert.equal(story.acts[10].beat,'build');});
test('recovery after first hook',()=>assert.equal(story.acts[2].beat,'breathing-room'));
test('recovery after second hook is break',()=>assert.equal(story.acts[5].beat,'interlude'));
test('build has independent ascent marker',()=>assert.equal(story.acts[3].beat,'build'));
test('drop label not inferred elsewhere',()=>assert.equal(story.acts[6].beat,'drop'));
test('songwide early middle and late chapters',()=>{assert.equal(story.acts[0].position,'early');assert.equal(story.acts[6].position,'middle');assert.equal(story.acts[11].position,'late');});
test('missing source cannot compile',()=>assert.equal(compile({...narrative,source:'unavailable'}).source,'off'));
test('empty identifier cannot compile',()=>assert.equal(compile({...narrative,trackId:''}).source,'off'));
test('nan or invalid durations cannot compile',()=>{for(const durationMs of [NaN,Infinity,-1,0])assert.equal(compile({...narrative,durationMs}).source,'off');});
test('an array larger than 160 is rejected',()=>assert.equal(compile({...narrative,acts:Array(161).fill(acts[0])}).source,'off'));
test('invalid index rejected',()=>assert.equal(compile({...narrative,acts:acts.map((a,k)=>k===2?{...a,index:9}:a)}).source,'off'));
test('unconfirmed overlapping sections rejected',()=>assert.equal(compile({...narrative,acts:acts.map((a,k)=>k===1?{...a,startMs:1000}:a)}).source,'off'));
test('out-of-duration act rejected',()=>assert.equal(compile({...narrative,durationMs:217000}).source,'off'));
test('bad section name rejected',()=>assert.equal(compile({...narrative,acts:acts.map((a,k)=>k===1?{...a,section:'random'}:a)}).source,'off'));
test('fake repetitions rejected',()=>assert.equal(compile({...narrative,acts:acts.map((a,k)=>k===8?{...a,repetition:7}:a)}).source,'off'));
test('invalid motifs rejected',()=>assert.equal(compile({...narrative,acts:acts.map((a,k)=>k===8?{...a,motif:'imaginary'}:a)}).source,'off'));
test('unsupported finale is not invented',()=>{const x=compile({...narrative,endingSupported:false});assert.equal(x.hasVerifiedFinale,false);assert.equal(x.acts[11].beat,'reprise');});
test('finale requires last chapter to be supported',()=>{const x=compile({...narrative,acts:acts.map((a,k)=>k===11?{...a,chapter:'payoff'}:a)});assert.equal(x.hasVerifiedFinale,false);});
test('starting position of finale must be last quarter',()=>{const moved=acts.map((a,k)=>k===11?{...a,startMs:150000}:a);const x=compile({...narrative,acts:moved});assert.equal(x.hasVerifiedFinale,false);});
test('verified current track plays',()=>{const x=run(1);assert.equal(x.active,true);assert.equal(x.act,1);});
test('three hooks preserve distinct profiles',()=>{const x=run(1),y=run(4),z=run(8);assert.notDeepEqual([x.cue.dance,x.cue.camera,x.cue.decoration],[y.cue.dance,y.cue.camera,y.cue.decoration]);assert.notDeepEqual([y.cue.dance,y.cue.camera,y.cue.decoration],[z.cue.dance,z.cue.camera,z.cue.decoration]);});
test('confirmed narrative retains original lyrics gain',()=>{for(let k=0;k<acts.length;k++){const x=input(k),y=sample(x);assert.equal(y.cue.lyrics,x.experience.cue.lyrics);assert.equal(y.cue.priority,x.experience.cue.priority);assert.equal(y.cue.chapter,x.experience.cue.chapter);}});
test('vocal focus never boosts dance nor decoration',()=>{const x=input(0),y=sample(x);assert(y.cue.dance<=x.experience.cue.dance);assert(y.cue.decoration<=x.experience.cue.decoration);});
test('lyrics protected never boosts camera dance decoration',()=>{const x=input(1,{lyricsProtected:true}),y=sample(x);assert(y.cue.camera<=x.experience.cue.camera);assert(y.cue.dance<=x.experience.cue.dance);assert(y.cue.decoration<=x.experience.cue.decoration);});
test('unconfirmed drop cannot add dance power',()=>{const x=input(6);x.experience={...x.experience,cue:{...x.experience.cue,priority:'quiet'}};const y=sample(x);assert(y.cue.dance<=x.experience.cue.dance);});
test('manual dance is not overwritten',()=>{const x=input(4,{manualDance:true}),y=sample(x);assert.equal(y.cue.dance,x.experience.cue.dance);});
test('manual camera is not overwritten',()=>{const x=input(4,{manualCamera:true}),y=sample(x);assert.equal(y.cue.camera,x.experience.cue.camera);});
test('manual lighting including face not overwritten',()=>{const x=input(4,{manualLighting:true}),y=sample(x);assert.equal(y.cue.face,x.experience.cue.face);assert.equal(y.cue.decoration,x.experience.cue.decoration);});
test('paused and low tier and reduced motion all neutral',()=>{for(const x of [{playing:false},{tier:'low'},{reducedMotion:true}])OFF(run(4,x));});
test('wrong track or duration cannot activate',()=>{OFF(run(4,{trackId:'another'}));OFF(run(4,{durationMs:33333}));});
test('wrong section cannot activate',()=>OFF(run(4,{section:'verse'})));
test('unverified live cue cannot activate',()=>{const x=input(4);OFF(sample({...x,narrative:{plan:narrative,cue:{...cueFor(4),active:false}}}));});
test('mismatched cue repetition cannot activate',()=>{const x=input(4);OFF(sample({...x,narrative:{plan:narrative,cue:{...cueFor(4),repetition:100}}}));});
test('mismatched timeline data cannot activate',()=>{const x=input(4);OFF(sample({...x,narrative:{plan:{...narrative,acts:acts.map((a,k)=>k===4?{...a,startMs:a.startMs+1}:a)},cue:cueFor(4)}}));});
test('inactive V628 leaves prior cue unmodified',()=>{const x=input(4);x.experience={...x.experience,active:false};const y=sample(x);OFF(y);assert.equal(y.cue,x.experience.cue);});
test('invalid envelope and position neutral',()=>{for(const positionMs of [-5,NaN,Infinity,219000,0])OFF(run(4,{positionMs}));const x=input(4);OFF(sample({...x,narrative:{plan:narrative,cue:{...cueFor(4),transition:2}}}));});
test('zero transition means no new intensity',()=>{const x=input(4);x.narrative={plan:narrative,cue:cueFor(4,0)};const y=sample(x);assert(y.active);assert.deepEqual(y.cue,x.experience.cue);});
test('entry and exit of all acts are continuous',()=>{for(let k=0;k<acts.length;k++)for(const p of [acts[k].startMs,acts[k].endMs-0.001]){const x=input(k,{positionMs:p}),y=sample(x);assert(y.active);for(const prop of ['dance','camera','decoration','face'])assert(Math.abs(y.cue[prop]-x.experience.cue[prop])<.00003);}});
test('deterministic seek/replay',()=>{const x=run(8);run(2);run(6);assert.deepEqual(run(8),x);});
test('plans and live inputs are not mutated',()=>{const x=input(8),before=JSON.stringify(x);sample(x);assert.equal(JSON.stringify(x),before);});
test('20k safe, bounded playback samples',()=>{let samples=0;for(let k=0;k<acts.length;k++)for(let p=acts[k].startMs;p<acts[k].endMs;p+=10){const x=input(k,{positionMs:p}),y=sample(x);assert(y.active);assert(y.envelope>=0&&y.envelope<=1);for(const prop of ['dance','camera','decoration','face','lyrics'])assert(Number.isFinite(y.cue[prop]));assert(y.cue.dance>=.97&&y.cue.dance<=1.035);assert(y.cue.camera>=.8&&y.cue.camera<=1);assert(y.cue.decoration>=.72&&y.cue.decoration<=1);assert(y.cue.face>=1&&y.cue.face<=1.02);samples++}assert(samples>=20000);console.log(`V629 validated ${samples} song points`);});
test('single final V629 score flows to old renderers',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('story:concertStoryV629')&&s.includes('const concertDramaturgyV623=concertEditionV642.cue'));assert(s.includes('experience:concertExperienceV628'));assert(s.includes('data-v629-beat'));assert(s.includes('data-v629-emphasis'));assert(s.includes('concertDramaturgyV623={concertDramaturgyV623}'));});
test('V628 scoring and V627 inspection are retained',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('const concertExperienceV628=planConcertExperienceV628'));assert(s.includes('data-v628-moment'));assert(fs.existsSync('services/monitoring/automatedConcertQualityInspectorV627.ts'));});
test('no extra GPU objects, timers, random cues or requests',()=>{const s=fs.readFileSync('components/visualizer/intelligentSongDramaturgyV629.ts','utf8');for(const key of ['useFrame(','requestAnimationFrame(','setInterval(','setTimeout(','Math.random(','new PointLight(','new SpotLight(','new ShaderMaterial(','fetch(','localStorage'])assert(!s.includes(key),key);});
console.log(`PASS V629 Intelligent Song Dramaturgy: ${count} regression groups`);
