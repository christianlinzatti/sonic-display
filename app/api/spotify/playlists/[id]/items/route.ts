import {NextRequest} from "next/server";
import {TRACK_PAGE_SIZE_V851,validSpotifyIdV851,pageParamsV851,normalizePlaylistTracksV851} from "@/lib/spotify-playlists-v851";
import {spotifyRouteV851,spotifyCallV851,playlistErrorV851,playlistFinishV851,playlistJsonV851,playlistUnauthV851} from "@/lib/spotify-playlists-server-v851";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest,{params}:{params:Promise<{id:string}>}){
 const {id}=await params;
 const paging=pageParamsV851(req.nextUrl.searchParams,TRACK_PAGE_SIZE_V851);
 if(!validSpotifyIdV851(id)||!paging)return playlistJsonV851({code:"invalid_request",message:"Ungültige Playlist oder Seitenposition."},400);
 return spotifyRouteV851(["playlist-read-private","playlist-read-collaborative"],async valid=>{
  // February 2026 Spotify API: /items replaces the removed /tracks route.
  const call=await spotifyCallV851(valid,`/playlists/${id}/items?limit=${paging.limit}&offset=${paging.offset}`);
  if(call.response.status===401)return playlistUnauthV851();
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response,true),call.valid);
  return playlistFinishV851(playlistJsonV851(normalizePlaylistTracksV851(await call.response.json(),paging.offset)),call.valid);
 });
}
