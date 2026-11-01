/** V783 – bounded, per-render-frame morph-target smoother for synthetic-vocal GLB tests.
 * Independently updates mouth morphs while the skeletal AnimationMixer is sampled
 * at a lower cadence. No allocation occurs in the per-frame sample function.
 * Does not claim real phoneme alignment or change the live avatar director. */
export type LipGuardStatsV783={frames:number;inputTransitions:number;clampedSteps:number;invalidInputs:number;maxJump:number;longestActiveHold:number};
export type LipGuardV783={sample:(frame:number,target:number)=>number;reset:()=>void;value:()=>number;stats:()=>LipGuardStatsV783};
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const round=(n:number)=>Math.round(n*10000)/10000;
export function createLipSyncGuardV783():LipGuardV783{
 let value=0,lastTarget=0,lastFrame=-1,frames=0,transitions=0,clamped=0,invalid=0,maxJump=0,hold=0,longestHold=0;
 const reset=()=>{value=0;lastTarget=0;lastFrame=-1;frames=0;transitions=0;clamped=0;invalid=0;maxJump=0;hold=0;longestHold=0;};
 const sample=(frame:number,target:number)=>{
  if(!Number.isInteger(frame)||frame<0)throw Error('V783: ungültiger logischer Frame');
  // A repeated frame must NOT advance the morph filter or create phantom motion.
  if(frame===lastFrame)return value;
  if(frame<lastFrame)reset();
  if(!Number.isFinite(target)){invalid++;lastFrame=frame;return value;}
  const desired=clamp(target,0,1);
  if(Math.abs(desired-lastTarget)>.03)transitions++;
  const frameGap=lastFrame<0?1:clamp(frame-lastFrame,1,3);
  // Faster attack for short syllables, gentler release to avoid hard jaw snaps.
  const alpha=desired>=value?.72:.46;
  const gain=1-Math.pow(1-alpha,frameGap);
  let step=(desired-value)*gain;
  const cap=.28*frameGap;
  if(Math.abs(step)>cap){step=Math.sign(step)*cap;clamped++;}
  // Avoid a frozen mouth when the source changes quickly. Never animate it
  // spontaneously when the signal is quiet or invalid.
  if(Math.abs(desired-value)>.09&&Math.abs(step)<.04)step=Math.sign(desired-value)*Math.min(.04,Math.abs(desired-value));
  const previous=value;value=clamp(value+step,0,1);
  const jump=Math.abs(value-previous);maxJump=Math.max(maxJump,jump);
  if(Math.abs(desired-value)>.09&&jump<.008){hold++;longestHold=Math.max(longestHold,hold);}else hold=0;
  lastTarget=desired;lastFrame=frame;frames++;
  return value;
 };
 return {sample,reset,value:()=>value,stats:()=>({frames,inputTransitions:transitions,clampedSteps:clamped,invalidInputs:invalid,maxJump:round(maxJump),longestActiveHold:longestHold})};
}
