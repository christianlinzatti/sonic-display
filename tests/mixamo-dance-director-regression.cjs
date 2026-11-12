'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const director=load('components/visualizer/mixamoMotionDirector');
const v536=load('components/visualizer/genreAwareMotionDirectorV536');
const v242=load('components/visualizer/intelligentDanceCombinationV242');
const v438=load('components/visualizer/automaticMotionIntelligenceV438');
const read=name=>fs.readFileSync(path.join(__dirname,'..',name),'utf8');

assert.equal(director.isMixamoMotion('Groove-mixamo.glb'),true);
assert.equal(director.isMixamoMotion('ordinary.glb'),false);
assert(director.mixamoGenreBias('Mixamo Rap Groove','rap','verse',.5)>
  director.mixamoGenreBias('Mixamo Jumpstyle','rap','verse',.5));
assert(director.mixamoGenreBias('Mixamo Hakken Footwork','hardtekk','drop',.95)>
  director.mixamoGenreBias('Mixamo Rap Groove','hardtekk','drop',.95));
assert(director.mixamoGenreBias('Mixamo Jumpstyle Stomp','hardstyle','drop',.95)>
  director.mixamoGenreBias('Mixamo Rap Groove','hardstyle','drop',.95));
assert.equal(director.mixamoGenreBias('Jumpstyle','hardstyle','drop',1),0);
assert.equal(director.mixamoGenreBias('Mixamo Hakken','hardtekk','drop',NaN),0);

const base=(name,genre)=>({id:name.replace(/\W/g,''),avatarId:'av',name,
 url:'/animations/'+name.replace(/[^a-zA-Z0-9]/g,'')+'.glb',genre,
 bpmMin:0,bpmMax:300,section:'any',addedAt:0});
const motions=[
 base('Mixamo Rap Groove',''),base('Mixamo Hakken Footwork',''),
 base('Mixamo Jumpstyle Stomp',''),
];
const store={version:1,automatic:true,motions};
const choose=(genre)=>v242.nextDanceCombination(v242.emptyDanceSequence(),store,{
 trackId:'song',avatarId:'av',genre,bpm:155,progressMs:500,durationMs:220000,
 energy:.9,detectedSection:'drop'
}).url;
assert.equal(choose('hardtekk'),motions[1].url);
assert.equal(choose('hardstyle'),motions[2].url);
const rap=v242.nextDanceCombination(v242.emptyDanceSequence(),store,{
 trackId:'song',avatarId:'av',genre:'deutschrap',bpm:96,progressMs:9000,
 durationMs:220000,energy:.5,detectedSection:'verse'});
assert.equal(rap.url,motions[0].url);
const fixed=v242.nextDanceCombination(v242.emptyDanceSequence(),
 {...store,automatic:false},{trackId:'s',avatarId:'av',genre:'hardstyle',
 bpm:150,progressMs:0,durationMs:100000,energy:1,fallback:'/manual.glb'});
assert.equal(fixed.url,'/manual.glb');

const clip=(name)=>({name:'Library:'+name.replace(/\W/g,'')+':0',
 label:name,duration:2,trackCount:12,source:'library',category:'dance'});
for(const [genre,want] of [
 ['Deutschrap','Mixamo Rap Groove'],
 ['Hardtekk','Mixamo Hakken Footwork'],
 ['Hardstyle','Mixamo Jumpstyle Stomp'],
]){
 const input={clips:motions.map(m=>clip(m.name)),trackId:'song',modelKey:'model',
 progressMs:120000,section:'drop',genre,bpm:160,energy:.9,slot:0,
 playing:true,reducedMotion:false,manualPriority:false};
 const scored=v536.rankGenreMotionsV536(input,'drop:2');
 assert.equal(scored[0].name,clip(want).name,genre);
 const paused=v536.stepGenreMotionV536(v536.newGenreMotionStateV536(),{...input,playing:false});
 assert.equal(paused.selectedName,null,'pause must never start a clip');
 const manual=v536.stepGenreMotionV536(v536.newGenreMotionStateV536(),{...input,manualPriority:true});
 assert.equal(manual.selectedName,null,'manual priority must win');
}
const automatic=v438.nextAutomaticRapShowV438(v242.emptyDanceSequence(),store,{
 enabled:true,manualProtected:false,playing:true,reducedMotion:false,
 trackId:'song',avatarId:'av',genre:'hardtekk',bpm:160,progressMs:24000,
 durationMs:200000,energy:.95,scene:'drop',phraseSlot:2});
assert.equal(automatic.url,motions[1].url);
const manual=v438.nextAutomaticRapShowV438(v242.emptyDanceSequence(),store,{
 enabled:true,manualProtected:true,playing:true,reducedMotion:false,
 trackId:'song',avatarId:'av',genre:'hardtekk',bpm:160,progressMs:24000,
 durationMs:200000,energy:.95,fallback:'/selected.glb'});
assert.equal(manual.url,'/selected.glb');

// Loop-period alignment is bounded: ±12% and only with a real BPM and
// neutral user speed; no assumed motion-capture tempo from filename.
assert.equal(director.mixamoBeatAlignedSpeed('Mixamo Groove',2,120,1),1);
assert.equal(director.mixamoBeatAlignedSpeed('Mixamo Groove',2,126,1),1.05);
assert.equal(director.mixamoBeatAlignedSpeed('Mixamo Groove',3,120,1),1,'no safe cycle');
assert.equal(director.mixamoBeatAlignedSpeed('Mixamo Groove',2,NaN,1),1);
assert.equal(director.mixamoBeatAlignedSpeed('Mixamo Groove',2,310,1),1);
assert.equal(director.mixamoBeatAlignedSpeed('Mixamo Groove',2,120,1.3),1.3);
assert.equal(director.mixamoBeatAlignedSpeed('Normal Dance',2,126,1),1);
assert.equal(director.mixamoMinimumFade('Mixamo Groove','verse'),.58);
assert.equal(director.mixamoMinimumFade('Mixamo Hakken','drop'),.42);
assert.equal(director.mixamoMinimumFade('Normal Dance','drop'),0);
for(let bpm=60;bpm<=230;bpm+=5)for(let duration=.5;duration<=15;duration+=.1){
 const speed=director.mixamoBeatAlignedSpeed('Mixamo Rap',duration,bpm,1);
 assert(Number.isFinite(speed)&&speed>=.88&&speed<=1.12);
}
// User-defined genre/BPM/section restrictions must gate the automatic live
// selection. A clip imported without metadata retains the existing fallback.
const tagged={...clip('Mixamo Hakken Footwork'),taggedGenre:'hardtekk',
  bpmMin:145,bpmMax:170,assignedSection:'drop'};
const baseInput={bpm:155,genre:'hardtekk',section:'drop'};
assert.equal(v536.libraryMotionEligibleV536(tagged,baseInput),true);
assert.equal(v536.libraryMotionEligibleV536(tagged,{...baseInput,bpm:140}),false);
assert.equal(v536.libraryMotionEligibleV536(tagged,{...baseInput,bpm:171}),false);
assert.equal(v536.libraryMotionEligibleV536(tagged,{...baseInput,genre:'hardstyle'}),false);
assert.equal(v536.libraryMotionEligibleV536(tagged,{...baseInput,section:'verse'}),false);
assert.equal(v536.libraryMotionEligibleV536({...tagged,assignedSection:'any'},baseInput),true);
assert.equal(v536.libraryMotionEligibleV536({...tagged,taggedGenre:''},baseInput),true);
assert.equal(v536.libraryMotionEligibleV536({...tagged,assignedSection:'verse'},
  {...baseInput,section:'hook'}),true,'legacy verse fallback remains available during hooks');
assert.equal(v536.libraryMotionEligibleV536({...tagged,source:'embedded'},
  {...baseInput,bpm:30,genre:'pop'}),true,'embedded clips remain unaffected');

const filtered=v536.rankGenreMotionsV536({
  clips:[tagged,{...clip('Mixamo Rap Groove'),taggedGenre:'deutschrap',bpmMin:80,bpmMax:120}],
  trackId:'song',modelKey:'avatar',progressMs:10000,section:'drop',
  genre:'hardtekk',bpm:155,energy:.9,slot:0,playing:true,reducedMotion:false,manualPriority:false,
},'drop:1');
assert.deepEqual(filtered.map(c=>c.name),[tagged.name],
  'genre and BPM restrictions override attractive but incompatible clips');

const avatar=read('components/visualizer/GltfDancerAvatarV492.tsx');
assert(avatar.includes('mixamoBeatAlignedSpeed('));
assert(avatar.includes('const previousSpeed=action.timeScale'));
assert(avatar.includes('action.timeScale=previousSpeed'),'changing back to manual restores original speed');
assert(avatar.includes('Math.abs(action.timeScale-alignedSpeed)<.0005'),'manual playback changes are not overwritten');
assert(avatar.includes('taggedGenre:motion.genre'));
assert(avatar.includes('assignedSection:motion.section'));
assert(avatar.includes('Math.abs(avatarClipSpeed-1)>.001'));
assert(avatar.includes('!groupClockV328?.settings.enabled'));
assert(avatar.includes('Math.max(mixamoFade,'));
assert(avatar.includes('useGltfClipTransitionsV492('));
const importer=read('components/visualizer/mixamoFbxImporter.ts');
assert(importer.includes('-mixamo.glb'));
console.log('PASS Mixamo genre, beat-loop, manual-priority and transition regression');
