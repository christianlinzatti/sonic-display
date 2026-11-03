/** V878 – Smart Audience Emotion & Energy Director.
 * Stateful only in a caller-provided music-position state; no timers, global memory,
 * microphone access, new meshes/lights or inferred lyric/performer information.
 * Attenuates permitted V877 cues and adds bounded sector-local movement.
 */
import type {ConcertFxCueV810,ConcertFxSettingsV810,ConcertFxSectionV810} from './concertFxStudioV810';
import type {CrowdInteractionCueV877} from './intelligentCrowdInteractionV877';
import type {CrowdLayoutPersonV876,CrowdMotionScratchV876} from './dynamicFestivalCrowdChoreographyV876';
import {CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';

export type AudienceEmotionV878='calm'|'curious'|'engaged'|'singalong'|'anticipation'|'euphoria'|'finale';
export type AudienceEmotionStateV878=Readonly<{
  trackId:string|null;positionMs:number;section:ConcertFxSectionV810;
  mood:AudienceEmotionV878;moodSinceMs:number;smoothedEnergy:number;
}>;
export type AudienceEmotionCueV878=CrowdInteractionCueV877 & Readonly<{
  emotionMoodV878:AudienceEmotionV878;emotionEnergyV878:number;
  emotionSwellV878:number;emotionContrastV878:number;
}>;
export type AudienceEmotionInputV878=Readonly<{
  base:CrowdInteractionCueV877;fx:ConcertFxCueV810;settings:ConcertFxSettingsV810;
  previous:AudienceEmotionStateV878|null;trackId:string|null;
  positionMs:number;energy:number;kick:number;
  playing:boolean;manualLighting:boolean;blackout:boolean;reducedMotion:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;tier:'low'|'balanced'|'high';
}>;
const unit=(n:number)=>Math.max(0,Math.min(1,n));
const finite=(...n:number[])=>n.every(Number.isFinite);
const sectionEnergy:Record<ConcertFxSectionV810,number>={
  intro:.25,verse:.43,hook:.74,build:.69,drop:1,break:.07,finale:.83
};
function targetMood(section:ConcertFxSectionV810,energy:number,singalong:boolean):AudienceEmotionV878{
  switch(section){
    case 'intro':return 'curious';
    case 'verse':return energy>.36?'engaged':'calm';
    case 'hook':return singalong?'singalong':'engaged';
    case 'build':return 'anticipation';
    case 'drop':return 'euphoria';
    case 'break':return 'calm';
    case 'finale':return 'finale';
  }
}
function inactive(base:CrowdInteractionCueV877):AudienceEmotionCueV878{
  return {...base,emotionMoodV878:'calm',emotionEnergyV878:0,emotionSwellV878:0,emotionContrastV878:0};
}
/** Reset on seek, track switch, pause or an audio discontinuity.
 * EMA uses song-position increments, so speed is independent of rendering FPS.
 * All output fields are finite and clamped and never increase inherited FX gains.
 */
export function planSmartAudienceEmotionV878(i:AudienceEmotionInputV878):{
  cue:AudienceEmotionCueV878;state:AudienceEmotionStateV878|null
}{
  const b=i.base,s=i.settings,fx=i.fx;
  if(!b.active||!Number.isInteger(b.count)||b.count<2||b.count>CROWD_MAX_V815||
    !fx.active||fx.reason!=='music'||!i.playing||i.manualLighting||i.blackout||
    i.reducedMotion||i.tier==='low'||!s.enabled||!s.virtualCrowd||
    !s.crowdExperienceV874||!s.smartFestivalAtmosphereV875||!s.crowdChoreographyV876||
    !s.crowdEmotionDirectorV878||!finite(i.positionMs,i.energy,i.kick,b.movement,
    b.choreographyStrength,b.armLift,b.cheer,b.festivalWave,b.wristbandGlow,
    b.interactionStrengthV877,s.intensity,s.crowdIntensity,s.crowdEmotionStrengthV878)||
    i.positionMs<0||b.movement<=0||b.choreographyStrength<=0||
    s.intensity<=0||s.crowdIntensity<=0||s.crowdEmotionStrengthV878<=0||
    !Object.prototype.hasOwnProperty.call(sectionEnergy,fx.section))
    return {cue:inactive(b),state:null};
  const response=unit(i.energy)*.65+unit(i.kick)*.35;
  const p=i.previous;
  const elapsed=p?i.positionMs-p.positionMs:0;
  const reset=!p||p.trackId!==i.trackId||!finite(p.positionMs,p.smoothedEnergy,p.moodSinceMs)||
    elapsed<0||elapsed>5000||!Object.prototype.hasOwnProperty.call(sectionEnergy,p.section);
  const style=s.crowdEmotionStyleV878;
  const tau=style==='responsive'?360:style==='cinematic'?1400:800;
  const smoothedEnergy=reset?response:unit(p!.smoothedEnergy+
    (response-p!.smoothedEnergy)*(1-Math.exp(-elapsed/tau)));
  const wanted=targetMood(fx.section,smoothedEnergy,b.interactionModeV877==='singalong');
  // Changing verified song sections is immediate; in-section fluctuations have hysteresis.
  const newSection=reset||p!.section!==fx.section;
  const hold=style==='responsive'?500:style==='cinematic'?1700:1000;
  const mood=newSection||wanted===p!.mood||i.positionMs-p!.moodSinceMs>=hold?wanted:p!.mood;
  const moodSinceMs=newSection||mood!==p!.mood?i.positionMs:p!.moodSinceMs;
  const state:AudienceEmotionStateV878={trackId:i.trackId,positionMs:i.positionMs,
    section:fx.section,mood,moodSinceMs,smoothedEnergy};
  const parent=unit(b.choreographyStrength);
  const strength=unit(s.crowdEmotionStrengthV878/100);
  const protect=(i.lyricsProtected?.58:1)*(i.vocalFocus?.72:1);
  const quality=i.tier==='balanced'?.75:1;
  // Drop/finale keep the highest *existing* gain. Break/verse have breathing room.
  const section=sectionEnergy[fx.section];
  const musicalEnergy=unit(section*(.58+.42*smoothedEnergy));
  const contrast=s.crowdEmotionContrastV878?
    unit(Math.abs(musicalEnergy-(p&&!reset?sectionEnergy[p.section]*(.58+.42*p.smoothedEnergy):musicalEnergy))):0;
  const guarded=strength*protect*quality*parent;
  const envelope=unit(musicalEnergy*guarded);
  const attenuation=unit(1-guarded*(1-musicalEnergy)*.8);
  const eligibleWave=s.crowdEmotionWavesV878&&s.crowdArmWaveV874&&
    b.armLift>0&&b.choreographyStrength>0;
  const swell=eligibleWave?unit((.10+.80*musicalEnergy+.10*contrast)*guarded*
    unit(b.armLift/.88)) :0;
  const cue:AudienceEmotionCueV878={...b,emotionMoodV878:mood,
    emotionEnergyV878:envelope,emotionSwellV878:swell,emotionContrastV878:contrast,
    // Never re-enable a V874/875/876/877 channel disabled by user or governor.
    cheer:b.cheer*attenuation,armLift:b.armLift*attenuation,
    festivalWave:b.festivalWave*attenuation,
    wristbandGlow:b.wristbandGlow*attenuation,
    choreographyStrength:b.choreographyStrength*attenuation,
    interactionStrengthV877:b.interactionStrengthV877*attenuation};
  return {cue,state};
}
/** Small extra swells in already existing instanced crowd meshes (no allocation).
 * Existing V876/V877 numeric displacement caps and side lanes remain enforced.
 */
export function applyAudienceEmotionMotionV878(index:number,person:CrowdLayoutPersonV876,
  cue:Partial<AudienceEmotionCueV878>,out:CrowdMotionScratchV876):void{
  const swell=cue.emotionSwellV878??0,phase=cue.phase??0;
  if(!cue.active||!Number.isInteger(index)||index<0||index>=CROWD_MAX_V815||
    !finite(swell,phase,person.phase,person.x,out.horizontal,out.bob,out.tilt,out.armAccent,out.wavePhase)||
    swell<=0)return;
  const sector=Math.floor(index/12)%6,amplitude=unit(swell);
  const rhythm=Math.sin(phase*1.45-sector*.64+person.phase*.17);
  const lift=Math.max(0,rhythm)*amplitude;
  out.horizontal=Math.max(-.085,Math.min(.085,out.horizontal+.006*amplitude*rhythm));
  out.bob=Math.max(-.075,Math.min(.075,out.bob+.010*lift));
  out.tilt=Math.max(-.09,Math.min(.09,out.tilt+.010*rhythm*amplitude));
  out.armAccent=unit(Math.min(.35,out.armAccent+.042*lift));
  out.wavePhase=Math.max(-.55,Math.min(.55,out.wavePhase+.10*amplitude*rhythm));
}
