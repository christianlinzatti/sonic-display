import type {Lyrics} from "@/types/music";
import {rapLipWordAtV415} from "./rapLipPrecisionV415";
import type {ExpressiveLipContextV453,ExpressiveLipSourceV453} from "./expressiveLipSyncV453";
import type {NaturalVocalExpressionV499} from "./naturalVocalExpressionV499";

/** V523 is a bounded VISUAL polish of timed words, not acoustic phoneme alignment.
 * Keep V384 / V415 closure, V420 artist edits, V423 audio and manually assigned
 * singer ownership authoritative. No GLB animation data or original clips are edited.
 */
export type DeutschrapLipFrameV523=NaturalVocalExpressionV499&{
  activeV523:boolean;cadenceV523:"fast-verse"|"none";
};
export type DeutschrapLipOptionsV523=ExpressiveLipContextV453&{
  /** Authoritatively resolved earlier by V385 / V496 when cast has several singers. */
  roleAllowed?:boolean;
};
const unit=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const ease=(v:number)=>{const u=unit(v);return u*u*(3-2*u);};
const clean=(v:string)=>v.trim().toLocaleLowerCase("de-DE").replace(/\s+/gu," ");
const inactive=(f:NaturalVocalExpressionV499):DeutschrapLipFrameV523=>({...f,activeV523:false,cadenceV523:"none"});

export function refineDeutschrapLipV523(
 lyrics:Lyrics|null,base:NaturalVocalExpressionV499,
 cue:ExpressiveLipSourceV453|null|undefined,ctx:DeutschrapLipOptionsV523,
):DeutschrapLipFrameV523 {
 const off=inactive(base);
 if(!cue||!base.active||!base.activeV476||!ctx.playing||ctx.enabled===false||
    ctx.reducedMotion||ctx.manualSilent||ctx.roleAllowed===false||
    ctx.preserveAudioMouth||!lyrics?.synced||cue.confidence!=="word"||
    cue.vocal.style!=="rap"||!Number.isFinite(cue.effectiveTimeMs))return off;
 const gain=unit((ctx.intensity??80)/100);
 if(gain===0)return off;
 const mark=rapLipWordAtV415(lyrics,cue.effectiveTimeMs);
 if(!mark||clean(cue.vocal.activeWord??"")!==clean(mark.word.text))return off;
 const duration=mark.end-mark.start;
 // Require proof of a dense word-to-word passage, not just a short standalone word.
 const connectedPrev=mark.previousGap>=0&&mark.previousGap<=95;
 const connectedNext=!!mark.next&&mark.nextGap>=0&&mark.nextGap<=95;
 if(!(duration>=65&&duration<=440)||!(connectedPrev||connectedNext))return off;
 const edited=ctx.editedWords?.some(w=>w.startMs===mark.start&&clean(w.text)===clean(mark.word.text));
 if(edited)return off;
 const elapsed=cue.effectiveTimeMs-mark.start;
 // Every accent stays INSIDE the verified word; gaps, seeks and pauses produce no cue.
 const gate=ease(elapsed/Math.max(28,Math.min(75,duration*.27)))*
   ease((duration-elapsed)/Math.max(32,Math.min(90,duration*.30)));
 const closed=unit(base.face.lipsClosed);
 // Never weaken V384/V415 B/P/M seals or anticipate a following bilabial onset.
 const nextBilabial=!!mark.next&&/^[\s"'„“(]*[bmp]/iu.test(mark.next.text);
 const nearNext=connectedNext&&!nextBilabial&&elapsed>duration*.70;
 const accent=gate*gain*(nearNext?.018:.012)*(1-closed);
 const face={...base.face};
 if(closed<.25){
   face.jaw=unit(Math.min(1-closed*.985,face.jaw+accent));
   // Limited, deterministic coarticulation -- no fabricated individual phoneme times.
   if(nearNext&&mark.next){
     const letter=mark.next.text.match(/[aeiouäöü]/iu)?.[0]??"";
     const blend=gate*gain*.035*(1-closed);
     face.round=unit(face.round*(1-blend)+(/^[oöuü]$/iu.test(letter)?1:0)*blend);
     face.wide=unit(face.wide*(1-blend)+(/^[aeiä]$/iu.test(letter)?1:0)*blend);
   }
 }
 const micro=gate*gain*.008;
 face.cheek=unit(face.cheek+micro);
 face.brow=unit(face.brow+micro*.75);
 // Head follows the phrase without introducing a nod on each syllable.
 const authored=ctx.authoredBody===true;
 const pitch=authored?0:-gate*gain*.0035;
 const yaw=authored?0:(Math.floor(mark.start/1300)%2===0?1:-1)*gate*gain*.002;
 return {...base,face,activeV523:true,cadenceV523:"fast-verse",
   headPitchExtra:Math.max(-.18,Math.min(.18,base.headPitchExtra+pitch)),
   headYawExtra:Math.max(-.22,Math.min(.22,base.headYawExtra+yaw))};
}

