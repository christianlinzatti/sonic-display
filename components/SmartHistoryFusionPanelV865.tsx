'use client';
import {useMemo,useState} from 'react';
import type {HistoryCollectionV707} from '@/lib/listening-sources-v707';
import {auditHistoryFusionV865,fusionDayEventsV865,type FusionRangeV865} from '@/lib/smart-history-fusion-v865';

const formatter=new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit',year:'numeric',timeZone:'UTC'});
const stamp=(iso:string|null)=>iso?new Intl.DateTimeFormat('de-AT',{dateStyle:'medium',timeStyle:'short',timeZone:'UTC'}).format(new Date(iso))+' UTC':'Kein erfasster Eintrag';
const label=(source:'spotify'|'lastfm'|'both')=>source==='both'?'Mögliche Doppelung':source==='spotify'?'Nur Spotify':'Nur Last.fm';
/** Opt-in *visualization* only: no network, polling, storage writes, or history mutation. */
export function SmartHistoryFusionPanelV865({collection}:{collection:HistoryCollectionV707}){
 const [range,setRange]=useState<FusionRangeV865>(30);
 const [day,setDay]=useState('');
 const audit=useMemo(()=>auditHistoryFusionV865(collection,range),[collection,range]);
 const selected=audit.days.find(d=>d.date===day)??audit.days[audit.days.length-1];
 const entries=selected?fusionDayEventsV865(audit,selected.date):[];
 const activity=audit.days.slice(-31);
 const max=Math.max(1,...activity.map(d=>d.counted));
 return <section className="history-fusion-v865" aria-label="Smart History Fusion 2.0">
  <header><span className="recent-insight-kicker-v673">V865 / QUELLEN-QUALITÄT</span><h4>Smart History Fusion 2.0</h4><p>Vergleiche deine lokalen Spotify- und Last.fm-Einträge, ohne die Originalarchive zusammenzuschreiben.</p></header>
  <div className="history-fusion-toolbar-v865"><label>Vergleichszeitraum <select value={range} onChange={(e:{target:{value:string}})=>{setRange(Number(e.target.value) as FusionRangeV865);setDay('');}}><option value="30">30 Tage</option><option value="90">90 Tage</option><option value="365">365 Tage</option></select></label><small>Kalendertage und Zeitangaben in UTC</small></div>
  <div className="history-fusion-metrics-v865">
   <div><strong>{audit.spotify}</strong><span>Spotify-Ereignisse</span></div><div><strong>{audit.lastfm}</strong><span>Last.fm-Scrobbles</span></div>
   <div><strong>{audit.paired}</strong><span>Mögliche 1:1-Doppelungen</span></div><div><strong>{audit.counted}</strong><span>Nach Abgleich gezählt</span></div>
  </div>
  <div className="history-fusion-metrics-v865"><div><strong>{audit.spotifyOnly}</strong><span>Nur Spotify</span></div><div><strong>{audit.lastfmOnly}</strong><span>Nur Last.fm</span></div><div><strong>{audit.sourceOnlyDays}</strong><span>Tage mit nur einer Quelle</span></div><div><strong>{audit.quietInsideDays}</strong><span>Leere Tage im beobachteten Zeitfenster</span></div></div>
  <div className="history-fusion-period-v865"><p><strong>Spotify-Archiv:</strong> {stamp(audit.firstSpotify)} – {stamp(audit.lastSpotify)}</p><p><strong>Last.fm-Archiv:</strong> {stamp(audit.firstLastfm)} – {stamp(audit.lastLastfm)}</p></div>
  <div className="history-fusion-graph-v865"><h5>Die letzten {activity.length} Tage – Tagesvergleich</h5>
   <div className="history-fusion-day-grid-v865" role="group" aria-label="Tag für Quellenvergleich auswählen">{activity.map(d=><button type="button" key={d.date} className="history-fusion-day-v865" aria-label={`${d.date}: ${d.spotify} Spotify, ${d.lastfm} Last.fm, ${d.paired} mögliche Paare`} aria-pressed={selected?.date===d.date} onClick={()=>setDay(d.date)} title={`${d.date}: ${d.spotify} Spotify / ${d.lastfm} Last.fm`}><span className="history-fusion-day-bars-v865"><i style={{height:`${d.spotify/max*100}%`}}/><i style={{height:`${d.lastfm/max*100}%`}}/></span><small>{d.date.slice(8)}</small></button>)}</div>
   <p className="history-fusion-legend-v865"><span>■ Spotify</span><span>■ Last.fm</span> · Antippen für Einzelereignisse</p>
  </div>
  {selected&&<section className="history-fusion-details-v865"><h5>{formatter.format(new Date(selected.date+'T12:00:00Z'))}: {selected.counted} gezählte Ereignisse</h5>
   <p>{selected.paired} mögliche Paare · {selected.spotifyOnly} nur Spotify · {selected.lastfmOnly} nur Last.fm</p>
   {entries.length===0?<p>Keine Ereignisse für diesen UTC-Tag im geladenen Archiv.</p>:<ol>{entries.map((e,i)=><li key={`${e.playedAt}-${e.source}-${e.songKey}-${i}`}><div><strong>{e.title}</strong><small>{e.artist} · {stamp(e.playedAt)}</small></div><span>{label(e.source)}</span></li>)}</ol>}
   {selected.counted>entries.length&&<p>Es werden maximal {entries.length} von {selected.counted} Ereignissen dieses Tages angezeigt.</p>}
  </section>}
  <p className="history-fusion-note-v865">Die Paarbildung aus V707 ist eine <strong>Heuristik</strong>: normalisierter Künstler/Titel, maximal 90 Sekunden Zeitabstand, höchstens eine Zuordnung pro Ereignis. Sie beweist keine identische Wiedergabe; verschiedene Aufnahmeversionen können verwechselt werden. Ein leerer Tag oder ein einseitiger Eintrag beweist <strong>keine</strong> fehlende oder nie erfolgte Wiedergabe. {audit.quietOutsideDays} leere Tage liegen außerhalb des Zeitfensters zwischen dem ersten und letzten archivierten Ereignis. Keine zusätzlichen API-Anfragen oder Schreibzugriffe.</p>
 </section>;
}
