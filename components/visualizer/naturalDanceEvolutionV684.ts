/** V684 – conservative phrase-varying finishing touches for EXISTING automatic dance.
 * No new animation actions, source-clip edits, beat inference, IK contact or stage-root motion.
 * All modulation is deterministic from the existing song clock; it does not add a render loop.
 */
import type {AvatarRigMotion} from './avatarRigController';
import type {AdvancedFootworkOutputV486,FootSupportV486,FootworkSlotV486} from './advancedDanceFootworkV486';

export type DanceCharacterV684='rap-flow'|'hard-dance'|'other';
export type NaturalEvolutionInputV684={
  trackId?:string|null;seconds:number;playing:boolean;reducedMotion:boolean;
  manualPriority:boolean;quality:'low'|'balanced'|'high';
  genre?:string|null;section?:string|null;slot:number;
  footContactKnown:boolean;plantedLeft:boolean;plantedRight:boolean;
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
export function danceCharacterV684(genre?:string|null):DanceCharacterV684{
  if(/hardstyle|hardtekk|hardcore|rawstyle/i.test(genre??''))return 'hard-dance';
  if(/deutschrap|hip.?hop|trap|drill|\brap\b/i.test(genre??''))return 'rap-flow';
  return 'other';
}
/** Smooth period, with a different, deterministic performer offset. A musical
 * phrase is NOT asserted when there is no verified beat/section information.
 * This is visual long-form variation, not beat or singer detection.
 */
function phrase(input:NaturalEvolutionInputV684){
  const period=danceCharacterV684(input.genre)==='hard-dance'?6.4:8;
  return Math.sin((input.seconds/period+input.slot*.173)*Math.PI*2);
}
function validInput(input:NaturalEvolutionInputV684){
  return !!input.trackId?.trim()&&input.playing&&!input.reducedMotion&&!input.manualPriority&&
    input.quality!=='low'&&input.footContactKnown&&finite(input.seconds)&&input.seconds>=0&&
    Number.isInteger(input.slot)&&input.slot>=0&&input.slot<=3;
}
/** Add bounded non-mirrored arm accents, but ONLY when prior automatic arm motion
 * already exists. Every original rig/face/foot field is retained by spread.
 * Double-planted feet reduce hip/weight movement immediately. Contact itself
 * is never guessed and no IK ankle/root positioning is written here.
 */
export function refineNaturalDanceRigV684<T extends AvatarRigMotion>(motion:T,input:NaturalEvolutionInputV684):T{
  if(!validInput(input)||
    ![motion.armSwing,motion.followThrough,motion.hipSway,motion.weightShift,motion.shoulderRoll,
      motion.headLag,motion.legGroove,motion.footStep].every(finite))return motion;
  const ch=danceCharacterV684(input.genre);
  const p=phrase(input);
  const hook=/hook|chorus|refrain|drop/i.test(input.section??'');
  const breakSection=/break|intro|outro/i.test(input.section??'');
  const depth=input.quality==='balanced'?.55:1;
  const variety=(.5+.5*p)*depth;
  const phraseGain=clamp(1-(ch==='rap-flow'?.15:ch==='hard-dance'?.10:.08)*variety, .8,1);
  const calm=breakSection?.78:1;
  const both=input.plantedLeft&&input.plantedRight;
  const one=input.plantedLeft||input.plantedRight;
  // Preserve stillness and existing authored clip priority. On Rap, subtle
  // alternating left/right emphasis; on hard-dance, synchronized stiff accents.
  const source=motion.armSwing;
  const accentScale=ch==='rap-flow'?.11:ch==='hard-dance'?.055:.035;
  const asymmetry=clamp(source*accentScale*p*(hook?1:.82)*depth,-.045,.045);
  const currentL=motion.leftArmAccent??0,currentR=motion.rightArmAccent??0;
  const armWeight=calm*phraseGain;
  return {...motion,
    armSwing:motion.armSwing*armWeight,
    followThrough:motion.followThrough*clamp(calm*(1-.12*variety),.65,1),
    shoulderRoll:motion.shoulderRoll*clamp(calm*(1-.08*variety),.65,1),
    hipSway:motion.hipSway*(both?.76:one?.91:1)*phraseGain,
    weightShift:motion.weightShift*(both?.72:one?.88:1)*phraseGain,
    headLag:motion.headLag*(ch==='hard-dance'?.85:1)*calm,
    leftArmAccent:clamp(currentL+asymmetry,-.09,.09),
    rightArmAccent:clamp(currentR-(ch==='rap-flow'?asymmetry:asymmetry*.55),-.09,.09),
  } as T;
}

/** For the existing automatic 3/4-person group ONLY. Limits swing from V524,
 * V587 and V596; never increases a lift, alters optional stage travel, reorders
 * performers, changes rootSpeed or treats missing contact as measured contact.
 */
export function refineGroupFootworkV684(base:AdvancedFootworkOutputV486,
  input:Omit<NaturalEvolutionInputV684,'slot'|'footContactKnown'|'plantedLeft'|'plantedRight'> & {
    support:readonly FootSupportV486[];automaticGroup:boolean;
  }):AdvancedFootworkOutputV486{
  if(!base.active||!input.automaticGroup||!input.trackId?.trim()||!input.playing||
    input.reducedMotion||input.manualPriority||input.quality==='low'||
    !finite(input.seconds)||input.seconds<0||base.slots.length<3||base.slots.length>4||
    base.slots.length>input.support.length||base.slots.some(s=>
      ![s.offsetX,s.offsetZ,s.liftLeft,s.liftRight,s.rootSpeed,s.weightShift].every(finite)))return base;
  const ch=danceCharacterV684(input.genre);
  const sectionCalm=/break|intro|outro/i.test(input.section??'')?.82:1;
  const slots=base.slots.map((s,i):FootworkSlotV486=>{
    const support=input.support[i];
    const p=phrase({...input,slot:i,footContactKnown:support.tracked,
      plantedLeft:support.leftPlanted,plantedRight:support.rightPlanted});
    const variation=clamp(1-(ch==='rap-flow'?.17:ch==='hard-dance'?.10:.12)*(.5+.5*p)*
      (input.quality==='balanced'?.5:1),.78,1)*sectionCalm;
    const plantL=support.tracked&&support.leftPlanted;
    const plantR=support.tracked&&support.rightPlanted;
    const doublePlant=plantL&&plantR;
    return {...s,liftLeft:plantL?0:clamp(s.liftLeft,0,1)*variation,
      liftRight:plantR?0:clamp(s.liftRight,0,1)*variation,
      weightShift:s.weightShift*(doublePlant?.8:1)*variation};
  });
  return {active:base.active,slots};
}
