/** V1115 · AI Vocal Acting & Lip-Sync Intelligence.
 * Deterministic, LOCAL rehearsal suggestions over approved V1113/V1114 cues.
 * Actor intent is NOT an inferred singer, a phoneme timeline or audio transcription.
 * The optional live preset only selects EXISTING V368/V371/V372 lyric/vocal controls;
 * it must be applied separately by the user. Never assigns a manual vocal role.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {PerformanceShowV1113,PerformanceBeatV1113} from './aiPerformanceDirectorV1113';
import type {DanceShowV1114} from './aiDanceChoreographerV1114';

export const VOCAL_STYLES_V1115=['rap','melodic','hybrid'] as const;
export type VocalStyleV1115=typeof VOCAL_STYLES_V1115[number];
export const VOCAL_STYLE_LABELS_V1115:Record<VocalStyleV1115,string>={
 rap:'Deutschrap · markante Phrasen',melodic:'Melodischer Gesang · fließende Gestik',
 hybrid:'Festival · Rap und Gesang im Wechsel',
};
export type VocalOptionsV1115={style:VocalStyleV1115;expression:number;intensityCap:number};
export type VocalRoleV1115='lead'|'reply'|'support'|'rest';
export type VocalActV1115='spoken-accent'|'long-phrase'|'crowd-call'|'adlib-reply'|
 'breath'|'duet'|'full-ensemble';
export type VocalMemberV1115={id:string;label:string;role:VocalRoleV1115;
 act:VocalActV1115;energy:number;note:string;lipSource:'existing-lyric-engine';
 hasVerifiedSingerAssignment:false};
export type VocalCueV1115={index:number;scene:string;start:number;end:number;
 intent:'quiet'|'verse'|'hook'|'drop';focusId:string|null;members:VocalMemberV1115[];
 caption:string};
export type VocalShowV1115={style:VocalStyleV1115;expression:number;cues:VocalCueV1115[];
 quality:{scenes:number;performers:number;roleChanges:boolean;distinctActs:number;
 continuousTimeline:boolean;safeEnergy:boolean;verifiedSingerAssignments:number}};
export type VocalPresetV1115={avatarLipSyncEnabled:true;avatarLipSyncMode:'lyrics';
 avatarVocalStyleV368:'rap'|'singing'|'auto';avatarFacialExpressionV368:number;
 avatarVocalBodyEnabledV371:true;avatarVocalBodyStrengthV371:number;
 avatarVocalEyeContactV371:true;avatarVocalGesturesV371:true;
 avatarVocalCoordinationEnabledV372:true;avatarVocalCoordinationStrengthV372:number};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function normalizeVocalOptionsV1115(raw:unknown):VocalOptionsV1115|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Record<string,unknown>;
 if(!VOCAL_STYLES_V1115.includes(r.style as VocalStyleV1115)||
  typeof r.expression!=='number'||!Number.isInteger(r.expression)||r.expression<20||r.expression>80||r.expression%10!==0||
  typeof r.intensityCap!=='number'||!Number.isInteger(r.intensityCap)||r.intensityCap<30||r.intensityCap>85)return null;
 return {style:r.style as VocalStyleV1115,expression:r.expression,intensityCap:r.intensityCap};
}
const notes:Record<VocalActV1115,string>={
 'spoken-accent':'Kurze, deutliche Rap-Akzente – nur bei bestätigtem Gesang synchronisieren',
 'long-phrase':'Längere gesangliche Phrase mit ruhiger, offener Gestik',
 'crowd-call':'Publikumsansprache als Bühnenidee, keine erzeugten Vocals',
 'adlib-reply':'Antwortende Bewegung, kein erfundener Adlib-Text',
 breath:'Atempause mit zurückgenommener Mimik',
 duet:'Zwei Künstler mit abgestimmten Bühnenrollen; keine Sängererkennung',
 'full-ensemble':'Gemeinsamer Akzent; keine automatische Mehrfach-Stimmenzuordnung',
};
/** Reject mismatched upstream cues instead of silently swapping a singer or timeline.
 * The THREE performers are guaranteed by the Stage Crew cast, not by audio.
 */
export function directVocalActingV1115(baseRaw:unknown,
 performance:PerformanceShowV1113|null,dance:DanceShowV1114|null,
 optionsRaw:unknown):VocalShowV1115|null{
 const plan=normalizeArenaShowPlanV1040(baseRaw),opts=normalizeVocalOptionsV1115(optionsRaw);
 if(!plan||!opts||!performance||!dance||plan.segments.length!==7||
  performance.cues.length!==7||dance.cues.length!==7)return null;
 const ids=performance.cues[0]?.performers.map(m=>m.id)??[];
 if(ids.length!==3||new Set(ids).size!==3||ids.some(x=>typeof x!=='string'||!x))return null;
 for(let i=0;i<7;i++){
  const p=performance.cues[i],d=dance.cues[i],s=plan.segments[i];
  if(!p||!d||!s||p.index!==i||d.index!==i||p.scene!==s.scene||d.scene!==s.scene||
   p.start!==s.start||p.end!==s.end||d.start!==s.start||d.end!==s.end||
   p.dance!==d.dance||p.intensity!==d.intensity||p.intensity>opts.intensityCap||
   !Array.isArray(p.performers)||!Array.isArray(d.members)||p.performers.length!==3||d.members.length!==3||
   p.performers.some((m,j)=>m.id!==ids[j]||!Number.isFinite(m.energy)||m.energy<0||m.energy>opts.intensityCap)||
   d.members.some((m,j)=>m.id!==ids[j]||!Number.isFinite(m.energy)||m.energy<0||m.energy>opts.intensityCap))return null;
 }
 const cues:VocalCueV1115[]=performance.cues.map((p,i)=>{
  const d=dance.cues[i],quiet=i===0||i===4,ensemble=i===6;
  const duet=i===3,leader=i===5?2:i===2?1:0;
  const members=p.performers.map((m:PerformanceBeatV1113,j)=>{
   const role:VocalRoleV1115=quiet?'rest':ensemble?'support':duet?(j<2?'lead':'reply'):
    j===leader?'lead':j===(leader+1)%3?'reply':'support';
   const act:VocalActV1115=quiet?'breath':ensemble?'full-ensemble':duet&&j<2?'duet':
    role==='reply'?'adlib-reply':role==='support'?'crowd-call':
    opts.style==='melodic'?'long-phrase':opts.style==='rap'?'spoken-accent':i%2===0?'long-phrase':'spoken-accent';
   const energy=quiet?Math.min(20,m.energy):clamp(Math.round((m.energy+d.members[j].energy)/2*(.70+opts.expression/200)),0,opts.intensityCap);
   return {id:m.id,label:m.label,role,act,energy,note:notes[act],
    lipSource:'existing-lyric-engine' as const,hasVerifiedSingerAssignment:false as const};
  });
  return {index:i,scene:p.scene,start:p.start,end:p.end,
   intent:quiet?'quiet':i===6?'drop':i===3?'hook':'verse',
   focusId:quiet||ensemble||duet?null:members[leader].id,members,
   caption:quiet?'Atempause – keine Lippenbewegung aus dieser Partitur ableiten':
    duet?'Wechselspiel als Probe; tatsächliche Sänger müssen separat bestätigt sein':
    ensemble?'Finale – Bühnenrollen, keine automatisch erkannten Stimmen':
    'Vocal-Fokus ist eine Regieidee, keine bestätigte Sängeridentität'};
 });
 const quality={scenes:cues.length,performers:ids.length,
  roleChanges:ids.every(id=>new Set(cues.map(c=>c.members.find(m=>m.id===id)?.role)).size>=2),
  distinctActs:new Set(cues.flatMap(c=>c.members.map(m=>m.act))).size,
  continuousTimeline:cues[0].start===0&&cues[6].end===1&&
   cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  safeEnergy:cues.every(c=>c.members.every(m=>Number.isFinite(m.energy)&&m.energy>=0&&m.energy<=opts.intensityCap)),
  verifiedSingerAssignments:0};
 if(!quality.roleChanges||!quality.continuousTimeline||!quality.safeEnergy||quality.distinctActs<4)return null;
 return {style:opts.style,expression:opts.expression,cues,quality};
}
/** A bounded configuration for the EXISTING lyric/face/body director. Does not
 * fabricate visemes, modify facial geometry or assign performers to vocal stems.
 */
export function vocalPresetV1115(raw:unknown):VocalPresetV1115|null{
 const opts=normalizeVocalOptionsV1115(raw);if(!opts)return null;
 const face=clamp(Math.round(opts.expression*.82),20,65);
 return {avatarLipSyncEnabled:true,avatarLipSyncMode:'lyrics',
  avatarVocalStyleV368:opts.style==='rap'?'rap':opts.style==='melodic'?'singing':'auto',
  avatarFacialExpressionV368:face,avatarVocalBodyEnabledV371:true,
  avatarVocalBodyStrengthV371:clamp(Math.round(opts.expression*.85),20,70),
  avatarVocalEyeContactV371:true,avatarVocalGesturesV371:true,
  avatarVocalCoordinationEnabledV372:true,
  avatarVocalCoordinationStrengthV372:clamp(Math.round(opts.expression*.9),20,75)};
}
export function sampleVocalCueV1115(show:VocalShowV1115|null,progress:unknown):VocalCueV1115|null{
 if(!show||!Array.isArray(show.cues)||show.cues.length!==7||
  typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
