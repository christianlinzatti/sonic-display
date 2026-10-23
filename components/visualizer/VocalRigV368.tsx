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
import {resolveVocalPerformanceQualityV374} from "./vocalPerformanceQualityV374";
import {resolveFacialPoseV369,type FacialPoseV369} from "./facialPerformanceV369";
import {scanFacialRigV370,bindingsForFacialProfileV370,facialGainV370,sampleFacialDemoV370,type FacialProfileV370,type FacialChannelV370} from "./facialRigStudioV370";

type Channel = FacialChannelV370;
const channels:Channel[]=["jaw","wide","round","lipsClosed","smile","brow","blink","cheek","squint"];
const ZERO:Record<Channel,number>={jaw:0,wide:0,round:0,lipsClosed:0,smile:0,brow:0,blink:0,cheek:0,squint:0};
/** Morph overlays preserve authored animation and release their own previous contributions. */
export function VocalRigV368({model,lipSync,audio,genre,reducedMotion=false,avatarSlot=0,profileV370,previewPoseV370,demoV370="off",previewTargetV383}: {
  model:Object3D;
  lipSync?:VisualizerProps["lipSync"];
  audio:VisualizerProps["audio"];
  genre?:string|null;
  reducedMotion?:boolean;
  avatarSlot?:number;
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
  const lastClockV453=useRef<{time:number;lyrics:unknown}|null>(null);
  useEffect(()=>()=>{
    for (const target of targets.morphs) {
      const inf=target.mesh.morphTargetInfluences;
      if (inf) inf[target.index]=Math.max(0,Math.min(1,inf[target.index]-target.delta));
      target.delta=0;
    }
    if (targets.jawBone) targets.jawBone.rotation.x-=lastJaw.current;
    lastJaw.current=0;
  },[targets]);
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
    // Seeking or changing the song must not keep a previous singer's mouth shape.
    const clockV453=lipSync?.progressMs??0;
    const previousV453=lastClockV453.current;
    if(previousV453&&(previousV453.lyrics!==lipSync?.lyrics||clockV453<previousV453.time-200||
       clockV453>previousV453.time+1200))current.current={...ZERO};
    lastClockV453.current={time:clockV453,lyrics:lipSync?.lyrics};
    // Asymmetric attack/release keeps fast rap crisp without hard frame discontinuities.
    const delta=Math.max(0,Math.min(.12,Number.isFinite(dt)?dt:0));
    for (const c of channels) {
      const articulatingV384=!!coordinated?.articulationV384.active;
      const mouthTargetV476=lipV476.activeV476?lipV476.face[c]:lipV459.face[c];
      const speed=mouthTargetV476>current.current[c] ? (c==="blink"?40:articulatingV384&&c==="lipsClosed"?lipV476.closureHz:lipV476.attackHz) : (c==="blink"?32:articulatingV384&&c==="lipsClosed"?Math.max(26,lipV476.releaseHz):lipV476.releaseHz);
      current.current[c]+=(mouthTargetV476-current.current[c])*(1-Math.exp(-speed*delta));
    }
    if (coordinated?.articulationV384.active) {
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
      const overlay=Math.min(1-authored,drive);
      inf[morph.index]=authored+overlay;
      morph.delta=overlay;
    }
    if (targets.jawBone && !targets.hasJawMorph && profileV370?.mapping?.jaw!=="none") {
      const jawValue=previewTargetV383?0:current.current.jaw*.20*facialGainV370(profileV370,"jaw");
      const change=jawValue-lastJaw.current;
      targets.jawBone.rotation.x+=change;
      lastJaw.current=jawValue;
    }
  });
  return null;
}
