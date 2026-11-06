import {NextResponse} from 'next/server';
import {getValidSession,refreshSession,ReauthRequiredError} from '@/lib/spotify';
import {clearSessionCookie,setSessionCookie,type SpotifySession} from '@/lib/session';
import {spotifyCallbackUrl} from '@/lib/spotify-origin';
import {validArtistId,hasFollowScope,FOLLOW_READ_SCOPE,FOLLOW_WRITE_SCOPE,libraryUrisQuery,normalizeContainsResponse} from '@/lib/artist-follow-v359';
export const dynamic='force-dynamic';
export const maxDuration=60;
const json=(v:object,status=200)=>NextResponse.json(v,{status,headers:{'Cache-Control':'no-store'}});
export async function POST(request:Request){
 if(request.headers.get('origin')!==spotifyCallbackUrl().origin)return json({message:'Origin mismatch'},403);
 let valid:Awaited<ReturnType<typeof getValidSession>>=null;
 try{
  valid=await getValidSession();if(!valid)return json({message:'Bitte Spotify neu verbinden.'},401);
  if(!hasFollowScope(valid.session.scopes,FOLLOW_READ_SCOPE)||!hasFollowScope(valid.session.scopes,FOLLOW_WRITE_SCOPE))return json({message:'Bitte Spotify neu verbinden und Künstler-Abonnements freigeben.'},403);
  if(Number(request.headers.get('content-length')||0)>12000)return json({message:'Anfrage zu groß.'},413);
  const raw=await request.text();if(Buffer.byteLength(raw)>12000)return json({message:'Anfrage zu groß.'},413);
  let body;try{body=JSON.parse(raw);}catch{return json({message:'Ungültige Anfrage.'},400);}
  const changes=body?.changes;
  if(!Array.isArray(changes)||changes.length<1||changes.length>40||changes.some(c=>!validArtistId(c?.artistId)||typeof c.follow!=='boolean')||new Set(changes.map(c=>c.artistId)).size!==changes.length)return json({message:'Ungültige Künstlerliste.'},400);
  const ids:string[]=changes.map(c=>c.artistId),query=libraryUrisQuery(ids)!;
  const call=async(path:string,method:'GET'|'PUT'|'DELETE')=>{
   const send=(session:SpotifySession)=>fetch('https://api.spotify.com/v1'+path,{method,headers:{Authorization:`Bearer ${session.accessToken}`,Accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(12000)});
   let r=await send(valid!.session);if(r.status===401){valid={session:await refreshSession(valid!.session),refreshed:true};r=await send(valid.session);}if(r.status===401)throw new ReauthRequiredError('Spotify-Anmeldung erforderlich.');return r;
  };
  const finish=(value:object,status=200)=>{const r=json(value,status);if(valid?.refreshed)setSessionCookie(r,valid.session);return r;};
  const status=async()=>{const r=await call('/me/library/contains?'+query,'GET');if(!r.ok)throw Error('Spotify-Künstlerstatus momentan nicht verfügbar.');const data=normalizeContainsResponse(await r.json(),ids);if(!data)throw Error('Spotify hat ungültige Künstlerdaten geliefert.');return data;};
  if(body.trackId!==undefined){
   if(!validArtistId(body.trackId)||changes.some(c=>!c.follow))return finish({message:'Ungültiger aktueller Titel.'},400);
   const r=await call('/me/player/currently-playing?additional_types=track','GET');
   if(r.status!==200)return finish({message:'Kein aktueller Titel verfügbar.'},409);
   const current=await r.json();const artists=current?.item?.artists;
   if(current?.item?.id!==body.trackId||!Array.isArray(artists)||artists.some(a=>!validArtistId(a?.id)))return finish({message:'Der aktuelle Titel hat sich geändert.'},409);
   const unique=[...new Set(artists.map(a=>a.id))];
   if(unique.length!==ids.length||unique.some(id=>!ids.includes(id)))return finish({message:'Die gesamte aktuelle Künstlerliste muss bestätigt werden.'},409);
  }
  const before=await status();
  if(body.expected!==undefined&&(!body.expected||typeof body.expected!=='object'||ids.some(id=>body.expected[id]!==before[id])))return finish({message:'Der Künstlerstatus wurde inzwischen verändert. Keine Änderung ausgeführt.'},409);
  for(const follow of [true,false]){
   const group=changes.filter(c=>c.follow===follow&&before[c.artistId]!==follow).map(c=>c.artistId);
   if(group.length){const r=await call('/me/library?'+libraryUrisQuery(group),follow?'PUT':'DELETE');if(!r.ok)throw Error(r.status===429?'Spotify begrenzt die Anfragen. Bitte später erneut prüfen.':'Spotify hat die Sammeländerung nicht bestätigt. Bitte den aktuellen Status prüfen.');}
  }
  const confirmed=await status();const values=changes.map(c=>({artistId:c.artistId,before:before[c.artistId],following:confirmed[c.artistId]}));
  if(values.some((c,i)=>c.following!==changes[i].follow))return finish({message:'Spotify hat die Sammeländerung nur teilweise bestätigt. Bitte Künstlerstatus prüfen.',values},409);
  return finish({confirmed:true,values});
 }catch(error){
  if(error instanceof ReauthRequiredError){const r=json({message:'Bitte Spotify neu verbinden.'},401);clearSessionCookie(r);return r;}
  const r=json({message:error instanceof Error?error.message:'Spotify momentan nicht erreichbar.'},503);if(valid?.refreshed)setSessionCookie(r,valid.session);return r;
 }
}
