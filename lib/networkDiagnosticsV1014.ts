import type {NetworkTelemetryV1011,NetworkProviderIdV1011} from './networkCoordinatorV1010';

/** Read-only and deterministic. No endpoint, identity, token or response metadata. */
export type NetworkFindingV1014={code:'offline'|'rate-limit'|'waiting'|'saturation'|'slow-provider'|'slow-active'|'timeouts'|'normal'|'unverified';
  level:'info'|'warning';title:string;detail:string};
export type NetworkDiagnosisV1014={findings:NetworkFindingV1014[];isVerified:boolean};
export function evaluateNetworkDiagnosticsV1014(state:NetworkTelemetryV1011):NetworkDiagnosisV1014{
  const d=state.diagnostics;
  const findings:NetworkFindingV1014[]=[];
  const add=(code:NetworkFindingV1014['code'],level:NetworkFindingV1014['level'],title:string,detail:string)=>
    findings.push({code,level,title,detail});
  if(state.offline)add('offline','warning','Verbindung offline','Vorhandene Daten weiter anzeigen; nach dem Wiederverbinden kontrolliert aktualisieren.');
  if(state.providers.some(p=>p.blockedForMs>0))add('rate-limit','warning','Anbieterlimit aktiv',
    'Die Wartezeit aus Retry-After wird respektiert. Keine zusätzlichen Testabfragen auslösen.');
  if(!state.offline){
    if(d.oldestQueuedMs>=2000 || (d.samples>=4&&d.queueP95Ms>=1200))
      add('waiting','warning','Lange Wartezeit in der Warteschlange',
        'Anfragen warten vor dem Start. Cache nutzen und optionale Aufgaben später ausführen.');
    const saturated=d.lanes.filter(l=>l.oldestQueuedMs>=750&&state.inFlight[l.name]>=state.limits[l.name]);
    if(saturated.length)add('saturation','warning','Prioritätskapazität ausgelastet',
      'Mindestens eine Anfrage wartet auf einen belegten Kapazitätsbereich.');
    if(d.oldestActiveMs>=8000)add('slow-active','warning','Sehr lange aktive Anfrage',
      'Ein laufender Abruf dauert über acht Sekunden. Der Timeout-Schutz bleibt aktiv.');
    const slow=d.providers.filter(p=>p.samples>=4&&p.latencyP95Ms>=3000);
    if(slow.length){
      const names=slow.map(p=>p.name==='Buehneninhalte'?'Bühneninhalte':p.name).join(', ');
      add('slow-provider','warning','Langsame Antworten nachgewiesen',
        `Hohe P95-Antwortzeit bei ${names}. Optionale Inhalte dürfen die Wiedergabe nicht blockieren.`);
    }
    if(d.failureKinds.Timeout>=2)add('timeouts','warning','Mehrere Zeitüberschreitungen',
      'Zeitlimits und Dienstpausen schützen die Show vor hängenden Anfragen.');
  }
  if(!findings.length){
    if(d.samples<4)add('unverified','info','Zu wenige Messungen','Nach mindestens vier abgeschlossenen Versuchen sind Engpass-Trends aussagekräftiger.');
    else add('normal','info','Keine auffälligen Netzwerkengpässe','Im aktuellen Fünf-Minuten-Fenster sind keine Grenzwerte überschritten.');
  }
  return {findings,isVerified:d.samples>=4};
}
