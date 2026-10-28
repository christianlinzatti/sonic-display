/** V630: real GLB lower-body keyframe evidence for automatic clip crossfade continuity.
 * Only extends a previously approved fade. V537 owns entry seek, V135/V494 own
 * planted IK anchors, V536/V530 own clip selection; authored actions win.
 * Runs on clip SWITCHES, never in a render loop. No mutable GLB state.
 */
export type MotionKeyframeTrackV630 = Readonly<{
  name:string;times:ArrayLike<number>;values:ArrayLike<number>;
  getValueSize?:()=>number;
}>;
export type MotionKeyframeClipV630 = Readonly<{
  duration:number;tracks:readonly MotionKeyframeTrackV630[];
}>;
export type NaturalDancePerformancePlanV630=Readonly<{
  enabled:boolean;fadeSeconds:number;
  style:'original'|'pose-continuity'|'foot-contact'|'rapid-sequence';
  poseMismatch:number|null;comparedJoints:number;plantedProtected:boolean;
}>;
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,finite(v)?v:min));
const legNames:ReadonlyArray<readonly [RegExp,string,number]>=[
  [/^(?:mixamorig)?(?:hips|pelvis)$|^roothips$/,'hips',1.45],
  [/^(?:mixamorig)?(?:leftupleg|leftthigh|lthigh)$/,'leftUpper',1],
  [/^(?:mixamorig)?(?:rightupleg|rightthigh|rthigh)$/,'rightUpper',1],
  [/^(?:mixamorig)?(?:leftleg|leftshin|leftlowerleg)$/,'leftLower',1.35],
  [/^(?:mixamorig)?(?:rightleg|rightshin|rightlowerleg)$/,'rightLower',1.35],
  [/^(?:mixamorig)?(?:leftfoot|leftankle|lfoot)$/,'leftFoot',1.8],
  [/^(?:mixamorig)?(?:rightfoot|rightankle|rfoot)$/,'rightFoot',1.8],
];
function role(name:string):{key:string;side:'left'|'right'|'center';weight:number;quat:boolean}|null{
  const match=/^(.*)\.(quaternion|position)$/.exec(name);
  if(!match)return null;
  const stem=match[1].split('/').pop()!.replace(/[^a-z0-9]/gi,'').toLowerCase();
  for(const [re,r,w] of legNames){if(re.test(stem))return {
    key:`${r}.${match[2]}`,side:r.startsWith('left')?'left':r.startsWith('right')?'right':'center',
    weight:w,quat:match[2]==='quaternion',
  };}
  return null;
}
/** Linear interpolation is sufficient for measuring a conservative discontinuity;
 * no new AnimationInterpolant is allocated and no clip is modified. */
function sample(track:MotionKeyframeTrackV630,seconds:number,quat:boolean):number[]|null{
  const n=track.times.length,size=quat?4:3;
  if(n<2||track.values.length!==n*size||track.getValueSize&&track.getValueSize()!==size)return null;
  const times=track.times;
  if(!finite(times[0])||!finite(times[n-1])||times[n-1]<times[0])return null;
  const t=clamp(seconds,times[0],times[n-1]);
  let lo=0,hi=n-1;
  while(lo+1<hi){const m=(lo+hi)>>1;if(times[m]<=t)lo=m;else hi=m;}
  const a=times[lo],b=times[hi];
  if(!finite(a)||!finite(b)||b<a)return null;
  const alpha=b>a?clamp((t-a)/(b-a),0,1):0;
  let sign=1;
  if(quat){let dot=0;for(let j=0;j<4;j++)dot+=track.values[lo*4+j]*track.values[hi*4+j];if(dot<0)sign=-1;}
  const v:number[]=[];
  for(let j=0;j<size;j++)v.push(track.values[lo*size+j]*(1-alpha)+track.values[hi*size+j]*sign*alpha);
  if(!v.every(finite))return null;
  if(quat){const norm=Math.hypot(...v);if(norm<1e-6)return null;return v.map(x=>x/norm);}
  return v;
}
function poseDistance(a:number[],b:number[],quat:boolean){
  if(quat){const dot=Math.abs(a.reduce((s,x,j)=>s+x*b[j],0));return 2*Math.acos(clamp(dot,0,1))/Math.PI;}
  return clamp(Math.hypot(...a.map((x,i)=>x-b[i]))/1.5,0,2);
}
function keyed(clip:MotionKeyframeClipV630){
  const found=new Map<string,{track:MotionKeyframeTrackV630;side:'left'|'right'|'center';weight:number;quat:boolean}>();
  // Only small amount of sampling at a clip change. Don't overwrite first binding.
  for(const track of clip.tracks){const r=role(track.name);if(r&&!found.has(r.key))found.set(r.key,{track,...r});}
  return found;
}
export function planNaturalDancePerformanceV630(input:{
  outgoing?:MotionKeyframeClipV630|null;incoming?:MotionKeyframeClipV630|null;
  outgoingSeconds?:number|null;incomingSeconds?:number|null;baseSeconds:number;
  bpm?:number|null;plantedLeft:boolean;plantedRight:boolean;rapidSwitch:boolean;
  automatic:boolean;playing:boolean;reducedMotion:boolean;quality?:string|null;
}):NaturalDancePerformancePlanV630{
  const base=clamp(input.baseSeconds,.08,1.5);
  const original:NaturalDancePerformancePlanV630={enabled:false,fadeSeconds:base,style:'original',poseMismatch:null,comparedJoints:0,plantedProtected:false};
  const outgoing=input.outgoing,incoming=input.incoming;
  if(!input.automatic||!input.playing||input.reducedMotion||input.quality==='low'||
    !outgoing||!incoming||!finite(input.outgoingSeconds)||!finite(input.incomingSeconds)||
    !finite(outgoing.duration)||!finite(incoming.duration)||
    !finite(input.baseSeconds)||input.baseSeconds<=0||
    Math.min(outgoing.duration,incoming.duration)<.36||!outgoing.tracks||!incoming.tracks)return original;
  const old=keyed(outgoing),next=keyed(incoming);
  const grounded=input.plantedLeft||input.plantedRight;
  let weighted=0,weight=0,comparedJoints=0,left=false,right=false;
  for(const [key,o] of old){const n=next.get(key);if(!n||o.quat!==n.quat)continue;
    const a=sample(o.track,input.outgoingSeconds,o.quat),b=sample(n.track,input.incomingSeconds,n.quat);
    if(!a||!b)continue;
    const stretch=(o.side==='left'&&input.plantedLeft||o.side==='right'&&input.plantedRight)?2.25:1;
    const w=o.weight*stretch;
    weighted+=poseDistance(a,b,o.quat)*w;weight+=w;comparedJoints++;
    if(o.side==='left')left=true;
    if(o.side==='right')right=true;
  }
  // A partial rig or one identical track cannot support a real motion judgement.
  if(comparedJoints<4||!left||!right||weight<=0)return original;
  const mismatch=clamp(weighted/weight,0,2);
  // No fabricated motion correction. Small pose differences remain untouched.
  const extra=Math.min(.35,Math.max(0,mismatch-.17)*.32)+
    (grounded&&mismatch>.14?.10:0)+(input.rapidSwitch&&mismatch>.16?.06:0);
  if(extra<.008)return {...original,poseMismatch:Number(mismatch.toFixed(4)),comparedJoints};
  const musicalCeiling=finite(input.bpm)&&input.bpm>0 ?
    Math.min(1.2,120/clamp(input.bpm,55,240)*(grounded?1.85:1.55)):1.2;
  const clipCeiling=.42*Math.min(outgoing.duration,incoming.duration);
  const allowed=Math.min(1.2,musicalCeiling,clipCeiling);
  // V614 could already be at the musical limit. Never shorten its decision.
  if(allowed<=base+.008)return {...original,poseMismatch:Number(mismatch.toFixed(4)),comparedJoints};
  const fade=clamp(Math.min(allowed,base*(1+extra)),base,1.2);
  if(fade<=base+.008)return {...original,poseMismatch:Number(mismatch.toFixed(4)),comparedJoints};
  return {enabled:true,fadeSeconds:fade,
    style:grounded?'foot-contact':input.rapidSwitch?'rapid-sequence':'pose-continuity',
    poseMismatch:Number(mismatch.toFixed(4)),comparedJoints,plantedProtected:grounded};
}
