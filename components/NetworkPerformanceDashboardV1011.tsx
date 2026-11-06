'use client';
import {useEffect,useState} from 'react';
import {clientNetworkV1010,type NetworkTelemetryV1011,type NetworkLaneV1010} from '@/lib/networkCoordinatorV1010';
import {evaluateNetworkHealthV1012} from '@/lib/networkHealthV1012';
import {evaluateNetworkDiagnosticsV1014} from '@/lib/networkDiagnosticsV1014';

const laneLabels:Record<NetworkLaneV1010,string>={
  action:'Benutzeraktionen',playback:'Wiedergabe',regular:'Lyrics & Genre',optional:'Optionale Inhalte',
};
const lanes:NetworkLaneV1010[]=['action','playback','regular','optional'];
const remaining=(value:number)=>value>0?`${Math.ceil(value/1000)} s`:'–';

/** V1011: passive telemetry only. No HTTP requests, account IDs, endpoints or raw errors. */
export function NetworkPerformanceDashboardV1011(){
  const [state,setState]=useState<NetworkTelemetryV1011>(()=>clientNetworkV1010.snapshotV1011());
  useEffect(()=>{
    const update=()=>setState(clientNetworkV1010.snapshotV1011());
    const unsubscribe=clientNetworkV1010.subscribeTelemetryV1011(update);
    update();
    // Refresh cooldown countdowns while visible; never poll external providers.
    const tick=window.setInterval(()=>{if(!document.hidden)update();},1000);
    document.addEventListener('visibilitychange',update);
    window.addEventListener('online',update);window.addEventListener('offline',update);
    return ()=>{unsubscribe();window.clearInterval(tick);
      document.removeEventListener('visibilitychange',update);
      window.removeEventListener('online',update);window.removeEventListener('offline',update);};
  },[]);
  const health=evaluateNetworkHealthV1012(state);
  const diagnostic=evaluateNetworkDiagnosticsV1014(state);
  const windowData=state.diagnostics;
  const inflight=lanes.reduce((sum,lane)=>sum+state.inFlight[lane],0);
  const cacheReads=state.counters.cacheHits+state.counters.staleHits;
  const joined=state.counters.joined;
  const haveTraffic=state.counters.started+cacheReads+joined>0;
  return <section className="network-v1011" aria-label="Network Performance Dashboard" data-v1011-network-dashboard>
    <header className="network-v1011-head">
      <div><span className="network-v1011-kicker">NETWORK PERFORMANCE / V1011</span>
        <h3>Internetabfragen in Echtzeit</h3>
        <p>Lokaler Browser-Koordinator · Messung seit {new Date(state.since).toLocaleTimeString('de-AT')} · keine zusätzlichen Internetabfragen</p>
      </div>
      <span className="network-v1011-indicator" role="status" aria-live="polite">
        {state.offline?'Offline':state.hidden?'Tab im Hintergrund':'Monitoring aktiv'}
      </span>
    </header>
    <div className="network-v1012-health" data-v1012-network-health aria-label="Intelligent Network Health">
      <div className="network-v1012-head">
        <div><span className="network-v1011-kicker">AUTO RECOVERY / V1012</span>
          <h4>Netzwerkdiagnose: {health.title}</h4>
          <p>{health.detail}</p></div>
        <span className="network-v1012-state" data-health={health.level}>{health.level==='healthy'?'Erfolgreich':health.level==='unverified'?'Ungeprüft':health.level==='recovering'?'Erholung':'Achtung'}</span>
      </div>
      <div className="network-v1012-actions" aria-label="Empfohlene Maßnahmen">
        {health.advice.map(item=><div key={item.code} className="network-v1012-advice">
          <strong>{item.title}</strong><span>{item.detail}</span>
        </div>)}
      </div>
      <div className="network-v1012-metrics">
        <span>{state.recovery.circuitsOpened} Dienstpausen</span>
        <span>{state.recovery.probes} einzelne Prüfanfragen</span>
        <span>{state.recovery.restored} Erholungen</span>
        <span>{state.recovery.staged} gestaffelte Abrufe</span>
      </div>
      <button type="button" className="network-v1012-wake" onClick={()=>clientNetworkV1010.wake()}
        disabled={state.offline} title="Gibt nur bereits wartende Aufträge frei; erzeugt keine neue Internetanfrage">
        Wartende Abfragen erneut prüfen
      </button>
    </div>
    <section className="network-v1014-diagnostics" data-v1014-network-diagnostics aria-label="Netzwerkengpässe und Laufzeiten">
      <div className="network-v1014-heading"><div>
        <span className="network-v1011-kicker">NETWORK DIAGNOSTICS 2.0 / V1014</span>
        <h4>Wo entsteht die Verzögerung?</h4>
      </div><span className="network-v1014-window">Letzte 5 Minuten · {windowData.samples} / {windowData.sampleLimit} Messungen</span></div>
      <div className="network-v1014-stats">
        <div><strong>{windowData.latencyP50Ms} ms</strong><span>Antwortzeit P50</span></div>
        <div><strong>{windowData.latencyP95Ms} ms</strong><span>Antwortzeit P95</span></div>
        <div><strong>{windowData.queueP95Ms} ms</strong><span>Wartezeit P95</span></div>
        <div><strong>{windowData.oldestActiveMs} ms</strong><span>Ältester aktiver Abruf</span></div>
        <div><strong>{windowData.oldestQueuedMs} ms</strong><span>Längste aktuelle Wartezeit</span></div>
      </div>
      <div className="network-v1014-findings" aria-label="Ermittelte Engpässe">
        {diagnostic.findings.map(finding=><div key={finding.code} data-level={finding.level}>
          <strong>{finding.title}</strong><p>{finding.detail}</p></div>)}
      </div>
      <div className="network-v1011-scroll"><table className="network-v1011-table network-v1014-table">
        <thead><tr><th>Dienst</th><th>Versuche</th><th>Antwort P50</th><th>Antwort P95</th><th>Warten P95</th><th>Fehler</th></tr></thead>
        <tbody>{windowData.providers.map(provider=><tr key={provider.name}>
          <th scope="row">{provider.name==='Buehneninhalte'?'Bühneninhalte':provider.name}</th>
          <td>{provider.samples}</td><td>{provider.latencyP50Ms} ms</td><td>{provider.latencyP95Ms} ms</td>
          <td>{provider.queueP95Ms} ms</td><td>{provider.failures}</td></tr>)}</tbody>
      </table></div>
      <p className="network-v1011-note">P50/P95 beruhen auf abgeschlossenen Versuchen in diesem Browser-Tab. Bei wenigen Messungen sind sie noch kein stabiler Trend. Es werden keine zusätzlichen Anfragen, URLs, Songtitel, Kontonamen oder Fehlertexte gespeichert.</p>
    </section>
    <div className="network-v1011-stats" aria-label="Netzwerk-Kennzahlen">
      <div><strong>{inflight}</strong><span>Aktive Anfragen</span></div>
      <div><strong>{state.queue}<small> / {state.queueLimit}</small></strong><span>Warteschlange (Spitze {state.peakQueue})</span></div>
      <div><strong>{cacheReads}</strong><span>Cache-Antworten ({state.counters.staleHits} veraltet)</span></div>
      <div><strong>{joined}</strong><span>Geteilte Anfragen</span></div>
      <div><strong>{state.counters.rateLimits}</strong><span>HTTP-429-Limits</span></div>
      <div><strong>{state.counters.failed}</strong><span>Endgültige Fehler</span></div>
    </div>
    <div className="network-v1011-lanes" aria-label="Kapazität nach Priorität">
      <h4>Priorität & Kapazität</h4>
      {lanes.map(lane=><div className="network-v1011-lane" key={lane}>
        <div><span>{laneLabels[lane]}</span><strong>{state.inFlight[lane]} / {state.limits[lane]}</strong></div>
        <progress max={Math.max(1,state.limits[lane])} value={state.inFlight[lane]} aria-label={`${laneLabels[lane]} ausgelastet`}/>
      </div>)}
    </div>
    <div className="network-v1011-detail">
      <span><strong>{state.counters.completed}</strong> erfolgreich</span>
      <span><strong>{state.counters.retries}</strong> Wiederholungen</span>
      <span><strong>{state.counters.cancelled}</strong> abgebrochen</span>
      <span><strong>{state.counters.queueDropped}</strong> verworfen</span>
      <span><strong>{state.cacheEntries} / {state.cacheLimit}</strong> Cache-Einträge</span>
      <span><strong>{state.averageLatencyMs} ms</strong> Ø abgeschlossene Antwort</span>
    </div>
    <h4>Dienste & Schutzmechanismen</h4>
    {state.providers.length>0?<div className="network-v1011-scroll"><table className="network-v1011-table">
      <thead><tr><th>Dienst</th><th>Aktiv</th><th>Wartend</th><th>HTTP 429</th><th>Dienstpause</th><th>Fehlerversuche</th><th>Gesundheit</th></tr></thead>
      <tbody>{state.providers.map(provider=><tr key={provider.name}>
        <th scope="row">{provider.name==='Buehneninhalte'?'Bühneninhalte':provider.name}</th>
        <td>{provider.active}</td><td>{provider.queued}</td>
        <td>{remaining(provider.blockedForMs)}</td><td>{remaining(provider.circuitForMs)}</td>
        <td>{provider.failures}{provider.lastFailure?` · ${provider.lastFailure}`:''}</td>
        <td>{health.providerHealth.find(item=>item.name===provider.name)?.message??'Ungeprüft'}</td>
      </tr>)}</tbody>
    </table></div>:<p className="network-v1011-empty">Noch keine koordinierten Dienstabfragen in dieser Sitzung beobachtet.</p>}
    <p className="network-v1011-note">{haveTraffic?'Die Zähler erfassen nur die über den V1010-Koordinator laufenden Browser-Anfragen.':'Nach den ersten koordinierten Abrufen erscheinen hier echte Messwerte.'}
      {' '}Fehlerversuche umfassen auch später erfolgreiche Wiederholungen; endgültige Fehler werden separat gezählt.
      Beim Spotify-Kontowechsel oder Abmelden werden die Werte zurückgesetzt. Keine Schlüssel, Kontodaten oder Anfragetexte werden erfasst.</p>
  </section>;
}
