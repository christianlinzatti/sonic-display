/** V896 – musical energy from existing normalized live audio metrics.
 * No stem extraction, no invented beats/drops, no external AI or new rendering objects.
 * The V895 verified song structure still decides what may happen; audio only adjusts
 * permitted intensities. This state is bounded and is reset on pause, seek and track change.
 */
import type {DirectorPlanV895} from './aiConcertDirectorV895';

export type EnergyStyleV896='subtle'|'balanced'|'expressive';
export interface EnergySettingsV896 {
 enabled:boolean;style:EnergyStyleV896;sensitivity:number;protectLyrics:boolean;
 dynamics:boolean;bass:boolean;camera:boolean;dance:boolean;lights:boolean;led:boolean;
}
export const ENERGY_KEY_V896='sonic-musical-energy-intelligence-v896';
export const DEFAULT_ENERGY_V896:Readonly<EnergySettingsV896>={
 enabled:true,style:'balanced',sensitivity:60,protectLyrics:true,
 dynamics:true,bass:true,camera:true,dance:true,lights:true,led:true,
};
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,n));
const styles:readonly EnergyStyleV896[]=['subtle','balanced','expressive'];
export function normalizeEnergyV896(raw:unknown):EnergySettingsV896 {
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<EnergySettingsV896>:{};
 const yes=(k:keyof EnergySettingsV896):boolean=>typeof v[k]==='boolean'?v[k] as boolean:DEFAULT_ENERGY_V896[k] as boolean;
 return {enabled:yes('enabled'),style:styles.includes(v.style as EnergyStyleV896)?v.style as EnergyStyleV896:'balanced',
  sensitivity:finite(v.sensitivity)?Math.round(clamp(v.sensitivity,0,100)):60,
  protectLyrics:yes('protectLyrics'),dynamics:yes('dynamics'),bass:yes('bass'),
  camera:yes('camera'),dance:yes('dance'),lights:yes('lights'),led:yes('led')};
}
export interface MeasuredAudioV896 {
 energyEnvelope?:number;bass?:number;attack?:number;kickAccentIntensity?:number;
}
export interface EnergyFrameV896 {
 trackId:string;durationMs:number;positionMs:number;playing:boolean;
 audio:MeasuredAudioV896;elapsedMs?:number;
}
export interface EnergyStateV896 {
 trackId:string;durationMs:number;positionMs:number;samples:number;
 smoothed:number;baseline:number;trend:number;bass:number;pulse:number;
 source:'live-normalized-audio';
}
/** Do not treat absent/invalid audio fields as silence or use a playback-only guess. */
export function advanceEnergyV896(previous:EnergyStateV896|null, frame:EnergyFrameV896):EnergyStateV896|null {
 const {trackId,durationMs,positionMs,playing,audio}=frame;
 if(!playing||typeof trackId!=='string'||!trackId||trackId.length>160||
  !finite(durationMs)||durationMs<10000||durationMs>1800000||!finite(positionMs)||
  positionMs<0||positionMs>=durationMs||!audio||
  !finite(audio.energyEnvelope)||audio.energyEnvelope<0||audio.energyEnvelope>1||
  !finite(audio.bass)||audio.bass<0||audio.bass>1)return null;
 for(const v of [audio.attack,audio.kickAccentIntensity])if(v!==undefined&&(!finite(v)||v<0||v>1))return null;
 const energy=audio.energyEnvelope,bass=audio.bass;
 const onset=Math.max(audio.attack??0,audio.kickAccentIntensity??0);
 // All-zero metrics carry no measurable audio evidence. Never animate an imaginary beat.
 if(energy===0&&bass===0&&onset===0)return null;
 const valid=previous?.trackId===trackId&&previous.durationMs===durationMs;
 const dt=valid?positionMs-previous.positionMs:0;
 // On large jumps, resets are safer than carrying a stale baseline across a seek.
 const frameDelta=finite(frame.elapsedMs)&&frame.elapsedMs>0&&frame.elapsedMs<=200?frame.elapsedMs:null;
 if(valid&&dt===0&&frameDelta===null)return previous;
 if(!valid||!finite(dt)||dt<0||dt>1500){
  return {trackId,durationMs,positionMs,samples:1,smoothed:energy,baseline:energy,
   trend:0,bass,pulse:onset,source:'live-normalized-audio'};
 }
 // Exponential EMA with time constants in milliseconds: fast response + slow reference.
 const step=frameDelta??dt;
 const fast=1-Math.exp(-step/(energy>=previous.smoothed?250:540));
 const slow=1-Math.exp(-step/8500);
 const smoothed=clamp(previous.smoothed+(energy-previous.smoothed)*fast,0,1);
 const baseline=clamp(previous.baseline+(smoothed-previous.baseline)*slow,0,1);
 const trend=clamp((smoothed-baseline)*2.5,-1,1);
 const pulse=clamp(Math.max(onset,previous.pulse*Math.exp(-step/440)),0,1);
 return {trackId,durationMs,positionMs,samples:Math.min(3000,previous.samples+1),
  smoothed,baseline,trend,bass:clamp(previous.bass+(bass-previous.bass)*(1-Math.exp(-step/280)),0,1),
  pulse,source:'live-normalized-audio'};
}
export type EnergyMoodV896='quiet'|'steady'|'rising'|'high';
export interface EnergyCueV896 {
 active:boolean;source:'measured'|'unavailable';mood:EnergyMoodV896|null;
 energy:number;baseline:number;trend:number;pulse:number;
 cameraRate:number;danceGain:number;lightGain:number;ledGain:number;
}
export const ENERGY_OFF_V896:Readonly<EnergyCueV896>={active:false,source:'unavailable',mood:null,
 energy:0,baseline:0,trend:0,pulse:0,cameraRate:1,danceGain:1,lightGain:1,ledGain:1};
export interface EnergyInputV896 {
 state?:EnergyStateV896|null;plan?:DirectorPlanV895|null;
 settings:EnergySettingsV896;trackId:string;durationMs:number;positionMs:number;
 playing:boolean;autoEnabled:boolean;directorEnabled:boolean;
 tier:'low'|'balanced'|'high';reducedMotion:boolean;seekBlocked?:boolean;blackout?:boolean;
 manualFx?:boolean;manualCamera?:boolean;manualDance?:boolean;manualLighting?:boolean;
 lyricsProtected?:boolean;lyricsVisible?:boolean;
}
/** Evidence and time-gated mix. In particular a bass pulse does NOT invent a drop. */
export function sampleEnergyV896(i:EnergyInputV896):EnergyCueV896 {
 const s=i.settings,p=i.plan,x=i.state;
 if(!s.enabled||s.sensitivity<=0||(!s.dynamics&&!s.bass)||(!s.camera&&!s.dance&&!s.lights&&!s.led)||
  !i.playing||!i.autoEnabled||!i.directorEnabled||i.tier==='low'||i.reducedMotion||
  i.seekBlocked||i.blackout||i.manualFx||!p||p.source!=='verified-v604'||!x||
  x.source!=='live-normalized-audio'||!Number.isInteger(x.samples)||x.samples<3||
  !finite(x.smoothed)||x.smoothed<0||x.smoothed>1||
  !finite(x.baseline)||x.baseline<0||x.baseline>1||
  !finite(x.trend)||x.trend< -1||x.trend>1||
  !finite(x.bass)||x.bass<0||x.bass>1||!finite(x.pulse)||x.pulse<0||x.pulse>1||
  !i.trackId||p.trackId!==i.trackId||x.trackId!==i.trackId||
  i.durationMs!==p.durationMs||i.durationMs!==x.durationMs||
  !finite(i.positionMs)||i.positionMs<0||i.positionMs>=i.durationMs||
  Math.abs(i.positionMs-x.positionMs)>600)return ENERGY_OFF_V896;
 const scene=p.scenes.find(sc=>i.positionMs>=sc.startMs&&i.positionMs<sc.endMs);
 if(!scene)return ENERGY_OFF_V896;
 // A smooth, signed relative adjustment; never a hard cut or a fabricated section.
 const dynamic=s.dynamics?clamp((x.smoothed-.44)*.16+x.trend*.10,-.075,.078):0;
 const bass=s.bass?clamp(x.bass*.045+x.pulse*.04,0,.085):0;
 const scale=(s.style==='subtle'?.42:s.style==='expressive'?1.1:.75)*s.sensitivity/100*(i.tier==='balanced'?.75:1);
 const sceneScale=scene.section==='verse'||scene.section==='break'||scene.section==='outro'?.42:
  scene.section==='intro'?.58:scene.section==='drop'||scene.section==='finale'?1:.78;
 const delta=clamp((dynamic+bass)*scale*sceneScale,-.06,.10);
 const lyricsPriority=s.protectLyrics&&(i.lyricsProtected||i.lyricsVisible);
 const ratio=(coefficient:number)=>clamp(1+delta*coefficient,.91,1.10);
 const mood:EnergyMoodV896=x.smoothed<.25?'quiet':x.trend>.10?'rising':x.smoothed>.69?'high':'steady';
 return {active:true,source:'measured',mood,energy:x.smoothed,baseline:x.baseline,
  trend:x.trend,pulse:x.pulse,
  cameraRate:s.camera&&!i.manualCamera&&!lyricsPriority?ratio(-.32):1,
  danceGain:s.dance&&!i.manualDance?ratio(lyricsPriority?.35:1):1,
  lightGain:s.lights&&!i.manualLighting&&!lyricsPriority?ratio(.85):1,
  ledGain:s.led&&!i.manualLighting?ratio(lyricsPriority?.25:1):1};
}
// A tiny shared real-time snapshot for the R3F camera and React dancer path.
// No subscriptions, no timers, no localStorage, and no per-frame React updates.
let latest:EnergyStateV896|null=null;
let lastUpdatedAt=0;
export function publishEnergyV896(state:EnergyStateV896|null):void{latest=state;lastUpdatedAt=state?Date.now():0;}
export function readEnergyV896(trackId:string,durationMs:number,positionMs:number):EnergyStateV896|null{
 return latest?.trackId===trackId&&latest.durationMs===durationMs&&lastUpdatedAt>0&&
  Date.now()-lastUpdatedAt<=1200&&finite(positionMs)&&
  Math.abs(latest.positionMs-positionMs)<=600?latest:null;
}
export function exportEnergyV896(state:EnergyStateV896|null,settings:EnergySettingsV896):string|null {
 if(!state||!state.trackId||state.samples<3)return null;
 return JSON.stringify({schema:'sonic-musical-energy-v896',version:1,source:state.source,
  measurement:'Normalized live audio envelope/bass/onsets, not a frequency-accurate stem analysis',
  trackId:state.trackId,durationMs:state.durationMs,positionMs:state.positionMs,
  energy:state.smoothed,baseline:state.baseline,trend:state.trend,pulse:state.pulse,
  samples:state.samples,settings:normalizeEnergyV896(settings),
  note:'Single live snapshot, NOT a full-song energy timeline or prediction. No external AI.'},null,2);
}
