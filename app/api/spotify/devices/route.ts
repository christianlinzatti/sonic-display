import {normalizeDevicesV851} from "@/lib/spotify-playlists-v851";
import {spotifyRouteV851,spotifyCallV851,playlistErrorV851,playlistFinishV851,playlistJsonV851,playlistUnauthV851} from "@/lib/spotify-playlists-server-v851";
export const dynamic="force-dynamic";
export async function GET(){
 return spotifyRouteV851(["user-read-playback-state"],async valid=>{
  const call=await spotifyCallV851(valid,"/me/player/devices");
  if(call.response.status===401)return playlistUnauthV851();
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response),call.valid);
  return playlistFinishV851(playlistJsonV851({devices:normalizeDevicesV851(await call.response.json())}),call.valid);
 });
}
