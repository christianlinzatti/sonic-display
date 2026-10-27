/** V609: one deterministic song-time envelope for existing camera, lighting and
 * auto-only group transitions. No fabricated sections, no clocks, no render loops.
 * An explicit cut or an authored lane always keeps its original behavior.
 */
import type {NarrativePlanV604,NarrativeCueV604} from './fullSongConcertDramaturgyV604';
import type {GroupStudioV326} from './multiAvatarStageDirectorV326';

export type ConcertTransitionContextV609={
  narrative?:{plan:NarrativePlanV604;cue:NarrativeCueV604}|null;
  trackId:string;positionMs:number;playing:boolean;reducedMotion:boolean;
  tier:'low'|'balanced'|'high';manualCamera:boolean;manualLighting:boolean;
};
export type ConcertTransitionEnvelopeV609={active:boolean;act:number;edge:'entry'|'exit'|'middle'|'off';
  /** Multipliers for EXISTING per-frame exponential easing rates (not camera poses). */
  cameraRate:number;lightingRate:number;};
const off:ConcertTransitionEnvelopeV609={active:false,act:-1,edge:'off',cameraRate:1,lightingRate:1};
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
const smooth=(v:number)=>{const x=clamp(v,0,1);return x*x*(3-2*x);};
const finite=(v:number)=>Number.isFinite(v);

export function planSeamlessConcertTransitionV609(input:ConcertTransitionContextV609):ConcertTransitionEnvelopeV609{
  const plan=input.narrative?.plan,cue=input.narrative?.cue;
  if(!input.playing||input.reducedMotion||input.tier==='low'||
    !plan||plan.source!=='verified-v600'||!cue?.active||cue.source!=='verified-v600'||
    !input.trackId||plan.trackId!==input.trackId||!finite(input.positionMs)||
    input.positionMs<0||input.positionMs>=plan.durationMs||!Number.isInteger(cue.act)||
    cue.act<0||cue.act>=plan.acts.length||!finite(cue.transition)||
    cue.transition<0||cue.transition>1||(input.manualCamera&&input.manualLighting))return off;
  const act=plan.acts[cue.act];
  if(act.index!==cue.act||cue.chapter!==act.chapter||cue.motif!==act.motif||
    cue.repetition!==act.repetition||act.endMs<=act.startMs||
    input.positionMs<act.startMs||input.positionMs>=act.endMs)return off;
  const duration=act.endMs-act.startMs;
  // Only near adjacent, explicitly supported *contiguous* acts. Genuine gaps
  // or first/last song boundaries must not invent a scene change.
  const previous=plan.acts[cue.act-1],next=plan.acts[cue.act+1];
  const entry=!!previous&&previous.endMs===act.startMs;
  const exit=!!next&&next.startMs===act.endMs;
  if(!entry&&!exit)return off;
  const windowMs=Math.min(1800,duration*.23);
  const fromStart=input.positionMs-act.startMs;
  const toEnd=act.endMs-input.positionMs;
  const isEntry=entry&&fromStart<windowMs;
  const isExit=exit&&toEnd<windowMs;
  // Deliberately avoid sudden jumps in rate at the *exact* act boundary.
  const distance=Math.min(isEntry?fromStart:Infinity,isExit?toEnd:Infinity);
  const proximity=Number.isFinite(distance)?1-smooth(distance/windowMs):0;
  const strength=proximity*(input.tier==='balanced'?.66:1);
  const rate=(min:number,manual:boolean)=>manual?1:Math.round((1-(1-min)*strength)*100000)/100000;
  return {active:true,act:cue.act,edge:isEntry?'entry':isExit?'exit':'middle',
    cameraRate:rate(.62,input.manualCamera),lightingRate:rate(.58,input.manualLighting)};
}

/** Only automatically emitted 3/4-avatar cues, already track-bound and
 * song-synchronised, may have their existing smoothstep blend extended.
 * A zero-duration authored/hard-cut cue stays zero. No timestamps, focus,
 * clip actions, singer assignments or positions are changed.
 */
export function refineAutoGroupTransitionsV609(group:GroupStudioV326|null,
  plan:NarrativePlanV604,opts:{enabled:boolean;reducedMotion:boolean;tier:'low'|'balanced'|'high'}):GroupStudioV326|null{
  if(!group||!opts.enabled||opts.reducedMotion||opts.tier==='low'||
    plan.source!=='verified-v600'||plan.trackId!==group.trackId||
    !group.enabled||!group.songSync||![3,4].includes(group.count)||
    group.cues.length<2||group.cues.length>64||
    !group.cues.every(c=>/^(auto-v442-|v446-)/.test(c.id)))return group;
  let changed=false;
  const cues=group.cues.map((c,i)=>{
    if(i===0||c.drop||!finite(c.transition)||c.transition<=0||!finite(c.at))return c;
    const previous=group.cues[i-1],next=group.cues[i+1];
    const atMs=c.at*1000;
    if(!plan.acts.some(a=>atMs>=a.startMs&&atMs<a.endMs))return c;
    const gap=next?Math.max(0,next.at-c.at):Infinity;
    const max=Math.min(1.7,Math.max(0,c.at-previous.at)*.48,gap*.45);
    const candidate=Math.min(max,c.transition+(opts.tier==='balanced'?.18:.32));
    if(candidate<=c.transition+.0001)return c;
    changed=true;
    return {...c,transition:Math.round(candidate*1000)/1000};
  });
  return changed?{...group,cues}:group;
}
