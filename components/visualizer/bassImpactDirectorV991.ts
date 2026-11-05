/** V991 – verified, seek-safe bass shockwaves. The only clock is the current song position.
 * A V822 MEASURED transient may arm a single decaying wave; BPM/AI guesses cannot.
 * Does not send Govee commands or modify user-authored stage timelines.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810} from './concertFxStudioV810';
import type {BeatAccentCueV822} from './beatAccentDirectorV822';
import type {ReactiveParticleCueV816} from './reactiveParticlePlannerV816';
export type BassImpactStyleV991='ripple'|'shockwave'|'subtle';
export interface BassImpactStateV991 {
  trackId:string;lastPositionMs:number;onsetMs:number;peak:number;armed:boolean;
}
export interface BassImpactCueV991 {
  active:boolean;power:number;radius:number;age:number;style:0|1|2;
  floorPulse:number;particleLift:number;reason:'active'|'disabled'|'protected'|'unverified'|'waiting';
}
export const BASS_IMPACT_OFF_V991:Readonly<BassImpactCueV991>=Object.freeze({
  active:false,power:0,radius:0,age:0,style:0,floorPulse:0,particleLift:0,reason:'disabled',
});
const clip=(x:number,min=0,max=1)=>Math.min(max,Math.max(min,x));
const rounded=(x:number)=>Math.round(x*1000000)/1000000;
export function createBassImpactStateV991():BassImpactStateV991 {
  return {trackId:'',lastPositionMs:-1,onsetMs:-1,peak:0,armed:true};
}
export interface BassImpactInputV991 {
  fx:ConcertFxCueV810;beat:BeatAccentCueV822;settings:ConcertFxSettingsV810;
  trackId:string;positionMs:number;durationMs:number;playing:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';budget:number;performanceGain:number;
  manualLighting:boolean;manualFx:boolean;blackout:boolean;lyricsProtected:boolean;
  lyricsVisible:boolean;vocalFocus:boolean;groupCount:number;
}
/** Mutates only its caller-owned state; no hidden wall clock or global state. */
export function planBassImpactV991(i:BassImpactInputV991,s:BassImpactStateV991):BassImpactCueV991 {
  const off=(reason:BassImpactCueV991['reason']):BassImpactCueV991=>({...BASS_IMPACT_OFF_V991,reason});
  const reset=()=>{s.onsetMs=-1;s.peak=0;s.armed=true;};
  const setting=i.settings;
  if(!setting.bassImpactV991||!setting.enabled||setting.intensity<=0||setting.bassImpactStrengthV991<=0){reset();return off('disabled');}
  if(!i.playing||i.reducedMotion||i.tier==='low'||i.manualLighting||i.manualFx||i.blackout||
     !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4){reset();return off('protected');}
  if(!i.fx?.active||i.fx.reason!=='music'||!i.beat||
     !i.trackId||!Number.isFinite(i.positionMs)||!Number.isFinite(i.durationMs)||i.durationMs<=0||
     i.positionMs<0||i.positionMs>i.durationMs||!Number.isFinite(i.fx.phase)||
     !Number.isFinite(i.beat.kick)||i.beat.kick<0||i.beat.kick>1||
     ![i.budget,i.performanceGain,setting.bassImpactStrengthV991,setting.intensity].every(Number.isFinite)){
    reset();return off('unverified');
  }
  // Track switches, backwards seeks and large timeline jumps must not replay an old kick.
  const discontinuity=s.trackId!==i.trackId||s.lastPositionMs<0||
    i.positionMs<s.lastPositionMs-250||i.positionMs>s.lastPositionMs+1600;
  if(discontinuity){reset();s.trackId=i.trackId;}
  s.lastPositionMs=i.positionMs;
  const kick=clip(i.beat.kick);
  // On a new track or seek, do not mistake the initial nonzero sample for a new onset.
  if(discontinuity){s.armed=kick<.03;return off('waiting');}
  const threshold=.055;
  if(kick<threshold*.55)s.armed=true;
  if(s.armed&&i.beat.active&&kick>=threshold&&(s.onsetMs<0||i.positionMs-s.onsetMs>=230)){
    s.onsetMs=i.positionMs;
    s.peak=kick;
    s.armed=false;
  }
  if(s.onsetMs<0)return off('waiting');
  const age=(i.positionMs-s.onsetMs)/1000;
  if(age<0||age>1.15){s.onsetMs=-1;s.peak=0;return off('waiting');}
  const section=i.fx.section==='drop'||i.fx.section==='finale'?1:
    i.fx.section==='hook'?.84:i.fx.section==='build'?.72:.52;
  const quality=setting.quality==='performance'?.48:setting.quality==='balanced'?.76:1;
  const visibility=(setting.protectLyrics&&(i.lyricsProtected||i.lyricsVisible)?0:1)*
    (i.vocalFocus?.55:1)*(i.groupCount>=3?.68:1);
  const decay=Math.exp(-age*3.1);
  // Caps make the graphic a local floor accent rather than a fullscreen beat flash.
  const power=clip(.15*s.peak*decay*(setting.intensity/100)*
    (setting.bassImpactStrengthV991/100)*quality*clip(i.budget)*
    clip(i.performanceGain)*(i.tier==='balanced'?.65:1)*section*visibility,0,.16);
  if(power<.0001)return off('waiting');
  const style:0|1|2=setting.bassImpactStyleV991==='subtle'?2:
    setting.bassImpactStyleV991==='shockwave'?1:0;
  return {active:true,reason:'active',power:rounded(power),radius:rounded(.11+clip(age/1.15)*.81),
    age:rounded(age),style,floorPulse:rounded(Math.min(.07,power*.36)),
    particleLift:rounded(setting.bassImpactParticlesV991?Math.min(.09,power*.48):0)};
}
/** Reduction/boost only on ALREADY active and budget-limited V816 rings: no extra instances. */
export function enhanceBassImpactParticlesV991(c:ReactiveParticleCueV816,
    impact:BassImpactCueV991,authoring:boolean):ReactiveParticleCueV816 {
  if(authoring||!c.active||!impact.active||impact.particleLift<=0||c.rings<=0)return c;
  return {...c,ringOpacity:Math.min(.37,Math.max(0,c.ringOpacity)+impact.particleLift),
    beat:Math.min(1,Math.max(0,c.beat,impact.power))};
}
