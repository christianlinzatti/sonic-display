/** V344: persisted layouts per screen aspect. Pixel-free coordinates (percent). */
export type GalleryRatioV344 = 'wide'|'square'|'portrait';
export interface GalleryFrameV344 {x:number;y:number;width:number;height:number;zoom:number;cropX:number;cropY:number;}
export type GalleryLayoutsV344=Record<GalleryRatioV344,GalleryFrameV344>;
export const GALLERY_LAYOUT_KEY_V344='sonic-gallery-layout-v344';
export const GALLERY_LAYOUT_EVENT_V344='sonic:gallery-layout-v344';
export const DEFAULT_FRAME_V344:GalleryFrameV344={x:0,y:0,width:100,height:100,zoom:1,cropX:50,cropY:50};
export const DEFAULT_LAYOUTS_V344:GalleryLayoutsV344={wide:{...DEFAULT_FRAME_V344},square:{...DEFAULT_FRAME_V344},portrait:{...DEFAULT_FRAME_V344}};
const bound=(n:unknown,lo:number,hi:number,fallback:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(hi,Math.max(lo,n)):fallback;
export function sanitizeFrameV344(input:unknown):GalleryFrameV344{
 const f=input&&typeof input==='object'?input as Partial<GalleryFrameV344>:{};
 const width=bound(f.width,20,100,100),height=bound(f.height,20,100,100);
 return {width,height,x:bound(f.x,0,100-width,0),y:bound(f.y,0,100-height,0),zoom:bound(f.zoom,1,2,1),cropX:bound(f.cropX,0,100,50),cropY:bound(f.cropY,0,100,50)};
}
export function sanitizeLayoutsV344(input:unknown):GalleryLayoutsV344{
 const layouts=input&&typeof input==='object'?input as Partial<GalleryLayoutsV344>:{};
 return {wide:sanitizeFrameV344(layouts.wide),square:sanitizeFrameV344(layouts.square),portrait:sanitizeFrameV344(layouts.portrait)};
}
export function layoutRatioV344(aspect:number):GalleryRatioV344{
 if(!Number.isFinite(aspect)||aspect<=0)return 'wide';
 return aspect>1.2?'wide':aspect<.88?'portrait':'square';
}
export function readGalleryLayoutsV344():GalleryLayoutsV344{
 if(typeof window==='undefined')return sanitizeLayoutsV344(DEFAULT_LAYOUTS_V344);
 try{return sanitizeLayoutsV344(JSON.parse(localStorage.getItem(GALLERY_LAYOUT_KEY_V344)||'null'));}catch{return sanitizeLayoutsV344(DEFAULT_LAYOUTS_V344);}
}
export function saveGalleryLayoutsV344(input:GalleryLayoutsV344):GalleryLayoutsV344{
 const cleaned=sanitizeLayoutsV344(input);
 if(typeof window!=='undefined'){try{localStorage.setItem(GALLERY_LAYOUT_KEY_V344,JSON.stringify(cleaned));}catch{}window.dispatchEvent(new Event(GALLERY_LAYOUT_EVENT_V344));}
 return cleaned;
}
export function updateGalleryFrameV344(ratio:GalleryRatioV344,patch:Partial<GalleryFrameV344>):GalleryFrameV344{
 const layouts=readGalleryLayoutsV344();const frame=sanitizeFrameV344({...layouts[ratio],...patch});saveGalleryLayoutsV344({...layouts,[ratio]:frame});return frame;
}
export function resetGalleryFrameV344(ratio:GalleryRatioV344):GalleryFrameV344{return updateGalleryFrameV344(ratio,DEFAULT_FRAME_V344);}
export const GALLERY_PRESETS_KEY_V344='sonic-gallery-layout-presets-v344';
export interface GalleryPresetV344{name:string;ratio:GalleryRatioV344;frame:GalleryFrameV344;}
export function readGalleryPresetsV344():GalleryPresetV344[]{
 if(typeof window==='undefined')return [];
 try{const data:unknown=JSON.parse(localStorage.getItem(GALLERY_PRESETS_KEY_V344)||'[]');if(!Array.isArray(data))return [];
  return data.slice(0,24).filter(x=>x&&typeof x==='object'&&typeof x.name==='string'&&['wide','square','portrait'].includes(x.ratio)).map(x=>({name:x.name.slice(0,48),ratio:x.ratio as GalleryRatioV344,frame:sanitizeFrameV344(x.frame)}));
 }catch{return [];}
}
export function saveGalleryPresetV344(name:string,ratio:GalleryRatioV344,frame:GalleryFrameV344):GalleryPresetV344[]{
 const safeName=name.trim().slice(0,48);if(!safeName)return readGalleryPresetsV344();
 const all=readGalleryPresetsV344().filter(p=>!(p.ratio===ratio&&p.name===safeName));const next=[{name:safeName,ratio,frame:sanitizeFrameV344(frame)},...all].slice(0,24);
 if(typeof window!=='undefined'){try{localStorage.setItem(GALLERY_PRESETS_KEY_V344,JSON.stringify(next));}catch{}}return next;
}
export function deleteGalleryPresetV344(name:string,ratio:GalleryRatioV344):GalleryPresetV344[]{
 const next=readGalleryPresetsV344().filter(p=>!(p.name===name&&p.ratio===ratio));
 if(typeof window!=='undefined'){try{localStorage.setItem(GALLERY_PRESETS_KEY_V344,JSON.stringify(next));}catch{}}return next;
}
