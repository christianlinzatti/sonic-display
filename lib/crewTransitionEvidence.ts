import {planNaturalDancePerformanceV630,type MotionKeyframeClipV630,type MotionKeyframeTrackV630} from '../components/visualizer/naturalDancePerformanceV630';
type Clip=MotionKeyframeClipV630;
function sample(track:MotionKeyframeTrackV630|undefined,time:number,size:number):number[]|null{
 if(!track||track.times.length<2||track.values.length!==track.times.length*size||!Number.isFinite(time))return null;
 let lo=0,hi=track.times.length-1;
 while(lo+1<hi){const middle=(lo+hi)>>1;if(track.times[middle]<=time)lo=middle;else hi=middle;}
 const dt=track.times[hi]-track.times[lo];if(!(dt>0))return null;
 const t=Math.max(0,Math.min(1,(time-track.times[lo])/dt));
 let sign=1;if(size===4){let dot=0;for(let i=0;i<4;i++)dot+=track.values[lo*4+i]*track.values[hi*4+i];if(dot<0)sign=-1;}
 const value=Array.from({length:size},(_,i)=>track.values[lo*size+i]*(1-t)+track.values[hi*size+i]*t*sign);
 if(!value.every(Number.isFinite))return null;
 if(size===4){const norm=Math.hypot(...value);return norm>1e-6?value.map(x=>x/norm):null;}return value;
}
const wrap=(time:number,duration:number)=>((time%duration)+duration)%duration;
function momentum(clip:Clip,time:number,horizon:number){
 const position=clip.tracks.find(t=>/^(?:mixamorig)?Hips\.position$/i.test(t.name));
 const rotation=clip.tracks.find(t=>/^(?:mixamorig)?Hips\.quaternion$/i.test(t.name));
 const a=sample(position,time,3),b=sample(position,wrap(time+horizon,clip.duration),3);
 const qa=sample(rotation,time,4),qb=sample(rotation,wrap(time+horizon,clip.duration),4);
 const yaw=(q:number[])=>Math.atan2(2*(q[3]*q[1]+q[0]*q[2]),1-2*(q[1]**2+q[0]**2));
 const turn=qa&&qb?Math.atan2(Math.sin(yaw(qb)-yaw(qa)),Math.cos(yaw(qb)-yaw(qa)))/horizon:null;
 return {velocity:a&&b?[(b[0]-a[0])/horizon,(b[2]-a[2])/horizon]:null,turn};
}
/** Compare now AND the imminent leg pose, translation and turn. No rig/clock writes. */
export function crewTransitionEvidence(input:{outgoing:Clip;incoming:Clip;outTime:number;inTime:number;left:boolean;right:boolean;bpm?:number|null}){
 if(![input.outTime,input.inTime,input.outgoing.duration,input.incoming.duration].every(Number.isFinite)||Math.min(input.outgoing.duration,input.incoming.duration)<.36)return null;
 const tempo=typeof input.bpm==='number'&&Number.isFinite(input.bpm)?Math.max(55,Math.min(210,input.bpm)):120;
 const horizon=.18*tempo/120;
 const measure=(offset:number)=>planNaturalDancePerformanceV630({outgoing:input.outgoing,incoming:input.incoming,outgoingSeconds:wrap(input.outTime+offset,input.outgoing.duration),incomingSeconds:wrap(input.inTime+offset,input.incoming.duration),baseSeconds:.55,plantedLeft:input.left,plantedRight:input.right,rapidSwitch:false,automatic:true,playing:true,reducedMotion:false}).poseMismatch;
 const now=measure(0),future=measure(horizon);if(now===null||future===null)return null;
 const a=momentum(input.outgoing,input.outTime,horizon),b=momentum(input.incoming,input.inTime,horizon);
 const velocity=a.velocity&&b.velocity?Math.min(.3,Math.hypot(a.velocity[0]-b.velocity[0],a.velocity[1]-b.velocity[1])*.12):0;
 const turn=a.turn!==null&&b.turn!==null?Math.min(.2,Math.abs(a.turn-b.turn)*.035):0;
 return {score:now*.6+future*.4+velocity+turn,now,future,velocity,turn};
}
