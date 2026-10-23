import type {CameraPose} from "./stageCameraPoseHelpersV289";
import type {VisualPlanV397,VisualShotV397} from "./visualPerformanceDirectorV397";

/** V398 only tunes an existing, validated visual shot; never identifies a voice. */
export type CameraSceneV398="verse"|"hook"|"drop";
export type CameraShotChoiceV398="auto"|"lead"|"two-shot"|"group";
export type CameraSceneProfileV398={shot:CameraShotChoiceV398;distance:number;pan:number};
export type CameraStudioProfileV398={enabled:boolean;holdMs:number;scenes:Record<CameraSceneV398,CameraSceneProfileV398>};
export const DEFAULT_CAMERA_STUDIO_V398:CameraStudioProfileV398={
 enabled:false,holdMs:1150,scenes:{
  verse:{shot:"auto",distance:50,pan:0},
  hook:{shot:"auto",distance:50,pan:0},
  drop:{shot:"auto",distance:50,pan:0},
 }
};
const clamp=(n:unknown,min:number,max:number,fallback:number)=>typeof n==="number"&&Number.isFinite(n)?Math.max(min,Math.min(max,n)):fallback;
const choices:readonly CameraShotChoiceV398[]=["auto","lead","two-shot","group"];
/** Old backups and edited JSON must not be allowed to pass unbounded values to the camera. */
export function normalizeCameraStudioV398(raw:unknown):CameraStudioProfileV398{
 const v=raw&&typeof raw==="object"?raw as Partial<CameraStudioProfileV398>:{};
 const s=v.scenes&&typeof v.scenes==="object"?v.scenes:{} as Partial<CameraStudioProfileV398["scenes"]>;
 const scene=(key:CameraSceneV398):CameraSceneProfileV398=>{
  const p=s[key],d=DEFAULT_CAMERA_STUDIO_V398.scenes[key];
  return {shot:p&&choices.includes(p.shot)?p.shot:d.shot,
   distance:clamp(p?.distance,0,100,d.distance),pan:clamp(p?.pan,-100,100,d.pan)};
 };
 return {enabled:v.enabled===true,holdMs:Math.round(clamp(v.holdMs,450,2400,1150)),
  scenes:{verse:scene("verse"),hook:scene("hook"),drop:scene("drop")}};
}
export const cameraSceneV398=(section:string):CameraSceneV398=>section==="hook"?"hook":section==="drop"?"drop":"verse";
/** No stage section may force unverified solo/duet roles or invisible group members. */
export function chooseCameraShotV398(plan:VisualPlanV397,section:string,profile:CameraStudioProfileV398,
 {timedLyrics,hasPartner,leadSlot,partnerSlot}:{timedLyrics:boolean;hasPartner:boolean;leadSlot?:number;partnerSlot?:number|null}):VisualPlanV397{
 if(!profile.enabled||!plan.active||plan.shot==="none")return plan;
 const chosen=profile.scenes[cameraSceneV398(section)].shot;
 if(chosen==="auto")return plan;
 const castLead=Number.isInteger(leadSlot)&&leadSlot!>=0&&leadSlot!<plan.count?leadSlot!:plan.leadSlot;
 const castPartner=plan.partnerSlot??(Number.isInteger(partnerSlot)&&partnerSlot!>=0&&partnerSlot!<plan.count&&partnerSlot!==castLead?partnerSlot!:null);
 let shot:VisualShotV397=plan.shot;
 if(chosen==="group"&&plan.count>=2&&(section==="hook"||section==="drop"||timedLyrics))shot="group";
 if(chosen==="lead"&&timedLyrics)shot="lead";
 if(chosen==="two-shot"&&timedLyrics&&hasPartner&&castPartner!==null&&plan.count>=2)shot="two-shot";
 if(shot===plan.shot)return plan;
 return {...plan,shot,leadSlot:castLead,partnerSlot:shot==="two-shot"?castPartner:null,
  reason:shot==="group"?"chorus":shot==="two-shot"?"handoff":"verse"};
}
/** Add bounded distance/pan AFTER the validated V397 framing, before final lyrics/composition guards. */
export function tuneCameraPoseV398(pose:CameraPose,plan:VisualPlanV397,section:string,
 profile:CameraStudioProfileV398,lyricsProtected:boolean):CameraPose{
 if(!profile.enabled||!plan.active||plan.shot==="none")return pose;
 const s=profile.scenes[cameraSceneV398(section)];
 const strength=Math.min(1,Math.max(0,plan.strength))*(lyricsProtected?.35:1);
 if(strength<=0||s.distance===50&&s.pan===0)return pose;
 // 0 = wider / farther; 100 = tighter / nearer. Defaults to no change.
 const z=clamp(pose.z+(50-s.distance)*.032*strength,3.2,9.2,pose.z);
 const offset=s.pan*.007*strength;
 const targetX=clamp((pose.targetX??0)+offset,-2.6,2.6,pose.targetX??0);
 const shift=targetX-(pose.targetX??0);
 return {...pose,z,targetX,x:pose.x+shift};
}
/** Preview represents framing, not voice detection or the actual concert's live camera position. */
export function previewCameraPoseV398(section:CameraSceneV398,profile:CameraStudioProfileV398):CameraPose{
 const p=profile.scenes[section],choice=p.shot==="auto"?(section==="verse"?"lead":"group"):p.shot;
 const distance=choice==="lead"?4.05:choice==="two-shot"?5.1:5.85;
 const pan=p.pan*.009;
 return {x:pan,y:.18,z:clamp(distance+(50-p.distance)*.032,2.3,9.4,distance),
  targetX:pan,targetY:.35,targetZ:0,fov:choice==="lead"?34:choice==="two-shot"?39:43};
}
/** Only the OrbitControls' supported zoom/pan axes are persisted. */
export function profileFromPreviewPoseV398(profile:CameraStudioProfileV398,scene:CameraSceneV398,pose:CameraPose):CameraStudioProfileV398{
 const current=profile.scenes[scene],choice=current.shot==="auto"?(scene==="verse"?"lead":"group"):current.shot;
 const base=choice==="lead"?4.05:choice==="two-shot"?5.1:5.85;
 // Orbiting alters Z but not the camera-to-target radius. Persist actual zoom only.
 const radius=Math.hypot(pose.x-(pose.targetX??0),pose.y-pose.targetY,pose.z-(pose.targetZ??0));
 const projectedZ=Math.sqrt(Math.max(0,radius*radius-.17*.17));
 const distance=Math.round(clamp(50-(projectedZ-base)/.032,0,100,current.distance));
 const pan=Math.round(clamp((pose.targetX??0)/.009,-100,100,current.pan));
 return {...profile,scenes:{...profile.scenes,[scene]:{...current,distance,pan}}};
}
