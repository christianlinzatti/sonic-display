import type {Lyrics} from "@/types/music";
import type {RapDuetAssignmentV416} from "./rapDuetStudioV416";
import {inferRapCameraScenesV436} from "./autoRapSceneAssignmentsV436";

export type RapPerformanceSceneV437="verse"|"reply"|"duet"|"hook";
export interface RapPerformanceLineV437{
  lineIndex:number;startMs:number;endMs:number;scene:RapPerformanceSceneV437;
  cadence:number;wordTimed:boolean;
}
export interface RapPerformancePlanV437{
  trackId:string;available:boolean;lines:RapPerformanceLineV437[];
  hookLines:number;authored:boolean;
}
export interface RapPerformanceCueV437{
  active:boolean;scene:RapPerformanceSceneV437|"none";lineIndex:number;
  energy:number;danceMultiplier:number;aggressionDelta:number;variationDelta:number;
  faceBoost:number;gestureBoost:number;gesturePulse:number;advancedRapLip:boolean;
}
const clamp=(value:number,lo:number,hi:number)=>Number.isFinite(value)?Math.max(lo,Math.min(hi,value)):lo;
const inactive:RapPerformanceCueV437={active:false,scene:"none",lineIndex:-1,energy:0,
  danceMultiplier:1,aggressionDelta:0,variationDelta:0,faceBoost:0,gestureBoost:0,
  gesturePulse:0,advancedRapLip:false};
const safeTrack=(id:string)=>id.length>0&&id.length<=250&&id!=="__proto__"&&id!=="constructor"&&id!=="prototype";

/** Pure, bounded song planning. Repeated written lyrics hint at hooks, NOT singer identity. */
export function planAutomaticRapPerformanceV437(input:{
  trackId:string;lyrics:Lyrics|null|undefined;authored?:RapDuetAssignmentV416[];
}):RapPerformancePlanV437{
  const result:RapPerformancePlanV437={trackId:input.trackId,available:false,lines:[],hookLines:0,authored:false};
  if(!safeTrack(input.trackId)||!input.lyrics?.synced||!Array.isArray(input.lyrics.lines))return result;
  const lines=input.lyrics.lines.slice(0,5000);
  const fallback=inferRapCameraScenesV436(input.lyrics,2).filter(x=>x.style==="hook");
  const manual=Array.isArray(input.authored)?input.authored.slice(0,256).filter(x=>
    Number.isInteger(x.fromLine)&&Number.isInteger(x.toLine)&&x.fromLine>=0&&x.toLine>=x.fromLine&&
    (x.style==="hook"||x.style==="solo"||x.style==="reply"||x.style==="duet")):[];
  const assignments=manual.length?manual:fallback;
  let lastStart=-1;
  for(let i=0;i<lines.length;i++){
    const line=lines[i];
    if(!line||!Number.isFinite(line.startMs)||line.startMs<0||line.startMs<lastStart)continue;
    lastStart=line.startMs;
    const text=typeof line.text==="string"?line.text.trim():"";
    if(!text)continue;
    const next=lines[i+1]?.startMs;
    const explicitEnd=typeof line.endMs==="number"&&Number.isFinite(line.endMs)&&line.endMs>line.startMs
      ?line.endMs:line.startMs+8000;
    const end=Math.min(explicitEnd,
      Number.isFinite(next)&&next>line.startMs?next:Infinity,line.startMs+10000);
    if(end<=line.startMs)continue;
    let scene:RapPerformanceSceneV437="verse";
    for(const assign of assignments){
      if(i>=assign.fromLine&&i<=assign.toLine){
        scene=assign.style==="solo"?"verse":assign.style;
      }
    }
    const words=Array.isArray(line.words)?line.words.filter(w=>w&&Number.isFinite(w.startMs)&&w.startMs>=line.startMs&&w.startMs<end&&typeof w.text==="string"&&w.text.trim()).length:0;
    const approx=words||text.split(/\s+/u).filter(Boolean).length;
    const cadence=clamp(approx/((end-line.startMs)/1000),0,8)/8;
    result.lines.push({lineIndex:i,startMs:line.startMs,endMs:end,scene,cadence,wordTimed:words>=2});
    if(scene==="hook")result.hookLines++;
  }
  result.authored=manual.length>0;
  result.available=result.lines.length>0;
  return result;
}

/** Binary search on real lyric timestamps, no full-song scan on playback frames. */
export function sampleAutomaticRapPerformanceV437(plan:RapPerformancePlanV437,input:{
  trackId:string;progressMs:number;playing:boolean;reducedMotion:boolean;
  enabled:boolean;strength?:number;audioEnergy?:number;beat?:number;
}):RapPerformanceCueV437{
  if(!input.enabled||!input.playing||input.reducedMotion||!plan.available||!safeTrack(input.trackId)||
    plan.trackId!==input.trackId||!Number.isFinite(input.progressMs)||input.progressMs<0)return {...inactive};
  let lo=0,hi=plan.lines.length-1,idx=-1;
  while(lo<=hi){const mid=(lo+hi)>>1;if(plan.lines[mid].startMs<=input.progressMs){idx=mid;lo=mid+1;}else hi=mid-1;}
  if(idx<0)return {...inactive};
  const line=plan.lines[idx];
  if(input.progressMs>=line.endMs)return {...inactive};
  const strength=clamp(input.strength??65,0,100)/100;
  if(strength===0)return {...inactive};
  const audio=clamp(input.audioEnergy??0,0,1);
  const beat=clamp(input.beat??0,0,1);
  const sceneIntensity=line.scene==="hook"?.82:line.scene==="duet"?.68:line.scene==="reply"?.55:.43;
  const elapsed=input.progressMs-line.startMs;
  const envelope=clamp(elapsed/240,.25,1)*clamp((line.endMs-input.progressMs)/220,.25,1);
  const drive=clamp((sceneIntensity*.68+line.cadence*.17+audio*.15)*strength*envelope,0,1);
  const pulse=clamp(beat*.4+Math.max(0,1-elapsed/240)*.18,0,.45)*drive;
  return {active:true,scene:line.scene,lineIndex:line.lineIndex,energy:drive,
    danceMultiplier:clamp(1+drive*(line.scene==="hook"?.25:.13)-(.08*(1-strength)),.85,1.27),
    aggressionDelta:clamp(drive*(line.scene==="hook"?.13:.055),0,.13),
    variationDelta:clamp(drive*(line.scene==="reply"?.12:.08),0,.12),
    faceBoost:Math.round(clamp(drive*10,0,10)),
    gestureBoost:Math.round(clamp((drive+pulse)*14,0,16)),
    gesturePulse:pulse,advancedRapLip:line.wordTimed||line.cadence>=.23};
}

/** Restrained additive performance. Authored choreography and manually cast vocals win. */
export function applyAutomaticRapPerformanceV437(input:{
  cue:RapPerformanceCueV437;danceAllowed:boolean;vocalAllowed:boolean;
  intensity:number;aggression:number;variation:number;style:"smooth"|"balanced"|"sharp";
  face:number;gesture:number;rapLip:boolean;lipEnabled:boolean;
}){
  const {cue}=input;
  const canDance=cue.active&&input.danceAllowed;
  const canVocal=cue.active&&input.vocalAllowed;
  return {
    intensity:canDance?clamp(input.intensity*cue.danceMultiplier,0,2):input.intensity,
    aggression:canDance?clamp(input.aggression+cue.aggressionDelta,0,1):input.aggression,
    variation:canDance?clamp(input.variation+cue.variationDelta,0,1):input.variation,
    style:canDance&&input.style==="balanced"&&cue.scene==="hook"?"sharp" as const:input.style,
    face:canVocal?clamp(input.face+cue.faceBoost,0,100):input.face,
    gesture:canVocal?clamp(input.gesture+cue.gestureBoost,0,100):input.gesture,
    rapLip:input.rapLip||(canVocal&&input.lipEnabled&&cue.advancedRapLip),
  };
}
