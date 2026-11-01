import {NextResponse} from 'next/server';
import {getValidSession,refreshSession,ReauthRequiredError} from '@/lib/spotify';
import {clearSessionCookie,setSessionCookie} from '@/lib/session';
import {validArchiveOwnerV701} from '@/lib/persistent-listening-history-v701';
export const dynamic='force-dynamic';
const json=(value:object,status=200)=>NextResponse.json(value,{status,headers:{'Cache-Control':'private, no-store'}});
const unauth=()=>{const r=json({code:'reauth_required'},401);clearSessionCookie(r);return r;};
/** Returns only Spotify's account ID. No name, tokens, email or history in the response. */
export async function GET(){
 let valid=await getValidSession();if(!valid)return unauth();
 try{
  const call=(token:string)=>fetch('https://api.spotify.com/v1/me',{headers:{Authorization:`Bearer ${token}`,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(10000)});
  let result=await call(valid.session.accessToken);
  if(result.status===401){valid={session:await refreshSession(valid.session),refreshed:true};result=await call(valid.session.accessToken);}
  if(result.status===401)return unauth();
  if(!result.ok)return json({code:'identity_unavailable'},503);
  const data=await result.json() as {id?:unknown};
  if(!validArchiveOwnerV701(data.id))return json({code:'identity_invalid'},502);
  const response=json({spotifyUserId:data.id});if(valid.refreshed)setSessionCookie(response,valid.session);return response;
 }catch(error){if(error instanceof ReauthRequiredError)return unauth();return json({code:'identity_unavailable'},503);}
}
