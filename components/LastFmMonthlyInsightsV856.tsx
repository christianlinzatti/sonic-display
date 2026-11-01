'use client';

import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import type {V711TimeZone} from '@/lib/lastfm-intelligence-v711';
import {availableInsightMonthsV856,calculateMonthlyInsightsV856} from '@/lib/lastfm-monthly-insights-v856';

type Props={events:readonly LastFmEventV706[];onOpenSong?:(artist:string,title:string)=>void;onOpenArtist?:(artist:string)=>void};
const monthLabel=(key:string)=>new Intl.DateTimeFormat('de-AT',{year:'numeric',month:'long',timeZone:'UTC'}).format(new Date(`${key}-01T12:00:00Z`));
const monthShort=(key:string)=>new Intl.DateTimeFormat('de-AT',{month:'short',timeZone:'UTC'}).format(new Date(`${key}-01T12:00:00Z`));

export function LastFmMonthlyInsightsV856({events,onOpenSong,onOpenArtist}:Props){
 const [chosen,setChosen]=useState('');
 const [zone,setZone]=useState<V711TimeZone>('Europe/Vienna');
 const [expanded,setExpanded]=useState(true);
 const months=useMemo(()=>availableInsightMonthsV856(events,new Date(),zone),[events,zone]);
 const selected=months.includes(chosen)?chosen:months[0];
 const data=useMemo(()=>calculateMonthlyInsightsV856(events,selected,new Date(),zone),[events,selected,zone]);
 const max=Math.max(1,...data.months.map(m=>m.plays));
 const visibleMonths=data.months.filter(m=>m.plays>0).length;
 return <section className="lastfm-monthly-v856" id="lastfm-monthly-v856" aria-label="Music History Monatsanalyse">
  <header className="lastfm-monthly-header-v856">
   <div><span className="lastfm-monthly-eyebrow-v856">V856 · MUSIC MEMORY INSIGHTS</span><h4>Dein Sound im Wandel<span>.</span></h4><p>Monate vergleichen, neue Favoriten entdecken und lange nicht gehörte Songs wiederfinden.</p></div>
   <button type="button" className="lastfm-monthly-collapse-v856" aria-expanded={expanded} onClick={()=>setExpanded(value=>!value)}>{expanded?'Einklappen':'Analyse anzeigen'} <span aria-hidden="true">{expanded?'⌃':'⌄'}</span></button>
  </header>
  {expanded&&<>
   <div className="lastfm-monthly-controls-v856">
    <label>Analysemonat<select value={selected} onChange={(event:{target:{value:string}})=>setChosen(event.target.value)}>{months.map(month=><option key={month} value={month}>{monthLabel(month)}</option>)}</select></label>
    <label>Zeitzone<select value={zone} onChange={(event:{target:{value:string}})=>{setZone(event.target.value==='UTC'?'UTC':'Europe/Vienna');setChosen('');}}><option value="Europe/Vienna">Wien (MEZ/MESZ)</option><option value="UTC">UTC</option></select></label>
   </div>
   <div className="lastfm-monthly-stats-v856" aria-live="polite">
    <div><strong>{data.current.plays.toLocaleString('de-AT')}</strong><span>Scrobbles im Monat</span></div>
    <div><strong>{data.current.artists.toLocaleString('de-AT')}</strong><span>Verschiedene Künstler</span></div>
    <div><strong>{data.current.tracks.toLocaleString('de-AT')}</strong><span>Verschiedene Songs</span></div>
    <div><strong>{data.current.activeDays.toLocaleString('de-AT')}</strong><span>Erfasste Tage</span></div>
   </div>
   <div className="lastfm-monthly-grid-v856">
    <div className="lastfm-monthly-card-v856">
     <div className="lastfm-monthly-card-heading-v856"><div><h5>12-Monats-Verlauf</h5><p>Erfasste Wiedergaben · bis {monthLabel(data.selected)}</p></div><span className="lastfm-monthly-indicator-v856">{visibleMonths}/12 Monate mit Daten</span></div>
     <div className="lastfm-monthly-bars-v856" role="img" aria-label="Scrobbles der letzten zwölf Kalendermonate">
      {data.months.map(m=><div className={`lastfm-monthly-bar-v856${m.month===data.selected?' is-current':''}`} key={m.month} title={`${monthLabel(m.month)}: ${m.plays} Scrobbles`}><span>{m.plays||'·'}</span><i style={{height:`${m.plays?Math.max(4,100*m.plays/max):0}%`}}/><small>{monthShort(m.month)}</small></div>)}
     </div>
     <p className="lastfm-monthly-comparison-v856">{data.hasComparison?<><strong>{data.change!==null&&data.change>0?'+':''}{data.change}%</strong> gegenüber {monthLabel(data.previous.month)} ({data.previous.plays.toLocaleString('de-AT')} Scrobbles)</>:<>Kein belastbarer Prozentvergleich: Im Vormonat sind keine Scrobbles erfasst.</>}</p>
    </div>
    <div className="lastfm-monthly-card-v856">
     <div className="lastfm-monthly-card-heading-v856"><div><h5>Aufkommende Favoriten</h5><p>Erstmals erfasste oder deutlich häufiger gehörte Künstler mit mindestens drei Scrobbles im gewählten Monat.</p></div><span className="lastfm-monthly-indicator-v856">{data.emerging.length} Treffer</span></div>
     {data.emerging.length?<ol className="lastfm-monthly-ranking-v856">{data.emerging.map((a,index)=><li key={`${a.artist}-${index}`}><span className="lastfm-monthly-rank-v856">{String(index+1).padStart(2,'0')}</span><div><strong>{a.artist}</strong><small>{a.kind==='new'?'Erstmals im gespeicherten Archiv':'Deutlich mehr als im Vormonat'} · Vormonat {a.previousMonth}×</small></div><b>{a.plays}×</b>{onOpenArtist&&<button type="button" onClick={()=>onOpenArtist(a.artist)} aria-label={`Künstler ${a.artist} in der History öffnen`}>↗</button>}</li>)}</ol>:<p className="lastfm-monthly-empty-v856">Noch keine eindeutigen neuen Favoriten im gewählten Monat. Die Analyse benötigt mindestens drei erfasste Scrobbles pro Künstler.</p>}
    </div>
   </div>
   <div className="lastfm-monthly-card-v856">
    <div className="lastfm-monthly-card-heading-v856"><div><h5>Wiederentdeckte Songs</h5><p>Songs, die nach mindestens 90 Tagen Abstand zum vorherigen erfassten Scrobble erneut gehört wurden.</p></div><span className="lastfm-monthly-indicator-v856">{data.rediscovered.length} Songs</span></div>
    {data.rediscovered.length?<div className="lastfm-monthly-comebacks-v856">{data.rediscovered.map((song,index)=><div className="lastfm-monthly-comeback-v856" key={`${song.artist}-${song.title}-${index}`}>
     {song.cover?<img src={song.cover} alt="" loading="lazy"/>:<span className="lastfm-monthly-placeholder-v856" aria-hidden="true">♫</span>}
     <div><strong>{song.title}</strong><span>{song.artist}</span><small>Letzter Eintrag {song.lastHeard} · erneut {song.rediscoveredAt}</small></div>
     <span className="lastfm-monthly-gap-v856">{song.gapDays} Tage</span>
     {onOpenSong?<button type="button" onClick={()=>onOpenSong(song.artist,song.title)} aria-label={`${song.title} in der History öffnen`}>Ansehen</button>:song.url?<a href={song.url} target="_blank" rel="noopener noreferrer">Ansehen ↗</a>:null}
    </div>)}</div>:<p className="lastfm-monthly-empty-v856">Keine Song-Comebacks mit mindestens 90 Tagen beobachtetem Abstand. Ältere Einträge können fehlen.</p>}
   </div>
   <p className="lastfm-monthly-note-v856">Auswertung ausschließlich lokal gespeicherter Last.fm-Scrobbles ({data.sourceCount.toLocaleString('de-AT')} Einträge). Fehlende Scrobbles beweisen keine Hörpause. Auch der aktuelle Monat kann unvollständig sein; Monatswerte sind absolute Zählungen, keine Hörzeit. Keine automatische Genrezuordnung, keine zusätzlichen API-Abfragen und keine Änderung deines Archivs.</p>
  </>}
 </section>;
}
