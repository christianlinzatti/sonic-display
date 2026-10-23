import type {Lyrics} from "@/types/music";
import type {RapDuetAssignmentV416} from "./rapDuetStudioV416";
import {normalizeRapDuetAssignmentsV416} from "./rapDuetStudioV416";

/** Camera-stage fallback, never speaker recognition or inferred singing identities.
 * A single primary visual performer is used for verses, and repeated phrases MAY
 * signal hook framing for the whole group. Only applied with no authored V416 cast. */
export function inferRapCameraScenesV436(lyrics:Lyrics|null|undefined,avatarCount:number):RapDuetAssignmentV416[]{
  if(!lyrics?.synced||!Array.isArray(lyrics.lines)||!Number.isFinite(avatarCount)||avatarCount<2)return [];
  const lines=lyrics.lines.slice(0,5000);
  if(!lines.some(line=>typeof line?.text==="string"&&line.text.trim()&&
    typeof line.startMs==="number"&&Number.isFinite(line.startMs)&&line.startMs>=0))return [];
  const result:RapDuetAssignmentV416[]=[{fromLine:0,toLine:lines.length-1,
    leadSlot:0,partnerSlot:1,style:"solo",strength:65}];
  const normalized=lines.map(line=>typeof line?.text==="string"?
    line.text.toLocaleLowerCase("de").replace(/[^\p{L}\p{N}]+/gu," ").trim():"");
  const positions=new Map<string,number[]>();
  for(let i=0;i<normalized.length;i++){
    const key=normalized[i];
    if(key.length<10)continue; // short interjections are weak hook evidence
    const match=positions.get(key)??[];
    if(match.length<16)match.push(i);
    positions.set(key,match);
  }
  const possibleHook=new Array(lines.length).fill(false) as boolean[];
  for(let i=0;i<normalized.length;i++){
    const xs=positions.get(normalized[i]);
    if(xs?.some(j=>Math.abs(j-i)>=4))possibleHook[i]=true;
  }
  // Group at least two repeated lyric lines, avoid isolated repeated words.
  let i=0;
  while(i<possibleHook.length&&result.length<140){
    if(!possibleHook[i]){i++;continue;}
    const first=i;
    while(i<possibleHook.length&&possibleHook[i]&&i-first<32)i++;
    const last=i-1;
    if(last-first>=1)result.push({fromLine:first,toLine:last,leadSlot:0,
      partnerSlot:1,style:"hook",strength:70});
  }
  return result;
}

/** Explicit casts take priority over all inferred staging. */
export function cameraSceneAssignmentsV436(input:{
  lyrics:Lyrics|null|undefined;authored:unknown;avatarCount:number;autoEnabled:boolean;
}):{assignments:RapDuetAssignmentV416[];inferred:boolean}{
  const count=input.lyrics?.lines?.length??0;
  const manual=normalizeRapDuetAssignmentsV416(input.authored,count);
  if(manual.length||!input.autoEnabled)return {assignments:manual,inferred:false};
  const fallback=inferRapCameraScenesV436(input.lyrics,input.avatarCount);
  return {assignments:fallback,inferred:fallback.length>0};
}
