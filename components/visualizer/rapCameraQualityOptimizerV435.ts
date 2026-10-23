import type {RapCameraTimelineItemV431} from "./rapCameraTimelineV431";
import type {RapCameraPreviewInputV434,RapCameraPreviewSettingsV434} from "./rapCameraTransitionPreviewV434";
import {sampleRapCameraTransitionPreviewV434} from "./rapCameraTransitionPreviewV434";

/** Editorial, *heuristic* inspection of the existing V433/V434 preview.
 * Never writes preferences, controls playback, or touches a live camera. */
export type RapCameraQualityIssueV435={
  code:"incomplete"|"rushed"|"rapid-changes"|"tight-framing"|"wide-framing";
  severity:"warning"|"notice";message:string;advice:string;parameterFixable:boolean;
};
export type RapCameraQualityReportV435={
  available:boolean;changed:boolean;score:number|null;issues:RapCameraQualityIssueV435[];
  metrics:{distance:number;peakUnitsPerSecond:number;transitionMs:number;beatWaitMs:number;
    remainingHoldMs:number;changesInFourSeconds:number;minCameraDistance:number;fov:number};
};
export type RapCameraQualityInputV435=Omit<RapCameraPreviewInputV434,"progressMs"> & {
  history?:readonly RapCameraTimelineItemV431[];
};
const finite=(n:number)=>Number.isFinite(n)?n:0;
const distance=(a:{x:number;y:number;z:number},b:{x:number;y:number;z:number})=>
  Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z);
const shotChanged=(a:RapCameraTimelineItemV431,b:RapCameraTimelineItemV431)=>
  a.shot!==b.shot||a.leadSlot!==b.leadSlot;
const cameraDistance=(p:{x:number;y:number;z:number;targetX?:number;targetY:number;targetZ?:number})=>
  Math.hypot(p.x-(p.targetX??0),p.y-p.targetY,p.z-(p.targetZ??0));

/** Per-shot report; a high score is not proof that avatars are visible or unobstructed. */
export function inspectRapCameraTransitionV435(
  input:RapCameraQualityInputV435,settings:RapCameraPreviewSettingsV434,
):RapCameraQualityReportV435{
  const {current,previous}=input;
  const atStart=sampleRapCameraTransitionPreviewV434({...input,settings,progressMs:current.startMs});
  const changed=atStart.changed;
  const duration=changed?atStart.durationMs:0;
  const beatWait=changed?atStart.delayMs:0;
  const length=Math.max(0,finite(current.endMs-current.startMs));
  const hold=length-duration-beatWait;
  const distanceTotal=changed?distance(atStart.from,atStart.to):0;
  let peak=0;
  if(atStart.available&&changed){
    let last=atStart.pose;
    // Fixed-size sampling is cheap; 24 intervals resolve the V433 cubic easing peak.
    for(let i=1;i<=24;i++){
      const elapsed=(duration+beatWait)*i/24;
      const pose=sampleRapCameraTransitionPreviewV434({...input,settings,
        progressMs:current.startMs+elapsed}).pose;
      const span=(duration+beatWait)/24;
      if(span>0)peak=Math.max(peak,distance(last,pose)*1000/span);
      last=pose;
    }
  }
  const history=(input.history??[]).filter(item=>item.eligible&&item.shot!=="none"&&
    item.startMs<=current.startMs&&item.startMs>=current.startMs-4000).slice(-32);
  let rapidChanges=0;
  for(let i=1;i<history.length;i++)if(shotChanged(history[i-1],history[i]))rapidChanges++;
  const framing=Math.min(cameraDistance(atStart.from),cameraDistance(atStart.to));
  const fov=atStart.to.fov;
  const issues:RapCameraQualityIssueV435[]=[];
  const add=(code:RapCameraQualityIssueV435["code"],severity:RapCameraQualityIssueV435["severity"],
    message:string,advice:string,parameterFixable:boolean)=>issues.push({code,severity,message,advice,parameterFixable});
  if(changed&&hold<180) add("incomplete","warning",
    "Der Übergang lässt kaum Zeit für die fertige Kameraeinstellung.",
    "Weichheit reduzieren oder das BPM-Raster ausschalten; notfalls den Shot in V430 länger stehen lassen.",true);
  if(changed&&peak>0.45&&distanceTotal>0.065) add("rushed","warning",
    "Die Vorschau enthält eine relativ schnelle räumliche Kamerabewegung.",
    "Mehr Weichheit versuchen; die endgültige Bewegung im 3D-Bild prüfen.",true);
  if(rapidChanges>=3)add("rapid-changes","notice",
    "In den letzten vier Sekunden wechseln die geplanten Rap-Shots häufig.",
    "Im V430 Shot Studio einzelne Perspektiven beibehalten oder einen Ruhemodus setzen.",false);
  if(input.duo&&framing<3.3)add("tight-framing","notice",
    "Der errechnete Kameraabstand könnte für zwei Avatare knapp sein.",
    "Duett-Perspektive in V430 wählen und die tatsächliche 3D-Bühne prüfen.",false);
  if(fov<29||fov>56)add("wide-framing","notice",
    "Der Blickwinkel liegt nah an einem Extremwert des Kamera-Reglers.",
    "Bildausschnitt im 3D-Preview und mit eingeblendeten Lyrics prüfen.",false);
  const penalties:Record<RapCameraQualityIssueV435["code"],number>={
    incomplete:25,rushed:25,"rapid-changes":15,"tight-framing":12,"wide-framing":12};
  const score=atStart.available&&changed?Math.max(0,100-issues.reduce((sum,issue)=>sum+penalties[issue.code],0)):null;
  return {available:atStart.available,changed,score,issues,metrics:{
    distance:distanceTotal,peakUnitsPerSecond:peak,transitionMs:duration,beatWaitMs:beatWait,
    remainingHoldMs:hold,changesInFourSeconds:rapidChanges,
    minCameraDistance:framing,fov}};
}

/** Search only existing V433 controls, returning a *draft*, never saving or enabling live effects.
 * Tie-break toward the smallest change so that an unfixable composition warning doesn't
 * silently replace authored decisions with arbitrary defaults. */
export function proposeRapCameraQualitySettingsV435(
  input:RapCameraQualityInputV435,starting:RapCameraPreviewSettingsV434,
):{settings:RapCameraPreviewSettingsV434;before:RapCameraQualityReportV435;
  after:RapCameraQualityReportV435;improved:boolean}{
  const before=inspectRapCameraTransitionV435(input,starting);
  let best=before;
  let proposed={...starting};
  let bestCost=Infinity;
  if(before.available&&before.changed){
    for(let smoothness=0;smoothness<=100;smoothness+=5){
      for(const beatSync of [starting.beatSync,!starting.beatSync]){
        const settings={smoothness,beatSync};
        const report=inspectRapCameraTransitionV435(input,settings);
        const cost=Math.abs(smoothness-starting.smoothness)+(beatSync!==starting.beatSync?18:0);
        if(report.score!==null&&before.score!==null&&report.score>before.score&&
          (best.score===null||report.score>best.score||report.score===best.score&&cost<bestCost)){
          best=report;proposed=settings;bestCost=cost;
        }
      }
    }
  }
  return {settings:proposed,before,after:best,improved:best.score!==null&&
    before.score!==null&&best.score>before.score};
}
