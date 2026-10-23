import type {Lyrics} from "@/types/music";
import {sampleRapGestureV414,anchorRapGestureV414,type RapGestureDocumentV414} from "./rapGestureCuesV414";
import {resolveRapDuetCueV416,type RapDuetAssignmentV416} from "./rapDuetStudioV416";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";

/** Tracks are independent. A positive offset samples later source material earlier in playback.
 * These are AUTHORING predictions, never measurements of rendered-frame or audio latency. */
export type RapTimingOffsetsV418={mouthMs:number;gestureMs:number;roleMs:number};
export type RapTimingLaneV418="lyrics"|"mouth"|"gesture"|"roles";
export type RapTimingEventV418={id:string;lane:RapTimingLaneV418;startMs:number;endMs:number;label:string;source:"word"|"line"|"authored"|"estimated"};
export const DEFAULT_RAP_TIMING_V418:RapTimingOffsetsV418={mouthMs:0,gestureMs:0,roleMs:0};
const finite=(n:unknown):n is number=>typeof n==="number"&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>finite(n)?Math.max(lo,Math.min(hi,n)):lo;
const offset=(n:number,lo:number,hi:number)=>finite(n)?Math.round(clamp(n,lo,hi)):0;
export function normalizeRapTimingOffsetsV418(input:Partial<RapTimingOffsetsV418>|null|undefined):RapTimingOffsetsV418{
 return {mouthMs:offset(input?.mouthMs??0,-150,150),gestureMs:offset(input?.gestureMs??0,-250,250),roleMs:offset(input?.roleMs??0,-250,250)};
}
export function effectiveRapTimingOffsetV418(enabled:boolean,value:number,limit=250):number{
 return enabled?offset(value,-limit,limit):0;
}
type Input={lyrics:Lyrics|null|undefined;doc?:RapGestureDocumentV414|null;trackId?:string;avatarId?:string;
 assignments?:readonly RapDuetAssignmentV416[];count:number;offsets?:Partial<RapTimingOffsetsV418>;
 startMs:number;endMs:number;includeMouth?:boolean;includeGestures?:boolean;includeRoles?:boolean};
/** Bounded, read-only timeline: line and word timestamps are ground truth supplied by the provider;
 * other lanes visualize planned actions from existing saved cues and independent offsets. */
export function buildRapTimingTimelineV418(input:Input):RapTimingEventV418[]{
 const {lyrics}=input;if(!lyrics?.synced||!Array.isArray(lyrics.lines))return [];
 const o=normalizeRapTimingOffsetsV418(input.offsets);
 const a=clamp(input.startMs,0,3.6e7),b=clamp(input.endMs,a,3.6e7);
 if(b<=a)return [];
 const out:RapTimingEventV418[]=[];
 const push=(event:RapTimingEventV418)=>{
  if(finite(event.startMs)&&finite(event.endMs)&&event.startMs<event.endMs&&event.startMs<b&&event.endMs>a&&out.length<500)out.push(event);
 };
 const lines=lyrics.lines;
 for(let i=0;i<lines.length&&out.length<470;i++){
  const line=lines[i],next=lines[i+1];
  if(!finite(line.startMs)||line.startMs<0||!line.text?.trim())continue;
  const lineEnd=Math.min(finite(line.endMs)&&line.endMs>line.startMs?line.endMs:Infinity,
    finite(next?.startMs)&&next.startMs>line.startMs?next.startMs:Infinity,line.startMs+14000);
  if(!(lineEnd>line.startMs))continue;
  push({id:`line:${i}`,lane:"lyrics",startMs:line.startMs,endMs:lineEnd,label:`Zeile ${i+1}: ${line.text.slice(0,65)}`,source:"line"});
  for(let j=0;j<(line.words?.length??0)&&j<130&&out.length<470;j++){
   const word=line.words![j];
   if(!word.text?.trim()||!finite(word.startMs)||word.startMs<line.startMs||word.startMs>=lineEnd)continue;
   const end=Math.min(finite(word.endMs)&&word.endMs>word.startMs?word.endMs:Infinity,
     finite(line.words?.[j+1]?.startMs)&&line.words![j+1].startMs>word.startMs?line.words![j+1].startMs:Infinity,
     lineEnd,word.startMs+1500);
   if(!(end>word.startMs))continue;
   push({id:`word:${i}:${j}`,lane:"lyrics",startMs:word.startMs,endMs:end,label:word.text,source:"word"});
   if(input.includeMouth!==false)push({id:`mouth:${i}:${j}`,lane:"mouth",startMs:word.startMs-o.mouthMs,
     endMs:end-o.mouthMs,label:`Mund-Schätzung: ${word.text}`,source:"estimated"});
  }
 }
 const doc=input.doc;
 if(input.includeGestures!==false&&doc&&doc.trackId===input.trackId&&doc.avatarId===input.avatarId){
  for(const cue of doc.cues.slice(0,160)){
   const anchor=anchorRapGestureV414(lyrics,cue.lineIndex,cue.wordIndex);
   if(anchor===null||Math.abs(anchor-cue.startMs)>5)continue;
   push({id:`gesture:${cue.lineIndex}:${cue.wordIndex}`,lane:"gesture",
    startMs:anchor-o.gestureMs,endMs:anchor-o.gestureMs+clamp(cue.durationMs,120,1500),
    label:`${cue.kind==="head"?"Kopf":cue.kind==="arms"?"Arme":"Kopf + Arme"} · ${cue.strength}%`,source:"authored"});
  }
 }
 if(input.includeRoles!==false&&input.count>=2){
  for(let i=0;i<Math.min(input.assignments?.length??0,150);i++){
   const cue=input.assignments![i],start=lines[cue.fromLine]?.startMs;
   const after=lines[cue.toLine+1]?.startMs,last=lines[cue.toLine]?.endMs;
   const end=finite(after)?after:finite(last)?last:null;
   if(!finite(start)||!finite(end)||end<=start||cue.leadSlot<0||cue.leadSlot>=input.count||
     (cue.style==="reply"||cue.style==="duet")&&(cue.partnerSlot<0||cue.partnerSlot>=input.count||cue.partnerSlot===cue.leadSlot))continue;
   push({id:`role:${i}`,lane:"roles",startMs:start-o.roleMs,endMs:end-o.roleMs,
     label:`${cue.style} · Avatar ${cue.leadSlot+1}${cue.style==="reply"||cue.style==="duet"?` + ${cue.partnerSlot+1}`:""}`,source:"authored"});
  }
 }
 return out.sort((x,y)=>x.startMs-y.startMs||x.id.localeCompare(y.id));
}
export function sampleRapTimingV418(input:{lyrics:Lyrics|null|undefined;ms:number;offsets?:Partial<RapTimingOffsetsV418>;
 doc?:RapGestureDocumentV414|null;trackId?:string;avatarId?:string;allowedMotionIds?:readonly string[];
 assignments?:readonly RapDuetAssignmentV416[];count:number;reducedMotion?:boolean}){
 const o=normalizeRapTimingOffsetsV418(input.offsets),time=finite(input.ms)?Math.max(0,input.ms):0;
 const word=input.lyrics?.synced?rapLipWordAtV415(input.lyrics,time+o.mouthMs):null;
 const gesture=sampleRapGestureV414(input.lyrics,input.doc,input.trackId,input.avatarId,time,true,!!input.reducedMotion,o.gestureMs,[...(input.allowedMotionIds??[])]);
 const role=resolveRapDuetCueV416({lyrics:input.lyrics,progressMs:time+o.roleMs,playing:true,
  count:input.count,enabled:input.count>=2,assignments:input.assignments??[],reducedMotion:!!input.reducedMotion});
 // A deterministic word-envelope demonstration, NOT the actual V415 facial-rig output.
 const onset=word?Math.max(0,time+o.mouthMs-word.start):0;
 const duration=word?Math.max(1,word.end-word.start):1;
 const fraction=clamp(onset/duration,0,1);
 const bilabial=word?/^[bmp]/iu.test(word.word.text.trim()):false;
 const closure=bilabial?Math.max(0,1-onset/Math.min(70,duration*.3)):0;
 const jaw=word?clamp((.12+.63*Math.sin(Math.PI*fraction))*(1-closure*.94),0,1):0;
 return {word:word?.word.text??null,wordSource:word?"word-timed" as const:input.lyrics?.synced?"line-only-or-gap" as const:"none" as const,
  mouthPreview:jaw,closurePreview:closure,gesture,role};
}
