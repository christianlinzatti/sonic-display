import type {Lyrics} from "@/types/music";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";
import type {ExpressiveLipContextV453,ExpressiveLipResultV453,ExpressiveLipSourceV453} from "./expressiveLipSyncV453";

/** V459 refines the *already resolved* vocal face, not the singer detection or lyric clock.
 * Every motion here is an illustrative micro-accent derived from confirmed WORD marks.
 * Never infer phoneme boundaries, stem audio or identify a vocalist from credits.
 */
export type AdvancedVocalFrameV459=ExpressiveLipResultV453&{
  /** Adjacent verified word marks, not a detected musical phrase. */
  joinedWords:boolean;
  /** Both are strictly additive, optional micro-gestures. */
  headPitchExtra:number;
  headYawExtra:number;
};
const clamp=(v:number)=>Number.isFinite(v)?Math.max(0,Math.min(1,v)):0;
const ease=(v:number)=>{const x=clamp(v);return x*x*(3-2*x);};
const clean=(s:string)=>s.trim().toLocaleLowerCase("de-DE").replace(/\s+/gu," ");
const extraZero=(base:ExpressiveLipResultV453):AdvancedVocalFrameV459=>({...base,joinedWords:false,headPitchExtra:0,headYawExtra:0});
const edited=(word:{text:string;startMs:number},context:ExpressiveLipContextV453)=>
  !!context.editedWords?.some(v=>v.startMs===word.startMs&&clean(v.text)===clean(word.text));

/** Conservative word-to-word coarticulation with closure and authored-track priority.
 * V453 still provides the primary mouth pose, local V423 audio and V420 edits still win.
 */
export function refineAdvancedVocalV459(
  lyrics:Lyrics|null,base:ExpressiveLipResultV453,
  cue:ExpressiveLipSourceV453|null|undefined,context:ExpressiveLipContextV453,
):AdvancedVocalFrameV459 {
  const idle=extraZero(base);
  if(!base.active||!cue||!context.playing||context.enabled===false||context.reducedMotion||
    context.manualSilent||cue.confidence!=="word"||!lyrics?.synced||
    !Number.isFinite(cue.effectiveTimeMs)||!Number.isFinite(context.intensity??80))return idle;
  const mark=rapLipWordAtV415(lyrics,cue.effectiveTimeMs);
  if(!mark||clean(cue.vocal.activeWord??"")!==clean(mark.word.text))return idle;
  const span=mark.end-mark.start;
  if(!(span>0))return idle;
  const gain=clamp((context.intensity??80)/100);
  if(!gain)return idle;
  const elapsed=cue.effectiveTimeMs-mark.start;
  const atStart=ease(elapsed/Math.max(30,Math.min(95,span*.27)));
  const atEnd=ease((span-elapsed)/Math.max(35,Math.min(110,span*.30)));
  const envelope=atStart*atEnd;
  const previousConnected=mark.previousGap>=0&&mark.previousGap<=90;
  const nextConnected=!!mark.next&&mark.nextGap>=0&&mark.nextGap<=90;
  const joinedWords=previousConnected||nextConnected;
  const protectedMouth=!!context.preserveAudioMouth||edited(mark.word,context);
  const closure=clamp(base.face.lipsClosed);
  const face={...base.face};
  if(!protectedMouth){
    // Word-duration-aware jaw sustain; never defeat V384/V415 bilabial contacts.
    const sustain=(base.rapid?.014:.012)*envelope*gain*(1-closure);
    face.jaw=clamp(Math.min(1-closure*.985,face.jaw+sustain));
    // Blend only towards the NEXT genuinely timed word, never across silence or
    // into a P/B/M closure, and never through manually edited next-word poses.
    if(nextConnected&&mark.next&&mark.nextGap<=55&&
       !/^[bmp]/iu.test(mark.next.text.trim())&&!edited(mark.next,context)){
      const blend=ease((elapsed/span-.76)/.24)*gain*.075*(1-closure);
      const firstVowel=mark.next.text.toLocaleLowerCase("de-DE").match(/[aeiouäöü]/iu)?.[0]??"";
      const round=/[oöuü]/iu.test(firstVowel)?1:0;
      const wide=/[aeiä]/iu.test(firstVowel)?1:0;
      face.round=clamp(face.round*(1-blend)+round*blend);
      face.wide=clamp(face.wide*(1-blend)+wide*blend);
    }
  }
  // Neutral expressions remain close to source; do not synthesize blinking.
  face.brow=clamp(face.brow+envelope*gain*(base.rapid?.012:.008));
  face.cheek=clamp(face.cheek+envelope*gain*(base.rapid?.014:.009));
  // Hold across verified continuous words; finish distinct phrases promptly.
  const releaseHz=joinedWords?Math.max(13,base.releaseHz-2):base.releaseHz+2;
  const attackHz=joinedWords?Math.min(46,base.attackHz+4):base.attackHz;
  const closureHz=Math.max(base.closureHz,base.rapid?60:50);
  const authored=!!context.authoredBody;
  const direction=Math.floor(mark.start/430)%2===0?1:-1;
  const headPitchExtra=authored?0:-Math.min(.006,envelope*gain*(base.rapid?.006:.004));
  const headYawExtra=authored?0:direction*Math.min(.009,envelope*gain*(base.rapid?.009:.005));
  return {...base,face,attackHz,releaseHz,closureHz,joinedWords,headPitchExtra,headYawExtra};
}

/** Only append micro-motion; the existing V453 pitch and all user-authored keys
 * are preserved by the caller's normal stage-overlay system. */
export function addAdvancedVocalHeadV459<T extends {headPitch:number;headYaw:number}>(
  body:T,result:AdvancedVocalFrameV459,
):T {
  if(!result.headPitchExtra&&!result.headYawExtra)return body;
  return {...body,
    headPitch:Math.max(-.18,Math.min(.18,body.headPitch+result.headPitchExtra)),
    headYaw:Math.max(-.22,Math.min(.22,body.headYaw+result.headYawExtra))};
}
