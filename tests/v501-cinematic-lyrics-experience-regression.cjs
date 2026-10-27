'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicLyricsExperienceV501:plan,lyricWordAccentV501:word}=load('components/visualizer/cinematicLyricsExperienceV501');
const {verifiedLyricWordsV477:verified,lyricPlaybackFractionV477:fill}=load('components/visualizer/beautifulLyricsV477');
const line={text:'Rap Wort für Wort mit exaktem Timing',startMs:1000,endMs:3500,words:[
 {text:'Rap',startMs:1000,endMs:1280},{text:'Wort',startMs:1290,endMs:1640},
 {text:'für',startMs:1690,endMs:1920},{text:'Wort',startMs:1960,endMs:2320},
 {text:'mit',startMs:2350,endMs:2600},{text:'exaktem',startMs:2680,endMs:3100},
 {text:'Timing',startMs:3130,endMs:3450},
]};
const base={line,nextLineStart:3600,progressMs:1800,synchronized:true,playing:true,
  reducedMotion:false,layout:'immersive',avatarCount:2,userScale:1};
const standard=plan(base);
assert.equal(standard.timingMode,'verified-word');
assert.equal(standard.cast,2);
assert(standard.reveal>=.82&&standard.reveal<=1);
assert(standard.wordMotion>0);
assert(standard.plateOpacity>=.74);
assert.equal(plan({...base,playing:false}).reveal,1,'paused text stays fully legible');
assert.equal(plan({...base,playing:false}).wordMotion,0);
assert.equal(plan({...base,reducedMotion:true}).reveal,1);
assert.equal(plan({...base,reducedMotion:true}).lineOffsetPx,0);
assert.equal(plan({...base,synchronized:false}).timingMode,'static');
assert.equal(plan({...base,synchronized:false}).wordMotion,0);
const lineOnly={...line,words:undefined};
assert.equal(plan({...base,line:lineOnly}).timingMode,'line-progress');
assert.equal(plan({...base,line:lineOnly}).wordMotion,0,'no invented word onsets');
assert.equal(plan({...base,line:{...line,words:[{text:'invalid',startMs:3601}]}}).wordMotion,0);
assert.equal(plan({...base,progressMs:NaN}).wordMotion,0);
assert.equal(plan({...base,progressMs:Infinity}).reveal,1);
assert.equal(plan({...base,avatarCount:NaN}).cast,1);
assert.equal(plan({...base,avatarCount:300}).cast,4);
const crowded=plan({...base,avatarCount:4,line:{...line,text:'Sehr '.repeat(30)},layout:'stage-3d'});
assert(crowded.max3DWidth<standard.max3DWidth);
assert(crowded.fontScale<=standard.fontScale);
assert(crowded.plateOpacity>=standard.plateOpacity);
assert.equal(plan({...base,layout:'standard',avatarCount:4}).fontScale,1);
const wordBase={startMs:1290,endMs:1640,progressMs:1380,verifiedWordTiming:true,playing:true,reducedMotion:false};
assert(word(wordBase)>0);
assert.equal(word({...wordBase,verifiedWordTiming:false}),0);
assert.equal(word({...wordBase,playing:false}),0);
assert.equal(word({...wordBase,reducedMotion:true}),0);
assert.equal(word({...wordBase,progressMs:1200}),0);
assert.equal(word({...wordBase,progressMs:1640}),0);
assert.equal(word({...wordBase,endMs:1000}),0);
assert.equal(word({...wordBase,progressMs:Infinity}),0);
assert(verified(line));
assert.equal(fill(1465,1290,1640),.5,'V501 must not change genuine fill');
const reference=plan({...base,progressMs:1800});
assert.deepEqual(reference,plan({...base,progressMs:1800}));
assert.deepEqual(plan({...base,playing:false,progressMs:1800}),plan({...base,playing:false,progressMs:1800}));
for(let i=0;i<15000;i++) {
  const progressMs=500+i*2;
  const v=plan({...base,progressMs,avatarCount:1+i%4,layout:i%2?'immersive':'stage-3d'});
  assert(Number.isFinite(v.reveal)&&v.reveal>=.82&&v.reveal<=1);
  assert(Number.isFinite(v.max3DWidth)&&v.max3DWidth>0&&v.max3DWidth<=2.3);
  assert(Number.isFinite(v.plateOpacity)&&v.plateOpacity>=0&&v.plateOpacity<=1);
  assert(v.wordMotion>=0&&v.wordMotion<=.65);
  assert(word({...wordBase,progressMs})>=0&&word({...wordBase,progressMs})<=1);
}
const kinetic=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const scene=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
assert(kinetic.includes('planCinematicLyricsExperienceV501('));
assert(kinetic.includes('lyricWordAccentV501('));
assert(kinetic.includes('v501-active-line')&&kinetic.includes('v501-cast-'));
assert(kinetic.includes('wordsEnabled && wordTimed ? words.map'),'real word timing guard stays');
assert(kinetic.includes('v477-line-progress-text'),'line-only reading stays separate');
assert(scene.includes('planCinematicLyricsExperienceV501('));
assert(scene.includes('visualV525.max3DWidth'), 'V525 stage text must retain a bounded 3D width');
assert(fs.readFileSync('components/visualizer/cinematicLyricsExperienceV525.ts','utf8').includes('max3DWidth: args.base.max3DWidth'), 'V501 3D clearance remains authoritative');
assert(scene.includes('lyricWordAccentV501('));
assert(scene.includes('shouldHighlight = scene.wordHighlight && visualV477.timingMode === "verified-word"'));
assert(scene.includes('tier === "low"'), 'Raspberry Pi cost guard remains');
assert(css.includes('.v501-active-line::before')&&css.includes('prefers-reduced-motion:reduce'));
const moduleText=fs.readFileSync('components/visualizer/cinematicLyricsExperienceV501.ts','utf8');
assert(!/setTimeout|requestAnimationFrame|Math\.random|Date\.now|AudioContext|useFrame/.test(moduleText));
assert.match(require('../package.json').version,/^0\.1\.0-v(\d+)$/);
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=501,'V501 remains part of every newer release');
console.log('PASS V501: timestamp-accurate accents, pause/seek, missing timing, 4-avatar/3D safe layout, 15k deterministic plans, CSS, wiring');
