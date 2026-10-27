/** V602 – opt-in Pi concert quality overlay over the EXISTING V479 measured hysteresis.
 * No GPU/thermal estimates; no new timers or frame sampling; NEVER alters audio,
 * GLB animations, performer membership, scene cues, authored lights or karaoke.
 */
import type {PiConcertBudgetV479} from '../../services/monitoring/piConcertBudgetV479';
import type {StageFxCueV601} from './advancedConcertStageFxV601';
export type PiVisualQualityV602=Readonly<{
  active:boolean; mode:'off'|'balanced'|'eco'; reason:string;
  dprCap:number; ledGain:number;goboGain:number;fogGain:number;
  spotlightGain:number; sweepGain:number; speedGain:number;
}>;
const OFF:PiVisualQualityV602={active:false,mode:'off',reason:'Pi auto quality inactive',
  dprCap:Infinity,ledGain:1,goboGain:1,fogGain:1,spotlightGain:1,sweepGain:1,speedGain:1};
/** Static, bounded quality budgets. No new FPS detection, no synthetic readings. */
export function planPiConcertVisualQualityV602(input:{
  budget:PiConcertBudgetV479;avatarCount:number;autoQuality:boolean;
  manualLighting:boolean;reactive:boolean;
}):PiVisualQualityV602{
  if(!input.budget.enabled||!input.autoQuality)return OFF;
  const count=Number.isFinite(input.avatarCount)?Math.max(1,Math.min(4,Math.floor(input.avatarCount))):1;
  if(input.budget.level==='full')return OFF;
  // A proven user-authored lighting lane or opted-out reactive FX must not be dimmed.
  const authored=input.manualLighting||!input.reactive;
  if(input.budget.level==='eco')return {
    active:true,mode:'eco',reason:'V479 sustained measured frame pressure / Pi Low preset',
    dprCap:.8,ledGain:authored?1:.68,goboGain:authored?1:.72,fogGain:authored?1:.45,
    spotlightGain:authored?1:0,sweepGain:authored?1:.25,speedGain:authored?1:.54};
  // Balanced is the established V479 default: extra conservatism ONLY for 3–4 avatars.
  if(count<3)return OFF;
  return {active:true,mode:'balanced',reason:'3+ avatars with Pi balanced profile',
    dprCap:1.05,ledGain:authored?1:.9,goboGain:authored?1:.94,fogGain:authored?1:.75,
    spotlightGain:authored?1:.55,sweepGain:authored?1:.75,speedGain:authored?1:.85};
}
export function capPiConcertDprV602(
  requested:number,quality:PiVisualQualityV602,autoQuality:boolean,
):number{
  // Manual render quality, including 'high', always bypasses the Pi auto cap.
  if(!Number.isFinite(requested)||requested<=0)return requested;
  if(!autoQuality||!quality.active)return requested;
  return Math.min(requested,quality.dprCap);
}
/** Reduce optional V601 shader strengths, never the projected lyric text, FX toggles or timings. */
export function planPiConcertStageFxV602(
  base:StageFxCueV601,quality:PiVisualQualityV602,
):StageFxCueV601{
  if(!quality.active||base.mode==='off'||base.evidence==='off')return base;
  const fixed=(value:number,gain:number)=>Math.round(value*gain*10000)/10000;
  return {...base,gobo:fixed(base.gobo,quality.goboGain),
    pixelWall:fixed(base.pixelWall,quality.ledGain),
    floorFog:fixed(base.floorFog,quality.fogGain),
    spotlight:fixed(base.spotlight,quality.spotlightGain),
    sweep:fixed(base.sweep,quality.sweepGain),speed:fixed(base.speed,quality.speedGain)};
}
