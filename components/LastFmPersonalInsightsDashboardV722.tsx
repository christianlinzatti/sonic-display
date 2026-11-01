'use client';
import {useMemo} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildLastFmPersonalInsightsV722} from '@/lib/lastfm-personal-insights-v722';
import {LastFmDashboardPresetsV724} from '@/components/LastFmDashboardPresetsV724';

type Props={key?:string;account?:string;events:readonly LastFmEventV706[];periodLabel?:string;
 onOpenDay:(day:string)=>void;onOpenMonth:(month:string)=>void;
 onOpenArtist:(year:number,artist:string)=>void;onOpenSong:(artist:string,title:string)=>void;
 onOpenReturn:(day:string,artist:string)=>void};
const count=(n:number)=>n.toLocaleString('de-AT');
const date=(day:string)=>new Date(`${day}T12:00:00`).toLocaleDateString('de-AT',{day:'numeric',month:'short',year:'numeric'});
const share=(n:number)=>`${(n*100).toFixed(1).replace('.',',')} %`;

/** A compact entry point. All detailed reports remain available below unchanged. */
export function LastFmPersonalInsightsDashboardV722({account="",events,periodLabel="Gesamtes Archiv",onOpenDay,onOpenMonth,onOpenArtist,onOpenSong,onOpenReturn}:Props){
 const report=useMemo(()=>buildLastFmPersonalInsightsV722(events),[events]);
 const maximum=Math.max(1,...report.months.map(m=>m.plays));
 return <section className="lastfm-home-v722" id="lastfm-personal-insights-v722" aria-label="Personal Music Insights Dashboard">
  <header className="lastfm-home-head-v722"><div><span>DEIN MUSIK-ARCHIV / V722</span><h4>Personal Music Insights</h4><p>Hörzahlen, Rekorde und Entdeckungen für deinen gewählten Zeitraum – alles auf einer Startseite.</p></div><a href="#lastfm-history-explorer-v715">Zur gesamten Chronik ↓</a></header>
  {!report.total?<div className="lastfm-home-empty-v722"><strong>Keine Scrobbles im ausgewählten Zeitraum</strong><p>Prüfe den gemeinsamen Filter oder importiere weitere Last.fm-Einträge. Das Archiv wird dabei nicht verändert.</p></div>:<>
   <p className="lastfm-home-asof-v722" role="status">Filter: {periodLabel} · Archivierte Daten: {report.firstDay?date(report.firstDay):'–'} bis {report.lastDay?date(report.lastDay):'–'} · Stand: letzter gespeicherter Scrobble, nicht Live-Wiedergabe</p>
   <LastFmDashboardPresetsV724 account={account} widgets={{
    metrics:(
     <div className="lastfm-home-kpis-v722" aria-label="Archiv in Zahlen">
    <div><small>Scrobbles</small><strong>{count(report.total)}</strong></div>
    <div><small>Erfasste Künstler</small><strong>{count(report.artists)}</strong></div>
    <div><small>Aktive Archivtage</small><strong>{count(report.activeDays)}</strong></div>
    <div><small>Jahre mit Einträgen</small><strong>{count(report.observedYears)}</strong></div>
    <div><small>Längste Hörserie</small><strong>{report.longestStreak?`${count(report.longestStreak.days)} Tage`:'–'}</strong></div>
    <div><small>Künstler-Trends</small><strong>{report.comparable?count(report.rising.length):'Noch offen'}</strong></div>
   </div>
    ),
    shortcuts:(
     <nav className="lastfm-home-nav-v722" aria-label="Zu den detaillierten Auswertungen springen">
    <a href="#lastfm-recap-v727">Wochen- & Monatsrückblick</a><a href="#lastfm-on-this-day-v728">On This Day ↗</a>
    <a href="#lastfm-history-explorer-v715">Kalender & Chronik</a>
    <a href="#lastfm-milestones-v717">Hörrekorde</a>
    <a href="#lastfm-artist-dashboard-v721">Künstler-Trends</a>
    <a href="#lastfm-discovery-timeline-v720">Entdeckungen</a>
    <a href="#lastfm-taste-story-v718">Musikjahre</a>
    <a href="#lastfm-year-compare-v719">Jahresvergleich</a>
   </nav>
    ),
    records:(
     <article className="lastfm-home-card-v722"><h5>Deine Hörrekorde</h5>
     {report.peakDay&&<button type="button" onClick={()=>onOpenDay(report.peakDay!.day)}><span>Stärkster erfasster Tag<small>{date(report.peakDay.day)}</small></span><strong>{count(report.peakDay.plays)} Scrobbles</strong></button>}
     {report.peakMonth&&<button type="button" onClick={()=>onOpenMonth(report.peakMonth!.month)}><span>Stärkster erfasster Monat<small>{report.peakMonth.month}</small></span><strong>{count(report.peakMonth.plays)} Scrobbles</strong></button>}
     {report.topArtist&&<button type="button" onClick={()=>onOpenArtist(report.topArtist!.year,report.topArtist!.artist)}><span>Häufigster Künstler<small>{report.topArtist.artist}</small></span><strong>{count(report.topArtist.plays)} Scrobbles</strong></button>}
     {report.topSong&&<button type="button" onClick={()=>onOpenSong(report.topSong!.artist,report.topSong!.title)}><span>Meistgespielter Song<small>{report.topSong.title} · {report.topSong.artist}</small></span><strong>{count(report.topSong.plays)} Scrobbles</strong></button>}
    </article>
    ),
    activity:(
     <article className="lastfm-home-card-v722"><div className="lastfm-home-card-head-v722"><h5>Die letzten sechs Archivmonate</h5><span>Scrobbles</span></div>
     <div className="lastfm-home-months-v722" role="group" aria-label="Monate in der Chronik öffnen">
      {report.months.map(m=><button key={m.month} type="button" disabled={!m.observed} onClick={()=>onOpenMonth(m.month)} title={m.observed?`${m.month}: ${m.plays} Scrobbles – Monat öffnen`:`${m.month}: vor dem ersten Archivmonat` } aria-label={`${m.month}: ${m.observed?`${m.plays} archivierte Scrobbles`:'noch keine Archivdaten'}`}><span className="lastfm-home-bar-v722"><i style={{height:m.observed?`${Math.max(3,Math.round(m.plays/maximum*100))}%`:'0%'}}/></span><strong>{m.observed?count(m.plays):'–'}</strong><small>{m.month.slice(5)}</small></button>)}
     </div>
     {report.hasUnobservedPeriods&&<p>„–“ bezeichnet Monate vor dem ersten Archiv-Eintrag.</p>}
     {report.currentWindow&&report.previousWindow&&<p className="lastfm-home-window-v722">30 Kalendertage bis zum letzten Scrobble: <strong>{count(report.currentWindow.plays)}</strong> · 30 Tage davor: <strong>{count(report.previousWindow.plays)}</strong>. Beide Zeitfenster enden am letzten Scrobble im Archiv.</p>}
    </article>
    ),
    trends:(
     <article className="lastfm-home-card-v722"><div className="lastfm-home-card-head-v722"><h5>Künstler in Bewegung</h5><a href="#lastfm-artist-dashboard-v721">Alle ansehen ↓</a></div>
     {report.rising.length?<><h6>Aufstrebend</h6>{report.rising.map(a=><button key={`rise-${a.artist}`} type="button" onClick={()=>onOpenArtist(a.year,a.artist)}><span>{a.artist}</span><strong>+{share(a.gain)} Anteil</strong></button>)}</>:<p>{report.comparable?'Kein Aufwärtstrend nach den definierten Schwellen erfasst.':'Noch zu wenige Scrobbles in beiden Vergleichsfenstern.'}</p>}
     {report.loyal.length>0&&<><h6>Langjährige Favoriten</h6>{report.loyal.map(a=><button key={`loyal-${a.artist}`} type="button" onClick={()=>onOpenArtist(a.year,a.artist)}><span>{a.artist}</span><strong>{a.years} Jahre</strong></button>)}</>}
     {report.comebacks.length>0&&<><h6>Comebacks</h6>{report.comebacks.map(a=><button key={`return-${a.artist}`} type="button" onClick={()=>onOpenReturn(a.returnDay,a.artist)}><span>{a.artist}</span><strong>{a.gapDays} Tage Pause*</strong></button>)}</>}
    </article>
    ),
    discoveries:(
     <article className="lastfm-home-card-v722"><div className="lastfm-home-card-head-v722"><h5>Zuletzt erstmals im Zeitraum</h5><a href="#lastfm-discovery-timeline-v720">Discovery Timeline ↓</a></div>
     {report.discoveries.map(a=><button key={`${a.artist}-${a.firstAt}`} type="button" onClick={()=>onOpenArtist(a.year,a.artist)}><span>{a.artist}<small>Erstmals im Zeitraum: {new Date(a.firstAt).toLocaleDateString('de-AT',{day:'numeric',month:'short',year:'numeric'})}</small></span><strong>{count(a.plays)} Scrobbles</strong></button>)}
     {!report.discoveries.length&&<p>Keine Künstler im Archiv.</p>}
    </article>
    ),
   }}/>
   <p className="lastfm-home-foot-v722">*„Pause“ bedeutet eine Lücke zwischen archivierten Wiedergaben. Erfasst werden Last.fm-Scrobbles, keine Hörminuten. Die Kennzahlen beschreiben den ausgewählten Zeitraum im möglicherweise unvollständigen lokalen Archiv. „Erstmals“ in dieser Ansicht heißt erstmals innerhalb dieses Zeitraums, nicht zwangsläufig erstmals überhaupt. Keine weiteren API-Abfragen, keine zusätzlichen Scrobbles.</p>
  </>}
 </section>;
}
