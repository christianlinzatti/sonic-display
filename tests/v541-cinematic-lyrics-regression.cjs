'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicLyricsV541:plan,planCinematicWordV541:word}=load('components/visualizer/cinematicLyricsExperienceV541');
const lyrics=['Ich','rappe','auf','dem','Beat','und','bleibe','dabei'].map((text,i)=>({text,startMs:1000+i*175,endMs:1150+i*175}));
const fast={text:lyrics.map(w=>w.text).join(' '),startMs:1000,endMs:2500,words:lyrics};
const opts={line:fast,nextLineStart:2700,synchronized:true,playing:true,reducedMotion:false,layout:'immersive',avatarCount:4,tier:'high'};
const p=plan(opts);
assert.equal(p.density,'rapid');assert(p.verifiedWords);assert(p.wordMotionGain>0&&p.wordMotionGain<.3);
assert(p.backdropOpacity>=.9&&p.backdropOpacity<=1);assert(p.readingScale>=1&&p.readingScale<=1.05);
assert(p.max3DWordMeshes>=8&&p.max3DWordMeshes<=26);
const at=(ms,index=2,o=opts)=>word({line:o.line,nextLineStart:o.nextLineStart,wordIndex:index,
  progressMs:ms,playing:o.playing,reducedMotion:o.reducedMotion,plan:plan(o)});
assert.equal(at(1300).fill,0);
assert.equal(at(1350).fill,0);
assert(Math.abs(at(1437.5).fill-.5833333333)<1e-5);
assert.equal(at(1500).fill,1);
assert(at(1437.5).focus>0&&at(1437.5).glow<=.22);
assert.equal(at(1437.5,2,{...opts,reducedMotion:true}).focus,0);
assert.equal(at(1437.5,2,{...opts,playing:false}).focus,0);
assert.equal(plan({...opts,reducedMotion:true}).wordMotionGain,0);
assert.equal(plan({...opts,playing:false}).wordMotionGain,0);
assert.equal(plan({...opts,tier:'low'}).max3DWordMeshes,0);
assert(plan({...opts,tier:'balanced'}).max3DWordMeshes<=14);
assert.equal(plan({...opts,layout:'standard',avatarCount:1}).readingScale,1);
assert(!plan({...opts,synchronized:false}).verifiedWords);
assert.equal(plan({...opts,synchronized:false}).wordMotionGain,0);
assert.equal(plan({...opts,line:{...fast,words:undefined}}).max3DWordMeshes,0);
assert.equal(plan({...opts,line:{...fast,words:[{text:'test',startMs:NaN}]}}).verifiedWords,false);
assert.equal(plan({...opts,line:{...fast,words:lyrics.slice().reverse()}}).verifiedWords,false);
const noEnd={text:'Letztes Wort',startMs:0,words:[{text:'Letztes',startMs:100},{text:'Wort',startMs:250}]};
const noEndOpts={...opts,line:noEnd,nextLineStart:undefined};
assert.equal(word({line:noEnd,wordIndex:1,progressMs:260,playing:true,reducedMotion:false,plan:plan(noEndOpts)}),null,
  'Do not invent last-word end timestamps');
assert.equal(word({line:noEnd,wordIndex:0,progressMs:170,playing:true,reducedMotion:false,plan:plan(noEndOpts)}).fill,.4666666666666667);
assert.equal(at(NaN),null);
assert.equal(at(1425,-1),null);
assert.equal(at(1425,999),null);
// Each displayed active word progresses monotonically and follows the actual marks.
let frames=0;
for(const speed of [145,175,195,225,310])for(const cast of [1,2,3,4])
for(const tier of ['low','balanced','high']) {
  const samples=lyrics.map((w,i)=>({...w,startMs:1000+i*speed,endMs:1000+i*speed+Math.min(speed-6,135)}));
  const line={text:samples.map(w=>w.text).join(' '),startMs:1000,endMs:1000+samples.length*speed+1,words:samples};
  const input={...opts,line,avatarCount:cast,tier,nextLineStart:line.endMs+100};
  const visual=plan(input);
  for(let i=0;i<samples.length;i++) {
    let last=0;
    for(let t=samples[i].startMs-40;t<=samples[i].startMs+speed+40;t+=10){
      const cue=word({line,nextLineStart:input.nextLineStart,wordIndex:i,progressMs:t,
        playing:true,reducedMotion:false,plan:visual});
      assert(cue&&cue.fill>=last-1e-12&&cue.fill>=0&&cue.fill<=1);
      assert(cue.focus>=0&&cue.focus<=1&&cue.glow>=0&&cue.glow<=.42);
      last=cue.fill;frames++;
    }
  }
}
const dom=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const gpu=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
for(const text of ['planCinematicLyricsV541','planCinematicWordV541','wordV541?.fill','v549.wordMotionGain','v541.readingScale','v541-cinematic-lyrics'])assert(dom.includes(text),`DOM missing ${text}`);
for(const text of ['planCinematicLyricsV541','planCinematicWordV541','visualV549.max3DWordMeshes','wordV541?.fill','activeCaptionV549?.plateOpacity'])assert(gpu.includes(text),`WebGL missing ${text}`);
assert(dom.includes('lyricPlaybackFractionV477')&&gpu.includes('lyricPlaybackFractionV477'));
assert(css.includes('v541-cinematic-lyrics')&&css.includes('prefers-reduced-motion:reduce'));
assert(gpu.includes('planCinematicLyricsV541')&&dom.includes('planCinematicLyricsV541'), 'V541 timestamp planner retained');
const source=fs.readFileSync('components/visualizer/cinematicLyricsExperienceV541.ts','utf8');
for(const banned of ['setInterval(', 'requestAnimationFrame(', 'Math.random(', 'Date.now(', 'document.', 'window.', 'new Audio('])assert(!source.includes(banned));
assert(Number(require('../package.json').version.match(/-v(\d+)$/)?.[1]||0)>=541);
assert(require('../package.json').scripts['build:preflight'].includes('npm run test:v541 && npm run test:v541:types'));
console.log(`PASS V541 cinematic lyrics: ${frames} real-timestamp word samples, DOM/WebGL wiring, reduced-motion and 10-inch contrast safeguards`);
