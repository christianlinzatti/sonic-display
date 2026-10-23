'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {load}=require('./helpers/ts-loader-v404.cjs');
const m=load('components/visualizer/automaticMultiArtistStageV442');
const bubble=load('components/visualizer/artistNameBubblesV441');
const camera=load('components/visualizer/multiArtistCameraV442');
const credits=[' Künstler A ','Künstler B','Künstler C','Künstler D','Künstler D',''];
const cast=m.planMultiArtistCastV442({artists:credits,enabled:true,avatarStage:true,reducedMotion:false,manualMode:false});
assert.deepEqual(cast.artists,['Künstler A','Künstler B','Künstler C','Künstler D']);
assert.equal(cast.count,4);assert.equal(cast.enabled,true);
assert.equal(m.planMultiArtistCastV442({artists:credits,maxCount:3,enabled:true,avatarStage:true,reducedMotion:false,manualMode:false}).count,3);
for(const input of [{enabled:false},{reducedMotion:true},{manualMode:true},{manualGroup:true},{avatarStage:false}]){
 const out=m.planMultiArtistCastV442({artists:credits,enabled:true,avatarStage:true,reducedMotion:false,manualMode:false,...input});
 assert.equal(out.enabled,false);assert.equal(out.count,1);
}
assert.equal(m.planMultiArtistCastV442({artists:['A','B'],enabled:true,avatarStage:true,reducedMotion:false,manualMode:false}).reason,'fallback');
assert.equal(m.featureFocusV442({count:4,phrase:3,scene:'verse'}).focus,3);
assert.deepEqual(m.featureFocusV442({count:4,phrase:2,scene:'hook'}),{focus:-1,group:true});
const lyrics={synced:true,lines:Array.from({length:24},(_,i)=>({startMs:i*1500,text:['erste Refrainzeile passt gut','zweite Refrainzeile auch'][i%2]}))};
assert.equal(m.multiArtistPhraseAtV442(lyrics,0,7),0);
assert.equal(m.multiArtistPhraseAtV442(lyrics,4*1500+5,0),1);
assert.equal(m.multiArtistPhraseAtV442(null,1000,3),3);
const group=m.planMultiArtistGroupV442({trackId:'track-test',count:4,lyrics,bpm:125});
assert.equal(group.songSync,true);assert.equal(group.trackId,'track-test');assert.equal(group.count,4);
assert(group.cues.length>2&&group.cues.length<65);assert.equal(group.modelIds.length,4);
assert(group.cues.every(c=>c.positions.length===4&&c.at>=0));
assert.equal(new Set(group.cues.map(c=>c.id)).size,group.cues.length,'unique cue ids');
const customized=m.planMultiArtistGroupV442({trackId:'new-song',count:3,modelIds:['','','local:extra.glb']});
assert.equal(customized.modelIds[2],'local:extra.glb');
assert(group.cues.every((c,i)=>!i||c.at>=group.cues[i-1].at));
const pose=load('components/visualizer/multiAvatarStageDirectorV326').evaluateGroupV326(group,9);
assert.equal(pose.positions.length,4);
const sparse=m.planMultiArtistGroupV442({trackId:'no-lyrics',count:3,lyrics:null});
assert.equal(sparse.cues.length,1);assert.equal(sparse.cues[0].positions.length,3);
const inferred=[{fromLine:0,toLine:23,leadSlot:0,partnerSlot:1,style:'solo',strength:60},
 {fromLine:12,toLine:15,leadSlot:0,partnerSlot:1,style:'hook',strength:65}];
const rotated=m.featureCameraAssignmentsV442(inferred,lyrics,4);
assert.deepEqual(rotated.filter(x=>x.style==='solo').slice(1,5).map(x=>x.leadSlot),[0,1,2,3]);
assert.equal(rotated.at(-1).style,'hook');
assert.equal(rotated.at(-1).fromLine,12);
const plan=bubble.planArtistBubblesV441({enabled:true,artists:cast.artists,visibleCount:cast.count,
 mode:'focus',scene:'verse',focusSlot:3,progressMs:9000,playing:true});
assert.equal(plan.bubbles.length,4);assert.equal(plan.activeSlot,3);
assert.equal(plan.bubbles[3].displayName,'Künstler D');
assert(bubble.planArtistBubblesV441({enabled:true,artists:cast.artists,visibleCount:4,
 scene:'hook',progressMs:12000,playing:true}).bubbles.every(b=>b.emphasized));
const neutral={x:0,y:.1,z:5.9,targetX:0,targetY:0,targetZ:0,fov:38};
const left=camera.frameMultiArtistCameraV442(neutral,{count:4,slot:0,group:false,lyricsProtected:false});
const right=camera.frameMultiArtistCameraV442(neutral,{count:4,slot:3,group:false,lyricsProtected:false});
assert(left.targetX<0&&right.targetX>0&&left.z>=6.5);
assert.equal(camera.frameMultiArtistCameraV442(neutral,{count:4,slot:2,group:true,lyricsProtected:true}).targetX,0);
assert.deepEqual(camera.frameMultiArtistCameraV442(neutral,{count:2,slot:1,group:false,lyricsProtected:false}),neutral);
const renderer=fs.readFileSync('components/visualizer/ThreeAvatar.tsx','utf8');
const stage=fs.readFileSync('components/visualizer/VisualizerStage.tsx','utf8');
const ui=fs.readFileSync('components/visualizer/AutoMotionIntelligencePanelV438.tsx','utf8');
for(const [src,txt] of [[renderer,'autoGroupOnV442'],[renderer,'effectiveGroupSettingsV442'],
  [renderer,'multiArtistMotionsV442?.[i]'],[renderer,'<ArtistNameBubbleV441 plan={props.artistBubblePlanV441} slot={i}'],
  [stage,'planMultiArtistCastV442'],[stage,'multiArtistCastCountV442'],
  [stage,'featureCameraAssignmentsV442'],[stage,'autoMultiArtistGroupV442={multiArtistGroupV442}'],
  [ui,'V442 · Multi-Artist Stage Director'],[ui,'rapMultiArtistEnabledV442'],[ui,'V442 Avatar ${index+3} Modell'],
  [fs.readFileSync('components/visualizer/StageCameraDirectorV289.tsx','utf8'),'frameMultiArtistCameraV442'],
  [fs.readFileSync('types/music.ts','utf8'),'rapMultiArtistMaxV442?:2|3|4'],
  [fs.readFileSync('context/UiPreferencesContext.tsx','utf8'),'rapMultiArtistEnabledV442:true']])
  assert(src.includes(txt),`Missing V442 integration: ${txt}`);
assert(/^0\.1\.0-v(?:44[2-9]|4[5-9][0-9]|[5-9][0-9]{2})$/.test(require('../package.json').version));
console.log('PASS V442: 3/4 credits, four world-space artist bubbles, phrase focus, hook ensembles, independent motions, manual priority, bounded camera framing');
