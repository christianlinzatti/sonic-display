/** V1097 – Govee Spatial Light Waves.
 * An opt-in, deterministic four-zone accent on the V1096 verified-phase overlay.
 * No clock, polling, new LAN sender, inferred song section, or brightness increase.
 */
import type {GoveePhaseCueV1027} from './goveeConcertSyncV1027';
import type {GoveeRoomDecisionV1096} from './goveeRoomLightingV1096';

export const GOVEE_WAVES_KEY_V1097='sonic-display:govee-spatial-waves-v1097';
export const GOVEE_WAVES_EVENT_V1097='sonic-display:govee-spatial-waves-changed-v1097';
export type GoveeWaveStyleV1097='orbit'|'mirror'|'breath';
export type GoveeWaveSettingsV1097={schema:'govee-waves-v1097';enabled:boolean;strength:number;style:GoveeWaveStyleV1097};
export const DEFAULT_GOVEE_WAVES_V1097:GoveeWaveSettingsV1097={schema:'govee-waves-v1097',enabled:false,strength:35,style:'orbit'};
export type GoveeWaveDecisionV1097={active:boolean;reason:string;zone:string|null;wave:number;strength:number};
const OFF=(reason:string):GoveeWaveDecisionV1097=>({active:false,reason,zone:null,wave:0,strength:0});
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const ZONES=['wall','rhythm','neon','ambient'] as const;

export function normalizeGoveeWavesV1097(raw:unknown):GoveeWaveSettingsV1097{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_WAVES_V1097};
 const s=raw as Partial<GoveeWaveSettingsV1097>;
 if(s.schema!=='govee-waves-v1097')return {...DEFAULT_GOVEE_WAVES_V1097};
 return {schema:'govee-waves-v1097',enabled:s.enabled===true,
  strength:finite(s.strength)?Math.round(clamp(s.strength,0,60)):35,
  style:s.style==='mirror'||s.style==='breath'?s.style:'orbit'};
}
export function loadGoveeWavesV1097():GoveeWaveSettingsV1097{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_WAVES_V1097};
 try{return normalizeGoveeWavesV1097(JSON.parse(window.localStorage.getItem(GOVEE_WAVES_KEY_V1097)||'null'));}
 catch{return {...DEFAULT_GOVEE_WAVES_V1097};}
}
export function saveGoveeWavesV1097(raw:GoveeWaveSettingsV1097):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeWavesV1097(raw);
 try{window.localStorage.setItem(GOVEE_WAVES_KEY_V1097,JSON.stringify(safe));
  window.dispatchEvent(new Event(GOVEE_WAVES_EVENT_V1097));}
 catch{/* No silent opt-in if storage is unavailable. */}
}

/** Creates a spatial color-intensity envelope from a *verified* V318 music phase.
 * No guessed drop, no microphone read, no time-based jitter; phase.transition is
 * already the authoritative normalized section progress. */
export function planGoveeSpatialWaveV1097(input:{settings:unknown;
 base:GoveeRoomDecisionV1096;phase:GoveePhaseCueV1027}):GoveeWaveDecisionV1097{
 const s=normalizeGoveeWavesV1097(input?.settings);
 if(!s.enabled||s.strength<=0)return OFF('Räumliche Lichtwelle nicht freigegeben');
 const base=input?.base,phase=input?.phase;
 if(!base?.active||!base.zone||!ZONES.includes(base.zone)||!finite(base.mix)||base.mix<0||base.mix>.12)
  return OFF('V1096 muss für diese Leuchte aktiv und sicher sein');
 if(!phase?.verified||base.phase!==phase.phase||!finite(phase.transition)||phase.transition<0||phase.transition>1)
  return OFF('Keine bestätigte und konsistente Musikphase');
 const index=ZONES.indexOf(base.zone);
 const progress=phase.transition;
 let offset=index/4;
 if(s.style==='mirror')offset=(index===0||index===3)?0:.5;
 if(s.style==='breath')offset=0;
 const wave=.5+.5*Math.cos(2*Math.PI*(progress-offset));
 return {active:true,reason:'Bestätigte Phase, V1096-Freigabe und vorhandener V909-LAN-Sendetakt',
  zone:base.zone,wave:clamp(wave,0,1),strength:s.strength/60};
}

/** V1097 only attenuates the V1096 accent. The existing V1096 `apply`
 * enforces 12/255 per-channel slew and the old brightness ceiling, then V961
 * governs the final look. If the wave is stale/invalid, return the original cue. */
export function applyGoveeSpatialWaveV1097(base:GoveeRoomDecisionV1096,
 wave:GoveeWaveDecisionV1097):GoveeRoomDecisionV1096{
 if(!base?.active||!wave?.active||wave.zone!==base.zone||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !finite(wave.wave)||wave.wave<0||wave.wave>1||
  !finite(wave.strength)||wave.strength<0||wave.strength>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))return base;
 const envelope=1-.70*wave.strength*(1-wave.wave);
 const mix=clamp(base.mix*envelope,0,base.mix);
 const brightnessFactor=clamp(base.brightnessFactor*(1-.025*wave.strength*(1-wave.wave)),.92,base.brightnessFactor);
 // The target tint remains unchanged: only its contribution moves from zone to zone.
 return {...base,mix,brightnessFactor};
}
