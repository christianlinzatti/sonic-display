/** V1069: opt-in, virtual Epic Drop score. Requires OBSERVED `drop` section.
 * Authored chapter is NEVER treated as evidence of a real drop. Beat edges are
 * gated independently in the existing stage renderers, never by song time alone.
 * No network, hardware, Govee, audio capture, timers or independent animation loops.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type EpicDropGenreV1069='rap'|'hard'|'rock'|'pop';
export type EpicDropCueV1069={active:boolean;power:number;shockPower:number;
 confetti:number;confettiCount:number;ledAccent:number;pyroTint:number;
 cooldownSeconds:number;genre:EpicDropGenreV1069};
export const OFF_EPIC_DROP_V1069:EpicDropCueV1069=Object.freeze({active:false,power:0,shockPower:0,
 confetti:0,confettiCount:0,ledAccent:0,pyroTint:0,cooldownSeconds:2.8,genre:'pop'});
const clamp=(v:number,min:number,max:number)=>Number.isFinite(v)?Math.max(min,Math.min(max,v)):min;
const SHOW_SCENES:readonly string[]=['intro','verse','build','hook','interlude','finale'];
function genreFrom(value:string|null|undefined):EpicDropGenreV1069{
 if(value==='rap'||value==='hard'||value==='rock')return value;
 return 'pop';
}
export function planEpicDropV1069(i:{enabled:boolean;stageIsArena:boolean;playing:boolean;
 reducedMotion:boolean;reactive:boolean;showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 observedSection?:string|null;show?:ArenaShowCueV1040|null;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 performanceTier?:'low'|'balanced'|'high'|null;genre?:string|null;
 effects:{finale:boolean;led:boolean;pyro:boolean};ledPattern?:string|null;
}):EpicDropCueV1069{
 if(!i.enabled||!i.stageIsArena||!i.playing||i.reducedMotion||!i.reactive||
  !i.showDesignerEnabled||!i.showDirectorEnabled||i.observedSection!=='drop'||
  i.performanceTier==='low'||!i.trackId||!i.effects||
  !(i.effects.finale||i.effects.led&&i.ledPattern==='auto'||i.effects.pyro))
  return OFF_EPIC_DROP_V1069;
 const show=i.show,ms=i.progressMs,duration=i.durationMs,strength=i.strength;
 if(!show?.active||!SHOW_SCENES.includes(show.scene??'')||!Number.isFinite(show.intensity)||
  !(show.intensity>0&&show.intensity<=100)||!Number.isFinite(show.fade)||
  !(show.fade>0&&show.fade<=1)||!Number.isFinite(ms)||!Number.isFinite(duration)||
  ms!<0||duration!<30000||ms!>duration!||!Number.isFinite(strength)||
  strength!<=0||strength!>80)return OFF_EPIC_DROP_V1069;
 // Limits are well below the already-established V1046 caps: ring alpha <= .28,
 // 96 paper pieces, and V1035 virtual pyro's energy and cooldown remain untouched.
 const power=clamp(strength!/80*show.intensity/100*show.fade*(i.performanceTier==='balanced'?.62:1),0,1);
 if(power<=0)return OFF_EPIC_DROP_V1069;
 const genre=genreFrom(i.genre);
 return {active:true,power,shockPower:i.effects.finale?clamp(.54*power,0,.54):0,
  confetti:i.effects.finale?clamp(.42*power,0,.42):0,
  confettiCount:i.effects.finale?Math.min(72,Math.floor(72*power)):0,
  ledAccent:i.effects.led&&i.ledPattern==='auto'?clamp(.28*power,0,.28):0,
  pyroTint:i.effects.pyro?clamp(.24*power,0,.24):0,
  cooldownSeconds:2.8,genre};
}
/** Only a measured rising beat with enough low-frequency and energy evidence can
 * produce a drop burst. The observed drop section is mandatory at the planner.
 * This pure gate does NOT mutate cooldown/beat history (owned by existing useFrame).
 */
export function acceptEpicDropBeatV1069(i:{cue:EpicDropCueV1069;beat:boolean;
 previousBeat:boolean;cooldownSeconds:number;beatStrength?:number|null;
 bass?:number|null;energy?:number|null;}):boolean{
 return i.cue.active===true&&i.beat===true&&i.previousBeat===false&&
  Number.isFinite(i.cooldownSeconds)&&i.cooldownSeconds<=0&&
  Number.isFinite(i.beatStrength)&&i.beatStrength!>=.72&&i.beatStrength!<=1&&
  Number.isFinite(i.bass)&&i.bass!>=.58&&i.bass!<=1&&
  Number.isFinite(i.energy)&&i.energy!>=.48&&i.energy!<=1;
}
/** Fraction of a synchronized non-flashing LED color accent, <= .28 (no brightness boost). */
export function sampleEpicDropLedAccentV1069(age:number,cue:EpicDropCueV1069):number{
 return cue.active&&Number.isFinite(age)&&age>=0&&age<.9?
  clamp(cue.ledAccent*(1-age/.9),0,.28):0;
}
