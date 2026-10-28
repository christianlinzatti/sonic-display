"use client";
import {useFrame} from "@react-three/fiber";
import {useEffect,useMemo,useRef} from "react";
import type {Mesh,Object3D} from "three";
import type {VisualizerProps} from "./registry";
import {expressiveFaceV390} from "./expressiveFacialV390";
import {composeRapFaceV406} from "./rapStagePerformanceV406";
import {enhanceExpressiveLipV453} from "./expressiveLipSyncV453";
import {refineAdvancedVocalV459} from "./advancedVocalPerformanceV459";
import {refineExpressiveLipV476} from "./expressiveLipSyncV476";
import {refineNaturalVocalExpressionV499} from "./naturalVocalExpressionV499";
import {refineDeutschrapLipV523} from "./advancedDeutschrapLipSyncV523";
import {coordinateRapFaceV526} from "./unifiedConcertPerformanceV526";
import {sampleWordConcertV567,coordinateWordFaceV567} from "./wordSyncedConcertV567";
import {planIntelligentConcertPerformanceV503,composeConcertFaceV503} from "./intelligentConcertPerformanceV503";
import {synchronizeRapExpressionV516} from "./naturalDeutschrapSyncV516";
import {planExpressiveRapV510,composeExpressiveRapFaceV510} from "./expressiveRapPerformanceV510";
import {getActivePerformanceTier} from "./adaptivePerformance";
import {calibrateMouthPoseV562} from "./advancedFacialCalibrationV562";
import {refineDeutschrapFaceV538} from "./deutschrapVocalPerformanceV538";
import {refineAdvancedRapArticulationV546} from "./advancedDeutschrapArticulationV546";
import {refineDeutschrapLipFlowV597,rapLipFlowRateV597} from "./advancedDeutschrapLipFlowV597";
import {refineExpressiveVocalFaceV612,expressiveVocalRateV612} from "./expressiveVocalFaceV612";
import {refineVocalFacialRealismV617,vocalFacialRateV617} from "./advancedVocalFacialRealismV617";
import {planAdvancedVocalLipSyncV631,vocalMouthRateV631} from "./advancedVocalLipSyncV631";
import {multiArtistMouthTargetV632} from "./multiArtistVocalDirectorV632";
import {sampleLiveVisemeV644} from "./phonemeLipSyncV644";
import {planExpressiveArtistV645,addExpressiveArtistFaceV645} from "./expressiveArtistPerformanceV645";
import {coordinateFullBodyPerformanceV618} from "./fullBodyPerformanceCoordinationV618";
import {planRapMouthDynamicsV572,rapMouthRateV572} from "./rapMouthDynamicsV572";
import {planNaturalRapExpressionV573,applyNaturalRapExpressionV573} from "./naturalRapFaceV573";
import {planVerifiedEyeContactV574} from "./verifiedEyeContactV574";
import {planCoherentRapFaceV581,addCoherentRapExpressionV581,coherentRapRateV581,additiveBoneAxisV581,releaseBoneAxisV581} from "./coherentRapFacialPerformanceV581";
import {planNaturalDanceFacialCoordinationV582,applyBodyBoneAxisV582,releaseBodyBoneAxisV582,type BodyBoneAxisV582} from "./naturalDanceFacialCoordinationV582";
import {resolveVocalPerformanceQualityV374} from "./vocalPerformanceQualityV374";
import {resolveFacialPoseV369,type FacialPoseV369} from "./facialPerformanceV369";
import {scanFacialRigV370,bindingsForFacialProfileV370,facialGainV370,sampleFacialDemoV370,type FacialProfileV370,type FacialChannelV370} from "./facialRigStudioV370";

type Channel = FacialChannelV370;
const channels:Channel[]=["jaw","wide","round","lipsClosed","smile","brow","blink","cheek","squint"];
const ZERO:Record<Channel,number>={jaw:0,wide:0,round:0,lipsClosed:0,smile:0,brow:0,blink:0,cheek:0,squint:0};
/** Morph overlays preserve authored animation and release their own previous contributions. */
export function VocalRigV368({model,lipSync,audio,genre,reducedMotion=false,avatarSlot=0,trackId="",sectionV503=null,authoredPriorityV499=false,footIKV618,footIKEnabledV618=false,profileV370,previewPoseV370,demoV370="off",previewTargetV383}: {
  model:Object3D;
  lipSync?:VisualizerProps["lipSync"];
  audio:VisualizerProps["audio"];
  genre?:string|null;
  reducedMotion?:boolean;
  avatarSlot?:number;
  trackId?:string;
  sectionV503?:string|null;
  authoredPriorityV499?:boolean;
  /** Previous-frame V492 IK observation; optional in previews, never inferred. */
  footIKV618?:{current:{left?:{contact:{phase:string;confidence:number}}|null;right?:{contact:{phase:string;confidence:number}}|null}};
  footIKEnabledV618?:boolean;
  profileV370?:FacialProfileV370;
  /** Preview overrides lyric analysis but uses the exact same rendering/overlay path. */
  previewPoseV370?:Partial<FacialPoseV369>;
  demoV370?: "off" | "rap" | "singing";
  /** Isolated morph audition; takes precedence over the complete facial pose and lyric automation. */
  previewTargetV383?:{id:string;weight:number}|null;
}) {
  const scan=useMemo(()=>scanFacialRigV370(model),[model]);
  const targets=useMemo(()=>{
    const bound=bindingsForFacialProfileV370(scan,profileV370);
    const assigned=new Set(bound.map(m=>m.id));
    // All blendshapes must be auditionable, including unnamed / disabled / unrecognized ones.
    // Tracking their previous overlay also allows a clean release on switching channels.
    const unbound=scan.targets.filter(m=>!assigned.has(m.id)).map(m=>({...m,channel:null,delta:0}));
    return {morphs:[...bound,...unbound],jawBone:scan.jawBone,hasJawMorph:bound.some(m=>m.channel==="jaw")};
  },[scan,profileV370]);
  const current=useRef<Record<Channel,number>>({...ZERO});
  const lastJaw=useRef(0);
  // Reuse scanned eye bones; overlay and later subtract OUR contribution only.
  // Models without independent eye bones still have the V573 morph expression.
  const eyeBonesV574=useMemo(()=>{
    const eyes:{bone:Object3D;lastYaw:number;lastPitch:number;renderedYaw:number;renderedPitch:number}[]=[];
    model.traverse(object=>{
      if(object.type!=='Bone')return;
      const name=object.name.toLowerCase().replace(/[.\-_ ]/g,'');
      if(/^(?:eyeleft|eyeright|lefteye|righteye|eyel|eyer|mixamoeyeleft|mixamoeyeright)$/.test(name))
        eyes.push({bone:object,lastYaw:0,lastPitch:0,renderedYaw:0,renderedPitch:0});
    });
    return eyes.slice(0,2);
  },[model]);
  // V581: opt-in head-bone micro overlay. No synthetic head object is created.
  // Limit to a real head Bone (never the root/neck/spine or facial control mesh).
  const headBoneV581=useMemo(()=>{
    const heads:Object3D[]=[];
    model.traverse(object=>{
      if(heads.length||object.type!=='Bone')return;
      const name=object.name.toLowerCase().replace(/[.\-_ ]/g,'');
      if(/^(?:head|mixamorighead|armaturehead|bip001head)$/.test(name))heads.push(object);
    });
    // TypeScript does not narrow variables assigned inside traverse callbacks.
    return heads[0]??null;
  },[model]);
  const headOverlayV581=useRef({lastPitch:0,lastYaw:0,renderedPitch:0,renderedYaw:0});
  // V582: upper-body only; never touches pelvis, legs, feet or animation clips.
  // Strict real GLB bone names. No synthetic rig bones are created.
  const upperBodyBonesV582=useMemo(()=>{
    let chest:Object3D|null=null,left:Object3D|null=null,right:Object3D|null=null;
    model.traverse(node=>{
      if(node.type!=='Bone')return;
      const name=node.name.toLowerCase().replace(/[.\-_ ]/g,'');
      if(!chest&&/^(?:chest|upperchest|spine2|spine03|mixamorigspine2|mixamorigchest|bip001spine2)$/.test(name))chest=node;
      if(!left&&/^(?:leftshoulder|shoulderleft|shoulderl|leftclavicle|clavicleleft|lclavicle|mixamorigleftshoulder)$/.test(name))left=node;
      if(!right&&/^(?:rightshoulder|shoulderright|shoulderr|rightclavicle|clavicleright|rclavicle|mixamorigrightshoulder)$/.test(name))right=node;
    });
    const bind=(bone:Object3D|null,axis:'x'|'z'):BodyBoneAxisV582|null=>bone?{bone,axis,last:0,rendered:0}:null;
    return [bind(chest,'x'),bind(chest,'z'),bind(left,'z'),bind(right,'z')] as const;
  },[model]);
  // V618: real upper-arm bones only. No animation clips, artificial bones or new
  // render loop. The same V582 additive/release helper preserves GLB keyframes.
  const upperArmBonesV618=useMemo(()=>{
    const left:Object3D[]=[];const right:Object3D[]=[];
    model.traverse(node=>{
      if(node.type!=='Bone')return;
      const name=node.name.toLowerCase().replace(/[.\-_ ]/g,'');
      if(!left.length&&/^(?:leftarm|leftupperarm|upperarmleft|mixamorigleftarm)$/.test(name))left.push(node);
      if(!right.length&&/^(?:rightarm|rightupperarm|upperarmright|mixamorigrightarm)$/.test(name))right.push(node);
    });
    const bind=(bone:Object3D|undefined):BodyBoneAxisV582|null=>bone?{bone,axis:'x',last:0,rendered:0}:null;
    return [bind(left[0]),bind(right[0])] as const;
  },[model]);
  const lastClockV453=useRef<{time:number;lyrics:unknown}|null>(null);
  useEffect(()=>()=>{
    for (const target of targets.morphs) {
      const inf=target.mesh.morphTargetInfluences;
      if (inf) inf[target.index]=Math.max(0,Math.min(1,inf[target.index]-target.delta));
      target.delta=0;
    }
    if (targets.jawBone) targets.jawBone.rotation.x-=lastJaw.current;
    lastJaw.current=0;
    for(const boneAxis of upperBodyBonesV582)releaseBodyBoneAxisV582(boneAxis);
    for(const armAxis of upperArmBonesV618)releaseBodyBoneAxisV582(armAxis);
    if(headBoneV581){
      const o=headOverlayV581.current;
      headBoneV581.rotation.x=releaseBoneAxisV581(headBoneV581.rotation.x,o.lastPitch,o.renderedPitch);
      headBoneV581.rotation.y=releaseBoneAxisV581(headBoneV581.rotation.y,o.lastYaw,o.renderedYaw);
      o.lastPitch=0;o.lastYaw=0;
    }
    for(const eye of eyeBonesV574){
      // The GLB mixer may already have rewritten an authored eye rotation.
      if(Math.abs(eye.bone.rotation.y-eye.renderedYaw)<.0001)eye.bone.rotation.y-=eye.lastYaw;
      if(Math.abs(eye.bone.rotation.x-eye.renderedPitch)<.0001)eye.bone.rotation.x-=eye.lastPitch;
      eye.lastYaw=0;eye.lastPitch=0;
    }
  },[targets,eyeBonesV574,headBoneV581,upperBodyBonesV582,upperArmBonesV618]);
  useFrame((state,dt)=>{
    const coordinated=demoV370==="off" && !previewPoseV370 && !previewTargetV383 ? resolveVocalPerformanceQualityV374(
      lipSync?.lyrics??null,lipSync?.progressMs??0,lipSync?.playing??false,{
        enabled:lipSync?.coordinationEnabledV372??true,
        alignment:lipSync?.coordinationStrengthV372??70,timingOffsetMs:lipSync?.coordinationOffsetMsV372??0,
        rapSyllableEnabledV419:lipSync?.rapSyllableEnabledV419??false,rapSyllableStrengthV419:lipSync?.rapSyllableStrengthV419??65,rapSyllableSmoothnessV419:lipSync?.rapSyllableSmoothnessV419??70,rapSyllableEditsEnabledV420:lipSync?.rapSyllableEditsEnabledV420??false,rapSyllableTrackIdV420:lipSync?.rapSyllableTrackIdV420??"",rapSyllableDocumentV420:lipSync?.rapSyllableDocumentV420??null,rapAudioEnabledV423:lipSync?.rapAudioEnabledV423??false,rapAudioStrengthV423:lipSync?.rapAudioStrengthV423??45,rapAudioOffsetMsV423:lipSync?.rapAudioOffsetMsV423??0,rapAudioTrackIdV423:lipSync?.rapAudioTrackIdV423??"",rapAudioDocumentV423:lipSync?.rapAudioDocumentV423??null,reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,qualityEnabledV374:lipSync?.qualityEnabledV374??true,mouthSmoothnessV374:lipSync?.mouthSmoothnessV374??65,rapGestureCalmV374:lipSync?.rapGestureCalmV374??70,naturalArticulationEnabledV384:lipSync?.naturalArticulationEnabledV384??true,articulationStrengthV384:lipSync?.articulationStrengthV384??70,lipSealV384:lipSync?.lipSealV384??90,jawStabilityV384:lipSync?.jawStabilityV384??65,ensembleModeV374:lipSync?.ensembleModeV374??"lead",ensembleCountV374:lipSync?.ensembleCountV374??1,manualSingingSlotsV385:lipSync?.manualVocalCueRefV385?.current?.active?lipSync.manualVocalCueRefV385.current.singingSlots:undefined,stageLeaderV375:lipSync?.interactionCueRefV376?.current?.enabled?lipSync.interactionCueRefV376.current.leadSlot:lipSync?.performanceCueRefV375?.current?.enabled?lipSync.performanceCueRefV375.current.leadSlot:undefined,
        lipStrength:lipSync?.enabled?lipSync.strength:0,
        bodyEnabled:lipSync?.bodyEnabledV371??true,bodyStrength:lipSync?.bodyStrengthV371??60,
        style:lipSync?.style,genre,mode:lipSync?.mode,mids:audio.mids,
        expression:(lipSync?.expression??55)/100,jawFollow:lipSync?.jawFollowV369??65,
        avatarSlot,
      }) : null;
    const expressive = expressiveFaceV390({timeSeconds:(lipSync?.progressMs??0)/1000,slot:avatarSlot,playing:lipSync?.playing??false,active:!!lipSync?.enabled&&!!lipSync?.expressiveFaceEnabledV390&&demoV370==="off"&&!previewPoseV370&&!previewTargetV383,strength:lipSync?.expressiveFaceStrengthV390??45,reducedMotion:lipSync?.reducedMotionV390??false,rap:lipSync?.style==="rap"||genre?.toLowerCase().includes("rap"),energy:audio.mids,phrase:coordinated?.face?.jaw??0});
    const target:Record<Channel,number>=previewTargetV383 ? ZERO : demoV370!=="off"
      ? {...ZERO,...sampleFacialDemoV370(state.clock.elapsedTime,demoV370)}
      : previewPoseV370 ? {...ZERO,...previewPoseV370}
      : coordinated?.face??ZERO;
    if(expressive.blink||expressive.brow||expressive.smile||expressive.squint){
      target.blink=Math.max(target.blink,expressive.blink);
      target.brow=Math.max(target.brow,expressive.brow);
      target.smile=Math.max(target.smile,expressive.smile);
      target.squint=Math.max(target.squint,expressive.squint);
    }
    // V406 shares V405's verified word clock; preview/demo remain untouched.
    const rapFaceV406=(demoV370==="off"&&!previewPoseV370&&!previewTargetV383)
      ? composeRapFaceV406(target,coordinated,{
          playing:lipSync?.playing??false,reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
          enabled:lipSync?.enabled!==false&&lipSync?.coordinationEnabledV372!==false,
          slot:avatarSlot,energy:audio.mids,strength:lipSync?.expression,
        }) : target;
    const manualVocalV453=lipSync?.manualVocalCueRefV385?.current;
    const manualSilentV453=!!manualVocalV453?.active&&!manualVocalV453.singingSlots.includes(avatarSlot);
    const editsV453=lipSync?.rapSyllableEditsEnabledV420&&
      lipSync.rapSyllableDocumentV420!=null&&lipSync.rapSyllableTrackIdV420===lipSync.rapSyllableDocumentV420.trackId
      ?lipSync.rapSyllableDocumentV420.edits:undefined;
    const lipV453=enhanceExpressiveLipV453(lipSync?.lyrics??null,coordinated?{...coordinated,face:rapFaceV406}:null,
      {playing:lipSync?.playing??false,enabled:lipSync?.enabled!==false,
       reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
       manualSilent:manualSilentV453,editedWords:editsV453,intensity:lipSync?.strength??90,
       preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
         lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId});
    const lipV459=refineAdvancedVocalV459(lipSync?.lyrics??null,lipV453,
      coordinated?{...coordinated,face:rapFaceV406}:null,
      {playing:lipSync?.playing??false,enabled:lipSync?.enabled!==false,
       reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
       manualSilent:manualSilentV453,editedWords:editsV453,intensity:lipSync?.strength??90,
       preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
         lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId});
    const lipV476=refineExpressiveLipV476(lipSync?.lyrics??null,lipV459,
      coordinated?{...coordinated,face:rapFaceV406}:null,
      {playing:lipSync?.playing??false,enabled:lipSync?.enabled!==false,
       reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
       manualSilent:manualSilentV453,editedWords:editsV453,intensity:lipSync?.strength??90,
       preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
         lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId});
    const lipV499=refineNaturalVocalExpressionV499(lipV459,lipV476,{
      playing:lipSync?.playing??false,enabled:lipSync?.enabled!==false,
      reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      manualSilent:manualSilentV453,editedWords:editsV453,intensity:lipSync?.strength??90,
      preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
        lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId,
    },{
      trackId,cueTrackId:lipSync?.vocalTimeTrackIdV496??"",
      progressMs:lipSync?.progressMs??-1,playing:lipSync?.playing??false,
      enabled:lipSync?.vocalTimeEnabledV496===true,reducedMotion,
      avatarSlot,castCount:lipSync?.ensembleCountV374??1,
      segments:lipSync?.vocalTimeSegmentsV496,
      manualPriority:authoredPriorityV499||lipSync?.manualVocalEnabledV385===true&&!!lipSync.manualVocalAssignmentsV385?.length,
    });
    // V523: the GLB facial rig actually owns morphs AND jaw bone. Refine here,
    // not by adding a second competing jaw overlay to the stage rig.
    const lipV523=refineDeutschrapLipV523(lipSync?.lyrics??null,lipV499,
      coordinated?{...coordinated,face:rapFaceV406}:null,{
      playing:lipSync?.playing??false,enabled:lipSync?.enabled!==false&&!authoredPriorityV499,
      reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      manualSilent:manualSilentV453,editedWords:editsV453,intensity:lipSync?.strength??90,
      preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
        lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId,
      roleAllowed:(lipSync?.ensembleCountV374??1)===1 ||
        (!!manualVocalV453?.active&&manualVocalV453.singingSlots.includes(avatarSlot)) ||
        (lipSync?.vocalTimeEnabledV496===true&&trackId===lipSync?.vocalTimeTrackIdV496&&lipV499.activeV499),
    });
    const unifiedLipV526=coordinateRapFaceV526(lipV523,{
      lyrics:lipSync?.lyrics??null,effectiveTimeMs:coordinated?.effectiveTimeMs??-1,
      genre,playing:lipSync?.playing??false,reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      manualPriority:authoredPriorityV499||demoV370!=='off'||!!previewPoseV370||!!previewTargetV383,
    });
    // V503 adds only subtle brow/cheek emphasis on already timed rap words.
    // Manual face previews, authored GLB animations and calibrated mouth morphs
    // retain full control; no head/body motion is duplicated in this rig.
    const wordFaceV567=getActivePerformanceTier()==='low'?unifiedLipV526:coordinateWordFaceV567(unifiedLipV526,sampleWordConcertV567({
      lyrics:lipSync?.lyrics??null,timeMs:coordinated?.effectiveTimeMs??-1,
      playing:lipSync?.playing??false,reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
    }),{manualPriority:authoredPriorityV499||demoV370!=='off'||!!previewPoseV370||!!previewTargetV383,
      roleAllowed:lipV523.activeV523});
    const concertFaceV503=planIntelligentConcertPerformanceV503({
      trackId,progressMs:lipSync?.progressMs??-1,playing:lipSync?.playing??false,
      reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      enabled:lipSync?.enabled===true&&lipSync?.coordinationEnabledV372!==false,
      bodyEnabled:false,gesturesEnabled:false,faceEnabled:true,
      manualBodyPriority:true,manualFacePriority:authoredPriorityV499||demoV370!=="off"||!!previewPoseV370||!!previewTargetV383,
      genre,section:sectionV503,slot:avatarSlot,tier:getActivePerformanceTier(),
      wordVerified:coordinated?.confidence==="word",rap:coordinated?.vocal.style==="rap",
      focus:coordinated?.focus??0,rapidWord:lipV459.rapid,
      assignedSingers:manualVocalV453?.active&&
        (trackId===lipSync?.manualVocalTrackIdV385||trackId===lipSync?.vocalTimeTrackIdV496||
         trackId===lipSync?.rapDuetTrackIdV416)?manualVocalV453.singingSlots:undefined,
      beat:audio.beatStrength??0,energy:audio.energyEnvelope??0,
    });
    const lipV503=composeConcertFaceV503(wordFaceV567,concertFaceV503);
    const vocalTimeV510=lipSync?.vocalTimeEnabledV496===true&&
      trackId===lipSync?.vocalTimeTrackIdV496&&
      (lipSync?.ensembleCountV374??1)>1&&!!lipSync?.vocalTimeSegmentsV496?.length;
    let expressiveRapV510=planExpressiveRapV510({
      trackId,lyrics:lipSync?.lyrics,progressMs:lipSync?.progressMs??-1,
      effectiveTimeMs:coordinated?.effectiveTimeMs??-1,playing:lipSync?.playing??false,
      enabled:lipSync?.enabled===true&&lipSync?.coordinationEnabledV372!==false,
      reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      genre,section:sectionV503,slot:avatarSlot,castCount:lipSync?.ensembleCountV374??1,tier:getActivePerformanceTier(),
      verifiedWord:coordinated?.confidence==="word",rap:coordinated?.vocal.style==="rap",
      activeWord:coordinated?.vocal.activeWord,rapid:lipV459.rapid,
      joinedWords:lipV459.joinedWords,focus:coordinated?.focus??0,
      bodyEnabled:false,faceEnabled:true,gesturesEnabled:false,
      manualBodyPriority:true,
      manualFacePriority:authoredPriorityV499||demoV370!=="off"||!!previewPoseV370||!!previewTargetV383,
      assignedSingers:manualVocalV453?.active&&
        (trackId===lipSync?.manualVocalTrackIdV385||
         trackId===lipSync?.rapDuetTrackIdV416)?manualVocalV453.singingSlots:undefined,
      authoredRoleAllowed:(lipSync?.ensembleCountV374??1)===1||
        (vocalTimeV510&&lipV499.activeV499)||
        (!!manualVocalV453?.active&&
          (trackId===lipSync?.manualVocalTrackIdV385||trackId===lipSync?.rapDuetTrackIdV416)&&
          manualVocalV453.singingSlots.includes(avatarSlot)),
    });
    expressiveRapV510=synchronizeRapExpressionV516(expressiveRapV510,{lyrics:lipSync?.lyrics,effectiveTimeMs:coordinated?.effectiveTimeMs??-1,section:sectionV503});
    const lipV510=composeExpressiveRapFaceV510(lipV503,expressiveRapV510);
    // V538: layer only on an already verified rap word and authorised singer.
    // V420 edits / V423 audio lips / manual previews always take precedence.
    const optionsV538={
      lyrics:lipSync?.lyrics,effectiveTimeMs:coordinated?.effectiveTimeMs??-1,
      activeWord:coordinated?.vocal.activeWord,playing:lipSync?.playing??false,
      enabled:lipSync?.enabled===true,reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      rap:coordinated?.vocal.style==='rap',verifiedWord:coordinated?.confidence==='word'&&unifiedLipV526.activeV523,
      roleAllowed:(lipSync?.ensembleCountV374??1)===1||
        (!!manualVocalV453?.active&&manualVocalV453.singingSlots.includes(avatarSlot))||
        (vocalTimeV510&&lipV499.activeV499),
      manualSilent:manualSilentV453,manualPriority:authoredPriorityV499||demoV370!=='off'||!!previewPoseV370||!!previewTargetV383,
      preserveAudioMouth:!!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
        lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId,
      editedWords:editsV453,intensity:lipSync?.strength??90,section:sectionV503,energy:audio.mids,
    };
    const lipV538=refineDeutschrapFaceV538(lipV510,optionsV538);
    const lipV546=refineAdvancedRapArticulationV546(lipV538.frame,optionsV538);
    // V597 follows V546: shape verified connected words, never override closure.
    const lipV597=refineDeutschrapLipFlowV597(lipV546.frame,optionsV538,getActivePerformanceTier());
    // V573 has no mouth ownership: only brows, cheeks, squint after V546.
    const facialExpressionV573=getActivePerformanceTier()==='low'||demoV370!=='off'||!!previewPoseV370||!!previewTargetV383
      ?null:planNaturalRapExpressionV573(optionsV538);
    const expressiveFrameV573=facialExpressionV573?applyNaturalRapExpressionV573(lipV597.frame,facialExpressionV573):lipV597.frame;
    // V574 eye bones are optional and require a verified, track-bound V528 cast.
    const eyeCueV574=planVerifiedEyeContactV574({scene:lipSync?.cinematicSceneV528,trackId,slot:avatarSlot,
      timeMs:lipSync?.progressMs??-1,playing:lipSync?.playing??false,
      reducedMotion:reducedMotion||!!lipSync?.reducedMotionV390,
      manualPriority:authoredPriorityV499||demoV370!=='off'||!!previewPoseV370||!!previewTargetV383,
      enabled:lipSync?.eyeContactV371!==false,tier:getActivePerformanceTier()});
    // V581: verified dense word + singer, never guessed from artist credits.
    // Only a confirmed V385/V496 multi-avatar cast or a true solo is eligible.
    const castVerifiedV581=(lipSync?.ensembleCountV374??1)===1||
      (!!trackId.trim()&&!!manualVocalV453?.active&&trackId===lipSync?.manualVocalTrackIdV385&&
        manualVocalV453.singingSlots.includes(avatarSlot))||
      (!!trackId.trim()&&vocalTimeV510&&lipV499.activeV499);
    const mouthDynamicsV572=getActivePerformanceTier()==='low'?null:planRapMouthDynamicsV572(optionsV538);
    const coherentCueV581=planCoherentRapFaceV581({...optionsV538,
      cadence:mouthDynamicsV572,eye:eyeCueV574,tier:getActivePerformanceTier(),
      castVerified:castVerifiedV581});
    const expressiveFrameV581=addCoherentRapExpressionV581(expressiveFrameV573,coherentCueV581);
    // V612 remains a tiny verified-word expression layer AFTER V597/V581.
    // No authored keyframes or V562 jaw calibration are changed.
    const expressiveVocalV612=refineExpressiveVocalFaceV612(
      expressiveFrameV581,optionsV538,getActivePerformanceTier(),coherentCueV581);
    const facialRealismV617=refineVocalFacialRealismV617(
      expressiveVocalV612.frame,optionsV538,getActivePerformanceTier(),coherentCueV581,eyeCueV574);
    // V631 only alters response rates for already verified rapid-word targets.
    const mouthContinuityV631=planAdvancedVocalLipSyncV631(
      facialRealismV617.frame,optionsV538,getActivePerformanceTier());
    // V582 consumes the SAME verified word/singer cue as the face.
    // Each joint receives its own safely removable overlay; manual choreography wins.
    const bodyFaceCueV582=planNaturalDanceFacialCoordinationV582({
      faceCue:coherentCueV581,effectiveTimeMs:optionsV538.effectiveTimeMs,
      playing:optionsV538.playing,bodyEnabled:lipSync?.bodyEnabledV371!==false,
      authoredMotion:authoredPriorityV499||optionsV538.manualPriority,
      reducedMotion:optionsV538.reducedMotion,performanceTier:getActivePerformanceTier(),
      bodyStrength:lipSync?.bodyStrengthV371??60,energy:audio.mids,avatarSlot,
    });
    // V618 only augments the confirmed V582 cue when V617's exact word and
    // PREVIOUS frame's measured V492 foot support agree. Missing IK = V582.
    const leftIKV618=footIKEnabledV618?footIKV618?.current.left:null;
    const rightIKV618=footIKEnabledV618?footIKV618?.current.right:null;
    const coordinatedBodyV618=coordinateFullBodyPerformanceV618({
      body:bodyFaceCueV582,face:facialRealismV617,
      verifiedWordStartMs:coherentCueV581.wordStartMs,
      foot:{known:!!leftIKV618&&!!rightIKV618,
        leftPlanted:leftIKV618?.contact.phase==='planted',
        rightPlanted:rightIKV618?.contact.phase==='planted',
        leftConfidence:leftIKV618?.contact.confidence??0,
        rightConfidence:rightIKV618?.contact.confidence??0},
      playing:optionsV538.playing,enabled:lipSync?.bodyEnabledV371!==false,
      authoredMotion:authoredPriorityV499||optionsV538.manualPriority,
      reducedMotion:optionsV538.reducedMotion,tier:getActivePerformanceTier(),
      bodyStrength:lipSync?.bodyStrengthV371??60,energy:Math.max(0,Math.min(1,audio.mids)),
    });
    // V645: verified-word performer phrasing, no additional singer or emotion
    // inference. If V618 has no real IK-supported stance, arms stay untouched.
    const artistCueV645=planExpressiveArtistV645({
      trackId,avatarSlot,effectiveTimeMs:optionsV538.effectiveTimeMs,
      playing:optionsV538.playing,reducedMotion:optionsV538.reducedMotion,
      authoredPriority:authoredPriorityV499||optionsV538.manualPriority,
      tier:getActivePerformanceTier(),strength:lipSync?.expression??55,
      energy:Math.max(0,Math.min(1,audio.mids)),word:coherentCueV581,
      eye:eyeCueV574,body:coordinatedBodyV618,
    });
    const expressiveArtistFaceV645=addExpressiveArtistFaceV645(facialRealismV617.frame,artistCueV645);
    const supportedBodyV618=coordinatedBodyV618.body;
    applyBodyBoneAxisV582(upperBodyBonesV582[0],supportedBodyV618.chestPitch);
    applyBodyBoneAxisV582(upperBodyBonesV582[1],supportedBodyV618.chestRoll);
    applyBodyBoneAxisV582(upperBodyBonesV582[2],supportedBodyV618.leftShoulderRoll);
    applyBodyBoneAxisV582(upperBodyBonesV582[3],supportedBodyV618.rightShoulderRoll);
    applyBodyBoneAxisV582(upperArmBonesV618[0],Math.min(.00531,coordinatedBodyV618.leftArmPitch+artistCueV645.leftArmPitch));
    applyBodyBoneAxisV582(upperArmBonesV618[1],Math.min(.00531,coordinatedBodyV618.rightArmPitch+artistCueV645.rightArmPitch));
    if(headBoneV581){
      const o=headOverlayV581.current;
      // Mixer may have rewritten the authored keyframe; only undo our overlay
      // when it actually survived. Pitch/yaw are limited to <= 0.025 rad.
      const expressivePitchV612=Math.max(-.030,Math.min(.030,coherentCueV581.headPitch+expressiveVocalV612.headPitch+facialRealismV617.headPitch+artistCueV645.headPitch));
      const expressiveYawV612=Math.max(-.030,Math.min(.030,coherentCueV581.headYaw+expressiveVocalV612.headYaw+facialRealismV617.headYaw+artistCueV645.headYaw));
      headBoneV581.rotation.x=additiveBoneAxisV581(headBoneV581.rotation.x,expressivePitchV612,o.lastPitch,o.renderedPitch);
      headBoneV581.rotation.y=additiveBoneAxisV581(headBoneV581.rotation.y,expressiveYawV612,o.lastYaw,o.renderedYaw);
      o.lastPitch=expressivePitchV612;o.lastYaw=expressiveYawV612;
      o.renderedPitch=headBoneV581.rotation.x;o.renderedYaw=headBoneV581.rotation.y;
    }
    for(const eye of eyeBonesV574){
      const yaw=Math.max(-.065,Math.min(.065,eyeCueV574.yaw+coherentCueV581.eyeYawDelta+facialRealismV617.eyeYaw+artistCueV645.eyeYaw));
      const pitch=Math.max(-.04,Math.min(.04,eyeCueV574.pitch+coherentCueV581.eyePitchDelta+facialRealismV617.eyePitch+artistCueV645.eyePitch));
      // Subtract only if our overlay survived the mixer since the last frame.
      const keptYaw=Math.abs(eye.bone.rotation.y-eye.renderedYaw)<.0001?eye.lastYaw:0;
      const keptPitch=Math.abs(eye.bone.rotation.x-eye.renderedPitch)<.0001?eye.lastPitch:0;
      eye.bone.rotation.y+=yaw-keptYaw;
      eye.bone.rotation.x+=pitch-keptPitch;
      eye.lastYaw=yaw;eye.lastPitch=pitch;
      eye.renderedYaw=eye.bone.rotation.y;eye.renderedPitch=eye.bone.rotation.x;
    }
    // V572 changes the response speed ONLY for verified, dense Deutschrap words.
    // Existing morph targets, B/P/M closures and hand-authored poses remain authoritative.
    // Seeking or changing the song must not keep a previous singer's mouth shape.
    const clockV453=lipSync?.progressMs??0;
    const previousV453=lastClockV453.current;
    if(previousV453&&(previousV453.lyrics!==lipSync?.lyrics||clockV453<previousV453.time-200||
       clockV453>previousV453.time+1200))current.current={...ZERO};
    lastClockV453.current={time:clockV453,lyrics:lipSync?.lyrics};
    // Asymmetric attack/release keeps fast rap crisp without hard frame discontinuities.
    const delta=Math.max(0,Math.min(.12,Number.isFinite(dt)?dt:0));
    const sharedVocalSceneV632=lipSync?.multiArtistVocalRefV632?.current;
    // V644: manually time-aligned visemes only; never confuse V643 energy/onsets
    // with recognized phonemes. Preview, authored facial work and explicit
    // syllable/audio timing retain priority. Opt-in is memory-only and track-bound.
    const manualVisemeV644=demoV370==='off'&&!previewPoseV370&&!previewTargetV383&&
      !authoredPriorityV499&&!lipSync?.rapSyllableEditsEnabledV420&&
      !lipSync?.rapAudioEnabledV423&&lipSync?.enabled!==false
      ?sampleLiveVisemeV644(trackId,avatarSlot,clockV453,lipSync?.playing===true):null;
    for (const c of channels) {
      const articulatingV384=!!coordinated?.articulationV384.active;
      const mouthTargetV476=lipV476.activeV476?lipV476.face[c]:lipV459.face[c];
      const mouthTargetV499=concertFaceV503.active||expressiveRapV510.active?lipV510.face[c]:wordFaceV567.activeV523?wordFaceV567.face[c]:lipV499.activeV499?lipV499.face[c]:mouthTargetV476;
      const finalTargetV538=lipV538.active?lipV538.frame.face[c]:mouthTargetV499;
      // V561: the existing manual studio/demo target must actually reach the final
      // morph renderer. Previously later song refiners could overwrite it with silence.
      // Live-song operation follows the unchanged concert articulation pipeline.
      const finalTargetV546=(demoV370!=="off"||!!previewPoseV370||!!previewTargetV383)
        ? target[c] : lipV546.active?lipV546.frame.face[c]:finalTargetV538;
      // V573 cannot change any mouth channel, even when the V546 layer is idle.
      const finalTargetV597=lipV597.active?lipV597.frame.face[c]:finalTargetV546;
      const finalTargetV573=(facialExpressionV573?.active||coherentCueV581.active)&&
        (c==='brow'||c==='cheek'||c==='squint')?expressiveFrameV581.face[c]:finalTargetV597;
      const finalTargetV612=expressiveVocalV612.active?expressiveVocalV612.frame.face[c]:finalTargetV573;
      const finalTargetV617=facialRealismV617.active?facialRealismV617.frame.face[c]:finalTargetV612;
      // V645 only adds brow/cheek/squint to the active, verified word cue.
      // Explicit V644 visemes and existing lip closure remain fully authoritative.
      const finalTargetV645=artistCueV645.active&&
        (c==='brow'||c==='cheek'||c==='squint')?expressiveArtistFaceV645.face[c]:finalTargetV617;
      const directedTargetV632=multiArtistMouthTargetV632(sharedVocalSceneV632?.trackId===trackId?sharedVocalSceneV632:null,
        avatarSlot,c,finalTargetV645,demoV370!=='off'||!!previewPoseV370||!!previewTargetV383||
        authoredPriorityV499||!!lipSync?.rapSyllableEditsEnabledV420&&!!editsV453?.length||
        !!lipSync?.rapAudioEnabledV423&&!!lipSync.rapAudioDocumentV423&&
          lipSync.rapAudioTrackIdV423===lipSync.rapAudioDocumentV423.trackId);
      const alignedMouthV644=manualVisemeV644&&
        (c==='jaw'||c==='wide'||c==='round'||c==='lipsClosed')?manualVisemeV644[c]:null;
      const finalMouthTargetV644=alignedMouthV644??directedTargetV632;
      const speed=finalTargetV612>current.current[c] ? (c==="blink"?40:articulatingV384&&c==="lipsClosed"?lipV476.closureHz:lipV476.attackHz) : (c==="blink"?32:articulatingV384&&c==="lipsClosed"?Math.max(26,lipV476.releaseHz):lipV476.releaseHz);
      const attackingV581=finalTargetV546>current.current[c];
      const cadenceSpeedV572=speed*(mouthDynamicsV572?rapMouthRateV572(mouthDynamicsV572,c,attackingV581):1)*
        coherentRapRateV581(coherentCueV581,c,attackingV581)*
        rapLipFlowRateV597(lipV597,c,attackingV581);
      current.current[c]+=(finalMouthTargetV644-current.current[c])*(1-Math.exp(-cadenceSpeedV572*expressiveVocalRateV612(expressiveVocalV612,c,attackingV581)*vocalFacialRateV617(facialRealismV617,c,attackingV581)*
        vocalMouthRateV631(mouthContinuityV631,c,attackingV581,current.current[c],finalMouthTargetV644)*delta));
    }
    // V562 is opt-in per-avatar; keep solo morph audition unmodified.
    // The same post-filter applies to live show and real-GLB close-up preview.
    if(!previewTargetV383 && profileV370?.mouthCalibrationV562?.enabled){
      current.current=calibrateMouthPoseV562(current.current,profileV370.mouthCalibrationV562);
    }
    if (manualVisemeV644||coordinated?.articulationV384.active||lipV546.kind==='bilabial-onset') {
      // Preserve bilabial contact even during the attack/release filter. V383 gains remain authoritative.
      current.current.jaw=Math.min(current.current.jaw,1-current.current.lipsClosed*.985);
      current.current.wide*=1-current.current.lipsClosed*.20;
      current.current.round*=1-current.current.lipsClosed*.18;
    }
    for (const morph of targets.morphs) {
      const inf=morph.mesh.morphTargetInfluences;
      if (!inf) continue;
      // Source animation may write to this morph each frame. Subtract last applied overlay.
      const authored=Math.max(0,Math.min(1,inf[morph.index]-morph.delta));
      const gain=morph.channel==="brow" ? .8 : morph.channel==="smile" ? .65 : 1;
      const drive=previewTargetV383 ? (morph.id===previewTargetV383.id?Math.max(0,Math.min(1,previewTargetV383.weight)):0)
        : morph.channel ? current.current[morph.channel]*gain*facialGainV370(profileV370,morph.channel) : 0;
      // Opt-in V562 ceiling remains effective even when legacy per-channel gain > 1.
      const safeDrive=profileV370?.mouthCalibrationV562?.enabled&&morph.channel==='jaw'&&!previewTargetV383
        ?Math.min(drive,Math.max(.45,Math.min(1,profileV370.mouthCalibrationV562.jawCeiling||1))) :drive;
      const overlay=Math.min(1-authored,safeDrive);
      inf[morph.index]=authored+overlay;
      morph.delta=overlay;
    }
    if (targets.jawBone && !targets.hasJawMorph && profileV370?.mapping?.jaw!=="none") {
      const jawLimitV562=profileV370?.mouthCalibrationV562?.enabled
        ?Math.max(.45,Math.min(1,profileV370.mouthCalibrationV562.jawCeiling||1)):1;
      const jawValue=previewTargetV383?0:Math.min(jawLimitV562,current.current.jaw*facialGainV370(profileV370,"jaw"))*.20;
      const change=jawValue-lastJaw.current;
      targets.jawBone.rotation.x+=change;
      lastJaw.current=jawValue;
    }
  });
  return null;
}
