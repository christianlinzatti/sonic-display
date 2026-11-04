'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planSectionDirectionV681:plan,sampleSectionDirectionV681:sample,coordinateSectionDirectionV681:apply}=load('components/visualizer/verseHookDropDirectionV681');
const {planFullSongPacingV671:plan671}=load('components/visualizer/fullSongPacingV671');
const {planIntelligentSongArcV679:plan679}=load('components/visualizer/intelligentSongArcV679');
let count=0;
const test=(label,fn)=>{try{fn();count++;}catch(e){e.message=`V681 ${label}: ${e.message}`;throw e;}};
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
const pacing=plan671(narrative),arc=plan679(narrative,pacing),layout=plan(narrative,pacing,arc);
const base={active:true,genre:'deutschrap',section:'hook',source:'imported',evidence:'labeled',dance:1,camera:1,lighting:1,lyrics:.07};
function input(time,changes={}){
 const moment=layout.moments.find(m=>time>=m.startMs&&time<m.endMs);
 return {trackId:'songA',durationMs:160000,progressMs:time,playing:true,enabled:true,
  reducedMotion:false,tier:'high',lyricsProtected:false,manualDance:false,manualCamera:false,
  manualLighting:false,narrativeCue:moment?{active:true,source:'verified-v600',act:moment.index,
  chapter:moment.chapter,motif:moment.motif,repetition:moment.repetition,transition:1}:null,
  pacingCue:moment?{active:true,evidence:'verified-arc',beatIndex:moment.index}:null,
  arcCue:moment?{active:true,evidence:'verified-arc',index:moment.index,role:moment.arcRole}:null,...changes};
}
test('same verified 7-section timeline reused',()=>{assert.equal(layout.source,'verified-v604-v671-v679');assert.equal(layout.moments.length,7);});
test('verse lyric-space label',()=>{assert.equal(layout.moments[0].flavor,'lyric-space');assert.equal(layout.moments[3].flavor,'lyric-space');});
test('different hook repeats produce distinct accents',()=>{assert.equal(layout.moments[1].flavor,'wide-hook');assert.equal(layout.moments[5].flavor,'answer-hook');});
test('build rising, real drop impact and real break',()=>{assert.equal(layout.moments[4].flavor,'rising-build');assert.equal(layout.moments[6].flavor,'drop-impact');assert.equal(layout.moments[2].flavor,'breathing-room');});
test('V679 main peak and lower supporting roles are preserved',()=>{assert.equal(layout.moments[arc.peakIndex].arcRole,'main-peak');assert.deepEqual(layout.moments.map(m=>m.arcRole),arc.moments.map(m=>m.role));});
test('section plan does not mutate V604/V671/V679',()=>{const before=JSON.stringify([narrative,pacing,arc]);plan(narrative,pacing,arc);assert.equal(JSON.stringify([narrative,pacing,arc]),before);});
test('verse makes space for text and slightly reduces camera',()=>{const s=sample(layout,input(14000));assert.equal(s.section,'verse');assert.equal(s.flavor,'lyric-space');assert(s.camera<1&&s.lighting<1);});
test('first hook favours cinematic accent',()=>{const s=sample(layout,input(42000));assert.equal(s.flavor,'wide-hook');assert(s.camera>s.dance);});
test('second hook favours dance, not a repeat of the first',()=>{const s=sample(layout,input(122000));assert.equal(s.flavor,'answer-hook');assert(s.dance>s.camera);});
test('break pulls energy down without changing timing',()=>{const s=sample(layout,input(62000));assert.equal(s.section,'break');assert(s.lighting<1);assert(s.dance<1);});
test('build grows over its verified interval',()=>{const first=sample(layout,input(100900));const later=sample(layout,input(106000));assert(first.lighting>1&&later.lighting>first.lighting);});
test('real drop lifts light more than camera',()=>{const s=sample(layout,input(150000));assert.equal(s.section,'drop');assert(s.lighting>s.camera);});
test('V679 headline hook is stronger than non-headline hook',()=>{const a=sample(layout,input(42000)),b=sample(layout,input(124000));assert(b.dance-1>a.dance-1);});
test('verse, build and break never become invented drop',()=>{for(const t of [12000,62000,88000,105000])assert.notEqual(sample(layout,input(t)).section,'drop');});
test('exact identity on every contiguous boundary',()=>{for(const t of [30000,55000,70000,98000,110000,138000]){const v=sample(layout,input(t));assert.equal(v.dance,1,t);assert.equal(v.camera,1,t);assert.equal(v.lighting,1,t);}});
test('soft fade at section end',()=>{const s=sample(layout,input(137999));assert(Math.abs(s.lighting-1)<=.0001);});
test('no action with missing imported evidence',()=>{for(const src of ['unavailable',null])assert.equal(plan({...narrative,source:src},pacing,arc).source,'unavailable');});
test('V671 unverified source falls back',()=>assert.equal(plan(narrative,{...pacing,source:'unclassified'},arc).source,'unavailable'));
test('V679 unverified source falls back',()=>assert.equal(plan(narrative,pacing,{...arc,source:'unavailable'}).source,'unavailable'));
test('plan rejects different track identity',()=>{assert.equal(plan(narrative,{...pacing,trackId:'B'},arc).source,'unavailable');assert.equal(plan(narrative,pacing,{...arc,trackId:'B'}).source,'unavailable');});
test('plan rejects duration mismatches',()=>{assert.equal(plan(narrative,{...pacing,durationMs:145000},arc).source,'unavailable');assert.equal(plan(narrative,pacing,{...arc,durationMs:145000}).source,'unavailable');});
test('plan rejects timeline mismatch',()=>assert.equal(plan(narrative,pacing,{...arc,moments:arc.moments.map((m,i)=>i===2?{...m,startMs:m.startMs+1}:m)}).source,'unavailable'));
test('plan rejects contradictory section',()=>assert.equal(plan(narrative,pacing,{...arc,moments:arc.moments.map((m,i)=>i===4?{...m,section:'drop'}:m)}).source,'unavailable'));
test('plan rejects contradictory repetition',()=>assert.equal(plan(narrative,{...pacing,beats:pacing.beats.map((m,i)=>i===4?{...m,repetition:9}:m)},arc).source,'unavailable'));
test('plan rejects overlaps',()=>assert.equal(plan({...narrative,acts:acts.map((a,i)=>i===2?{...a,startMs:52000}:a)},pacing,arc).source,'unavailable'));
test('plan rejects sparse/missing arrays',()=>{assert.equal(plan({...narrative,acts:null},pacing,arc).source,'unavailable');assert.equal(plan(narrative,{...pacing,beats:null},arc).source,'unavailable');assert.equal(plan(narrative,pacing,{...arc,moments:null}).source,'unavailable');});
test('plan rejects malformed section labels',()=>assert.equal(plan({...narrative,acts:acts.map((a,i)=>i===3?{...a,section:'outro'}:a)},pacing,arc).source,'unavailable'));
test('plan rejects too many sections',()=>assert.equal(plan({...narrative,acts:Array(161).fill(acts[0])},pacing,arc).source,'unavailable'));
test('all missing live confirmations return identity',()=>{for(const changes of [{narrativeCue:null},{pacingCue:null},{arcCue:null},{narrativeCue:{...input(120000).narrativeCue,source:'off'}},{pacingCue:{...input(120000).pacingCue,evidence:'continuous-contour'}},{arcCue:{...input(120000).arcCue,evidence:'off'}}]){const s=sample(layout,input(120000,changes));assert.equal(s.active,false);assert.equal(s.lighting,1);}});
test('mismatched V604 chapter/motif/repetition rejected',()=>{for(const prop of [{chapter:'respite'},{motif:'wide'},{repetition:19}])assert.equal(sample(layout,input(121000,{narrativeCue:{...input(121000).narrativeCue,...prop}})).active,false);});
test('mismatched live act or arc role rejected',()=>{assert.equal(sample(layout,input(120000,{narrativeCue:{...input(120000).narrativeCue,act:0}})).active,false);assert.equal(sample(layout,input(120000,{arcCue:{...input(120000).arcCue,role:'rest'}})).active,false);});
test('mismatched V671 beat index rejected',()=>assert.equal(sample(layout,input(120000,{pacingCue:{...input(120000).pacingCue,beatIndex:0}})).active,false));
test('missing/out of bounds clock rejected',()=>{for(const progressMs of [-1,NaN,Infinity,160000,170000])assert.equal(sample(layout,input(120000,{progressMs})).active,false);});
test('playback/off/reduced/low are all inert',()=>{for(const changes of [{playing:false},{enabled:false},{reducedMotion:true},{tier:'low'},{trackId:'other'},{durationMs:200000}])assert.equal(sample(layout,input(120000,changes)).active,false);});
test('gaps in verified timeline do not create labels',()=>{const g={...layout,moments:layout.moments.filter(m=>m.index!==2)};assert.equal(sample(g,input(62000)).active,false);});
test('manual dance remains identity',()=>assert.equal(sample(layout,input(120000,{manualDance:true})).dance,1));
test('manual camera remains identity',()=>assert.equal(sample(layout,input(120000,{manualCamera:true})).camera,1));
test('manual lights remain identity',()=>assert.equal(sample(layout,input(120000,{manualLighting:true})).lighting,1));
test('all manual lanes preserve original object identity',()=>{const s=sample(layout,input(120000,{manualDance:true,manualCamera:true,manualLighting:true}));assert.strictEqual(apply(base,s),base);});
test('lyrics priority reduces all extra emphasis',()=>{const a=sample(layout,input(121000)),b=sample(layout,input(121000,{lyricsProtected:true}));assert(Math.abs(b.emphasis)<Math.abs(a.emphasis));assert(Math.abs(b.camera-1)<Math.abs(a.camera-1));});
test('balanced performance reduces emphasis',()=>assert(sample(layout,input(121000,{tier:'balanced'})).emphasis<sample(layout,input(121000)).emphasis));
test('invalid V604 transition rejected',()=>{for(const transition of [-1,2,NaN,Infinity])assert.equal(sample(layout,input(120000,{narrativeCue:{...input(120000).narrativeCue,transition}})).active,false);});
test('inactive base returns exact original object',()=>{const b={...base,active:false};assert.strictEqual(apply(b,sample(layout,input(121000))),b);});
test('disabled cue returns exact original base',()=>assert.strictEqual(apply(base,sample(layout,input(121000,{enabled:false}))),base));
test('gain application never mutates existing source',()=>{const prior=JSON.stringify(base),out=apply(base,sample(layout,input(121000)));assert.equal(JSON.stringify(base),prior);for(const k of ['active','genre','section','source','evidence','lyrics'])assert.equal(out[k],base[k]);});
test('20k frames bounded and deterministic',()=>{for(let i=0;i<20000;i++){const t=(i*1711)%160000,r=sample(layout,input(t));assert.deepEqual(r,sample(layout,input(t)));for(const key of ['dance','camera','lighting']){assert(Number.isFinite(r[key]));assert(r[key]>=.978&&r[key]<=1.022);}}});
test('existing V670 final quality guard after V681',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('coordinateSectionDirectionV681(directedDynamicsV679,sectionCueV681)'));assert(s.includes('base:directedDynamicsV681'));assert((s.includes('directedDynamicsV681,showQualityV670,manualQualityV670)')||s.includes('directedDynamicsV800,showQualityV670,manualQualityV670)')));assert(s.indexOf('const directedDynamicsV681=')<s.indexOf('const showQualityV670='));});
test('uses only V604/V671/V679 bound plans and confirmations',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('planSectionDirectionV681(fullSongPlanV604,fullSongPacingPlanV671,'));assert(s.includes('narrativeCue:fullSongCueV604,pacingCue:fullSongPacingV671,arcCue:intelligentArcV679'));});
test('preserves manual dance, camera and lighting guards',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('manualDanceV678||'));assert(s.includes("preferences.avatarMotionMode==='choreography'"));assert(s.includes('preferences.avatarTimelineEnabled===true'));assert(s.includes('preferences.stageReactive===false'));});
test('analysis shows verified per-song sections',()=>{const s=fs.readFileSync('components/visualizer/TrackAnalysisControlsV318.tsx','utf8');assert(s.includes('V681 · Verse–Hook–Drop Intelligence'));assert(s.includes('sectionPlanV681.moments.map'));assert(s.includes('Kein bestätigter Abschnitt'));});
test('stage debug shows actual cue evidence',()=>{const s=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');assert(s.includes('data-v681-evidence={sectionCueV681.evidence}'));assert(s.includes('data-v681-section={sectionCueV681.section??"none"}'));});
test('pure module has no external IO or extra clock',()=>{const s=fs.readFileSync('components/visualizer/verseHookDropDirectionV681.ts','utf8');assert(!/\bfetch\s*\(|setInterval|setTimeout|requestAnimationFrame|AudioContext|localStorage|sessionStorage|Math\.random|new Date|WebSocket|updatePreferences/.test(s));});
test('release and docs wired',()=>{const p=require('../package.json');assert(Number(p.version.match(/v(\d+)/)?.[1])>=681);assert(p.scripts['check:release'].includes('test:v681'));assert(p.scripts['test:quick'].includes('test:v681'));assert(p.scripts['test:smoke:v681'].includes('test:smoke:v680'));assert(/\*\*Dokumentationsstand:\*\* V(?:68[1-9]|69[0-9]|[7-9][0-9]{2,})/.test(fs.readFileSync('ARCHITECTURE.md','utf8')));assert(fs.existsSync('docs/versions/V681-VERSE-HOOK-DROP-INTELLIGENCE.md'));});
console.log(`PASS V681 Verse Hook Drop Intelligence: ${count} checks and 20,000 frames`);
