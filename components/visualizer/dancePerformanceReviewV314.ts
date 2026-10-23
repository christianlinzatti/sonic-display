/** V314: bounded, session-only observability of the rendered show.
 * Beat-response and footwork values are explicitly heuristics, not motion-capture ground truth.
 * No network, per-frame React state, extra 3D pass, or persisted playback history. */
import type {ShowCue} from './ultimateShowDirectorV306';

export const REVIEW_EVENT_V314='sonic:performance-review-v314';
export type ReviewMotionSourceV314='gltf'|'procedural';
export type ReviewPoseV314={armSwing?:number;leftArmAccent?:number;rightArmAccent?:number;footStep?:number;legGroove?:number;spineSway?:number;weightShift?:number;};
export type ReviewSampleV314={atMs:number;section:string;shot:string;formation:string;energy:number;kick:number;
  fx:number;light:number;movement:number|null;beatResponse:number|null;footImpulse:number|null;
  hasGroundContact:boolean|null;phaseConfidence:number|null;source:ReviewMotionSourceV314|null};
export type ReviewInsightV314={atMs:number;type:'camera'|'fx'|'movement'|'footwork'|'rhythm';message:string;};
export type ReviewSummaryV314={sampleCount:number;durationMs:number;cameraChanges:number;cameraVariety:number;
  averageBeatResponse:number|null;averageMovement:number|null;averageFootImpulse:number|null;phaseConfidence:number|null;
  suggestions:ReviewInsightV314[];};
export type ReviewSnapshotV314={trackId:string;trackLabel:string;durationMs:number;recording:boolean;samples:ReviewSampleV314[];summary:ReviewSummaryV314};
export type ReviewSampleInputV314={trackId:string;trackLabel?:string;progressMs:number;durationMs?:number;playing:boolean;
  reducedMotion:boolean;showCue?:ShowCue;energy:number;kick:number;phaseLocked?:boolean;phaseConfidence?:number;};
export type ReviewPoseInputV314={trackId:string;slot:number;motion:ReviewPoseV314;footPlanted?:boolean;source:ReviewMotionSourceV314;kick:number;};

const MAX_SAMPLES=480;
const intervalMs=1250;
const clamp=(n:number,min=0,max=1)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const safe=(x:unknown,d=0)=>typeof x==='number'&&Number.isFinite(x)?x:d;
const average=(values:number[]):number|null=>values.length?values.reduce((sum,v)=>sum+v,0)/values.length:null;
type MotionAccumulator={source:ReviewMotionSourceV314;activitySum:number;activityCount:number;beatSum:number;beatCount:number;
  footSum:number;footCount:number;groundCount:number;};
type MutableReview={trackId:string;trackLabel:string;durationMs:number;samples:ReviewSampleV314[];lastMotion:Map<number,number>;motion:Map<number,MotionAccumulator>;};
let review:MutableReview={trackId:'',trackLabel:'',durationMs:0,samples:[],lastMotion:new Map(),motion:new Map()};
let recording=true;
const empty=():MutableReview=>({trackId:'',trackLabel:'',durationMs:0,samples:[],lastMotion:new Map(),motion:new Map()});
export function setRecordingV314(enabled:boolean){recording=enabled;}
export function isRecordingV314(){return recording;}
export function clearReviewV314(){review=empty();}
export function observeReviewMotionV314(input:ReviewPoseInputV314){
  if(!recording||!input.trackId||review.trackId!==input.trackId||!Number.isInteger(input.slot))return;
  const m=input.motion;
  const arm=(Math.abs(safe(m.armSwing))+Math.abs(safe(m.leftArmAccent))+Math.abs(safe(m.rightArmAccent)))/3;
  const foot=(Math.abs(safe(m.footStep))+Math.abs(safe(m.legGroove)))/2;
  const torso=(Math.abs(safe(m.spineSway))+Math.abs(safe(m.weightShift)))/2;
  const activity=clamp((arm*1.2+foot+torso)/2.2);
  const last=review.lastMotion.get(input.slot);
  review.lastMotion.set(input.slot,activity);
  const stats=review.motion.get(input.slot)??{source:input.source,activitySum:0,activityCount:0,beatSum:0,beatCount:0,footSum:0,footCount:0,groundCount:0};
  stats.source=input.source;stats.activitySum+=activity;stats.activityCount++;
  // Relative additive-motion response during kick peaks. NOT sub-frame beat alignment.
  if(last!==undefined && clamp(input.kick)>=.43){stats.beatSum+=clamp((activity+Math.abs(activity-last)*2)*2);stats.beatCount++;}
  if(input.footPlanted!==undefined){stats.groundCount++;if(input.footPlanted){stats.footSum+=clamp(foot*2);stats.footCount++;}}
  review.motion.set(input.slot,stats);
}

export function captureReviewV314(input:ReviewSampleInputV314):boolean {
  if(!recording||!input.playing||!input.trackId||!Number.isFinite(input.progressMs)||input.progressMs<0)return false;
  const atMs=Math.max(0,input.progressMs);
  if(review.trackId!==input.trackId){review=empty();review.trackId=input.trackId;}
  const previous=review.samples[review.samples.length-1];
  if(previous && (atMs<previous.atMs-1200 || atMs>previous.atMs+12_000)){
    // Seek: keep data from the current contiguous segment only; no fake camera cut.
    review.samples=[];review.motion.clear();review.lastMotion.clear();
  } else if(previous&&atMs-previous.atMs<intervalMs)return false;
  review.trackLabel=String(input.trackLabel??'').slice(0,140);
  review.durationMs=clamp(safe(input.durationMs),0,3_600_000);
  const active=[...review.motion.values()];
  const sum=<K extends keyof MotionAccumulator>(k:K)=>active.reduce((acc,s)=>acc+(typeof s[k]==='number'?s[k] as number:0),0);
  const activityCount=sum('activityCount'),beatCount=sum('beatCount'),footCount=sum('footCount'),groundCount=sum('groundCount');
  const cue=input.showCue;
  const sample:ReviewSampleV314={atMs,section:cue?.section??'unbekannt',shot:cue?.cameraEnabled?cue.cameraShot:'manuell/aus',
    formation:cue?.formationsEnabled?cue.formation:'manuell/aus',energy:clamp(input.energy),kick:clamp(input.kick),
    fx:clamp(cue?.fxEnabled?cue.fxGain:0),light:clamp(cue?.lightingEnabled?cue.lightGain/1.6:0),
    movement:activityCount?clamp(sum('activitySum')/activityCount):null,
    beatResponse:beatCount?clamp(sum('beatSum')/beatCount):null,
    footImpulse:footCount?clamp(sum('footSum')/footCount):null,
    hasGroundContact:groundCount?footCount>0:null,
    phaseConfidence:input.phaseLocked?clamp(safe(input.phaseConfidence)):null,source:active[0]?.source??null};
  review.samples.push(sample);
  if(review.samples.length>MAX_SAMPLES)review.samples.shift();
  review.motion.clear();
  return true;
}

export function summarizeReviewV314(samples:readonly ReviewSampleV314[]):ReviewSummaryV314 {
  const suggestions:ReviewInsightV314[]=[];
  let cameraChanges=0,lastCameraAt=-Infinity,streakAt=0;
  const shots=new Set<string>();
  for(let i=0;i<samples.length;i++){
    const sample=samples[i],previous=samples[i-1];
    if(sample.shot!=='manuell/aus')shots.add(sample.shot);
    if(!previous){streakAt=sample.atMs;continue;}
    if(sample.shot!==previous.shot){
      if(sample.shot!=='manuell/aus'&&previous.shot!=='manuell/aus'){
        cameraChanges++;
        if(sample.atMs-lastCameraAt<5000)suggestions.push({atMs:sample.atMs,type:'camera',message:'Mehrere automatische Kameraschnitte kurz hintereinander.'});
        lastCameraAt=sample.atMs;
      }
      streakAt=sample.atMs;
    }else if(sample.shot!=='manuell/aus'&&sample.atMs-streakAt>45_000 && previous.atMs-streakAt<=45_000){
      suggestions.push({atMs:sample.atMs,type:'camera',message:'Dieselbe automatische Kameraperspektive länger als 45 Sekunden.'});
    }
    if(Math.abs(sample.fx-previous.fx)>.55 && sample.atMs-previous.atMs<4000)
      suggestions.push({atMs:sample.atMs,type:'fx',message:'Deutlicher Sprung der automatischen Effektintensität.'});
    if(sample.section==='break'&&sample.fx>.70)
      suggestions.push({atMs:sample.atMs,type:'fx',message:'Viele Effekte während eines ruhigeren Musikabschnitts.'});
    if(sample.hasGroundContact===true&&sample.footImpulse!==null&&sample.footImpulse>.62)
      suggestions.push({atMs:sample.atMs,type:'footwork',message:'Hohe zusätzliche Fußbewegung trotz aktivem Fußkontakt.'});
  }
  // Bound diagnostic suggestions, no judgement without measured source values.
  const values=(key:'movement'|'beatResponse'|'footImpulse'|'phaseConfidence')=>samples.map(s=>s[key]).filter((n):n is number=>n!==null);
  return {sampleCount:samples.length,durationMs:samples.length?samples[samples.length-1].atMs-samples[0].atMs:0,
    cameraChanges,cameraVariety:shots.size,averageBeatResponse:average(values('beatResponse')),
    averageMovement:average(values('movement')),averageFootImpulse:average(values('footImpulse')),
    phaseConfidence:average(values('phaseConfidence')),suggestions:suggestions.slice(-12)};
}
export function snapshotReviewV314():ReviewSnapshotV314{
  const samples=review.samples.map(s=>({...s}));
  return {trackId:review.trackId,trackLabel:review.trackLabel,durationMs:review.durationMs,recording,samples,summary:summarizeReviewV314(samples)};
}
export function reviewCsvV314(snapshot:ReviewSnapshotV314):string{
  // CSV contains only validated numerical data and controlled enum labels, never user-supplied metadata.
  const columns=['ms','section','shot','formation','energy','kick','fx','light','movement','beatResponse','footImpulse','groundContact','phaseConfidence','source'];
  const encode=(value:string|number|boolean|null)=>'"'+String(value??'').replace(/"/g,'""')+'"';
  return [columns.map(encode).join(','),...snapshot.samples.map(s=>[s.atMs,s.section,s.shot,s.formation,s.energy,s.kick,s.fx,s.light,s.movement,s.beatResponse,s.footImpulse,s.hasGroundContact,s.phaseConfidence,s.source].map(encode).join(','))].join('\n');
}
