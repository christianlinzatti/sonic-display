'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {lastFmIntelligenceV711,type V711Period,type V711TimeZone} from '@/lib/lastfm-intelligence-v711';

/** Read-only intelligence: consumes existing in-memory archive, no API or persistence. */
export function LastFmIntelligencePanelV711({events}:{events:readonly LastFmEventV706[]}){
 const [period,setPeriod]=useState<V711Period>('365');
 const [timeZone,setTimeZone]=useState<V711TimeZone>('Europe/Vienna');
 const insight=useMemo(()=>lastFmIntelligenceV711(events,new Date(),period,timeZone),[events,period,timeZone]);
 const maxWeekday=Math.max(1,...insight.weekdays.map(x=>x.count));
 const maxMonth=Math.max(1,...insight.months.map(x=>x.count));
 const maxHour=Math.max(1,...insight.dayparts.map(x=>x.count));
 return <section className="lastfm-intelligence-v711" aria-label="Last.fm History Intelligence">
  <div className="lastfm-intelligence-head-v711"><div><span className="recent-insight-kicker-v673">LAST.FM / HISTORY INTELLIGENCE · V711</span><h4>Deine Hörmuster entdecken</h4><p>Auswertung ausschließlich deiner lokal archivierten Scrobbles. Keine zusätzlichen API-Abfragen und keine Änderungen am Archiv.</p></div>
   <div className="lastfm-intelligence-controls-v711"><label>Analysezeitraum <select value={period} onChange={(e:{target:{value:string}})=>setPeriod(e.target.value as V711Period)}><option value="30">30 Tage</option><option value="90">90 Tage</option><option value="365">365 Tage</option><option value="all">Gesamtes Archiv</option></select></label><label>Zeitzone <select value={timeZone} onChange={(e:{target:{value:string}})=>setTimeZone(e.target.value as V711TimeZone)}><option value="Europe/Vienna">Wien (MEZ/MESZ)</option><option value="UTC">UTC</option></select></label></div>
  </div>
  <div className="lastfm-intelligence-metrics-v711" aria-label="Kennzahlen"><div><strong>{insight.total.toLocaleString('de-AT')}</strong><small>Scrobbles im Zeitraum</small></div><div><strong>{insight.uniqueArtists.toLocaleString('de-AT')}</strong><small>Künstler</small></div><div><strong>{insight.uniqueSongs.toLocaleString('de-AT')}</strong><small>Unterschiedliche Songs</small></div><div><strong>{insight.activeDays.toLocaleString('de-AT')}</strong><small>Aktive Kalendertage</small></div></div>
  {!insight.total&&<p role="status">Für diesen Zeitraum liegen noch keine archivierten Last.fm-Scrobbles vor. Importiere zunächst deinen Hörverlauf oder wähle einen anderen Zeitraum.</p>}
  <div className="lastfm-intelligence-columns-v711">
   <div className="lastfm-intelligence-card-v711"><h5>Deine meistgehörten Künstler</h5><p>Wiedergaben, verschiedene Songs und aktive Tage im gewählten Zeitraum.</p><ol>{insight.topArtists.map(x=><li key={x.artist}><span className="lastfm-intelligence-name-v711">{x.artist}<small>{x.songs} Songs · {x.activeDays} Tage</small></span><strong>{x.plays}×</strong></li>)}</ol></div>
   <div className="lastfm-intelligence-card-v711"><h5>Deine meistgehörten Songs</h5><p>Jede separat erfasste Wiederholung wird mitgezählt.</p><ol>{insight.topSongs.map((x,i)=><li key={`${x.artist}-${x.title}-${i}`}><span className="lastfm-intelligence-name-v711">{x.title}<small>{x.artist} · {x.activeDays} Tage</small></span><strong>{x.plays}×</strong></li>)}</ol></div>
  </div>
  <div className="lastfm-intelligence-columns-v711">
   <div className="lastfm-intelligence-card-v711"><h5>Wochentage · {timeZone==='UTC'?'UTC':'Wiener Ortszeit'}</h5><p>Wann wurden die meisten deiner gespeicherten Scrobbles erfasst?</p><div className="lastfm-intelligence-bars-v711" role="img" aria-label="Scrobbles nach Wochentagen">{insight.weekdays.map(x=><div key={x.day} title={`${x.label}: ${x.count} Scrobbles`}><span>{x.count}</span><i style={{height:`${(x.count?Math.max(3,Math.round(x.count/maxWeekday*90)):0)}px`}}/><small>{x.label}</small></div>)}</div></div>
   <div className="lastfm-intelligence-card-v711"><h5>Tageszeiten · {timeZone==='UTC'?'UTC':'Wiener Ortszeit'}</h5><p>Die Verteilung berücksichtigt auch die Sommerzeitumstellung.</p><div className="lastfm-intelligence-dayparts-v711">{insight.dayparts.map(x=><div key={x.label}><span>{x.label}</span><div className="lastfm-intelligence-track-v711"><i style={{width:`${x.count/maxHour*100}%`}}/></div><strong>{x.count}</strong></div>)}</div></div>
  </div>
  <div className="lastfm-intelligence-card-v711"><h5>Entwicklung über zwölf Kalendermonate</h5><p>Monatliche Scrobbles und Künstleranzahl; auch Monate ohne archivierte Ereignisse werden angezeigt.</p><div className="lastfm-intelligence-months-v711" role="img" aria-label="Scrobbles und Künstler nach Kalendermonat">{insight.months.map(x=><div key={x.month} title={`${x.month}: ${x.count} Scrobbles · ${x.artists} Künstler · ${x.songs} Songs`}><span>{x.count}</span><i style={{height:`${(x.count?Math.max(3,Math.round(x.count/maxMonth*85)):0)}px`}}/><small>{x.month.slice(5)}</small><small>{x.artists} K.</small></div>)}</div></div>
  <div className="lastfm-intelligence-columns-v711">
   <div className="lastfm-intelligence-card-v711"><h5>Zuletzt häufiger gehört</h5><p>Mehr Scrobbles in den vergangenen 30 Tagen als in den 30 Tagen davor (unabhängig vom Analysefilter).</p><ul>{insight.rising.map(x=><li key={x.artist}><span>{x.artist}<small>{x.previous} → {x.recent} Wiedergaben</small></span><strong>+{x.change}</strong></li>)}</ul>{!insight.rising.length&&<p>Kein entsprechender Anstieg im gespeicherten Verlauf.</p>}</div>
   <div className="lastfm-intelligence-card-v711"><h5>Zuletzt seltener gehört</h5><p>Weniger Scrobbles als im vorherigen 30-Tage-Zeitraum – keine Aussage über deine tatsächlichen Vorlieben.</p><ul>{insight.falling.map(x=><li key={x.artist}><span>{x.artist}<small>{x.previous} → {x.recent} Wiedergaben</small></span><strong>{x.change}</strong></li>)}</ul>{!insight.falling.length&&<p>Kein entsprechender Rückgang im gespeicherten Verlauf.</p>}</div>
  </div>
  <p className="lastfm-intelligence-note-v711">Nur gespeicherte Last.fm-Scrobbles · Archivgrenze 8.000 Ereignisse · Angaben sind keine Hörminuten. Lücken und fehlende ältere Scrobbles können Trends verzerren. Das Studio verändert weder Last.fm noch dein Spotify-Archiv.</p>
 </section>;
}
