/** V336: optional Austria-first event sources, no external packages. */
import {selectOeticketPosterV337,selectOeticketImagesV338} from "./concertDisplayV337";
import {exactArtistMatchV335,type ArtistConcertV335,normalizeTicketmasterV335} from './artistProvidersV335';
export type ConcertSourceV336='oeticket'|'ticketmaster';
export interface ConcertV336 extends ArtistConcertV335 {source:ConcertSourceV336;status?:string;country?:string;alternatives?:Array<{source:ConcertSourceV336;url:string}>;}
export interface OeticketLocationV336{name?:string;city?:string;postalCode?:string;state?:string;}
export interface OeticketProductV336{productId?:string;name?:string;status?:string;typeAttributes?:{liveEntertainment?:{location?:OeticketLocationV336;startDate?:string}};url?:{domain?:string;path?:string};imageUrl?:string;image?:string;images?:unknown[];}
export interface OeticketGroupV336{productGroupId?:string;name?:string;mainAttraction?:{name?:string};products?:OeticketProductV336[];imageUrl?:string;image?:string;images?:unknown[];}
export interface OeticketResponseV336{totalResults?:number;productGroups?:OeticketGroupV336[];}
const cleaned=(v:unknown,max=120)=>typeof v==='string'?v.trim().slice(0,max):'';
const canonical=(v:string)=>v.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de').replace(/[^a-z0-9]+/g,' ').trim();
export const normalizeArtistQueryV336=(v:string)=>v.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').trim();
const isoDate=(v:unknown):string=>{const s=cleaned(v,32);return /^\d{4}-\d{2}-\d{2}(?:T|$)/.test(s)&&Number.isFinite(Date.parse(s.slice(0,10)+'T12:00:00Z'))?s.slice(0,10):'';};
export function safeConcertUrlV336(domain:unknown,path:unknown=''):string|undefined{
  try{
    const raw=cleaned(domain,1200),suffix=cleaned(path,1200);
    // Only the official ticket/event hosts may be used from the untrusted Eventim result.
    if(raw&&!/^https:\/\//i.test(raw))return undefined;
    const combined=raw?new URL(suffix,raw):new URL(suffix,'https://www.oeticket.com');
    if(combined.protocol!=='https:'||combined.username||combined.password)return undefined;
    if(!/(^|\.)(oeticket\.com|eventim\.de|ticketmaster\.(com|at|de))$/i.test(combined.hostname))return undefined;
    return combined.href;
  }catch{return undefined;}
}
const artistMatch=(expected:string,actual:string)=>exactArtistMatchV335(expected,actual);
export function normalizeOeticketV336(raw:unknown,artist:string,nowISO:string,city?:string):ConcertV336[]{
  if(!raw||typeof raw!=='object')return [];
  const groups=(raw as OeticketResponseV336).productGroups;
  if(!Array.isArray(groups))return [];
  const events:ConcertV336[]=[];
  for(const group of groups){
    if(!group||typeof group!=='object')continue;
    const names=[group.mainAttraction?.name,group.name].filter((x):x is string=>typeof x==='string');
    // Never pick first search result as a fallback; reject unrelated artists.
    if(!names.some(n=>artistMatch(artist,n)))continue;
    for(const p of Array.isArray(group.products)?group.products:[]){
      if(!p||typeof p!=='object')continue;
      const d=isoDate(p.typeAttributes?.liveEntertainment?.startDate);
      if(!d||d<nowISO.slice(0,10))continue;
      const location=p.typeAttributes?.liveEntertainment?.location;
      if(city&&canonical(location?.city||'')!==canonical(city))continue;
      const link=safeConcertUrlV336(p.url?.domain,p.url?.path);
      events.push({source:'oeticket',date:d,title:cleaned(p.name||group.name,95)||artist,venue:cleaned(location?.name,90),city:cleaned(location?.city,70),url:link,status:cleaned(p.status,32),posterUrl:selectOeticketPosterV337(p,group),posterUrls:selectOeticketImagesV338(p,group),country:'AT'});
    }
  }
  return events.sort((a,b)=>a.date.localeCompare(b.date)).slice(0,30);
}
export function normalizeTicketmasterTaggedV336(raw:unknown,artist:string,nowISO:string):ConcertV336[]{
  return normalizeTicketmasterV335(raw,artist,nowISO).map(e=>({...e,source:'ticketmaster' as const}));
}
export function mergeConcertsV336(items:ConcertV336[],max=12):ConcertV336[]{
  const score=(e:ConcertV336)=>e.source==='oeticket'?3:e.source==='ticketmaster'?2:1;
  const result:ConcertV336[]=[];
  // Match by same calendar date, venue and city (avoid title differences across sites).
  for(const e of [...items].sort((a,b)=>a.date.localeCompare(b.date)||score(b)-score(a))){
    const match=result.find(r=>r.date===e.date&&canonical(r.venue)===canonical(e.venue)&&canonical(r.city)===canonical(e.city)&&!!canonical(r.venue)&&!!canonical(r.city));
    if(match){
      if(!match.posterUrl&&e.posterUrl)match.posterUrl=e.posterUrl;
      match.posterUrls=[...new Set([...(match.posterUrls??[]),...(e.posterUrls??[])])].slice(0,8);
      if(!match.status&&e.status)match.status=e.status;
      if(e.url&&e.url!==match.url&&!match.alternatives?.some(a=>a.url===e.url))match.alternatives=[...(match.alternatives||[]),{source:e.source,url:e.url}];
    }else result.push({...e});
  }
  return result.slice(0,max);
}
