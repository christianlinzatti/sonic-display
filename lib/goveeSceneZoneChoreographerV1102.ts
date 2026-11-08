/** V1102 Govee Scene Zone Choreographer.
 * Creative, opt-in dim-only weighting of ALREADY authorized V1096 room accents.
 * Uses the current/previous verified V318 phase; no independent clock, events,
 * power action, new sender or inferred song structure. Manual V1100 weights win.
 */
import type {GoveeRoomDecisionV1096} from './goveeRoomLightingV1096';
import type {GoveePhaseCueV1027,GoveeZoneV1027} from './goveeConcertSyncV1027';
export const GOVEE_CHOREOGRAPHER_KEY_V1102='sonic-display:govee-zone-choreographer-v1102';
export const GOVEE_CHOREOGRAPHER_EVENT_V1102='sonic-display:govee-zone-choreographer-changed-v1102';
export type GoveeSceneZoneStyleV1102='balanced'|'cinematic'|'festival';
export type GoveeSceneZoneSettingsV1102={schema:'govee-zone-choreographer-v1102';enabled:boolean;strength:number;style:GoveeSceneZoneStyleV1102};
export const DEFAULT_GOVEE_CHOREOGRAPHER_V1102:GoveeSceneZoneSettingsV1102={schema:'govee-zone-choreographer-v1102',enabled:false,strength:60,style:'balanced'};
export type GoveeSceneZoneDecisionV1102={active:boolean;reason:string;zone:GoveeZoneV1027|null;phase:string;previous:string;weight:number;mixFactor:number};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const ZONES=['wall','rhythm','neon','ambient'] as const;
const PHASES=['verse','build','hook','drop','break'] as const;
type SceneV1102=typeof PHASES[number];
type WeightRowV1102=Record<GoveeZoneV1027,number>;
const BALANCED:Record<SceneV1102,WeightRowV1102>={
 verse:{wall:.64,rhythm:.52,neon:.45,ambient:1},
 build:{wall:1,rhythm:.80,neon:.75,ambient:.62},
 hook:{wall:1,rhythm:1,neon:.93,ambient:.72},
 drop:{wall:.92,rhythm:1,neon:1,ambient:.52},
 break:{wall:.43,rhythm:.25,neon:.28,ambient:1}
};
const CINEMATIC:Record<SceneV1102,WeightRowV1102>={
 verse:{wall:.60,rhythm:.34,neon:.40,ambient:1},
 build:{wall:1,rhythm:.63,neon:.79,ambient:.68},
 hook:{wall:1,rhythm:.79,neon:.91,ambient:.75},
 drop:{wall:.94,rhythm:1,neon:.85,ambient:.51},
 break:{wall:.38,rhythm:.20,neon:.23,ambient:1}
};
const FESTIVAL:Record<SceneV1102,WeightRowV1102>={
 verse:{wall:.60,rhythm:.62,neon:.70,ambient:.84},
 build:{wall:.89,rhythm:.95,neon:1,ambient:.62},
 hook:{wall:1,rhythm:1,neon:1,ambient:.72},
 drop:{wall:1,rhythm:1,neon:1,ambient:.40},
 break:{wall:.43,rhythm:.31,neon:.26,ambient:1}
};
const STYLES={balanced:BALANCED,cinematic:CINEMATIC,festival:FESTIVAL};
const off=(reason:string):GoveeSceneZoneDecisionV1102=>({active:false,reason,zone:null,phase:'none',previous:'none',weight:1,mixFactor:1});
export function normalizeGoveeChoreographerV1102(raw:unknown):GoveeSceneZoneSettingsV1102{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_CHOREOGRAPHER_V1102};
 const x=raw as Partial<GoveeSceneZoneSettingsV1102>;
 if(x.schema!=='govee-zone-choreographer-v1102')return {...DEFAULT_GOVEE_CHOREOGRAPHER_V1102};
 return {schema:'govee-zone-choreographer-v1102',enabled:x.enabled===true,
  strength:finite(x.strength)?Math.round(clamp(x.strength,0,100)):60,
  style:x.style==='cinematic'||x.style==='festival'?x.style:'balanced'};
}
export function loadGoveeChoreographerV1102():GoveeSceneZoneSettingsV1102{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_CHOREOGRAPHER_V1102};
 try{return normalizeGoveeChoreographerV1102(JSON.parse(window.localStorage.getItem(GOVEE_CHOREOGRAPHER_KEY_V1102)||'null'));}
 catch{return {...DEFAULT_GOVEE_CHOREOGRAPHER_V1102};}
}
export function saveGoveeChoreographerV1102(value:GoveeSceneZoneSettingsV1102):void{
 if(typeof window==='undefined')return;
 try{window.localStorage.setItem(GOVEE_CHOREOGRAPHER_KEY_V1102,JSON.stringify(normalizeGoveeChoreographerV1102(value)));
  window.dispatchEvent(new Event(GOVEE_CHOREOGRAPHER_EVENT_V1102));}
 catch{/* Storage failures must not grant device authorization. */}
}
/** Interpolates only known verified phase labels, never predicts the next phase.
 * Previous is ignored if unknown; transition is supplied by the existing V318 resolver.
 */
export function planGoveeSceneZoneV1102(input:{settings:unknown;base:GoveeRoomDecisionV1096;phase:GoveePhaseCueV1027}):GoveeSceneZoneDecisionV1102{
 const settings=normalizeGoveeChoreographerV1102(input?.settings),base=input?.base,phase=input?.phase;
 if(!settings.enabled||settings.strength===0)return off('Zonen-Choreografie ist ausgeschaltet');
 if(!base?.active||!base.zone||!ZONES.includes(base.zone)||
  !PHASES.includes(base.phase as SceneV1102)||!finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))
  return off('Kein freigegebener V1096-Cue');
 if(!phase?.verified||phase.phase!==base.phase||!finite(phase.transition)||phase.transition<0||phase.transition>1)
  return off('Nur eine übereinstimmende, bestätigte V318-Phase');
 const zone=base.zone,table=STYLES[settings.style];
 const target=table[phase.phase as SceneV1102][zone];
 const prev=PHASES.includes(phase.previous as SceneV1102)?phase.previous as SceneV1102:null;
 const prior=prev?table[prev][zone]:target;
 // Blend during the beginning of the current, verified section; never anticipate its successor.
 const x=clamp(phase.transition/.30,0,1),ease=x*x*(3-2*x);
 const weight=clamp(prior*(1-ease)+target*ease,0,1);
 const mixFactor=clamp(1-(settings.strength/100)*(1-weight),0,1);
 return {active:true,reason:'Zonen-Fokus aus bestätigtem Songabschnitt',zone,phase:base.phase,
  previous:prev??'unknown',weight,mixFactor};
}
/** Only dims the additional, already authorized tint. Never modifies accent RGB
 * or raises existing Govee lamp brightness. The V1096/V961 caps remain final. */
export function applyGoveeSceneZoneV1102(base:GoveeRoomDecisionV1096,decision:GoveeSceneZoneDecisionV1102):GoveeRoomDecisionV1096{
 if(!base?.active||!decision?.active||decision.zone!==base.zone||decision.phase!==base.phase||
  !finite(base.mix)||base.mix<0||base.mix>.12||
  !finite(base.brightnessFactor)||base.brightnessFactor<.92||base.brightnessFactor>1||
  !finite(decision.weight)||decision.weight<0||decision.weight>1||
  !finite(decision.mixFactor)||decision.mixFactor<0||decision.mixFactor>1||
  !(['r','g','b'] as const).every(k=>finite(base.accent?.[k])&&base.accent[k]>=0&&base.accent[k]<=255))return base;
 return {...base,mix:clamp(base.mix*decision.mixFactor,0,base.mix)};
}
