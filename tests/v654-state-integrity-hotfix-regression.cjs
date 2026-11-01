'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {load}=require('./helpers/ts-loader-v404.cjs');
const read=name=>fs.readFileSync(name,'utf8');
const {createUnifiedBackup,parseUnifiedBackup,applyUnifiedBackup,groupForBackupKey}=load('services/settings/unifiedBackup');
const required={
 'sonic.character.motion.library.v190':'avatar',
 'sonic-display-glb-blend-presets-v492':'avatar',
 'sonic-camera-presets-v290':'timeline',
 'sonic-show-timeline-v354':'timeline'
};
const local=new Map(Object.keys(required).map((key,i)=>[key,JSON.stringify({value:i})]));
const storage={get length(){return local.size;},key:i=>[...local.keys()][i]??null,getItem:key=>local.get(key)??null,
 setItem:(key,value)=>local.set(key,value),removeItem:key=>local.delete(key)};
for(const [key,group] of Object.entries(required))assert.equal(groupForBackupKey(key),group,key);
const backup=createUnifiedBackup(storage);
assert.deepEqual(Object.keys(backup.entries).sort(),Object.keys(required).sort());
const roundtrip=parseUnifiedBackup(JSON.stringify(backup));
local.clear();
assert.equal(applyUnifiedBackup({data:roundtrip,newKeys:[],conflicts:[],same:[],counts:{avatar:2,timeline:2,device:0,genre:0,lighting:0,ui:0}},storage,{groups:['avatar','timeline'],overwrite:true}),4);
assert.equal(local.size,4);
assert.equal(groupForBackupKey('spotify-auth-token'),null);
assert.equal(groupForBackupKey('sonic-display:oauth:session'),null);
// Stored preferences must not crash the provider when storage is disabled or full.
const provider=read('context/UiPreferencesContext.tsx');
assert(/try\s*\{\s*window\.localStorage\.setItem\(/.test(provider));
assert(provider.includes('catch (error)'));
const playback=read('hooks/usePlaybackPolling.ts');
const context=read('context/MusicContext.tsx');
assert(playback.includes('invalidateSession=useCallback'));
assert(playback.includes('generation.current++')&&playback.includes('disconnected.current=true'));
assert(context.includes('invalidateSession();setTemporaryOverride(null);await disconnectSpotify()'));
assert(playback.includes('lyricsRetryAt.current')&&playback.includes('lyricsFailures.current'));
assert(playback.includes('if(data.track && !lyricsAbort.current'));
const upload=read('components/CharacterMotionBatchInstaller.tsx');
assert(upload.includes('...(shared?.sourceUrl ? {sharedMotionUrl:shared.sourceUrl'));
assert(!upload.includes('sharedMotionClipCount:shared?.clips||0'));
const preview=read('components/visualizer/AvatarPreview3D.tsx');
assert(preview.includes('p.id===old.id?preset:p'));
assert(preview.includes('selectedAction.current.paused = false'));
const dancer=read('components/visualizer/GltfDancerAvatarV492.tsx');
assert(dancer.includes('chooseCharacterMotion({...library,motions:installed}'));
const fade=read('components/visualizer/AutomaticLODAssetLoader.tsx');
assert(!fade.includes('object.material = Array.isArray(old)'));
assert(fade.includes('opacity * alpha'));
const {disposeMixerClipsV654}=load('components/visualizer/disposeMixerClipsV654');
for(let cycle=0;cycle<100;cycle++){
 const clip={id:cycle};const actions=new Map([[clip,{}]]);
 const mixer={stopAllAction(){},uncacheAction(value){actions.delete(value);}};
 disposeMixerClipsV654(mixer,[clip,clip]);
 assert.equal(actions.size,0,'all clip actions must be uncached');
}
const mixerSource=read('components/visualizer/useGltfAnimationMixerV492.ts');
assert(mixerSource.includes('disposeMixerClipsV654(groupMixerV328,playbackClips'));
assert(!/\buseAnimations\(/.test(mixerSource));
assert(mixerSource.includes('useFrame((_,delta)=>groupMixerV328.update(delta))'),'live mixer must continue advancing once per render frame');
const push=read('services/stageContent/useStageContentV330.ts');
assert(push.includes('reconnectTimer=setTimeout')&&push.includes('window.addEventListener("online",onOnline)'));
assert(push.includes('configAbort.abort()'));
console.log('PASS V654 state integrity: four backup keys roundtrip, storage failure guard, logout invalidation, lyric retry, upload, blend, seek, live materials, 100 action cleanups, live push retry');
