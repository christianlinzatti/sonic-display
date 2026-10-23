'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {isPreviewBlendTrackV491:isSafe,resolvePreviewBlendV491:resolve,previewBlendWeightV491:weight,previewBlendRegionsV491:regions}=load('components/visualizer/glbMotionBlendPreviewV491');
const source=fs.readFileSync('components/visualizer/AvatarPreview3D.tsx','utf8');
const safeArms=['Armature/mixamorigLeftArm.quaternion','mixamorigRightShoulder.quaternion','mixamorigLeftForeArm.rotation'];
for(const n of safeArms){assert(isSafe(n,'arms'));assert(isSafe(n,'upper'));}
for(const n of ['Armature/Spine2.quaternion','mixamorigChest.rotation']){
 assert(!isSafe(n,'arms')); assert(isSafe(n,'upper'));
}
for(const n of ['Armature/Hips.position','Armature/Hips.quaternion','Armature/RightFoot.quaternion','mixamorigLeftLeg.quaternion',
 'Root.position','Root.quaternion','LeftHand.quaternion','Head.quaternion','Jaw.quaternion','Chest.position','LeftArm.scale','random.quaternion']){
 assert(!isSafe(n,'arms'),`unsafe arm track ${n}`);assert(!isSafe(n,'upper'),`unsafe upper track ${n}`);
}
assert.deepEqual(regions.map(x=>x.value),['arms','upper']);
for(const [n,expected] of [[-.2,0],[0,0],[.27,.27],[.7,.5],[Infinity,0],[NaN,0]]) assert.equal(weight(n),expected);
const clip=(id,trackNames)=>({id,clip:{duration:2,tracks:trackNames.map(name=>({name}))}});
const clips=[clip('base',['Root.position','mixamorigLeftLeg.quaternion']),clip('rap',[...safeArms,'mixamorigChest.rotation','Hips.position']),clip('bad',['LeftFoot.quaternion'])];
const p={enabled:true,sourceId:'rap',weight:.35,region:'arms'};
let chosen=resolve(clips,'base',p);
assert(chosen&&chosen.clip===clips[1]);assert.equal(chosen.weight,.35);assert.deepEqual(chosen.trackNames,safeArms);
chosen=resolve(clips,'base',{...p,region:'upper'});
assert(chosen&&chosen.trackNames.includes('mixamorigChest.rotation'));
for(const change of [{enabled:false},{sourceId:'base'},{sourceId:'unknown'},{sourceId:'bad'},{weight:0}]) assert.equal(resolve(clips,'base',{...p,...change}),null);
assert.equal(resolve(clips,'base',p,true),null,'reduced motion must disable overlay');
assert.equal(resolve([clips[0]],'base',p),null,'requires two installed clips');
for(const fragment of ['blendV491?: PreviewBlendPlanV491','resolvePreviewBlendV491(allClips','new AnimationClip(`PreviewMixV491:',
 'result.trackNames.includes(t.name)).map(t => t.clone())','overlay.setLoop(LoopRepeat, Infinity)','overlay.setEffectiveWeight(overlayWeightV491)',
 'overlayActionV491.current?.setEffectiveWeight(overlayWeightV491)','mixer.setTime(clock.current)',
 'role="status"','Mischgewicht:','Körperbereich','GLB Motion Preview & Blending Studio · V491',
 'disabled={!canBlendV491}', 'preferences.reducedMotion', 'footIK={previewIK}',
 'const mixer = useMemo(() => new AnimationMixer(model)', 'onClick={()=>setBlendV491']) {
 assert(source.includes(fragment),`missing working interactive preview part: ${fragment}`);
}
assert(!source.includes('action.paused = true'),'timeline scrubbing must update an active animation action');
assert(!source.includes('new AnimationMixer(blendClipV491'),'no extra mixer');
const pkg=require('../package.json');
assert(/^0\.1\.0-v49\d+$/.test(pkg.version),'V491 or compatible later releases');
assert(pkg.scripts['build:preflight'].includes('npm run test:v491 && npm run test:v491:types && npm run test:v490'));
console.log('PASS V491: safe channel masks, missing/reduced-motion fallbacks, bounded weight, mixer-driven GLB preview and scrub');
