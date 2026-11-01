import type {LastFmEventV706} from './lastfm-history-v706';
import type {V711TimeZone} from './lastfm-intelligence-v711';
import {availableInsightMonthsV856,calculateMonthlyInsightsV856} from './lastfm-monthly-insights-v856';
import {personalDiscoveryV857} from './lastfm-personal-discovery-v857';

/** V858: a read-only, on-device landing view; all time windows are observed scrobbles, not listening hours. */
export type V858ArtistSpotlight={artist:string;plays:number;share:number};
export type V858Home={
 selected:string;months:string[];hasEvents:boolean;total:number;
 current:{plays:number;artists:number;tracks:number;activeDays:number};
 previous:{plays:number};comparisonPercent:number|null;
 chart:{month:string;plays:number;artists:number;activeDays:number;hasArchivedEntries:boolean}[];
 topArtists:V858ArtistSpotlight[];
 rising:{artist:string;plays:number;changePoints:number}[];
 newcomers:{artist:string;plays:number}[];
 comeback:{artist:string;title:string;gapDays:number;cover:string|null;playedAt:string}|null;
 oldest:string|null;newest:string|null;
};
const dateFormatter:{[zone:string]:Intl.DateTimeFormat}={
 UTC:new Intl.DateTimeFormat('en-CA',{timeZone:'UTC',year:'numeric',month:'2-digit'}),
 'Europe/Vienna':new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Vienna',year:'numeric',month:'2-digit'})
};
function monthOf(ms:number,zone:V711TimeZone){
 const values:Record<string,string>={};
 for(const part of dateFormatter[zone].formatToParts(new Date(ms)))if(part.type!=='literal')values[part.type]=part.value;
 return `${values.year}-${values.month}`;
}
const normalize=(value:string)=>value.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
const valid=(value:unknown):value is string=>typeof value==='string'&&value.trim().length>0&&value.length<=400&&!/[\u0000-\u001f\u007f]/.test(value);
function safeTimestamp(event:LastFmEventV706,now:number){
 if(!event||!valid(event.artist)||!valid(event.title)||typeof event.playedAt!=='string'||!/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(event.playedAt))return null;
 const ms=Date.parse(event.playedAt);
 return Number.isFinite(ms)&&ms>=946684800000&&ms<=now&&new Date(ms).toISOString()===event.playedAt?ms:null;
}
/** Single light scan for default month and artist ranking; reuse V856/V857 validated insights. */
export function buildLastFmDiscoveryHomeV858(events:readonly LastFmEventV706[],requested='',now=new Date(),timeZone:V711TimeZone='Europe/Vienna'):V858Home{
 const zone:V711TimeZone=timeZone==='UTC'?'UTC':'Europe/Vienna';
 const limit=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const source=Array.isArray(events)?events:[];
 let newestMs=0;let oldestMs=Number.POSITIVE_INFINITY;
 const eligible:{month:string;artist:string;key:string;ms:number}[]=[];
 for(const entry of source){
  const ms=safeTimestamp(entry,limit);if(ms===null)continue;
  newestMs=Math.max(newestMs,ms);oldestMs=Math.min(oldestMs,ms);
  eligible.push({month:monthOf(ms,zone),artist:entry.artist.trim(),key:normalize(entry.artist),ms});
 }
 const observedMonths=eligible.length?availableInsightMonthsV856(source,new Date(limit),zone).filter(m=>m<=monthOf(limit,zone)):[];
 const lastObserved=newestMs?monthOf(newestMs,zone):'';
 const selected=/^20\d{2}-(0[1-9]|1[0-2])$/.test(requested)&&requested<=monthOf(limit,zone)?requested:lastObserved;
 if(!selected)return {selected:'',months:[],hasEvents:false,total:0,current:{plays:0,artists:0,tracks:0,activeDays:0},previous:{plays:0},comparisonPercent:null,chart:[],topArtists:[],rising:[],newcomers:[],comeback:null,oldest:null,newest:null};
 const monthly=calculateMonthlyInsightsV856(source,selected,new Date(limit),zone);
 const discovery=personalDiscoveryV857(source,selected,new Date(limit),zone);
 const months=[...new Set([...observedMonths,...monthly.months.map(m=>m.month)])].sort((a,b)=>b.localeCompare(a));
 const artists=new Map<string,{artist:string;plays:number;latest:number}>();
 for(const e of eligible){
  if(e.month!==selected)continue;
  const previous=artists.get(e.key);
  artists.set(e.key,{artist:e.ms>=(previous?.latest??0)?e.artist:previous?.artist??e.artist,plays:(previous?.plays??0)+1,latest:Math.max(previous?.latest??0,e.ms)});
 }
 const current=monthly.current;
 const topArtists=[...artists.values()].sort((a,b)=>b.plays-a.plays||a.artist.localeCompare(b.artist)).slice(0,5).map(a=>({artist:a.artist,plays:a.plays,share:current.plays?a.plays/current.plays:0}));
 return {
  selected,months,hasEvents:true,total:monthly.sourceCount,
  current:{plays:current.plays,artists:current.artists,tracks:current.tracks,activeDays:current.activeDays},
  previous:{plays:monthly.previous.plays},comparisonPercent:monthly.change,
  chart:monthly.months.map(m=>({month:m.month,plays:m.plays,artists:m.artists,activeDays:m.activeDays,hasArchivedEntries:Boolean(monthly.earliest&&m.month>=monthOf(oldestMs,zone))})),
  topArtists,rising:discovery.artists.slice(0,3).map(a=>({artist:a.artist,plays:a.plays,changePoints:a.changePoints})),
  newcomers:discovery.newArtists.slice(0,3).map(a=>({artist:a.artist,plays:a.plays})),
  comeback:monthly.rediscovered[0]?{artist:monthly.rediscovered[0].artist,title:monthly.rediscovered[0].title,gapDays:monthly.rediscovered[0].gapDays,cover:monthly.rediscovered[0].cover,playedAt:monthly.rediscovered[0].rediscoveredAt}:null,
  oldest:monthly.earliest,newest:monthly.latest
 };
}
