/** V1087 · Ultimate Festival Drop.
 * One shared, deterministic measured-beat envelope for EXISTING virtual FX.
 * An authored hook/finale is NOT evidence of a drop. No hardware, AI or timers.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';

export type UltimateFestivalDropChannelsV1087={shockwave:boolean;laser:boolean;led:boolean;confetti:boolean};
export type UltimateFestivalDropCueV1087={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'unobserved'|'channels'|'armed';
 strength:number;cooldownSeconds:number;channels:UltimateFestivalDropChannelsV1087;
};
export type UltimateFestivalDropStateV1087={
 beatHeld:boolean;cooldownSeconds:number;ageSeconds:number;envelope:number;
 eventCount:number;lastProgressMs:number;lastTrackId:string;
};
export type UltimateFestivalDropAudioV1087={beat?:boolean;beatStrength?:number;bass?:number;energyEnvelope?:number};
export const INITIAL_ULTIMATE_FESTIVAL_DROP_V1087:Readonly<UltimateFestivalDropStateV1087>=Object.freeze({
 beatHeld:false,cooldownSeconds:0,ageSeconds:9,envelope:0,eventCount:0,lastProgressMs:-1,lastTrackId:'',
});
const finite=(v:unknown,min:number,max:number,fallback=min)=>
 typeof v==='number'&&Number.isFinite(v)?Math.max(min,Math.min(max,v)):fallback;
const SCENES=new Set(['intro','verse','build','hook','interlude','finale']);
const empty:UltimateFestivalDropChannelsV1087={shockwave:false,laser:false,led:false,confetti:false};
const off=(reason:UltimateFestivalDropCueV1087['reason']):UltimateFestivalDropCueV1087=>({
 active:false,reason,strength:0,cooldownSeconds:3.6,channels:{...empty},
});
/** V1087 ONLY arms on a trusted observed 'drop' + a valid authored show;
 * actual activation is a separate measured beat edge in stepUltimateFestivalDropV1087.
 */
export function planUltimateFestivalDropV1087(o:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;observedSection?:string|null;
 show?:ArenaShowCueV1040|null;progressMs?:number|null;durationMs?:number|null;
 strength?:number|null;channels:UltimateFestivalDropChannelsV1087;
}):UltimateFestivalDropCueV1087{
 if(!o.enabled||!o.stageIsArena||!o.reactive||!o.showDesignerEnabled||!o.showDirectorEnabled)return off('disabled');
 if(!o.playing)return off('paused');
 if(o.reducedMotion)return off('motion');
 if(!o.performanceTier||o.performanceTier==='low')return off('quality');
 if(!Number.isFinite(o.progressMs)||!Number.isFinite(o.durationMs)||o.progressMs!<0||
  o.durationMs!<30000||o.durationMs!>1800000||o.progressMs!>o.durationMs!)return off('clock');
 const show=o.show;
 if(!show?.active||!show.scene||!SCENES.has(show.scene)||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  !Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
  !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100)return off('show');
 if(o.observedSection!=='drop')return off('unobserved');
 if(o.strength!=null&&!Number.isFinite(o.strength))return off('disabled');
 const channels:UltimateFestivalDropChannelsV1087={
  shockwave:o.channels?.shockwave===true,laser:o.channels?.laser===true,
  led:o.channels?.led===true,confetti:o.channels?.confetti===true,
 };
 // Respect all manual OFF controls. At least two separately enabled visuals are required.
 if(Object.values(channels).filter(Boolean).length<2)return off('channels');
 const strength=finite(o.strength??55,0,80)/80*finite(show.fade,0,1)*
  finite(show.intensity/100,0,1)*(o.performanceTier==='balanced'?.68:1);
 if(strength<=.01)return off('disabled');
 return {active:true,reason:'armed',strength:finite(strength,0,.84),cooldownSeconds:3.6,channels};
}
/** Shared per-render-frame envelope: non-finite values, pauses and seeks fail closed;
 * changes of track cannot carry a burst between songs. The first frame primes
 * beatHeld so loading on an already-high beat does not trigger an artificial drop.
 */
export function stepUltimateFestivalDropV1087(previous:UltimateFestivalDropStateV1087,
 deltaSeconds:number,cue:UltimateFestivalDropCueV1087,audio:UltimateFestivalDropAudioV1087,
 progressMs:number,trackId?:string|null):UltimateFestivalDropStateV1087{
 if(!cue.active||cue.reason!=='armed'||!Number.isFinite(progressMs)||progressMs<0)
  return {...INITIAL_ULTIMATE_FESTIVAL_DROP_V1087};
 const dt=finite(deltaSeconds,0,.1),beat=audio.beat===true;
 const id=String(trackId??'').slice(0,160);
 const initialized=previous.lastProgressMs>=0;
 const discontinuity=initialized&&(previous.lastTrackId!==id||
  progressMs+250<previous.lastProgressMs||progressMs-previous.lastProgressMs>12000);
 if(!initialized||discontinuity)return {...INITIAL_ULTIMATE_FESTIVAL_DROP_V1087,
  beatHeld:beat,lastProgressMs:progressMs,lastTrackId:id};
 const cooldownSeconds=Math.max(0,previous.cooldownSeconds-dt);
 const actualBeat=beat&&!previous.beatHeld&&cooldownSeconds<=0&&
  finite(audio.beatStrength,0,1)>=.77&&finite(audio.energyEnvelope,0,1)>=.62&&
  finite(audio.bass,0,1)>=.55;
 const ageSeconds=actualBeat?0:Math.min(9,previous.ageSeconds+dt);
 return {beatHeld:beat,cooldownSeconds:actualBeat?cue.cooldownSeconds:cooldownSeconds,
  ageSeconds,envelope:actualBeat?cue.strength:Math.max(0,previous.envelope-dt*.65),
  eventCount:previous.eventCount+(actualBeat?1:0),lastProgressMs:progressMs,lastTrackId:id};
}
/** Every channel shares the SAME event age and bounded intensity. */
export function sampleUltimateFestivalDropV1087(cue:UltimateFestivalDropCueV1087,
 state:UltimateFestivalDropStateV1087){
 const power=cue.active&&cue.reason==='armed'?finite(state.envelope,0,.84):0;
 const age=finite(state.ageSeconds,0,9,9);
 return {shockwave:cue.channels.shockwave?power:0,laser:cue.channels.laser?power*.72:0,
  led:cue.channels.led?power*.58:0,confetti:cue.channels.confetti?power:0,
  ageSeconds:age,visible:power>.001};
}
