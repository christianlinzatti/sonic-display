/** Owner-aware, LRU cache for decoded GLTF payloads.
 * V768 adds a *soft estimated byte budget* in addition to the idle-entry cap.
 * Active stage/preview models are NEVER evicted. Neither this helper nor
 * useGLTF.clear() disposes shared GPU geometries/materials/textures: individual
 * mounted instances are responsible for their own owned resources.
 */
export function createPreviewGltfCacheV654(clear:(url:string)=>void,maxInactive=12,maxInactiveBytes=Infinity){
  type Entry={owners:number;last:number;estimatedBytes:number};
  const entries=new Map<string,Entry>();
  let tick=0;
  const limit=Math.max(0,Number.isFinite(maxInactive)?Math.floor(maxInactive):12);
  const budget=Number.isFinite(maxInactiveBytes)?Math.max(0,Math.floor(maxInactiveBytes)):Infinity;
  let clearFailures=0;
  const safeClear=(url:string)=>{try{clear(url);}catch{clearFailures++;}};
  const prune=()=>{
    const idle=[...entries].filter(([,e])=>e.owners===0).sort((a,b)=>a[1].last-b[1].last);
    let bytes=idle.reduce((sum,[,entry])=>sum+entry.estimatedBytes,0);
    while(idle.length>limit||bytes>budget){
      const [url,entry]=idle.shift()!;
      // Entries are removed *before* calling the external clearing hook; no
      // stale owner/entry can be accidentally reused by a synchronous callback.
      entries.delete(url);
      bytes-=entry.estimatedBytes;
      safeClear(url);
    }
  };
  return {
    retain(url:string){
      const entry=entries.get(url)??{owners:0,last:0,estimatedBytes:0};
      entry.owners++;entry.last=++tick;entries.set(url,entry);
      let released=false;
      return ()=>{
        if(released)return;
        released=true;
        const active=entries.get(url);
        if(!active)return;
        active.owners=Math.max(0,active.owners-1);active.last=++tick;
        // Object URL payloads are transient: do not leave a decoded copy after
        // the final preview closes, even if the idle budget has room.
        if(active.owners===0&&(url.startsWith('blob:')||url.startsWith('data:'))){
          entries.delete(url);safeClear(url);
        }
        prune();
      };
    },
    /** Record an already decoded, one-time estimate. Does not make a new owner. */
    setEstimatedBytes(url:string,bytes:number){
      const entry=entries.get(url);
      if(!entry)return;
      entry.estimatedBytes=Number.isFinite(bytes)&&bytes>=0?Math.min(Math.ceil(bytes),2**40):0;
      prune();
    },
    /** Manually clear only entries without owners; active GLTF payloads remain pinned.
     * This only drops Drei's decode-cache reference, not guaranteed VRAM bytes. */
    trimInactive(){
      const idle=[...entries].filter(([,entry])=>entry.owners===0);
      let releasedEstimatedBytes=0;
      for(const [url,entry] of idle){
        entries.delete(url);
        releasedEstimatedBytes+=entry.estimatedBytes;
        safeClear(url);
      }
      return {entries:idle.length,releasedEstimatedBytes,clearFailures};
    },
    snapshot(){return [...entries].map(([url,v])=>({url,owners:v.owners,estimatedBytes:v.estimatedBytes}));},
    stats(){
      const all=[...entries.values()],idle=all.filter(e=>e.owners===0);
      return {entries:all.length,activeEntries:all.length-idle.length,idleEntries:idle.length,
        activeEstimatedBytes:all.filter(e=>e.owners>0).reduce((n,e)=>n+e.estimatedBytes,0),
        idleEstimatedBytes:idle.reduce((n,e)=>n+e.estimatedBytes,0),idleLimit:limit,idleByteBudget:budget,clearFailures};
    },
  };
}
