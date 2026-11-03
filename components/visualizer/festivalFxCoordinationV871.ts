/** V871 – Festival FX 4.0: one bounded, seek-stable visibility coordinator.
 * Operates only on cues already authorized by V817/V823/V825/V844–V850.
 * Never invents beats, emits particles, raises opacity/counts, or enables flashes.
 * Manual V823 lanes are bit-for-bit preserved. No clock, random number or state.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {FestivalCueV844} from './festivalSpecialFxPlannerV844';
import type {FoamCannonCueV817} from './foamCannonPlannerV817';
import type {SoapBubbleCueV8441,FullStageFlashCueV8441} from './festivalBubblesFlashPlannerV8441';
import type {PaperStreamersCueV846} from './festivalPaperStreamersPlannerV846';
import type {FestivalFinaleCueV847} from './festivalFinalePlannerV847';

export type FestivalHeroV871='none'|'co2'|'foam'|'bubbles'|'streamers'|'finale';
export type FestivalCoordinationReasonV871='disabled'|'protected'|'unverified'|'balanced';
export interface FestivalCoordinationInputV871 {
  settings:ConcertFxSettingsV810;fx:ConcertFxCueV810;
  festival:FestivalCueV844;foam:FoamCannonCueV817;
  bubbles:SoapBubbleCueV8441;streamers:PaperStreamersCueV846;
  finale:FestivalFinaleCueV847;flash:FullStageFlashCueV8441;
  playing:boolean;reducedMotion:boolean;blackout:boolean;manualLighting:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;cameraCloseup:boolean;
  groupCount:number;tier:'low'|'balanced'|'high';
  authoredLanes?:readonly string[];
}
export interface FestivalCoordinationCueV871 {
  reason:FestivalCoordinationReasonV871;hero:FestivalHeroV871;
  visibilityBudget:number;coverageBefore:number;coverageAfter:number;
  festival:FestivalCueV844;foam:FoamCannonCueV817;
  bubbles:SoapBubbleCueV8441;streamers:PaperStreamersCueV846;
  finale:FestivalFinaleCueV847;flash:FullStageFlashCueV8441;
}
const clamp=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const count=(n:number,g:number)=>Math.max(0,Math.floor(Math.max(0,n)*clamp(g)));
const dim=(n:number,g:number)=>Math.max(0,n*clamp(g));
const piece=(value:number,cap:number,opacity:number,alphaCap:number,weight:number)=>
  clamp(value/cap)*clamp(opacity/alphaCap)*weight;
/** Approximate normalized screen density; NOT a claim of measured GPU overdraw. */
export function estimateFestivalCoverageV871(c:{festival:FestivalCueV844;foam:FoamCannonCueV817;
  bubbles:SoapBubbleCueV8441;streamers:PaperStreamersCueV846;finale:FestivalFinaleCueV847;
  flash:FullStageFlashCueV8441}):number {
  return (c.festival.active?piece(c.festival.co2Count,48,c.festival.co2Opacity,.38,.58):0)+
    (c.foam.active?piece(c.foam.bubbles+c.foam.mist,288,c.foam.opacity,.62,.46):0)+
    (c.bubbles.active?piece(c.bubbles.count,64,c.bubbles.opacity,.27,.29):0)+
    (c.streamers.active?piece(c.streamers.count,56,c.streamers.opacity,.34,.39):0)+
    (c.finale.active?piece(c.finale.rainCount/80+c.finale.wheelCount/32,1,
      Math.max(c.finale.rainOpacity,c.finale.wheelOpacity),.38,.42):0)+
    (c.flash.active?piece(1,1,c.flash.opacity,.16,.12):0);
}
export function coordinateFestivalFxV871(i:FestivalCoordinationInputV871):FestivalCoordinationCueV871 {
 const base={festival:i.festival,foam:i.foam,bubbles:i.bubbles,streamers:i.streamers,
   finale:i.finale,flash:i.flash};
 const before=estimateFestivalCoverageV871(base);
 const unchanged=(reason:FestivalCoordinationReasonV871):FestivalCoordinationCueV871=>({
   ...base,reason,hero:'none',visibilityBudget:1,coverageBefore:before,coverageAfter:before});
 const s=i.settings;
 if(!s.festivalCoordinationV871||!s.enabled||!s.festivalFxV844)return unchanged('disabled');
 if(!i.fx.active||i.fx.reason!=='music'||!Number.isFinite(i.fx.phase)||i.fx.phase<0||
   !Number.isFinite(s.festivalClarityV871)||!Number.isInteger(i.groupCount)||
   i.groupCount<1||i.groupCount>4)return unchanged('unverified');
 if(!i.playing||i.reducedMotion||i.blackout||i.manualLighting||i.tier==='low')
   return unchanged('protected');
 // An authored particle lane owns festival, bubble, streamer, finale and flash cues;
 // an authored foam lane owns the original foam result. No recomputation of their gains.
 const particleLocked=i.authoredLanes?.includes('particles')??false;
 const foamLocked=i.authoredLanes?.includes('foam')??false;
 if(particleLocked&&foamLocked)return unchanged('protected');
 const section=i.fx.section;
 const hero:FestivalHeroV871= i.festival.active&&i.festival.co2Count>=2?'co2':
   i.finale.active&&(i.finale.rainCount>=3||i.finale.wheelCount>=4)?'finale':
   section==='finale'&&i.streamers.active?'streamers':
   section==='drop'&&i.foam.active?'foam':
   (section==='hook'||section==='drop')&&i.streamers.active?'streamers':
   i.bubbles.active?'bubbles':i.foam.active?'foam':i.streamers.active?'streamers':'none';
 // Higher clarity -> less combined effect density. The existing song section is
 // authoritative; this never derives its own drop, phase or onset.
 const clear=clamp(s.festivalClarityV871/100);
 const sightline=(i.lyricsProtected&&s.protectLyrics?.70:1)*
   (i.vocalFocus?.65:1)*(i.cameraCloseup?.58:1)*(i.groupCount>=3?.74:1)*
   (i.tier==='balanced'?.85:1);
 const limit=(1-clear*.55)*sightline;
 const perHero:{[K in FestivalHeroV871]:readonly [number,number,number,number,number]}={
  // CO2, foam, bubbles, streamers, finale: each cue is already validated by V844–V847.
  none:[1,1,1,1,1],co2:[1,.28,.18,.28,.48],foam:[.40,1,.34,.48,.46],
  bubbles:[.44,.52,1,.60,.54],streamers:[.45,.46,.33,1,.50],
  finale:[.45,.34,.22,.40,1]};
 const weights=perHero[hero];
 const projected={
  festival:particleLocked?i.festival:{...i.festival,
    co2Count:count(i.festival.co2Count,weights[0]),
    co2Opacity:dim(i.festival.co2Opacity,weights[0]),
    sparkGain:dim(i.festival.sparkGain,hero==='finale'?.6:1),
    confettiGain:dim(i.festival.confettiGain,hero==='finale'?.6:1)},
  foam:foamLocked?i.foam:{...i.foam,bubbles:count(i.foam.bubbles,weights[1]),
    mist:count(i.foam.mist,weights[1]),opacity:dim(i.foam.opacity,weights[1]),
    power:dim(i.foam.power,weights[1])},
  bubbles:particleLocked?i.bubbles:{...i.bubbles,count:count(i.bubbles.count,weights[2]),
    opacity:dim(i.bubbles.opacity,weights[2])},
  streamers:particleLocked?i.streamers:{...i.streamers,count:count(i.streamers.count,weights[3]),
    opacity:dim(i.streamers.opacity,weights[3])},
  finale:particleLocked?i.finale:{...i.finale,rainCount:count(i.finale.rainCount,weights[4]),
    wheelCount:count(i.finale.wheelCount,weights[4]),
    rainOpacity:dim(i.finale.rainOpacity,weights[4]),wheelOpacity:dim(i.finale.wheelOpacity,weights[4])},
  flash:i.flash // Explicit opt-in flash: never touched by automatic coordination.
 };
 const projectedCoverage=estimateFestivalCoverageV871(projected);
 const lockedCoverage=estimateFestivalCoverageV871({
  festival:particleLocked?projected.festival:{...projected.festival,active:false},
  foam:foamLocked?projected.foam:{...projected.foam,active:false},
  bubbles:particleLocked?projected.bubbles:{...projected.bubbles,active:false},
  streamers:particleLocked?projected.streamers:{...projected.streamers,active:false},
  finale:particleLocked?projected.finale:{...projected.finale,active:false},flash:projected.flash});
 const available=Math.max(0,limit-lockedCoverage);
 const mutableCoverage=Math.max(0,projectedCoverage-lockedCoverage);
 const gain=mutableCoverage>0?Math.min(1,available/mutableCoverage):1;
 const fg=particleLocked?1:gain,mg=foamLocked?1:gain;
 const festival=particleLocked?i.festival:{...projected.festival,
   co2Count:count(projected.festival.co2Count,fg),
   co2Opacity:dim(projected.festival.co2Opacity,fg),
   sparkGain:dim(projected.festival.sparkGain,fg),
   confettiGain:dim(projected.festival.confettiGain,fg)};
 const foam=foamLocked?i.foam:{...projected.foam,bubbles:count(projected.foam.bubbles,mg),
   mist:count(projected.foam.mist,mg),opacity:dim(projected.foam.opacity,mg),
   power:dim(projected.foam.power,mg)};
 const bubbles=particleLocked?i.bubbles:{...projected.bubbles,
   count:count(projected.bubbles.count,fg),opacity:dim(projected.bubbles.opacity,fg)};
 const streamers=particleLocked?i.streamers:{...projected.streamers,
   count:count(projected.streamers.count,fg),opacity:dim(projected.streamers.opacity,fg)};
 const finale=particleLocked?i.finale:{...projected.finale,
   rainCount:count(projected.finale.rainCount,fg),wheelCount:count(projected.finale.wheelCount,fg),
   rainOpacity:dim(projected.finale.rainOpacity,fg),wheelOpacity:dim(projected.finale.wheelOpacity,fg)};
 const coordinated={
   festival:particleLocked?festival:{...festival,
     active:festival.active&&(festival.co2Count>=2||festival.sparkGain>0||
       festival.confettiGain>0||festival.strobeGain>0)},
   foam:foamLocked?foam:{...foam,active:foam.active&&foam.bubbles>=3&&foam.mist>=3&&foam.opacity>0},
   bubbles:particleLocked?bubbles:{...bubbles,active:bubbles.active&&bubbles.count>=2&&bubbles.opacity>0},
   streamers:particleLocked?streamers:{...streamers,active:streamers.active&&streamers.count>=3&&streamers.opacity>0},
   finale:particleLocked?finale:{...finale,active:finale.active&&
      (finale.rainCount>=3||finale.wheelCount>=4)},flash:i.flash};
 return {...coordinated,reason:'balanced',hero,visibilityBudget:limit,
   coverageBefore:before,coverageAfter:estimateFestivalCoverageV871(coordinated)};
}
