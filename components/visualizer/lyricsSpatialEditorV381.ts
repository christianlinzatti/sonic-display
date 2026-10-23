/** Persistent stage-space caption layout. Coordinates are offsets from the established V380 side anchor. */
export interface LyricsSpatialLayoutV381 {
  x:number; y:number; z:number; scale:number; safeMargin:number; faceGuard:boolean;
}
export type SpatialDragModeV381="move"|"scale";
export type ScreenRectV381={left:number;right:number;top:number;bottom:number};
export const DEFAULT_LYRICS_LAYOUT_V381:Readonly<LyricsSpatialLayoutV381> = Object.freeze({x:0,y:0,z:0,scale:1,safeMargin:.12,faceGuard:true});
const safe=(n:unknown,fallback:number)=>typeof n==="number"&&Number.isFinite(n)?n:fallback;
const clamp=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
export function normalizeSpatialLayoutV381(input:Partial<LyricsSpatialLayoutV381>|null|undefined):LyricsSpatialLayoutV381 {
  return {x:clamp(safe(input?.x,0),-2,2),y:clamp(safe(input?.y,0),-1.4,1.4),
    z:clamp(safe(input?.z,0),-1.5,1.5),scale:clamp(safe(input?.scale,1),.55,2),
    safeMargin:clamp(safe(input?.safeMargin,.12),0,.4),faceGuard:input?.faceGuard!==false};
}
export function dragSpatialLayoutV381(origin:LyricsSpatialLayoutV381,dx:number,dy:number,mode:SpatialDragModeV381):LyricsSpatialLayoutV381 {
  if(mode==="scale")return normalizeSpatialLayoutV381({...origin,scale:origin.scale+safe(dx,0)*.46+safe(dy,0)*.1});
  return normalizeSpatialLayoutV381({...origin,x:origin.x+safe(dx,0),y:origin.y+safe(dy,0)});
}
/** Rectangles are normalized 0..1 viewport values, based on the active Three.js camera. */
export function overlapRectsV381(a:ScreenRectV381,b:ScreenRectV381,margin=0):boolean {
  const m=clamp(safe(margin,0),0,.4);
  return a.left<b.right+m&&a.right>b.left-m&&a.top<b.bottom+m&&a.bottom>b.top-m;
}
export function checkFaceSafetyV381(caption:ScreenRectV381,faces:readonly ScreenRectV381[],margin:number):number[] {
  return faces.flatMap((face,i)=>overlapRectsV381(caption,face,margin)?[i]:[]);
}
/** Find the nearest collision-free candidate, retaining user's chosen depth/scale. */
export function findSafeLayoutV381(base:LyricsSpatialLayoutV381,isBlocked:(layout:LyricsSpatialLayoutV381)=>boolean):LyricsSpatialLayoutV381|null {
  const original=normalizeSpatialLayoutV381(base);
  if(!isBlocked(original))return original;
  const candidates:LyricsSpatialLayoutV381[]=[];
  for(const dy of [0,.2,-.2,.4,-.4,.7,-.7,1,-1,1.3,-1.3]) {
    for(const dx of [0,.25,-.25,.5,-.5,.8,-.8,1.2,-1.2,1.7,-1.7]) {
      const next=normalizeSpatialLayoutV381({...original,x:original.x+dx,y:original.y+dy});
      if(next.x!==original.x+dx||next.y!==original.y+dy)continue;
      candidates.push(next);
    }
  }
  candidates.sort((a,b)=>((a.x-original.x)**2+(a.y-original.y)**2)-((b.x-original.x)**2+(b.y-original.y)**2));
  return candidates.find(candidate=>!isBlocked(candidate))??null;
}
export interface NamedSpatialLayoutV381 { id:string;name:string;layout:LyricsSpatialLayoutV381; }
/** Presets are local to the browser and never transferred to Spotify or a server. */
export function parseLayoutPresetsV381(raw:string|null):NamedSpatialLayoutV381[] {
  if(!raw)return [];
  try {const value:unknown=JSON.parse(raw);if(!Array.isArray(value))return [];
    return value.slice(0,30).filter((entry):entry is {id:string;name:string;layout:LyricsSpatialLayoutV381}=>
      !!entry&&typeof entry==="object"&&typeof entry.id==="string"&&typeof entry.name==="string"&&!!entry.layout&&typeof entry.layout==="object")
      .map(entry=>({id:entry.id.slice(0,80),name:entry.name.trim().slice(0,60),layout:normalizeSpatialLayoutV381(entry.layout)}))
      .filter(entry=>entry.id.length>0&&entry.name.length>0);
  } catch {return [];}
}
