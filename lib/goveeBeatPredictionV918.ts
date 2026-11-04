/** V918 – Confidence-gated beat scheduling for slow, whole-lamp Govee LAN commands.
 * This predicts the next microphone-locked BEAT, not a drop or musical section.
 * LAN commands are not hardware-acknowledged: leadMs is a MANUAL estimate,
 * not an automatically measured end-to-end lamp latency.
 */
import type {AudioFeatures} from '@/types/audio';
import type {GoveeLookV909} from '@/lib/goveeLanV909';
import type {GoveeRoleV911} from '@/lib/goveeConcertDirectorV911';

export const GOVEE_BEAT_KEY_V918='sonic-display:govee-beat-prediction-v918';
export const GOVEE_BEAT_EVENT_V918='sonic-display:govee-beat-prediction-changed-v918';
export type GoveeBeatSettingsV918={enabled:boolean;leadMs:number;minConfidence:number;intensity:number};
export const DEFAULT_GOVEE_BEAT_V918:GoveeBeatSettingsV918={enabled:false,leadMs:180,minConfidence:75,intensity:45};
export type GoveeBeatSampleV918=Pick<AudioFeatures,'bpm'|'bpmConfidence'|'beatPhase'|'phaseConfidence'|'phaseLocked'|'timeToNextKickMs'>;
export type GoveeBeatPredictionV918={ready:boolean;reason:string;confidence:number;bpm:number|null;remainingMs:number|null;beatAtMs:number|null;sendAtMs:number|null;periodMs:number|null};
export type GoveeBeatDispatchV918={lastSentAt:number;lastAccentAt:number};
export const EMPTY_GOVEE_DISPATCH_V918:GoveeBeatDispatchV918={lastSentAt:-1e12,lastAccentAt:-1e12};
export type GoveeBeatDecisionV918={dispatch:GoveeBeatDispatchV918;send:boolean;accent:boolean;prediction:GoveeBeatPredictionV918};
const cap=(n:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(n)?n:min));
const finite=(n:unknown,def:number,min:number,max:number,step:number)=>typeof n==='number'&&Number.isFinite(n)?Math.round(cap(n,min,max)/step)*step:def;

export function normalizeGoveeBeatV918(raw:unknown):GoveeBeatSettingsV918{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeBeatSettingsV918>:{};
 return {enabled:o.enabled===true,leadMs:finite(o.leadMs,180,0,350,10),
  minConfidence:finite(o.minConfidence,75,60,95,5),intensity:finite(o.intensity,45,0,100,5)};
}
export function loadGoveeBeatV918():GoveeBeatSettingsV918{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_BEAT_V918};
 try{return normalizeGoveeBeatV918(JSON.parse(localStorage.getItem(GOVEE_BEAT_KEY_V918)||'null'));}
 catch{return {...DEFAULT_GOVEE_BEAT_V918};}
}
export function saveGoveeBeatV918(raw:GoveeBeatSettingsV918):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeBeatV918(raw);
 localStorage.setItem(GOVEE_BEAT_KEY_V918,JSON.stringify(safe));
 window.dispatchEvent(new Event(GOVEE_BEAT_EVENT_V918));
}
export function resetGoveeBeatDispatchV918():GoveeBeatDispatchV918{return {...EMPTY_GOVEE_DISPATCH_V918};}

/** A held beat grid is only useful while the microphone supplies FRESH measurements.
 * Elapsed time is subtracted from the analyzer's latest remaining-to-beat value;
 * stale beat grids are always rejected instead of being extrapolated indefinitely.
 */
export function predictGoveeBeatV918(sample:GoveeBeatSampleV918,now:number,observedAt:number,
 settings:GoveeBeatSettingsV918,microphoneActive:boolean):GoveeBeatPredictionV918{
 const nope=(reason:string):GoveeBeatPredictionV918=>({ready:false,reason,confidence:0,bpm:null,remainingMs:null,beatAtMs:null,sendAtMs:null,periodMs:null});
 if(!settings.enabled)return nope('deaktiviert');
 if(!microphoneActive)return nope('mikrofon-inaktiv');
 if(!Number.isFinite(now)||!Number.isFinite(observedAt)||observedAt<=0||now<observedAt||now-observedAt>750)return nope('messwerte-veraltet');
 const bpm=sample.bpm;
 if(!Number.isFinite(bpm)||bpm===null||bpm<55||bpm>240)return nope('kein-stabiles-tempo');
 const confidence=Math.min(cap(sample.bpmConfidence??0,0,1),cap(sample.phaseConfidence??0,0,1));
 if(!sample.phaseLocked||confidence<settings.minConfidence/100)return nope('phasensperre-fehlt');
 if(typeof sample.beatPhase!=='number'||!Number.isFinite(sample.beatPhase)||sample.beatPhase<0||sample.beatPhase>=1)return nope('beatphase-ungueltig');
 const periodMs=60000/bpm;
 let remaining=(1-sample.beatPhase)*periodMs;
 // Existing microphone predictor can supply the same beat in milliseconds.
 if(typeof sample.timeToNextKickMs==='number'&&Number.isFinite(sample.timeToNextKickMs)&&sample.timeToNextKickMs>=0&&sample.timeToNextKickMs<=periodMs+25){
  remaining=sample.timeToNextKickMs;
 }
 remaining-=now-observedAt;
 if(remaining< -60){
  // A fresh frame may arrive just after the prior beat; use only the immediate next period.
  remaining+=periodMs;
 }
 if(remaining< -60||remaining>periodMs+30)return nope('beat-ausserhalb-fenster');
 const beatAtMs=now+remaining;
 return {ready:true,reason:'phasensynchronisiert',confidence,bpm,remainingMs:remaining,beatAtMs,
  sendAtMs:beatAtMs-settings.leadMs,periodMs};
}

/** At most one network batch every 900ms. A predicted beat gets priority only
 * in the pre-send window. Fallback ambience runs at the legacy V917 cadence.
 * Each candidate beat time is deduplicated despite analyzer jitter.
 */
export function planGoveeBeatDispatchV918(previous:GoveeBeatDispatchV918,
 sample:GoveeBeatSampleV918,now:number,observedAt:number,settings:GoveeBeatSettingsV918,
 microphoneActive:boolean,fallbackIntervalMs=1700):GoveeBeatDecisionV918{
 const prediction=predictGoveeBeatV918(sample,now,observedAt,settings,microphoneActive);
 const idle={dispatch:previous,send:false,accent:false,prediction};
 if(!Number.isFinite(now)||now<0)return idle;
 const since=now-previous.lastSentAt;
 if(since<900)return idle;
 const hit=prediction.ready&&prediction.remainingMs!==null&&prediction.beatAtMs!==null&&prediction.periodMs!==null&&
  prediction.remainingMs>=-45&&prediction.remainingMs<=settings.leadMs+75&&
  Math.abs(prediction.beatAtMs-previous.lastAccentAt)>Math.max(210,prediction.periodMs*.65);
 if(hit)return {dispatch:{lastSentAt:now,lastAccentAt:prediction.beatAtMs!},send:true,accent:true,prediction};
 if(since>=Math.max(900,Math.min(1700,finite(fallbackIntervalMs,1700,900,1700,1)))){
  return {dispatch:{...previous,lastSentAt:now},send:true,accent:false,prediction};
 }
 return idle;
}

const weights:Record<GoveeRoleV911,number>={wall:.50,rhythm:1,neon:.72,ambient:.20};
/** Gentle extra brightness with the usual master cap; NEVER a fast flash / on-off. */
export function applyGoveePredictedLookV918(base:GoveeLookV909,role:GoveeRoleV911,
 settings:GoveeBeatSettingsV918,accent:boolean,masterBrightness:number):GoveeLookV909{
 if(!settings.enabled||!accent||settings.intensity<=0)return base;
 const increment=11*(settings.intensity/100)*weights[role];
 const maximum=cap(masterBrightness+12,20,100);
 return {...base,brightness:Math.round(cap(base.brightness+increment,20,maximum))};
}
export function previewGoveeBeatV918(settings:GoveeBeatSettingsV918,masterBrightness=75){
 const roles=['wall','rhythm','neon','ambient'] as const;
 return roles.map(role=>({role,base:52,look:applyGoveePredictedLookV918(
  {color:{r:88,g:42,b:168},brightness:52},role,{...settings,enabled:true},true,masterBrightness)}));
}
