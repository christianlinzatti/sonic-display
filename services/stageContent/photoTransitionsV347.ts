/** V347: persistent transition preferences and deterministic animation timing. */
export type PhotoTransitionStyleV347='smooth'|'cinematic'|'snappy';
export interface PhotoTransitionsV347 {
 enabled:boolean;style:PhotoTransitionStyleV347;durationMs:number;crossfadeMs:number;
 beatSync:boolean;beatThreshold:number;maxBeatWaitMs:number;
}
export const PHOTO_TRANSITIONS_KEY_V347='sonic-photo-transitions-v347';
export const PHOTO_TRANSITIONS_EVENT_V347='sonic:photo-transitions-v347';
export const DEFAULT_PHOTO_TRANSITIONS_V347:PhotoTransitionsV347={
 enabled:false,style:'smooth',durationMs:850,crossfadeMs:500,beatSync:true,beatThreshold:.76,maxBeatWaitMs:450
};
const clamp=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
export function sanitizePhotoTransitionsV347(raw:unknown):PhotoTransitionsV347 {
 const o=raw&&typeof raw==='object'?raw as Partial<PhotoTransitionsV347>:{};
 return {
  enabled:o.enabled===true,
  style:o.style==='cinematic'||o.style==='snappy'?o.style:'smooth',
  durationMs:Math.round(clamp(o.durationMs,150,2200,850)),
  crossfadeMs:Math.round(clamp(o.crossfadeMs,100,1600,500)),
  beatSync:o.beatSync!==false,
  beatThreshold:clamp(o.beatThreshold,.35,.98,.76),
  maxBeatWaitMs:Math.round(clamp(o.maxBeatWaitMs,100,900,450))
 };
}
export function readPhotoTransitionsV347():PhotoTransitionsV347 {
 if(typeof window==='undefined')return {...DEFAULT_PHOTO_TRANSITIONS_V347};
 try{return sanitizePhotoTransitionsV347(JSON.parse(window.localStorage.getItem(PHOTO_TRANSITIONS_KEY_V347)||'null'));}
 catch{return {...DEFAULT_PHOTO_TRANSITIONS_V347};}
}
export function savePhotoTransitionsV347(input:PhotoTransitionsV347):PhotoTransitionsV347 {
 const cleaned=sanitizePhotoTransitionsV347(input);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(PHOTO_TRANSITIONS_KEY_V347,JSON.stringify(cleaned));}catch{}
  window.dispatchEvent(new Event(PHOTO_TRANSITIONS_EVENT_V347));
 }
 return cleaned;
}
export function transitionEasingV347(style:PhotoTransitionStyleV347):string {
 switch(style){case 'cinematic':return 'cubic-bezier(0.22,1,0.36,1)';case 'snappy':return 'cubic-bezier(0.20,0.80,0.20,1)';default:return 'cubic-bezier(0.42,0,0.20,1)';}
}
/** Rising edge only, avoids repeated updates during a sustained loud beat. */
export function isTransitionBeatV347(previous:number,current:number,threshold:number):boolean {
 const last=clamp(previous,0,1,0),next=clamp(current,0,1,0),limit=clamp(threshold,.35,.98,.76);
 return last<limit&&next>=limit;
}
/** Always bypass beat waiting while stopped or when reduced motion is requested. */
export function shouldWaitForBeatV347(settings:PhotoTransitionsV347,playing:boolean,paused:boolean,reducedMotion:boolean):boolean {
 return settings.enabled&&settings.beatSync&&playing&&!paused&&!reducedMotion;
}
