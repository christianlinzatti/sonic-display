/** V485 – safe, deterministic dance/travel accents in existing automatic 3–4 avatar formations.
 * Only small stage-root offsets and a procedural step hint. No clip retargeting,
 * no new timing source, no collision-physics claim, and no singer detection.
 */
import type {LowPosePlanV481} from './intelligentLowPoseV481';

export type NaturalDanceSlotV485={offsetX:number;offsetZ:number;step:number;lean:number};
export type NaturalDanceModeV485='idle'|'passing'|'sidestep'|'drop'|'rejoin';
export type NaturalDanceMotionInputV485={
 plan:LowPosePlanV481; count:number; positions:readonly (readonly number[])[];
 focus:number; trackId?:string|null; seconds:number; cueSeconds:number;
 beat:number;kick:number;energy:number;genre?:string|null;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;lyricsForeground:boolean;
 automaticGroup:boolean;footLocked:boolean;tier:'high'|'balanced'|'low';
};
export type NaturalDanceMotionOutputV485={active:boolean;mode:NaturalDanceModeV485;slots:NaturalDanceSlotV485[]};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const zero=():NaturalDanceSlotV485=>({offsetX:0,offsetZ:0,step:0,lean:0});
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const round=(x:number)=>Math.round(x*100000)/100000;
/** A traveling dancer moves in front of, NOT through, a crouched partner.
 * Fixed dancer identity and lane order prevent root swapping and preserve the
 * existing stage spacing. There is no assumption of model collision volumes.
 */
export function planNaturalDanceMotionV485(input:NaturalDanceMotionInputV485):NaturalDanceMotionOutputV485{
 const {count}=input;
 const slots=Array.from({length:Number.isInteger(count)?clamp(count,0,4):0},zero);
 const idle=():NaturalDanceMotionOutputV485=>({active:false,mode:'idle',slots});
 if((count!==3&&count!==4)||!input.trackId?.trim()||!input.playing||input.reducedMotion||
   input.manualPriority||input.lyricsForeground||!input.automaticGroup||input.footLocked||
   input.tier==='low'||input.plan.source!=='automatic-stage'||!input.plan.active||
   input.plan.slots.length!==count||input.positions.length<count||
   ![input.seconds,input.cueSeconds,input.beat,input.kick,input.energy,input.focus].every(Number.isFinite)||
   input.seconds<input.cueSeconds||input.cueSeconds<0||input.beat<0||input.kick<0||input.energy<0||
   input.focus<0||input.focus>=count||!Number.isInteger(input.focus)||
   input.positions.slice(0,count).some(p=>!p||p.length<3||!p.every(Number.isFinite)))return idle();
 const lowered=input.plan.slots.map(s=>s.depth>.035);
 if(!lowered.some(Boolean)||input.energy<.32||Math.max(input.beat,input.kick)<.4)return idle();
 const gain=(input.tier==='balanced'?.62:1)*smooth((Math.max(input.beat,input.kick)-.34)/.55)*
   (.65+.35*clamp(input.energy,0,1))*smooth((input.seconds-input.cueSeconds)/.42);
 if(gain<.001)return idle();
 // Five-second dance phrase: entry -> sidestep/passing -> return -> rest.
 // The 0-valued endpoints make seek/track changes deterministic without refs.
 const age=Math.max(0,input.seconds-input.cueSeconds);
 const cycle=5.2;
 const index=Math.floor(age/cycle);
 const local=age-index*cycle;
 const enter=smooth((local-.3)/.55);
 const leave=1-smooth((local-2.65)/1.05);
 const envelope=enter*leave;
 if(envelope<=.00001)return {active:false,mode:local>=2.65?'rejoin':'idle',slots};
 const standing=Array.from({length:count},(_,i)=>i).filter(i=>!lowered[i]);
 const crouched=Array.from({length:count},(_,i)=>i).filter(i=>lowered[i]);
 const rap=/rap|hip.?hop|trap|drill|deutsch/i.test(input.genre??'');
 const motion=round(envelope*gain);
 const moving=standing.length>0?standing[(index+input.focus)%standing.length]:-1;
 // Standing dancers sidestep while their neighbor is low. Do not perform a
 // stage-root step when all are crouched or on a low performance tier.
 if(moving>=0){
   let partner=-1,near=Number.POSITIVE_INFINITY;
   for(const i of crouched){const d=Math.abs(i-moving);if(d<near){near=d;partner=i;}}
   if(partner<0)return idle();
   const dir=partner>moving?1:-1;
   const nearPass=near===1;
   const step=motion*(.55+.45*Math.sin(local*Math.PI*1.6)**2);
   const safeX=(nearPass?.105:.055)*motion;
   const safeZ=(rap?.20:.15)*motion;
   slots[moving]={offsetX:round(dir*safeX),offsetZ:round(-safeZ),step:round(step),lean:round(-.025*motion)};
   if(nearPass)slots[partner]={offsetX:round(-dir*.032*motion),offsetZ:round(.035*motion),step:0,lean:round(.008*motion)};
 }else{
   // Shared drop: stay in original lanes; no side pass while every dancer is low.
   for(let i=0;i<count;i++)slots[i].lean=round((i%2?1:-1)*.012*motion);
 }
 // Safety: no optional translation if it reduces a pair's original root spacing
 // below 1.03m. This bounds centers, not GLB mesh/foot collision volumes.
 const minSpacing=1.03;
 for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
   const pi=input.positions[i],pj=input.positions[j];
   const original=Math.hypot(pi[0]-pj[0],pi[2]-pj[2]);
   const after=Math.hypot(pi[0]+slots[i].offsetX-pj[0]-slots[j].offsetX,
     pi[2]+slots[i].offsetZ-pj[2]-slots[j].offsetZ);
   if(original<minSpacing||after<minSpacing){
     // Opt out of new translations for crowded or incompatible formations;
     // do not modify original formation coordinates.
     for(const slot of slots)Object.assign(slot,zero());
     return idle();
   }
 }
 const active=slots.some(s=>Math.abs(s.offsetX)+Math.abs(s.offsetZ)+s.step+Math.abs(s.lean)>.00001);
 const mode:NaturalDanceModeV485=!active?'idle':moving<0?'drop':local>=2.65?'rejoin':
   Math.abs(slots[moving].offsetZ)>.0001?'passing':'sidestep';
 return {active,mode,slots};
}
