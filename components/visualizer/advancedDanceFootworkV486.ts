/** V486 – conservative, deterministic footwork overlay for V485 stage travel.
 * Song-time cadence replaces render-clock leg stepping. Known planted feet can
 * slow OPTIONAL stage-root travel; IK, clips and manually authored cues remain
 * owned by the existing systems. No 3D contact/collision claim.
 */
import type {NaturalDanceMotionOutputV485} from './naturalDanceMotionStudioV485';

export type FootSupportV486={tracked:boolean;leftPlanted:boolean;rightPlanted:boolean};
export type FootworkSlotV486={offsetX:number;offsetZ:number;liftLeft:number;liftRight:number;rootSpeed:number;weightShift:number};
export type AdvancedFootworkInputV486={
 motion:NaturalDanceMotionOutputV485;count:number;seconds:number;cueSeconds:number;bpm?:number|null;
 playing:boolean;reducedMotion:boolean;manualPriority:boolean;footLocked:boolean;
 tier:'high'|'balanced'|'low';support:readonly FootSupportV486[];
};
export type AdvancedFootworkOutputV486={active:boolean;slots:FootworkSlotV486[]};
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const round=(n:number)=>Math.round(n*100000)/100000;
const zero=():FootworkSlotV486=>({offsetX:0,offsetZ:0,liftLeft:0,liftRight:0,rootSpeed:1,weightShift:0});
/** One grounded half-cycle followed by the other. Sine-squared lift starts and
 * ends at zero, avoiding an abrupt foot snap on cycle boundaries and seeks.
 */
function swing(phase:number,start:number){
 const local=(phase-start+1)%1;
 return local>=.5?0:Math.sin(Math.PI*local/.5)**2;
}
export function planAdvancedDanceFootworkV486(input:AdvancedFootworkInputV486):AdvancedFootworkOutputV486{
 const {count}=input;
 const slots=Array.from({length:Number.isInteger(count)?clamp(count,0,4):0},zero);
 const idle=():AdvancedFootworkOutputV486=>({active:false,slots});
 if((count!==3&&count!==4)||input.motion.slots.length!==count||
  !input.playing||input.reducedMotion||input.manualPriority||input.footLocked||input.tier==='low'||
  ![input.seconds,input.cueSeconds].every(Number.isFinite)||input.cueSeconds<0||input.seconds<input.cueSeconds||
  !input.motion.active||input.support.length<count||
  input.motion.slots.some(s=>![s.offsetX,s.offsetZ,s.step,s.lean].every(Number.isFinite)))return idle();
 // Only a real supplied BPM sets cadence; fallback uses an uncalibrated, mild
 // 2Hz motion pulse, NOT a claimed inferred beat timestamp.
 const cadence=Number.isFinite(input.bpm)&&input.bpm!>0?clamp(input.bpm!/60, .75,3.5):2;
 const age=input.seconds-input.cueSeconds;
 for(let i=0;i<count;i++){
  const motion=input.motion.slots[i];
  const plant=input.support[i];
  const phase=((age*cadence+i*.13)%1+1)%1;
  const leftSwing=swing(phase,0),rightSwing=swing(phase,.5);
  const step=clamp(motion.step,0,1)*(input.tier==='balanced'?.65:1);
  const liftLeft=round(step*leftSwing*(plant.tracked&&plant.leftPlanted?0:1));
  const liftRight=round(step*rightSwing*(plant.tracked&&plant.rightPlanted?0:1));
  const rootTravel=Math.abs(motion.offsetX)+Math.abs(motion.offsetZ)>.00001;
  // Actual, measured IK support is evaluated by the existing avatar IK. If
  // both feet are planted, substantially slow optional movement; don't block
  // the normal eventual return to the source formation outside this cue.
  const bothPlanted=plant.tracked&&plant.leftPlanted&&plant.rightPlanted;
  const rootSpeed=rootTravel?bothPlanted?.12:round(.48+.52*Math.max(liftLeft,liftRight)):1;
  slots[i]={
   offsetX:round(motion.offsetX*.9),offsetZ:round(motion.offsetZ*.9),
   liftLeft,liftRight,rootSpeed,
   weightShift:round(clamp((liftRight-liftLeft)*.014,-.014,.014)),
  };
 }
 return {active:slots.some(s=>Math.abs(s.offsetX)+Math.abs(s.offsetZ)+s.liftLeft+s.liftRight+Math.abs(s.weightShift)>.00001),slots};
}
