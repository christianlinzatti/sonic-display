'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {load} = require('./helpers/ts-loader-v404.cjs');
const {planBeautifulLyricsExperienceV598:plan,planBeautifulLyricsWordV598:word} = load('components/visualizer/beautifulLyricsExperienceV598');
const {verifiedLyricWordsV477,lyricPlaybackFractionV477} = load('components/visualizer/beautifulLyricsV477');
let groups = 0;
function test(name, fn){ try { fn(); groups++; } catch (e) { e.message = `V598 ${name}: ${e.message}`; throw e; }}
const words=[{text:'Für',startMs:1000,endMs:1190},{text:'die',startMs:1200,endMs:1360},
 {text:'ganze',startMs:1380,endMs:1590},{text:'Crew',startMs:1610,endMs:1880}];
const line={text:'Für die ganze Crew',startMs:1000,endMs:1920,words};
const base={line,nextLineStart:2100,progressMs:1420,synchronized:true,playing:true,reducedMotion:false,immersive:true,avatarCount:2,sectionCue:'verse',intensity:.7};
const make = (patch={}) => plan({...base,...patch});
test('active rap uses bounded visual plan and verified timestamps',()=>{
 const p=make();assert.equal(p.mode,'flow');assert.equal(p.density,'normal');assert(p.verifiedWords);
 assert(p.widthCh>=30&&p.widthCh<=60);assert(p.wordAccentGain>.2&&p.wordAccentGain<=.68);
 assert(p.lineHeight>=1.27&&p.lineHeight<=1.35);assert(p.plateOpacity>0);
});
test('cue-driven hook only while synchronized playback is active',()=>{
 const p=make({sectionCue:'hook'});assert.equal(p.mode,'hook');assert(p.hookAccent>0&&p.hookAccent<=.24);
 for(const opt of [{playing:false},{synchronized:false},{progressMs:1990},{progressMs:NaN},{reducedMotion:true}]){
  const result=make({sectionCue:'hook',...opt});assert(result.mode!=='hook'||opt.reducedMotion===true);
  if(opt.reducedMotion)assert.equal(result.hookAccent,0);
 }
});
test('verse/drop/unknown sections never synthesize a hook',()=>{
 for(const sectionCue of ['verse','drop','unknown',undefined]) assert.equal(make({sectionCue}).hookAccent,0);
});
test('dense lyrics get bounded width and a more readable line height',()=>{
 const dense=make({line:{...line,text:'x '.repeat(35)}});
 const veryDense=make({line:{...line,text:'xyz '.repeat(38)}});
 assert.equal(dense.density,'dense');assert.equal(veryDense.density,'very-dense');
 assert(veryDense.widthCh<=dense.widthCh);
});
test('long tokens alone trigger denser layout',()=>{
 assert.notEqual(make({line:{...line,text:'Überwältigungstechnologiesystemfachwort'}}).density,'normal');
});
test('crowded multi-avatar stage narrows safe readable caption',()=>{
 assert(make({avatarCount:4}).widthCh<make({avatarCount:1}).widthCh);
 assert(make({avatarCount:4}).plateOpacity>=make({avatarCount:1}).plateOpacity);
 assert(make({avatarCount:4}).wordAccentGain<make({avatarCount:1}).wordAccentGain);
});
test('regular display does not unnecessarily shrink width',()=>{
 assert(make({immersive:false}).widthCh>=make({immersive:true}).widthCh);
});
test('user motion intensity is bounded and zero disables glow',()=>{
 assert.equal(make({intensity:0}).wordAccentGain,0);
 assert.equal(make({intensity:Infinity}).wordAccentGain,0);
 assert(make({intensity:100}).wordAccentGain<=.68);
});
test('paused playback never adds glow or hook',()=>{
 const p=make({playing:false,sectionCue:'hook'});assert.equal(p.mode,'quiet');assert.equal(p.wordAccentGain,0);
});
test('reduced motion has no hook or word pulse',()=>{
 const p=make({reducedMotion:true,sectionCue:'hook'});assert.equal(p.wordAccentGain,0);assert.equal(p.hookAccent,0);
});
test('plain or line-synced lyrics never claim verified words',()=>{
 for(const opt of [{synchronized:false},{line:{...line,words:undefined}},
 {line:{...line,words:[{...words[0],endMs:1500},words[1]]}},
 {line:{...line,words:[{...words[0],startMs:NaN}]}}]){
  const p=make(opt);assert.equal(p.verifiedWords,false);
  assert.equal(word({line:opt.line??line,wordIndex:0,progressMs:1140,playing:true,reducedMotion:false,plan:p}),null);
 }
});
test('unknown end time does not fabricate final-word timing',()=>{
 const unfinished={...line,endMs:null,words:[{text:'Solo',startMs:1000,endMs:null}]};
 const p=make({line:unfinished,nextLineStart:undefined,progressMs:1100});
 assert(p.verifiedWords);
 assert.equal(word({line:unfinished,wordIndex:0,progressMs:1100,playing:true,reducedMotion:false,plan:p}),null);
});
test('verified timestamped word accent peaks only during that word',()=>{
 const p=make();const sample=t=>word({line,wordIndex:2,progressMs:t,playing:true,reducedMotion:false,plan:p});
 assert.equal(sample(1370).accent,0);assert(sample(1490).accent>0);assert.equal(sample(1620).accent,0);
});
test('word pulse is deterministic, seek-safe and never changes karaoke fill',()=>{
 const p=make();for(const ms of [0,1000,1234,1420,1450,1890,2999]){
  const before=lyricPlaybackFractionV477(ms,words[2].startMs,words[2].endMs);
  const one=word({line,wordIndex:2,progressMs:ms,playing:true,reducedMotion:false,plan:p});
  const two=word({line,wordIndex:2,progressMs:ms,playing:true,reducedMotion:false,plan:p});
  assert.deepEqual(one,two);assert(before===lyricPlaybackFractionV477(ms,words[2].startMs,words[2].endMs));
 }
});
test('word accent cannot exceed visual strength',()=>{
 const p=make({intensity:1});for(let ms=900;ms<2200;ms+=5){
  for(let i=0;i<4;i++){const w=word({line,wordIndex:i,progressMs:ms,playing:true,reducedMotion:false,plan:p});
   assert(w&&w.accent>=0&&w.accent<=p.wordAccentGain);}
 }
});
test('out-of-range words never receive accents',()=>{
 const p=make();for(const i of [-1,4,99,NaN,.5]) assert.equal(word({line,wordIndex:i,progressMs:1400,playing:true,reducedMotion:false,plan:p}),null);
});
test('malformed progress cannot create a glow',()=>{
 const p=make();for(const ms of [NaN,-Infinity,Infinity]){
  const result=word({line,wordIndex:1,progressMs:ms,playing:true,reducedMotion:false,plan:p});
  assert.equal(result,null);
 }
});
test('pause/reduced controls word accents even with a precomputed active plan',()=>{
 const p=make();for(const change of [{playing:false,reducedMotion:false},{playing:true,reducedMotion:true}])
 assert.equal(word({line,wordIndex:2,progressMs:1500,plan:p,...change}),null);
});
test('no new audio, timers, camera, layout or text modifications',()=>{
 const source=fs.readFileSync('components/visualizer/beautifulLyricsExperienceV598.ts','utf8');
 for(const token of ['setInterval','setTimeout','requestAnimationFrame','useFrame','Math.random','fetch(','navigator.','document.','new Audio','innerHTML'])assert(!source.includes(token));
});
test('normal and immersive lyrics use the same V598 actual component',()=>{
 const code=fs.readFileSync('components/KineticLyrics.tsx','utf8');
 const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
 assert(code.includes('planBeautifulLyricsExperienceV598('));
 assert(code.includes('planBeautifulLyricsWordV598('));
 assert(code.includes('v598-beautiful-lyrics'));assert(code.includes('--v598-word-accent'));
 assert(stage.includes('sectionCueV598={directedSection === "hook" ? "hook" : "unknown"}'));
 assert(code.includes('"--word-fill": `${(shownAmountV382 * 100).toFixed(1)}%`'));
});
test('CSS text legibility, device width and reduced-motion protections',()=>{
 const css=fs.readFileSync('app/globals.css','utf8');
 for(const token of ['.lyrics.v598-beautiful-lyrics .v598-active-line', 'text-wrap:balance', 'font-kerning:normal',
  '--v598-word-accent','@media (max-width:1024px)','prefers-reduced-motion:reduce','text-shadow:none!important']) assert(css.includes(token));
});
test('20,000 simulated word positions remain bounded and finite',()=>{
 const p=make({sectionCue:'hook'});for(let i=0;i<20000;i++){
  const t=800+(i*131)%1900;const idx=i%words.length;
  const result=word({line,wordIndex:idx,progressMs:t,playing:true,reducedMotion:false,plan:p});
  assert(result&&Number.isFinite(result.accent)&&result.accent>=0&&result.accent<=p.wordAccentGain);
 }
});
test('original lyric word objects and timing are never mutated',()=>{
 const before=JSON.stringify(line);const p=make({sectionCue:'hook'});
 word({line,wordIndex:0,progressMs:1100,playing:true,reducedMotion:false,plan:p});
 assert.equal(JSON.stringify(line),before);assert(verifiedLyricWordsV477(line,2100));
});
console.log(`PASS V598: ${groups} test groups, 20,000 simulated timed word samples, UI/stage integration`);
