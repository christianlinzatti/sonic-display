/** V458: expressive, bounded enhancements of the *existing* V452 crew cue.
 * No new animation clocks, inferred singer identity, GLB clip edits or extra React renders.
 * Every value is evaluated from playback time and the existing stage formation.
 */
import type {CrewAccentPlanV452, CrewAccentSlotV452} from './advancedMultiAvatarPerformanceV452';

export type DancePerformanceTierV458='high'|'balanced'|'low';
export interface NaturalCrewInputV458 {
  seconds:number; cueSeconds:number;
  beat:number; energy:number;
  positions:readonly (readonly number[])[];
  quality:DancePerformanceTierV458;
  /** Existing contact-IK/foot-lock takes priority over any extra root movement. */
  footLocked:boolean;
}
const clamp=(v:number,lo:number,hi:number)=>Number.isFinite(v)?Math.max(lo,Math.min(hi,v)):lo;
const smooth=(v:number)=>{const t=clamp(v,0,1);return t*t*(3-2*t);};
const roundTrip=(a:number,b:number)=>Math.hypot(a,b);

/** Refine a safe V452 plan: tiny shoulder/hand call-and-response and weight-shift
 * cues while preserving shared hook spacing and preventing root drift near partners.
 * The caller retains V452's pause/manual/reduced-motion gates.
 */
export function refineNaturalCrewV458(
  base:CrewAccentPlanV452,input:NaturalCrewInputV458,
):CrewAccentPlanV452 {
  if(!base.active||base.slots.length<2||base.slots.length>4||
    !Number.isFinite(input.seconds)||input.seconds<0||!Number.isFinite(input.cueSeconds)||
    !Number.isFinite(input.beat)||!Number.isFinite(input.energy)||
    input.positions.length<base.slots.length||
    !input.positions.slice(0,base.slots.length).every(p=>p?.length>=3&&p.slice(0,3).every(Number.isFinite))) return base;
  // The cue fade prevents a jump at a new automatic phrase. On a seek, all
  // values depend only on the *new* timestamp, never the previously played song.
  const elapsed=Math.max(0,input.seconds-input.cueSeconds);
  const fade=smooth(elapsed/.55);
  const quality=input.quality==='low'?.2:input.quality==='balanced'?.58:1;
  const strength=quality*fade*(.17+.48*clamp(input.beat,0,1)+.35*clamp(input.energy,0,1));
  if(strength<=0)return base;
  const phase=elapsed/2.6*Math.PI*2;
  const sway=Math.sin(phase);
  const accent=Math.pow(Math.max(0,Math.sin(phase)),2);
  const reply=Math.pow(Math.max(0,Math.sin(phase-Math.PI*.88)),2);
  // Avoid moving feet or squeezing existing formations. Since V452 already has
  // a tiny offset, normalize total position offsets rather than adding drift.
  let minGap=Infinity;
  for(let i=0;i<base.slots.length;i++)for(let j=i+1;j<base.slots.length;j++){
    const a=input.positions[i],b=input.positions[j];
    minGap=Math.min(minGap,roundTrip(a[0]-b[0],a[2]-b[2]));
  }
  const rootGain=input.footLocked?0:smooth((minGap-1.35)/.55);
  const isHook=base.mode==='hook';
  const count=base.slots.length;
  const slots=base.slots.map((old,i):CrewAccentSlotV452=>{
    const lead=i===base.lead;
    const responder=!isHook&&base.lead!==null&&i===(base.lead+1)%count;
    const supporting=!isHook&&!lead&&!responder;
    const pulse=isHook?accent:lead?accent:responder?reply:reply*.3;
    const movement=strength*pulse;
    const gesture={...old.gesture,
      // Never force large movements over imported motions / hand contact.
      leftLift:clamp(old.gesture.leftLift+(isHook?.016:responder?.026:.008)*movement,0,.14),
      rightLift:clamp(old.gesture.rightLift+(isHook?.016:lead?.029:.006)*movement,0,.14),
      shoulder:clamp(old.gesture.shoulder+(.015*sway*strength)*(isHook?1:lead?1:responder?-.7:.35),-.09,.09),
      lean:clamp(old.gesture.lean+(isHook?0:lead?-.013:responder?.010:.004)*movement,-.035,.035),
      intensity:clamp(old.gesture.intensity+.047*movement,0,.3),
    };
    const look={...old.look,
      // Group nods are shared; the verse listener response lags the lead.
      pitch:clamp(old.look.pitch-.017*(isHook?accent:lead?accent:responder?reply:reply*.15)*strength,-.07,.07),
      weight:clamp(old.look.weight+(supporting?.03:responder?.06:.035)*movement,0,.5),
    };
    // For a hook all roots get EXACTLY the same X/Z displacement; in a verse
    // only the lead takes a tiny forward weight shift. Contact lock = no roots.
    const sharedX=isHook?sway*.012*strength*rootGain:0;
    const offsetX=input.footLocked?0:clamp((isHook?old.offsetX:0)*rootGain+sharedX,-.055,.055);
    const offsetZ=input.footLocked?0:clamp((isHook?old.offsetZ:lead?old.offsetZ:0)*rootGain+
      (isHook?-.005*movement:lead?-.012*movement:0)*rootGain,-.057,.01);
    const turnY=clamp(old.turnY+(isHook?0:responder?-.010*reply*strength:lead?.008*accent*strength:0),-.06,.06);
    return {...old,offsetX,offsetZ,turnY,gesture,look};
  });
  return {...base,slots};
}
