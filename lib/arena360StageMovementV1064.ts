/** V1064 – deterministic, bounded stage-zone choreography for existing V326 group roots.
 * Uses the V1040 planned clock; never detects new beats or invents singer roles.
 * A route changes depth within a fixed lane, not the slot's identity or rig/IK.
 */
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';
export type StagePathSlotV1064={x:number;z:number};
export type StagePathReasonV1064='disabled'|'paused'|'reduced-motion'|'manual'|'low-gpu'|'clock'|'show'|'planned';
export type StagePathCueV1064={active:boolean;reason:StagePathReasonV1064;chapter:string;slots:StagePathSlotV1064[]};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,a:number,b:number)=>Math.max(a,Math.min(b,n));
const ease=(n:number)=>{const v=clamp(n,0,1);return v*v*(3-2*v);};
const off=(reason:StagePathReasonV1064):StagePathCueV1064=>({active:false,reason,chapter:'off',slots:[]});
/** Each segment enters, holds and leaves its lane-local destination with ZERO
 * displacement at both ends; repeated song-time samples are deterministic.
 * The entire extra excursion stays <=8 cm sideways and <=16 cm in depth.
 */
export function planStageMovementV1064(input:{
 enabled:boolean;stageIsArena:boolean;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;performanceTier?:'low'|'balanced'|'high'|null;
 count:number;trackId?:string|null;progressMs?:number|null;durationMs?:number|null;
 show?:ArenaShowCueV1040|null;strength?:number|null;
}):StagePathCueV1064{
 if(!input.enabled||!input.stageIsArena)return off('disabled');
 if(!input.playing)return off('paused');
 if(input.reducedMotion)return off('reduced-motion');
 if(input.manualPriority)return off('manual');
 if(input.performanceTier==='low')return off('low-gpu');
 const {count,progressMs:ms,durationMs:duration,trackId}=input;
 if(!Number.isInteger(count)||count<2||count>4||!trackId?.trim()||
    !finite(ms)||!finite(duration)||duration<30000||ms<0||ms>duration)return off('clock');
 if(!input.show?.active||!finite(input.show.fade)||input.show.fade<=0||
    !finite(input.show.intensity)||input.show.intensity<=0)return off('show');
 if(!finite(input.strength)||input.strength<=0)return off('disabled');
 const chapter=input.show.scene;
 // Fixed 16 s motifs; no position jump at a segment boundary or song seek.
 const progress=(ms%16000)/16000;
 const envelope=ease((progress-.06)/.30)*(1-ease((progress-.70)/.25));
 const gain=clamp(input.strength,0,80)/80*clamp(input.show.fade,0,1)*
   clamp(input.show.intensity/100,0,1)*(input.performanceTier==='balanced'?.7:1)*envelope;
 const slots=Array.from({length:count},(_,i):StagePathSlotV1064=>{
  const lane=(i-(count-1)/2)/((count-1)/2);
  // V1064 NEVER swaps the x lanes. Front/back focus alternates by chapter,
  // permitting changes of foreground depth without a crossing trajectory.
  const lead=i===((Math.floor(ms/16000))%count);
  let x=0,z=0;
  switch(chapter){
   case 'intro': z=lead?-.08:0;break;
   case 'verse': z=lead?-.12:.025;break;
   case 'build': x=Math.sign(lane)*.055;z=lead?-.12:-.045;break;
   case 'hook': x=Math.sign(lane)*.065;z=lead?-.16:.04;break;
   case 'interlude': z=.08;break;
   case 'finale': x=Math.sign(lane)*.08;z=lead?-.16:-.08;break;
   default: z=0;
  }
  return {x:clamp(x*gain,-.08,.08),z:clamp(z*gain,-.16,.16)};
 });
 return {active:true,reason:'planned',chapter:chapter??'unclassified',slots};
}
/** Reject risky targets before adding any offsets to V326 group positions.
 * Existing V494 grounded observation and V508 collision forecasts are checked
 * independently in the runtime before this geometry gate is called.
 */
export function isSafeStageRouteV1064(base:readonly (readonly number[])[],slots:readonly StagePathSlotV1064[]):boolean{
 if(base.length<2||base.length>4||base.length!==slots.length)return false;
 const targets:{x:number;z:number}[]=[];
 for(let i=0;i<base.length;i++){
  const [x,y,z]=base[i];const s=slots[i];
  if(!finite(x)||!finite(y)||!finite(z)||!s||!finite(s.x)||!finite(s.z)||
     Math.abs(s.x)>.0800001||Math.abs(s.z)>.1600001)return false;
  const target={x:x+s.x,z:z+s.z};
  // Keep a reserve for existing V1063 formation and stage-blocking accents.
  if(Math.hypot(target.x,target.z)>2.75)return false;
  for(const prev of targets){
   if(Math.hypot(target.x-prev.x,target.z-prev.z)<1.05)return false;
  }
  targets.push(target);
 }
 return true;
}
/** Bound extra movement speed to <=14 cm/s using only the existing frame delta.
 * Never advances while observed feet are locked, collisions are predicted or
 * the song is paused. React renders or song seeks cannot teleport the root.
 */
export function stepStageTravelV1064(current:StagePathSlotV1064,target:StagePathSlotV1064,
 delta:number,mayMove:boolean):StagePathSlotV1064{
 if(!mayMove||!finite(delta)||delta<=0||delta>.2)return current;
 if(!finite(current.x)||!finite(current.z)||!finite(target.x)||!finite(target.z))return {x:0,z:0};
 const tx=clamp(target.x,-.08,.08),tz=clamp(target.z,-.16,.16);
 const dx=tx-current.x,dz=tz-current.z,dist=Math.hypot(dx,dz),limit=.14*delta;
 if(dist<=limit)return {x:tx,z:tz};
 return {x:current.x+dx/dist*limit,z:current.z+dz/dist*limit};
}
