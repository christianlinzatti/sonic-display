/** V922 – measured-bass room shockwave layered over the existing rate-limited Govee LAN loop.
 * A room-scale sequence of WHOLE-LAMP brightness cues, not RGBIC segments, spatial audio,
 * physical distance calibration or a sample-accurate strobe. Never emits network calls.
 */
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeBassEnvelopeV917} from '@/lib/goveeBassReactiveV917';

export const GOVEE_SHOCKWAVE_KEY_V922='sonic-display:govee-shockwave-v922';
export const GOVEE_SHOCKWAVE_EVENT_V922='sonic-display:govee-shockwave-changed-v922';
export type GoveeShockwaveDirectionV922='forward'|'reverse'|'center-out'|'outside-in';
export type GoveeShockwaveSettingsV922={enabled:boolean;intensity:number;threshold:number;
 direction:GoveeShockwaveDirectionV922;stepMs:number;releaseMs:number;cooldownMs:number;maxBoostPoints:number};
export const DEFAULT_GOVEE_SHOCKWAVE_V922:GoveeShockwaveSettingsV922={enabled:false,intensity:60,
 threshold:45,direction:'forward',stepMs:340,releaseMs:1500,cooldownMs:2200,maxBoostPoints:9};
export type GoveeShockwaveStateV922={trackId:string;lastHits:number;lastTriggeredAt:number;triggerAt:number;strength:number};
export const EMPTY_GOVEE_SHOCKWAVE_V922:GoveeShockwaveStateV922={trackId:'',lastHits:0,lastTriggeredAt:-1e12,triggerAt:-1,strength:0};
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,Number.isFinite(v)?v:min));
const num=(v:unknown,fallback:number,low:number,high:number,step=1):number=>typeof v==='number'&&Number.isFinite(v)?
 clamp(Math.round(clamp(v,low,high)/step)*step,low,high):fallback;
const directions:GoveeShockwaveDirectionV922[]=['forward','reverse','center-out','outside-in'];
export function normalizeGoveeShockwaveV922(raw:unknown):GoveeShockwaveSettingsV922{
 const value=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeShockwaveSettingsV922>:{};
 return {enabled:value.enabled===true,intensity:num(value.intensity,60,0,100),
  threshold:num(value.threshold,45,25,90),
  direction:directions.includes(value.direction as GoveeShockwaveDirectionV922)?value.direction!:'forward',
  stepMs:num(value.stepMs,340,180,750,10),releaseMs:num(value.releaseMs,1500,900,2600,50),
  cooldownMs:num(value.cooldownMs,2200,1800,5000,100),
  maxBoostPoints:num(value.maxBoostPoints,9,0,12)};
}
export function loadGoveeShockwaveV922():GoveeShockwaveSettingsV922{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_SHOCKWAVE_V922};
 try{return normalizeGoveeShockwaveV922(JSON.parse(localStorage.getItem(GOVEE_SHOCKWAVE_KEY_V922)||'null'));}
 catch{return {...DEFAULT_GOVEE_SHOCKWAVE_V922};}
}
export function saveGoveeShockwaveV922(value:GoveeShockwaveSettingsV922):void{
 if(typeof window==='undefined')return;
 localStorage.setItem(GOVEE_SHOCKWAVE_KEY_V922,JSON.stringify(normalizeGoveeShockwaveV922(value)));
 window.dispatchEvent(new Event(GOVEE_SHOCKWAVE_EVENT_V922));
}
export function resetGoveeShockwaveV922():GoveeShockwaveStateV922{return {...EMPTY_GOVEE_SHOCKWAVE_V922};}
/** Called ONLY from the existing 120-ms microphone sampler. An old, unchanging
 * envelope never starts a new shockwave. Switching tracks clears the event.
 */
export function stepGoveeShockwaveV922(previous:GoveeShockwaveStateV922,
 envelope:GoveeBassEnvelopeV917,now:number,trackId:string,microphoneFresh:boolean,
 settings:GoveeShockwaveSettingsV922):GoveeShockwaveStateV922{
 const s=normalizeGoveeShockwaveV922(settings);
 if(!s.enabled||!microphoneFresh||!trackId||!Number.isFinite(now)||now<0)return resetGoveeShockwaveV922();
 // On first sample of a new track, do not inherit the last track's cue.
 const sameTrack=previous.trackId===trackId;
 const baseline=sameTrack?previous:{...resetGoveeShockwaveV922(),trackId};
 const hits=Math.max(0,Math.trunc(Number.isFinite(envelope.hits)?envelope.hits:0));
 const isNew=hits>baseline.lastHits&&envelope.lastKickAt>=0&&
  now-envelope.lastKickAt>=0&&now-envelope.lastKickAt<=300;
 const pulse=clamp(envelope.pulse,0,1);
 const qualifies=isNew&&pulse>=s.threshold/100&&now-baseline.lastTriggeredAt>=s.cooldownMs;
 return {...baseline,lastHits:hits,triggerAt:qualifies?now:baseline.triggerAt,
  strength:qualifies?pulse:baseline.strength,lastTriggeredAt:qualifies?now:baseline.lastTriggeredAt};
}
/** Each selected lamp is a physical position in the user-defined order.
 * For four lamps: [0,1,2,3] / [3,2,1,0] / [1,0,0,1] / [0,1,1,0].
 * The center modes create paired crests rather than invented hardware segments.
 */
export function goveeShockwaveOrderV922(index:number,count:number,direction:GoveeShockwaveDirectionV922):number{
 const n=Math.max(0,Math.min(24,Math.trunc(Number.isFinite(count)?count:0)));
 if(n===0||!Number.isInteger(index)||index<0||index>=n)return -1;
 if(direction==='reverse')return n-1-index;
 if(direction==='center-out')return Math.floor(Math.abs(2*index-(n-1))/2);
 if(direction==='outside-in')return Math.floor((n-1)/2)-Math.floor(Math.abs(2*index-(n-1))/2);
 return index;
}
export type GoveeShockwaveDecisionV922={active:boolean;order:number;ageMs:number;pulse:number;reason:string};
export function planGoveeShockwaveV922(state:GoveeShockwaveStateV922,index:number,count:number,now:number,
 settings:GoveeShockwaveSettingsV922):GoveeShockwaveDecisionV922{
 const s=normalizeGoveeShockwaveV922(settings);
 const inactive=(reason:string):GoveeShockwaveDecisionV922=>({active:false,order:-1,ageMs:0,pulse:0,reason});
 if(!s.enabled||s.intensity===0||s.maxBoostPoints===0)return inactive('Schockwelle deaktiviert');
 if(!state.trackId||state.triggerAt<0||!Number.isFinite(state.triggerAt)||!Number.isFinite(now))return inactive('Kein bestätigter Bassimpuls');
 const order=goveeShockwaveOrderV922(index,count,s.direction);
 if(order<0)return inactive('Unbekannte Geräteposition');
 const ageMs=now-state.triggerAt-order*s.stepMs;
 if(ageMs<0||ageMs>=s.releaseMs)return {active:false,order,ageMs,pulse:0,reason:'Wellenfront außerhalb der Geräteposition'};
 // Smooth bright crest; no blackouts or on/off commands, and fading over >900 ms.
 const decay=Math.pow(1-clamp(ageMs/s.releaseMs,0,1),1.15);
 const pulse=clamp(state.strength,0,1)*decay;
 return {active:pulse>0,order,ageMs,pulse,reason:'Bestätigter Mikrofon-Bassimpuls'};
}
/** The group dimmer has already been applied. Keep existing colors, group
 * priorities, and ceiling; never send an additional LAN request.
 */
export function applyGoveeShockwaveV922(base:GoveeLookV909,decision:GoveeShockwaveDecisionV922,
 settings:GoveeShockwaveSettingsV922,masterBrightness:number):GoveeLookV909{
 if(!decision.active||!Number.isFinite(base.brightness))return base;
 const s=normalizeGoveeShockwaveV922(settings);
 if(!s.enabled||s.intensity===0||s.maxBoostPoints===0)return base;
 const gain=Math.round(clamp(decision.pulse,0,1)*s.intensity/100*s.maxBoostPoints);
 if(gain<=0)return base;
 const current=clamp(base.brightness,1,100);
 const ceiling=Math.min(100,Math.max(current,clamp(masterBrightness,1,100)+12));
 const brightness=Math.min(ceiling,current+gain);
 return brightness===base.brightness?base:{...base,brightness};
}
/** A pure synthetic visual sample, deliberately separate from live state / hardware. */
export function previewGoveeShockwaveV922(settings:GoveeShockwaveSettingsV922,count=4,
 elapsedMs=0,baseBrightness=48,masterBrightness=75){
 const s={...normalizeGoveeShockwaveV922(settings),enabled:true};
 const state={trackId:'v922-preview',lastHits:1,lastTriggeredAt:1000,triggerAt:1000,strength:1};
 return Array.from({length:Math.min(12,Math.max(0,Math.round(count)))},(_,index)=>{
  const decision=planGoveeShockwaveV922(state,index,count,1000+Math.max(0,elapsedMs),s);
  const look=applyGoveeShockwaveV922({color:{r:98,g:36,b:174},brightness:baseBrightness},decision,s,masterBrightness);
  return {index,decision,brightness:look.brightness};
 });
}
