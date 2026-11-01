import type {V701Archive} from './persistent-listening-history-v701';
import type {MusicTrackV361} from './music-discovery-v361';

/** V705: transparent, read-only suggestions from a bounded Spotify *catalog search*, not Spotify Recommendations. */
export type V705Genre='deutschrap'|'hardstyle'|'hardtekk';
export type V705Mode='genre'|'new-artists'|'favorites'|'mix';
export type V705Request={source:'genre'|'favorite';genre:V705Genre|null;artist:string|null;offset:number;url:string};
export type V705Plan={requests:V705Request[];archivedEvents:number;knownTrackCount:number;knownArtistCount:number;seeds:string[];knownTracks:Set<string>;knownArtists:Set<string>};
export type V705Suggestion={id:string;title:string;artists:string[];album:string;coverUrl:string|null;releaseDate:string|null;spotifyUrl:string;source:'genre'|'favorite';reason:string};
export const V705_GENRES:ReadonlyArray<{id:V705Genre;label:string}>=[{id:'deutschrap',label:'Deutschrap'},{id:'hardstyle',label:'Hardstyle'},{id:'hardtekk',label:'Hardtekk'}];
export const V705_MODES:ReadonlyArray<{id:V705Mode;label:string;detail:string}>=[
 {id:'mix',label:'Gemischt',detail:'Genre-Suche plus weitere Titel deiner häufig erfassten Künstler'},
 {id:'genre',label:'Genre entdecken',detail:'Spotify-Katalogsuche für das gewählte Genre'},
 {id:'new-artists',label:'Andere Künstler',detail:'Künstler-Credits ausschließen, die bereits in deinem Archiv stehen'},
 {id:'favorites',label:'Bekannte Künstler',detail:'Weitere Titel deiner am häufigsten erfassten Künstler'}
];
const ID=/^[A-Za-z0-9]{22}$/;
const control=/[\u0000-\u001f\u007f]/;
const normalize=(name:string)=>name.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de');
const safeArtist=(value:unknown):string|null=>{
 if(typeof value!=='string'||value.length>120||control.test(value))return null;
 const clean=value.replace(/["\\:\n\r]/g,' ').replace(/\s+/g,' ').trim();
 return clean.length>=2&&clean.length<=55?clean:null;
};
const validEvent=(e:unknown):e is {id:string;artist:string;primaryArtist?:string;playedAt:string}=>{
 if(!e||typeof e!=='object')return false;
 const x=e as Record<string,unknown>;
 return typeof x.id==='string'&&ID.test(x.id)&&typeof x.artist==='string'&&x.artist.length<=400&&!control.test(x.artist)&&typeof x.playedAt==='string'&&Number.isFinite(Date.parse(x.playedAt));
};
const genreReq=(genre:V705Genre,offset:number):V705Request=>({source:'genre',genre,artist:null,offset,url:`/api/spotify/music-discovery?${new URLSearchParams({mode:'genre',genre,offset:String(offset)})}`});
const artistReq=(name:string):V705Request=>({source:'favorite',genre:null,artist:name,offset:0,url:`/api/spotify/music-discovery?${new URLSearchParams({mode:'search',q:`artist:"${name}"`,offset:'0'})}`});
/** No events or user IDs are sent in requests; only the explicit genre or (opt-in) favorite artist name. */
export function planDiscoveryV705(archive:Pick<V701Archive,'events'>|null,genre:V705Genre,mode:V705Mode):V705Plan{
 const chosenGenre=V705_GENRES.some(g=>g.id===genre)?genre:'deutschrap';
 const chosenMode=V705_MODES.some(m=>m.id===mode)?mode:'genre';
 const events=Array.isArray(archive?.events)?archive.events.slice(0,5000):[];
 const knownTracks=new Set<string>(),knownArtists=new Set<string>();
 const counts=new Map<string,{name:string;count:number;last:number}>();
 const seenEvents=new Set<string>();
 for(const e of events){
  if(!validEvent(e))continue;
  const eventKey=`${e.id}:${e.playedAt}`;if(seenEvents.has(eventKey))continue;seenEvents.add(eventKey);
  knownTracks.add(e.id);
  // Artist credits from the API are a string, not a reliable list of all featuring artists.
  if(e.artist.trim())knownArtists.add(normalize(e.artist));
  const name=safeArtist(e.primaryArtist)||safeArtist(e.artist);
  if(name){const key=normalize(name),record=counts.get(key),stamp=Date.parse(e.playedAt);
   knownArtists.add(key);
   if(record){record.count++;record.last=Math.max(record.last,stamp);}else counts.set(key,{name,count:1,last:stamp});
  }
 }
 const seeds=[...counts.values()].sort((a,b)=>b.count-a.count||b.last-a.last||a.name.localeCompare(b.name)).slice(0,2).map(a=>a.name);
 const requests:V705Request[]=[];
 if(chosenMode!=='favorites'){
  requests.push(genreReq(chosenGenre,0),genreReq(chosenGenre,10));
  if(chosenMode==='new-artists'||chosenMode==='genre')requests.push(genreReq(chosenGenre,20));
 }
 if(chosenMode==='favorites'||chosenMode==='mix')for(const artist of seeds.slice(0,chosenMode==='mix'?1:2))requests.push(artistReq(artist));
 return {requests:requests.slice(0,3),archivedEvents:events.length,knownTrackCount:knownTracks.size,knownArtistCount:knownArtists.size,seeds,knownTracks,knownArtists};
}
function candidate(value:unknown):value is MusicTrackV361{
 if(!value||typeof value!=='object')return false;
 const t=value as Record<string,unknown>;
 return typeof t.id==='string'&&ID.test(t.id)&&typeof t.title==='string'&&t.title.trim().length>0&&t.title.length<=160&&!control.test(t.title)&&
 Array.isArray(t.artists)&&t.artists.length>0&&t.artists.length<=8&&t.artists.every(a=>typeof a==='string'&&a.trim().length>0&&a.length<=90&&!control.test(a))&&
 typeof t.album==='string'&&t.album.length<=140&&!control.test(t.album);
}
function safeCover(raw:unknown):string|null{
 if(typeof raw!=='string'||raw.length>2048)return null;
 try{const u=new URL(raw);return u.protocol==='https:'&&(['i.scdn.co','mosaic.scdn.co','image-cdn-ak.spotifycdn.com'].includes(u.hostname))?raw:null;}catch{return null;}
}
/** Search results are normalized defensively again; exclude by ID rather than claiming that songs are unheard. */
export function suggestionsV705(plan:V705Plan,mode:V705Mode,responses:ReadonlyArray<{request:V705Request;tracks:unknown}>):V705Suggestion[]{
 const result:V705Suggestion[]=[],selected=new Set<string>(),artistCounts=new Map<string,number>();
 for(const response of responses.slice(0,3)){
  if(!plan.requests.some(q=>q.url===response.request.url))continue;
  const list=Array.isArray(response.tracks)?response.tracks.slice(0,10):[];
  for(const unknownTrack of list){
   if(!candidate(unknownTrack))continue;
   const track=unknownTrack as MusicTrackV361;
   if(selected.has(track.id)||plan.knownTracks.has(track.id))continue;
   if(response.request.source==='favorite'&&!track.artists.some(a=>normalize(a)===normalize(response.request.artist??'')))continue;
   if(mode==='new-artists'&&track.artists.some(a=>plan.knownArtists.has(normalize(a))))continue;
   const primary=normalize(track.artists[0]);
   if((artistCounts.get(primary)??0)>=4)continue;
   selected.add(track.id);artistCounts.set(primary,(artistCounts.get(primary)??0)+1);
   result.push({id:track.id,title:track.title,artists:track.artists,album:track.album,
    coverUrl:safeCover(track.coverUrl),releaseDate:typeof track.releaseDate==='string'&&/^\d{4}(-\d\d){0,2}$/.test(track.releaseDate)?track.releaseDate:null,
    spotifyUrl:`https://open.spotify.com/track/${track.id}`,source:response.request.source,
    reason:response.request.source==='favorite'?`Weiterer Katalogtreffer von ${response.request.artist}; nicht im Archiv erfasst`:`Spotify-Katalogsuche ${response.request.genre??''}; nicht im Archiv erfasst`});
   if(result.length>=18)return result;
  }
 }
 return result;
}
