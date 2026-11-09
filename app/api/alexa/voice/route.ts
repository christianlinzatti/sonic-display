import {createHmac,timingSafeEqual,randomUUID} from 'node:crypto';
import {alexaRelayConfiguredV967,claimAlexaNonceV967} from '@/lib/alexaRedisV967';
import {isVoiceCommandV1008,validTargetV1008,voiceIdV1008} from '@/lib/alexaVoiceV1008';
import {isGoveePowerCommandV1138} from '@/lib/goveePowerV1138';
import {validGoveeVoiceTargetV1141} from '@/lib/goveeVoiceTargetV1141';
import {isGoveeVoiceLookCommandV1146,validGoveeVoiceLookV1146} from '@/lib/goveeVoiceLookV1146';
import {enqueueVoiceV1008,voiceResultV1008} from '@/lib/alexaVoiceStoreV1008';
export const runtime='nodejs';export const dynamic='force-dynamic';
const json=(v:object,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 const secret=process.env.ALEXA_BRIDGE_SECRET||'';
 if(secret.length<32||!alexaRelayConfiguredV967())return json({error:'Relay not configured'},503);
 const stamp=request.headers.get('x-sonic-timestamp')||'',nonce=request.headers.get('x-sonic-nonce')||'',sig=request.headers.get('x-sonic-signature')||'';
 if(!/^\d{13}$/.test(stamp)||Math.abs(Date.now()-Number(stamp))>60000||!/^[a-z0-9-]{16,80}$/i.test(nonce)||!/^[a-f0-9]{64}$/i.test(sig)||!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))return json({error:'Unauthorized'},401);
 if(Number(request.headers.get('content-length')||0)>4096)return json({error:'Too large'},413);
 const raw=await request.text();if(Buffer.byteLength(raw)>4096)return json({error:'Too large'},413);
 const expected=createHmac('sha256',secret).update(`${stamp}.${nonce}.${raw}`).digest();
 if(!timingSafeEqual(expected,Buffer.from(sig,'hex')))return json({error:'Unauthorized'},401);
 let v;try{v=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
 if(!v||typeof v!=='object'||Array.isArray(v))return json({error:'Invalid command'},400);
 if(v.read!==undefined&&!(voiceIdV1008(v.read)||v.read==='latest'))return json({error:'Invalid request ID'},400);
 if(v.read===undefined&&(!isVoiceCommandV1008(v.command)||(v.target!==undefined&&(!validTargetV1008(v.target)||!['artist-follow','artist-unfollow','artist-status'].includes(v.command)))||
   (v.goveeTarget!==undefined&&(!isGoveePowerCommandV1138(v.command)||!validGoveeVoiceTargetV1141(v.goveeTarget)||v.target!==undefined))||
   (isGoveeVoiceLookCommandV1146(v.command)?(v.goveeTarget!==undefined||v.target!==undefined||!validGoveeVoiceLookV1146(v.command,v.goveeLook)):v.goveeLook!==undefined)))return json({error:'Invalid command'},400);
 try{
  if(!await claimAlexaNonceV967(nonce))return json({error:'Duplicate request'},409);
  if(v.read!==undefined)return json({result:await voiceResultV1008(v.read)});
  const message={id:randomUUID(),command:v.command,createdAt:Date.now(),...(v.target?{target:v.target}:{}),...(v.goveeTarget?{goveeTarget:v.goveeTarget}:{}),...(v.goveeLook?{goveeLook:v.goveeLook}:{})};
  await enqueueVoiceV1008(message);return json({queued:true,id:message.id});
 }catch{return json({error:'Relay unavailable'},503);}
}
