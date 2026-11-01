import type {LastFmEventV706} from './lastfm-history-v706';
import {buildExplorerProfileV729,explorerEventsV729,explorerKeyV729,type ExplorerSelectionV729} from './lastfm-explorer-v729';

export type ExplorerRangeV730={from:string;to:string};
export type ExplorerProfileV730=ReturnType<typeof buildExplorerProfileV729>;
export const selectionKeyV730=(s:ExplorerSelectionV729)=>JSON.stringify([explorerKeyV729(s.artist),s.title===undefined?null:explorerKeyV729(s.title)]);
export const favoriteStorageKeyV730=(account:string)=>`sonic-display:lastfm:explorer-favorites:v730:${encodeURIComponent(account.trim().toLocaleLowerCase('en-US'))}`;
export const localDateV730=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
function validDay(value:string){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;
 const d=new Date(`${value}T12:00:00`);return Number.isFinite(d.getTime())&&localDateV730(d)===value&&value>='2000-01-01'&&value<='9999-12-31';
}
export function filterExplorerRangeV730(events:readonly LastFmEventV706[],range:ExplorerRangeV730,now=new Date()){
 const error=(range.from&&!validDay(range.from))||(range.to&&!validDay(range.to))?'Bitte gültige Kalenderdaten ab 2000 eingeben.':range.from&&range.to&&range.from>range.to?'Das Startdatum liegt nach dem Enddatum.':null;
 if(error)return {events:[] as LastFmEventV706[],error};
 return {events:explorerEventsV729(events,now).filter(e=>{const day=localDateV730(new Date(e.playedAt));return (!range.from||day>=range.from)&&(!range.to||day<=range.to);}),error:null};
}
/** Twelve calendar months, including zeros; zero means no archived scrobbles. */
export function yearMonthsV730(profile:ExplorerProfileV730,year:number){
 const counts=new Map(profile.months);
 return Array.from({length:12},(_,i)=>{const month=`${year}-${String(i+1).padStart(2,'0')}`;return {month,plays:counts.get(month)??0};});
}
export function compareYearsV730(profile:ExplorerProfileV730,yearA:number,yearB:number){
 const a=yearMonthsV730(profile,yearA),b=yearMonthsV730(profile,yearB);
 const playsA=a.reduce((n,m)=>n+m.plays,0),playsB=b.reduce((n,m)=>n+m.plays,0);
 return {yearA,yearB,playsA,playsB,delta:playsB-playsA,percent:playsA?(playsB-playsA)/playsA*100:null,months:a.map((m,i)=>({month:i+1,a:m.plays,b:b[i].plays}))};
}
export function compareProfilesV730(events:readonly LastFmEventV706[],a:ExplorerSelectionV729,b:ExplorerSelectionV729,range:ExplorerRangeV730,now=new Date()){
 const filtered=filterExplorerRangeV730(events,range,now);
 const error=filtered.error??((a.title===undefined)!==(b.title===undefined)?'Bitte zwei Künstler oder zwei Songs vergleichen.':selectionKeyV730(a)===selectionKeyV730(b)?'Bitte zwei unterschiedliche Profile wählen.':null);
 if(error)return {error,a:null,b:null,sharedDays:0,delta:0};
 const pa=buildExplorerProfileV729(filtered.events,a,now),pb=buildExplorerProfileV729(filtered.events,b,now);
 const daysA=new Set(pa.history.map(e=>localDateV730(new Date(e.playedAt))));
 const daysB=new Set(pb.history.map(e=>localDateV730(new Date(e.playedAt))));
 return {error:null,a:pa,b:pb,sharedDays:[...daysA].filter(day=>daysB.has(day)).length,delta:pb.plays-pa.plays};
}
export function parseFavoritesV730(raw:string|null):ExplorerSelectionV729[]{
 if(raw===null)return [];
 if(raw.length>200000)throw new Error('Favoritenspeicher ist zu groß.');
 const data:unknown=JSON.parse(raw);
 if(!Array.isArray(data)||data.length>100)throw new Error('Ungültiger Favoritenspeicher.');
 const result:ExplorerSelectionV729[]=[],seen=new Set<string>();
 for(const entry of data){
  if(!entry||typeof entry!=='object'||Array.isArray(entry))throw new Error('Ungültiges Favoritenprofil.');
  const s=entry as Record<string,unknown>;
  if(typeof s.artist!=='string'||!s.artist.trim()||s.artist.length>400||/[\u0000-\u001f\u007f]/.test(s.artist)||s.title!==undefined&&(typeof s.title!=='string'||!s.title.trim()||s.title.length>400||/[\u0000-\u001f\u007f]/.test(s.title)))throw new Error('Ungültiges Favoritenprofil.');
  const selection:ExplorerSelectionV729={artist:s.artist.trim(),...(typeof s.title==='string'?{title:s.title.trim()}:{})};
  const key=selectionKeyV730(selection);if(!seen.has(key)){seen.add(key);result.push(selection);}
 }
 return result;
}
export function toggleFavoriteV730(favorites:readonly ExplorerSelectionV729[],selection:ExplorerSelectionV729){
 const clean=parseFavoritesV730(JSON.stringify([selection]))[0],key=selectionKeyV730(clean);
 if(favorites.some(s=>selectionKeyV730(s)===key))return favorites.filter(s=>selectionKeyV730(s)!==key);
 if(favorites.length>=100)throw new Error('Maximal 100 Profile können gemerkt werden.');
 return [...favorites,clean];
}
/** Quote every cell and neutralize spreadsheet formulas, including leading whitespace. */
export function explorerCsvV730(rows:readonly (readonly (string|number)[])[]){
 return '\ufeff'+rows.map(row=>row.map(value=>{let text=String(value);if(typeof value==='string'&&/^\s*[=+\-@]/u.test(text))text="'"+text;return '"'+text.replace(/"/g,'""')+'"';}).join(';')).join('\r\n')+'\r\n';
}
export function profileRowsV730(profile:ExplorerProfileV730,range:ExplorerRangeV730){
 const s=profile.selection,prefix=[s.title===undefined?'Künstler':'Song',s.artist,s.title??'',range.from,range.to];
 const rows:(string|number)[][]=[['Profiltyp','Künstler','Song','Filter von (lokal)','Filter bis (lokal)','Kennzahl','Zeitraum / UTC-Zeitpunkt','Wert'],[...prefix,'Scrobbles','',profile.plays],[...prefix,'Verschiedene Songs','',profile.topSongs.length],[...prefix,'Erstmals im Filter (UTC)',profile.first??'',''],[...prefix,'Zuletzt im Filter (UTC)',profile.last??'','']];
 for(const [year,plays] of profile.years)rows.push([...prefix,'Jahr',year,plays]);
 for(const year of profile.years.map(([year])=>year))for(const m of yearMonthsV730(profile,year))rows.push([...prefix,'Monat',m.month,m.plays]);
 for(const song of profile.topSongs)rows.push([...prefix,'Top-Song',song.title,song.plays]);
 for(const r of profile.rediscoveries)rows.push([...prefix,'Rückkehr nach Kalendertagen',r.returned,r.gapDays]);
 return rows;
}
