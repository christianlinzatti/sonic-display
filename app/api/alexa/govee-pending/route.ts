/** V1139: narrow, token-authenticated Govee-only queue for browsers without Spotify. */
import {authorizedAlexaGoveeReceiverV1139} from '@/lib/alexaGoveeReceiverServerV1139';
import {alexaRelayConfiguredV967} from '@/lib/alexaRedisV967';
import {pendingVoiceV1008} from '@/lib/alexaVoiceStoreV1008';
import {isGoveeOnlyVoiceCommandV1143} from '@/lib/goveeMusicVoiceV1143';
import {validGoveeVoiceTargetV1141} from '@/lib/goveeVoiceTargetV1141';
import {isGoveeVoiceLookCommandV1146,validGoveeVoiceLookV1146} from '@/lib/goveeVoiceLookV1146';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(v:object,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function GET(request:Request){
 if(!authorizedAlexaGoveeReceiverV1139(request))return json({error:'Receiver unauthorized'},401);
 if(!alexaRelayConfiguredV967()||(process.env.ALEXA_BRIDGE_SECRET||'').length<32)return json({error:'Relay unavailable'},503);
 try{
  const values=await pendingVoiceV1008();
  return json({commands:values.filter(v=>{
   if(!v||typeof v!=='object'||Array.isArray(v))return false;
   const msg=v as {command?:unknown;goveeTarget?:unknown;goveeLook?:unknown};
   return isGoveeOnlyVoiceCommandV1143(msg.command)&&
    (msg.goveeTarget===undefined||(['govee-power-on','govee-power-off'].includes(String(msg.command))&&validGoveeVoiceTargetV1141(msg.goveeTarget)))&&
    (isGoveeVoiceLookCommandV1146(msg.command)?validGoveeVoiceLookV1146(msg.command,msg.goveeLook):msg.goveeLook===undefined);
  })});
 }catch{return json({error:'Relay unavailable'},503);}
}
