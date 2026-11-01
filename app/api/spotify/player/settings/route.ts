import {NextRequest} from "next/server";
import {spotifyCallbackUrl} from "@/lib/spotify-origin";
import {normalizeConnectStateV854,parseConnectCommandV854,spotifyConnectRequestV854} from "@/lib/spotify-connect-v854";
import {spotifyRouteV851,spotifyCallV851,playlistErrorV851,playlistFinishV851,playlistJsonV851,playlistUnauthV851} from "@/lib/spotify-playlists-server-v851";
export const dynamic="force-dynamic";
/** Read only the Connect settings; MusicContext remains the single source of track data. */
export async function GET(){
 return spotifyRouteV851(["user-read-playback-state"],async valid=>{
  const call=await spotifyCallV851(valid,"/me/player");
  if(call.response.status===401)return playlistUnauthV851();
  if(call.response.status===204)return playlistFinishV851(playlistJsonV851({state:normalizeConnectStateV854(null)}),call.valid);
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response),call.valid);
  return playlistFinishV851(playlistJsonV851({state:normalizeConnectStateV854(await call.response.json())}),call.valid);
 });
}
/** Validate same-origin and a finite, explicit action allowlist before touching Spotify. */
export async function POST(req:NextRequest){
 if(req.headers.get("origin")!==spotifyCallbackUrl().origin)return playlistJsonV851({code:"invalid_origin",message:"Nicht autorisierte Anfrage."},403);
 let raw:unknown;try{raw=await req.json();}catch{return playlistJsonV851({code:"invalid_json",message:"Ungültige Anfrage."},400);}
 const command=parseConnectCommandV854(raw);
 if(!command)return playlistJsonV851({code:"invalid_action",message:"Unbekannter oder ungültiger Spotify-Connect-Befehl."},400);
 return spotifyRouteV851(["user-modify-playback-state"],async valid=>{
  const {path,method,body}=spotifyConnectRequestV854(command);
  const call=await spotifyCallV851(valid,path,method,body);
  if(call.response.status===401)return playlistUnauthV851();
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response),call.valid);
  return playlistFinishV851(playlistJsonV851({ok:true,action:command.action}),call.valid);
 });
}
