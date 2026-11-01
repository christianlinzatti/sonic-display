import {normalizeVocalTimeSegmentsV496,type VocalTimeRoleV547,type VocalTimeSegmentV496} from './vocalTimeDirectorV496';
import type {VocalProposalV660} from './smartVocalAssignmentV660';

/** An edit is a deliberate editorial stage direction, never acoustic voice identification. */
export type VocalReviewEditV756={leadSlot:number;role:VocalTimeRoleV547;style:'solo'|'duet'|'hook';partnerSlot:number;singerSlots:number[]};
export type VocalReviewStatusV756='ready'|'conflict'|'invalid';
export type VocalReviewItemV756={segment:VocalTimeSegmentV496|null;status:VocalReviewStatusV756;conflicts:number;reason:string};
export type VocalReviewResultV756={segments:VocalTimeSegmentV496[];added:number;replaced:number;skipped:number;preserved:number};
const MAX=120;
const MAX_MS=4*60*60*1000;
const clashes=(a:VocalTimeSegmentV496,b:VocalTimeSegmentV496)=>a.startMs<b.endMs&&b.startMs<a.endMs&&
 (a.roleV547!=='adlib'&&b.roleV547!=='adlib'||a.roleV547==='adlib'&&b.roleV547==='adlib'&&a.leadSlot===b.leadSlot);
const validCount=(n:number)=>Number.isInteger(n)&&n>=2&&n<=4;
export function defaultVocalReviewEditV756(source:VocalProposalV660):VocalReviewEditV756{
 const s=source.segment;
 return {leadSlot:s.leadSlot,role:s.roleV547??(s.style==='hook'?'hook':'verse'),style:s.style,
  partnerSlot:s.partnerSlot,singerSlots:s.singerSlotsV547?.slice()??(s.style==='duet'?[s.leadSlot,s.partnerSlot]:[s.leadSlot])};
}
/** Never fix malformed edits by silently selecting a different singer. */
export function buildVocalReviewV756(input:{proposal:VocalProposalV660;edit:VocalReviewEditV756;count:number;durationMs:number;existing:unknown}):VocalReviewItemV756{
 const {proposal,edit,count,durationMs}=input;
 const invalid=(reason:string):VocalReviewItemV756=>({segment:null,status:'invalid',conflicts:0,reason});
 if(!validCount(count)||!Number.isSafeInteger(durationMs)||durationMs<=0||durationMs>MAX_MS||
  !proposal||!proposal.segment||!edit||!Number.isInteger(edit.leadSlot)||edit.leadSlot<0||edit.leadSlot>=count||
  !Number.isInteger(edit.partnerSlot)||edit.partnerSlot<0||edit.partnerSlot>=count||
  !['verse','feature','hook','adlib'].includes(edit.role)||!['solo','duet','hook'].includes(edit.style)||
  !Array.isArray(edit.singerSlots)||edit.singerSlots.length<1||edit.singerSlots.length>count||
  new Set(edit.singerSlots).size!==edit.singerSlots.length||edit.singerSlots.some(s=>!Number.isInteger(s)||s<0||s>=count))return invalid('Ungültige Sängerrollen oder Avatar-Slots');
 const style=edit.role==='hook'?'hook':edit.role==='adlib'?'solo':edit.style==='duet'?'duet':'solo';
 const singers=style==='hook'?edit.singerSlots.slice().sort((a,b)=>a-b):style==='duet'?[edit.leadSlot,edit.partnerSlot].sort((a,b)=>a-b):[edit.leadSlot];
 if(style==='hook'&&!singers.includes(edit.leadSlot))return invalid('Der Hook-Lead muss zu den ausgewählten Sängern gehören');
 if(style==='duet'&&edit.partnerSlot===edit.leadSlot)return invalid('Duett benötigt zwei verschiedene Avatare');
 const candidate=normalizeVocalTimeSegmentsV496([{...proposal.segment,leadSlot:edit.leadSlot,partnerSlot:edit.partnerSlot,
  style,roleV547:edit.role,singerSlotsV547:singers}],durationMs)[0]??null;
 if(!candidate||candidate.leadSlot>=count||candidate.partnerSlot>=count||candidate.singerSlotsV547?.some(s=>s>=count))return invalid('Ungültige Zeitmarke');
 const conflicts=normalizeVocalTimeSegmentsV496(input.existing,durationMs).filter(s=>clashes(s,candidate)).length;
 return {segment:candidate,conflicts,status:conflicts?'conflict':'ready',reason:conflicts?`${conflicts} bereits gespeicherte Zeitmarke(n) im selben Haupt- oder Adlib-Kanal`:'Bereit zur ausdrücklichen Übernahme'};
}
/** A batch is atomic per candidate; reject competing edits rather than letting list order decide. */
export function applyVocalReviewsV756(input:{existing:unknown;reviews:readonly VocalReviewItemV756[];durationMs:number;count:number;overrideExisting:boolean}):VocalReviewResultV756{
 const existing=normalizeVocalTimeSegmentsV496(input.existing,input.durationMs);
 let out=existing.slice(),added=0,replaced=0,skipped=0;
 if(!validCount(input.count)||!Number.isSafeInteger(input.durationMs)||input.durationMs<=0||input.durationMs>MAX_MS){
  return {segments:out,added,replaced,skipped:input.reviews.length,preserved:out.length};
 }
 const accepted:VocalTimeSegmentV496[]=[];
 for(const review of input.reviews.slice(0,MAX)){
  const s=review.segment&&normalizeVocalTimeSegmentsV496([review.segment],input.durationMs)[0];
  if(!s||review.status==='invalid'||s.leadSlot>=input.count||s.partnerSlot>=input.count||
   s.singerSlotsV547?.some(slot=>slot>=input.count)||accepted.some(a=>clashes(a,s))){skipped++;continue;}
  // Identical re-submission is a no-op even when override was explicitly enabled.
  if(out.some(v=>JSON.stringify(v)===JSON.stringify(s))){skipped++;continue;}
  const existingConflicts=out.filter(v=>clashes(v,s));
  if(existingConflicts.length&&!input.overrideExisting){skipped++;continue;}
  // On explicit overwrite preserve unchanged parts of existing main/adlib cues.
  const remainder=out.flatMap(v=>{
   if(!clashes(v,s))return [v];
   const pieces:VocalTimeSegmentV496[]=[];
   if(v.startMs<s.startMs)pieces.push({...v,endMs:s.startMs});
   if(v.endMs>s.endMs)pieces.push({...v,startMs:s.endMs});
   return pieces;
  });
  if(remainder.length+1>MAX){skipped++;continue;}
  out=[...remainder,s];accepted.push(s);added++;
  replaced+=existingConflicts.length;
 }
 skipped+=Math.max(0,input.reviews.length-MAX);
 return {segments:normalizeVocalTimeSegmentsV496(out,input.durationMs),added,replaced,skipped,preserved:Math.max(0,existing.length-replaced)};
}
/** Display-only audit: no assumptions about the unobserved recording. */
export function auditVocalTimelineV756(raw:unknown,durationMs:number,count:number){
 const segments=normalizeVocalTimeSegmentsV496(raw,durationMs);
 const invalidSlots=segments.filter(s=>s.leadSlot>=count||(s.style==='duet'&&s.partnerSlot>=count)||s.singerSlotsV547?.some(slot=>slot>=count)).length;
 const conflicts=segments.reduce((n,s,i)=>n+segments.slice(i+1).filter(t=>clashes(s,t)).length,0);
 const base=segments.filter(s=>s.roleV547!=='adlib'&&s.leadSlot<count).sort((a,b)=>a.startMs-b.startMs);
 let covered=0,end=0;
 for(const s of base){covered+=Math.max(0,s.endMs-Math.max(end,s.startMs));end=Math.max(end,s.endMs);}
 return {segments:segments.length,invalidSlots,conflicts,coveredMs:covered,
  uncoveredMs:Number.isFinite(durationMs)&&durationMs>0?Math.max(0,durationMs-covered):0};
}
