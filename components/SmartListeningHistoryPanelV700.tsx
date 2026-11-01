"use client";

import {useMemo,useState} from 'react';
import type {RecentTrackV672} from '@/lib/recently-played-v672';
import {smartListeningHistoryV700} from '@/lib/smart-listening-history-v700';

const whenV700=new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
const hourV700=new Intl.DateTimeFormat('de-AT',{hour:'2-digit',minute:'2-digit'});
const timeLabelV700=(iso:string)=>whenV700.format(new Date(iso));

/** V700: inspect only loaded events. The chart and ranks have no fetch, cookies or persistence. */
export function SmartListeningHistoryPanelV700({tracks}:{tracks:ReadonlyArray<RecentTrackV672>}){
 const [selectedDay,setSelectedDay]=useState<string|null>(null);
 const [onlyRepeats,setOnlyRepeats]=useState(false);
 const model=useMemo(()=>smartListeningHistoryV700(tracks),[tracks]);
 const max=Math.max(1,...model.dayWindow.map(d=>d.plays));
 const selected=model.dayWindow.find(d=>d.key===selectedDay);
 const repeats=model.topSongs.filter(s=>!onlyRepeats||s.plays>1);
 const rankMax=Math.max(1,...repeats.map(s=>s.plays));
 return <section className="smart-history-v700" aria-label="Smart Listening History aus geladenen Spotify-Wiedergaben">
  <header className="smart-history-heading-v700">
   <div><span className="recent-insight-kicker-v673">V700 / SMART LISTENING HISTORY</span><h3>Dein Hörmuster<span>.</span></h3><p>Entdecke Hörtage, wiederholte Lieblingssongs und Künstler-Credits aus den gerade geladenen Wiedergaben.</p></div>
   <span className="recent-insight-note-v673">Nur geladene Spotify-Ereignisse · keine vollständige Hörhistorie</span>
  </header>
  <div className="smart-history-metrics-v700">
   <div><span>Wiedergaben</span><strong>{model.events}</strong></div>
   <div><span>Verschiedene Songs</span><strong>{model.uniqueSongs}</strong></div>
   <div><span>Weitere Plays gleicher Songs</span><strong>{model.repeatEvents}</strong><small>{model.repeatPercent}% der geladenen Ereignisse</small></div>
   <div><span>Aktive Hörtage</span><strong>{model.activeDays}</strong></div>
  </div>
  <section className="smart-history-section-v700">
   <div className="smart-history-title-v700"><div><h4>Deine letzten 14 Kalendertage</h4><p>Lokale Gerätezeit · Tippe auf einen Tag, um seine geladenen Titel zu sehen.</p></div><span>{model.dayWindow.reduce((sum,d)=>sum+d.plays,0)} Ereignisse im Zeitfenster</span></div>
   <div className="smart-history-days-v700" role="group" aria-label="Hör-Timeline der letzten 14 Tage">
    {model.dayWindow.map(d=><button type="button" key={d.key} className={selectedDay===d.key?'is-selected':''} aria-pressed={selectedDay===d.key} aria-label={`${d.dateLabel}: ${d.plays} geladene Wiedergaben`} title={`${d.dateLabel}: ${d.plays} Plays`} onClick={()=>setSelectedDay(v=>v===d.key?null:d.key)}>
     <strong>{d.plays}</strong><span className="smart-history-bar-v700"><i style={{height:`${d.plays/max*100}%`}}/></span><span>{d.label}</span><small>{d.dateLabel}</small>
    </button>)}
   </div>
   {selected&&<div className="smart-history-day-detail-v700"><div><h5>{selected.dateLabel} · {selected.plays} Wiedergaben</h5><button type="button" onClick={()=>setSelectedDay(null)}>Schließen ✕</button></div>
    {selected.tracks.length?<ol>{selected.tracks.map((t,i)=><li key={`${t.id}:${t.playedAt}:${i}`}><time dateTime={t.playedAt}>{hourV700.format(new Date(t.playedAt))}</time><span><b>{t.title}</b><small>{t.artist}</small></span></li>)}</ol>:<p>Für diesen Tag wurden keine Wiedergaben geladen.</p>}
   </div>}
   {model.daysOutsideWindow>0&&<p className="smart-history-hint-v700">Weitere {model.daysOutsideWindow} geladene Wiedergaben liegen außerhalb des 14-Tage-Fensters und zählen weiterhin in den Ranglisten.</p>}
  </section>
  <div className="smart-history-columns-v700">
   <section className="smart-history-section-v700">
    <div className="smart-history-title-v700"><div><h4>Deine meistgehörten Songs</h4><p>Wiederholungen, erster und letzter geladener Abspielzeitpunkt.</p></div><label className="smart-history-toggle-v700"><input type="checkbox" checked={onlyRepeats} onChange={(e:{target:{checked:boolean}})=>setOnlyRepeats(e.target.checked)}/> Nur Wiederholungen</label></div>
    {repeats.length?<ol className="smart-history-song-list-v700">{repeats.map((song,i)=><li key={song.id}>
     <b className="smart-history-rank-v700">{i+1}.</b>{song.cover?<img src={song.cover} alt="" loading="lazy"/>:<div className="smart-history-art-v700" aria-hidden="true">♫</div>}
     <div className="smart-history-song-meta-v700"><a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">{song.title} ↗</a><span>{song.artist}</span><small>Erstmals {timeLabelV700(song.firstPlayedAt)} · zuletzt {timeLabelV700(song.lastPlayedAt)} · {song.activeDays} Hörtage</small><div className="smart-history-rankbar-v700"><span style={{width:`${100*song.plays/rankMax}%`}}/></div></div><strong className="smart-history-playcount-v700">{song.plays}×</strong>
    </li>)}</ol>:<p>Unter den geladenen Treffern gibt es keine wiederholt gehörten Titel.</p>}
   </section>
   <section className="smart-history-section-v700">
    <div className="smart-history-title-v700"><div><h4>Künstler-Credits im Detail</h4><p>Spotify-Feature-Credits bleiben zusammen; keine geschätzten Einzelkünstler-Plays.</p></div></div>
    <ol className="smart-history-artist-list-v700">{model.topArtists.map((artist,i)=><li key={artist.credit}><b className="smart-history-rank-v700">{i+1}.</b><div><strong>{artist.credit}</strong><small>{artist.uniqueSongs} verschiedene Songs · zuletzt {timeLabelV700(artist.lastPlayedAt)}</small></div><span>{artist.plays}×</span></li>)}</ol>
   </section>
  </div>
  <p className="smart-history-hint-v700">Die Werte zählen Spotify-Hörereignisse, nicht nachweislich vollständig gehörte Songs oder echte Hörminuten. Neue und ältere Seiten werden nur auf ausdrücklichen Klick geladen. Mit Schließen des Dialogs werden diese Daten verworfen.</p>
 </section>;
}
