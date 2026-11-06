import {randomUUID} from 'node:crypto';
import {redis} from './push-storage-v365';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';
const prefix='sonic:alexa:voice:v1008:';
export async function enqueueVoiceV1008(message:VoiceMessageV1008){
 if(await redis('SET',prefix+'message:'+message.id,JSON.stringify(message),'EX',180)!=='OK')throw Error('Relay unavailable');
 await redis('SET',prefix+'last-request',message.id,'EX',120);
 await redis('RPUSH',prefix+'queue',JSON.stringify(message));await redis('LTRIM',prefix+'queue',-20,-1);await redis('EXPIRE',prefix+'queue',60);
}
export async function pendingVoiceV1008():Promise<unknown[]>{
 const values=await redis('LRANGE',prefix+'queue',0,-1);
 if(!Array.isArray(values))return [];
 const messages:unknown[]=[];for(const raw of values){if(typeof raw==='string'){try{const v=JSON.parse(raw);if(typeof v.id==='string'&&/^[a-f0-9-]{36}$/i.test(v.id)&&Number.isSafeInteger(v.createdAt)&&Date.now()-v.createdAt<=30000&&v.createdAt<=Date.now())messages.push(v);}catch{/* invalid entry */}}}const claims=messages.length?await redis('MGET',...messages.map(v=>prefix+'claim:'+(v as VoiceMessageV1008).id)):[];
 return Array.isArray(claims)?messages.filter((_v,i)=>claims[i]===null):[];
}
export async function readVoiceMessageV1008(id:string):Promise<VoiceMessageV1008|null>{const v=await redis('GET',prefix+'message:'+id);return typeof v==='string'?JSON.parse(v):null;}
export async function claimVoiceV1008(id:string):Promise<string|null>{const token=randomUUID();return await redis('SET',prefix+'claim:'+id,token,'EX',180,'NX')==='OK'?token:null;}
export async function completeVoiceV1008(id:string,token:string,result:VoiceResultV1008):Promise<boolean>{
 if(await redis('GET',prefix+'claim:'+id)!==token)return false;
 if(await redis('SET',prefix+'result:'+id,JSON.stringify(result),'EX',120,'NX')!=='OK')return false;
 await redis('SET',prefix+'last-result',id,'EX',120);return true;
}
export async function voiceResultV1008(id:string):Promise<unknown>{
 const key=id==='latest'?await redis('GET',prefix+'last-request'):id;
 if(typeof key!=='string')return null;const raw=await redis('GET',prefix+'result:'+key);return typeof raw==='string'?JSON.parse(raw):null;
}
