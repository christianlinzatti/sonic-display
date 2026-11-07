/** V1050 · Adaptive Concert Storytelling.
 * Pure, opt-in dramaturgy for the EXISTING 360° show plan. The percentages
 * represent a visual narrative, not a claim about detected musical structure.
 * No network, timers, audio synthesis, GPU resources, hardware or camera ownership.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowCueV1040,ArenaShowPlanV1040,ArenaShowCameraV1040,ArenaShowFloatV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';

export type StoryChapterV1050='off'|'prologue'|'establish'|'tension'|'release'|'breath'|'reprise'|'finale'|'afterglow';
export interface AdaptiveStoryCueV1050 {
 active:boolean;chapter:StoryChapterV1050;intensityGain:number;
 /** Only existing, authorized show parameters; never a new event or an effect trigger. */
 show:ArenaShowCueV1040;
}
const DEFAULT_CAMERA:Record<ArenaShowSceneV1040,ArenaShowCameraV1040>={
 intro:'wide',verse:'lead',build:'orbit',hook:'group',interlude:'wide',finale:'group',
};
const DEFAULT_FLOAT:Record<ArenaShowSceneV1040,ArenaShowFloatV1040>={
 intro:'wave',verse:'wave',build:'rise',hook:'orbit',interlude:'wave',finale:'rise',
};
const bounded=(v:unknown,lo:number,hi:number,fallback:number):number=>
 typeof v==='number'&&Number.isFinite(v)?Math.min(hi,Math.max(lo,v)):fallback;
const smooth=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const inactive=(show:ArenaShowCueV1040):AdaptiveStoryCueV1050=>({
 active:false,chapter:'off',intensityGain:1,show,
});
// An explicit contrast arc: intentional breathing space after the first hook,
// then a renewed ascent before the final peak. A two-part finale fades out.
const DEPTH=[.52,.83,.97,.98,.42,.82,1] as const;
const CHAPTERS:readonly StoryChapterV1050[]=[
 'prologue','establish','tension','release','breath','reprise','finale',
];
/** Never overwrite an edited show-plan field or an upstream V1048 variation. */
export function directAdaptiveStoryV1050(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 reactive?:boolean;plan?:ArenaShowPlanV1040|null;show:ArenaShowCueV1040;
 trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number;performanceTier?:'low'|'balanced'|'high'|null;
}):AdaptiveStoryCueV1050{
 const {show}=input;
 if(!input.enabled||!input.stageIsArena||!input.playing||input.reducedMotion||
  input.reactive===false||input.performanceTier==='low'||!show?.active||
  !Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  !Number.isFinite(show.intensity)||show.intensity<0||show.intensity>100||
  !Number.isFinite(show.fade)||show.fade<0||show.fade>1||
  typeof input.trackId!=='string'||input.trackId.trim().length===0||
  !Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||
  (input.durationMs??0)<=0||(input.progressMs??-1)<0||
  (input.progressMs??0)>(input.durationMs??0))return inactive(show);
 const plan=normalizeArenaShowPlanV1040(input.plan);
 if(!plan||show.segmentIndex>=plan.segments.length)return inactive(show);
 const segment=plan.segments[show.segmentIndex];
 if(!segment||segment.scene!==show.scene)return inactive(show);
 const progress=(input.progressMs??0)/(input.durationMs??1);
 // Reject out-of-date or unrelated cues (e.g. a track change in flight).
 if(progress<segment.start-1e-8||
  (progress>=segment.end+1e-8&&show.segmentIndex!==plan.segments.length-1))return inactive(show);
 const strength=bounded(input.strength,0,80,55)/100;
 if(strength===0)return inactive(show);
 const tier=input.performanceTier==='balanced'?.65:1;
 const local=Math.min(1,Math.max(0,(progress-segment.start)/(segment.end-segment.start)));
 const index=show.segmentIndex;
 const afterglow=index===6&&local>=.78;
 const chapter:StoryChapterV1050=afterglow?'afterglow':CHAPTERS[index];
 // A continuous, smooth envelope within each chapter prevents flickering and
 // intentionally lowers energy in interludes, without exceeding user intensity.
 const target=afterglow?.28:DEPTH[index];
 const sceneEntrance=smooth(local/.20),sceneExit=smooth((1-local)/.20);
 const fadeTo=afterglow?smooth((local-.78)/.22):0;
 const base=DEPTH[index];
 const authoredDepth=afterglow?base+(target-base)*fadeTo:base;
 // A quiet mid-chapter pause in verses makes peaks feel stronger without flashing.
 const contour=index===1||index===5?(.065*Math.sin(Math.PI*local)**2):0;
 const depth=1-((1-authoredDepth)*(.35+.65*sceneEntrance*sceneExit)+contour);
 const gain=Math.max(0,Math.min(1,1-strength*tier*(1-depth)));
 const intensity=Math.max(0,Math.min(show.intensity,Math.round(show.intensity*gain)));
 let camera=show.camera;
 let floating=show.floating;
 // Only replace an UNEDITED V1040 default when V1048 has not changed it.
 // Manual camera, lyrics, duo and shot priorities are still checked downstream.
 if(segment.camera===DEFAULT_CAMERA[segment.scene]&&show.camera===segment.camera){
  if(index===2&&local>=.60)camera='wide';
  else if(index===5&&local>=.55)camera='orbit';
  else if(afterglow)camera='wide';
 }
 if(segment.floating===DEFAULT_FLOAT[segment.scene]&&show.floating===segment.floating){
  if(index===4)floating='wave';
  else if(index===5&&local>=.65)floating='rise';
  else if(afterglow)floating='wave';
 }
 // Explicitly preserve segment/fade, dance, deck, lasers and all other settings.
 return {active:true,chapter,intensityGain:gain,show:{...show,intensity,camera,floating}};
}
