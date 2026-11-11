import type {MotionKeyframeClipV630} from '../components/visualizer/naturalDancePerformanceV630';
import {crewTransitionEvidence} from './crewTransitionEvidence';
import {musicFamilyV1129} from './musicPerformanceV1129';
type Clip={name:string;duration:number;tracks?:MotionKeyframeClipV630['tracks']};
/** Evaluate real leg poses at the authoritative music phase; never seek or write the rig. */
export function choosePoseAwareCrew(input:{clips:readonly Clip[];outgoing:string;candidate:string;outTime:number;time:(duration:number)=>number;genre?:string|null;left:boolean;right:boolean;bpm?:number|null}){
 const old=input.clips.find(c=>c.name===input.outgoing),family=musicFamilyV1129(input.genre);
 if(!old?.tracks)return input.candidate;
 let best=Infinity,selected=input.candidate;
 for(const clip of input.clips){
  if(!/^Dance_(RobotGroove|FluidArc|FrontmanDrive|JazzRebound|CrossStep|TurnPhrase)$/.test(clip.name)||!clip.tracks||clip.name===input.outgoing)continue;
  if((family==='ambient'||family==='classical')&&/RobotGroove|FrontmanDrive/.test(clip.name))continue;
  const evidence=crewTransitionEvidence({outgoing:{...old,tracks:old.tracks},incoming:{...clip,tracks:clip.tracks},outTime:input.outTime,inTime:input.time(clip.duration),left:input.left,right:input.right,bpm:input.bpm});
  if(!evidence)continue;
  const score=evidence.score+(clip.name===input.candidate?0:.006);
  if(score<best){best=score;selected=clip.name;}
 }
 return input.left&&input.right&&Number.isFinite(best)&&best>.45?input.outgoing:selected;
}
