import {clientNetworkV1010,NetworkErrorV1010,retryAfterMsV1010,type NetworkPriorityV1010} from './networkCoordinatorV1010';
import {withDeadlineV734} from './requestDeadlineV734';
export type NetworkJsonMetaV1010={priority?:NetworkPriorityV1010;provider?:string;ttlMs?:number;staleMs?:number;retry?:number;timeoutMs?:number;account?:string;fresh?:boolean;cachePayload?:(value:unknown)=>boolean};
export type NetworkJsonReplyV1010={ok:boolean;status:number;json:()=>Promise<unknown>;payload?:unknown};
/** Shared browser GET; failures are never cached. Caller controls authentication scope. */
export async function networkJsonV1010(input:RequestInfo|URL,init:RequestInit={},meta:NetworkJsonMetaV1010={}):Promise<NetworkJsonReplyV1010>{
 const url=String(input),method=(init.method??'GET').toUpperCase();
 const invoke=()=>withDeadlineV734(async signal=>{
  const result=await fetch(input,{...init,signal});
  const data=await result.json();
  if(result.status===429||result.status===408||result.status>=500){
   throw new NetworkErrorV1010(`Dienst vorübergehend nicht erreichbar (${result.status})`,result.status,retryAfterMsV1010(result.headers.get('Retry-After')));
  }
  if(result.status===401&&url.includes('/api/spotify/'))clientNetworkV1010.clearCachePrefix('spotify:');
  return {ok:result.ok,status:result.status,json:async()=>data,payload:data};
 },meta.timeoutMs??12000,init.signal??undefined);
 // Mutations are never coalesced, cached or retried. They get a dedicated action lane
 // only when intentionally scheduled through requestActionV1010.
 if(typeof window==='undefined'||method!=='GET')return invoke();
 const key=(meta.provider??'generic')+':'+url;
 const requestKey=meta.provider==='spotify'?'spotify:'+url:key;
 if(meta.fresh)clientNetworkV1010.invalidate(requestKey,meta.account);
 return clientNetworkV1010.request({key:requestKey,account:meta.account,provider:meta.provider??'generic',
  priority:meta.priority??'optional',signal:init.signal??undefined,ttlMs:meta.ttlMs??0,staleMs:meta.staleMs??0,
  retry:meta.retry??2,cacheWhen:reply=>reply.ok&&(!meta.cachePayload||meta.cachePayload(reply.payload)),execute:signal=>withDeadlineV734(async deadline=>{
   const result=await fetch(input,{...init,signal:deadline});const data=await result.json();
   if(result.status===429||result.status===408||result.status>=500){throw new NetworkErrorV1010(`Dienst vorübergehend nicht erreichbar (${result.status})`,result.status,retryAfterMsV1010(result.headers.get('Retry-After')));}
   if(result.status===401&&url.includes('/api/spotify/'))clientNetworkV1010.clearCachePrefix('spotify:');
   return {ok:result.ok,status:result.status,json:async()=>data,payload:data};
  },meta.timeoutMs??12000,signal)});
}
/** Deliberate user actions have two reserved slots and no retries/deduplication. */
export function requestActionV1010<T>(key:string,execute:(signal:AbortSignal)=>Promise<T>,signal?:AbortSignal):Promise<T>{
 if(typeof window==='undefined')return execute(signal??new AbortController().signal);
 return clientNetworkV1010.request({key:`action:${key}:${Date.now()}:${Math.random()}`,provider:'spotify',priority:'action',retry:0,signal,execute:async bounded=>{
  const result=await withDeadlineV734(execute,12000,bounded);
  // Do not replay writes. But a 429 from one action must also hold later reads/writes.
  if(result&&typeof result==='object'&&'status' in result&&result.status===429){
   const headers=('headers' in result)?result.headers as Headers:undefined;
   clientNetworkV1010.observeRateLimit('spotify',retryAfterMsV1010(headers?.get?.('Retry-After')??null));
  }
  return result;
 }});
}
