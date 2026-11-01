import type {LastFmEventV706} from './lastfm-history-v706';
import {explorerEventsV729,explorerCatalogV729,explorerKeyV729} from './lastfm-explorer-v729';
import {filterExplorerRangeV730,localDateV730,type ExplorerRangeV730} from './lastfm-explorer-v730';

export function periodV732(value:string):ExplorerRangeV730 {
 if(!/^\d{4}(-\d{2})?$/.test(value))throw Error('Bitte ein Jahr oder einen Monat wählen.');
 const [y,m]=value.split('-').map(Number);if(y<2000||y>9998||(m!==undefined&&(m<1||m>12)))throw Error('Ungültiger Zeitraum.');
 return {from:`${y}-${m?String(m).padStart(2,'0'):'01'}-01`,to:localDateV730(new Date(y,m??12,0,12))};
}
export function summaryV732(events:readonly LastFmEventV706[],range:ExplorerRangeV730){
 const result=filterExplorerRangeV730(events,range);if(result.error)throw Error(result.error);
 const days=new Map<string,LastFmEventV706[]>();for(const e of result.events){const d=localDateV730(new Date(e.playedAt));const entries=days.get(d)??[];entries.push(e);days.set(d,entries);}
 const catalog=explorerCatalogV729(result.events);
 return {events:result.events,days,catalog,plays:result.events.length,activeDays:days.size,busiest:[...days].sort((a,b)=>b[1].length-a[1].length||a[0].localeCompare(b[0]))[0]};
}
export function comparePeriodsV732(events:readonly LastFmEventV706[],a:ExplorerRangeV730,b:ExplorerRangeV730){
 const left=summaryV732(events,a),right=summaryV732(events,b),rows=new Map<string,{artist:string;a:number;b:number}>();
 for(const p of left.catalog.artists)rows.set(explorerKeyV729(p.artist),{artist:p.artist,a:p.plays,b:0});
 for(const p of right.catalog.artists){const k=explorerKeyV729(p.artist),r=rows.get(k)??{artist:p.artist,a:0,b:0};r.b=p.plays;rows.set(k,r);}
 return {left,right,rows:[...rows.values()].map(r=>({...r,delta:r.b-r.a})).sort((a,b)=>b.delta-a.delta||a.artist.localeCompare(b.artist))};
}
export function qualityV732(events:readonly LastFmEventV706[],now=new Date()){
 let invalid=0,duplicates=0,missingAlbums=0;const seen=new Set<string>();
 for(const e of events){if(!explorerEventsV729([e],now).length){invalid++;continue;}const key=JSON.stringify([Date.parse(e.playedAt),explorerKeyV729(e.artist),explorerKeyV729(e.title)]);if(seen.has(key))duplicates++;seen.add(key);if(!e.album?.trim()||explorerKeyV729(e.album)==='album unbekannt')missingAlbums++;}
 const valid=explorerEventsV729(events,now),dates=[...new Set(valid.map(e=>localDateV730(new Date(e.playedAt))))];
 const day=(d:string)=>Date.parse(d+'T00:00:00Z')/86400000;
 const gaps=dates.slice(1).map((to,i)=>({from:dates[i],to,days:day(to)-day(dates[i])-1})).filter(g=>g.days>0).sort((a,b)=>b.days-a.days);
 return {invalid,duplicates,missingAlbums,gaps,valid:valid.length};
}
export type SavedV732={kind:'album'|'song'|'artist';artist:string;name:string;list:'favorite'|'later'};
export const savedKeyV732=(s:SavedV732)=>JSON.stringify([s.kind,explorerKeyV729(s.artist),explorerKeyV729(s.name),s.list]);
export const storageKeyV732=(account:string)=>`sonic-display:collections:v732:${encodeURIComponent(explorerKeyV729(account))}`;
export function parseSavedV732(raw:string|null):SavedV732[]{
 if(raw===null)return [];if(raw.length>200000)throw Error('Datei zu groß.');const data=JSON.parse(raw);if(!Array.isArray(data)||data.length>300)throw Error('Maximal 300 Einträge erlaubt.');
 const seen=new Set<string>(),result:SavedV732[]=[];
 for(const x of data){if(!x||!['album','song','artist'].includes(x.kind)||!['favorite','later'].includes(x.list)||typeof x.artist!=='string'||!x.artist.trim()||x.artist.length>500||typeof x.name!=='string'||!x.name.trim()||x.name.length>500)throw Error('Ungültiger Sammlungseintrag.');const s:SavedV732={kind:x.kind,artist:x.artist.trim(),name:x.name.trim(),list:x.list},key=savedKeyV732(s);if(!seen.has(key)){seen.add(key);result.push(s);}}
 return result;
}
export function mergeSavedV732(raw:string,current:SavedV732[]){
 if(raw.length>200000)throw Error('Datei zu groß.');const v=JSON.parse(raw);if(v?.format!=='sonic-collections-v732'||v.version!==1)throw Error('Unbekanntes Sammlungsbackup.');const incoming=parseSavedV732(JSON.stringify(v.items));
 const merged=new Map(parseSavedV732(JSON.stringify(current)).map(s=>[savedKeyV732(s),s]));for(const s of incoming)merged.set(savedKeyV732(s),s);return parseSavedV732(JSON.stringify([...merged.values()]));
}
export async function readBackupV732(file:{size:number;text:()=>Promise<string>}){if(file.size>200000)throw Error('Datei zu groß (max. 200 KB).');const text=await file.text();if(text.length>200000)throw Error('Datei zu groß.');return text;}
