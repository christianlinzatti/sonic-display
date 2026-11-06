'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectSongArcV868:inspect,shapeSongArcGainsV868:shape}=load('components/visualizer/concertSongArcDirectorV868');
const {planSmartFestivalShowV850:director}=load('components/visualizer/smartFestivalShowDirectorV850');
const {normalizeConcertFxV810:normalize,planConcertFxV810:fxPlanner}=load('components/visualizer/concertFxStudioV810');
let count=0;function check(name,fn){try{fn();count++;}catch(e){e.message=`V868 ${name}: ${e.message}`;throw e;}}
const types=['verse','hook','verse','build','drop','break','hook'];
const motifs=['portrait','wide','dialogue','ensemble','wide','breath','crescendo'];
const acts=types.map((section,index)=>({index,startMs:index*10000,endMs:(index+1)*10000,
 section,repetition:section==='verse'&&index===2?1:section==='hook'&&index===6?1:0,motif:motifs[index]}));
const arc={source:'verified-v600',trackId:'v868-trk',durationMs:70000,endingSupported:true,acts};
const settings=normalize({enabled:true,intensity:100,quality:'ultra',festivalDirectorV850:true,
 festivalDirectorStrengthV850:100,festivalDirectorStyleV850:'balanced'});
function cue(index,progressFraction=.5,genre='hardtekk',options={}){
 const a=acts[index];const progressMs=a.startMs+(a.endMs-a.startMs)*progressFraction;
 const fx=fxPlanner({settings,genre,section:a.section,progressMs,startMs:a.startMs,endMs:a.endMs,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',energy:.9,kick:.92,bass:.85,mids:.7,highs:.75,
 ledBudget:1,laserBudget:1});
 return {settings,fx,trackId:arc.trackId,actIndex:index,actStartMs:a.startMs,actEndMs:a.endMs,
 progressMs,playing:true,reactive:true,reducedMotion:false,manualLighting:false,blackout:false,
 lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',budget:1,
 authoredLanes:[],songArcV868:arc,...options};
}
const evaluate=(i)=>director(i);
const arcAt=(i)=>inspect({arc:i.songArcV868,trackId:i.trackId,index:i.actIndex,
 startMs:i.actStartMs,endMs:i.actEndMs,progressMs:i.progressMs,section:i.fx.section,
 lyricsProtected:i.lyricsProtected,vocalFocus:i.vocalFocus,authoredLanes:i.authoredLanes});
const expected=['setup','payoff','development','anticipation','payoff','respite','finale'];
const labels=['Auftakt','Höhepunkt','Entwicklung','Drop-Vorbereitung','Höhepunkt','Ruhephase','Finale'];
for(let index=0;index<acts.length;index++){
 const input=cue(index),result=evaluate(input),chapter=arcAt(input);
 check(`act ${index} verified`,()=>assert.equal(chapter.verified,true));
 check(`act ${index} chapter`,()=>assert.equal(chapter.chapter,expected[index]));
 check(`act ${index} no mutation`,()=>{const before=JSON.stringify(input);evaluate(input);assert.equal(JSON.stringify(input),before)});
 check(`act ${index} seek stable`,()=>assert.deepEqual(result,evaluate(input)));
 check(`act ${index} original genre focus retained`,()=>assert.equal(result.focus,evaluate({...input,songArcV868:null}).focus));
 check(`act ${index} does not amplify beyond original`,()=>assert(Object.values(result.gains).every(x=>Number.isFinite(x)&&x>=0&&x<=1)));
 check(`act ${index} still uses only verified music`,()=>assert.equal(result.reason,'music'));
 check(`act ${index} label reflects chapter`,()=>assert(result.sceneLabel.includes(labels[index])));
 check(`act ${index} no fabricated section`,()=>assert.equal(result.section,types[index]));
 check(`act ${index} fade neutral entry`,()=>assert.deepEqual(evaluate(cue(index,0)).gains,evaluate({...cue(index,0),songArcV868:null}).gains));
 check(`act ${index} fade neutral exit`,()=>assert.deepEqual(evaluate(cue(index,.999999)).gains,evaluate({...cue(index,.999999),songArcV868:null}).gains));
 for(const lane of ['laser','led','particles','foam','transition']){
  check(`act ${index} authored ${lane} untouched`,()=>{
    const v=evaluate(cue(index,.5,'hardtekk',{authoredLanes:[lane]}));assert.equal(v.gains[lane],1);
  });
 }
}
check('build requires actual next drop',()=>assert.equal(arcAt(cue(3)).nextSection,'drop'));
check('unknown future drop disabled',()=>assert.equal(arcAt(cue(3,.5,'hardtekk',{
 songArcV868:{...arc,acts:[...acts.slice(0,4),{...acts[4],section:'hook'},...acts.slice(5)]}
})).chapter,'development'));
check('build anticipation holds back original festival early',()=>{
 const input=cue(3,.30),v=evaluate(input),baseline=evaluate({...input,songArcV868:null});
 assert(v.gains.festival<baseline.gains.festival);
});
check('build late release larger than early suppression',()=>{
 const early=cue(3,.30),late=cue(3,.70),v1=evaluate(early),v2=evaluate(late);
 const b1=evaluate({...early,songArcV868:null}),b2=evaluate({...late,songArcV868:null});
 assert(v2.gains.festival/b2.gains.festival>v1.gains.festival/b1.gains.festival);
});
check('verified finale opens existing LED instead of turning on new FX',()=>{
 const input=cue(6,.74),v=evaluate(input),base=evaluate({...input,songArcV868:null});
 assert(v.gains.led>=base.gains.led&&v.gains.led<=1);
});
check('finale support cannot be guessed',()=>{
 const input=cue(6,.75,'rap',{songArcV868:{...arc,endingSupported:false}});
 assert.notEqual(arcAt(input).chapter,'finale');
});
check('finale requires last verified timestamp near song end',()=>{
 const input=cue(6,.6,'pop',{songArcV868:{...arc,durationMs:80000}});
 assert.notEqual(arcAt(input).chapter,'finale');
});
check('a zero V850 gain stays zero in the V868 finale',()=>{
 const input=cue(6,.8);const info=arcAt(input);
 const base={laser:0,led:0,particles:0,foam:0,transition:0,festival:0,ambience:0};
 const out=shape(base,{arc,trackId:input.trackId,index:input.actIndex,startMs:input.actStartMs,
 endMs:input.actEndMs,progressMs:input.progressMs,section:input.fx.section,
 lyricsProtected:false,vocalFocus:false},info,1);
 assert(Object.values(out).every(x=>x===0));
});
check('automatic effect zero cannot turn into flash by multiplication',()=>{
 const input=cue(6,.8),info=arcAt(input),gain=shape({laser:0,led:0,particles:0,foam:0,transition:0,festival:0,ambience:0},
 {arc,trackId:input.trackId,index:input.actIndex,startMs:input.actStartMs,endMs:input.actEndMs,
 progressMs:input.progressMs,section:input.fx.section,lyricsProtected:false,vocalFocus:false},info,1);
 assert(Object.values(gain).every(x=>x>=0&&x<=1));
 assert.equal(0*gain.festival,0);
});
check('protection forbids releasing festival glare for lyrics',()=>{
 const input=cue(6,.75,'rap',{lyricsProtected:true,vocalFocus:true});
 const v=evaluate(input),base=evaluate({...input,songArcV868:null});
 for(const lane of ['festival','laser','particles','foam'])assert(v.gains[lane]<=base.gains[lane]);
});
for(const [name,patch] of [
 ['no plan',{songArcV868:null}],['unavailable',{songArcV868:{...arc,source:'unavailable'}}],
 ['wrong track',{songArcV868:{...arc,trackId:'another'}}],
 ['wrong duration',{songArcV868:{...arc,durationMs:30000}}],
 ['zero duration',{songArcV868:{...arc,durationMs:0}}],
 ['too many acts',{songArcV868:{...arc,acts:Array(170).fill(acts[0])}}],
 ['missing acts',{songArcV868:{...arc,acts:[]}}],
 ['wrong index',{actIndex:2}],['wrong start',{actStartMs:10}],['wrong end',{actEndMs:0}],
 ['wrong section',{fx:{...cue(3).fx,section:'verse'}}],
 ['overlapping acts',{songArcV868:{...arc,acts:acts.map((a,i)=>i===1?{...a,startMs:9999}:a)}}],
 ['inverted act',{songArcV868:{...arc,acts:acts.map((a,i)=>i===4?{...a,endMs:a.startMs}:a)}}],
 ['nonfinite act',{songArcV868:{...arc,acts:acts.map((a,i)=>i===0?{...a,startMs:NaN}:a)}}],
 ['invalid repeat',{songArcV868:{...arc,acts:acts.map((a,i)=>i===0?{...a,repetition:-1}:a)}}],
 ['invalid section',{songArcV868:{...arc,acts:acts.map((a,i)=>i===0?{...a,section:'fantasy-drop'}:a)}}],
 ['invalid motif',{songArcV868:{...arc,acts:acts.map((a,i)=>i===0?{...a,motif:'unexpected'}:a)}}],
 ['invalid end proof',{songArcV868:{...arc,endingSupported:'yes'}}],
 ]){
 check(`invalid input ${name} fails closed`,()=>{
  const inp=cue(3,.5,'hardtekk',patch);
  assert.equal(arcAt(inp).verified,false);
  assert.deepEqual(evaluate(inp).gains,evaluate({...inp,songArcV868:null}).gains);
 });
}
for(const [name,patch] of [
 ['disabled',{settings:{...settings,enabled:false}}],['festival disabled',{settings:{...settings,festivalDirectorV850:false}}],
 ['manual',{manualLighting:true}],['blackout',{blackout:true}],['reduced motion',{reducedMotion:true}],
 ['low tier',{tier:'low'}],['not playing',{playing:false}],['unverified FX',{fx:{...cue(3).fx,reason:'unverified'}}],
 ])check(`V850 authority ${name}`,()=>{
 const v=evaluate(cue(3,.5,'hardtekk',patch));assert.equal(v.active,false);
 assert(Object.values(v.gains).every(x=>x===1));
});
for(const genre of ['rap','hardtekk','hardstyle','rock','pop','neutral'])
 for(let index=0;index<acts.length;index++){
  check(`${genre}/${index} deterministic`,()=>{
   const a=cue(index,.55,genre);assert.deepEqual(evaluate(a),evaluate(a));
  });
 }
check('production DynamicStage uses verified V604 plan and checks track/duration',()=>{
 const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
 assert(stage.includes('songArcV868:cameraNarrativeV605?.plan.source'));
 assert(stage.includes('cameraNarrativeV605.plan.trackId===playback.trackId'));
 assert(stage.includes('cameraNarrativeV605.plan.durationMs===playback.durationMs'));
});
check('same V850 authority retained',()=>{
 const src=fs.readFileSync('components/visualizer/smartFestivalShowDirectorV850.ts','utf8');
 assert(src.includes('shapeSongArcGainsV868(gains,arcInputV868,arcV868,blend)'));
 assert(src.includes('i.authoredLanes?.includes'));
 assert(!src.includes('Math.random(')&&!src.includes('useFrame('));
});
check('new director is pure: no timers, clocks, cameras, UI or GPU allocations',()=>{
 const src=fs.readFileSync('components/visualizer/concertSongArcDirectorV868.ts','utf8');
 for(const x of ['Math.random(', 'setInterval(', 'requestAnimationFrame(', 'useFrame(', 'new WebGLRenderer(', 'new PerspectiveCamera(', 'Date.now('])assert(!src.includes(x),x);
});
check('camera remains separate and protected by V351',()=>{
 const src=fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8');
 assert(src.includes('composeCinematicCameraDirectorV848'));
 assert(src.includes('pose:framedV848'), 'V848 must feed the V897 camera');
 assert(src.includes('pose:cinematicCameraV897.pose'), 'V897 must feed V898');
 assert(src.includes('guardAutomaticCameraV351(cinematicV1025.pose,composition)'), 'V351 must guard the final automatic camera pose');
});
check('package and lock versions match V868 or newer',()=>{
 const pkg=require('../package.json'),lock=require('../package-lock.json');
 assert(/^0\.1\.0-v\d+$/.test(pkg.version)&&Number(pkg.version.split('-v')[1])>=868);assert.equal(pkg.version,lock.version);
 assert.equal(pkg.version,lock.packages[''].version);
});
check('release gates retain full V868 checks',()=>{
 const scripts=require('../package.json').scripts;
 for(const k of ['check:fast','check:release','build:preflight'])
  assert(scripts[k].includes('npm run test:v868 && npm run test:v868:types && npm run test:v867 &&'),k);
});
check('V868 dedicated typecheck exists',()=>assert(require('../package.json').scripts['test:v868:types'].includes('tsconfig.v868-core.json')));
console.log(`PASS V868: ${count} verified song-arc, genre, seek, safety, manual-override and wiring checks`);
