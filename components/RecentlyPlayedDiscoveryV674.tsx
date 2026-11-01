'use client';

import {useEffect,useMemo,useRef,useState} from 'react';
import {useUiPreferences} from '@/context/UiPreferencesContext';
import type {RecentTrackV672} from '@/lib/recently-played-v672';
import {favoriteArtistsV674,genreResponseV674,historyGenresV674,suggestHistoryStageV674,type HistoryGenreMapV674,type HistoryGenreV674} from '@/lib/recently-played-discovery-v674';

const clock=new Intl.DateTimeFormat('de-AT',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
const playerTime=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;

function AlbumArtV674({track}:{track:RecentTrackV672}){
 return <div className="recent-album-art-v674">{track.albumCoverUrl?<img src={track.albumCoverUrl} loading="lazy" alt={`Cover: ${track.album}`}/>:<span aria-hidden="true">♫</span>}</div>;
}

export function HistoryGalleryV674({tracks}:{tracks:ReadonlyArray<RecentTrackV672>}){
 const [selected,setSelected]=useState<string|null>(null);
 const choices=useMemo(()=>tracks.slice(0,36),[tracks]);
 const selectedTrack=choices.find(t=>`${t.id}|${t.playedAt}`===selected)??choices[0];
 const favorites=useMemo(()=>favoriteArtistsV674(tracks),[tracks]);
 const repeats=selectedTrack?tracks.filter(t=>t.id===selectedTrack.id).length:0;
 return <section className="recent-discovery-v674" aria-label="Albumgalerie und Lieblingskünstler">
  <div className="recent-gallery-head-v674"><div><span className="recent-discovery-kicker-v674">DEINE MUSIK / VISUELL</span><h3>Deine Cover-Welt<span>.</span></h3><p>Wähle ein Albumcover, um den Song im Detail anzusehen.</p></div><span className="recent-discovery-caveat-v674">{choices.length} von {tracks.length} geladenen Wiedergaben in der Galerie</span></div>
  <div className="recent-gallery-layout-v674">
   <div className="recent-cover-wall-v674">{choices.map((track,index)=><button key={`${track.id}|${track.playedAt}`} type="button" onClick={()=>setSelected(`${track.id}|${track.playedAt}`)} aria-pressed={selectedTrack===track} aria-label={`${track.title} von ${track.artist} anzeigen`} title={`${track.title} · ${track.artist}`}><AlbumArtV674 track={track}/><span className="recent-cover-order-v674">{String(index+1).padStart(2,'0')}</span></button>)}</div>
   {selectedTrack&&<aside className="recent-gallery-detail-v674" aria-label="Ausgewählter Titel"><AlbumArtV674 track={selectedTrack}/><span className="recent-discovery-kicker-v674">AUS DEINER CHRONIK</span><h4>{selectedTrack.title}</h4><p>{selectedTrack.artist}</p><small>{selectedTrack.album}</small><div className="recent-gallery-mini-v674"><span>◷ {clock.format(new Date(selectedTrack.playedAt))}</span><span>♫ {playerTime(selectedTrack.durationMs)} min</span><span>↻ {repeats}× in geladenen Daten</span></div><a href={selectedTrack.spotifyUrl} target="_blank" rel="noopener noreferrer">Song auf Spotify ansehen ↗</a></aside>}
  </div>
  <section className="recent-favorite-v674" aria-label="Meistgehörte Künstler-Credits"><div><h4>Deine Künstler-Favoriten</h4><p>Nach Anzahl geladener Wiedergaben – Features bleiben gemeinsame Credits.</p></div><div className="recent-favorite-grid-v674">{favorites.map((artist,index)=><a key={artist.name} href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${artist.name}: Beispieltrack auf Spotify öffnen`}><div className="recent-favorite-cover-v674">{artist.cover?<img src={artist.cover} loading="lazy" alt="Albumcover eines gehörten Songs"/>:<span aria-hidden="true">♫</span>}<b>#{index+1}</b></div><strong>{artist.name}</strong><small>{artist.count} {artist.count===1?'Wiedergabe':'Wiedergaben'} · Beispieltrack ↗</small></a>)}</div></section>
 </section>;
}

export function HistoryGenresV674({tracks,known,setKnown}:{tracks:ReadonlyArray<RecentTrackV672>;known:HistoryGenreMapV674;setKnown:(fn:(previous:HistoryGenreMapV674)=>HistoryGenreMapV674)=>void}){
 const {preferences,updatePreferences}=useUiPreferences();
 const [running,setRunning]=useState(false);
 const [message,setMessage]=useState<string|null>(null);
 const [lastApplied,setLastApplied]=useState<{stageTheme:typeof preferences.stageTheme;stageLightStrength:number;stageReactive:boolean;avatarDancePreset:typeof preferences.avatarDancePreset}|null>(null);
 const currentRequest=useRef<AbortController|null>(null);
 useEffect(()=>()=>{currentRequest.current?.abort();},[]);
 const available=useMemo(()=>{
  const ids=new Set<string>();
  return tracks.filter(track=>{if(ids.has(track.id)||!track.title||!track.artist)return false;ids.add(track.id);return !Object.prototype.hasOwnProperty.call(known,track.id);});
 },[tracks,known]);
 const summary=useMemo(()=>historyGenresV674(tracks,known),[tracks,known]);
 const winner=summary.bars[0];
 const suggestion=winner?suggestHistoryStageV674(winner.genre):null;
 const lookup=async()=>{
  if(running || !available.length)return;
  currentRequest.current?.abort();const controller=new AbortController();currentRequest.current=controller;
  setRunning(true);setMessage(null);
  const next=available.slice(0,12);
  let successful=0;
  try{
   // Only when clicked; bounded and sequential pairs to avoid flooding Last.fm.
   for(let i=0;i<next.length;i+=2){
    const pair=next.slice(i,i+2);
    const results=await Promise.all(pair.map(async(track)=>{
     const url=`/api/genre?artist=${encodeURIComponent(track.primaryArtist||track.artist)}&track=${encodeURIComponent(track.title)}`;
     const res=await fetch(url,{signal:controller.signal,cache:'no-store'});
     if(!res.ok)throw new Error('Genre-Dienst vorübergehend nicht erreichbar.');
     const data:unknown=await res.json();
     if(data && typeof data==='object' && 'error' in data && typeof data.error==='string')throw new Error(data.error.includes('not configured')?'Last.fm ist nicht konfiguriert. Bitte den LASTFM_API_KEY hinterlegen.':'Last.fm hat keine Genre-Daten geliefert.');
     return [track.id,genreResponseV674(data)] as const;
    }));
    if(controller.signal.aborted)return;
    setKnown(previous=>({...previous,...Object.fromEntries(results)}));successful+=results.length;
   }
   setMessage(`${successful} Titel geprüft. Die Genre-Zuordnung basiert auf verfügbaren Last.fm-Tags.`);
  }catch(error){if(!controller.signal.aborted)setMessage(error instanceof Error?error.message:'Genre-Abfrage fehlgeschlagen.');}
  finally{if(!controller.signal.aborted){setRunning(false);currentRequest.current=null;}}
 };
 const apply=()=>{
  if(!suggestion)return;
  setLastApplied({stageTheme:preferences.stageTheme,stageReactive:preferences.stageReactive,stageLightStrength:preferences.stageLightStrength,avatarDancePreset:preferences.avatarDancePreset});
  updatePreferences({stageTheme:suggestion.stageTheme,stageLightStrength:suggestion.stageLightStrength,stageReactive:suggestion.stageReactive,avatarDancePreset:suggestion.avatarDancePreset});
  setMessage(`„${suggestion.label}“ für die aktuelle Bühne übernommen. Bestehende Avatarmodelle, Kamera und Lyrics bleiben unverändert.`);
 };
 const undo=()=>{if(lastApplied){updatePreferences(lastApplied);setLastApplied(null);setMessage('Vorheriger Bühnen-Look wiederhergestellt.');}};
 return <section className="recent-discovery-v674" aria-label="Genre-Auswertung des geladenen Verlaufs">
  <div className="recent-gallery-head-v674"><div><span className="recent-discovery-kicker-v674">DEINE MUSIK / SOUNDPROFIL</span><h3>Dein Genre-Mix<span>.</span></h3><p>Genre-Hinweise stammen aus Last.fm und sind nicht immer vollständig oder eindeutig.</p></div><span className="recent-discovery-caveat-v674">{summary.covered} / {summary.total} Wiedergaben geprüft</span></div>
  <div className="recent-genre-actions-v674"><button type="button" disabled={running||!available.length} onClick={()=>void lookup()}>{running?'Genre-Daten werden abgefragt …':available.length?`Genres für bis zu ${Math.min(12,available.length)} Songs ermitteln`:'Alle geladenen Songs geprüft'}</button><span>Nur auf Knopfdruck · keine zusätzliche Spotify-Berechtigung · kein dauerhaftes Profil</span></div>
  {message&&<p className="recent-genre-message-v674" role="status">{message}</p>}
  {summary.bars.length>0?<div className="recent-genre-grid-v674"><div className="recent-genre-ranks-v674"><h4>Erkannte Genres</h4>{summary.bars.map(item=><div key={item.genre} className="recent-genre-rank-v674"><div><strong>{item.label}</strong><span>{item.count}×</span></div><div className="recent-genre-meter-v674"><span style={{width:`${100*item.count/Math.max(1,summary.covered)}%`,backgroundColor:item.color}}/></div></div>)}<small>{summary.unknown} Wiedergaben ohne verlässliche Genre-Zuordnung; alle Balken beziehen sich auf geprüfte Wiedergaben.</small></div><div className="recent-stage-match-v674"><span className="recent-discovery-kicker-v674">BÜHNE × HÖRVERLAUF</span><h4>{suggestion?.label}</h4><p>{suggestion?.description}</p><div className="recent-stage-preview-v674" aria-hidden="true"><span>◉</span><i/><span>✦</span></div><small>Vorschlag auf Basis des häufigsten erkannten Genres. Die Konzertshow ändert sich erst beim Anwenden.</small>{suggestion&&<button type="button" onClick={apply}>Bühnen- und Tanzstil übernehmen</button>}{lastApplied&&<button type="button" className="recent-genre-undo-v674" onClick={undo}>Letzte Bühnenänderung rückgängig</button>}</div></div>:<div className="recent-empty-v672">Noch keine belastbare Genre-Auswertung. Starte die freiwillige Metadatenabfrage, sofern Last.fm in Sonic Display konfiguriert ist.</div>}
  {summary.covered>0&&<p className="recent-genre-coverage-v674">Abdeckung: {summary.covered} von {summary.total} geladenen Wiedergaben geprüft; {summary.classifiedSongs} unterschiedliche Songs mit erkanntem Genre. Das ist keine Spotify-Gesamtstatistik.</p>}
 </section>;
}
