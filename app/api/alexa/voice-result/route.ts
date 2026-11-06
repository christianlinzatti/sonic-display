import {getValidSession,ReauthRequiredError} from '@/lib/spotify';
import {NextResponse} from 'next/server';
import {setSessionCookie,clearSessionCookie} from '@/lib/session';
import {spotifyCallbackUrl} from '@/lib/spotify-origin';
import {voiceIdV1008,validVoiceResultV1008} from '@/lib/alexaVoiceV1008';
import {readVoiceMessageV1008,claimVoiceV1008,completeVoiceV1008} from '@/lib/alexaVoiceStoreV1008';
export const dynamic='force-dynamic';
export async function POST(request:Request){
 let valid:Awaited<ReturnType<typeof getValidSession>>=null;
 const json=(v:object,status=200)=>{const r=NextResponse.json(v,{status,headers:{'Cache-Control':'private, no-store'}});if(valid?.refreshed)setSessionCookie(r,valid.session);return r;};
 if(request.headers.get('origin')!==spotifyCallbackUrl().origin)return json({error:'Origin mismatch'},403);
 try{
  valid=await getValidSession();if(!valid)return json({error:'Unauthorized'},401);
  if(Number(request.headers.get('content-length')||0)>6000)return json({error:'Too large'},413);
  const raw=await request.text();if(Buffer.byteLength(raw)>6000)return json({error:'Too large'},413);
  let v;try{v=JSON.parse(raw);}catch{return json({error:'Invalid JSON'},400);}
  if(!voiceIdV1008(v?.id)||!['claim','complete'].includes(v?.phase))return json({error:'Invalid request'},400);
  const message=await readVoiceMessageV1008(v.id);
  if(!message||Date.now()-message.createdAt>180000||message.createdAt>Date.now())return json({error:'Expired'},410);
  if(v.phase==='claim'){
   if(Date.now()-message.createdAt>30000)return json({error:'Expired'},410);
   const token=await claimVoiceV1008(v.id);return token?json({token}):json({error:'Already claimed'},409);
  }
  if(!voiceIdV1008(v.token)||!validVoiceResultV1008(v.result))return json({error:'Invalid result'},400);
  if(v.result.kind==='selection'&&(!['artist-follow','artist-unfollow','artist-status'].includes(message.command)||v.result.action!==message.command))return json({error:'Invalid selection'},400);
  return await completeVoiceV1008(v.id,v.token,v.result)?json({saved:true}):json({error:'Invalid claim'},409);
 }catch(error){if(error instanceof ReauthRequiredError){const r=json({error:'Unauthorized'},401);clearSessionCookie(r);return r;}return json({error:'Relay unavailable'},503);}
}
