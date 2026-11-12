/** Read-only, bounded foot-plant quality hints from a 3D preview sample.
 * A world-space position near the lowest sampled foot is NOT verified contact.
 * Use this only for review; never auto-lock a foot or mutate source keyframes.
 */
import type {SampledPoseV534,MotionPointV534} from "./advancedMotionInspectorV534";

export type FootSideQuality = {
  observedPairs:number;
  nearFloorPairs:number;
  nearFloorSeconds:number;
  possibleSlidePairs:number;
  possibleSlideSeconds:number;
  maxHorizontalSpeedBodyHeightsPerSec:number;
};
export type FootPlantQualityReport = {
  status:"unavailable"|"insufficient"|"inspect"|"no-obvious-slip";
  sampleCount:number;
  assumption:"sampled-lowest-foot"|"none";
  left:FootSideQuality;
  right:FootSideQuality;
};
const empty=():FootSideQuality=>({
  observedPairs:0,nearFloorPairs:0,nearFloorSeconds:0,
  possibleSlidePairs:0,possibleSlideSeconds:0,maxHorizontalSpeedBodyHeightsPerSec:0,
});
const valid=(p:MotionPointV534|undefined):p is MotionPointV534=>
  !!p&&Number.isFinite(p.x)&&Number.isFinite(p.y)&&Number.isFinite(p.z);
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
/** Count only consecutive, near-floor, near-height-constant samples.
 * Stance is unknown without floor collision and force sensors.
 */
export function inspectFootPlantQuality(poses:readonly SampledPoseV534[],bodyHeight:number):FootPlantQualityReport{
  const left=empty(),right=empty();
  const validScale=Number.isFinite(bodyHeight)&&bodyHeight>.01&&bodyHeight<100;
  const sorted=poses.filter(p=>Number.isFinite(p.time)&&p.time>=0)
    .slice(0,121).sort((a,b)=>a.time-b.time);
  const report=(status:FootPlantQualityReport["status"],assumption:FootPlantQualityReport["assumption"]):FootPlantQualityReport=>
    ({status,sampleCount:sorted.length,assumption,left,right});
  if(!validScale||sorted.length<2)return report("unavailable","none");
  const scale=bodyHeight;
  const heights=sorted.flatMap(p=>[p.leftFoot,p.rightFoot]).filter(valid).map(p=>p.y);
  if(!heights.length)return report("unavailable","none");
  const floor=Math.min(...heights);
  for(const [side,key] of [[left,"leftFoot"],[right,"rightFoot"]] as const){
    for(let i=1;i<sorted.length;i++){
      const a=sorted[i-1],b=sorted[i],start=a[key],end=b[key];
      if(!valid(start)||!valid(end))continue;
      const dt=b.time-a.time;
      // Avoid manufactured motion from seeks, duplicate timestamps or sparse clips.
      if(!Number.isFinite(dt)||dt<1/240||dt>.25)continue;
      side.observedPairs++;
      const heightDelta=Math.abs(end.y-start.y)/dt/scale;
      const nearFloor=start.y-floor>=-.01*scale&&end.y-floor>=-.01*scale&&
        start.y-floor<=.055*scale&&end.y-floor<=.055*scale;
      if(!nearFloor||heightDelta>.18)continue;
      side.nearFloorPairs++;
      side.nearFloorSeconds+=dt;
      const speed=Math.hypot(end.x-start.x,end.z-start.z)/dt/scale;
      if(speed>.28){
        side.possibleSlidePairs++;side.possibleSlideSeconds+=dt;
        side.maxHorizontalSpeedBodyHeightsPerSec=Math.max(side.maxHorizontalSpeedBodyHeightsPerSec,speed);
      }
    }
    side.nearFloorSeconds=Number(side.nearFloorSeconds.toFixed(3));
    side.possibleSlideSeconds=Number(side.possibleSlideSeconds.toFixed(3));
    side.maxHorizontalSpeedBodyHeightsPerSec=Number(clamp(side.maxHorizontalSpeedBodyHeightsPerSec,0,1000).toFixed(2));
  }
  const observed=left.observedPairs+right.observedPairs;
  const near=left.nearFloorPairs+right.nearFloorPairs;
  const suspected=left.possibleSlidePairs+right.possibleSlidePairs;
  // No "all clear" without enough near-floor evidence. The inferred lowest
  // foot is not a real ground plane; sparse stance candidates remain unknown.
  // The confidence threshold is diagnostic only, never a foot-lock trigger.
  const enoughEvidence=observed>=8&&near>=4;
  return report(!enoughEvidence?"insufficient":suspected>0?"inspect":"no-obvious-slip",
    "sampled-lowest-foot");
}
