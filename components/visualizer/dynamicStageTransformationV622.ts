/** V622 – one evidence-bound, deterministic mood transform for the EXISTING stage.
 * The verified V604 act and playback are authoritative. No new scene loads,
 * camera cuts, actors, lights, clocks or texture allocations are introduced.
 */
import type {NarrativePlanV604,NarrativeCueV604,NarrativeActV604} from './fullSongConcertDramaturgyV604';

export type StageTransformationContextV622={
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;positionMs:number;durationMs:number;section:string|null|undefined;
  genre?:string|null;playing:boolean;reactive:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';authored:boolean;blackout:boolean;
  lyricsProtected:boolean;vocalFocus:boolean;
};
export type StageTransformationV622={active:boolean;act:number;blend:number;
  /** Warm/cool signed tint applied only to reusable environment materials. */
  tone:number;accent:number;background:number;floor:number;fog:number;};
export const NEUTRAL_STAGE_TRANSFORMATION_V622:Readonly<StageTransformationV622>=Object.freeze({
  active:false,act:-1,blend:0,tone:0,accent:0,background:0,floor:0,fog:0,
});
const finite=(x:unknown):x is number=>typeof x==='number'&&Number.isFinite(x);
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const smooth=(x:number)=>{const y=clamp(x,0,1);return y*y*(3-2*y);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const round=(v:number)=>Math.round(v*100000)/100000;

type Mood={tone:number;accent:number;background:number;floor:number;fog:number};
function moodForAct(a:NarrativeActV604,genre:string|null|undefined):Mood{
  const hard=genre==='hardstyle'||genre==='hardtekk';
  const warmGenre=genre==='rock'||genre==='pop';
  const tone=a.section==='break'?-0.85:a.section==='build'?.60:
    a.section==='drop'?(genre==='hardtekk'?-0.55:.87):
    a.section==='hook'?(a.repetition%2===0?(warmGenre?.52:-.46):.64):
    warmGenre?.22:-.30;
  // Darker breaks, energetic but bounded refrains. Nothing pulses independently.
  const accent=a.section==='break'?.15:a.section==='verse'?.27:
    a.section==='build'?.52:a.section==='drop'?(hard?.78:.59):.55;
  const sceneGain=a.chapter==='ending-arc'?1.06:a.chapter==='setup'?.75:1;
  return {tone,accent:accent*sceneGain,
    background:(a.section==='break'?.075:a.section==='verse'?.08:.14)*sceneGain,
    floor:(a.section==='break'?.055:a.section==='verse'?.075:.16)*sceneGain,
    fog:a.section==='break'?.54:a.section==='verse'?.18:
      a.section==='build'?.13:a.section==='hook'?.05:-.12};
}
/** Smooth interpolation in a window straddling the true contiguous act border.
 * Entry and exit compute the same mood at the exact boundary. Gaps never crossfade.
 */
function interpolatedMood(plan:NarrativePlanV604,act:NarrativeActV604,positionMs:number,genre?:string|null):Mood{
  const current=moodForAct(act,genre);
  const previous=plan.acts[act.index-1],next=plan.acts[act.index+1];
  const blend=(other:NarrativeActV604,t:number):Mood=>{
    const otherMood=moodForAct(other,genre);
    return {tone:lerp(otherMood.tone,current.tone,t),
      accent:lerp(otherMood.accent,current.accent,t),
      background:lerp(otherMood.background,current.background,t),
      floor:lerp(otherMood.floor,current.floor,t),fog:lerp(otherMood.fog,current.fog,t)};
  };
  if(previous&&previous.endMs===act.startMs){
    const width=Math.min(1600,(act.endMs-act.startMs)*.24,(previous.endMs-previous.startMs)*.24);
    if(positionMs-act.startMs<width)return blend(previous,.5+.5*smooth((positionMs-act.startMs)/width));
  }
  if(next&&next.startMs===act.endMs){
    const width=Math.min(1600,(act.endMs-act.startMs)*.24,(next.endMs-next.startMs)*.24);
    if(act.endMs-positionMs<width){
      const neighbor=moodForAct(next,genre);
      const t=.5-.5*smooth((act.endMs-positionMs)/width);
      return {tone:lerp(current.tone,neighbor.tone,t),accent:lerp(current.accent,neighbor.accent,t),
        background:lerp(current.background,neighbor.background,t),
        floor:lerp(current.floor,neighbor.floor,t),fog:lerp(current.fog,neighbor.fog,t)};
    }
  }
  return current;
}

export function planDynamicStageTransformationV622(input:StageTransformationContextV622):StageTransformationV622{
  const plan=input.narrative?.plan,cue=input.narrative?.cue;
  if(!input.playing||!input.reactive||input.reducedMotion||input.tier==='low'||input.authored||input.blackout||
    !plan||plan.source!=='verified-v600'||!cue?.active||cue.source!=='verified-v600'||
    !input.trackId||input.trackId!==plan.trackId||!finite(input.durationMs)||
    input.durationMs!==plan.durationMs||!finite(input.positionMs)||input.positionMs<0||
    input.positionMs>=plan.durationMs||!Number.isInteger(cue.act)||
    cue.act<0||cue.act>=plan.acts.length||!finite(cue.transition)||cue.transition<0||cue.transition>1)return {...NEUTRAL_STAGE_TRANSFORMATION_V622};
  const act=plan.acts[cue.act];
  if(act.index!==cue.act||act.section!==input.section||cue.chapter!==act.chapter||
    cue.motif!==act.motif||cue.repetition!==act.repetition||
    !finite(act.startMs)||!finite(act.endMs)||act.endMs<=act.startMs||
    input.positionMs<act.startMs||input.positionMs>=act.endMs)return {...NEUTRAL_STAGE_TRANSFORMATION_V622};
  const mood=interpolatedMood(plan,act,input.positionMs,input.genre);
  const weight=cue.transition*(input.tier==='balanced'?.62:1)*
    (input.lyricsProtected?.45:1)*(input.vocalFocus?.72:1);
  return {active:true,act:cue.act,blend:round(weight),tone:round(mood.tone),
    accent:round(clamp(mood.accent*weight,0,.82)),
    background:round(clamp(mood.background*weight,0,.16)),
    floor:round(clamp(mood.floor*weight,0,.18)),
    fog:round(clamp(mood.fog*weight,-.18,.58))};
}
