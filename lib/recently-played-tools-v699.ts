import type {RecentTrackV672} from './recently-played-v672';

/** Pure, client-only tools. No listening history is stored, posted, or sent to a third party. */
export const V699_MAX_EVENTS = 600;
export type HistoryPeriodV699 = 'all' | 'today' | 'week' | 'month';
export type HistoryModeV699 = 'all' | 'repeated' | 'unique';
export type HistorySortV699 = 'newest' | 'oldest';
export type HistoryFiltersV699 = {query:string;period:HistoryPeriodV699;mode:HistoryModeV699;sort:HistorySortV699};
export const DEFAULT_HISTORY_FILTERS_V699:HistoryFiltersV699={query:'',period:'all',mode:'all',sort:'newest'};

export function mergeHistoryPagesV699(existing:ReadonlyArray<RecentTrackV672>,incoming:ReadonlyArray<RecentTrackV672>,limit=V699_MAX_EVENTS):RecentTrackV672[]{
 const seen=new Set<string>();const merged:RecentTrackV672[]=[];
 for(const track of [...existing,...incoming]){
  if(!track || !track.id || !track.playedAt)continue;
  const key=`${track.id}:${track.playedAt}`;
  if(seen.has(key))continue;
  seen.add(key);merged.push(track);
  if(merged.length>=Math.max(1,Math.min(V699_MAX_EVENTS,Math.floor(limit))))break;
 }
 return merged.sort((a,b)=>Date.parse(b.playedAt)-Date.parse(a.playedAt));
}

const normalizeSearch=(text:string)=>text.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('de-AT').trim();
function sameLocalDay(a:Date,b:Date){return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();}
/** Repeats are determined across loaded listening events, not across filtered results. */
export function filterHistoryV699(tracks:ReadonlyArray<RecentTrackV672>,options:HistoryFiltersV699,now:Date=new Date()):RecentTrackV672[]{
 const counts=new Map<string,number>();
 for(const t of tracks)counts.set(t.id,(counts.get(t.id)??0)+1);
 const words=normalizeSearch(options.query).split(/\s+/).filter(Boolean);
 const nowTime=now.getTime();
 const filtered=tracks.filter(t=>{
  const time=Date.parse(t.playedAt);if(!Number.isFinite(time))return false;
  if(options.period==='today'&&!sameLocalDay(new Date(time),now))return false;
  if(options.period==='week'&&(time<nowTime-7*86400000||time>nowTime+60000))return false;
  if(options.period==='month'&&(time<nowTime-30*86400000||time>nowTime+60000))return false;
  if(options.mode==='repeated'&&(counts.get(t.id)??0)<2)return false;
  const haystack=normalizeSearch(`${t.title} ${t.artist} ${t.album} ${t.primaryArtist??''}`);
  return words.every(word=>haystack.includes(word));
 }).sort((a,b)=>options.sort==='oldest'?Date.parse(a.playedAt)-Date.parse(b.playedAt):Date.parse(b.playedAt)-Date.parse(a.playedAt));
 if(options.mode!=='unique')return filtered;
 const seen=new Set<string>();return filtered.filter(t=>{if(seen.has(t.id))return false;seen.add(t.id);return true;});
}

/** CSV formula injection protected; no tokens, credentials, or external spreadsheet services. */
function csvCellV699(value:string):string{
 const safe=/^[\s\uFEFF]*[=+@\-\t\r\n]/.test(value)?`'${value}`:value;
 return `"${safe.replace(/"/g,'""')}"`;
}
export function historyCSVV699(tracks:ReadonlyArray<RecentTrackV672>):string{
 const header=['Gespielt am (ISO)','Titel','Künstler','Album','Dauer (Sek.)','Spotify-Link'];
 const rows=tracks.slice(0,V699_MAX_EVENTS).map(t=>[
  t.playedAt,t.title,t.artist,t.album,String(Math.floor(t.durationMs/1000)),t.spotifyUrl
 ]);
 return [header,...rows].map(row=>row.map(csvCellV699).join(';')).join('\r\n')+'\r\n';
}
