/** V1154 – local, opt-in and deterministic avatar/Govee coordination.
 * No network requests, hardware ownership, synthetic beats or show-timeline mutations.
 */
export const CONCERT_COORDINATION_KEY_V1154='sonic-display:concert-coordination-v1154';
export const CONCERT_COORDINATION_EVENT_V1154='sonic-display:concert-coordination-changed-v1154';
export type ConcertCoordinationSettingsV1154={schema:'concert-coordination-v1154';enabled:boolean;strength:number};
export const DEFAULT_CONCERT_COORDINATION_V1154:ConcertCoordinationSettingsV1154={
 schema:'concert-coordination-v1154',enabled:false,strength:55
};
const clamp=(n:number,min:number,max:number)=>Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const PHASES=['verse','hook','build','drop','break','outro','quiet','finale'] as const;
export type ConcertCoordinationPhaseV1154=typeof PHASES[number];
export type ConcertCoordinationV1154={active:boolean;phase:ConcertCoordinationPhaseV1154;
 blend:number;crewFactor:number;lightFactor:number;reason:string};
const off=(reason:string):ConcertCoordinationV1154=>({
 active:false,phase:'verse',blend:0,crewFactor:1,lightFactor:1,reason
});
export function normalizeConcertCoordinationV1154(raw:unknown):ConcertCoordinationSettingsV1154{
 const v=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<ConcertCoordinationSettingsV1154>:{};
 return {schema:'concert-coordination-v1154',enabled:v.enabled===true,
  strength:typeof v.strength==='number'&&Number.isFinite(v.strength)?Math.round(clamp(v.strength,0,100)):55};
}
export function loadConcertCoordinationV1154():ConcertCoordinationSettingsV1154{
 if(typeof window==='undefined')return {...DEFAULT_CONCERT_COORDINATION_V1154};
 try{return normalizeConcertCoordinationV1154(JSON.parse(localStorage.getItem(CONCERT_COORDINATION_KEY_V1154)||'null'));}
 catch{return {...DEFAULT_CONCERT_COORDINATION_V1154};}
}
export function saveConcertCoordinationV1154(value:ConcertCoordinationSettingsV1154):void{
 const next=normalizeConcertCoordinationV1154(value);
 localStorage.setItem(CONCERT_COORDINATION_KEY_V1154,JSON.stringify(next));
 window.dispatchEvent(new Event(CONCERT_COORDINATION_EVENT_V1154));
}
export function planConcertCoordinationV1154(input:{
 settings:ConcertCoordinationSettingsV1154;trackId?:string|null;progressMs:number;durationMs?:number|null;
 phase:string;verified:boolean;transition:number;playing:boolean;reducedMotion:boolean;
 manualPriority:boolean;lyricsFocus:boolean;genre?:string|null;
}):ConcertCoordinationV1154{
 const s=normalizeConcertCoordinationV1154(input.settings);
 if(!s.enabled||s.strength===0)return off('opt-out');
 if(!input.playing||input.reducedMotion||input.manualPriority)return off('playback-or-manual-priority');
 if(!input.trackId?.trim()||input.trackId.length>200||!Number.isFinite(input.progressMs)||input.progressMs<0)
  return off('invalid-track-clock');
 if(input.durationMs!==undefined&&input.durationMs!==null&&
  (!Number.isFinite(input.durationMs)||input.durationMs<=0||input.progressMs>=input.durationMs))return off('invalid-duration');
 if(!input.verified)return off('no-verified-phase');
 if(!PHASES.includes(input.phase as ConcertCoordinationPhaseV1154)||!Number.isFinite(input.transition)||
  input.transition<0||input.transition>1)return off('unknown-phase');
 const phase=input.phase as ConcertCoordinationPhaseV1154;
 // Quintic ease: lower acceleration at both edges of a confirmed song section.
 // No synthetic timing, altered clips or additional network commands.
 const t=input.transition;
 const blend=t*t*t*(t*(t*6-15)+10);
 const amount=s.strength/100;
 const genre=String(input.genre??'').toLowerCase();
 const rap=/rap|hip.?hop|trap/.test(genre);
 const hard=/hardtekk|hardstyle|hardcore|uptempo|gabber/.test(genre);
 const rock=/deutschrock|industrial|metal|rock/.test(genre);
 const quiet=phase==='break'||phase==='quiet'||phase==='outro';
 const busy=phase==='drop'||phase==='finale';
 // Genre and section alter only a bounded attenuation envelope: never a clip or power state.
 // Lyrics have priority; hooks and drops retain the most stage presence.
 const targetCrew=input.lyricsFocus?.67:quiet?(hard?.74:.72):
  busy?(hard?.99:rock?.98:.96):
  phase==='hook'?(hard?.97:rock?.95:rap?.94:.90):
  phase==='build'?(hard?.88:rock?.91:.90):
  rap&&phase==='verse'?.84:.90;
 const targetLight=input.lyricsFocus?.88:quiet?(hard?.84:.86):
  busy?.98:phase==='build'?(hard?.91:.93):
  phase==='hook'&&rock?.98:.96;
 return {active:true,phase,blend,
  crewFactor:clamp(1-(1-targetCrew)*amount*blend,.5,1),
  lightFactor:clamp(1-(1-targetLight)*amount*blend,.75,1),
  reason:'observed-section-smoothing'};
}
export function applyConcertCrewV1154<T extends {active:boolean;expressionGain?:number}>(
 plan:T,decision:ConcertCoordinationV1154,manualPriority=false):T{
 if(!decision?.active||!plan.active||manualPriority||typeof plan.expressionGain!=='number'||
  !Number.isFinite(plan.expressionGain)||!Number.isFinite(decision.crewFactor)||
  decision.crewFactor<0||decision.crewFactor>1)return plan;
 return {...plan,expressionGain:Math.max(0,plan.expressionGain)*decision.crewFactor};
}
export function applyConcertLightV1154<T extends {brightness:number;color:{r:number;g:number;b:number}}>(
 look:T,decision:ConcertCoordinationV1154,ceiling:number):T{
 if(!decision?.active||!Number.isFinite(decision.lightFactor)||
  decision.lightFactor<0||decision.lightFactor>1||!Number.isFinite(look.brightness)||look.brightness<0||
  !Number.isFinite(ceiling)||ceiling<0)return look;
 return {...look,brightness:Math.max(0,Math.min(Math.round(look.brightness),
  Math.round(clamp(ceiling,0,100)),Math.round(look.brightness*decision.lightFactor)))};
}
