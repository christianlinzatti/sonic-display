/** V844.1 – independent, conservative studio-authored stage effects.
 * Bubbles are decorative and bounded. Stage flash is explicit opt-in, never safe by guarantee.
 * The flash changes only the WebGL stage canvas; HTML controls and lyrics UI are not overlaid.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FestivalMomentV844} from './festivalSpecialFxPlannerV844';
export interface SoapBubbleCueV8441 {
  active:boolean;count:number;opacity:number;phase:number;riseSpeed:number;
}
export interface FullStageFlashCueV8441 {
  active:boolean;opacity:number;phase:number;
}
export const BUBBLES_OFF_V8441:Readonly<SoapBubbleCueV8441>=Object.freeze({
  active:false,count:0,opacity:0,phase:0,riseSpeed:0,
});
export const FLASH_OFF_V8441:Readonly<FullStageFlashCueV8441>=Object.freeze({
  active:false,opacity:0,phase:0,
});
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
export interface FestivalCompanionInputV8441 {
  fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;playing:boolean;
  reducedMotion:boolean;manualLighting:boolean;blackout:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
  tier:'low'|'balanced'|'high';energy:number;kick:number;
  budget:number;timelineGain:number;performanceGain:number;
  moment:FestivalMomentV844;
}
function valid(i:FestivalCompanionInputV8441):boolean {
  return i.settings.enabled&&i.settings.festivalFxV844&&i.fx.active&&i.fx.reason==='music'&&
    i.playing&&!i.reducedMotion&&!i.manualLighting&&!i.blackout&&
    Number.isInteger(i.groupCount)&&i.groupCount>=1&&i.groupCount<=4&&
    [i.fx.phase,i.energy,i.kick,i.budget,i.timelineGain,i.performanceGain,
      i.settings.intensity,i.settings.festivalIntensityV844].every(Number.isFinite)&&
    i.fx.phase>=0&&i.settings.intensity>0&&i.settings.festivalIntensityV844>0&&
    i.budget>0&&i.timelineGain>0&&i.performanceGain>0;
}
export function planSoapBubblesV8441(i:FestivalCompanionInputV8441):SoapBubbleCueV8441 {
  const s=i.settings;
  if(!valid(i)||!s.festivalSoapBubblesV8441||i.tier==='low'||
    !Number.isFinite(s.festivalBubblesIntensityV8441)||s.festivalBubblesIntensityV8441<=0||
    i.energy<.12||i.moment==='co2')return BUBBLES_OFF_V8441;
  // Bubbles are an atmospheric layer, not an extra hero effect. Calm passages preferred.
  const section=i.fx.section;
  const sectionGain=section==='verse'||section==='intro'||section==='break'?.9:
    section==='hook'?.78:section==='build'?.44:.30;
  const genreGain=i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle'?.66:1;
  const styleGain=s.festivalBubbleStyleV8441==='soft'?.70:s.festivalBubbleStyleV8441==='festival'?1.10:1;
  const heroGain=i.moment==='confetti'?.28:i.moment==='sparks'?.55:1;
  const focusGain=i.lyricsProtected?.42:i.vocalFocus?.5:1;
  const groupGain=i.groupCount>=3?.58:1;
  const budget=Math.min(1,clamp(i.budget),clamp(i.timelineGain),clamp(i.performanceGain));
  const power=clamp(s.intensity/100)*clamp(s.festivalIntensityV844/100)*
    clamp(s.festivalBubblesIntensityV8441/100)*sectionGain*genreGain*styleGain*
    heroGain*focusGain*groupGain*budget;
  const count=Math.min(64,Math.floor(64*power));
  if(count<2)return BUBBLES_OFF_V8441;
  return {active:true,count,opacity:Math.min(.27,.12+power*.18),phase:i.fx.phase,
    riseSpeed:s.festivalBubbleStyleV8441==='soft'?.65:s.festivalBubbleStyleV8441==='festival'?1.30:1};
}
/** Full-stage flash is a deliberately restricted additive white wash for the 3D canvas.
 * Maximum 2 onsets/s, <=35ms per onset, <=0.16 white alpha. Not a photosensitivity guarantee.
 */
export function planFullStageFlashV8441(i:FestivalCompanionInputV8441):FullStageFlashCueV8441 {
  const s=i.settings;
  if(!valid(i)||!s.festivalFullStageFlashV8441||i.tier!=='high'||
    i.lyricsProtected||i.vocalFocus||i.groupCount>2||
    !Number.isFinite(s.festivalFlashIntensityV8441)||s.festivalFlashIntensityV8441<=0||
    ![.5,1,2].includes(s.festivalFlashRateV8441)||
    (i.fx.section!=='drop'&&i.fx.section!=='finale')||
    i.kick<.77||i.energy<.72)return FLASH_OFF_V8441;
  const hz=s.festivalFlashRateV8441;
  const period=1/hz;
  const within=((i.fx.phase%period)+period)%period;
  if(within>=.035)return FLASH_OFF_V8441;
  const budget=Math.min(1,clamp(i.budget),clamp(i.timelineGain),clamp(i.performanceGain));
  const power=clamp(s.intensity/100)*clamp(s.festivalIntensityV844/100)*
    clamp(s.festivalFlashIntensityV8441/35)*budget;
  const opacity=Math.min(.16,power*.16);
  return opacity>=.008?{active:true,opacity,phase:i.fx.phase}:FLASH_OFF_V8441;
}
