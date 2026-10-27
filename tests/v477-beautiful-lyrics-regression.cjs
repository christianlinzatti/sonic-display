'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planBeautifulLyricsV477:plan,verifiedLyricWordsV477:verified,
  lyricPlaybackFractionV477:fraction}=load('components/visualizer/beautifulLyricsV477');
const line={text:'In den Straßen steht die Nacht',startMs:1000,endMs:3600};
const base={line,synchronized:true,playing:true,reducedMotion:false,layout:'standard',avatarCount:1,userScale:1};
const normal=plan(base);
assert.equal(normal.visibleLineCount,3);
assert.equal(normal.timingMode,'line-progress');
assert.equal(normal.fontScale,1);
assert(normal.motionScale>0);
assert.equal(plan({...base,synchronized:false}).timingMode,'static');
const withWords={...line,words:[
 {text:'In',startMs:1000,endMs:1300},
 {text:'den',startMs:1300,endMs:1550},
 {text:'Straßen',startMs:1550,endMs:1950},
 {text:'steht',startMs:2050,endMs:2300},
 {text:'die',startMs:2300,endMs:2550},
 {text:'Nacht',startMs:2600,endMs:3250}
]};
assert(verified(withWords));
assert.equal(plan({...base,line:withWords}).timingMode,'verified-word');
for(const corrupted of [
 [{text:'A',startMs:1100,endMs:1420},{text:'B',startMs:1400,endMs:1700}],
 [{text:'A',startMs:1600},{text:'B',startMs:1400}],
 [{text:'A',startMs:3600}],
 [{text:'A',startMs:1100,endMs:Infinity}],
 [{text:'A',startMs:1100,endMs:1050}],
 [{text:'',startMs:1300}],
]) assert(!verified({...line,words:corrupted}),JSON.stringify(corrupted));
assert.equal(plan({...base,line:{...line,words:[{text:'Invalid',startMs:3601}]}}).timingMode,'line-progress');
assert.equal(fraction(500,1000,2000),0);
assert.equal(fraction(1500,1000,2000),.5);
assert.equal(fraction(2500,1000,2000),1);
assert.equal(fraction(1500,2000,1000),0);
assert.equal(fraction(Infinity,1000,2000),0);
assert.equal(fraction(1550,1000,2000),.55);
assert.equal(fraction(1400,1000,2000),.4,'seeking backward is deterministic');
const rapid={...line,text:Array(24).fill('Deutschrap').join(' '),endMs:3600};
const rapid4=plan({...base,line:rapid,layout:'immersive',avatarCount:4});
assert.equal(rapid4.visibleLineCount,1);
assert(rapid4.fontScale<1);
assert(rapid4.motionScale<normal.motionScale);
assert.equal(rapid4.entranceDelayMs,0);
assert(!rapid4.allowWordMeshes);
assert.equal(plan({...base,line:rapid,layout:'standard',avatarCount:4}).visibleLineCount,3);
assert.equal(plan({...base,line:rapid,layout:'immersive',synchronized:false,avatarCount:4}).visibleLineCount,3);
assert.equal(plan({...base,line:withWords,layout:'stage-3d',avatarCount:1}).allowWordMeshes,true);
assert.equal(plan({...base,line:withWords,layout:'stage-3d',avatarCount:4}).timingMode,'verified-word');
assert.equal(plan({...base,playing:false}).motionScale,0);
assert.equal(plan({...base,reducedMotion:true}).entranceDelayMs,0);
for (let i=0;i<5000;i++) {
 const n=i%48+1;
 const l={text:Array(n).fill('Wort').join(' '),startMs:1000,endMs:1000+(i%80+2)*100};
 const p=plan({...base,line:l,layout:i%2===0?'immersive':'stage-3d',avatarCount:i%4+1});
 assert(Number.isFinite(p.fontScale)&&p.fontScale>=.74&&p.fontScale<=1);
 assert(Number.isFinite(p.motionScale)&&p.motionScale>=0&&p.motionScale<=1);
 assert([1,3].includes(p.visibleLineCount));
 assert(['line-progress','verified-word','static'].includes(p.timingMode));
}
const kinetic=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const scene=fs.readFileSync('components/visualizer/Lyrics3DScene.tsx','utf8');
const registry=fs.readFileSync('components/visualizer/registry.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
assert(kinetic.includes('planBeautifulLyricsV477('));
assert(kinetic.includes('lyricPlaybackFractionV477('));
assert(kinetic.includes('wordsEnabled && wordTimed ? words.map'));
assert(kinetic.includes('v477-line-progress-text'));
assert(kinetic.includes('activePlanV477?.visibleLineCount === 1'));
assert(stage.includes('avatarCountV477:performerCountV440'));
assert(/avatarCountV477=\{performerCountV440\}[^>]*\simmersive\s*\/>/.test(stage),'stage still forwards avatar count to immersive lyrics');
assert(registry.includes('avatarCountV477?:number'));
assert(scene.includes('visualV477.allowWordMeshes')&&scene.includes('visualV477.max3DWidth'));
assert(scene.includes('visualV477.timingMode === "verified-word"'));
assert(scene.includes('tier === "low"'));
assert(css.includes('.v477-line-progress-text')&&css.includes('prefers-reduced-motion:reduce'));
assert(!/Math\.random|Date\.now|setTimeout|AudioContext/.test(fs.readFileSync('components/visualizer/beautifulLyricsV477.ts','utf8')));
assert.match(require('../package.json').version,/^0\.1\.0-v(\d+)$/);
assert(Number(require('../package.json').version.match(/v(\d+)$/)?.[1])>=477);
console.log('PASS V477: verified timestamps vs line-sync, seek/pause/reduced motion, multi-avatar typography, 3D mesh protection, 5k deterministic plans');
