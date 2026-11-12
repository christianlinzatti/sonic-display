/** Phase 1: manually invoked, target-rig foot stability review.
 * Evaluates retargeted QUATERNION clips on a separately loaded/private avatar.
 * Never edits an installed avatar, clip, animation mixer, or stage foot IK.
 */
import {AnimationMixer,Box3,LoopOnce,Vector3,type AnimationClip,type Object3D,type Bone} from "three";
import {retargetHumanoidClips,readRetargetCalibration,semantic,type RetargetCalibration} from "./avatarAnimationRetarget";
import {withPrivateGltfV769} from "./privateGltfLifecycleV769";
import {inspectFootPlantQuality,type FootPlantQualityReport} from "./estimatedFootPlantQuality";
import type {MotionPointV534,SampledPoseV534} from "./advancedMotionInspectorV534";

export type TargetRigFootReview={
  status:"analyzed"|"unavailable";
  explanation:string;
  matchedTracks:number;
  skippedTracks:number;
  totalTracks:number;
  sampleCount:number;
  footPlant:FootPlantQualityReport;
};
const noFoot=(reason:string,matchedTracks=0,skippedTracks=0,totalTracks=0):TargetRigFootReview=>({
  status:"unavailable",explanation:reason,matchedTracks,skippedTracks,totalTracks,
  sampleCount:0,footPlant:inspectFootPlantQuality([],1.8),
});
const find=(root:Object3D,role:string):Bone|undefined=>{
  let result:Bone|undefined;
  root.traverse(node=>{
    if(!result&&(node as Bone).isBone&&semantic(node.name)===role)result=node as Bone;
  });
  return result;
};
const capture=(node:Bone|undefined):MotionPointV534|undefined=>{
  if(!node)return;
  const p=node.getWorldPosition(new Vector3());
  return {x:p.x,y:p.y,z:p.z};
};

/** Public pure(ish) 3D calculation for isolated tests: target scene is mutated
 * transiently by Three.js and MUST be privately owned; no external rigs.
 */
export function assessTargetRigFootQuality(
  clips:readonly AnimationClip[],source:Object3D,target:Object3D,
  clipIndex:number,calibration?:RetargetCalibration,
):TargetRigFootReview{
  if(!Number.isInteger(clipIndex)||clipIndex<0||clipIndex>=clips.length)
    return noFoot("Animationsclip nicht vorhanden.");
  const original=clips[clipIndex];
  if(!Number.isFinite(original.duration)||original.duration<=0||original.duration>600||
     original.tracks.length===0||original.tracks.length>240||
     original.tracks.some(t=>t.times.length>12000))
    return noFoot("Animationsclip für die sichere Qualitätsprüfung zu lang oder unvollständig.");
  // Retarget exactly the chosen clip; no hidden batch or separate mixer in the live stage.
  const mapped=retargetHumanoidClips([original],source,target,calibration);
  const {matchedTracks,skippedTracks,totalTracks}=mapped.report;
  const clip=mapped.clips[0];
  if(!clip||matchedTracks===0)
    return noFoot("Keine kompatiblen animierten Skelettgelenke für diesen Avatar.",matchedTracks,skippedTracks,totalTracks);
  const hips=find(target,"hips"),left=find(target,"leftfoot"),right=find(target,"rightfoot"),head=find(target,"head");
  if(!hips||(!left&&!right))
    return noFoot("Ziel-Avatar hat keine auswertbaren Hüft- oder Fußgelenke.",matchedTracks,skippedTracks,totalTracks);
  target.updateMatrixWorld(true);
  const mid=capture(hips)!,headPose=capture(head),leftPose=capture(left),rightPose=capture(right);
  const floor=Math.min(...[leftPose,rightPose].filter((x):x is MotionPointV534=>!!x).map(p=>p.y));
  // Dimensionless relative drift is comparable across correctly scaled rigs.
  const measuredHeight=headPose?headPose.y-floor:2*(mid.y-floor);
  if(!Number.isFinite(measuredHeight)||measuredHeight<.1||measuredHeight>50)
    return noFoot("Keine belastbare Körperhöhe für die Fußanalyse ermittelbar.",matchedTracks,skippedTracks,totalTracks);
  const mixer=new AnimationMixer(target);
  try{
    const action=mixer.clipAction(clip);
    action.reset();action.setLoop(LoopOnce,1);action.clampWhenFinished=true;action.play();
    const samples=Math.min(81,Math.max(2,Math.ceil(original.duration*24)+1));
    const poses:SampledPoseV534[]=[];
    for(let i=0;i<samples;i++){
      const time=original.duration*i/(samples-1);
      mixer.setTime(time);target.updateMatrixWorld(true);
      poses.push({time,hips:capture(hips),leftFoot:capture(left),rightFoot:capture(right)});
    }
    const footPlant=inspectFootPlantQuality(poses,measuredHeight);
    return {
      status:footPlant.status==="unavailable"||footPlant.status==="insufficient"?"unavailable":"analyzed",
      explanation:footPlant.status==="inspect"
        ?"Mögliche Fußverschiebung am gewählten Ziel-Avatar: in der 3D-Vorschau kontrollieren."
        :footPlant.status==="no-obvious-slip"
          ?"Keine deutliche horizontale Fußverschiebung in den geschätzten Standphasen. Sichtprüfung bleibt nötig."
          :"Zu wenige auswertbare Fußpositionen auf diesem Avatar.",
      matchedTracks,skippedTracks,totalTracks,sampleCount:poses.length,footPlant,
    };
  }finally{
    mixer.stopAllAction();mixer.uncacheRoot(target);
  }
}

/** Loads BOTH motion and target via private lifetimes on explicit user action.
 * Calibration mirrors the actual saved mapping/rotation for this avatar.
 */
export async function inspectTargetRigFootQuality(
  motionUrl:string,avatarUrl:string,clipIndex:number,
):Promise<TargetRigFootReview>{
  if(!motionUrl||!avatarUrl||motionUrl===avatarUrl)return noFoot("Zwei getrennte GLB-Quellen erforderlich.");
  return withPrivateGltfV769(motionUrl,motion=>
    withPrivateGltfV769(avatarUrl,avatar=>
      assessTargetRigFootQuality(motion.animations,motion.scene,avatar.scene,clipIndex,readRetargetCalibration(avatarUrl))));
}
