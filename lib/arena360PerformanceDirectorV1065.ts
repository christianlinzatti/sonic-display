/** V1065: local, deterministic, subordinate performance mixing for the existing arena.
 * A V1040 timeline is a *proposal*, never proof of a real beat, singer or lyric.
 * No new camera owner, audio analysis, avatar mixer, device commands or timers.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
export type PerformanceFocusV1065='none'|'camera'|'vocal'|'group'|'energy'|'rest';
export type PerformanceCueV1065={active:boolean;reason:'disabled'|'paused'|'reduced-motion'|'manual'|'low-tier'|'clock'|'show'|'planned';
 chapter:ArenaShowSceneV1040|null;focus:PerformanceFocusV1065;
 cameraGain:number;rapGain:number;danceGain:number;ensembleGain:number;travelGain:number};
const NEUTRAL:PerformanceCueV1065=Object.freeze({active:false,reason:'disabled',chapter:null,focus:'none',
 cameraGain:1,rapGain:1,danceGain:1,ensembleGain:1,travelGain:1});
const inactive=(reason:PerformanceCueV1065['reason']):PerformanceCueV1065=>({...NEUTRAL,reason});
const clamp=(value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));
const PRESETS:Record<ArenaShowSceneV1040,{focus:PerformanceFocusV1065;camera:number;rap:number;dance:number;ensemble:number;travel:number}>={
 intro:{focus:'camera',camera:1,rap:.78,dance:.80,ensemble:.78,travel:.75},
 verse:{focus:'vocal',camera:.83,rap:1,dance:.82,ensemble:.78,travel:.72},
 build:{focus:'energy',camera:.88,rap:.84,dance:.96,ensemble:.92,travel:.80},
 hook:{focus:'group',camera:.94,rap:.92,dance:1,ensemble:1,travel:.94},
 interlude:{focus:'rest',camera:.93,rap:.70,dance:.70,ensemble:.75,travel:.70},
 finale:{focus:'group',camera:1,rap:.94,dance:1,ensemble:1,travel:1},
};
/** Downward-only gain mixing: cannot enable or intensify any existing effect.
 * Manual controls are lane-scoped: a manual vocal timeline does not disable
 * automatic group direction, but will leave the rap lane untouched.
 */
export function planPerformanceDirectorV1065(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;
 manualCamera?:boolean;manualDance?:boolean;manualRap?:boolean;
 rapEvidence?:boolean;trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number|null;show?:ArenaShowCueV1040|null;
}):PerformanceCueV1065{
 if(!input.enabled||!input.stageIsArena)return inactive('disabled');
 if(!input.playing)return inactive('paused');
 if(input.reducedMotion)return inactive('reduced-motion');
 if(input.performanceTier==='low')return inactive('low-tier');
 const ms=input.progressMs,duration=input.durationMs;
 if(typeof input.trackId!=='string'||!input.trackId.trim()||!Number.isFinite(ms)||!Number.isFinite(duration)||
    (duration??0)<30000||(ms??-1)<0||(ms??0)>(duration??0))return inactive('clock');
 const show=input.show;
 if(!show?.active||!show.scene||!Object.prototype.hasOwnProperty.call(PRESETS,show.scene)||
    !Number.isFinite(show.fade)||!Number.isFinite(show.intensity)||show.intensity<=0||show.fade<=0)
    return inactive('show');
 if(!Number.isFinite(input.strength)|| (input.strength??0)<=0)return inactive('disabled');
 if(input.manualCamera&&input.manualDance&&input.manualRap)return inactive('manual');
 const preset=PRESETS[show.scene],amount=clamp(input.strength??0,0,80)/80*
   clamp(show.intensity/100,0,1)*clamp(show.fade,0,1)*
   (input.performanceTier==='balanced'?.65:1);
 if(amount<=0)return inactive('show');
 const dim=(target:number,blocked:boolean)=>blocked?1:clamp(1-(1-target)*amount,0,1);
 const danceLocked=input.manualDance===true,rapLocked=input.manualRap===true||input.rapEvidence!==true;
 return {active:true,reason:'planned',chapter:show.scene,focus:preset.focus,
  cameraGain:dim(preset.camera,input.manualCamera===true),
  rapGain:dim(preset.rap,rapLocked),danceGain:dim(preset.dance,danceLocked),
  ensembleGain:dim(preset.ensemble,danceLocked),travelGain:dim(preset.travel,danceLocked)};
}
