/** V442: Song-credit-based 3/4-avatar stage planner. Credits are NOT voice diarization. */
import {layoutV326,type GroupStudioV326,type GroupCueV326,type GroupFormationV326} from './multiAvatarStageDirectorV326';

export type MultiArtistCountV442=1|2|3|4;
export interface MultiArtistCastV442 {
  enabled:boolean;count:MultiArtistCountV442;artists:string[];
  reason:'multi-artist'|'fallback'|'manual-stage'|'disabled';
}
export interface MultiArtistLyricsV442 {synced:boolean;lines:readonly {startMs:number;text?:string}[]}
export function planMultiArtistCastV442(input:{artists:readonly string[];maxCount?:number;enabled:boolean;
  avatarStage:boolean;reducedMotion:boolean;manualMode:boolean;manualGroup?:boolean}):MultiArtistCastV442{
  const artists:string[]=[];const seen=new Set<string>();
  for(const value of input.artists.slice(0,32)){
    if(typeof value!=='string')continue;
    const name=value.trim().replace(/\s+/g,' ').slice(0,140);
    if(!name||seen.has(name.toLocaleLowerCase()))continue;
    seen.add(name.toLocaleLowerCase());artists.push(name);
  }
  if(input.manualMode||input.manualGroup)return {enabled:false,count:1,artists,reason:'manual-stage'};
  if(!input.enabled||!input.avatarStage||input.reducedMotion)return {enabled:false,count:1,artists,reason:'disabled'};
  const max=input.maxCount===2?2:input.maxCount===3?3:4;
  const count=Math.min(max,artists.length,4);
  if(count<3)return {enabled:false,count:1,artists,reason:'fallback'};
  return {enabled:true,count:count as 3|4,artists,reason:'multi-artist'};
}

function cleanLine(value:string|undefined):string {
  return typeof value==='string'?value.toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu,' ').trim():'';
}
function hookLineIndexes(lyrics:MultiArtistLyricsV442|null|undefined):Set<number>{
  const hooks=new Set<number>();if(!lyrics?.synced)return hooks;
  const lines=lyrics.lines.slice(0,5000),normalized=lines.map(l=>cleanLine(l.text));
  const positions=new Map<string,number[]>();
  normalized.forEach((key,i)=>{if(key.length<10)return;const hits=positions.get(key)??[];if(hits.length<16)hits.push(i);positions.set(key,hits);});
  const match=normalized.map((key,i)=>key.length>=10&&Boolean(positions.get(key)?.some(j=>Math.abs(i-j)>=4)));
  // Require at least two adjacent repeated lines, never a repeated single word.
  for(let i=0;i<match.length;i++)if(match[i]&&(match[i-1]||match[i+1]))hooks.add(i);
  return hooks;
}
/** The same four-lyric-line phrase boundaries used by inferred V416 camera cuts. */
export function multiArtistPhraseAtV442(lyrics:MultiArtistLyricsV442|null|undefined,progressMs:number,fallback:number):number{
  if(!lyrics?.synced||!lyrics.lines.length||!Number.isFinite(progressMs))return Math.max(0,Math.floor(Number.isFinite(fallback)?fallback:0));
  let lo=0,hi=Math.min(5000,lyrics.lines.length)-1,found=-1;
  while(lo<=hi){const mid=(lo+hi)>>1,ms=lyrics.lines[mid]?.startMs;
    if(typeof ms==='number'&&Number.isFinite(ms)&&ms<=progressMs){found=mid;lo=mid+1;}else hi=mid-1;
  }
  return Math.max(0,Math.floor(found/4));
}
export function featureFocusV442(input:{count:number;phrase:number;scene?:string;progressMs?:number}):{focus:number;group:boolean}{
  const count=Math.min(4,Math.max(1,Math.floor(Number.isFinite(input.count)?input.count:1)));
  const phrase=Math.max(0,Math.floor(Number.isFinite(input.phrase)?input.phrase:0));
  const group=input.scene==='hook'||input.scene==='duet';
  return {focus:group?-1:phrase%count,group};
}
/** Scene plan compatible with the existing V326 GroupDancers. Never stored automatically. */
export function planMultiArtistGroupV442(input:{trackId:string;count:3|4;lyrics?:MultiArtistLyricsV442|null;
  bpm?:number|null;modelIds?:readonly string[]}):GroupStudioV326 {
  const count=input.count;
  const hooks=hookLineIndexes(input.lyrics);
  const rows=input.lyrics?.synced?input.lyrics.lines.slice(0,5000):[];
  const cues:GroupCueV326[]=[];
  const make=(index:number,at:number,hook:boolean):GroupCueV326=>{
    const focus=featureFocusV442({count,phrase:index,scene:hook?'hook':'verse'}).focus;
    const formation:GroupFormationV326=hook?'wide':index%3===1?'stagger':index%3===2?'arc':'line';
    const base=layoutV326(formation,count);
    return {id:`auto-v442-${index}-${Math.round(at*1000)}`,at:Math.max(0,Math.min(3600,Math.round(at*1000)/1000)),
      focus,drop:hook,formation,transition:index===0?0:.65,positions:base};
  };
  cues.push(make(0,0,false));
  const phrases=Math.min(63,Math.ceil(rows.length/4));
  for(let p=0;p<phrases;p++){
    const first=p*4,ms=rows[first]?.startMs;
    if(!Number.isFinite(ms)||ms===undefined||ms<0)continue;
    const hook=Array.from({length:4},(_,i)=>hooks.has(first+i)).filter(Boolean).length>=2;
    const at=Math.max(0,ms/1000);
    if(p===0&&at<.2){cues[0]=make(0,0,hook);continue;}
    cues.push(make(p===0?0:p,at,hook));
  }
  cues.sort((a,b)=>a.at-b.at);
  return {enabled:true,count,songSync:true,trackId:input.trackId.slice(0,200),
    bpm:Number.isFinite(input.bpm)&&input.bpm!>0?Math.min(240,Math.max(40,Math.round(input.bpm!))):128,
    snap:'off',minSpacing:1.12,modelIds:Array.from({length:4},(_,i)=>typeof input.modelIds?.[i]==='string'?input.modelIds![i].slice(0,200):''),cues};
}
/** Only inferred V416 camera assignments may be rotated; authored roles always win. */
export function featureCameraAssignmentsV442<T extends {fromLine:number;toLine:number;leadSlot:number;
  partnerSlot:number;style:string;strength:number}>(existing:readonly T[],lyrics:MultiArtistLyricsV442|null|undefined,count:3|4):T[]{
  if(!lyrics?.synced||!lyrics.lines.length||!existing.length)return [...existing];
  const limit=Math.min(lyrics.lines.length,5000),hooks=existing.filter(x=>x.style==='hook');
  const ordinary=existing.filter(x=>x.style!=='hook');const inserts:T[]=[];
  const budget=Math.min(110,Math.max(0,150-existing.length));
  for(let i=0;i<limit&&inserts.length<budget;i+=4){
    const lead=Math.floor(i/4)%count;
    inserts.push({fromLine:i,toLine:Math.min(limit-1,i+3),leadSlot:lead,
      partnerSlot:(lead+1)%count,style:'solo',strength:65} as T);
  }
  return [...ordinary,...inserts,...hooks].slice(0,150);
}
