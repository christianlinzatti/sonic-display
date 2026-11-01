/** V739: Explicit distinction between authored GLB clips and the V735 procedural fallback.
 * Baked clips contain sampled joint curves, NOT newly authored mesh weights or IK guarantees.
 */
import {AnimationClip,Euler,Quaternion,QuaternionKeyframeTrack,Vector3,VectorKeyframeTrack,
 type Object3D,type KeyframeTrack} from 'three';
import {GLTFExporter} from 'three/examples/jsm/exporters/GLTFExporter.js';
import {clone as cloneSkinnedScene} from 'three/examples/jsm/utils/SkeletonUtils.js';
import {findAvatarRigTargets} from './avatarRigController';
import {normalizeHipDanceV735,sampleHipDanceV735} from './hipDanceV735';
import {withPrivateGltfV769} from './privateGltfLifecycleV769';
import {disposeClonedAvatarSkeletonsV654} from './disposeClonedAvatarSkeletonsV654';

import {isHipGlbClipV739,type HipGlbClipNameV739} from './hipClipAvailabilityV739';
export {HIP_GLB_NAMES_V739,isHipGlbClipV739,resolveClipAvailabilityV739} from './hipClipAvailabilityV739';
export type {HipGlbClipNameV739,ClipAvailabilityV739} from './hipClipAvailabilityV739';

export type HipBakeOptionsV739={bpm:number;strength:number;speed:number;fps?:number};
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
/** Keyframes are generated deterministically for ONE named hip movement and ONE rig.
 * The original source GLB and its other animation clips are not modified.
 */
export function bakeHipMotionClipV739(model:Object3D,mode:HipGlbClipNameV739,
 options:HipBakeOptionsV739):AnimationClip{
 if(!isHipGlbClipV739(mode))throw new Error('Unbekannte Hüftanimation.');
 const targets=findAvatarRigTargets(model);
 if(!targets.hips)throw new Error('Kein Becken-/Hips-Knochen gefunden. GLB-Export nicht möglich.');
 const bpm=Number.isFinite(options.bpm)?clamp(options.bpm,65,190):120;
 const fps=Number.isFinite(options.fps)?Math.round(clamp(options.fps!,15,40)):30;
 const config=normalizeHipDanceV735({mode,strength:options.strength,speed:options.speed});
 const duration=8*60/(bpm*(config.speed/100)); // exact beat-cycle loop even with 50–200% speed
 const count=Math.max(8,Math.round(duration*fps));
 const times=Array.from({length:count+1},(_,i)=>i*duration/count);
 model.updateWorldMatrix(true,true);
 const legLength=targets.leftFoot&&targets.rightFoot?(
  targets.hips.getWorldPosition(new Vector3()).distanceTo(targets.leftFoot.getWorldPosition(new Vector3()))+
  targets.hips.getWorldPosition(new Vector3()).distanceTo(targets.rightFoot.getWorldPosition(new Vector3())))/2:0;
 const hasTranslation=legLength>.15&&legLength<6;
 const parentScale=targets.hips.parent?.getWorldScale(new Vector3())??new Vector3(1,1,1);
 const samples=times.map((t)=>sampleHipDanceV735({settings:config,seconds:t,bpm,
  genre:'',section:'hook',playing:true,reducedMotion:false,energy:.75,
  footIKEnabled:hasTranslation,contactKnown:hasTranslation,plantedLeft:true,plantedRight:true}));
 const tracks:KeyframeTrack[]=[];
 const assigned=new Map<string,Object3D>();
 const addQuaternion=(node:Object3D|undefined,angles:(i:number)=>[number,number,number])=>{
  if(!node)return;
  if(!node.name)throw new Error('Ein animierter Rig-Knochen besitzt keinen Namen.');
  if(assigned.has(node.name)&&assigned.get(node.name)!==node)throw new Error(`Mehrdeutiger Rig-Knochen: ${node.name}`);
  let duplicates=0;model.traverse(n=>{if(n.name===node.name)duplicates++;});
  if(duplicates!==1)throw new Error(`Knochenname nicht eindeutig: ${node.name}`);
  if([...assigned.values()].includes(node))return; // a shared rig target must not create duplicate tracks
  assigned.set(node.name,node);
  const original=node.quaternion.clone();
  const values:number[]=[];
  samples.forEach((_,i)=>{
   const [x,y,z]=angles(i);
   const q=original.clone().multiply(new Quaternion().setFromEuler(new Euler(x,y,z,'XYZ')));
   values.push(q.x,q.y,q.z,q.w);
  });
  tracks.push(new QuaternionKeyframeTrack(`${node.name}.quaternion`,times,values));
 };
 addQuaternion(targets.hips,i=>[samples[i].hipPitch??0,0,samples[i].hipRoll??0]);
 addQuaternion(targets.spine,i=>[0,0,samples[i].spineCounter]);
 addQuaternion(targets.leftLeg,i=>[samples[i].kneeCounter,0,0]);
 addQuaternion(targets.rightLeg,i=>[samples[i].kneeCounter,0,0]);
 // Only animate stance correction if the foot is explicitly grounded by a
 // compatible IK controller. No ankle rotation is baked in a planted pose.
 if(hasTranslation){
  const original=targets.hips.position;
  const sx=Math.max(.001,Math.abs(parentScale.x));
  const sy=Math.max(.001,Math.abs(parentScale.y));
  const values:number[]=[];
  samples.forEach(p=>values.push(original.x+(p.hipLateral??0)*legLength/sx,
   original.y+(p.hipVertical??0)*legLength/sy,original.z));
  tracks.push(new VectorKeyframeTrack(`${targets.hips.name}.position`,times,values));
 }
 if(tracks.length===0)throw new Error('Keine animierbaren Hüftknochen gefunden.');
 return new AnimationClip(mode,duration,tracks);
}

/** Exports a FULL rig-compatible GLB containing one generated clip. Downloaded
 * files may then be installed using the existing Motion Installer. This does
 * not automatically modify the user's installed motion library.
 */
export async function exportHipMotionGlbV739(url:string,mode:HipGlbClipNameV739,
 options:HipBakeOptionsV739):Promise<File>{
 if(!url)throw new Error('Kein GLB-Avatar ausgewählt.');
 return withPrivateGltfV769(url,async gltf=>{
 const source=cloneSkinnedScene(gltf.scene);
 try {
 const clip=bakeHipMotionClipV739(source,mode,options);
 const exported=await new GLTFExporter().parseAsync(source,
  {binary:true,animations:[clip],onlyVisible:false,trs:true});
 if(!(exported instanceof ArrayBuffer))throw new Error('Der GLB-Export hat keine Binärdatei erzeugt.');
 if(exported.byteLength>35*1024*1024)throw new Error('Das GLB überschreitet 35 MB. Bitte ein kleineres Avatar-Modell verwenden.');
 const base=(url.split('/').pop()||'avatar').replace(/\.(glb|gltf)(\?.*)?$/i,'').replace(/[^a-zA-Z0-9_-]/g,'-').slice(0,36)||'avatar';
 return new File([exported],`${base}-${mode}-v739.glb`,{type:'model/gltf-binary'});
 } finally { disposeClonedAvatarSkeletonsV654(source); }
 });
}
