"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Track } from "@/types/music";
import { DISCOVERY_GENRES, type DiscoveryGenre, type DiscoveryArtist, type DiscoverySong, validDiscoveryId } from "@/lib/artist-discovery-v360";

type Mode = "genre" | "search" | "top";
type FollowState = boolean | null;
type ApiError = { code?: string; message?: string };
type ResponseArtists = { artists?: DiscoveryArtist[]; hasMore?: boolean } & ApiError;
type ResponseSongs = { songs?: DiscoverySong[] } & ApiError;
const KEY = "sonic.artist-discovery.genre.v360";
const readGenre = (): DiscoveryGenre => {
  try { const saved = window.localStorage.getItem(KEY); if (saved && Object.hasOwn(DISCOVERY_GENRES, saved)) return saved as DiscoveryGenre; }
  catch { /* restricted local storage */ }
  return "deutschrap";
};
const apiMessage = (error: unknown): string => error instanceof Error ? error.message : "Spotify ist gerade nicht erreichbar.";

/** One lazily loaded, accessible discovery surface; no Spotify tokens are available in React. */
export function ArtistDiscoveryV360({ currentArtists }: { currentArtists?: Track["artistDetails"] }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("genre");
  const [genre, setGenre] = useState<DiscoveryGenre>("deutschrap");
  const [search, setSearch] = useState("");
  const [debounced, setDebounced] = useState("");
  const [offset, setOffset] = useState(0);
  const [artists, setArtists] = useState<DiscoveryArtist[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statuses, setStatuses] = useState<Record<string, FollowState>>({});
  const [statusBusy, setStatusBusy] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [followError, setFollowError] = useState<string | null>(null);
  const [needConsent, setNeedConsent] = useState(false);
  const [selected, setSelected] = useState<DiscoveryArtist | null>(null);
  const [songs, setSongs] = useState<DiscoverySong[]>([]);
  const [songsBusy, setSongsBusy] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const opener = useRef<HTMLButtonElement | null>(null);
  const searchInput = useRef<HTMLInputElement | null>(null);
  const actionLock = useRef(false);
  const active = useRef(true);
  const nowArtists = useMemo<DiscoveryArtist[]>(() => (currentArtists ?? []).filter(a => validDiscoveryId(a.id)).slice(0, 6).map(a => ({id:a.id,name:a.name,imageUrl:null,genres:[],spotifyUrl:`https://open.spotify.com/artist/${a.id}`})),[currentArtists]);
  const shown = useMemo(() => Array.from(new Map([...nowArtists, ...artists].map(a => [a.id, a])).values()).slice(0, 16), [nowArtists, artists]);
  const ids = shown.map(a=>a.id).join(",");
  const chooseMode = (next: Mode) => { setMode(next); setOffset(0); setSelected(null); setArtists([]); setHasMore(false); setError(null); };
  const chooseGenre = (next: DiscoveryGenre) => { setGenre(next); setOffset(0); setSelected(null); try { window.localStorage.setItem(KEY, next); } catch { /* ignore */ } };
  const close = useCallback(() => { setOpen(false); setSelected(null); opener.current?.focus(); }, []);
  useEffect(() => { if (open) setGenre(readGenre()); }, [open]);
  useEffect(() => {
    if (!open) return;
    const id = window.setTimeout(() => setDebounced(search.trim()), 350);
    return () => window.clearTimeout(id);
  }, [open, search]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") { event.preventDefault(); close(); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);
  useEffect(() => { active.current = true; return () => {active.current = false;}; }, []);
  useEffect(() => { if (open && mode === "search") searchInput.current?.focus(); }, [open, mode]);
  useEffect(() => {
    if (!open) return;
    if (mode === "search" && (debounced.length < 2 || debounced.length > 70)) { setArtists([]); setHasMore(false); setLoading(false); return; }
    const controller = new AbortController();
    const params = new URLSearchParams({mode});
    if (mode === "genre") params.set("genre", genre);
    if (mode === "search") params.set("q", debounced);
    if (mode !== "top") params.set("offset", String(offset));
    setLoading(true); setError(null);
    const load = async () => {
      try {
        const response = await fetch(`/api/spotify/discovery?${params}`, {cache:"no-store",signal:controller.signal});
        const data = await response.json() as ResponseArtists;
        if (!response.ok) { if (data.code === "consent_required") setNeedConsent(true); throw new Error(data.message ?? "Spotify-Suche fehlgeschlagen."); }
        if (!Array.isArray(data.artists)) throw new Error("Spotify hat keine gültige Künstlerliste geliefert.");
        if (!controller.signal.aborted) {
          setArtists(previous => offset === 0 || mode === "top" ? data.artists! : Array.from(new Map([...previous,...data.artists!].map(a=>[a.id,a])).values()));
          setHasMore(Boolean(data.hasMore) && offset < 50);
        }
      } catch (err) { if (!controller.signal.aborted) setError(apiMessage(err)); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    };
    void load();
    return () => controller.abort();
  }, [open, mode, genre, debounced, offset, refresh]);
  useEffect(() => {
    if (!open || !ids) { setStatuses({}); return; }
    const controller = new AbortController();
    setStatusBusy(true); setFollowError(null); setNeedConsent(false);
    const load = async () => {
      try {
        const batches = ids.split(",").reduce<string[][]>((all, id) => { if (!all.length || all[all.length - 1].length === 10) all.push([]); all[all.length - 1].push(id); return all; }, []);
        const results = await Promise.all(batches.map(async batch => {
          const response = await fetch(`/api/spotify/artists/follow?ids=${encodeURIComponent(batch.join(","))}`, {cache:"no-store",signal:controller.signal});
          const data = await response.json() as {statuses?:Record<string,FollowState>} & ApiError;
          if (!response.ok) { if (data.code === "consent_required" || data.code === "reauth_required") setNeedConsent(true); throw new Error(data.message ?? "Künstlerstatus derzeit nicht verfügbar."); }
          if (!data.statuses) throw new Error("Spotify hat keinen Follow-Status geliefert.");
          return data.statuses;
        }));
        if (!controller.signal.aborted) setStatuses(Object.assign({},...results));
      } catch(err) { if (!controller.signal.aborted) {setFollowError(apiMessage(err));setStatuses({});} }
      finally {if(!controller.signal.aborted)setStatusBusy(false);}
    };
    void load();
    return () => controller.abort();
  }, [open, ids]);
  useEffect(() => {
    if (!open || !selected) { setSongs([]); return; }
    const controller = new AbortController();
    setSongsBusy(true);setSongs([]);
    const params = new URLSearchParams({mode:"songs",artistId:selected.id,name:selected.name});
    const load = async () => {
      try {
        const response = await fetch(`/api/spotify/discovery?${params}`,{cache:"no-store",signal:controller.signal});
        const data = await response.json() as ResponseSongs;
        if (!response.ok) throw new Error(data.message ?? "Songauswahl nicht verfügbar.");
        if (!controller.signal.aborted) setSongs(data.songs ?? []);
      } catch { if (!controller.signal.aborted) setSongs([]); }
      finally { if (!controller.signal.aborted) setSongsBusy(false); }
    };
    void load();return()=>controller.abort();
  }, [open, selected]);
  const change = async (artist: DiscoveryArtist, following: boolean) => {
    if (actionLock.current || needConsent || typeof statuses[artist.id] !== "boolean") return;
    actionLock.current = true; setBusy(artist.id); setFollowError(null);
    try {
      const response = await fetch("/api/spotify/artists/follow",{method:"POST",cache:"no-store",headers:{"Content-Type":"application/json"},body:JSON.stringify({artistId:artist.id,follow:following})});
      const data = await response.json() as {following?:boolean}&ApiError;
      if (!response.ok) { if (data.code === "consent_required" || data.code === "reauth_required") setNeedConsent(true); throw new Error(data.message ?? "Spotify hat diese Änderung abgelehnt."); }
      if (data.following !== following) throw new Error("Spotify hat den neuen Follow-Status nicht bestätigt.");
      if (active.current) { setStatuses(previous=>({...previous,[artist.id]:following})); window.dispatchEvent(new CustomEvent("sonic:artist-follow-changed-v359", {detail:{artistId:artist.id,following}})); }
    } catch(err) { if(active.current) setFollowError(apiMessage(err)); }
    finally { actionLock.current = false; if(active.current)setBusy(null); }
  };
  return <>
    <button ref={opener} className="sonic-discover-launch-v360" type="button" aria-haspopup="dialog" aria-expanded={open} onClick={()=>{setOpen(true);setOffset(0);setRefresh(n=>n+1);}}>✦ Künstler entdecken</button>
    {open && <div className="sonic-discover-backdrop-v360" onMouseDown={event=>{if(event.currentTarget===event.target)close();}}>
      <section className="sonic-discover-modal-v360" role="dialog" aria-modal="true" aria-label="Spotify Künstler entdecken">
        <header className="sonic-discover-head-v360"><div><h2>✦ Smart Artist Discovery</h2><p>Suche und entdecke Künstler auf Spotify</p></div><button type="button" onClick={close} aria-label="Künstler-Entdeckung schließen">✕</button></header>
        <nav className="sonic-discover-modes-v360" aria-label="Entdeckungsmodus">
          <button type="button" aria-pressed={mode==="genre"} onClick={()=>chooseMode("genre")}>Genres</button>
          <button type="button" aria-pressed={mode==="search"} onClick={()=>chooseMode("search")}>Suche</button>
          <button type="button" aria-pressed={mode==="top"} onClick={()=>chooseMode("top")}>Deine Favoriten</button>
        </nav>
        {mode === "genre" && <div className="sonic-discover-genres-v360" aria-label="Genre auswählen">{(Object.keys(DISCOVERY_GENRES) as DiscoveryGenre[]).map(key=><button type="button" key={key} aria-pressed={genre===key} onClick={()=>chooseGenre(key)}>{DISCOVERY_GENRES[key].label}</button>)}</div>}
        {mode === "search" && <label className="sonic-discover-search-v360">Künstler suchen<input ref={searchInput} type="search" autoComplete="off" placeholder="Künstlername eingeben …" maxLength={70} value={search} onChange={e=>{setSearch(e.target.value);setOffset(0);}} /></label>}
        {mode === "top" && <p className="sonic-discover-intro-v360">Deine häufig gehörten Künstler auf Spotify (letzte ca. 6 Monate). Keine Empfehlungen neuer Künstler.</p>}
        {mode === "genre" && <p className="sonic-discover-intro-v360">Spotify-Genre-Suche: nach Suchrelevanz, nicht automatisch nach deinem persönlichen Geschmack sortiert. Einzelne Genres können wenige Treffer haben.</p>}
        {nowArtists.length > 0 && <p className="sonic-discover-intro-v360">♪ Aktueller Song: {nowArtists.map(a=>a.name).join(", ")}</p>}
        {error && <div role="alert" className="sonic-discover-error-v360">{error} <button type="button" onClick={()=>setRefresh(n=>n+1)}>Erneut versuchen</button></div>}
        {needConsent && <a className="sonic-discover-consent-v360" href="/api/spotify/login">Spotify neu verbinden und Berechtigungen erlauben</a>}
        {followError && <p role="alert" className="sonic-discover-error-v360">{followError}</p>}
        <div className="sonic-discover-scroll-v360">
          <div className="sonic-discover-grid-v360">
            {shown.map(artist => {
              const followed = statuses[artist.id];const known = typeof followed === "boolean";
              return <article key={artist.id} className="sonic-discover-card-v360">
                {artist.imageUrl ? <img src={artist.imageUrl} alt={`Künstlerfoto ${artist.name}`} loading="lazy" referrerPolicy="no-referrer" /> : <div className="sonic-discover-fallback-v360" aria-hidden="true">♫</div>}
                <div className="sonic-discover-info-v360"><h3>{artist.name}</h3><p>{artist.genres.length?artist.genres.join(" · "):"Genre nicht verfügbar"}</p><span aria-live="polite">{statusBusy?"Follow-Status wird geprüft":followed===true?"✓ Du folgst":followed===false?"Noch nicht gefolgt":"Follow-Status unbekannt"}</span>
                  <div className="sonic-discover-actions-v360"><button type="button" disabled={!known||statusBusy||Boolean(busy)||needConsent} onClick={()=>void change(artist,!followed)}>{busy===artist.id?"Speichere …":followed?"Entfolgen":"+ Folgen"}</button><button type="button" onClick={()=>setSelected(artist)}>Songs</button><a href={artist.spotifyUrl} rel="noopener noreferrer" target="_blank">Spotify ↗</a></div>
                </div>
              </article>;
            })}
          </div>
          {loading && <p role="status">Künstler werden geladen …</p>}
          {!loading && !shown.length && !error && <p>{mode==="search" && debounced.length<2 ? "Gib mindestens zwei Zeichen ein." : "Keine Künstler gefunden. Probiere ein anderes Genre oder die Suche."}</p>}
          {!loading && hasMore && <button className="sonic-discover-more-v360" type="button" onClick={()=>setOffset(n=>Math.min(50,n+10))}>Weitere Künstler laden</button>}
          {selected && <section className="sonic-discover-songs-v360" aria-label={`Songauswahl für ${selected.name}`}><div className="sonic-discover-songs-head-v360"><h3>{selected.name} · Songauswahl</h3><button type="button" onClick={()=>setSelected(null)}>Schließen</button></div><p>Spotify-Suchergebnisse, keine Popularitätsrangliste.</p>{songsBusy?<p>Suche Songs …</p>:songs.length?songs.map(song=><a key={song.id} href={song.spotifyUrl} target="_blank" rel="noopener noreferrer">♫ {song.name}{song.album?` — ${song.album}`:""} ↗</a>):<p>Keine passenden Titel gefunden. Öffne den Künstler direkt auf Spotify.</p>}</section>}
        </div>
        <footer className="sonic-discover-footer-v360">Künstlerfotos und Musikdaten: Spotify · <a href="https://open.spotify.com/" target="_blank" rel="noopener noreferrer">Auf Spotify öffnen ↗</a></footer>
      </section>
    </div>}
  </>;
}
