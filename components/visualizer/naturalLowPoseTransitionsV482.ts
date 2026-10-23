/** V482: bounded, allocation-light low-pose finishing for procedural dancers and
 * existing GLB clips. No synthetic bone retargeting, audio analysis, or singer inference. */
import type {LowPoseModeV481} from './intelligentLowPoseV481';
export type NaturalLowPoseStateV482={depth:number;velocity:number;torsoShift:number;shiftVelocity:number};
export type NaturalLowPoseInputV482={depth:number;mode:LowPoseModeV481;seconds:number;slot:number;beat:number;playing:boolean;reducedMotion:boolean;manualPriority:boolean};
export const newNaturalLowPoseStateV482=():NaturalLowPoseStateV482=>({depth:0,velocity:0,torsoShift:0,shiftVelocity:0});
const finite=(x:number)=>Number.isFinite(x)?x:0;
const clamp=(v:number,a:number,b:number)=>Math.min(b,Math.max(a,v));
/** Exact critically damped harmonic response for a constant target over dt.
 * A single pose state drives both pelvis translation and knee angles, avoiding
 * independent filters that can make the procedural ankles slide. */
function advance(x:number,v:number,target:number,seconds:number,omega:number):[number,number]{
 const dt=clamp(finite(seconds),0,.1);
 const error=x-target;
 const term=v+omega*error;
 const decay=Math.exp(-omega*dt);
 return [target+(error+term*dt)*decay,(v-omega*term*dt)*decay];
}
/** Mutates one stable per-avatar ref; no React setState or allocations per frame
 * beyond the small return value. Stronger high-frequency motion is *not* added
 * when real beat evidence is missing. */
export function stepNaturalLowPoseV482(state:NaturalLowPoseStateV482,input:NaturalLowPoseInputV482,dt:number):NaturalLowPoseStateV482{
 const valid=input.playing&&!input.reducedMotion&&!input.manualPriority;
 const target=valid&&input.mode!=='rap-lean'?clamp(finite(input.depth),0,.26):0;
 // Asymmetry is in the torso only; leg IK still uses symmetric target angles.
 const low=target>.001;
 const slot=clamp(Math.floor(finite(input.slot)),0,3);
 const phase=finite(input.seconds)*1.7+slot*.91;
 const beat=clamp(finite(input.beat),0,1);
 const shift=valid&&low?clamp((Math.sin(phase)*.026 + (slot%2?-.011:.011)) * (0.45+beat*.55),-.038,.038):0;
 // Quicker recovery than descent to reduce hanging at phase boundaries.
 const speed=target<state.depth?12:8;
 const [depth,velocity]=advance(state.depth,state.velocity,target,dt,speed);
 const [torsoShift,shiftVelocity]=advance(state.torsoShift,state.shiftVelocity,shift,dt,10);
 state.depth=clamp(depth,0,.26);
 state.velocity=state.depth===depth?clamp(velocity,-1,1):0;
 state.torsoShift=clamp(torsoShift,-.038,.038);
 state.shiftVelocity=state.torsoShift===torsoShift?clamp(shiftVelocity,-1,1):0;
 return state;
}

export type LowClipStateV482={clip:string|null;holdSeconds:number;trackId:string};
export const newLowClipStateV482=():LowClipStateV482=>({clip:null,holdSeconds:0,trackId:''});
/** Suppress jitter between imported squat/kneel clips, not the user's manual
 * commands. Standing, pause, song change and authored motions cancel promptly. */
export function stepLowClipV482(state:LowClipStateV482,candidate:string|null,dt:number,trackId:string|undefined|null,manualPriority:boolean):string|null{
 const id=trackId||'';
 if(state.trackId!==id){state.clip=null;state.holdSeconds=0;state.trackId=id;}
 if(manualPriority||!candidate||!id){state.clip=null;state.holdSeconds=0;return null;}
 if(state.clip===candidate){state.holdSeconds+=clamp(finite(dt),0,.1);return state.clip;}
 if(state.clip && state.holdSeconds<.58){state.holdSeconds+=clamp(finite(dt),0,.1);return state.clip;}
 state.clip=candidate;state.holdSeconds=0;
 return candidate;
}
