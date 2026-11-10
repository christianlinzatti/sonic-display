'use client';
import {useEffect,useState} from 'react';
import {AlexaArtistPermissionV1007} from './AlexaArtistControlV1007';
import {AlexaToolsV1008} from './AlexaVoiceControlV1008';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {parseArtistVoiceConsentV1007} from '@/lib/alexaArtistV1007';
import {ALEXA_GOVEE_CONSENT_EVENT_V970,ALEXA_GOVEE_RESET_EVENT_V970,loadAlexaGoveeConsentV970,saveAlexaGoveeConsentV970} from '@/lib/alexaGoveeV970';
import model from '../integrations/alexa/interaction-model.de-DE.json';
import {ALEXA_GOVEE_RECEIVER_EVENT_V1139,readAlexaGoveeReceiverTokenV1139,saveAlexaGoveeReceiverTokenV1139} from '@/lib/alexaGoveeReceiverClientV1139';
import {GoveePowerQuickControlsV1138,GoveePowerPermissionV1138} from './GoveePowerControlsV1138';
import {GoveeLightDashboardV1142} from './GoveeLightDashboardV1142';
import {GoveeMusicVoiceControlsV1143} from './GoveeMusicVoiceControlsV1143';
import {GoveeVoiceLookControlsV1146} from './GoveeVoiceLookControlsV1146';
import {FullConcertVoiceControlsV1145} from './FullConcertVoiceControlsV1145';
import {AlexaConcertScenePreviewV1147} from './AlexaConcertScenePreviewV1147';
import {AlexaConcertVoiceDirectorV1153} from './AlexaConcertVoiceDirectorV1153';
import {AlexaConnectionWizardV1149} from './AlexaConnectionWizardV1149';
import {AlexaLiveDiagnosticsV1150} from './AlexaLiveDiagnosticsV1150';
import {useMusic} from '@/context/MusicContext';
import {classifyAlexaIntentV1148,type AlexaAvailabilityContextV1148} from '@/lib/alexaCommandAvailabilityV1148';
import {ALEXA_ARTIST_KEY_V1007,ALEXA_ARTIST_EVENT_V1007} from '@/lib/alexaArtistV1007';
import {VOICE_DISPLAY_KEY_V1008,VOICE_SETTINGS_EVENT_V1008} from '@/lib/alexaVoiceV1008';
import {GOVEE_CONFIG_EVENT_V909,loadGoveeConfigV909} from '@/lib/goveeLanV909';
import {canExecuteGoveePowerV1138,GOVEE_POWER_CONSENT_EVENT_V1138,loadGoveePowerConsentV1138} from '@/lib/goveePowerV1138';
import {GOVEE_SYNC_CONSENT_EVENT_V1143,loadGoveeSyncConsentV1143} from '@/lib/goveeMusicVoiceV1143';
import {GOVEE_LOOK_CONSENT_EVENT_V1146,loadGoveeLookConsentV1146} from '@/lib/goveeVoiceLookV1146';
import {ALEXA_FULL_CONCERT_EVENT_V1145,loadFullConcertConsentV1145} from '@/lib/alexaFullConcertV1145';

const LOCAL_EVENT='sonic-display:alexa-local-status-v971';
const GROUPS:{title:string;permission:string;intents:readonly string[]}[]=[
 {title:'Komplette 360-Grad-Konzertshow',permission:'Alexa-Empfang, eigene Konzertshow-Freigabe, Spotify-Wiedergabe und sichtbares Display',intents:['FullConcertStartIntent','FullConcertStopIntent','ConcertSceneCalmIntent','ConcertSceneIntenseIntent','ConcertSceneFinaleIntent']},
 {title:'Alexa-Konzertregie 2.0',permission:'V1145 Konzertshow plus V1153 Regie-Freigabe, laufende Spotify-Wiedergabe und aktive Alexa-Show',intents:['DirectorStageArenaIntent','DirectorStageFestivalIntent','DirectorStageClubIntent','DirectorMoodWarmIntent','DirectorMoodCoolIntent','DirectorMoodNeonIntent','DirectorMoodAutoIntent','DirectorEnergyCalmIntent','DirectorEnergyBalancedIntent','DirectorEnergyIntenseIntent']},
 {title:'Konzertmodi',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['ArenaIntent','FestivalIntent','ClubIntent','CalmIntent','StopShowIntent']},
 {title:'Smart Concert Presets',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['RapPresetIntent','HardtekkPresetIntent','RockPresetIntent','CinemaPresetIntent','AutoPresetIntent']},
 {title:'Bühnenbereiche und Lichtfarben',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['StageZoneIntent','BackdropZoneIntent','AudienceZoneIntent','AllZonesIntent','WarmMoodIntent','CoolMoodIntent','NeonMoodIntent','AutoMoodIntent']},
 {title:'Virtuelle Bühneneffekte',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['VirtualFxOnIntent','VirtualFxOffIntent','BeamsEffectIntent','FogEffectIntent','ConfettiEffectIntent','StreamersEffectIntent','AutoEffectIntent','EffectsOffIntent']},
 {title:'Govee-Raumlicht',permission:'Für Lichtfarben: separate Govee-Freigabe und Musik-Sync. Für echtes Ein/Aus: eigene Alexa-Power-Freigabe, LAN-Bridge und ausgewählte Lampen',intents:['GoveeArenaIntent','GoveeFestivalIntent','GoveeClubIntent','GoveeCalmIntent','GoveeDimIntent','GoveeAutoIntent','GoveePowerOnIntent','GoveePowerOffIntent','GoveeFixtureOnIntent','GoveeFixtureOffIntent','GoveeGroupOnIntent','GoveeGroupOffIntent','GoveeMusicSyncStartIntent','GoveeMusicSyncPauseIntent','GoveeBrightnessIntent','GoveeColorIntent']},
 {title:'Spotify-Künstler',permission:'Zusätzliche Künstlerfreigabe und Spotify-Follow-Berechtigung',intents:['LikeArtistIntent','UnlikeArtistIntent','FollowAllArtistsIntent','ArtistStatusIntent','UndoArtistIntent','FollowPrimaryArtistIntent','UnfollowPrimaryArtistIntent','SelectFirstArtistIntent','SelectSecondArtistIntent','SelectThirdArtistIntent','SelectArtistIntent']},
 {title:'Anzeige und Avatar',permission:'Zusätzliche Anzeigefreigabe',intents:['LyricsOnIntent','LyricsOffIntent','NextAvatarIntent','CalmDisplayIntent','NormalDisplayIntent']},
 {title:'Status und Hilfe',permission:'Alexa-Empfang; Hilfe, Abbrechen und Stopp funktionieren auch ohne Displayverbindung',intents:['StatusIntent','AvailableCommandsIntent','LastVoiceResultIntent','AllCommandsIntent','AMAZON.HelpIntent','AMAZON.CancelIntent','AMAZON.StopIntent']}
];
const BUILTIN_EXAMPLES:Record<string,string>={
 'AMAZON.HelpIntent':'Hilfe','AMAZON.CancelIntent':'Abbrechen','AMAZON.StopIntent':'Stopp'
};
const commands=model.interactionModel.languageModel.intents.filter(intent=>intent.name!=='AMAZON.FallbackIntent');
const grouped=new Set(GROUPS.flatMap(group=>group.intents));
const CATALOG=[...GROUPS,{title:'Weitere Sprachbefehle',permission:'Je nach Befehl passende Freigabe erforderlich',intents:commands.filter(command=>!grouped.has(command.name)).map(command=>command.name)}];

const DEFAULT_AVAILABILITY_V1148:AlexaAvailabilityContextV1148={
 general:false,artist:false,display:false,power:false,sync:false,look:false,show:false,roomLooks:false,
 spotifyConnected:false,spotifyPlaying:false,goveeConfigured:false,goveeAutoSync:false,receiverToken:false
};
export function AlexaCommandHelpV1137(){
 const {connected,isPlaying}=useMusic();
 const [query,setQuery]=useState('');
 const [onlyPrepared,setOnlyPrepared]=useState(false);
 const [local,setLocal]=useState<AlexaAvailabilityContextV1148>(DEFAULT_AVAILABILITY_V1148);
 useEffect(()=>{
  const refresh=()=>{
   try{
    const read=(key:string)=>parseArtistVoiceConsentV1007(localStorage.getItem(key)).enabled;
    const cfg=loadGoveeConfigV909();
    setLocal({
     general:read(ALEXA_LOCAL_ENABLED_KEY_V967),artist:read(ALEXA_ARTIST_KEY_V1007),
     display:read(VOICE_DISPLAY_KEY_V1008),power:loadGoveePowerConsentV1138().enabled,
     sync:loadGoveeSyncConsentV1143().enabled,look:loadGoveeLookConsentV1146().enabled,
     show:loadFullConcertConsentV1145().enabled,roomLooks:loadAlexaGoveeConsentV970().enabled,
     spotifyConnected:false,spotifyPlaying:false,
     goveeConfigured:canExecuteGoveePowerV1138(cfg),goveeAutoSync:cfg.autoSync,
     receiverToken:Boolean(readAlexaGoveeReceiverTokenV1139())
    });
   }catch{setLocal(DEFAULT_AVAILABILITY_V1148);}
  };
  const events=['storage',LOCAL_EVENT,ALEXA_ARTIST_EVENT_V1007,VOICE_SETTINGS_EVENT_V1008,
   GOVEE_POWER_CONSENT_EVENT_V1138,GOVEE_SYNC_CONSENT_EVENT_V1143,
   GOVEE_LOOK_CONSENT_EVENT_V1146,ALEXA_FULL_CONCERT_EVENT_V1145,
   ALEXA_GOVEE_CONSENT_EVENT_V970,GOVEE_CONFIG_EVENT_V909,ALEXA_GOVEE_RECEIVER_EVENT_V1139];
  refresh();events.forEach(event=>window.addEventListener(event,refresh));
  return()=>events.forEach(event=>window.removeEventListener(event,refresh));
 },[]);
 const context={...local,spotifyConnected:connected,spotifyPlaying:connected&&isPlaying};
 const term=query.trim().toLocaleLowerCase('de-DE');
 const matchingBase=commands.filter(command=>[command.name,...command.samples,BUILTIN_EXAMPLES[command.name]||''].some(value=>value.toLocaleLowerCase('de-DE').includes(term)));
 const matching=matchingBase.filter(command=>!onlyPrepared||classifyAlexaIntentV1148(command.name,context).kind==='local-ready');
 const preparedCount=commands.filter(command=>classifyAlexaIntentV1148(command.name,context).kind==='local-ready').length;
 return <details className="govee-v958" aria-label="Alexa Hilfe und Befehlsliste">
  <summary>Alexa-Hilfe: alle {commands.length} Sprachbefehle anzeigen</summary>
  <p className="settings-note">Sprich zuerst „Alexa, sage Sonic Display, …“. Die Beispiele stammen aus dem deutschen Alexa-Interaktionsmodell. Das Sprachmodell und die AWS-Lambda-Funktion müssen bei Änderungen separat im Alexa Developer-Konto aktualisiert werden.</p>
  <label>Sprachbefehle suchen
   <input type="search" aria-label="Alexa-Befehle durchsuchen" placeholder="z. B. Hardtekk, Lyrics, Govee" value={query} onChange={event=>setQuery(event.target.value)}/>
  </label>
  <label className="setting-check"><input type="checkbox" checked={onlyPrepared} onChange={event=>setOnlyPrepared(event.target.checked)}/>
   Nur lokal vorbereitete Befehle anzeigen</label>
  <p className="settings-note" role="status">V1148 · {preparedCount} von {commands.length} Befehlen lokal vorbereitet; {matching.length} angezeigt.</p>
  <p className="settings-note">„Lokal vorbereitet“ bedeutet nur, dass die hier prüfbaren Freigaben und Voraussetzungen erfüllt sind. Die AWS-Lambda-Funktion, der veröffentlichte Alexa-Skill, Spotify-Berechtigungen und die tatsächliche Hardware-Reaktion sind dadurch nicht bestätigt.</p>
  {CATALOG.map(group=>{
   const visible=matching.filter(command=>group.intents.includes(command.name));
   return visible.length?<section key={group.title} aria-label={group.title}>
    <h4>{group.title} ({visible.length})</h4>
    <p className="settings-note">Voraussetzung: {group.permission}.</p>
    <ul>{visible.map(command=>{
     const availability=classifyAlexaIntentV1148(command.name,context);
     return <li key={command.name}>
      <strong>„{command.samples[0]||BUILTIN_EXAMPLES[command.name]||command.name}“</strong>
      <small style={{display:'block'}}>{availability.label} · {availability.reason}</small>
      {command.samples.length>1&&<details><summary>{command.samples.length-1} weitere Formulierungen</summary>
       <ul>{command.samples.slice(1).map(sample=><li key={sample}>„{sample}“</li>)}</ul>
      </details>}
     </li>;
    })}</ul>
   </section>:null;
  })}
  {!matching.length&&<p role="status">Kein Sprachbefehl passt zur Suche.</p>}
  <p className="settings-note">Einzelgeräte: „Schalte Govee Lampe 1 ein“ (Reihenfolge der ausgewählten Lampen). Gruppen: „Schalte Govee Bühne aus“, „Schalte Govee Ambient ein“. Gruppen verwenden gespeicherte Lichtrollen aus dem Gruppenstudio oder die Gerätezuteilung; nur ausgewählte Lampen werden geschaltet.</p>
  <p className="settings-note">Die Alexa-Antwort „gesendet" bestätigt nur die Annahme durch die Bridge. Die Umsetzung erfolgt erst auf einem geöffneten, freigegebenen Display. Spotify-Playback wird nicht per Alexa gesteuert. Ein/Aus der ausgewählten Govee-Lampen erfordert eine zusätzliche Freigabe.</p>
 </details>;
}

export function AlexaSettingsV1137(){
 const [enabled,setEnabled]=useState(false);
 const [goveeEnabled,setGoveeEnabled]=useState(false);
 const [notice,setNotice]=useState('');
 const [receiverToken,setReceiverToken]=useState('');
 const [receiverSaved,setReceiverSaved]=useState(false);
 useEffect(()=>{
  const refresh=()=>{try{setEnabled(parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)).enabled);}catch{setEnabled(false);}};
  const refreshGovee=()=>setGoveeEnabled(loadAlexaGoveeConsentV970().enabled);
  refresh();refreshGovee();setReceiverSaved(Boolean(readAlexaGoveeReceiverTokenV1139()));
  window.addEventListener(LOCAL_EVENT,refresh);
  window.addEventListener('storage',refresh);
  window.addEventListener('storage',refreshGovee);
  window.addEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,refreshGovee);
  return()=>{window.removeEventListener(LOCAL_EVENT,refresh);window.removeEventListener('storage',refresh);
   window.removeEventListener('storage',refreshGovee);window.removeEventListener(ALEXA_GOVEE_CONSENT_EVENT_V970,refreshGovee);};
 },[]);
 const toggle=(next:boolean)=>{
  try{
   localStorage.setItem(ALEXA_LOCAL_ENABLED_KEY_V967,JSON.stringify({enabled:next,since:next?Date.now():0}));
   setEnabled(next);setNotice(next?'Alexa-Empfang auf diesem Display freigegeben.':'Alexa-Empfang ausgeschaltet.');
   window.dispatchEvent(new Event(LOCAL_EVENT));
   if(!next)window.dispatchEvent(new Event(ALEXA_GOVEE_RESET_EVENT_V970));
  }catch{setNotice('Alexa-Empfang konnte nicht gespeichert werden.');}
 };
 const toggleGovee=(next:boolean)=>{
  try{saveAlexaGoveeConsentV970(next);setGoveeEnabled(next);setNotice(next?'Govee-Sprachsteuerung freigegeben – aktive Govee-Musiksynchronisation erforderlich.':'Govee-Sprachsteuerung gesperrt.');}
  catch{setNotice('Govee-Freigabe konnte nicht gespeichert werden.');}
 };
 return <section aria-label="Alexa Einstellungen">
  <h3>Alexa · Sprachsteuerung</h3>
  <p className="settings-note">Die private Alexa-Custom-Skill-Verbindung nutzt AWS Lambda, eine signierte Bridge und Upstash. Alle Freigaben gelten nur für diesen Browser. Für Konzert- und Govee-Kommandos muss das Konzertstudio geöffnet sein; für Künstler- und Anzeigebefehle muss Sonic Display sichtbar geöffnet und mit Spotify verbunden sein. Govee Ein/Aus funktioniert optional auch ohne Spotify mit einem separaten Empfänger-Token.</p>
  <fieldset><legend>Alexa-Empfang</legend>
   <label className="setting-check"><input type="checkbox" checked={enabled} onChange={event=>toggle(event.target.checked)}/> Alexa-Sprachbefehle auf diesem Display empfangen</label>
   <small>Standardmäßig aus. Die Berechtigungen für Spotify-Künstler, Anzeige und Govee werden zusätzlich und getrennt erteilt.</small>
  </fieldset>
  <AlexaConnectionWizardV1149/>
  <AlexaLiveDiagnosticsV1150/>
  <FullConcertVoiceControlsV1145/>
  <AlexaConcertScenePreviewV1147/>
  <AlexaConcertVoiceDirectorV1153/>
  <AlexaArtistPermissionV1007/>
  <AlexaToolsV1008/>
  <fieldset><legend>Govee-Raumlicht per Alexa</legend>
   <label className="setting-check"><input type="checkbox" checked={goveeEnabled} onChange={event=>toggleGovee(event.target.checked)}/> Govee-Lichtstimmungen separat erlauben</label>
   <p className="settings-note">Nur für bereits ausgewählte Lampen mit laufendem Govee-Musik-Sync. Keine Lampen einschalten, keine Änderung an der Spotify-Wiedergabe; bestehende Show-Timelines haben Vorrang.</p>
  </fieldset>
  <GoveePowerPermissionV1138/>
  <GoveeVoiceLookControlsV1146/>
  <fieldset><legend>V1143 · Musik-Sync per Alexa</legend><GoveeMusicVoiceControlsV1143/></fieldset>
  <details><summary>V1139 · Govee-Alexa auch ohne Spotify konfigurieren</summary>
   <p className="settings-note">Optionaler, separater Empfänger-Token für Govee-Schaltbefehle ohne Spotify-Anmeldung. Dieselbe zufällig erzeugte Zeichenfolge (mindestens 32 Zeichen) als geschützte Vercel-Umgebungsvariable <code>ALEXA_GOVEE_RECEIVER_TOKEN</code> hinterlegen. Der Browser-Token berechtigt ausschließlich zum Empfang und zur Bestätigung von Govee-Power-Befehlen, nicht zu Spotify-Aktionen. Das Display muss geöffnet bleiben.</p>
   <label>Govee-Empfänger-Token
    <input type="password" autoComplete="off" value={receiverToken} onChange={e=>setReceiverToken(e.target.value)} placeholder={receiverSaved?'Token auf diesem Display gespeichert':'Mindestens 32 zufällige Zeichen'}/>
   </label>
   <div className="govee-v958-settings">
    <button type="button" onClick={()=>{try{saveAlexaGoveeReceiverTokenV1139(receiverToken);setReceiverSaved(Boolean(receiverToken.trim()));setReceiverToken('');setNotice('Empfänger-Token lokal gespeichert.');}catch(e){setNotice(e instanceof Error?e.message:'Token ungültig.');}}}>Token speichern</button>
    <button type="button" onClick={()=>{try{saveAlexaGoveeReceiverTokenV1139('');setReceiverToken('');setReceiverSaved(false);setNotice('Empfänger-Token von diesem Display entfernt.');}catch{setNotice('Token konnte nicht gelöscht werden.');}}}>Token entfernen</button>
   </div>
   <small role="status">{receiverSaved?'Token lokal hinterlegt':'Kein Token hinterlegt'} · Spotify-Zugriff bleibt unverändert.</small>
  </details>
  <GoveePowerQuickControlsV1138/>
  <details><summary>Govee-Lichtzentrale · Status, Einzelgeräte und Favoriten</summary><GoveeLightDashboardV1142/></details>
  {notice&&<p role="status">{notice}</p>}
  <AlexaCommandHelpV1137/>
  <p className="settings-note">Einmalige Einrichtung: <a href="https://github.com/christianlinzatti/sonic-display/blob/master/docs/versions/V967-ALEXA-ANBINDUNG.md" target="_blank" rel="noopener noreferrer">Alexa-Skill, Lambda und Bridge konfigurieren</a>.</p>
 </section>;
}
