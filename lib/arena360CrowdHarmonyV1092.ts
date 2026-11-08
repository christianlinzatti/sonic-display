/** V1092 · Audience & Stage Emotion Sync.
 * Conservative, song-scoped audiovisual crowd choreography. Only existing
 * virtual phone/wristband instancing and optional body matrices consume it.
 * Never certifies song structure, generates beats/drops or controls hardware.
 */
import type {AudioFeatures} from '../types/audio';
import type {StoryArcSceneV1091} from './arena360StoryArcDirectorV1091';

export type CrowdHarmonyStyleV1092='balanced'|'cinematic'|'festival';
export type CrowdHarmonyStateV1092={
 trackId:string;lastProgressMs:number;lastBeat:boolean;lastAccentMs:number;
 energyAverage:number;lightGain:number;accent:number;phase:number;sway:number;
};
export const INITIAL_CROWD_HARMONY_V1092:Readonly<CrowdHarmonyStateV1092>=Object.freeze({
 trackId:'',lastProgressMs:-1,lastBeat:false,lastAccentMs:-99999,
 energyAverage:0,lightGain:1,accent:0,phase:0,sway:0,
});
export type CrowdHarmonyResultV1092={state:CrowdHarmonyStateV1092;active:boolean;
 reason:'disabled'|'paused'|'motion'|'quality'|'clock'|'audio'|'priming'|'smoothed';
 beatAccent:boolean};
const finite=(v:unknown,min:number,max:number):v is number=>
 typeof v==='number'&&Number.isFinite(v)&&v>=min&&v<=max;
const clamp=(n:number,min:number,max:number)=>Math.max(min,Math.min(max,n));
const TAU=Math.PI*2;
function reset(reason:CrowdHarmonyResultV1092['reason']):CrowdHarmonyResultV1092{
 return {state:{...INITIAL_CROWD_HARMONY_V1092},active:false,reason,beatAccent:false};
}

export function stepCrowdHarmonyV1092(previous:CrowdHarmonyStateV1092,input:{
 enabled:boolean;playing:boolean;reducedMotion:boolean;reactive:boolean;
 phoneSyncEnabled:boolean;phoneMode:string;performanceTier:'low'|'balanced'|'high'|null;
 trackId?:string|null;progressMs:number;durationMs:number;deltaSeconds:number;
 strength:number;style:CrowdHarmonyStyleV1092;sceneHint?:StoryArcSceneV1091|null;
 audio:Pick<AudioFeatures,'energyEnvelope'|'bass'|'beat'|'beatStrength'|'attack'>;
}):CrowdHarmonyResultV1092{
 if(!input.enabled||!input.reactive||!input.phoneSyncEnabled||input.phoneMode!=='wave'||input.strength===0)return reset('disabled');
 if(!input.playing)return reset('paused');
 if(input.reducedMotion)return reset('motion');
 if(!input.performanceTier||input.performanceTier==='low')return reset('quality');
 if(typeof input.trackId!=='string'||!input.trackId||input.trackId.length>160||
  !finite(input.durationMs,10000,1800000)||!finite(input.progressMs,0,input.durationMs)||
  !finite(input.deltaSeconds,0,.2)||!finite(input.strength,0,80)||
  !['balanced','cinematic','festival'].includes(input.style))return reset('clock');
 const a=input.audio;
 if(!a||!finite(a.energyEnvelope,0,1)||!finite(a.bass,0,1)||
  !finite(a.beatStrength,0,1)||!finite(a.attack,0,1)||typeof a.beat!=='boolean')return reset('audio');
 const progress=input.progressMs;
 if(previous.trackId!==input.trackId||previous.lastProgressMs<0||
  progress<previous.lastProgressMs-250||progress-previous.lastProgressMs>12000){
  return {state:{...INITIAL_CROWD_HARMONY_V1092,trackId:input.trackId,
   lastProgressMs:progress,lastBeat:a.beat,energyAverage:a.energyEnvelope},
   active:true,reason:'priming',beatAccent:false};
 }
 const dt=clamp(input.deltaSeconds,0,.1);
 const average=clamp(previous.energyAverage+(a.energyEnvelope-previous.energyAverage)*(1-Math.exp(-dt/1.1)),0,1);
 // A rising measured beat edge only. Authored hook/drop and scene hints do not qualify.
 const beatAccent=a.beat&&!previous.lastBeat&&a.beatStrength>=.76&&a.attack>=.68&&
  a.energyEnvelope>=.58&&progress-previous.lastAccentMs>=380;
 const accent=clamp(beatAccent?Math.max(previous.accent,.18):previous.accent*Math.exp(-dt/0.42),0,.18);
 const cinematic=input.style==='cinematic';
 const festival=input.style==='festival';
 const calm=input.sceneHint==='quiet'||input.sceneHint==='opening';
 const outro=input.sceneHint==='closing';
 const rawEnergy=clamp((average*.72+a.bass*.28),0,1);
 // An authored scene only reduces ambience; it never turns quiet audio into a peak.
 const sceneWeight=calm?.84:outro?.92:1;
 const intensity=clamp(input.strength/80,0,1);
 const target=clamp(1-intensity*(.44-.35*rawEnergy*sceneWeight),.55,1);
 const tau=target>previous.lightGain?(festival?.36:cinematic?.85:.54):(cinematic?1.8:festival?1.1:1.4);
 const lightGain=clamp(previous.lightGain+(target-previous.lightGain)*(1-Math.exp(-dt/tau)),.55,1);
 const sway=clamp(intensity*(.008+.025*rawEnergy)+accent*.07,0,.05);
 const phase=((previous.phase+dt*(festival?1.8:cinematic?.75:1.2))%TAU+TAU)%TAU;
 return {state:{trackId:input.trackId,lastProgressMs:progress,lastBeat:a.beat,
  lastAccentMs:beatAccent?progress:previous.lastAccentMs,energyAverage:average,
  lightGain,accent,phase,sway},active:true,reason:'smoothed',beatAccent};
}

/** Immutable bounded per-member sample, no per-person state, mesh or audio ticker. */
export function sampleCrowdHarmonyV1092(state:CrowdHarmonyStateV1092|undefined,angle:number):{
 phoneGain:number;rise:number;head:number;
}{
 if(!state||!Number.isFinite(angle)||!Number.isFinite(state.lightGain)||
  !Number.isFinite(state.phase)||!Number.isFinite(state.sway)||!Number.isFinite(state.accent))
  return {phoneGain:1,rise:0,head:0};
 if(state.lightGain>=.9999&&state.sway<=.0001&&state.accent<=.0001)return {phoneGain:1,rise:0,head:0};
 const wave=Math.sin(angle*2-state.phase);
 const phoneGain=clamp(state.lightGain*(.965+.035*wave),.5,1);
 const rise=clamp(state.sway*(.5+.5*wave),0,.05);
 return {phoneGain,rise,head:clamp(state.accent*wave*.12,-.022,.022)};
}
