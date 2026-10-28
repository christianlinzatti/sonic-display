'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planRockPopPerformanceV625:plan,composeRockPopPerformanceV625:compose,NEUTRAL_ROCK_POP_V625:OFF}=load('components/visualizer/rockPopPerformanceDirectorV625');
const {planGenreConcertV610,resolveConcertGenreV610}=load('components/visualizer/genreConcertExperienceV610');
const {classifyConcertGenreV502,planSmartConcertDynamicsV502}=load('components/visualizer/smartConcertDynamicsV502');
const {planUltimateConcertV600}=load('components/visualizer/ultimateConcertDirectorV600');
let groups=0;const test=(label,fn)=>{try{fn();groups++}catch(e){e.message=`V625 ${label}: ${e.message}`;throw e}};
const sections=['verse','build','hook','verse','hook','break','drop','hook'];
const acts=sections.map((section,index)=>({index,section,startMs:index*25000,endMs:(index+1)*25000,
 chapter:section==='hook'||section==='drop'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
 motif:section==='hook'?'wide':section==='drop'?'ensemble':'portrait',repetition:section==='hook'?(index===4?1:index===7?2:0):0}));
const cue=i=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,repetition:acts[i].repetition,transition:1});
const input=(i=2,genre='rock',extra={})=>({narrative:{plan:{source:'verified-v600',trackId:'v625-track',durationMs:200000,genre,acts},cue:cue(i)},
 trackId:'v625-track',durationMs:200000,positionMs:acts[i].startMs+12000,section:acts[i].section,genre,
 energy:.86,kick:.75,playing:true,reducedMotion:false,tier:'high',lyricsProtected:false,
 manualDance:false,manualCamera:false,manualLighting:false,...extra});
const run=(i=2,genre='rock',extra={})=>plan(input(i,genre,extra),genre);
const concert=(i=2,genre='rock',extra={})=>planGenreConcertV610(input(i,genre,extra));
test('V502 classifies rock subgenres and pop subgenres',()=>{for(const g of ['Rock','Indie Rock','Punk Rock','metal','Alternative Rock'])assert.equal(classifyConcertGenreV502(g),'rock');for(const g of ['Pop','Synthpop','Electropop','K-pop'])assert.equal(classifyConcertGenreV502(g),'pop')});
test('V610 resolves rock and pop but not generic techno',()=>{for(const g of ['ROCK','pop','synthpop'])assert(['rock','pop'].includes(resolveConcertGenreV610(g)));assert.equal(resolveConcertGenreV610('techno'),null)});
test('V502 supplies evidence-bound active rock/pop envelopes',()=>{const common={trackId:'x',progressMs:2100,playing:true,enabled:true,reducedMotion:false,genre:'rock',section:'hook',source:'imported',hasSectionLabels:true,sectionStartMs:1000,energy:.8,kick:.7,tier:'high',lyricFocus:false,lyricsVisible:true,manualDance:false,manualCamera:false,manualLighting:false,manualLyrics:false};for(const genre of ['rock','pop']){const x=planSmartConcertDynamicsV502({...common,genre});assert(x.active&&x.genre===genre&&x.evidence==='labeled')}assert(!planSmartConcertDynamicsV502({...common,genre:'ambient'}).active)});
test('V600 builds real song arcs from verified imported sections',()=>{const analysis={schema:'sonic-track-analysis-v318',trackId:'v625-track',sections:acts.map(a=>({startMs:a.startMs,durationMs:25000,label:a.section,confidence:.99}))};for(const genre of ['rock','pop']){const v=planUltimateConcertV600({trackId:'v625-track',durationMs:200000,genre,analysis});assert.equal(v.source,'authored');assert.equal(v.acts.length,8)}});
test('V600 refuses unlabelled rock and pop tracks',()=>{for(const genre of ['rock','pop'])assert.equal(planUltimateConcertV600({trackId:'x',durationMs:200000,genre,analysis:null}).acts.length,0)});
test('Rock/Pop reaches actual V610 concert consumer',()=>{for(const genre of ['rock','pop']){const cue=concert(2,genre);assert(cue.active&&cue.genre===genre);assert(cue.dance>1);assert(cue.beam>1)}});
test('Rock verse is grounded, pop verse portrait-stable',()=>{const r=concert(0,'rock'),p=concert(0,'pop');assert(r.cameraDrift>p.cameraDrift);assert(r.cameraFov>p.cameraFov);assert(p.key>1&&p.fill>1)});
test('Rock hooks use stronger beams than Pop',()=>{const r=concert(2,'rock'),p=concert(2,'pop');assert(r.beam>p.beam);assert(r.cameraFov>p.cameraFov)});
test('Pop hook favors singer lighting and group clarity',()=>{const r=concert(2,'rock'),p=concert(2,'pop');assert(p.fill>r.fill);assert(p.spot>r.spot)});
test('Repeated hooks alternate wide and spotlight balance',()=>{for(const genre of ['rock','pop']){const a=concert(2,genre),b=concert(4,genre);assert(a.cameraFov>b.cameraFov);assert(a.beam>b.beam);assert(a.spot<b.spot)}});
test('Third hook returns wide focus with a new song position',()=>{for(const genre of ['rock','pop']){const a=concert(4,genre),b=concert(7,genre);assert(b.cameraFov>a.cameraFov)}});
test('Build accents climb by actual progress',()=>{for(const genre of ['rock','pop']){const early=run(1,genre,{positionMs:25100}),late=run(1,genre,{positionMs:49900});assert(late.rise>early.rise);assert(late.beam>early.beam);assert(late.cameraFov>early.cameraFov)}});
test('Break remains calmer than hook',()=>{for(const genre of ['rock','pop']){const a=concert(5,genre),b=concert(2,genre);assert(a.dance<b.dance&&a.beam<b.beam&&a.haze<=1)}});
test('Verified and actually audible drops get bounded accents',()=>{for(const genre of ['rock','pop']){const x=concert(6,genre);assert(x.dance>1&&x.beam>1&&x.spot>1&&x.cameraFov>0)}});
test('No kick no invented drop',()=>{for(const genre of ['rock','pop']){const x=concert(6,genre,{kick:.1});assert.equal(x.beam,1);assert.equal(x.dance,1);assert.equal(x.cameraFov,0);assert.equal(x.spot,1)}});
test('Low energy no invented drop',()=>{for(const genre of ['rock','pop']){const x=concert(6,genre,{energy:.1});assert.equal(x.beam,1);assert.equal(x.spot,1);assert.equal(x.dance,1)}});
test('Unknown, rap and hard genres never receive Rock/Pop overlays',()=>{for(const genre of [null,'ambient','deutschrap','hardstyle','hardtekk']){assert.deepEqual(plan(input(2,genre),genre),OFF)}});
test('Pause, reduced motion, low tier are fail closed',()=>{for(const patch of [{playing:false},{reducedMotion:true},{tier:'low'}])assert.deepEqual(run(2,'rock',patch),OFF)});
test('Track mismatch, duration mismatch, section mismatch rejected',()=>{for(const patch of [{trackId:'other'},{durationMs:220000},{section:'drop'},{positionMs:5000}])assert.deepEqual(run(2,'pop',patch),OFF)});
test('Unavailable or fabricated narrative rejected',()=>{for(const source of ['unavailable','playback-only','guessed']){const a=input();a.narrative.plan.source=source;assert.deepEqual(plan(a,'rock'),OFF)}});
test('Cue source and identity must be verified',()=>{for(const patch of [{source:'estimated'},{act:300},{chapter:'fiction'},{motif:'fiction'},{repetition:55},{active:false}]){const a=input();a.narrative.cue={...a.narrative.cue,...patch};assert.deepEqual(plan(a,'rock'),OFF)}});
test('Invalid energy, kick and time fail closed',()=>{for(const bad of [NaN,Infinity,-1,1.1]){assert.deepEqual(run(2,'pop',{energy:bad}),OFF);assert.deepEqual(run(2,'rock',{kick:bad}),OFF)}for(const positionMs of [-1,200000,Infinity,NaN])assert.deepEqual(run(2,'rock',{positionMs}),OFF)});
test('Zero transition keeps all existing lanes neutral',()=>{const a=input();a.narrative.cue.transition=0;const v=planGenreConcertV610(a);for(const k of ['dance','cameraDrift','cameraRate','beam','spot','sweep','haze','key','fill'])assert.equal(v[k],1);assert.equal(v.cameraFov,0)});
test('Manual dance lane is exactly neutral',()=>{for(const genre of ['rock','pop'])assert.equal(concert(2,genre,{manualDance:true}).dance,1)});
test('Manual camera lanes exactly neutral',()=>{for(const genre of ['rock','pop']){const x=concert(2,genre,{manualCamera:true});assert.equal(x.cameraDrift,1);assert.equal(x.cameraFov,0);assert.equal(x.cameraRate,1)}});
test('Manual lights are exactly neutral',()=>{for(const genre of ['rock','pop']){const x=concert(2,genre,{manualLighting:true});for(const k of ['key','fill','beam','spot','sweep','haze'])assert.equal(x[k],1)}});
test('All manual lanes remain neutral',()=>{const x=concert(2,'rock',{manualDance:true,manualCamera:true,manualLighting:true});assert.equal(x.cameraFov,0);for(const k of ['dance','cameraDrift','cameraRate','key','fill','beam','spot','sweep','haze'])assert.equal(x[k],1)});
test('Lyrics reduce visual accent, not activate a brighter background',()=>{for(const genre of ['rock','pop']){const a=concert(2,genre),b=concert(2,genre,{lyricsProtected:true});for(const k of ['dance','beam','spot','cameraDrift'])assert(Math.abs(b[k]-1)<=Math.abs(a[k]-1));assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov))}});
test('Balanced tier reduces intensity',()=>{for(const genre of ['rock','pop']){const a=concert(2,genre),b=concert(2,genre,{tier:'balanced'});assert(b.beam<a.beam&&Math.abs(b.cameraFov)<Math.abs(a.cameraFov))}});
test('Composition refuses inactive and mismatched baseline',()=>{const b=concert(2,'rock'),a=run(2,'rock');assert.equal(compose(b,{...a,active:false}),b);assert.equal(compose(b,{...a,genre:'pop'}),b)});
test('Existing genre direction does not change',()=>{for(const genre of ['deutschrap','hardstyle','hardtekk']){const a=input(2,genre);assert.deepEqual(compose(planGenreConcertV610(a),plan(a,genre)),planGenreConcertV610(a))}});
test('No new render loops, generators, timers or network work',()=>{const src=fs.readFileSync('components/visualizer/rockPopPerformanceDirectorV625.ts','utf8');for(const token of ['useFrame(', 'requestAnimationFrame(', 'new SpotLight(', 'new ShaderMaterial(', 'Date.now(', 'Math.random(', 'setInterval(', 'fetch('])assert(!src.includes(token),token)});
test('All four real renderers share existing V610 evidence',()=>{for(const f of ['VisualizerStage.tsx','StageCameraDirectorV289.tsx','DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx'])assert(fs.readFileSync('components/visualizer/'+f,'utf8').includes('planGenreConcertV610('),f);assert(fs.readFileSync('components/visualizer/genreConcertExperienceV610.ts','utf8').includes('composeRockPopPerformanceV625('))});
test('Full-song playback deterministic, bounded and seek-stable',()=>{let samples=0;for(const genre of ['rock','pop'])for(let i=0;i<acts.length;i++)for(let ms=acts[i].startMs;ms<acts[i].endMs;ms+=53){const a=concert(i,genre,{positionMs:ms});assert(a.active);for(const k of ['dance','cameraDrift','cameraRate','key','fill','beam','spot','sweep','haze'])assert(Number.isFinite(a[k])&&a[k]>=.84&&a[k]<=1.14,`${genre}:${ms}:${k}`);assert(Number.isFinite(a.cameraFov)&&a.cameraFov>=-.4&&a.cameraFov<=.8);samples++}assert(samples>7500);console.log(`V625 sampled ${samples} rock/pop concert positions`)});
test('Replay, seek and no mutation',()=>{const a=input(2,'rock'),before=JSON.stringify(a),v=concert(2,'rock');concert(7,'pop');concert(0,'rock');assert.deepEqual(concert(2,'rock'),v);plan(a,'rock');planGenreConcertV610(a);assert.equal(JSON.stringify(a),before)});
console.log(`PASS V625 Rock & Pop Live Performance: ${groups} groups`);
