'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildLastFmPeriodRecapV727,type V727RecapMode} from '@/lib/lastfm-period-recap-v727';

type Props={key?:string;events:readonly LastFmEventV706[];onOpenRange:(from:string,to:string,artist?:string,song?:string)=>void};
const n=(value:number)=>value.toLocaleString('de-AT');
const date=(day:string)=>new Date(day+'T12:00:00').toLocaleDateString('de-AT',{day:'numeric',month:'short',year:'numeric'});
const percent=(value:number)=>`${Math.abs(value).toFixed(1).replace('.',',')} %`;
export function LastFmPeriodRecapPanelV727({events,onOpenRange}:Props){
 const [mode,setMode]=useState<V727RecapMode>('week');
 const [offset,setOffset]=useState(0);
 const report=useMemo(()=>buildLastFmPeriodRecapV727(events,mode,offset),[events,mode,offset]);
 const maximum=Math.max(1,...report.days.map(d=>d.plays));
 const open=(artist?:string,song?:string)=>{if(report.from&&report.observedTo)onOpenRange(report.from,report.observedTo,artist,song);};
 return <section className="lastfm-recap-v727" id="lastfm-recap-v727" aria-label="Wochen- und Monatsrückblick">
  <header className="lastfm-recap-head-v727"><div><span>DEINE MUSIKRÜCKBLICKE · V727</span><h4>Weekly &amp; Monthly Recap</h4><p>Automatisch aus deinem lokalen Last.fm-Archiv erstellt – ohne weitere API-Aufrufe.</p></div>
   <div className="lastfm-recap-mode-v727" role="group" aria-label="Rückblick-Zeitraum"><button type="button" aria-pressed={mode==='week'} onClick={()=>{setMode('week');setOffset(0);}}>Woche</button><button type="button" aria-pressed={mode==='month'} onClick={()=>{setMode('month');setOffset(0);}}>Monat</button></div>
  </header>
  {!report.anchorDay?<p role="status">Noch keine Scrobbles archiviert. Importiere deine Last.fm-History, um deine Rückblicke zu sehen.</p>:<>
   <nav className="lastfm-recap-nav-v727" aria-label="Archivzeiträume wählen"><button type="button" disabled={!report.canGoOlder} onClick={()=>setOffset(v=>Math.min(1200,v+1))}>← Älter</button><strong>{report.from&&report.to?`${date(report.from)} – ${date(report.to)}`:'–'}</strong><button type="button" disabled={offset===0} onClick={()=>setOffset(v=>Math.max(0,v-1))}>Neuer →</button><button type="button" disabled={offset===0} onClick={()=>setOffset(0)}>Zum letzten Archivzeitraum</button></nav>
   <p className="lastfm-recap-scope-v727" role="status">{report.partial?'Nur bis zum letzten archivierten Tag ausgewertet':'Abgeschlossener Archivzeitraum'} · Verglichen mit {report.previousFrom&&report.previousTo?`${date(report.previousFrom)} – ${date(report.previousTo)}`:'–'}. Alle Angaben beziehen sich auf erfasste Scrobbles.</p>
   <div className="lastfm-recap-kpis-v727"><div><small>Scrobbles</small><strong>{n(report.total)}</strong><span>{report.previousTotal?`${report.delta>=0?'+':''}${n(report.delta)} (${report.delta>=0?'+':'−'}${percent(report.deltaPercent??0)})`:`${n(report.previousTotal)} im Vergleichszeitraum erfasst`}</span></div><div><small>Aktive Archivtage</small><strong>{n(report.activeDays)}</strong></div><div><small>Künstler</small><strong>{n(report.uniqueArtists)}</strong></div><div><small>Verschiedene Songs</small><strong>{n(report.uniqueSongs)}</strong></div></div>
   <div className="lastfm-recap-days-v727" role="group" aria-label="Tagesverteilung der Scrobbles">{report.days.map(d=><button type="button" key={d.day} disabled={!d.observed} onClick={()=>onOpenRange(d.day,d.day)} aria-label={`${date(d.day)}: ${d.observed?n(d.plays)+' erfasste Scrobbles':'noch keine Archivbeobachtung'}`} title={`${date(d.day)}: ${d.observed?n(d.plays)+' Scrobbles':'zukünftiger Archivtag'}`}><i style={{height:d.observed?`${Math.max(d.plays?4:0,Math.round(d.plays/maximum*100))}%`:'0%'}}/><small>{d.day.slice(8)}</small></button>)}</div>
   {report.total===0?<p>Für diesen Zeitraum enthält dein lokales Archiv keine Scrobbles. Eine tatsächliche Hörpause lässt sich daraus nicht ableiten.</p>:<div className="lastfm-recap-grid-v727">
    <article><h5>Top-Künstler</h5>{report.topArtists.map(a=><button type="button" key={a.artist} onClick={()=>open(a.artist)}><span>{a.artist}</span><strong>{n(a.plays)}×</strong></button>)}</article>
    <article><h5>Lieblingssongs</h5>{report.topSongs.map(s=><button type="button" key={`${s.artist}\u001f${s.title}`} onClick={()=>open(s.artist,s.title)}><span>{s.title}<small>{s.artist}</small></span><strong>{n(s.plays)}×</strong></button>)}</article>
    <article><h5>Erstmals im Archiv erfasst</h5>{report.newArtists.length?report.newArtists.map(a=><button type="button" key={a.artist} onClick={()=>open(a.artist)}><span>{a.artist}</span><strong>{n(a.plays)}×</strong></button>):<p>Keine erstmals archivierten Künstler in dieser Auswahl.</p>}</article>
    <article><h5>Gestiegener Höranteil</h5>{report.risingArtists.length?report.risingArtists.map(a=><button type="button" key={a.artist} onClick={()=>open(a.artist)}><span>{a.artist}<small>{n(a.previous)} → {n(a.current)} Scrobbles</small></span><strong>+{percent(a.shareDelta*100)}</strong></button>):<p>{report.previousTotal?'Kein gestiegener Künstleranteil erfasst.':'Keine belastbare Veränderung ohne Scrobbles im Vergleichszeitraum.'}</p>}</article>
   </div>}
   <p className="lastfm-recap-foot-v727">Der Vergleich einer laufenden Woche oder eines laufenden Monats betrachtet nur dieselbe Anzahl lokaler Kalendertage in der vorherigen Periode. „Neu“ bedeutet erstmals in der vorliegenden Archivkopie, nicht erstmals tatsächlich gehört. Fehlende Archivdaten können Trends verändern. Die Rückblicke werden beim Öffnen und beim Archivabgleich neu berechnet; sie versenden keine Benachrichtigungen und erzeugen keine Scrobbles.</p>
  </>}
 </section>;
}
