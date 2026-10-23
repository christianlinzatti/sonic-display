import {NextRequest,NextResponse} from "next/server";
import {getValidSession,refreshSession,ReauthRequiredError} from "@/lib/spotify";
import {clearSessionCookie,setSessionCookie,type SpotifySession} from "@/lib/session";
import {spotifyCallbackUrl} from "@/lib/spotify-origin";
import {normalizeLibraryContains,parseTrackIds,trackUriQuery} from "@/lib/music-discovery-v361";

export const dynamic="force-dynamic";
type Valid=NonNullable<Awaited<ReturnType<typeof getValidSession>>>;
const json=(body:object,status=200)=>NextResponse.json(body,{status,headers:{"Cache-Control":"no-store"}});
const unauth=()=>{const r=json({code:"reauth_required",message:"Bitte Spotify neu verbinden."},401);clearSessionCookie(r);return r;};
const finish=(r:NextResponse,valid:Valid)=>{if(valid.refreshed)setSessionCookie(r,valid.session);return r;};
const has=(valid:Valid,scope:string)=>(valid.session.scopes ?? "").split(/\s+/).includes(scope);
function failed(status:number,retry:string|null){
 const code=status===429?"rate_limited":status===403?"consent_required":status===400?"unsupported":"spotify_error";
 const response=json({code,message:status===429?"Spotify begrenzt die Anfragen.":status===403?"Bibliothekszugriff verweigert. Bitte Spotify neu verbinden.":status===400?"Spotify hat diese Änderung abgelehnt.":"Spotify-Bibliothek vorübergehend nicht erreichbar."},status===429?429:status===403?403:503);
 if(status===429&&retry&&/^\d{1,5}$/.test(retry))response.headers.set("Retry-After",retry);
 return response;
}
async function call(valid:Valid,path:string,method:"GET"|"PUT"|"DELETE"){
 const run=(s:SpotifySession)=>fetch(`https://api.spotify.com/v1${path}`,{method,headers:{Authorization:`Bearer ${s.accessToken}`,Accept:"application/json"},cache:"no-store",signal:AbortSignal.timeout(12000)});
 let response=await run(valid.session);
 if(response.status===401){valid={session:await refreshSession(valid.session),refreshed:true};response=await run(valid.session);}
 return {valid,response};
}
async function status(valid:Valid,ids:string[]){
 const q=trackUriQuery(ids);if(!q)return {valid,result:json({code:"invalid_ids"},400)};
 const check=await call(valid,`/me/library/contains?${q}`,"GET");valid=check.valid;
 if(check.response.status===401)return {valid,result:unauth()};
 if(!check.response.ok)return {valid,result:failed(check.response.status,check.response.headers.get("Retry-After"))};
 const statuses=normalizeLibraryContains(await check.response.json(),ids);
 return statuses?{valid,result:json({statuses}),statuses}:{valid,result:json({code:"bad_spotify_response",message:"Spotify hat keinen gültigen Bibliotheksstatus geliefert."},502)};
}
export async function GET(req:NextRequest){
 const ids=parseTrackIds(req.nextUrl.searchParams.get("ids"));if(!ids)return json({code:"invalid_ids"},400);
 let valid:Valid|null=null;
 try{valid=await getValidSession();if(!valid)return unauth();
  if(!has(valid,"user-library-read"))return finish(json({code:"consent_required",message:"Bitte Spotify neu verbinden und Bibliotheks-Leserechte erlauben."},403),valid);
  const checked=await status(valid,ids);return checked.result.status===401?checked.result:finish(checked.result,checked.valid);
 }catch(error){if(error instanceof ReauthRequiredError)return unauth();return valid?finish(json({code:"spotify_unavailable"},503),valid):json({code:"spotify_unavailable"},503);}
}
export async function POST(req:NextRequest){
 let valid:Valid|null=null;
 try{
  if(!req.headers.get("origin")||req.headers.get("origin")!==spotifyCallbackUrl().origin)return json({code:"invalid_origin"},403);
  let payload:unknown;try{payload=await req.json();}catch{return json({code:"invalid_json"},400);}
  const data=payload as {trackId?:unknown;save?:unknown}|null;
  const ids=parseTrackIds(typeof data?.trackId==="string"?data.trackId:null);
  if(!ids||ids.length!==1||typeof data?.save!=="boolean")return json({code:"invalid_track"},400);
  valid=await getValidSession();if(!valid)return unauth();
  if(!has(valid,"user-library-read")||!has(valid,"user-library-modify"))return finish(json({code:"consent_required",message:"Bitte Spotify neu verbinden und Bibliothek ändern erlauben."},403),valid);
  const q=trackUriQuery(ids);if(!q)return finish(json({code:"invalid_track"},400),valid);
  const result=await call(valid,`/me/library?${q}`,data.save?"PUT":"DELETE");valid=result.valid;
  if(result.response.status===401)return unauth();
  if(!result.response.ok)return finish(failed(result.response.status,result.response.headers.get("Retry-After")),valid);
  // Never optimistically confirm a library mutation just because Spotify returned 200.
  const verified=await status(valid,ids);valid=verified.valid;
  if(!verified.statuses)return verified.result.status===401?verified.result:finish(verified.result,valid);
  if(verified.statuses[ids[0]]!==data.save)return finish(json({code:"unconfirmed",message:"Spotify hat den neuen Bibliotheksstatus noch nicht bestätigt."},409),valid);
  return finish(json({trackId:ids[0],saved:data.save}),valid);
 }catch(error){if(error instanceof ReauthRequiredError)return unauth();return valid?finish(json({code:"spotify_unavailable",message:"Spotify momentan nicht erreichbar."},503),valid):json({code:"spotify_unavailable"},503);}
}
