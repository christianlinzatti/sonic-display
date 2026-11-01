/** V846 - bounded paper streamers as a celebratory companion effect.
 * Uses deterministic stage-space ribbons only; no physics engine, no timers, no random sources.
 */
import type {ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FestivalMomentV844} from './festivalSpecialFxPlannerV844';
import type {FestivalCompanionInputV8441} from './festivalBubblesFlashPlannerV8441';
export interface PaperStreamersCueV846 {
 active:boolean;count:number;opacity:number;phase:number;fallSpeed:number;spread:number;curl:number;
}
export const STREAMERS_OFF_V846:Readonly<PaperStreamersCueV846>=Object.freeze({
 active:false,count:0,opacity:0,phase:0,fallSpeed:0,spread:0,curl:0,
});
const clamp=(n:number)=>Math.max(0,Math.min(1,n));
function valid(i:FestivalCompanionInputV8441):boolean {
 return i.settings.enabled&&i.settings.festivalFxV844&&i.fx.active&&i.fx.reason==='music'&&
   i.playing&&!i.reducedMotion&&!i.manualLighting&&!i.blackout&&
   Number.isInteger(i.groupCount)&&i.groupCount>=1&&i.groupCount<=4&&
   [i.fx.phase,i.energy,i.kick,i.budget,i.timelineGain,i.performanceGain,
     i.settings.intensity,i.settings.festivalIntensityV844].every(Number.isFinite)&&
   i.fx.phase>=0&&i.settings.intensity>0&&i.settings.festivalIntensityV844>0&&
   i.budget>0&&i.timelineGain>0&&i.performanceGain>0;
}
export function planPaperStreamersV846(i:FestivalCompanionInputV8441):PaperStreamersCueV846 {
 const s=i.settings as ConcertFxSettingsV810 & {
   festivalPaperStreamersV846?:boolean;festivalStreamerIntensityV846?:number;
   festivalStreamerStyleV846?:'classic'|'spiral'|'festival';
 };
 if(!valid(i)||!s.festivalPaperStreamersV846||i.tier==='low'||
   !Number.isFinite(s.festivalStreamerIntensityV846)||s.festivalStreamerIntensityV846<=0||
   i.energy<.15||i.moment==='co2')return STREAMERS_OFF_V846;
 const section=i.fx.section;
 const sectionGain=section==='finale'?1:section==='drop'?.92:section==='hook'?.82:section==='build'?.52:.28;
 const genreGain=i.fx.genre==='pop'||i.fx.genre==='rock'?1:i.fx.genre==='hardstyle'||i.fx.genre==='hardtekk'?.88:.76;
 const style=s.festivalStreamerStyleV846??'classic';
 const styleGain=style==='festival'?1.10:style==='spiral'?1:.84;
 const styleCurl=style==='festival'?1.15:style==='spiral'?1:.76;
 const heroGain=i.moment==='confetti'?.72:i.moment==='sparks'?.84:1;
 const focusGain=i.lyricsProtected?.45:i.vocalFocus?.55:1;
 const groupGain=i.groupCount>=3?.72:1;
 const budget=Math.min(1,clamp(i.budget),clamp(i.timelineGain),clamp(i.performanceGain));
 const power=clamp(s.intensity/100)*clamp(s.festivalIntensityV844/100)*
   clamp((s.festivalStreamerIntensityV846??0)/100)*sectionGain*genreGain*styleGain*
   heroGain*focusGain*groupGain*budget;
 const count=Math.min(56,Math.floor(56*power));
 if(count<3)return STREAMERS_OFF_V846;
 return {
   active:true,
   count,
   opacity:Math.min(.34,.14+power*.20),
   phase:i.fx.phase,
   fallSpeed:style==='festival'?1.24:style==='spiral'?1.06:.88,
   spread:style==='festival'?1.15:style==='spiral'?1:.82,
   curl:Math.min(1.3,styleCurl*(.62+.38*clamp(i.kick)))
 };
}
