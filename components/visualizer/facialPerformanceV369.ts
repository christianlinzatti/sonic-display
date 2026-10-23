import type { VocalPerformanceCueV368 } from "./vocalPerformanceV368";

/** V369: mutually compatible targets for facial overlays; all values 0..1.
 * Source remains time-aligned text. These are estimated articulatory shapes, NOT recovered phonemes.
 */
export type FacialPoseV369 = {
  jaw:number; wide:number; round:number; lipsClosed:number;
  smile:number; brow:number; blink:number; cheek:number; squint:number;
};
const finite = (value:number) => Number.isFinite(value) ? value : 0;
const unit = (value:number) => Math.min(1,Math.max(0,finite(value)));
export function resolveFacialPoseV369(
  cue:VocalPerformanceCueV368 | null,
  {jawFollow=65, strength=90}:{jawFollow?:number;strength?:number} = {}
):FacialPoseV369 {
  const amount=Math.min(1.5,Math.max(0,finite(strength))/100);
  const jawMix=.35+.65*Math.min(1,Math.max(0,finite(jawFollow))/100);
  if (!cue) return {jaw:0,wide:0,round:0,lipsClosed:0,smile:0,brow:0,blink:0,cheek:0,squint:0};
  const closure=unit(cue.lipsClosed*amount);
  // P/B/M contact takes precedence over jaw opening, even if a clip adds vowel tension.
  const opening=unit(cue.jaw*amount*(1-.92*closure));
  const round=unit(cue.round*amount*(1-.65*closure));
  const wide=unit(cue.wide*amount*(1-round*.78)*(1-.75*closure));
  const smile=unit(cue.smile*(1-.6*round)*(1-.4*closure));
  return {
    jaw:unit(opening*jawMix), wide, round, lipsClosed:closure,
    smile, brow:unit(cue.brow),blink:unit(cue.blink),
    cheek:unit(smile*.42+opening*.08),
    squint:unit(smile*.18+(cue.style==="rap"?cue.brow*.08:0)),
  };
}
