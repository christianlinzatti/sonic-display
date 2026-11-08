/** V1116 · AI Artist Interaction.
 * A deterministic, explicitly opt-in rehearsal of relationships between the
 * three verified Stage Crew avatars. The score uses the ACTUAL V1113–V1115
 * cues; it does not claim to know who sings, infer real eye gaze, synthesize
 * speech or invent rig clips. Camera changes use only V1040-supported modes.
 * The independent V1079 live interaction option is activated by the user only.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
import type {PerformanceShowV1113} from './aiPerformanceDirectorV1113';
import type {DanceShowV1114} from './aiDanceChoreographerV1114';
import type {VocalShowV1115} from './aiVocalActingV1115';

export const INTERACTION_STYLES_V1116=['dialogue','duet','battle','festival'] as const;
export type InteractionStyleV1116=typeof INTERACTION_STYLES_V1116[number];
export const INTERACTION_LABELS_V1116:Record<InteractionStyleV1116,string>={
 dialogue:'Dialog & gegenseitige Antworten',
 duet:'Gemeinsamer Duo-Auftritt',
 battle:'Rap-Battle & Spotlight-Wechsel',
 festival:'Festival-Call-and-Response',
};
export type InteractionOptionsV1116={style:InteractionStyleV1116;strength:number;intensityCap:number};
export type InteractionKindV1116='entrance'|'handoff'|'response'|'duet'|'breath'|'challenge'|'ensemble';
export type InteractionCueV1116={index:number;scene:string;start:number;end:number;
 kind:InteractionKindV1116;leadId:string|null;partnerId:string|null;observerId:string|null;
 camera:'wide'|'lead'|'orbit'|'group';dance:'calm'|'groove'|'group'|'peak';
 intensity:number;gesture:string;description:string;verifiedSinger:false;physicalLookAt:false;
 cueSource:'planned-timeline'};
export type InteractionShowV1116={style:InteractionStyleV1116;strength:number;
 remix:AiShowRemixV1106;cues:InteractionCueV1116[];
 quality:{scenes:number;performers:number;leadChanges:number;partnerMoments:number;
 quietMoments:number;cameraVariety:number;continuousTimeline:boolean;
 safeIntensity:boolean;verifiedSingerAssignments:0;physicalEyeTracking:false}};
export type LiveArtistPresetV1116={arenaLiveArtistEnabledV1079:true;arenaLiveArtistStrengthV1079:number};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
export function normalizeInteractionOptionsV1116(raw:unknown):InteractionOptionsV1116|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const o=raw as Record<string,unknown>;
 if(!INTERACTION_STYLES_V1116.includes(o.style as InteractionStyleV1116)||
  typeof o.strength!=='number'||!Number.isInteger(o.strength)||o.strength<20||o.strength>80||o.strength%10!==0||
  typeof o.intensityCap!=='number'||!Number.isInteger(o.intensityCap)||o.intensityCap<30||o.intensityCap>85)return null;
 return {style:o.style as InteractionStyleV1116,strength:o.strength,intensityCap:o.intensityCap};
}
const interactionKinds:Record<InteractionStyleV1116,readonly InteractionKindV1116[]>={
 dialogue:['entrance','handoff','response','duet','breath','handoff','ensemble'],
 duet:['entrance','handoff','duet','duet','breath','response','ensemble'],
 battle:['entrance','challenge','response','duet','breath','challenge','ensemble'],
 festival:['entrance','handoff','response','ensemble','breath','duet','ensemble'],
};
const caption:Record<InteractionKindV1116,string>={
 entrance:'Alle beobachten den Einstieg; kein automatisch gesteuerter Blickkontakt.',
 handoff:'Lead gibt den Bühnenfokus an den Partner weiter, ohne Sänger neu zuzuordnen.',
 response:'Der Partner antwortet mit einem passenden Bewegungsakzent – ohne erzeugte Stimme.',
 duet:'Zwei Performer teilen sich die Kamera; der dritte erhält Platz im Ensemble.',
 breath:'Bewusste Pause, Blickkontakt nur als mögliche Regieanweisung.',
 challenge:'Zwei Künstler treten in einem freundlichen, choreografierten Spotlight-Wechsel an.',
 ensemble:'Drei Performer inszenieren einen gemeinsamen Höhepunkt, ohne neue Clips zu erzeugen.',
};
/** Reject stale or contradictory downstream cues. The original timestamps,
 * intensity, deck, floating platform, lasers and existing dance choreography
 * remain untouched; only supported group/lead/orbit/wide cameras are curated.
 */
export function directArtistInteractionV1116(baseRaw:unknown,
 performance:PerformanceShowV1113|null,dance:DanceShowV1114|null,
 vocal:VocalShowV1115|null,optionsRaw:unknown):InteractionShowV1116|null{
 const base=normalizeArenaShowPlanV1040(baseRaw),opts=normalizeInteractionOptionsV1116(optionsRaw);
 const remix=normalizeAiShowRemixV1106(dance?.remix);
 if(!base||!opts||!performance||!dance||!vocal||!remix||base.segments.length!==7||
  performance.cues.length!==7||dance.cues.length!==7||vocal.cues.length!==7)return null;
 const members=performance.cues[0]?.performers;
 const ids=members?.map(m=>m.id)??[];
 if(ids.length!==3||new Set(ids).size!==3||ids.some(id=>typeof id!=='string'||!id))return null;
 for(let i=0;i<7;i++){
  const p=performance.cues[i],d=dance.cues[i],v=vocal.cues[i],a=remix.acts[i],s=base.segments[i];
  if(!p||!d||!v||!a||!s||p.index!==i||d.index!==i||v.index!==i||
   p.scene!==s.scene||d.scene!==s.scene||v.scene!==s.scene||a.scene!==s.scene||
   p.start!==s.start||d.start!==s.start||v.start!==s.start||
   p.end!==s.end||d.end!==s.end||v.end!==s.end||
   p.intensity!==a.intensity||d.intensity!==a.intensity||d.dance!==a.dance||
   a.intensity>opts.intensityCap||
   !Array.isArray(p.performers)||!Array.isArray(d.members)||!Array.isArray(v.members)||
   p.performers.length!==3||d.members.length!==3||v.members.length!==3||
   p.performers.some((m,j)=>m.id!==ids[j]||m.label!==members?.[j]?.label||!Number.isFinite(m.energy)||m.energy<0||m.energy>opts.intensityCap)||
   d.members.some((m,j)=>m.id!==ids[j]||!Number.isFinite(m.energy)||m.energy<0||m.energy>opts.intensityCap)||
   v.members.some((m,j)=>m.id!==ids[j]||m.hasVerifiedSingerAssignment!==false||
    !Number.isFinite(m.energy)||m.energy<0||m.energy>opts.intensityCap))return null;
 }
 const kinds=interactionKinds[opts.style];
 const leadIndices:[number|null,number|null,number|null,number|null,number|null,number|null,number|null]=
  [null,0,1,0,null,2,null];
 const partnerIndices:[number|null,number|null,number|null,number|null,number|null,number|null,number|null]=
  [null,1,0,1,null,opts.style==='battle'?0:1,null];
 const cameras:InteractionCueV1116['camera'][]=remix.acts.map((a,i)=>i===0||i===4?'wide':i===3||i===6?'group':
  i===2||opts.style==='battle'&&i===5?'orbit':'lead');
 const acts=remix.acts.map((a,i)=>({...a,camera:cameras[i],
  note:(a.note+' V1116: '+caption[kinds[i]]).slice(0,145)}));
 const staged=normalizeAiShowRemixV1106({...remix,acts,
  explanation:('V1116 Artist Interaction: sicher geplante Wechsel, Duos und gemeinsame Kameramomente; echte Partner-Blicke nur über separat bestätigten V1079-Modus mit synchronen Lyrics-Lücken. '+remix.explanation).slice(0,300)});
 if(!staged||!applyAiShowRemixV1106(base,staged,opts.intensityCap))return null;
 const cues:InteractionCueV1116[]=acts.map((a,i)=>{
  const lead=leadIndices[i],partner=partnerIndices[i];
  const remaining=lead===null||partner===null?null:ids.find((_,j)=>j!==lead&&j!==partner)??null;
  return {index:i,scene:a.scene,start:base.segments[i].start,end:base.segments[i].end,
   kind:kinds[i],leadId:lead===null?null:ids[lead],partnerId:partner===null?null:ids[partner],
   observerId:remaining,camera:a.camera,dance:a.dance,intensity:a.intensity,
   gesture:opts.style==='battle'?'Gegenseitige Akzente':opts.style==='festival'?'Publikums-Call':
    opts.style==='duet'?'Gemeinsame Performance':'Blick- und Antwortimpuls',
   description:caption[kinds[i]],verifiedSinger:false,physicalLookAt:false,
   cueSource:'planned-timeline'};
 });
 const sequence=cues.filter(c=>c.leadId!==null).map(c=>c.leadId);
 const quality={scenes:7,performers:ids.length,
  leadChanges:sequence.filter((id,i)=>i>0&&id!==sequence[i-1]).length,
  partnerMoments:cues.filter(c=>c.leadId!==null&&c.partnerId!==null&&c.leadId!==c.partnerId).length,
  quietMoments:cues.filter(c=>c.kind==='breath'||c.kind==='entrance').length,
  cameraVariety:new Set(cues.map(c=>c.camera)).size,
  continuousTimeline:cues[0].start===0&&cues[6].end===1&&cues.every((c,i)=>i===0||c.start===cues[i-1].end),
  safeIntensity:cues.every(c=>c.intensity<=opts.intensityCap)&&
   cues.every((c,i)=>i===0||Math.abs(c.intensity-cues[i-1].intensity)<=45),
  verifiedSingerAssignments:0 as const,physicalEyeTracking:false as const};
 if(!quality.continuousTimeline||!quality.safeIntensity||quality.leadChanges<2||quality.partnerMoments<3||
  quality.cameraVariety<3||quality.quietMoments<2)return null;
 return {style:opts.style,strength:opts.strength,remix:staged,cues,quality};
}
/** This is an opt-in to the *existing* real V1079 visual interaction system.
 * It only responds to proven synchronized lyric gaps, obeys reduced-motion,
 * and never overrides manual singer assignment or fabricates a gaze track.
 */
export function liveArtistPresetV1116(raw:unknown):LiveArtistPresetV1116|null{
 const opts=normalizeInteractionOptionsV1116(raw);
 if(!opts)return null;
 return {arenaLiveArtistEnabledV1079:true,
  arenaLiveArtistStrengthV1079:clamp(Math.round(opts.strength*.85),20,opts.intensityCap)};
}
export function sampleInteractionCueV1116(show:InteractionShowV1116|null,
 progress:unknown):InteractionCueV1116|null{
 if(!show||!Array.isArray(show.cues)||show.cues.length!==7||
  typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
