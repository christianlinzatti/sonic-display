/** V1127 · Fixed-cost festival crowd sampling for the existing V1032 instanced renderer.
 * Spatial data is immutable for a capped crowd update (8 sectors), not recomputed
 * for every body, head, arm, phone and wristband. No new meshes or timers.
 */
import {sampleFestivalCrowdSectorV1125,
 type FestivalCrowdLiveCueV1125,type FestivalCrowdSpatialV1125} from './aiFestivalCrowdDirectorV1125';

const TAU=Math.PI*2;
const NEUTRAL:Readonly<FestivalCrowdSpatialV1125>=Object.freeze({light:1,rise:0,arms:0,head:0});
export const NEUTRAL_FESTIVAL_FRAME_V1127:ReadonlyArray<Readonly<FestivalCrowdSpatialV1125>>=
 Object.freeze(Array.from({length:8},()=>NEUTRAL));

/** The angle-to-sector mapping matches V1125 exactly, including negative angles. */
export function festivalCrowdSectorIndexV1127(angle:number):number{
 if(!Number.isFinite(angle))return -1;
 return Math.floor(((((angle+Math.PI)%TAU+TAU)%TAU)/TAU)*8)%8;
}
/** Stage-fixed audience positions can be indexed once on membership/tier changes. */
export function festivalCrowdSectorLookupV1127(members:ReadonlyArray<Readonly<{x:number;z:number}>>):number[]{
 return members.map(m=>Number.isFinite(m.x)&&Number.isFinite(m.z)?
   festivalCrowdSectorIndexV1127(Math.atan2(m.z,m.x)):-1);
}
/** At most eight spatial evaluations per capped crowd tick, independent of crowd size.
 * The angle at each sector center maps to exactly that sector in the V1125 sampler.
 */
export function compileFestivalCrowdFrameV1127(cue:FestivalCrowdLiveCueV1125|null,
 seconds:number):ReadonlyArray<Readonly<FestivalCrowdSpatialV1125>>{
 if(!cue?.active||!Number.isFinite(seconds)||seconds<0)return NEUTRAL_FESTIVAL_FRAME_V1127;
 return Array.from({length:8},(_,sector)=>
  sampleFestivalCrowdSectorV1125(cue,-Math.PI+(sector+.5)*TAU/8,seconds));
}
/** Invalid sectors fail closed to an identity effect. Never invent audience motion. */
export function readFestivalCrowdSectorV1127(
 samples:ReadonlyArray<Readonly<FestivalCrowdSpatialV1125>>,sector:number):Readonly<FestivalCrowdSpatialV1125>{
 return Number.isInteger(sector)&&sector>=0&&sector<8?samples[sector]??NEUTRAL:NEUTRAL;
}
