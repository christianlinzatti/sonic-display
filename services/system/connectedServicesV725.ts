/** V725: read-only, evidence-based service overview. No credentials, network probes, or synthetic success claims. */
import type {ConfigurationSnapshotV667,ServiceConfigurationV667} from './configurationStatusV667';

export type V725State='working'|'attention'|'disabled'|'unknown';
export type V725Group='core'|'lyrics'|'optional';
export type V725Card={id:string;label:string;group:V725Group;configured:boolean|null;enabled:boolean|null;state:V725State;explanation:string;action:string;observedAt:string|null};
export type V725Input={
 snapshot:ConfigurationSnapshotV667|null;serverError:boolean;
 spotify:{connected:boolean;error:string|null;fetchedAt:number};
 lyrics:{hasTrack:boolean;provider:string|null;enabled:boolean};
 lastfm:{user:string|null;consent:boolean;consentError:string|null;lastSuccessAt:string|null;added:number|null;storageError:boolean};
 now:number;
};
const providers=['lrclib','lyrics-ovh','genius','spotify-lyrics','musixmatch'] as const;
const fmt=(ts:number)=>new Date(ts).toLocaleString('de-AT',{dateStyle:'short',timeStyle:'short'});
const positiveTime=(input:string|null,now:number)=>{
 if(!input)return null;
 const t=Date.parse(input);
 return Number.isFinite(t)&&t>0&&t<=now+60_000?t:null;
};
function byId(s:ConfigurationSnapshotV667|null,id:string):ServiceConfigurationV667|null{
 if(s?.version!==667||!Array.isArray(s.services))return null;
 return s.services.find(i=>i.id===id)??null;
}
const make=(id:string,label:string,group:V725Group,configured:boolean|null,enabled:boolean|null,state:V725State,explanation:string,action:string,observedAt:string|null=null):V725Card=>({id,label,group,configured,enabled,state,explanation,action,observedAt});
const aliases:Record<string,string>={'lrclib':'lrclib','lyrics-ovh':'lyrics.ovh','genius':'genius','spotify-lyrics':'spotify'};
export function buildConnectedServicesV725(input:V725Input):V725Card[]{
 const {snapshot,serverError,spotify,lyrics,lastfm,now}=input;
 const serverNote=serverError?'Serverstatus nicht erreichbar. Konfiguration unbekannt.':'Serverstatus noch nicht geladen. Konfiguration unbekannt.';
 const config=(id:string)=>byId(snapshot,id);
 const state=(id:string)=>config(id)?.configured??null;
 const active=(id:string)=>config(id)?.enabled??null;
 const cards:V725Card[]=[];
 const fresh=Number.isFinite(spotify.fetchedAt)&&spotify.fetchedAt>0&&spotify.fetchedAt<=now+60_000&&now-spotify.fetchedAt<=60_000;
 cards.push(make('spotify','Spotify','core',state('spotify'),active('spotify'),
  spotify.error?'attention':spotify.connected&&fresh?'working':state('spotify')===false?'attention':'unknown',
  spotify.error?'Die Wiedergabe meldet einen Fehler. Anmeldung, Sitzung und Netzwerk prüfen.':
  spotify.connected&&fresh?'Aktuelle Spotify-Laufzeitantwort bestätigt.':state('spotify')===false?'OAuth-/Sitzungs-Konfiguration unvollständig.':
  'Kein aktuelles Spotify-Laufzeitsignal bestätigt; ein hinterlegter Schlüssel ist kein Verbindungstest.',
  spotify.error?'Spotify-Anmeldung und Token-Aktualisierung prüfen':'Spotify verbinden oder Wiedergabe starten',
  spotify.connected&&fresh?fmt(spotify.fetchedAt):null));
 const lastConf=state('lastfm');
 const success=positiveTime(lastfm.lastSuccessAt,now);
 const age=success===null?null:now-success;
 const lastStatus:V725State=lastfm.storageError||lastfm.consentError?'attention':lastConf===false?'attention':
  !lastfm.user?'unknown':!lastfm.consent?'disabled':success===null?'unknown':age!==null&&age>15*60_000?'attention':'working';
 const lastExpl=lastfm.storageError?'Lokale Last.fm-Einstellungen sind nicht lesbar; Archiv nicht verändert.':
  lastfm.consentError??(lastConf===false?'LASTFM_API_KEY auf dem Server fehlt oder ist unvollständig.':
  !lastfm.user?'Noch kein Last.fm-Konto im lokalen Verlauf gewählt.':
  !lastfm.consent?'Automatischer Archiv-Abgleich ist nicht freigegeben. Bestehendes Spotify-Scrobbling bleibt davon unberührt.':
  success===null?'Automatik freigegeben, aber noch kein erfolgreicher Abgleich im Browser protokolliert.':
  `Letzter erfolgreicher Archiv-Abgleich: ${fmt(success)} · ${lastfm.added??0} neue Scrobbles.${age!==null&&age>15*60_000?' Seitdem kein neuer erfolgreicher Lauf bestätigt.':''}`);
 cards.push(make('lastfm','Last.fm-Archiv','core',lastConf,lastfm.consent,lastStatus,lastExpl,
  lastfm.storageError?'Browser-Speicher kontrollieren':lastConf===false?'LASTFM_API_KEY serverseitig einrichten':
  !lastfm.user?'Last.fm-Konto in der History auswählen':!lastfm.consent?'Automatischen Archiv-Abgleich in der History optional aktivieren':
  'History öffnen und Abgleichstatus prüfen',success!==null?fmt(success):null));
 for(const id of providers){
  const c=config(id); const matched=Boolean(lyrics.enabled&&lyrics.hasTrack&&lyrics.provider&&aliases[id]===lyrics.provider);
  const status:V725State=matched?'working':c?.enabled===false?'disabled':'unknown';
  const why=matched?'Hat die Lyrics für den ausgewählten Song tatsächlich geliefert.':
   c===null?serverNote:c.enabled===false?`Nicht aktiv. ${c.note}`:
   lyrics.enabled&&lyrics.hasTrack?'Für den aktuellen Song kein erfolgreicher Abruf über diesen Anbieter bestätigt.':
   'Bereitschaft laut Konfiguration; kein aktueller Provider-Erfolg bestätigt.';
  cards.push(make(id,c?.label??id,'lyrics',c?.configured??null,c?.enabled??null,status,why,
   id==='musixmatch'?'Kein aktiver Lyrics-Provider':c?.configured===false?'Server-Einstellung prüfen':'Song und Lyrics-Anzeige prüfen'));
 }
 const optional=['musicbrainz','theaudiodb','flickr','blob','push','admin'] as const;
 for(const id of optional){
  const c=config(id);
  cards.push(make(id,c?.label??id,'optional',c?.configured??null,c?.enabled??null,c?.enabled===false?'disabled':'unknown',
   c===null?serverNote:`${c.note} · Keine Live-Prüfung dieses Dienstes durchgeführt.`,
   c?.configured===false?'Nur bei Bedarf konfigurieren':'Bei Problemen unter Einstellungen / Diagnose prüfen'));
 }
 return cards;
}
export function summarizeConnectedServicesV725(cards:readonly V725Card[]){
 return {working:cards.filter(i=>i.state==='working').length,attention:cards.filter(i=>i.state==='attention').length,
  disabled:cards.filter(i=>i.state==='disabled').length,unknown:cards.filter(i=>i.state==='unknown').length,total:cards.length};
}
