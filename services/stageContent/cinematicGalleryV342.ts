/** V342 – bounded, deterministic cinematic effects with reduced-motion support. */
export type CinematicStyleV342='pan'|'zoom'|'parallax'|'mixed';
export interface CinematicGallerySettingsV342 {
 enabled:boolean; style:CinematicStyleV342; zoomPercent:number; panPercent:number;
 parallaxPercent:number; transitionMs:number; lowPower:boolean;
}
export const CINEMATIC_KEY_V342='sonic-cinematic-gallery-v342';
export const CINEMATIC_EVENT_V342='sonic:cinematic-gallery-v342';
export const DEFAULT_CINEMATIC_V342:CinematicGallerySettingsV342={enabled:false,style:'mixed',zoomPercent:5,panPercent:4,parallaxPercent:1.5,transitionMs:900,lowPower:false};
export function sanitizeCinematicV342(raw:unknown):CinematicGallerySettingsV342 {
 const v=raw&&typeof raw==='object'?raw as Partial<CinematicGallerySettingsV342>:{};
 const clamp=(n:unknown,defaultValue:number,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):defaultValue;
 return {enabled:v.enabled===true,style:v.style==='pan'||v.style==='zoom'||v.style==='parallax'?v.style:'mixed',zoomPercent:clamp(v.zoomPercent,5,0,14),panPercent:clamp(v.panPercent,4,0,10),parallaxPercent:clamp(v.parallaxPercent,1.5,0,5),transitionMs:clamp(v.transitionMs,900,150,2000),lowPower:v.lowPower===true};
}
export function readCinematicV342():CinematicGallerySettingsV342 {
 if(typeof window==='undefined')return {...DEFAULT_CINEMATIC_V342};
 try{return sanitizeCinematicV342(JSON.parse(localStorage.getItem(CINEMATIC_KEY_V342)||'null'));}catch{return {...DEFAULT_CINEMATIC_V342};}
}
export function saveCinematicV342(value:CinematicGallerySettingsV342):CinematicGallerySettingsV342 {
 const clean=sanitizeCinematicV342(value);
 if(typeof window!=='undefined'){try{localStorage.setItem(CINEMATIC_KEY_V342,JSON.stringify(clean));}catch{}window.dispatchEvent(new Event(CINEMATIC_EVENT_V342));}
 return clean;
}
export interface CinematicMotionV342 {fromX:number;fromY:number;toX:number;toY:number;fromScale:number;toScale:number;durationMs:number;parallax:number;}
export function cinematicMotionV342(index:number,intervalSeconds:number,settings:CinematicGallerySettingsV342,reducedMotion=false):CinematicMotionV342 {
 const staticMotion={fromX:0,fromY:0,toX:0,toY:0,fromScale:1,toScale:1,durationMs:0,parallax:0};
 if(!settings.enabled||reducedMotion)return staticMotion;
 const low=settings.lowPower?.5:1;
 const pan=(settings.style==='zoom'?0:settings.panPercent)*low;
 const zoom=(settings.style==='pan'?0:settings.zoomPercent)*low/100;
 const reverse=index%2===1?-1:1;
 const vertical=index%3===2;
 const x=vertical?pan*.3:pan;
 const y=vertical?pan:pan*.3;
 return {fromX:-reverse*x/2,fromY:-reverse*y/2,toX:reverse*x/2,toY:reverse*y/2,
   fromScale:1+zoom,toScale:1+zoom*.25,
   durationMs:Math.max(2000,Math.min(45000,intervalSeconds*1000)),
   parallax:settings.style==='parallax'||settings.style==='mixed'?settings.parallaxPercent*low:0};
}
