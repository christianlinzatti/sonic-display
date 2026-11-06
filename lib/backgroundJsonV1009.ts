import {networkJsonV1010} from './networkJsonV1010';
import {withDeadlineV734} from './requestDeadlineV734';
export type JsonReplyV1009 = Pick<Response,'ok'|'status'|'json'>;
/** Asynchronous, bounded through body decoding; cancellation also aborts the network request. */
export function backgroundJsonV1009(input:RequestInfo|URL,init:RequestInit={},timeoutMs=12000,fetcher:typeof fetch=fetch):Promise<JsonReplyV1009>{
 if(typeof window!=='undefined' && fetcher===fetch && (!init.method||init.method.toUpperCase()==='GET')){
  const url=String(input);const spotify=url.startsWith('/api/spotify/');const genre=url.startsWith('/api/genre');
  const provider=spotify?'spotify':genre?'genre':'generic';
  return networkJsonV1010(input,init,{provider,priority:genre?'lyrics':spotify?'lyrics':'optional',
   ttlMs:spotify?10000:genre?3600000:60000,staleMs:spotify?20000:genre?3600000:600000,timeoutMs}) as Promise<JsonReplyV1009>;
 }
 return withDeadlineV734(async signal=>{
  const response=await fetcher(input,{...init,signal});
  const data=await response.json();
  return {ok:response.ok,status:response.status,json:async()=>data};
 },timeoutMs,init.signal??undefined);
}
