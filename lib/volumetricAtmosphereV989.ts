/** V989 — deterministic depth atmosphere layered over the already-approved V972 cue.
 * These are screen-door/WebGL shader impostors, NOT true raymarched volumetric fog.
 * No additional lights, timers, frame loop, GPU postprocessing or hardware writes.
 */
import type {VolumetricCueV972} from './volumetricStageAtmosphereV972';
import type {ConcertSceneV958,ConcertSettingsV958} from './ultimateConcertRoadmapV958';

export type AtmosphereDepthStyleV989='auto'|'soft-beams'|'ground-fog';
export type AtmosphereDepthLayerV989=Readonly<{
 kind:'beam'|'fog';side:number;z:number;opacity:number;width:number;phase:number;
}>;
export type AtmosphereDepthCueV989=Readonly<{
 active:boolean;style:'soft-beams'|'ground-fog';colorA:string;colorB:string;
 layers:readonly AtmosphereDepthLayerV989[];quality:'eco'|'balanced'|'cinematic';
}>;
export type AtmosphereDepthInputV989=Readonly<{
 base:VolumetricCueV972;scene:ConcertSceneV958|null|undefined;
 settings:ConcertSettingsV958;playing:boolean;authoredStage:boolean;lowPerformance:boolean;
 reducedMotion:boolean;lyricsVisible:boolean;positionMs:number;
}>;
const OFF:AtmosphereDepthCueV989=Object.freeze({active:false,style:'soft-beams',colorA:'#000000',colorB:'#000000',layers:[],quality:'eco'});
const HEX=/^#[0-9a-f]{6}$/i;
const bound=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,n));
/** Low-cost planes behind performers; no fake cue timestamps or automatic activation.
 * For lowPerformance devices the optional enhancement is disabled entirely;
 * the existing V972 eco setting remains the manual fallback on capable devices.
 */
export function planVolumetricAtmosphereV989(i:AtmosphereDepthInputV989):AtmosphereDepthCueV989{
 const {base,settings:s,scene}=i;
 if(!s.enabled||!s.virtualFx||!s.immersiveV966||!s.volumetricV972||!s.depthAtmosphereV989||
  !i.playing||!base.active||!scene?.verified||scene.timelineOverride||
  i.authoredStage||i.lowPerformance||s.compactFxV960||
  !Number.isFinite(i.positionMs)||i.positionMs<0||
  !Number.isFinite(s.depthStrengthV989)||s.depthStrengthV989<=0||s.depthStrengthV989>100||
  !['auto','soft-beams','ground-fog'].includes(s.depthStyleV989)||
  !['eco','balanced','cinematic'].includes(base.quality)||
  !HEX.test(base.colorA)||!HEX.test(base.colorB)||
  !Number.isFinite(base.beamOpacity)||!Number.isFinite(base.hazeOpacity)||
  !Number.isFinite(base.floorOpacity)||!Number.isFinite(base.phase)||
  base.beamOpacity<0||base.beamOpacity>.1||base.hazeOpacity<0||base.hazeOpacity>.1||
  base.floorOpacity<0||base.floorOpacity>.1)return OFF;
 const isPeak=scene.phase==='hook'||scene.phase==='build'||scene.phase==='drop';
 const style:AtmosphereDepthCueV989['style']=s.depthStyleV989==='auto'?(isPeak?'soft-beams':'ground-fog'):s.depthStyleV989;
 const layerCount=base.quality==='eco'?2:base.quality==='balanced'?4:6;
 const gain=bound(s.depthStrengthV989/100,0,1)*(i.lyricsVisible?.65:1);
 const baseOpacity=style==='soft-beams'?base.beamOpacity:Math.max(base.hazeOpacity,base.floorOpacity);
 // Enforce a strict per-plane alpha cap, lower than a full-screen flashlight.
 const opacity=bound(baseOpacity*.36*gain,0,.025);
 if(opacity<.0005)return OFF;
 const layers:AtmosphereDepthLayerV989[]=Array.from({length:layerCount},(_,index)=>{
  const fog=style==='ground-fog'||index%3===2;
  const side=index%2===0?-1:1;
  return {kind:fog?'fog':'beam',side,
   z:fog?-1.80-index*.36:-3.85-index*.28,
   width:fog?6.1+index*.26:1.65+index*.16,
   opacity:bound(opacity*(1-index*.075),0,.025),
   phase:i.reducedMotion?0:base.phase+index*.21};
 });
 return {active:true,style,colorA:base.colorA,colorB:base.colorB,layers,quality:base.quality};
}
