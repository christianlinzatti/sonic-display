"use client";
import {useEffect,useMemo,useRef,useState,useCallback} from "react";
import {MUSIC_GENRES_V361,type MusicGenreV361,type MusicDiscoveryMode,type MusicTrackV361,type MusicReleaseV361} from "@/lib/music-discovery-v361";
import {musicDiscoverySearchQueryV449,MUSIC_DISCOVERY_SEARCH_EVENT_V449} from "@/services/genius/musicDiscoveryV449";

type ApiError={code?:string;message?:string};
type ResponseMusic=ApiError&{tracks?:MusicTrackV361[];releases?:MusicReleaseV361[];hasMore?:boolean;label?:string};
type ResponseStatus=ApiError&{statuses?:Record<string,boolean>};
type Mode=Exclude<MusicDiscoveryMode,"album">;
const STORAGE="sonic.music-discovery.genre.v361";
const describe=(error:unknown)=>error instanceof Error?error.message:"Spotify ist momentan nicht erreichbar.";
const readGenre=():MusicGenreV361=>{try{const x=window.localStorage.getItem(STORAGE);if(x&&Object.hasOwn(MUSIC_GENRES_V361,x))return x as MusicGenreV361;}catch{/* local storage disabled */}return "deutschrap";};
const dateLabel=(date:string|null,precision:string|null)=>date?precision==="day"?new Date(`${date}T12:00:00Z`).toLocaleDateString("de-AT"):precision==="month"?`${date.slice(5,7)}/${date.slice(0,4)}`:date:"Datum nicht verfügbar";
/** All Spotify calls happen on the server; the browser receives public metadata only. */
export function MusicDiscoveryV361(){
 const [open,setOpen]=useState(false),[mode,setMode]=useState<Mode>("genre"),[genre,setGenre]=useState<MusicGenreV361>("deutschrap");
 const [term,setTerm]=useState(""),[debounced,setDebounced]=useState(""),[withGenre,setWithGenre]=useState(false);
 const [offset,setOffset]=useState(0),[hasMore,setHasMore]=useState(false),[loading,setLoading]=useState(false),[refresh,setRefresh]=useState(0);
 const [tracks,setTracks]=useState<MusicTrackV361[]>([]),[releases,setReleases]=useState<MusicReleaseV361[]>([]);
 const [selectedRelease,setSelectedRelease]=useState<MusicReleaseV361|null>(null),[albumTracks,setAlbumTracks]=useState<MusicTrackV361[]>([]),[albumLoading,setAlbumLoading]=useState(false),[albumError,setAlbumError]=useState<string|null>(null),[albumOffset,setAlbumOffset]=useState(0),[albumHasMore,setAlbumHasMore]=useState(false);
 const [statuses,setStatuses]=useState<Record<string,boolean>>({}),[statusLoading,setStatusLoading]=useState(false),[busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState<string|null>(null),[statusError,setStatusError]=useState<string|null>(null),[consent,setConsent]=useState(false);
 const [playingPreview,setPlayingPreview]=useState<string|null>(null),[previewError,setPreviewError]=useState<string|null>(null);
 const launch=useRef<HTMLButtonElement|null>(null),audio=useRef<HTMLAudioElement|null>(null),active=useRef(true),mutationLock=useRef(false),searchRef=useRef<HTMLInputElement|null>(null);
 const visible=mode==="new"?albumTracks:tracks;
 const visibleIds=visible.map(t=>t.id).join(",");
 const switchMode=(value:Mode)=>{setMode(value);setOffset(0);setSelectedRelease(null);setAlbumOffset(0);setTracks([]);setReleases([]);setError(null);setPlayingPreview(null);};
 const switchGenre=(value:MusicGenreV361)=>{setGenre(value);setOffset(0);setSelectedRelease(null);setAlbumOffset(0);setTracks([]);setReleases([]);setPlayingPreview(null);try{window.localStorage.setItem(STORAGE,value);}catch{/* no persistent storage */}};
 const close=useCallback(()=>{audio.current?.pause();setPlayingPreview(null);setOpen(false);launch.current?.focus();},[]);
 useEffect(()=>{active.current=true;return()=>{active.current=false;};},[]);
 // V449: opened only by a user clicking a verified Genius discovery. Reuses existing Spotify catalogue search.
 useEffect(()=>{
  const handler=(event:Event)=>{
   const payload=(event as CustomEvent<{query?:unknown}>).detail;
   const query=musicDiscoverySearchQueryV449(payload?.query);
   if(!query)return;
   audio.current?.pause();setPlayingPreview(null);
   setTerm(query);setDebounced(query);setMode("search");setOffset(0);
   setSelectedRelease(null);setAlbumTracks([]);setReleases([]);setTracks([]);
   setError(null);setOpen(true);
  };
  window.addEventListener(MUSIC_DISCOVERY_SEARCH_EVENT_V449,handler);
  return()=>window.removeEventListener(MUSIC_DISCOVERY_SEARCH_EVENT_V449,handler);
 },[]);

 useEffect(()=>{if(open)setGenre(readGenre());},[open]);
 useEffect(()=>{if(!open)return;const onKey=(event:KeyboardEvent)=>{if(event.key==="Escape"){event.preventDefault();close();}};document.addEventListener("keydown",onKey);return()=>document.removeEventListener("keydown",onKey);},[open,close]);
 useEffect(()=>{if(open&&mode==="search")searchRef.current?.focus();},[open,mode]);
 useEffect(()=>{if(!open)return;const timer=window.setTimeout(()=>setDebounced(term.trim()),350);return()=>window.clearTimeout(timer);},[open,term]);
 useEffect(()=>{
  if(!open)return;
  if(mode==="search"&&(debounced.length<2||debounced.length>70)){setTracks([]);setHasMore(false);setLoading(false);return;}
  const controller=new AbortController(),params=new URLSearchParams({mode,offset:String(offset)});
  if(mode==="genre")params.set("genre",genre);
  if(mode==="new"){params.set("genre",genre);params.set("withGenre",String(withGenre));}
  if(mode==="search")params.set("q",debounced);
  setLoading(true);setError(null);
  const load=async()=>{try{
    const res=await fetch(`/api/spotify/music-discovery?${params}`,{cache:"no-store",signal:controller.signal});
    const data=await res.json() as ResponseMusic;
    if(!res.ok){if(data.code==="consent_required"||data.code==="reauth_required")setConsent(true);throw new Error(data.message??"Musik-Suche fehlgeschlagen.");}
    if(mode==="new"){
      if(!Array.isArray(data.releases))throw new Error("Spotify hat keine gültige Release-Liste geliefert.");
      if(!controller.signal.aborted)setReleases(prev=>offset===0?data.releases!:Array.from(new Map([...prev,...data.releases!].map(a=>[a.id,a])).values()));
    }else{
      if(!Array.isArray(data.tracks))throw new Error("Spotify hat keine gültige Songliste geliefert.");
      if(!controller.signal.aborted)setTracks(prev=>offset===0?data.tracks!:Array.from(new Map([...prev,...data.tracks!].map(t=>[t.id,t])).values()));
    }
    if(!controller.signal.aborted)setHasMore(Boolean(data.hasMore)&&offset<50);
  }catch(err){if(!controller.signal.aborted)setError(describe(err));}finally{if(!controller.signal.aborted)setLoading(false);}};
  void load();return()=>controller.abort();
 },[open,mode,genre,debounced,offset,refresh,withGenre]);
 useEffect(()=>{
  if(!open||!selectedRelease){setAlbumTracks([]);setAlbumHasMore(false);return;}
  const controller=new AbortController();setAlbumLoading(true);setAlbumError(null);setAlbumTracks([]);
  const load=async()=>{try{
   const q=new URLSearchParams({mode:"album",albumId:selectedRelease.id,offset:String(albumOffset)});
   const res=await fetch(`/api/spotify/music-discovery?${q}`,{cache:"no-store",signal:controller.signal});
   const data=await res.json() as ResponseMusic;
   if(!res.ok)throw new Error(data.message??"Album-Titel konnten nicht geladen werden.");
   if(!controller.signal.aborted){const batch=(data.tracks??[]).map(t=>({...t,album:selectedRelease.title,releaseDate:selectedRelease.releaseDate,releasePrecision:selectedRelease.releasePrecision,coverUrl:selectedRelease.coverUrl}));setAlbumTracks(old=>albumOffset===0?batch:Array.from(new Map([...old,...batch].map(t=>[t.id,t])).values()));setAlbumHasMore(Boolean(data.hasMore)&&albumOffset<50);}
  }catch(err){if(!controller.signal.aborted)setAlbumError(describe(err));}finally{if(!controller.signal.aborted)setAlbumLoading(false);}};
  void load();return()=>controller.abort();
 },[open,selectedRelease,albumOffset]);
 useEffect(()=>{
  if(!open||!visibleIds){setStatuses({});setStatusLoading(false);return;}
  const controller=new AbortController();setStatusLoading(true);setStatusError(null);
  const load=async()=>{try{
   const chunks=visibleIds.split(",").reduce<string[][]>((parts,id)=>{if(!parts.length||parts.at(-1)!.length===10)parts.push([]);parts.at(-1)!.push(id);return parts;},[]);
   const items=await Promise.all(chunks.map(async chunk=>{
    const res=await fetch(`/api/spotify/music-discovery/library?ids=${encodeURIComponent(chunk.join(","))}`,{cache:"no-store",signal:controller.signal});
    const data=await res.json() as ResponseStatus;
    if(!res.ok){if(data.code==="consent_required"||data.code==="reauth_required")setConsent(true);throw new Error(data.message??"Bibliotheksstatus nicht verfügbar.");}
    if(!data.statuses)throw new Error("Spotify hat den Bibliotheksstatus nicht bestätigt.");return data.statuses;
   }));
   if(!controller.signal.aborted)setStatuses(Object.assign({},...items));
  }catch(err){if(!controller.signal.aborted){setStatuses({});setStatusError(describe(err));}}finally{if(!controller.signal.aborted)setStatusLoading(false);}};
  void load();return()=>controller.abort();
 },[open,visibleIds]);
 const changeSave=async(track:MusicTrackV361,save:boolean)=>{
  if(mutationLock.current||busy||consent||typeof statuses[track.id]!=="boolean")return;
  mutationLock.current=true;setBusy(track.id);setStatusError(null);
  try{
   const res=await fetch("/api/spotify/music-discovery/library",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({trackId:track.id,save})});
   const data=await res.json() as ApiError&{saved?:boolean};
   if(!res.ok){if(data.code==="consent_required"||data.code==="reauth_required")setConsent(true);throw new Error(data.message??"Spotify hat diese Änderung abgelehnt.");}
   if(data.saved!==save)throw new Error("Spotify hat den neuen Bibliotheksstatus nicht bestätigt.");
   if(active.current){setStatuses(prev=>({...prev,[track.id]:save}));window.dispatchEvent(new CustomEvent("sonic:track-library-changed-v361",{detail:{trackId:track.id,saved:save}}));}
  }catch(err){if(active.current)setStatusError(describe(err));}finally{mutationLock.current=false;if(active.current)setBusy(null);}
 };
 const controls=useMemo(()=>Object.keys(MUSIC_GENRES_V361) as MusicGenreV361[],[]);
 const preview=(track:MusicTrackV361)=>{setPreviewError(null);if(playingPreview===track.id){audio.current?.pause();setPlayingPreview(null);}else{audio.current?.pause();setPlayingPreview(track.id);}};
 return <>
  <button ref={launch} type="button" className="sonic-music-launch-v361" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setOpen(true);setOffset(0);setRefresh(n=>n+1);}}>♫ Musik entdecken</button>
  {open&&<div className="sonic-music-backdrop-v361" onMouseDown={e=>{if(e.currentTarget===e.target)close();}}>
    <section role="dialog" aria-modal="true" aria-label="Spotify Musik entdecken" className="sonic-music-modal-v361">
      <header className="sonic-music-head-v361"><div><h2>♫ Smart Music Discovery</h2><p>Neue Musik suchen, entdecken und in Spotify speichern</p></div><button type="button" onClick={close} aria-label="Musik-Entdeckung schließen">✕</button></header>
      <nav className="sonic-music-nav-v361" aria-label="Musik-Entdeckungsmodus">
       <button type="button" aria-pressed={mode==="genre"} onClick={()=>switchMode("genre")}>Genres</button>
       <button type="button" aria-pressed={mode==="new"} onClick={()=>switchMode("new")}>Neue Releases</button>
       <button type="button" aria-pressed={mode==="search"} onClick={()=>switchMode("search")}>Songs suchen</button>
       <button type="button" aria-pressed={mode==="saved"} onClick={()=>switchMode("saved")}>Meine Songs</button>
      </nav>
      {(mode==="genre"||mode==="new"&&withGenre)&&<div className="sonic-music-genres-v361" aria-label="Musikgenre auswählen">{controls.map(g=><button key={g} type="button" aria-pressed={genre===g} onClick={()=>switchGenre(g)}>{MUSIC_GENRES_V361[g].label}</button>)}</div>}
      {mode==="search"&&<label className="sonic-music-search-v361">Titel oder Künstler suchen<input ref={searchRef} type="search" value={term} maxLength={70} autoComplete="off" placeholder="Mindestens zwei Zeichen …" onChange={e=>{setTerm(e.target.value);setOffset(0);}}/></label>}
      {mode==="new"&&<label className="sonic-music-toggle-v361"><input type="checkbox" checked={withGenre} onChange={e=>{setWithGenre(e.target.checked);setOffset(0);setReleases([]);setSelectedRelease(null);}}/> Genre-Stichwort in der Spotify-Albensuche berücksichtigen (kann Treffer stark einschränken)</label>}
      <p className="sonic-music-note-v361">{mode==="new"?"Spotify tag:new: neue Alben und Singles aus ungefähr zwei Wochen. Keine vollständige oder personalisierte Release-Liste.":mode==="saved"?"Deine in Spotify gespeicherten Titel.":"Spotify-Katalogtreffer, keine algorithmischen Empfehlungen oder verlässliche Rangliste."} Hörproben nur, wenn Spotify sie bereitstellt.</p>
      {error&&<p className="sonic-music-error-v361" role="alert">{error} <button type="button" onClick={()=>setRefresh(n=>n+1)}>Erneut versuchen</button></p>}
      {statusError&&<p className="sonic-music-error-v361" role="alert">{statusError}</p>}{previewError&&<p className="sonic-music-error-v361" role="alert">{previewError}</p>}
      {consent&&<a className="sonic-music-consent-v361" href="/api/spotify/login">Spotify neu verbinden und Bibliotheksrechte erlauben ↗</a>}
      <div className="sonic-music-scroll-v361">
       {mode==="new"&&<div className="sonic-music-grid-v361">{releases.map(release=><article className="sonic-music-card-v361" key={release.id}>
          {release.coverUrl?<img src={release.coverUrl} alt={`Albumcover ${release.title}`} loading="lazy" referrerPolicy="no-referrer"/>:<div className="sonic-music-no-cover-v361" aria-hidden="true">♫</div>}
          <div className="sonic-music-card-body-v361"><h3>{release.title}</h3><p>{release.artists.join(", ")}</p><p>Erschienen: {dateLabel(release.releaseDate,release.releasePrecision)}</p><div className="sonic-music-actions-v361"><button type="button" aria-expanded={selectedRelease?.id===release.id} onClick={()=>{setSelectedRelease(old=>old?.id===release.id?null:release);setAlbumOffset(0);setPlayingPreview(null);}}>Titel ansehen</button><a href={release.spotifyUrl} rel="noopener noreferrer" target="_blank">Auf Spotify ↗</a></div></div>
        </article>)}</div>}
       {mode==="new"&&selectedRelease&&<section className="sonic-music-album-v361" aria-label={`Titel aus ${selectedRelease.title}`}><div className="sonic-music-album-head-v361"><h3>{selectedRelease.title} · Titel</h3><button type="button" onClick={()=>{setSelectedRelease(null);setAlbumOffset(0);setPlayingPreview(null);}}>Schließen</button></div>{albumLoading&&<p role="status">Albumtitel laden …</p>}{albumError&&<p role="alert">{albumError}</p>}{albumHasMore&&!albumLoading&&<button type="button" onClick={()=>setAlbumOffset(n=>Math.min(50,n+10))}>Weitere Albumtitel laden</button>}</section>}
       {mode!=="new"||selectedRelease?<div className="sonic-music-grid-v361">{visible.map(track=><article className="sonic-music-card-v361" key={track.id}>
         {track.coverUrl?<img src={track.coverUrl} alt={`Albumcover ${track.album}`} loading="lazy" referrerPolicy="no-referrer"/>:<div className="sonic-music-no-cover-v361" aria-hidden="true">♫</div>}
         <div className="sonic-music-card-body-v361"><h3>{track.title}{track.explicit?" · E":""}</h3><p>{track.artists.join(", ")||"Künstler nicht angegeben"}</p><p>{track.album||"Album unbekannt"} · {dateLabel(track.releaseDate,track.releasePrecision)}</p>
           <p aria-live="polite">{statusLoading?"Bibliothek wird geprüft":statuses[track.id]===true?"✓ In deiner Bibliothek":statuses[track.id]===false?"Noch nicht gespeichert":"Status unbekannt"}</p>
           <div className="sonic-music-actions-v361"><button type="button" disabled={statusLoading||typeof statuses[track.id]!=="boolean"||Boolean(busy)||consent} onClick={()=>void changeSave(track,!statuses[track.id])}>{busy===track.id?"Prüfe …":statuses[track.id]?"Entfernen":"♡ Speichern"}</button><a href={track.spotifyUrl} rel="noopener noreferrer" target="_blank">Auf Spotify ↗</a>{track.previewUrl&&<button type="button" aria-expanded={playingPreview===track.id} onClick={()=>preview(track)}>{playingPreview===track.id?"Hörprobe schließen":"▶ Hörprobe"}</button>}</div>
           {track.previewUrl&&playingPreview===track.id&&<audio ref={audio} controls autoPlay preload="none" src={track.previewUrl} onEnded={()=>setPlayingPreview(null)} onError={()=>{setPlayingPreview(null);setPreviewError("Die Spotify-Hörprobe kann nicht geladen werden. Bitte den Song direkt auf Spotify öffnen.");}} aria-label={`Spotify-Hörprobe von ${track.title}`}>Dein Browser unterstützt keine Hörproben.</audio>}
         </div>
       </article>)}</div>:null}
       {loading&&<p role="status">Spotify-Katalog wird geladen …</p>}
       {!loading&&!error&&(mode==="new"?releases.length===0:visible.length===0)&&!albumLoading&&<p>{mode==="search"&&debounced.length<2?"Gib mindestens zwei Zeichen ein.":"Keine passenden Titel gefunden. Probiere ein anderes Genre oder die freie Suche."}</p>}
       {!loading&&hasMore&&<button type="button" className="sonic-music-more-v361" onClick={()=>setOffset(n=>Math.min(50,n+10))}>Weitere Treffer laden</button>}
      </div>
      <footer className="sonic-music-footer-v361">Musikdaten und Originalcover: Spotify · <a href="https://open.spotify.com/" rel="noopener noreferrer" target="_blank">Spotify öffnen ↗</a> · Hörproben sind möglicherweise nicht verfügbar.</footer>
    </section>
  </div>}
 </>;
}
