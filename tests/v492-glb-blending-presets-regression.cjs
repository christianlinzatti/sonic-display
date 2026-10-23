'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const p=load('components/visualizer/glbBlendPresetsV492');
const read=(f)=>fs.readFileSync(f,'utf8');
const clip=(id,name,tracks)=>({id,name,duration:2,tracks:tracks.map(name=>({name}))});
const safe=['mixamorigLeftArm.quaternion','mixamorigRightArm.quaternion','Armature/Spine2.quaternion'];
const forbidden=['Hips.position','Hips.quaternion','LeftFoot.quaternion','LeftHand.quaternion','Head.quaternion','Chest.position'];
const refs=[clip('embedded:0','Squat',['LeftLeg.quaternion']),clip('embedded:1','Rap Gesture',[...safe,...forbidden]),clip('external:0','Low Bounce',safe)];
const preset={version:1,id:'preset-1',name:'Hocke + Rap',modelUrl:'/avatar.glb',animationUrl:'',
 base:{id:'embedded:0',name:'Squat'},overlay:{id:'embedded:1',name:'Rap Gesture'},region:'upper',weight:.34,genre:'rap',autoEnabled:true};
assert(p.validBlendPresetV492(preset));
for(const change of [{weight:NaN},{weight:Infinity},{weight:-.1},{weight:0},{weight:1},
 {name:'x'.repeat(61)},{id:''},{base:{...preset.overlay}},{overlay:{id:'external:x',name:'Rap Gesture'}},
 {region:'all'},{genre:'junk'},{modelUrl:''},{autoEnabled:'true'},{version:2}]){
 assert(!p.validBlendPresetV492({...preset,...change}),`bad preset accepted: ${JSON.stringify(change)}`);
}
const json=p.serializeBlendPresetsV492([preset]);
assert.deepEqual(p.parseBlendPresetsV492(json),[preset]);
assert.equal(p.parseBlendPresetsV492(p.serializeBlendPresetsV492([preset,preset])).length,1);
assert.deepEqual(p.scopedBlendPresetsV492([preset],'/avatar.glb',''),[preset]);
assert.deepEqual(p.scopedBlendPresetsV492([preset],'/other.glb',''),[]);
assert.deepEqual(p.mergeBlendPresetsV492([], [preset]),[preset]);
assert.equal(p.mergeBlendPresetsV492([preset],[{...preset,name:'Neu'}]).length,1);
assert.equal(p.mergeBlendPresetsV492([preset],[{...preset,name:'Neu'}])[0].name,'Neu');
for(const bad of ['x','{}','[]','{"format":"sonic-glb-blends-v492","version":1,"presets":[null]}',
 p.serializeBlendPresetsV492([preset]).replace('"autoEnabled": true','"autoEnabled": "true"'),'x'.repeat(128001)]){
 assert.throws(()=>p.parseBlendPresetsV492(bad));
}
assert.throws(()=>p.mergeBlendPresetsV492([],Array.from({length:41},(_,i)=>({...preset,id:`unique-${i}`}))));
assert.equal(p.resolvePresetPreviewV492(preset,refs)?.trackNames.length,3);
assert.equal(p.resolvePresetPreviewV492({...preset,region:'arms'},refs)?.trackNames.length,2);
assert.equal(p.resolvePresetPreviewV492(preset,refs.filter(c=>c.id!=='embedded:1')),null);
assert.equal(p.resolvePresetPreviewV492(preset,[refs[0],{...refs[1],name:'Changed'}]),null);
assert.equal(p.resolvePresetPreviewV492(preset,[refs[0],{...refs[1],tracks:forbidden.map(name=>({name}))}]),null);
assert.equal(p.resolvePresetPreviewV492(preset,[refs[0],{...refs[1],duration:0}]),null);
const live=refs.map(c=>({...c,name:c.id.startsWith('external:')?`Imported: ${c.name}`:c.name}));
const chosen=p.chooseLiveBlendPresetV492([preset],live,preset.modelUrl,preset.animationUrl,'Squat','Deutschrap');
assert(chosen&&chosen.preset===preset&&chosen.overlay.name==='Rap Gesture');
assert.deepEqual(chosen.trackNames,safe);
for(const variants of [
 {url:'/other.glb'}, {animation:'/other-anim.glb'}, {base:'Dance'}, {genre:'hardstyle'},
 {presets:[{...preset,autoEnabled:false}]}, {presets:[{...preset,base:{...preset.base,name:'Dance'}}]},
 {clips:[live[0],{...live[1],name:'Renamed'}]},
 {clips:[...live,{...live[1],id:'embedded:20'}]},
 {clips:[live[0],{...live[1],tracks:forbidden.map(name=>({name}))}]},
 ]){
  assert.equal(p.chooseLiveBlendPresetV492(variants.presets??[preset],variants.clips??live,variants.url??preset.modelUrl,
    variants.animation??preset.animationUrl,variants.base??'Squat',variants.genre??'Deutschrap'),null,JSON.stringify(variants));
}
assert(p.matchesBlendGenreV492('hard','Hardtekk'));assert(p.matchesBlendGenreV492('rap','Hip-Hop'));assert(!p.matchesBlendGenreV492('rap','Hardstyle'));
assert(p.matchesBlendGenreV492('all','jazz'));
// The automatic mixer must not take over manually authored choreography, timeline or IK channels.
const stage=read('components/visualizer/ThreeAvatar.tsx');
for(const fragment of ['preparedBlendsV492=useMemo','chooseLiveBlendPresetV492([preset],clips','new AnimationClip(actionName,match.overlay.duration,safe)',
 'name !== activeLiveBlendV492?.actionName','const activeLiveBlendV492=','!activeSequence&&!activeLoop&&!avatarBlendEnabled',
 '!groupClockV328?.settings.enabled','!activeLiveBlendV492','action.setEffectiveWeight(livePresetWeightV492.current)',
 'footIK.current.left?.contact.phase',"window.addEventListener(GLB_BLEND_CHANGE_V492,refresh)",
 '...preparedBlendsV492.map(p=>p.clip)'])assert(stage.includes(fragment),`missing live wiring: ${fragment}`);
assert(stage.indexOf('preparedBlendsV492=useMemo')<stage.indexOf('useAnimations(playbackClips, root)'));
assert(stage.includes('import { AnimationClip, type Group, type Mesh } from "three";'),'AnimationClip must be a runtime import for constructing masked clips');
const preview=read('components/visualizer/AvatarPreview3D.tsx');
for(const fragment of ['GLB Blending Preset Studio · V492','readBlendPresetsV492()', 'writeBlendPresetsV492(updated)',
 'parseBlendPresetsV492(await file.text())','mergeBlendPresetsV492','serializeBlendPresetsV492',
 'setBlendV491({enabled:true,sourceId:preset.overlay.id','setClipId(preset.base.id)',
 'disabled={!selectedBlendPresetV492||!currentPresetValidV492}', 'Preset-JSON importieren', 'Presets als JSON exportieren',
 'Bei passender Basisanimation automatisch in der Live-Show nutzen'])assert(preview.includes(fragment),`missing UI: ${fragment}`);
assert(read('package.json').includes('0.1.0-v492'));
console.log('PASS V492: strict import/export, scope, update/delete contract, missing clips, safe channels, genre, manual protection and live mixer');
