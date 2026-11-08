/** V1107 · Creative Producer 2.0: bounded, explainable director on top of V1106.
 * Proposals never directly control microphones, Govee, strobes or pyrotechnics.
 * Only pre-existing 360° timeline fields may change after explicit user approval.
 */
import {normalizeAiShowRemixV1106,type AiShowRemixV1106,type RemixActV1106} from './arena360AiShowRemixV1106';
import {isMusicMoodHintV1108,type MusicMoodHintV1108} from './aiMusicEmotionV1108';
export type CreativeStyleV1107='cinematic'|'festival'|'intimate'|'surprise';
export type CreativeBriefV1107={style:CreativeStyleV1107;contrast:number;surprise:number;mood:MusicMoodHintV1108};
const styles:readonly CreativeStyleV1107[]=['cinematic','festival','intimate','surprise'];
export const DEFAULT_CREATIVE_BRIEF_V1107:CreativeBriefV1107={style:'cinematic',contrast:50,surprise:35,mood:'none'};
const MAX_DELTA=45;
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,v));
export function normalizeCreativeBriefV1107(value:unknown):CreativeBriefV1107|null{
 if(!value||typeof value!=='object'||Array.isArray(value))return null;
 const x=value as Record<string,unknown>;
 if(!styles.includes(x.style as CreativeStyleV1107)||
  typeof x.contrast!=='number'||!Number.isInteger(x.contrast)||x.contrast<0||x.contrast>80||
  typeof x.surprise!=='number'||!Number.isInteger(x.surprise)||x.surprise<0||x.surprise>70||
  !isMusicMoodHintV1108(x.mood))return null;
 return {style:x.style as CreativeStyleV1107,contrast:x.contrast,surprise:x.surprise,mood:x.mood};
}
export function curateCreativeRemixV1107(raw:unknown,rawBrief:unknown,intensityCap:number):AiShowRemixV1106|null{
 const proposal=normalizeAiShowRemixV1106(raw),brief=normalizeCreativeBriefV1107(rawBrief);
 if(!proposal||!brief||!Number.isInteger(intensityCap)||intensityCap<30||intensityCap>85)return null;
 const acts:RemixActV1106[]=proposal.acts.map((old,i)=>{
  const quiet=i===0||i===4,peak=i===3||i===6;
  const moodBias=brief.mood==='calm'?-12:brief.mood==='intense'?6:brief.mood==='euphoric'?5:
   brief.mood==='atmospheric'?-4:0;
  const contrastBias=quiet?-Math.round(brief.contrast*.23):peak?Math.round(brief.contrast*.18):0;
  const cinematic=brief.style==='cinematic',festival=brief.style==='festival';
  const intimate=brief.style==='intimate',surprising=brief.style==='surprise';
  const deck=festival&&peak?'fan':cinematic&&quiet?'halo':intimate&&i===1?'halo':
   brief.surprise>=55&&i===5?'spiral':old.deck;
  const floating=festival&&peak?'rise':cinematic&&i===2?'orbit':
   intimate&&quiet?'wave':brief.surprise>=55&&i===5?'rise':old.floating;
  const camera=cinematic?(i===1||i===5?'lead':peak?'group':i===2?'orbit':'wide'):
   festival?(peak?'group':i===2||i===5?'orbit':old.camera):
   intimate?(i===1||i===5?'lead':old.camera):
   surprising&&brief.surprise>=30&&i===5?'orbit':old.camera;
  const dance=intimate&&quiet?'calm':festival&&peak?'group':old.dance;
  const lasers=intimate&&quiet?'halo':festival&&peak?'tunnel':
   brief.surprise>=55&&i===5?'spiral':old.lasers;
  let target=clamp(old.intensity+moodBias+contrastBias+(festival&&peak?5:0)-(intimate?8:0),0,intensityCap);
  if(quiet)target=Math.min(target,Math.floor(intensityCap*(brief.style==='intimate'?.46:.60)));
  const note=(old.note+' Regie: '+(brief.surprise>=55&&i===5?'überraschender Perspektivwechsel':quiet?'bewusste Ruhe und Lesbarkeit':peak?'klarer musikalischer Höhepunkt':'fließender Aufbau')+'.').slice(0,145);
  return {...old,deck,floating,camera,dance,lasers,intensity:Math.round(target),note};
 });
 // Enforce continuity without hiding a failed raw AI proposal. Capping after editing
 // preserves the V1106 validator's strict limit, especially with low user caps.
 for(let i=1;i<acts.length;i++)if(acts[i].intensity>acts[i-1].intensity+MAX_DELTA)
  acts[i].intensity=acts[i-1].intensity+MAX_DELTA;
 for(let i=acts.length-2;i>=0;i--)if(acts[i].intensity>acts[i+1].intensity+MAX_DELTA)
  acts[i].intensity=acts[i+1].intensity+MAX_DELTA;
 const label=brief.style==='cinematic'?'Filmische Dramaturgie':brief.style==='festival'?'Festival-Energie':
  brief.style==='intimate'?'Intime Live-Session':'Überraschungsregie';
 return normalizeAiShowRemixV1106({...proposal,acts,
  explanation:(label+'. '+proposal.explanation).slice(0,300)});
}
export type CreativeAuditV1107={contrastRange:number;uniqueCameras:number;uniqueStages:number;quietMoments:number;maximumIntensity:number;safeTransitions:boolean};
export function auditCreativeRemixV1107(value:unknown):CreativeAuditV1107|null{
 const proposal=normalizeAiShowRemixV1106(value);
 if(!proposal)return null;
 const levels=proposal.acts.map(a=>a.intensity);
 return {contrastRange:Math.max(...levels)-Math.min(...levels),
  uniqueCameras:new Set(proposal.acts.map(a=>a.camera)).size,
  uniqueStages:new Set(proposal.acts.map(a=>a.deck+'-'+a.floating)).size,
  quietMoments:proposal.acts.filter(a=>a.scene==='intro'||a.scene==='interlude').filter(a=>a.intensity<=55).length,
  maximumIntensity:Math.max(...levels),safeTransitions:levels.every((v,i)=>i===0||Math.abs(v-levels[i-1])<=MAX_DELTA)};
}
