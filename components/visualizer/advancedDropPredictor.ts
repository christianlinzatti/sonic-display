/** V194: conservative, causal prediction from locally available audio features. */
export type DropPhase = "verse" | "build" | "drop";
export type DropPredictionState = {phase:DropPhase; buildScore:number; confidence:number; lastAt:number; phaseSince:number; cooldownUntil:number; previousEnergy:number; risingSamples:number};
export type DropSignals = {energy:number; bass:number; attack:number; kick:number; anticipation:number; bpm?:number|null; playing:boolean};
const clamp=(n:number)=>Math.max(0,Math.min(1,Number.isFinite(n)?n:0));
export function createDropPredictionState():DropPredictionState{return {phase:"verse",buildScore:0,confidence:0,lastAt:0,phaseSince:0,cooldownUntil:0,previousEnergy:0,risingSamples:0};}
export function advanceDropPrediction(s:DropPredictionState, a:DropSignals, now:number):DropPredictionState {
 if(!Number.isFinite(now)||now<s.lastAt)return s;
 if(!a.playing)return {...createDropPredictionState(),lastAt:now,phaseSince:now};
 const dt=Math.min(0.25,Math.max(0,now-s.lastAt));
 const energy=clamp(a.energy),bass=clamp(a.bass),attack=clamp(a.attack),kick=clamp(a.kick),anticipation=clamp(a.anticipation);
 const rising=energy>s.previousEnergy+0.008;
 const risingSamples=rising?Math.min(40,s.risingSamples+1):Math.max(0,s.risingSamples-1);
 const evidence=clamp(anticipation*0.58+(risingSamples>=4?0.25:0)+energy*0.16+bass*0.1);
 const buildScore=clamp(s.buildScore+(evidence-s.buildScore)*Math.min(1,dt*(evidence>s.buildScore?2.8:1.8)));
 let phase=s.phase,phaseSince=s.phaseSince,cooldownUntil=s.cooldownUntil;
 const dropOnset=kick>0.73&&attack>0.5&&bass>0.48;
 if(now>=cooldownUntil&&dropOnset&&s.phase==="build"&&now-s.phaseSince>=0.65){phase="drop";phaseSince=now;cooldownUntil=now+2.8;}
 else if(s.phase==="drop"&&now-s.phaseSince>=1.8){phase="verse";phaseSince=now;}
 else if(s.phase==="verse"&&now>=cooldownUntil&&buildScore>0.55&&risingSamples>=4){phase="build";phaseSince=now;}
 else if(s.phase==="build"&&now-s.phaseSince>=0.9&&buildScore<0.25){phase="verse";phaseSince=now;}
 return {phase,buildScore,confidence:phase==="build"?clamp(buildScore):phase==="drop"?clamp(attack*0.5+kick*0.5):0,lastAt:now,phaseSince,cooldownUntil,previousEnergy:energy,risingSamples};
}
