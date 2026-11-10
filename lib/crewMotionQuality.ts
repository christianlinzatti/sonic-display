import type {AnimationAction} from 'three';
/** Zero velocity and acceleration at both ends of a pose crossfade. */
export function crewBlendWeight(value:number){const t=Number.isFinite(value)?Math.max(0,Math.min(1,value)):0;return t*t*t*(t*(t*6-15)+10);}
/** Foot/leg matching must inspect the actual incoming song phase, not a discarded pose match. */
export function applyCrewClockEntry(action:AnimationAction,seconds:number|undefined):boolean{
 const duration=action.getClip().duration;
 if(seconds===undefined||!Number.isFinite(seconds)||!Number.isFinite(duration)||duration<=0)return false;
 action.time=((seconds%duration)+duration)%duration;return true;
}
