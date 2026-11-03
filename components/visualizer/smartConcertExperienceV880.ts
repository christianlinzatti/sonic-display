/** V880 – Smart Concert Experience 5.0.
 * A single deterministic musical arc coordinates ALREADY permitted visual channels.
 * Existing camera/director, choreography, lyrics, performance and manual-lighting
 * authorities win. We never introduce a camera, animation, light, strobe or mesh.
 * This is a scene-coordination layer, not an AI vocal/motion detector.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxSectionV810} from './concertFxStudioV810';
import type {CrowdHarmonyCueV879} from './crowdCameraStageHarmonyV879';
import type {ReactiveParticleCueV816} from './reactiveParticlePlannerV816';
import type {FestivalCueV844} from './festivalSpecialFxPlannerV844';
import type {FoamCannonCueV817} from './foamCannonPlannerV817';

export type ConcertArcRoleV880='opening'|'narrative'|'singalong'|'anticipation'|'impact'|'breathing'|'finale';
export type ConcertArcHeroV880='crowd'|'lights'|'festival'|'none';
export type ConcertArcChannelsV880='crowd'|'particles'|'festival'|'foam'|'led'|'laser';
export type ConcertArcGainsV880=Readonly<Record<ConcertArcChannelsV880,number>>;
export type ConcertArcStateV880=Readonly<{
  trackId:string|null;positionMs:number;section:ConcertFxSectionV810;
  smoothedEnergy:number;gains:ConcertArcGainsV880;
}>;
export type ConcertArcCueV880=Readonly<{
  active:boolean;role:ConcertArcRoleV880;hero:ConcertArcHeroV880;
  energy:number;focusProtection:number;gains:ConcertArcGainsV880;
}>;
export type ConcertArcInputV880=Readonly<{
  settings:ConcertFxSettingsV810;fx:ConcertFxCueV810;
  previous:ConcertArcStateV880|null;trackId:string|null;
  positionMs:number;durationMs:number;energy:number;kick:number;
  cameraVerified:boolean;cameraIntent:string|null;manualCamera:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
  transitionActive:boolean;playing:boolean;blackout:boolean;
  reducedMotion:boolean;manualLighting:boolean;tier:'low'|'balanced'|'high';
}>;
const channels:ConcertArcChannelsV880[]=['crowd','particles','festival','foam','led','laser'];
const UNITY:ConcertArcGainsV880={crowd:1,particles:1,festival:1,foam:1,led:1,laser:1};
const unit=(n:number)=>Math.max(0,Math.min(1,n));
const finite=(...n:number[])=>n.every(Number.isFinite);
const roles:Readonly<Record<ConcertFxSectionV810,ConcertArcRoleV880>>={
  intro:'opening',verse:'narrative',hook:'singalong',build:'anticipation',
  drop:'impact',break:'breathing',finale:'finale'};
const targets:Readonly<Record<ConcertArcRoleV880,ConcertArcGainsV880>>={
 opening:     {crowd:.68,particles:.52,festival:.45,foam:.42,led:.72,laser:.62},
 narrative:   {crowd:.63,particles:.45,festival:.42,foam:.35,led:.67,laser:.57},
 singalong:   {crowd:1,particles:.74,festival:.78,foam:.65,led:.92,laser:.81},
 anticipation:{crowd:.80,particles:.75,festival:.66,foam:.55,led:.93,laser:.87},
 impact:      {crowd:.93,particles:.94,festival:.94,foam:.92,led:.95,laser:.93},
 breathing:   {crowd:.42,particles:.28,festival:.23,foam:.25,led:.49,laser:.35},
 finale:      {crowd:1,particles:.96,festival:1,foam:.94,led:1,laser:.96}
};
const OFF:ConcertArcCueV880={active:false,role:'breathing',hero:'none',energy:0,
  focusProtection:0,gains:UNITY};
/** Stable lane choice per 18-second musical window. This is a visual pattern
 * rotation, not a fabricated beat or inference about who is singing. */
function heroFor(trackId:string|null,positionMs:number,role:ConcertArcRoleV880):ConcertArcHeroV880{
  if(role!=='impact'&&role!=='finale'&&role!=='singalong')return 'none';
  let hash=0;
  for(let k=0;k<(trackId?.length??0);k++)hash=((hash*31+(trackId!.charCodeAt(k)))>>>0);
  const window=Math.floor(positionMs/18000);
  const index=(hash+window+(role==='finale'?1:0))%3;
  return index===0?'crowd':index===1?'lights':'festival';
}
/** Frame-rate-independent easing from verified song progress. On seeking,
 * skipping, track switch or invalid input the state is reset immediately. */
export function planSmartConcertExperienceV880(i:ConcertArcInputV880):{
  cue:ConcertArcCueV880;state:ConcertArcStateV880|null
}{
  const s=i.settings,fx=i.fx;
  if(!s.enabled||!s.smartConcertExperienceV880||s.smartConcertStrengthV880<=0||
    !fx.active||fx.reason!=='music'||!i.playing||i.blackout||i.manualLighting||
    i.reducedMotion||i.tier==='low'||!Number.isInteger(i.groupCount)||
    i.groupCount<1||i.groupCount>4||
    !Object.prototype.hasOwnProperty.call(roles,fx.section)||
    !finite(i.positionMs,i.durationMs,i.energy,i.kick,s.smartConcertStrengthV880,fx.phase)||
    i.positionMs<0||i.durationMs<=0||i.positionMs>i.durationMs+5000||
    s.intensity<=0||s.smartConcertStrengthV880>100)return {cue:OFF,state:null};
  const prev=i.previous;
  const dt=prev?i.positionMs-prev.positionMs:0;
  const reset=!prev||prev.trackId!==i.trackId||dt<0||dt>5000||
    !finite(prev.positionMs,prev.smoothedEnergy,...channels.map(c=>prev.gains[c]));
  const response=unit(.67*unit(i.energy)+.33*unit(i.kick));
  const tau=s.smartConcertStyleV880==='cinematic'?1500:
    s.smartConcertStyleV880==='festival'?560:900;
  const alpha=reset?1:1-Math.exp(-dt/tau);
  const smooth=reset?response:unit(prev!.smoothedEnergy+(response-prev!.smoothedEnergy)*alpha);
  const role=roles[fx.section];
  const hero=s.smartConcertHeroRotationV880?heroFor(i.trackId,i.positionMs,role):'none';
  const close=i.cameraVerified&&!i.manualCamera&&
    ['portrait','dialogue','breath'].includes(i.cameraIntent??'');
  const focus=s.smartConcertPerformerGuardV880?
    (i.lyricsProtected?1:close?.8:i.vocalFocus?.62:0):0;
  const passage=targets[role];
  const style=s.smartConcertStyleV880==='cinematic'?1:
    s.smartConcertStyleV880==='festival'?.80:.91;
  const strength=unit(s.smartConcertStrengthV880/100)*style;
  const motion=role==='impact'||role==='finale'?1:role==='singalong'?.94:
    role==='anticipation'?.75:role==='breathing'?.45:.65;
  const pulse=unit(.65+.35*smooth*motion);
  const safety=unit(1-focus*.55);
  const target={} as Record<ConcertArcChannelsV880,number>;
  for(const lane of channels){
    let base=passage[lane];
    // A controlled solo spotlight on one *already permitted* lane. Others make room.
    const selected=(hero==='crowd'&&lane==='crowd')||
      (hero==='lights'&&(lane==='led'||lane==='laser'))||
      (hero==='festival'&&(lane==='festival'||lane==='foam'||lane==='particles'));
    if(hero!=='none'&&!selected)base*=s.smartConcertContrastV880?.78:.91;
    // Small per-genre rebalancing; never creates an effect or raises a gain.
    if(fx.genre==='rap'&&(lane==='festival'||lane==='foam'))base*=.78;
    if(fx.genre==='rock'&&lane==='laser')base*=.87;
    if(fx.genre==='pop'&&lane==='foam')base*=.83;
    if(lane==='crowd'||lane==='festival'||lane==='particles'||lane==='foam')
      base*=pulse;
    if(lane==='crowd'||lane==='festival'||lane==='foam'||lane==='particles')
      base*=safety;
    if((lane==='led'||lane==='laser')&&focus>0)base*=1-focus*.24;
    if(i.transitionActive&&s.smartConcertContrastV880)base*=lane==='crowd'?.90:.96;
    target[lane]=unit(1-(1-unit(base))*strength);
  }
  const gains={} as Record<ConcertArcChannelsV880,number>;
  for(const lane of channels){
    // Never overshoot: gains always attenuate already authorized visual effects.
    gains[lane]=unit(reset?target[lane]:prev!.gains[lane]+
      (target[lane]-prev!.gains[lane])*alpha);
  }
  const cue:ConcertArcCueV880={active:true,role,hero,energy:smooth,
    focusProtection:focus,gains};
  return {cue,state:{trackId:i.trackId,positionMs:i.positionMs,section:fx.section,
    smoothedEnergy:smooth,gains}};
}
/** Final post-governor visual pass. The previous planner's inactive flags,
 * quantities, authored lanes and count caps remain authoritative. */
export function applyConcertArcCrowdV880(base:CrowdHarmonyCueV879,cue:ConcertArcCueV880):CrowdHarmonyCueV879{
  if(!cue.active||!base.active)return base;
  const g=cue.gains.crowd;
  return {...base,movement:base.movement*g,cheer:base.cheer*g,
    phoneOpacity:base.phoneOpacity*g,lightGain:base.lightGain*g,
    armLift:base.armLift*g,festivalWave:base.festivalWave*g,
    wristbandGlow:base.wristbandGlow*g,choreographyStrength:base.choreographyStrength*g,
    interactionStrengthV877:base.interactionStrengthV877*g,
    emotionSwellV878:base.emotionSwellV878*g};
}
export function applyConcertArcParticlesV880(base:ReactiveParticleCueV816,cue:ConcertArcCueV880):ReactiveParticleCueV816{
  if(!cue.active||!base.active)return base;
  const g=cue.gains.particles;
  return {...base,sparkOpacity:base.sparkOpacity*g,shardOpacity:base.shardOpacity*g,
    confettiOpacity:base.confettiOpacity*g,ringOpacity:base.ringOpacity*g};
}
export function applyConcertArcFestivalV880(base:FestivalCueV844,cue:ConcertArcCueV880):FestivalCueV844{
  if(!cue.active||!base.active)return base;
  const g=cue.gains.festival;
  return {...base,co2Opacity:base.co2Opacity*g,sparkGain:base.sparkGain*g,
    confettiGain:base.confettiGain*g,strobeGain:base.strobeGain*g};
}
export function applyConcertArcFoamV880(base:FoamCannonCueV817,cue:ConcertArcCueV880):FoamCannonCueV817{
  if(!cue.active||!base.active)return base;
  const g=cue.gains.foam;
  return {...base,opacity:base.opacity*g,power:base.power*g};
}
export function concertArcLaneGainV880(cue:ConcertArcCueV880,
  lane:'led'|'laser',authored:boolean):number{
  return cue.active&&!authored?cue.gains[lane]:1;
}

