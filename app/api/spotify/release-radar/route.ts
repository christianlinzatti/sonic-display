import { NextRequest, NextResponse } from "next/server";
import { getValidSession, refreshSession, ReauthRequiredError } from "@/lib/spotify";
import { clearSessionCookie, setSessionCookie, type SpotifySession } from "@/lib/session";
import {radarDays, radarFollowedPath, radarArtistAlbumsPath, normalizeRadarFollowed, normalizeRadarReleases, mergeRadarReleases, type RadarReleaseV362} from "@/lib/release-radar-v362";

export const dynamic = "force-dynamic";
type Valid = NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
const json=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const unauth=()=>{const r=json({code:"reauth_required",message:"Bitte Spotify neu verbinden."},401);clearSessionCookie(r);return r;};
const finish=(r:NextResponse,s:Valid)=>{if(s.refreshed)setSessionCookie(r,s.session);return r;};
function fail(status:number,retry:string|null){
 const result=json({code:status===429?"rate_limited":status===403?"consent_required":"spotify_unavailable",message:status===429?"Spotify begrenzt die Anfragen. Bitte später erneut versuchen.":status===403?"Spotify hat den Zugriff verweigert. Bitte Berechtigungen prüfen.":"Spotify ist derzeit nicht erreichbar."},status===429?429:status===403?403:503);
 if(status===429&&retry&&/^\d{1,5}$/.test(retry))result.headers.set("Retry-After",retry);
 return result;
}
async function callSpotify(s:Valid,path:string):Promise<{valid:Valid;response:Response}>{
 const run=(session:SpotifySession)=>fetch(`https://api.spotify.com/v1${path}`,{headers:{Authorization:`Bearer ${session.accessToken}`,Accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(12000)});
 let response=await run(s.session);
 if(response.status===401){s={session:await refreshSession(s.session),refreshed:true};response=await run(s.session);}
 return {valid:s,response};
}
/** On demand only. No background polling, external storage, or access-token exposure. */
export async function GET(req:NextRequest){
 const qs=req.nextUrl.searchParams;
 const days=radarDays(qs.get("days")??"90");
 const after=qs.get("after");
 const path=radarFollowedPath(after);
 if(!days||!path)return json({code:"invalid_query",message:"Ungültiger Zeitraum oder Cursor."},400);
 let valid:Valid|null=null;
 try{
  valid=await getValidSession();if(!valid)return unauth();
  if(!(valid.session.scopes ?? "").split(/\s+/).includes("user-follow-read"))return finish(json({code:"consent_required",message:"Spotify erneut verbinden und user-follow-read erlauben."},403),valid);
  const followed=await callSpotify(valid,path);valid=followed.valid;
  if(followed.response.status===401)return unauth();
  if(!followed.response.ok)return finish(fail(followed.response.status,followed.response.headers.get("Retry-After")),valid);
  const page=normalizeRadarFollowed(await followed.response.json());
  if(!page)return finish(json({code:"bad_spotify_response",message:"Spotify hat keine gültige Künstlerliste geliefert."},502),valid);
  const releases:RadarReleaseV362[]=[];const failures:string[]=[];let imprecise=0;
  const now=Date.now();
  // A maximum of four requests per user-triggered page; no unbounded crawl.
  for(const artist of page.artists){
   const albumPath=radarArtistAlbumsPath(artist.id);if(!albumPath)continue;
   try{
    const found=await callSpotify(valid,albumPath);valid=found.valid;
    if(found.response.status===401)return unauth();
    if(!found.response.ok){
     failures.push(artist.id);
     if(found.response.status===429)return finish(json({code:"partial_rate_limited",message:"Spotify begrenzt weitere Albumabfragen.",artists:page.artists,releases:mergeRadarReleases(releases),failedArtists:failures,skippedImprecise:imprecise,nextCursor:null,hasMore:false,partial:true}),valid);
     continue;
    }
    const data=await found.response.json() as {items?:unknown[]};
    if(!Array.isArray(data?.items)){failures.push(artist.id);continue;}
    imprecise+=data.items.filter(item=>{const album=item as {release_date_precision?:unknown};return album?.release_date_precision!=="day";}).length;
    releases.push(...normalizeRadarReleases(data.items,artist,days,now));
   }catch{failures.push(artist.id);}
  }
  return finish(json({artists:page.artists,releases:mergeRadarReleases(releases),nextCursor:page.cursor,hasMore:page.hasMore,failedArtists:failures,skippedImprecise:imprecise,partial:failures.length>0,label:`Gefolgte Künstler: die neuesten bis zu 10 Album-/Single-Einträge pro Künstler geprüft; ${days} Tage; keine vollständige Release-Datenbank.`}),valid);
 }catch(error){
  if(error instanceof ReauthRequiredError)return unauth();
  return valid?finish(json({code:"spotify_unavailable",message:"Spotify ist vorübergehend nicht erreichbar."},503),valid):json({code:"spotify_unavailable",message:"Spotify ist vorübergehend nicht erreichbar."},503);
 }
}
