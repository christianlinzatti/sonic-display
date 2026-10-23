/** V346 – deterministic photo direction from actual stage music signals. */
export type PhotoDirectorMoodV346='focus'|'balanced'|'impact';
export type PhotoDirectorModeV346='auto'|'manual';
export interface PhotoDirectorSettingsV346 {enabled:boolean;mode:PhotoDirectorModeV346;manualMood:PhotoDirectorMoodV346;sensitivity:number;minimumHoldSeconds:number;}
export interface PhotoDirectorInputV346 {section?:string;genre?:string;beatAccent?:number;playing?:boolean;imageCount:number;reducedMotion?:boolean;}
export interface PhotoDirectorDecisionV346 {mood:PhotoDirectorMoodV346;activeLayers:number;animate:boolean;reason:string;}
export const PHOTO_DIRECTOR_KEY_V346='sonic-photo-director-v346';
export const PHOTO_DIRECTOR_EVENT_V346='sonic:photo-director-v346';
export const DEFAULT_PHOTO_DIRECTOR_V346:PhotoDirectorSettingsV346={enabled:false,mode:'auto',manualMood:'balanced',sensitivity:.55,minimumHoldSeconds:7};
const moods:PhotoDirectorMoodV346[]=['focus','balanced','impact'];
function bounded(x:unknown,min:number,max:number,fallback:number){return typeof x==='number'&&Number.isFinite(x)?Math.max(min,Math.min(max,x)):fallback;}
export function sanitizePhotoDirectorV346(raw:unknown):PhotoDirectorSettingsV346{
 const o=raw&&typeof raw==='object'?raw as Partial<PhotoDirectorSettingsV346>:{};
 return {enabled:o.enabled===true,mode:o.mode==='manual'?'manual':'auto',manualMood:moods.includes(o.manualMood as PhotoDirectorMoodV346)?o.manualMood as PhotoDirectorMoodV346:'balanced',sensitivity:bounded(o.sensitivity,0,1,.55),minimumHoldSeconds:bounded(o.minimumHoldSeconds,2,30,7)};
}
export function readPhotoDirectorV346():PhotoDirectorSettingsV346{
 if(typeof window==='undefined')return {...DEFAULT_PHOTO_DIRECTOR_V346};
 try{return sanitizePhotoDirectorV346(JSON.parse(localStorage.getItem(PHOTO_DIRECTOR_KEY_V346)||'null'));}catch{return {...DEFAULT_PHOTO_DIRECTOR_V346};}
}
export function savePhotoDirectorV346(raw:PhotoDirectorSettingsV346):PhotoDirectorSettingsV346{
 const settings=sanitizePhotoDirectorV346(raw);
 if(typeof window!=='undefined'){try{localStorage.setItem(PHOTO_DIRECTOR_KEY_V346,JSON.stringify(settings));}catch{}window.dispatchEvent(new Event(PHOTO_DIRECTOR_EVENT_V346));}
 return settings;
}
export function decidePhotoMoodV346(input:PhotoDirectorInputV346,settings:PhotoDirectorSettingsV346):PhotoDirectorDecisionV346{
 const count=Math.max(0,Math.floor(Number.isFinite(input.imageCount)?input.imageCount:0));
 if(count===0)return {mood:'focus',activeLayers:0,animate:false,reason:'Keine Bilder'};
 if(settings.mode==='manual'){
  const mood=settings.manualMood;return {mood,activeLayers:Math.min(count,mood==='focus'?1:mood==='balanced'?3:8),animate:!input.reducedMotion,reason:'Manuelle Vorgabe'};
 }
 const section=(input.section||'').toLowerCase(),genre=(input.genre||'').toLowerCase();
 const beat=bounded(input.beatAccent,0,1,0);
 const energetic=/hardtekk|hardstyle|hardcore|uptempo|techno|drum.?and.?bass|gabber/.test(genre);
 const mellow=/ambient|chill|classical|jazz|acoustic/.test(genre);
 const isDrop=/drop|chorus|hook|climax|peak|refrain/.test(section);
 const isQuiet=/intro|outro|verse|strophe|bridge|breakdown|break/.test(section);
 // A drop/chorus is intentional structure, not an instantaneous beat threshold.
 const score=(isDrop?2.1:isQuiet?-.75:0)+(energetic?.6:mellow?-.7:0)+beat*1.7* (0.6+settings.sensitivity);
 const threshold=1.55+(1-settings.sensitivity)*.6;
 const mood:PhotoDirectorMoodV346=score>=threshold?'impact':score>=.55?'balanced':'focus';
 return {mood,activeLayers:Math.min(count,mood==='focus'?1:mood==='balanced'?3:8),animate:!input.reducedMotion&&input.playing!==false,reason:`${section||'unbekannter Abschnitt'} · ${genre||'Genre offen'} · Beat ${Math.round(beat*100)} %`};
}
