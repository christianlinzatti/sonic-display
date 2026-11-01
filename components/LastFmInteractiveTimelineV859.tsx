'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import type {V711TimeZone} from '@/lib/lastfm-intelligence-v711';
import {buildInteractiveMusicTimelineV859} from '@/lib/lastfm-interactive-timeline-v859';

type Props={events:readonly LastFmEventV706[];onOpenArtist?:(artist:string)=>void};
const count=(value:number)=>value.toLocaleString('de-AT');
const monthName=(month:string)=>new Intl.DateTimeFormat('de-AT',{month:'short',timeZone:'UTC'}).format(new Date(`${month}-15T12:00:00Z`));
const dateName=(day:string)=>new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'short',year:'numeric',timeZone:'UTC'}).format(new Date(`${day.slice(0,10)}T12:00:00Z`));

/** Multi-year, archive-only interactive chronology; no second history fetch or persistence. */
export function LastFmInteractiveTimelineV859({events,onOpenArtist}:Props){
 const [zone,setZone]=useState<V711TimeZone>('Europe/Vienna');
 const [year,setYear]=useState<number|null>(null);
 const [month,setMonth]=useState<string|null>(null);
 const [selectedArtist,setSelectedArtist]=useState<string|null>(null);
 const [artistSearch,setArtistSearch]=useState('');
 const data=useMemo(()=>buildInteractiveMusicTimelineV859(events,year,month,selectedArtist,new Date(),zone),[events,year,month,selectedArtist,zone]);
 const maxYear=Math.max(1,...data.years.map(x=>x.plays)),maxMonth=Math.max(1,...data.months.map(x=>x.plays));
 const maxArtist=Math.max(1,...(data.artist?.byYear.map(x=>x.plays)??[]));
 const matches=data.artistOptions.filter(a=>a.artist.normalize('NFKC').toLocaleLowerCase('de-AT').includes(artistSearch.normalize('NFKC').trim().toLocaleLowerCase('de-AT'))).slice(0,12);
 return <section id="lastfm-interactive-timeline-v859" className="lastfm-timeline-v859" aria-label="Interaktive Musik-Zeitreise">
  <header className="lastfm-timeline-heading-v859"><div><span className="lastfm-timeline-eyebrow-v859">SONIC DISPLAY · HISTORY 3.0</span><h4>Deine Musik-Zeitreise<span>.</span></h4><p>Entdecke deine erfassten Musikjahre, wähle einen Monat und verfolge die Entwicklung deiner Lieblingskünstler.</p></div><label className="lastfm-timeline-zone-v859">Zeitzone <select aria-label="Timeline-Zeitzone" value={zone} onChange={(e:{target:{value:string}})=>{setZone(e.target.value==='UTC'?'UTC':'Europe/Vienna');setYear(null);setMonth(null);}}><option value="Europe/Vienna">Wien</option><option value="UTC">UTC</option></select></label></header>
  {!data.hasEvents?<div className="lastfm-timeline-empty-v859"><strong>Noch keine archivierten Scrobbles</strong><p>Verbinde bzw. importiere deine Last.fm-History. Die Timeline zeigt ausschließlich tatsächlich vorhandene Einträge, keine Demo-Hörverläufe.</p></div>:<>
   <div className="lastfm-timeline-intro-v859"><span><strong>{count(data.total)}</strong> gespeicherte Scrobbles</span><span><strong>{data.years.length}</strong> Kalenderjahre im Archivbereich</span><span>Erste Aufzeichnung: <strong>{dateName(data.oldest!)}</strong></span></div>
   <article className="lastfm-timeline-card-v859"><div className="lastfm-timeline-card-head-v859"><div><span>DEIN GESAMTES ARCHIV</span><h5>Durch die Jahre</h5></div><span>Jahr auswählen ↓</span></div>
    <div className="lastfm-timeline-years-v859" role="group" aria-label="Jahresübersicht">
     {data.years.map(y=><button type="button" key={y.year} className={`lastfm-timeline-year-v859${y.year===data.selectedYear?' selected':''}`} aria-pressed={y.year===data.selectedYear} aria-label={`${y.year}, ${count(y.plays)} erfasste Scrobbles${y.observed?'':', keine Einträge'}`} title={`${y.year}: ${count(y.plays)} Scrobbles, ${count(y.artists)} Künstler`} onClick={()=>{setYear(y.year);setMonth(null);}}><strong>{y.plays?count(y.plays):'–'}</strong><span className="lastfm-timeline-year-rail-v859"><i style={{height:`${y.plays?Math.max(5,y.plays/maxYear*100):0}%`}}/></span><small>{y.year}</small></button>)}
    </div><p>Jahre ohne Einträge bleiben sichtbar. Das beweist keine Hörpause, sondern nur eine Lücke im gespeicherten Archiv.</p></article>
   <div className="lastfm-timeline-columns-v859"><article className="lastfm-timeline-card-v859"><div className="lastfm-timeline-card-head-v859"><div><span>{data.selectedYear} · MONATLICH</span><h5>Monat für Monat</h5></div><strong>{count(data.months.reduce((total,m)=>total+m.plays,0))} Scrobbles</strong></div>
     <div className="lastfm-timeline-months-v859" role="group" aria-label={`Monate ${data.selectedYear}`}>{data.months.map(m=><button type="button" key={m.month} className={`lastfm-timeline-month-v859${m.month===data.selectedMonth?' selected':''}`} aria-pressed={m.month===data.selectedMonth} aria-label={`${monthName(m.month)} ${data.selectedYear}, ${m.plays} Scrobbles`} onClick={()=>setMonth(m.month)}><b>{m.plays?count(m.plays):'–'}</b><span className="lastfm-timeline-month-rail-v859"><i style={{height:`${m.plays?Math.max(5,m.plays/maxMonth*100):0}%`}}/></span><small>{monthName(m.month)}</small></button>)}</div>
     <p>Eine Auswahl ändert die Künstlerliste rechts. Null bedeutet: keine erfassten Scrobbles.</p></article>
    <article className="lastfm-timeline-card-v859"><div className="lastfm-timeline-card-head-v859"><div><span>{data.selectedMonth} · TOP-KÜNSTLER</span><h5>Wer lief besonders oft?</h5></div><span>{count(data.months.find(m=>m.month===data.selectedMonth)?.artists??0)} Künstler</span></div>
     {data.monthArtists.length?<ol className="lastfm-timeline-month-artists-v859">{data.monthArtists.map((a,i)=><li key={a.key}><span>{String(i+1).padStart(2,'0')}</span><button type="button" onClick={()=>setSelectedArtist(a.artist)} aria-label={`${a.artist} in der Künstler-Zeitreise untersuchen`}>{a.artist}</button><strong>{count(a.plays)}×</strong></li>)}</ol>:<p className="lastfm-timeline-empty-month-v859">Für diesen Monat gibt es keine aufgezeichneten Scrobbles.</p>}</article></div>
   <article className="lastfm-timeline-card-v859 lastfm-timeline-artist-card-v859"><div className="lastfm-timeline-card-head-v859"><div><span>KÜNSTLER-ZEITREISE</span><h5>Vom ersten Scrobble bis heute</h5></div><a href="#lastfm-artist-dashboard-v721">Alle Künstlerstatistiken ↗</a></div>
    <div className="lastfm-timeline-artist-picker-v859"><label>Künstler suchen <input type="search" aria-label="Künstler in der Timeline suchen" placeholder="Name eingeben …" value={artistSearch} onChange={(e:{target:{value:string}})=>setArtistSearch(e.target.value)} maxLength={100}/></label><div className="lastfm-timeline-artist-options-v859" role="group" aria-label="Künstler auswählen">{matches.map(a=><button key={a.key} type="button" aria-pressed={data.artist?.key===a.key} onClick={()=>{setSelectedArtist(a.artist);setArtistSearch('');}}>{a.artist} <small>{count(a.plays)}×</small></button>)}{matches.length===0&&<span>Kein passender Künstler im gespeicherten Archiv.</span>}</div></div>
    {data.artist&&<div className="lastfm-timeline-artist-detail-v859"><div className="lastfm-timeline-artist-title-v859"><div><span>DEIN KÜNSTLER-VERLAUF</span><h5>{data.artist.artist}</h5><small>{count(data.artist.plays)} erfasste Scrobbles insgesamt</small></div>{onOpenArtist&&<button type="button" onClick={()=>onOpenArtist(data.artist!.artist)}>Im Explorer öffnen ↗</button>}</div>
      <div className="lastfm-timeline-milestones-v859"><div><span>Erstmals erfasst</span><strong>{dateName(data.artist.first)}</strong></div><div><span>Stärkster Monat</span><strong>{data.artist.peakMonth}</strong><small>{count(data.artist.peakPlays)} Scrobbles</small></div><div><span>Zuletzt erfasst</span><strong>{dateName(data.artist.last)}</strong></div><div><span>Wiederentdeckungen ≥ 90 Tage</span><strong>{count(data.artist.comebackCount)}</strong></div></div>
      <div className="lastfm-timeline-artist-years-v859" role="group" aria-label={`Jahresverlauf für ${data.artist.artist}`}>{data.artist.byYear.map(y=><button key={y.year} type="button" aria-label={`${y.year}: ${count(y.plays)} Scrobbles für ${data.artist!.artist}`} aria-pressed={data.selectedYear===y.year} className={data.selectedYear===y.year?' selected':''} onClick={()=>{setYear(y.year);setMonth(null);}}><b>{y.plays?count(y.plays):'–'}</b><span><i style={{height:`${y.plays?Math.max(4,y.plays/maxArtist*100):0}%`}}/></span><small>{y.year}</small></button>)}</div>
      {data.artist.comebacks.length>0&&<div className="lastfm-timeline-returns-v859"><h6>Nach längerer Pause wieder gehört</h6>{data.artist.comebacks.slice(0,3).map((c,i)=><p key={`${c.at}-${i}`}><strong>{c.days} Tage Abstand</strong> zwischen {dateName(c.after)} und {dateName(c.at)}</p>)}</div>}
     </div>}
   </article>
  </>}
  <p className="lastfm-timeline-disclaimer-v859">Alle Angaben beziehen sich auf aufgezeichnete Last.fm-Scrobbles. „Erstmals“, „zuletzt“ und „wiederentdeckt“ bedeuten stets: im vorhandenen Archiv. Lücken können durch fehlende Synchronisierung entstehen. Die Daten bleiben lokal; es werden keine weiteren Spotify- oder Last.fm-Abfragen ausgelöst.</p>
 </section>;
}
