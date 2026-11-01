import {NextResponse} from "next/server";
import {getValidSession,refreshSession,ReauthRequiredError} from "@/lib/spotify";
import {clearSessionCookie,setSessionCookie,type SpotifySession} from "@/lib/session";
import {hasSpotifyScopesV851} from "@/lib/spotify-playlists-v851";

export type ValidSpotifyV851=NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
export const playlistJsonV851=(data:object,status=200)=>NextResponse.json(data,{status,headers:{"Cache-Control":"private, no-store"}});
export function playlistUnauthV851(){const res=playlistJsonV851({code:"reauth_required",message:"Bitte Spotify erneut verbinden."},401);clearSessionCookie(res);return res;}
export function playlistFinishV851(res:NextResponse,valid:ValidSpotifyV851){if(valid.refreshed)setSessionCookie(res,valid.session);return res;}
export function playlistScopeV851(valid:ValidSpotifyV851,scopes:string[]){
 if(hasSpotifyScopesV851(valid.session.scopes,scopes))return null;
 return playlistFinishV851(playlistJsonV851({code:"consent_required",message:"Für Playlists und Wiedergabesteuerung bitte Spotify neu verbinden und die neuen Berechtigungen erlauben."},403),valid);
}
export function playlistErrorV851(response:Response,forItems=false){
 const code=response.status===429?"rate_limited":response.status===403?"spotify_forbidden":response.status===404?"not_found":"spotify_unavailable";
 const message=response.status===429?"Spotify begrenzt aktuell Anfragen. Bitte später erneut versuchen.":response.status===403?(forItems?"Spotify erlaubt den Titelabruf derzeit nur für eigene oder gemeinsam bearbeitete Playlists. Die Playlist lässt sich trotzdem direkt abspielen.":"Spotify hat diese Aktion abgelehnt. Prüfe Premium und die Berechtigungen."):response.status===404?"Playlist oder Lautsprecher nicht gefunden. Bitte Geräte aktualisieren und Spotify auf dem Lautsprecher öffnen.":"Spotify ist derzeit nicht erreichbar.";
 const res=playlistJsonV851({code,message},response.status===429?429:response.status===403?403:response.status===404?404:503);
 const retry=response.headers.get("Retry-After");if(response.status===429&&retry&&/^\d{1,5}$/.test(retry))res.headers.set("Retry-After",retry);
 return res;
}
export async function spotifyCallV851(valid:ValidSpotifyV851,path:string,method:"GET"|"PUT"|"POST"="GET",body?:object):Promise<{valid:ValidSpotifyV851;response:Response}>{
 const request=(session:SpotifySession)=>fetch(`https://api.spotify.com/v1${path}`,{method,headers:{Authorization:`Bearer ${session.accessToken}`,Accept:"application/json",...(body?{"Content-Type":"application/json"}:{})},...(body?{body:JSON.stringify(body)}:{}),cache:"no-store",signal:AbortSignal.timeout(12000)});
 let response=await request(valid.session);
 if(response.status===401){valid={session:await refreshSession(valid.session),refreshed:true};response=await request(valid.session);}
 return {valid,response};
}
export async function spotifyRouteV851(scopes:string[],handle:(valid:ValidSpotifyV851)=>Promise<NextResponse>):Promise<NextResponse>{
 let valid:ValidSpotifyV851|null=null;
 try{
  valid=await getValidSession();if(!valid)return playlistUnauthV851();
  const scopeError=playlistScopeV851(valid,scopes);if(scopeError)return scopeError;
  return await handle(valid);
 }catch(e){if(e instanceof ReauthRequiredError)return playlistUnauthV851();
  return valid?playlistFinishV851(playlistJsonV851({code:"spotify_unavailable",message:"Spotify ist vorübergehend nicht erreichbar."},503),valid):playlistJsonV851({code:"spotify_unavailable",message:"Spotify ist vorübergehend nicht erreichbar."},503);
 }
}
