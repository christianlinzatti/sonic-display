/** V1112 · AI Avatar Personality: deterministic, consent-first show choreography.
 * Each of the three bundled Stage Crew performers receives an independent
 * character direction. Only the EXISTING V1040 camera/dance cue is written to
 * the approved show timeline; per-performer roles remain explanatory rehearsal
 * notes until a dedicated multi-rig animation scheduler is installed.
 * No microphone, networking, personal inference, lighting or device effects.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowPlanV1040,
 type ArenaShowCameraV1040,type ArenaShowDanceV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,
 type AiShowRemixV1106,type RemixActV1106} from './arena360AiShowRemixV1106';
import type {ConductorShowV1111} from './aiLiveShowConductorV1111';

export const AVATAR_PERSONALITIES_V1112=['frontman','hype','precision','mystery'] as const;
export type AvatarPersonalityV1112=typeof AVATAR_PERSONALITIES_V1112[number];
export const AVATAR_PERSONALITY_LABELS_V1112:Record<AvatarPersonalityV1112,string>={
 frontman:'Charismatischer Frontmann',hype:'Energiegeladener Hype-Artist',
 precision:'Präziser Tänzer',mystery:'Mysteriöser Performer',
};
export const AVATAR_CAST_V1112=[
 {id:'sonic-neon-pulse',label:'Neon Pulse',personality:'frontman'},
 {id:'sonic-festival-nova',label:'Festival Nova',personality:'hype'},
 {id:'sonic-chrome-beat',label:'Chrome Beat',personality:'precision'},
] as const;
export type AvatarCastMemberV1112={id:string;label:string;personality:AvatarPersonalityV1112};
export type AvatarCastV1112=AvatarCastMemberV1112[];
export type AvatarPersonalityRoleV1112='lead'|'support'|'echo'|'rest';
export type AvatarPersonalityBeatV1112={id:string;label:string;
 personality:AvatarPersonalityV1112;role:AvatarPersonalityRoleV1112;direction:string};
export type AvatarPersonalityCueV1112={index:number;scene:RemixActV1106['scene'];
 start:number;end:number;camera:ArenaShowCameraV1040;dance:ArenaShowDanceV1040;
 intensity:number;focusId:string|null;performers:AvatarPersonalityBeatV1112[]};
export type AvatarPersonalityShowV1112={remix:AiShowRemixV1106;cast:AvatarCastV1112;
 cues:AvatarPersonalityCueV1112[];quality:{distinctPersonalities:number;
 featuredPerformers:number;ensembleMoments:number;safeTransitions:boolean;continuousTimeline:boolean}};
const choreography:Record<AvatarPersonalityV1112,{camera:ArenaShowCameraV1040;dance:ArenaShowDanceV1040;word:string}>={
 frontman:{camera:'lead',dance:'groove',word:'Souveräne Gestik und deutliche Akzente'},
 hype:{camera:'orbit',dance:'peak',word:'Große Bewegungen und mitreißende Energie'},
 precision:{camera:'lead',dance:'groove',word:'Rhythmische, klar getaktete Schritte'},
 mystery:{camera:'orbit',dance:'calm',word:'Kontrollierte, minimalistische Bewegungen'},
};
const FOCUS:[number|null,number|null,number|null,number|null,number|null,number|null,number|null]=
 [0,0,1,null,2,2,null];
const roleDirection=(member:AvatarCastMemberV1112,role:AvatarPersonalityRoleV1112):string=>
 role==='rest'?'Zurücknehmen und dem Hauptmoment Raum geben':
 role==='echo'?'Bewegungen als zurückhaltendes Echo aufgreifen':
 role==='support'?'Lead unterstützen, ohne den Fokus zu übernehmen':choreography[member.personality].word;
/** Prevent mixing model names, arbitrary URLs, duplicate IDs or malformed remote values. */
export function normalizeAvatarCastV1112(raw:unknown):AvatarCastV1112|null{
 if(!Array.isArray(raw)||raw.length!==AVATAR_CAST_V1112.length)return null;
 const cast:AvatarCastV1112=[];
 for(let i=0;i<AVATAR_CAST_V1112.length;i++){
  const item=raw[i];if(!item||typeof item!=='object'||Array.isArray(item))return null;
  const x=item as Record<string,unknown>,expected=AVATAR_CAST_V1112[i];
  if(x.id!==expected.id||x.label!==expected.label||
   !AVATAR_PERSONALITIES_V1112.includes(x.personality as AvatarPersonalityV1112))return null;
  cast.push({id:expected.id,label:expected.label,personality:x.personality as AvatarPersonalityV1112});
 }
 return cast;
}
/** Build a seven-chapter character sheet and modify only supported camera/dance
 * values in the preview. Existing timestamps, IDs, deck and laser cues are kept.
 */
export function directAvatarPersonalityV1112(planRaw:unknown,remixRaw:unknown,
 castRaw:unknown,cap:unknown):AvatarPersonalityShowV1112|null{
 const plan=normalizeArenaShowPlanV1040(planRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const cast=normalizeAvatarCastV1112(castRaw);
 if(!plan||!remix||!cast||typeof cap!=='number'||!Number.isInteger(cap)||cap<30||cap>85||
  plan.segments.length!==7||plan.segments.some((s,i)=>s.scene!==remix.acts[i].scene)||
  remix.acts.some(a=>a.intensity>cap))return null;
 const acts=remix.acts.map((a,i)=>{
  const focus=FOCUS[i],member=focus===null?null:cast[focus];
  const character=member?choreography[member.personality]:null;
  // Ensemble and quiet chapters must retain the original production safeguards.
  const camera:ArenaShowCameraV1040=i===3||i===6?'group':i===0||i===4?'wide':character?.camera??a.camera;
  const dance:ArenaShowDanceV1040=i===3?'group':i===6?'peak':i===0||i===4?'calm':
   character?.dance??a.dance;
  const note=(a.note+' V1112 '+(member?member.label+': '+character?.word:'Ensemble im Gleichklang')).slice(0,145);
  return {...a,camera,dance,note};
 });
 const directed=normalizeAiShowRemixV1106({...remix,acts,
  explanation:('V1112 Avatar Personality: Stage Crew mit individuellen Rollenideen; Kamera- und Tanzmodus steuern weiterhin die bestehende gemeinsame 360°-Timeline. '+remix.explanation).slice(0,300)});
 if(!directed||!applyAiShowRemixV1106(plan,directed,cap))return null;
 const cues:AvatarPersonalityCueV1112[]=directed.acts.map((a,i)=>{
  const focus=FOCUS[i],focusId=focus===null?null:cast[focus].id;
  const performers=cast.map((member,j)=>{
   const role:AvatarPersonalityRoleV1112=focus===null?(i===6?'lead':'support'):
    j===focus?'lead':i===4?'rest':j===(focus+1)%3?'support':'echo';
   return {...member,role,direction:roleDirection(member,role)};
  });
  return {index:i,scene:a.scene,start:plan.segments[i].start,end:plan.segments[i].end,
   camera:a.camera,dance:a.dance,intensity:a.intensity,focusId,performers};
 });
 const quality={distinctPersonalities:new Set(cast.map(x=>x.personality)).size,
  featuredPerformers:new Set(cues.map(c=>c.focusId).filter(Boolean)).size,
  ensembleMoments:cues.filter(c=>c.focusId===null).length,
  safeTransitions:cues.every((c,i)=>i===0||Math.abs(c.intensity-cues[i-1].intensity)<=45),
  continuousTimeline:cues[0].start===0&&cues[6].end===1&&
   cues.every((c,i)=>i===0||c.start===cues[i-1].end)};
 if(!quality.safeTransitions||!quality.continuousTimeline||quality.featuredPerformers!==3)return null;
 return {remix:directed,cast,cues,quality};
}
export function sampleAvatarPersonalityV1112(show:AvatarPersonalityShowV1112|null,
 progress:unknown):AvatarPersonalityCueV1112|null{
 if(!show||!Array.isArray(show.cues)||show.cues.length!==7||typeof progress!=='number'||
  !Number.isFinite(progress)||progress<0||progress>1)return null;
 return show.cues.find(c=>progress<c.end)??show.cues[6];
}
/** Keep V1111's written rehearsal cues consistent after V1112 adjusts the show. */
export function syncPersonalityConductorV1112(source:ConductorShowV1111|null,
 personality:AvatarPersonalityShowV1112|null):ConductorShowV1111|null{
 if(!source||!personality||source.cues.length!==personality.cues.length)return null;
 const cues=source.cues.map((cue,i)=>({...cue,camera:personality.remix.acts[i].camera,
  dance:personality.remix.acts[i].dance}));
 return {...source,remix:personality.remix,cues,quality:{...source.quality,
  cameraVariety:new Set(cues.map(c=>c.camera)).size}};
}
