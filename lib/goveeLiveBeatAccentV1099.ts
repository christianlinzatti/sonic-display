/** V1099: live beat accents inside the existing authorized V1096 Govee room cue.
 * Fail closed: explicit opt-in, verified V318 hook/drop, live microphone sample.
 * No time source, intervals, network requests, on/off commands, brightness boost,
 * beat inference, or bypass of the existing V961 and V909 safety pipeline.
 */
import type {GoveePhaseCueV1027} from './goveeConcertSyncV1027';
import type {GoveeRoomDecisionV1096} from './goveeRoomLightingV1096';

export const GOVEE_BEAT_ACCENT_KEY_V1099='sonic-display:govee-live-beat-accent-v1099';
export const GOVEE_BEAT_ACCENT_EVENT_V1099='sonic-display:govee-live-beat-accent-changed-v1099';
export type GoveeBeatAccentStyleV1099='soft'|'dynamic';
export type GoveeBeatAccentSettingsV1099={schema:'govee-beat-accent-v1099';enabled:boolean;
 strength:number;style:GoveeBeatAccentStyleV1099};
export const DEFAULT_GOVEE_BEAT_ACCENT_V1099:GoveeBeatAccentSettingsV1099={
 schema:'govee-beat-accent-v1099',enabled:false,strength:35,style:'soft'};
export type GoveeBeatAccentDecisionV1099={active:boolean;reason:string;zone:string|null;
 phase:string;accent:{r:number;g:number;b:number};mixFactor:number;brightnessFactor:number;envelope:number};
const ZONES=['wall','rhythm','neon','ambient'] as const;
const ZONE_FACTOR:Record<(typeof ZONES)[number],number>={wall:.78,rhythm:1,neon:.84,ambient:.55};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,min:number,max:number)=>Math.max(min,Math.min(max,x));
const OFF=(reason:string):GoveeBeatAccentDecisionV1099=>({active:false,reason,zone:null,
 phase:'none',accent:{r:0,g:0,b:0},mixFactor:1,brightnessFactor:1,envelope:0});
export function normalizeGoveeBeatAccentV1099(raw:unknown):GoveeBeatAccentSettingsV1099{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_BEAT_ACCENT_V1099};
 const v=raw as Partial<GoveeBeatAccentSettingsV1099>;
 if(v.schema!=='govee-beat-accent-v1099')return {...DEFAULT_GOVEE_BEAT_ACCENT_V1099};
 return {schema:'govee-beat-accent-v1099',enabled:v.enabled===true,
  strength:finite(v.strength)?Math.round(clamp(v.strength,0,60)):35,
  style:v.style==='dynamic'?'dynamic':'soft'};
}
export function loadGoveeBeatAccentV1099():GoveeBeatAccentSettingsV1099{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_BEAT_ACCENT_V1099};
 try{return normalizeGoveeBeatAccentV1099(JSON.parse(window.localStorage.getItem(GOVEE_BEAT_ACCENT_KEY_V1099)||'null'));}
 catch{return {...DEFAULT_GOVEE_BEAT_ACCENT_V1099};}
}
export function saveGoveeBeatAccentV1099(raw:GoveeBeatAccentSettingsV1099):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeBeatAccentV1099(raw);
 try{window.localStorage.setItem(GOVEE_BEAT_ACCENT_KEY_V1099,JSON.stringify(safe));
  window.dispatchEvent(new Event(GOVEE_BEAT_ACCENT_EVENT_V1099));}
 catch{/* No approval persists if storage is unavailable. */}
}
/** The sample age comes from the EXISTING microphone observer; no second timer.
 * An observed beat without a confirmed section never authorizes a show drop.
 */
export function planGoveeBeatAccentV1099(input:{settings:unknown;phase:GoveePhaseCueV1027;
 base:GoveeRoomDecisionV1096;microphoneActive:boolean;beatObserved:boolean;
 beatStrength:number;sampleAgeMs:number}):GoveeBeatAccentDecisionV1099{
 const s=normalizeGoveeBeatAccentV1099(input?.settings);
 if(!s.enabled||s.strength<=0)return OFF('Live-Beat-Akzente nicht freigegeben');
 const b=input?.base,p=input?.phase;
 if(!b?.active||!b.zone||!ZONES.includes(b.zone)||!finite(b.mix)||b.mix<0||b.mix>.12||
  !finite(b.brightnessFactor)||b.brightnessFactor<.92||b.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(b.accent?.[k])&&b.accent[k]>=0&&b.accent[k]<=255))
  return OFF('Ein gültiger V1096-Raumlicht-Cue muss aktiv sein');
 if(!p?.verified||b.phase!==p.phase||(p.phase!=='hook'&&p.phase!=='drop')||
  !finite(p.transition)||p.transition<0||p.transition>1)
  return OFF('Nur bestätigte Hook- oder Drop-Abschnitte');
 if(input.microphoneActive!==true||input.beatObserved!==true||
  !finite(input.beatStrength)||input.beatStrength<.78||input.beatStrength>1||
  !finite(input.sampleAgeMs)||input.sampleAgeMs<0||input.sampleAgeMs>600)
  return OFF('Nur aktuelle, starke und tatsächlich beobachtete Beats');
 const zone=b.zone as (typeof ZONES)[number];
 const intensity=clamp(s.strength/60*(s.style==='dynamic'?1:.72)*
  ((input.beatStrength-.78)/.22)*ZONE_FACTOR[zone]*(1-input.sampleAgeMs/600),0,1);
 if(intensity<=0)return OFF('Beat-Akzent abgeklungen');
 // The tint never differs by more than 12/255 from the previous authorized cue.
 const target={r:clamp(b.accent.r+12*intensity,0,255),
  g:clamp(b.accent.g+(zone==='rhythm'?7:-5)*intensity,0,255),
  b:clamp(b.accent.b+(zone==='ambient'?6:-8)*intensity,0,255)};
 const accent={r:Math.round(target.r),g:Math.round(target.g),b:Math.round(target.b)};
 return {active:true,reason:'Verifizierter Abschnitt und frischer Mikrofon-Beat',zone,phase:b.phase,
  accent,mixFactor:clamp(1-.08*intensity,.92,1),
  brightnessFactor:clamp(1-.015*intensity,.985,1),envelope:intensity};
}
/** Modify only the already-approved V1096 cue. Its final look passes through
 * V1096 (per-channel slew and brightness cap) and V961 (global governor).
 */
export function applyGoveeBeatAccentV1099(base:GoveeRoomDecisionV1096,
 decision:GoveeBeatAccentDecisionV1099):GoveeRoomDecisionV1096{
 if(!base?.active||!decision?.active||decision.zone!==base.zone||decision.phase!==base.phase||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !finite(decision.envelope)||decision.envelope<=0||decision.envelope>1||
  !finite(decision.mixFactor)||decision.mixFactor<.92||decision.mixFactor>1||
  !finite(decision.brightnessFactor)||decision.brightnessFactor<.985||decision.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255&&
   finite(decision.accent?.[k])&&decision.accent[k]>=0&&decision.accent[k]<=255&&
   Math.abs(decision.accent[k]-base.accent[k])<=12))return base;
 return {...base,accent:decision.accent,
  mix:clamp(base.mix*decision.mixFactor,0,base.mix),
  brightnessFactor:clamp(base.brightnessFactor*decision.brightnessFactor,.92,base.brightnessFactor)};
}
