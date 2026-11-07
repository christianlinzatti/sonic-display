/** V1085 · 360° Projection Mapping.
 * Deterministic, local optical patterns on existing scenic surfaces. No projectors,
 * hardware control, random numbers, new clocks, physics or generated music events.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';
export type ProjectionModeV1085='auto'|'ripple'|'lattice'|'orbit'|'aurora';
export type ProjectionSurfaceV1085='floor'|'satellite'|'scenery';
export type ProjectionCueV1085={
 active:boolean;reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'show'|'surfaces'|'planned';
 mode:Exclude<ProjectionModeV1085,'auto'>;gain:number;time:number;beatAccent:number;chapter:number;
 floor:boolean;satellites:boolean;scenery:boolean;tier:'balanced'|'high';
};
export type ProjectionSampleV1085={radius:number;y:number;angle:number;width:number;height:number;glow:number;hue:number};
const clamp=(v:unknown,lo:number,hi:number,fallback=lo):number=>
 typeof v==='number'&&Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):fallback;
const SCENES:Record<ArenaShowSceneV1040,Exclude<ProjectionModeV1085,'auto'>>={
 intro:'aurora',verse:'lattice',build:'orbit',hook:'ripple',interlude:'aurora',finale:'orbit',
};
const MODES:readonly ProjectionModeV1085[]=['auto','ripple','lattice','orbit','aurora'];
const OFF:Readonly<ProjectionCueV1085>=Object.freeze({active:false,reason:'disabled',mode:'aurora',gain:0,
 time:0,beatAccent:0,chapter:-1,floor:false,satellites:false,scenery:false,tier:'balanced'});
const disabled=(reason:ProjectionCueV1085['reason']):ProjectionCueV1085=>({...OFF,reason});
export function planProjectionMappingV1085(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 showDesignerEnabled:boolean;showDirectorEnabled:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;mode?:ProjectionModeV1085|null;
 show?:ArenaShowCueV1040|null;beat?:boolean;beatStrength?:number|null;energy?:number|null;
 floorEnabled?:boolean;satellitesEnabled?:boolean;sceneryEnabled?:boolean;
}):ProjectionCueV1085{
 if(!input.enabled||!input.stageIsArena||!input.reactive||!input.showDesignerEnabled||!input.showDirectorEnabled)return disabled('disabled');
 if(!input.playing)return disabled('paused');
 if(input.reducedMotion)return disabled('motion');
 if(!input.performanceTier||input.performanceTier==='low')return disabled('quality');
 const ms=input.progressMs,duration=input.durationMs;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)||ms!<0||duration!<30000||duration!>1800000||ms!>duration!)return disabled('clock');
 const show=input.show;
 if(!show?.active||!show.scene||!(show.scene in SCENES)||!Number.isInteger(show.segmentIndex)||show.segmentIndex<0||
  !Number.isFinite(show.intensity)||show.intensity<=0||show.intensity>100||
  !Number.isFinite(show.fade)||show.fade<=0||show.fade>1)return disabled('show');
 if(input.strength!=null&&!Number.isFinite(input.strength))return disabled('disabled');
 const strength=clamp(input.strength??55,0,80),floor=Boolean(input.floorEnabled),
  satellites=Boolean(input.satellitesEnabled),scenery=Boolean(input.sceneryEnabled);
 if(!strength)return disabled('disabled');
 if(!floor&&!satellites&&!scenery)return disabled('surfaces');
 const mode=MODES.includes(input.mode??'auto')?input.mode??'auto':'auto';
 const chosen=mode==='auto'?SCENES[show.scene as ArenaShowSceneV1040]:mode;
 const gain=clamp((strength/80)*(show.intensity/100)*show.fade*(input.performanceTier==='balanced'?.68:1),0,.72);
 const verifiedBeat=input.beat===true&&clamp(input.beatStrength,0,1)>=.74&&clamp(input.energy,0,1)>=.48;
 return {active:true,reason:'planned',mode:chosen,gain,time:ms!/1000,
  beatAccent:verifiedBeat?clamp(input.beatStrength,0,1)*.17:0,chapter:show.segmentIndex,
  floor,satellites,scenery,tier:input.performanceTier};
}
/** A bounded, independent segment sample. No mutable RNG/clock and no three.js imports. */
export function sampleProjectionMappingV1085(surface:ProjectionSurfaceV1085,index:number,count:number,
 cue:ProjectionCueV1085):ProjectionSampleV1085{
 const hidden:ProjectionSampleV1085={radius:0,y:-2,angle:0,width:0,height:0,glow:0,hue:0};
 if(!cue?.active||!['floor','satellite','scenery'].includes(surface)||
  !Number.isInteger(index)||!Number.isInteger(count)||count<1||count>48||index<0||index>=count||
  !Number.isFinite(cue.time)||cue.time<0||cue.time>1800||!Number.isFinite(cue.gain)||cue.gain<=0||cue.gain>.72||
  !Number.isFinite(cue.beatAccent)||cue.beatAccent<0||cue.beatAccent>.17||
  !(surface==='floor'?cue.floor:surface==='satellite'?cue.satellites:cue.scenery))return hidden;
 const t=cue.time,unit=index/count,tau=Math.PI*2,
  wave=Math.sin(t*(cue.mode==='ripple'?1.55:.45)+unit*tau*(cue.mode==='lattice'?6:3)),
  orbit=cue.mode==='orbit'?.5*t:.19*t,
  stripe=cue.mode==='lattice'?Math.abs(Math.cos(unit*tau*8+t*.65)):
   cue.mode==='aurora'?.5+.5*Math.sin(unit*tau*2-t*.36):.5+.5*wave,
  modulation=clamp(.16+.84*stripe,0,1),glow=clamp(cue.gain*modulation+cue.beatAccent*.35,0,.72);
 if(surface==='floor')return {radius:clamp(1.12+1.33*((index%6)/5)+.08*wave,1,2.6),
  y:-1.807,angle:unit*tau+orbit,width:clamp(.07+.11*(.5+.5*wave),.07,.18),
  height:clamp(.32+.29*stripe,.32,.61),glow,hue:(index+cue.chapter)%2};
 if(surface==='satellite')return {radius:clamp(.09+.10*stripe,.09,.20),y:.077,
  angle:unit*tau+orbit,width:.08,height:.16,glow:clamp(glow*.82,0,.60),hue:(index+cue.chapter)%2};
 return {radius:4.13,y:clamp(-1.37+(index%3)*.64+.06*wave,-1.44,.08),
  angle:unit*tau,width:clamp(.18+.2*stripe,.18,.38),height:clamp(.30+.28*stripe,.30,.58),
  glow:clamp(glow*.82,0,.60),hue:(index+cue.chapter)%2};
}
