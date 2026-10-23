/** V411: deterministic, source-independent editor timeline (seconds are preview time). */
export type RapTimelineSectionV411="verse"|"hook";
export type RapTimelineItemV411={id:string;motionId:string;durationSec:number;crossfadeSec:number;rapGain:number;section:RapTimelineSectionV411};
export type RapTimelineScheduledV411=RapTimelineItemV411&{startSec:number;endSec:number;blendOutSec:number};
export type RapTimelineSampleV411={id:string;motionId:string;section:RapTimelineSectionV411;rapGain:number;localSec:number;weight:number};
export const RAP_TIMELINE_MAX_V411=12;
const finite=(n:unknown,fallback:number)=>typeof n==="number"&&Number.isFinite(n)?n:fallback;
const bound=(n:unknown,min:number,max:number,fallback:number)=>Math.max(min,Math.min(max,finite(n,fallback)));

/** Safe persisted representation: references motion IDs, never untrusted URLs or file contents. */
export function normalizeRapTimelineV411(raw:unknown):RapTimelineItemV411[]{
  if(!Array.isArray(raw))return [];
  const ids=new Set<string>();const out:RapTimelineItemV411[]=[];
  for(const entry of raw.slice(0,48)){
    if(!entry||typeof entry!=="object")continue;
    const r=entry as Partial<RapTimelineItemV411>;
    const id=typeof r.id==="string"&&/^[a-zA-Z0-9_-]{1,64}$/.test(r.id)?r.id:"";
    const motionId=typeof r.motionId==="string"&&r.motionId.length<=256&&/^(embedded:\d+|installed:[\w.-]+|configured:active)$/.test(r.motionId)?r.motionId:"";
    if(!id||ids.has(id)||!motionId)continue;
    ids.add(id);
    out.push({id,motionId,durationSec:bound(r.durationSec,1,30,6),crossfadeSec:bound(r.crossfadeSec,0,4,.5),rapGain:bound(r.rapGain,0,150,100),section:r.section==="hook"?"hook":"verse"});
    if(out.length>=RAP_TIMELINE_MAX_V411)break;
  }
  return out;
}
export function scheduleRapTimelineV411(items:ReadonlyArray<RapTimelineItemV411>):{segments:RapTimelineScheduledV411[];duration:number}{
  const safe=normalizeRapTimelineV411(items);
  const segments:RapTimelineScheduledV411[]=[];
  let end=0;
  for(let i=0;i<safe.length;i++){
    const item=safe[i];
    // Never crossfade more than half of either neighbor; all slots stay seekable.
    const overlap=i<safe.length-1?Math.min(item.crossfadeSec,item.durationSec*.5,safe[i+1].durationSec*.5):0;
    const start=i===0?0:end-(segments[i-1]?.blendOutSec??0);
    end=start+item.durationSec;
    segments.push({...item,startSec:start,endSec:end,blendOutSec:overlap});
  }
  return {segments,duration:end};
}
const smooth=(p:number)=>{const x=Math.max(0,Math.min(1,p));return x*x*(3-2*x);};
/** A reproducible frame, safe for pauses, loops, seeks and crossfade boundaries. */
export function sampleRapTimelineV411(items:ReadonlyArray<RapTimelineItemV411>,time:number,loop=true):{time:number;duration:number;section:RapTimelineSectionV411;active:RapTimelineSampleV411[]}{
  const {segments,duration}=scheduleRapTimelineV411(items);
  if(!segments.length)return {time:0,duration:0,section:"verse",active:[]};
  const t=Number.isFinite(time)?time:0;
  const position=loop?((t%duration)+duration)%duration:Math.max(0,Math.min(duration,t));
  const active=segments.filter((s,i)=>position>=s.startSec&&(position<s.endSec||i===segments.length-1&&position===duration));
  const sampled=active.map(s=>{
    let weight=1;
    if(s.blendOutSec>0&&position>=s.endSec-s.blendOutSec)weight=1-smooth((position-(s.endSec-s.blendOutSec))/s.blendOutSec);
    const index=segments.indexOf(s);
    if(index>0){const prior=segments[index-1];if(position<prior.endSec&&prior.blendOutSec>0)weight=smooth((position-s.startSec)/prior.blendOutSec);}
    return {id:s.id,motionId:s.motionId,section:s.section,rapGain:s.rapGain,localSec:Math.max(0,position-s.startSec),weight};
  });
  const total=sampled.reduce((n,s)=>n+s.weight,0);
  const weighted=total>0?sampled.map(s=>({...s,weight:s.weight/total})):sampled;
  const dominant=weighted.reduce<RapTimelineSampleV411|null>((best,s)=>!best||s.weight>=best.weight?s:best,null);
  return {time:position,duration,section:dominant?.section??"verse",active:weighted};
}
export function moveRapTimelineItemV411(items:ReadonlyArray<RapTimelineItemV411>,index:number,delta:number):RapTimelineItemV411[]{
  const copy=normalizeRapTimelineV411(items);const target=index+delta;
  if(index>=0&&index<copy.length&&target>=0&&target<copy.length){const [item]=copy.splice(index,1);copy.splice(target,0,item);}
  return copy;
}
export function appendRapTimelineItemV411(items:ReadonlyArray<RapTimelineItemV411>,motionId:string,section:RapTimelineSectionV411="verse"):RapTimelineItemV411[]{
  const safe=normalizeRapTimelineV411(items);
  if(safe.length>=RAP_TIMELINE_MAX_V411)return safe;
  const used=new Set(safe.map(s=>s.id));let index=1;while(used.has(`clip${index}`))index++;
  return normalizeRapTimelineV411([...safe,{id:`clip${index}`,motionId,durationSec:6,crossfadeSec:.6,rapGain:100,section}]);
}
