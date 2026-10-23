/** V335 — pure safety/normalization rules for independently sourced artist data. */
import {selectTicketmasterPosterV337,selectConcertImagesV338} from "./concertDisplayV337";
export interface ArtistConcertV335 {date:string; title:string; venue:string; city:string; url?:string;posterUrl?:string;posterUrls?:string[];status?:string;}
export const safeArtistNameV335=(value:unknown):string=>typeof value==='string'&&value.trim().length>=2&&value.trim().length<=120&&!/[\x00-\x1f]/.test(value)?value.trim():'';
export function artistMatchV335(expected:string,actual:string):boolean {
  const norm=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const a=norm(expected),b=norm(actual);
  return !!a&&!!b&&(a===b||b.startsWith(a+' ')||a.startsWith(b+' '));
}
export function normalizeWikipediaV335(data:unknown,artist:string):{title:string;text:string}|null {
  if(!data||typeof data!=='object')return null;
  const d=data as {title?:unknown;extract?:unknown;type?:unknown};
  if(d.type==='disambiguation'||typeof d.title!=='string'||!artistMatchV335(artist,d.title)||typeof d.extract!=='string')return null;
  const text=d.extract.replace(/\s+/g,' ').trim().slice(0,1400);
  return text.length>=40?{title:d.title,text}:null;
}
export function exactArtistMatchV335(expected:string,actual:string):boolean {
  const norm=(s:string)=>s.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  return !!norm(expected)&&norm(expected)===norm(actual);
}
export function normalizeTicketmasterV335(payload:unknown,artist:string,nowISO:string):ArtistConcertV335[] {
  if(!payload||typeof payload!=='object')return [];
  const outer=payload as {_embedded?:{events?:unknown}};
  const entries=outer._embedded?.events;
  if(!Array.isArray(entries))return [];
  const results:ArtistConcertV335[]=[];
  for(const item of entries){
    if(!item||typeof item!=='object')continue;
    const e=item as {name?:unknown;url?:unknown;images?:unknown;dates?:{start?:{localDate?:unknown}};_embedded?:{attractions?:Array<{name?:string}>;venues?:Array<{name?:string;city?:{name?:string}}>;}};
    // Require an exact artist attraction rather than a keyword hit in another act's title.
    if(!Array.isArray(e._embedded?.attractions)||!e._embedded!.attractions!.some(a=>typeof a.name==='string'&&exactArtistMatchV335(artist,a.name)))continue;
    const date=e.dates?.start?.localDate;
    if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||date<nowISO.slice(0,10))continue;
    const venue=e._embedded?.venues?.[0];
    const url=typeof e.url==='string'&&/^https:\/\//.test(e.url)?e.url:undefined;
    results.push({date,title:typeof e.name==='string'?e.name.slice(0,95):artist.slice(0,95),venue:typeof venue?.name==='string'?venue.name.slice(0,90):'',city:typeof venue?.city?.name==='string'?venue.city.name.slice(0,70):'',url,posterUrl:selectTicketmasterPosterV337(e.images),posterUrls:selectConcertImagesV338(e.images)});
  }
  const seen=new Set<string>();
  return results.sort((a,b)=>a.date.localeCompare(b.date)).filter(e=>{const key=e.date+'|'+e.venue+'|'+e.title;if(seen.has(key))return false;seen.add(key);return true;}).slice(0,12);
}
