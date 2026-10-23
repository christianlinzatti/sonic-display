/** V338 – persisted picture gallery settings for artist and concert screens. */
export type GalleryModeV338='slideshow'|'collage'|'single';
export interface GallerySettingsV338 {mode:GalleryModeV338;intervalSeconds:number;maxImages:number;enabled:boolean;}
export const GALLERY_EVENT_V338='sonic:gallery-v338';
export const GALLERY_KEY_V338='sonic-stage-gallery-v338';
export const DEFAULT_GALLERY_V338:GallerySettingsV338={mode:'slideshow',intervalSeconds:7,maxImages:6,enabled:true};
export function sanitizeGalleryV338(v:unknown):GallerySettingsV338{
 const a=v&&typeof v==='object'?v as Partial<GallerySettingsV338>:{};
 return {mode:a.mode==='collage'||a.mode==='single'?a.mode:'slideshow',intervalSeconds:typeof a.intervalSeconds==='number'&&Number.isFinite(a.intervalSeconds)?Math.min(30,Math.max(3,Math.round(a.intervalSeconds))):7,maxImages:typeof a.maxImages==='number'&&Number.isFinite(a.maxImages)?Math.min(12,Math.max(1,Math.round(a.maxImages))):6,enabled:a.enabled!==false};
}
export function readGalleryV338():GallerySettingsV338{
 if(typeof window==='undefined')return {...DEFAULT_GALLERY_V338};
 try{return sanitizeGalleryV338(JSON.parse(localStorage.getItem(GALLERY_KEY_V338)||'null'));}catch{return {...DEFAULT_GALLERY_V338};}
}
export function saveGalleryV338(v:GallerySettingsV338):GallerySettingsV338{
 const clean=sanitizeGalleryV338(v);
 if(typeof window!=='undefined'){try{localStorage.setItem(GALLERY_KEY_V338,JSON.stringify(clean));}catch{}window.dispatchEvent(new Event(GALLERY_EVENT_V338));}
 return clean;
}
