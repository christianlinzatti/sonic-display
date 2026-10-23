'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {safeUpperGestureTrackV490:safe,chooseUpperGestureClipV490:choose,planUpperBlendV490:plan}=load('components/visualizer/automaticGlbUpperBlendV490');
const file=(path)=>fs.readFileSync(path,'utf8');
const allowed=['mixamorigLeftArm.quaternion','mixamorigRightForeArm.quaternion','Armature/Spine2.quaternion','mixamorig:RightShoulder.quaternion','Armature/Chest.rotation'];
for(const name of allowed)assert.equal(safe(name),true,`${name} eligible`);
const protectedTracks=['Armature/Hips.position','mixamorigLeftUpLeg.quaternion','Armature/LeftFoot.quaternion',
 'mixamorigLeftToeBase.quaternion','mixamorigHead.quaternion','mixamorigNeck.quaternion','mixamorigLeftHand.quaternion',
 'mixamorig:Root.quaternion','Armature/Spine.position','Armature/Chest.scale','mesh.morphTargetInfluences[0]',
 'Armature/LeftArm.position','Armature/LeftArm.scale','Root.rotation','random.quaternion'];
for(const name of protectedTracks)assert.equal(safe(name),false,`${name} must not be layered`);
const clip=(name,tracks,duration=2)=>({name,duration,tracks:tracks.map(name=>({name}))});
const arms=['Armature/mixamorigLeftArm.quaternion','Armature/mixamorigRightArm.quaternion','Armature/Hips.position','Armature/LeftFoot.quaternion'];
const clips=[clip('Dance',arms),clip('Rap Gesture',arms),clip('Squat',arms),clip('Wave',arms)];
assert.equal(choose(clips,'Deutschrap').name,'Rap Gesture','genre-aware source priority');
assert.equal(choose(clips,'hardstyle').name,'Wave','hand gesture preferred to full body dance');
assert.equal(choose([clip('Dance',['Armature/Hips.position','Armature/LeftFoot.quaternion'])],'rap'),null,'not enough upper joints');
assert.equal(choose([clip('Walk',arms)],'rap'),null,'walking unsuitable');
assert.equal(choose([clip('Gesture',arms,.12)],'rap'),null,'very short gestures unsuitable');
assert.equal(choose([clip('Gesture',['Armature/Spine1.quaternion','Armature/Spine2.quaternion'])],'rap'),null,'a torso-only pose cannot be used as an arm overlay');
const input={playing:true,reducedMotion:false,manualPriority:false,activeLowPose:true,quality:'high',energy:.6,genre:'Deutschrap',section:'verse',plantedLeft:true,plantedRight:true};
const weight=plan(input);
assert(weight>0&&weight<=.32,'bounded overlay weight');
assert.equal(weight,plan({...input}),'deterministic');
assert(plan({...input,section:'drop'})>weight,'accent drives visible but bounded gesture');
assert(plan({...input,quality:'balanced'})<weight,'balanced performance tier');
assert(plan({...input,plantedLeft:false,plantedRight:false})>weight,'planted feet reduce extra movement');
for(const override of [{playing:false},{reducedMotion:true},{manualPriority:true},{activeLowPose:false},{quality:'low'}]){
 assert.equal(plan({...input,...override}),0,`${JSON.stringify(override)} must preserve the primary animation`);
}
assert(Number.isFinite(plan({...input,energy:NaN})),'bad live energy cannot produce NaN');
assert(Number.isFinite(plan({...input,energy:Infinity})),'infinite live energy cannot produce NaN');
const source=file('components/visualizer/ThreeAvatar.tsx');
for(const text of ['chooseUpperGestureClipV490(clips,genre)','createAutomaticUpperClipV490(source)',
 'names:allActionNamesV490','filter(n=>n!==autoUpperGestureV490?.name',
 'name !== autoUpperGestureV490?.name','const autoUpperEligibleV490=',
 'selectedClip===lowClipV481','const activeAutoUpperV490=',
 'overlay.reset().stopFading().setEffectiveWeight(0).play()',
 'overlay.stop();','planUpperBlendV490({','overlay.setEffectiveWeight(autoUpperWeightV490.current)',
 'footIK.current.left?.contact.phase', 'updateFootIK(footIK.current'])
 assert(source.includes(text),`missing real GLB mixer integration: ${text}`);
assert(source.indexOf('chooseUpperGestureClipV490(clips,genre)')<source.indexOf('useAnimations(playbackClips, root)'),
 'overlay clip must be registered with existing mixer');
assert(source.indexOf('const autoUpperEligibleV490=')>source.indexOf('const selectedClip=lowClipV481'),
 'only the chosen low clip may activate the overlay');
const factory=file('components/visualizer/automaticGlbUpperClipV490.ts');
assert(factory.includes('tracks.map(track=>track.clone())') && factory.includes('safeUpperGestureTrackV490(t.name)'),
 'original GLB clips and tracks are never modified');
assert(!/\.position|\.scale/.test(factory),'the clip builder must not explicitly include root/translation tracks');
assert(source.includes('!avatarBlendEnabled&&!rapLiveEnabledV412') && source.includes('!timelineEnabled&&!activeSequence&&!activeLoop'),
 'manual mixer priorities preserved');
const pure=file('components/visualizer/automaticGlbUpperBlendV490.ts');
assert(!/\b(fetch|setInterval|setTimeout|requestAnimationFrame|Math\.random|Date\.now|window|document|localStorage)\b/.test(pure),
 'no extra loop, network or browser state');
for(let i=0;i<115000;i++){
 const p=plan({...input,energy:i%51/50,section:i%4===0?'drop':'verse',quality:i%9===0?'balanced':'high',
   plantedLeft:i%2===0,plantedRight:i%3===0});
 assert(Number.isFinite(p)&&p>=0&&p<=.32);
}
const pkg=require('../package.json');
assert(/^0\.1\.0-v49\d+$/.test(pkg.version),'V490 and subsequent compatible releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v490 && npm run test:v490:types'));
console.log('PASS V490: safe upper channels, installed GLB source selection, planted-foot weighting, authored priority, runtime mixer integration, long-play');
