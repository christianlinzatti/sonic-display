/** V1037 · Pure movement planning for the outer eight-piece scenic petal deck.
 * The cast stands on the unchanged V1031 center. Petals occupy ONLY an annulus
 * outside radius 2.84; they are scenery, never load-bearing avatar platforms.
 */
import {normalizeArenaSectionV1034} from './arena360ShowV1034';
export type ArenaTransformationModeV1037='auto'|'fan'|'spiral'|'halo';
export type ArenaPetalPatternV1037='closed'|'fan'|'spiral'|'halo';
export type ArenaTransformationCueV1037={pattern:ArenaPetalPatternV1037;extension:number;lift:number;twist:number;brightness:number};
export type ArenaTransformationStateV1037={extension:number;lift:number;twist:number};
export const INITIAL_ARENA_TRANSFORMATION_V1037: ArenaTransformationStateV1037={extension:0,lift:0,twist:0};
const clamp=(x:number,min:number,max:number)=>Number.isFinite(x)?Math.max(min,Math.min(max,x)):min;
const PLAN:Record<ReturnType<typeof normalizeArenaSectionV1034>,ArenaPetalPatternV1037>={
 verse:'halo',hook:'fan',drop:'fan',build:'spiral',break:'closed',
};
/** No audio event is synthesized. A safe resting geometry is returned for disabled
 * visual motion or unknown intensity; manual modes never fake a Drop cue. */
export function planArenaTransformationV1037(opts:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 section?:string|null;mode?:ArenaTransformationModeV1037;strength?:number;energy?:number;
}):ArenaTransformationCueV1037 {
 if(!opts.enabled||opts.reducedMotion||!opts.playing||!opts.reactive)
  return {pattern:'closed',extension:0,lift:0,twist:0,brightness:.22};
 const mode=opts.mode==='fan'||opts.mode==='spiral'||opts.mode==='halo'?opts.mode:'auto';
 const section=normalizeArenaSectionV1034(opts.section);
 const pattern=mode==='auto'?PLAN[section]:mode;
 const strength=clamp(opts.strength??70,0,100)/100;
 const energy=clamp(opts.energy??0,0,1);
 const sectionGain=section==='drop'?1:section==='hook'?.89:section==='build'?.72:section==='break'?.25:.47;
 const gain=strength*sectionGain*(.85+.15*energy);
 const base=pattern==='closed'?0:pattern==='halo'?.18:pattern==='spiral'?.65:1;
 return {pattern,extension:clamp(.46*base*gain,0,.46),
  lift:clamp(.16*gain*(pattern==='spiral'?1:.68),0,.16),
  twist:clamp(.09*gain,0,.09),brightness:clamp(.28+.55*gain,.22,.83)};
}
/** Frame-rate independent, bounded, no spring overshoot or accumulated drift.
 * Playback pause retains the last position; disable/reduced motion parks petals. */
export function stepArenaTransformationV1037(
 previous:ArenaTransformationStateV1037,dt:number,
 cue:ArenaTransformationCueV1037,opts:{playing:boolean;enabled:boolean;reducedMotion:boolean}
):ArenaTransformationStateV1037 {
 if(!opts.enabled||opts.reducedMotion)return {...INITIAL_ARENA_TRANSFORMATION_V1037};
 const old={extension:clamp(previous.extension,0,.46),lift:clamp(previous.lift,0,.16),twist:clamp(previous.twist,0,.09)};
 if(!opts.playing)return old;
 const blend=1-Math.exp(-clamp(dt,0,.1)*1.7);
 return {extension:clamp(old.extension+(cue.extension-old.extension)*blend,0,.46),
  lift:clamp(old.lift+(cue.lift-old.lift)*blend,0,.16),
  twist:clamp(old.twist+(cue.twist-old.twist)*blend,0,.09)};
}
/** Absolute sample per segment: no angular integration, and every segment stays
 * inside radius 3.60 so it cannot reach audience fixtures at ~4.2 and beyond. */
export function sampleArenaPetalV1037(index:number,count:number,state:ArenaTransformationStateV1037,pattern:ArenaPetalPatternV1037){
 const n=Math.max(1,Math.min(16,Math.floor(Number.isFinite(count)?count:8)));
 const id=Math.max(0,Math.min(n-1,Math.floor(Number.isFinite(index)?index:0)));
 const angle=Math.PI*2*(id+.5)/n;
 const wave=pattern==='spiral'?(.5+.5*Math.sin(angle+Math.PI/4)):pattern==='fan'?(id%2===0?1:.62):1;
 const radial=clamp(state.extension,0,.46)*wave;
 const height=clamp(state.lift,0,.16)*(pattern==='spiral'?wave:1);
 const twist=clamp(state.twist,0,.09)*(id%2===0?1:-1);
 // Meshes rotate -90° around X: their positive local Y becomes NEGATIVE world Z.
 return {angle,x:Math.cos(angle)*radial,y:height,z:-Math.sin(angle)*radial,twist,
   outerRadius:3.14+radial};
}
export function arenaPetalCountV1037(tier:'low'|'balanced'|'high'){return tier==='low'?4:tier==='balanced'?6:8;}
