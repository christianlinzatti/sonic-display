/** V1055 · Dynamic Concert Stage & Avatar Interaction Engine.
 * A deterministic, visual-only arrangement for the existing V1041 duo,
 * V1043/V1053 camera cues, V1038 scenic platforms and V1051 virtual crowd.
 * The rotating turntable is the ONLY performer stage; floating satellites
 * are scenery and never become walkable or contact/IK targets.
 * Authored blocking, GLB motion and foot-lock owners always win.
 */
import {normalizeArenaShowPlanV1040} from './arena360ShowDesignerV1040';
import type {ArenaShowPlanV1040,ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type StageZoneV1055='center'|'front'|'left'|'right'|'rear'|'finale';
export type StageFocusV1055='cast'|'audience'|'platform'|'ensemble';
export type StageInteractionCueV1055={
 active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'performance'|'clock'|'show'|'planned';
 chapter:number;zone:StageZoneV1055;focus:StageFocusV1055;
 offsetX:number;offsetZ:number;audienceYaw:number;
 cameraGain:number;crowdGain:number;platformGain:number;
};
export type StageTargetV1055=[number,number,number];
const clamp=(n:unknown,min:number,max:number,fallback:number):number=>
 typeof n==='number'&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):fallback;
const smooth=(n:number)=>{const t=clamp(n,0,1,0);return t*t*(3-2*t);};
const ZONES:readonly StageZoneV1055[]=['center','front','left','right','center','rear','finale'];
const FOCI:readonly StageFocusV1055[]=['cast','audience','platform','ensemble','cast','audience','ensemble'];
const VECTORS:Record<StageZoneV1055,readonly [number,number]>={
 center:[0,0],front:[0,-.29],left:[-.31,-.06],right:[.31,-.06],rear:[0,.27],finale:[0,-.13],
};
const off=(reason:StageInteractionCueV1055['reason']='disabled'):StageInteractionCueV1055=>({
 active:false,reason,chapter:-1,zone:'center',focus:'cast',offsetX:0,offsetZ:0,
 audienceYaw:0,cameraGain:1,crowdGain:1,platformGain:1,
});
const songHash=(song:string)=>{
 let hash=2166136261;
 for(let i=0;i<Math.min(song.length,256);i++)hash=Math.imul(hash^song.charCodeAt(i),16777619)>>>0;
 return hash;
};
const mix=(a:number,b:number,t:number)=>a+(b-a)*t;
const point=(zone:StageZoneV1055,rotation:number):[number,number]=>{
 const [x,z]=VECTORS[zone];const a=rotation*Math.PI/2,c=Math.cos(a),s=Math.sin(a);
 return [x*c-z*s,x*s+z*c];
};
/** Validates exact timeline index against the song position: unknown timing or
 * stale/mismatched show data fail closed. No inferred audio peak or vocal role.
 */
export function planStageInteractionV1055(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 reactive?:boolean;manualPriority:boolean;trackId?:string|null;
 progressMs?:number|null;durationMs?:number|null;show?:ArenaShowCueV1040|null;
 plan?:ArenaShowPlanV1040|null;strength?:number|null;
 performanceTier?:'low'|'balanced'|'high'|null;
}):StageInteractionCueV1055{
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.manualPriority)return off('manual');
 if(input.performanceTier==='low')return off('performance');
 const {progressMs,durationMs,trackId}=input;
 if(!trackId?.trim()||!Number.isFinite(progressMs)||!Number.isFinite(durationMs)||
  (durationMs??0)<30000||(progressMs??-1)<0||(progressMs??0)>(durationMs??0))return off('clock');
 const plan=normalizeArenaShowPlanV1040(input.plan),show=input.show;
 if(!plan||!show?.active||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  show.segmentIndex>=plan.segments.length||!Number.isFinite(show.fade)||show.fade<=0||
  !Number.isFinite(show.intensity)||show.intensity<=0)return off('show');
 const chapter=show.segmentIndex,segment=plan.segments[chapter];
 const progress=(progressMs??0)/(durationMs??1);
 if(segment.scene!==show.scene||progress<segment.start-1e-8||progress>segment.end+1e-8)return off('show');
 const local=clamp((progress-segment.start)/(segment.end-segment.start),0,1,0);
 const rawStrength=clamp(input.strength,0,80,55)/100;
 if(rawStrength===0)return off();
 const strength=rawStrength*(input.performanceTier==='balanced'?.65:1)*
  clamp(show.intensity/100,0,1,0)*clamp(show.fade,0,1,0);
 const rotation=songHash(trackId)%4;
 const zone=ZONES[chapter],previous=chapter?ZONES[chapter-1]:'center';
 // Smooth crossing between 7 authored chapters, with no fixed interval timer.
 const transition=smooth(local/.22),from=point(previous,rotation),to=point(zone,rotation);
 const offsetX=mix(from[0],to[0],transition)*strength;
 const offsetZ=mix(from[1],to[1],transition)*strength;
 const focus=FOCI[chapter];
 // Only attenuate existing subsystems; their manual enables and intensity caps win.
 const cameraGain=1-strength*(focus==='cast'||focus==='ensemble'?0:.24);
 const crowdGain=1-strength*(focus==='audience'||focus==='ensemble'?0:.22);
 const platformGain=1-strength*(focus==='platform'||focus==='ensemble'?0:.26);
 return {active:true,reason:'planned',chapter,zone,focus,offsetX,offsetZ,
  audienceYaw:clamp(offsetX*.26,-.11,.11,0),cameraGain,crowdGain,platformGain};
}
/** Same bounded translation for both cast members preserves separation and
 * the original vertical coordinate. The existing V324/V506 collision engine and
 * ground/foot owners retain final authority. Floating platforms are NOT targets.
 */
export function applyStageInteractionV1055(
 lead:StageTargetV1055,partner:StageTargetV1055,cue:StageInteractionCueV1055|null|undefined,
 guards:{manual:boolean;footLocked:boolean;importedAnimation:boolean;ensembleOwns:boolean;collisionRisk:boolean;
  isPlaying:boolean;reducedMotion:boolean;performanceTier?:'low'|'balanced'|'high'|null},
):{active:boolean;lead:StageTargetV1055;partner:StageTargetV1055}{
 const fallback=()=>({active:false,lead,partner});
 if(!cue?.active||guards.manual||guards.footLocked||guards.importedAnimation||guards.ensembleOwns||
  guards.collisionRisk||!guards.isPlaying||guards.reducedMotion||guards.performanceTier==='low')return fallback();
 if(![...lead,...partner,cue.offsetX,cue.offsetZ].every(Number.isFinite))return fallback();
 const movedLead:StageTargetV1055=[lead[0]+cue.offsetX,lead[1],lead[2]+cue.offsetZ];
 const movedPartner:StageTargetV1055=[partner[0]+cue.offsetX,partner[1],partner[2]+cue.offsetZ];
 // Fixed central turntable has radius 2.74. Leave room for dancer limb reach.
 if(Math.hypot(movedLead[0],movedLead[2])>1.95||
  Math.hypot(movedPartner[0],movedPartner[2])>1.95)return fallback();
 return {active:true,lead:movedLead,partner:movedPartner};
}
