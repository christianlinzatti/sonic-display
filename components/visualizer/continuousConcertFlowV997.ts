/** V997 – Continuous Concert Flow. Pure observed-track-boundary planner.
 * This provides a VISUAL handover, not Spotify audio crossfading or a predicted playlist.
 * No invented beats, artist roles, hardware commands, timers or show timeline edits.
 */
export const CONCERT_FLOW_KEY_V997='sonic.v997.continuous-concert-flow';
export type FlowStyleV997='subtle'|'cinematic'|'festival';
export type FlowSettingsV997=Readonly<{enabled:boolean;style:FlowStyleV997;intensity:number;protectLyrics:boolean}>;
export const DEFAULT_FLOW_V997:FlowSettingsV997=Object.freeze({enabled:false,style:'subtle',intensity:45,protectLyrics:true});
const styles:readonly FlowStyleV997[]=['subtle','cinematic','festival'];
const finite=(n:unknown):n is number=>typeof n==='number'&&Number.isFinite(n);
const clamp=(n:number,lo:number,hi:number)=>Math.min(hi,Math.max(lo,n));
const validId=(s:unknown):s is string=>typeof s==='string'&&s.length>0&&s.length<=160;
export function normalizeFlowV997(raw:unknown):FlowSettingsV997 {
 const s=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<FlowSettingsV997>:{};
 return {enabled:typeof s.enabled==='boolean'?s.enabled:false,
  style:styles.includes(s.style as FlowStyleV997)?s.style as FlowStyleV997:'subtle',
  intensity:finite(s.intensity)?Math.round(clamp(s.intensity,0,100)):45,
  protectLyrics:typeof s.protectLyrics==='boolean'?s.protectLyrics:true};
}
export type FlowHandoverV997=Readonly<{
 fromTrackId:string;toTrackId:string;startedAtMs:number;durationMs:number;
 style:FlowStyleV997;intensity:number;
}>;
export type FlowObservationV997=Readonly<{
 trackId:string;positionMs:number;durationMs:number;atMs:number;playing:boolean;
 autoEnabled:boolean;reducedMotion:boolean;manualOverride:boolean;lyricsProtected:boolean;
 settings?:FlowSettingsV997;
}>;
export type FlowStateV997=Readonly<{last:FlowObservationV997|null;handover:FlowHandoverV997|null;seekDetected:boolean}>;
export const EMPTY_FLOW_V997:FlowStateV997=Object.freeze({last:null,handover:null,seekDetected:false});
const clockOK=(o:FlowObservationV997)=>validId(o.trackId)&&finite(o.positionMs)&&finite(o.durationMs)&&
 finite(o.atMs)&&o.atMs>=0&&o.durationMs>=10000&&o.durationMs<=1800000&&
 o.positionMs>=0&&o.positionMs<o.durationMs;
const permitted=(o:FlowObservationV997)=>{const s=normalizeFlowV997(o.settings);
 return s.enabled&&s.intensity>0&&o.autoEnabled&&o.playing&&!o.reducedMotion&&!o.manualOverride&&
 !(s.protectLyrics&&o.lyricsProtected)&&clockOK(o);
};
/** Only observed, near-end → near-start transitions can trigger. Poll samples are
 * stale by up to 15s; no claim is made that a Spotify skip was impossible.
 * A seek, pause, manual control or disconnected session clears any old effect.
 */
export function advanceFlowV997(state:FlowStateV997,input:FlowObservationV997):FlowStateV997{
 const s=normalizeFlowV997(input.settings);
 const current={...input,settings:s};
 if(!permitted(current))return {last:clockOK(current)?current:null,handover:null,seekDetected:false};
 const previous=state.last;
 if(!previous||!clockOK(previous))return {last:current,handover:null,seekDetected:false};
 const delta=current.atMs-previous.atMs;
 if(delta<0||delta>20000)return {last:current,handover:null,seekDetected:false};
 if(current.trackId===previous.trackId){
  // Spotify progress should advance roughly with elapsed wall time. Large jumps
  // mean seek or stale polling; do not carry a visual handover through a seek.
  const jump=current.positionMs-previous.positionMs;
  const seek=jump< -1200||jump>delta+6500;
  return {last:current,handover:seek?null:state.handover,seekDetected:seek};
 }
 const eligible=!state.seekDetected&&permitted(previous)&&
  previous.positionMs>=Math.max(0,previous.durationMs-15000)&&
  current.positionMs<=12000&&delta<=15000&&
  current.durationMs>=10000&&previous.durationMs>=10000;
 const handover:FlowHandoverV997|null=eligible?{
  fromTrackId:previous.trackId,toTrackId:current.trackId,startedAtMs:current.atMs,
  durationMs:s.style==='festival'?1800:s.style==='cinematic'?2700:2400,
  style:s.style,intensity:clamp(s.intensity/100,0,1),
 }:null;
 return {last:current,handover,seekDetected:false};
}
export type FlowVisualV997=Readonly<{active:boolean;opacity:number;progress:number;style:FlowStyleV997}>;
export const FLOW_VISUAL_OFF_V997:FlowVisualV997=Object.freeze({active:false,opacity:0,progress:1,style:'subtle'});
/** Uses the existing stage frame clock. Does not mutate authoring, camera, audio or lights. */
export function sampleFlowV997(handover:FlowHandoverV997|null|undefined,
 trackId:string,nowMs:number,playing:boolean,blocked:boolean):FlowVisualV997{
 if(!handover||!validId(trackId)||handover.toTrackId!==trackId||
  !validId(handover.fromTrackId)||handover.fromTrackId===trackId||!playing||blocked||
  !finite(nowMs)||!finite(handover.startedAtMs)||!finite(handover.durationMs)||
  !finite(handover.intensity)||handover.intensity<0||handover.intensity>1||
  handover.durationMs<500||handover.durationMs>4000||!styles.includes(handover.style))return FLOW_VISUAL_OFF_V997;
 const age=nowMs-handover.startedAtMs;
 if(age<0||age>=handover.durationMs)return FLOW_VISUAL_OFF_V997;
 const progress=clamp(age/handover.durationMs,0,1);
 const fade=Math.sin(Math.PI*progress); // 0 at both ends; no full-screen flashes.
 const styleGain=handover.style==='festival'?.32:handover.style==='cinematic'?.26:.18;
 return {active:true,opacity:Math.min(.32,fade*handover.intensity*styleGain),progress,style:handover.style};
}
/** Untrusted UI snapshots must be bound to exactly the current song. */
export function validateFlowV997(raw:unknown,trackId:string):FlowHandoverV997|null{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const r=raw as Partial<FlowHandoverV997>;
 if(!validId(r.fromTrackId)||!validId(r.toTrackId)||r.fromTrackId===r.toTrackId||r.toTrackId!==trackId||
  !finite(r.startedAtMs)||r.startedAtMs<0||!finite(r.durationMs)||r.durationMs<500||r.durationMs>4000||
  !finite(r.intensity)||r.intensity<0||r.intensity>1||!styles.includes(r.style as FlowStyleV997))return null;
 return {fromTrackId:r.fromTrackId,toTrackId:r.toTrackId,startedAtMs:r.startedAtMs,
  durationMs:r.durationMs,style:r.style as FlowStyleV997,intensity:r.intensity};
}
