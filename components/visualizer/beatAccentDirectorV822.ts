/** V822 – measured-audio accent distribution. Pure and seek-stable.
 * Microphone band 'snare' is a snare-like spectral proxy, NOT instrument identification.
 * No onset is inferred from a BPM/phase prediction, and no new timeline is created.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';

export interface BeatAccentInputV822 {
  fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
  tier:'low'|'balanced'|'high';budget:number;
  beatStrength:number;kickOnset:number;kickBand:number;snareBand:number;
  bass:number;energy:number;attack:number;
  lyricsProtected:boolean;vocalFocus:boolean;groupCount:number;
}
export interface BeatAccentCueV822 {
  active:boolean;kick:number;snareLike:number;bass:number;peak:number;
  led:number;laser:number;particles:number;foam:number;
}
export const BEAT_ACCENT_OFF_V822:Readonly<BeatAccentCueV822>=Object.freeze({
  active:false,kick:0,snareLike:0,bass:0,peak:0,led:0,laser:0,particles:0,foam:0,
});
const clip=(x:number)=>Math.max(0,Math.min(1,x));
const gate=(value:number,threshold:number)=>clip((value-threshold)/Math.max(.05,1-threshold));
export function planBeatAccentDirectorV822(i:BeatAccentInputV822):BeatAccentCueV822 {
  const {settings:s,fx}=i;
  if(!s.enabled||!s.beatAccentV822||!fx.active||fx.reason!=='music'||
     i.tier==='low'||s.intensity<=0||s.beatAccentIntensityV822<=0||
     !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
     ![i.budget,i.beatStrength,i.kickOnset,i.kickBand,i.snareBand,i.bass,
       i.energy,i.attack,s.intensity,s.beatAccentIntensityV822].every(Number.isFinite)||
     i.budget<=0)return BEAT_ACCENT_OFF_V822;
  const thresholds={conservative:.32,balanced:.20,responsive:.12} as const;
  const threshold=thresholds[s.beatAccentSensitivityV822]??thresholds.balanced;
  const onset=gate(Math.min(clip(i.attack),Math.max(clip(i.kickOnset),clip(i.beatStrength))),threshold);
  // A transient must be measured. BeatStrength alone may come from phase prediction.
  const measured=clip(i.attack)>.055&&(clip(i.kickOnset)>.035||clip(i.beatStrength)>.12);
  const bass= s.beatAccentBassV822?gate(clip(i.bass),threshold*.6):0;
  const kick=s.beatAccentKickV822&&measured?
    clip(onset*(.50+.50*clip(i.kickBand))*gate(clip(i.kickOnset),threshold*.65)):0;
  // A band ratio is only a *snare-like* transient proxy; it cannot name an instrument.
  const snareLike=s.beatAccentSnareV822&&measured&&i.snareBand>i.kickBand*.72?
    clip(onset*gate(clip(i.snareBand),threshold*.85)*clip((i.snareBand-i.kickBand*.35)*1.4)):0;
  const eligiblePeak=fx.section==='drop'||fx.section==='finale'||fx.section==='hook';
  const peak=s.beatAccentPeaksV822&&eligiblePeak&&measured?
    clip(Math.max(kick,snareLike*.8)*gate(clip(i.energy),threshold*.65)):0;
  const quality=s.quality==='performance'?.42:s.quality==='balanced'?.72:1;
  const factor=clip(s.intensity/100)*clip(s.beatAccentIntensityV822/100)*quality*
    (i.tier==='balanced'?.65:1)*clip(i.budget)*
    (s.protectLyrics&&i.lyricsProtected?.50:1)*(i.vocalFocus?.62:1)*
    (i.groupCount>=3?.72:1);
  const led=s.ledWall?clip((kick*.48+snareLike*.42+bass*.21+peak*.62)*factor):0;
  const laser=s.lasers&&s.quality!=='performance'?clip((kick*.54+snareLike*.16+peak*.62)*factor):0;
  const particles=s.reactiveParticles?clip((kick*.55+snareLike*.49+peak*.6)*factor):0;
  const foam=s.foamCannon&&peak>.01?clip((kick*.45+peak*.65)*factor):0;
  return {active:led+laser+particles+foam>.0001,kick:clip(kick*factor),
    snareLike:clip(snareLike*factor),bass:clip(bass*factor),peak:clip(peak*factor),
    led,laser,particles,foam};
}
