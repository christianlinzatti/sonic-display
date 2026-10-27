/** V534 — advisory, read-only motion quality checks on sampled world-space poses.
 * These measurements are not equivalent to image-based validation, skinning QA,
 * inverse kinematics, or ground-contact detection. The avatar is never modified.
 */
export type MotionPointV534 = { x:number; y:number; z:number };
export type SampledPoseV534 = {
  time:number;
  hips?:MotionPointV534;
  leftFoot?:MotionPointV534;
  rightFoot?:MotionPointV534;
};
export type MotionFindingV534 = {
  kind:"potential-foot-slide"|"sudden-root-motion"|"sampling-gap";
  severity:"warning"|"info";
  atSeconds:number;
  label:string;
  explanation:string;
  side?:"left"|"right";
  value:number;
};
export type MotionSampleReportV534 = {
  samples:number;
  bodyHeight:number;
  footSamples:number;
  findings:MotionFindingV534[];
  potentialSlideIntervals:number;
  rootJumps:number;
  contactAssumption:"estimated-ground-near-lowest-foot"|"unavailable";
};
export type PoseTransitionV534 = {
  comparable:boolean;
  normalizedPoseDistance:number|null;
  assessedPoints:number;
  recommendedCrossfadeSeconds:number;
  status:"smooth-candidate"|"inspect"|"high-contrast"|"unavailable";
  note:string;
};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(n,hi));
const finite=(p:MotionPointV534|undefined):p is MotionPointV534=>!!p&&[p.x,p.y,p.z].every(Number.isFinite);
const distance=(a:MotionPointV534,b:MotionPointV534)=>Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const horizontal=(a:MotionPointV534,b:MotionPointV534)=>Math.hypot(a.x-b.x,a.z-b.z);
const relative=(point:MotionPointV534,root:MotionPointV534):MotionPointV534=>({x:point.x-root.x,y:point.y-root.y,z:point.z-root.z});
/** A foot near its sampled minimum Y is *possibly* grounded, not a known contact. */
export function inspectSampledMotionV534(poses:readonly SampledPoseV534[],bodyHeight:number):MotionSampleReportV534{
  const scale=Number.isFinite(bodyHeight)&&bodyHeight>0.01?bodyHeight:1;
  const sorted=poses.filter(p=>Number.isFinite(p.time)&&p.time>=0).slice(0,121).sort((a,b)=>a.time-b.time);
  const footHeights=[...sorted.flatMap(p=>[p.leftFoot,p.rightFoot])].filter(finite).map(p=>p.y);
  const floor=footHeights.length?Math.min(...footHeights):NaN;
  const hasFeet=Number.isFinite(floor);
  const found:MotionFindingV534[]=[];
  let footSamples=0,slideCount=0,rootJumps=0;
  for(let i=1;i<sorted.length;i++){
    const before=sorted[i-1],after=sorted[i],dt=after.time-before.time;
    if(!(dt>0&&dt<=0.5)){
      if(found.length<32)found.push({kind:"sampling-gap",severity:"info",atSeconds:after.time,label:"Abstand in Animationsabtastung",explanation:"Nur aufeinanderfolgende, zeitlich sinnvolle Posen lassen sich zuverlässig vergleichen.",value:dt});
      continue;
    }
    if(finite(before.hips)&&finite(after.hips)){
      const speed=distance(before.hips,after.hips)/dt/scale;
      if(speed>2.5){rootJumps++;if(found.length<32)found.push({kind:"sudden-root-motion",severity:"warning",atSeconds:after.time,label:"Schneller Hüft-/Root-Versatz",explanation:"Sehr großer Positionswechsel relativ zur Körperhöhe. Kann beabsichtigt sein (Sprung/Schritt). In der Vorschau überprüfen.",value:speed});}
    }
    if(!hasFeet)continue;
    for(const [side,key] of [["left","leftFoot"],["right","rightFoot"]] as const){
      const a=before[key],b=after[key];
      if(!finite(a)||!finite(b))continue;
      footSamples++;
      const heightThreshold=0.055*scale;
      const nearFloor=a.y-floor<=heightThreshold&&b.y-floor<=heightThreshold;
      const slowVertical=Math.abs(a.y-b.y)/dt/scale<0.18;
      const horizontalSpeed=horizontal(a,b)/dt/scale;
      if(nearFloor&&slowVertical&&horizontalSpeed>0.28){
        slideCount++;
        if(found.length<32)found.push({kind:"potential-foot-slide",severity:"info",atSeconds:after.time,label:`Möglicher ${side==="left"?"linker":"rechter"} Fußrutscher`,explanation:"Fuß bewegt sich seitlich nahe seiner tiefsten gemessenen Höhe. Der Boden und echter Fußkontakt sind nicht bekannt; visuell prüfen.",side,value:horizontalSpeed});
      }
    }
  }
  return {samples:sorted.length,bodyHeight:scale,footSamples,findings:found,potentialSlideIntervals:slideCount,rootJumps,
    contactAssumption:hasFeet?"estimated-ground-near-lowest-foot":"unavailable"};
}
/** End/start poses on the SAME rig; compare offsets from hips so authored root travel is not mistaken for a mismatch. */
export function compareMotionTransitionV534(end:SampledPoseV534,start:SampledPoseV534,height:number):PoseTransitionV534{
  const scale=Number.isFinite(height)&&height>.01?height:1;
  if(!finite(end.hips)||!finite(start.hips))return {comparable:false,normalizedPoseDistance:null,assessedPoints:0,recommendedCrossfadeSeconds:.55,status:"unavailable",note:"Keine vergleichbaren Hüftposen; Übergang im 3D-Viewer ansehen."};
  let sum=0,count=0;
  for(const key of ["leftFoot","rightFoot"] as const){
    const a=end[key],b=start[key];
    if(!finite(a)||!finite(b))continue;
    sum+=distance(relative(a,end.hips),relative(b,start.hips))/scale;count++;
  }
  if(!count)return {comparable:false,normalizedPoseDistance:null,assessedPoints:0,recommendedCrossfadeSeconds:.55,status:"unavailable",note:"Keine vergleichbaren Fußpositionen gefunden. Der Übergang muss optisch geprüft werden."};
  const delta=sum/count;
  const status=delta>.5?"high-contrast":delta>.22?"inspect":"smooth-candidate";
  const crossfade=clamp(.32+delta*.85,.32,1.2);
  return {comparable:true,normalizedPoseDistance:Math.round(delta*1000)/1000,assessedPoints:count,recommendedCrossfadeSeconds:Math.round(crossfade*100)/100,status,
    note:status==="smooth-candidate"?"Fußpositionen wirken geometrisch ähnlich. Trotzdem im Preview prüfen.":status==="inspect"?"Unterschiedliche Bein-/Fußposen: Übergang in der 3D-Vorschau prüfen.":"Deutlich andere Fußposen. Längere Überblendung oder anderen Folgeclip ausprobieren."};
}
export function motionReviewLabelV534(report:MotionSampleReportV534,transition?:PoseTransitionV534):string{
  if(report.samples<2)return "Unvollständige Pose-Analyse – manuelle Sichtprüfung nötig";
  if(report.rootJumps>0||transition?.status==="high-contrast")return "Auffälligkeiten – besonders sorgfältig prüfen";
  if(report.potentialSlideIntervals>0||transition?.status==="inspect")return "Hinweise vorhanden – Fußkontakt und Übergang prüfen";
  return "Keine auffälligen Pose-Sprünge gefunden – Sichtprüfung erforderlich";
}
