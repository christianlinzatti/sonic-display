"use client";
/** GLB wardrobe and music/vocal-reaction hooks, no additional render loop. */
import {useMemo,useEffect,useRef} from "react";
import {useFrame} from "@react-three/fiber";
import type {Object3D} from "three";
import type {VisualizerProps} from "./registry";
import {prepareAvatarWardrobeV468} from "./avatarWardrobeV468";
import {useAudioMotionEngine} from "@/hooks/useAudioMotionEngine";
import {resolveGenreMotionV471} from "./genreChoreographyV471";
import {resolveRapDuetCueV416} from "./rapDuetStudioV416";
import {resolveVocalDanceAccentV472} from "./vocalAwareChoreographyV472";
import {enhanceRapAccentV473} from "./rapFlowIntelligenceV473";
import {resolveNaturalRapGestureV474} from "./naturalRapGestureVarietyV474";
import {planRapPerformanceDynamicsV583} from "./rapPerformanceDynamicsV583";
import {refineNaturalConcertPerformanceV586} from "./naturalConcertPerformanceV586";
import {synchronizeRapAccentV516} from "./naturalDeutschrapSyncV516";
import {coordinateRapDanceV526} from "./unifiedConcertPerformanceV526";
import {getActivePerformanceTier} from "./adaptivePerformance";
import {sampleWordConcertV567,coordinateWordDanceV567} from "./wordSyncedConcertV567";
import {refineDeutschrapGestureV538} from "./deutschrapVocalPerformanceV538";
import {refineNaturalDeutschrapBodyV564} from './naturalDeutschrapBodyV564';
import {createMotionCorrectionStateV515,correctAutomaticAccentV515,resetMotionCorrectionV515} from "./intelligentMotionCorrectionV515";

type Args = Pick<VisualizerProps, 'audio'|'isPlaying'|'reducedMotion'|'genre'|'genreFusion'|'stagePalette'|
  'wardrobeModeV468'|'wardrobeColorV468'|'wardrobePatternV468'|'wardrobeGlowV468'|
  'audioMotionEnabledV468'|'audioMotionStrengthV468'|'avatarFootIKEnabled'|'track'|
  'cameraDirectorSection'|'showCue'|'avatarMotionMode'> & {
  model:Object3D; propsLipSyncV367:VisualizerProps['lipSync']; workloadSlot:number;
};
export function useGltfVocalMotionV492({model,audio,isPlaying,reducedMotion,genre,genreFusion,
  stagePalette,wardrobeModeV468,wardrobeColorV468,wardrobePatternV468,wardrobeGlowV468,
  audioMotionEnabledV468,audioMotionStrengthV468,avatarFootIKEnabled,track,
  cameraDirectorSection,showCue,avatarMotionMode,propsLipSyncV367,workloadSlot}:Args) {
  const motionCorrectionV515=useRef(createMotionCorrectionStateV515());
  const correctionTrackV515=useRef<string|null>(null);
  useEffect(()=>{resetMotionCorrectionV515(motionCorrectionV515.current);correctionTrackV515.current=null;},[model]);
  const wardrobeV468=useMemo(()=>prepareAvatarWardrobeV468(model),[model]);
  useEffect(()=>()=>wardrobeV468.dispose(),[wardrobeV468]);
  const musicMotionV468=useAudioMotionEngine({intensity:(audioMotionStrengthV468??45)/100,protectFootIK:avatarFootIKEnabled});
  useEffect(()=>musicMotionV468.bindBones(model),[model,musicMotionV468.bindBones]);
  useFrame((_,delta)=>{
    const palette=wardrobeModeV468==='custom'?(wardrobeColorV468??'#de38fa'):(stagePalette?.primary??'#628cf9');
    wardrobeV468.apply(wardrobeModeV468==='album'&&!stagePalette?.primary?'off':(wardrobeModeV468??'album'),palette,delta,isPlaying,wardrobePatternV468??'original',wardrobeGlowV468??35);
    const genreCue=resolveGenreMotionV471({genre,fusion:genreFusion,section:showCue?.enabled?showCue.section:(cameraDirectorSection??'verse'),playing:isPlaying,reducedMotion,energy:audio.energyEnvelope,authored:avatarMotionMode==='choreography'});
    // V472: only timed lyric cues, with OPTIONAL authored singer/feature roles.
    // Anonymous features never become invented singer assignments.
    const authoredVocalV472=!!track?.id&&propsLipSyncV367?.manualVocalCueRefV385?.current?.active&&
      (track.id===propsLipSyncV367.manualVocalTrackIdV385||
       track.id===propsLipSyncV367.vocalTimeTrackIdV496||
       track.id===propsLipSyncV367.rapDuetTrackIdV416)
        ?propsLipSyncV367.manualVocalCueRefV385.current:null;
    const assignedDuetV472=!authoredVocalV472?.active&&!!track?.id&&
      propsLipSyncV367?.rapDuetEnabledV416===true&&track.id===propsLipSyncV367.rapDuetTrackIdV416
        ?resolveRapDuetCueV416({lyrics:propsLipSyncV367.lyrics,progressMs:propsLipSyncV367.progressMs,
          playing:isPlaying,count:Math.max(1,propsLipSyncV367.ensembleCountV374??1),
          enabled:true,assignments:propsLipSyncV367.rapDuetAssignmentsV416,
          reducedMotion,manualPriority:avatarMotionMode==='choreography'}):null;
    const vocalV472=resolveNaturalRapGestureV474(enhanceRapAccentV473(resolveVocalDanceAccentV472({
      lyrics:propsLipSyncV367?.lyrics,progressMs:propsLipSyncV367?.progressMs,
      playing:isPlaying&&propsLipSyncV367?.playing!==false&&propsLipSyncV367?.enabled!==false,
      reducedMotion,rap:genreCue?.family==='rap',section:showCue?.enabled?showCue.section:cameraDirectorSection,
      slot:workloadSlot,authored:avatarMotionMode==='choreography',
      bodyEnabled:propsLipSyncV367?.bodyEnabledV371,gesturesEnabled:propsLipSyncV367?.gesturesV371,
      strength:(propsLipSyncV367?.bodyStrengthV371??60)/100,
      offsetMs:propsLipSyncV367?.coordinationOffsetMsV372,casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472,
    }),{
      lyrics:propsLipSyncV367?.lyrics,progressMs:propsLipSyncV367?.progressMs,
      offsetMs:propsLipSyncV367?.coordinationOffsetMsV372,
      playing:isPlaying&&propsLipSyncV367?.playing!==false&&propsLipSyncV367?.enabled!==false,
      rap:genreCue?.family==='rap',reducedMotion,
      section:showCue?.enabled?showCue.section:cameraDirectorSection,
    }),{trackId:track?.id,slot:workloadSlot,playing:isPlaying,reducedMotion,
       authored:avatarMotionMode==='choreography',section:showCue?.enabled?showCue.section:cameraDirectorSection}).accent;
    // V583: section-aware, deterministic dynamics on the same verified V472/V473
    // vocal accent. Do not replace authored clips or cast roles.
    const dynamicRapV583=planRapPerformanceDynamicsV583(vocalV472,{
      lyrics:propsLipSyncV367?.lyrics,progressMs:propsLipSyncV367?.progressMs,
      offsetMs:propsLipSyncV367?.coordinationOffsetMsV372,trackId:track?.id,slot:workloadSlot,
      playing:isPlaying&&propsLipSyncV367?.playing!==false&&propsLipSyncV367?.enabled!==false,
      rap:genreCue?.family==='rap',reducedMotion,authored:avatarMotionMode==='choreography',
      section:showCue?.enabled?showCue.section:cameraDirectorSection,
      performanceTier:getActivePerformanceTier(),
    });
    // V516: long-phrase Deutschrap motion, only with known word and singer evidence.
    // The V515 limiter still governs the resulting additive gesture targets.
    const synchronizedRapV516=synchronizeRapAccentV516(dynamicRapV583.accent,{
      lyrics:propsLipSyncV367?.lyrics,progressMs:propsLipSyncV367?.progressMs??-1,
      offsetMs:propsLipSyncV367?.coordinationOffsetMsV372,
      trackId:track?.id,slot:workloadSlot,count:propsLipSyncV367?.ensembleCountV374??1,
      playing:isPlaying&&propsLipSyncV367?.playing!==false,reducedMotion,
      rap:genreCue?.family==='rap',authored:avatarMotionMode==='choreography',
      section:showCue?.enabled?showCue.section:cameraDirectorSection,
      casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472,
    });
    // V515: only the automatic additive vocal channel is softened. Imported
    // mixer clips, choreography timelines, IK and the mouth/facial rig are not edited.
    if(correctionTrackV515.current!==(track?.id??null)){
      resetMotionCorrectionV515(motionCorrectionV515.current);
      correctionTrackV515.current=track?.id??null;
    }
    const unifiedRapV526=coordinateRapDanceV526(synchronizedRapV516,{
      lyrics:propsLipSyncV367?.lyrics,effectiveTimeMs:(propsLipSyncV367?.progressMs??-1)+
        (propsLipSyncV367?.coordinationOffsetMsV372??0),genre,trackId:track?.id,
      slot:workloadSlot,count:propsLipSyncV367?.ensembleCountV374??1,
      playing:isPlaying&&propsLipSyncV367?.playing!==false,reducedMotion,
      authored:avatarMotionMode==='choreography',
      casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472,
    });
    const refinedRapV538=refineDeutschrapGestureV538(unifiedRapV526,{
      lyrics:propsLipSyncV367?.lyrics,effectiveTimeMs:(propsLipSyncV367?.progressMs??-1)+
        (propsLipSyncV367?.coordinationOffsetMsV372??0),playing:isPlaying&&propsLipSyncV367?.playing!==false,
      rap:genreCue?.family==='rap',reducedMotion,authored:avatarMotionMode==='choreography',
      bodyEnabled:propsLipSyncV367?.bodyEnabledV371!==false,
      gesturesEnabled:propsLipSyncV367?.gesturesV371!==false,
      trackId:track?.id,slot:workloadSlot,count:propsLipSyncV367?.ensembleCountV374??1,
      casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472,
      section:showCue?.enabled?showCue.section:cameraDirectorSection,
    });
    const naturalBodyV564=refineNaturalDeutschrapBodyV564(refinedRapV538,{
      lyrics:propsLipSyncV367?.lyrics,effectiveTimeMs:(propsLipSyncV367?.progressMs??-1)+(propsLipSyncV367?.coordinationOffsetMsV372??0),
      playing:isPlaying&&propsLipSyncV367?.playing!==false,rap:genreCue?.family==='rap',reducedMotion,
      enabled:(audioMotionEnabledV468??true)&&propsLipSyncV367?.bodyEnabledV371!==false&&propsLipSyncV367?.gesturesV371!==false,
      authored:avatarMotionMode==='choreography',trackId:track?.id,slot:workloadSlot,count:propsLipSyncV367?.ensembleCountV374??1,
      casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472,
      section:showCue?.enabled?showCue.section:cameraDirectorSection,
      intensity:(propsLipSyncV367?.bodyStrengthV371??60)/100,beatStrength:audio.beatStrength,
    });
    // V586: existing word evidence and V583 section, never a new tempo or singer inference.
    const concertV586=refineNaturalConcertPerformanceV586(naturalBodyV564.accent,naturalBodyV564.pose,{
      lyrics:propsLipSyncV367?.lyrics,
      timeMs:(propsLipSyncV367?.progressMs??-1)+(propsLipSyncV367?.coordinationOffsetMsV372??0),
      trackId:track?.id,slot:workloadSlot,count:propsLipSyncV367?.ensembleCountV374??1,
      playing:isPlaying&&propsLipSyncV367?.playing!==false&&propsLipSyncV367?.enabled!==false,
      rap:genreCue?.family==='rap',reducedMotion,authored:avatarMotionMode==='choreography',
      enabled:(audioMotionEnabledV468??true)&&propsLipSyncV367?.bodyEnabledV371!==false&&propsLipSyncV367?.gesturesV371!==false,
      tier:getActivePerformanceTier(),mode:dynamicRapV583.mode,
    });
    const wordDanceV567=getActivePerformanceTier()==='low'?concertV586.accent:coordinateWordDanceV567(concertV586.accent,sampleWordConcertV567({
      lyrics:propsLipSyncV367?.lyrics,timeMs:(propsLipSyncV367?.progressMs??-1)+
        (propsLipSyncV367?.coordinationOffsetMsV372??0),
      playing:isPlaying&&propsLipSyncV367?.playing!==false,reducedMotion,
    }),{trackId:track?.id,slot:workloadSlot,count:propsLipSyncV367?.ensembleCountV374??1,
      authored:avatarMotionMode==='choreography',
      casting:authoredVocalV472?.active?authoredVocalV472:assignedDuetV472});
    const correctedVocalV515=correctAutomaticAccentV515(wordDanceV567,motionCorrectionV515.current,delta,{
      playing:isPlaying&&propsLipSyncV367?.playing!==false,
      reducedMotion,authored:avatarMotionMode==='choreography',
      enabled:audioMotionEnabledV468??true,
    });
    musicMotionV468.updateMotion(audio,delta,isPlaying&&!reducedMotion&&(audioMotionEnabledV468??true),genreCue,correctedVocalV515,
      correctedVocalV515.active?concertV586.pose:null);
  },1);
}
