import type {Lyrics} from "@/types/music";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";
import type {AdvancedVocalFrameV459} from "./advancedVocalPerformanceV459";
import type {ExpressiveLipContextV453,ExpressiveLipSourceV453} from "./expressiveLipSyncV453";

/** V476: an optional, pure finishing pass over the established V453/V459 mouth pose.
 * Uses *existing, genuine word timings* and written vowel shapes only. Spelling is
 * NOT a phoneme alignment, microphone evidence, singer identification or new timing.
 * V420 author-edited mouth keys and V423 audio-derived mouth poses always win.
 */
export type ExpressiveLipFrameV476=AdvancedVocalFrameV459&{
  activeV476:boolean;
  sourceV476:"timed-word"|"none";
  /** Descriptive presentation cue, not measured audio emphasis. */
  emphasisV476:"rapid"|"sustained"|"none";
};
const limit=(x:number)=>Number.isFinite(x)?Math.min(1,Math.max(0,x)):0;
const ease=(x:number)=>{const n=limit(x);return n*n*(3-2*n);};
const normalized=(s:string)=>s.trim().toLocaleLowerCase("de-DE").replace(/\s+/gu," ");
const idle=(base:AdvancedVocalFrameV459):ExpressiveLipFrameV476=>({...base,activeV476:false,sourceV476:"none",emphasisV476:"none"});

export function refineExpressiveLipV476(
  lyrics:Lyrics|null,base:AdvancedVocalFrameV459,
  cue:ExpressiveLipSourceV453|null|undefined,context:ExpressiveLipContextV453,
):ExpressiveLipFrameV476 {
  if(!base.active||!cue||!context.playing||context.enabled===false||context.reducedMotion||
      context.manualSilent||!lyrics?.synced||cue.confidence!=="word"||
      (cue.vocal.style!=="rap"&&cue.vocal.style!=="singing")||
      !Number.isFinite(cue.effectiveTimeMs))return idle(base);
  const intensity=context.intensity??80;
  if(!Number.isFinite(intensity)||intensity<=0)return idle(base);
  const mark=rapLipWordAtV415(lyrics,cue.effectiveTimeMs);
  if(!mark||normalized(cue.vocal.activeWord??"")!==normalized(mark.word.text))return idle(base);
  const duration=mark.end-mark.start;
  if(!(duration>0))return idle(base);
  const elapsed=cue.effectiveTimeMs-mark.start;
  const gain=limit(intensity/100);
  const rapid=cue.vocal.style==="rap"&&base.rapid;
  // The envelope is strictly within the source word. No motion is extrapolated
  // into a gap; seek/replay of the same position returns the same result.
  const envelope=ease(elapsed/Math.max(25,Math.min(85,duration*.23)))*
    ease((duration-elapsed)/Math.max(32,Math.min(110,duration*.28)));
  const closure=limit(base.face.lipsClosed);
  const handEdited=!!context.editedWords?.some(w=>w.startMs===mark.start&&normalized(w.text)===normalized(mark.word.text));
  const mouthProtected=context.preserveAudioMouth===true||handEdited;
  // German spelling is only a conservative shape hint for this word, NEVER a
  // claim about the precise phoneme currently heard inside the word.
  const written=mark.word.text.toLocaleLowerCase("de-DE").match(/[aeiouäöü]/iu)?.[0]??"";
  const rounding=/[oöuü]/iu.test(written)?1:0;
  const widening=/[aeiä]/iu.test(written)?1:0;
  const face={...base.face};
  if(!mouthProtected){
    const weight=envelope*gain*(rapid?.038:.020)*(1-closure);
    face.round=limit(face.round+rounding*weight);
    face.wide=limit(face.wide+widening*weight*(1-face.round*.22));
    face.jaw=limit(Math.min(1-closure*.985,face.jaw+weight*(rapid?.55:.32)));
  }
  // Subtle stage expression; leave authored blink, seal and singer ownership alone.
  const express=envelope*gain*(rapid?.012:.009);
  face.cheek=limit(face.cheek+express);
  face.brow=limit(face.brow+express*.70);
  face.squint=limit(face.squint+express*.36);
  // Faster shaping is appropriate only within verified short word marks. Keep
  // the original mouth clock and never trigger synthetic vibrato or jaw pulses.
  const attackHz=mouthProtected?base.attackHz:Math.min(48,base.attackHz+(rapid?3:1));
  const releaseHz=mouthProtected?base.releaseHz:Math.min(34,base.releaseHz+(mark.nextGap>120?2:0));
  return {...base,face,attackHz,releaseHz,closureHz:base.closureHz,
    activeV476:true,sourceV476:"timed-word",emphasisV476:rapid?"rapid":"sustained"};
}
