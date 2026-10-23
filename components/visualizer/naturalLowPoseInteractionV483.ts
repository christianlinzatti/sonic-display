/** V483 – bounded, synchronized low-pose GROUP interaction.
 * A tiny four-slot state adds staggered release and head/shoulder responses to
 * V481's authored-safe plan. V482 remains responsible for actual leg easing.
 * No singer inference, rig/clip edits, root translations or extra clocks.
 */
import type {LowPoseModeV481,LowPosePlanV481} from './intelligentLowPoseV481';
import type {LookAtCue} from './partnerLookAtEngine';
import type {PartnerGestureCue} from './partnerGestureEngine';

export interface LowInteractionInputV483 {
  plan:LowPosePlanV481;
  positions:readonly (readonly [number,number,number])[];
  count:number;trackId?:string|null;seconds:number;cueSeconds:number;
  focus:number;drop:boolean;beat:number;energy:number;
  playing:boolean;reducedMotion:boolean;manualPriority:boolean;
  automaticGroup:boolean;lyricsForeground:boolean;enabled:boolean;
  tier:'high'|'balanced'|'low';maxConcurrent:number;
}
export interface LowInteractionSlotV483 {
  look:LookAtCue;gesture:PartnerGestureCue;
}
export type LowInteractionStateV483={
  trackId:string;lastSeconds:number;
  releaseAt:number[];heldDepth:number[];heldMode:LowPoseModeV481[];synchronizedDrop:boolean;
};
export type LowInteractionResultV483={
  active:boolean;slots:LowInteractionSlotV483[];plan:LowPosePlanV481;
};
const clamp=(n:number,lo:number,hi:number)=>Number.isFinite(n)?Math.max(lo,Math.min(hi,n)):lo;
const smooth=(n:number)=>{const x=clamp(n,0,1);return x*x*(3-2*x);};
const neutral=():LowInteractionSlotV483=>({look:{yaw:0,pitch:0,eyeYaw:0,weight:0},gesture:{leftLift:0,rightLift:0,shoulder:0,lean:0,intensity:0}});
export function newLowInteractionStateV483():LowInteractionStateV483{
  return {trackId:'',lastSeconds:-1,releaseAt:[-1,-1,-1,-1],heldDepth:[0,0,0,0],heldMode:['stand','stand','stand','stand'],synchronizedDrop:false};
}
export function resetLowInteractionV483(state:LowInteractionStateV483):void{
  state.synchronizedDrop=false;
  for(let i=0;i<4;i++){state.releaseAt[i]=-1;state.heldDepth[i]=0;state.heldMode[i]='stand';}
}
/** Mutates only the fresh V481 plan's slot depths. Stagger is limited to 240ms
 * while a previous automatic group pose exits; a manual command always cancels.
 * Never exceeds the configured concurrent-pose count when entering a new cue.
 */
export function stepLowInteractionV483(state:LowInteractionStateV483,input:LowInteractionInputV483):LowInteractionResultV483{
  const {plan,count}=input;
  const blank=():LowInteractionResultV483=>({active:false,plan,slots:Array.from({length:Math.max(0,Math.min(4,count||0))},neutral)});
  const id=input.trackId?.trim()??'';
  const seek=Number.isFinite(input.seconds)&&state.lastSeconds>=0&&input.seconds<state.lastSeconds-.12;
  const switched=id!==state.trackId||seek;
  if(switched){resetLowInteractionV483(state);state.trackId=id;}
  const allowed=input.enabled&&input.automaticGroup&&input.playing&&!input.reducedMotion&&
    !input.manualPriority&&!input.lyricsForeground&&id.length>0&&
    (count===3||count===4)&&plan.slots.length===count&&input.positions.length>=count&&
    Number.isFinite(input.seconds)&&input.seconds>=0&&
    Number.isFinite(input.cueSeconds)&&input.cueSeconds>=0&&
    Number.isFinite(input.beat)&&Number.isFinite(input.energy)&&
    input.positions.slice(0,count).every(p=>p&&p.length>=3&&p.every(Number.isFinite));
  if(!allowed){resetLowInteractionV483(state);state.lastSeconds=Number.isFinite(input.seconds)?input.seconds:-1;return blank();}
  state.lastSeconds=input.seconds;
  const gain=input.tier==='low'?.40:input.tier==='balanced'?.72:1;
  const beat=clamp(input.beat,0,1),energy=clamp(input.energy,0,1);
  const available=Math.max(0,Math.floor(clamp(input.maxConcurrent,1,count))-
    plan.slots.filter(s=>s.depth>.001).length);
  const activeCount=plan.slots.filter(s=>s.depth>.001).length;
  // V481 explicitly permits an all-dancer synchronized drop even when the
  // normal maxConcurrent is 2. Let only that PREVIOUS, now-ending drop finish
  // its <=240ms release. Any newly active formation always takes precedence.
  const allowGroupExit=activeCount===0&&state.synchronizedDrop;
  let releaseBudget=allowGroupExit?count:available;
  if(activeCount>0)state.synchronizedDrop=input.drop&&activeCount>input.maxConcurrent;
  // On a documented shared drop the dancers descend together; on recovery,
  // alternating adjacent slots start standing up 120–240 ms apart.
  const dropExit=state.heldDepth.filter(d=>d>.001).length>=2;
  for(let i=0;i<count;i++){
    const slot=plan.slots[i];
    if(slot.depth>.001){
      state.heldDepth[i]=clamp(slot.depth,0,.58);
      state.heldMode[i]=slot.mode;
      state.releaseAt[i]=-1;
      continue;
    }
    if(state.heldDepth[i]<=.001){state.releaseAt[i]=-1;continue;}
    if(state.releaseAt[i]<0)state.releaseAt[i]=input.seconds;
    const delay=dropExit?((i%2)*.12+Math.floor(i/2)*.06):0;
    const elapsed=input.seconds-state.releaseAt[i];
    // Any new active plan has priority and the cap is never exceeded.
    if(releaseBudget>0&&elapsed>=0&&elapsed<delay){
      slot.depth=state.heldDepth[i];slot.mode=state.heldMode[i];releaseBudget--;
    }else if(elapsed>=delay){state.heldDepth[i]=0;state.heldMode[i]='stand';state.releaseAt[i]=-1;}
  }
  let any=false;
  const accents=Array.from({length:count},(_,i):LowInteractionSlotV483=>{
    const self=plan.slots[i];
    if(self.depth<=.001)return neutral();
    any=true;
    const focus=Number.isInteger(input.focus)&&input.focus>=0&&input.focus<count?input.focus:0;
    // Prefer a fellow lowered dancer; otherwise briefly acknowledge the lead.
    const partner=(i%2===0?i+1:i-1);
    const target=partner<count&&plan.slots[partner].depth>.001?partner:focus!==i?focus:-1;
    const p=input.positions[i],other=target>=0?input.positions[target]:null;
    const dx=other?other[0]-p[0]:0,dz=other?other[2]-p[2]:0;
    const yaw=other?clamp(Math.atan2(dx,Math.max(1.5,2.8+dz)),-.42,.42):0;
    const depth=smooth(self.depth/.42);
    const response=gain*depth*(.32+.38*beat+.30*energy);
    // Group drops initially remain audience-facing; mutual glances peak as
    // the low pose settles. No repeated large head turns on every kick.
    const since=Math.max(0,input.seconds-input.cueSeconds);
    const settle=smooth(since/.46);
    const lookStrength=response*settle;
    const look:LookAtCue={
      yaw:clamp(yaw*.25*lookStrength,-.095,.095),
      pitch:clamp((other&&plan.slots[target].depth>self.depth?.010:-.014)*lookStrength,-.02,.02),
      eyeYaw:clamp(yaw*.075*lookStrength,-.036,.036),
      weight:clamp(.12*lookStrength,0,.12),
    };
    const alternating=i%2===0;
    const gesture:PartnerGestureCue={
      leftLift:(alternating?.038:.015)*response,
      rightLift:(alternating?.015:.038)*response,
      shoulder:clamp(.025*response,0,.025),
      lean:clamp((alternating?-.012:.012)*response,-.012,.012),
      intensity:clamp(.07*response,0,.07),
    };
    return {look,gesture};
  });
  if(!any)state.synchronizedDrop=false;
  if(any&&!plan.active){plan.active=true;plan.source='automatic-stage';}
  return {active:any,slots:accents,plan};
}
