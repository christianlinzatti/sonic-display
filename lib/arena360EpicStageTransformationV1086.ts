/** V1086 · Epic Stage Transformation 4.0.
 * Coordinated visual-only morphs of EXISTING stage systems. No new geometry,
 * external AI, hardware lights, timers, beat generation or extra render passes.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
import type {ArchitectureCueV1082,ArchitectureFormationV1082} from './arena360StageArchitectureV1082';
import type {LaserExperienceCueV1080,LaserFormationV1080} from './arena360LaserExperienceV1080';
import type {LedExperienceCueV1083,LedExperienceLookV1083} from './arena360LedWallExperienceV1083';
import type {HologramCueV1068,HologramLookV1068} from './arena360HolographicConcertV1068';
import type {ProjectionCueV1085} from './arena360ProjectionMappingV1085';
export type EpicStageModeV1086='auto'|'cinematic'|'festival'|'minimal';
export type EpicStageLookV1086=ArenaShowSceneV1040;
export type EpicStageChannelsV1086={architecture:boolean;laser:boolean;led:boolean;holograms:boolean;projection:boolean};
export type EpicStageCueV1086={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'channels'|'planned';
 look:EpicStageLookV1086;mix:number;channels:EpicStageChannelsV1086;count:number;
};
export type EpicStageSourcesV1086={architecture:ArchitectureCueV1082;laser:LaserExperienceCueV1080;
 led:LedExperienceCueV1083;holograms:HologramCueV1068;projection:ProjectionCueV1085};
const clamp=(value:unknown,min:number,max:number,fallback=min)=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(min,Math.min(max,value)):fallback;
const SCENES:readonly EpicStageLookV1086[]=['intro','verse','build','hook','interlude','finale'];
const empty:EpicStageChannelsV1086={architecture:false,laser:false,led:false,holograms:false,projection:false};
const off=(reason:EpicStageCueV1086['reason']='disabled'):EpicStageCueV1086=>({
 active:false,reason,look:'intro',mix:0,count:0,channels:{...empty},
});
const looks:Record<EpicStageLookV1086,{
 architecture:ArchitectureFormationV1082;laser:LaserFormationV1080;
 led:LedExperienceLookV1083;holograms:HologramLookV1068;
 projection:ProjectionCueV1085['mode'];focus:number;
}>={
 intro:{architecture:'gate',laser:'fan',led:'tunnel',holograms:'awakening',projection:'aurora',focus:.72},
 verse:{architecture:'arcade',laser:'fan',led:'geometry3d',holograms:'reflection',projection:'lattice',focus:.67},
 build:{architecture:'staircase',laser:'helix',led:'tunnel',holograms:'vortex',projection:'orbit',focus:.88},
 hook:{architecture:'terraces',laser:'tunnel',led:'geometry3d',holograms:'duet',projection:'ripple',focus:1},
 interlude:{architecture:'colonnade',laser:'fan',led:'tunnel',holograms:'breath',projection:'aurora',focus:.55},
 finale:{architecture:'crown',laser:'crown',led:'geometry3d',holograms:'finale',projection:'orbit',focus:1},
};
/** Scenes are authored, not inferred song events. Manual pattern controls are
 * resolved BEFORE passing eligible channels; low tiers/paused shows fail closed.
 */
export function planEpicStageTransformationV1086(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 mode?:EpicStageModeV1086|null;show?:ArenaShowCueV1040|null;
 channels:EpicStageChannelsV1086;
}):EpicStageCueV1086{
 if(!input.enabled||!input.stageIsArena||!input.reactive||!input.showDesignerEnabled||!input.showDirectorEnabled)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(!input.performanceTier||input.performanceTier==='low')return off('quality');
 if(!Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||input.progressMs!<0||
  input.durationMs!<30000||input.durationMs!>1800000||input.progressMs!>input.durationMs!)return off('clock');
 const show=input.show;
 if(!show?.active||!SCENES.includes(show.scene as EpicStageLookV1086)||
  !Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  !Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
  !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100)return off('show');
 if(input.strength!=null&&!Number.isFinite(input.strength))return off();
 const strength=clamp(input.strength??55,0,80),channels:{[K in keyof EpicStageChannelsV1086]:boolean}={
  architecture:input.channels?.architecture===true,laser:input.channels?.laser===true,
  led:input.channels?.led===true,holograms:input.channels?.holograms===true,
  projection:input.channels?.projection===true,
 };
 const count=Object.values(channels).filter(Boolean).length;
 if(strength<=0)return off();
 if(count<2)return {...off('channels'),count,channels};
 const mode:EpicStageModeV1086=
  ['auto','cinematic','festival','minimal'].includes(input.mode??'auto')?(input.mode??'auto') as EpicStageModeV1086:'auto';
 const look:EpicStageLookV1086=mode==='auto'?show.scene as EpicStageLookV1086:
  mode==='cinematic'?'interlude':mode==='festival'?'hook':'verse';
 // The authored fade gates new looks; only dimming, never boosting a channel.
 const mix=clamp(strength/80*show.intensity/100*show.fade*
  (input.performanceTier==='balanced'?.72:1),0,.88);
 return {active:mix>.001,reason:'planned',look,mix,count,channels};
}
/** Return the original objects when disabled. This function NEVER reactivates a
 * disabled channel and NEVER overrides a separately chosen manual style.
 * Hologram/architecture/laser power and LED/projection gains only decrease.
 */
export function coordinateEpicStageTransformationV1086(cue:EpicStageCueV1086,
 sources:EpicStageSourcesV1086):EpicStageSourcesV1086{
 if(!cue.active||cue.reason!=='planned'||!SCENES.includes(cue.look)||cue.mix<=0||cue.mix>.88)
  return sources;
 const profile=looks[cue.look],mix=clamp(cue.mix,0,.88);
 const attenuate=(factor:number)=>clamp(1-mix*(1-factor*profile.focus),.35,1,1);
 const picked=mix>=.25;
 const a=sources.architecture,l=sources.laser,d=sources.led,h=sources.holograms,p=sources.projection;
 return {
  architecture:cue.channels.architecture&&a.active?{...a,
   formation:picked?profile.architecture:a.formation,amount:clamp(a.amount*attenuate(.90),0,1)}:a,
  laser:cue.channels.laser&&l.active?{...l,
   formation:picked?profile.laser:l.formation,amount:clamp(l.amount*attenuate(.87),0,1),
   gain:clamp(l.gain*attenuate(.95),0,1)}:l,
  led:cue.channels.led&&d.active?{...d,
   // Preserve real synchronized words; never synthesize lyrics or a drop.
   look:d.look==='lyrics'&&Boolean(d.lyric)?'lyrics':picked?profile.led:d.look,
   gain:clamp(d.gain*attenuate(.92),0,.55)}:d,
  holograms:cue.channels.holograms&&h.active?{...h,
   look:picked?profile.holograms:h.look,power:clamp(h.power*attenuate(.90),0,1)}:h,
  projection:cue.channels.projection&&p.active?{...p,
   mode:picked?profile.projection:p.mode,gain:clamp(p.gain*attenuate(.9),0,.72)}:p,
 };
}
