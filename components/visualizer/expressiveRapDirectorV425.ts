import type { Lyrics } from "@/types/music";
import {resolveRapDuetCueV416, type RapDuetAssignmentV416} from "./rapDuetStudioV416";

export interface ExpressiveRapCueV425 {
  active:boolean;
  scene:"solo"|"reply"|"duet"|"hook"|"none";
  faceStrength:number;
  gestureStrength:number;
  cameraEnergy:number;
  lineIndex:number;leadSlot:number;startMs:number;endMs:number;
  articulationWeight:number;
  source:"authored-lyrics"|"auto-lyrics"|"inactive";
}
const clamp=(v:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const inactive:ExpressiveRapCueV425={active:false,scene:"none",faceStrength:0,gestureStrength:0,cameraEnergy:0,lineIndex:-1,leadSlot:0,startMs:0,endMs:0,articulationWeight:0,source:"inactive"};
/** Musical staging from authored V416 scenes, not voice identification or measured emotion. */
export function resolveExpressiveRapCueV425(options:{
  enabled:boolean;playing:boolean;reducedMotion:boolean;lyrics:Lyrics|null|undefined;
  progressMs:number;trackId:string;assignmentTrackId:string;
  assignments:RapDuetAssignmentV416[];avatarCount:number;strength:number;
  manualPriority?:boolean;assignmentSource?:"authored"|"auto";
}):ExpressiveRapCueV425{
  if(!options.enabled||!options.playing||options.reducedMotion||options.manualPriority||
    !options.trackId||options.trackId!==options.assignmentTrackId||
    !options.lyrics?.synced||!Number.isFinite(options.progressMs)||options.progressMs<0)
    return {...inactive};
  const cue=resolveRapDuetCueV416({lyrics:options.lyrics,progressMs:options.progressMs,
    playing:options.playing,enabled:true,assignments:options.assignments,
    count:Math.max(1,Math.min(4,Math.floor(options.avatarCount))),reducedMotion:options.reducedMotion});
  if(!cue.active||!cue.style)return {...inactive};
  const intensity=clamp(options.strength,0,100)/100*clamp(cue.emphasis,0,1);
  const styles={solo:[.43,.34,.12,.8],reply:[.62,.85,.38,.85],duet:[.7,.6,.55,.9],hook:[.9,.78,.8,1]} as const;
  const [face,gesture,camera,articulation]=styles[cue.style];
  return {active:true,scene:cue.style,faceStrength:clamp(face*intensity,0,1),
    gestureStrength:clamp(gesture*intensity,0,1),cameraEnergy:clamp(camera*intensity,0,1),
    lineIndex:cue.lineIndex,leadSlot:cue.leadSlot,startMs:cue.startMs,endMs:cue.endMs,
    articulationWeight:clamp(articulation*intensity,0,1),source:options.assignmentSource==="auto"?"auto-lyrics":"authored-lyrics"};
}
/** Additive expression limited to a small safe range, leaving the authored lip-sync intact. */
export function applyExpressiveRapV425(baseline:number,cue:ExpressiveRapCueV425,channel:"face"|"gesture"){
  const gain=cue.active?(channel==="face"?cue.faceStrength:cue.gestureStrength):0;
  return clamp(Math.round(clamp(baseline,0,100)+gain*(channel==="face"?14:10)),0,100);
}
