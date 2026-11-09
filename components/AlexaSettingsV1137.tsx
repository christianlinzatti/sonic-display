'use client';
import {useEffect,useState} from 'react';
import {AlexaArtistPermissionV1007} from './AlexaArtistControlV1007';
import {AlexaToolsV1008} from './AlexaVoiceControlV1008';
import {ALEXA_LOCAL_ENABLED_KEY_V967} from '@/lib/alexaConcertV967';
import {parseArtistVoiceConsentV1007} from '@/lib/alexaArtistV1007';
import {ALEXA_GOVEE_CONSENT_EVENT_V970,ALEXA_GOVEE_RESET_EVENT_V970,loadAlexaGoveeConsentV970,saveAlexaGoveeConsentV970} from '@/lib/alexaGoveeV970';
import model from '../integrations/alexa/interaction-model.de-DE.json';

const LOCAL_EVENT='sonic-display:alexa-local-status-v971';
const GROUPS:{title:string;permission:string;intents:readonly string[]}[]=[
 {title:'Konzertmodi',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['ArenaIntent','FestivalIntent','ClubIntent','CalmIntent','StopShowIntent']},
 {title:'Smart Concert Presets',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['RapPresetIntent','HardtekkPresetIntent','RockPresetIntent','CinemaPresetIntent','AutoPresetIntent']},
 {title:'Bühnenbereiche und Lichtfarben',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['StageZoneIntent','BackdropZoneIntent','AudienceZoneIntent','AllZonesIntent','WarmMoodIntent','CoolMoodIntent','NeonMoodIntent','AutoMoodIntent']},
 {title:'Virtuelle Bühneneffekte',permission:'Alexa-Empfang und geöffnetes Konzertstudio',intents:['VirtualFxOnIntent','VirtualFxOffIntent','BeamsEffectIntent','FogEffectIntent','ConfettiEffectIntent','StreamersEffectIntent','AutoEffectIntent','EffectsOffIntent']},
 {title:'Govee-Raumlicht',permission:'Zusätzliche Govee-Freigabe, laufende Musik und aktive Govee-Synchronisation',intents:['GoveeArenaIntent','GoveeFestivalIntent','GoveeClubIntent','GoveeCalmIntent','GoveeDimIntent','GoveeAutoIntent']},
 {title:'Spotify-Künstler',permission:'Zusätzliche Künstlerfreigabe und Spotify-Follow-Berechtigung',intents:['LikeArtistIntent','UnlikeArtistIntent','FollowAllArtistsIntent','ArtistStatusIntent','UndoArtistIntent','FollowPrimaryArtistIntent','UnfollowPrimaryArtistIntent','SelectFirstArtistIntent','SelectSecondArtistIntent','SelectThirdArtistIntent','SelectArtistIntent']},
 {title:'Anzeige und Avatar',permission:'Zusätzliche Anzeigefreigabe',intents:['LyricsOnIntent','LyricsOffIntent','NextAvatarIntent','CalmDisplayIntent','NormalDisplayIntent']},
 {title:'Status und Hilfe',permission:'Alexa-Empfang; Hilfe, Abbrechen und Stopp funktionieren auch ohne Displayverbindung',intents:['StatusIntent','LastVoiceResultIntent','AllCommandsIntent','AMAZON.HelpIntent','AMAZON.CancelIntent','AMAZON.StopIntent']}
];
const BUILTIN_EXAMPLES:Record<string,string>={
 'AMAZON.HelpIntent':'Hilfe','AMAZON.CancelIntent':'Abbrechen','AMAZON.StopIntent':'Stopp'
};
const commands=model.interactionModel.languageModel.intents.filter(intent=>intent.name!=='AMAZON.FallbackIntent');
const grouped=new Set(GROUPS.flatMap(group=>group.intents));
const CATALOG=[...GROUPS,{title:'Weitere Sprachbefehle',permission:'Je nach Befehl passende Freigabe erforderlich',intents:commands.filter(command=>!grouped.has(command.name)).map(command=>command.name)}];

export function AlexaCommandHelpV1137(){
 const [query,setQuery]=useState('');
 const term=query.trim().toLocaleLowerCase('de-DE');
 const matching=commands.filter(command=>[command.name,...command.samples,BUILTIN_EXAMPLES[command.name]||''].some(value=>value.toLocaleLowerCase('de-DE').includes(term)));
 return <details className="govee-v958" aria-label="Alexa Hilfe und Befehlsliste">
  <summary>Alexa-Hilfe: alle {commands.length} Sprachbefehle anzeigen</summary>
  <p className="settings-note">Sprich zuerst „Alexa, sage Sonic Display, …“. Die Beispiele stammen aus dem deutschen Alexa-Interaktionsmodell. Das Sprachmodell und die AWS-Lambda-Funktion müssen bei Änderungen separat im Alexa Developer-Konto aktualisiert werden.</p>
  <label>Sprachbefehle suchen
   <input type="search" aria-label="Alexa-Befehle durchsuchen" placeholder="z. B. Hardtekk, Lyrics, Govee" value={query} onChange={event=>setQuery(event.target.value)}/>
  </label>
  <p className="settings-note" role="status">{matching.length} von {commands.length} Befehlen</p>
  {CATALOG.map(group=>{
   const visible=matching.filter(command=>group.intents.includes(command.name));
   return visible.length?<section key={group.title} aria-label={group.title}>
    <h4>{group.title} ({visible.length})</h4>
    <p className="settings-note">Voraussetzung: {group.permission}.</p>
    <ul>{visible.map(command=><li key={command.name}>
     <strong>„{command.samples[0]||BUILTIN_EXAMPLES[command.name]||command.name}“</strong>
     {command.samples.length>1&&<details><summary>{command.samples.length-1} weitere Formulierungen</summary>
      <ul>{command.samples.slice(1).map(sample=><li key={sample}>„{sample}“</li>)}</ul>
     </details>}
    </li>)}</ul>
   </section>:null;
  })}
  {!matching.length&&<p role="status">Kein Sprachbefehl passt zur Suche.</p>}
  <p className="settings-note">Die Alexa-Antwort „gesendet“ bestätigt nur die Annahme durch die Bridge. Die Umsetzung erfolgt erst auf einem geöffneten, freigegebenen Display. Spotify-Playback und Lampen-Ein/Aus werden nicht per Alexa gesteuert.</p>
 </details>;
}

export function AlexaSettingsV1137(){
 const [enabled,setEnabled]=useState(false);
 const [goveeEnabled,setGoveeEnabled]=useState(false);
 const [notice,setNotice]=useState('');
 useEffect(()=>{
  const refresh=()=>{try{setEnabled(parseArtistVoiceConsentV1007(localStorage.getItem(ALEXA_LOCAL_ENABLED_KEY_V967)).enabled);}catch{setEnabled(false);}};
  const refreshGovee=()=>setGoveeEnabled(loadAlexaGoveeConsentV970().enabled);
  refresh();refreshGovee();
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
  <p className="settings-note">Die private Alexa-Custom-Skill-Verbindung nutzt AWS Lambda, eine signierte Bridge und Upstash. Alle Freigaben gelten nur für diesen Browser. Für Konzert- und Govee-Kommandos muss das Konzertstudio geöffnet sein; für Künstler- und Anzeigebefehle muss Sonic Display sichtbar geöffnet und mit Spotify verbunden sein.</p>
  <fieldset><legend>Alexa-Empfang</legend>
   <label className="setting-check"><input type="checkbox" checked={enabled} onChange={event=>toggle(event.target.checked)}/> Alexa-Sprachbefehle auf diesem Display empfangen</label>
   <small>Standardmäßig aus. Die Berechtigungen für Spotify-Künstler, Anzeige und Govee werden zusätzlich und getrennt erteilt.</small>
  </fieldset>
  <AlexaArtistPermissionV1007/>
  <AlexaToolsV1008/>
  <fieldset><legend>Govee-Raumlicht per Alexa</legend>
   <label className="setting-check"><input type="checkbox" checked={goveeEnabled} onChange={event=>toggleGovee(event.target.checked)}/> Govee-Lichtstimmungen separat erlauben</label>
   <p className="settings-note">Nur für bereits ausgewählte Lampen mit laufendem Govee-Musik-Sync. Keine Lampen einschalten, keine Änderung an der Spotify-Wiedergabe; bestehende Show-Timelines haben Vorrang.</p>
  </fieldset>
  {notice&&<p role="status">{notice}</p>}
  <AlexaCommandHelpV1137/>
  <p className="settings-note">Einmalige Einrichtung: <a href="https://github.com/christianlinzatti/sonic-display/blob/master/docs/versions/V967-ALEXA-ANBINDUNG.md" target="_blank" rel="noopener noreferrer">Alexa-Skill, Lambda und Bridge konfigurieren</a>.</p>
 </section>;
}
