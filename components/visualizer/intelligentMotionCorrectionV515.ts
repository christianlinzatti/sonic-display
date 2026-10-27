/** V515 – bounded correction of AUTO-GENERATED additive vocal accents only.
 * Source animations, user-authored tracks, mixers, hips, feet and mouth are never
 * edited. V514 diagnostics may suggest reviewing a foot slide, but are NOT a
 * reliable foot-contact signal and must not be used to shift planted feet.
 */
import type {VocalDanceAccentV472} from './vocalAwareChoreographyV472';
import type {QualityEventV514} from './motionQualityInspectorV514';

type ChannelV515='head'|'chest'|'arms'|'side';
const channels:readonly ChannelV515[]=['head','chest','arms','side'];
const finite=(v:number)=>Number.isFinite(v)?v:0;
const clamp=(x:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,x));
export type MotionCorrectionStateV515={value:Record<ChannelV515,number>;velocity:Record<ChannelV515,number>};
export const createMotionCorrectionStateV515=():MotionCorrectionStateV515=>({value:{head:0,chest:0,arms:0,side:0},velocity:{head:0,chest:0,arms:0,side:0}});
export function resetMotionCorrectionV515(state:MotionCorrectionStateV515):void {
 for(const k of channels){state.value[k]=0;state.velocity[k]=0;}
}
export interface MotionCorrectionContextV515 {
 playing:boolean;reducedMotion:boolean;authored:boolean;enabled?:boolean;
}
/**
 * Velocity/acceleration limiting is frame-rate independent in physical units.
 * Discontinuities (seek, stalled or background frames) reset the auxiliary
 * smoother. Manual priority bypasses the smoother byte-for-byte.
 */
export function correctAutomaticAccentV515(
 target:VocalDanceAccentV472,state:MotionCorrectionStateV515,delta:number,
 context:MotionCorrectionContextV515,
):VocalDanceAccentV472 {
 if(context.authored||context.enabled===false){resetMotionCorrectionV515(state);return target;}
 if(!context.playing||context.reducedMotion||!target.active){resetMotionCorrectionV515(state);return target;}
 if(!Number.isFinite(delta)||delta<=0||delta>.25){resetMotionCorrectionV515(state);return target;}
 const v:{head:number;chest:number;arms:number;side:number}={head:0,chest:0,arms:0,side:0};
 for(const k of channels){
  const limit=k==='side'?1:.12;
  const desired=clamp(finite(target[k]),k==='side'?-limit:0,limit);
  const old=clamp(finite(state.value[k]),k==='side'?-limit:0,limit);
  const previousVelocity=finite(state.velocity[k]);
  const maxSpeed=k==='side'?8:k==='arms'?.35:.26;
  const maxAcceleration=k==='side'?90:3.5;
  // Desired velocity is bounded by both maximum speed and available distance.
  const desiredVelocity=clamp((desired-old)/delta,-maxSpeed,maxSpeed);
  const velocity=clamp(desiredVelocity,previousVelocity-maxAcceleration*delta,previousVelocity+maxAcceleration*delta);
  const next=(desired-old)*(desired-(old+velocity*delta))<=0?desired:old+velocity*delta;
  v[k]=clamp(next,k==='side'?-limit:0,limit);
  state.velocity[k]=(v[k]-old)/delta;
  state.value[k]=v[k];
 }
 return {...target,...v,active:target.active};
}
export type MotionCorrectionAdviceV515={
 kind:QualityEventV514['kind']; action:string; explanation:string;
 /** Never claim an authored GLB pose is safe to auto-edit from V514 alone. */
 automatic:boolean; priority:'review'|'high';
};
export function correctionAdviceV515(event:QualityEventV514):MotionCorrectionAdviceV515|null {
 if(!Number.isFinite(event.severity)||event.severity<0||event.severity>1||!Number.isFinite(event.at)||
  !Number.isInteger(event.slot)||event.slot<0||event.slot>3)return null;
 const priority=event.severity>=.7?'high':'review';
 const suggestions:{[K in QualityEventV514['kind']]:[string,string]}={
  'joint-angle':['Gelenkpose prüfen','Animation beziehungsweise Retargeting kontrollieren; extreme Tanzposen können beabsichtigt sein.'],
  'motion-jump':['Blend-Übergang prüfen','Bei automatisch erzeugter Zusatzgestik Geschwindigkeits- und Beschleunigungsgrenzen verwenden.'],
  'foot-slide':['Bodenkontakt prüfen','Nur bei verifiziertem Standfuß Kontakt-IK kalibrieren; GLB-Clip nicht verschieben.'],
  'body-lean':['Balance prüfen','Ursprüngliche Choreografie, Hüftkalibrierung und Kameraansicht vergleichen.'],
 };
 const item=suggestions[event.kind];return item?{kind:event.kind,action:item[0],explanation:item[1],automatic:false,priority}:null;
}
