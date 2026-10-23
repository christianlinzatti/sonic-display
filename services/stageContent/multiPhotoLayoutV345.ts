/** V345: per-aspect, non-destructive multi-photo compositions (images are never persisted). */
import type {GalleryRatioV344} from './galleryLayoutV344';
export type PhotoMotionV345='none'|'float'|'pulse'|'fade';
export interface PhotoLayerV345 {id:number;x:number;y:number;width:number;height:number;zoom:number;cropX:number;cropY:number;motion:PhotoMotionV345;}
export interface PhotoCompositionV345 {enabled:boolean;layers:PhotoLayerV345[];}
export type PhotoCompositionsV345=Record<GalleryRatioV344,PhotoCompositionV345>;
export const MULTI_PHOTO_KEY_V345='sonic-multi-photo-layout-v345';
export const MULTI_PHOTO_EVENT_V345='sonic:multi-photo-layout-v345';
export const MULTI_PHOTO_PRESETS_KEY_V345='sonic-multi-photo-presets-v345';
const clamp=(v:unknown,min:number,max:number,fallback:number)=>typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const motions:PhotoMotionV345[]=['none','float','pulse','fade'];
export const DEFAULT_LAYERS_V345:PhotoLayerV345[]=[
 {id:0,x:3,y:5,width:58,height:90,zoom:1,cropX:50,cropY:50,motion:'none'},
 {id:1,x:64,y:5,width:33,height:42,zoom:1,cropX:50,cropY:50,motion:'float'},
 {id:2,x:64,y:53,width:33,height:42,zoom:1,cropX:50,cropY:50,motion:'none'}
];
export function sanitizeLayerV345(v:unknown,id:number):PhotoLayerV345{
 const raw=v&&typeof v==='object'?v as Partial<PhotoLayerV345>:{};
 const width=clamp(raw.width,12,100,40),height=clamp(raw.height,12,100,40);
 return {id,x:clamp(raw.x,0,100-width,0),y:clamp(raw.y,0,100-height,0),width,height,zoom:clamp(raw.zoom,1,2.5,1),cropX:clamp(raw.cropX,0,100,50),cropY:clamp(raw.cropY,0,100,50),motion:motions.includes(raw.motion as PhotoMotionV345)?raw.motion as PhotoMotionV345:'none'};
}
export function sanitizeCompositionV345(v:unknown):PhotoCompositionV345{
 const raw=v&&typeof v==='object'?v as Partial<PhotoCompositionV345>:{};
 const used=new Set<number>();const layers:PhotoLayerV345[]=[];
 if(Array.isArray(raw.layers))for(const item of raw.layers.slice(0,8)){
  const id=typeof item?.id==='number'&&Number.isInteger(item.id)&&item.id>=0&&item.id<24?item.id:-1;
  if(id<0||used.has(id))continue;
  used.add(id);layers.push(sanitizeLayerV345(item,id));
 }
 return {enabled:raw.enabled===true,layers};
}
const defaultComposition=():PhotoCompositionV345=>({enabled:false,layers:DEFAULT_LAYERS_V345.map(x=>({...x}))});
export function sanitizeCompositionsV345(v:unknown):PhotoCompositionsV345{
 const o=v&&typeof v==='object'?v as Partial<PhotoCompositionsV345>:{};
 return {wide:o.wide?sanitizeCompositionV345(o.wide):defaultComposition(),square:o.square?sanitizeCompositionV345(o.square):defaultComposition(),portrait:o.portrait?sanitizeCompositionV345(o.portrait):defaultComposition()};
}
export function readPhotoCompositionsV345():PhotoCompositionsV345{
 if(typeof window==='undefined')return sanitizeCompositionsV345(null);
 try{return sanitizeCompositionsV345(JSON.parse(localStorage.getItem(MULTI_PHOTO_KEY_V345)||'null'));}catch{return sanitizeCompositionsV345(null);}
}
export function savePhotoCompositionsV345(v:PhotoCompositionsV345):PhotoCompositionsV345{
 const cleaned=sanitizeCompositionsV345(v);
 if(typeof window!=='undefined'){try{localStorage.setItem(MULTI_PHOTO_KEY_V345,JSON.stringify(cleaned));}catch{}window.dispatchEvent(new Event(MULTI_PHOTO_EVENT_V345));}
 return cleaned;
}
export function updatePhotoCompositionV345(ratio:GalleryRatioV344,patch:Partial<PhotoCompositionV345>):PhotoCompositionV345{
 const old=readPhotoCompositionsV345();const next=sanitizeCompositionV345({...old[ratio],...patch});savePhotoCompositionsV345({...old,[ratio]:next});return next;
}
export function updatePhotoLayerV345(ratio:GalleryRatioV344,id:number,patch:Partial<PhotoLayerV345>):PhotoCompositionV345{
 const old=readPhotoCompositionsV345()[ratio];return updatePhotoCompositionV345(ratio,{layers:old.layers.map(layer=>layer.id===id?sanitizeLayerV345({...layer,...patch},id):layer)});
}
export function addPhotoLayerV345(ratio:GalleryRatioV344):PhotoCompositionV345{
 const old=readPhotoCompositionsV345()[ratio];if(old.layers.length>=8)return old;
 const id=Array.from({length:24},(_,i)=>i).find(i=>!old.layers.some(l=>l.id===i));if(id===undefined)return old;
 const n=old.layers.length;return updatePhotoCompositionV345(ratio,{layers:[...old.layers,sanitizeLayerV345({id,x:(n*11)%55,y:(n*9)%50,width:40,height:40,zoom:1,cropX:50,cropY:50,motion:'none'},id)]});
}
export function removePhotoLayerV345(ratio:GalleryRatioV344,id:number){const old=readPhotoCompositionsV345()[ratio];return updatePhotoCompositionV345(ratio,{layers:old.layers.filter(l=>l.id!==id)});}
export interface PhotoPresetV345{name:string;ratio:GalleryRatioV344;layers:PhotoLayerV345[];}
export function readPhotoPresetsV345():PhotoPresetV345[]{
 if(typeof window==='undefined')return [];
 try{const value:unknown=JSON.parse(localStorage.getItem(MULTI_PHOTO_PRESETS_KEY_V345)||'[]');if(!Array.isArray(value))return [];
  return value.slice(0,30).filter(x=>x&&typeof x==='object'&&typeof x.name==='string'&&['wide','square','portrait'].includes(x.ratio)).map(x=>({name:x.name.trim().slice(0,48),ratio:x.ratio as GalleryRatioV344,layers:sanitizeCompositionV345({layers:x.layers}).layers})).filter(x=>x.name);
 }catch{return [];}
}
export function savePhotoPresetV345(name:string,ratio:GalleryRatioV344,layers:PhotoLayerV345[]):PhotoPresetV345[]{
 const safe=name.trim().slice(0,48);if(!safe)return readPhotoPresetsV345();
 const list=[{name:safe,ratio,layers:sanitizeCompositionV345({layers}).layers},...readPhotoPresetsV345().filter(p=>!(p.name===safe&&p.ratio===ratio))].slice(0,30);
 if(typeof window!=='undefined')try{localStorage.setItem(MULTI_PHOTO_PRESETS_KEY_V345,JSON.stringify(list));}catch{}
 return list;
}
export function deletePhotoPresetV345(name:string,ratio:GalleryRatioV344){const list=readPhotoPresetsV345().filter(p=>!(p.name===name&&p.ratio===ratio));if(typeof window!=='undefined')try{localStorage.setItem(MULTI_PHOTO_PRESETS_KEY_V345,JSON.stringify(list));}catch{}return list;}
