import {planNaturalDancePerformanceV630,type MotionKeyframeClipV630} from '../components/visualizer/naturalDancePerformanceV630';
import {musicFamilyV1129} from './musicPerformanceV1129';
type Clip={name:string;duration:number;tracks?:MotionKeyframeClipV630['tracks']};
function direction(clip:Clip,time:number){
 const track=clip.tracks?.find(t=>/^(?:Hips|mixamorigHips)\.position$/i.test(t.name));
 if(!track||track.values.length!==track.times.length*3)return null;
 let index=0;while(index<track.times.length-2&&track.times[index+1]<time)index++;
 const dt=track.times[index+1]-track.times[index];if(!(dt>0))return null;
 const v=[0,2].map(axis=>(track.values[(index+1)*3+axis]-track.values[index*3+axis])/dt);
 return v.every(Number.isFinite)?v:null;
}
/** Evaluate real leg poses at the authoritative music phase; never seek or write the rig. */
export function choosePoseAwareCrew(input:{clips:readonly Clip[];outgoing:string;candidate:string;outTime:number;time:(duration:number)=>number;genre?:string|null;left:boolean;right:boolean}){
 const old=input.clips.find(c=>c.name===input.outgoing),family=musicFamilyV1129(input.genre);
 if(!old?.tracks)return input.candidate;
 let best=Infinity,selected=input.candidate;
 const velocity=direction(old,input.outTime);
 for(const clip of input.clips){
  if(!/^Dance_(RobotGroove|FluidArc|FrontmanDrive|JazzRebound|CrossStep|TurnPhrase)$/.test(clip.name)||!clip.tracks||clip.name===input.outgoing)continue;
  if((family==='ambient'||family==='classical')&&/RobotGroove|FrontmanDrive/.test(clip.name))continue;
  const time=input.time(clip.duration),plan=planNaturalDancePerformanceV630({outgoing:{...old,tracks:old.tracks},incoming:{...clip,tracks:clip.tracks},outgoingSeconds:input.outTime,incomingSeconds:time,baseSeconds:.55,plantedLeft:input.left,plantedRight:input.right,rapidSwitch:false,automatic:true,playing:true,reducedMotion:false});
  if(plan.poseMismatch===null)continue;
  const next=direction(clip,time),momentum=velocity&&next?Math.min(.3,Math.hypot(next[0]-velocity[0],next[1]-velocity[1])*.12):0;
  const score=plan.poseMismatch+momentum+(clip.name===input.candidate?0:.008);
  if(score<best){best=score;selected=clip.name;}
 }
 return selected;
}
