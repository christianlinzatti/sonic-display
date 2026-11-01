/** V799: evidence-based upper-body continuity for already-approved automatic GLB crossfades.
 * V537 selects clip entry, V630 protects lower-body continuity, V135 owns planted IK.
 * This pure planner samples actual torso/arm keyframes only at a clip change. It
 * never selects an animation, writes a bone, alters the seek or creates a mixer.
 */
export type ContinuityTrackV799 = Readonly<{
  name: string;
  times: ArrayLike<number>;
  values: ArrayLike<number>;
  getValueSize?: () => number;
}>;
export type ContinuityClipV799 = Readonly<{
  duration: number;
  tracks: readonly ContinuityTrackV799[];
}>;
export type DanceContinuityPlanV799 = Readonly<{
  enabled: boolean;
  fadeSeconds: number;
  style: 'original' | 'body-pose' | 'gesture-momentum' | 'grounded-gesture';
  comparedChannels: number;
  poseDiscontinuity: number | null;
  motionDiscontinuity: number | null;
}>;
const finite = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, finite(v) ? v : min));
const ROLES: ReadonlyArray<readonly [RegExp, string, 'torso'|'left'|'right', number]> = [
  [/^(?:mixamorig)?(?:spine|spine1|spine2|chest|upperchest)$/,'torso','torso',1.15],
  [/^(?:mixamorig)?(?:leftarm|leftupperarm|lupperarm)$/,'leftArm','left',1.5],
  [/^(?:mixamorig)?(?:rightarm|rightupperarm|rupperarm)$/,'rightArm','right',1.5],
  [/^(?:mixamorig)?(?:leftforearm|leftlowerarm|lforearm)$/,'leftForearm','left',1.2],
  [/^(?:mixamorig)?(?:rightforearm|rightlowerarm|rforearm)$/,'rightForearm','right',1.2],
  [/^(?:mixamorig)?(?:lefthand|lhand)$/,'leftHand','left',.65],
  [/^(?:mixamorig)?(?:righthand|rhand)$/,'rightHand','right',.65],
];
function role(name: string) {
  const match = /^(.*)\.quaternion$/.exec(name);
  if (!match) return null;
  const raw = match[1].split('/').pop()!.split('|').pop()!.replace(/[^a-z0-9]/gi, '').toLowerCase();
  for (const [pattern, key, side, weight] of ROLES)
    if (pattern.test(raw)) return {key, side, weight};
  return null;
}
/** Evaluate normalized quaternions with a shortest-path linear interpolation.
 * Malformed tracks are ignored, never used to manufacture positive evidence. */
function sample(track: ContinuityTrackV799, seconds: number): number[] | null {
  const count = track.times.length;
  if (count < 2 || count > 200000 || track.values.length !== count * 4 ||
      (track.getValueSize && track.getValueSize() !== 4) || !finite(seconds)) return null;
  const times = track.times;
  if (!finite(times[0]) || !finite(times[count-1]) || times[count-1] <= times[0]) return null;
  const at = clamp(seconds, times[0], times[count-1]);
  let lo = 0, hi = count-1;
  while (lo+1 < hi) { const mid=(lo+hi)>>1; if(times[mid]<=at)lo=mid;else hi=mid; }
  const t0=times[lo], t1=times[hi];
  if (!finite(t0) || !finite(t1) || t1 <= t0) return null;
  const alpha=clamp((at-t0)/(t1-t0),0,1);
  let dot=0;
  for(let k=0;k<4;k++)dot+=track.values[lo*4+k]*track.values[hi*4+k];
  if(!finite(dot))return null;
  const sign=dot<0?-1:1;
  const q=Array.from({length:4},(_,k)=>track.values[lo*4+k]*(1-alpha)+track.values[hi*4+k]*sign*alpha);
  if(!q.every(finite))return null;
  const magnitude=Math.hypot(...q);
  if(!finite(magnitude)||magnitude<1e-6)return null;
  return q.map(v=>v/magnitude);
}
function poseError(a:readonly number[],b:readonly number[]):number {
  const dot=Math.abs(a.reduce((acc,v,i)=>acc+v*b[i],0));
  return 2*Math.acos(clamp(dot,0,1))/Math.PI; // 0..1 for shortest-path 0..180 degrees
}
/** Compare signed directional changes, allowing q and -q to represent the same pose. */
function velocityError(clipA:readonly number[],beforeA:readonly number[],
                       clipB:readonly number[],beforeB:readonly number[]) {
  const orient=(reference:readonly number[],value:readonly number[])=>
    reference.reduce((acc,v,i)=>acc+v*value[i],0)<0?-1:1;
  const signA=orient(clipA,beforeA), signB=orient(clipB,beforeB);
  const a=clipA.map((v,i)=>v-signA*beforeA[i]);
  const b=clipB.map((v,i)=>v-signB*beforeB[i]);
  // q and -q are equal. Align the incoming pose's hemisphere to outgoing.
  const flip=orient(clipA,clipB);
  return clamp(Math.hypot(...a.map((v,i)=>v-b[i]*flip))/.10,0,2);
}
function getChannels(clip:ContinuityClipV799) {
  const map=new Map<string,{track:ContinuityTrackV799;side:'torso'|'left'|'right';weight:number}>();
  // Upper body comprises a handful of tracks; cap scan cost on oversized GLBs.
  for(const track of clip.tracks.slice(0,4096)) {
    const meta=role(track.name);
    if(meta&&!map.has(meta.key))map.set(meta.key,{track,side:meta.side,weight:meta.weight});
  }
  return map;
}
export function planNaturalDanceContinuityV799(input: {
  outgoing?:ContinuityClipV799|null; incoming?:ContinuityClipV799|null;
  outgoingSeconds?:number|null; incomingSeconds?:number|null;
  baseSeconds:number; bpm?:number|null; plantedLeft:boolean; plantedRight:boolean;
  automatic:boolean; playing:boolean; reducedMotion:boolean; quality?:string|null;
}):DanceContinuityPlanV799 {
  const base=clamp(input.baseSeconds,.08,1.5);
  const original:DanceContinuityPlanV799={enabled:false,fadeSeconds:base,style:'original',
    comparedChannels:0,poseDiscontinuity:null,motionDiscontinuity:null};
  const oldClip=input.outgoing,newClip=input.incoming;
  if(!input.automatic||!input.playing||input.reducedMotion||input.quality==='low'||
    !oldClip||!newClip||!finite(input.outgoingSeconds)||!finite(input.incomingSeconds)||
    !finite(input.baseSeconds)||input.baseSeconds<=0||
    !finite(oldClip.duration)||!finite(newClip.duration)||
    Math.min(oldClip.duration,newClip.duration)<.36||!oldClip.tracks||!newClip.tracks)return original;
  const old=getChannels(oldClip),next=getChannels(newClip);
  let totalPose=0,totalMotion=0,totalWeight=0,count=0,hasTorso=false,hasLeft=false,hasRight=false;
  for(const [key,out] of old) {
    const incoming=next.get(key);
    if(!incoming)continue;
    const a=sample(out.track,input.outgoingSeconds),b=sample(incoming.track,input.incomingSeconds);
    if(!a||!b)continue;
    // Velocity evidence only when the samples bracket a real, meaningful interval.
    const previousA=sample(out.track,Math.max(0,input.outgoingSeconds-.06));
    const previousB=sample(incoming.track,Math.max(0,input.incomingSeconds-.06));
    const motion=previousA&&previousB&&input.outgoingSeconds>=.06&&input.incomingSeconds>=.06
      ? velocityError(a,previousA,b,previousB) : 0;
    const weight=out.weight;
    totalPose+=poseError(a,b)*weight;totalMotion+=motion*weight;totalWeight+=weight;count++;
    hasTorso ||= out.side==='torso';hasLeft ||= out.side==='left';hasRight ||= out.side==='right';
  }
  // Sparse rigs and single-arm clips are not enough to claim a continuity problem.
  if(count<3||!hasTorso||!hasLeft||!hasRight||!totalWeight)return original;
  const pose=clamp(totalPose/totalWeight,0,2);
  const momentum=clamp(totalMotion/totalWeight,0,2);
  const grounded=input.plantedLeft||input.plantedRight;
  const poseExcess=Math.max(0,pose-(grounded?.11:.17));
  const momentumExcess=Math.max(0,momentum-.24);
  const extension=Math.min(.32,poseExcess*.43+momentumExcess*.22)*(grounded?1.15:1);
  const metrics={comparedChannels:count,poseDiscontinuity:Number(pose.toFixed(4)),motionDiscontinuity:Number(momentum.toFixed(4))};
  if(extension<.012)return {...original,...metrics};
  const bpm=finite(input.bpm)&&input.bpm>0?clamp(input.bpm,55,240):null;
  const musicalCeiling=bpm===null?1.2:Math.min(1.2,120/bpm*(grounded?1.85:1.55));
  const clipCeiling=.42*Math.min(oldClip.duration,newClip.duration);
  const ceiling=Math.min(1.2,musicalCeiling,clipCeiling);
  if(ceiling<=base+.01)return {...original,...metrics};
  const fade=clamp(Math.min(ceiling,base*(1+extension)),base,1.2);
  if(fade<=base+.01)return {...original,...metrics};
  return {...metrics,enabled:true,fadeSeconds:fade,
    style:grounded?'grounded-gesture':momentumExcess*.22>poseExcess*.43?'gesture-momentum':'body-pose'};
}
