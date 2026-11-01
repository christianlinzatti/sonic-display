"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {RecentPageV672, RecentTrackV672} from '@/lib/recently-played-v672';
import {historyInsightsV673, type HistoryInsightsV673} from '@/lib/recently-played-insights-v673';
import {HistoryGalleryV674,HistoryGenresV674} from '@/components/RecentlyPlayedDiscoveryV674';
import type {HistoryGenreMapV674} from '@/lib/recently-played-discovery-v674';
import {ListeningProfileV675} from '@/components/ListeningProfileV675';
import {ConcertLookDesignerV676} from '@/components/ConcertLookDesignerV676';
import {SmartListeningHistoryPanelV700} from '@/components/SmartListeningHistoryPanelV700';
import {PersistentListeningHistoryPanelV701} from '@/components/PersistentListeningHistoryPanelV701';
import {AutomaticListeningHistoryRecorderV702} from '@/components/AutomaticListeningHistoryRecorderV702';
import {AutomaticLastFmHistoryRecorderV708} from '@/components/AutomaticLastFmHistoryRecorderV708';
import {AutomaticLastFmRecoveryV710} from '@/components/AutomaticLastFmRecoveryV710';
import {ListeningStatisticsDashboardV703} from '@/components/ListeningStatisticsDashboardV703';
import {ListeningDiscoveryDashboardV704} from '@/components/ListeningDiscoveryDashboardV704';
import {ListeningSourceDashboardV707} from '@/components/ListeningSourceDashboardV707';
import {SmartMusicDiscoveryStudioV705} from '@/components/SmartMusicDiscoveryStudioV705';
import {LastFmHistoryPanelV706} from '@/components/LastFmHistoryPanelV706';
import {DEFAULT_HISTORY_FILTERS_V699,filterHistoryV699,mergeHistoryPagesV699,historyCSVV699,V699_MAX_EVENTS,type HistoryPeriodV699,type HistoryModeV699,type HistorySortV699} from '@/lib/recently-played-tools-v699';

const clock = new Intl.DateTimeFormat('de-AT',{hour:'2-digit',minute:'2-digit'});
const fullDate = new Intl.DateTimeFormat('de-AT',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const dayKey = (date:Date) => `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
const duration = (ms:number) => `${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,'0')}`;
function dayTitle(date: Date){
 const now = new Date();
 if(dayKey(now)===dayKey(date))return 'Heute';
 const yesterday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1);
 if(dayKey(yesterday)===dayKey(date))return 'Gestern';
 return fullDate.format(date);
}
function ListenCard({track,feature=false}:{track:RecentTrackV672;feature?:boolean}){
 return <article className={`recent-card-v672${feature?' recent-feature-v672':''}`}>
  <div className="recent-art-v672">{track.albumCoverUrl?<img src={track.albumCoverUrl} alt={`Cover: ${track.album}`} loading={feature?"eager":"lazy"}/>:<span aria-hidden="true">♫</span>}</div>
  <div className="recent-detail-v672">
   {feature&&<span className="recent-feature-kicker-v672">DEIN LETZTER SONG</span>}
   <h3 title={track.title}>{track.title}</h3>
   <p className="recent-artist-v672" title={track.artist}>{track.artist}</p>
   <p className="recent-album-v672" title={track.album}>{track.album}</p>
   <div className="recent-meta-v672"><span title="Zeitpunkt des Abspielens">◷ {clock.format(new Date(track.playedAt))}</span><span>{duration(track.durationMs)} Min.</span></div>
   <a href={track.spotifyUrl} target="_blank" rel="noopener noreferrer" aria-label={`${track.title} von ${track.artist} auf Spotify öffnen`}>Auf Spotify ansehen <span aria-hidden="true">↗</span></a>
  </div>
 </article>;
}
function InsightBarsV673({entries}:{entries:{name:string;plays:number}[]}){
 const max=Math.max(1,...entries.map(entry=>entry.plays));
 return <ol className="recent-insight-ranks-v673">{entries.map((entry,index)=><li key={entry.name}>
  <div className="recent-insight-bar-label-v673"><span><b>{String(index+1).padStart(2,'0')}</b> {entry.name}</span><strong>{entry.plays}×</strong></div>
  <div className="recent-insight-track-v673"><span style={{width:`${100*entry.plays/max}%`}}/></div>
 </li>)}</ol>;
}
function HistoryInsightsPanelV673({insights}:{insights:HistoryInsightsV673}){
 const high=Math.max(1,...insights.periods.map(t=>t.plays));
 return <section className="recent-insights-v673" aria-label="Hör-Highlights der geladenen Songs">
  <div className="recent-insight-intro-v673"><div><span className="recent-insight-kicker-v673">DEIN SOUND IM ÜBERBLICK</span><h3>Deine Hör-Highlights<span>.</span></h3><p>Dein persönlicher Rückblick auf die geladenen Spotify-Wiedergaben.</p></div><span className="recent-insight-note-v673">Momentaufnahme · kein vollständiger Langzeitverlauf</span></div>
  <div className="recent-insight-metrics-v673">
   <div><span>♫</span><strong>{insights.plays}</strong><small>Wiedergaben</small></div>
   <div><span>◈</span><strong>{insights.uniqueSongs}</strong><small>Verschiedene Songs</small></div>
   <div><span>↻</span><strong>{insights.repeatPlays}</strong><small>Weitere Wiedergaben gleicher Songs</small></div>
   <div><span>◷</span><strong>{insights.days}</strong><small>Hörtage</small></div>
  </div>
  <div className="recent-insight-panels-v673">
   <section className="recent-insight-panel-v673"><h4>Deine meistgehörten Songs</h4><p>Wiederholt abgespielte Titel ganz oben.</p><ol className="recent-insight-songs-v673">{insights.topSongs.map((song,index)=><li key={song.id}><b className="recent-insight-rank-v673">{String(index+1).padStart(2,'0')}</b><div className="recent-insight-cover-v673">{song.cover?<img src={song.cover} alt="" loading="lazy"/>:<span aria-hidden="true">♫</span>}</div><div className="recent-insight-songtext-v673"><a href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">{song.title} <span aria-hidden="true">↗</span></a><small>{song.artist}</small></div><strong className="recent-insight-count-v673">{song.plays}×</strong></li>)}</ol></section>
   <section className="recent-insight-panel-v673"><h4>Meistgehörte Künstler-Credits</h4><p>Features und Duette erscheinen gemeinsam, wie auf Spotify.</p><InsightBarsV673 entries={insights.topArtists.map(x=>({name:x.name,plays:x.plays}))}/></section>
  </div>
  <section className="recent-insight-panel-v673 recent-insight-periods-v673"><div><h4>Wann läuft deine Musik?</h4><p>Die Zeiten beziehen sich auf deine lokale Gerätezeit.</p></div><div className="recent-insight-period-grid-v673">{insights.periods.map(period=><div key={period.key}><div className="recent-insight-period-number-v673">{period.plays}</div><div className="recent-insight-period-bar-v673"><span style={{height:`${100*period.plays/high}%`}}/></div><span>{period.label}</span></div>)}</div></section>
 </section>;
}
/** A lightweight read-only history viewer. Data is fetched only while opened by the user. */
export function RecentlyPlayedV672(){
 const launch=useRef<HTMLButtonElement>(null);
 const searchInput=useRef<HTMLInputElement>(null);
 const dialogRef=useRef<HTMLElement>(null);
 const [open,setOpen]=useState(false);
 const [tracks,setTracks]=useState<RecentTrackV672[]>([]);
 const [cursor,setCursor]=useState<string|null>(null);
 const [before,setBefore]=useState<string|null>(null);
 const [refresh,setRefresh]=useState(0);
 const [hasMore,setHasMore]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState<string|null>(null);
 const [code,setCode]=useState<string|null>(null);
 const [query,setQuery]=useState('');
 const [period,setPeriod]=useState<HistoryPeriodV699>('all');
 const [mode,setMode]=useState<HistoryModeV699>('all');
 const [sort,setSort]=useState<HistorySortV699>('newest');
 const [view,setView]=useState<'timeline'|'smart'|'archive'|'statistics'|'discovery'|'recommendations'|'lastfm'|'highlights'|'gallery'|'genres'|'profile'|'designer'>('timeline');
 const [knownGenres,setKnownGenres]=useState<HistoryGenreMapV674>({});
 const [openedAt,setOpenedAt]=useState<Date|null>(null);
 const close=useCallback(()=>{setOpen(false);setTracks([]);setKnownGenres({});setBefore(null);setCursor(null);setHasMore(false);launch.current?.focus();},[]);
 useEffect(()=>{if(open)searchInput.current?.focus();},[open]);
 const openHistory=()=>{setTracks([]);setBefore(null);setCursor(null);setHasMore(false);setError(null);setCode(null);setQuery(DEFAULT_HISTORY_FILTERS_V699.query);setPeriod(DEFAULT_HISTORY_FILTERS_V699.period);setMode(DEFAULT_HISTORY_FILTERS_V699.mode);setSort(DEFAULT_HISTORY_FILTERS_V699.sort);setView('timeline');setKnownGenres({});setOpenedAt(null);setOpen(true);setRefresh(v=>v+1);};
 useEffect(()=>{
  if(!open)return;
  const previousOverflow=document.body.style.overflow;document.body.style.overflow='hidden';
  const onKey=(e:KeyboardEvent)=>{
   if(e.key==='Escape'){e.preventDefault();close();return;}
   if(e.key!=='Tab')return;
   const dialog=dialogRef.current;if(!dialog)return;
   const focusables=Array.from(dialog.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])')).filter(node=>node.getClientRects().length>0);
   if(!focusables.length){e.preventDefault();dialog.focus();return;}
   const first=focusables[0],last=focusables[focusables.length-1];
   if(e.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){e.preventDefault();last.focus();}
   else if(!e.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){e.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',onKey);
  return()=>{document.body.style.overflow=previousOverflow;document.removeEventListener('keydown',onKey);};
 },[open,close]);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();
  setBusy(true);setError(null);setCode(null);
  const load=async()=>{
   try{
    const params=before?`?before=${encodeURIComponent(before)}`:'';
    const response=await fetch(`/api/spotify/recently-played${params}`,{cache:'no-store',signal:controller.signal});
    const data=await response.json() as Partial<RecentPageV672>&{code?:string;message?:string};
    if(!response.ok)throw Object.assign(new Error(data.message||'Der Verlauf konnte nicht geladen werden.'),{code:data.code});
    if(!Array.isArray(data.tracks))throw new Error('Ungültige Verlaufsdaten von Spotify.');
    if(controller.signal.aborted)return;
    const merged=mergeHistoryPagesV699(before?tracks:[],data.tracks);
    setTracks(merged);
    setOpenedAt(new Date());
    const next=typeof data.nextBefore==='string'?data.nextBefore:null;
    setCursor(next);
    setHasMore(Boolean(data.hasMore)&&!!next&&next!==before&&data.tracks.length>0&&merged.length<V699_MAX_EVENTS);
   }catch(e){if(!controller.signal.aborted){setError(e instanceof Error?e.message:'Verlauf vorübergehend nicht verfügbar.');setCode(e&&typeof e==='object'&&'code' in e&&typeof e.code==='string'?e.code:null);}}
   finally{if(!controller.signal.aborted)setBusy(false);}
  };
  void load();return()=>controller.abort();
 },[open,before,refresh]);
 const visible=useMemo(()=>filterHistoryV699(tracks,{query,period,mode,sort}),[tracks,query,period,mode,sort]);
 const smartVisible=useMemo(()=>filterHistoryV699(tracks,{query,period,mode:'all',sort:'newest'}),[tracks,query,period]);
 const resetFilters=()=>{setQuery('');setPeriod('all');setMode('all');setSort('newest');};
 const exportCSV=()=>{
  if(!visible.length)return;
  const blob=new Blob(['\uFEFF',historyCSVV699(visible)],{type:'text/csv;charset=utf-8'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='sonic-display-zuletzt-gespielt.csv';
  document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),10000);
 };
 const groups=useMemo(()=>{
  const result:{key:string;title:string;items:RecentTrackV672[]}[]=[];
  for(const track of visible){
   const date=new Date(track.playedAt);
   const key=dayKey(date);
   const previous=result[result.length-1];
   if(previous?.key===key)previous.items.push(track);
   else result.push({key,title:dayTitle(date),items:[track]});
  }
  return result;
 },[visible]);
 const insights=useMemo(()=>historyInsightsV673(tracks),[tracks]);
 return <>
  <AutomaticListeningHistoryRecorderV702/>
  <AutomaticLastFmHistoryRecorderV708/>
  <AutomaticLastFmRecoveryV710/>
  <button ref={launch} type="button" className="recent-launch-v672" aria-haspopup="dialog" aria-expanded={open} onClick={openHistory}>◷ Zuletzt gespielt</button>
  {open&&<div className="recent-backdrop-v672" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
   <section ref={dialogRef} tabIndex={-1} className="recent-modal-v672" role="dialog" aria-modal="true" aria-labelledby="recent-title-v672">
    <header className="recent-header-v672">
     <div><span className="recent-eyebrow-v672">SONIC DISPLAY / DEINE MUSIK</span><h2 id="recent-title-v672">Zuletzt gespielt<span className="recent-accent-v672">.</span></h2><p>Deine Spotify-Hörchronik – jederzeit wiederentdecken.</p></div>
     <button type="button" className="recent-close-v672" onClick={close} aria-label="Verlauf schließen">✕</button>
    </header>
    <div className="recent-topline-v672">
     <div className="recent-stats-v672"><div><strong>{tracks.length}</strong><span>Wiedergaben geladen</span></div><div><strong>{insights.uniqueArtistCredits}</strong><span>Künstler-Credits geladen</span></div></div>
     <div className="recent-tools-v672">
      {(view==='timeline'||view==='smart')&&<label className="recent-search-v672"><span className="recent-sr-v672">Nach Titel, Künstler oder Album suchen</span><span aria-hidden="true">⌕</span><input ref={searchInput} type="search" placeholder="Titel, Künstler, Album suchen …" value={query} onChange={e=>setQuery(e.target.value)}/></label>}
      <button type="button" onClick={()=>{setTracks([]);setBefore(null);setCursor(null);setHasMore(false);setOpenedAt(null);setRefresh(v=>v+1);}} disabled={busy} aria-label="Verlauf aktualisieren">↻ Aktualisieren</button>
     </div>
    </div>
    <div className="recent-switch-v673" role="group" aria-label="Verlaufsansicht wählen">
     <button type="button" aria-pressed={view==='timeline'} className={view==='timeline'?'is-active':''} onClick={()=>setView('timeline')}>◷ Chronik</button>
     <button type="button" aria-pressed={view==='archive'} className={view==='archive'?'is-active':''} onClick={()=>setView('archive')}>▣ Mein Archiv</button>
     <button type="button" aria-pressed={view==='statistics'} className={view==='statistics'?'is-active':''} onClick={()=>setView('statistics')}>▥ Meine Statistik</button>
     <button type="button" aria-pressed={view==='discovery'} className={view==='discovery'?'is-active':''} onClick={()=>setView('discovery')}>✧ Entdeckungen</button>
     <button type="button" aria-pressed={view==='lastfm'} className={view==='lastfm'?'is-active':''} onClick={()=>setView('lastfm')}>◷ Last.fm-History</button>
     <button type="button" aria-pressed={view==='recommendations'} className={view==='recommendations'?'is-active':''} onClick={()=>setView('recommendations')}>♫ Musikvorschläge</button>
     <button type="button" aria-pressed={view==='smart'} className={view==='smart'?'is-active':''} onClick={()=>setView('smart')}>◈ Smart History</button>
     <button type="button" aria-pressed={view==='highlights'} className={view==='highlights'?'is-active':''} onClick={()=>setView('highlights')}>✦ Hör-Highlights</button>
     <button type="button" aria-pressed={view==='gallery'} className={view==='gallery'?'is-active':''} onClick={()=>setView('gallery')}>▦ Cover-Galerie</button>
     <button type="button" aria-pressed={view==='genres'} className={view==='genres'?'is-active':''} onClick={()=>setView('genres')}>◈ Genre-Mix</button>
     <button type="button" aria-pressed={view==='profile'} className={view==='profile'?'is-active':''} onClick={()=>setView('profile')}>✧ Mein Musikprofil</button>
     <button type="button" aria-pressed={view==='designer'} className={view==='designer'?'is-active':''} onClick={()=>setView('designer')}>✦ Konzert-Designer</button>
     <span>Spotify-Archiv und Last.fm-History sind getrennte Datenquellen.</span>
    </div>
    {(view==='timeline'||view==='smart')&&<section className="recent-filter-panel-v699" aria-label="Chronik filtern und exportieren">
     <div className="recent-filter-row-v699">
      <label>Zeitraum <select aria-label="Zeitraum der geladenen Songs" value={period} onChange={e=>setPeriod(e.target.value as HistoryPeriodV699)}><option value="all">Alle geladenen</option><option value="today">Heute</option><option value="week">Letzte 7 Tage</option><option value="month">Letzte 30 Tage</option></select></label>
      {view==='timeline'&&<label>Wiedergaben <select aria-label="Wiedergaben filtern" value={mode} onChange={e=>setMode(e.target.value as HistoryModeV699)}><option value="all">Alle Wiedergaben</option><option value="repeated">Mehrfach gehörte Songs</option><option value="unique">Jeden Song einmal</option></select></label>}
      {view==='timeline'&&<label>Reihenfolge <select aria-label="Chronik sortieren" value={sort} onChange={e=>setSort(e.target.value as HistorySortV699)}><option value="newest">Neueste zuerst</option><option value="oldest">Älteste zuerst</option></select></label>}
      <button type="button" onClick={resetFilters}>Filter zurücksetzen</button>
      {view==='timeline'&&<button type="button" onClick={exportCSV} disabled={!visible.length} title="Nur die aktuell gefilterten, geladenen Wiedergaben als CSV herunterladen">CSV exportieren ↓</button>}
     </div>
     <p aria-live="polite"><strong>{view==='smart'?smartVisible.length:visible.length}</strong> Treffer aus {tracks.length} geladenen Wiedergaben · Suche und Filter gelten nur für geladene Spotify-Seiten.</p>
    </section>}
    <div className="recent-scroll-v672">
     {view!=='designer'&&view!=='archive'&&view!=='statistics'&&view!=='discovery'&&view!=='recommendations'&&view!=='lastfm'&&busy&&tracks.length===0&&<div className="recent-loading-v672" role="status">♫ Deine letzten Songs werden geladen …</div>}
     {view!=='designer'&&view!=='archive'&&view!=='statistics'&&view!=='discovery'&&view!=='recommendations'&&view!=='lastfm'&&error&&<div className="recent-error-v672" role="alert"><strong>Verlauf nicht verfügbar</strong><p>{error}</p>{(code==='consent_required'||code==='reauth_required')&&<a href="/api/spotify/login">Spotify neu verbinden und Zugriff erlauben ↗</a>}<button type="button" disabled={busy} onClick={()=>{setRefresh(v=>v+1);}}>Erneut versuchen</button></div>}
     {view!=='designer'&&view!=='archive'&&view!=='statistics'&&view!=='discovery'&&view!=='recommendations'&&view!=='lastfm'&&!busy&&!error&&tracks.length===0&&<div className="recent-empty-v672">Hier erscheinen deine zuletzt auf Spotify gehörten Titel, sobald Spotify Wiedergaben im Verlauf hat.</div>}
     <PersistentListeningHistoryPanelV701 loaded={tracks} active={view==='archive'}/>
     {view==='lastfm'&&<LastFmHistoryPanelV706/>}
     {view==='statistics'&&<ListeningSourceDashboardV707 view="statistics" onOpenArchive={()=>setView('archive')} onOpenLastFm={()=>setView('lastfm')}/>}
     {view==='discovery'&&<ListeningSourceDashboardV707 view="discovery" onOpenArchive={()=>setView('archive')} onOpenLastFm={()=>setView('lastfm')}/>}
     {view==='recommendations'&&<SmartMusicDiscoveryStudioV705 onOpenArchive={()=>setView('archive')}/>}
     {view==='smart'&&tracks.length>0&&<SmartListeningHistoryPanelV700 tracks={smartVisible}/>}
     {view==='highlights'&&tracks.length>0&&<HistoryInsightsPanelV673 insights={insights}/>}
     {view==='gallery'&&tracks.length>0&&<HistoryGalleryV674 tracks={tracks}/>}
     {view==='genres'&&tracks.length>0&&<HistoryGenresV674 tracks={tracks} known={knownGenres} setKnown={setKnownGenres}/>}
     {view==='profile'&&tracks.length>0&&<ListeningProfileV675 tracks={tracks} known={knownGenres} onOpenGenres={()=>setView('genres')}/>}
     {view==='designer'&&<ConcertLookDesignerV676 tracks={tracks} known={knownGenres}/>}
     {view==='timeline'&&<>
     {tracks.length>0&&visible.length===0&&<div className="recent-empty-v672">Keine Treffer unter den {tracks.length} geladenen Wiedergaben. Ändere deinen Suchbegriff.</div>}
     {groups.map((group,groupIndex)=><section key={group.key} className="recent-day-v672">
      <div className="recent-dayheading-v672"><h3>{group.title}</h3><span>{group.items.length} {group.items.length===1?'Wiedergabe':'Wiedergaben'}</span></div>
      {groupIndex===0&&sort==='newest'&&mode==='all'&&!query.trim()&&period==='all'&&group.items.length>0&&<ListenCard feature track={group.items[0]}/>}
      <div className="recent-grid-v672">{group.items.slice(groupIndex===0&&sort==='newest'&&mode==='all'&&!query.trim()&&period==='all'?1:0).map(track=><ListenCard key={`${track.id}:${track.playedAt}`} track={track}/>)}</div>
     </section>)}
     </>}
     {view!=='archive'&&view!=='statistics'&&view!=='discovery'&&view!=='recommendations'&&view!=='lastfm'&&tracks.length>=V699_MAX_EVENTS&&<p className="recent-loadhint-v672">Maximal {V699_MAX_EVENTS} Wiedergaben in dieser Ansicht. Export und Filter berücksichtigen nur diese Einträge.</p>}
     {view!=='archive'&&view!=='statistics'&&view!=='discovery'&&view!=='recommendations'&&view!=='lastfm'&&hasMore&&<button type="button" className="recent-more-v672" disabled={busy} onClick={()=>{if(cursor)setBefore(cursor);}}>{busy?'Lädt …':'Ältere Titel laden ↓'}</button>}
     {view!=='archive'&&view!=='statistics'&&view!=='discovery'&&view!=='recommendations'&&view!=='lastfm'&&busy&&tracks.length>0&&<p className="recent-loadhint-v672" role="status">Weitere Titel werden geladen …</p>}
    </div>
    <footer className="recent-footer-v672"><span>Spotify-Hörverlauf · Automatische Sicherung nur nach Einwilligung · Konto-getrennt · JSON-Sicherung empfohlen</span><span>{openedAt?`Abgerufen ${clock.format(openedAt)}`:''}</span></footer>
   </section>
  </div>}
 </>;
}
