/** V1020 AI Concert Storytelling — verified, song-scoped dramaturgy preview.
 * A deterministic STORYBOARD, not an actuator or a prediction from metadata.
 * V763/V604 verified acts are the only section evidence; energy is never invented.
 * No requests, timers, storage, hardware or mutations. V1019/V763 retain cue authority.
 */
import {understandSongV1018,type RecognizedSectionV1018,
 type GenreDirectionV1018} from './songUnderstandingV1018';
import type {PredictiveInputV1019} from './predictiveConcertDirectorV1019';

export type StoryPhaseV1020='opening'|'focus'|'build'|'peak'|'breather'|'finale';
export type StoryStatusV1020='unavailable'|'verified';
export type StorySafetyReasonV1020='paused'|'disabled'|'manual'|'seek'|'blackout'|
 'missing-evidence'|'incomplete-timeline'|'invalid-acts'|'no-current-act'|'verified-story';
export type StoryCameraV1020='intimate'|'tracking'|'wide'|'steady'|'sweep';
export type StoryStageV1020='silhouette'|'filmic'|'rising'|'arena'|'minimal'|'finale';
export type StoryAvatarV1020='lead'|'ensemble'|'minimal'|'hold';
export type StoryLightV1020='dim'|'soft'|'rising'|'big'|'finale';
export interface StoryLookV1020 {
 camera:StoryCameraV1020;stage:StoryStageV1020;
 avatars:StoryAvatarV1020;lights:StoryLightV1020;
}
export interface StoryActV1020 {
 actIndex:number; ordinal:number; section:RecognizedSectionV1018;
 startMs:number; endMs:number;phase:StoryPhaseV1020;
 /** Suggested dramaturgical intensity, 0..1; NOT measured audio energy. */
 intendedIntensity:number;look:StoryLookV1020;
}
export interface ConcertStoryV1020 {
 status:StoryStatusV1020;reason:StorySafetyReasonV1020;
 source:'verified-v604'|'unavailable';
 genreDirection:GenreDirectionV1018;
 acts:ReadonlyArray<StoryActV1020>;
 currentOrdinal:number|null;nextOrdinal:number|null;
 current:StoryActV1020|null;next:StoryActV1020|null;
 progression:number|null;measuredAudio:boolean;
}
export type ConcertStoryInputV1020=PredictiveInputV1019;
export const MAX_STORY_ACTS_V1020=96;
const SECTION_SET:ReadonlyArray<RecognizedSectionV1018>=['verse','hook','build','drop','break'];
const EMPTY_ACTS:ReadonlyArray<StoryActV1020>=[];
const finite=(x:number)=>Number.isFinite(x);
const cap=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
function unavailable(reason:StorySafetyReasonV1020,genre:GenreDirectionV1018,
 measuredAudio=false):ConcertStoryV1020 {
 return {status:'unavailable',reason,source:'unavailable',genreDirection:genre,acts:EMPTY_ACTS,
  currentOrdinal:null,nextOrdinal:null,current:null,next:null,progression:null,measuredAudio};
}
/** Repeat-safe, genre-aware suggestions, not commands. */
function lookFor(phase:StoryPhaseV1020,section:RecognizedSectionV1018,
 direction:GenreDirectionV1018,ordinal:number,reducedMotion:boolean):StoryLookV1020 {
 if(reducedMotion)return {camera:'steady',stage:'minimal',avatars:'hold',lights:'soft'};
 if(phase==='finale')return {camera:'wide',stage:'finale',avatars:'ensemble',lights:'finale'};
 if(phase==='breather')return {camera:'steady',stage:'minimal',avatars:'hold',lights:'dim'};
 if(phase==='opening')return {camera:'intimate',stage:'silhouette',avatars:'lead',lights:'dim'};
 if(phase==='build')return {camera:ordinal%2?'tracking':'sweep',stage:'rising',avatars:'lead',lights:'rising'};
 if(phase==='peak')return {camera:ordinal%2?'wide':'sweep',stage:'arena',avatars:'ensemble',lights:'big'};
 if(direction==='rap')return {camera:ordinal%2?'tracking':'intimate',stage:'filmic',avatars:'lead',lights:'soft'};
 if(direction==='hard-dance')return {camera:ordinal%2?'tracking':'sweep',stage:'rising',avatars:'lead',lights:'soft'};
 if(direction==='rock')return {camera:ordinal%2?'wide':'tracking',stage:'arena',avatars:'lead',lights:'soft'};
 return {camera:ordinal%2?'tracking':'intimate',stage:section==='verse'?'filmic':'minimal',avatars:'lead',lights:'soft'};
}
const SECTION_BASE:Record<RecognizedSectionV1018,number>={verse:.36,hook:.67,build:.54,drop:.78,break:.18};
/** Render an entire verified act sequence, with guarded final-act detection.
 * A verified scene is an authored cue, not proof of a detected beat or vocal.
 */
export function buildConcertStoryV1020(input:ConcertStoryInputV1020):ConcertStoryV1020 {
 const evidence=understandSongV1018(input);
 const direction=evidence.genreDirection;
 if(!input?.playing)return unavailable('paused',direction);
 if(!input.enabled)return unavailable('disabled',direction,evidence.measuredAudio);
 if(input.manualOverride)return unavailable('manual',direction,evidence.measuredAudio);
 if(input.seekBlocked)return unavailable('seek',direction,evidence.measuredAudio);
 if(input.blackout)return unavailable('blackout',direction,evidence.measuredAudio);
 if(!evidence.verifiedSection||!input.timeline)return unavailable('missing-evidence',direction,evidence.measuredAudio);
 const t=input.timeline;
 // An open-ended or incomplete timeline is not a whole-song narrative.
 if(!t.scenes.length||t.scenes[0].startMs>input.durationMs*.02||
  t.scenes[t.scenes.length-1].endMs<input.durationMs*.95)
  return unavailable('incomplete-timeline',direction,evidence.measuredAudio);
 type Group={actIndex:number;section:RecognizedSectionV1018;startMs:number;endMs:number};
 const grouped:Group[]=[];
 for(const scene of t.scenes){
  const current=grouped[grouped.length-1];
  if(!SECTION_SET.includes(scene.section as RecognizedSectionV1018))return unavailable('invalid-acts',direction);
  if(current&&current.actIndex===scene.actIndex){
   if(current.section!==scene.section||scene.startMs!==current.endMs)
    return unavailable('invalid-acts',direction,evidence.measuredAudio);
   current.endMs=scene.endMs;
  }else{
   if(current&&scene.actIndex<=current.actIndex)return unavailable('invalid-acts',direction,evidence.measuredAudio);
   grouped.push({actIndex:scene.actIndex,section:scene.section as RecognizedSectionV1018,
    startMs:scene.startMs,endMs:scene.endMs});
  }
  if(grouped.length>MAX_STORY_ACTS_V1020)return unavailable('invalid-acts',direction,evidence.measuredAudio);
 }
 if(grouped.length<3)return unavailable('incomplete-timeline',direction,evidence.measuredAudio);
 const hasEnding=grouped.length>=3&&grouped[grouped.length-1].startMs>=input.durationMs*.60&&
  ['hook','drop'].includes(grouped[grouped.length-1].section);
 const acts:StoryActV1020[]=grouped.map((g,i)=>{
  let phase:StoryPhaseV1020;
  if(i===grouped.length-1&&hasEnding)phase='finale';
  else if(i===0&&g.startMs<=input.durationMs*.02&&g.endMs<=input.durationMs*.30)phase='opening';
  else if(g.section==='break')phase='breather';
  else if(g.section==='build')phase='build';
  else if(g.section==='hook'||g.section==='drop')phase='peak';
  else phase='focus';
  // A planned arc, not a measured/sampled energy result. No random variations.
  const evolution=.10*(g.startMs/input.durationMs);
  const intensity=phase==='finale'?.94:phase==='opening'?.23:
   phase==='breather'?.17:cap(SECTION_BASE[g.section]+evolution,0,.89);
  return {actIndex:g.actIndex,ordinal:i,section:g.section,startMs:g.startMs,endMs:g.endMs,
   phase,intendedIntensity:Number(intensity.toFixed(3)),
   look:lookFor(phase,g.section,direction,i,!!input.reducedMotion)};
 });
 const currentOrdinal=acts.findIndex(a=>a.startMs<=input.positionMs&&input.positionMs<a.endMs);
 if(currentOrdinal<0)return unavailable('no-current-act',direction,evidence.measuredAudio);
 const current=acts[currentOrdinal];const next=acts[currentOrdinal+1]??null;
 const progression=finite(input.positionMs/input.durationMs)?
  cap(input.positionMs/input.durationMs,0,1):0;
 return {status:'verified',reason:'verified-story',source:'verified-v604',genreDirection:direction,
  acts,currentOrdinal,nextOrdinal:next?next.ordinal:null,current,next,progression,
  measuredAudio:evidence.measuredAudio};
}
