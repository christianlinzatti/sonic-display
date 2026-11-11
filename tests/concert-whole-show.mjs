import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {AnimationMixer,Vector3} from 'three';
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js';
import {clone} from 'three/examples/jsm/utils/SkeletonUtils.js';
const require=createRequire(import.meta.url),load=require('./helpers/load-stage-typescript.cjs');
const {newCrewState,stepCrew,crewClipTime}=load('components/visualizer/sonicCrewDirector.ts');
const {PreviewClipPlayer}=load('components/visualizer/previewClipPlayer.ts');
const {collectAvatarRigNodes}=load('components/visualizer/avatarRigController.ts');
const {initializeFootIK,updateFootIK}=load('components/visualizer/avatarFootIK.ts');
const {prepareCrewReaction,applyCrewReaction}=load('components/visualizer/sonicCrewReaction.ts');
const {planNaturalDancePerformanceV630}=load('components/visualizer/naturalDancePerformanceV630.ts');
const {newShowAudit,sampleShowAudit}=load('lib/showQualityAudit.ts');
const {newConcertShowReview,sampleConcertShowReview,summarizeConcertShow}=load('lib/concertShowReview.ts');
const {newScoreCameraV1134,composeScoreCameraV1134}=load('lib/concertScoreV1134.ts');
const {lyrics}=require('./fixtures/concertMocksV1130.cjs'),{tempoEvents}=require('./fixtures/concertStressV1134.cjs');
const assets=[];
for(const slug of ['neon-pulse','luna-flow','festival-nova']){
 const bytes=readFileSync(`public/avatars/sonic/${slug}.glb`),g=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'');assets.push({slug,...g});
}
for(const showStyle of ['neon','cinema','groove','festival']){
 const cast=assets.map(asset=>{
  const model=clone(asset.scene),mixer=new AnimationMixer(model),targets=collectAvatarRigNodes(model).targets;
  return {...asset,model,mixer,targets,player:new PreviewClipPlayer(mixer,model),ik:initializeFootIK(model,targets),reaction:prepareCrewReaction(model),state:newCrewState(),selected:'',time:0,action:null,audit:newShowAudit(),point:new Vector3(),motifs:new Set()};
 });
 const source=`whole-${showStyle}`,review=newConcertShowReview(source,100000),cameraState=newScoreCameraV1134();let camera={x:0,y:1,z:8,fov:40},frames=0;
 for(let frame=0;frame<=104*30;frame++){
  const wall=frame/30,position=wall<40?wall:wall<44?40:wall-4,playing=wall<40||wall>=44;
  const bpm=tempoEvents.filter(e=>e.at<=position*1000).at(-1).bpm,observed=[];let cue;
  for(const [slot,rig] of cast.entries()){
   const result=stepCrew(rig.state,{trackId:source,modelId:'sonic-'+rig.slug,clips:rig.animations,progressMs:position*1000,durationMs:100000,lyrics,genre:'house',energy:.65,bpm,count:3,slot,playing,reducedMotion:false,manualPriority:false,stance:{left:rig.ik.left.contact.phase==='planted',right:rig.ik.right.contact.phase==='planted'},settings:{enabled:true,reactions:true,mode:'adaptive',showPlans:true,showStyle,poseAware:true}});
   rig.state=result.state;if(result.plan.story)cue=result.plan.story;
   if(result.plan.active){
    const clip=rig.animations.find(c=>c.name===result.plan.clip);assert(clip);rig.motifs.add(clip.name);const next=crewClipTime(result.plan,clip.duration);
    if(rig.selected!==clip.name){
     const transition=planNaturalDancePerformanceV630({outgoing:rig.animations.find(c=>c.name===rig.selected),incoming:clip,outgoingSeconds:rig.time,incomingSeconds:next,baseSeconds:.55,bpm,plantedLeft:rig.ik.left.contact.phase==='planted',plantedRight:rig.ik.right.contact.phase==='planted',rapidSwitch:false,automatic:true,playing:true,reducedMotion:false});
     rig.action=rig.player.select(clip,next,transition.fadeSeconds);rig.selected=clip.name;
    }
    rig.time=next;
   }
   rig.player.update(rig.time,playing?1/30:0);
   updateFootIK(rig.ik,rig.model,1/30,playing&&result.plan.active,.7,.55,.65,undefined,undefined,undefined,{trackId:source,playheadMs:position*1000},{enabled:true,intensity:.55});
   applyCrewReaction(rig.reaction,result.plan,result.plan.beat,.65,1/30);rig.model.updateMatrixWorld(true);
   for(const foot of [rig.targets.leftFoot,rig.targets.rightFoot])assert(foot.getWorldPosition(rig.point).toArray().every(Number.isFinite));
   if(playing&&result.plan.active){
    const hips=rig.targets.hips.getWorldPosition(new Vector3()),left=rig.targets.leftFoot.getWorldPosition(new Vector3()),right=rig.targets.rightFoot.getWorldPosition(new Vector3());
    sampleShowAudit(rig.audit,{time:wall,hips,left,right,leftPlanted:rig.ik.left.contact.phase==='planted'&&rig.ik.left.contact.confidence>.6,rightPlanted:rig.ik.right.contact.phase==='planted'&&rig.ik.right.contact.confidence>.6});
    if(rig.action.getEffectiveWeight()>.5)observed.push({slot,clip:rig.selected});
   }else rig.audit.last=undefined;
  }
  if(cue){
   // This is a PLANNED camera check, never presented as a rendered measurement.
   camera=composeScoreCameraV1134({x:0,y:1,z:8,fov:40},cue,cameraState,{playing,reducedMotion:false,protectedShot:false,nowMs:wall*1000},camera);assert(Object.values(camera).every(Number.isFinite));
  }
  sampleConcertShowReview(review,{source,nowMs:wall*1000,positionMs:position*1000,durationMs:100000,playing,eligible:true,reading:cue?.reading??false,intentionalMotif:!!cue?.memory||!!cue?.dialogue||cue?.act!=='story',clips:observed});frames++;
 }
 const report=summarizeConcertShow(review);assert(report.fullSong&&report.coverage>.99);assert(report.crewMs>60000&&report.crewMs<90000,'Quiet passages and clip fades must not be counted as continuous dancing: '+JSON.stringify(report));assert.equal(report.cameraMs,0);assert.equal(report.lyricMs,0);assert.deepEqual(report.warnings,[]);
 for(const rig of cast){assert(rig.audit.samples>2000);assert(rig.audit.plantedSeconds>1);assert(rig.motifs.size>=3);rig.player.dispose();rig.mixer.stopAllAction();rig.mixer.uncacheRoot(rig.model);}
 console.log(`PASS whole show ${showStyle}: ${frames} complete-song frames, three real GLB mixers/IK rigs, tempo changes and pause, ${Math.round(report.coverage*100)}% playback coverage; rendered camera/lyric data correctly absent`);
}
