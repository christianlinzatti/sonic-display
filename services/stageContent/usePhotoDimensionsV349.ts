'use client';
import {useEffect,useState} from 'react';
/** In-memory metadata cache: URLs are never sent to analytics or written to storage. */
export interface PhotoDimensionsV349 {width:number;height:number;}
const cache=new Map<string,PhotoDimensionsV349>();
const MAX_CACHE=120;
export function usePhotoDimensionsV349(images:string[],enabled:boolean,maxProbe=24):Record<string,PhotoDimensionsV349>{
 const signature=images.slice(0,maxProbe).join('\n');
 const [dimensions,setDimensions]=useState<Record<string,PhotoDimensionsV349>>({});
 useEffect(()=>{
  if(!enabled||typeof Image==='undefined'){setDimensions({});return;}
  let cancelled=false;const urls=[...new Set(signature.split('\n').filter(Boolean))].slice(0,Math.max(0,Math.min(24,maxProbe)));
  const known:Record<string,PhotoDimensionsV349>={};
  for(const url of urls){const value=cache.get(url);if(value)known[url]=value;}
  setDimensions(known);
  const pending=urls.filter(u=>!known[u]);
  let next=0,running=0;const active=new Set<HTMLImageElement>();
  // Probe at most four images concurrently; failed remote images are left to the normal <img> fallback.
  const launch=()=>{while(!cancelled&&running<4&&next<pending.length){
   const url=pending[next++];const img=new Image();running++;active.add(img);
   const finish=(success:boolean)=>{
    if(!active.has(img))return;
    active.delete(img);img.onload=null;img.onerror=null;running--;
    if(!cancelled&&success&&img.naturalWidth>0&&img.naturalHeight>0){
     const value={width:img.naturalWidth,height:img.naturalHeight};
     cache.delete(url);cache.set(url,value);
     if(cache.size>MAX_CACHE)cache.delete(cache.keys().next().value as string);
     setDimensions(old=>({...old,[url]:value}));
    }
    launch();
   };
   img.onload=()=>finish(true);img.onerror=()=>finish(false);img.decoding='async';img.src=url;
  }};
  launch();
  return ()=>{cancelled=true;for(const img of active){img.onload=null;img.onerror=null;}active.clear();};
 },[signature,enabled,maxProbe]);
 return dimensions;
}
