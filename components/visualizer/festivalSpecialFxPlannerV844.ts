/** V844 - verified, deterministic festival effects: one hero effect at a time.
 * No new audio inference, browser clocks, fake beats, full-frame flashes or unbounded bursts.
 * A strobe is never automatically enabled, is disabled under reduced motion, and is not
 * guaranteed safe for all photosensitive viewers even at the capped rate.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FoamCannonCueV817} from './foamCannonPlannerV817';
import type {ReactiveParticleCueV816} from './reactiveParticlePlannerV816';
import {PARTICLE_CAPS_V816} from './reactiveParticlePlannerV816';
export type FestivalMomentV844='none'|'co2'|'sparks'|'confetti';
export interface FestivalCueV844 {
 active:boolean;moment:FestivalMomentV844;co2Count:number;co2Opacity:number;
 sparkGain:number;confettiGain:number;strobeGain:number;phase:number;
}
export const FESTIVAL_OFF_V844:Readonly<FestivalCueV844>=Object.freeze({
 active:false,moment:'none',co2Count:0,co2Opacity:0,sparkGain:0,confettiGain:0,strobeGain:0,phase:0,
});
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function planFestivalSpecialFxV844(i:{
 fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
 playing:boolean;reducedMotion:boolean;manualLighting:boolean;blackout:boolean;
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 tier:'low'|'balanced'|'high';energy:number;kick:number;
 particleBudget:number;foamBudget:number;timelineGain:number;performanceGain:number;
}):FestivalCueV844 {
 const {fx,settings:s}=i;
 if(!fx.active||fx.reason!=='music'||!s.enabled||!s.festivalFxV844||!i.playing||
   i.reducedMotion||i.manualLighting||i.blackout||i.tier==='low'||
   !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
   ![fx.phase,s.intensity,s.festivalIntensityV844,i.energy,i.kick,i.particleBudget,i.foamBudget,i.timelineGain,i.performanceGain].every(Number.isFinite)||
   fx.phase<0||s.intensity<=0||s.festivalIntensityV844<=0||
   i.timelineGain<=0||i.performanceGain<=0||i.particleBudget<=0||i.foamBudget<=0) return FESTIVAL_OFF_V844;
 const section=fx.section;
 const peak=section==='drop'||section==='finale';
 const hook=section==='hook';
 const build=section==='build';
 if(!peak&&!hook&&!build)return FESTIVAL_OFF_V844;
 // Audio values are real measurements, not simulated beats. Restrained for portraits and lyrics.
 const energy=clamp(i.energy),kick=clamp(i.kick);
 if(energy<.45||kick<.52)return FESTIVAL_OFF_V844;
 const budget=Math.min(clamp(i.performanceGain),clamp(i.timelineGain),clamp(i.particleBudget),clamp(i.foamBudget));
 const protection=(s.protectLyrics&&i.lyricsProtected?.45:1)*(i.vocalFocus?.45:1)*(i.groupCount>=3?.65:1);
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:fx.genre==='rap'?.62:.78;
 const strength=clamp(s.intensity/100)*clamp(s.festivalIntensityV844/100)*budget*protection*genre*
  (s.festivalStyleV844==='festival'?1:.80)*(.4+.6*kick);
 if(strength<.025)return FESTIVAL_OFF_V844;
 // Only one dominant type per timed musical window. Never stack every burst at once.
 const index=Math.floor(fx.phase/1.6)%3;
 let moment:FestivalMomentV844=build?'sparks':hook?'confetti':
   index===0?'co2':index===1?'sparks':'confetti';
 const allowed={co2:s.festivalCo2V844,sparks:s.festivalSparksV844,confetti:s.festivalConfettiV844};
 if(!allowed[moment])moment='none';
 const co2Count=moment==='co2'?Math.min(48,Math.floor(48*strength)):0;
 const co2Opacity=co2Count>=2?Math.min(.38,strength*.40):0;
 const sparkGain=moment==='sparks'?Math.min(.32,strength*.30):0;
 const confettiGain=moment==='confetti'?Math.min(.28,strength*.28):0;
 // Existing floor fixture only: no fullscreen element or whole-screen flash.
 // Default OFF. <=2 pulses/second, <=45ms, <=0.12 additional intensity.
 const hz=s.festivalStrobeRateV844;
 const period=1/hz;
 const within=((fx.phase%period)+period)%period;
 const strobeGain=s.festivalStrobeV844&&!i.lyricsProtected&&!i.vocalFocus&&
   i.groupCount<=2&&i.tier==='high'&&peak&&within<.045&&
   kick>.72&&energy>.65&&Number.isFinite(hz)&&hz<=2?
   Math.min(.12,clamp(s.festivalStrobeIntensityV844/100)*strength*.24):0;
 const active=co2Count>=2||sparkGain>0||confettiGain>0||strobeGain>0;
 return {active,moment,co2Count,co2Opacity,sparkGain,confettiGain,strobeGain,phase:fx.phase};
}
/** Only reuse available V816 instancing. Every existing user toggle, budget and cap remains authoritative. */
export function mergeFestivalParticlesV844(cue:ReactiveParticleCueV816,fx:FestivalCueV844,
 s:ConcertFxSettingsV810):ReactiveParticleCueV816 {
 if(!fx.active||!s.reactiveParticles||!cue.active)return cue;
 // Lower competing background FX while keeping the earlier V816 source toggles authoritative.
 const quiet=.52;
 if(fx.moment==='co2')
   return {...cue,sparkOpacity:cue.sparkOpacity*quiet,confettiOpacity:cue.confettiOpacity*quiet,
     shardOpacity:cue.shardOpacity*.75};
 if(fx.sparkGain>0&&s.particleSparks&&cue.sparks>0)
   return {...cue,sparkOpacity:Math.min(.62,cue.sparkOpacity+fx.sparkGain),
     confettiOpacity:cue.confettiOpacity*quiet};
 if(fx.confettiGain>0&&s.particleConfetti)
   return {...cue,confetti:Math.max(cue.confetti,Math.min(PARTICLE_CAPS_V816.confetti,
    Math.floor(PARTICLE_CAPS_V816.confetti*fx.confettiGain))),
    confettiOpacity:Math.min(.52,cue.confettiOpacity+fx.confettiGain),
    sparkOpacity:cue.sparkOpacity*quiet};
 return cue;
}
/** Run after the legacy V817/V823/V825 gates. New specials can only dim existing foam. */
export function coordinateFestivalFoamV844(cue:FoamCannonCueV817,festival:FestivalCueV844):FoamCannonCueV817 {
 if(!cue.active||!festival.active)return cue;
 const gain=festival.moment==='co2'?.35:festival.moment==='confetti'?.60:.88;
 const bubbles=Math.floor(cue.bubbles*gain),mist=Math.floor(cue.mist*gain);
 return {...cue,bubbles,mist,opacity:cue.opacity*gain,power:cue.power*gain,
  active:bubbles>=2&&mist>=2};
}
