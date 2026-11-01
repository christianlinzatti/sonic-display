/** V817 – virtual FOAM cannon, with verified audio accents and bounded budgets.
 * No physical device integration, fake drop timing, random per-frame events or DOM overlays.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FoamExperienceV843} from './foamExperiencePlannerV843';

export const FOAM_CAPS_V817=Object.freeze({bubbles:128,mist:160});
export type FoamSideV817='both'|'left'|'right';
export interface FoamCannonCueV817 {
 active:boolean;bubbles:number;mist:number;opacity:number;phase:number;power:number;
 side:FoamSideV817;color:string;experienceV843?:FoamExperienceV843;
}
export const FOAM_OFF_V817:Readonly<FoamCannonCueV817>={
 active:false,bubbles:0,mist:0,opacity:0,phase:0,power:0,side:'both',color:'#f1fcff',
};
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export function planFoamCannonV817(input:{
 fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;tier:'low'|'balanced'|'high';
 lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
 energy:number;kick:number;foamBudget:number;
}):FoamCannonCueV817 {
 const {fx,settings:s}=input;
 if(!fx.active||fx.reason!=='music'||!s.enabled||!s.foamCannon||input.tier==='low'||
 !Number.isInteger(input.groupCount)||input.groupCount<1||input.groupCount>4||
 !Number.isFinite(fx.phase)||fx.phase<0||
 ![s.intensity,s.foamIntensity,input.energy,input.kick,input.foamBudget].every(Number.isFinite)||
 s.intensity<=0||s.foamIntensity<=0||input.foamBudget<=0)return FOAM_OFF_V817;
 // Save foam for real musical peaks. No continuous stream during verse/break/intro.
 const section=fx.section==='drop'?1:fx.section==='finale'?.9:
  fx.section==='hook'?.57:fx.section==='build'?.35:0;
 if(!section)return FOAM_OFF_V817;
 const kick=clamp(input.kick),energy=clamp(input.energy);
 const accent=clamp((kick-.24)/.63)*clamp((energy-.12)/.55);
 if(accent<.07)return FOAM_OFF_V817;
 const genre=fx.genre==='hardtekk'||fx.genre==='hardstyle'?1:
  fx.genre==='rock'?.86:fx.genre==='pop'?.65:fx.genre==='rap'?.40:.45;
 const quality=s.quality==='performance'?.33:s.quality==='balanced'?.60:1;
 const performance=input.tier==='balanced'?.65:1;
 const budget=clamp(input.foamBudget)*quality*performance;
 const protection=(s.protectLyrics&&input.lyricsProtected?.55:1)*
   (input.vocalFocus?.60:1)*(input.groupCount>2?.80:1);
 const power=clamp(s.intensity/100)*clamp(s.foamIntensity/100)*
   section*accent*genre*protection*budget;
 const bubbles=Math.min(FOAM_CAPS_V817.bubbles,Math.floor(FOAM_CAPS_V817.bubbles*budget));
 const mist=Math.min(FOAM_CAPS_V817.mist,Math.floor(FOAM_CAPS_V817.mist*budget));
 if(power<.015||bubbles<3||mist<3)return FOAM_OFF_V817;
 // Bound both particle sizes and opacity separately, even with malformed inputs.
 return {active:true,bubbles,mist,opacity:Math.min(.62,power*.58),phase:fx.phase,
  power:clamp(power),side:s.foamSide==='left'||s.foamSide==='right'?s.foamSide:'both',
  color:fx.genre==='rock'?'#fff6e9':'#e9fbff'};
}
/** Stable particle seeds; each particle stays in the stage WINGS (|x| >= 3.25). */
export function createFoamLayoutV817(count:number) {
 return Array.from({length:count},(_,i)=>({
  side:i%2===0?-1:1,
  phase:((i*47+11)%151)/151,
  skew:((i*83+19)%137)/137-.5,
  rise:((i*29+7)%127)/127,
  size:.62+((i*41+3)%101)/101*.9,
 }));
}
