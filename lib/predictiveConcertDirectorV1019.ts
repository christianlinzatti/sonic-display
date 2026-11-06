/** V1019 Predictive Concert Director — verified-timeline pre-cue preview ONLY.
 * No autonomous device/camera/avatar/FX dispatch. It cannot generate song markers.
 * All timing comes from V763's verified V604 snapshot, authenticated by V1018.
 * This module is pure and deterministic, with no I/O, timers or persistence.
 */
import {understandSongV1018, type SongUnderstandingInputV1018,
 type RecognizedSectionV1018} from './songUnderstandingV1018';

export type PreparationPhaseV1019='unavailable'|'standby'|'prepare'|'imminent';
export type ShowChannelV1019='camera'|'stage'|'avatars'|'lights';
export type ShowLookV1019='close-up'|'wide-shot'|'stable-shot'|'soft-sweep'|'hold'|
 'minimal'|'cinematic'|'rising'|'arena'|'lead-groove'|'ensemble'|'rest'|
 'soft-wash'|'build-wash'|'low-light';
export interface PredictedShowCueV1019 {
 phase:PreparationPhaseV1019;
 evidence:'verified-v604'|'unavailable';
 nextSection:RecognizedSectionV1018|null;
 nextStartMs:number|null;
 /** Boundary interval, never a wall-clock prediction. */
 etaMs:number|null;
 sceneIndex:number|null;
 preview:ReadonlyArray<{channel:ShowChannelV1019;look:ShowLookV1019}>;
 audioMeasured:boolean;
 reason:'paused'|'manual'|'disabled'|'reduced'|'seek'|'blackout'|'missing-evidence'|
  'no-next-section'|'too-early'|'verified-next-section';
}
export type PredictiveInputV1019=SongUnderstandingInputV1018 & {
 enabled:boolean;manualOverride?:boolean;seekBlocked?:boolean;blackout?:boolean;
 reducedMotion?:boolean;
};
export const PREP_HORIZON_MS_V1019=12000;
export const IMMINENT_WINDOW_MS_V1019=3000;
const looks:Record<RecognizedSectionV1018,
 ReadonlyArray<{channel:ShowChannelV1019;look:ShowLookV1019}>>={
 verse:[{channel:'camera',look:'close-up'},{channel:'stage',look:'cinematic'},
  {channel:'avatars',look:'lead-groove'},{channel:'lights',look:'soft-wash'}],
 hook:[{channel:'camera',look:'wide-shot'},{channel:'stage',look:'arena'},
  {channel:'avatars',look:'ensemble'},{channel:'lights',look:'build-wash'}],
 build:[{channel:'camera',look:'soft-sweep'},{channel:'stage',look:'rising'},
  {channel:'avatars',look:'lead-groove'},{channel:'lights',look:'build-wash'}],
 drop:[{channel:'camera',look:'wide-shot'},{channel:'stage',look:'arena'},
  {channel:'avatars',look:'ensemble'},{channel:'lights',look:'build-wash'}],
 break:[{channel:'camera',look:'stable-shot'},{channel:'stage',look:'minimal'},
  {channel:'avatars',look:'rest'},{channel:'lights',look:'low-light'}],
};
const frozenPreview:ReadonlyArray<{channel:ShowChannelV1019;look:ShowLookV1019}>=[];
function inactive(reason:PredictedShowCueV1019['reason'],audioMeasured=false):PredictedShowCueV1019 {
 return {phase:'unavailable',evidence:'unavailable',nextSection:null,nextStartMs:null,
  etaMs:null,sceneIndex:null,preview:frozenPreview,audioMeasured,reason};
}
/** Preview only, not a schedule or authorization to fire cues. */
export function predictConcertV1019(input:PredictiveInputV1019):PredictedShowCueV1019 {
 if(!input?.playing)return inactive('paused');
 if(!input.enabled)return inactive('disabled');
 if(input.manualOverride)return inactive('manual');
 if(input.seekBlocked)return inactive('seek');
 if(input.blackout)return inactive('blackout');
 const evidence=understandSongV1018(input);
 if(!evidence.verifiedSection||!evidence.section||!input.timeline)return inactive('missing-evidence',evidence.measuredAudio);
 const scenes=input.timeline.scenes;
 const currentIndex=scenes.findIndex(s=>s.startMs===evidence.sectionStartMs&&
  s.endMs===evidence.sectionEndMs&&s.section===evidence.section);
 if(currentIndex<0)return inactive('missing-evidence',evidence.measuredAudio);
 // V761 can split a single authored act into several camera scenes. Do not
 // announce those subdivisions as a new song section or a drop.
 let nextIndex=currentIndex+1;
 while(nextIndex<scenes.length&&scenes[nextIndex].actIndex===scenes[currentIndex].actIndex)nextIndex++;
 const next=scenes[nextIndex];
 if(!next||next.startMs<(evidence.sectionEndMs??0)||next.startMs>input.durationMs)
  return inactive('no-next-section',evidence.measuredAudio);
 const nextSection=next.section as RecognizedSectionV1018;
 const eta=next.startMs-input.positionMs;
 if(!Number.isFinite(eta)||eta<=0)return inactive('no-next-section',evidence.measuredAudio);
 const available=eta<=PREP_HORIZON_MS_V1019;
 const phase:PreparationPhaseV1019=available?
  (eta<=IMMINENT_WINDOW_MS_V1019?'imminent':'prepare'):'standby';
 const preview=available?(input.reducedMotion?
  [{channel:'camera',look:'stable-shot'}, {channel:'stage',look:'minimal'},
   {channel:'avatars',look:'rest'}, {channel:'lights',look:'soft-wash'}] as const:
  looks[nextSection]):frozenPreview;
 // Standby may show the verified future section but not an early preparation.
 return {phase,evidence:'verified-v604',nextSection,
  nextStartMs:next.startMs,etaMs:eta,sceneIndex:next.index,preview,
  audioMeasured:evidence.measuredAudio,reason:available?'verified-next-section':'too-early'};
}
