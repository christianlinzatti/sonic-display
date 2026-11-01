/** V685 – bounded Deutschrap gesture finishing, only on existing automatic GLB overlays.
 * Section names are staging cues (not detected vocals); word cues come exclusively
 * from timestamp-synchronised lyrics. No singer identity or beat is inferred here.
 * Pure and deterministic; never touches feet, root position, facial rig or original clips.
 */
import type {AvatarRigMotion} from './avatarRigController';

export type RapTimingCueV685={active:boolean;source:'none'|'line'|'word';accent:number};
export type RapPerformanceInputV685={
  trackId?:string|null;seconds:number;playing:boolean;reducedMotion:boolean;
  manualPriority:boolean;quality:'low'|'balanced'|'high';
  genre?:string|null;section?:string|null;slot:number;
  footContactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
  lyricCue?:RapTimingCueV685|null;
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const bound=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
export function rapGenreV685(genre?:string|null):boolean{
  return /deutschrap|hip.?hop|trap|drill|(^|[^a-z])rap([^a-z]|$)/i.test(genre??'');
}
export function trustworthyRapCueV685(cue:RapTimingCueV685|null|undefined):number{
  if(!cue?.active||(cue.source!=='word'&&cue.source!=='line')||!finite(cue.accent)||cue.accent<0||cue.accent>.45)return 0;
  return cue.source==='word'?cue.accent:cue.accent*.48;
}
/** Micro-variation on already active arm gestures, not a new dance. Stays neutral
 * if playback/manual choreography is in charge, or the overlay is at rest.
 * Optionals get checked before use; no NaN may reach the rig.
 */
export function refineAdvancedRapRigV685<T extends AvatarRigMotion>(motion:T,input:RapPerformanceInputV685):T{
  if(!rapGenreV685(input.genre)||!input.trackId?.trim()||!input.playing||input.reducedMotion||
    input.manualPriority||input.quality==='low'||!input.footContactKnown||
    !finite(input.seconds)||input.seconds<0||!Number.isInteger(input.slot)||input.slot<0||input.slot>3||
    ![motion.armSwing,motion.followThrough,motion.shoulderRoll,motion.hipSway,motion.weightShift].every(finite)||
    ![motion.leftArmAccent??0,motion.rightArmAccent??0,motion.torsoTwist??0].every(finite))return motion;
  const rawSection=(input.section??'').trim().toLowerCase();
  // Unknown/estimated sections must never be labelled as verified verses/hooks.
  const hook=/hook|chorus|refrain/.test(rawSection);
  const verse=/verse|strophe|rap/.test(rawSection);
  const calm=/break|intro|outro|silence/.test(rawSection);
  const phrasePeriod=hook?4.8:verse?3.6:5.6;
  let hash=2166136261;
  for(let i=0;i<input.trackId.length;i++)hash=Math.imul(hash^input.trackId.charCodeAt(i),16777619);
  const songOffset=(hash>>>0)%9/9;
  const pulse=Math.sin((input.seconds/phrasePeriod+input.slot*.21+songOffset)*Math.PI*2);
  const cycle=.5+.5*pulse;
  const lyric=trustworthyRapCueV685(input.lyricCue);
  const quality=input.quality==='balanced'?.6:1;
  const sourceActivity=bound(Math.max(Math.abs(motion.armSwing),Math.abs(motion.followThrough)),0,.45);
  const mute=calm?.35:1;
  const cuePower=lyric*quality*mute;
  // The source activity is essential: silence/idle overlays cannot create a gesture.
  const gesture=sourceActivity*quality*mute*(.038*(cycle-.5)+(hook?.058:verse?.040:.022)*cuePower);
  const side=(input.slot%2===0?1:-1);
  const existingL=motion.leftArmAccent??0,existingR=motion.rightArmAccent??0;
  // Clamp the additional delta, as well as the final bounded accents; existing
  // V684 values are small, but never widen the maximum admitted arm rotation.
  const deltaL=bound(gesture*side,-.024,.024);
  const deltaR=bound(gesture*(hook?.64:.48)*(-side),-.020,.020);
  const bothPlanted=input.plantedLeft&&input.plantedRight;
  const torso=(motion.torsoTwist??0)+bound(sourceActivity*(hook?.050:.032)*cuePower*(bothPlanted?.45:1),0,.012)*side;
  const shoulderGain=1+bound(cuePower*(hook?.042:.026),0,.02);
  return {...motion,
    leftArmAccent:bound(existingL+deltaL,-.09,.09),
    rightArmAccent:bound(existingR+deltaR,-.09,.09),
    torsoTwist:bound(torso,-.12,.12),
    shoulderRoll:motion.shoulderRoll*shoulderGain,
  } as T;
}
