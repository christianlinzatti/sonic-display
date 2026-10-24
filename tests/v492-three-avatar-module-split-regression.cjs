'use strict';
// Contract test that inspects the actual split components, not a saved snapshot.
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../components/visualizer');
const {SOURCE_NAMES,combinedSources} = require('./helpers/threeAvatarSourcesV492.cjs');
const contents=Object.fromEntries(SOURCE_NAMES.map(x=>[x,fs.readFileSync(path.join(root,x),'utf8')]));
const all=combinedSources();
assert.equal(SOURCE_NAMES.length,13,'six actor modules, six GLB hooks and one vocal compositor');
assert(SOURCE_NAMES.every(n=>contents[n].startsWith('"use client";')));
const rootCode=contents['ThreeAvatar.tsx'];
assert(rootCode.split('\n').length<450,'public ThreeAvatar stays focused');
assert.match(rootCode,/export function ThreeAvatar\(/);
assert.match(rootCode,/from ['"]\.\/DanceFormationActorsV492['"]/);
assert.match(rootCode,/from ['"]\.\/GroupDancersV326SceneV492['"]/);
const ctx=contents['ThreeAvatarContextsV492.tsx'];
for(const name of ['GroupLowPoseContextV481','GroupFootSupportContextV486','GroupGroundObservationContextV487','PartnerLookContext','PartnerHandContext','GroupPhraseContextV329']){
 assert.match(ctx,new RegExp('export const '+name+'\\b'),'shared context declared once');
 assert.equal((all.match(new RegExp('(?:export )?const '+name+'\\s*=\\s*createContext','g'))||[]).length,1,`${name} never duplicated`);
}
for(const key of ['ProceduralDancerAvatarV492.tsx','GltfDancerAvatarV492.tsx','DanceFormationActorsV492.tsx','GroupDancersV326SceneV492.tsx']){
 assert(contents[key].includes('from \'./ThreeAvatarContextsV492\''),`${key} imports shared context`);
}
assert.match(contents['GltfDancerAvatarV492.tsx'],/function GltfAvatar\(/);
assert.match(contents['useGltfBlendSetupV492.ts'],/chooseLiveBlendPresetV492\(/);
assert.match(contents['useGltfFootContactV492.ts'],/updateFootIK\(/);
assert.match(contents['ProceduralDancerAvatarV492.tsx'],/function ProceduralAvatar\(/);
assert.match(contents['DanceFormationActorsV492.tsx'],/function FormationDancers\(/);
assert.match(contents['GroupDancersV326SceneV492.tsx'],/function GroupDancersV326\(/);
assert(!rootCode.includes('function GltfAvatar('),'GLB renderer extracted');
assert(!rootCode.includes('function ProceduralAvatar('),'procedural renderer extracted');
assert(!rootCode.includes('function GroupDancersV326('),'group renderer extracted');
assert(all.includes('planLowPosesV481')&&all.includes('planNaturalFullBodyV488')&&all.includes('createAutomaticUpperClipV490')&&all.includes('chooseLiveBlendPresetV492'));
console.log('PASS V492 module split: stable shared contexts, all dance bodies, original public entry, GLB/IK/presets and no duplicate source');
