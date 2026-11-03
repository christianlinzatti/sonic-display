/** V875 – Smart Festival Atmosphere 3.0.
 * Deterministic section-aware audience ambience. No independent beat detector,
 * wall clock, extra light, flash, or bypass of the V815/V825/V874 governor.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {AudienceCueV874} from './intelligentAudienceExperienceV874';
import {CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';

export type FestivalMoodV875='quiet'|'warmup'|'anticipation'|'singalong'|'peak'|'afterglow';
export type FestivalAtmosphereCueV875=AudienceCueV874&Readonly<{
  festivalMood:FestivalMoodV875;
  festivalWave:number;wristbandGlow:number;wristbandCount:number;
}>;
export type FestivalAtmosphereInputV875=Readonly<{
  base:AudienceCueV874;fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
  energy:number;kick:number;tier:'low'|'balanced'|'high';
  playing:boolean;manualLighting:boolean;blackout:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;reducedMotion:boolean;
}>;
const clamp=(v:number)=>Math.max(0,Math.min(1,v));
const sections:Record<ConcertFxCueV810['section'],readonly [FestivalMoodV875,number]>={
  intro:['warmup',.22],verse:['warmup',.34],hook:['singalong',.78],
  build:['anticipation',.65],drop:['peak',1],break:['quiet',.07],
  finale:['afterglow',.80]
};
function off(base:AudienceCueV874):FestivalAtmosphereCueV875{
  return {...base,festivalMood:'quiet',festivalWave:0,wristbandGlow:0,wristbandCount:0};
}

/** Derive a festival response only from a *permitted* crowd after the V825 governor.
 * All additions are bounded by the original parent audience gain and count.
 */
export function planSmartFestivalAtmosphereV875(i:FestivalAtmosphereInputV875):FestivalAtmosphereCueV875{
  const b=i.base,s=i.settings;
  if(!b.active||!Number.isFinite(b.count)||b.count<2||b.count>CROWD_MAX_V815||
    !i.fx.active||i.fx.reason!=='music'||!i.playing||i.manualLighting||i.blackout||
    i.reducedMotion||i.tier==='low'||!s.enabled||!s.virtualCrowd||
    !s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||
    ![i.energy,i.kick,b.movement,b.lightGain,b.armLift,s.festivalAtmosphereStrengthV875,
      s.intensity,s.crowdIntensity].every(Number.isFinite)||
    b.movement<=0||s.intensity<=0||s.crowdIntensity<=0||
    s.festivalAtmosphereStrengthV875<=0)return off(b);
  const item=sections[i.fx.section];
  if(!item)return off(b);
  const [festivalMood,sectionGain]=item;
  const genreGain=i.fx.genre==='hardtekk'||i.fx.genre==='hardstyle'?1:
    i.fx.genre==='rock'?.83:i.fx.genre==='pop'?.76:i.fx.genre==='rap'?.72:.60;
  const styleGain=s.festivalAtmosphereStyleV875==='immersive'?1:
    s.festivalAtmosphereStyleV875==='subtle'?.47:.76;
  const protect=(i.lyricsProtected?.55:1)*(i.vocalFocus?.68:1);
  const performance=i.tier==='balanced'?.70:1;
  const parentGain=clamp(b.movement/.14);
  const beat=clamp(i.kick)*.65+clamp(i.energy)*.35;
  const gain=clamp(s.festivalAtmosphereStrengthV875/100)*styleGain*genreGain*
    sectionGain*(.30+beat*.70)*protect*performance*parentGain;
  // Reuse V874 arm animation; never re-enable a disabled arm-wave control.
  const festivalWave=s.festivalCrowdWavesV875&&s.crowdArmWaveV874&&b.armLift>0?
    Math.min(.65,gain*.60*clamp(b.armLift/.5)):0;
  // Wristband light is emissive mesh only, not a Light or a fullscreen flash.
  // Additional gain is always proportional to V815's already governed light.
  const wristbandGlow=s.festivalWristbandsV875&&b.lightGain>0?
    Math.min(.42,gain*.38*clamp(b.lightGain/.16)):0;
  const wristbandCount=wristbandGlow>.002?
    Math.min(CROWD_MAX_V815,Math.floor(b.count)):0;
  return {...b,festivalMood,festivalWave,wristbandGlow,wristbandCount};
}
