/** V691: conservative, evidence-gated musical colour cohesion across existing stages.
 * No new lights, shaders, 3D assets, section inference or camera cuts. */
import type {AdaptiveStageInputV690,AdaptiveStageCueV690} from './adaptiveStageTransformationV690';
import {planAdaptiveStageTransformationV690} from './adaptiveStageTransformationV690';
export type MusicMoodV691='intimate'|'anticipation'|'celebration'|'impact'|'breathing'|'finale';
export type MusicMoodCueV691={active:boolean;mood:MusicMoodV691|null;act:number;
  /** Tiny additional palette warmth: applied ONLY to existing material tint. */
  warmth:number;ambientMix:number;floorMix:number;fogClearance:number;
  /** Additional scenic projection perimeter, capped by V690. */morph:number;
};
export const NEUTRAL_MUSIC_MOOD_V691:Readonly<MusicMoodCueV691>=Object.freeze({active:false,mood:null,act:-1,warmth:0,ambientMix:0,floorMix:0,fogClearance:0,morph:0});
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const round=(v:number)=>Math.round(v*100000)/100000;
/** Takes the exact V690 evidence/context so independent stages agree after seeks.
 * V690 already enforces confirmed sections, playback, timing, manual and low-tier guards. */
export function planMusicMoodFusionV691(input:AdaptiveStageInputV690,
  foundation?:AdaptiveStageCueV690):MusicMoodCueV691{
 const stage=foundation??planAdaptiveStageTransformationV690(input);
 if(!stage.active||stage.act<0||!stage.scale||!input.narrative?.plan||
    input.authored||input.blackout||!input.visualsEnabled||!input.playing||
    !input.reactive||input.reducedMotion||input.tier==='low'||
    !Number.isFinite(stage.morph)||stage.morph<0||stage.morph>.75||
    !Number.isFinite(stage.ambientMix)||stage.ambientMix<0||stage.ambientMix>.05||
    !Number.isFinite(stage.floorMix)||stage.floorMix<0||stage.floorMix>.055||
    !Number.isFinite(stage.warmth)||Math.abs(stage.warmth)>.35)
   return {...NEUTRAL_MUSIC_MOOD_V691};
 const act=input.narrative.plan.acts[stage.act];
 if(!act||act.index!==stage.act||act.section!==input.section)
   return {...NEUTRAL_MUSIC_MOOD_V691};
 const mood:MusicMoodV691=stage.scale==='finale'?'finale':
   act.section==='break'?'breathing':act.section==='build'?'anticipation':
   act.section==='drop'?'impact':act.section==='hook'?'celebration':'intimate';
 // Section-differentiated palette intention. This is NOT an audio emotion detector.
 const temperament=mood==='breathing'?-.10:mood==='anticipation'?.16:
   mood==='impact'?.22:mood==='finale'?.20:mood==='celebration'?.12:-.05;
 const genre=(input.genre??'').trim().toLowerCase();
 const genreSign=genre==='rock'||genre==='pop'?1:
   genre==='hardstyle'||genre==='hardtekk'?-.7:genre==='deutschrap'||genre==='rap'?-.35:.25;
 const protection=input.lyricsProtected?.36:input.vocalFocus?.52:1;
 const weight=clamp(stage.morph/.75,0,1)*protection;
 return {active:true,mood,act:stage.act,
   warmth:round(clamp(temperament*genreSign*weight,-.07,.07)),
   ambientMix:round(clamp(stage.ambientMix*.18*protection,0,.01)),
   floorMix:round(clamp(stage.floorMix*.16*protection,0,.01)),
   fogClearance:round(clamp(stage.fogClearance*.12*protection,0,.05)),
   morph:round(clamp(stage.morph*.035*protection,0,.027))};
}
