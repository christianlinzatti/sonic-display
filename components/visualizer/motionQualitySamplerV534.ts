/** Browser-only sampler. Three.js evaluates original animation tracks on a
 * separately loaded GLB; the installed avatar, library and stage are untouched. */
import { AnimationMixer, Box3, LoopOnce, Vector3, type Object3D } from "three";
import { readGLB } from "./motionClipInspector";
import { inspectSampledMotionV534, compareMotionTransitionV534, motionReviewLabelV534,
  type MotionPointV534, type SampledPoseV534, type MotionSampleReportV534, type PoseTransitionV534 } from "./advancedMotionInspectorV534";
import { analyzeGLBMotionClip, type ClipQualityReport } from "./glbMotionQualityAnalyzer";
import { inspectMotionQualityV321, transitionQualityV321, type MotionQualityEventV321 } from "./advancedMotionQualityV321";
export type AdvancedMotionReportV534={clipName:string;source:"original-glb"|"separate-motion-glb";keyframes:ClipQualityReport;
  pose:MotionSampleReportV534;curveEvents:MotionQualityEventV321[];transition:PoseTransitionV534|null;
  transitionCurveDegrees:number|null;transitionTo:string|null;summary:string};
const match=(name:string,role:"hips"|"head"|"leftFoot"|"rightFoot")=>{
 const n=name.replace(/[^a-z0-9]/gi,"").toLowerCase();
 if(role==="hips")return /^(hips|pelvis|mixamorighips|roothips)$/.test(n);
 if(role==="head")return /^(head|mixamorighead)$/.test(n);
 if(role==="leftFoot")return /^(leftfoot|leftankle|mixamorigleftfoot|lfoot)$/.test(n);
 return /^(rightfoot|rightankle|mixamorigrightfoot|rfoot)$/.test(n);
};
function capture(node:Object3D|undefined):MotionPointV534|undefined{
 if(!node)return undefined;
 const v=node.getWorldPosition(new Vector3());return {x:v.x,y:v.y,z:v.z};
}
/** Samples ≤81 frames per clip, with no physics/IK or rendering claimed. */
export async function inspectAdvancedMotionV534(url:string,clipIndex:number,followingIndex?:number,source:AdvancedMotionReportV534["source"]="original-glb"):Promise<AdvancedMotionReportV534>{
 if(!Number.isInteger(clipIndex)||clipIndex<0||clipIndex>1024)throw Error("Ungültiger Animationsindex");
 if(followingIndex!==undefined&&(!Number.isInteger(followingIndex)||followingIndex<0||followingIndex>1024||followingIndex===clipIndex))throw Error("Ungültiger Folgeclip");
 const gltf=await readGLB(url),clip=gltf.animations[clipIndex],next=followingIndex===undefined?undefined:gltf.animations[followingIndex];
 if(!clip||(followingIndex!==undefined&&!next))throw Error("Animationsclip wurde in der GLB nicht gefunden");
 const scene=gltf.scene;
 scene.updateMatrixWorld(true);
 const nodes:Partial<Record<"hips"|"head"|"leftFoot"|"rightFoot",Object3D>>={};
 scene.traverse(n=>{for(const role of ["hips","head","leftFoot","rightFoot"] as const)if(!nodes[role]&&match(n.name,role))nodes[role]=n;});
 const restHips=capture(nodes.hips),restHead=capture(nodes.head),left=capture(nodes.leftFoot),right=capture(nodes.rightFoot);
 const footY=Math.min(...[left,right].filter((p):p is MotionPointV534=>!!p).map(p=>p.y));
 const box=new Box3().setFromObject(scene); const boxHeight=box.isEmpty()?0:box.getSize(new Vector3()).y;
 const rigHeight=restHead&&Number.isFinite(footY)?Math.max(.1,restHead.y-footY):boxHeight;
 const bodyHeight=Number.isFinite(rigHeight)&&rigHeight>.01?rigHeight:1;
 const mixer=new AnimationMixer(scene);
 const sample=(index:number,time:number):SampledPoseV534=>{
  const active=gltf.animations[index];mixer.stopAllAction();
  const action=mixer.clipAction(active);action.reset();action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
  mixer.setTime(Math.min(Math.max(0,time),Math.max(0,active.duration)));scene.updateMatrixWorld(true);
  const pose={time,hips:capture(nodes.hips),leftFoot:capture(nodes.leftFoot),rightFoot:capture(nodes.rightFoot)};
  action.stop();return pose;
 };
 try{
  const seconds=Math.max(0,clip.duration),count=Math.min(81,Math.max(2,Math.ceil(seconds*24)+1));
  const poses:Array<SampledPoseV534>=[];
  // Evaluate a complete clip even if 10s+; 81 bounded samples.
  for(let i=0;i<count;i++)poses.push(sample(clipIndex,seconds*i/(count-1)));
  const pose=inspectSampledMotionV534(poses,bodyHeight);
  const keyframes=analyzeGLBMotionClip(clip),curveEvents=inspectMotionQualityV321(clip,48);
  let transition:PoseTransitionV534|null=null,transitionCurveDegrees:number|null=null;
  if(next){
   transition=compareMotionTransitionV534(poses[poses.length-1],sample(followingIndex!,0),bodyHeight);
   const curves=transitionQualityV321(clip,next);transitionCurveDegrees=curves.angleRad===null?null:Math.round(curves.angleRad*180/Math.PI);
  }
  return {clipName:clip.name,source,keyframes,pose,curveEvents,transition,transitionCurveDegrees,transitionTo:next?.name??null,summary:motionReviewLabelV534(pose,transition??undefined)};
 }finally{mixer.stopAllAction();mixer.uncacheRoot(scene);}
}
