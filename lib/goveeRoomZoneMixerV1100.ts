/** V1100 – Govee Room Zone Mixer.
 * Four deliberate, opt-in room-light zone weights; attenuates only a V1096-
 * approved cue. No new music source, timer, network sender or device command.
 */
import type {GoveeRoomDecisionV1096} from './goveeRoomLightingV1096';
import type {GoveePhaseCueV1027} from './goveeConcertSyncV1027';

export const GOVEE_ZONE_MIXER_KEY_V1100='sonic-display:govee-room-zone-mixer-v1100';
export const GOVEE_ZONE_MIXER_EVENT_V1100='sonic-display:govee-room-zone-mixer-changed-v1100';
export type GoveeRoomZoneV1100='wall'|'rhythm'|'neon'|'ambient';
export const GOVEE_ROOM_ZONES_V1100:readonly GoveeRoomZoneV1100[]=['wall','rhythm','neon','ambient'];
export type GoveeZoneWeightsV1100=Record<GoveeRoomZoneV1100,number>;
export type GoveeZonePresetV1100='balanced'|'stage'|'ambient';
export type GoveeZoneMixerSettingsV1100={schema:'govee-zone-mixer-v1100';enabled:boolean;weights:GoveeZoneWeightsV1100};
export const GOVEE_ZONE_PRESETS_V1100:Record<GoveeZonePresetV1100,GoveeZoneWeightsV1100>={
 balanced:{wall:100,rhythm:100,neon:100,ambient:100},
 stage:{wall:100,rhythm:90,neon:70,ambient:40},
 ambient:{wall:45,rhythm:45,neon:65,ambient:100}
};
export const DEFAULT_GOVEE_ZONE_MIXER_V1100:GoveeZoneMixerSettingsV1100={
 schema:'govee-zone-mixer-v1100',enabled:false,weights:{...GOVEE_ZONE_PRESETS_V1100.balanced}};
export type GoveeZoneMixDecisionV1100={active:boolean;reason:string;zone:GoveeRoomZoneV1100|null;
 phase:string;weight:number;mixFactor:number;brightnessFactor:number};
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const OFF=(reason:string):GoveeZoneMixDecisionV1100=>({active:false,reason,zone:null,
 phase:'none',weight:100,mixFactor:1,brightnessFactor:1});
export function normalizeGoveeZoneMixerV1100(raw:unknown):GoveeZoneMixerSettingsV1100{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_ZONE_MIXER_V1100,weights:{...GOVEE_ZONE_PRESETS_V1100.balanced}};
 const v=raw as Partial<GoveeZoneMixerSettingsV1100>;
 if(v.schema!=='govee-zone-mixer-v1100')return {...DEFAULT_GOVEE_ZONE_MIXER_V1100,weights:{...GOVEE_ZONE_PRESETS_V1100.balanced}};
 const w=v.weights&&typeof v.weights==='object'&&!Array.isArray(v.weights)?v.weights:undefined;
 const weights={} as GoveeZoneWeightsV1100;
 for(const zone of GOVEE_ROOM_ZONES_V1100){
  const x=w?.[zone];weights[zone]=finite(x)?Math.round(clamp(x,0,100)):100;
 }
 return {schema:'govee-zone-mixer-v1100',enabled:v.enabled===true,weights};
}
export function loadGoveeZoneMixerV1100():GoveeZoneMixerSettingsV1100{
 if(typeof window==='undefined')return normalizeGoveeZoneMixerV1100(null);
 try{return normalizeGoveeZoneMixerV1100(JSON.parse(window.localStorage.getItem(GOVEE_ZONE_MIXER_KEY_V1100)||'null'));}
 catch{return normalizeGoveeZoneMixerV1100(null);}
}
export function saveGoveeZoneMixerV1100(value:GoveeZoneMixerSettingsV1100):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeZoneMixerV1100(value);
 try{window.localStorage.setItem(GOVEE_ZONE_MIXER_KEY_V1100,JSON.stringify(safe));
  window.dispatchEvent(new Event(GOVEE_ZONE_MIXER_EVENT_V1100));}
 catch{/* No implicit enable on storage failure. */}
}
/** A verified V318 phase and the live V1096 authorization are both mandatory.
 * Weight 0 suppresses ONLY the extra tint, never switches a lamp on/off. */
export function planGoveeZoneMixV1100(input:{settings:unknown;base:GoveeRoomDecisionV1096;
 phase:GoveePhaseCueV1027}):GoveeZoneMixDecisionV1100{
 const settings=normalizeGoveeZoneMixerV1100(input?.settings),base=input?.base,phase=input?.phase;
 if(!settings.enabled)return OFF('Zonenmischer nicht eingeschaltet');
 if(!base?.active||!base.zone||!GOVEE_ROOM_ZONES_V1100.includes(base.zone)||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))
  return OFF('Nur ein bereits genehmigter V1096-Raum-Cue darf angepasst werden');
 if(!phase?.verified||base.phase!==phase.phase||!finite(phase.transition)||
  phase.transition<0||phase.transition>1)return OFF('Nur eine bestätigte, passende Musikphase');
 const zone=base.zone as GoveeRoomZoneV1100;
 const weight=settings.weights[zone];
 const f=clamp(weight/100,0,1);
 return {active:true,reason:'Manuell freigegebene Zonengewichtung',zone,
  phase:base.phase,weight,mixFactor:f,brightnessFactor:clamp(1-.035*(1-f),.965,1)};
}
/** Never boost the preexisting V1096 tint, brightness or per-channel safety cap.
 * The original V1096 apply and V961 governor remain LAST before V909 send. */
export function applyGoveeZoneMixV1100(base:GoveeRoomDecisionV1096,
 decision:GoveeZoneMixDecisionV1100):GoveeRoomDecisionV1096{
 if(!base?.active||!decision?.active||decision.zone!==base.zone||decision.phase!==base.phase||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !finite(decision.weight)||decision.weight<0||decision.weight>100||
  !finite(decision.mixFactor)||decision.mixFactor<0||decision.mixFactor>1||
  Math.abs(decision.mixFactor-decision.weight/100)>1e-9||
  !finite(decision.brightnessFactor)||decision.brightnessFactor<.965||decision.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))return base;
 return {...base,mix:clamp(base.mix*decision.mixFactor,0,base.mix),
  brightnessFactor:clamp(base.brightnessFactor*decision.brightnessFactor,.92,base.brightnessFactor)};
}
