/** V325: deterministic, track-scoped and opt-in two-dancer formation timeline.
 * Coordinates are stage-group positions; no model/IK/clip keyframes are touched. */
import {protectEnsembleLanesV324,type EnsemblePointV324,type EnsembleRoleV324} from './adaptiveEnsembleBalanceV324';
export type FormationV325='line'|'wide'|'diagonal'|'close';
export type SnapV325='off'|'beat'|'bar';
export interface EnsembleKeyframeV325 {
 id:string; at:number; formation:FormationV325; role:EnsembleRoleV324; leadX:number;partnerX:number;leadZ:number;partnerZ:number;
 transition:number; drop:boolean;
}
export interface EnsembleTimelineV325 {enabled:boolean; songSync:boolean;trackId:string; bpm:number;snap:SnapV325;keyframes:EnsembleKeyframeV325[];}
export const ENSEMBLE_TIMELINE_KEY_V325='sonic-ensemble-choreography-v325';
export const ENSEMBLE_TIMELINE_EVENT_V325='sonic:ensemble-choreography-change-v325';
export const ENSEMBLE_TIMELINE_DEFAULT_V325:EnsembleTimelineV325={
 enabled:false,songSync:false,trackId:'',bpm:128,snap:'bar',keyframes:[
  {id:'intro',at:0,formation:'line',role:'together',leadX:-.95,partnerX:.95,leadZ:0,partnerZ:-.45,transition:.7,drop:false},
  {id:'solo',at:8,formation:'diagonal',role:'lead-solo',leadX:-1.04,partnerX:1.04,leadZ:.32,partnerZ:-.55,transition:.9,drop:false},
  {id:'drop',at:16,formation:'wide',role:'together',leadX:-1.5,partnerX:1.5,leadZ:0,partnerZ:0,transition:.65,drop:true},
 ]};
const finite=(value:unknown, fallback:number)=>typeof value==='number'&&Number.isFinite(value)?value:fallback;
const bound=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
const round=(v:number)=>Math.round(v*1000)/1000;
const string=(v:unknown,max=80)=>typeof v==='string'?v.slice(0,max):'';
const form=(v:unknown):FormationV325=>v==='wide'||v==='diagonal'||v==='close'?v:'line';
const role=(v:unknown):EnsembleRoleV324=>v==='lead-solo'||v==='partner-solo'?v:'together';
export function normalizeEnsembleTimelineV325(value:unknown):EnsembleTimelineV325 {
 const r=value&&typeof value==='object'&&!Array.isArray(value)?value as Partial<EnsembleTimelineV325>:{};
 const raw=Array.isArray(r.keyframes)?r.keyframes:ENSEMBLE_TIMELINE_DEFAULT_V325.keyframes;
 const cues=raw.slice(0,64).map((v,i)=>{
  const k=v&&typeof v==='object'?v as Partial<EnsembleKeyframeV325>:{};
  const leadX=round(bound(finite(k.leadX,-.95),-4,-.7));
  const partnerX=round(bound(finite(k.partnerX,.95),.7,4));
  return {id:string(k.id,40)||`cue-${i}`,at:round(bound(finite(k.at,0),0,3600)),formation:form(k.formation),role:role(k.role),
   leadX,partnerX,leadZ:round(bound(finite(k.leadZ,0),-2,2)),partnerZ:round(bound(finite(k.partnerZ,-.45),-2,2)),
   transition:round(bound(finite(k.transition,.65),0,8)),drop:k.drop===true};
 }).sort((a,b)=>a.at-b.at);
 const seen=new Set<string>();for(const k of cues){if(seen.has(k.id))k.id=`cue-${seen.size}-${k.at}`;seen.add(k.id);}
 return {enabled:r.enabled===true,songSync:r.songSync===true,trackId:string(r.trackId,200),bpm:round(bound(finite(r.bpm,128),40,240)),
  snap:r.snap==='off'?'off':r.snap==='beat'?'beat':'bar',keyframes:cues};
}
export function readEnsembleTimelineV325():EnsembleTimelineV325 {
 if(typeof window==='undefined')return normalizeEnsembleTimelineV325(ENSEMBLE_TIMELINE_DEFAULT_V325);
 try{return normalizeEnsembleTimelineV325(JSON.parse(window.localStorage.getItem(ENSEMBLE_TIMELINE_KEY_V325)||'null'));}
 catch{return normalizeEnsembleTimelineV325(ENSEMBLE_TIMELINE_DEFAULT_V325);}
}
export function writeEnsembleTimelineV325(value:unknown):EnsembleTimelineV325 {
 const clean=normalizeEnsembleTimelineV325(value);
 if(typeof window!=='undefined'){
  try{window.localStorage.setItem(ENSEMBLE_TIMELINE_KEY_V325,JSON.stringify(clean));}catch{/* quota/private */}
  window.dispatchEvent(new Event(ENSEMBLE_TIMELINE_EVENT_V325));
 }
 return clean;
}
export function canPlayEnsembleTimelineV325(timeline:EnsembleTimelineV325,currentTrackId?:string):boolean {
 return timeline.enabled&&timeline.keyframes.length>0&&(!timeline.songSync||Boolean(timeline.trackId&&timeline.trackId===currentTrackId));
}
export interface EnsemblePoseV325 {lead:EnsemblePointV324;partner:EnsemblePointV324;role:EnsembleRoleV324;formation:FormationV325;drop:boolean;cueId:string;time:number;blend:number;}
function positions(k:EnsembleKeyframeV325):{lead:EnsemblePointV324;partner:EnsemblePointV324} {
 const safe=protectEnsembleLanesV324([k.leadX,0,k.leadZ],[k.partnerX,0,k.partnerZ],1.4,true);
 return {lead:safe.lead,partner:safe.partner};
}
const ease=(t:number)=>t*t*(3-2*t);
/** Evaluates on absolute seconds, without history: scrubbing/replay/seeking deterministic. */
export function evaluateEnsembleTimelineV325(timeline:EnsembleTimelineV325,seconds:number):EnsemblePoseV325|null {
 const cues=timeline.keyframes;if(!cues.length)return null;
 const time=bound(finite(seconds,0),0,3600);
 let index=0;for(let i=1;i<cues.length;i++){if(cues[i].at>time)break;index=i;}
 const current=cues[index],prev=cues[Math.max(0,index-1)];
 const target=positions(current),origin=positions(prev);
 const secondsSince=time-current.at;
 const blend=index===0||current.transition===0?1:ease(bound(secondsSince/current.transition,0,1));
 const lerp=(a:EnsemblePointV324,b:EnsemblePointV324):EnsemblePointV324=>[
  round(a[0]+(b[0]-a[0])*blend),0,round(a[2]+(b[2]-a[2])*blend)];
 const p=protectEnsembleLanesV324(lerp(origin.lead,target.lead),lerp(origin.partner,target.partner),1.4,true);
 return {lead:p.lead,partner:p.partner,role:current.role,formation:current.formation,drop:current.drop,cueId:current.id,time,blend};
}
export function gridMarkersV325(bpm:number,meter:number,duration:number,beats:readonly number[],bars:readonly number[],mode:SnapV325):number[] {
 if(mode==='off')return [];
 const external=mode==='beat'?beats:bars;
 const valid=[...external].filter(t=>Number.isFinite(t)&&t>=0&&t<=3600).sort((a,b)=>a-b).filter((x,i,all)=>i===0||x>all[i-1]);
 if(valid.length)return valid.slice(0,4500);
 const step=60/bound(finite(bpm,128),40,240)*(mode==='bar'?bound(finite(meter,4),1,12):1);
 return Array.from({length:Math.min(4500,Math.floor(bound(finite(duration,120),1,3600)/step)+1)},(_,i)=>round(i*step));
}
export function snapEnsembleSecondV325(time:number,markers:readonly number[],mode:SnapV325,imported:boolean):number {
 const at=round(bound(finite(time,0),0,3600));if(mode==='off'||markers.length===0)return at;
 let low=0,high=markers.length;while(low<high){const mid=(low+high)>>>1;if(markers[mid]<at)low=mid+1;else high=mid;}
 const a=markers[Math.max(0,low-1)],b=markers[Math.min(markers.length-1,low)],closest=Math.abs(at-a)<=Math.abs(at-b)?a:b;
 // Never snap a late cue all the way back to the end of a partial imported analysis.
 if(imported&&Math.abs(closest-at)>4)return at;
 return round(closest);
}
export function updateEnsembleKeyframeV325(timeline:EnsembleTimelineV325,id:string,patch:Partial<EnsembleKeyframeV325>):EnsembleTimelineV325 {
 return normalizeEnsembleTimelineV325({...timeline,keyframes:timeline.keyframes.map(k=>k.id===id?{...k,...patch,id:k.id}:k)});
}
