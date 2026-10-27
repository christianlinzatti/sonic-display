'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicLyricsV541:plan541,planCinematicWordV541:word541}=load('components/visualizer/cinematicLyricsExperienceV541');
const {planCinematicLyricsV549:plan,planCinematicWordV549:word}=load('components/visualizer/cinematicLyricsExperienceV549');
const words=['Ich','rappe','schnell','heute','und','immer','weiter','direkt'].map((text,i)=>({text,startMs:1000+i*160,endMs:1130+i*160}));
const line={text:words.map(w=>w.text).join(' '),startMs:1000,endMs:2450,words};
const p0={line,nextLineStart:2650,synchronized:true,playing:true,reducedMotion:false,layout:'immersive',avatarCount:4,tier:'high'};
const base=plan541(p0);
const cue={active:true,trackId:'confirmed-track',cueStartMs:900,cueEndMs:2500,count:4,focus:'handoff',leadSlot:2,
  singingSlots:[2],handoffFrom:0,strength:.65,lyricMotionGain:.9,readingBoost:1.02,plateBoost:.05};
const make=(changes={})=>plan({base,line,progressMs:1100,playing:true,reducedMotion:false,avatarCount:4,tier:'high',scene:cue,...changes});
const actual=make();
assert.equal(actual.singerCue,'handoff');
assert.match(actual.singerLabel,/Avatar 1.*Avatar 3/);
assert(actual.handoffEmphasis>0&&actual.handoffEmphasis<=.13);
assert(actual.wordMotionGain<=base.wordMotionGain);
assert(actual.wordGlowGain<1&&actual.plateOpacity>=base.backdropOpacity);
assert(actual.readingScale>=1&&actual.readingScale<=1.02);
assert(actual.max3DWordMeshes<=base.max3DWordMeshes);
assert.equal(make({progressMs:1800}).singerCue,'solo');
const ensemble={...cue,focus:'ensemble',handoffFrom:null,singingSlots:[0,2,3]};
const hook=make({scene:ensemble});
assert.equal(hook.singerCue,'ensemble');
assert.match(hook.singerLabel,/1 \+ 3 \+ 4/);
assert(!hook.singerLabel.includes('2 +'));
assert.equal(make({scene:{...cue,active:false}}).singerLabel,null);
assert.equal(make({scene:{...cue,trackId:''}}).singerLabel,null);
assert.equal(make({scene:{...cue,leadSlot:4}}).singerLabel,null);
assert.equal(make({scene:{...cue,singingSlots:[2,2]}}).singerLabel,null);
assert.equal(make({scene:{...cue,singingSlots:[0]}}).singerLabel,null);
assert.equal(make({scene:{...cue,count:5}}).singerLabel,null);
assert.equal(make({scene:{...cue,handoffFrom:2}}).singerLabel,null);
assert.equal(make({progressMs:2500}).singerLabel,null);
assert.equal(make({progressMs:899}).singerLabel,null);
assert.equal(make({playing:false}).singerLabel,null);
assert.equal(make({tier:'low'}).max3DWordMeshes,0);
assert.equal(make({reducedMotion:true}).wordMotionGain,0);
assert.equal(make({reducedMotion:true}).handoffEmphasis,0);
assert.equal(make({playing:false}).wordMotionGain,0);
assert.equal(make({tier:'low'}).wordGlowGain,0);
const plain=plan({...p0,line,base:plan541({...p0,synchronized:false}),progressMs:1450,scene:undefined});
assert.equal(plain.wordMotionGain,0);
const wordAt=(ms,wi=2,p=actual,l=line,b=base)=>word({line:l,nextLineStart:2650,wordIndex:wi,progressMs:ms,
 playing:true,reducedMotion:false,base:b,visual:p});
assert.equal(wordAt(1319).fill,0);
assert.equal(wordAt(1320).fill,0);
assert.equal(wordAt(1450).fill,1);
assert(Math.abs(wordAt(1385).fill-.5)<1e-10);
assert.equal(wordAt(1385).fill,word541({line,nextLineStart:2650,wordIndex:2,progressMs:1385,
 playing:true,reducedMotion:false,plan:base}).fill);
assert(wordAt(1385).glow<=.42&&wordAt(1385).motion<=.28);
const noEnd={text:'Letztes Wort',startMs:0,words:[{text:'Letztes',startMs:100,endMs:null},{text:'Wort',startMs:250,endMs:null}]};
const noEndBase=plan541({...p0,line:noEnd,nextLineStart:undefined});
assert.equal(word({line:noEnd,wordIndex:1,progressMs:280,playing:true,reducedMotion:false,base:noEndBase,visual:actual}),null);
assert.equal(wordAt(NaN),null);
assert.equal(wordAt(1360,-1),null);
let frames=0;
for (const gap of [112,155,195,220,260,360]) for(const cast of [1,2,3,4]) for(const tier of ['low','balanced','high']){
 const timed=words.map((w,i)=>({...w,startMs:1000+i*gap,endMs:1000+i*gap+Math.min(95,gap-5)}));
 const lyric={text:timed.map(w=>w.text).join(' '),startMs:1000,endMs:1000+timed.length*gap+100,words:timed};
 const b=plan541({...p0,line:lyric,avatarCount:cast,tier,nextLineStart:lyric.endMs+90});
 for(let t=985;t<lyric.endMs+90;t+=13){
  const scene=t>=1000&&t<lyric.endMs?ensemble:undefined;
  const p=plan({base:b,line:lyric,progressMs:t,playing:true,reducedMotion:false,avatarCount:cast,tier,scene});
  assert(Number.isFinite(p.plateOpacity)&&p.plateOpacity>=0&&p.plateOpacity<=.98);
  assert(p.wordMotionGain>=0&&p.wordMotionGain<=b.wordMotionGain);
  assert(p.max3DWordMeshes<=b.max3DWordMeshes);
  for(let wi=0;wi<timed.length;wi++){
   const now=word({line:lyric,nextLineStart:lyric.endMs+90,wordIndex:wi,progressMs:t,playing:true,reducedMotion:false,base:b,visual:p});
   const ref=word541({line:lyric,nextLineStart:lyric.endMs+90,wordIndex:wi,progressMs:t,playing:true,reducedMotion:false,plan:b});
   assert(now&&ref&&now.fill===ref.fill,'timing must not drift');
   assert(now.focus>=0&&now.focus<=1&&now.motion>=0&&now.motion<=.28);
   assert(now.glow>=0&&now.glow<=.42);
   frames++;
  }
 }
}
const dom=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const gpu=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
for(const key of ['planCinematicLyricsV549','planCinematicWordV549','activePlanV549?.singerLabel','wordV549?.fill','v549.wordMotionGain','v549-active-line'])assert(dom.includes(key),'DOM missing '+key);
for(const key of ['planCinematicLyricsV549','planCinematicWordV549','activeCaptionV549?.plateOpacity','visualV549.max3DWordMeshes','wordV549?.fill'])assert(gpu.includes(key),'3D missing '+key);
assert(css.includes('.lyrics.v549-cinematic-lyrics')&&css.includes('prefers-reduced-motion:reduce'));
assert(!css.includes('transition:width .1s'),'karaoke fill must never be visually delayed');
const src=fs.readFileSync('components/visualizer/cinematicLyricsExperienceV549.ts','utf8');
for(const disallowed of ['Math.random(', 'setInterval(', 'setTimeout(', 'requestAnimationFrame(', 'Date.now(', 'document.', 'window.'])assert(!src.includes(disallowed));
const pkg=require('../package.json');
assert(Number(pkg.version.match(/-v(\d+)$/)?.[1]||0)>=549,'V549 must remain active in future releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v549 && npm run test:v549:types'));
console.log(`PASS V549 cinematic lyrics: ${frames} deterministic timestamps, verified cues, UI/3D and low-GPU safeguards`);
