/** V1010: browser-local, account-isolated request governor. No global server singleton. */
export type NetworkPriorityV1010 = 'action'|'playback'|'lyrics'|'optional';
export type NetworkLaneV1010 = 'action'|'playback'|'regular'|'optional';
export type NetworkRequestV1010<T> = {
  key:string; account?:string; provider?:string; priority?:NetworkPriorityV1010;
  signal?:AbortSignal; ttlMs?:number; staleMs?:number; retry?:number;
  execute:(signal:AbortSignal)=>Promise<T>; cacheWhen?:(value:T)=>boolean;
};
type Listener<T> = (value:T)=>void;
type Waiter = {resolve:(value:unknown)=>void;reject:(error:unknown)=>void;remove?:()=>void};
type Job = {key:string;provider:string;priority:NetworkPriorityV1010;lane:NetworkLaneV1010;
  run:(signal:AbortSignal)=>Promise<unknown>;controller:AbortController;waiters:Set<Waiter>;
  ttl:number;stale:number;retry:number;tries:number;readyAt:number;retain:boolean;started:boolean;order:number;cacheWhen?:(value:unknown)=>boolean;retainers:Map<AbortSignal,()=>void>};
type CacheEntry = {value:unknown;freshUntil:number;staleUntil:number};
type Circuit = {failures:number;openUntil:number;probe:boolean};
export class NetworkErrorV1010 extends Error {
  constructor(message:string, public readonly status:number=0, public readonly retryAfter:number=0){super(message);this.name='NetworkErrorV1010';}
}
export function retryAfterMsV1010(header:string|null, now=Date.now()):number {
  if(!header)return 0;
  const seconds=Number(header.trim());
  if(Number.isFinite(seconds)&&seconds>=0)return Math.min(300000,Math.ceil(seconds*1000));
  const parsed=Date.parse(header);
  return Number.isFinite(parsed)?Math.max(0,Math.min(300000,parsed-now)):0;
}
export function requestLaneV1010(priority:NetworkPriorityV1010):NetworkLaneV1010 {
  return priority==='action'?'action':priority==='playback'?'playback':priority==='optional'?'optional':'regular';
}
const DEFAULT_LIMITS:Record<NetworkLaneV1010,number>={action:2,playback:2,regular:3,optional:2};
const weight:Record<NetworkPriorityV1010,number>={action:0,playback:1,lyrics:2,optional:3};
const abortError=()=>Object.assign(new Error('Network request cancelled'),{name:'AbortError'});
const finite=(n:number,defaultValue:number,max:number)=>Number.isFinite(n)?Math.max(0,Math.min(max,n)):defaultValue;
export class NetworkCoordinatorV1010 {
  private readonly running:Record<NetworkLaneV1010,number>={action:0,playback:0,regular:0,optional:0};
  private readonly jobs=new Map<string,Job>();
  private readonly queue:Job[]=[];
  private readonly cache=new Map<string,CacheEntry>();
  private readonly listeners=new Map<string,Set<Listener<unknown>>>();
  private readonly circuits=new Map<string,Circuit>();
  private readonly blocked=new Map<string,number>();
  private timer:ReturnType<typeof setTimeout>|null=null;
  private serial=0;
  private generation=0;
  private account='anonymous';
  constructor(private readonly limits:Record<NetworkLaneV1010,number>=DEFAULT_LIMITS,
    private readonly maxQueue=48,private readonly maxCache=120,private readonly backoffMs=750){}
  /** Switching accounts invalidates ALL in-flight results and in-memory personal data. */
  setAccount(account:string){
    if(!account||this.account===account)return;
    this.reset();this.account=account;
  }
  getAccount(){return this.account;}
  private fullKey(key:string,account:string){return `${this.generation}:${account}:${key}`;}
  peek<T>(key:string,account=this.account):T|undefined{
    const id=this.fullKey(key,account);const entry=this.cache.get(id);
    if(!entry)return undefined;
    if(entry.staleUntil<=Date.now()){this.cache.delete(id);return undefined;}
    return entry.value as T;
  }
  subscribe<T>(key:string,callback:Listener<T>,account=this.account):()=>void{
    const id=this.fullKey(key,account);
    let set=this.listeners.get(id);if(!set){set=new Set();this.listeners.set(id,set);}
    set.add(callback as Listener<unknown>);
    return ()=>{set!.delete(callback as Listener<unknown>);if(!set!.size)this.listeners.delete(id);};
  }
  invalidate(key:string,account=this.account){this.cache.delete(this.fullKey(key,account));}
  clearCachePrefix(prefix:string,account=this.account){const match=`${this.generation}:${account}:${prefix}`;for(const k of this.cache.keys())if(k.startsWith(match))this.cache.delete(k);}
  invalidatePrefix(prefix:string,account=this.account){
    const match=`${this.generation}:${account}:${prefix}`;
    this.clearCachePrefix(prefix,account);
    for(const j of this.jobs.values())if(j.key.startsWith(match))this.cancel(j);
  }
  request<T>(options:NetworkRequestV1010<T>):Promise<T>{
    if(options.signal?.aborted)return Promise.reject(abortError());
    const key=this.fullKey(options.key,options.account??this.account);
    const now=Date.now(),ttl=finite(options.ttlMs??0,0,86400000),stale=finite(options.staleMs??0,0,604800000);
    const existing=this.cache.get(key);
    if(existing){
      if(existing.staleUntil<=now)this.cache.delete(key);
      else if(existing.freshUntil>now)return Promise.resolve(existing.value as T);
      else if(stale>0){
        // Stale-while-revalidate: keep showing existing data. A refresh can outlive callers.
        const refresh=this.enqueue(options,key,ttl,stale,false);
        if(refresh)this.retainStale(refresh,options.signal);
        return Promise.resolve(existing.value as T);
      }
    }
    const job=this.enqueue(options,key,ttl,stale,false);
    if(!job)return Promise.reject(new NetworkErrorV1010('Warteschlange ausgelastet'));
    return new Promise<T>((resolve,reject)=>{
      const waiter:Waiter={resolve:value=>resolve(value as T),reject};
      job.waiters.add(waiter);
      const cancel=()=>{job.waiters.delete(waiter);reject(abortError());if(!job.waiters.size&&!job.retain&&!job.retainers.size)this.cancel(job);};
      if(options.signal){options.signal.addEventListener('abort',cancel,{once:true});waiter.remove=()=>options.signal?.removeEventListener('abort',cancel);if(options.signal.aborted)cancel();}
    });
  }
  private enqueue<T>(options:NetworkRequestV1010<T>,key:string,ttl:number,stale:number,retain:boolean):Job|null{
    let job=this.jobs.get(key);
    if(job)return job;
    const priority=options.priority??'optional';const lane=requestLaneV1010(priority);
    if(this.queue.length>=this.maxQueue){
      // Discard outdated prefetches first; never let them starve deliberate actions.
      const victim=[...this.queue].reverse().find(j=>j.priority==='optional');
      if(victim)this.cancel(victim);
      else if(priority==='optional')return null;
      else if(this.queue.length>=this.maxQueue)return null;
    }
    const provider=options.provider??'generic';
    job={key,provider,priority,lane,run:options.execute as (signal:AbortSignal)=>Promise<unknown>,controller:new AbortController(),waiters:new Set(),ttl,stale,retry:finite(options.retry??2,2,4),tries:0,readyAt:Date.now(),retain,started:false,order:this.serial++,cacheWhen:options.cacheWhen as ((value:unknown)=>boolean)|undefined,retainers:new Map()};
    this.jobs.set(key,job);this.queue.push(job);
    // Queue first, install subscriber synchronously, then dispatch on microtask.
    void Promise.resolve().then(()=>this.pump());
    return job;
  }
  private retainStale(job:Job,signal?:AbortSignal){
    if(!signal){job.retain=true;return;}
    if(job.retainers.has(signal))return;
    const onAbort=()=>{
      const detach=job.retainers.get(signal);detach?.();job.retainers.delete(signal);
      if(!job.retain&&!job.retainers.size&&!job.waiters.size)this.cancel(job);
    };
    job.retainers.set(signal,()=>signal.removeEventListener('abort',onAbort));
    signal.addEventListener('abort',onAbort,{once:true});if(signal.aborted)onAbort();
  }
  private releaseRetainers(job:Job){for(const detach of job.retainers.values())detach();job.retainers.clear();}
  private cancel(job:Job){
    if(this.jobs.get(job.key)!==job)return;
    this.jobs.delete(job.key);
    const index=this.queue.indexOf(job);if(index>=0)this.queue.splice(index,1);
    job.controller.abort();this.releaseRetainers(job);for(const w of job.waiters){w.remove?.();w.reject(abortError());}job.waiters.clear();
    this.pump();
  }
  private offlineOrHidden(job:Job){
    if(typeof navigator!=='undefined'&&navigator.onLine===false)return true;
    return job.priority==='optional'&&typeof document!=='undefined'&&document.visibilityState==='hidden';
  }
  private pump(){
    if(this.timer){clearTimeout(this.timer);this.timer=null;}
    this.queue.sort((a,b)=>weight[a.priority]-weight[b.priority]||a.order-b.order);
    let next=Infinity;const now=Date.now();
    for(const [provider,until] of this.blocked)if(until<=now)this.blocked.delete(provider);
    for(const job of [...this.queue]){
      if(this.jobs.get(job.key)!==job)continue;
      const circuit=this.circuits.get(job.provider);
      const block=Math.max(job.readyAt,this.blocked.get(job.provider)??0,circuit?.openUntil??0);
      if(block>now){next=Math.min(next,block-now);continue;}
      if(this.offlineOrHidden(job))continue;
      if(circuit?.probe)continue;
      if(this.running[job.lane]>=this.limits[job.lane])continue;
      this.queue.splice(this.queue.indexOf(job),1);
      this.running[job.lane]++;
      if(circuit&&circuit.failures>=3)circuit.probe=true;
      job.started=true;
      void this.execute(job);
    }
    if(Number.isFinite(next))this.timer=setTimeout(()=>{this.timer=null;this.pump();},Math.max(1,next));
  }
  private boundedRun(job:Job):Promise<unknown>{
    // Even a provider that ignores AbortSignal cannot occupy a worker forever.
    return new Promise((resolve,reject)=>{
      let finished=false;
      const finish=(error:unknown,value?:unknown)=>{
        if(finished)return;finished=true;clearTimeout(timer);
        job.controller.signal.removeEventListener('abort',onAbort);
        if(error)reject(error);else resolve(value);
      };
      const onAbort=()=>finish(job.controller.signal.reason??abortError());
      const timer=setTimeout(()=>job.controller.abort(new NetworkErrorV1010('Network request timed out',408)),25000);
      job.controller.signal.addEventListener('abort',onAbort,{once:true});
      if(job.controller.signal.aborted){onAbort();return;}
      Promise.resolve().then(()=>job.run(job.controller.signal)).then(value=>finish(null,value),error=>finish(error??new Error('Request failed')));
    });
  }
  private async execute(job:Job){
    let failure:unknown;
    try{
      job.tries++;
      const result=await this.boundedRun(job);
      if(this.jobs.get(job.key)!==job)return;
      const circuit=this.circuits.get(job.provider);
      if(circuit){circuit.failures=0;circuit.openUntil=0;circuit.probe=false;}
      if(job.ttl>0&&(!job.cacheWhen||job.cacheWhen(result))){
        const now=Date.now();this.cache.delete(job.key);
        this.cache.set(job.key,{value:result,freshUntil:now+job.ttl,staleUntil:now+job.ttl+job.stale});
        while(this.cache.size>this.maxCache)this.cache.delete(this.cache.keys().next().value!);
        for(const listener of this.listeners.get(job.key)??[])try{listener(result);}catch{/* user subscriber */}
      }
      this.jobs.delete(job.key);this.releaseRetainers(job);
      for(const w of job.waiters){w.remove?.();w.resolve(result);}job.waiters.clear();
      return;
    }catch(error){failure=error;}
    finally{
      this.running[job.lane]--;
      const circuit=this.circuits.get(job.provider);
      if(circuit)circuit.probe=false;
      void Promise.resolve().then(()=>this.pump());
    }
    if(this.jobs.get(job.key)!==job)return;
    const error=failure as {status?:number;retryAfter?:number;name?:string};
    const status=error?.status??0;
    const retryAfter=finite(error?.retryAfter??0,0,300000);
    if(status===429)this.observeRateLimit(job.provider,retryAfter);
    const retryable=(!status||status===408||status===425||status===429||status>=500)&&error?.name!=='AbortError';
    if(retryable&&job.priority==='optional'&&status!==429){
      const circuit=this.circuits.get(job.provider)??{failures:0,openUntil:0,probe:false};
      circuit.failures++;
      if(circuit.failures>=3)circuit.openUntil=Date.now()+30000;
      this.circuits.set(job.provider,circuit);
    }
    if(retryable&&job.tries<=job.retry&&!job.controller.signal.aborted){
      job.readyAt=Date.now()+Math.max(retryAfter,Math.min(30000,this.backoffMs*2**(job.tries-1)));
      this.queue.push(job);this.pump();return;
    }
    this.jobs.delete(job.key);this.releaseRetainers(job);
    for(const w of job.waiters){w.remove?.();w.reject(failure);}job.waiters.clear();
  }
  /** Hooks can wake work paused by an offline connection or a hidden document. */
  observeRateLimit(provider:string,waitMs:number){
    this.blocked.set(provider,Math.max(this.blocked.get(provider)??0,Date.now()+Math.max(1000,finite(waitMs,1000,300000))));
    this.pump();
  }
  wake(){this.pump();}
  reset(){
    this.generation++;
    for(const job of [...this.jobs.values()])this.cancel(job);
    this.cache.clear();this.listeners.clear();this.blocked.clear();this.circuits.clear();
    if(this.timer)clearTimeout(this.timer);this.timer=null;
  }
  stats(){return {queued:this.queue.length,inFlight:{...this.running},cache:this.cache.size,blockedProviders:this.blocked.size};}
}

/** This singleton lives ONLY in a browser tab, never across Next.js server users. */
export const clientNetworkV1010=new NetworkCoordinatorV1010();
const ACCOUNT_CHANGE='sonic:spotify-account-changed-v1010';
export function resetClientSpotifyV1010(){
  clientNetworkV1010.setAccount(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  if(typeof window!=='undefined'){
    window.dispatchEvent(new Event(ACCOUNT_CHANGE));
    try{window.localStorage.setItem(ACCOUNT_CHANGE,String(Date.now()));}catch{/* storage blocked */}
  }
}
export function setupNetworkWakeV1010(){
  if(typeof window==='undefined')return ()=>{};
  const wake=()=>clientNetworkV1010.wake();
  const otherTab=(e:StorageEvent)=>{if(e.key===ACCOUNT_CHANGE)clientNetworkV1010.setAccount(`external-session-${Date.now()}`);wake();};
  window.addEventListener('online',wake);document.addEventListener('visibilitychange',wake);
  window.addEventListener('storage',otherTab);
  return ()=>{window.removeEventListener('online',wake);document.removeEventListener('visibilitychange',wake);window.removeEventListener('storage',otherTab);};
}
