import {NextRequest} from "next/server";
import {spotifyCallbackUrl} from "@/lib/spotify-origin";
import {parsePlayRequestV851} from "@/lib/spotify-playlists-v851";
import {spotifyRouteV851,spotifyCallV851,playlistErrorV851,playlistFinishV851,playlistJsonV851,playlistUnauthV851} from "@/lib/spotify-playlists-server-v851";
export const dynamic="force-dynamic";
/** Only explicit user POSTs initiate Spotify Connect playback – never selection or polling. */
export async function POST(req:NextRequest){
 // Fail closed for cross-site writes; do not check canonical URL by trusting request Host.
 if(req.headers.get("origin")!==spotifyCallbackUrl().origin)return playlistJsonV851({code:"invalid_origin",message:"Nicht autorisierte Anfrage."},403);
 let payload:unknown;try{payload=await req.json();}catch{return playlistJsonV851({code:"invalid_json",message:"Ungültige Anfrage."},400);}
 const input=parsePlayRequestV851(payload);
 if(!input)return playlistJsonV851({code:"invalid_request",message:"Ungültige Playlist, Geräte-ID oder Titelposition."},400);
 return spotifyRouteV851(["user-modify-playback-state"],async valid=>{
  // Start directly on a Spotify Connect device. An extra transfer + play would be race-prone.
  const body={context_uri:`spotify:playlist:${input.playlistId}`,...(input.position!==undefined?{offset:{position:input.position}}:{})};
  const call=await spotifyCallV851(valid,`/me/player/play?device_id=${encodeURIComponent(input.deviceId)}`,"PUT",body);
  if(call.response.status===401)return playlistUnauthV851();
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response),call.valid);
  return playlistFinishV851(playlistJsonV851({started:true,playlistId:input.playlistId,deviceId:input.deviceId}),call.valid);
 });
}
