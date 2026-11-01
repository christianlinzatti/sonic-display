import {NextRequest, NextResponse} from 'next/server';
import {getValidSession, refreshSession, ReauthRequiredError} from '@/lib/spotify';
import {clearSessionCookie, setSessionCookie, type SpotifySession} from '@/lib/session';
import {normalizeRecentlyPlayedV672, recentBeforeV672} from '@/lib/recently-played-v672';

export const dynamic = 'force-dynamic';
type ValidSession = NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
const json = (value: object, status = 200) => NextResponse.json(value, {status, headers:{'Cache-Control':'private, no-store'}});
const unauth = () => {const res=json({code:'reauth_required',message:'Bitte Spotify erneut verbinden.'},401);clearSessionCookie(res);return res;};
const finish = (res:NextResponse, valid:ValidSession) => {if(valid.refreshed)setSessionCookie(res,valid.session);return res;};
const request = (session:SpotifySession, path:string) => fetch(`https://api.spotify.com/v1${path}`,{headers:{Authorization:`Bearer ${session.accessToken}`,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
/** Single user-initiated history page, no caching or persistence of private listening data. */
export async function GET(req:NextRequest){
 const before = recentBeforeV672(req.nextUrl.searchParams.get('before'));
 if(before===false)return json({code:'invalid_cursor',message:'Ungültiger Verlauf-Cursor.'},400);
 let valid:ValidSession|null=null;
 try{
  valid=await getValidSession();if(!valid)return unauth();
  if(!(valid.session.scopes??'').split(/\s+/).includes('user-read-recently-played')){
   return finish(json({code:'consent_required',message:'Für deinen Verlauf bitte Spotify erneut verbinden und „Zuletzt gespielt“ erlauben.'},403),valid);
  }
  const path=`/me/player/recently-played?limit=30${before?`&before=${before}`:''}`;
  let response=await request(valid.session,path);
  if(response.status===401){valid={session:await refreshSession(valid.session),refreshed:true};response=await request(valid.session,path);}
  if(response.status===401)return unauth();
  if(response.status===429){const res=json({code:'rate_limited',message:'Spotify begrenzt gerade die Anfragen. Bitte später erneut versuchen.'},429);const retry=response.headers.get('Retry-After');if(retry&&/^\d{1,5}$/.test(retry))res.headers.set('Retry-After',retry);return finish(res,valid);}
  if(response.status===403)return finish(json({code:'spotify_forbidden',message:'Spotify hat die Verlauf-Abfrage abgelehnt. Bitte Zugriffsberechtigungen prüfen.'},403),valid);
  if(!response.ok)return finish(json({code:'spotify_unavailable',message:'Dein Spotify-Verlauf ist gerade nicht erreichbar.'},503),valid);
  const page=normalizeRecentlyPlayedV672(await response.json());
  if(!page)return finish(json({code:'invalid_response',message:'Spotify hat einen ungültigen Verlauf geliefert.'},502),valid);
  return finish(json(page),valid);
 }catch(error){
  if(error instanceof ReauthRequiredError)return unauth();
  return valid?finish(json({code:'spotify_unavailable',message:'Spotify ist vorübergehend nicht erreichbar.'},503),valid):json({code:'spotify_unavailable',message:'Spotify ist vorübergehend nicht erreichbar.'},503);
 }
}
