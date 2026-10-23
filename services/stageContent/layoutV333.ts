/** V333 — independent multi-screen layout, source routing and live-message policy. */
import type {StageContentSourceV330,StageContentV330} from './stageContentV330';
export type PushPolicyV333='immediate'|'next'|'off';
export type ScreenSourceV333=StageContentSourceV330|'rotation';
export interface ContentScreenV333 {
 id:string; label:string; enabled:boolean; source:ScreenSourceV333;
 x:number;y:number;z:number;scale:number;yaw:number; push:PushPolicyV333;
}
export interface ScreenLayoutV333 {enabled:boolean; screens:ContentScreenV333[];}
export const SCREEN_LAYOUT_KEY_V333='sonic-stage-screen-layout-v333';
export const SCREEN_LAYOUT_EVENT_V333='sonic:stage-layout-v333';
export const DEFAULT_SCREEN_LAYOUT_V333:ScreenLayoutV333={enabled:false,screens:[
 {id:'main',label:'Hauptleinwand',enabled:true,source:'rotation',x:0,y:1.1,z:-3.9,scale:1,yaw:0,push:'immediate'},
 {id:'left',label:'Künstler',enabled:true,source:'photos',x:-3.65,y:1.3,z:-2.5,scale:.53,yaw:.16,push:'off'},
 {id:'right',label:'Konzerte',enabled:true,source:'concerts',x:3.65,y:1.3,z:-2.5,scale:.53,yaw:-.16,push:'next'},
]};
const sourceSet=new Set<ScreenSourceV333>(['rotation','canvas','cover','text','photos','concerts']);
const idPattern=/^[a-z0-9_-]{1,32}$/;
const bound=(v:unknown,def:number,min:number,max:number)=>typeof v==='number'&&Number.isFinite(v)?Math.min(max,Math.max(min,v)):def;
export function sanitizeLayoutV333(value:unknown):ScreenLayoutV333 {
 const raw=(value&&typeof value==='object'&&!Array.isArray(value)?value:{}) as Record<string,unknown>;
 const incoming=Array.isArray(raw.screens)?raw.screens:DEFAULT_SCREEN_LAYOUT_V333.screens;
 const seen=new Set<string>();
 const screens:ContentScreenV333[]=incoming.slice(0,5).flatMap((candidate,i)=>{
   if(!candidate||typeof candidate!=='object'||Array.isArray(candidate))return [];
   const row=candidate as Record<string,unknown>;
   const id=typeof row.id==='string'&&idPattern.test(row.id)?row.id:`screen-${i+1}`;
   if(seen.has(id))return [];seen.add(id);
   return [{id,label:typeof row.label==='string'?row.label.slice(0,45):`Leinwand ${i+1}`,enabled:row.enabled!==false,
     source:sourceSet.has(row.source as ScreenSourceV333)?row.source as ScreenSourceV333:'rotation',
     x:bound(row.x,0,-6,6),y:bound(row.y,1.1,-.4,3.6),z:bound(row.z,-3.9,-7,-.6),
     scale:bound(row.scale,1,.25,1.8),yaw:bound(row.yaw,0,-.8,.8),
     push:row.push==='next'||row.push==='off'?row.push:'immediate'}];
 });
 return {enabled:raw.enabled===true,screens};
}
export function readLayoutV333():ScreenLayoutV333 {
 if(typeof window==='undefined')return sanitizeLayoutV333(null);
 try{return sanitizeLayoutV333(JSON.parse(localStorage.getItem(SCREEN_LAYOUT_KEY_V333)||'null'));}catch{return sanitizeLayoutV333(null);}
}
export function saveLayoutV333(value:ScreenLayoutV333):ScreenLayoutV333 {
 const clean=sanitizeLayoutV333(value);
 if(typeof window!=='undefined'){
  try{localStorage.setItem(SCREEN_LAYOUT_KEY_V333,JSON.stringify(clean));}catch{}
  window.dispatchEvent(new Event(SCREEN_LAYOUT_EVENT_V333));
 }
 return clean;
}
export function pickScreenSlideV333(screen:ContentScreenV333,slides:StageContentV330[],index:number,push:StageContentV330|null,rotationSerial:number,pushSerial:number):StageContentV330|null {
 // immediate can temporarily show every live push. "next" is staged until the next scheduled rotation.
 if(push&&push.kind==='text'&&(screen.push==='immediate'||(screen.push==='next'&&rotationSerial>pushSerial)))return push;
 const options=screen.source==='rotation'?slides:slides.filter(x=>x.source===screen.source);
 if(!options.length)return null;
 return options[((Math.max(0,Math.floor(index))%options.length)+options.length)%options.length];
}
