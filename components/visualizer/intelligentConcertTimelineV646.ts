/** V646 – read-only, evidence-scoped whole-song concert timeline.
 * Displays VERIFIED authored V600/V604 plans, optional V354 authored edits and
 * manually supplied V496 vocal times. Does not imply actual rendered camera
 * positions, infer artists from credits, detect drops, or modify any show lanes.
 */
import type {ConcertArcV600} from './ultimateConcertDirectorV600';
import type {NarrativePlanV604} from './fullSongConcertDramaturgyV604';
import type {ShowTimelineV354,ShowLaneV354} from '../../services/stageContent/showTimelineV354';
import type {VocalTimeSegmentV496} from './vocalTimeDirectorV496';
import {normalizeVocalTimeSegmentsV496} from './vocalTimeDirectorV496';

export type ConcertLaneV646='section'|'camera'|'formation'|'lighting'|'vocals'|'manual';
export type ConcertEvidenceV646='authored-structure'|'authored-manual'|'authored-vocal';
export type ConcertTimelineItemV646={id:string;lane:ConcertLaneV646;startMs:number;endMs:number;
 label:string;evidence:ConcertEvidenceV646;sourceLane?:ShowLaneV354;act?:number};
export type ConcertTimelineV646={format:'sonic-concert-timeline-v646';trackId:string;durationMs:number;
 status:'verified'|'partial'|'unavailable';items:readonly ConcertTimelineItemV646[];
 gaps:readonly {startMs:number;endMs:number}[];notice:string};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const maxItems=1800;
const shotLabels={establish:'Bühne gesamt',lead:'Lead-Fokus',side:'Seitenansicht',ensemble:'Ensemble'} as const;
const formationLabels={line:'Linie',arc:'Bogen',stagger:'Versetzt',wide:'Breit'} as const;
const sectionLabels={verse:'Verse',hook:'Hook',build:'Build',drop:'Drop',break:'Break'} as const;
const motifLabels={portrait:'Porträt',dialogue:'Dialog',ensemble:'Ensemble',wide:'Weit',breath:'Atempause',crescendo:'Finalbogen'} as const;
const clipName=(s:string)=>typeof s==='string'?(s.trim().slice(0,60)||'Unbenannter Clip'):'Unbenannter Clip';
/** No validation shortcuts: an existing planned act must match both evidence sources,
 * whose source track and duration must match the current playback track. */
export function buildConcertTimelineV646(input:{trackId:string;durationMs:number;
 arc:ConcertArcV600|null|undefined;narrative:NarrativePlanV604|null|undefined;
 manual?:ShowTimelineV354|null;vocal?:readonly VocalTimeSegmentV496[]|null;
 vocalEnabled?:boolean;maxAvatars?:number;}):ConcertTimelineV646{
 const {trackId,arc,narrative,manual}=input;
 const durationMs=finite(input.durationMs)&&input.durationMs>0&&input.durationMs<=7200000?Math.round(input.durationMs):0;
 const items:ConcertTimelineItemV646[]=[];
 const gaps:{startMs:number;endMs:number}[]=[];
 const add=(item:ConcertTimelineItemV646)=>{if(items.length<maxItems)items.push(item);};
 const match=!!trackId&&!!durationMs&&arc?.trackId===trackId&&arc?.durationMs===durationMs&&
  arc.source==='authored'&&narrative?.trackId===trackId&&narrative?.durationMs===durationMs&&
  narrative.source==='verified-v600'&&Array.isArray(arc.acts)&&Array.isArray(narrative.acts)&&
  arc.acts.length===narrative.acts.length&&arc.acts.length>0&&arc.acts.length<=160;
 let verified=!!match;
 if(match&&arc&&narrative){
  let lastEnd=0;
  for(let i=0;i<arc.acts.length;i++){
   const a=arc.acts[i],n=narrative.acts[i];
   if(a.index!==i||n.index!==i||!finite(a.startMs)||!finite(a.endMs)||
    a.startMs<lastEnd||a.startMs<0||a.endMs<=a.startMs||a.endMs>durationMs||
    a.startMs!==n.startMs||a.endMs!==n.endMs||a.section!==n.section||
    !(a.section in sectionLabels)||!(a.shot in shotLabels)||!(a.formation in formationLabels)||
    !(n.motif in motifLabels)) {verified=false;break;}
   lastEnd=a.endMs;
  }
 }
 if(verified&&arc&&narrative){
  let cursor=0;
  for(let i=0;i<arc.acts.length;i++){
   const a=arc.acts[i],n=narrative.acts[i];
   if(a.startMs>cursor)gaps.push({startMs:cursor,endMs:a.startMs});
   cursor=a.endMs;
   add({id:`section-${i}`,lane:'section',startMs:a.startMs,endMs:a.endMs,label:sectionLabels[a.section],evidence:'authored-structure',act:i});
   add({id:`camera-${i}`,lane:'camera',startMs:a.startMs,endMs:a.endMs,label:`Vorschlag: ${shotLabels[a.shot]}`,evidence:'authored-structure',act:i});
   add({id:`formation-${i}`,lane:'formation',startMs:a.startMs,endMs:a.endMs,label:`Vorschlag: ${formationLabels[a.formation]}`,evidence:'authored-structure',act:i});
   add({id:`lighting-${i}`,lane:'lighting',startMs:a.startMs,endMs:a.endMs,label:`${sectionLabels[a.section]} · ${motifLabels[n.motif]}`,evidence:'authored-structure',act:i});
  }
  if(cursor<durationMs)gaps.push({startMs:cursor,endMs:durationMs});
 }else if(durationMs){gaps.push({startMs:0,endMs:durationMs});}
 // V354 manual score is separate: only present when live-enabled and track scoped.
 // No invocation of a V354 editor or its mutations in the planner.
 if(durationMs&&trackId&&manual?.version===1&&manual.enabled&&(!manual.trackId||manual.trackId===trackId)&&
   finite(manual.durationMs)&&manual.durationMs>0&&Array.isArray(manual.clips)){
  for(const [i,c] of manual.clips.slice(0,400).entries()){
   if(!['dance','camera','lighting','effects','photos','lyrics'].includes(c.lane)||
     !finite(c.startMs)||!finite(c.durationMs)||c.startMs<0||c.durationMs<=0)continue;
   const endMs=Math.min(durationMs,manual.durationMs,c.startMs+c.durationMs);
   if(endMs<=c.startMs)continue;
   add({id:`manual-${i}`,lane:'manual',startMs:c.startMs,endMs,
    label:`${c.lane}: ${clipName(c.label)}`,evidence:'authored-manual',sourceLane:c.lane});
  }
 }
 // Only explicitly authored V496/V547 singer assignments, never artist metadata.
 const count=finite(input.maxAvatars)?Math.max(1,Math.min(4,Math.trunc(input.maxAvatars))):4;
 if(durationMs&&trackId&&input.vocalEnabled===true&&count>=2){
  const vocal=normalizeVocalTimeSegmentsV496(input.vocal,durationMs);
  for(const [i,s] of vocal.entries()){
   if(s.leadSlot>=count||(s.style==='duet'&&s.partnerSlot>=count))continue;
   const slots=s.singerSlotsV547?.filter(x=>x<count)??
     (s.style==='duet'?[s.leadSlot,s.partnerSlot]:s.style==='hook'?Array.from({length:count},(_,x)=>x):[s.leadSlot]);
   if(!slots.length)continue;
   add({id:`vocal-${i}`,lane:'vocals',startMs:s.startMs,endMs:s.endMs,
    label:`${s.roleV547??s.style}: ${[...new Set(slots)].map(x=>`Avatar ${x+1}`).join(' + ')}`,
    evidence:'authored-vocal'});
  }
 }
 items.sort((a,b)=>a.startMs-b.startMs||a.endMs-b.endMs||a.id.localeCompare(b.id));
 const coverage=verified&&durationMs>0?(durationMs-gaps.reduce((v,g)=>v+g.endMs-g.startMs,0))/durationMs:0;
 return {format:'sonic-concert-timeline-v646',trackId,durationMs,
  status:verified?(coverage>=.999?'verified':'partial'):'unavailable',items,gaps,
  notice:!verified?'Keine geprüfte Songstruktur: keine automatischen Verse/Hooks/Drops behauptet.':
   gaps.length?'Unanalysierte Lücken bleiben ohne automatische Szenenvorschläge.':
   'Songstruktur aus validierter Analyse; Kamera-, Ensemble- und Lichtvorgaben sind Planung, keine Messung.'};
}
export function activeConcertItemsV646(plan:ConcertTimelineV646,trackId:string,progressMs:number){
 if(!trackId||plan.trackId!==trackId||!finite(progressMs)||progressMs<0||progressMs>=plan.durationMs)return [];
 return plan.items.filter(x=>x.startMs<=progressMs&&progressMs<x.endMs);
}
export function exportConcertTimelineV646(plan:ConcertTimelineV646){
 return JSON.stringify({format:plan.format,trackId:plan.trackId,durationMs:plan.durationMs,status:plan.status,
  items:plan.items,gaps:plan.gaps,note:'Read-only planning and explicitly authored metadata, NOT measured rendered camera moves, voices or lighting.'},null,2)+'\n';
}
