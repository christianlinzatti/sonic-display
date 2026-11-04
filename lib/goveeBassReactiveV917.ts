/** V917 – Microphone-gated bass envelopes for the Govee LAN light director.
 * Pure math, opt-in. The LAN API only accepts whole-lamp RGB / brightness;
 * this is NOT a sample-accurate/strobe/kick-per-packet protocol.
 */
import type {AudioFeatures} from '@/types/audio';
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';

export const GOVEE_BASS_KEY_V917='sonic-display:govee-bass-v917';
export const GOVEE_BASS_EVENT_V917='sonic-display:govee-bass-changed-v917';
export type GoveeBassSettingsV917={enabled:boolean;intensity:number;threshold:number;cooldownMs:number;releaseMs:number};
export const DEFAULT_GOVEE_BASS_V917:GoveeBassSettingsV917={enabled:false,intensity:55,threshold:40,cooldownMs:420,releaseMs:900};
export type GoveeBassSampleV917=Pick<AudioFeatures,'bass'|'kick'|'beatStrength'>;
export type GoveeBassEnvelopeV917={lastAt:number;lastKickAt:number;lastLevel:number;floor:number;pulse:number;hits:number};
export const EMPTY_GOVEE_BASS_ENVELOPE_V917:GoveeBassEnvelopeV917={lastAt:0,lastKickAt:-1e12,lastLevel:0,floor:0,pulse:0,hits:0};
const clamp=(v:number,lo:number,hi:number):number=>Math.min(hi,Math.max(lo,Number.isFinite(v)?v:lo));
const number=(v:unknown,defaultValue:number,lo:number,hi:number,step=1):number=>
 typeof v==='number'&&Number.isFinite(v)?Math.round(clamp(v,lo,hi)/step)*step:defaultValue;
export function normalizeGoveeBassV917(raw:unknown):GoveeBassSettingsV917{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeBassSettingsV917>:{};
 return {enabled:o.enabled===true,intensity:number(o.intensity,55,0,100),threshold:number(o.threshold,40,20,85),
  cooldownMs:number(o.cooldownMs,420,250,1200,10),releaseMs:number(o.releaseMs,900,500,2200,10)};
}
export function loadGoveeBassV917():GoveeBassSettingsV917{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_BASS_V917};
 try{return normalizeGoveeBassV917(JSON.parse(localStorage.getItem(GOVEE_BASS_KEY_V917)||'null'));}
 catch{return {...DEFAULT_GOVEE_BASS_V917};}
}
export function saveGoveeBassV917(raw:GoveeBassSettingsV917):void{
 const safe=normalizeGoveeBassV917(raw);
 localStorage.setItem(GOVEE_BASS_KEY_V917,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_BASS_EVENT_V917));
}
export function resetGoveeBassEnvelopeV917():GoveeBassEnvelopeV917{return {...EMPTY_GOVEE_BASS_ENVELOPE_V917};}
/** Detect only NEW microphone bass onsets above an adaptive floor.
 * The 120ms local sampler catches short impulses, while the network sender
 * remains deliberately slow (>=900ms) to avoid choking the device's UDP stack.
 */
export function stepGoveeBassEnvelopeV917(
 previous:GoveeBassEnvelopeV917,metrics:GoveeBassSampleV917,now:number,
 settings:GoveeBassSettingsV917,microphoneActive:boolean,
):GoveeBassEnvelopeV917{
 if(!Number.isFinite(now)||now<0)return resetGoveeBassEnvelopeV917();
 if(!settings.enabled||!microphoneActive)return {...resetGoveeBassEnvelopeV917(),lastAt:now};
 const dt=previous.lastAt>0?clamp(now-previous.lastAt,0,5000):120;
 // Exponential decay keeps changes smooth even when a browser skips a frame.
 const pulse=clamp(previous.pulse*Math.exp(-dt/settings.releaseMs),0,1);
 const level=clamp(.65*clamp(metrics.bass,0,1)+.25*clamp(metrics.kick,0,1)+.10*clamp(metrics.beatStrength,0,1),0,1);
 const floor=clamp(previous.floor*.97+level*.03,0,1);
 const threshold=clamp(settings.threshold/100,.2,.85);
 const rising=(level>=threshold)&&((previous.lastLevel<threshold*.88)||(level-previous.lastLevel>=.20));
 const transient=level>=floor+.065;
 const kick=rising&&transient&&now-previous.lastKickAt>=settings.cooldownMs;
 return {lastAt:now,lastKickAt:kick?now:previous.lastKickAt,lastLevel:level,floor,
  pulse:kick?Math.max(pulse,clamp((level-threshold)*1.3+.36,0,1)):pulse,hits:previous.hits+(kick?1:0)};
}
const ROLE_WEIGHT_V917:Record<GoveeRoleV911,number>={wall:.53,rhythm:1,neon:.68,ambient:.22};
/** Layer over V911/V914 look without changing color, scene, cue, group or power state.
 * Add <=16 brightness points at maximum response and never exceed master+12.
 */
export function applyGoveeBassLookV917(base:GoveeLookV909,role:GoveeRoleV911,
 envelope:GoveeBassEnvelopeV917,settings:GoveeBassSettingsV917,masterBrightness:number,
 microphoneActive:boolean):GoveeLookV909{
 if(!settings.enabled||!microphoneActive||settings.intensity<=0||envelope.pulse<=0)return base;
 const cap=clamp(masterBrightness+12,20,100);
 const delta=16*clamp(settings.intensity/100,0,1)*ROLE_WEIGHT_V917[role]*clamp(envelope.pulse,0,1);
 return {...base,brightness:Math.round(clamp(base.brightness+delta,20,cap))};
}
/** Allows a preview to use exactly the same role response without any LAN I/O. */
export function previewGoveeBassV917(settings:GoveeBassSettingsV917,pulse:number,masterBrightness=75){
 const envelope={...EMPTY_GOVEE_BASS_ENVELOPE_V917,pulse:clamp(pulse,0,1)};
 const roles=['wall','rhythm','neon','ambient'] as const;
 return roles.map(role=>({role,look:applyGoveeBassLookV917({color:{r:88,g:42,b:168},brightness:52},role,envelope,
  {...settings,enabled:true},masterBrightness,true)}));
}
