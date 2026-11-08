/** V1098 – Govee Immersive Color Journey.
 * Pure, explicit opt-in mood grading of the existing V1096/V1097 safe overlay.
 * Only verified V318 music sections. No new sender, clock, song inference or
 * hardware on/off commands. V1096 still enforces per-channel slew and the V961 cap.
 */
import type {GoveePhaseCueV1027} from './goveeConcertSyncV1027';
import type {GoveeRoomDecisionV1096} from './goveeRoomLightingV1096';

export const GOVEE_JOURNEY_KEY_V1098='sonic-display:govee-color-journey-v1098';
export const GOVEE_JOURNEY_EVENT_V1098='sonic-display:govee-color-journey-changed-v1098';
export type GoveeJourneyStyleV1098='balanced'|'cinematic'|'festival';
export type GoveeJourneySettingsV1098={schema:'govee-journey-v1098';enabled:boolean;strength:number;style:GoveeJourneyStyleV1098};
export const DEFAULT_GOVEE_JOURNEY_V1098:GoveeJourneySettingsV1098={schema:'govee-journey-v1098',enabled:false,strength:30,style:'balanced'};
export type GoveeJourneyDecisionV1098={active:boolean;reason:string;zone:string|null;
 phase:string;accent:{r:number;g:number;b:number};mixFactor:number;brightnessFactor:number};
const OFF=(reason:string):GoveeJourneyDecisionV1098=>({active:false,reason,zone:null,
 phase:'none',accent:{r:0,g:0,b:0},mixFactor:1,brightnessFactor:1});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const ZONES=['wall','rhythm','neon','ambient'] as const;
const MOODS:{[key:string]:readonly [number,number,number]}={
 verse:[78,94,180],build:[158,65,198],hook:[230,80,120],drop:[230,135,60],break:[50,82,130]
};
export function normalizeGoveeJourneyV1098(raw:unknown):GoveeJourneySettingsV1098{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_JOURNEY_V1098};
 const x=raw as Partial<GoveeJourneySettingsV1098>;
 if(x.schema!=='govee-journey-v1098')return {...DEFAULT_GOVEE_JOURNEY_V1098};
 return {schema:'govee-journey-v1098',enabled:x.enabled===true,
  strength:finite(x.strength)?Math.round(clamp(x.strength,0,60)):30,
  style:x.style==='cinematic'||x.style==='festival'?x.style:'balanced'};
}
export function loadGoveeJourneyV1098():GoveeJourneySettingsV1098{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_JOURNEY_V1098};
 try{return normalizeGoveeJourneyV1098(JSON.parse(window.localStorage.getItem(GOVEE_JOURNEY_KEY_V1098)||'null'));}
 catch{return {...DEFAULT_GOVEE_JOURNEY_V1098};}
}
export function saveGoveeJourneyV1098(value:GoveeJourneySettingsV1098):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeJourneyV1098(value);
 try{window.localStorage.setItem(GOVEE_JOURNEY_KEY_V1098,JSON.stringify(safe));
  window.dispatchEvent(new Event(GOVEE_JOURNEY_EVENT_V1098));}
 catch{/* Storage failure never enables a feature. */}
}
/** Grade a pre-authorized V1096 cue; never create a new music phase or increase intensity. */
export function planGoveeColorJourneyV1098(input:{settings:unknown;phase:GoveePhaseCueV1027;
 base:GoveeRoomDecisionV1096}):GoveeJourneyDecisionV1098{
 const s=normalizeGoveeJourneyV1098(input?.settings);
 if(!s.enabled||s.strength<=0)return OFF('Farbdramaturgie nicht freigegeben');
 const base=input?.base,phase=input?.phase;
 if(!base?.active||!base.zone||!ZONES.includes(base.zone)||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))
  return OFF('Aktiver und begrenzter V1096-Raum-Cue erforderlich');
 if(!phase?.verified||!Object.hasOwn(MOODS,phase.phase)||base.phase!==phase.phase||
  !finite(phase.transition)||phase.transition<0||phase.transition>1)
  return OFF('Nur bestätigte, konsistente V318-Musikabschnitte');
 const target=MOODS[phase.phase],index=ZONES.indexOf(base.zone);
 const styleFactor=s.style==='festival'?1:s.style==='cinematic'?.7:.85;
 const progress=.25+.75*phase.transition;
 const amount=clamp(s.strength/60*styleFactor*progress,0,1);
 const offset=index===0?0:index===1?8:index===2?-6:4;
 const graded=(channel:'r'|'g'|'b',targetChannel:number)=>{
  const goal=clamp(targetChannel+(channel==='b'?-offset:offset),0,255);
  const delta=clamp(goal-base.accent[channel],-24,24)*amount;
  return Math.round(clamp(base.accent[channel]+delta,0,255));
 };
 const accent={r:graded('r',target[0]),g:graded('g',target[1]),b:graded('b',target[2])};
 // No more tint, brightness, or hardware commands than the previous release.
 const mixFactor=clamp(1-.16*amount,0,1);
 const brightnessFactor=clamp(1-.018*amount,.98,1);
 return {active:true,reason:'Bestätigte V318-Phase und bestehende V1096-Freigabe',zone:base.zone,
  phase:base.phase,accent,mixFactor,brightnessFactor};
}
export function applyGoveeColorJourneyV1098(base:GoveeRoomDecisionV1096,
 decision:GoveeJourneyDecisionV1098):GoveeRoomDecisionV1096{
 if(!base?.active||!decision?.active||decision.zone!==base.zone||decision.phase!==base.phase||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !finite(decision.mixFactor)||decision.mixFactor<0||decision.mixFactor>1||
  !finite(decision.brightnessFactor)||decision.brightnessFactor<.98||decision.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255&&
   finite(decision.accent?.[k])&&decision.accent[k]>=0&&decision.accent[k]<=255&&
   Math.abs(decision.accent[k]-base.accent[k])<=24))return base;
 return {...base,accent:decision.accent,mix:clamp(base.mix*decision.mixFactor,0,base.mix),
  brightnessFactor:clamp(base.brightnessFactor*decision.brightnessFactor,.92,base.brightnessFactor)};
}
