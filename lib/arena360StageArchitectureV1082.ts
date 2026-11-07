/** V1082 · Dynamic Stage Architecture.
 * Pure, bounded scenic formation planner for world-fixed outer structures.
 * The turntable, performer floor, physics, lights, cameras and hardware are untouched.
 */
import type {ArenaShowCueV1040,ArenaShowSceneV1040} from './arena360ShowDesignerV1040';

export type ArchitectureFormationV1082='gate'|'arcade'|'staircase'|'terraces'|'colonnade'|'crown';
export type ArchitectureCueV1082={
 active:boolean; reason:'disabled'|'paused'|'motion'|'quality'|'manual'|'clock'|'director'|'planned';
 formation:ArchitectureFormationV1082; amount:number;phase:number;accent:number;slots:number;
};
export type ArchitectureSampleV1082={radius:number;rise:number;height:number;glow:number;twist:number};
export const REST_ARCHITECTURE_V1082:Readonly<ArchitectureSampleV1082>=Object.freeze({
 radius:4.04,rise:0,height:.44,glow:.10,twist:0,
});
const formations:Record<ArenaShowSceneV1040,ArchitectureFormationV1082>={
 intro:'gate',verse:'arcade',build:'staircase',hook:'terraces',interlude:'colonnade',finale:'crown',
};
const finite=(value:unknown,low:number,high:number,fallback=low):number=>
 typeof value==='number'&&Number.isFinite(value)?Math.max(low,Math.min(high,value)):fallback;
const off=(reason:ArchitectureCueV1082['reason']='disabled'):ArchitectureCueV1082=>({
 active:false,reason,formation:'colonnade',amount:0,phase:0,accent:0,slots:0,
});
export function planStageArchitectureV1082(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 reactive:boolean;showDesignerEnabled:boolean;showDirectorEnabled:boolean;
 outerStageEnabled:boolean;manualDeckMode?:string|null;
 performanceTier?:'low'|'balanced'|'high'|null;
 progressMs?:number|null;durationMs?:number|null;strength?:number|null;
 beat?:boolean;beatStrength?:number|null;energy?:number|null;
 show?:ArenaShowCueV1040|null;
}):ArchitectureCueV1082{
 if(!input.enabled||!input.stageIsArena||!input.reactive||!input.showDesignerEnabled||
    !input.showDirectorEnabled||!input.outerStageEnabled)return off();
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.performanceTier==='low')return off('quality');
 if(input.manualDeckMode!=='auto')return off('manual');
 const ms=input.progressMs,duration=input.durationMs;
 if(!Number.isFinite(ms)||!Number.isFinite(duration)||(ms??-1)<0||
   (duration??0)<30000||(duration??0)>1800000||(ms??0)>(duration??0))return off('clock');
 const show=input.show;
 if(!show?.active||typeof show.scene!=='string'||!(show.scene in formations)||!Number.isFinite(show.intensity)||
   !Number.isFinite(show.fade)||show.fade<=0||show.fade>1||
   show.intensity<=0||show.intensity>100)return off('director');
 const strength=finite(input.strength,0,80,0);
 if(strength<=0)return off();
 const tierGain=input.performanceTier==='balanced'?.65:1;
 const amount=finite(strength/80*show.intensity/100*show.fade*tierGain,0,1,0);
 const accent=input.beat===true&&finite(input.beatStrength,0,1,0)>=.75?
  finite(input.beatStrength,0,1,0)*finite(input.energy,0,1,0)*.16:0;
 return {active:true,reason:'planned',formation:formations[show.scene as ArenaShowSceneV1040],
  amount,phase:finite((ms??0)/(duration??1),0,1),accent,
  slots:input.performanceTier==='balanced'?6:8};
}
/** Fixed safe envelope 3.98..4.14 metres outside the 3.665-metre petals.
 * The three 0.72m sections remain scenic; nothing supports an avatar.
 */
export function sampleStageArchitectureV1082(
 index:number,count:number,cue:ArchitectureCueV1082,out:ArchitectureSampleV1082):void{
 if(!cue?.active||!Number.isInteger(index)||!Number.isInteger(count)||count<1||count>8||
   index<0||index>=count||!Number.isFinite(cue.amount)||cue.amount<=0||cue.amount>1||
   !Number.isFinite(cue.phase)||cue.phase<0||cue.phase>1){
  Object.assign(out,REST_ARCHITECTURE_V1082);return;
 }
 const angle=Math.PI*2*index/count;
 const phase=cue.phase*Math.PI*2;
 const alternate=index%2===0?1:-1;
 const sweep=.5+.5*Math.sin(angle*2+phase*2.25);
 let height=.5,rise=.15,twist=0,glow=.32;
 switch(cue.formation){
  case 'gate':height=index%2===0?.62:.33;rise=.1;twist=.05*alternate;glow=.40;break;
  case 'arcade':height=.62;rise=.16+.10*sweep;twist=.02*alternate;glow=.4;break;
  case 'staircase':height=.34+.47*(index/Math.max(1,count-1));rise=.10+.26*sweep;
   twist=.06*alternate;glow=.62;break;
  case 'terraces':height=.65+.13*sweep;rise=.28+.20*sweep;
   twist=.07*alternate;glow=.74;break;
  case 'colonnade':height=.33;rise=.05;glow=.23;break;
  case 'crown':height=index%2===0?1:.75;rise=index%2===0?.45:.30;
   twist=.09*alternate;glow=.87;break;
  default:Object.assign(out,REST_ARCHITECTURE_V1082);return;
 }
 const a=cue.amount;
 out.radius=finite(4.04+.10*a*Math.sin(angle*3+phase),3.98,4.14,4.04);
 out.rise=finite(rise*.42*a,0,.22,0);
 out.height=finite(.38+height*.44*a,.38,.84,.38);
 out.glow=finite(.10+glow*.44*a+finite(cue.accent,0,.16,0)*.4,.1,.65,.1);
 out.twist=finite(twist*a,-.09,.09,0);
}
/** One bounded interpolation; scene animation never owns an independent timer. */
export function stepArchitectureV1082(previous:ArchitectureSampleV1082,target:ArchitectureSampleV1082,
 delta:number,settings:{playing:boolean;reducedMotion:boolean;enabled:boolean}):ArchitectureSampleV1082{
 if(!settings.enabled||settings.reducedMotion)return {...REST_ARCHITECTURE_V1082};
 const safe:ArchitectureSampleV1082={
  radius:finite(previous.radius,3.98,4.14,4.04),rise:finite(previous.rise,0,.22,0),
  height:finite(previous.height,.38,.84,.38),glow:finite(previous.glow,.10,.65,.1),
  twist:finite(previous.twist,-.09,.09,0),
 };
 if(!settings.playing)return safe;
 const alpha=1-Math.exp(-finite(delta,0,.10,0)*3.5);
 return {
  radius:finite(safe.radius+(finite(target.radius,3.98,4.14,4.04)-safe.radius)*alpha,3.98,4.14,4.04),
  rise:finite(safe.rise+(finite(target.rise,0,.22,0)-safe.rise)*alpha,0,.22,0),
  height:finite(safe.height+(finite(target.height,.38,.84,.38)-safe.height)*alpha,.38,.84,.38),
  glow:finite(safe.glow+(finite(target.glow,.1,.65,.1)-safe.glow)*alpha,.1,.65,.1),
  twist:finite(safe.twist+(finite(target.twist,-.09,.09,0)-safe.twist)*alpha,-.09,.09,0),
 };
}
