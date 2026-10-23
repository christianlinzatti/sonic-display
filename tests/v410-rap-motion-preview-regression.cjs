'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const {availableRapPreviewMotionsV410,selectedRapPreviewMotionV410,previewMotionSpeedV410}=load('components/visualizer/rapMotionPreviewV410');
const read=f=>fs.readFileSync(path.resolve(__dirname,'..',f),'utf8');
const base={name:'Beats',genre:'deutschrap',bpmMin:0,bpmMax:300,section:'any',addedAt:1};
const motions=[
 {id:'m1',avatarId:'artist',url:'/avatars/animations/dance.glb',...base},
 {id:'m2',avatarId:'other',url:'/avatars/animations/other.glb',...base},
 {id:'m1',avatarId:'artist',url:'/avatars/animations/dance.glb',...base},
 {id:'evil',avatarId:'artist',url:'javascript:alert(1)',...base},
 {id:'m3',avatarId:'artist',url:'https://files.example.org/dance.gltf',...base},
];
// Only motion URLs allowed by the avatar preview's trust rules are loaded.
// Server-installed motion URLs normally live below /avatars and are safe GLB/GLTF.
const list=availableRapPreviewMotionsV410('artist',motions,['Idle','Dance']);
assert.deepEqual(list.map(x=>x.id),['embedded:0','embedded:1','installed:m1','installed:m3']);
assert.equal(list[0].index,0);
assert.deepEqual(availableRapPreviewMotionsV410('artist',motions,[], '/avatars/animations/active.glb').map(m=>m.id),['configured:active','installed:m1','installed:m3']);
assert.equal(availableRapPreviewMotionsV410('artist',motions,[], 'javascript:bad').length,2,'configured URL requires safe GLB/GLTF URL');
assert(!availableRapPreviewMotionsV410('artist',motions,[], '/avatars/animations/dance.glb').some(m=>m.id==='configured:active'),'deduplicate configured and library motion');
assert.equal(list[2].url,'/avatars/animations/dance.glb');
assert.equal(selectedRapPreviewMotionV410(list,'installed:m1')?.kind,'installed');
assert.equal(selectedRapPreviewMotionV410(list,'embedded:1')?.index,1);
assert.equal(selectedRapPreviewMotionV410(list,'removed'),null);
assert.deepEqual(availableRapPreviewMotionsV410('procedural',motions,['Idle']),[]);
assert.deepEqual(availableRapPreviewMotionsV410('other',motions,[]).map(x=>x.id),['installed:m2']);
assert.deepEqual(availableRapPreviewMotionsV410('artist',motions,[]).map(x=>x.id),['installed:m1','installed:m3']);
for(const [input,output] of [[0,.25],[.25,.25],[1,1],[1.75,1.75],[9,1.75],[-1,.25],[NaN,1],[Infinity,1]]) assert.equal(previewMotionSpeedV410(input),output);
const editor=read('components/visualizer/RapPerformanceEditorPanelV408.tsx');
const rig=read('components/visualizer/RapRealAvatarPreviewV409.tsx');
const pkg=require('../package.json');
assert(editor.includes('loadCharacterMotionStore()')&&editor.includes('CHARACTER_MOTION_CHANGE_EVENT'),'use installed store and automatic change events');
assert(editor.includes('availableRapPreviewMotionsV410')&&editor.includes('onEmbeddedClips={onEmbeddedClips}'),'read embedded GLB clips');
assert(editor.includes('aria-label="Vorschau-Motion"')&&editor.includes('motionSpeed={motionSpeed}'),'motion selection/speed is controllable');
assert(editor.includes('useMemo(()=>selectedRapPreviewMotionV410'),'keep stable selection identity across state updates');
assert(editor.includes('setMotionId("")')&&editor.includes('setEmbeddedNames([])'),'switching avatar resets motion selection');
assert(editor.includes('Die Live-Avatar-Auswahl wird nicht verändert'),'preview must not change show avatar');
assert(rig.includes('new AnimationMixer(clone)'),'animation mixer isolated to skinned preview clone');
assert(rig.includes('animations[motion.index??-1]'),'embedded animation playback');
assert(rig.includes('new GLTFLoader().load(motionUrl')&&rig.includes('retargetHumanoidClips(gltf.animations,gltf.scene,clone'),'installed glTF motion must retarget to the chosen character');
assert(rig.includes('readRetargetCalibration(url)'),'use saved per-character retarget overrides');
assert(rig.includes('overlaid.current=[];overlaidMorphs.current=[]'),'clear previous overlay');
assert(rig.includes('obj.quaternion.copy(quat)')&&rig.includes('obj.rotation.x+=x'),'non-accumulating additive rap gestures');
assert(rig.includes('mixer.update(active&&clip?')&&rig.includes('playing&&!reducedMotion'),'pause/reduce-motion guard must also apply to mixer');
assert(rig.includes('external?.error')&&rig.includes('onMotionInfo'),'incompatible clip handled without hiding avatar');
assert(rig.includes('mixer.uncacheRoot(clone)')&&rig.includes('dispose={null}'),'cleanup mixer, do not dispose shared GLTF materials');
assert((Number(String(pkg.version).match(/^0\.1\.0-v(\d+)$/)?.[1]) >= 410));
assert(pkg.scripts['verify:offline'].includes('test:v410'));
assert(pkg.scripts['build:preflight'].includes('test:v410'));
console.log('PASS V410: installed+embedded motion options, per-avatar filtering, isolated retargeted mixer, reversible rap overlays, error/reduced-motion safeguards');
