/** Small server-only Redis REST adapter; no dependency on in-memory/ephemeral function state. */
import 'server-only';
import type {PushAccountV365,PushSubscriptionV365} from '@/lib/push-v365';
export function pushConfigured():boolean{return !!(process.env.UPSTASH_REDIS_REST_URL&&process.env.UPSTASH_REDIS_REST_TOKEN&&process.env.PUSH_ENCRYPTION_KEY&&process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY&&process.env.VAPID_PRIVATE_KEY&&process.env.VAPID_SUBJECT);}
export function pushSecrets(){
 if(!pushConfigured())throw new Error('Push service not configured');
 const key=process.env.PUSH_ENCRYPTION_KEY!;
 if(Buffer.from(key,'base64url').length!==32)throw new Error('Invalid PUSH_ENCRYPTION_KEY');
 return {key,publicKey:process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,privateKey:process.env.VAPID_PRIVATE_KEY!,subject:process.env.VAPID_SUBJECT!};
}
const prefix='sonic:push:v365:';
export const pushKeys={users:`${prefix}users`,rotation:`${prefix}rotation`,cronLock:`${prefix}cron-lock`,account:(id:string)=>`${prefix}account:${id}`,subs:(id:string)=>`${prefix}subs:${id}`,sub:(id:string,endpointId:string)=>`${prefix}sub:${id}:${endpointId}`};
type Json=string|number|null|boolean|string[]|number[]|Record<string,unknown>;
export async function redis(cmd:string,...args:(string|number)[]):Promise<unknown>{
 const origin=process.env.UPSTASH_REDIS_REST_URL,token=process.env.UPSTASH_REDIS_REST_TOKEN;
 if(!origin||!token||!/^https:\/\//.test(origin))throw new Error('Redis unavailable');
 const response=await fetch(origin,{method:'POST',headers:{Authorization:`Bearer ${token}`,'Content-Type':'application/json'},body:JSON.stringify([cmd,...args]),cache:'no-store',signal:AbortSignal.timeout(9000)});
 if(!response.ok)throw new Error(`Redis HTTP ${response.status}`);
 const obj=await response.json() as {result?:Json;error?:unknown};if(obj.error)throw new Error('Redis command error');return obj.result;
}
export async function readPushAccount(id:string):Promise<PushAccountV365|null>{
 const v=await redis('GET',pushKeys.account(id));if(typeof v!=='string')return null;
 try{return JSON.parse(v) as PushAccountV365;}catch{return null;}
}
export async function savePushAccount(id:string,account:PushAccountV365){await redis('SET',pushKeys.account(id),JSON.stringify(account));await redis('SADD',pushKeys.users,id);}
export async function listPushSubscriptions(id:string):Promise<{key:string;subscription:PushSubscriptionV365}[]>{
 const members=await redis('SMEMBERS',pushKeys.subs(id));if(!Array.isArray(members))return [];
 const out:{key:string;subscription:PushSubscriptionV365}[]=[];
 for(const key of members.slice(0,10)){
  if(typeof key!=='string'||!/^[0-9a-f]{64}$/.test(key))continue;
  const raw=await redis('GET',pushKeys.sub(id,key));if(typeof raw!=='string')continue;
  try{const subscription=JSON.parse(raw) as PushSubscriptionV365;if(subscription?.endpoint&&subscription?.keys)out.push({key,subscription});}catch{}
 }
 return out;
}
export async function deletePushSubscription(id:string,key:string){await redis('DEL',pushKeys.sub(id,key));await redis('SREM',pushKeys.subs(id),key);}
export async function revokePushAccount(id:string){
 const all=await listPushSubscriptions(id);
 for(const s of all)await deletePushSubscription(id,s.key);
 await redis('DEL',pushKeys.account(id));await redis('DEL',pushKeys.subs(id));await redis('SREM',pushKeys.users,id);
}
