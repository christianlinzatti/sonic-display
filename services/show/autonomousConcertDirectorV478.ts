/** V478 – Autonomous Concert Director 4.0.
 * Conservative, deterministic VISUAL orchestration on top of the shared V464
 * song-arc score. It adjusts only existing automatic camera cues and the existing
 * lighting-strength multiplier. Never opens a renderer, adds lights or infers voices.
 */
import type {ConcertExperienceV464} from './automaticConcertExperienceV464';
import type {ShowQualityTierV457} from './showContinuityV457';
import type {SmartShowCueV446,SmartShowPlanV446} from '../../components/visualizer/smartAutomaticRapShowV446';

export type ConcertShotV478='none'|'portrait'|'ensemble'|'lyrics';
export interface AutonomousConcertDirectionV478 extends ConcertExperienceV464 {
  visualV478:{active:boolean;shot:ConcertShotV478;eventId:string;lightGain:number;reason:string};
}
const clamp=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.max(a,Math.min(b,n)):a;
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};

/** Camera selection is opt-in to the *already armed* V454 camera. Authored edits,
 * vocal/manual controls, lyrics visibility and reduced-motion always win.
 * No new cue is manufactured if V456/V460 have no automatic camera cue.
 */
export function coordinateAutonomousConcertV478(experience:ConcertExperienceV464,input:{
  cue:SmartShowCueV446|null|undefined;plan:SmartShowPlanV446|null|undefined;
  trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
  enabled:boolean;cameraEnabled:boolean;manualCamera:boolean;manualVocal:boolean;
  quality:ShowQualityTierV457;lightingReactive:boolean;
}):AutonomousConcertDirectionV478 {
  const neutral=(reason:string):AutonomousConcertDirectionV478=>({...experience,
    visualV478:{active:false,shot:'none',eventId:'v478:off',lightGain:1,reason}});
  const cue=input.cue;
  const beat=cue&&input.plan?.trackId===input.trackId?input.plan.beats[cue.phrase]:undefined;
  if(!input.enabled||!input.playing||input.reducedMotion||input.manualVocal||
    !experience.active||!experience.direction.active||!cue?.active||!cue.eventId||
    !input.trackId||!Number.isFinite(input.progressMs)||input.progressMs<0||
    !experience.eventId.includes(input.trackId)||cue.eventId.indexOf(input.trackId)<0||
    !beat||!Number.isFinite(beat.atMs)||!Number.isFinite(beat.untilMs)||
    input.progressMs<beat.atMs||input.progressMs>=beat.untilMs||
    input.quality==='low'||!Number.isFinite(experience.direction.count)||
    experience.direction.count<1||experience.direction.count>4)return neutral('disabled-or-protected');

  const direction=experience.direction;
  const feature=experience.feature;
  const lyricFocus=direction.balance.attention==='lyrics';
  const ensemble=direction.moment==='crew'||feature.group||
    feature.moment==='reply'||experience.act==='opening'||experience.act==='finale';
  const shot:ConcertShotV478=lyricFocus?'lyrics':ensemble?'ensemble':'portrait';
  // A fixed visual intent per phrase; event identity is tied to the source score,
  // never to the render frame. Existing V454 hold prevents rapid changes.
  const eventId=`v478:${cue.eventId}:${experience.act}:${shot}`;
  const activeCamera=input.cameraEnabled&&!input.manualCamera&&!lyricFocus;
  const originalCamera=feature.cameraCue??direction.cameraCue;
  const cameraCue=activeCamera&&originalCamera?.active ? {
    ...originalCamera,
    group:ensemble,
    focus:ensemble?-1:clamp(direction.leadSlot,0,direction.count-1),
    eventId:`${originalCamera.eventId}:v478:${experience.act}:${shot}`,
  }:null;
  // The first and last second of a phrase stay calm. The cue's phrase key is
  // already stable in V446; modulation is continuous through a transition.
  const phraseEnvelope=Math.min(smooth((input.progressMs-beat.atMs)/1150),
    smooth((beat.untilMs-input.progressMs)/950));
  const gain=phraseEnvelope*clamp(experience.peak,0,.82)*
    (experience.act==='climax'?1:experience.act==='opening'?.40:
      experience.act==='finale'?.60:.70)*
    (input.quality==='balanced'?.50:1)*
    (experience.breathing?.45:1);
  // V478 can lower automatic visual lighting slightly when lyrics dominate,
  // but NEVER turns on lighting or changes explicit light scenes/blackouts.
  const target=lyricFocus?.955:shot==='ensemble'?1.045:1.015;
  const adjustment=input.lightingReactive?1+(target-1)*gain:1;
  const lightMultiplier=clamp(direction.lightMultiplier*adjustment,.90,1.15);
  const outputDirection=lightMultiplier===direction.lightMultiplier&&
    !(cameraCue&&!feature.cameraCue)?direction:{...direction,lightMultiplier,
      cameraCue:cameraCue&&!feature.cameraCue?cameraCue:direction.cameraCue};
  const outputFeature=cameraCue&&feature.cameraCue?{...feature,cameraCue}:feature;
  return {...experience,direction:outputDirection,feature:outputFeature,
    visualV478:{active:true,shot,eventId,lightGain:adjustment,
      reason:lyricFocus?'lyrics-protected':ensemble?'ensemble-arc':'solo-arc'}};
}
