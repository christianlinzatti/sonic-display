'use strict';
const assert=require('node:assert/strict');const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planFestivalPerformanceV624:plan,composeFestivalPerformanceV624:compose,NEUTRAL_FESTIVAL_V624:NEUTRAL}=load('components/visualizer/festivalPerformanceDirectorV624');
const {planGenreConcertV610}=load('components/visualizer/genreConcertExperienceV610');
let count=0;const test=(name,fn)=>{try{fn();count++}catch(e){e.message=`V624 ${name}: ${e.message}`;throw e}};
const sections=['verse','build','hook','verse','hook','break','drop','drop'];
const acts=sections.map((section,index)=>({index,section,startMs:index*30000,endMs:(index+1)*30000,
 chapter:section==='hook'||section==='drop'?'payoff':section==='build'?'rise':section==='break'?'respite':'develop',
 motif:section==='hook'?'ensemble':section==='drop'?'wide':'portrait',repetition:index===4?1:0}));
const cue=i=>({active:true,source:'verified-v600',act:i,chapter:acts[i].chapter,motif:acts[i].motif,repetition:acts[i].repetition,transition:1});
const inp=(index=6,genre='hardtekk',extra={})=>({narrative:{plan:{source:'verified-v600',trackId:'v624-track',durationMs:240000,genre,acts},cue:cue(index)},
 trackId:'v624-track',durationMs:240000,positionMs:acts[index].startMs+15000,section:acts[index].section,genre,
 energy:.9,kick:.88,playing:true,reducedMotion:false,tier:'high',lyricsProtected:false,
 manualDance:false,manualCamera:false,manualLighting:false,...extra});
const run=(i=6,g='hardtekk',extra={})=>plan(inp(i,g,extra),g);
test('hardtekk supported drop gets positive bounded accents',()=>{const v=run();assert(v.active&&v.phase==='drop'&&v.intensity>0);assert(v.dance>1&&v.sweep>1&&v.beam>1)});
test('hardstyle drop has distinct beam character',()=>{assert(run(6,'hardstyle').beam>run(6,'hardtekk').beam)});
test('hardtekk drop has distinct dance and sweep',()=>{assert(run(6,'hardtekk').dance>run(6,'hardstyle').dance);assert(run(6,'hardtekk').sweep>run(6,'hardstyle').sweep)});
test('unconfirmed kick adds nothing at drop',()=>{const v=run(6,'hardtekk',{kick:.1});assert.equal(v.intensity,0);for(const k of ['dance','beam','spot','sweep','cameraDrift','cameraRate','key','fill'])assert.equal(v[k],1);assert.equal(v.cameraFov,0)});
test('low energy drop adds nothing',()=>{const v=run(6,'hardstyle',{energy:.15});assert.equal(v.intensity,0);assert.equal(v.dance,1)});
test('build rises with actual act progress',()=>{const e=run(1,'hardstyle',{positionMs:30050}),l=run(1,'hardstyle',{positionMs:59950});assert(e.dance<l.dance&&e.beam<l.beam&&e.rise<l.rise)});
test('repeated hooks alternate beam versus spotlight',()=>{const a=run(2),b=run(4);assert(a.beam>b.beam&&a.spot<b.spot);assert.notEqual(a.cameraFov,b.cameraFov)});
test('break is restrained and distinct from hook',()=>{const a=run(5),b=run(2);assert(a.dance<1&&a.sweep<1&&b.dance>1)});
test('lyrics reduce all peak activity',()=>{const a=run(),b=run(6,'hardtekk',{lyricsProtected:true});for(const k of ['dance','beam','spot','sweep'])assert(Math.abs(b[k]-1)<Math.abs(a[k]-1));assert(Math.abs(b.cameraFov)<Math.abs(a.cameraFov))});
test('balanced performance tier reduces activity',()=>{const a=run(),b=run(6,'hardtekk',{tier:'balanced'});assert(b.dance<a.dance&&b.beam<a.beam)});
test('no other genre is modified',()=>{for(const g of ['deutschrap',null,'rock','techno'])assert.deepEqual(plan(inp(2,g),g),NEUTRAL)});
test('pause, low tier and reduced motion disable all activity',()=>{for(const patch of [{playing:false},{reducedMotion:true},{tier:'low'}])assert.deepEqual(run(6,'hardtekk',patch),NEUTRAL)});
test('unverified narrative is refused',()=>{for(const src of ['unavailable','manual','guessed']){const x=inp();x.narrative.plan.source=src;assert.deepEqual(plan(x,'hardtekk'),NEUTRAL)}});
test('wrong track, duration and section are refused',()=>{for(const patch of [{trackId:'other'},{durationMs:100000},{section:'hook'},{positionMs:5000}])assert.deepEqual(run(6,'hardtekk',patch),NEUTRAL)});
test('stale cue and act metadata are refused',()=>{for(const patch of [{repetition:42},{chapter:'unverified'},{motif:'fictional'},{act:22}]){const x=inp();x.narrative.cue={...x.narrative.cue,...patch};assert.deepEqual(plan(x,'hardtekk'),NEUTRAL)}});
test('nonfinite input never reaches renderer',()=>{for(const bad of [-1,1.1,Infinity,NaN]){assert.deepEqual(run(6,'hardtekk',{kick:bad}),NEUTRAL);assert.deepEqual(run(6,'hardtekk',{energy:bad}),NEUTRAL)}});
test('manual dance lane is exactly neutral',()=>assert.equal(run(6,'hardtekk',{manualDance:true}).dance,1));
test('manual camera lanes are neutral',()=>{const v=run(6,'hardtekk',{manualCamera:true});assert.equal(v.cameraRate,1);assert.equal(v.cameraFov,0);assert.equal(v.cameraDrift,1)});
test('manual lighting lanes are neutral',()=>{const v=run(6,'hardtekk',{manualLighting:true});for(const k of ['key','fill','beam','spot','sweep','haze'])assert.equal(v[k],1)});
test('all manual lanes compose without changing original',()=>{const x=inp(6,'hardtekk',{manualDance:true,manualCamera:true,manualLighting:true});const base=planGenreConcertV610(x);assert.equal(base.dance,1);assert.equal(base.beam,1);assert.equal(base.cameraRate,1)});
test('composition preserves neutral and inactive source',()=>{const x=planGenreConcertV610(inp());assert.equal(compose(x,NEUTRAL),x);assert(!compose({...x,active:false},run()).active)});
test('composition bounded by existing V610 render budgets',()=>{const v=planGenreConcertV610(inp());assert(v.active);assert(v.dance<=1.14&&v.cameraDrift<=1.10&&v.cameraRate<=1.14&&v.beam<=1.12&&v.spot<=1.10&&v.sweep<=1.12&&v.haze<=1)});
test('full-song playback sampled deterministically',()=>{let samples=0;for(const genre of ['hardstyle','hardtekk'])for(let i=0;i<acts.length;i++)for(let ms=acts[i].startMs;ms<acts[i].endMs;ms+=39){const x=run(i,genre,{positionMs:ms});assert(x.active);for(const v of Object.values(x))if(typeof v==='number')assert(Number.isFinite(v));samples++;}assert(samples>12000);console.log(`V624 checked ${samples} complete-song festival states`)});
test('seek and replay give identical cues',()=>{const before=run(4);run(2);run(7);run(0);assert.deepEqual(run(4),before)});
test('inputs remain unmodified',()=>{const x=inp(6),before=JSON.stringify(x);plan(x,'hardtekk');planGenreConcertV610(x);assert.equal(JSON.stringify(x),before)});
test('existing dance, camera and lighting consumers use the same V610 implementation',()=>{for(const file of ['VisualizerStage.tsx','StageCameraDirectorV289.tsx','DynamicStage.tsx','ConcertAtmosphereRendererV308.tsx'])assert(fs.readFileSync(`components/visualizer/${file}`,'utf8').includes('planGenreConcertV610('),file);assert(fs.readFileSync('components/visualizer/genreConcertExperienceV610.ts','utf8').includes('composeFestivalPerformanceV624('))});
test('no new light, shader, audio source or timer',()=>{const src=fs.readFileSync('components/visualizer/festivalPerformanceDirectorV624.ts','utf8');for(const token of ['requestAnimationFrame(','useFrame(','Date.now(','setInterval(','new SpotLight(','new ShaderMaterial(','Math.random(','fetch('])assert(!src.includes(token),token)});
console.log(`PASS V624 Hardstyle/Hardtekk director: ${count} regression groups`);
