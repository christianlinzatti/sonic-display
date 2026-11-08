/** V1096 – Govee Room Lighting 5.0.
 * Optional, pure overlay for the EXISTING V909 authorised LAN sender.
 * Verified V318 phrases only; never turns a fixture on, sends a second command,
 * requests microphone access or infers a drop from a show template.
 */
import {GOVEE_ZONES_V1027,normalizeGoveeSyncV1027,
 type GoveeZoneV1027,type GoveeSyncSettingsV1027,
 type GoveePhaseCueV1027,type GoveeLookV1027} from './goveeConcertSyncV1027';
import type {ArenaShowCueV1040} from './arena360ShowDesignerV1040';

export const GOVEE_ROOM_KEY_V1096='sonic-display:govee-room-lighting-v1096';
export const GOVEE_ROOM_EVENT_V1096='sonic-display:govee-room-lighting-changed-v1096';
export type GoveeRoomStyleV1096='balanced'|'cinematic'|'festival';
export type GoveeRoomSettingsV1096={schema:'govee-room-v1096';enabled:boolean;strength:number;style:GoveeRoomStyleV1096};
export const DEFAULT_GOVEE_ROOM_V1096:GoveeRoomSettingsV1096={schema:'govee-room-v1096',enabled:false,strength:40,style:'balanced'};
export type GoveeRoomDecisionV1096={active:boolean;reason:string;zone:GoveeZoneV1027|null;
 phase:string;mix:number;brightnessFactor:number;accent:{r:number;g:number;b:number}};
const OFF=(reason:string):GoveeRoomDecisionV1096=>({active:false,reason,zone:null,phase:'ambient',mix:0,brightnessFactor:1,accent:{r:0,g:0,b:0}});
const finite=(v:unknown):v is number=>typeof v==='number'&&Number.isFinite(v);
const clamp=(v:number,lo:number,hi:number)=>Math.max(lo,Math.min(hi,v));
export function normalizeGoveeRoomV1096(raw:unknown):GoveeRoomSettingsV1096{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return {...DEFAULT_GOVEE_ROOM_V1096};
 const v=raw as Partial<GoveeRoomSettingsV1096>;
 if(v.schema!=='govee-room-v1096')return {...DEFAULT_GOVEE_ROOM_V1096};
 return {schema:'govee-room-v1096',enabled:v.enabled===true,
  strength:finite(v.strength)?Math.round(clamp(v.strength,0,60)):40,
  style:v.style==='cinematic'||v.style==='festival'?v.style:'balanced'};
}
export function loadGoveeRoomV1096():GoveeRoomSettingsV1096{
 if(typeof window==='undefined')return {...DEFAULT_GOVEE_ROOM_V1096};
 try{return normalizeGoveeRoomV1096(JSON.parse(window.localStorage.getItem(GOVEE_ROOM_KEY_V1096)||'null'));}
 catch{return {...DEFAULT_GOVEE_ROOM_V1096};}
}
export function saveGoveeRoomV1096(raw:GoveeRoomSettingsV1096):void{
 if(typeof window==='undefined')return;
 const safe=normalizeGoveeRoomV1096(raw);
 try{window.localStorage.setItem(GOVEE_ROOM_KEY_V1096,JSON.stringify(safe));
  window.dispatchEvent(new Event(GOVEE_ROOM_EVENT_V1096));}catch{/* Storage quota or private mode: no unpersisted approval. */}
}
const ZONE_STRENGTH:Record<GoveeZoneV1027,number>={wall:.9,rhythm:1,neon:.8,ambient:.65};
const PALETTE:Record<string,readonly [number,number,number]>={
 rap:[100,55,180],hard:[35,190,215],rock:[220,100,45],pop:[150,100,205]
};
const PHASE_ENERGY:Record<string,number>={verse:.45,hook:.9,build:.7,drop:1,break:.15};
/** Only verified V318 sections can author phase. A V1040 template is creative
 * and supplies at most a small visual tint, never phase or event authority.
 */
export function planGoveeRoomV1096(input:{settings:unknown;syncSettings:GoveeSyncSettingsV1027;
 ip:string;selectedIps:readonly string[];phase:GoveePhaseCueV1027;genre:string;
 show?:ArenaShowCueV1040|null;bridgeEnabled:boolean;autoSync:boolean;directorEnabled:boolean;
 playing:boolean;visible:boolean;stageIsArena:boolean;reducedMotion?:boolean;
 savedShowActive?:boolean;authoredStageActive?:boolean;groupUnisonActive?:boolean;
 recovering?:boolean;voiceActive?:boolean;roomAtmosphereActive?:boolean;
 higherPrioritySyncActive?:boolean;manualOverride?:boolean;
 microphoneActive?:boolean;sampleAgeMs?:number;beatObserved?:boolean;beatStrength?:number;
 }):GoveeRoomDecisionV1096{
 const s=normalizeGoveeRoomV1096(input?.settings);
 if(!s.enabled||s.strength<=0||!input.bridgeEnabled||!input.autoSync||!input.directorEnabled)
  return OFF('V1096 und vorhandene Govee-LAN-Musikfreigabe müssen aktiv sein');
 if(!input.playing||!input.visible||!input.stageIsArena||input.reducedMotion||
  input.savedShowActive||input.authoredStageActive||input.groupUnisonActive||
  input.recovering||input.voiceActive||input.roomAtmosphereActive||
  input.higherPrioritySyncActive||input.manualOverride)
  return OFF('Pause, manuelle oder höher priorisierte Lichtregie hat Vorrang');
 if(!input.phase?.verified||!Object.hasOwn(PHASE_ENERGY,input.phase.phase)||
  !finite(input.phase.transition)||input.phase.transition<0||input.phase.transition>1)
  return OFF('Keine gültige bestätigte V318-Musikphase');
 const ips=input.selectedIps;
 if(!Array.isArray(ips)||ips.length<1||ips.length>4||new Set(ips).size!==ips.length||
  !ips.includes(input.ip))return OFF('Nur ausgewählte maximal vier LAN-Leuchten');
 const sync=normalizeGoveeSyncV1027(input.syncSettings);
 const zone=GOVEE_ZONES_V1027.find(z=>sync.fixtureIps[z]===input.ip);
 if(!zone)return OFF('Leuchte ist keiner der vier Zonen zugeordnet');
 const genre=/hard(?:tekk|style)?|tekk|hardcore/i.test(input.genre)?'hard':
  /rap|hip.?hop/i.test(input.genre)?'rap':/rock|metal|ndh/i.test(input.genre)?'rock':'pop';
 const raw=PALETTE[genre];
 const energy=PHASE_ENERGY[input.phase.phase];
 const styleFactor=s.style==='festival'?1:s.style==='cinematic'?.64:.8;
 const stageFactor=input.show?.active&&finite(input.show.intensity)&&input.show.intensity>=0&&
  input.show.intensity<=100&&finite(input.show.fade)&&input.show.fade>=0&&input.show.fade<=1
  ?(.82+.18*input.show.intensity/100):.9;
 const verifiedBeat=input.microphoneActive===true&&input.beatObserved===true&&
  finite(input.sampleAgeMs)&&input.sampleAgeMs>=0&&input.sampleAgeMs<=900&&
  finite(input.beatStrength)&&input.beatStrength>=.72&&input.beatStrength<=1;
 const measuredAccent=verifiedBeat&&(input.phase.phase==='hook'||input.phase.phase==='drop')?1.12:1;
 const phaseProgress=.65+.35*input.phase.transition;
 const mix=clamp(s.strength/100*.17*ZONE_STRENGTH[zone]*energy*styleFactor*
  stageFactor*phaseProgress*measuredAccent,0,.12);
 const brightnessFactor=clamp(1-s.strength/100*(input.phase.phase==='break'?.10:.045)*
  ZONE_STRENGTH[zone],.92,1);
 const palette={r:raw[0],g:raw[1],b:raw[2]};
 // Four zones get distinct but coordinated color accents, without RGBIC commands.
 const accent={r:clamp(palette.r+(zone==='wall'?12:0),0,255),
  g:clamp(palette.g+(zone==='rhythm'?12:0),0,255),
  b:clamp(palette.b+(zone==='ambient'?-18:0),0,255)};
 return {active:true,reason:'Bestätigte Musikphase · bestehender V909-Sendetakt',
  zone,phase:input.phase.phase,mix,brightnessFactor,accent};
}
/** The current capped look is the brightness ceiling. Per channel the maximum
 * change from the last sent look is 12/255; V961 still runs afterward.
 */
export function applyGoveeRoomV1096(look:GoveeLookV1027,previous:GoveeLookV1027|undefined,
 decision:GoveeRoomDecisionV1096,masterCap:number):GoveeLookV1027{
 if(!decision?.active||!finite(masterCap)||masterCap<0||masterCap>100||
  !finite(look?.brightness)||look.brightness<0||look.brightness>100||
  !finite(decision.mix)||decision.mix<0||decision.mix>.12||
  !finite(decision.brightnessFactor)||decision.brightnessFactor<.92||decision.brightnessFactor>1||
  !['r','g','b'].every(key=>finite(look.color?.[key as keyof typeof look.color])&&
   look.color[key as keyof typeof look.color]>=0&&look.color[key as keyof typeof look.color]<=255&&
   finite(decision.accent?.[key as keyof typeof look.color])&&
   decision.accent[key as keyof typeof look.color]>=0&&decision.accent[key as keyof typeof look.color]<=255))return look;
 const color={r:0,g:0,b:0};
 for(const key of ['r','g','b'] as const){
  const source=look.color[key];
  const target=Math.round(source*(1-decision.mix)+decision.accent[key]*decision.mix);
  const from=previous&&finite(previous.color?.[key])?clamp(previous.color[key],0,255):source;
  color[key]=Math.round(clamp(target,from-12,from+12));
 }
 return {brightness:Math.floor(Math.min(look.brightness,masterCap,look.brightness*decision.brightnessFactor)),color};
}
