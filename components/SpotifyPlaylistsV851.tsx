"use client";
import {networkJsonV1010} from '@/lib/networkJsonV1010';
import {useCallback,useEffect,useMemo,useRef,useState} from "react";
import {useMusic} from "@/context/MusicContext";
import {SpotifyMiniPlayerV853} from "@/components/SpotifyMiniPlayerV853";
import {SpotifyPlaylistTasteAnalyzerV864} from "@/components/SpotifyPlaylistTasteAnalyzerV864";
import {PLAYLIST_FAVORITES_KEY_V851,PLAYLIST_PAGE_SIZE_V851,TRACK_PAGE_SIZE_V851,sanitizeFavoritePlaylistsV851,type SpotifyPlaylistV851,type SpotifyPlaylistTrackV851,type SpotifyDeviceV851,type SpotifyListPageV851} from "@/lib/spotify-playlists-v851";

/** V852: Concert Library, a curated visual shell around the tested V851 Spotify APIs. */
const FAVORITE_NAMES_KEY=`${PLAYLIST_FAVORITES_KEY_V851}.names`;
const listLimit=100;
const time=(ms:number)=>`${Math.floor(ms/60000)}:${String(Math.floor(ms/1000)%60).padStart(2,"0")}`;
const describeError=(error:unknown)=>error instanceof Error?error.message:"Spotify ist derzeit nicht erreichbar.";
type ApiError={code?:string;message?:string};
async function loadJson<T>(url:string,signal?:AbortSignal):Promise<T>{
 const response=await networkJsonV1010(url,{cache:"no-store",signal},{provider:"spotify",priority:"optional",ttlMs:30000,staleMs:120000});
 const data=await response.json() as T&ApiError;
 if(!response.ok)throw Object.assign(new Error(data.message??"Spotify-Anfrage fehlgeschlagen."),{code:data.code??""});
 return data;
}
function loadFavorites(){
 try{return sanitizeFavoritePlaylistsV851(JSON.parse(localStorage.getItem(PLAYLIST_FAVORITES_KEY_V851)??"[]"));}
 catch{return [];}
}
function loadFavoriteNames():Record<string,string>{
 try{const raw=JSON.parse(localStorage.getItem(FAVORITE_NAMES_KEY)??"{}");
  if(!raw||typeof raw!=="object"||Array.isArray(raw))return {};
  return Object.fromEntries(Object.entries(raw).filter(([id,name])=>/^[a-zA-Z0-9]{10,64}$/.test(id)&&typeof name==="string").slice(0,listLimit).map(([id,name])=>[id,(name as string).slice(0,120)]));
 }catch{return {};}
}
function Artwork({url,name,variant="tile"}:{url:string|null;name:string;variant?:"tile"|"hero"|"track"}){
 return url?<img className={`sonic-playlist-art-v852 sonic-playlist-art-${variant}-v852`} src={url} alt={variant==="hero"?`Cover von ${name}`:""} loading="lazy"/>:<span aria-hidden="true" className={`sonic-playlist-art-v852 sonic-playlist-art-${variant}-v852 sonic-playlist-art-empty-v852`}>♫</span>;
}
const deviceIcon=(type:string)=>/speaker/i.test(type)?"🔊":/computer/i.test(type)?"▣":/smartphone|tablet/i.test(type)?"▯":"♫";

export function SpotifyPlaylistsV851(){
 const {refresh}=useMusic();
 const [open,setOpen]=useState(false);
 const [mode,setMode]=useState<"favorites"|"all">("favorites");
 const [playlists,setPlaylists]=useState<SpotifyPlaylistV851[]>([]);
 const [favorites,setFavorites]=useState<string[]>([]);
 const [favoriteNames,setFavoriteNames]=useState<Record<string,string>>({});
 const [search,setSearch]=useState("");
 const [playlistOffset,setPlaylistOffset]=useState(0);
 const [morePlaylists,setMorePlaylists]=useState(false);
 const [listLoading,setListLoading]=useState(false);
 const [listError,setListError]=useState<string|null>(null);
 const [selected,setSelected]=useState<SpotifyPlaylistV851|null>(null);
 const [tracks,setTracks]=useState<SpotifyPlaylistTrackV851[]>([]);
 const [trackOffset,setTrackOffset]=useState(0);
 const [moreTracks,setMoreTracks]=useState(false);
 const [tracksLoading,setTracksLoading]=useState(false);
 const [tracksError,setTracksError]=useState<string|null>(null);
 const [devices,setDevices]=useState<SpotifyDeviceV851[]>([]);
 const [selectedDeviceId,setSelectedDeviceId]=useState("");
 const [devicesLoading,setDevicesLoading]=useState(false);
 const [devicesError,setDevicesError]=useState<string|null>(null);
 const [playing,setPlaying]=useState(false);
 const [playError,setPlayError]=useState<string|null>(null);
 const [success,setSuccess]=useState<string|null>(null);
 const [consentNeeded,setConsentNeeded]=useState(false);
 const [reload,setReload]=useState(0);
 const [deviceReload,setDeviceReload]=useState(0);
 const trigger=useRef<HTMLButtonElement>(null);
 const dialog=useRef<HTMLElement>(null);
 const actionLock=useRef(false);
 const close=useCallback(()=>{setOpen(false);trigger.current?.focus();},[]);
 const enter=useCallback(()=>{setOpen(true);setPlaylistOffset(0);setReload(n=>n+1);setDeviceReload(n=>n+1);},[]);
 useEffect(()=>{if(!open)return;setFavorites(loadFavorites());setFavoriteNames(loadFavoriteNames());dialog.current?.focus();},[open]);
 useEffect(()=>{
  if(!open)return;
  const onChanged=()=>{setSelectedDeviceId("");setDeviceReload(n=>n+1);};
  window.addEventListener("sonic:spotify-connect-v854",onChanged);
  return()=>window.removeEventListener("sonic:spotify-connect-v854",onChanged);
 },[open]);
 useEffect(()=>{
  if(!open)return;
  const previous=document.body.style.overflow;
  document.body.style.overflow="hidden";
  const key=(event:KeyboardEvent)=>{
   if(event.key==="Escape"){event.preventDefault();close();return;}
   if(event.key!=="Tab"||!dialog.current)return;
   const tabbable=Array.from(dialog.current.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),select:not(:disabled),[tabindex="0"]')).filter(el=>el.getClientRects().length>0);
   if(!tabbable.length){event.preventDefault();dialog.current.focus();return;}
   const first=tabbable[0],last=tabbable[tabbable.length-1];
   if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog.current)){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog.current)){event.preventDefault();first.focus();}
  };
  document.addEventListener("keydown",key);
  return()=>{document.removeEventListener("keydown",key);document.body.style.overflow=previous;};
 },[open,close]);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();setListLoading(true);setListError(null);
  void loadJson<SpotifyListPageV851<SpotifyPlaylistV851>>(`/api/spotify/playlists?offset=${playlistOffset}`,controller.signal)
   .then(data=>{if(controller.signal.aborted)return;
    setPlaylists(prev=>playlistOffset===0?data.items:Array.from(new Map([...prev,...data.items].map(p=>[p.id,p])).values()));
    setMorePlaylists(data.hasMore);
   }).catch(e=>{if(!controller.signal.aborted){setListError(describeError(e));if((e as ApiError).code==="consent_required"||(e as ApiError).code==="reauth_required")setConsentNeeded(true);}})
   .finally(()=>{if(!controller.signal.aborted)setListLoading(false);});
  return()=>controller.abort();
 },[open,playlistOffset,reload]);
 useEffect(()=>{
  if(!open)return;
  const controller=new AbortController();setDevicesLoading(true);setDevicesError(null);
  void loadJson<{devices:SpotifyDeviceV851[]}>("/api/spotify/devices",controller.signal)
   .then(data=>{if(controller.signal.aborted)return;
    setDevices(data.devices);
    setSelectedDeviceId(prev=>data.devices.some(d=>d.id===prev&&!d.restricted)?prev:data.devices.find(d=>d.active&&!d.restricted)?.id??data.devices.find(d=>d.type.toLowerCase()==="speaker"&&!d.restricted)?.id??data.devices.find(d=>!d.restricted)?.id??"");
   }).catch(e=>{if(!controller.signal.aborted){setDevicesError(describeError(e));if((e as ApiError).code==="consent_required"||(e as ApiError).code==="reauth_required")setConsentNeeded(true);}})
   .finally(()=>{if(!controller.signal.aborted)setDevicesLoading(false);});
  return()=>controller.abort();
 },[open,deviceReload]);
 useEffect(()=>{
  if(!open||!selected)return;
  const controller=new AbortController();setTracksLoading(true);setTracksError(null);
  void loadJson<SpotifyListPageV851<SpotifyPlaylistTrackV851>>(`/api/spotify/playlists/${selected.id}/items?offset=${trackOffset}`,controller.signal)
   .then(data=>{if(controller.signal.aborted)return;setTracks(prev=>trackOffset===0?data.items:[...prev,...data.items]);setMoreTracks(data.hasMore);})
   .catch(e=>{if(!controller.signal.aborted){setTracksError(describeError(e));setMoreTracks(false);if((e as ApiError).code==="consent_required"||(e as ApiError).code==="reauth_required")setConsentNeeded(true);}})
   .finally(()=>{if(!controller.signal.aborted)setTracksLoading(false);});
  return()=>controller.abort();
 },[open,selected,trackOffset]);
 const selectedDevice=devices.find(d=>d.id===selectedDeviceId&&!d.restricted);
 const activeDevice=devices.find(d=>d.active);
 const usableDevices=devices.filter(d=>!d.restricted);
 const selectedCards=useMemo(()=>favorites.map(id=>playlists.find(p=>p.id===id)||{id,name:favoriteNames[id]||"Gespeicherte Playlist",owner:"Ausgewählt",total:null,imageUrl:null,spotifyUrl:`https://open.spotify.com/playlist/${id}`}),[favorites,playlists,favoriteNames]);
 const shown=useMemo(()=>{
  const pool=mode==="favorites"?selectedCards:playlists;
  const term=search.trim().toLocaleLowerCase("de");return pool.filter(p=>!term||`${p.name} ${p.owner}`.toLocaleLowerCase("de").includes(term));
 },[mode,selectedCards,playlists,search]);
 const toggleFavorite=(playlist:SpotifyPlaylistV851)=>{
  const next=favorites.includes(playlist.id)?favorites.filter(id=>id!==playlist.id):[...favorites,playlist.id].slice(0,listLimit);
  const names={...favoriteNames,[playlist.id]:playlist.name};setFavorites(next);setFavoriteNames(names);
  try{localStorage.setItem(PLAYLIST_FAVORITES_KEY_V851,JSON.stringify(next));localStorage.setItem(FAVORITE_NAMES_KEY,JSON.stringify(Object.fromEntries(Object.entries(names).filter(([id])=>next.includes(id)))));}
  catch{setListError("Auswahl konnte nicht lokal gespeichert werden (Browser-Speicher gesperrt oder voll).");}
 };
 const selectPlaylist=(playlist:SpotifyPlaylistV851)=>{if(selected?.id===playlist.id)return;setSelected(playlist);setTracks([]);setTrackOffset(0);setMoreTracks(false);setTracksError(null);setSuccess(null);setPlayError(null);};
 const start=async(position?:number,playlist:SpotifyPlaylistV851|null=selected)=>{
  if(actionLock.current||!playlist||!selectedDevice)return;
  actionLock.current=true;setPlaying(true);setSuccess(null);setPlayError(null);
  try{
   const response=await fetch("/api/spotify/playlists/play",{method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",body:JSON.stringify({playlistId:playlist.id,deviceId:selectedDevice.id,...(position!==undefined?{position}:{})})});
   const data=await response.json() as {started?:boolean}&ApiError;
   if(!response.ok||!data.started){if(data.code==="consent_required"||data.code==="reauth_required")setConsentNeeded(true);throw new Error(data.message??"Spotify konnte die Wiedergabe nicht starten.");}
   setSuccess(`${position!==undefined?"Titel":"Playlist"} „${playlist.name}“ auf ${selectedDevice.name} gestartet.`);
   window.dispatchEvent(new Event("sonic:spotify-playback-v853"));
   void refresh();
  }catch(error){setPlayError(describeError(error));}
  finally{setPlaying(false);actionLock.current=false;}
 };
 return <>
  <div className="sonic-mini-dock-v853"><SpotifyMiniPlayerV853/>
  <button ref={trigger} type="button" className="sonic-playlist-launch-v851 sonic-playlist-launch-v852" onClick={enter} aria-haspopup="dialog" aria-expanded={open} aria-label="Musikbibliothek, Playlists und Lautsprecher öffnen">
   <span className="sonic-playlist-launch-symbol-v852" aria-hidden="true">♫</span><span className="sonic-playlist-launch-copy-v852"><strong>Meine Musik</strong><small>Playlists · Spotify Connect</small></span><span className="sonic-playlist-launch-arrow-v852" aria-hidden="true">↗</span>
  </button></div>
  {open&&<div className="sonic-playlist-backdrop-v851 sonic-playlist-backdrop-v852" onMouseDown={event=>{if(event.target===event.currentTarget)close();}}>
   <section ref={dialog} tabIndex={-1} className="sonic-playlist-modal-v851 sonic-playlist-modal-v852" role="dialog" aria-modal="true" aria-labelledby="sonic-library-title-v852" aria-describedby="sonic-library-description-v852">
    <header className="sonic-playlist-header-v851 sonic-playlist-header-v852">
     <div className="sonic-playlist-brand-v852"><span className="sonic-playlist-brand-icon-v852" aria-hidden="true">♫</span><div><span className="sonic-playlist-eyebrow-v852">SONIC DISPLAY / MUSIC LIBRARY</span><h2 id="sonic-library-title-v852">Deine Musik. Deine Bühne.</h2><p id="sonic-library-description-v852">Lieblings-Playlists entdecken und direkt über Spotify Connect abspielen.</p></div></div>
     <div className="sonic-playlist-header-side-v852"><span className="sonic-playlist-provider-v852"><span aria-hidden="true">●</span> Spotify</span><button className="sonic-playlist-close-v851" type="button" onClick={close} aria-label="Musikbibliothek schließen">✕</button></div>
    </header>
    {consentNeeded&&<p className="sonic-playlist-warning-v851" role="alert">Deine Spotify-Verbindung benötigt zusätzliche Berechtigungen. <a href="/api/spotify/login">Spotify erneut verbinden</a></p>}
    <section className="sonic-playlist-speaker-v851 sonic-playlist-speaker-v852" aria-label="Wiedergabegerät auswählen">
     <div className="sonic-playlist-device-title-v852"><span className="sonic-playlist-device-icon-v852" aria-hidden="true">🔊</span><span><strong>Spotify Connect</strong><small>{selectedDevice?`Bereit auf ${selectedDevice.name}`:devicesLoading?"Geräte werden gesucht …":"Gerät auswählen, um zu starten"}</small></span></div>
     <div className="sonic-playlist-devices-v852" role="group" aria-label="Verfügbare Lautsprecher und Geräte">
      {devices.map(d=><button type="button" className={`sonic-playlist-device-chip-v852 ${selectedDeviceId===d.id?"is-selected":""} ${d.restricted?"is-restricted":""}`} key={d.id} aria-pressed={selectedDeviceId===d.id} disabled={d.restricted||devicesLoading||playing} onClick={()=>{setSelectedDeviceId(d.id);setSuccess(null);setPlayError(null);}} title={`${d.name}${d.restricted?" – nicht steuerbar":d.active?" – derzeit aktiv":""}`}><span aria-hidden="true">{deviceIcon(d.type)}</span><span>{d.name}{d.restricted?" · Gesperrt":""}</span>{d.active&&!d.restricted&&<i aria-label="aktiv"/>}</button>)}
      {!devicesLoading&&!usableDevices.length&&<span className="sonic-playlist-device-empty-v852">Kein steuerbares Gerät gefunden</span>}
      {devicesLoading&&<span role="status" className="sonic-playlist-device-empty-v852">Suche Lautsprecher …</span>}
     </div>
     <button className="sonic-playlist-device-reload-v852" type="button" onClick={()=>setDeviceReload(n=>n+1)} disabled={devicesLoading||playing} aria-label="Spotify-Connect-Geräte aktualisieren" title="Geräte aktualisieren">↻ <span>Aktualisieren</span></button>
     {devicesError&&<p className="sonic-playlist-device-note-v852" role="alert">{devicesError}</p>}
     {!devicesLoading&&!devicesError&&!usableDevices.length&&<p className="sonic-playlist-device-note-v852">Öffne Spotify auf deinem Lautsprecher oder Smartphone und aktualisiere die Liste. Premium erforderlich.</p>}
    </section>
    {(success||playError)&&<div className={`sonic-playlist-feedback-v852 ${playError?"is-error":"is-success"}`} role={playError?"alert":"status"}><span aria-hidden="true">{playError?"!":"✓"}</span><span>{playError||success}</span>{playError&&<button type="button" onClick={()=>setDeviceReload(n=>n+1)}>Geräte neu laden</button>}<button type="button" aria-label="Meldung schließen" onClick={()=>{setSuccess(null);setPlayError(null);}}>✕</button></div>}
    <div className="sonic-playlist-body-v851 sonic-playlist-body-v852">
     <aside className="sonic-playlist-sidebar-v851 sonic-playlist-sidebar-v852" aria-label="Deine Playlists">
      <div className="sonic-playlist-sidebar-heading-v852"><div><span className="sonic-playlist-eyebrow-v852">DEINE SAMMLUNG</span><h3>Playlists <span>{mode==="favorites"?favorites.length:playlists.length}</span></h3></div><span aria-hidden="true">✦</span></div>
      <nav className="sonic-playlist-tabs-v852" aria-label="Playlist-Ansicht"><button type="button" aria-pressed={mode==="favorites"} onClick={()=>setMode("favorites")}>★ Ausgewählte <span>{favorites.length}</span></button><button type="button" aria-pressed={mode==="all"} onClick={()=>setMode("all")}>Alle Playlists</button></nav>
      <label className="sonic-playlist-search-v852"><span className="sonic-playlist-search-icon-v852" aria-hidden="true">⌕</span><span className="sonic-playlist-visually-hidden-v852">Playlist suchen</span><input type="search" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Playlist suchen …" /></label>
      {listError&&<p role="alert" className="sonic-playlist-warning-v851">{listError} <button type="button" onClick={()=>setReload(n=>n+1)}>Erneut laden</button></p>}
      <div className="sonic-playlist-list-v851 sonic-playlist-list-v852" role="list" aria-label="Spotify Playlists">
       {shown.map(p=><article key={p.id} role="listitem" className={`sonic-playlist-card-v851 sonic-playlist-card-v852 ${selected?.id===p.id?"is-selected":""}`}>
        <button type="button" className="sonic-playlist-select-v851 sonic-playlist-select-v852" aria-pressed={selected?.id===p.id} onClick={()=>selectPlaylist(p)}><Artwork url={p.imageUrl} name={p.name}/><span className="sonic-playlist-card-copy-v852"><strong title={p.name}>{p.name}</strong><small>{p.total!==null?`${p.total} Songs · `:""}{p.owner}</small></span></button>
        <div className="sonic-playlist-card-actions-v852"><button type="button" className="sonic-playlist-star-v851" onClick={()=>toggleFavorite(p)} aria-label={`${favorites.includes(p.id)?"Aus Auswahl entfernen":"Zur Auswahl hinzufügen"}: ${p.name}`} title={favorites.includes(p.id)?"Aus Auswahl entfernen":"Zur Auswahl hinzufügen"}>{favorites.includes(p.id)?"★":"☆"}</button><button type="button" className="sonic-playlist-quickplay-v852" disabled={!selectedDevice||playing} onClick={()=>void start(undefined,p)} aria-label={`${p.name} auf ${selectedDevice?.name??"Spotify Connect"} starten`} title="Playlist direkt starten">▶</button></div>
       </article>)}
       {listLoading&&!shown.length&&<div className="sonic-playlist-skeleton-v852" role="status" aria-label="Playlists werden geladen">{[0,1,2,3].map(i=><div key={i}><span/><span/></div>)}</div>}
       {!listLoading&&!shown.length&&<div className="sonic-playlist-empty-v852"><span aria-hidden="true">{mode==="favorites"?"☆":"⌕"}</span><strong>{search?"Keine Treffer":mode==="favorites"?"Dein Soundtrack beginnt hier":"Keine Playlists gefunden"}</strong><p>{search?"Probiere einen anderen Suchbegriff.":mode==="favorites"?"Markiere deine Lieblings-Playlists mit dem Stern – sie erscheinen dann direkt hier.":"Prüfe die Spotify-Verbindung oder lade die Liste neu."}</p>{mode==="favorites"&&!search&&<button type="button" onClick={()=>setMode("all")}>Playlists entdecken →</button>}</div>}
      </div>
      {morePlaylists&&<button className="sonic-playlist-more-v851" type="button" disabled={listLoading} onClick={()=>setPlaylistOffset(n=>n+PLAYLIST_PAGE_SIZE_V851)}>Weitere Playlists laden ↓</button>}
      {listLoading&&shown.length>0&&<span role="status" className="sonic-playlist-loading-v852">Weitere Playlists werden geladen …</span>}
     </aside>
     <section className="sonic-playlist-detail-v851 sonic-playlist-detail-v852" aria-label="Playlist-Details">
      {selected?<>
       <div className="sonic-playlist-hero-v852">
        {selected.imageUrl&&<img className="sonic-playlist-hero-glow-v852" src={selected.imageUrl} alt="" aria-hidden="true"/>}
        <div className="sonic-playlist-hero-content-v852"><Artwork url={selected.imageUrl} name={selected.name} variant="hero"/><div className="sonic-playlist-hero-info-v852"><span className="sonic-playlist-eyebrow-v852">DEINE PLAYLIST</span><h3>{selected.name}</h3><p>{selected.owner}{selected.total!==null?` · ${selected.total} Titel`:""}</p><a href={selected.spotifyUrl} target="_blank" rel="noopener noreferrer">In Spotify öffnen ↗</a></div></div>
       </div>
       <div className="sonic-playlist-actions-v851 sonic-playlist-actions-v852"><button className="sonic-playlist-play-v851" type="button" onClick={()=>void start()} disabled={!selectedDevice||playing}><span aria-hidden="true">▶</span> {playing?"Wird gestartet …":selectedDevice?`Auf ${selectedDevice.name} starten`:"Playlist auf Lautsprecher starten"}</button><button className="sonic-playlist-save-v852" type="button" onClick={()=>toggleFavorite(selected)} aria-pressed={favorites.includes(selected.id)}>{favorites.includes(selected.id)?"★ Ausgewählt":"☆ Merken"}</button></div>
       {!selectedDevice&&<p className="sonic-playlist-hint-v852">Wähle oben einen Spotify-Connect-Lautsprecher, um die Playlist zu starten.</p>}
       <div className="sonic-playlist-tracks-heading-v852"><h4>Titel der Playlist</h4><span>{selected.total!==null?`${selected.total} Songs`:"Songübersicht"}</span></div>
       {tracksError&&<p role="alert" className="sonic-playlist-warning-v851">{tracksError} <small>Die Playlist lässt sich möglicherweise trotzdem auf deinem Gerät starten.</small></p>}
       <ol className="sonic-playlist-tracks-v851 sonic-playlist-tracks-v852">
        {tracks.map(t=><li key={`${t.position}-${t.id}`}><span className="sonic-playlist-track-number-v851">{t.position+1}</span><Artwork url={t.imageUrl} name={t.title} variant="track"/><div><a href={t.spotifyUrl} target="_blank" rel="noopener noreferrer">{t.title}</a><small>{t.artist}</small></div><time>{time(t.durationMs)}</time><button type="button" title={`Ab diesem Titel auf ${selectedDevice?.name??"Spotify"} starten`} aria-label={`${t.title} auf gewähltem Gerät starten`} disabled={playing||!selectedDevice||!t.playable} onClick={()=>void start(t.position)}>▶</button></li>)}
       </ol>
       {tracksLoading&&<p role="status" className="sonic-playlist-loading-v852">Titel werden geladen …</p>}
       {moreTracks&&!tracksLoading&&<button className="sonic-playlist-more-v851" type="button" onClick={()=>setTrackOffset(n=>n+TRACK_PAGE_SIZE_V851)}>Weitere Titel laden ↓</button>}
       {!tracksLoading&&!tracksError&&!tracks.length&&<p className="sonic-playlist-hint-v852">Diese Playlist enthält keine abrufbaren Titel.</p>}
       <SpotifyPlaylistTasteAnalyzerV864 key={selected.id} playlistId={selected.id} playlistName={selected.name} playlistTotal={selected.total}/>
      </>:<div className="sonic-playlist-placeholder-v851 sonic-playlist-placeholder-v852"><div className="sonic-playlist-placeholder-art-v852" aria-hidden="true"><span>♫</span><i/><i/><i/></div><span className="sonic-playlist-eyebrow-v852">READY FOR YOUR NEXT SHOW</span><h3>Der nächste Soundtrack<br/>wartet auf dich.</h3><p>Wähle links eine Playlist. Du kannst sie direkt auf einem Lautsprecher starten – deine Konzertbühne folgt der Musik.</p><button type="button" onClick={()=>setMode("all")}>Playlists entdecken ↗</button></div>}
     </section>
    </div>
    <footer className="sonic-playlist-footer-v851 sonic-playlist-footer-v852"><span><span className="sonic-playlist-footer-dot-v852"/> Spotify Premium & Spotify Connect erforderlich</span><span>Auswahl nur auf diesem Gerät gespeichert · <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Spotify öffnen ↗</a></span>{activeDevice&&<span className="sonic-playlist-footer-active-v852">Aktiv: {activeDevice.name}</span>}</footer>
   </section>
  </div>}
 </>;
}
