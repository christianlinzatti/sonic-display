'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {inspectSampledMotionV534,compareMotionTransitionV534,motionReviewLabelV534}=load('components/visualizer/advancedMotionInspectorV534');
const point=(x,y,z)=>({x,y,z});
const frame=(time,hipX=0,footX=0,footY=0)=>({time,hips:point(hipX,1,0),leftFoot:point(footX,footY,0),rightFoot:point(0,0,0)});
const stationary=Array.from({length:49},(_,i)=>frame(i/24));
const safe=inspectSampledMotionV534(stationary,1.8);
assert.equal(safe.findings.length,0,'stationary foot/hip must not be flagged');
assert.equal(safe.samples,49);
assert.equal(safe.footSamples,96);
assert.equal(safe.contactAssumption,'estimated-ground-near-lowest-foot');
assert.match(motionReviewLabelV534(safe),/Sichtprüfung/);
const sliding=Array.from({length:49},(_,i)=>frame(i/24,0,i/24,0));
const slide=inspectSampledMotionV534(sliding,1.8);
assert(slide.potentialSlideIntervals>0,'foot slide on estimated floor must be reported');
assert(slide.findings.some(x=>x.kind==='potential-foot-slide'&&x.side==='left'&&x.severity==='info'));
assert(slide.findings.every(x=>x.atSeconds>=0&&x.atSeconds<=2));
const lifted=Array.from({length:49},(_,i)=>frame(i/24,0,i/24,0.3));
// Vary Y so the foot is clearly above the lowest point for most samples.
lifted[0].leftFoot.y=0;
assert.equal(inspectSampledMotionV534(lifted,1.8).potentialSlideIntervals,0,'airborne movements must not be reported as grounded');
const hipJump=[frame(0),frame(.05,1.0,0,0),frame(.1,1.0,0,0)];
const jump=inspectSampledMotionV534(hipJump,1.8);
assert.equal(jump.rootJumps,1);
assert(jump.findings.some(x=>x.kind==='sudden-root-motion'&&x.severity==='warning'));
const missingFoot=inspectSampledMotionV534([{time:0,hips:point(0,1,0)},{time:.1,hips:point(0,1,0)}],1.8);
assert.equal(missingFoot.contactAssumption,'unavailable');
assert.equal(missingFoot.potentialSlideIntervals,0);
const corrupt=inspectSampledMotionV534([frame(0),frame(0),frame(2)],1.8);
assert(corrupt.findings.some(x=>x.kind==='sampling-gap'));
const nominal=compareMotionTransitionV534(frame(1),frame(0),1.8);
assert.equal(nominal.status,'smooth-candidate');
assert.equal(nominal.assessedPoints,2);
const slight=compareMotionTransitionV534(frame(1,0,0),frame(0,0,1.1),1.8);
assert.equal(slight.status,'inspect');
const stark=compareMotionTransitionV534(frame(1,0,0),frame(0,0,2),1.8);
assert.equal(stark.status,'high-contrast');
assert(stark.recommendedCrossfadeSeconds>nominal.recommendedCrossfadeSeconds);
assert.equal(compareMotionTransitionV534({time:0},{time:1},1.8).status,'unavailable');
// Translation of the entire avatar MUST NOT be interpreted as a leg-pose mismatch.
const translated=compareMotionTransitionV534(frame(1,0,0),{time:0,hips:point(20,1,0),leftFoot:point(20,0,0),rightFoot:point(20,0,0)},1.8);
assert.equal(translated.status,'smooth-candidate','rig-local pose comparison subtracts hips movement');
for(let i=0;i<200;i++){
 const sample=Array.from({length:81},(_,j)=>frame(j/24,(i%7===0&&j>40)?j/2:0,j/500,0));
 const report=inspectSampledMotionV534(sample,1.8);
 assert(report.samples<=81&&report.findings.length<=32);
 assert(report.findings.every(f=>Number.isFinite(f.atSeconds)&&Number.isFinite(f.value)));
}
const root=path.join(__dirname,'..');
const installer=fs.readFileSync(path.join(root,'components/CharacterMotionBatchInstaller.tsx'),'utf8');
const viewer=fs.readFileSync(path.join(root,'components/visualizer/AvatarPreview3D.tsx'),'utf8');
const sampler=fs.readFileSync(path.join(root,'components/visualizer/motionQualitySamplerV534.ts'),'utf8');
for (const token of ['advancedPanelV534','inspectAdvancedV534','previewSeekV534','advancedReportsV534','advancedKeyV534','Fußkontakt, Gelenke und Übergang analysieren','Keine Änderung der Original-GLB','motionReviewLabelV534']){
 assert(installer.includes(token)||sampler.includes(token),'V534 missing '+token);
}
assert(viewer.includes('setCursor(Math.max(0,Math.min(selectedClip.duration,previewSeekV534.seconds)))'),'timestamp should actually seek video scene frame');
assert(installer.includes('selectedExternalClipIndexV534={clipIndices[current.id]??0}'),'motion preview must show the analyzed source clip');
assert(viewer.includes('selectedExternalClipIndexV534')&&viewer.includes('`external:${selectedExternalClipIndexV534}`'),'selected source motion must load into 3D timeline');
assert(sampler.includes('new AnimationMixer(scene)'),'use actual animation evaluation');
assert(sampler.includes('scene.updateMatrixWorld(true)'),'foot coordinates must be world-space');
assert(!sampler.includes('polishMotionClipV321'),'readonly inspector must not modify original curves');
const files=['sonic-performer-v3.glb','sonic-pulsebot-v1.glb','sonic-nova-v1.glb','sonic-rae-v1.glb','sonic-jax-v1.glb'];
for(const file of files){
 const p=path.join(process.env.SONIC_V529_SAMPLES||'/mnt/data',file);if(!fs.existsSync(p))continue;
 const data=fs.readFileSync(p);assert.equal(data.toString('ascii',0,4),'glTF');
 const glb=JSON.parse(data.subarray(20,20+data.readUInt32LE(12)).toString('utf8').trim());
 const nodeNames=glb.nodes.map(n=>n.name||'');
 for(const name of ['LeftFoot','RightFoot','Hips','Head'])assert(nodeNames.includes(name),`${file} missing ${name}`);
 for(const clip of ['Idle_Groove','Dance_RapTwoStep','Dance_ClubGroove'])assert(glb.animations.some(a=>a.name===clip),`${file} missing ${clip}`);
 console.log(`V534 GLB ${file}: ${glb.animations.length} clips and 4 key rig nodes ready for live pose sampling`);
}
console.log('PASS V534 stationary/airborne/ground-motion/root-jumps/transition-pose/range/real-GLB-rig + preview seek checks');
