/** V1063 – bounded formation accents for the EXISTING duo/group stage roots.
 * A deterministic visual composition, not new beat, singer or foot detection.
 * Stable slot identity: no crossings, rig edits, singer reassignment or new clocks.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type EnsembleShapeV1063='line'|'fan'|'arc'|'diagonal';
export type EnsembleSlotV1063={spreadX:number;depth:number;turnY:number};
export type EnsembleCueV1063={active:boolean;reason:'disabled'|'paused'|'motion'|'manual'|'performance'|'ground'|'collision'|'clock'|'show'|'planned';
 shape:EnsembleShapeV1063;focusSlot:number;phase:number;slots:EnsembleSlotV1063[]};
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const off=(reason:EnsembleCueV1063['reason']):EnsembleCueV1063=>({active:false,reason,shape:'line',focusSlot:0,phase:0,slots:[]});
const smooth=(n:number)=>{const t=clamp(n,0,1);return t*t*(3-2*t);};
/** The existing animator/footlock/collision systems retain absolute priority.
 * Room to spread is deliberately small (<=11 cm per person); paths never
 * swap left-to-right order, and the group center remains in its previous spot.
 */
export function planEnsembleChoreographyV1063(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;footLocked:boolean;collisionRisk:boolean;
 performanceTier?:'low'|'balanced'|'high'|null;reactive?:boolean;
 count:number;trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 show?:ArenaShowCueV1040|null;strength?:number|null;
}):EnsembleCueV1063{
 if(!input.enabled||!input.stageIsArena||input.reactive===false)return off('disabled');
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('motion');
 if(input.manualPriority)return off('manual');
 if(input.performanceTier==='low')return off('performance');
 if(input.footLocked)return off('ground');
 if(input.collisionRisk)return off('collision');
 const {trackId,progressMs:ms,durationMs:total,count}=input;
 if(!trackId?.trim()||!finite(ms)||!finite(total)||total<30000||ms<0||ms>total||!Number.isInteger(count)||count<2||count>4)return off('clock');
 if(!input.show?.active||input.show.fade<=0||input.show.intensity<=0)return off('show');
 if(!finite(input.strength)||input.strength<=0)return off('disabled');
 const strength=clamp(input.strength,0,80)/100*(input.performanceTier==='balanced'?.65:1);
 const phase=Math.floor(ms/12000);
 const focusSlot=phase%count;
 const style:EnsembleShapeV1063=input.show.scene==='interlude'?'arc':
   input.show.scene==='hook'||input.show.scene==='finale'?'fan':
   input.show.scene==='build'?'diagonal':'line';
 const sectionGain=style==='fan'?1:style==='arc'?.5:style==='diagonal'?.7:.35;
 const fade=smooth((ms%12000)/700)*clamp(input.show.fade,0,1)*clamp(input.show.intensity/100,0,1);
 const spread=clamp(.11*strength*sectionGain*fade,0,.11);
 const depth=clamp(.07*strength*fade,0,.07);
 const turn=clamp(.17*strength*fade,0,.17);
 const slots=Array.from({length:count},(_,i):EnsembleSlotV1063=>{
  const normalized=(i-(count-1)/2)/((count-1)/2);
  // Positive spread only expands existing lanes, never causes left/right crossing.
  const spreadX=normalized*spread;
  const z=style==='fan'?-depth*(1-Math.abs(normalized)):
    style==='arc'?depth*(1-Math.abs(normalized)):style==='diagonal'?normalized*depth:0;
  const turnY=(focusSlot===i?0:i<focusSlot?turn:-turn);
  return {spreadX,depth:z,turnY};
 });
 return {active:true,reason:'planned',shape:style,focusSlot,phase,slots};
}
