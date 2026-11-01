/** V787: deterministic, hysteretic LOD policy for a rig-validated diagnostic preview.
 * Does not generate reduced meshes or claim a GPU improvement. No DOM/Three dependency. */
export type LodV787='LOD0'|'LOD1'|'LOD2';
export type LodAvailabilityV787=Readonly<Record<LodV787,boolean>>;
export type LodStateV787={tier:LodV787;lastSwitchMs:number};
export type LodDecisionV787={tier:LodV787;changed:boolean;reason:string;requested:LodV787};
export const LOD_POLICY_V787={midDistance:4,farDistance:8,hysteresis:.55,minHoldMs:550} as const;
const ordinal:Readonly<Record<LodV787,number>>={LOD0:0,LOD1:1,LOD2:2};
const levels:readonly LodV787[]=['LOD0','LOD1','LOD2'];
function requested(distance:number,prior:LodV787):LodV787{
 const {midDistance:m,farDistance:f,hysteresis:h}=LOD_POLICY_V787;
 // Hysteresis prevents oscillations even when the camera hovers near an edge.
 if(prior==='LOD0')return distance>=f+h?'LOD2':distance>=m+h?'LOD1':'LOD0';
 if(prior==='LOD1')return distance>=f+h?'LOD2':distance<m-h?'LOD0':'LOD1';
 return distance<m-h?'LOD0':distance<f-h?'LOD1':'LOD2';
}
export function selectSmartAvatarLodV787(distance:number,nowMs:number,availability:LodAvailabilityV787,
 state:LodStateV787={tier:'LOD0',lastSwitchMs:Number.NEGATIVE_INFINITY}):LodDecisionV787{
 if(!Number.isFinite(distance)||distance<0||!Number.isFinite(nowMs))throw Error('V787: Distanz/Zeit ungueltig');
 if(!levels.every(l=>typeof availability[l]==='boolean'))throw Error('V787: Verfuegbarkeit ungueltig');
 if(!availability.LOD0)throw Error('V787: LOD0 fehlt – keine sichere Basisvariante');
 const wanted=requested(distance,state.tier);
 // If a cheaper LOD is absent, prefer the finest *available* one. Never
 // silently degrade further than requested or load a missing URL.
 const desired=levels.slice(0,ordinal[wanted]+1).reverse().find(l=>availability[l])??'LOD0';
 if(!availability[state.tier])return {tier:desired,changed:desired!==state.tier,requested:wanted,reason:'Aktuelle Variante fehlt; sichere Ersatzvariante'};
 if(nowMs<state.lastSwitchMs||nowMs-state.lastSwitchMs<LOD_POLICY_V787.minHoldMs)
   return {tier:state.tier,changed:false,requested:wanted,reason:'Haltezeit gegen LOD-Flattern'};
 if(desired===state.tier)return {tier:state.tier,changed:false,requested:wanted,reason:wanted!==desired?'LOD-Variante fehlt – hoehere Qualitaet':'Qualitaetsstufe beibehalten'};
 return {tier:desired,changed:true,requested:wanted,reason:wanted!==desired?'Ersatzvariante mit hoeherer Qualitaet':'Distanz und Hysterese'};
}
export function triangleSavingsV787(base:number,variant:number):number|null{
 if(!Number.isSafeInteger(base)||base<=0||!Number.isSafeInteger(variant)||variant<0)return null;
 return Math.round((1-variant/base)*1000)/10;
}
