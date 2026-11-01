import type {Lyrics} from '@/types/music';
import {normalizeVocalAssignmentsV385,type VocalAssignmentV385} from './manualVocalCastingV385';
import {normalizeRapDuetAssignmentsV416,type RapDuetAssignmentV416} from './rapDuetStudioV416';
import {normalizeVocalTimeSegmentsV496,type VocalTimeSegmentV496} from './vocalTimeDirectorV496';

/** Only USER-authored or explicitly tagged content qualifies. This module does not infer who sings. */
export type VocalProposalOriginV660='manual-lines'|'rap-duet'|'lyric-tag';
export type VocalProposalV660={segment:VocalTimeSegmentV496;origin:VocalProposalOriginV660;lineStart:number;lineEnd:number};
export type VocalProposalReportV660={proposals:VocalProposalV660[];skippedExisting:number;skippedCompeting:number;truncated:boolean;sourceLines:number};
const MAX=120;
const same=(a:VocalTimeSegmentV496,b:VocalTimeSegmentV496)=>a.style===b.style&&a.roleV547===b.roleV547&&a.leadSlot===b.leadSlot&&a.partnerSlot===b.partnerSlot&&
  JSON.stringify(a.singerSlotsV547)===JSON.stringify(b.singerSlotsV547);
const overlap=(a:VocalTimeSegmentV496,b:VocalTimeSegmentV496)=>a.startMs<b.endMs&&b.startMs<a.endMs;
const isBacking=(s:VocalTimeSegmentV496)=>s.roleV547==='adlib';
const competes=(a:VocalTimeSegmentV496,b:VocalTimeSegmentV496)=>overlap(a,b)&&
  (!isBacking(a)&&!isBacking(b)||isBacking(a)&&isBacking(b)&&a.leadSlot===b.leadSlot);
/** Deliberately strict; ordinary words like "feat", "hook" or artist credits never trigger a casting. */
function explicitTag(text:string,count:number):Pick<VocalTimeSegmentV496,'roleV547'|'style'|'leadSlot'|'partnerSlot'|'singerSlotsV547'>|null{
 const tag=text.match(/^\s*\[vocal:(lead|feature|duet|hook|adlib):([1-4](?:,[1-4]){0,3})\](?:\s|$)/i);
 if(!tag)return null;
 const slots=tag[2].split(',').map(v=>Number(v)-1);
 if(new Set(slots).size!==slots.length||slots.some(v=>v>=count))return null;
 const role=tag[1].toLowerCase();
 if((role==='lead'||role==='feature'||role==='adlib')&&slots.length!==1)return null;
 if(role==='duet'&&slots.length!==2)return null;
 const first=slots[0],partner=slots.length>1?slots[1]:(first+1)%count;
 return {roleV547:role==='feature'?'feature':role==='hook'?'hook':role==='adlib'?'adlib':'verse',
  style:role==='hook'?'hook':role==='duet'?'duet':'solo',leadSlot:first,partnerSlot:partner,singerSlotsV547:slots};
}
function manualAt(items:readonly VocalAssignmentV385[],line:number){
 for(let i=items.length-1;i>=0;i--)if(items[i].fromLine<=line&&line<=items[i].toLine)return items[i];
 return null;
}
function duetAt(items:readonly RapDuetAssignmentV416[],line:number){
 for(let i=items.length-1;i>=0;i--)if(items[i].fromLine<=line&&line<=items[i].toLine)return items[i];
 return null;
}
/**
 * Deterministic editorial proposals from already-authored assignments. Does not write preferences.
 * Priority: V385 per-line casting > V416 rap duet > explicit [vocal:role:slot] lyric markers.
 * Existing time segments always win; separate Adlibs may overlay a main singer.
 */
export function proposeVocalAssignmentsV660(input:{
 lyrics:Lyrics|null|undefined;durationMs:number;avatarCount:number;
 manual:unknown;rapDuet:unknown;existing:unknown;
}):VocalProposalReportV660{
 const result:VocalProposalReportV660={proposals:[],skippedExisting:0,skippedCompeting:0,truncated:false,sourceLines:0};
 const count=Math.trunc(input.avatarCount),duration=Math.trunc(input.durationMs);
 if(count<2||count>4||!Number.isSafeInteger(duration)||duration<=0||duration>4*60*60*1000||
  !input.lyrics?.synced||!Array.isArray(input.lyrics.lines))return result;
 const lines=input.lyrics.lines.slice(0,5000);
 const manual=normalizeVocalAssignmentsV385(input.manual,lines.length).filter(x=>x.slot<count);
 const rap=normalizeRapDuetAssignmentsV416(input.rapDuet,lines.length).filter(x=>x.leadSlot<count&&x.partnerSlot<count);
 const existing=normalizeVocalTimeSegmentsV496(input.existing,duration);
 // Time order with line-number stability; reject unsorted/invalid timing instead of guessing.
 let lastStart=-1;
 for(let i=0;i<lines.length;i++){
  const line=lines[i];
  if(!Number.isSafeInteger(line.startMs)||line.startMs<lastStart||line.startMs<0||line.startMs>=duration){
   continue;
  }
  lastStart=line.startMs;
  if(!line.text?.trim())continue;
  const next=lines[i+1]?.startMs;
  if(next!=null&&(!Number.isSafeInteger(next)||next<=line.startMs))continue;
  const end=Math.min(duration,line.startMs+14000,
   line.endMs!=null&&Number.isFinite(line.endMs)&&line.endMs>line.startMs?line.endMs:duration,
   next!=null&&Number.isFinite(next)&&next>line.startMs?next:duration);
  if(end<=line.startMs)continue;
  const m=manualAt(manual,i),r=m?null:duetAt(rap,i),tag=!m&&!r?explicitTag(line.text,count):null;
  let seg:VocalTimeSegmentV496|null=null,origin:VocalProposalOriginV660='lyric-tag';
  if(m&&m.slot<count){
   const all=m.role==='hook'?Array.from({length:count},(_,s)=>s):[m.slot];
   seg={startMs:line.startMs,endMs:end,leadSlot:m.slot,partnerSlot:(m.slot+1)%count,
    style:m.role==='hook'?'hook':'solo',roleV547:m.role==='feature'?'feature':m.role==='hook'?'hook':'verse',
    singerSlotsV547:all,strength:70};origin='manual-lines';
  }else if(r&&r.leadSlot<count&&r.partnerSlot<count){
   const all=r.style==='hook'?Array.from({length:count},(_,s)=>s):r.style==='duet'?[r.leadSlot,r.partnerSlot]:[r.leadSlot];
   seg={startMs:line.startMs,endMs:end,leadSlot:r.leadSlot,partnerSlot:r.partnerSlot,
    style:r.style==='hook'?'hook':r.style==='duet'?'duet':'solo',
    roleV547:r.style==='hook'?'hook':r.style==='reply'?'feature':'verse',
    singerSlotsV547:all,strength:r.strength};origin='rap-duet';
   // An authored reply switches singers inside the final 38% of this line.
   // Split only when the duration allows both parts to be meaningful.
   if(r.style==='reply'&&end-line.startMs>=650){
    const split=Math.round(line.startMs+(end-line.startMs)*.62);
    const tail:VocalTimeSegmentV496={startMs:split,endMs:end,leadSlot:r.partnerSlot,
      partnerSlot:r.leadSlot,style:'solo',roleV547:'feature',singerSlotsV547:[r.partnerSlot],strength:r.strength};
    seg.endMs=split;
    // Insert the response directly after the lead, retaining explicit precedence.
    const head=normalizeVocalTimeSegmentsV496([seg],duration)[0];
    const reply=normalizeVocalTimeSegmentsV496([tail],duration)[0];
    if(head)tryAdd(head,origin,i);
    if(reply)tryAdd(reply,origin,i);
    continue;
   }
  }else if(tag){seg={...tag,startMs:line.startMs,endMs:end,strength:70};}
  if(!seg)continue;
  const normalized=normalizeVocalTimeSegmentsV496([seg],duration)[0];
  if(normalized)tryAdd(normalized,origin,i);
 }
 return result;
 function tryAdd(segment:VocalTimeSegmentV496,origin:VocalProposalOriginV660,lineNo:number){
  result.sourceLines++;
  if(existing.some(s=>competes(s,segment))){result.skippedExisting++;return;}
  if(result.proposals.some(p=>competes(p.segment,segment))){result.skippedCompeting++;return;}
  const prior=result.proposals[result.proposals.length-1];
  if(prior&&prior.origin===origin&&prior.lineEnd===lineNo-1&&same(prior.segment,segment)&&
    segment.startMs>=prior.segment.endMs&&segment.startMs-prior.segment.endMs<=200){
   prior.segment.endMs=segment.endMs;prior.lineEnd=lineNo;return;
  }
  if(result.proposals.length>=MAX){result.truncated=true;return;}
  result.proposals.push({segment,origin,lineStart:lineNo,lineEnd:lineNo});
 }
}
/** No implicit overwrites: check against the newest saved entries again on acceptance. */
export function mergeVocalProposalsV660(existing:unknown,proposals:readonly VocalProposalV660[],durationMs:number){
 const all=normalizeVocalTimeSegmentsV496(existing,durationMs);
 let added=0,skipped=0;
 for(const proposal of proposals){
  const s=normalizeVocalTimeSegmentsV496([proposal.segment],durationMs)[0];
  if(!s||all.length>=MAX||all.some(item=>competes(item,s))){skipped++;continue;}
  all.push(s);added++;
 }
 return {segments:all,added,skipped};
}
