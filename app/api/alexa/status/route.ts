import {getValidSession,refreshSession,ReauthRequiredError} from '@/lib/spotify';
import {setSessionCookie,clearSessionCookie} from '@/lib/session';
import {NextResponse} from 'next/server';
import {alexaRelayConfiguredV967} from '@/lib/alexaRedisV967';
import {redis} from '@/lib/push-storage-v365';
import {hasFollowScope,FOLLOW_READ_SCOPE,FOLLOW_WRITE_SCOPE} from '@/lib/artist-follow-v359';
export const dynamic='force-dynamic';
export async function GET(){
 let valid:Awaited<ReturnType<typeof getValidSession>>=null;
 const json=(value:object,status=200)=>{const r=NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});if(valid?.refreshed)setSessionCookie(r,valid.session);return r;};
 try{valid=await getValidSession();if(!valid)return json({spotify:false,relay:'unknown'},401);
  const probe=(token:string)=>fetch('https://api.spotify.com/v1/me/player/currently-playing?additional_types=track',{headers:{Authorization:`Bearer ${token}`},cache:'no-store',signal:AbortSignal.timeout(10000)});
  let response=await probe(valid.session.accessToken);
  if(response.status===401){valid={session:await refreshSession(valid.session),refreshed:true};response=await probe(valid.session.accessToken);}
  if(response.status===401){const r=json({spotify:false,relay:'unknown'},401);clearSessionCookie(r);return r;}
  if(response.status!==200&&response.status!==204)return json({spotify:false,relay:'unknown'},503);
  const finish=json;
  const artistScopes=hasFollowScope(valid.session.scopes,FOLLOW_READ_SCOPE)&&hasFollowScope(valid.session.scopes,FOLLOW_WRITE_SCOPE);
  if(!alexaRelayConfiguredV967()||(process.env.ALEXA_BRIDGE_SECRET||'').length<32)return finish({spotify:true,artistScopes,relay:'not-configured'});
  const reachable=await redis('PING')==='PONG';return finish({spotify:true,artistScopes,relay:reachable?'ready':'unavailable'},reachable?200:503);
 }catch(error){if(error instanceof ReauthRequiredError){const r=json({spotify:false,relay:'unknown'},401);clearSessionCookie(r);return r;}return json({relay:'unavailable' },503);}
}
