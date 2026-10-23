/** V337 – safe poster extraction and configurable presentation. */
export type ConcertDisplayStyleV337 = "spotlight" | "agenda";
export interface ConcertDisplaySettingsV337 { style: ConcertDisplayStyleV337; showPoster:boolean; showTicketStatus:boolean; transitionMs:number; }
export const CONCERT_DISPLAY_KEY_V337 = "sonic-concert-display-v337";
export const CONCERT_DISPLAY_EVENT_V337 = "sonic:concert-display-v337";
export const DEFAULT_CONCERT_DISPLAY_V337:ConcertDisplaySettingsV337={style:"spotlight",showPoster:true,showTicketStatus:true,transitionMs:450};
export const safePosterV337=(value:unknown):string|undefined=>{
 if(typeof value!=="string"||value.length>2048)return undefined;
 try {const u=new URL(value);return u.protocol==="https:"&&!u.username&&!u.password?u.href:undefined;}catch{return undefined;}
};
export function selectTicketmasterPosterV337(images:unknown):string|undefined {
 if(!Array.isArray(images))return undefined;
 const candidates=images.filter((v):v is {url:string;width?:number;height?:number}=>!!v&&typeof v==="object"&&typeof v.url==="string"&&!!safePosterV337(v.url));
 candidates.sort((a,b)=>Math.abs((b.width||0)-850)-Math.abs((a.width||0)-850));
 return candidates[0]&&safePosterV337(candidates[0].url);
}
export function selectOeticketPosterV337(product:unknown,group:unknown):string|undefined {
 const candidates:unknown[]=[];
 for(const item of [product,group]){
   if(!item||typeof item!=="object")continue;
   const x=item as {images?:unknown;image?:unknown;imageUrl?:unknown};
   candidates.push(x.imageUrl, x.image);
   if(Array.isArray(x.images))for(const a of x.images){candidates.push(typeof a==="string"?a:(a&&typeof a==="object"?(a as {url?:unknown}).url:undefined));}
 }
 return candidates.map(safePosterV337).find(Boolean);
}
export function sanitizeConcertDisplayV337(raw:unknown):ConcertDisplaySettingsV337{
 const v=raw&&typeof raw==="object"?raw as Partial<ConcertDisplaySettingsV337>:{};
 return {style:v.style==="agenda"?"agenda":"spotlight",showPoster:v.showPoster!==false,showTicketStatus:v.showTicketStatus!==false,transitionMs:typeof v.transitionMs==="number"&&Number.isFinite(v.transitionMs)?Math.min(1500,Math.max(0,Math.round(v.transitionMs))):450};
}
export function readConcertDisplayV337():ConcertDisplaySettingsV337{
 if(typeof window==="undefined")return {...DEFAULT_CONCERT_DISPLAY_V337};
 try{return sanitizeConcertDisplayV337(JSON.parse(localStorage.getItem(CONCERT_DISPLAY_KEY_V337)||"null"));}catch{return {...DEFAULT_CONCERT_DISPLAY_V337};}
}
export function saveConcertDisplayV337(settings:ConcertDisplaySettingsV337){
 const clean=sanitizeConcertDisplayV337(settings);
 if(typeof window!=="undefined"){try{localStorage.setItem(CONCERT_DISPLAY_KEY_V337,JSON.stringify(clean));}catch{} window.dispatchEvent(new Event(CONCERT_DISPLAY_EVENT_V337));}
 return clean;
}
export function displayTicketStatusV337(status?:string):string|null {
 if(!status)return null;
 const s=status.toLocaleLowerCase();
 if(/sold.?out|ausverkauft/.test(s))return "Ausverkauft";
 if(/available|verfügbar/.test(s))return "Tickets verfügbar";
 if(/unavailable|nicht verfügbar/.test(s))return "Derzeit nicht verfügbar";
 return null; // never expose unknown upstream enums as user-facing guarantees
}
export function formattedConcertDateV337(date:string):string {
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date))return date;
 const [year,month,day]=date.split("-");return `${day}.${month}.${year}`;
}

/** V338 – deduplicated, HTTPS-only gallery media; no dependency on external SDKs. */
export function selectConcertImagesV338(images:unknown, max=8):string[]{
 if(!Array.isArray(images))return [];
 const values=images.map(i=>typeof i==='string'?i:(i&&typeof i==='object'?(i as {url?:unknown}).url:undefined));
 return [...new Set(values.map(safePosterV337).filter((x):x is string=>!!x))].slice(0,max);
}
export function selectOeticketImagesV338(product:unknown,group:unknown):string[]{
 const all:unknown[]=[];
 for(const item of [product,group]){
  if(!item||typeof item!=='object')continue;
  const a=item as {imageUrl?:unknown;image?:unknown;images?:unknown};
  all.push(a.imageUrl,a.image,...(Array.isArray(a.images)?a.images:[]));
 }
 return selectConcertImagesV338(all);
}
