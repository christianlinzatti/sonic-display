/** V847: a single confirmed festival hero accent -- metallic rain OR virtual spark wheels.
 * Pure and seek-stable. A visual effect, never an instruction to physical pyrotechnics.
 */
import type {FestivalCompanionInputV8441} from './festivalBubblesFlashPlannerV8441';
import type {ReactiveParticleCueV816} from './reactiveParticlePlannerV816';
export type MetallicPaletteV847='gold'|'silver'|'mixed';
export type FinaleMomentV847='none'|'metallic-rain'|'spark-wheels';
export interface FestivalFinaleCueV847 {
 active:boolean;moment:FinaleMomentV847;rainCount:number;wheelCount:number;
 rainOpacity:number;wheelOpacity:number;phase:number;fallSpeed:number;wheelSpeed:number;
 palette:MetallicPaletteV847;
}
export const FINALE_OFF_V847:Readonly<FestivalFinaleCueV847>=Object.freeze({
 active:false,moment:'none',rainCount:0,wheelCount:0,rainOpacity:0,wheelOpacity:0,
 phase:0,fallSpeed:0,wheelSpeed:0,palette:'mixed',
});
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function planFestivalFinaleV847(i:FestivalCompanionInputV8441):FestivalFinaleCueV847 {
 const s=i.settings;
 if(!s.enabled||!s.festivalFxV844||!i.fx.active||i.fx.reason!=='music'||!i.playing||
    i.reducedMotion||i.manualLighting||i.blackout||i.tier==='low'||
    !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
    ![i.fx.phase,i.energy,i.kick,i.budget,i.timelineGain,i.performanceGain,
      s.intensity,s.festivalIntensityV844,s.festivalFinaleIntensityV847].every(Number.isFinite)||
    i.fx.phase<0||s.intensity<=0||s.festivalIntensityV844<=0||s.festivalFinaleIntensityV847<=0||
    i.budget<=0||i.timelineGain<=0||i.performanceGain<=0||!s.reactiveParticles)
     return FINALE_OFF_V847;
 const sec=i.fx.section;
 const rainAllowed=s.festivalMetallicRainV847&&s.festivalConfettiV844&&s.particleConfetti&&
   i.moment==='confetti'&&(sec==='hook'||sec==='drop'||sec==='finale')&&i.energy>=.38;
 const wheelAllowed=s.festivalSparkWheelsV847&&s.festivalSparksV844&&s.particleSparks&&
   i.moment==='sparks'&&(sec==='build'||sec==='drop'||sec==='finale')&&i.energy>=.57&&i.kick>=.61;
 if(!rainAllowed&&!wheelAllowed)return FINALE_OFF_V847;
 // Same verified FX budgets and manual-authority guards as V844–V846.
 const budget=Math.min(1,clamp(i.budget),clamp(i.timelineGain),clamp(i.performanceGain));
 const genre=i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle'?1:sec==='finale'?.95:.82;
 const section=sec==='finale'?1:sec==='drop'?.92:sec==='hook'?.75:.65;
 const visible=(s.protectLyrics&&i.lyricsProtected?.42:1)*(i.vocalFocus?.45:1)*
   (i.groupCount>=3?.60:1)*(i.tier==='balanced'?.70:1);
 const strength=clamp(s.intensity/100)*clamp(s.festivalIntensityV844/100)*
   clamp(s.festivalFinaleIntensityV847/100)*budget*genre*section*visible;
 const palette=s.festivalMetallicPaletteV847;
 if(rainAllowed){
   const rainCount=Math.min(80,Math.floor(80*strength));
   if(rainCount<3)return FINALE_OFF_V847;
   return {active:true,moment:'metallic-rain',rainCount,wheelCount:0,
     rainOpacity:Math.min(.38,.12+strength*.32),wheelOpacity:0,phase:i.fx.phase,
     fallSpeed:.48+.52*clamp(i.energy),wheelSpeed:0,palette};
 }
 const wheelCount=Math.min(32,Math.floor(32*strength));
 if(wheelCount<4)return FINALE_OFF_V847;
 return {active:true,moment:'spark-wheels',rainCount:0,wheelCount,
   rainOpacity:0,wheelOpacity:Math.min(.34,.10+strength*.30),phase:i.fx.phase,
   fallSpeed:0,wheelSpeed:.7+.55*clamp(i.kick),palette};
}
/** V847 never creates or re-enables existing particles. It only reduces overlap.
 * Apply after V816/V844/V822/V823/V825 budgets, before rendering.
 */
export function coordinateFestivalParticlesV847(cue:ReactiveParticleCueV816,
 finale:FestivalFinaleCueV847):ReactiveParticleCueV816 {
 if(!cue.active||!finale.active)return cue;
 if(finale.moment==='metallic-rain')return {...cue,
   confettiOpacity:cue.confettiOpacity*.42};
 if(finale.moment==='spark-wheels')return {...cue,
   sparkOpacity:cue.sparkOpacity*.50};
 return cue;
}
