/** V537 – bounded, deterministic, joint-aware entry planner for automatic GLB transitions.
 * Reads original keyframe curves. Never edits clips, IK anchors, or mixer actions.
 * Runtime foot contact is an input, NOT inferred from the clip names.
 */
export type MotionTrackV537 = {
  name: string; times: ArrayLike<number>; values: ArrayLike<number>;
  getValueSize?: () => number;
  createInterpolant?: () => {evaluate: (time:number) => ArrayLike<number>};
};
export type MotionClipV537 = {duration:number; tracks: readonly MotionTrackV537[]};
export type NaturalTransitionPlanV537 = {
  mode: 'matched'|'fallback'; entrySeconds:number; fadeSeconds:number;
  score:number|null; comparedJoints:number; candidates:number;
  contactAware:boolean;
};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
// Do not match arm/face/finger tracks at the expense of grounded leg poses.
const aliases:ReadonlyArray<[RegExp,string,number]> = [
  [/^(?:mixamorig)?hips$|^pelvis$|^roothips$/,'hips',1.65],
  [/^(?:mixamorig)?(?:leftupleg|leftthigh|lthigh)$/,'leftUpper',1.2],
  [/^(?:mixamorig)?(?:rightupleg|rightthigh|rthigh)$/,'rightUpper',1.2],
  [/^(?:mixamorig)?(?:leftleg|leftshin|leftlowerleg)$/,'leftLower',1.45],
  [/^(?:mixamorig)?(?:rightleg|rightshin|rightlowerleg)$/,'rightLower',1.45],
  [/^(?:mixamorig)?(?:leftfoot|leftankle|lfoot)$/,'leftFoot',2.05],
  [/^(?:mixamorig)?(?:rightfoot|rightankle|rfoot)$/,'rightFoot',2.05],
  [/^(?:mixamorig)?(?:spine|spine1|spine2|chest)$/,'spine',.4],
];
function roleOf(trackName:string):{key:string;weight:number;type:'quaternion'|'position'}|null{
  const m=/^(.*)\.(quaternion|position)$/.exec(trackName);
  if(!m)return null;
  const node=m[1].replace(/[^a-z0-9]/gi,'').toLowerCase();
  for (const [pattern,name,weight] of aliases)if(pattern.test(node))return {key:`${name}.${m[2]}`,weight,type:m[2] as 'quaternion'|'position'};
  return null;
}
function sampler(track:MotionTrackV537){
  const size=track.getValueSize?.()??Math.floor(track.values.length/Math.max(1,track.times.length));
  if((size!==4&&size!==3)||track.times.length<2||track.values.length!==track.times.length*size)return null;
  // Reuse Three's real quaternion/linear interpolant when present; avoid repeated allocation.
  let interpolant:ReturnType<NonNullable<MotionTrackV537['createInterpolant']>>|null=null;
  try{interpolant=track.createInterpolant?.()??null;}catch{interpolant=null;}
  return (time:number):number[]|null=>{
    if(interpolant){
      try{const v=Array.from(interpolant.evaluate(time));return v.length===size&&v.every(Number.isFinite)?v:null;}catch{return null;}
    }
    const ts=track.times,n=ts.length,t=clamp(time,ts[0],ts[n-1]);
    let lo=0,hi=n-1;
    while(lo+1<hi){const mid=(lo+hi)>>1;if(ts[mid]<=t)lo=mid;else hi=mid;}
    const a=ts[lo],b=ts[hi],alpha=b>a?clamp((t-a)/(b-a),0,1):0;
    const values:number[]=[];
    // Quaternion sign-corrected normalized interpolation; safe fallback for synthetic tracks.
    let sign=1;
    if(size===4){let dot=0;for(let j=0;j<4;j++)dot+=track.values[lo*size+j]*track.values[hi*size+j];if(dot<0)sign=-1;}
    for(let j=0;j<size;j++)values.push(track.values[lo*size+j]*(1-alpha)+track.values[hi*size+j]*sign*alpha);
    if(size===4){const norm=Math.hypot(...values);if(norm<1e-6)return null;for(let j=0;j<4;j++)values[j]/=norm;}
    return values.every(Number.isFinite)?values:null;
  };
}
function angularDistance(a:number[],b:number[]):number{
  const na=Math.hypot(...a),nb=Math.hypot(...b);
  if(na<1e-6||nb<1e-6)return 5;
  const dot=Math.abs(a.reduce((sum,v,i)=>sum+v*b[i],0)/(na*nb));
  return 2*Math.acos(clamp(dot,0,1));
}
function distance(a:number[],b:number[],type:'position'|'quaternion'){
  return type==='quaternion'?angularDistance(a,b):Math.hypot(...a.map((v,i)=>v-b[i]))*1.5;
}
export function planNaturalMotionTransitionV537(input:{
  outgoing:MotionClipV537|null|undefined;incoming:MotionClipV537;
  outgoingSeconds:number;baselineSeconds:number;
  fallbackSeconds?:number;plantedLeft:boolean;plantedRight:boolean;
  automatic:boolean;reducedMotion?:boolean;
  candidates?:number;
}):NaturalTransitionPlanV537{
  const fade=clamp(input.baselineSeconds,.08,1.5);
  const fallback=():NaturalTransitionPlanV537=>({mode:'fallback',entrySeconds:clamp(input.fallbackSeconds??0,0,Math.max(0,input.incoming.duration-.001)),fadeSeconds:fade,score:null,comparedJoints:0,candidates:0,contactAware:false});
  const from=input.outgoing,to=input.incoming;
  if(!input.automatic||input.reducedMotion||!from||!Number.isFinite(from.duration)||from.duration<=0||
    !Number.isFinite(to.duration)||to.duration<=0||!Number.isFinite(input.outgoingSeconds))return fallback();
  const old=new Map<string,{sample:ReturnType<typeof sampler>;weight:number;type:'quaternion'|'position'}>();
  for(const track of from.tracks){const role=roleOf(track.name),fn=sampler(track);if(role&&fn)old.set(role.key,{sample:fn,weight:role.weight,type:role.type});}
  const joints:{a:NonNullable<ReturnType<typeof sampler>>;b:NonNullable<ReturnType<typeof sampler>>;
    weight:number;type:'quaternion'|'position';name:string}[]=[];
  for(const track of to.tracks){const role=roleOf(track.name),a=role&&old.get(role.key),b=sampler(track);
    if(role&&a?.sample&&b&&a.type===role.type)joints.push({a:a.sample,b,weight:a.weight*(role.key.startsWith('left')&&input.plantedLeft?2.4:role.key.startsWith('right')&&input.plantedRight?2.4:1),type:role.type,name:role.key});
  }
  // Do not seek by 1 matching bone; unsupported skeletons preserve V492 behavior.
  const matchedLegs=joints.filter(j=>/^(left|right)/.test(j.name)).length;
  if(joints.length<4||matchedLegs<2)return fallback();
  const now=clamp(input.outgoingSeconds,0,from.duration);
  const count=Math.round(clamp(input.candidates??20,4,20));
  const dt=.065;
  let bestTime=0,bestScore=Infinity,validCandidates=0;
  for(let i=0;i<count;i++){
    const time=to.duration*(i/count);let sum=0,weights=0;
    for(const joint of joints){
      const a=joint.a(now),b=joint.b(time);
      if(!a||!b)continue;
      const pose=distance(a,b,joint.type);
      const aa=joint.a(Math.min(from.duration,now+dt)),bb=joint.b(Math.min(to.duration,time+dt));
      const velocity=aa&&bb?Math.abs(distance(a,aa,joint.type)-distance(b,bb,joint.type)):0;
      sum+=joint.weight*(pose*pose+.23*velocity*velocity);weights+=joint.weight;
    }
    if(weights<3)continue;
    validCandidates++;
    const score=sum/weights;
    if(score<bestScore){bestScore=score;bestTime=time;}
  }
  // High mismatch is safer with the old beat/phase logic; let existing IK remain anchored.
  if(!validCandidates||!Number.isFinite(bestScore)||bestScore>1.2)return fallback();
  const grounded=input.plantedLeft||input.plantedRight;
  const stretch=grounded?1.16:1;
  const contrast=bestScore>.7?1.25:bestScore>.35?1.12:1;
  return {mode:'matched',entrySeconds:clamp(bestTime,0,Math.max(0,to.duration-.001)),
    fadeSeconds:clamp(fade*stretch*contrast,.08,1.5),score:Number(bestScore.toFixed(4)),
    comparedJoints:joints.length,candidates:validCandidates,contactAware:grounded};
}
