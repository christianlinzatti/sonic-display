"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  RELEASE_ALERT_DAYS_V363, RELEASE_CHECK_INTERVAL_V363,
  RELEASE_NOTIFICATIONS_EVENT_V363, RELEASE_NOTIFICATIONS_KEY_V363,
  RELEASE_SCAN_DAYS_V363, RELEASE_SCAN_PAGES_V363,
  applyReleaseScanV363, countUnreadReleasesV363, freshNotificationStateV363,
  parseNotificationStateV363, readReleaseAlertV363, shouldCheckReleasesV363,
  type ReleaseNotificationStateV363
} from "@/lib/release-notifications-v363";
import { RADAR_SEEN_KEY_V362, parseSeenRadarIds, type RadarReleaseV362 } from "@/lib/release-radar-v362";

type RadarData = { releases?: RadarReleaseV362[]; nextCursor?: string | null; hasMore?: boolean; partial?: boolean; code?: string; message?: string };
const lockKey = "sonic.release-notifications.lock.v363";
function readState(): ReleaseNotificationStateV363 {
  if (typeof window === "undefined") return freshNotificationStateV363();
  try { return parseNotificationStateV363(JSON.parse(window.localStorage.getItem(RELEASE_NOTIFICATIONS_KEY_V363) ?? "null")); }
  catch { return freshNotificationStateV363(); }
}
function readRadarSeen(): string[] {
  try { return parseSeenRadarIds(JSON.parse(window.localStorage.getItem(RADAR_SEEN_KEY_V362) ?? "[]")); } catch { return []; }
}
const dateLabel = (value: string | null) => value ? new Date(`${value}T12:00:00Z`).toLocaleDateString("de-AT") : "Unbekannt";
function acquireLock(): string | null {
  const token = `${Date.now() + 180_000}:${Math.random().toString(36).slice(2)}`;
  try {
    const now = Date.now();
    const stored = window.localStorage.getItem(lockKey);
    const expiry = Number(stored?.split(":")[0]);
    if (Number.isFinite(expiry) && expiry > now && expiry < now + 180_000) return null;
    window.localStorage.setItem(lockKey, token);
    if (window.localStorage.getItem(lockKey) !== token) return null;
  } catch { /* storage disabled: still permit this tab */ }
  return token;
}
function releaseLock(token: string | null) {
  if (!token) return;
  try { if (window.localStorage.getItem(lockKey) === token) window.localStorage.removeItem(lockKey); }
  catch { /* no storage */ }
}

/** Only checks while the app is open and connected; no browser Push API or service worker. */
export function ReleaseNotificationsV363() {
  const [state, setState] = useState<ReleaseNotificationStateV363>(freshNotificationStateV363);
  const stateRef = useRef(state), abortRef = useRef<AbortController | null>(null);
  const [open, setOpen] = useState(false);
  const lockRef = useRef<string | null>(null);
  const [checking, setChecking] = useState(false), [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null), [partial, setPartial] = useState(false);
  const [toast, setToast] = useState(0);
  const launch = useRef<HTMLButtonElement>(null);
  const commit = useCallback((next: ReleaseNotificationStateV363) => {
    const clean = parseNotificationStateV363(next);
    stateRef.current = clean; setState(clean);
    try { window.localStorage.setItem(RELEASE_NOTIFICATIONS_KEY_V363, JSON.stringify(clean)); } catch { /* private browsing */ }
    window.dispatchEvent(new Event(RELEASE_NOTIFICATIONS_EVENT_V363));
  }, []);
  const scan = useCallback(async (forced = false) => {
    if (abortRef.current) return;
    const now = Date.now(), previous = stateRef.current;
    if (!forced && !shouldCheckReleasesV363(previous, now)) return;
    if (now < previous.retryAfter) { setError("Spotify-Anfragen sind vorübergehend pausiert. Bitte später erneut prüfen."); return; }
    const lockToken = acquireLock();
    if (!lockToken) return;
    lockRef.current = lockToken;
    const ac = new AbortController(); abortRef.current = ac;
    setChecking(true); setProgress(0); setError(null); setPartial(false);
    try {
      const gathered: RadarReleaseV362[] = []; let cursor = previous.nextCursor;
      let hadPartial = false; const attempted = new Set<string>();
      for (let page = 0; page < RELEASE_SCAN_PAGES_V363; page++) {
        if (ac.signal.aborted) return;
        const query = new URLSearchParams({days:String(RELEASE_SCAN_DAYS_V363)});
        if (cursor) query.set("after",cursor);
        const response = await fetch(`/api/spotify/release-radar?${query}`, { cache:"no-store", signal:ac.signal });
        const data = await response.json() as RadarData;
        if (!response.ok) {
          if (response.status === 429 || response.status >= 500) {
            const seconds = Number(response.headers.get("Retry-After"));
            const delay = response.status === 429 ? Math.max(60_000, Math.min(3600_000, Number.isFinite(seconds) ? seconds * 1000 : 3600_000)) : 20 * 60_000;
            commit({...stateRef.current,retryAfter:Date.now()+delay});
          }
          throw new Error(data.message || (response.status === 401 ? "Spotify muss neu verbunden werden." : "Spotify-Abfrage fehlgeschlagen."));
        }
        if (ac.signal.aborted) return;
        if (!Array.isArray(data.releases)) throw new Error("Spotify hat keine gültigen Release-Daten geliefert.");
        gathered.push(...data.releases);
        hadPartial ||= Boolean(data.partial);
        setProgress(page + 1);
        const next = data.hasMore && typeof data.nextCursor === "string" ? data.nextCursor : null;
        if (!next || attempted.has(next) || next === cursor || data.partial) { cursor = next && !data.partial ? next : null; break; }
        attempted.add(next); cursor = next;
      }
      if (ac.signal.aborted) return;
      const result = applyReleaseScanV363(stateRef.current, gathered, Date.now(), readRadarSeen(), cursor, hadPartial);
      commit(result.state); setPartial(hadPartial);
      if (result.added > 0) setToast(result.added);
    } catch (e) {
      if (!ac.signal.aborted) setError(e instanceof Error ? e.message : "Release-Prüfung fehlgeschlagen.");
    } finally {
      if (abortRef.current === ac) abortRef.current = null;
      releaseLock(lockToken);
      if (lockRef.current === lockToken) lockRef.current = null;
      if (!ac.signal.aborted) setChecking(false);
    }
  }, [commit]);
  useEffect(() => {
    const initial = readState(); stateRef.current = initial; setState(initial);
    const storage = (event: StorageEvent) => {
      if (event.key === RELEASE_NOTIFICATIONS_KEY_V363) {
        const updated = readState(); stateRef.current = updated; setState(updated);
      }
      if (event.key === RADAR_SEEN_KEY_V362) {
        const seen = new Set(readRadarSeen());
        const next = stateRef.current;
        if (next.alerts.some(a => !a.read && seen.has(a.release.id))) commit({...next, alerts:next.alerts.map(a => seen.has(a.release.id) ? {...a,read:true} : a)});
      }
    };
    const radarSeenChanged = () => {
      const seen = new Set(readRadarSeen()), next = stateRef.current;
      if (next.alerts.some(a => !a.read && seen.has(a.release.id))) commit({...next, alerts:next.alerts.map(a => seen.has(a.release.id) ? {...a,read:true} : a)});
    };
    window.addEventListener("storage", storage);
    window.addEventListener("sonic:radar-seen-changed-v362",radarSeenChanged);
    if (shouldCheckReleasesV363(initial, Date.now())) void scan();
    return () => {
      abortRef.current?.abort(); abortRef.current = null;
      releaseLock(lockRef.current); lockRef.current = null;
      window.removeEventListener("storage", storage);
      window.removeEventListener("sonic:radar-seen-changed-v362",radarSeenChanged);
    };
  }, [commit, scan]);
  useEffect(() => { if (!toast) return; const timeout = window.setTimeout(() => setToast(0), 8500); return () => window.clearTimeout(timeout); }, [toast]);
  useEffect(() => { if (!open) return; const key = (event:KeyboardEvent) => {if(event.key === "Escape")setOpen(false);}; window.addEventListener("keydown",key); return ()=>window.removeEventListener("keydown",key); }, [open]);
  const setEnabled = (enabled:boolean) => { if (!enabled) abortRef.current?.abort(); const next={...stateRef.current,enabled}; commit(next); if(enabled && shouldCheckReleasesV363(next,Date.now())) void scan(); };
  const mark = (id:string|"all") => {
    const target = id === "all" ? stateRef.current.alerts.map(a => a.release.id) : [id];
    commit(readReleaseAlertV363(stateRef.current,id));
    try {
      const seen = parseSeenRadarIds([...readRadarSeen(),...target]);
      window.localStorage.setItem(RADAR_SEEN_KEY_V362, JSON.stringify(seen));
      window.dispatchEvent(new Event("sonic:radar-seen-changed-v362"));
    } catch {/* storage unavailable */}
  };
  const clear = () => { abortRef.current?.abort(); commit({...freshNotificationStateV363(),enabled:stateRef.current.enabled}); setToast(0); };
  const unread = countUnreadReleasesV363(state), rows = [...state.alerts].sort((a,b)=>b.discoveredAt-a.discoveredAt||b.release.releaseDate!.localeCompare(a.release.releaseDate!));
  return <>
    <button className="sonic-release-alert-launch-v363" type="button" ref={launch} aria-haspopup="dialog" aria-expanded={open} onClick={()=>setOpen(true)}>
      <span aria-hidden="true">🔔</span> Neuheiten {unread>0&&<strong className="sonic-release-alert-count-v363" aria-label={`${unread} ungelesen`}>{unread}</strong>}
    </button>
    {toast>0&&<div className="sonic-release-toast-v363" role="status">
      {toast} neue {toast===1?"Veröffentlichung":"Veröffentlichungen"} gefunden.
      <button type="button" onClick={()=>{setOpen(true);setToast(0);}}>Ansehen</button>
      <button type="button" aria-label="Hinweis schließen" onClick={()=>setToast(0)}>✕</button>
    </div>}
    {open&&<div className="sonic-release-alert-backdrop-v363" onMouseDown={e=>{if(e.target===e.currentTarget)setOpen(false);}}>
      <section className="sonic-release-alert-modal-v363" role="dialog" aria-modal="true" aria-label="Release-Benachrichtigungen">
        <header><div><h2>🔔 Release-Benachrichtigungen</h2><p>{unread} ungelesen · {state.alerts.length} gespeicherte Meldungen</p></div><button type="button" aria-label="Schließen" onClick={()=>{setOpen(false);launch.current?.focus();}}>✕</button></header>
        <div className="sonic-release-alert-tools-v363">
          <label><input type="checkbox" checked={state.enabled} onChange={e=>setEnabled(e.target.checked)}/> Beim Öffnen automatisch prüfen</label>
          <button type="button" disabled={checking||Date.now()<state.retryAfter} onClick={()=>void scan(true)}>{checking?`Prüfe Künstlerseite ${progress+1}/${RELEASE_SCAN_PAGES_V363}…`:"Jetzt prüfen"}</button>
          <button type="button" disabled={!unread} onClick={()=>mark("all")}>Alle gelesen</button>
          <button type="button" onClick={clear}>Verlauf löschen</button>
        </div>
        <p className="sonic-release-alert-hint-v363">Automatische Prüfung beim Öffnen, höchstens alle {RELEASE_CHECK_INTERVAL_V363/3600000} Stunden. Pro Prüfung maximal {RELEASE_SCAN_PAGES_V363*4} gefolgte Künstler, je zehn Veröffentlichungen. Neue Meldungen nur für taggenau datierte Releases der letzten {RELEASE_ALERT_DAYS_V363} Tage.</p>
        {state.lastCheckedAt>0&&<p className="sonic-release-alert-hint-v363">Letzte Prüfung: {new Date(state.lastCheckedAt).toLocaleString("de-AT")}. {state.nextCursor?"Nächste Prüfung setzt bei weiteren gefolgten Künstlern fort.":"Nächste Prüfung beginnt wieder am Anfang der Follow-Liste."}</p>}
        {checking&&<p role="status">Spotify-Veröffentlichungen werden geprüft …</p>}
        {partial&&<p className="sonic-release-alert-warning-v363" role="status">Einige Künstler konnten nicht geprüft werden. Der Feed ist unvollständig.</p>}
        {error&&<p className="sonic-release-alert-warning-v363" role="alert">{error}</p>}
        <div className="sonic-release-alert-list-v363">
          {rows.length===0&&!checking&&<p>Noch keine Meldungen. Beim ersten erfolgreichen Check erscheinen aktuelle Veröffentlichungen aus der geprüften Auswahl, sofern vorhanden.</p>}
          {rows.map(({release,discoveredAt,read})=><article className={`sonic-release-alert-item-v363 ${read?"is-read":""}`} key={release.id}>
            {release.coverUrl?<img src={release.coverUrl} alt="" loading="lazy" referrerPolicy="no-referrer"/>:<div className="sonic-release-alert-cover-v363">♫</div>}
            <div><strong>{release.title}</strong><p>{release.artistName} · {release.group==="single"?"Single":"Album"} · {dateLabel(release.releaseDate)}</p><small>Entdeckt: {new Date(discoveredAt).toLocaleDateString("de-AT")}</small>
              <div className="sonic-release-alert-actions-v363"><a href={release.spotifyUrl} target="_blank" rel="noopener noreferrer">Auf Spotify ↗</a><button type="button" disabled={read} onClick={()=>mark(release.id)}>{read?"✓ Gelesen":"Als gelesen markieren"}</button></div>
            </div>
          </article>)}
        </div>
        <footer><button type="button" onClick={()=>{setOpen(false);window.dispatchEvent(new Event("sonic:release-radar-open-v363"));}}>Vollständigen Release Radar öffnen ↗</button><p>Nur In-App-Hinweise, keine System-Pushs. Daten bleiben lokal und können gelöscht werden. Spotify-Abfragen sind begrenzt; der Feed kann unvollständig sein.</p></footer>
      </section>
    </div>}
  </>;
}
