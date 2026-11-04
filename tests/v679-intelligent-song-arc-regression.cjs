'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planIntelligentSongArcV679:plan,sampleIntelligentSongArcV679:sample,coordinateIntelligentSongArcV679:apply}=load('components/visualizer/intelligentSongArcV679');
const {planFullSongPacingV671:plan671}=load('components/visualizer/fullSongPacingV671');
let count=0;
const test=(label,fn)=>{try{fn();count++;}catch(error){error.message=`V679 ${label}: ${error.message}`;throw error;}};
const raw=[
 ['verse','setup','portrait',0,0,30000],
 ['hook','payoff','wide',0,30000,55000],
 ['break','respite','breath',0,55000,70000],
 ['verse','develop','dialogue',1,70000,98000],
 ['build','rise','ensemble',0,98000,110000],
 ['hook','payoff','ensemble',1,110000,138000],
 ['drop','ending-arc','crescendo',0,138000,160000],
];
const acts=raw.map(([section,chapter,motif,repetition,startMs,endMs],index)=>({index,section,chapter,motif,repetition,startMs,endMs}));
const narrative={trackId:'songA',durationMs:160000,source:'verified-v600',genre:'deutschrap',endingSupported:true,acts};
const v671=plan671(narrative);
const arc=plan(narrative,v671);
const base={active:true,genre:'deutschrap',section:'hook',source:'imported',evidence:'labeled',
 dance:1,camera:1,lighting:1,lyrics:.07};
function inputs(t,extra={}){
 const moment=arc.moments.find(m=>t>=m.startMs&&t<m.endMs);
 return {trackId:'songA',durationMs:160000,progressMs:t,playing:true,enabled:true,
  reducedMotion:false,tier:'high',lyricsProtected:false,manualDance:false,manualCamera:false,
  manualLighting:false,narrativeCue:moment?{active:true,source:'verified-v600',act:moment.index,
  chapter:moment.chapter,motif:moment.motif,transition:1}:null,
  pacingCue:moment?{active:true,evidence:'verified-arc',beatIndex:moment.index}:null,...extra};
}
test('verified connected whole-song plan',()=>{assert.equal(arc.source,'verified-timeline');assert.equal(arc.moments.length,7);});
test('one major peak is a real hook or drop',()=>{assert.equal(arc.peakIndex,5);assert.equal(arc.moments[5].section,'hook');assert.equal(arc.moments.filter(m=>m.role==='main-peak').length,1);});
test('verifiable build enters confirmed peak',()=>{assert.equal(arc.moments[4].role,'build');assert.equal(arc.moments[5].role,'main-peak');});
test('far apart secondary peaks, no fake adjacent strobe',()=>{assert(arc.supportIndices.every(i=>Math.abs(i-arc.peakIndex)>1));assert(arc.supportIndices.length<=2);});
test('nonselected drop remains an existing moment not new peak',()=>assert.equal(arc.moments[6].section,'drop'));
test('rest has negative score',()=>{assert.equal(arc.moments[2].role,'rest');assert(arc.moments[2].intensity<0);});
test('payoff is stronger than buildup and rest',()=>{assert(arc.moments[5].intensity>arc.moments[4].intensity);assert(arc.moments[4].intensity>arc.moments[2].intensity);});
test('does not mutate imported V604 or V671',()=>{const oldA=JSON.stringify(narrative),oldB=JSON.stringify(v671);plan(narrative,v671);assert.equal(JSON.stringify(narrative),oldA);assert.equal(JSON.stringify(v671),oldB);});
test('verified major cue lifts light and dance',()=>{const r=sample(arc,inputs(124000));assert.equal(r.role,'main-peak');assert(r.lighting>1);assert(r.dance>1);});
test('verified break lowers light and dance',()=>{const r=sample(arc,inputs(62500));assert.equal(r.role,'rest');assert(r.lighting<1);assert(r.dance<1);});
test('act edges return neutral (no jump)',()=>{for(const t of [30000,55000,70000,98000,110000,138000]){const r=sample(arc,inputs(t));assert.equal(r.dance,1,t);assert.equal(r.lighting,1,t);}});
test('end fade does not introduce hard jump',()=>{const r=sample(arc,inputs(137999));assert(Math.abs(r.dance-1)<=.0001);});
test('no unverifiable song sections invented',()=>assert.equal(plan({...narrative,source:'unavailable'},v671).source,'unavailable'));
test('no fabricated peak if all acts verses',()=>{const n={...narrative,acts:acts.slice(0,3).map((a,i)=>({...a,index:i,section:'verse',chapter:'develop'}))};assert.equal(plan(n,plan671(n)).source,'unavailable');});
test('no score if only one/two labelled sections',()=>{const n={...narrative,acts:acts.slice(0,2)};assert.equal(plan(n,plan671(n)).source,'unavailable');});
test('missing arrays rejected without crash',()=>{assert.equal(plan({...narrative,acts:null},v671).source,'unavailable');assert.equal(plan(narrative,{...v671,beats:null}).source,'unavailable');});
test('plan mismatch in track id is rejected',()=>assert.equal(plan(narrative,{...v671,trackId:'songB'}).source,'unavailable'));
test('duration mismatch rejected',()=>assert.equal(plan(narrative,{...v671,durationMs:150000}).source,'unavailable'));
test('timeline mismatch rejected',()=>assert.equal(plan(narrative,{...v671,beats:v671.beats.map((b,i)=>i===1?{...b,startMs:31000}:b)}).source,'unavailable'));
test('wrong motif rejected',()=>assert.equal(plan(narrative,{...v671,beats:v671.beats.map((b,i)=>i===1?{...b,motif:'portrait'}:b)}).source,'unavailable'));
test('bad overlap rejected',()=>assert.equal(plan({...narrative,acts:acts.map((a,i)=>i===1?{...a,startMs:28000}:a)},v671).source,'unavailable'));
test('bad index rejected',()=>assert.equal(plan({...narrative,acts:acts.map((a,i)=>i===1?{...a,index:9}:a)},v671).source,'unavailable'));
test('untrusted V671 score rejected',()=>assert.equal(plan(narrative,{...v671,beats:v671.beats.map((b,i)=>i===1?{...b,strength:NaN}:b)}).source,'unavailable'));
test('no sample for unsupported track',()=>assert.equal(sample(arc,inputs(124000,{trackId:'other'})).active,false));
test('seek beyond duration rejects',()=>{for(const progressMs of [-1,NaN,Infinity,160000])assert.equal(sample(arc,inputs(124000,{progressMs})).active,false);});
test('disabled playback and low tier identity',()=>{for(const x of [{playing:false},{enabled:false},{reducedMotion:true},{tier:'low'}])assert.equal(sample(arc,inputs(124000,x)).active,false);});
test('no valid V604 cue yields no V679 adjustment',()=>{for(const narrativeCue of [null,{...inputs(124000).narrativeCue,act:3},{...inputs(124000).narrativeCue,motif:'wrong'},{...inputs(124000).narrativeCue,transition:NaN},{...inputs(124000).narrativeCue,source:'off'}])assert.equal(sample(arc,inputs(124000,{narrativeCue})).active,false);});
test('no verified V671 cue yields no adjustment',()=>{for(const pacingCue of [null,{...inputs(124000).pacingCue,beatIndex:3},{...inputs(124000).pacingCue,evidence:'continuous-contour'}])assert.equal(sample(arc,inputs(124000,{pacingCue})).active,false);});
test('manual dance lane untouched',()=>assert.equal(sample(arc,inputs(124000,{manualDance:true})).dance,1));
test('manual camera lane untouched',()=>assert.equal(sample(arc,inputs(124000,{manualCamera:true})).camera,1));
test('manual light lane untouched',()=>assert.equal(sample(arc,inputs(124000,{manualLighting:true})).lighting,1));
test('all manual channels preserve same base object',()=>{const s=sample(arc,inputs(124000,{manualDance:true,manualCamera:true,manualLighting:true}));assert.strictEqual(apply(base,s),base);});
test('lyric priority reduces dynamic emphasis',()=>assert(Math.abs(sample(arc,inputs(124000,{lyricsProtected:true})).emphasis)<Math.abs(sample(arc,inputs(124000)).emphasis)));
test('balanced tier reduces dynamic emphasis',()=>assert(Math.abs(sample(arc,inputs(124000,{tier:'balanced'})).emphasis)<Math.abs(sample(arc,inputs(124000)).emphasis)));
test('off cues retain base object identity',()=>assert.strictEqual(apply(base,sample(arc,inputs(124000,{playing:false}))),base));
test('inactive dynamics retain base identity',()=>{const inactive={...base,active:false};assert.strictEqual(apply(inactive,sample(arc,inputs(124000))),inactive);});
test('only existing gain lanes changed',()=>{const prior=JSON.stringify(base),result=apply(base,sample(arc,inputs(124000)));assert.equal(JSON.stringify(base),prior);for(const key of ['active','genre','section','source','evidence','lyrics'])assert.equal(result[key],base[key]);});
test('10k simulated frames bounded, finite, deterministic',()=>{for(let i=0;i<10000;i++){const t=(i*131)%160000,r=sample(arc,inputs(t));for(const key of ['dance','camera','lighting']){assert(Number.isFinite(r[key]));assert(r[key]>=.975&&r[key]<=1.025);}assert.deepEqual(sample(arc,inputs(t)),r);}});
test('actual guard still downstream of V679',()=>{const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(stage.includes('coordinateIntelligentSongArcV679(directedDynamicsV671,intelligentArcV679)'));assert(stage.includes('base:directedDynamicsV681'));assert((stage.includes('directedDynamicsV681,showQualityV670,manualQualityV670)')||stage.includes('directedDynamicsV800,showQualityV670,manualQualityV670)')));assert(stage.indexOf('const directedDynamicsV679=')<stage.indexOf('const showQualityV670='));});
test('data from V604 and V671 reused, never a second clock',()=>{const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(stage.includes('planIntelligentSongArcV679(fullSongPlanV604,fullSongPacingPlanV671)'));assert(stage.includes('narrativeCue:fullSongCueV604,pacingCue:fullSongPacingV671'));assert(stage.includes('manualDanceV678,'));});
test('visible graphical arc in analysis inspector',()=>{const ui=fs.readFileSync('components/visualizer/TrackAnalysisControlsV318.tsx','utf8');assert(ui.includes('V679 · Intelligent Song Arc'));assert(ui.includes('intelligentArcV679.peakIndex'));assert(ui.includes('Dramaturgischer Songbogen'));});
test('stage debug shows evidence rather than false claims',()=>{const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(stage.includes('data-v679-source={intelligentArcPlanV679.source}'));assert(stage.includes('data-v679-role={intelligentArcV679.role??"none"}'));});
test('no new IO, media or timers',()=>{const s=fs.readFileSync('components/visualizer/intelligentSongArcV679.ts','utf8');assert(!/\bfetch\s*\(|setInterval|setTimeout|requestAnimationFrame|AudioContext|localStorage|sessionStorage|Math\.random|new Date|WebSocket|updatePreferences/.test(s));});
test('version release and guide',()=>{const pkg=require('../package.json');assert(Number(pkg.version.match(/-v(\d+)$/)[1])>=679);assert(pkg.scripts['check:release'].includes('test:v679'));assert(pkg.scripts['test:smoke:v679'].includes('test:smoke:v678'));assert(fs.readFileSync('ARCHITECTURE.md','utf8').includes(`**Dokumentationsstand:** V${pkg.version.split('-v')[1]}`));assert(fs.existsSync('docs/versions/V679-INTELLIGENT-SONG-ARC.md'));});
console.log(`PASS V679 Intelligent Song Arc: ${count} checks and 10,000 frames`);
