/** V508 sampled animated rig capsules. Runs on the existing cloned GLB model,
 * never on cached useGLTF assets and never writes into imported clip or bones.
 * Three world positions already include stage root and avatarScale, so no
 * additional stage transform or modelScale may be applied.
 */
import {Vector3,type Object3D} from 'three';
import {LANDMARK_PATTERNS} from './measureGlbBodyV507';
import type {BodyLandmarkV507,BodyProfileV507} from './avatarBodyAwarenessV507';
import {validCapsuleV508,type MotionCapsuleV508,type MotionPointV508,type MotionSampleV508} from './animatedCollisionV508';
export type AnimatedBoneMapV508=Partial<Record<BodyLandmarkV507,Object3D>>;
export function findAnimatedBonesV508(model:Object3D):AnimatedBoneMapV508 {
 const map:AnimatedBoneMapV508={};
 model.traverse(node=>{
  if(!(node as Object3D&{isBone?:boolean}).isBone)return;
  const name=node.name.toLowerCase().replace(/[^a-z0-9]/g,'');
  const match=LANDMARK_PATTERNS.find(([key,re])=>!map[key]&&re.test(name));
  if(match)map[match[0]]=node;
 });
 return map;
}
const cl=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const middle=(a:MotionPointV508,b:MotionPointV508):MotionPointV508=>[(a[0]+b[0])/2,(a[1]+b[1])/2,(a[2]+b[2])/2];
/** Sample at most five capsules: torso, upper/lower arm on each side.
 * If the rig lacks one chain it simply contributes fewer capsules.
 */
export function sampleAnimatedGlbV508(bones:AnimatedBoneMapV508,profile:BodyProfileV507,at:number):MotionSampleV508|undefined {
 if(!Number.isFinite(at))return;
 const points:Partial<Record<BodyLandmarkV507,MotionPointV508>>={};
 const tmp=new Vector3();
 for(const [name,bone] of Object.entries(bones) as [BodyLandmarkV507,Object3D][]){
  bone.getWorldPosition(tmp);
  if([tmp.x,tmp.y,tmp.z].every(Number.isFinite))points[name]=[tmp.x,tmp.y,tmp.z];
 }
 const capsules:MotionCapsuleV508[]=[];
 const add=(a:MotionPointV508|undefined,b:MotionPointV508|undefined,radius:number,part:'torso'|'arm')=>{
  if(!a||!b)return;
  const c:MotionCapsuleV508={a,b,radius,part};if(validCapsuleV508(c))capsules.push(c);
 };
 const shoulders=points.leftShoulder&&points.rightShoulder?middle(points.leftShoulder,points.rightShoulder):undefined;
 const hips=points.leftHip&&points.rightHip?middle(points.leftHip,points.rightHip):undefined;
 add(shoulders,hips,cl(profile.torsoRadius*.45,.135,.27),'torso');
 const armRadius=cl(profile.armReach*.62,.052,.12);
 for(const side of ['left','right'] as const){
  add(points[`${side}Shoulder`],points[`${side}Elbow`],armRadius,'arm');
  add(points[`${side}Elbow`],points[`${side}Wrist`],armRadius*.9,'arm');
 }
 return capsules.length?{at,capsules}:undefined;
}
