/** V879 – Intelligent Crowd Camera & Stage Harmony.
 * Only attenuates pre-authorized V878 audience channels using verified camera
 * intent and existing lyric / performer / transition safety signals. No
 * cameras, scene objects, lights, audio analysis, timers or random effects.
 * The existing V815 crowd layout already preserves the center sightline.
 */
import type {ConcertFxSettingsV810} from './concertFxStudioV810';
import type {AudienceEmotionCueV878} from './smartAudienceEmotionDirectorV878';
import type {CrowdMotionScratchV876,CrowdLayoutPersonV876} from './dynamicFestivalCrowdChoreographyV876';
import {CROWD_MAX_V815} from './virtualConcertCrowdPlannerV815';

export type CrowdHarmonyModeV879='off'|'wide'|'performer'|'lyrics'|'transition';
export type CrowdHarmonyCueV879=AudienceEmotionCueV878 & Readonly<{
  harmonyModeV879:CrowdHarmonyModeV879;
  harmonyGainV879:number;
  harmonyFocusV879:number;
}>;
export type CrowdHarmonyInputV879=Readonly<{
  base:AudienceEmotionCueV878;
  settings:ConcertFxSettingsV810;
  verifiedCamera:boolean;
  cameraIntent:string|null;
  manualCamera:boolean;
  lyricsVisible:boolean;
  lyricsProtected:boolean;
  vocalFocus:boolean;
  performerVerified:boolean;
  groupCount:number;
  transitionActive:boolean;
  transitionProximity:number;
  playing:boolean;
  blackout:boolean;
  manualLighting:boolean;
  reducedMotion:boolean;
  tier:'low'|'balanced'|'high';
}>;
const finite=(...values:number[])=>values.every(Number.isFinite);
const unit=(n:number)=>Math.max(0,Math.min(1,n));
const attenuate=(n:number,gain:number)=>Math.max(0,Math.min(n,n*unit(gain)));
function passthrough(base:AudienceEmotionCueV878):CrowdHarmonyCueV879{
  return {...base,harmonyModeV879:'off',harmonyGainV879:1,harmonyFocusV879:0};
}
/** Camera authority is verified by the caller from V604/V761, never inferred.
 * A manual camera cancels automatic shot-based shaping but not explicit lyric
 * protection. Wide/ensemble views preserve more of the original atmosphere.
 */
export function planCrowdCameraStageHarmonyV879(i:CrowdHarmonyInputV879):CrowdHarmonyCueV879{
  const b=i.base,s=i.settings;
  if(!s.crowdCameraHarmonyV879||!s.enabled||!s.virtualCrowd||!b.active||
    !i.playing||i.blackout||i.manualLighting||i.reducedMotion||i.tier==='low'||
    !Number.isInteger(b.count)||b.count<2||b.count>CROWD_MAX_V815||
    !Number.isInteger(i.groupCount)||i.groupCount<1||i.groupCount>4||
    !finite(s.crowdCameraStrengthV879,i.transitionProximity,b.movement,b.cheer,
      b.phoneOpacity,b.lightGain,b.armLift,b.festivalWave,b.wristbandGlow,
      b.choreographyStrength,b.interactionStrengthV877,b.emotionSwellV878)||
    s.crowdCameraStrengthV879<=0)return passthrough(b);
  const lyrics=s.crowdLyricsGuardV879&&(i.lyricsVisible||i.lyricsProtected);
  const camera=i.verifiedCamera&&!i.manualCamera;
  const close=camera&&(i.cameraIntent==='portrait'||i.cameraIntent==='dialogue'||i.cameraIntent==='breath');
  const wide=camera&&(i.cameraIntent==='wide'||i.cameraIntent==='ensemble'||i.cameraIntent==='pulse'||i.cameraIntent==='rise');
  const performer=!i.manualCamera&&s.crowdPerformerPriorityV879&&(
    i.vocalFocus||(i.performerVerified&&i.groupCount>0)||close);
  const transition=s.crowdTransitionSofteningV879&&camera&&i.transitionActive&&
    i.transitionProximity>=0&&i.transitionProximity<=1;
  const style=s.crowdCameraStyleV879;
  const styleGain=style==='cinematic'?1:style==='festival'?.65:.84;
  const strength=unit(s.crowdCameraStrengthV879/100)*styleGain;
  const priority=lyrics?1:close?.82:performer?.65:transition?.52:wide?.18:0;
  if(priority===0)return passthrough(b);
  const transitionWeight=transition?.15*unit(i.transitionProximity):0;
  const focus=unit((priority+transitionWeight)*strength);
  const gain=unit(1-focus*.67); // never brightens any existing FX channel
  const lyricGain=lyrics?unit(1-focus*.82):gain;
  const mode:CrowdHarmonyModeV879=lyrics?'lyrics':transition?'transition':
    (performer||close)?'performer':'wide';
  return {...b,harmonyModeV879:mode,harmonyGainV879:gain,harmonyFocusV879:focus,
    movement:attenuate(b.movement,gain),
    cheer:attenuate(b.cheer,gain),
    armLift:attenuate(b.armLift,lyricGain),
    festivalWave:attenuate(b.festivalWave,lyricGain),
    phoneOpacity:attenuate(b.phoneOpacity,lyricGain),
    lightGain:attenuate(b.lightGain,gain),
    wristbandGlow:attenuate(b.wristbandGlow,lyricGain),
    choreographyStrength:attenuate(b.choreographyStrength,gain),
    interactionStrengthV877:attenuate(b.interactionStrengthV877,gain),
    emotionSwellV878:attenuate(b.emotionSwellV878,lyricGain)};
}
/** Bounded additional limb suppression near the inner wings, where an arm
 * gesture has the greatest chance of overlapping the singer in perspective.
 * No new motion is added. The position remains within the V815 side lanes.
 */
export function applyCrowdCameraHarmonyMotionV879(index:number,person:CrowdLayoutPersonV876,
  cue:Partial<CrowdHarmonyCueV879>,out:CrowdMotionScratchV876):void{
  if(!cue.active||!Number.isInteger(index)||index<0||index>=CROWD_MAX_V815||
    !finite(cue.harmonyFocusV879??0,person.x,out.horizontal,out.bob,out.tilt,
      out.armAccent,out.wavePhase))return;
  const focus=unit(cue.harmonyFocusV879??0);
  if(focus<=0)return;
  // Inner wing silhouettes are the most important to de-emphasize.
  const inner=unit((4.8-Math.abs(person.x))/1.9);
  const damp=unit(1-focus*(.45+.50*inner));
  out.bob*=damp;
  out.tilt*=damp;
  out.armAccent*=damp;
  out.wavePhase*=damp;
  // No movement into the central sightline during protected shots.
  out.horizontal=person.x>0?Math.max(0,out.horizontal)*damp:
    person.x<0?Math.min(0,out.horizontal)*damp:0;
}
