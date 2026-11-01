import {NextRequest} from "next/server";
import {spotifyCallbackUrl} from "@/lib/spotify-origin";
import {parseMiniPlayerActionV853,playbackPathV853} from "@/lib/spotify-mini-player-v853";
import {spotifyRouteV851,spotifyCallV851,playlistErrorV851,playlistFinishV851,playlistJsonV851,playlistUnauthV851} from "@/lib/spotify-playlists-server-v851";
export const dynamic="force-dynamic";
/** V853: only explicit, same-origin commands; Spotify audio stays on the active Connect device. */
export async function POST(req:NextRequest){
 if(req.headers.get("origin")!==spotifyCallbackUrl().origin)return playlistJsonV851({code:"invalid_origin",message:"Nicht autorisierte Anfrage."},403);
 let raw:unknown;try{raw=await req.json();}catch{return playlistJsonV851({code:"invalid_json",message:"Ungültige Anfrage."},400);}
 const action=parseMiniPlayerActionV853(raw);
 if(!action)return playlistJsonV851({code:"invalid_action",message:"Unbekannter Wiedergabebefehl."},400);
 return spotifyRouteV851(["user-modify-playback-state"],async valid=>{
  const {path,method}=playbackPathV853(action);
  const call=await spotifyCallV851(valid,path,method);
  if(call.response.status===401)return playlistUnauthV851();
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response),call.valid);
  return playlistFinishV851(playlistJsonV851({ok:true,action}),call.valid);
 });
}
