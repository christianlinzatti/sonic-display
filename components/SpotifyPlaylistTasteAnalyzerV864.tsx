'use client';
import {useEffect,useMemo,useRef,useState} from 'react';
import {buildPlaylistTasteV864,V864_MAX_TRACKS} from '@/lib/spotify-playlist-taste-v864';
import {TRACK_PAGE_SIZE_V851,type SpotifyPlaylistTrackV851,type SpotifyListPageV851} from '@/lib/spotify-playlists-v851';
import {V706_USERNAME_KEY,validLastFmUsernameV706,readLastFmArchiveV706,type LastFmEventV706} from '@/lib/lastfm-history-v706';
import {openLongtermDbV713,readLongtermHistoryV713} from '@/lib/lastfm-indexed-history-v713';

type Props={playlistId:string;playlistName:string;playlistTotal:number|null};
type View='all'|'favorite'|'heard'|'not-in-archive';
const formatNumber=(n:number)=>n.toLocaleString('de-AT');
const formatDate=(s:string)=>new Intl.DateTimeFormat('de-AT',{day:'2-digit',month:'short',year:'numeric'}).format(new Date(s));
function errorText(e:unknown){return e instanceof Error?e.message:'Unerwarteter Fehler.';}

/** V864: opt-in bounded Spotify pagination; read-only local Last.fm archive, no Last.fm network request. */
export function SpotifyPlaylistTasteAnalyzerV864({playlistId,playlistName,playlistTotal}:Props){
 const [active,setActive]=useState(false);
 const [loading,setLoading]=useState(false);
 const [error,setError]=useState('');
 const [hint,setHint]=useState('');
 const [source,setSource]=useState('');
 const [progress,setProgress]=useState(0);
 const [limited,setLimited]=useState(false);
 const [tracks,setTracks]=useState<SpotifyPlaylistTrackV851[]>([]);
 const [history,setHistory]=useState<LastFmEventV706[]|null>(null);
 const [view,setView]=useState<View>('all');
 const [search,setSearch]=useState('');
 const [showCount,setShowCount]=useState(15);
 const abortRef=useRef<AbortController|null>(null);
 useEffect(()=>()=>abortRef.current?.abort(),[]);
 const report=useMemo(()=>active&&!loading&&!error?buildPlaylistTasteV864(tracks,history):null,[active,loading,error,tracks,history]);
 const visible=useMemo(()=>{
  if(!report)return [];
  const q=search.normalize('NFKC').toLocaleLowerCase('de').trim();
  const sorted=report.tracks.filter(t=>{
   const eligible=view==='all'||view==='favorite'&&t.status==='favorite'||view==='heard'&&t.plays>0||view==='not-in-archive'&&t.status==='not-in-archive';
   return eligible&&(!q||`${t.track.title} ${t.track.artist}`.normalize('NFKC').toLocaleLowerCase('de').includes(q));
  });
  if(view==='favorite'||view==='heard')sorted.sort((a,b)=>b.plays-a.plays||a.track.position-b.track.position);
  return sorted;
 },[report,view,search]);
 async function analyze(){
  if(loading)return;
  abortRef.current?.abort();const controller=new AbortController();abortRef.current=controller;
  setLoading(true);setActive(false);setError('');setHint('');setSource('');setProgress(0);setLimited(false);setView('all');setSearch('');setShowCount(15);
  try{
   const collected:SpotifyPlaylistTrackV851[]=[];
   let offset=0,more=true,limitedResult=false;
   while(more&&offset<V864_MAX_TRACKS){
    const response=await fetch(`/api/spotify/playlists/${encodeURIComponent(playlistId)}/items?offset=${offset}`,{cache:'no-store',signal:controller.signal});
    const payload=await response.json() as SpotifyListPageV851<SpotifyPlaylistTrackV851>&{code?:string;message?:string};
    if(!response.ok)throw new Error(response.status===403?'Spotify erlaubt den Abruf von Playlist-Titeln derzeit nur für eigene oder gemeinsam verwaltete Playlists.':payload.message??`Spotify meldet HTTP ${response.status}.`);
    if(!Array.isArray(payload.items)||!Number.isSafeInteger(payload.offset)||payload.offset!==offset||typeof payload.hasMore!=='boolean')throw new Error('Spotify hat eine unerwartete Playlist-Seite geliefert.');
    collected.push(...payload.items.filter(item=>Number.isSafeInteger(item.position)&&item.position>=offset&&item.position<V864_MAX_TRACKS));
    setProgress(collected.length);
    more=payload.hasMore;
    offset+=TRACK_PAGE_SIZE_V851;
    if(collected.length>=V864_MAX_TRACKS||offset>=V864_MAX_TRACKS){limitedResult=more||payload.total>V864_MAX_TRACKS;break;}
    if(more&&payload.items.length===0)throw new Error('Spotify liefert keine weiteren Titel trotz Folgeseiten-Angabe.');
   }
   if(controller.signal.aborted)return;
   // Last.fm account is explicitly configured elsewhere in Sonic Display; never choose another user's archive.
   const username=window.localStorage.getItem(V706_USERNAME_KEY)?.trim()??'';
   let lastFm:LastFmEventV706[]|null=null;let archiveSource='';let note='';
   if(!validLastFmUsernameV706(username))note='Keine Last.fm-History konfiguriert. Künstlerübersicht verfügbar; Hörvergleiche benötigen das Last.fm-Archiv.';
   else{
    try{
     const db=await openLongtermDbV713();
     try{lastFm=(await readLongtermHistoryV713(db,username)).events;archiveSource='Last.fm-Langzeitarchiv (lokal)';}
     finally{db.close();}
     // The Last.fm panel normally migrates V706 to V713. If it was never opened,
     // retain access to the older local-only archive instead of reporting no plays.
     if(!lastFm.length){const mirror=readLastFmArchiveV706(window.localStorage,username);
      if(mirror.archive?.events.length){lastFm=mirror.archive.events;archiveSource='Last.fm-Kurzzeitarchiv (lokal, möglicherweise unvollständig)';}
     }
    }catch(err){
     const mirror=readLastFmArchiveV706(window.localStorage,username);
     if(mirror.archive){lastFm=mirror.archive.events;archiveSource='Last.fm-Kurzzeitarchiv (lokal, möglicherweise unvollständig)';}
     else note=`Last.fm-Archiv konnte nicht gelesen werden: ${mirror.error??errorText(err)}`;
    }
    // An old V706 install may have a legacy localStorage archive but an empty V713 database.
    // Prefer that bounded local mirror rather than incorrectly reporting zero scrobbles.
    if(lastFm!==null&&!lastFm.length){
     const mirror=readLastFmArchiveV706(window.localStorage,username);
     if(mirror.archive?.events.length){lastFm=mirror.archive.events;archiveSource='Last.fm-Kurzzeitarchiv (lokal, möglicherweise unvollständig)';}
     else note='Dein Last.fm-Archiv enthält derzeit keine erfassten Scrobbles.';
    }
   }
   if(controller.signal.aborted||window.localStorage.getItem(V706_USERNAME_KEY)?.trim()!==username)return;
   setTracks(collected);setHistory(lastFm);setLimited(limitedResult);setHint(note);setSource(archiveSource);setActive(true);
  }catch(err){if(!controller.signal.aborted)setError(errorText(err));}
  finally{if(!controller.signal.aborted)setLoading(false);}
 }
 return <section className="sonic-taste-v864" id="sonic-playlist-taste-v864" aria-label={`Hörvergleich für ${playlistName}`}>
  <div className="sonic-taste-heading-v864"><div><span className="sonic-playlist-eyebrow-v852">PLAYLIST × HISTORY</span><h4>Playlist Taste Analyzer</h4><p>Welche Titel deiner Playlist sind in deiner Last.fm-History besonders oft vertreten?</p></div>
   <button type="button" className="sonic-taste-run-v864" disabled={loading} onClick={()=>void analyze()}>{loading?`Analysiere … ${formatNumber(progress)} Titel`:active?'Analyse aktualisieren':'Playlist analysieren'}</button>
  </div>
  <p className="sonic-taste-notice-v864">Analyse nur auf Knopfdruck · maximal {V864_MAX_TRACKS} Playlist-Einträge · keine neuen Last.fm-API-Anfragen · ausschließlich lokaler Archivabgleich</p>
  {error&&<p role="alert" className="sonic-taste-error-v864">{error} <button type="button" onClick={()=>void analyze()}>Erneut versuchen</button></p>}
  {loading&&<p role="status" className="sonic-taste-notice-v864">Lade Playlist-Seiten und lese anschließend das lokale Last.fm-Archiv …</p>}
  {report&&<>
   {limited&&<p role="status" className="sonic-taste-notice-v864">Die Playlist hat weitere Einträge. Die Analyse zeigt nur die ersten {V864_MAX_TRACKS} Positionen; Ergebnisse sind keine Gesamtauswertung.</p>}
   {playlistTotal!==null&&playlistTotal>report.scanned&&!limited&&<p className="sonic-taste-notice-v864">Spotify meldet {formatNumber(playlistTotal)} Positionen; {formatNumber(report.scanned)} gültige Musiktitel konnten analysiert werden.</p>}
   {hint&&<p role="status" className="sonic-taste-notice-v864">{hint}</p>}
   {source&&<p className="sonic-taste-source-v864">Datengrundlage: {source}</p>}
   <div className="sonic-taste-metrics-v864">
    <div><strong>{formatNumber(report.uniqueTracks)}</strong><span>Verschiedene Songs</span></div>
    <div><strong>{formatNumber(report.topArtists.length)}</strong><span>Künstler im Top-Ranking</span></div>
    <div><strong>{report.historyAvailable?formatNumber(report.matchedTracks):'–'}</strong><span>In Last.fm gefunden</span></div>
    <div><strong>{report.historyAvailable?formatNumber(report.favoriteTracks):'–'}</strong><span>Ab 3 Scrobbles</span></div>
   </div>
   <p className="sonic-taste-notice-v864">{formatNumber(report.duplicates)} doppelte Titelpositionen zusammengefasst. Ein nicht gefundener Song wurde nicht zwingend nie gehört – dein Archiv kann Lücken enthalten.</p>
   {!!report.topArtists.length&&<div className="sonic-taste-artists-v864"><h5>Künstler, die deine Playlist prägen</h5>
    {report.topArtists.map((a,i)=><div className="sonic-taste-artist-row-v864" key={`${i}-${a.name}`}><span>{a.name}</span><span className="sonic-taste-bar-v864"><i style={{width:`${Math.round(a.tracks/report.topArtists[0].tracks*100)}%`}}/></span><small>{a.tracks} Titel{report.historyAvailable?` · ${a.plays} Scrobbles`:''}</small></div>)}
   </div>}
   {report.historyAvailable&&<p className="sonic-taste-summary-v864">{formatNumber(report.matchedTracks)} von {formatNumber(report.uniqueTracks)} verschiedenen Songs im lokalen Archiv gefunden ({report.uniqueTracks?Math.round(100*report.matchedTracks/report.uniqueTracks):0} %). {formatNumber(report.matchingScrobbles)} passende Scrobbles erfasst.</p>}
   <div className="sonic-taste-filter-v864" role="group" aria-label="Ergebnisse filtern">
    {([['all','Alle'],['favorite','Oft gehört'],['heard','Im Archiv'],['not-in-archive','Kein Archivtreffer']] as const).map(([value,label])=><button key={value} type="button" aria-pressed={view===value} disabled={!report.historyAvailable&&value!=='all'} onClick={()=>{setView(value);setShowCount(15);}}>{label}</button>)}
   </div>
   <label className="sonic-taste-search-v864">Song oder Künstler suchen <input type="search" value={search} onChange={(e:{target:{value:string}})=>{setSearch(e.target.value);setShowCount(15);}} placeholder="Playlist durchsuchen …"/></label>
   <ol className="sonic-taste-results-v864">{visible.slice(0,showCount).map(item=><li key={item.key}><div><a href={item.track.spotifyUrl} target="_blank" rel="noopener noreferrer">{item.track.title}</a><small>{item.track.artist}</small></div><span>{item.status==='favorite'?`${item.plays} × gehört`:item.status==='heard'?`${item.plays} Scrobble${item.plays!==1?'s':''}`:item.status==='not-in-archive'?'Nicht im Archiv':'Nicht verglichen'}{item.lastPlayed?<small>Zuletzt: {formatDate(item.lastPlayed)}</small>:null}</span></li>)}</ol>
   {!visible.length&&<p className="sonic-taste-notice-v864">Keine passenden Songs im gewählten Filter.</p>}
   {visible.length>showCount&&<button className="sonic-taste-more-v864" type="button" onClick={()=>setShowCount(n=>Math.min(n+15,visible.length))}>Weitere Ergebnisse anzeigen ({visible.length-showCount} übrig)</button>}
  </>}
 </section>;
}
