/** Server-safe normalization of third-party music metadata. No API keys or side effects. */
export interface ExternalArtistPhotoV651 {url:string;credit:string;page:string;source:'theaudiodb'|'flickr';title?:string;width?:number;height?:number;}
export interface MusicArtistDetailsV651 {
 name:string;mbid:string|null;country:string|null;formed:string|null;ended:string|null;
 genre:string[];style:string|null;mood:string|null;label:string|null;
 biography:string|null;biographySource:'theaudiodb'|'lastfm'|null;
 listeners:number|null;playcount:number|null;similar:string[];
 photos:ExternalArtistPhotoV651[];
 sources:string[];
 /** V652: provider-qualified identity; a conflict deliberately exposes no linked MBID. */
 identityStatus?:'verified'|'provisional'|'conflict'|'unresolved';
 fieldSources?:Partial<Record<'name'|'country'|'formed'|'genre'|'style'|'mood'|'label'|'biography'|'listeners'|'playcount'|'similar', 'musicbrainz'|'theaudiodb'|'lastfm'>>;
}
export interface MusicTrackDetailsV651 {name:string;mbid:string|null;isrcs:string[];album:string|null;genre:string[];description:string|null;listeners:number|null;playcount:number|null;durationMs:number|null;releaseDate:string|null;}
export type ProviderStatusV651='ok'|'empty'|'disabled'|'error';
export interface MusicMetadataV651 {artist:MusicArtistDetailsV651;track:MusicTrackDetailsV651|null;album:{name:string;mbid:string|null;releaseDate:string|null;description:string|null}|null;providers:Record<'musicbrainz'|'theaudiodb'|'lastfm'|'flickr',ProviderStatusV651>;}
export const recordV651=(x:unknown):Record<string,unknown>=>x!==null&&typeof x==='object'&&!Array.isArray(x)?x as Record<string,unknown>:{};
export const stringV651=(x:unknown,max=1200):string|null=>typeof x==='string'&&x.trim()?x.trim().slice(0,max):null;
export const numberV651=(x:unknown):number|null=>{const n=Number(x);return x!==null&&x!==undefined&&x!==''&&Number.isFinite(n)&&n>=0?n:null;};
export const httpsV651=(x:unknown):string|null=>{if(typeof x!=='string'||x.length>2000)return null;try{const u=new URL(x);return u.protocol==='https:'?u.href:null;}catch{return null;}};
export const uniqueV651=(xs:(string|null|undefined)[],limit=12):string[]=>[...new Set(xs.filter((x):x is string=>!!x))].slice(0,limit);
export function plainV651(text:unknown,max=1100):string|null {
 const value=stringV651(text,6000);
 if(!value)return null;
 const clean=value.replace(/<[^>]*>/g,' ').replace(/&(?:nbsp|amp|quot|lt|gt|#39);/gi,x=>({'&nbsp;':' ','&amp;':'&','&quot;':'"','&lt;':'<','&gt;':'>','&#39;':"'"} as Record<string,string>)[x.toLowerCase()]||' ').replace(/\s+/g,' ').trim();
 return clean?clean.slice(0,max):null;
}
export const canonicalV651=(s:string):string=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export const exactV651=(a:string,b:unknown):boolean=>typeof b==='string'&&!!canonicalV651(a)&&canonicalV651(a)===canonicalV651(b);
export const validMbidV651=(x:unknown):x is string=>typeof x==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x);
export function normalizeMusicBrainzArtistV651(data:unknown,name:string){
 const results=recordV651(data).artists;
 const artists=Array.isArray(results)?results:[];
 const matches=artists.map(recordV651).filter(a=>exactV651(name,a.name)&&validMbidV651(a.id));
 const match=matches.length===1?matches[0]:null;
 return match?{name:stringV651(match.name,140)||name,mbid:match.id as string,country:stringV651(match.country,2),formed:stringV651(recordV651(match['life-span']).begin,32),ended:stringV651(recordV651(match['life-span']).end,32)}:null;
}
export function normalizeMusicBrainzReleaseGroupV651(data:unknown,name:string){
 const entries=recordV651(data)['release-groups'];
 if(!Array.isArray(entries))return null;
 const matches=entries.map(recordV651).filter(x=>exactV651(name,x.title)&&validMbidV651(x.id));
 const found=matches.length===1?matches[0]:null;
 return found?{mbid:found.id as string,releaseDate:stringV651(found['first-release-date'],10)}:null;
}
export function normalizeMusicBrainzRecordingV651(data:unknown,name:string){
 const entries=recordV651(data).recordings;
 if(!Array.isArray(entries))return null;
 const matches=entries.map(recordV651).filter(x=>exactV651(name,x.title)&&validMbidV651(x.id));
 const found=matches.length===1?matches[0]:null;
 return found?{mbid:found.id as string,durationMs:numberV651(found.length),isrcs:uniqueV651((Array.isArray(found.isrcs)?found.isrcs:[]).map(x=>typeof x==='string'&&/^[A-Z]{2}[A-Z0-9]{3}\d{7}$/.test(x)?x:null),5)}:null;
}
export function normalizeAudioDbArtistV651(data:unknown,name:string){
 const artists=recordV651(data).artists;
 if(!Array.isArray(artists))return null;
 const item=artists.map(recordV651).find(a=>exactV651(name,a.strArtist));
 if(!item)return null;
 const photos=uniqueV651([item.strArtistThumb,item.strArtistFanart,item.strArtistFanart2,item.strArtistFanart3,item.strArtistWideThumb].map(httpsV651),5)
  .map(url=>({url,credit:'TheAudioDB · Quelle und Bildrechte beim Anbieter prüfen',page:`https://www.theaudiodb.com/artist/${String(item.idArtist||'')}`,source:'theaudiodb' as const}));
 return {name:stringV651(item.strArtist,140)||name,genre:stringV651(item.strGenre,100),style:stringV651(item.strStyle,100),mood:stringV651(item.strMood,100),label:stringV651(item.strLabel,100),biography:plainV651(item.strBiographyDE)||plainV651(item.strBiographyEN),formed:stringV651(item.intFormedYear,20),photos};
}
export function normalizeLastfmArtistV651(data:unknown,name:string){
 const d=recordV651(recordV651(data).artist);
 if(!exactV651(name,d.name))return null;
 const tags=recordV651(d.tags).tag;
 const similar=recordV651(d.similar).artist;
 const stats=recordV651(d.stats);
 return {name:stringV651(d.name,140)||name,mbid:validMbidV651(d.mbid)?d.mbid:null,
   genre:uniqueV651((Array.isArray(tags)?tags:tags?[tags]:[]).map(t=>stringV651(recordV651(t).name,80)),12),
   similar:uniqueV651((Array.isArray(similar)?similar:similar?[similar]:[]).map(t=>stringV651(recordV651(t).name,100)),8),
   biography:plainV651(recordV651(d.bio).summary),listeners:numberV651(stats.listeners),playcount:numberV651(stats.playcount)};
}
export function normalizeLastfmTrackV651(data:unknown,name:string,artist=""){
 const d=recordV651(recordV651(data).track);
 if(!exactV651(name,d.name))return null;
 const returnedArtist=typeof d.artist==='string'?d.artist:recordV651(d.artist).name;
 if(artist&&returnedArtist&&!exactV651(artist,returnedArtist))return null;
 const tags=recordV651(d.toptags).tag;
 return {genre:uniqueV651((Array.isArray(tags)?tags:tags?[tags]:[]).map(x=>stringV651(recordV651(x).name,80)),12),listeners:numberV651(d.listeners),playcount:numberV651(d.playcount),durationMs:numberV651(d.duration),description:plainV651(recordV651(d.wiki).summary,750)};
}
export function normalizeFlickrPhotosV651(data:unknown,artist:string,max=6):ExternalArtistPhotoV651[]{
 const photos=recordV651(recordV651(data).photos).photo;
 if(!Array.isArray(photos))return [];
 const licenses:Record<string,{label:string;url:string}>={
  '4':{label:'CC BY 2.0',url:'https://creativecommons.org/licenses/by/2.0/'},
  '5':{label:'CC BY-SA 2.0',url:'https://creativecommons.org/licenses/by-sa/2.0/'},
  '9':{label:'CC0 1.0',url:'https://creativecommons.org/publicdomain/zero/1.0/'},
  '10':{label:'Public Domain Mark',url:'https://creativecommons.org/publicdomain/mark/1.0/'},
 };
 const result:ExternalArtistPhotoV651[]=[];
 for(const entry of photos){
  const p=recordV651(entry);
  const license=licenses[String(p.license??'')];
  const id=stringV651(p.id,30),owner=stringV651(p.owner,120),url=httpsV651(p.url_z)||httpsV651(p.url_m);
  const title=stringV651(p.title,350)||'';
  const tags=stringV651(p.tags,1000)||'';
  const description=plainV651(recordV651(p.description)._content,600)||'';
  const author=plainV651(p.ownername,100)||'Flickr';
  if(!license||!id||!/^\d+$/.test(id)||!owner||!url)continue;
  // Flickr text search may return unrelated people. Require evidence of artist name in metadata.
  const evidence=canonicalV651(`${title} ${tags} ${description}`);
  const artistKey=canonicalV651(artist);
  if(artistKey.length<3||!` ${evidence} `.includes(` ${artistKey} `)||/(?:^| )(tribute|cover band|lookalike|impersonator)(?: |$)/.test(canonicalV651(title)))continue;
  const page=`https://www.flickr.com/photos/${encodeURIComponent(owner)}/${id}`;
  if(result.some(x=>x.url===url))continue;
  const width=numberV651(p.width_z)??numberV651(p.width_m)??undefined;
  const height=numberV651(p.height_z)??numberV651(p.height_m)??undefined;
  result.push({url,page,credit:`${author} · ${license.label} (${license.url}) · ${page}`.slice(0,320),source:'flickr',title,width,height});
  if(result.length>=max)break;
 }
 return result;
}
