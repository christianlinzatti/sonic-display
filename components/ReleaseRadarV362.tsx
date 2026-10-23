"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MUSIC_GENRES_V361, type MusicGenreV361, type MusicReleaseV361 } from "@/lib/music-discovery-v361";
import {RADAR_DAYS_V362, RADAR_SEEN_KEY_V362, mergeRadarReleases, parseSeenRadarIds, type RadarArtistV362, type RadarDaysV362, type RadarReleaseV362} from "@/lib/release-radar-v362";

type ApiError={code?:string;message?:string};
type RadarData=ApiError&{artists?:RadarArtistV362[];releases?:RadarReleaseV362[];hasMore?:boolean;nextCursor?:string|null;failedArtists?:string[];skippedImprecise?:number;partial?:boolean;label?:string};
type CatalogData=ApiError&{releases?:MusicReleaseV361[];hasMore?:boolean};
const formatDate=(value:string|null)=>value?new Date(`${value}T12:00:00Z`).toLocaleDateString("de-AT"):"Nicht bekannt";
const describe=(err:unknown)=>err instanceof Error?err.message:"Spotify konnte die Veröffentlichungen nicht laden.";
function readSeen(){try{return parseSeenRadarIds(JSON.parse(window.localStorage.getItem(RADAR_SEEN_KEY_V362)??"[]"));}catch{return [];}}

/** An on-demand, client-only overlay: never polls or reports a scheduled notification. */
export function ReleaseRadarV362(){
 const [open,setOpen]=useState(false),[tab,setTab]=useState<"followed"|"genre">("followed");
 const [days,setDays]=useState<RadarDaysV362>(90),[genre,setGenre]=useState<MusicGenreV361>("deutschrap");
 const [artists,setArtists]=useState<RadarArtistV362[]>([]),[releases,setReleases]=useState<RadarReleaseV362[]>([]);
 const [catalog,setCatalog]=useState<MusicReleaseV361[]>([]),[catalogMore,setCatalogMore]=useState(false);
 const [cursor,setCursor]=useState<string|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState<string|null>(null),[notice,setNotice]=useState<string|null>(null),[partial,setPartial]=useState(false);
 const [seen,setSeen]=useState<string[]>([]),[unseenOnly,setUnseenOnly]=useState(false),[reload,setReload]=useState(0);
 const launch=useRef<HTMLButtonElement>(null),activeRequest=useRef<AbortController|null>(null),seenReady=useRef(false);
 const active=useRef(false);
 const visible=useMemo(()=>releases.filter(r=>!unseenOnly||!seen.includes(r.id)),[releases,unseenOnly,seen]);
 const unseenCount=useMemo(()=>releases.filter(r=>!seen.includes(r.id)).length,[releases,seen]);
 const persistSeen=useCallback((ids:string[])=>{const safe=parseSeenRadarIds(ids);setSeen(safe);try{window.localStorage.setItem(RADAR_SEEN_KEY_V362,JSON.stringify(safe));window.dispatchEvent(new Event("sonic:radar-seen-changed-v362"));}catch{/* storage disabled */}},[]);
 const markSeen=(id:string)=>{persistSeen([...seen,id]);};
 const close=()=>{activeRequest.current?.abort();activeRequest.current=null;active.current=false;setOpen(false);window.setTimeout(()=>launch.current?.focus(),0);};
 const loadFollowed=useCallback(async(next:string|null,append:boolean,signal:AbortSignal)=>{
  const qs=new URLSearchParams({days:String(days)});if(next)qs.set("after",next);
  const response=await fetch(`/api/spotify/release-radar?${qs}`,{cache:"no-store",signal});
  const data=await response.json() as RadarData;
  if(!response.ok)throw new Error(data.message??"Release Radar nicht verfügbar.");
  if(signal.aborted)return;
  setArtists(prev=>append?[...prev,...(data.artists??[])]:data.artists??[]);
  setReleases(prev=>mergeRadarReleases(append?[...prev,...(data.releases??[])]:data.releases??[]));
  setCursor(data.hasMore?data.nextCursor??null:null);
  setPartial(previous=>append?previous||Boolean(data.partial):Boolean(data.partial));
  if(data.partial)setNotice("Einige Künstler konnten nicht geprüft werden. Die Liste ist möglicherweise unvollständig.");
  else if(!append)setNotice(data.label??null);
 },[days]);
 const loadGenre=useCallback(async(signal:AbortSignal)=>{
  const qs=new URLSearchParams({mode:"new",genre,withGenre:"true"});
  const response=await fetch(`/api/spotify/music-discovery?${qs}`,{cache:"no-store",signal});
  const data=await response.json() as CatalogData;
  if(!response.ok)throw new Error(data.message??"Genre-Katalog nicht verfügbar.");
  if(signal.aborted)return;
  setCatalog(data.releases??[]);setCatalogMore(Boolean(data.hasMore));
 },[genre]);
 useEffect(()=>{if(!open)return;active.current=true;if(!seenReady.current){setSeen(readSeen());seenReady.current=true;}
   const ac=new AbortController();activeRequest.current=ac;setLoading(true);setError(null);setNotice(null);setPartial(false);
   if(tab==="followed"){setArtists([]);setReleases([]);setCursor(null);}else{setCatalog([]);}
   const run=tab==="followed"?loadFollowed(null,false,ac.signal):loadGenre(ac.signal);
   void run.catch(err=>{if(!ac.signal.aborted)setError(describe(err));}).finally(()=>{if(!ac.signal.aborted)setLoading(false);});
   return()=>{ac.abort();activeRequest.current=null;};
 },[open,tab,days,genre,reload,loadFollowed,loadGenre]);
 useEffect(()=>{const onOpen=()=>{setTab("followed");setOpen(true);setReload(n=>n+1);};window.addEventListener("sonic:release-radar-open-v363",onOpen);return()=>window.removeEventListener("sonic:release-radar-open-v363",onOpen);},[]);
 useEffect(()=>{if(!open)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape")close();};window.addEventListener("keydown",onKey);return()=>window.removeEventListener("keydown",onKey);},[open]);
 const more=()=>{if(loading||!cursor)return;activeRequest.current?.abort();const ac=new AbortController();activeRequest.current=ac;setLoading(true);setError(null);
   void loadFollowed(cursor,true,ac.signal).catch(err=>{if(!ac.signal.aborted)setError(describe(err));}).finally(()=>{if(!ac.signal.aborted)setLoading(false);});
 };
 const showGenre=tab==="genre";
 return <>
  <button ref={launch} type="button" className="sonic-radar-launch-v362" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setOpen(true);setReload(n=>n+1);}}>✦ Release Radar</button>
  {open&&<div className="sonic-radar-backdrop-v362" onMouseDown={e=>{if(e.target===e.currentTarget)close();}}>
   <section role="dialog" aria-modal="true" aria-label="Persönlicher Spotify Release Radar" className="sonic-radar-modal-v362">
    <header className="sonic-radar-header-v362"><div><h2>✦ Personal Release Radar</h2><p>Neue Musik gefolgter Künstler und Genre-Neuheiten entdecken</p></div><button type="button" onClick={close} aria-label="Release Radar schließen">✕</button></header>
    <nav aria-label="Radar-Modus" className="sonic-radar-tabs-v362"><button type="button" aria-pressed={!showGenre} onClick={()=>setTab("followed")}>Meine Künstler</button><button type="button" aria-pressed={showGenre} onClick={()=>setTab("genre")}>Genres</button></nav>
    {!showGenre?<div className="sonic-radar-controls-v362"><label>Zeitraum <select value={days} onChange={e=>setDays(Number(e.target.value) as RadarDaysV362)}>{RADAR_DAYS_V362.map(d=><option value={d} key={d}>Letzte {d} Tage</option>)}</select></label><label><input type="checkbox" checked={unseenOnly} onChange={e=>setUnseenOnly(e.target.checked)}/> Nur ungesehene ({unseenCount})</label><button type="button" onClick={()=>setReload(n=>n+1)} disabled={loading}>Aktualisieren</button></div>:<div className="sonic-radar-genres-v362" aria-label="Genre auswählen">{(Object.keys(MUSIC_GENRES_V361) as MusicGenreV361[]).map(g=><button type="button" key={g} aria-pressed={g===genre} onClick={()=>setGenre(g)}>{MUSIC_GENRES_V361[g].label}</button>)}</div>}
    <p className="sonic-radar-info-v362">{showGenre?"Genre-Neuheiten: Spotify-Katalogsuche mit tag:new und Genre-Stichwort (ungefähr zwei Wochen). Keine personalisierte oder vollständige Release-Liste.":"Gefolgte Künstler: maximal vier Künstler je Seite und zehn Alben/Singles pro Künstler. Spotify kann weitere Veröffentlichungen haben. Nur taggenau datierte Releases erscheinen."}</p>
    {error&&<p className="sonic-radar-error-v362" role="alert">{error} <button type="button" onClick={()=>setReload(n=>n+1)}>Erneut versuchen</button></p>}
    {error?.includes("verbinden")&&<a href="/api/spotify/login" className="sonic-radar-login-v362">Spotify neu verbinden ↗</a>}
    {notice&&!showGenre&&<p className="sonic-radar-hint-v362">{notice}</p>}
    <div className="sonic-radar-scroll-v362">
     {!showGenre&&artists.length>0&&<div className="sonic-radar-artists-v362"><h3>Überprüfte Künstler ({artists.length})</h3><div>{artists.map(a=><a key={a.id} href={a.spotifyUrl} target="_blank" rel="noopener noreferrer" title={`Künstler ${a.name} auf Spotify`}>{a.imageUrl?<img src={a.imageUrl} alt="" loading="lazy"/>:<span aria-hidden="true">♫</span>}{a.name}</a>)}</div></div>}
     {!showGenre&&<div className="sonic-radar-count-v362"><span>{visible.length} Releases in dieser Ansicht · {unseenCount} ungesehen</span>{releases.length>0&&<><button type="button" onClick={()=>persistSeen([...seen,...visible.map(r=>r.id)])}>Sichtbare als angesehen markieren</button><button type="button" onClick={()=>persistSeen([])}>Markierungen löschen</button></>}</div>}
     <div className="sonic-radar-grid-v362">{(showGenre?catalog:visible).map(release=><article className="sonic-radar-card-v362" key={release.id}>
       {release.coverUrl?<img src={release.coverUrl} alt={`Albumcover ${release.title}`} loading="lazy" referrerPolicy="no-referrer"/>:<div className="sonic-radar-fallback-v362">♫</div>}
       <div className="sonic-radar-body-v362"><h3>{release.title}</h3><p>{release.artists.join(", ")}</p><p>Veröffentlicht: {formatDate(release.releaseDate)}{!showGenre&&"group" in release?` · ${release.group==="single"?"Single":release.group==="album"?"Album":"Release"}`:""}</p>
        {!showGenre&&!seen.includes(release.id)&&<span className="sonic-radar-new-v362">Noch nicht angesehen</span>}
        <div className="sonic-radar-actions-v362"><a href={release.spotifyUrl} target="_blank" rel="noopener noreferrer">Auf Spotify ↗</a>{!showGenre&&<button type="button" onClick={()=>markSeen(release.id)} disabled={seen.includes(release.id)}>{seen.includes(release.id)?"✓ Angesehen":"Als angesehen markieren"}</button>}</div>
       </div>
      </article>)}</div>
     {loading&&<p role="status">Spotify-Veröffentlichungen werden geprüft …</p>}
     {!loading&&!error&&(showGenre?catalog.length===0:visible.length===0)&&<p>{!showGenre&&artists.length===0?"Keine gefolgten Künstler auf dieser Seite verfügbar.":!showGenre&&releases.length>0?"Alle gefundenen Releases sind bereits markiert.":"Keine passenden Veröffentlichungen in der geprüften Auswahl gefunden. Das bedeutet nicht, dass keine weiteren Releases existieren."}</p>}
     {!showGenre&&cursor&&<button className="sonic-radar-more-v362" type="button" onClick={more} disabled={loading}>Weitere gefolgte Künstler prüfen</button>}
     {partial&&!showGenre&&<p className="sonic-radar-error-v362" role="status">Unvollständige Spotify-Antwort: Bitte später erneut aktualisieren.</p>}
     {showGenre&&catalogMore&&<p className="sonic-radar-hint-v362">Weitere Katalogtreffer findest du in „Musik entdecken“. Hier werden maximal zehn Albumtreffer gezeigt.</p>}
    </div>
    <footer className="sonic-radar-footer-v362">On-Demand-Abfrage · Keine Hintergrundbenachrichtigung · „Angesehen“ nur lokal in diesem Browser gespeichert · Musik- und Bilddaten: Spotify</footer>
   </section>
  </div>}
 </>;
}
