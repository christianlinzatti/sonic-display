'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {planCoherentRapFaceV581:plan,addCoherentRapExpressionV581:add,coherentRapRateV581:rate,
 additiveBoneAxisV581:overlay,releaseBoneAxisV581:release,COHERENT_RAP_OFF_V581:OFF}=load('components/visualizer/coherentRapFacialPerformanceV581');
const {planRapMouthDynamicsV572:cadence}=load('components/visualizer/rapMouthDynamicsV572');
const {planVerifiedEyeContactV574:eye}=load('components/visualizer/verifiedEyeContactV574');
let checks=0;
const t=(name,run)=>{try{run();checks++;}catch(e){e.message=`${name}: ${e.message}`;throw e;}};
const words=[{text:'Bam',startMs:1000,endMs:1250},{text:'macht',startMs:1270,endMs:1500},{text:'Druck',startMs:1520,endMs:1810}];
const lyrics={synced:true,lines:[{text:'Bam macht Druck',startMs:930,endMs:1850,words}]};
const base={lyrics,effectiveTimeMs:1120,activeWord:'Bam',playing:true,enabled:true,rap:true,
 verifiedWord:true,reducedMotion:false,roleAllowed:true,manualSilent:false,manualPriority:false,
 preserveAudioMouth:false,intensity:85};
const scene={active:true,trackId:'song-a',cueStartMs:1000,cueEndMs:2000,count:2,focus:'handoff',
 leadSlot:0,singingSlots:[0],handoffFrom:1,strength:.8,lyricMotionGain:1,readingBoost:1,plateBoost:0};
const sceneInput={scene,trackId:'song-a',slot:0,timeMs:1200,playing:true,
 reducedMotion:false,manualPriority:false,enabled:true,tier:'high'};
const audition={...base,cadence:cadence(base),tier:'high',eye:eye(sceneInput),castVerified:true};
const active=plan(audition);
t('active on verified dense word',()=>assert.equal(active.active,true));
t('source says what evidence exists',()=>assert.equal(active.source,'verified-timed-word'));
t('word attribution is correct',()=>assert.equal(active.wordStartMs,1000));
t('bound micro head pitch',()=>assert(active.headPitch<0&&active.headPitch>=-.025));
t('solo head does not invent yaw',()=>assert.equal(active.headYaw,0));
t('jaw attacks slightly faster',()=>assert(active.jawAttackRate>1&&active.jawAttackRate<=1.105));
t('vowel release smoother',()=>assert(active.vowelReleaseRate<1&&active.vowelReleaseRate>=.945));
t('audience eye cue is small',()=>assert(active.eyePitchDelta<0&&active.eyePitchDelta>=-.007));
t('no eye yaw when addressing audience',()=>assert.equal(active.eyeYawDelta,0));
t('head/eye expressive gains are limited',()=>assert(active.browAccent<=.022&&active.squintAccent<=.011));
const offEye=plan({...audition,eye:{mode:'off',yaw:0,pitch:0,weight:0}});
t('no eye motion without verified scene',()=>{assert.equal(offEye.eyePitchDelta,0);assert.equal(offEye.eyeYawDelta,0);});
const partner=plan({...audition,eye:eye({...sceneInput,slot:1}),castVerified:true});
t('verified listener rotates with look direction',()=>{assert(partner.eyeYawDelta<0);assert(partner.headYaw<=0);});
const face={jaw:.23,wide:.34,round:.1,lipsClosed:.78,brow:.03,squint:.01,blink:.02,cheek:.02,smile:.04};
const frame={face,more:'unchanged'};
const shaped=add(frame,active);
t('V581 preserves all mouth and manual seal shapes',()=>{for(const c of ['jaw','wide','round','lipsClosed'])assert.equal(shaped.face[c],face[c]);});
t('V581 preserves blink smile and cheek',()=>{for(const c of ['blink','smile','cheek'])assert.equal(shaped.face[c],face[c]);});
t('V581 refines expression only',()=>{assert(shaped.face.brow>face.brow);assert(shaped.face.squint>face.squint);});
t('does not mutate original',()=>assert.deepEqual(frame,{face,more:'unchanged'}));
t('all clamped',()=>{const changed=add({face:{brow:.998,squint:.999}},active);assert(changed.face.brow<=1&&changed.face.squint<=1);});
t('jaw attack speed distinct',()=>assert.equal(rate(active,'jaw',true),active.jawAttackRate));
t('vowel release speed distinct',()=>assert.equal(rate(active,'wide',false),active.vowelReleaseRate));
for(const [channel,attacking] of [['lipsClosed',true],['lipsClosed',false],['blink',true],['smile',false],['jaw',false],['round',true]])
  t(`${channel}/${attacking} speed untouched`,()=>assert.equal(rate(active,channel,attacking),1));
for(const prop of ['playing','enabled','rap','verifiedWord','roleAllowed','castVerified'])
 t(`guard ${prop}`,()=>assert.strictEqual(plan({...audition,[prop]:false}),OFF));
for(const prop of ['reducedMotion','manualSilent','manualPriority','preserveAudioMouth'])
 t(`authored / safety ${prop}`,()=>assert.strictEqual(plan({...audition,[prop]:true}),OFF));
for(const [name,changes] of [
 ['low tier',{tier:'low'}],['paused',{playing:false}],['zero intensity',{intensity:0}],
 ['NaN intensity',{intensity:NaN}],['invalid clock',{effectiveTimeMs:NaN}],
 ['wrong text',{activeWord:'Macht'}],['word gap',{effectiveTimeMs:1260}],
 ['no lyric sync',{lyrics:{synced:false,lines:[]}}],
 ['edited spelling',{editedWords:[{startMs:1000,text:'Bam'}]}],
 ['manual replacement of original word',{editedWords:[{startMs:1000,text:'verändert'}]}],
 ['no cadence',{cadence:null}],['sparse cadence',{cadence:{...cadence(base),active:false}}],
 ])t(`hard stop ${name}`,()=>assert.strictEqual(plan({...audition,...changes}),OFF));
for(const duration of [15,35,70,530,800]){
 const list=[{text:'Bam',startMs:1000,endMs:1000+duration},{text:'macht',startMs:1020+duration,endMs:1500+duration}];
 const l={synced:true,lines:[{text:'Bam macht',startMs:950,endMs:2100,words:list}]};
 t(`unsupported duration ${duration}`,()=>assert.equal(plan({...audition,lyrics:l,cadence:cadence({...base,lyrics:l}),effectiveTimeMs:1010}).active,false));
}
t('inactive expression identity',()=>assert.strictEqual(add(frame,OFF),frame));
t('inactive rate identity',()=>assert.equal(rate(OFF,'jaw',true),1));
t('overlay follows stable authored bone without drifting',()=>{
 const first=overlay(.3,-.02,0,0);
 const second=overlay(first,-.02,-.02,first);
 assert(Math.abs(first-.28)<1e-9);assert(Math.abs(second-first)<1e-9);
 assert(Math.abs(release(second,-.02,second)-.3)<1e-9);
});
t('new keyframe never loses a prior generated head offset',()=>{
 const old=overlay(.3,-.02,0,0);
 const next=overlay(.6,-.012,-.02,old);
 assert(Math.abs(next-.588)<1e-9);
 assert.equal(release(.8,-.012,next),.8);
});
t('neutral off restores additive overlay',()=>assert(Math.abs(overlay(.15,0,-.01,.15)-.16)<1e-9));
const source=fs.readFileSync(path.join(__dirname,'../components/visualizer/VocalRigV368.tsx'),'utf8');
t('planner is used inside true GLB renderer',()=>assert.match(source,/planCoherentRapFaceV581\(/));
t('glb has real named head Bone discovery',()=>assert.match(source,/object.type!=='Bone'/));
t('head animation overlay is released on unmount',()=>assert.match(source,/releaseBoneAxisV581/));
t('eye baseline remains V574 protected',()=>assert.match(source,/planVerifiedEyeContactV574\(/));
t('lip seal is not modified by v581 speed',()=>assert.match(source,/coherentRapRateV581\(coherentCueV581,c/));
t('no second render-frame scheduler',()=>assert.doesNotMatch(fs.readFileSync(path.join(__dirname,'../components/visualizer/coherentRapFacialPerformanceV581.ts'),'utf8'),/useFrame\(|setInterval\(|fetch\(|requestAnimationFrame\(/));
console.log(`PASS V581: ${checks} deterministic facial, role, head-bone, eye and integration checks; no real-GLB visual sign-off claimed.`);
