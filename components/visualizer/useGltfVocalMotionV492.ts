"use client";
/** GLB wardrobe and music/vocal-reaction hooks, no additional render loop. */
import {useMemo,useEffect} from "react";
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
    const authoredVocalV472=!!track?.id&&propsLipSyncV367?.manualVocalEnabledV385===true&&
      track.id===propsLipSyncV367.manualVocalTrackIdV385
        ?propsLipSyncV367.manualVocalCueRefV385?.current:null;
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
    musicMotionV468.updateMotion(audio,delta,isPlaying&&!reducedMotion&&(audioMotionEnabledV468??true),genreCue,vocalV472);
  },1);
}
