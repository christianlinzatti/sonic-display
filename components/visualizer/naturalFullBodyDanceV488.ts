/** V488 – conservative full-body coupling on top of V481/V482/V485/V486.
 * Deterministic, song-clock-driven target offsets for the built-in PROCEDURAL
 * 3D avatar only. Existing GLB mixers/Foot-IK, source choreography, casting,
 * actual ankle anchoring and song-synchronized lyrics remain untouched.
 */
import type {FootworkSlotV486} from './advancedDanceFootworkV486';

export type FullBodyPoseV488={
 active:boolean;
 hipShiftX:number; hipRoll:number; torsoPitch:number; torsoRoll:number;
 leftArmSwing:number; rightArmSwing:number; leftKneeExtra:number; rightKneeExtra:number;
 headCounterPitch:number;
};
export type FullBodyDanceInputV488={
 trackId?:string|null; seconds:number; slot:number;
 lowDepth:number; footwork:FootworkSlotV486; beat:number; kick:number; energy:number;
 genre?:string|null; playing:boolean; reducedMotion:boolean; manualPriority:boolean;
 automaticGroup:boolean; tier:'high'|'balanced'|'low';
};
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const rounded=(v:number)=>Math.round(v*100000)/100000;
const finite=(v:number)=>Number.isFinite(v);
export const neutralFullBodyPoseV488=():FullBodyPoseV488=>({active:false,hipShiftX:0,hipRoll:0,torsoPitch:0,torsoRoll:0,
 leftArmSwing:0,rightArmSwing:0,leftKneeExtra:0,rightKneeExtra:0,headCounterPitch:0});
/** Pose offsets are added to the existing procedural torso/arms. No root
 * repositioning or inverse kinematics here: the existing V481/V482 two-link
 * stance solver owns knees and fixed-ankle compensation during the crouch.
 * A planted foot is NEVER lifted by this supplementary layer.
 */
export function planNaturalFullBodyV488(input:FullBodyDanceInputV488):FullBodyPoseV488{
 const neutral=neutralFullBodyPoseV488();
 const f=input.footwork;
 if(!input.trackId?.trim()||!input.playing||input.reducedMotion||input.manualPriority||
    !input.automaticGroup||input.tier==='low'||!Number.isInteger(input.slot)||input.slot<0||input.slot>3||
    !f||![input.seconds,input.lowDepth,input.beat,input.kick,input.energy,
      f.liftLeft,f.liftRight,f.weightShift,f.offsetX,f.offsetZ,f.rootSpeed].every(finite)||
    input.seconds<0||input.lowDepth<0||input.beat<0||input.kick<0||input.energy<0){return neutral;}
 const low=clamp(input.lowDepth/.26,0,1);
 // Only use V486 swing evidence; it has already removed lifts on planted IK feet.
 const left=clamp(f.liftLeft,0,1)*(1-low);
 const right=clamp(f.liftRight,0,1)*(1-low);
 const stepping=clamp(left+right,0,1);
 const phrase=clamp(Math.max(input.beat,input.kick),0,1)*clamp(input.energy,0,1);
 const power=input.tier==='balanced'?.58:1;
 const rap=/rap|hip.?hop|trap|drill|deutsch/i.test(input.genre??'');
 const hard=/hardstyle|hardtekk|hardcore|rawstyle/i.test(input.genre??'');
 // Both side-to-side groove and left/right swing are deliberately bounded.
 // Hard dance moves are compact, avoiding artificial stomps and foot sliding.
 const musical=(rap?.70:hard?.85:.48)*phrase;
 const side=clamp(right-left,-1,1);
 const bodyPulse=Math.sin(input.seconds*(hard?3.1:1.5)+input.slot*.83);
 const hipShiftX=clamp((side*.010 + low*.005*bodyPulse*musical)*power,-.016,.016);
 const hipRoll=clamp((side*.012+low*.009*bodyPulse*musical)*power,-.018,.018);
 const torsoPitch=clamp((low*.033+stepping*.012+musical*low*.014)*power,0,.05);
 const torsoRoll=clamp((-side*.012-low*.009*bodyPulse*musical)*power,-.02,.02);
 const leftArmSwing=clamp((-right*.043+left*.026-low*.020-musical*low*.012)*power,-.075,.045);
 const rightArmSwing=clamp((-left*.043+right*.026-low*.020-musical*low*.012)*power,-.075,.045);
 // Additional knee movement only during STEP SWING, not while the planted
 // squat solver is moving the pelvis to match fixed ankle height.
 const leftKneeExtra=clamp(left*.023*power,0,.023);
 const rightKneeExtra=clamp(right*.023*power,0,.023);
 const headCounterPitch=clamp(-torsoPitch*.28,-.014,0);
 const pose:FullBodyPoseV488={active:false,hipShiftX,hipRoll,torsoPitch,torsoRoll,
   leftArmSwing,rightArmSwing,leftKneeExtra,rightKneeExtra,headCounterPitch};
 for(const key of ['hipShiftX','hipRoll','torsoPitch','torsoRoll','leftArmSwing','rightArmSwing',
   'leftKneeExtra','rightKneeExtra','headCounterPitch'] as const)pose[key]=rounded(pose[key]);
 pose.active=Object.entries(pose).some(([name,value])=>name!=='active'&&Math.abs(value as number)>.00001);
 return pose;
}
