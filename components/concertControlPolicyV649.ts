/** V649: validated, explicit changes to the existing UI preference context.
 * This module has no browser side effects and never controls Spotify playback.
 */
import type { UiPreferences } from "@/types/music";
export const STAGES_V649 = [
 {value:"classic",label:"Classic"}, {value:"neon",label:"Neon Club"},
 {value:"festival",label:"Festival"}, {value:"minimal",label:"Minimal"},
 {value:"cyberpunk",label:"Cyberpunk"}, {value:"vaporwave",label:"Vaporwave"},
 {value:"galaxy",label:"Galaxy"}, {value:"white",label:"Showroom"},
 {value:"rock",label:"Rock Arena"},
] as const;
export const DANCE_STYLES_V649 = [
 {value:"auto",label:"Automatisch"},{value:"hardstyle",label:"Hardstyle / Hardtekk"},
 {value:"techno",label:"Techno"},{value:"rock-metal",label:"Rock / Metal"},
 {value:"robot",label:"Robot"},{value:"ambient",label:"Ambient"},
 {value:"freestyle",label:"Freestyle"},
] as const;
export const V649_TABS = ["stage","camera","lyrics","avatars","light"] as const;
export type ControlTabV649 = typeof V649_TABS[number];
export const V649_TAB_LABELS:Record<ControlTabV649,string> = {stage:"Bühne",camera:"Kamera",lyrics:"Lyrics",avatars:"Avatare",light:"Licht"};
const cameraModes = ["off","auto","performance"] as const;
const avatarModes = ["solo","sync","mirror","duet"] as const;
const booleanKeys = ["stageReactive","rapCameraEnabledV429","lyricsFocusMode", "lyricsImmersiveEnabled", "avatarLipSyncEnabled","concertDetailEnabledV555", "reducedMotion"] as const;
const isMember = (items:readonly string[],candidate:unknown):candidate is string =>
 typeof candidate==="string"&&items.includes(candidate);
const isBooleanKey=(candidate:string)=>booleanKeys.some(key=>key===candidate);
export const CONTROLLABLE_KEYS_V649 = ["stageTheme","stageLightStrength","avatarVocalCameraV369","avatarVocalCameraStrengthV369",
 "lyricsFontSize","multiAvatarMode","avatarDancePreset","concertDetailStrengthV555",...booleanKeys] as const;
export type ControlKeyV649=typeof CONTROLLABLE_KEYS_V649[number];
export function buildControlPatchV649(key:ControlKeyV649,value:unknown):Partial<UiPreferences>|null {
 if(isBooleanKey(key))return typeof value==="boolean"?{[key]:value}:null;
 if(key==="stageTheme")return isMember(STAGES_V649.map(x=>x.value),value)?{stageTheme:value as UiPreferences["stageTheme"]}:null;
 if(key==="avatarDancePreset")return isMember(DANCE_STYLES_V649.map(x=>x.value),value)?{avatarDancePreset:value as UiPreferences["avatarDancePreset"]}:null;
 if(key==="avatarVocalCameraV369")return isMember(cameraModes,value)?{avatarVocalCameraV369:value as UiPreferences["avatarVocalCameraV369"]}:null;
 if(key==="multiAvatarMode")return isMember(avatarModes,value)?{multiAvatarMode:value as UiPreferences["multiAvatarMode"]}:null;
 if(typeof value!=="number"||!Number.isFinite(value))return null;
 if(key==="stageLightStrength"||key==="avatarVocalCameraStrengthV369"||key==="concertDetailStrengthV555")
   return {[key]:Math.min(100,Math.max(0,Math.round(value)))};
 if(key==="lyricsFontSize")return {lyricsFontSize:Math.min(240,Math.max(40,Math.round(value)))};
 return null;
}
/** The undo snapshot stores only changed keys, never a stale whole preference object. */
export function undoControlPatchV649(current:UiPreferences,patch:Partial<UiPreferences>):Partial<UiPreferences> {
 const undo:Record<string,unknown>={};
 for(const key of CONTROLLABLE_KEYS_V649) if(Object.prototype.hasOwnProperty.call(patch,key)) undo[key]=current[key];
 return undo as Partial<UiPreferences>;
}
