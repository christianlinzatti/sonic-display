/** V1090 · Musical Dynamics & Show Transitions.
 * Pure, opt-in, song-scoped smoothing for existing V1059 LED and V1036/V1039 lasers.
 * The envelope only dims existing virtual light (never increases power); it cannot
 * infer or authorize a drop, change manual modes, control hardware or add render passes.
 */
import type {AudioFeatures} from '../types/audio';

export type MusicalDynamicsStyleV1090='balanced'|'cinematic'|'festival';
export type MusicalDynamicsPhaseV1090='quiet'|'steady'|'rising'|'accent';
export type MusicalDynamicsStateV1090={
 trackId:string;lastProgressMs:number;gain:number;target:number;phase:MusicalDynamicsPhaseV1090;
};
export type MusicalDynamicsResultV1090={state:MusicalDynamicsStateV1090;active:boolean;reason:
 'disabled'|'paused'|'motion'|'quality'|'clock'|'audio'|'priming'|'smoothed'};
export const INITIAL_MUSICAL_DYNAMICS_V1090:Readonly<MusicalDynamicsStateV1090>=Object.freeze({
 trackId:'',lastProgressMs:-1,gain:1,target:1,phase:'steady',
});
const bounded=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=0&&v<=1;
const clamp=(x:number,a:number,b:number)=>Math.max(a,Math.min(b,x));
const reset=(reason:MusicalDynamicsResultV1090['reason']):MusicalDynamicsResultV1090=>({
 state:{...INITIAL_MUSICAL_DYNAMICS_V1090},active:false,reason,
});
/** The measured energy determines an optical *dimming* target. `observedSection`
 * is context, not proof of a downbeat or musical drop; a strong new attack must
 * still be measured for an accent. First frame and discontinuities prime at gain 1.
 */
export function stepMusicalDynamicsV1090(previous:MusicalDynamicsStateV1090,input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 performanceTier:'low'|'balanced'|'high'|null;trackId?:string|null;
 progressMs:number;deltaSeconds:number;strength:number;style:MusicalDynamicsStyleV1090;
 observedSection?:string|null;
 audio:Pick<AudioFeatures,'energyEnvelope'|'bass'|'beat'|'beatStrength'|'attack'>;
}):MusicalDynamicsResultV1090 {
 if(!input.enabled||!input.reactive)return reset('disabled');
 if(!input.playing)return reset('paused');
 if(input.reducedMotion)return reset('motion');
 if(!input.performanceTier||input.performanceTier==='low')return reset('quality');
 if(typeof input.trackId!=='string'||input.trackId.length<1||input.trackId.length>160||
   !Number.isFinite(input.progressMs)||input.progressMs<0||
   !Number.isFinite(input.deltaSeconds)||input.deltaSeconds<0||input.deltaSeconds>.2||
   !Number.isFinite(input.strength)||input.strength<0||input.strength>80||
   !['balanced','cinematic','festival'].includes(input.style))return reset('clock');
 const a=input.audio;
 if(!a||!bounded(a.energyEnvelope)||!bounded(a.bass)||!bounded(a.beatStrength)||
    !bounded(a.attack)||typeof a.beat!=='boolean')return reset('audio');
 if(input.strength===0)return reset('disabled');
 const p=input.progressMs,id=input.trackId;
 const discontinuity=previous.lastProgressMs<0||previous.trackId!==id||
  p+250<previous.lastProgressMs||p-previous.lastProgressMs>12000;
 if(discontinuity)return {state:{trackId:id,lastProgressMs:p,gain:1,target:1,phase:'steady'},active:true,reason:'priming'};
 const energy=a.energyEnvelope,bass=a.bass;
 // Only real measured energy and attack influence the trajectory. No source
 // can fabricate or authorize a festival drop from the authored show scene.
 const accent=a.beat&&a.beatStrength>=.76&&a.attack>=.62&&energy>=.60&&bass>=.48;
 const quiet=energy<.30&&bass<.37;
 const rising=!quiet&&!accent&&(energy>=.52&&bass>=.42||
   input.observedSection==='build'&&energy>=.39&&bass>=.32);
 const phase:MusicalDynamicsPhaseV1090=accent?'accent':quiet?'quiet':rising?'rising':'steady';
 const base=phase==='quiet'?.46:phase==='steady'?.72:phase==='rising'?.88:1;
 const emphasis=input.style==='cinematic'?1.08:input.style==='festival'?.86:1;
 const amount=clamp(input.strength/80*emphasis,0,1);
 const target=clamp(1-(1-base)*amount,.38,1);
 const dt=clamp(input.deltaSeconds,0,.1);
 // Asymmetric time constants: an accent can rise faster; quiet scenes descend
 // slowly, without hard cuts or hidden wall-clock timers.
 const tau=target>previous.gain?
  (input.style==='festival'?.22:input.style==='cinematic'?.40:.32):
  (input.style==='cinematic'?1.55:input.style==='festival'?.84:1.15);
 const alpha=1-Math.exp(-dt/tau);
 const gain=clamp(previous.gain+(target-previous.gain)*alpha,.38,1);
 return {state:{trackId:id,lastProgressMs:p,gain,target,phase},active:true,reason:'smoothed'};
}
/** Read only from the shared state ref inside existing render loops. */
export function sampleMusicalDynamicsGainV1090(state:MusicalDynamicsStateV1090|undefined):number {
 return state&&Number.isFinite(state.gain)?clamp(state.gain,.38,1):1;
}
