/** V1121 · AI Immersive Scene Transitions.
 * Local, deterministic boundary rehearsal across the AUTHOR-EDITED V1040 show.
 * The time windows are preview guidance, NOT a new playback engine. V1040,
 * V1071, V1056, V1072, V1066-1068 own the actual guarded crossfades.
 * No audio inference, camera object, timer, cloud, microphone or hardware I/O.
 */
import {normalizeArenaShowPlanV1040,type ArenaShowSegmentV1040} from './arena360ShowDesignerV1040';
import {normalizeAiShowRemixV1106,applyAiShowRemixV1106,type AiShowRemixV1106} from './arena360AiShowRemixV1106';
export const TRANSITION_STYLES_V1121=['cinematic','festival','gentle','holographic'] as const;
export type TransitionStyleV1121=typeof TRANSITION_STYLES_V1121[number];
export const TRANSITION_LABELS_V1121:Record<TransitionStyleV1121,string>={
 cinematic:'Filmische Überblendungen',festival:'Festival-Wellen',
 gentle:'Sanfte Künstlerübergänge',holographic:'Holografische Raumwechsel',
};
export type TransitionOptionsV1121={style:TransitionStyleV1121;strength:number;duration:'short'|'balanced'|'long';intensityCap:number};
type RemixAct=AiShowRemixV1106['acts'][number];
export type TransitionCueV1121={index:number;from:ArenaShowSegmentV1040['scene'];to:ArenaShowSegmentV1040['scene'];
 atMs:number;startMs:number;endMs:number;durationMs:number;
 fromCamera:RemixAct['camera'];toCamera:RemixAct['camera'];
 fromDeck:RemixAct['deck'];toDeck:RemixAct['deck'];
 fromFloating:RemixAct['floating'];toFloating:RemixAct['floating'];
 fromLaser:RemixAct['lasers'];toLaser:RemixAct['lasers'];
 intensityFrom:number;intensityTo:number;channels:readonly ('camera'|'stage'|'holograms'|'lighting')[];
 kind:'breath'|'crescendo'|'ensemble'|'handoff';
 authoredBoundary:true;newLiveTimeline:false;actualSongEventDetected:false};
export type TransitionShowV1121={style:TransitionStyleV1121;duration:TransitionOptionsV1121['duration'];strength:number;
 remix:AiShowRemixV1106;cues:TransitionCueV1121[];durationMs:number;
 quality:{boundaries:6;boundedWindows:true;originalTiming:true;noOverlappingWindows:true;
 reducedMotionRespectedByRuntime:true;manualPriority:true;hardwareCommands:0;detectedDrops:0}};
export type TransitionSampleV1121={cue:TransitionCueV1121;phase:'anticipation'|'handoff';blend:number;
 cameraFromGain:number;cameraToGain:number;stageFromGain:number;stageToGain:number;
 hologramFromGain:number;hologramToGain:number;lightingFromGain:number;lightingToGain:number;
 intensityPreview:number};
export type TransitionLivePresetV1121={
 arenaSmartConcertFlowEnabledV1071:true;arenaSmartConcertFlowStrengthV1071:number;
 arenaShowCameraEnabledV1043:true;arenaShowCameraStrengthV1043:number;
 arenaCameraDirectorEnabledV1072:true;arenaCameraDirectorStrengthV1072:number;
 arenaCinematicLightingEnabledV1056:true;arenaCinematicLightingStrengthV1056:number;
 arenaTransformingStageEnabledV1066:true;arenaTransformingStageStrengthV1066:number;
 arenaFloatingExperienceEnabledV1067:true;arenaFloatingExperienceStrengthV1067:number;
 arenaHolographicConcertEnabledV1068:true;arenaHolographicConcertStrengthV1068:number};
const TIMINGS:Record<TransitionOptionsV1121['duration'],number>={short:650,balanced:1300,long:2100};
const clamp=(n:number,a:number,b:number)=>Math.min(b,Math.max(a,n));
const smooth=(t:number)=>{const x=clamp(t,0,1);return x*x*(3-2*x);};
export function normalizeTransitionOptionsV1121(raw:unknown):TransitionOptionsV1121|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const v=raw as Record<string,unknown>;
 if(!TRANSITION_STYLES_V1121.includes(v.style as TransitionStyleV1121)||
  !['short','balanced','long'].includes(v.duration as string)||
  typeof v.strength!=='number'||!Number.isInteger(v.strength)||v.strength<20||v.strength>80||v.strength%10!==0||
  typeof v.intensityCap!=='number'||!Number.isInteger(v.intensityCap)||v.intensityCap<30||v.intensityCap>85)return null;
 return v as TransitionOptionsV1121;
}
/** Plan SIX mutually non-overlapping seam windows around the exact authored boundaries.
 * No act fields are changed: the existing V1040/V1071 player is authoritative. */
export function directImmersiveTransitionsV1121(baseRaw:unknown,remixRaw:unknown,optionsRaw:unknown):TransitionShowV1121|null{
 const plan=normalizeArenaShowPlanV1040(baseRaw),remix=normalizeAiShowRemixV1106(remixRaw);
 const o=normalizeTransitionOptionsV1121(optionsRaw);
 if(!plan||!remix||!o||remix.acts.some((a,i)=>a.scene!==plan.segments[i].scene||a.intensity>o.intensityCap)||
  !applyAiShowRemixV1106(plan,remix,o.intensityCap))return null;
 const cues:TransitionCueV1121[]=[];
 for(let i=0;i<6;i++){
  const prev=plan.segments[i],next=plan.segments[i+1];
  const a=remix.acts[i],b=remix.acts[i+1];
  const atMs=Math.round(prev.end*plan.durationMs);
  const left=(prev.end-prev.start)*plan.durationMs,right=(next.end-next.start)*plan.durationMs;
  // Each side consumes at most 22% of its adjacent scene (leaves all seams disjoint).
  const tempoScale=o.style==='festival'?.78:o.style==='gentle'?.94:o.style==='holographic'?.88:1;
  const half=Math.max(1,Math.min(Math.round(TIMINGS[o.duration]*tempoScale*(o.strength/60)/2),
   Math.floor(left*.22),Math.floor(right*.22),atMs,plan.durationMs-atMs));
  const kind=i===3||i===4?'breath':i===5?'ensemble':i===2?'crescendo':'handoff';
  const channels:TransitionCueV1121['channels']=o.style==='gentle'?['camera','lighting']:
   o.style==='holographic'?['camera','stage','holograms','lighting']:
   o.style==='festival'?['camera','stage','lighting','holograms']:['camera','lighting','stage','holograms'];
  cues.push({index:i,from:prev.scene,to:next.scene,atMs,startMs:atMs-half,endMs:atMs+half,
   durationMs:half*2,fromCamera:a.camera,toCamera:b.camera,fromDeck:a.deck,toDeck:b.deck,
   fromFloating:a.floating,toFloating:b.floating,fromLaser:a.lasers,toLaser:b.lasers,
   intensityFrom:a.intensity,intensityTo:b.intensity,channels,kind,
   authoredBoundary:true,newLiveTimeline:false,actualSongEventDetected:false});
 }
 if(cues.some((c,i)=>c.startMs<0||c.endMs>plan.durationMs||c.durationMs<=0||
  (i>0&&c.startMs<=cues[i-1].endMs)))return null;
 return {style:o.style,duration:o.duration,strength:o.strength,remix,cues,durationMs:plan.durationMs,
  quality:{boundaries:6,boundedWindows:true,originalTiming:true,noOverlappingWindows:true,
   reducedMotionRespectedByRuntime:true,manualPriority:true,hardwareCommands:0,detectedDrops:0}};
}
/** Snapshot at user-selected playback percentage. No speculative pre-trigger. */
export function sampleImmersiveTransitionV1121(show:TransitionShowV1121|null,progress:unknown):TransitionSampleV1121|null{
 if(!show||show.cues.length!==6||typeof progress!=='number'||!Number.isFinite(progress)||progress<0||progress>1)return null;
 const ms=Math.round(progress*show.durationMs);
 const cue=show.cues.find(c=>ms>=c.startMs&&ms<=c.endMs);
 if(!cue)return null;
 const x=clamp((ms-cue.startMs)/cue.durationMs,0,1);
 const curve=show.style==='gentle'?(1-Math.cos(Math.PI*x))/2:
  show.style==='holographic'?x*x*x*(x*(6*x-15)+10):
  show.style==='festival'?(x<=.5?.5*Math.pow(x*2,1.5):1-.5*Math.pow((1-x)*2,1.5)):
  smooth(x);
 const blend=curve;
 const on=(channel:TransitionCueV1121['channels'][number])=>cue.channels.includes(channel);
 const gains=(channel:TransitionCueV1121['channels'][number]):[number,number]=>on(channel)?[1-blend,blend]:[ms<cue.atMs?1:0,ms<cue.atMs?0:1];
 const [cameraFromGain,cameraToGain]=gains('camera'),[stageFromGain,stageToGain]=gains('stage'),
  [hologramFromGain,hologramToGain]=gains('holograms'),[lightingFromGain,lightingToGain]=gains('lighting');
 return {cue,phase:ms<cue.atMs?'anticipation':'handoff',blend:Math.round(blend*1000)/1000,
  cameraFromGain,cameraToGain,stageFromGain,stageToGain,
  hologramFromGain,hologramToGain,lightingFromGain,lightingToGain,
  intensityPreview:Math.round(cue.intensityFrom+(cue.intensityTo-cue.intensityFrom)*blend)};
}
/** Activates ONLY already implemented V1071/V1043/V1072/V1056/V1066–68;
 * each renderer retains track, performance, GPU, manual and motion guards.
 * This preset does not install a custom per-seam playback timeline. */
export function transitionLivePresetV1121(raw:unknown):TransitionLivePresetV1121|null{
 const o=normalizeTransitionOptionsV1121(raw);if(!o)return null;
 const strength=Math.min(o.strength,o.intensityCap,70);
 return {arenaSmartConcertFlowEnabledV1071:true,arenaSmartConcertFlowStrengthV1071:strength,
  arenaShowCameraEnabledV1043:true,arenaShowCameraStrengthV1043:strength,
  arenaCameraDirectorEnabledV1072:true,arenaCameraDirectorStrengthV1072:strength,
  arenaCinematicLightingEnabledV1056:true,arenaCinematicLightingStrengthV1056:strength,
  arenaTransformingStageEnabledV1066:true,arenaTransformingStageStrengthV1066:strength,
  arenaFloatingExperienceEnabledV1067:true,arenaFloatingExperienceStrengthV1067:strength,
  arenaHolographicConcertEnabledV1068:true,arenaHolographicConcertStrengthV1068:strength};
}
