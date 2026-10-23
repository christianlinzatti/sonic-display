import type {CameraPose} from "./stageCameraPoseHelpersV289";
import type {CameraSceneV398, CameraShotChoiceV398, CameraStudioProfileV398} from "./cameraPerformanceStudioV398";
import type {GroupPointV326} from "./multiAvatarStageDirectorV326";

/** V399 is PREVIEW ONLY. Its cast is not an automatic vocalist detector or live-stage camera override. */
export type PreviewShotV399 = Exclude<CameraShotChoiceV398,"auto">;
export type CameraPreviewPlanV399={shot:PreviewShotV399;pose:CameraPose;anchorX:number;anchorZ:number;baseDistance:number;actors:number[];source:"saved-formation"|"demonstration"};
const clamp=(n:number,a:number,b:number)=>Number.isFinite(n)?Math.min(b,Math.max(a,n)):a;
const round=(n:number)=>Math.round(n*100)/100;
/** These positions match the V326 staging coordinate system; never replace authored choreography. */
export function demoPositionsV399(count:number):GroupPointV326[]{
 const n=Math.floor(clamp(count,1,4));
 return Array.from({length:n},(_,i):GroupPointV326=>[round(n===1?0:((i-(n-1)/2)*1.35)),0,n>=3&&i%2===0?-.24:0]);
}
export function sanitizePreviewCastV399(count:number,positions:readonly GroupPointV326[]|null|undefined):GroupPointV326[]{
 const fallback=demoPositionsV399(count);
 if(!positions||positions.length<fallback.length)return fallback;
 return fallback.map((p,i):GroupPointV326=>{
  const src=positions[i];if(!Array.isArray(src))return p;
  return [round(clamp(src[0],-4.5,4.5)),0,round(clamp(src[2],-2,2))];
 });
}
export function previewShotV399({scene,choice,positions,lead=0,partner=1,profile,fromSavedFormation=false}:{
 scene:CameraSceneV398;choice:CameraShotChoiceV398;positions:readonly GroupPointV326[];
 lead?:number;partner?:number;profile:CameraStudioProfileV398;fromSavedFormation?:boolean;
}):CameraPreviewPlanV399{
 const cast=sanitizePreviewCastV399(positions.length||1,positions);
 const count=cast.length,primary=Math.floor(clamp(lead,0,count-1));
 const second=Math.floor(clamp(partner,0,count-1));
 const requested:PreviewShotV399=choice==="auto"?(scene==="verse"?"lead":"group"):choice;
 const shot:PreviewShotV399=requested==="two-shot"&&(count<2||second===primary)?"lead":requested==="group"&&count<2?"lead":requested;
 const actors=shot==="lead"?[primary]:shot==="two-shot"?[primary,second]:cast.map((_,i)=>i);
 const xs=actors.map(i=>cast[i][0]),zs=actors.map(i=>cast[i][2]);
 const centerX=(Math.min(...xs)+Math.max(...xs))/2;
 const centerZ=(Math.min(...zs)+Math.max(...zs))/2;
 const span=Math.max(...xs)-Math.min(...xs);
 // Group views account for the actually visible cast width, not a fixed single-avatar radius.
 const baseDistance=shot==="lead"?3.85:shot==="two-shot"?Math.max(5.25,3.65+span*1.22):Math.max(6.1,4.5+span*1.08);
 const tuning=profile.scenes[scene];
 const zoom=(50-clamp(tuning.distance,0,100))*.032;
 const pan=clamp(tuning.pan,-100,100)*.009;
 const anchorX=centerX,anchorZ=centerZ;
 const z=clamp(anchorZ+baseDistance+zoom,2.8,13.5);
 const targetX=clamp(anchorX+pan,-5.25,5.25);
 return {shot,actors,anchorX,anchorZ,baseDistance,
  source:fromSavedFormation?"saved-formation":"demonstration",
  pose:{x:targetX,y:2.1,z,targetX,targetY:1.12,targetZ:anchorZ,fov:shot==="lead"?36:shot==="two-shot"?39:44}};
}
/** Capture only pan + radial zoom in the V398 section profile. Orbit tilt is preview-only. */
export function updateStudioFromCastPoseV399(profile:CameraStudioProfileV398,scene:CameraSceneV398,
 plan:CameraPreviewPlanV399,orbit:CameraPose):CameraStudioProfileV398{
 const previous=profile.scenes[scene];
 const dx=orbit.x-(orbit.targetX??0),dy=orbit.y-orbit.targetY,dz=orbit.z-(orbit.targetZ??0);
 const radius=Math.hypot(dx,dy,dz);
 const vertical=plan.pose.y-plan.pose.targetY;
 const baseRadius=Math.hypot(plan.baseDistance,vertical);
 const distance=Number.isFinite(radius)&&radius>0?
  Math.round(clamp(50-(radius-baseRadius)/.032,0,100)):previous.distance;
 const px=orbit.targetX??plan.anchorX;
 const pan=Number.isFinite(px)?Math.round(clamp((px-plan.anchorX)/.009,-100,100)):previous.pan;
 return {...profile,scenes:{...profile.scenes,[scene]:{...previous,distance,pan}}};
}
export function transitionDurationV399(reducedMotion:boolean,holdMs:number):number{
 return reducedMotion?0:Math.round(clamp(holdMs*.68,250,1100));
}
