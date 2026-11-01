/** V851 Spotify Playlist & Speaker Control – pure, testable, browser-safe helpers. */
export const PLAYLIST_PAGE_SIZE_V851 = 30;
export const TRACK_PAGE_SIZE_V851 = 40;
export const PLAYLIST_FAVORITES_KEY_V851 = "sonic.spotify.playlist-favorites.v851";

export type SpotifyPlaylistV851 = { id:string; name:string; owner:string; imageUrl:string|null; total:number|null; spotifyUrl:string };
export type SpotifyPlaylistTrackV851 = { position:number; id:string; title:string; artist:string; durationMs:number; imageUrl:string|null; spotifyUrl:string; playable:boolean };
export type SpotifyDeviceV851 = { id:string; name:string; type:string; active:boolean; restricted:boolean; volume:number|null };
export type SpotifyListPageV851<T> = { items:T[]; offset:number; total:number; hasMore:boolean };

export const validSpotifyIdV851 = (id:unknown): id is string => typeof id === "string" && /^[A-Za-z0-9]{10,64}$/.test(id);
export const validSpotifyDeviceIdV851 = (id:unknown): id is string => typeof id === "string" && /^[a-zA-Z0-9_-]{1,128}$/.test(id);
export const hasSpotifyScopesV851 = (granted:string|undefined, required:readonly string[]) => {
 const values=new Set((granted??"").split(/\s+/));return required.every(scope=>values.has(scope));
};
export function pageParamsV851(search:URLSearchParams,size:number):{offset:number;limit:number}|null {
 const offset=search.get("offset")??"0";
 if(!/^(0|[1-9]\d{0,5})$/.test(offset))return null;
 const num=Number(offset);
 return num<=100000?{offset:num,limit:size}:null;
}
const object = (value:unknown):Record<string,unknown> => value!==null && typeof value==="object" && !Array.isArray(value)?value as Record<string,unknown>:{};
const text=(value:unknown)=>typeof value==="string"?value:"";
const number=(value:unknown)=>typeof value==="number"&&Number.isFinite(value)&&value>=0?value:null;
const spotifyLink=(kind:"playlist"|"track",id:string)=>`https://open.spotify.com/${kind}/${id}`;
const imageUrl=(raw:unknown)=>{
 const images=raw instanceof Array?raw:[];
 const url=text(object(images[0]).url);
 return /^https:\/\//.test(url)?url:null;
};
export function normalizePlaylistPageV851(raw:unknown,offset:number):SpotifyListPageV851<SpotifyPlaylistV851>{
 const data=object(raw);const items=Array.isArray(data.items)?data.items:[];
 const result=items.map(value=>{
  const p=object(value),id=text(p.id);if(!validSpotifyIdV851(id))return null;
  const owner=object(p.owner),count=object(p.items).total??object(p.tracks).total;
  return {id,name:text(p.name)||"Unbenannte Playlist",owner:text(owner.display_name)||text(owner.id)||"Spotify",imageUrl:imageUrl(p.images),total:number(count),spotifyUrl:spotifyLink("playlist",id)};
 }).filter((v):v is SpotifyPlaylistV851=>v!==null);
 const total=number(data.total)??offset+items.length;
 return {items:result,offset,total,hasMore:Boolean(data.next)||offset+items.length<total};
}
export function normalizePlaylistTracksV851(raw:unknown,offset:number):SpotifyListPageV851<SpotifyPlaylistTrackV851>{
 const data=object(raw),items=Array.isArray(data.items)?data.items:[];
 const normalized=items.map((value,index)=>{
  const wrapper=object(value),track=object(wrapper.item??wrapper.track),id=text(track.id);
  if(!validSpotifyIdV851(id)||text(track.type)!=="track")return null;
  const artists=Array.isArray(track.artists)?track.artists:[];
  const available=track.is_playable!==false && track.is_local!==true && !text(track.restrictions && object(track.restrictions).reason);
  return {position:offset+index,id,title:text(track.name)||"Unbekannter Titel",artist:artists.map(a=>text(object(a).name)).filter(Boolean).join(", ")||"Unbekannt",durationMs:number(track.duration_ms)??0,imageUrl:imageUrl(object(track.album).images),spotifyUrl:spotifyLink("track",id),playable:available};
 }).filter((v):v is SpotifyPlaylistTrackV851=>v!==null);
 const total=number(data.total)??offset+items.length;
 return {items:normalized,offset,total,hasMore:Boolean(data.next)||offset+items.length<total};
}
export function normalizeDevicesV851(raw:unknown):SpotifyDeviceV851[]{
 const devices=object(raw).devices;
 if(!Array.isArray(devices))return [];
 return devices.map(value=>{
  const d=object(value),id=text(d.id);
  if(!validSpotifyDeviceIdV851(id))return null;
  return {id,name:text(d.name)||"Unbekanntes Gerät",type:text(d.type)||"device",active:d.is_active===true,restricted:d.is_restricted===true,volume:number(d.volume_percent)};
 }).filter((v):v is SpotifyDeviceV851=>v!==null);
}
export function sanitizeFavoritePlaylistsV851(input:unknown):string[]{
 if(!Array.isArray(input))return [];
 return [...new Set(input.filter(validSpotifyIdV851))].slice(0,100);
}
export type PlayPlaylistRequestV851={playlistId:string;deviceId:string;position?:number};
export function parsePlayRequestV851(raw:unknown):PlayPlaylistRequestV851|null{
 const data=object(raw),playlistId=data.playlistId,deviceId=data.deviceId,position=data.position;
 if(!validSpotifyIdV851(playlistId)||!validSpotifyDeviceIdV851(deviceId))return null;
 if(position!==undefined&&(!Number.isSafeInteger(position)||typeof position!=="number"||position<0||position>100000))return null;
 return position===undefined?{playlistId,deviceId}:{playlistId,deviceId,position:position as number};
}
