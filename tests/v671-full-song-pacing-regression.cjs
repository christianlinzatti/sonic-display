'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planFullSongPacingV671:plan,sampleFullSongPacingV671:sample,coordinateFullSongPacingV671:apply}=load('components/visualizer/fullSongPacingV671');
let groups=0;
function test(name,fn){try{fn();groups++;}catch(e){e.message=`V671 ${name}: ${e.message}`;throw e;}}
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
const narrative={trackId:'songA',durationMs:160000,source:'verified-v600',genre:'rock',endingSupported:true,acts};
const arc=plan(narrative);
const base={active:true,genre:'rock',source:'imported',section:'hook',evidence:'labeled',dance:1,lighting:1,camera:1,lyrics:.12};
const at=(ms,override={})=>{
 const beat=arc.beats.find(b=>b.startMs<=ms&&ms<b.endMs);
 return {trackId:'songA',durationMs:160000,progressMs:ms,playing:true,enabled:true,reducedMotion:false,
 tier:'high',style:'rock',energy:.75,lyricsProtected:false,manualDance:false,manualCamera:false,manualLighting:false,
 narrativeCue:beat?{source:'verified-v600',active:true,act:beat.index,chapter:beat.chapter,motif:beat.motif,
 repetition:beat.repetition,transition:1}:null,...override};
};
test('verified complete plan',()=>{assert.equal(arc.source,'verified-v604');assert.equal(arc.beats.length,7);assert(arc.highPointIndex>=0);});
test('does not mutate V604',()=>{const original=JSON.stringify(narrative);plan(narrative);assert.equal(JSON.stringify(narrative),original);});
test('first act establishes',()=>assert.equal(sample(arc,at(15000)).intent,'establish'));
test('second hook evolves and contrasts',()=>{const first=sample(arc,at(42000)),second=sample(arc,at(124000));assert.equal(first.intent,'climax');assert.equal(second.intent,'climax');assert.notEqual(first.strength,second.strength);});
test('break actually lowers existing dance/light',()=>{const c=sample(arc,at(62500));assert.equal(c.intent,'breathe');assert(c.dance<1&&c.lighting<1);});
test('finale confirmed, not inferred from duration alone',()=>{const c=sample(arc,at(150000));assert.equal(c.intent,'finale');assert.equal(c.evidence,'verified-arc');});
test('opening and closing act boundaries have no jump',()=>{for(const t of [30000,54999,110000,137999]){const c=sample(arc,at(t));assert(Math.abs(c.dance-1)<.0003,`boundary ${t}: ${c.dance}`);}});
test('missing narrative never invents a climax',()=>{const c=sample(plan({...narrative,source:'unavailable'}),at(40000));assert.equal(c.evidence,'continuous-contour');assert.equal(c.intent,'neutral');assert.equal(c.beatIndex,-1);});
test('labelled gap receives only neutral fallback',()=>{const p=plan({...narrative,acts:[acts[0],{...acts[3],index:1,repetition:0}]});const c=sample(p,at(40000,{narrativeCue:null}));assert.equal(c.intent,'neutral');assert.equal(c.beatIndex,-1);});
test('invalid and stale cues not trusted',()=>{for(const narrativeCue of [null,{...at(42000).narrativeCue,act:0},{...at(42000).narrativeCue,motif:'portrait'},{...at(42000).narrativeCue,source:'off'},{...at(42000).narrativeCue,transition:NaN}]){const c=sample(arc,at(42000,{narrativeCue}));assert.equal(c.evidence,'continuous-contour');}});
test('stale track pauses all effects',()=>{for(const change of [{trackId:'new'},{durationMs:160100},{playing:false},{enabled:false},{reducedMotion:true},{tier:'low'},{progressMs:160000},{progressMs:-1},{progressMs:NaN},{progressMs:Infinity}]){assert.equal(sample(arc,at(42000,change)).active,false);}});
test('manual dance protected',()=>assert.equal(sample(arc,at(42000,{manualDance:true})).dance,1));
test('manual camera protected',()=>assert.equal(sample(arc,at(42000,{manualCamera:true})).camera,1));
test('manual lighting protected',()=>assert.equal(sample(arc,at(42000,{manualLighting:true})).lighting,1));
test('all manual lanes have exact one multipliers',()=>{const c=sample(arc,at(42000,{manualDance:true,manualCamera:true,manualLighting:true}));assert.equal(c.dance,1);assert.equal(c.camera,1);assert.equal(c.lighting,1);});
test('lyrics protected decreases intensity',()=>{const a=sample(arc,at(42000));const b=sample(arc,at(42000,{lyricsProtected:true}));assert(b.dance<=a.dance);});
test('balanced tier reduces intensity',()=>assert(sample(arc,at(42000,{tier:'balanced'})).dance<sample(arc,at(42000)).dance));
test('acoustic profile remains softer than hard dance',()=>assert(sample(arc,at(42000,{style:'acoustic'})).dance<sample(arc,at(42000,{style:'hard-dance'})).dance));
test('no audio energy necessary for confirmed act',()=>assert.equal(sample(arc,at(42000,{energy:NaN})).evidence,'verified-arc'));
test('fallback with NaN energy safe',()=>{const c=sample(arc,at(42000,{narrativeCue:null,energy:NaN}));assert(Number.isFinite(c.lighting));});
test('missing confidence planning rejected',()=>assert.equal(plan({...narrative,source:'unavailable'}).beats.length,0));
test('bad section sequence fails closed',()=>assert.equal(plan({...narrative,acts:[acts[0],{...acts[1],startMs:20000}]}).source,'unclassified'));
test('out of range sections fail closed',()=>assert.equal(plan({...narrative,acts:[{...acts[0],endMs:200000}]}).beats.length,0));
test('bad index fails closed',()=>assert.equal(plan({...narrative,acts:[{...acts[0],index:1}]}).beats.length,0));
test('bad section chapter fails closed',()=>assert.equal(plan({...narrative,acts:[{...acts[0],chapter:'invented'}]}).beats.length,0));
test('bad repetition fails closed',()=>assert.equal(plan({...narrative,acts:[{...acts[0],repetition:99}]}).beats.length,0));
test('large number of acts rejected',()=>assert.equal(plan({...narrative,acts:Array(161).fill(acts[0])}).source,'unclassified'));
test('off cue retains base object identity',()=>assert.strictEqual(apply(base,sample(arc,at(42000,{playing:false}))),base));
test('off base retains object identity',()=>{const b={...base,active:false};assert.strictEqual(apply(b,sample(arc,at(42000))),b);});
test('only existing automatic lanes change',()=>{const old=JSON.stringify(base),r=apply(base,sample(arc,at(42000)));assert.equal(JSON.stringify(base),old);assert.equal(r.lyrics,base.lyrics);assert.equal(r.section,base.section);assert.equal(r.source,base.source);assert.equal(r.evidence,base.evidence);});
test('all gain values remain bounded and finite (21000 frames)',()=>{let count=0;const genres=['rap','rock','metal','pop','hard-dance','electronic','acoustic'];for(const genre of genres)for(let i=0;i<3000;i++){const t=Math.floor(i*53.31)%160000;const cue=sample(arc,at(t,{style:genre,narrativeCue:i%8===0?null:at(t).narrativeCue}));for(const field of ['dance','camera','lighting']){assert(Number.isFinite(cue[field]));assert(cue[field]>=.965&&cue[field]<=1.035);}count++;}assert.equal(count,21000);});
test('random seek is repeatable',()=>{for(const t of [1,251,30000,31000,55000,62000,99999,112000,159999])assert.deepEqual(sample(arc,at(t)),sample(arc,at(t)));});
test('not a new source of camera cuts or lyrics timing',()=>{const s=fs.readFileSync('components/visualizer/fullSongPacingV671.ts','utf8');assert(!/\bfetch\s*\(|setInterval|setTimeout|requestAnimationFrame|AudioContext|localStorage|process\.env|Math\.random|new Date/.test(s));});
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
test('one existing concert lane (V654→V669→V671→V679→V670)',()=>assert(stage.includes('coordinateUniversalConcertV669(directedDynamicsV654,universalShowV669)')&&stage.includes('coordinateFullSongPacingV671(directedDynamicsV669,fullSongPacingV671)')&&stage.includes('coordinateIntelligentSongArcV679(directedDynamicsV671,intelligentArcV679)')&&(stage.includes('directedDynamicsV681,showQualityV670,manualQualityV670)')||stage.includes('directedDynamicsV800,showQualityV670,manualQualityV670)'))));
test('one verified evidence source V604',()=>assert(stage.includes('planFullSongPacingV671(fullSongPlanV604)')&&stage.includes('narrativeCue:fullSongCueV604')));
test('actual live dance camera lighting use V670 guarded lane',()=>assert(stage.includes('concertExperienceV464,directed,energy),directedDynamicsV670)')&&stage.includes('directedDynamicsV670.camera')&&stage.includes('directedDynamicsV670.lighting')));
test('debug identifies evidence and climax',()=>assert(stage.includes('data-v671-evidence={fullSongPacingV671.evidence}')&&stage.includes('data-v671-high-point={fullSongPacingPlanV671.highPointIndex}')));
test('visible plan inspector in existing import settings',()=>{const ui=fs.readFileSync('components/visualizer/TrackAnalysisControlsV318.tsx','utf8');assert(ui.includes('V671 · Full-Song Dramaturgy')&&ui.includes('pacingPlanV671.highPointIndex')&&ui.includes('planUltimateConcertV600'));});
test('release retains previous V670 checks',()=>{const scripts=require('../package.json').scripts;assert(scripts['test:smoke:v671'].includes('test:smoke:v670'));assert(scripts['check:release'].includes('test:smoke:v671'));});
test('V670 quality guard remains final',()=>{assert(stage.indexOf('const directedDynamicsV671=')<stage.indexOf('const showQualityV670='));assert(stage.includes('base:directedDynamicsV681'));assert(stage.indexOf('const directedDynamicsV671=')<stage.indexOf('const directedDynamicsV679='));});
console.log('PASS V671 Full-Song Dramaturgy:',groups,'groups, 21,000 bounded frames');
