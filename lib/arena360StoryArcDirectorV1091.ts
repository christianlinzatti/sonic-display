/** V1091 · Smart Concert Story Arc Director.
 * Pure, song-scoped stage-only optical crossfade. Neither an authored section nor
 * an energy spike proves a song hook or drop. No audio/hardware control or timers.
 * Existing opt-in LED and laser instanced meshes are the only consumers.
 */
import type {AudioFeatures} from '../types/audio';
export type StoryArcStyleV1091='balanced'|'cinematic'|'festival';
export type StoryArcSceneV1091='opening'|'quiet'|'steady'|'building'|'accent'|'closing';
export type StoryArcStateV1091={trackId:string;lastProgressMs:number;gain:number;
 scene:StoryArcSceneV1091;candidate:StoryArcSceneV1091;candidateSeconds:number;energyAverage:number};
export const INITIAL_STORY_ARC_V1091:Readonly<StoryArcStateV1091>=Object.freeze({
 trackId:'',lastProgressMs:-1,gain:1,scene:'steady',candidate:'steady',candidateSeconds:0,energyAverage:0,
});
export type StoryArcResultV1091={state:StoryArcStateV1091;active:boolean;
 reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'audio'|'priming'|'smoothed'};
const inRange=(v:unknown,min:number,max:number):v is number=>typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const reset=(reason:StoryArcResultV1091['reason']):StoryArcResultV1091=>({state:{...INITIAL_STORY_ARC_V1091},active:false,reason});

/** Observed audio dominates. The song clock supplies only a nonauthoritative
 * opening/ending *visual styling* hint, never downbeat/drop certification. */
export function stepStoryArcV1091(previous:StoryArcStateV1091,input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 performanceTier:'low'|'balanced'|'high'|null;trackId?:string|null;
 progressMs:number;durationMs:number;deltaSeconds:number;strength:number;
 style:StoryArcStyleV1091;sectionHint?:string|null;
 audio:Pick<AudioFeatures,'energyEnvelope'|'bass'|'beat'|'beatStrength'|'attack'>;
}):StoryArcResultV1091 {
 if(!input.enabled||!input.reactive||input.strength===0)return reset('disabled');
 if(!input.playing)return reset('paused');
 if(input.reducedMotion)return reset('motion');
 if(!input.performanceTier||input.performanceTier==='low')return reset('quality');
 if(typeof input.trackId!=='string'||!input.trackId||input.trackId.length>160||
   !inRange(input.durationMs,10000,1800000)||!inRange(input.progressMs,0,input.durationMs)||
   !inRange(input.deltaSeconds,0,.2)||!inRange(input.strength,0,80)||
   !['balanced','cinematic','festival'].includes(input.style))return reset('clock');
 const a=input.audio;
 if(!a||!inRange(a.energyEnvelope,0,1)||!inRange(a.bass,0,1)||
   !inRange(a.attack,0,1)||!inRange(a.beatStrength,0,1)||typeof a.beat!=='boolean')return reset('audio');
 const progress=input.progressMs, trackId=input.trackId;
 if(previous.trackId!==trackId||previous.lastProgressMs<0||
   progress<previous.lastProgressMs-250||progress-previous.lastProgressMs>12000){
  return {state:{...INITIAL_STORY_ARC_V1091,trackId,lastProgressMs:progress,
   energyAverage:a.energyEnvelope},active:true,reason:'priming'};
 }
 const dt=clamp(input.deltaSeconds,0,.1);
 const energyAverage=clamp(previous.energyAverage+(a.energyEnvelope-previous.energyAverage)*(1-Math.exp(-dt/1.0)),0,1);
 const attack=a.beat&&a.beatStrength>=.77&&a.attack>=.65&&a.energyEnvelope>=.64&&a.bass>=.44;
 // Avoid representing planned hooks or drops as observed structure.
 const sectionHint=String(input.sectionHint??'').toLowerCase();
 const fraction=progress/input.durationMs;
 const detected:StoryArcSceneV1091=attack?'accent':
    (a.energyEnvelope<.27&&a.bass<.31)?'quiet':
    (fraction<.085&&a.energyEnvelope<.72)?'opening':
    (fraction>.92&&a.energyEnvelope>.35)?'closing':
    (a.energyEnvelope>.46&&a.bass>.39&&
      (a.energyEnvelope-energyAverage>.09||sectionHint==='build'&&a.energyEnvelope>.56))?'building':'steady';
 // A beat-verified accent may react immediately. Other visual chapters require
 // persistence; this avoids rapid flicker and is not song-structure inference.
 const candidateSeconds=detected===previous.candidate?
  clamp(previous.candidateSeconds+dt,0,10):0;
 const scene:StoryArcSceneV1091=attack?'accent':
   candidateSeconds>=.65?detected:previous.scene;
 const base={opening:.67,quiet:.57,steady:.80,building:.89,accent:1,closing:.95}[scene];
 const styleMultiplier=input.style==='cinematic'?1.10:input.style==='festival'?.82:1;
 const target=clamp(1-(1-base)*clamp(input.strength/80*styleMultiplier,0,1),.5,1);
 const tau=target>previous.gain?
  (input.style==='festival'?.28:input.style==='cinematic'?.50:.38):
  (input.style==='cinematic'?1.65:input.style==='festival'?1.05:1.25);
 const gain=clamp(previous.gain+(target-previous.gain)*(1-Math.exp(-dt/tau)),.5,1);
 return {state:{trackId,lastProgressMs:progress,gain,scene,
  candidate:detected,candidateSeconds,energyAverage},active:true,reason:'smoothed'};
}
export function sampleStoryArcGainV1091(state:StoryArcStateV1091|undefined):number {
 return state&&Number.isFinite(state.gain)?clamp(state.gain,.5,1):1;
}
