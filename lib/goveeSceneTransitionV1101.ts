/** V1101 · Govee Scene Transition Smoother.
 * Pure scene-entry attenuation, applied only to an explicitly approved V1096
 * cue after V1100 and before the existing V1096/V961 safety governors.
 * No timers, inferred music events, lamp commands or brightness increases.
 */
import type {GoveeRoomDecisionV1096} from './goveeRoomLightingV1096';
import type {GoveePhaseCueV1027} from './goveeConcertSyncV1027';

export const GOVEE_TRANSITION_KEY_V1101='sonic-display:govee-scene-transition-v1101';
export const GOVEE_TRANSITION_EVENT_V1101='sonic-display:govee-scene-transition-changed-v1101';
export type GoveeTransitionStyleV1101='gentle'|'cinematic'|'festival';
export type GoveeTransitionSettingsV1101={schema:'govee-scene-transition-v1101';enabled:boolean;strength:number;style:GoveeTransitionStyleV1101};
export const DEFAULT_GOVEE_TRANSITION_V1101:GoveeTransitionSettingsV1101={
 schema:'govee-scene-transition-v1101',enabled:false,strength:50,style:'gentle'};
export type GoveeTransitionDecisionV1101={active:boolean;reason:string;phase:string;zone:string|null;
 progress:number;fade:number;mixFactor:number;brightnessFactor:number};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,x));
const OFF=(reason:string):GoveeTransitionDecisionV1101=>({active:false,reason,phase:'none',zone:null,
 progress:0,fade:1,mixFactor:1,brightnessFactor:1});
const ZONES=['wall','rhythm','neon','ambient'] as const;
const PHASES=['verse','build','hook','drop','break'] as const;
const STYLE_WINDOW:Record<GoveeTransitionStyleV1101,number>={gentle:.5,cinematic:.85,festival:.27};

export function normalizeGoveeTransitionV1101(raw:unknown):GoveeTransitionSettingsV1101{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_TRANSITION_V1101};
 const s=raw as Partial<GoveeTransitionSettingsV1101>;
 if(s.schema!=='govee-scene-transition-v1101')return {...DEFAULT_GOVEE_TRANSITION_V1101};
 return {schema:'govee-scene-transition-v1101',enabled:s.enabled===true,
  strength:finite(s.strength)?Math.round(clamp(s.strength,0,80)):50,
  style:s.style==='cinematic'||s.style==='festival'?s.style:'gentle'};
}
export function loadGoveeTransitionV1101():GoveeTransitionSettingsV1101{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_TRANSITION_V1101};
 try{return normalizeGoveeTransitionV1101(JSON.parse(window.localStorage.getItem(GOVEE_TRANSITION_KEY_V1101)||'null'));}
 catch{return {...DEFAULT_GOVEE_TRANSITION_V1101};}
}
export function saveGoveeTransitionV1101(raw:GoveeTransitionSettingsV1101):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeTransitionV1101(raw);
 try{window.localStorage.setItem(GOVEE_TRANSITION_KEY_V1101,JSON.stringify(safe));
  window.dispatchEvent(new Event(GOVEE_TRANSITION_EVENT_V1101));}
 catch{/* Storage failure cannot confer any hardware permission. */}
}
/** V318 supplies the verified 0..1 progress. Never estimate sections from a
 * timeline, microphone, a genre label or a playback clock. */
export function planGoveeSceneTransitionV1101(input:{settings:unknown;base:GoveeRoomDecisionV1096;
 phase:GoveePhaseCueV1027}):GoveeTransitionDecisionV1101{
 const s=normalizeGoveeTransitionV1101(input?.settings),base=input?.base,phase=input?.phase;
 if(!s.enabled||s.strength===0)return OFF('Übergangsregie nicht eingeschaltet');
 if(!base?.active||!base.zone||!ZONES.includes(base.zone)||!PHASES.includes(base.phase as (typeof PHASES)[number])||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))
  return OFF('Kein gültiger freigegebener V1096-Raum-Cue');
 if(!phase?.verified||!PHASES.includes(phase.phase as (typeof PHASES)[number])||
  base.phase!==phase.phase||!finite(phase.transition)||phase.transition<0||phase.transition>1)
  return OFF('Nur passend bestätigte V318-Musikabschnitte');
 const window=STYLE_WINDOW[s.style];
 const progress=clamp(phase.transition/window,0,1);
 const fade=progress*progress*(3-2*progress); // monotonic ease-in, zero at entry
 const factor=clamp(1-(s.strength/100)*(1-fade),.2,1);
 return {active:true,reason:'Sanfter Eintritt in bestätigten Musikabschnitt',phase:base.phase,zone:base.zone,
  progress:phase.transition,fade,mixFactor:factor,brightnessFactor:clamp(1-.01*(1-factor),.992,1)};
}
/** Strictly dim-only. V1096 still clamps RGB delta to 12 and brightness to the
 * existing cap; V961 still governs the resulting whole-lamp look. */
export function applyGoveeSceneTransitionV1101(base:GoveeRoomDecisionV1096,
 decision:GoveeTransitionDecisionV1101):GoveeRoomDecisionV1096{
 if(!base?.active||!decision?.active||base.zone!==decision.zone||base.phase!==decision.phase||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !finite(decision.progress)||decision.progress<0||decision.progress>1||
  !finite(decision.fade)||decision.fade<0||decision.fade>1||
  !finite(decision.mixFactor)||decision.mixFactor<.2||decision.mixFactor>1||
  !finite(decision.brightnessFactor)||decision.brightnessFactor<.992||decision.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))return base;
 return {...base,mix:clamp(base.mix*decision.mixFactor,0,base.mix),
  brightnessFactor:clamp(base.brightnessFactor*decision.brightnessFactor,.92,base.brightnessFactor)};
}
