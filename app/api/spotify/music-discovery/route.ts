import { NextRequest, NextResponse } from "next/server";
import { getValidSession, refreshSession, ReauthRequiredError } from "@/lib/spotify";
import { clearSessionCookie, setSessionCookie, type SpotifySession } from "@/lib/session";
import { musicDiscoveryPath, normalizeMusicTracks, normalizeMusicReleases, type MusicDiscoveryMode } from "@/lib/music-discovery-v361";

export const dynamic = "force-dynamic";
type Valid = NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
const json=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"private, no-store"}});
const unauth=()=>{const result=json({code:"reauth_required",message:"Bitte Spotify erneut verbinden."},401);clearSessionCookie(result);return result;};
const finish=(result:NextResponse,valid:Valid)=>{if(valid.refreshed)setSessionCookie(result,valid.session);return result;};
function fail(status:number,retry:string|null){
 const code=status===429?"rate_limited":status===403?"forbidden":"spotify_unavailable";
 const result=json({code,message:status===429?"Spotify begrenzt die Anfragen. Versuche es später erneut.":status===403?"Spotify erlaubt diese Abfrage nicht.":"Spotify konnte die Songs gerade nicht laden."},status===429?429:status===403?403:503);
 if(status===429&&retry&&/^\d{1,5}$/.test(retry))result.headers.set("Retry-After",retry);
 return result;
}
async function callSpotify(valid:Valid,path:string){
 const request=(session:SpotifySession)=>fetch(`https://api.spotify.com/v1${path}`,{headers:{Authorization:`Bearer ${session.accessToken}`,Accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(12000)});
 let response=await request(valid.session);
 if(response.status===401){valid={session:await refreshSession(valid.session),refreshed:true};response=await request(valid.session);}
 return {valid,response};
}
export async function GET(req:NextRequest){
 const q=req.nextUrl.searchParams;
 const mode=(q.get("mode")??"genre") as MusicDiscoveryMode;
 const path=musicDiscoveryPath(mode,{query:q.get("q"),genre:q.get("genre")??"",offset:Number(q.get("offset")??"0"),albumId:q.get("albumId")??"",withGenre:q.get("withGenre")==="true"});
 if(!path)return json({code:"invalid_query",message:"Ungültige Song- oder Albumabfrage."},400);
 let valid:Valid|null=null;
 try{
  valid=await getValidSession();if(!valid)return unauth();
  if(mode==="saved"&&!(valid.session.scopes ?? "").split(/\s+/).includes("user-library-read"))return finish(json({code:"consent_required",message:"Bitte Spotify neu verbinden und Bibliothek lesen erlauben."},403),valid);
  const response=await callSpotify(valid,path);valid=response.valid;
  if(response.response.status===401)return unauth();
  if(!response.response.ok)return finish(fail(response.response.status,response.response.headers.get("Retry-After")),valid);
  const raw=await response.response.json() as {tracks?:{items?:unknown[];next?:string|null};albums?:{items?:unknown[];next?:string|null};items?:unknown[];next?:string|null};
  if(mode==="new")return finish(json({releases:normalizeMusicReleases(raw.albums?.items),hasMore:Boolean(raw.albums?.next),label:"Neue Alben/Singles: Spotify tag:new, ungefähr letzte zwei Wochen; keine vollständige Release-Liste."}),valid);
  const page=mode==="saved"||mode==="album"?raw:raw.tracks;
  return finish(json({tracks:normalizeMusicTracks(page?.items),hasMore:Boolean(page?.next),label:mode==="saved"?"Gespeicherte Titel":mode==="album"?"Album-Titelliste":"Spotify-Katalogsuche; keine personalisierte Rangliste."}),valid);
 }catch(error){
  if(error instanceof ReauthRequiredError)return unauth();
  const result=json({code:"spotify_unavailable",message:"Spotify ist vorübergehend nicht erreichbar."},503);
  return valid?finish(result,valid):result;
 }
}
