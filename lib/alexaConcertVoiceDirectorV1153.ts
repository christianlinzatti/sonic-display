/** V1153 · Alexa 360-degree concert director.
 * Only finite virtual-stage commands; never accesses Govee, Spotify playback, user timelines or external networks.
 * Explicit additional opt-in, V1145 owned-show precondition, and per-key reversible overrides.
 */
import type {UiPreferences} from '@/types/music';
import {loadConcertRoadmapV958,saveConcertRoadmapV958,type ConcertSettingsV958} from './ultimateConcertRoadmapV958';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';

export const ALEXA_DIRECTOR_CONSENT_KEY_V1153='sonic-display:alexa-director-consent-v1153';
export const ALEXA_DIRECTOR_CONSENT_EVENT_V1153='sonic-display:alexa-director-consent-changed-v1153';
export const ALEXA_DIRECTOR_SNAPSHOT_KEY_V1153='sonic-display:alexa-director-snapshot-v1153';
export const DIRECTOR_COMMANDS_V1153=[
 'concert-director-stage-arena','concert-director-stage-festival','concert-director-stage-club',
 'concert-director-mood-warm','concert-director-mood-cool','concert-director-mood-neon','concert-director-mood-auto',
 'concert-director-energy-calm','concert-director-energy-balanced','concert-director-energy-intense'
] as const;
export type AlexaDirectorCommandV1153=typeof DIRECTOR_COMMANDS_V1153[number];
export const isAlexaDirectorCommandV1153=(v:unknown):v is AlexaDirectorCommandV1153=>
 typeof v==='string'&&(DIRECTOR_COMMANDS_V1153 as readonly string[]).includes(v);
export type DirectorConsentV1153={enabled:boolean;since:number};
const EMPTY:DirectorConsentV1153={enabled:false,since:0};
export function loadDirectorConsentV1153():DirectorConsentV1153{
 if(typeof window==='undefined')return EMPTY;
 try{
  const v:unknown=JSON.parse(localStorage.getItem(ALEXA_DIRECTOR_CONSENT_KEY_V1153)||'null');
  if(!v||typeof v!=='object'||Array.isArray(v))return EMPTY;
  const obj=v as Partial<DirectorConsentV1153>;
  return obj.enabled===true&&typeof obj.since==='number'&&Number.isSafeInteger(obj.since)&&obj.since>0&&obj.since<=Date.now()?
   {enabled:true,since:obj.since}:EMPTY;
 }catch{return EMPTY;}
}
export function saveDirectorConsentV1153(enabled:boolean):DirectorConsentV1153{
 const data={enabled,since:enabled?Date.now():0};
 localStorage.setItem(ALEXA_DIRECTOR_CONSENT_KEY_V1153,JSON.stringify(data));
 window.dispatchEvent(new Event(ALEXA_DIRECTOR_CONSENT_EVENT_V1153));
 return data;
}
export type VoiceDirectorPlanV1153={
 ui:Partial<UiPreferences>;road:Partial<ConcertSettingsV958>;message:string;hardwareSync:false;
};
export function planVoiceDirectorV1153(command:AlexaDirectorCommandV1153,reducedMotion:boolean):VoiceDirectorPlanV1153{
 if(!isAlexaDirectorCommandV1153(command))throw Error('Unbekannter Konzertregie-Befehl.');
 const ui:Partial<UiPreferences>={},road:Partial<ConcertSettingsV958>={};
 let message='';
 switch(command){
  case 'concert-director-stage-arena':
   ui.stageTheme='arena360';road.concertPresetV969='arena';road.liveShowStyleV979='cinematic';
   message='360-Grad-Arena als virtuelle Bühne gewählt.';break;
  case 'concert-director-stage-festival':
   ui.stageTheme='festival';road.concertPresetV969='festival';road.liveShowStyleV979='festival';
   message='Festival-Bühne als virtuelle Bühne gewählt.';break;
  case 'concert-director-stage-club':
   ui.stageTheme='neon';road.concertPresetV969='club';road.liveShowStyleV979='club';
   message='Neon-Club als virtuelle Bühne gewählt.';break;
  case 'concert-director-mood-warm':road.voiceMoodV968='warm';message='Warme virtuelle Lichtstimmung gewählt.';break;
  case 'concert-director-mood-cool':road.voiceMoodV968='cool';message='Kühle virtuelle Lichtstimmung gewählt.';break;
  case 'concert-director-mood-neon':road.voiceMoodV968='neon';message='Neon-Lichtstimmung gewählt.';break;
  case 'concert-director-mood-auto':road.voiceMoodV968='auto';message='Automatische virtuelle Lichtstimmung wieder aktiviert.';break;
  case 'concert-director-energy-calm':
  case 'concert-director-energy-balanced':
  case 'concert-director-energy-intense':{
   const requested=command==='concert-director-energy-calm'?25:command==='concert-director-energy-balanced'?55:80;
   const strength=reducedMotion?Math.min(requested,40):requested;
   ui.arenaShowIntensityV1035=strength;
   road.strength=strength;road.energyArcStrengthV975=strength;road.atmosphereStrengthV978=strength;road.liveShowStrengthV979=strength;
   message='Virtuelle Konzertintensität auf '+strength+' Prozent gesetzt.'+(reducedMotion?' Reduzierte Bewegung bleibt geschützt.':'');
   break;
  }
 }
 return {ui,road,message,hardwareSync:false};
}
const UI_KEYS=['stageTheme','arenaShowIntensityV1035'] as const;
const ROAD_KEYS=['concertPresetV969','liveShowStyleV979','voiceMoodV968','strength','energyArcStrengthV975','atmosphereStrengthV978','liveShowStrengthV979'] as const;
type UiKey=typeof UI_KEYS[number];
type RoadKey=typeof ROAD_KEYS[number];
type Snapshot={schema:'alexa-director-v1153';since:number;uiBefore:Partial<Pick<UiPreferences,UiKey>>;
 uiApplied:Partial<Pick<UiPreferences,UiKey>>;roadBefore:Partial<Pick<ConcertSettingsV958,RoadKey>>;
 roadApplied:Partial<Pick<ConcertSettingsV958,RoadKey>>;
};
function isAllowedValue(key:string,value:unknown):boolean{
 if(key==='stageTheme')return ['arena360','festival','neon','classic','minimal','cyberpunk','vaporwave','galaxy','white','rock'].includes(String(value));
 if(key==='concertPresetV969')return ['off','auto','arena','festival','club','cinematic','hardtekk','rock'].includes(String(value));
 if(key==='liveShowStyleV979')return ['adaptive','cinematic','festival','club'].includes(String(value));
 if(key==='voiceMoodV968')return ['auto','warm','cool','neon'].includes(String(value));
 return typeof value==='number'&&Number.isInteger(value)&&value>=0&&value<=100;
}
function validSnapshot(raw:unknown):raw is Snapshot{
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return false;
 const s=raw as Partial<Snapshot>;
 if(s.schema!=='alexa-director-v1153'||!Number.isSafeInteger(s.since)||!s.since||
  s.since>Date.now()||Date.now()-s.since>8*60*60*1000)return false;
 for(const [before,applied,keys] of [
  [s.uiBefore,s.uiApplied,UI_KEYS],[s.roadBefore,s.roadApplied,ROAD_KEYS]
 ] as const){
  if(!before||!applied||typeof before!=='object'||typeof applied!=='object'||Array.isArray(before)||Array.isArray(applied))return false;
  const allowed=new Set<string>(keys);
  for(const [key,value] of Object.entries(before)){
   if(!allowed.has(key)||!isAllowedValue(key,value)||!Object.prototype.hasOwnProperty.call(applied,key)||
    !isAllowedValue(key,(applied as Record<string,unknown>)[key]))return false;
  }
  for(const key of Object.keys(applied))if(!allowed.has(key)||!Object.prototype.hasOwnProperty.call(before,key))return false;
 }
 return true;
}
function readSnapshot():Snapshot|null{
 try{
  const raw=localStorage.getItem(ALEXA_DIRECTOR_SNAPSHOT_KEY_V1153);
  if(!raw)return null;
  const data:unknown=JSON.parse(raw);if(!validSnapshot(data))throw Error('Ungültige Konzertregie-Sicherung.');
  return data;
 }catch(error){if(error instanceof SyntaxError)throw Error('Ungültige Konzertregie-Sicherung.');throw error;}
}
const ownedPatch=(current:Record<string,unknown>,before:Record<string,unknown>,applied:Record<string,unknown>)=>{
 const patch:Record<string,unknown>={};
 for(const [key,value] of Object.entries(applied))if(current[key]===value)patch[key]=before[key];
 return patch;
};
/** Prevents a manual modification from being overwritten by a later restore. */
export function applyVoiceDirectorV1153(command:AlexaDirectorCommandV1153,options:{
 preferences:UiPreferences;updatePreferences:(patch:Partial<UiPreferences>)=>void;
 showActive:boolean;connected:boolean;playing:boolean;trackId?:string|null;allowed:()=>boolean;signal?:AbortSignal
}):string{
 const check=()=>{if(options.signal?.aborted||!options.allowed())throw Error('Konzertregie-Freigabe widerrufen.');};
 check();
 if(!options.showActive)throw Error('Bitte zuerst die komplette Alexa-Konzertshow starten. Manuelle Shows bleiben unverändert.');
 if(!options.connected||!options.playing||!options.trackId?.trim())throw Error('Bitte zuerst Musik in Spotify abspielen.');
 const planned=planVoiceDirectorV1153(command,options.preferences.reducedMotion===true);
 const currentRoad=loadConcertRoadmapV958(),previous=readSnapshot();
 const snapshot:Snapshot=previous?{
  ...previous,
  uiBefore:{...previous.uiBefore},uiApplied:{...previous.uiApplied},
  roadBefore:{...previous.roadBefore},roadApplied:{...previous.roadApplied}
 }:{
  schema:'alexa-director-v1153',since:Date.now(),uiBefore:{},uiApplied:{},roadBefore:{},roadApplied:{}
 };
 for(const key of UI_KEYS)if(Object.prototype.hasOwnProperty.call(planned.ui,key)){
  const now=options.preferences[key],old=snapshot.uiApplied[key];
  if(!Object.prototype.hasOwnProperty.call(snapshot.uiBefore,key)||now!==old)
   (snapshot.uiBefore as Record<string,unknown>)[key]=now;
  (snapshot.uiApplied as Record<string,unknown>)[key]=planned.ui[key];
 }
 for(const key of ROAD_KEYS)if(Object.prototype.hasOwnProperty.call(planned.road,key)){
  const now=currentRoad[key],old=snapshot.roadApplied[key];
  if(!Object.prototype.hasOwnProperty.call(snapshot.roadBefore,key)||now!==old)
   (snapshot.roadBefore as Record<string,unknown>)[key]=now;
  (snapshot.roadApplied as Record<string,unknown>)[key]=planned.road[key];
 }
 check();
 // Snapshot is saved first; a quota/security error must leave all current settings untouched.
 localStorage.setItem(ALEXA_DIRECTOR_SNAPSHOT_KEY_V1153,JSON.stringify(snapshot));
 check();
 saveConcertRoadmapV958({...currentRoad,...planned.road,hardwareSync:false});
 if(Object.keys(planned.ui).length)options.updatePreferences(planned.ui);
 return planned.message+' Nur die virtuelle Bühne wurde geändert. Govee und Spotify bleiben unverändert.';
}
/** Must run BEFORE V1147 and V1145 restoration, preserving manual changes made after Alexa cues. */
export function restoreVoiceDirectorV1153(options:{
 preferences:UiPreferences;updatePreferences:(patch:Partial<UiPreferences>)=>void;
}):void{
 const snapshot=readSnapshot();if(!snapshot)return;
 const currentRoad=loadConcertRoadmapV958();
 const road=ownedPatch(currentRoad as unknown as Record<string,unknown>,
  snapshot.roadBefore as Record<string,unknown>,snapshot.roadApplied as Record<string,unknown>);
 const ui=ownedPatch(options.preferences as unknown as Record<string,unknown>,
  snapshot.uiBefore as Record<string,unknown>,snapshot.uiApplied as Record<string,unknown>);
 if(Object.keys(road).length)saveConcertRoadmapV958({...currentRoad,...road,hardwareSync:false});
 if(Object.keys(ui).length)options.updatePreferences(ui as Partial<UiPreferences>);
 localStorage.removeItem(ALEXA_DIRECTOR_SNAPSHOT_KEY_V1153);
}
export function executeAlexaDirectorV1153(message:VoiceMessageV1008,options:{
 since:number;now:()=>number;allowed:()=>boolean;signal?:AbortSignal;
 preferences:UiPreferences;updatePreferences:(patch:Partial<UiPreferences>)=>void;
 showActive:boolean;connected:boolean;playing:boolean;trackId?:string|null;
}):VoiceResultV1008{
 if(!isAlexaDirectorCommandV1153(message.command))throw Error('Unbekannter Konzertregie-Befehl.');
 const check=()=>{
  const now=options.now();
  if(!Number.isSafeInteger(message.createdAt)||options.since<=0||message.createdAt<options.since||
   message.createdAt>now||now-message.createdAt>30000||options.signal?.aborted||!options.allowed())
   throw Error('Konzertregie-Befehl abgelaufen oder widerrufen.');
 };
 check();
 return {kind:'complete',text:applyVoiceDirectorV1153(message.command,{
  ...options,allowed:()=>{try{check();return true;}catch{return false;}}
 })};
}
