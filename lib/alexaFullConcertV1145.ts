/** V1145: explicit Alexa opt-in for the existing V958 concert and V1031+ 360° stage.
 * Never starts Spotify, issues LAN power commands, changes manual timelines or selects devices.
 */
import type {UiPreferences} from '@/types/music';
import {loadConcertRoadmapV958,saveConcertRoadmapV958,type ConcertSettingsV958} from './ultimateConcertRoadmapV958';
import {loadGoveeConfigV909,saveGoveeConfigV909} from './goveeLanV909';
import {canExecuteGoveePowerV1138} from './goveePowerV1138';
import {loadGoveeSyncConsentV1143} from './goveeMusicVoiceV1143';
import type {VoiceMessageV1008,VoiceResultV1008} from './alexaVoiceV1008';

export const ALEXA_FULL_CONCERT_KEY_V1145='sonic-display:alexa-full-concert-v1145';
export const ALEXA_FULL_CONCERT_EVENT_V1145='sonic-display:alexa-full-concert-changed-v1145';
export const ALEXA_FULL_CONCERT_ACTIVE_EVENT_V1145='sonic-display:alexa-full-concert-active-v1145';
export const ALEXA_FULL_CONCERT_ACTIVE_KEY_V1145='sonic-display:alexa-full-concert-active-v1145';
export type FullConcertVoiceCommandV1145='concert-show-start'|'concert-show-stop';
export type FullConcertConsentV1145={enabled:boolean;since:number;includeGovee:boolean};
export const isFullConcertVoiceCommandV1145=(x:unknown):x is FullConcertVoiceCommandV1145=>
 x==='concert-show-start'||x==='concert-show-stop';
const ZERO:FullConcertConsentV1145={enabled:false,since:0,includeGovee:false};
const OWNED_UI_KEYS_V1145=[
 'stageTheme','stageRotationEnabledV1031','arenaShowDirectorEnabledV1034','arenaFullSongDirectorEnabledV1035',
 'arenaConcertDirectorEnabledV1048','arenaUltimateConcertEnabledV1052','arenaSmartConcertFlowEnabledV1071',
 'avatarConcertDirectorModeV386'
] as const;
const ROADMAP_KEYS_V1145=[
 'enabled','virtualFx','transitionsV960','lightGovernorV961','narrativeV962','immersiveV966',
 'energyArcV975','intelligentTransitionsV976','storytellingV977','atmosphereV978','liveShowDirectorV979',
 'concertPresetV969'
] as const;
type UiKey=typeof OWNED_UI_KEYS_V1145[number];
type RoadmapKey=typeof ROADMAP_KEYS_V1145[number];
type Snapshot={
 schema:'voice-concert-v1145';since:number;
 uiBefore:Partial<UiPreferences>;uiApplied:Partial<UiPreferences>;
 roadmapBefore:Partial<ConcertSettingsV958>;roadmapApplied:Partial<ConcertSettingsV958>;
 goveeAutoSyncBefore:boolean|null;
};
export function loadFullConcertConsentV1145():FullConcertConsentV1145{
 if(typeof window==='undefined')return ZERO;
 try{
  const raw:unknown=JSON.parse(localStorage.getItem(ALEXA_FULL_CONCERT_KEY_V1145)||'null');
  if(!raw||typeof raw!=='object'||Array.isArray(raw))return ZERO;
  const v=raw as Partial<FullConcertConsentV1145>;
  return v.enabled===true&&typeof v.since==='number'&&Number.isSafeInteger(v.since)&&v.since>0&&v.since<=Date.now()?
   {enabled:true,since:v.since,includeGovee:v.includeGovee===true}:ZERO;
 }catch{return ZERO;}
}
export function saveFullConcertConsentV1145(enabled:boolean,includeGovee=false):FullConcertConsentV1145{
 const value={enabled,since:enabled?Date.now():0,includeGovee:enabled&&includeGovee};
 localStorage.setItem(ALEXA_FULL_CONCERT_KEY_V1145,JSON.stringify(value));
 window.dispatchEvent(new Event(ALEXA_FULL_CONCERT_EVENT_V1145));
 return value;
}
export function planFullConcertV1145(preferences:UiPreferences,roadmap:ConcertSettingsV958):{
 ui:Partial<UiPreferences>;roadmap:ConcertSettingsV958
}{
 const ui:Partial<UiPreferences>={
  stageTheme:'arena360',stageRotationEnabledV1031:!preferences.reducedMotion,
  arenaShowDirectorEnabledV1034:true,arenaFullSongDirectorEnabledV1035:true,
  arenaConcertDirectorEnabledV1048:true,arenaUltimateConcertEnabledV1052:true,
  arenaSmartConcertFlowEnabledV1071:true,
  avatarConcertDirectorModeV386:preferences.avatarConcertDirectorModeV386==='off'?'subtle':preferences.avatarConcertDirectorModeV386
 };
 return {ui,roadmap:{...roadmap,enabled:true,virtualFx:true,hardwareSync:false,
  transitionsV960:true,lightGovernorV961:true,narrativeV962:true,immersiveV966:true,
  energyArcV975:true,intelligentTransitionsV976:true,storytellingV977:true,atmosphereV978:true,
  liveShowDirectorV979:true,concertPresetV969:'arena'}};
}
const fields=<K extends keyof T,T extends object>(source:T,keys:readonly K[]):Pick<T,K>=>{
 const out={} as Pick<T,K>;for(const key of keys)out[key]=source[key];return out;
};
const snapshotOf=(p:UiPreferences,plan:ReturnType<typeof planFullConcertV1145>,before:ConcertSettingsV958,
 goveeAutoSyncBefore:boolean|null):Snapshot=>({
  schema:'voice-concert-v1145',since:Date.now(),
  uiBefore:fields(p,OWNED_UI_KEYS_V1145),uiApplied:fields(plan.ui,OWNED_UI_KEYS_V1145),
  roadmapBefore:fields(before,ROADMAP_KEYS_V1145),roadmapApplied:fields(plan.roadmap,ROADMAP_KEYS_V1145),
  goveeAutoSyncBefore
 });
const validSnapshot=(v:unknown):v is Snapshot=>{
 if(!v||typeof v!=='object'||Array.isArray(v))return false;
 const x=v as Partial<Snapshot>;
 return x.schema==='voice-concert-v1145'&&typeof x.since==='number'&&Number.isSafeInteger(x.since)&&
 x.since>0&&x.since<=Date.now()&&Date.now()-x.since<8*60*60*1000&&
 !!x.uiBefore&&!!x.uiApplied&&!!x.roadmapBefore&&!!x.roadmapApplied;
};
export function readFullConcertSnapshotV1145():Snapshot|null{
 if(typeof window==='undefined')return null;
 try{const value:unknown=JSON.parse(localStorage.getItem(ALEXA_FULL_CONCERT_ACTIVE_KEY_V1145)||'null');
  return validSnapshot(value)?value:null;}catch{return null;}
}
const restoreOwned=(current:Record<string,unknown>,before:Record<string,unknown>,applied:Record<string,unknown>,keys:readonly string[])=>{
 const out:Record<string,unknown>={};
 for(const key of keys)if(current[key]===applied[key])out[key]=before[key];
 return out;
};
export function runFullConcertV1145(command:FullConcertVoiceCommandV1145,options:{
 preferences:UiPreferences;updatePreferences:(patch:Partial<UiPreferences>)=>void;
 connected:boolean;playing:boolean;trackId?:string|null;
 allowed?:()=>boolean;signal?:AbortSignal
}):string{
 const check=()=>{if(options.signal?.aborted||options.allowed?.()===false)throw Error('Konzertshow nicht mehr freigegeben.');};
 check();
 if(command==='concert-show-stop'){
  const snap=readFullConcertSnapshotV1145();
  if(!snap)return 'Keine von Alexa gestartete Konzertshow aktiv. Manuell eingerichtete Shows bleiben unverändert.';
  const current=loadConcertRoadmapV958();
  const ui=restoreOwned(options.preferences as unknown as Record<string,unknown>,
   snap.uiBefore as Record<string,unknown>,snap.uiApplied as Record<string,unknown>,OWNED_UI_KEYS_V1145);
  const road=restoreOwned(current as unknown as Record<string,unknown>,
   snap.roadmapBefore as Record<string,unknown>,snap.roadmapApplied as Record<string,unknown>,ROADMAP_KEYS_V1145);
  check();
  saveConcertRoadmapV958({...current,...road,hardwareSync:false});
  options.updatePreferences(ui as Partial<UiPreferences>);
  if(snap.goveeAutoSyncBefore===false){
   const g=loadGoveeConfigV909();
   if(g.autoSync)saveGoveeConfigV909({...g,autoSync:false});
  }
  localStorage.removeItem(ALEXA_FULL_CONCERT_ACTIVE_KEY_V1145);
  window.dispatchEvent(new Event(ALEXA_FULL_CONCERT_ACTIVE_EVENT_V1145));
  return 'Die Alexa-Konzertshow wurde beendet. Vorherige Bühnen- und Regieeinstellungen sind wiederhergestellt, soweit sie zwischenzeitlich nicht manuell geändert wurden. Govee-Lampen bleiben eingeschaltet, Spotify läuft weiter.';
 }
 if(!options.connected||!options.playing||!options.trackId?.trim())
  throw Error('Bitte zuerst einen Titel in Spotify abspielen. Alexa startet die Show, aber niemals die Wiedergabe.');
 if(readFullConcertSnapshotV1145())return 'Die Alexa-Konzertshow ist bereits gestartet.';
 const prior=loadConcertRoadmapV958(),planned=planFullConcertV1145(options.preferences,prior);
 const consent=loadFullConcertConsentV1145();
 const govee=loadGoveeConfigV909();
 const useGovee=consent.enabled&&consent.includeGovee&&loadGoveeSyncConsentV1143().enabled&&canExecuteGoveePowerV1138(govee);
 const snapshot=snapshotOf(options.preferences,planned,prior,useGovee?govee.autoSync:null);
 check();
 // Snapshot is mandatory for safe reversal. If storage is blocked, nothing is applied.
 localStorage.setItem(ALEXA_FULL_CONCERT_ACTIVE_KEY_V1145,JSON.stringify(snapshot));
 try{
  check();
  saveConcertRoadmapV958(planned.roadmap);
  options.updatePreferences(planned.ui);
  if(useGovee&&!govee.autoSync){
   check();const fresh=loadGoveeConfigV909();
   if(fresh.endpoint===govee.endpoint&&fresh.token===govee.token&&
    JSON.stringify(fresh.selectedIps)===JSON.stringify(govee.selectedIps))
    saveGoveeConfigV909({...fresh,autoSync:true});
  }
  window.dispatchEvent(new Event(ALEXA_FULL_CONCERT_ACTIVE_EVENT_V1145));
 }catch(e){
  // Do not remove the snapshot after a partial application: manual Stop can still restore it.
  throw e;
 }
 return '360-Grad-Arena, Avatar-Regie, virtuelle Effekte und Songdramaturgie gestartet.'+
  (useGovee?' Vorher freigegebene Govee-Musiksynchronisation ist aktiviert; keine Lampe wurde eingeschaltet.':
  ' Govee bleibt unverändert. Für die Lichtintegration sind separate Freigaben erforderlich.');
}
export function executeAlexaFullConcertV1145(message:VoiceMessageV1008,options:{
 since:number;now:()=>number;allowed:()=>boolean;signal?:AbortSignal;
 preferences:UiPreferences;updatePreferences:(patch:Partial<UiPreferences>)=>void;
 connected:boolean;playing:boolean;trackId?:string|null;
}):VoiceResultV1008{
 if(!isFullConcertVoiceCommandV1145(message.command))throw Error('Unbekannter Konzertshow-Befehl.');
 const check=()=>{const now=options.now();if(!Number.isSafeInteger(message.createdAt)||options.since<=0||
  message.createdAt<options.since||message.createdAt>now||now-message.createdAt>30000||
  !options.allowed()||options.signal?.aborted)throw Error('Konzertshow-Befehl ist abgelaufen oder widerrufen.');};
 check();
 return {kind:'complete',text:runFullConcertV1145(message.command,{preferences:options.preferences,
  updatePreferences:options.updatePreferences,connected:options.connected,playing:options.playing,
  trackId:options.trackId,signal:options.signal,allowed:()=>{try{check();return true;}catch{return false;}}})};
}
