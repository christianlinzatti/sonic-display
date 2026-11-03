'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCinematicLyricCueV873:planLine,planCinematicProjectionV873:planProjection}=
 load('components/visualizer/cinematicLyricsPolishV873');
const {planLyricsProjectionV813:projection813}=load('components/visualizer/lyricsProjectionV813');
const {normalizeConcertFxV810:normalize,planConcertFxV810:planFx}=load('components/visualizer/concertFxStudioV810');
let passed=0;
function test(name,fn){try{fn();++passed;}catch(error){error.message=`V873 ${name}: ${error.message}`;throw error;}}
const fastLine={startMs:1000,endMs:2500,text:'Heute wird es laut, wir drehen alle auf!',words:[
 {text:'Heute',startMs:1000,endMs:1130},{text:'wird',startMs:1130,endMs:1260},
 {text:'es',startMs:1260,endMs:1370},{text:'laut,',startMs:1370,endMs:1580},
 {text:'wir',startMs:1580,endMs:1710},{text:'drehen',startMs:1710,endMs:1910},
 {text:'alle',startMs:1910,endMs:2140},{text:'auf!',startMs:2140,endMs:2500}]};
const slowLine={startMs:1000,endMs:3000,text:'Wir bleiben hier',words:[
 {text:'Wir',startMs:1000,endMs:1600},{text:'bleiben',startMs:1600,endMs:2400},
 {text:'hier',startMs:2400,endMs:3000}]};
function lyric(opts={}){return planLine({line:fastLine,nextLineStart:2700,progressMs:1700,
 playing:true,synchronized:true,reducedMotion:false,immersive:true,castCount:2,
 wordHighlight:true,hookConfirmed:false,cameraFocus:false,existingPlateOpacity:.45,
 intensity:.7,...opts});}
const fast=lyric();
test('fast words are verified',()=>assert.equal(fast.verifiedWords,true));
test('fast rap mode',()=>assert.equal(fast.mode,'fast-rap'));
test('fast rap motion reduced',()=>assert(fast.motionGain<1&&fast.motionGain>0));
test('transition follows real word intervals',()=>assert(fast.wordTransitionMs>=45&&fast.wordTransitionMs<=175));
test('plate boosts against FX',()=>assert(fast.plateOpacity>.45));
test('base input unchanged',()=>assert.equal(fastLine.words[0].endMs,1130));
test('deterministic at same playback position',()=>assert.deepEqual(lyric(),fast));
test('reduced motion disables animation',()=>{const r=lyric({reducedMotion:true});assert.equal(r.motionGain,0);assert.equal(r.wordTransitionMs,0);});
test('not playing disables polish',()=>assert(!lyric({playing:false}).active));
test('word highlighting off is respected',()=>{const r=lyric({wordHighlight:false});assert.equal(r.verifiedWords,false);assert.equal(r.wordTransitionMs,0);});
test('unsynced text does not fake word timings',()=>{const r=lyric({synchronized:false});assert.equal(r.verifiedWords,false);assert.equal(r.wordTransitionMs,0);});
test('no words does not generate words',()=>{const r=lyric({line:{...fastLine,words:undefined}});assert.equal(r.verifiedWords,false);});
test('invalid word end cannot animate',()=>{const r=lyric({line:{...fastLine,words:[{text:'W',startMs:1300,endMs:null}]}});assert.equal(r.verifiedWords,false);});
test('overlapping line boundary invalidates word set',()=>{const r=lyric({nextLineStart:1500});assert.equal(r.verifiedWords,false);});
test('pause cannot be bypassed by hook',()=>assert.equal(lyric({playing:false,hookConfirmed:true}).mode,'off'));
test('not before start',()=>assert(!lyric({progressMs:999}).active));
test('not at end',()=>assert(!lyric({progressMs:2500}).active));
test('not after end',()=>assert(!lyric({progressMs:3500}).active));
test('invalid clock',()=>assert(!lyric({progressMs:Infinity}).active));
test('negative clock',()=>assert(!lyric({progressMs:-100}).active));
test('missing line',()=>assert(!lyric({line:null}).active));
test('blank line',()=>assert(!lyric({line:{...fastLine,text:' '}}).active));
test('invalid lyric timestamps',()=>assert(!lyric({line:{...fastLine,startMs:NaN}}).active));
test('empty cast rejected',()=>assert(!lyric({castCount:0}).active));
test('invalid cast rejected',()=>assert(!lyric({castCount:NaN}).active));
test('hook uses confirmed section only',()=>assert.equal(lyric({line:slowLine,hookConfirmed:true}).mode,'hook'));
test('unconfirmed hook remains readable',()=>assert.equal(lyric({line:slowLine,hookConfirmed:false}).mode,'readable'));
test('portrait treated as readability, not camera change',()=>assert.equal(lyric({cameraFocus:true}).mode,'portrait'));
test('portrait plate at least standard',()=>assert(lyric({cameraFocus:true}).plateOpacity>=fast.plateOpacity));
test('additional cast dampens motion',()=>assert(lyric({castCount:4}).motionGain<fast.motionGain));
test('long lines improve plate',()=>assert(lyric({line:{...fastLine,text:'Eine sehr lange Rap-Zeile '+fastLine.text.repeat(3)}}).plateOpacity>=fast.plateOpacity));
test('respects existing greater plate',()=>assert(lyric({existingPlateOpacity:.98}).plateOpacity>=.98));
test('negative existing plate is clamped',()=>assert(lyric({existingPlateOpacity:-2}).plateOpacity>=0));
test('NaN animation intensity is bounded',()=>{const r=lyric({intensity:NaN});assert(Number.isFinite(r.plateOpacity));});
test('non-immersive text still works',()=>assert(lyric({immersive:false}).active));
for(const cast of [1,2,3,4,5,6,7,8])for(const progress of [1000,1120,1250,1499,1800,2100,2400]){
 test(`cast ${cast} clock ${progress}: bounded and seek-stable`,()=>{
  const a=lyric({castCount:cast,progressMs:progress});
  assert.deepEqual(a,lyric({castCount:cast,progressMs:progress}));
  assert(a.motionGain>=0&&a.motionGain<=1);
  assert(a.plateOpacity>=0&&a.plateOpacity<=1);
  assert(a.wordTransitionMs>=0&&a.wordTransitionMs<=175);
 });
}
const settings=normalize({enabled:true,quality:'ultra',intensity:100,lyricsProjection:true,
 cinematicLyricsV873:true,cinematicLyricsStrengthV873:70,hookProjectionSizeV873:90});
const fx=planFx({settings,genre:'rap',section:'hook',progressMs:1800,startMs:0,endMs:10000,
 active:true,verified:true,playing:true,reactive:true,reducedMotion:false,authored:false,
 blackout:false,lyricsProtected:false,vocalFocus:false,groupCount:2,tier:'high',
 energy:.85,kick:.85,bass:.7,mids:.65,highs:.6,ledBudget:1,laserBudget:1});
const lyrics={synced:true,provider:'spotify',plainText:null,lines:[fastLine]};
const base=projection813({fx,settings,lyrics,progressMs:1800,lyricsVisible:true,verifiedSong:true,groupCount:2});
function projection(opts={}){return planProjection({base,settings,fx,playing:true,
 reducedMotion:false,lyricsProtected:false,cameraCloseup:false,manualCamera:false,groupCount:2,...opts});}
test('V813 source is active',()=>assert(base.active));
test('V813 text source is preserved',()=>assert.equal(projection().cue.text,base.text));
test('V813 source is word',()=>assert.equal(projection().cue.source,'word'));
test('projection remains exactly one cue',()=>assert.equal(typeof projection().cue,'object'));
test('wall projection may grow when verified',()=>assert(projection().scale>1));
test('projection scale bounded',()=>assert(projection().scale<=1.3));
test('projection opacity bounded',()=>assert(projection().cue.opacity<=.23));
test('base object unchanged',()=>assert.equal(projection().cue.text,base.text));
test('projection is deterministic',()=>assert.deepEqual(projection(),projection()));
test('manual camera leaves cue by reference',()=>assert.strictEqual(projection({manualCamera:true}).cue,base));
test('manual camera prevents growth',()=>assert.equal(projection({manualCamera:true}).scale,1));
test('lyrics projection toggle off preserves V813 result',()=>assert.strictEqual(projection({settings:normalize({...settings,cinematicLyricsV873:false})}).cue,base));
test('legacy V813 off remains off',()=>assert.equal(planProjection({base:{...base,active:false},settings,fx,playing:true,reducedMotion:false,lyricsProtected:false,cameraCloseup:false,manualCamera:false,groupCount:2}).reason,'off'));
test('no new cue on pause',()=>assert.equal(projection({playing:false}).cue.active,false));
test('no new cue for unverified source',()=>assert.equal(projection({fx:{...fx,reason:'unverified'}}).cue.active,false));
test('bad phase rejected',()=>assert.equal(projection({fx:{...fx,phase:NaN}}).cue.active,false));
test('invalid cast rejected',()=>assert.equal(projection({groupCount:5}).cue.active,false));
test('camera closeup dims',()=>assert(projection({cameraCloseup:true}).cue.opacity<base.opacity));
test('camera closeup does not grow',()=>assert.equal(projection({cameraCloseup:true}).scale,1));
test('protected lyrics dim',()=>assert(projection({lyricsProtected:true}).cue.opacity<base.opacity));
test('multiple singers dim',()=>assert(projection({groupCount:3}).cue.opacity<base.opacity));
test('reduced motion no extra movement',()=>assert.equal(projection({reducedMotion:true}).scale,1));
test('reduced motion keeps original cue',()=>assert.strictEqual(projection({reducedMotion:true}).cue,base));
test('do not override floor surface',()=>assert.equal(projection({base:{...base,surface:'floor'}}).scale,1));
test('no false hook scale on verse',()=>assert.equal(projection({fx:{...fx,section:'verse'}}).scale,1));
test('setting disabled does not enable V813',()=>assert.strictEqual(projection({settings:normalize({...settings,lyricsProjection:false})}).cue,base));
for(const strength of [0,10,20,30,40,50,60,70,80,90,100])for(const size of [0,25,50,75,100]){
 test(`strength ${strength}, size ${size}: stable conservative projection`,()=>{
  const s=normalize({...settings,cinematicLyricsStrengthV873:strength,hookProjectionSizeV873:size});
  const out=projection({settings:s});
  assert(out.scale>=1&&out.scale<=1.3);
  assert(out.cue.opacity>=0&&out.cue.opacity<=.23);
  assert.equal(out.cue.text,base.text);
  assert.deepEqual(out,projection({settings:s}));
 });
}
const kinetic=fs.readFileSync('components/KineticLyrics.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/DynamicStage.tsx','utf8');
const studio=fs.readFileSync('components/visualizer/ConcertFxStudioPanelV810.tsx','utf8');
const css=fs.readFileSync('app/globals.css','utf8');
test('KineticLyrics uses the pure V873 planner',()=>assert(kinetic.includes('planCinematicLyricCueV873({line:activeLine')));
test('existing word motion is only damped',()=>assert(kinetic.includes('harmonyV606.motionGain*lyricV873.motionGain')));
test('no new lyrics overlay',()=>assert(!kinetic.includes('<V873Lyrics')));
test('stage reuses existing V813 projection',()=>assert(stage.includes('const rawLyricsCueV813=planLyricsProjectionV813')));
test('stage never allocates a V873 texture',()=>assert(!stage.includes('new CanvasTextureV873')));
test('stage scales the one existing wall',()=>assert(stage.includes('lyricsWallV813.current.scale.setScalar(cinematicProjectionV873.scale)')));
test('studio gives manual opt-out',()=>assert(studio.includes('patch({cinematicLyricsV873:e.target.checked})')));
test('studio gives camera guard',()=>assert(studio.includes('patch({lyricsCameraGuardV873:e.target.checked})')));
test('CSS reduced motion protected',()=>assert(css.includes('prefers-reduced-motion:reduce')&&css.includes('.lyrics.v873-cinematic-lyrics')));
console.log(`PASS V873: ${passed} focused cinematic lyrics/projection regressions`);
