/** V507 rest-pose landmark extraction from an already loaded GLTF scene.
 * Run once on GLTF load, never in useFrame; skinned animations remain unmodified.
 */
import {Box3,Vector3,type Object3D} from 'three';
import {profileAvatarBodyV507,type BodyLandmarkV507,type LandmarkMapV507,type BodyProfileV507} from './avatarBodyAwarenessV507';
export const LANDMARK_PATTERNS:readonly [BodyLandmarkV507,RegExp][]=[
 ['leftShoulder',/(?:leftshoulder|leftupperarm|lupperarm|leftarm)$/],
 ['rightShoulder',/(?:rightshoulder|rightupperarm|rupperarm|rightarm)$/],
 ['leftElbow',/(?:leftforearm|leftlowerarm|lforearm)$/],
 ['rightElbow',/(?:rightforearm|rightlowerarm|rforearm)$/],
 ['leftWrist',/(?:lefthand|lwrist)$/],['rightWrist',/(?:righthand|rwrist)$/],
 ['leftHip',/(?:leftupleg|leftthigh|leftupperleg)$/],
 ['rightHip',/(?:rightupleg|rightthigh|rightupperleg)$/],
 ['leftKnee',/(?:leftleg|leftlowerleg|leftshin)$/],
 ['rightKnee',/(?:rightleg|rightlowerleg|rightshin)$/],
 ['leftFoot',/(?:leftfoot|leftankle)$/],['rightFoot',/(?:rightfoot|rightankle)$/],
 ['head',/(?:head|headbone)$/],
];
const cache=new WeakMap<Object3D,Map<number,BodyProfileV507>>();
export function measureGlbBodyV507(scene:Object3D,modelScale:number):BodyProfileV507 {
 const scalar=Number.isFinite(modelScale)&&modelScale>0?modelScale:1;
 const byScale=cache.get(scene);
 const fromCache=byScale?.get(scalar);
 if(fromCache)return fromCache;
 // GLTF useGLTF scene is the original rest model. Only world matrices are read.
 scene.updateWorldMatrix(true,true);
 const landmarks:LandmarkMapV507={};
 const tmp=new Vector3();
 scene.traverse(node=>{
  if(!(node as Object3D&{isBone?:boolean}).isBone)return;
  const name=node.name.toLowerCase().replace(/[^a-z0-9]/g,'');
  const match=LANDMARK_PATTERNS.find(([key,re])=>!(key in landmarks)&&re.test(name));
  if(!match)return;
  node.getWorldPosition(tmp);
  if([tmp.x,tmp.y,tmp.z].every(Number.isFinite))landmarks[match[0]]=[tmp.x,tmp.y,tmp.z];
 });
 const box=new Box3().setFromObject(scene);
 const dims=new Vector3();box.getSize(dims);
 const bounds=box.isEmpty()||![dims.x,dims.y,dims.z].every(Number.isFinite)?null:
  {height:dims.y,width:dims.x,depth:dims.z};
 const profile=profileAvatarBodyV507({landmarks,bounds,scale:scalar});
 const entry=byScale??new Map<number,BodyProfileV507>();entry.set(scalar,profile);
 if(!byScale)cache.set(scene,entry);
 return profile;
}
