import {getValidSession,ReauthRequiredError} from '@/lib/spotify';
import {NextResponse} from 'next/server';
import {setSessionCookie,clearSessionCookie} from '@/lib/session';
import {pendingVoiceV1008} from '@/lib/alexaVoiceStoreV1008';
import {alexaRelayConfiguredV967} from '@/lib/alexaRedisV967';
export const dynamic='force-dynamic';
export async function GET(){
 let valid:Awaited<ReturnType<typeof getValidSession>>=null;
 const json=(value:object,status=200)=>{const r=NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});if(valid?.refreshed)setSessionCookie(r,valid.session);return r;};
 try{valid=await getValidSession();if(!valid)return json({error:'Unauthorized'},401);
  if(!alexaRelayConfiguredV967()||(process.env.ALEXA_BRIDGE_SECRET||'').length<32)return json({error:'Relay not configured'},503);
  return json({commands:await pendingVoiceV1008()});
 }catch(error){if(error instanceof ReauthRequiredError){const r=json({error:'Unauthorized'},401);clearSessionCookie(r);return r;}return json({error:'Relay unavailable'},503);}
}
