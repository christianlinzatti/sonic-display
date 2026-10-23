/** V349 – deterministic, privacy-preserving photo selection for 2D and 3D layouts.
 * Uses only image dimensions, frame geometry and canonical provider URLs.
 * Does not infer faces, visual sharpness, identities or aesthetic quality. */
import {imageIdentityV340} from './imageSelectionV340';

export type PhotoSelectionModeV349='balanced'|'resolution'|'fit';
export interface PhotoSelectionSettingsV349 {
 enabled:boolean;mode:PhotoSelectionModeV349;avoidDuplicates:boolean;
 minShortEdge:number;maxUpscale:number;cropImportance:number;
}
export interface PhotoCandidateV349 {url:string;width?:number;height?:number;}
export interface PhotoSlotV349 {width:number;height:number;displayWidth?:number;displayHeight?:number;}
export interface PhotoMatchV349 {url:string;score:number;cropRetained:number;upscale:number;knownDimensions:boolean;note:string;}
export const PHOTO_SELECTION_KEY_V349='sonic-photo-selection-v349';
export const PHOTO_SELECTION_EVENT_V349='sonic:photo-selection-v349';
export const DEFAULT_PHOTO_SELECTION_V349:PhotoSelectionSettingsV349={enabled:false,mode:'balanced',avoidDuplicates:true,minShortEdge:480,maxUpscale:1.8,cropImportance:.65};
const clamp=(n:unknown,min:number,max:number,d:number)=>typeof n==='number'&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):d;
export function sanitizePhotoSelectionV349(value:unknown):PhotoSelectionSettingsV349 {
 const v=value&&typeof value==='object'?value as Partial<PhotoSelectionSettingsV349>:{};
 return {enabled:v.enabled===true,mode:v.mode==='resolution'||v.mode==='fit'?v.mode:'balanced',avoidDuplicates:v.avoidDuplicates!==false,
  minShortEdge:Math.round(clamp(v.minShortEdge,0,2000,480)),maxUpscale:clamp(v.maxUpscale,1,4,1.8),cropImportance:clamp(v.cropImportance,0,1,.65)};
}
export function readPhotoSelectionV349():PhotoSelectionSettingsV349 {
 if(typeof window==='undefined')return {...DEFAULT_PHOTO_SELECTION_V349};
 try{return sanitizePhotoSelectionV349(JSON.parse(localStorage.getItem(PHOTO_SELECTION_KEY_V349)||'null'));}catch{return {...DEFAULT_PHOTO_SELECTION_V349};}
}
export function savePhotoSelectionV349(value:PhotoSelectionSettingsV349):PhotoSelectionSettingsV349 {
 const clean=sanitizePhotoSelectionV349(value);
 if(typeof window!=='undefined'){try{localStorage.setItem(PHOTO_SELECTION_KEY_V349,JSON.stringify(clean));}catch{}window.dispatchEvent(new Event(PHOTO_SELECTION_EVENT_V349));}
 return clean;
}
/** Resolve provider-specific thumbnail variants to the same image, without contacting the provider. */
export function photoIdentityV349(url:string):string {
 try {
  const parsed=new URL(url);const path=decodeURIComponent(parsed.pathname);
  // Wikimedia: /thumb/a/ab/File.jpg/640px-File.jpg -> /a/ab/File.jpg
  const clean=parsed.hostname.endsWith('wikimedia.org')?path.replace(/^\/wikipedia\/commons\/thumb\//,'/wikipedia/commons/').replace(/\/\d+px-[^/]+$/,''):path;
  return imageIdentityV340(parsed.origin+clean);
 } catch {return imageIdentityV340(url);}
}
const safeRatio=(w:number,h:number)=>Math.max(.1,Math.min(10,w/Math.max(1,h)));
/** Higher is better, 0–100; size and crop estimates are not photographic quality judgments. */
export function scorePhotoForSlotV349(candidate:PhotoCandidateV349,slot:PhotoSlotV349,settings:PhotoSelectionSettingsV349):PhotoMatchV349 {
 const w=Number.isFinite(candidate.width)&&Number(candidate.width)>0?Number(candidate.width):0;
 const h=Number.isFinite(candidate.height)&&Number(candidate.height)>0?Number(candidate.height):0;
 const knownDimensions=w>0&&h>0;
 const target=safeRatio(slot.width,slot.height);
 const imageRatio=knownDimensions?safeRatio(w,h):target;
 const cropRetained=Math.min(1,Math.min(imageRatio/target,target/imageRatio));
 const displayW=clamp(slot.displayWidth,100,4000,960);
 const displayH=clamp(slot.displayHeight,100,4000,Math.round(displayW/target));
 const upscale=knownDimensions?Math.max(displayW/w,displayH/h):1;
 // Missing metadata stays neutral; do not reject images merely because metadata is not accessible.
 const sizeScore=knownDimensions?Math.max(0,Math.min(1,Math.sqrt(w*h)/1400)):.50;
 const cropScore=knownDimensions?Math.pow(cropRetained,1.1):.57;
 const cropWeight=settings.mode==='fit'?.78:settings.mode==='resolution'?.22:.22+.56*settings.cropImportance;
 const scoreBase=(cropWeight*cropScore+(1-cropWeight)*sizeScore)*100;
 const smallPenalty=knownDimensions&&Math.min(w,h)<settings.minShortEdge?12:0;
 const upscalePenalty=knownDimensions&&upscale>settings.maxUpscale?Math.min(32,(upscale-settings.maxUpscale)*15):0;
 const score=Math.max(0,Math.min(100,scoreBase-smallPenalty-upscalePenalty));
 const note=!knownDimensions?'Bildabmessungen noch unbekannt':upscale>settings.maxUpscale?'Mögliche Unschärfe durch starke Vergrößerung':cropRetained<.55?'Starker Zuschnitt für diese Bildfläche':Math.min(w,h)<settings.minShortEdge?'Geringe Auflösung':'Passendes Bildformat';
 return {url:candidate.url,score:Math.round(score*10)/10,cropRetained:Math.round(cropRetained*100)/100,upscale:Math.round(upscale*100)/100,knownDimensions,note};
}
/** Choose the best candidate once per canonical source image, preferring the higher-resolution variant. */
export function distinctPhotoCandidatesV349(images:PhotoCandidateV349[],avoidDuplicates=true):PhotoCandidateV349[]{
 const seen=new Map<string,PhotoCandidateV349>();
 for(const image of images.slice(0,60)){
  if(!image||typeof image.url!=='string'||!image.url.trim())continue;
  const key=avoidDuplicates?photoIdentityV349(image.url):image.url;
  const previous=seen.get(key);
  if(!previous||(image.width||0)*(image.height||0)>(previous.width||0)*(previous.height||0))seen.set(key,image);
 }
 return [...seen.values()];
}
/** Per-frame greedy assignment. Each panel is scored for its OWN aspect ratio, and no
 * duplicate is used until unique choices are exhausted. Rotation is bounded: it
 * encourages slideshow variety without overriding seriously inferior images. */
export function selectPhotosForSlotsV349(images:PhotoCandidateV349[],slots:PhotoSlotV349[],settings:PhotoSelectionSettingsV349,rotation=0):PhotoMatchV349[]{
 const candidates=distinctPhotoCandidatesV349(images,settings.avoidDuplicates);
 if(!candidates.length||!slots.length)return [];
 const used=new Map<string,number>();const selected:PhotoMatchV349[]=[];
 const offset=Number.isFinite(rotation)?Math.max(0,Math.floor(rotation))%candidates.length:0;
 for(const slot of slots.slice(0,8)){
  const ranked=candidates.map((c,i)=>{
   const match=scorePhotoForSlotV349(c,slot,settings);
   const previouslyUsed=used.get(photoIdentityV349(c.url))||0;
   const cycle=(i-offset+candidates.length)%candidates.length;
   const repeatPenalty=settings.avoidDuplicates?previouslyUsed*105:previouslyUsed*22;
   const effectiveScore=match.score-repeatPenalty-(cycle/Math.max(1,candidates.length))*9;
   return {match,effectiveScore,i};
  }).sort((a,b)=>b.effectiveScore-a.effectiveScore||a.i-b.i);
  const chosen=ranked[0].match;selected.push(chosen);
  const key=photoIdentityV349(chosen.url);used.set(key,(used.get(key)||0)+1);
 }
 return selected;
}
/** Single-frame sequence used by slideshows; a new slot is recalculated when the screen ratio changes. */
export function rankPhotosForFrameV349(images:PhotoCandidateV349[],slot:PhotoSlotV349,settings:PhotoSelectionSettingsV349):PhotoMatchV349[]{
 return distinctPhotoCandidatesV349(images,settings.avoidDuplicates).map((photo,i)=>({match:scorePhotoForSlotV349(photo,slot,settings),i})).sort((a,b)=>b.match.score-a.match.score||a.i-b.i).map(x=>x.match);
}
