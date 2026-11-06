import type {NetworkTelemetryV1011,NetworkProviderIdV1011} from './networkCoordinatorV1010';

/** V1012: purely local, read-only diagnostics. Never probes remote APIs. */
export type NetworkHealthLevelV1012 = 'offline'|'login'|'rate-limit'|'paused'|'recovering'|'degraded'|'healthy'|'unverified';
export type NetworkHealthAdviceV1012 = {code:string;level:NetworkHealthLevelV1012;title:string;detail:string};
export type NetworkHealthReportV1012 = {
  level:NetworkHealthLevelV1012;title:string;detail:string;
  advice:NetworkHealthAdviceV1012[];
  providerHealth:Array<{name:NetworkProviderIdV1011;level:NetworkHealthLevelV1012;message:string}>;
};

const reportAdvice=(code:string,level:NetworkHealthLevelV1012,title:string,detail:string):NetworkHealthAdviceV1012=>({code,level,title,detail});

/** Snapshot contains only safe provider groups; do not derive the status from raw URLs or errors. */
export function evaluateNetworkHealthV1012(state:NetworkTelemetryV1011):NetworkHealthReportV1012{
  const offline=state.offline;
  const login=state.providers.some(p=>p.failureStreak>0&&p.lastFailure==='Anmeldung');
  const rateLimit=state.providers.some(p=>p.blockedForMs>0);
  const paused=state.providers.some(p=>p.circuitForMs>0);
  const recovering=state.providers.some(p=>p.probing)||state.recovery.staged>0&&state.queue>0;
  const degraded=state.providers.some(p=>p.failureStreak>=2)||state.counters.failed>0;
  const sawSuccess=state.counters.completed>0;
  const level:NetworkHealthLevelV1012=offline?'offline':login?'login':rateLimit?'rate-limit':paused?'paused':recovering?'recovering':degraded?'degraded':sawSuccess?'healthy':'unverified';
  const copy:Record<NetworkHealthLevelV1012,[string,string]>={
    offline:['Offline – Anzeige läuft weiter','Vorhandene Daten bleiben sichtbar. Neue Abrufe warten auf die Verbindung.'],
    login:['Spotify-Anmeldung prüfen','Eine Anmeldung wurde abgewiesen. Die App wiederholt sie nicht automatisch.'],
    'rate-limit':['Anbieter-Limit aktiv','Eine vom Anbieter verlangte Wartezeit hat Vorrang vor neuen Abfragen.'],
    paused:['Optionaler Dienst vorübergehend pausiert','Nach Ablauf der Dienstpause darf genau eine Anfrage die Erreichbarkeit prüfen.'],
    recovering:['Verbindung wird kontrolliert wiederhergestellt','Wartende Zusatzabfragen werden gestaffelt gestartet. Wiedergabe und Bedienung bleiben bevorzugt.'],
    degraded:['Netzwerk eingeschränkt','Es gab fehlgeschlagene Abrufe. Zwischengespeicherte Inhalte bleiben nutzbar, soweit vorhanden.'],
    healthy:['Koordinierte Abrufe erfolgreich','Mindestens eine koordinierte Anfrage wurde in dieser Sitzung erfolgreich abgeschlossen.'],
    unverified:['Noch keine Messwerte','Es wurden noch keine erfolgreichen koordinierten Abrufe beobachtet.'],
  };
  const advice:NetworkHealthAdviceV1012[]=[];
  if(offline)advice.push(reportAdvice('offline','offline','Verbindung prüfen','Internetverbindung wiederherstellen. Die App startet wartende Abfragen danach kontrolliert neu.'));
  if(login&&!offline)advice.push(reportAdvice('login','login','Spotify erneut verbinden','Anmeldung in den Spotify-Einstellungen kontrollieren. Automatische Wiederholungen mit ungültigen Zugangsdaten werden vermieden.'));
  if(rateLimit&&!offline)advice.push(reportAdvice('limit','rate-limit','Spotify-Wartezeit einhalten','Die Sperrzeit ablaufen lassen; die App startet keine zusätzlichen Testabfragen.'));
  if(paused&&!offline)advice.push(reportAdvice('circuit','paused','Dienstpause abwarten','Ein optionaler Dienst wird nach seiner Pause durch nur eine regulär anstehende Anfrage geprüft.'));
  if(recovering&&!offline&&!paused)advice.push(reportAdvice('recovery','recovering','Wiederanlauf läuft','Optionale Aufgaben bleiben gestaffelt; bewusste Aktionen und Wiedergabestatus haben eigene Kapazitäten.'));
  if(degraded&&!offline&&!login&&!rateLimit&&!paused)advice.push(reportAdvice('errors','degraded','Fehlermuster beobachten','Bei wiederholten Fehlern nach einigen Minuten Netzverbindung oder Dienststatus prüfen.'));
  if(!advice.length)advice.push(reportAdvice('normal',level,'Keine Aktion notwendig',sawSuccess?'Der Koordinator verarbeitet Anfragen regulär.':'Nach den ersten Anfragen zeigt die Übersicht konkrete Empfehlungen.'));
  const providerHealth=state.providers.map(p=>{
    const providerLevel:NetworkHealthLevelV1012=offline?'offline':p.blockedForMs>0?'rate-limit':
      p.circuitForMs>0?'paused':p.probing?'recovering':p.failureStreak>0&&p.lastFailure==='Anmeldung'?'login':
      p.failureStreak>=2?'degraded':p.lastSuccessAgoMs!==null?'healthy':'unverified';
    const messages:Record<NetworkHealthLevelV1012,string>={
      offline:'Offline',login:'Anmeldung erforderlich','rate-limit':'Limit abwarten',paused:'Dienstpause aktiv',
      recovering:'Prüfanfrage aktiv',degraded:'Wiederholte Fehler',healthy:'Erfolgreiche Antwort beobachtet',unverified:'Nicht bestätigt',
    };
    return {name:p.name,level:providerLevel,message:messages[providerLevel]};
  });
  return {level,title:copy[level][0],detail:copy[level][1],advice,providerHealth};
}
