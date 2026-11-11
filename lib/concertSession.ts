import type {UiPreferences} from '../types/music';
import type {CrewSettings} from '../components/visualizer/sonicCrewDirector';
import {normalizeGroupV326,type GroupStudioV326} from '../components/visualizer/multiAvatarStageDirectorV326';
export const CONCERT_SESSION_KEY='sonic-concert-session-v1';
export type ConcertPreferences=Pick<UiPreferences,'visualizerMode'|'lyricsVisible'|'lyricsImmersiveEnabled'|'lyricsStyle'|'avatarModelId'>;
export type ConcertSession={version:1;preferences:ConcertPreferences;owned:ConcertPreferences;
 crew:Pick<CrewSettings,'enabled'|'mode'|'poseAware'|'stagecraft'|'showPlans'>;group:GroupStudioV326;ownedGroup?:GroupStudioV326};
function preferences(value:unknown):ConcertPreferences|null{
 if(!value||typeof value!=='object')return null;
 const v=value as Record<string,unknown>;
 if(v.visualizerMode!=='avatar'&&v.visualizerMode!=='wave'&&v.visualizerMode!=='particles'&&v.visualizerMode!=='album-glow')return null;
 if(v.lyricsStyle!=='cinematic'&&v.lyricsStyle!=='kinetic'&&v.lyricsStyle!=='neon'&&v.lyricsStyle!=='classic')return null;
 if(typeof v.lyricsVisible!=='boolean'||typeof v.lyricsImmersiveEnabled!=='boolean'||typeof v.avatarModelId!=='string'||v.avatarModelId.length>200)return null;
 return {visualizerMode:v.visualizerMode,lyricsStyle:v.lyricsStyle,lyricsVisible:v.lyricsVisible,lyricsImmersiveEnabled:v.lyricsImmersiveEnabled,avatarModelId:v.avatarModelId};
}
/** Decode only the fields owned by presentation; no audio, lyrics, consent or learned history. */
export function decodeConcertSession(text:string|null):ConcertSession|null{
 if(!text||text.length>64000)return null;
 try{
  const v=JSON.parse(text);if(!v||v.version!==1)return null;
  const before=preferences(v.preferences),owned=preferences(v.owned),crew=v.crew;
  if(!before||!owned||owned.visualizerMode!=='avatar'||!owned.lyricsVisible||owned.lyricsImmersiveEnabled||owned.lyricsStyle!=='cinematic'||
   !crew||typeof crew.enabled!=='boolean'||!['individual','adaptive','story','unison','canon','spotlight'].includes(crew.mode)||
   (crew.poseAware!==undefined&&typeof crew.poseAware!=='boolean')||(crew.stagecraft!==undefined&&typeof crew.stagecraft!=='boolean')||(crew.showPlans!==undefined&&typeof crew.showPlans!=='boolean')||
   !v.group||typeof v.group!=='object'||Array.isArray(v.group)||v.ownedGroup!==undefined&&(!v.ownedGroup||typeof v.ownedGroup!=='object'||Array.isArray(v.ownedGroup)))return null;
  return {version:1,preferences:before,owned,crew:{enabled:crew.enabled,mode:crew.mode,poseAware:crew.poseAware,stagecraft:crew.stagecraft,showPlans:crew.showPlans},
   group:normalizeGroupV326(v.group),...(v.ownedGroup?{ownedGroup:normalizeGroupV326(v.ownedGroup)}:{})};
 }catch{return null;}
}
export function readConcertSession():ConcertSession|null{
 if(typeof window==='undefined')return null;
 try{return decodeConcertSession(window.sessionStorage.getItem(CONCERT_SESSION_KEY));}catch{return null;}
}
export function saveConcertSession(value:ConcertSession|null){
 if(typeof window==='undefined')return;
 try{if(value)window.sessionStorage.setItem(CONCERT_SESSION_KEY,JSON.stringify(value));else window.sessionStorage.removeItem(CONCERT_SESSION_KEY);}catch{/* Blocked storage keeps this presentation transient. */}
}
export function restoreConcertCrew(current:CrewSettings,before:ConcertSession['crew']):CrewSettings{
 return {...current,...(current.showPlans===true?{showPlans:before.showPlans}:{}),...(current.enabled?{enabled:before.enabled}:{}),...(current.mode==='adaptive'?{mode:before.mode}:{}),
  ...(current.poseAware===true?{poseAware:before.poseAware}:{}),...(current.stagecraft===true?{stagecraft:before.stagecraft}:{})};
}
