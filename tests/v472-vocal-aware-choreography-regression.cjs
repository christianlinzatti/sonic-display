require('./helpers/threeAvatarSourcesV492.cjs').install();
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveVocalDanceAccentV472:cue}=load('components/visualizer/vocalAwareChoreographyV472');
const lyrics={provider:'spotify',synced:true,plainText:null,lines:[
  {startMs:1000,endMs:2400,text:'Komm jetzt! WIR sind da',words:[
    {startMs:1000,endMs:1200,text:'Komm'}, {startMs:1280,endMs:1510,text:'jetzt!'},
    {startMs:1590,endMs:1830,text:'WIR'}, {startMs:1950,endMs:2350,text:'sind da'}]},
  {startMs:2700,endMs:3900,text:'Hier geht es weiter',words:[]},
  {startMs:4500,endMs:5500,text:'[Instrumental]',words:[]},
]};
const base={lyrics,rap:true,playing:true,reducedMotion:false,progressMs:1010,section:'verse',slot:0};
const w=cue(base);
assert(w.active && w.source==='word' && w.confidence==='lyrics-word' && w.arms>0 && w.arms<=.11);
assert(cue({...base,progressMs:1420}).active,'stressed word has a timed cue');
const noPunctuation=structuredClone(lyrics);noPunctuation.lines[0].words[1].text='jetzt';
const emphatic=cue({...base,progressMs:1290,lyrics});
const understated=cue({...base,progressMs:1290,lyrics:noPunctuation});
assert(emphatic.arms>understated.arms,'punctuation can gently emphasize, never pretend measured prosody');
assert.equal(cue({...base,progressMs:2480}).active,false,'vocal gap is not an invented cue');
assert.equal(cue({...base,progressMs:4600}).active,false,'instrumental label is not singing');
assert.equal(cue({...base,progressMs:3100}).confidence,'lyrics-line','line-only has no invented word timestamps');
assert(cue({...base,progressMs:1010,section:'hook'}).arms>w.arms,'hook carries more energy');
assert.equal(cue({...base,rap:false}).active,false,'pop/rock choreography is not altered');
assert.equal(cue({...base,lyrics:{...lyrics,synced:false}}).active,false);
assert.equal(cue({...base,playing:false}).arms,0);
assert.equal(cue({...base,reducedMotion:true}).arms,0);
assert.equal(cue({...base,bodyEnabled:false}).arms,0);
assert.equal(cue({...base,gesturesEnabled:false}).arms,0);
assert(cue({...base,authored:true}).arms<w.arms*.35,'authored motion priority');
const casting={active:true,role:'feature',lineIndex:0,leadSlot:1,singingSlots:[1],startMs:1000,endMs:2400,handoffFrom:0,phase:.2,source:'word-timed',count:2};
const lead=cue({...base,slot:1,casting});
const backdrop=cue({...base,slot:0,casting});
assert.equal(lead.role,'feature');assert.equal(backdrop.role,'background');
assert(lead.arms>backdrop.arms*5,'assigned feature gesticulates more than its partner');
assert.equal(cue({...base,casting:{...casting,lineIndex:1}}).role,'general','stale casting is ignored');
const duet={active:true,style:'duet',lineIndex:0,leadSlot:0,partnerSlot:1,singingSlots:[0,1],handoffFrom:null,phase:1,emphasis:.5,startMs:1000,endMs:2400,source:'word-timed',count:2};
assert.equal(cue({...base,slot:1,casting:duet}).role,'duet');
const gltf=fs.readFileSync('components/visualizer/useGltfVocalMotionV492.ts','utf8');
const procedural=fs.readFileSync('components/visualizer/ProceduralDancerAvatarV492.tsx','utf8');
assert(gltf.includes('resolveVocalDanceAccentV472({')&&gltf.includes('musicMotionV468.updateMotion(')&&gltf.includes('coordinateRapDanceV526(synchronizedRapV516')&&gltf.includes('correctAutomaticAccentV515(wordDanceV567')&&gltf.includes('refineNaturalConcertPerformanceV586(naturalBodyV564.accent'), 'GLB keeps authored V472 cue, passed through V515 auto-only additive limiter');
assert(gltf.includes('rapDuetTrackIdV416')&&gltf.includes('manualVocalTrackIdV385'), 'authored singer cues are track bound');
assert(procedural.includes('wordDanceV567.arms*Math.max(0,wordDanceV567.side)')&&procedural.includes('coordinateWordDanceV567(concertV586.accent'), 'procedural fallback gets body cue');
assert(fs.readFileSync('hooks/useAudioMotionEngine.ts','utf8').includes('vocalSmoothed'),'additive overlay releases smoothly');
console.log('PASS V472: synced lyric windows, word vs line, hook, no false singer claims, authored cast + duet, pause, reduced motion, manual priority and GLB/procedural wiring');
