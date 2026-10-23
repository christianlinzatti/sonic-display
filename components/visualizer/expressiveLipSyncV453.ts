import type {Lyrics} from "@/types/music";
import type {FacialPoseV369} from "./facialPerformanceV369";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";

/** V453: deterministic *visual* expressiveness from verified word markers.
 * No audio phoneme recognition, vocalist identification or synthesized timestamps.
 * Existing V384/V405/V415/V419/V420/V423 outputs remain authoritative.
 */
export type ExpressiveLipContextV453 = {
  playing:boolean; enabled?:boolean; reducedMotion?:boolean;
  /** Existing confirmed V385/V416 singer roles win. */
  manualSilent?:boolean;
  /** Never alter a user-authored mouth pose on its word. */
  editedWords?:readonly {startMs:number;text:string}[];
  /** Explicit locally analysed V423 audio evidence wins over illustrative timing. */
  preserveAudioMouth?:boolean;
  /** Existing global intensity, not a new user preference. */
  intensity?:number;
  authoredBody?:boolean;
};
export type ExpressiveLipSourceV453 = {
  face:FacialPoseV369;
  confidence:"none"|"line"|"word";
  effectiveTimeMs:number;
  vocal:{style:string;activeWord?:string|null};
};
export type ExpressiveLipResultV453 = {
  face:FacialPoseV369;
  active:boolean;
  rapid:boolean;
  headPitch:number;
  attackHz:number;
  releaseHz:number;
  closureHz:number;
  source:"timed-word"|"none";
};
const unit=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const smooth=(v:number)=>{const t=unit(v);return t*t*(3-2*t);};
const key=(s:string)=>s.trim().toLocaleLowerCase("de-DE").replace(/\s+/gu," ");
const idle=(face:FacialPoseV369):ExpressiveLipResultV453=>({face,active:false,rapid:false,headPitch:0,attackHz:25,releaseHz:17,closureHz:50,source:"none"});
/** Builds restrained lip and expression micro-accents from the currently aligned word.
 * In silence, on line-only lyrics, or for a manually excluded singer, it is a no-op.
 * The blend preserves jaw/lip closures and respects all existing author edits.
 */
export function enhanceExpressiveLipV453(lyrics:Lyrics|null,cue:ExpressiveLipSourceV453|null|undefined,
 context:ExpressiveLipContextV453):ExpressiveLipResultV453 {
  if(!cue)return idle({jaw:0,wide:0,round:0,lipsClosed:0,smile:0,brow:0,blink:0,cheek:0,squint:0});
  const face=cue.face;
  if(!context.playing||context.enabled===false||context.reducedMotion||context.manualSilent||
      !lyrics?.synced||cue.confidence!=="word"||!Number.isFinite(cue.effectiveTimeMs)||
      (cue.vocal.style!=="rap"&&cue.vocal.style!=="singing"))return idle(face);
  const mark=rapLipWordAtV415(lyrics,cue.effectiveTimeMs);
  if(!mark||key(cue.vocal.activeWord??"")!==key(mark.word.text))return idle(face);
  const duration=mark.end-mark.start;
  if(duration<=0||!Number.isFinite(duration))return idle(face);
  const intensity=unit((context.intensity??70)/100);
  if(intensity===0)return idle(face);
  const rapid=cue.vocal.style==="rap"&&(duration<390||mark.previousGap<85||mark.nextGap<85);
  const position=cue.effectiveTimeMs-mark.start;
  const attack=smooth(position/Math.max(24,Math.min(90,duration*.28)));
  const release=smooth((duration-position)/Math.max(30,Math.min(125,duration*.30)));
  const envelope=attack*release;
  const closure=unit(face.lipsClosed);
  const edited=context.preserveAudioMouth===true||(context.editedWords?.some(w=>w.startMs===mark.start&&key(w.text)===key(mark.word.text))??false);
  // Keep V420 hand-edited mouth poses exact and V384/V415 bilabial closures firm.
  const accent=edited?0:envelope*intensity*(rapid?.065:.030)*(1-closure);
  const jaw=edited?face.jaw:Math.min(1-closure*.985,unit(face.jaw+accent));
  const round=edited?face.round:unit(face.round*(1-closure*.20));
  const wide=edited?face.wide:unit(face.wide*(1-closure*.20)*(1-round*.12));
  const emphasis=/[!?.,:]$/.test(mark.word.text)?1:.65;
  const headPitch=context.authoredBody?0:-Math.min(.015,envelope*intensity*(rapid?.016:.010)*emphasis);
  return {active:true,rapid,source:"timed-word",headPitch,
    // No rapid oscillation is manufactured; adapt the interpolation rate to real word spans.
    attackHz:rapid?38:25,releaseHz:rapid?23:17,closureHz:rapid?58:50,
    face:{...face,jaw:unit(jaw),wide,round,
      cheek:unit(face.cheek+envelope*intensity*.025),
      brow:unit(face.brow+envelope*intensity*(rapid?.018:.012)),
      squint:unit(face.squint+envelope*intensity*.010)},
  };
}
/** Add head gesture to the existing rig stage overlay, not to GLB animation clips.
 * This only adds pitch; gaze, partner look and manual motion settings remain untouched. */
export function addExpressiveHeadV453<T extends {headPitch:number}>(body:T,result:ExpressiveLipResultV453):T{
  if(!result.active||!result.headPitch)return body;
  return {...body,headPitch:Math.max(-.18,Math.min(.18,body.headPitch+result.headPitch))};
}
