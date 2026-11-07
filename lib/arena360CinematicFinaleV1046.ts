/** V1046 · Cinematic Concert Finale Engine (virtual arena only).
 * Authored playback-relative finale beats are a visual score, NOT detected musical
 * structure; physical devices and audio peak event authority are unaffected.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
import type {ArenaTierV1036} from './arena360AtmosphereV1036';

export type ArenaFinalePhaseV1046='gather'|'rise'|'climax'|'bow';
export type ArenaFinaleCueV1046={
 active:boolean;phase:ArenaFinalePhaseV1046|null;progress:number;clockSeconds:number;
 confetti:number;confettiCount:number;laserAccent:number;audienceAccent:number;
 deckAccent:number;shockPower:number;choreoAccent:number;
};
const OFF:ArenaFinaleCueV1046=Object.freeze({active:false,phase:null,progress:0,clockSeconds:0,
 confetti:0,confettiCount:0,laserAccent:1,audienceAccent:0,deckAccent:0,shockPower:0,choreoAccent:0});
const clamp=(value:number,min:number,max:number)=>Number.isFinite(value)?Math.max(min,Math.min(max,value)):min;
const smooth=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
/** Requires a current track, a valid clock and an explicitly active V1040 finale.
 * Strength / intensity / low-performance caps apply before any effect is shown.
 */
export function planArenaCinematicFinaleV1046(i:{enabled:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;show?:ArenaShowCueV1040|null;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 performanceTier?:ArenaTierV1036|null;}):ArenaFinaleCueV1046{
 if(!i.enabled||!i.playing||i.reducedMotion||!i.reactive||!i.show?.active||i.show.scene!=='finale'||
  !i.trackId||!Number.isFinite(i.progressMs)||!Number.isFinite(i.durationMs)||
  (i.progressMs??-1)<0||(i.durationMs??0)<30000||(i.progressMs??0)>(i.durationMs??0))return OFF;
 const strength=clamp((i.strength??60)/100,0,.8);
 if(strength<=0||i.show.intensity<=0||i.show.fade<=0)return OFF;
 const ratio=clamp((i.progressMs??0)/(i.durationMs??1),0,1);
 // V1040's canonical final section spans the final 12% of a song.
 if(ratio<.88)return OFF;
 const phase:ArenaFinalePhaseV1046=ratio<.925?'gather':ratio<.965?'rise':ratio<.992?'climax':'bow';
 const envelope=phase==='gather'?smooth((ratio-.88)/.045)*.38:
  phase==='rise'?.38+.62*smooth((ratio-.925)/.040):
  phase==='climax'?1:1-smooth((ratio-.992)/.008)*.85;
 const tier=i.performanceTier==='low'?0:i.performanceTier==='balanced'?.60:1;
 const gain=clamp(strength*clamp(i.show.intensity/100,0,1)*envelope,0,.8);
 const count=tier===0?0:Math.min(tier===1?96:48,Math.floor((tier===1?96:48)*gain/.64));
 return {active:true,phase,progress:ratio,clockSeconds:(i.progressMs??0)/1000,
  confetti:clamp((phase==='gather'?0:phase==='rise'?.35:1)*gain*tier,0,.65),
  confettiCount:count,laserAccent:clamp(1+gain*.28,1,1.20),
  audienceAccent:clamp(gain*.26,0,.20),deckAccent:clamp(gain*.035,0,.025),
  shockPower:phase==='climax'?clamp(gain*tier,0,.64):0,
  choreoAccent:phase==='climax'?clamp(gain*.11,0,.075):0};
}
