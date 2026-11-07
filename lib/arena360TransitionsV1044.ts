/** V1044 · Intelligent Concert Transitions.
 * One playback position and a shared local envelope across existing directors.
 * Never creates a camera, timer, music analysis, mixer or hardware command.
 */
import {normalizeArenaShowPlanV1040,
 type ArenaShowPlanV1040,type ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type ArenaTransitionChannelV1044='stage'|'camera'|'dance'|'govee';
export type ArenaTransitionPhaseV1044='steady'|'outgoing'|'incoming';
export type ArenaTransitionV1044={
 active:boolean;phase:ArenaTransitionPhaseV1044;boundaryIndex:number;
 distanceMs:number;windowMs:number;strength:number;
 stageGain:number;cameraGain:number;danceGain:number;goveeGain:number;
};
export const OFF_ARENA_TRANSITION_V1044:ArenaTransitionV1044=Object.freeze({
 active:false,phase:'steady',boundaryIndex:-1,distanceMs:0,windowMs:0,strength:0,
 stageGain:1,cameraGain:1,danceGain:1,goveeGain:1,
});
const bounded=(v:unknown,fallback:number,min:number,max:number)=>
 typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const smooth=(v:number)=>{const t=bounded(v,0,0,1);return t*t*(3-2*t)};
export function planArenaTransitionsV1044(input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;stageIsArena:boolean;
 plan?:ArenaShowPlanV1040|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number;
}):ArenaTransitionV1044{
 if(!input.enabled||!input.playing||input.reducedMotion||!input.stageIsArena)
  return OFF_ARENA_TRANSITION_V1044;
 const plan=normalizeArenaShowPlanV1040(input.plan);
 if(!plan||typeof input.progressMs!=='number'||!Number.isFinite(input.progressMs)||
  input.progressMs<0||typeof input.durationMs!=='number'||!Number.isFinite(input.durationMs)||
  input.durationMs<=0)return OFF_ARENA_TRANSITION_V1044;
 const strength=bounded(input.strength,60,0,100)/100;
 if(strength<=0)return OFF_ARENA_TRANSITION_V1044;
 const elapsed=bounded(input.progressMs,0,0,input.durationMs);
 const minSegmentMs=Math.min(...plan.segments.map(s=>(s.end-s.start)*input.durationMs!));
 const windowMs=bounded(Math.min(1200+strength*1600,minSegmentMs*.36),1200,250,2500);
 let boundaryIndex=-1,distanceMs=Infinity,offset=0;
 for(let i=0;i<plan.segments.length-1;i++){
  const delta=elapsed-plan.segments[i].end*input.durationMs;
  const absolute=Math.abs(delta);
  if(absolute<distanceMs){distanceMs=absolute;boundaryIndex=i;offset=delta}
 }
 if(distanceMs>=windowMs||boundaryIndex<0)return {
  ...OFF_ARENA_TRANSITION_V1044,active:true,strength,windowMs,
 };
 const pressure=1-smooth(distanceMs/windowMs);
 const gate=(weight:number)=>bounded(1-pressure*strength*weight,1,.55,1);
 return {active:true,phase:offset<0?'outgoing':'incoming',boundaryIndex,distanceMs,windowMs,
  strength,stageGain:gate(.32),cameraGain:gate(.42),
  danceGain:gate(.35),goveeGain:gate(.24)};
}
/** Fade only opt-in overlay intensities; legacy/manual cues retain ownership. */
export function applyArenaTransitionV1044(cue:ArenaShowCueV1040,
 transition:ArenaTransitionV1044,channel:ArenaTransitionChannelV1044):ArenaShowCueV1040{
 if(!cue.active||!transition.active||transition.phase==='steady')return cue;
 const gains={stage:transition.stageGain,camera:transition.cameraGain,
  dance:transition.danceGain,govee:transition.goveeGain};
 const gain=gains[channel];
 if(!Number.isFinite(gain)||gain<.55||gain>1)return cue;
 return {...cue,intensity:Math.round(bounded(cue.intensity,0,0,100)*gain)};
}
