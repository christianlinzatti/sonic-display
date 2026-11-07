/** V1070 · Ultimate Concert Finale 2.0 (local, deterministic, opt-in).
 * One shared *authored* last-12%-of-song score for existing Arena360 systems.
 * It only attenuates currently authorized visual or cast lanes. It cannot create
 * music events, enable a switched-off effect, assign a singer, move a performer,
 * own a camera or drive real lasers, pyrotechnics, Govee or network services.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type UltimateFinalePhaseV1070='gather'|'rise'|'climax'|'bow';
export type UltimateFinaleLaneV1070='deck'|'floating'|'holograms'|'lasers'|'led'|'cast'|'camera';
export type UltimateFinaleChannelsV1070=Record<UltimateFinaleLaneV1070,boolean>;
export type UltimateFinaleCueV1070={active:boolean;phase:UltimateFinalePhaseV1070|null;
 progress:number;focus:'none'|'performers'|'platforms'|'panorama'|'bow';
 deck:number;floating:number;holograms:number;lasers:number;led:number;cast:number;camera:number};
export const OFF_ULTIMATE_FINALE_V1070:UltimateFinaleCueV1070=Object.freeze({active:false,
 phase:null,progress:0,focus:'none',deck:1,floating:1,holograms:1,lasers:1,
 led:1,cast:1,camera:1});
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
export const FINALE_LANES_V1070:readonly UltimateFinaleLaneV1070[]=
 ['deck','floating','holograms','lasers','led','cast','camera'];
// First sample is neutral so entering the last chapter cannot cause a hard cut.
// First gather performers, then ascend around the ring, show a full panorama,
// finally fade to a bow. All seven gains remain <=1 (never auto-brighten).
const MARKERS:readonly {at:number;values:readonly number[]}[]=[
 {at:.880,values:[1,1,1,1,1,1,1]},
 {at:.905,values:[.66,.52,.69,.34,.50,.88,.88]},
 {at:.925,values:[.73,.69,.77,.49,.68,.91,.92]},
 {at:.965,values:[.94,.95,.95,.91,.93,.98,.98]},
 {at:.985,values:[1,1,1,1,1,1,1]},
 {at:.992,values:[1,1,1,1,1,1,1]},
 {at:1.000,values:[.56,.37,.54,.18,.24,.64,.77]},
];
const off=(phase:UltimateFinalePhaseV1070|null=null):UltimateFinaleCueV1070=>
 phase?{...OFF_ULTIMATE_FINALE_V1070,phase}:OFF_ULTIMATE_FINALE_V1070;
/** Scene templates are NOT observed music events: V1069 still owns verified
 * drop/beat edges and V1035 the pyro cooldown. No fabricated finale trigger.
 */
export function planUltimateConcertFinaleV1070(i:{enabled:boolean;stageIsArena:boolean;
 playing:boolean;reducedMotion:boolean;reactive:boolean;showDesignerEnabled:boolean;
 showDirectorEnabled:boolean;trackId?:string|null;progressMs?:number|null;
 durationMs?:number|null;performanceTier?:'low'|'balanced'|'high'|null;
 strength?:number|null;show?:ArenaShowCueV1040|null;
 channels?:Partial<UltimateFinaleChannelsV1070>|null;
}):UltimateFinaleCueV1070{
 if(!i.enabled||!i.stageIsArena||!i.playing||i.reducedMotion||!i.reactive||
  !i.showDesignerEnabled||!i.showDirectorEnabled||i.performanceTier==='low'||
  !i.trackId?.trim())return OFF_ULTIMATE_FINALE_V1070;
 const ms=i.progressMs,duration=i.durationMs,s=i.show,strength=i.strength;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)||!Number.isFinite(strength)||
  ms!<0||duration!<30000||ms!>duration!||strength!<=0||strength!>80||
  !s?.active||s.scene!=='finale'||s.segmentIndex!==6||
  !Number.isFinite(s.intensity)||s.intensity<=0||s.intensity>100||
  !Number.isFinite(s.fade)||s.fade<=0||s.fade>1)return OFF_ULTIMATE_FINALE_V1070;
 const progress=ms!/duration!;
 if(progress<.88||progress>1||!FINALE_LANES_V1070.some(k=>i.channels?.[k]===true))
  return OFF_ULTIMATE_FINALE_V1070;
 const phase:UltimateFinalePhaseV1070=progress<.925?'gather':
  progress<.965?'rise':progress<.992?'climax':'bow';
 const focus=phase==='gather'?'performers':phase==='rise'?'platforms':
  phase==='climax'?'panorama':'bow';
 const index=MARKERS.findIndex((marker,idx)=>idx>0&&progress<=marker.at);
 const j=index===-1?MARKERS.length-1:index;
 const earlier=MARKERS[j-1],later=MARKERS[j];
 const blend=smooth((progress-earlier.at)/(later.at-earlier.at));
 const weight=clamp(strength!/80,0,1)*clamp(s.intensity/100,0,1)*s.fade*
   (i.performanceTier==='balanced'?.65:1);
 const gains=FINALE_LANES_V1070.map((lane,k)=>{
  if(i.channels?.[lane]!==true)return 1;
  const target=earlier.values[k]*(1-blend)+later.values[k]*blend;
  return clamp(1-(1-target)*weight,.18,1);
 });
 return {active:true,phase,progress,focus,deck:gains[0],floating:gains[1],
  holograms:gains[2],lasers:gains[3],led:gains[4],cast:gains[5],camera:gains[6]};
}
