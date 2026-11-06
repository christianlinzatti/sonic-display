/** V967: Serverless-safe, expiring Alexa command relay via configured Upstash REST. */
import {redis} from './push-storage-v365';
import type {ArtistVoiceMessageV1007} from './alexaArtistV1007';
import type {AlexaQueuedCommandV970} from './alexaGoveeV970';
const LATEST='sonic:alexa:v967:latest';
const NONCE_PREFIX='sonic:alexa:v967:nonce:';
export function alexaRelayConfiguredV967():boolean {
 return Boolean(process.env.UPSTASH_REDIS_REST_URL?.startsWith('https://')&&process.env.UPSTASH_REDIS_REST_TOKEN);
}
export async function claimAlexaNonceV967(nonce:string):Promise<boolean>{
 return (await redis('SET',NONCE_PREFIX+nonce,'1','EX',180,'NX'))==='OK';
}
export async function saveAlexaCommandV967(message:{id:string;command:AlexaQueuedCommandV970['command']|ArtistVoiceMessageV1007['command'];createdAt:number}):Promise<void>{
 const result=await redis('SET',LATEST,JSON.stringify(message),'EX',75);
 if(result!=='OK')throw new Error('Alexa command not stored');
}
export async function readAlexaCommandV967():Promise<unknown>{
 const raw=await redis('GET',LATEST);
 if(typeof raw!=='string')return null;
 try{return JSON.parse(raw) as unknown;}catch{return null;}
}
