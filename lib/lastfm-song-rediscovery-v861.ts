import type {LastFmEventV706} from './lastfm-history-v706';

/** Only recorded Last.fm timestamps; a gap is NOT proof of no listening. */
export type RediscoveryWindowV861=90|180|365;
export type V861Track={key:string;artist:string;title:string;album:string;cover:string|null;plays:number;first:string;last:string};
export type V861Comeback=V861Track&{previous:string;returned:string;gapDays:number;playsSinceReturn:number};
export type V861Dormant=V861Track&{daysSinceLast:number};
export type V861Rediscovery={threshold:RediscoveryWindowV861;events:number;songs:number;first:string|null;last:string|null;comebacks:V861Comeback[];dormant:V861Dormant[]};
const DAY=86_400_000;
const safeText=(s:unknown):s is string=>typeof s==='string'&&s.trim().length>0&&s.length<=400&&!/[\u0000-\u001f\u007f]/.test(s);
const norm=(s:string)=>s.normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('de-AT');
const validIso=(s:unknown):s is string=>typeof s==='string'&&/^20\d\d-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(s)&&Number.isFinite(Date.parse(s))&&new Date(s).toISOString()===s;
type Point={ms:number;event:LastFmEventV706};
function safeEvent(value:LastFmEventV706,now:number):value is LastFmEventV706{
 return Boolean(value&&safeText(value.artist)&&safeText(value.title)&&validIso(value.playedAt)&&Date.parse(value.playedAt)>=946684800000&&Date.parse(value.playedAt)<=now);
}
/** Pure and deterministic for fixed `now`. Bounded by archive input; no network, storage or UI side effects. */
export function buildSongRediscoveryV861(events:readonly LastFmEventV706[],requested:RediscoveryWindowV861=90,now=new Date()):V861Rediscovery{
 const threshold:RediscoveryWindowV861=requested===180||requested===365?requested:90;
 const maximum=Number.isFinite(now.getTime())?now.getTime():Date.now();
 const index=new Map<string,Point[]>();
 let count=0,earliest=Infinity,latest=-Infinity;
 for(const e of Array.isArray(events)?events:[]){
  if(!safeEvent(e,maximum))continue;
  const ms=Date.parse(e.playedAt),key=JSON.stringify([norm(e.artist),norm(e.title)]);
  if(!index.has(key))index.set(key,[]);
  index.get(key)!.push({ms,event:e});count++;earliest=Math.min(earliest,ms);latest=Math.max(latest,ms);
 }
 const comebacks:V861Comeback[]=[],dormant:V861Dormant[]=[];
 for(const [key,points] of index){
  points.sort((a,b)=>a.ms-b.ms);
  // Imported/scrobbled duplicates with the same track and UTC timestamp are one play.
  const unique=points.filter((point,i)=>i===0||point.ms!==points[i-1].ms);
  const first=unique[0],last=unique[unique.length-1];
  const track:V861Track={key,artist:last.event.artist.trim(),title:last.event.title.trim(),album:safeText(last.event.album)?last.event.album:'Album unbekannt',cover:last.event.cover??null,plays:unique.length,first:first.event.playedAt,last:last.event.playedAt};
  let lastGapIndex=-1,lastGapDays=0;
  for(let i=1;i<unique.length;i++){
   const gap=unique[i].ms-unique[i-1].ms;
   if(gap>=threshold*DAY){lastGapIndex=i;lastGapDays=Math.floor(gap/DAY);}
  }
  if(lastGapIndex>=0){
   comebacks.push({...track,previous:unique[lastGapIndex-1].event.playedAt,returned:unique[lastGapIndex].event.playedAt,gapDays:lastGapDays,playsSinceReturn:unique.length-lastGapIndex});
  }
  const daysSinceLast=Math.floor((maximum-last.ms)/DAY);
  if(daysSinceLast>=threshold&&unique.length>=2)dormant.push({...track,daysSinceLast});
 }
 comebacks.sort((a,b)=>b.returned.localeCompare(a.returned)||b.gapDays-a.gapDays||a.key.localeCompare(b.key));
 dormant.sort((a,b)=>b.plays-a.plays||b.daysSinceLast-a.daysSinceLast||a.key.localeCompare(b.key));
 return {threshold,events:count,songs:index.size,first:Number.isFinite(earliest)?new Date(earliest).toISOString():null,last:Number.isFinite(latest)?new Date(latest).toISOString():null,comebacks,dormant};
}
