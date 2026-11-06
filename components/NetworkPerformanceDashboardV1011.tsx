'use client';
import {useEffect,useState} from 'react';
import {clientNetworkV1010,type NetworkTelemetryV1011,type NetworkLaneV1010} from '@/lib/networkCoordinatorV1010';

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
      <thead><tr><th>Dienst</th><th>Aktiv</th><th>Wartend</th><th>HTTP 429</th><th>Dienstpause</th><th>Fehlerversuche</th></tr></thead>
      <tbody>{state.providers.map(provider=><tr key={provider.name}>
        <th scope="row">{provider.name==='Buehneninhalte'?'Bühneninhalte':provider.name}</th>
        <td>{provider.active}</td><td>{provider.queued}</td>
        <td>{remaining(provider.blockedForMs)}</td><td>{remaining(provider.circuitForMs)}</td>
        <td>{provider.failures}{provider.lastFailure?` · ${provider.lastFailure}`:''}</td>
      </tr>)}</tbody>
    </table></div>:<p className="network-v1011-empty">Noch keine koordinierten Dienstabfragen in dieser Sitzung beobachtet.</p>}
    <p className="network-v1011-note">{haveTraffic?'Die Zähler erfassen nur die über den V1010-Koordinator laufenden Browser-Anfragen.':'Nach den ersten koordinierten Abrufen erscheinen hier echte Messwerte.'}
      {' '}Fehlerversuche umfassen auch später erfolgreiche Wiederholungen; endgültige Fehler werden separat gezählt.
      Beim Spotify-Kontowechsel oder Abmelden werden die Werte zurückgesetzt. Keine Schlüssel, Kontodaten oder Anfragetexte werden erfasst.</p>
  </section>;
}
