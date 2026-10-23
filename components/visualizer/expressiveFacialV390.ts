/** V390: deterministic, lyric-aware micro-expression layer. Does not infer audio phonemes. */
export type ExpressiveFaceV390 = {blink:number;brow:number;smile:number;squint:number;headPitch:number;headYaw:number};
const unit=(n:number)=>Number.isFinite(n)?Math.max(0,Math.min(1,n)):0;
const smooth=(x:number)=>x*x*(3-2*x);
/** A short, nonperiodic-looking eyelid closure with a reproducible per-avatar phase. */
export function expressiveFaceV390(input:{timeSeconds:number;slot?:number;playing:boolean;active:boolean;strength?:number;reducedMotion?:boolean;rap?:boolean;energy?:number;phrase?:number}):ExpressiveFaceV390{
  const off={blink:0,brow:0,smile:0,squint:0,headPitch:0,headYaw:0};
  if(!input.active||input.reducedMotion)return off;
  const time=Number.isFinite(input.timeSeconds)?Math.max(0,input.timeSeconds):0;
  const slot=Math.max(0,Math.floor(input.slot??0));
  const amount=unit((input.strength??45)/100);
  const energy=unit(input.energy??0);const phrase=unit(input.phrase??0);
  // Paused media keeps a relaxed pose instead of introducing new rhythmic motion.
  if(!input.playing)return {...off,brow:.045*amount};
  const period=3.15+(slot%4)*.43;
  const phase=((time+(slot*1.317))%period+period)%period;
  const blinkStart=period-.19;
  const bl=phase>=blinkStart?Math.sin(Math.PI*(phase-blinkStart)/.19):0;
  const secondary=Math.sin(time*.53+slot*2.13);
  const emphasis=smooth(phrase);
  return {blink:unit(bl*amount*.92),brow:unit((.08+.17*emphasis+.13*energy+.065*secondary)*amount),smile:unit((input.rap?.055:.12)*amount*(.35+.65*phrase)),squint:unit((.045+.11*energy)*amount),headPitch:(.014*Math.sin(time*1.12+slot*.9)+.022*emphasis)*amount,headYaw:.018*Math.sin(time*.71+slot*1.39)*amount};
}
