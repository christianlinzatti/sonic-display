/** V1139: Govee-only claim/completion; never accept a Spotify/artist command here. */
import {authorizedAlexaGoveeReceiverV1139} from '@/lib/alexaGoveeReceiverServerV1139';
import {alexaRelayConfiguredV967} from '@/lib/alexaRedisV967';
import {voiceIdV1008,validVoiceResultV1008} from '@/lib/alexaVoiceV1008';
import {isGoveePowerCommandV1138} from '@/lib/goveePowerV1138';
import {validGoveeVoiceTargetV1141} from '@/lib/goveeVoiceTargetV1141';
import {readVoiceMessageV1008,claimVoiceV1008,completeVoiceV1008} from '@/lib/alexaVoiceStoreV1008';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(v:object,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(!authorizedAlexaGoveeReceiverV1139(request))return json({error:'Receiver unauthorized'},401);
 if(!alexaRelayConfiguredV967()||(process.env.ALEXA_BRIDGE_SECRET||'').length<32)return json({error:'Relay unavailable'},503);
 if(Number(request.headers.get('content-length')||0)>4000)return json({error:'Too large'},413);
 const raw=await request.text().catch(()=>null);
 if(!raw||Buffer.byteLength(raw)>4000)return json({error:'Invalid payload'},400);
 let v:unknown;try{v=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
 if(!v||typeof v!=='object'||Array.isArray(v))return json({error:'Invalid request'},400);
 const input=v as {id?:unknown;phase?:unknown;token?:unknown;result?:unknown};
 if(!voiceIdV1008(input.id)||!['claim','complete'].includes(String(input.phase)))return json({error:'Invalid request'},400);
 try{
  const message=await readVoiceMessageV1008(input.id);
  if(!message||!isGoveePowerCommandV1138(message.command)||
   (message.goveeTarget!==undefined&&!validGoveeVoiceTargetV1141(message.goveeTarget)))return json({error:'Not a Govee command'},403);
  if(message.createdAt>Date.now()||Date.now()-message.createdAt>180000)return json({error:'Expired'},410);
  if(input.phase==='claim'){
   if(Date.now()-message.createdAt>30000)return json({error:'Expired'},410);
   const token=await claimVoiceV1008(input.id);
   return token?json({token}):json({error:'Already claimed'},409);
  }
  if(!voiceIdV1008(input.token)||!validVoiceResultV1008(input.result)||input.result.kind==='selection')
   return json({error:'Invalid result'},400);
  return await completeVoiceV1008(input.id,input.token,input.result)?json({saved:true}):json({error:'Invalid claim'},409);
 }catch{return json({error:'Relay unavailable'},503);}
}
