/** V1017: bounded, tab-local response cache. No persistent storage or request identifiers in telemetry. */
export type TimedCacheValueV1017={value:unknown;freshUntil:number;staleUntil:number};
type StoredV1017<T>= {item:T;bytes:number;hits:number;warmed:boolean};
export type CacheStatsV1017={entries:number;entryLimit:number;usedKiB:number;budgetKiB:number;
  hits:number;misses:number;expired:number;evicted:number;oversized:number;warmups:number};

/** Requests still choose their TTL. Provider rules are upper bounds, never new permission to cache. */
export function boundedCacheLifetimeV1017(provider:string,key:string,ttlMs:number,staleMs:number){
  const p=provider.toLowerCase();const k=key.toLowerCase();
  if(k.includes('/api/spotify/current')||k.includes('/api/spotify/player/current'))return {ttl:0,stale:0};
  const maxTtl=p==='spotify'?(k.includes('/artists/follow')?15000:
    k.includes('/devices')||k.includes('/player/settings')?12000:300000):
    p==='lyrics'||p==='lrclib'||p==='genius'?3600000:
    p==='stage-content'?1800000:600000;
  const maxStale=p==='spotify'?300000:p==='lyrics'||p==='lrclib'||p==='genius'?3600000:7200000;
  const ttl=Math.max(0,Math.min(maxTtl,Number.isFinite(ttlMs)?ttlMs:0));
  return {ttl,stale:ttl>0?Math.max(0,Math.min(maxStale,Number.isFinite(staleMs)?staleMs:0)):0};
}

export class IntelligentCacheV1017<T extends TimedCacheValueV1017>{
  private readonly entries=new Map<string,StoredV1017<T>>();
  private bytes=0;
  private counters={hits:0,misses:0,expired:0,evicted:0,oversized:0,warmups:0};
  constructor(private readonly entryLimit=120,private readonly budgetBytes=2*1024*1024,
    private readonly singleLimitBytes=256*1024){}
  get size(){return this.entries.size;}
  keys(){return this.entries.keys();}
  private estimate(value:unknown):number{
    try{const json=JSON.stringify(value);return typeof json==='string'?Math.max(32,json.length*2):Infinity;}
    catch{return Infinity;}
  }
  private remove(key:string){const old=this.entries.get(key);if(!old)return false;
    this.bytes-=old.bytes;this.entries.delete(key);return true;}
  get(key:string,now=Date.now()):T|undefined{
    const item=this.entries.get(key);
    if(!item){this.counters.misses++;return undefined;}
    if(item.item.staleUntil<=now){this.remove(key);this.counters.expired++;this.counters.misses++;return undefined;}
    item.hits++;this.counters.hits++;
    // A read moves the entry to MRU. Hot items survive capacity pressure.
    this.entries.delete(key);this.entries.set(key,item);
    return item.item;
  }
  delete(key:string){return this.remove(key);}
  clear(){this.entries.clear();this.bytes=0;this.counters={hits:0,misses:0,expired:0,evicted:0,oversized:0,warmups:0};}
  prune(now=Date.now()){
    for(const [key,entry] of this.entries)if(entry.item.staleUntil<=now){this.remove(key);this.counters.expired++;}
  }
  set(key:string,item:T,now=Date.now()):boolean{
    this.remove(key);
    if(!Number.isFinite(item.staleUntil)||item.staleUntil<=now||this.entryLimit<1){return false;}
    const bytes=this.estimate(item.value);
    if(!Number.isFinite(bytes)||bytes>this.singleLimitBytes||bytes>this.budgetBytes){this.counters.oversized++;return false;}
    this.prune(now);
    while(this.entries.size>=this.entryLimit||this.bytes+bytes>this.budgetBytes){
      const oldest=this.entries.keys().next().value;
      if(oldest===undefined)break;
      this.remove(oldest);this.counters.evicted++;
    }
    this.entries.set(key,{item,bytes,hits:0,warmed:false});this.bytes+=bytes;
    return true;
  }
  /** Only frequently read, nearly expired *fresh* entries can be warmed. */
  shouldWarm(key:string,now=Date.now()):boolean{
    const entry=this.entries.get(key);
    if(!entry||entry.warmed||entry.hits<3)return false;
    const ttl=Math.max(0,entry.item.staleUntil-entry.item.freshUntil);
    const remaining=entry.item.freshUntil-now;
    // Fixed cap avoids excessive refreshes on long-lived records.
    return remaining>0 && remaining<=Math.max(1000,Math.min(15000,ttl||15000));
  }
  markWarmed(key:string){const entry=this.entries.get(key);if(!entry||entry.warmed)return;
    entry.warmed=true;this.counters.warmups++;}
  snapshot():CacheStatsV1017{return {entries:this.entries.size,entryLimit:this.entryLimit,
    usedKiB:Math.ceil(this.bytes/1024),budgetKiB:Math.ceil(this.budgetBytes/1024),...this.counters};}
}
