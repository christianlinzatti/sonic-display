import {NextResponse} from "next/server";
import {getSession,getValidSession,refreshSession,ReauthRequiredError} from "@/lib/spotify";
import {clearSessionCookie,setSessionCookie} from "@/lib/session";
interface Playing {progress_ms:number|null;is_playing:boolean;item:null|{type:string;id:string;name:string;duration_ms:number;external_urls?:{spotify?:string};artists:{name:string}[];album:{name:string;images:{url:string}[]}};}
export async function GET(){
 let valid:Awaited<ReturnType<typeof getValidSession>>=null;
 try {
  valid=await getValidSession();
  if(!valid)return NextResponse.json({connected:false,reauthRequired:true},{status:401});
  let r=await fetch("https://api.spotify.com/v1/me/player/currently-playing?additional_types=track",{headers:{Authorization:`Bearer ${valid.session.accessToken}`},cache:"no-store",signal:AbortSignal.timeout(12000)});
  if(r.status===401){
   try { valid={session:await refreshSession(valid.session),refreshed:true}; }
   catch(e){if(e instanceof ReauthRequiredError){const res=NextResponse.json({connected:false,reauthRequired:true},{status:401});clearSessionCookie(res);return res;}throw e;}
   r=await fetch("https://api.spotify.com/v1/me/player/currently-playing?additional_types=track",{headers:{Authorization:`Bearer ${valid.session.accessToken}`},cache:"no-store",signal:AbortSignal.timeout(12000)});
   if(r.status===401){const res=NextResponse.json({connected:false,reauthRequired:true},{status:401});clearSessionCookie(res);return res;}
  }
  if(r.status===429){const res=NextResponse.json({error:"Spotify rate limit"},{status:429});const retry=r.headers.get("retry-after");if(retry)res.headers.set("Retry-After",retry);if(valid.refreshed)setSessionCookie(res,valid.session);return res;}
  if(r.status===204){const res=NextResponse.json({connected:true,track:null,progressMs:0,isPlaying:false,fetchedAt:Date.now()});if(valid.refreshed)setSessionCookie(res,valid.session);return res;}
  if(!r.ok){const res=NextResponse.json({error:`Spotify API temporarily unavailable (${r.status})`},{status:r.status>=500?503:r.status});if(valid.refreshed)setSessionCookie(res,valid.session);return res;}
  const d=await r.json() as Playing;const item=d.item;const track=item?.type==="track"?{id:item.id,title:item.name,artist:item.artists.map(a=>a.name).join(", "),artists:item.artists.map(a=>a.name),album:item.album.name,albumCoverUrl:item.album.images[0]?.url??null,spotifyUrl:item.external_urls?.spotify??`https://open.spotify.com/track/${item.id}`,durationMs:item.duration_ms}:null;
  const res=NextResponse.json({connected:true,track,progressMs:d.progress_ms??0,isPlaying:d.is_playing,fetchedAt:Date.now()});if(valid.refreshed)setSessionCookie(res,valid.session);return res;
 }catch(e){if(e instanceof ReauthRequiredError){const res=NextResponse.json({connected:false,reauthRequired:true},{status:401});clearSessionCookie(res);return res;}return NextResponse.json({error:e instanceof Error?e.message:"Spotify temporarily unavailable"},{status:503});}
}
