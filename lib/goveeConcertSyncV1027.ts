/** V1027: four-zone, explicit-opt-in Govee room overlay, calculated in the existing LAN loop.
 * No new commands, device power, UDP cadence, inferred beats, or synthetic phases.
 * Only verified V318 song sections can change the look. Optical lag is MANUAL,
 * never estimated from an HTTP status request. The existing brightness cap wins.
 */
export const GOVEE_SYNC_KEY_V1027='sonic-display:govee-concert-sync-v1027';
export const GOVEE_SYNC_EVENT_V1027='sonic-display:govee-concert-sync-changed-v1027';
export const GOVEE_ZONES_V1027=['wall','rhythm','neon','ambient'] as const;
export type GoveeZoneV1027=typeof GOVEE_ZONES_V1027[number];
export type GoveeSyncSettingsV1027={schema:'govee-sync-v1027';enabled:boolean;
 strength:number;transitionMs:number;fixtureIps:Record<GoveeZoneV1027,string>;visualDelayMs:Record<string,number>};
export const DEFAULT_GOVEE_SYNC_V1027:GoveeSyncSettingsV1027={schema:'govee-sync-v1027',
 enabled:false,strength:45,transitionMs:3200,
 fixtureIps:{wall:'',rhythm:'',neon:'',ambient:''},visualDelayMs:{}};
export type GoveeLookV1027={brightness:number;color:{r:number;g:number;b:number}};
export type GoveePhaseV1027='verse'|'hook'|'build'|'drop'|'break'|'ambient';
export type GoveePhaseCueV1027={phase:GoveePhaseV1027;previous:GoveePhaseV1027;transition:number;verified:boolean};
export type GoveeSyncDecisionV1027={active:boolean;zone:GoveeZoneV1027|null;phase:GoveePhaseV1027;
 reason:string;brightnessFactor:number;mix:number;accent:{r:number;g:number;b:number}};
const inactive=(reason:string):GoveeSyncDecisionV1027=>({active:false,zone:null,phase:'ambient',
 reason,brightnessFactor:1,mix:0,accent:{r:0,g:0,b:0}});
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
const bounded=(v:unknown,d:number,lo:number,hi:number,step=1)=>typeof v==='number'&&Number.isFinite(v)
 ?Math.round(clamp(v,lo,hi)/step)*step:d;
const privateIp=(ip:string)=>{const p=ip.split('.');if(p.length!==4||p.some(v=>!/^\d{1,3}$/.test(v)||Number(v)>255))return false;
 const a=Number(p[0]),b=Number(p[1]);return a===10||(a===172&&b>=16&&b<=31)||(a===192&&b===168);};
/** Normalize against untrusted browser storage; one unique, private IP per zone. */
export function normalizeGoveeSyncV1027(raw:unknown):GoveeSyncSettingsV1027{
 const o=raw&&typeof raw==='object'&&!Array.isArray(raw)?raw as Partial<GoveeSyncSettingsV1027>:{};
 const fixtures:Record<GoveeZoneV1027,string>={wall:'',rhythm:'',neon:'',ambient:''};
 const used=new Set<string>();const incoming:Partial<Record<GoveeZoneV1027,string>>=o.fixtureIps&&typeof o.fixtureIps==='object'&&!Array.isArray(o.fixtureIps)?o.fixtureIps:{};
 for(const zone of GOVEE_ZONES_V1027){const ip=incoming[zone];
  if(typeof ip==='string'&&privateIp(ip)&&!used.has(ip)){fixtures[zone]=ip;used.add(ip);}}
 const delays:Record<string,number>={};
 if(o.visualDelayMs&&typeof o.visualDelayMs==='object'&&!Array.isArray(o.visualDelayMs))
  for(const [ip,v] of Object.entries(o.visualDelayMs).slice(0,32))
   if(privateIp(ip))delays[ip]=bounded(v,0,0,350,10);
 return {schema:'govee-sync-v1027',enabled:o.enabled===true,
  strength:bounded(o.strength,45,0,65,1),transitionMs:bounded(o.transitionMs,3200,1200,6000,100),
  fixtureIps:fixtures,visualDelayMs:delays};
}
export function loadGoveeSyncV1027():GoveeSyncSettingsV1027{
 if(typeof window==='undefined')return normalizeGoveeSyncV1027(null);
 try{return normalizeGoveeSyncV1027(JSON.parse(localStorage.getItem(GOVEE_SYNC_KEY_V1027)||'null'));}
 catch{return normalizeGoveeSyncV1027(null);}
}
export function saveGoveeSyncV1027(settings:GoveeSyncSettingsV1027):void{
 if(typeof window==='undefined')return;
 localStorage.setItem(GOVEE_SYNC_KEY_V1027,JSON.stringify(normalizeGoveeSyncV1027(settings)));
 window.dispatchEvent(new Event(GOVEE_SYNC_EVENT_V1027));
}
export function visualAdvanceV1027(settings:GoveeSyncSettingsV1027,ip:string,existingMs:number):number{
 const safe=normalizeGoveeSyncV1027(settings);
 // Two separately configured compensation sources MUST NOT add their delays.
 return Math.max(bounded(existingMs,0,0,350),safe.visualDelayMs[ip]??0);
}
/** Optical compensation cannot advance across the next *actual* V318 marker.
 * This is checked against current section boundaries rather than just its
 * category: adjacent verses are also distinct markers, and must not pre-trigger.
 */
export function safeGoveeSyncProgressV1027(progressMs:number,advanceMs:number,
 sectionStartMs:number|null,sectionDurationMs:number|null,nextStartMs=Infinity):number{
 if(!Number.isFinite(progressMs)||progressMs<0||!Number.isFinite(advanceMs)||advanceMs<=0||advanceMs>350||
  sectionStartMs===null||sectionDurationMs===null||!Number.isFinite(sectionStartMs)||
  !Number.isFinite(sectionDurationMs)||sectionDurationMs<=0||progressMs<sectionStartMs||
  progressMs>=sectionStartMs+sectionDurationMs)return progressMs;
 const limit=Math.min(sectionStartMs+sectionDurationMs,
  Number.isFinite(nextStartMs)?nextStartMs:Infinity);
 return progressMs+advanceMs<limit?progressMs+advanceMs:progressMs;
}
const factors:Record<GoveePhaseV1027,Record<GoveeZoneV1027,number>>={
 ambient:{wall:1,rhythm:1,neon:1,ambient:1},
 verse:{wall:.98,rhythm:.94,neon:.95,ambient:1},
 hook:{wall:1,rhythm:.99,neon:1,ambient:.98},
 build:{wall:.97,rhythm:.95,neon:.96,ambient:.98},
 drop:{wall:1,rhythm:1,neon:1,ambient:.96},
 break:{wall:.88,rhythm:.83,neon:.87,ambient:.91},
};
const accentByZone:Record<GoveeZoneV1027,{r:number;g:number;b:number}>={
 wall:{r:108,g:69,b:195},rhythm:{r:46,g:152,b:217},
 neon:{r:207,g:45,b:159},ambient:{r:203,g:105,b:58}};
export function planGoveeSyncV1027(input:{settings:GoveeSyncSettingsV1027;ip:string;
 selectedIps:readonly string[];bridgeEnabled:boolean;autoSync:boolean;directorEnabled:boolean;
 playing:boolean;visible:boolean;progressMs:number;durationMs:number;phase:GoveePhaseCueV1027;
 savedShowActive?:boolean;authoredStageActive?:boolean;manualOverride?:boolean;roomAtmosphereActive?:boolean;groupUnisonActive?:boolean;recovering?:boolean;
 reducedMotion?:boolean;lyricsVisible?:boolean;voiceActive?:boolean;stageCamera?:string;}):GoveeSyncDecisionV1027{
 const s=normalizeGoveeSyncV1027(input.settings);
 if(!s.enabled||!s.strength||!input.bridgeEnabled||!input.autoSync||!input.directorEnabled)
  return inactive('Zusätzlicher Govee-Sync nicht ausdrücklich aktiviert');
 if(!input.playing||!input.visible||input.manualOverride||input.savedShowActive||input.authoredStageActive||
  input.recovering||input.reducedMotion||input.voiceActive||input.lyricsVisible||
  input.roomAtmosphereActive||input.groupUnisonActive)
  return inactive('Manuelle Bedienung, Pause, Lyrics oder Schutzmodus hat Vorrang');
 if(!Array.isArray(input.selectedIps)||input.selectedIps.length<1||input.selectedIps.length>4||
  new Set(input.selectedIps).size!==input.selectedIps.length||input.selectedIps.some(ip=>!privateIp(ip)))
  return inactive('Bitte höchstens vier unterschiedliche LAN-Leuchten auswählen');
 if(!input.selectedIps.includes(input.ip))return inactive('Leuchte nicht ausgewählt');
 const zone=GOVEE_ZONES_V1027.find(z=>s.fixtureIps[z]===input.ip);
 if(!zone)return inactive('Keine explizite Zonenzuordnung');
 if(!Number.isFinite(input.progressMs)||!Number.isFinite(input.durationMs)||input.durationMs<10000||
  input.progressMs<0||input.progressMs>=input.durationMs)return inactive('Keine gültige Songposition');
 const phase=input.phase;
 if(!phase||!phase.verified||!(phase.phase in factors)||!(phase.previous in factors)||
  !Number.isFinite(phase.transition)||phase.transition<0||phase.transition>1||phase.phase==='ambient')
  return inactive('Kein bestätigter Songabschnitt');
 // V911 supplies a fade-in for real labeled V318 sections (not predicted drops).
 const t=phase.transition*phase.transition*(3-2*phase.transition);
 const strength=s.strength/100;
 const factor=1-(1-(factors[phase.previous][zone]*(1-t)+factors[phase.phase][zone]*t))*strength;
 const cinema= input.stageCamera==='close'&&zone==='neon'?.72:1;
 const mix=clamp(strength*(.10+.10*t)*(phase.phase==='break'?.45:1)*cinema,0,.13);
 return {active:true,zone,phase:phase.phase,brightnessFactor:clamp(factor,.88,1),
  mix,accent:accentByZone[zone],reason:'Bestätigter V318-Songabschnitt · bestehender LAN-Takt'};
}
/** Subtle optical tint; never raises a V915 group/master-capped target. Max 18 RGB
 * points per existing send tick, and no sudden positive brightness jump.
 */
export function applyGoveeSyncV1027(look:GoveeLookV1027,previous:GoveeLookV1027|undefined,
 decision:GoveeSyncDecisionV1027,masterBrightness:number):GoveeLookV1027{
 if(!decision.active||!Number.isFinite(masterBrightness)||masterBrightness<1||masterBrightness>100||
  !Number.isFinite(look?.brightness)||look.brightness<0||look.brightness>100||
  !['r','g','b'].every(k=>Number.isFinite(look?.color?.[k as keyof GoveeLookV1027['color']]))||
  !Number.isFinite(decision.mix)||decision.mix<0||decision.mix>.13||
  !Number.isFinite(decision.brightnessFactor)||decision.brightnessFactor<.88||decision.brightnessFactor>1||
  !['r','g','b'].every(k=>Number.isFinite(decision.accent?.[k as keyof GoveeLookV1027['color']])&&
   decision.accent[k as keyof GoveeLookV1027['color']]>=0&&decision.accent[k as keyof GoveeLookV1027['color']]<=255))
  return look;
 const target=Math.min(Math.round(look.brightness*decision.brightnessFactor),Math.round(look.brightness),Math.round(masterBrightness));
 const brightness=Math.min(target,previous&&Number.isFinite(previous.brightness)?Math.round(previous.brightness)+7:target);
 const color={r:0,g:0,b:0};
 for(const key of ['r','g','b'] as const){
  const current=clamp(Math.round(look.color[key]),0,255);
  const desired=Math.round(current*(1-decision.mix)+decision.accent[key]*decision.mix);
  const prior=previous&&Number.isFinite(previous.color?.[key])?clamp(Math.round(previous.color[key]),0,255):current;
  color[key]=clamp(desired,prior-18,prior+18);
 }
 return {brightness,color};
}
