'use strict';
/** V492 GLB hook split: checks real imports, single mixer and critical frame ordering. */
const fs=require('node:fs');
const path=require('node:path');
const assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../components/visualizer');
const read=(name)=>fs.readFileSync(path.join(root,name),'utf8');
const modules=[
 'GltfDancerAvatarV492.tsx',
 'useGltfFootContactV492.ts',
 'useGltfVocalMotionV492.ts',
 'gltfVocalPerformanceV492.ts',
 'useGltfBlendSetupV492.ts',
 'useGltfAnimationMixerV492.ts',
 'useGltfClipTransitionsV492.ts',
 'useGltfBlendPlaybackV492.ts',
];
const file=read('GltfDancerAvatarV492.tsx');
const texts=Object.fromEntries(modules.map(n=>[n,read(n)]));
const totalLines=file.split('\n').length;
assert(totalLines<1210,`GLB main should remain under 1210 lines; got ${totalLines}`);
for(const hook of modules.slice(1)){
 const base=hook.replace(/\.(ts|tsx)$/,'');
 assert(file.includes(`from "./${base}"`),`${hook} genuinely imported by live GLB renderer`);
 assert(!/test-?only|dummy|mock/i.test(texts[hook]),`${hook} contains production logic`);
}
const combined=Object.values(texts).join('\n');
assert.equal((combined.match(/\buseAnimations\s*\(/g)||[]).length,1,'exactly one GLB AnimationMixer');
assert(!/\buseAnimations\s*\(/.test(file),'mixer delegated to hook');
assert.match(texts['useGltfAnimationMixerV492.ts'],/groupPhraseV329\.register\(/,'group phrase registration stays with mixer');
assert.match(texts['useGltfAnimationMixerV492.ts'],/preparedBlendsV492\.some\(/,'synthetic clips are not selectable as base dance');
// Type contract: SkeletonUtils.clone returns Object3D, not necessarily Group.
// Keep the true group root ref for foot-IK, but allow a generic cloned scene as model.
assert.match(texts['useGltfFootContactV492.ts'],/model:Object3D/,'foot contact accepts cloned Object3D');
assert.match(texts['useGltfFootContactV492.ts'],/root:RefObject<Group\|null>/,'foot contact keeps actual Group root');
assert.match(texts['useGltfVocalMotionV492.ts'],/model:Object3D/,'vocal hook accepts cloned Object3D');
assert(!/model:Group/.test(texts['useGltfFootContactV492.ts']+texts['useGltfVocalMotionV492.ts']),'hooks must not require Group model');
assert.match(texts['useGltfFootContactV492.ts'],/updateFootIK\(/,'real V135 foot IK invoked');
assert.match(texts['useGltfFootContactV492.ts'],/updateFootContact\(/,'foot contact fallback retained');
assert.match(texts['useGltfFootContactV492.ts'],/FOOT_LOCK_DIAGNOSTIC_EVENT_V322/,'existing foot-lock event retained');
assert.match(texts['useGltfFootContactV492.ts'],/groupGroundV487\.current/,'live grounded GLB observation retained');
assert(!/\bupdateFootIK\s*\(/.test(file),'foot IK delegated out of main render body');
assert.match(texts['useGltfBlendSetupV492.ts'],/chooseLiveBlendPresetV492\(/,'saved blend chooses source-matched clips');
assert.match(texts['useGltfBlendSetupV492.ts'],/isPreviewBlendTrackV491\(/,'only safe overlay channels');
assert.match(texts['useGltfBlendSetupV492.ts'],/output\.length>=8/,'preset limit preserved');
assert.match(texts['useGltfClipTransitionsV492.ts'],/planNaturalGlbMotionV489\(/,'grounded low-pose transitions retained');
assert.match(texts['useGltfClipTransitionsV492.ts'],/findMotionMatch\(/,'pose matching preserved');
assert.match(texts['useGltfClipTransitionsV492.ts'],/readDancePerformanceV311\(/,'clip transition polish preserved');
assert.match(texts['useGltfBlendPlaybackV492.ts'],/planUpperBlendV490\(/,'auto upper gestures retained');
assert.match(texts['useGltfBlendPlaybackV492.ts'],/targetBlendWeight\(/,'manual overlay retained');
assert.match(texts['useGltfBlendPlaybackV492.ts'],/activeLiveBlendV492/,'saved preset overlay playback retained');
assert.match(texts['useGltfVocalMotionV492.ts'],/resolveVocalDanceAccentV472\(/,'music/vocal reactive motion preserved');
assert.match(texts['gltfVocalPerformanceV492.ts'],/applyVocalStageOverlayV371\(/,'coordinated vocal body overlays retained');
assert.match(texts['gltfVocalPerformanceV492.ts'],/manualSingingSlotsV385/,'manual singer priority retained');
assert(!file.includes('applyVocalStageOverlayV371('),'vocal compositor truly extracted');
const order=['applyAvatarRigMotion(', 'applyPartnerLook(', 'applyPartnerGesture(', 'applyGltfVocalPerformanceV492(', 'updatePartnerHandIK(', 'updateFootGrounding('];
let last=-1;
for(const term of order){const idx=file.indexOf(term);assert(idx>last,`frame order: ${term}`);last=idx;}
assert(!texts['useGltfFootContactV492.ts'].includes('useFrame('),'IK must run inside original frame loop only');
assert(!texts['gltfVocalPerformanceV492.ts'].includes('useFrame('),'vocal overlays in original frame loop only');
assert.match(file,/export function GltfAvatar\(/,'original public entry preserved');
console.log(`PASS V492 GLB hooks: ${modules.length} modules, ${totalLines} GLB entry lines, single mixer, frame order, singer priority, manual/auto presets, foot-IK/ground diagnostics`);
