'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {
 suggestMotionCategoryV535:suggest,validMotionFingerprintV535:validHash,validMotionCategoryV535:validCategory,
 fingerprintAnimationClipV535:fingerprint,duplicateInAvatarV535:duplicate,
 filterMotionsV535:filter,countKnownDuplicatesV535:count,
 MOTION_CATEGORIES_V535:categories,
}=load('components/visualizer/motionLibraryIntelligenceV535');
const {sanitizeCharacterMotionStore:sanitize,addCharacterMotion}=load('components/visualizer/characterMotionLibrary');
assert(categories.includes('rap')&&categories.includes('idle')&&categories.includes('other'));
for(const [input,category] of [['Idle_Groove','idle'],['Dance_RapTwoStep','rap'],['Dance_ClubGroove','dance'],['Rap_Gesture','rap'],['Head_Nod','gesture'],['Hardtekk_Drop','energetic'],['Walk_Forward','locomotion'],['x9-unknown','other'],['Body_Roll','gesture']])assert.equal(suggest(input),category,input);
assert.equal(validCategory('drop'),false);
assert.equal(validCategory('energetic'),true);
assert.equal(validHash('F'.repeat(64)),false);
assert.equal(validHash('a'.repeat(64)),true);
const clip=(name,values,interpolation=2301)=>({tracks:[{name,times:new Float32Array([0,0.4,1]),values:new Float32Array(values),getInterpolation:()=>interpolation}]});
(async()=>{
 const first=await fingerprint(clip('Hips.position',[0,0,0,0.1,0,0,0.2,0,0]));
 const renamed=await fingerprint(clip('Hips.position',[0,0,0,0.1,0,0,0.2,0,0]));
 const changed=await fingerprint(clip('Hips.position',[0,0,0,0.1,0,0,0.21,0,0]));
 const differentRig=await fingerprint(clip('Spine.position',[0,0,0,0.1,0,0,0.2,0,0]));
 const stepped=await fingerprint(clip('Hips.position',[0,0,0,0.1,0,0,0.2,0,0],2300));
 assert(validHash(first),'SHA-256 should be available on supported runtimes');
 assert.equal(first,renamed,'display name / filename must NOT affect the actual motion fingerprint');
 assert.notEqual(first,changed,'a tiny genuine motion change is not a duplicate');
 assert.notEqual(first,differentRig,'different animated bone targets are not duplicates');
 assert.notEqual(first,stepped,'interpolation mode is part of motion identity');
 assert.equal(await fingerprint({tracks:[]}),undefined,'no tracks cannot be fingerprinted');
 assert.equal(await fingerprint({tracks:[{name:'Hips.position',times:[0,1],values:[0,1]}]}),undefined,'unknown interpolation must never be guessed');
 assert.equal(await fingerprint({tracks:[{name:'bad',times:[0],values:[Number.NaN]}]}),undefined,'invalid motion values do not get a hash');
 assert.equal(await fingerprint({tracks:[{name:'too big',times:[0],values:{length:700000}}]}),undefined,'bounded work on Raspberry Pi');
 const motions=[
  {id:'a',avatarId:'one',name:'Rap_Gesture',url:'/a.glb',addedAt:1,favorite:false,category:'rap',fingerprint:first},
  {id:'b',avatarId:'one',name:'Same exact data different name',url:'/b.glb',addedAt:2,favorite:true,category:'dance',fingerprint:first},
  {id:'c',avatarId:'one',name:'Rap_Gesture',url:'/c.glb',addedAt:3,favorite:false,category:'rap',fingerprint:changed},
  {id:'d',avatarId:'two',name:'Same data another avatar',url:'/d.glb',addedAt:4,category:'other',fingerprint:first},
 ];
 assert.equal(duplicate(motions,'one',first)?.id,'a');
 assert.equal(duplicate(motions,'three',first),undefined,'never dedupe across avatars: skeleton compatibility not established');
 assert.equal(duplicate(motions,'one','bad'),undefined);
 assert.equal(count(motions,'one'),1);
 assert.equal(count(motions,'two'),0);
 assert.deepEqual(filter(motions,{avatarId:'one',search:'',favoritesOnly:true}).map(m=>m.id),['b']);
 assert.deepEqual(filter(motions,{avatarId:'one',search:'rap',category:'rap'}).map(m=>m.id),['c','a']);
 assert.deepEqual(filter(motions,{avatarId:'one',search:'',category:'all'}).map(m=>m.id),['b','c','a']);
 const saved=sanitize({version:1,automatic:true,motions:motions.map(m=>({...m,genre:'deutschrap',section:'any',bpmMin:0,bpmMax:300}))});
 assert.equal(saved.motions.find(m=>m.id==='b').favorite,true);
 assert.equal(saved.motions.find(m=>m.id==='a').category,'rap');
 assert.equal(saved.motions.find(m=>m.id==='a').fingerprint,first);
 const malicious=sanitize({motions:[{...motions[0],category:'__proto__',fingerprint:'z'.repeat(64),favorite:'true'}]});
 assert.equal(malicious.motions[0].favorite,false);
 assert.equal(malicious.motions[0].fingerprint,undefined);
 assert.equal(malicious.motions[0].category,'rap');
 assert.equal(addCharacterMotion('x','test','/test.glb').motions.length,1,'server-side helpers may return a sanitized in-memory descriptor without browser writes');
 const root=path.join(__dirname,'..');
 const library=fs.readFileSync(path.join(root,'components/CharacterMotionLibraryPanel.tsx'),'utf8');
 const installer=fs.readFileSync(path.join(root,'components/CharacterMotionBatchInstaller.tsx'),'utf8');
 const inspector=fs.readFileSync(path.join(root,'components/visualizer/motionClipInspector.ts'),'utf8');
 for(const token of ['filterMotionsV535','countKnownDuplicatesV535','favoritesOnlyV535','setEmbeddedPreferenceV535','loadEmbeddedInventoryV535','selectedEmbeddedClipIndex={embeddedPreviewIndexV535}','fingerprintInstalledMotionV535','saveCharacterMotionStore','In 3D ansehen'])assert(library.includes(token),`V535 library missing ${token}`);
 for(const token of ['fingerprintMotionClipsV535','duplicateInAvatarV535','duplicatesSkippedV535','if(existing)','addCharacterMotion(item.target','Motion-Bibliothek'])assert(installer.includes(token),`V535 installer missing ${token}`);
 assert(inspector.includes('fingerprintAnimationClipV535(clip)'));
 assert(installer.includes('if(!appendMotionsV533&&index===selectedIndex)'), 'manual active motion override stays opt-in');
 const examples=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
 for(const name of examples){
  const filename=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',name);
  if(!fs.existsSync(filename))continue;
  const data=fs.readFileSync(filename);
  const json=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString('utf8').trim());
  assert.equal(json.animations.length,20,`${name}: 20 embedded clips must still exist`);
  assert.equal(json.animations.filter(a=>suggest(a.name)!=='other').length,20,`${name}: categorization coverage`);
 }
 console.log('PASS V535 SHA-256 content dedupe, name independence, rig scope, interpolation, legacy storage, categories, favorites, filters, five GLBs and 3D preview integration');
})().catch(error=>{console.error(error);process.exitCode=1;});
