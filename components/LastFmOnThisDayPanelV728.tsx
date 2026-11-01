'use client';
import {useMemo,useState} from 'react';
import type {LastFmEventV706} from '@/lib/lastfm-history-v706';
import {buildLastFmOnThisDayV728} from '@/lib/lastfm-on-this-day-v728';

type Props={key?:string;events:readonly LastFmEventV706[];onOpenDay:(day:string,artist?:string,song?:string)=>void};
const iso=(d:Date)=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const short=(day:string)=>new Date(`${day}T12:00:00`).toLocaleDateString('de-AT',{day:'numeric',month:'long',year:'numeric'});
const time=(stamp:string)=>new Date(stamp).toLocaleTimeString('de-AT',{hour:'2-digit',minute:'2-digit'});
const count=(value:number)=>value.toLocaleString('de-AT');
export function LastFmOnThisDayPanelV728({events,onOpenDay}:Props){
 const [chosenDay,setChosenDay]=useState(()=>iso(new Date()));
 const [maxYears,setMaxYears]=useState(30);
 const [expanded,setExpanded]=useState<number|null>(null);
 const today=iso(new Date());
 const day=chosenDay&&chosenDay<=today?chosenDay:today;
 const memories=useMemo(()=>buildLastFmOnThisDayV728(events,day,new Date(),maxYears),[events,day,maxYears]);
 return <section className="lastfm-day-memory-v728" id="lastfm-on-this-day-v728" aria-label="On This Day – Musik-Erinnerungen">
  <header className="lastfm-day-memory-head-v728"><div><span>DEINE MUSIKZEITREISE · V728</span><h4>On This Day</h4><p>Welche Musik hast du an diesem Kalendertag in früheren Jahren gehört?</p></div>
   <div className="lastfm-day-memory-filters-v728"><label htmlFor="lastfm-memory-date-v728">Vergleichstag<input id="lastfm-memory-date-v728" type="date" min="2000-01-01" max={today} value={day} onChange={(e:{target:{value:string}})=>{if(e.target.value){setChosenDay(e.target.value);setExpanded(null);}}}/></label>
    <label htmlFor="lastfm-memory-years-v728">Rückblick<select id="lastfm-memory-years-v728" value={maxYears} onChange={(e:{target:{value:string}})=>{setMaxYears(Number(e.target.value));setExpanded(null);}}><option value={5}>5 Jahre</option><option value={10}>10 Jahre</option><option value={20}>20 Jahre</option><option value={30}>30 Jahre</option><option value={100}>Gesamter verfügbarer Zeitraum</option></select></label>
    <button type="button" onClick={()=>{setChosenDay(today);setExpanded(null);}} disabled={day===today}>Heute</button></div>
  </header>
  <p className="lastfm-day-memory-info-v728" role="status">{short(day)} · {count(memories.total)} archivierte Scrobbles an diesem Tag in {memories.matchedYears} früheren {memories.matchedYears===1?'Jahr':'Jahren'}. {memories.firstArchivedDay&&memories.lastArchivedDay?`Archivstand: ${short(memories.firstArchivedDay)} bis ${short(memories.lastArchivedDay)}.`:''}</p>
  {!memories.hasArchive?<p>Dein Last.fm-Archiv enthält noch keine Scrobbles. Importiere zuerst deine Hörgeschichte.</p>:memories.years.length===0?<p>Für diesen Kalendertag sind in den vergangenen Jahren keine Scrobbles erfasst. Das bedeutet nicht, dass du damals keine Musik gehört hast. Wähle gern einen anderen Tag.</p>:<>
   {memories.repeatedSongs.length>0&&<article className="lastfm-day-memory-repeat-v728"><h5>Wiederkehrende Lieblingssongs</h5><p>Diese Titel tauchen am ausgewählten Kalendertag in mindestens zwei unterschiedlichen Archivjahren auf.</p><div className="lastfm-day-memory-repeat-list-v728">{memories.repeatedSongs.map(song=><button type="button" key={`${song.artist}\u001f${song.title}`} onClick={()=>onOpenDay(`${song.years[0]}-${memories.monthDay}`,song.artist,song.title)}><strong>{song.title}</strong><span>{song.artist} · {song.years.join(', ')} · {count(song.plays)}×</span></button>)}</div></article>}
   <div className="lastfm-day-memory-years-v728" aria-label="Archivierte Musik-Erinnerungen pro Jahr">{memories.years.map(y=><article key={y.year} className="lastfm-day-memory-year-v728"><div className="lastfm-day-memory-year-head-v728"><div><span>{y.year}</span><strong>{short(y.day)}</strong><small>{count(y.plays)} Scrobbles · {count(y.uniqueArtists)} Künstler · {count(y.uniqueSongs)} Songs</small></div><div><button type="button" onClick={()=>onOpenDay(y.day)}>Chronik öffnen ↗</button><button type="button" aria-expanded={expanded===y.year} aria-controls={`lastfm-day-memory-detail-${y.year}`} onClick={()=>setExpanded(v=>v===y.year?null:y.year)}>{expanded===y.year?'Weniger':'Details'} {expanded===y.year?'↑':'↓'}</button></div></div>
     <div className="lastfm-day-memory-peek-v728"><strong>Meistgehört: {y.artists[0]?.artist??'–'}</strong><span>{y.songs[0]?`${y.songs[0].title} · ${y.songs[0].artist}`:'–'}</span></div>
     {expanded===y.year&&<div id={`lastfm-day-memory-detail-${y.year}`} className="lastfm-day-memory-detail-v728"><div><h6>Top-Künstler</h6>{y.artists.map(a=><button key={a.artist} type="button" onClick={()=>onOpenDay(y.day,a.artist)}><span>{a.artist}</span><strong>{count(a.plays)}×</strong></button>)}</div><div><h6>Top-Songs</h6>{y.songs.map(s=><button key={`${s.artist}\u001f${s.title}`} type="button" onClick={()=>onOpenDay(y.day,s.artist,s.title)}><span>{s.title}<small>{s.artist}</small></span><strong>{count(s.plays)}×</strong></button>)}</div><div><h6>Letzte Wiedergaben des Tages</h6>{y.moments.map((m,i)=><button type="button" key={`${m.playedAt}-${i}`} onClick={()=>onOpenDay(y.day,m.artist,m.title)}><span>{time(m.playedAt)} · {m.title}<small>{m.artist}</small></span></button>)}</div></div>}
    </article>)}</div>
   </>}
  <p className="lastfm-day-memory-foot-v728">„On This Day“ zeigt nur Scrobbles, die in deinem lokal gespeicherten Last.fm-Archiv vorhanden sind. Nicht erfasste Tage beweisen keine Hörpause. Wiederkehrende Songs werden anhand von Künstler und Titel abgeglichen; unterschiedliche Versionen können getrennt erscheinen. Der 29. Februar wird ausschließlich mit tatsächlichen 29.-Februar-Tagen verglichen. Es werden keine neuen API-Anfragen oder Scrobbles erzeugt.</p>
 </section>;
}
