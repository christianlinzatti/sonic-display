import type {CameraPoseV432 as CameraPose} from "./cameraPoseTypeV432";
import {composeRapCameraV429,type RapCameraPlanV429} from "./cinematicRapCameraV429";
import type {RapCameraTimelineItemV431} from "./rapCameraTimelineV431";
import {advanceRapCameraTransitionV433,newRapCameraTransitionStateV433,
  rapCameraBeatDelayV433,rapCameraTransitionDurationV433} from "./smartRapCameraTransitionsV433";

/** Editorial-only A/B preview; the live stage and V433 playback state are never accessed. */
export type RapCameraPreviewSettingsV434={smoothness:number;beatSync:boolean};
export type RapCameraPreviewInputV434={
  trackId:string; previous?:RapCameraTimelineItemV431|null;current:RapCameraTimelineItemV431;
  progressMs:number;settings:RapCameraPreviewSettingsV434;
  bpm?:number|null;kick?:number;strength?:number;duo?:boolean;lyricsProtected?:boolean;
};
export type RapCameraPreviewResultV434={
  pose:CameraPose;from:CameraPose;to:CameraPose;startMs:number;durationMs:number;
  delayMs:number;changed:boolean;progress:number;available:boolean;
};
const clamp=(x:number,a:number,b:number)=>Number.isFinite(x)?Math.max(a,Math.min(b,x)):a;
const timelinePlan=(item:RapCameraTimelineItemV431,strength:number):RapCameraPlanV429=>({
  active:item.eligible&&item.shot!=="none"&&item.strength>0,
  shot:item.shot,lineIndex:item.lineIndex,leadSlot:item.leadSlot,
  startMs:item.startMs,endMs:item.endMs,
  gain:clamp(strength,0,100)/100*clamp(item.strength,0,100)/100,
  holdMs:item.shot==="hook-push"?1400:1100,
});
/** Deterministic sampling on the V433 easing curve at the same absolute lyric time. */
export function sampleRapCameraTransitionPreviewV434(input:RapCameraPreviewInputV434):RapCameraPreviewResultV434{
  const {current,previous,trackId}=input;
  // Neutral verse camera, independent of live stage direction.
  const base:CameraPose={x:0,y:.1,z:input.duo?5.9:4.2,targetX:0,targetY:.1,targetZ:0,fov:38};
  const plan=timelinePlan(current,input.strength??65);
  const from=previous?.eligible&&previous.shot!=="none"
    ?composeRapCameraV429(base,timelinePlan(previous,input.strength??65),
        {duo:input.duo,lyricsProtected:input.lyricsProtected}):base;
  const to=composeRapCameraV429(base,plan,{duo:input.duo,lyricsProtected:input.lyricsProtected});
  const available=!!trackId&&plan.active&&current.endMs>current.startMs&&
    Number.isFinite(current.startMs)&&Number.isFinite(current.endMs);
  const changed=available&&(!previous||previous.shot!==current.shot||previous.leadSlot!==current.leadSlot);
  const now=clamp(input.progressMs,current.startMs,Math.max(current.startMs,current.endMs-1));
  const smoothness=clamp(input.settings.smoothness,0,100);
  const durationMs=changed?rapCameraTransitionDurationV433(plan,smoothness):0;
  const delayMs=changed?rapCameraBeatDelayV433(current.startMs,input.bpm,input.kick,input.settings.beatSync):0;
  const startMs=current.startMs+delayMs;
  if(!changed)return {pose:to,from,to,startMs,durationMs,delayMs,changed,available,
    progress:available?1:0};
  const state=newRapCameraTransitionStateV433();
  const options={enabled:true,playing:true,reducedMotion:false,trackId,
    progressMs:current.startMs,bpm:input.bpm,kick:input.kick,
    beatSync:input.settings.beatSync,smoothness};
  advanceRapCameraTransitionV433(state,to,from,plan,options);
  const pose=advanceRapCameraTransitionV433(state,to,from,plan,{...options,progressMs:now});
  return {pose,from,to,startMs,durationMs,delayMs,changed,available,
    progress:clamp((now-startMs)/Math.max(1,durationMs),0,1)};
}

/** A/B is deliberately only a draft: it does not write to preferences. */
export function normalizeRapCameraPreviewDraftV434(value:unknown):RapCameraPreviewSettingsV434{
  const raw=value&&typeof value==="object"&&!Array.isArray(value)?value as Partial<RapCameraPreviewSettingsV434>:{};
  return {smoothness:Math.round(clamp(raw.smoothness??55,0,100)/5)*5,
    beatSync:raw.beatSync!==false};
}
export function rapCameraPreviewPathV434(input:Omit<RapCameraPreviewInputV434,"progressMs">,count=16){
  const n=Math.round(clamp(count,2,32));
  const duration=Math.min(1500,Math.max(100,input.current.endMs-input.current.startMs));
  return Array.from({length:n},(_,i)=>sampleRapCameraTransitionPreviewV434({
    ...input,progressMs:input.current.startMs+duration*i/(n-1)}).pose);
}
