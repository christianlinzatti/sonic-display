import {NextRequest} from "next/server";
import {PLAYLIST_PAGE_SIZE_V851,normalizePlaylistPageV851,pageParamsV851} from "@/lib/spotify-playlists-v851";
import {spotifyRouteV851,spotifyCallV851,playlistErrorV851,playlistFinishV851,playlistJsonV851,playlistUnauthV851} from "@/lib/spotify-playlists-server-v851";
export const dynamic="force-dynamic";
export async function GET(req:NextRequest){
 const paging=pageParamsV851(req.nextUrl.searchParams,PLAYLIST_PAGE_SIZE_V851);
 if(!paging)return playlistJsonV851({code:"invalid_offset",message:"Ungültige Seitenposition."},400);
 return spotifyRouteV851(["playlist-read-private","playlist-read-collaborative"],async valid=>{
  const call=await spotifyCallV851(valid,`/me/playlists?limit=${paging.limit}&offset=${paging.offset}`);
  if(call.response.status===401)return playlistUnauthV851();
  if(!call.response.ok)return playlistFinishV851(playlistErrorV851(call.response),call.valid);
  return playlistFinishV851(playlistJsonV851(normalizePlaylistPageV851(await call.response.json(),paging.offset)),call.valid);
 });
}
