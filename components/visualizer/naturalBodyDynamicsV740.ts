/** V740 Natural Body Dynamics. Pure additive secondary motions for the
 * V738 hip studio, shared between live stage and 3D preview.  No mesh
 * deformation, authored clips, root displacement or additional IK solver.
 * Plant-aware ankle assistance is disabled for feet currently in stance.
 */
import type {AvatarRigMotion} from './avatarRigController';
import type {HipDanceChannelsV735, HipDanceModeV735} from './hipDanceV735';

export type NaturalBodySettingsV740={enabled:boolean;strength:number;arms:number;legs:number};
export const DEFAULT_NATURAL_BODY_V740:Readonly<NaturalBodySettingsV740>=Object.freeze({
 enabled:true,strength:70,arms:75,legs:65,
});
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
export function normalizeNaturalBodyV740(raw:Partial<NaturalBodySettingsV740>|null|undefined):NaturalBodySettingsV740{
 const percent=(n:unknown,def:number)=>finite(n)?Math.round(clamp(n,0,100)):def;
 return {enabled:typeof raw?.enabled==='boolean'?raw.enabled:true,
  strength:percent(raw?.strength,70),arms:percent(raw?.arms,75),legs:percent(raw?.legs,65)};
}
export type NaturalBodyInputV740={
 pose:HipDanceChannelsV735;mode:HipDanceModeV735;seconds:number;
 playing:boolean;reducedMotion:boolean;manualPriority?:boolean;
 footIKEnabled:boolean;contactKnown:boolean;plantedLeft?:boolean;plantedRight?:boolean;
 settings?:Partial<NaturalBodySettingsV740>|null;
};
export type NaturalBodyChannelsV740={chestRoll:number;chestTwist:number;
 leftArm:number;rightArm:number;leftForearm:number;rightForearm:number;
 leftLeg:number;rightLeg:number;leftAnkle:number;rightAnkle:number;headTilt:number};
const ZERO:Readonly<NaturalBodyChannelsV740>=Object.freeze({chestRoll:0,chestTwist:0,
 leftArm:0,rightArm:0,leftForearm:0,rightForearm:0,leftLeg:0,rightLeg:0,
 leftAnkle:0,rightAnkle:0,headTilt:0});
const absMax=(...values:number[])=>Math.max(...values.map(Math.abs));
/** Use the *already crossfaded* hip pose as envelope, not an independent beat
 * pulse. Thus V738 transition, manual priority, pause and reduced-motion zero
 * automatically fade or clear secondary motion as well.
 */
export function sampleNaturalBodyV740(input:NaturalBodyInputV740):NaturalBodyChannelsV740{
 const s=normalizeNaturalBodyV740(input.settings);
 if(!s.enabled||s.strength===0||!input.playing||input.reducedMotion||input.manualPriority||
  input.mode==='off'||!finite(input.seconds)||input.seconds<0)return {...ZERO};
 const {hipPitch,hipRoll,hipLateral,hipVertical}=input.pose;
 if(!finite(hipPitch)||!finite(hipRoll)||!finite(hipLateral)||!finite(hipVertical))return {...ZERO};
 const envelope=clamp(absMax(hipRoll/.12,hipPitch/.1,hipLateral/.018,hipVertical/.022),0,1);
 if(envelope<1e-7)return {...ZERO};
 const intensity=envelope*s.strength/100;
 const armGain=s.arms/100,legGain=s.legs/100;
 const wave=Math.sin((input.seconds%86400)*Math.PI*2*.7);
 // Opposing shoulder roll and small torso torsion maintain centre of gravity.
 const chestRoll=clamp(-hipRoll*.37*intensity,-.032,.032);
 const chestTwist=clamp((hipRoll*.22+hipPitch*.17)*intensity,-.025,.025);
 const armBase=clamp((-.45*hipRoll+.2*hipPitch)*intensity*armGain,-.035,.035);
 const asym=clamp(.012*wave*intensity*armGain,-.012,.012);
 const bounce=Math.max(0,-hipVertical);
 // Leg follow is deliberately small. The existing two-bone IK gets final say.
 const kneeBase=clamp((bounce*.8+hipPitch*.18)*intensity*legGain,-.018,.025);
 const weight=clamp(hipRoll*.15*intensity*legGain,-.014,.014);
 const canAnkle=input.footIKEnabled&&input.contactKnown;
 const leftStance=!canAnkle||input.plantedLeft===true;
 const rightStance=!canAnkle||input.plantedRight===true;
 return {chestRoll,chestTwist,
  leftArm:clamp(armBase+asym,-.045,.045),rightArm:clamp(-armBase+asym,-.045,.045),
  leftForearm:clamp(-(armBase+asym)*.4,-.018,.018),
  rightForearm:clamp((armBase-asym)*.4,-.018,.018),
  // No additional leg/ankle rotation on a planted support side.
  leftLeg:leftStance?0:clamp(kneeBase+weight,-.03,.03),
  rightLeg:rightStance?0:clamp(kneeBase-weight,-.03,.03),
  leftAnkle:leftStance?0:clamp(-kneeBase*.4,-.012,.012),
  rightAnkle:rightStance?0:clamp(-kneeBase*.4,-.012,.012),
  headTilt:clamp(-chestRoll*.3,-.012,.012)};
}
/** Keep the old rig signals intact; only new, separately named bounded axes
 * are added. Inactive frames intentionally submit zero to remove old overlays.
 */
export function blendNaturalBodyV740<T extends AvatarRigMotion>(base:T,ch:NaturalBodyChannelsV740):T{
 return {...base,naturalChestRoll:ch.chestRoll,naturalChestTwist:ch.chestTwist,
  naturalLeftArm:ch.leftArm,naturalRightArm:ch.rightArm,
  naturalLeftForearm:ch.leftForearm,naturalRightForearm:ch.rightForearm,
  naturalLeftLeg:ch.leftLeg,naturalRightLeg:ch.rightLeg,
  naturalLeftAnkle:ch.leftAnkle,naturalRightAnkle:ch.rightAnkle,
  naturalHeadTilt:ch.headTilt};
}
