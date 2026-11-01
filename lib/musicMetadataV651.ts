/** Optional read-only metadata providers. All keys remain server-side; no build-time configuration is required. */
import {
 type MusicMetadataV651,type ProviderStatusV651,recordV651,stringV651,plainV651,numberV651,uniqueV651,exactV651,
 normalizeMusicBrainzArtistV651,normalizeMusicBrainzRecordingV651,normalizeMusicBrainzReleaseGroupV651,normalizeAudioDbArtistV651,normalizeLastfmArtistV651,normalizeLastfmTrackV651,normalizeFlickrPhotosV651,
} from '@/services/musicMetadata/normalizeV651';
import {resolveArtistIdentityV652,mergeGenresV652,rankStagePhotosV652} from '@/services/musicMetadata/curationV652';

const TTL=6*60*60*1000;
const cache=new Map<string,{expires:number;promise:Promise<MusicMetadataV651>}>();
// Rate-limit MusicBrainz to <=1 req/sec per server process, across concurrent songs.
let musicBrainzQueue=Promise.resolve();
let nextMusicBrainzCall=0;
async function musicBrainzFetch(url:URL):Promise<unknown>{
 const work=musicBrainzQueue.catch(()=>{}).then(async()=>{
  const delay=Math.max(0,nextMusicBrainzCall-Date.now());
  if(delay)await new Promise<void>(resolve=>setTimeout(resolve,delay));
  nextMusicBrainzCall=Date.now()+1100;
  return fetchJson(url,{headers:{'User-Agent':'SonicDisplay/0.1.0 (https://github.com/christianlinzatti/sonic-display; metadata integration)',Accept:'application/json'}});
 });
 musicBrainzQueue=work.then(()=>{},()=>{});
 return work;
}
async function fetchJson(url:URL,opts:{headers?:Record<string,string>}={}):Promise<unknown>{
 const res=await fetch(url,{headers:{Accept:'application/json',...opts.headers},next:{revalidate:21600},signal:AbortSignal.timeout(6500)});
 if(!res.ok)throw new Error(`Provider HTTP ${res.status}`);
 return res.json() as Promise<unknown>;
}
function lastfmUrl(method:string,apiKey:string,fields:Record<string,string>){
 const u=new URL('https://ws.audioscrobbler.com/2.0/');
 for(const [k,v] of Object.entries({method,api_key:apiKey,format:'json',autocorrect:'0',...fields}))u.searchParams.set(k,v);
 return u;
}
function audioDbUrl(endpoint:string,params:Record<string,string>){
 const key=process.env.THEAUDIODB_API_KEY||'123';
 if(!/^\d+$/.test(key))return null;
 const u=new URL(`https://www.theaudiodb.com/api/v1/json/${key}/${endpoint}`);
 for(const [k,v] of Object.entries(params))u.searchParams.set(k,v);
 return u;
}
function providerResult<T>(promise:Promise<T>|null):Promise<{status:ProviderStatusV651;data:T|null}>{
 if(!promise)return Promise.resolve({status:'disabled',data:null});
 return promise.then(data=>({status:data&&( !Array.isArray(data)||data.length>0 )?'ok' as const:'empty' as const,data:data||null})).catch(()=>({status:'error' as const,data:null}));
}
/** Public lookup for authenticated app routes, never a browser-side cross-origin proxy. */
export async function readMusicMetadataV651(artist:string,track='',album=''):Promise<MusicMetadataV651>{
 const cacheKey=JSON.stringify([artist.toLocaleLowerCase(),track.toLocaleLowerCase(),album.toLocaleLowerCase(),Boolean(process.env.LASTFM_API_KEY),Boolean(process.env.FLICKR_API_KEY),process.env.THEAUDIODB_ENABLED,process.env.MUSICBRAINZ_ENABLED,process.env.STAGE_FLICKR_ENABLED]);
 const now=Date.now();const existing=cache.get(cacheKey);
 if(existing&&existing.expires>now)return existing.promise;
 const promise=collect(artist,track,album);
 cache.set(cacheKey,{expires:now+TTL,promise});
 // Do not pin transient provider outages in memory for six hours.
 void promise.then(data=>{if(Object.values(data.providers).includes('error')){const entry=cache.get(cacheKey);if(entry?.promise===promise)entry.expires=Date.now()+60000;}},()=>cache.delete(cacheKey));
 if(cache.size>120){for(const [key,value] of cache)if(value.expires<now)cache.delete(key);if(cache.size>120)cache.delete(cache.keys().next().value!);}
 return promise;
}
async function collect(artist:string,track:string,album:string):Promise<MusicMetadataV651>{
 const key=process.env.LASTFM_API_KEY;
 const musicBrainzUrl=new URL('https://musicbrainz.org/ws/2/artist/');
 musicBrainzUrl.searchParams.set('query',`artist:"${artist.replace(/["\\]/g,' ').trim()}"`);
 musicBrainzUrl.searchParams.set('fmt','json');musicBrainzUrl.searchParams.set('limit','7');
 const mbJob=providerResult(process.env.MUSICBRAINZ_ENABLED==='false'?null:musicBrainzFetch(musicBrainzUrl).then(j=>normalizeMusicBrainzArtistV651(j,artist)));
 const lfJob=providerResult(!key?null:fetchJson(lastfmUrl('artist.getInfo',key,{artist,lang:'de'}),{headers:{'User-Agent':'SonicDisplay/0.1.0 (artist metadata)'}}).then(j=>{if(recordV651(j).error)throw Error('Last.fm provider error');return normalizeLastfmArtistV651(j,artist);}));
 const flickrKey=process.env.FLICKR_API_KEY;
 let flickrJob:Promise<{status:ProviderStatusV651;data:ReturnType<typeof normalizeFlickrPhotosV651>|null}>;
 if(flickrKey&&process.env.STAGE_FLICKR_ENABLED!=='false'){
  const f=new URL('https://www.flickr.com/services/rest/');
  for(const [k,v] of Object.entries({method:'flickr.photos.search',api_key:flickrKey,format:'json',nojsoncallback:'1',text:`${artist} concert`,license:'4,5,9,10',safe_search:'1',content_type:'1',media:'photos',sort:'relevance',per_page:'30',extras:'owner_name,license,url_z,url_m,o_dims,tags,description'}))f.searchParams.set(k,v);
  flickrJob=providerResult(fetchJson(f).then(data=>{if(recordV651(data).stat==='fail')throw Error('Flickr provider error');return normalizeFlickrPhotosV651(data,artist);}));
 }else flickrJob=providerResult<ReturnType<typeof normalizeFlickrPhotosV651>>(null);
 const [mb,lf,flickr]=await Promise.all([mbJob,lfJob,flickrJob]);
 const identity=resolveArtistIdentityV652(mb.data,lf.data);
 const mbid=identity.mbid;
 const audioUrl=process.env.THEAUDIODB_ENABLED==='false'?null:audioDbUrl(mbid?'artist-mb.php':'search.php',mbid?{i:mbid}:{s:artist});
 let audio=await providerResult(audioUrl?fetchJson(audioUrl).then(x=>normalizeAudioDbArtistV651(x,artist)):null);
 if(mbid&&audio.status!=='ok'&&process.env.THEAUDIODB_ENABLED!=='false'){const fallback=audioDbUrl('search.php',{s:artist});if(fallback)audio=await providerResult(fetchJson(fallback).then(x=>normalizeAudioDbArtistV651(x,artist)));}
 const genres=mergeGenresV652(audio.data?.genre,lf.data?.genre);
 const photos=rankStagePhotosV652([...(audio.data?.photos||[]),...(flickr.data||[])],'balanced',10).filter((photo):photo is typeof photo & {source:'theaudiodb'|'flickr'}=>photo.source==='theaudiodb'||photo.source==='flickr').map(({url,source,credit,page,title,width,height})=>({url,source,credit,page:page||'',title,width,height}));
 const biography=audio.data?.biography||lf.data?.biography||null;
 // Only issue extra MusicBrainz requests when explicitly requested, with the same limiter.
 // Search using the previously verified artist MBID to avoid mismatched releases/recordings.
 const releaseGroupJob=album&&identity.status==='verified'&&mbid&&process.env.MUSICBRAINZ_ENABLED!=='false'?(()=>{
   const u=new URL('https://musicbrainz.org/ws/2/release-group/');
   u.searchParams.set('query',`release:"${album.replace(/["\\]/g,' ').trim()}" AND arid:${mbid}`);
   u.searchParams.set('fmt','json');u.searchParams.set('limit','5');
   return musicBrainzFetch(u).then(x=>normalizeMusicBrainzReleaseGroupV651(x,album));
 })():null;
 const recordingJob=track&&identity.status==='verified'&&mbid&&process.env.MUSICBRAINZ_ENABLED!=='false'?(()=>{
   const u=new URL('https://musicbrainz.org/ws/2/recording/');
   u.searchParams.set('query',`recording:"${track.replace(/["\\]/g,' ').trim()}" AND arid:${mbid}`);
   u.searchParams.set('fmt','json');u.searchParams.set('limit','5');
   return musicBrainzFetch(u).then(x=>normalizeMusicBrainzRecordingV651(x,track));
 })():null;
 const [releaseGroup,recording]=await Promise.all([providerResult(releaseGroupJob),providerResult(recordingJob)]);
 const result:MusicMetadataV651={
  artist:{name:mb.data?.name||lf.data?.name||audio.data?.name||artist,mbid,country:mb.data?.country||null,formed:mb.data?.formed||audio.data?.formed||null,ended:mb.data?.ended||null,
   genre:genres,style:audio.data?.style||null,mood:audio.data?.mood||null,label:audio.data?.label||null,
   biography,biographySource:audio.data?.biography?'theaudiodb':lf.data?.biography?'lastfm':null,
   listeners:lf.data?.listeners??null,playcount:lf.data?.playcount??null,similar:lf.data?.similar||[],photos,
   identityStatus:identity.status,
   fieldSources:{
     ...(mb.data?.name?{name:'musicbrainz' as const}:lf.data?.name?{name:'lastfm' as const}:audio.data?.name?{name:'theaudiodb' as const}:{}),
     ...(mb.data?.country?{country:'musicbrainz' as const}:{}),
     ...(mb.data?.formed?{formed:'musicbrainz' as const}:audio.data?.formed?{formed:'theaudiodb' as const}:{}),
     ...(genres.length?{genre:audio.data?.genre?'theaudiodb' as const:'lastfm' as const}:{}),
     ...(audio.data?.style?{style:'theaudiodb' as const}:{}),
     ...(audio.data?.mood?{mood:'theaudiodb' as const}:{}),
     ...(audio.data?.label?{label:'theaudiodb' as const}:{}),
     ...(audio.data?.biography?{biography:'theaudiodb' as const}:lf.data?.biography?{biography:'lastfm' as const}:{}),
     ...(lf.data?.listeners!=null?{listeners:'lastfm' as const}:{}),
     ...(lf.data?.playcount!=null?{playcount:'lastfm' as const}:{}),
     ...(lf.data?.similar?.length?{similar:'lastfm' as const}:{}),
   },
   sources:['musicbrainz','theaudiodb','lastfm','flickr'].filter(p=>({musicbrainz:mb.status,theaudiodb:audio.status,lastfm:lf.status,flickr:flickr.status} as Record<string,ProviderStatusV651>)[p]==='ok')},
  track:null,album:null,
  providers:{musicbrainz:mb.status,theaudiodb:audio.status,lastfm:lf.status,flickr:flickr.status},
 };
 if(track){
  const audioTrackUrl=process.env.THEAUDIODB_ENABLED==='false'?null:audioDbUrl('searchtrack.php',{s:artist,t:track});
  const [lfTrack,audioTrack]=await Promise.all([
   providerResult(!key?null:fetchJson(lastfmUrl('track.getInfo',key,{artist,track}),{headers:{'User-Agent':'SonicDisplay/0.1.0 (track metadata)'}}).then(j=>{if(recordV651(j).error)throw Error('Last.fm track error');return normalizeLastfmTrackV651(j,track,artist);})),
   providerResult(audioTrackUrl?fetchJson(audioTrackUrl).then(j=>{const entries=recordV651(j).track;return Array.isArray(entries)?entries.map(recordV651).find(e=>exactV651(track,e.strTrack)&&(!e.strArtist||exactV651(artist,e.strArtist)))||null:null;}):null),
  ]);
  const a=audioTrack.data;
  result.track={name:track,mbid:recording.data?.mbid||null,isrcs:recording.data?.isrcs||[],album:stringV651(a?.strAlbum)||album||null,genre:uniqueV651([stringV651(a?.strGenre),...(lfTrack.data?.genre||[])],12),
   description:plainV651(a?.strDescriptionDE,750)||plainV651(a?.strDescriptionEN,750)||lfTrack.data?.description||null,
   listeners:lfTrack.data?.listeners??null,playcount:lfTrack.data?.playcount??null,
   durationMs:numberV651(a?.intDuration)??lfTrack.data?.durationMs??recording.data?.durationMs??null,releaseDate:null};
 }
 if(album){
  const albumUrl=process.env.THEAUDIODB_ENABLED==='false'?null:audioDbUrl('searchalbum.php',{s:artist,a:album});
  const [audioAlbum,lfAlbum]=await Promise.all([
   providerResult(albumUrl?fetchJson(albumUrl).then(j=>{const entries=recordV651(j).album;return Array.isArray(entries)?entries.map(recordV651).find(e=>exactV651(album,e.strAlbum)&&(!e.strArtist||exactV651(artist,e.strArtist)))||null:null;}):null),
   providerResult(!key?null:fetchJson(lastfmUrl('album.getInfo',key,{artist,album}),{headers:{'User-Agent':'SonicDisplay/0.1.0 (album metadata)'}}).then(j=>{if(recordV651(j).error)throw Error('Last.fm album error');const a=recordV651(recordV651(j).album);return exactV651(album,a.name)&&(!a.artist||exactV651(artist,typeof a.artist==='string'?a.artist:recordV651(a.artist).name))?a:null;})),
  ]);
  const a=audioAlbum.data,l=lfAlbum.data;
  result.album={name:album,mbid:releaseGroup.data?.mbid||null,releaseDate:releaseGroup.data?.releaseDate||stringV651(a?.intYearReleased,10)||stringV651(l?.releasedate,80),
   description:plainV651(a?.strDescriptionDE,750)||plainV651(a?.strDescriptionEN,750)||plainV651(recordV651(l?.wiki).summary,750)};
 }
 return result;
}
