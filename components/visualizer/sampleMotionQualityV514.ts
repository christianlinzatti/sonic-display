/** Read V508's cached animated bone map at the same sampling instant, without
 * advancing the AnimationMixer or creating an additional useFrame loop. */
import {Vector3} from 'three';
import type {AnimatedBoneMapV508} from './measureAnimatedGlbV508';
import type {BodyLandmarkV507} from './avatarBodyAwarenessV507';
import type {MotionPointV508} from './animatedCollisionV508';
import type {MotionPoseV514} from './motionQualityInspectorV514';
const reusable=new Vector3();
export function sampleMotionPoseV514(bones:AnimatedBoneMapV508,at:number,floorY=0):MotionPoseV514|undefined {
 if(!Number.isFinite(at)||!Number.isFinite(floorY))return;
 const joints:Partial<Record<BodyLandmarkV507,MotionPointV508>>={};
 for(const [key,bone] of Object.entries(bones) as [BodyLandmarkV507,NonNullable<AnimatedBoneMapV508[BodyLandmarkV507]>][]) {
  bone.getWorldPosition(reusable);
  if([reusable.x,reusable.y,reusable.z].every(Number.isFinite))joints[key]=[reusable.x,reusable.y,reusable.z];
 }
 return Object.keys(joints).length?{at,floorY,joints}:undefined;
}
