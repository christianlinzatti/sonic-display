'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {resolveGenreMotionV471}=load('components/visualizer/genreChoreographyV471');
const {createChoreographyState,updateDanceChoreography}=load('components/visualizer/advancedDanceChoreography');
const original={genre:'deutschrap',playing:true,reducedMotion:false,energy:.8};
const rapVerse=resolveGenreMotionV471({...original,section:'verse'});
const rapHook=resolveGenreMotionV471({...original,section:'hook'});
assert.equal(rapVerse.family,'rap');
assert(rapVerse.head>1.2&&rapVerse.arms>1.2,'Deutschrap uses head nods + expressive gestures');
assert(rapVerse.moves.includes('flow')&&!rapVerse.moves.includes('headbang-arms'),'Rap verse uses flow, not rock headbanging');
assert(rapHook.moves.includes('drop-hit'),'Rap hook accents punchier');
assert(rapHook.weight>rapVerse.weight,'Hook stronger than verse');
const rockVerse=resolveGenreMotionV471({genre:'rock',section:'verse',energy:.7});
const rockHook=resolveGenreMotionV471({genre:'rock',section:'hook',energy:.7});
assert.notDeepEqual(rockVerse.moves,rockHook.moves);
assert(rockHook.moves.includes('headbang-arms'));
const popHook=resolveGenreMotionV471({genre:'pop',section:'hook'});
assert(popHook.moves.includes('side-step')&&!popHook.moves.includes('headbang-arms'));
const indie=resolveGenreMotionV471({genre:'indiepop',section:'verse'});
assert.equal(indie.family,'pop');
assert.equal(resolveGenreMotionV471({genre:'classical',section:'verse'}),null,'unmodified other genres');
const fusion={primary:'deutschrap',secondary:'trap',secondaryWeight:.32};
const blend=resolveGenreMotionV471({...original,fusion,section:'chorus'});
assert.equal(blend.label,'deutschrap + trap');
assert(blend.arms<rapHook.arms,'secondary Trap changes gesture balance');
assert.equal(resolveGenreMotionV471({...original,fusion:{...fusion,secondaryWeight:.02},section:'chorus'}).label,'deutschrap','weak fusion is ignored');
assert.equal(resolveGenreMotionV471({...original,fusion:{...fusion,primary:'rock'},section:'chorus'}).label,'deutschrap','wrong-primary fusion rejected');
assert.equal(resolveGenreMotionV471({...original,playing:false}).weight,0);
assert.equal(resolveGenreMotionV471({...original,reducedMotion:true}).weight,0);
assert(resolveGenreMotionV471({...original,authored:true}).weight<rapVerse.weight,'authored choreography has precedence');
const audio={bass:.7,mids:.6,highs:.5,kick:.5,volume:.8,beat:true,beatStrength:.9,bpm:96,snare:.3,hiHat:.3,energyEnvelope:.75,attack:.5,decay:.5};
const tune={aggression:.5,variation:.5,style:'balanced'};
function dance(genre,section){return updateDanceChoreography(createChoreographyState(),audio,genre,'auto',section,'steady-groove',5,.016,true,false,tune,null,null);}
assert(['groove','flow','side-step'].includes(dance('deutschrap','verse').move));
assert(['headbang-arms','drop-hit','groove'].includes(dance('rock','chorus').move));
assert(['side-step','groove','drop-hit'].includes(dance('pop','chorus').move));
const disabled=updateDanceChoreography(createChoreographyState(),audio,'deutschrap','auto','verse','steady-groove',5,.016,true,true,tune);
assert(disabled.armAccent===0,'reduced-motion accent must be zero');
const sources={
  'components/visualizer/ThreeAvatar.tsx':['resolveGenreMotionV471({genre,fusion:genreFusion','rhythmDance.moveOptions, genreFusion)','genreMotionV471'],
  'hooks/useAudioMotionEngine.ts':['genreMotion?:GenreMotionCueV471','motionGain(\'arms\')'],
  'components/visualizer/advancedDanceChoreography.ts':['genreMotion.moves','fusion: GenreFusion'],
};
for(const [path,needles] of Object.entries(sources))for(const needle of needles)
 assert(fs.readFileSync(path,'utf8').includes(needle),`${path} missing ${needle}`);
console.log('PASS V471: Deutschrap verse/hook, Pop/Rock motion style, fusion, authored protection, pause, reduced motion, scene integration');
