"use client";
import { useEffect, useMemo, useState } from "react";
import type { AmbientPalette } from "./MusicAwareThemes";
import type { CSSProperties } from "react";
import type { KioskView } from "./TouchKioskControls";

const AUTO_KEY = "sonic-display:v167:auto-layout";
const AMBIENT_KEY = "sonic-display:v167:ambient";
const STANDBY_DELAY_MS = 30000;
function stored(key: string, defaultValue: boolean) {
  try { const v = window.localStorage.getItem(key); return v === null ? defaultValue : v === "true"; }
  catch { return defaultValue; }
}
/** Pause grace period avoids flashing standby during Spotify track changes. */
export function useSmartAmbient(playing: boolean, connected: boolean, hasTrack: boolean, kioskEnabled: boolean) {
  const [autoLayout, setAutoLayout] = useState(false);
  const [ambientEnabled, setAmbientEnabled] = useState(false);
  const [idleSince, setIdleSince] = useState<number | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  useEffect(() => { setAutoLayout(stored(AUTO_KEY, false)); setAmbientEnabled(stored(AMBIENT_KEY, false)); }, []);
  useEffect(() => { try { localStorage.setItem(AUTO_KEY, String(autoLayout)); } catch {} }, [autoLayout]);
  useEffect(() => { try { localStorage.setItem(AMBIENT_KEY, String(ambientEnabled)); } catch {} }, [ambientEnabled]);
  const idle = !playing && connected;
  useEffect(() => { if (!idle) { setIdleSince(null); return; } setIdleSince(Date.now()); }, [idle]);
  useEffect(() => {
    if (!ambientEnabled || !kioskEnabled || !idle) return;
    const timer = window.setInterval(() => setClock(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [ambientEnabled, kioskEnabled, idle]);
  const standby = Boolean(kioskEnabled && ambientEnabled && idle && idleSince !== null && clock - idleSince >= STANDBY_DELAY_MS);
  const suggestedView: KioskView | null = kioskEnabled && autoLayout && playing && hasTrack ? "split" : null;
  return { autoLayout, setAutoLayout, ambientEnabled, setAmbientEnabled, standby, suggestedView };
}
export function AmbientStandby({ title, artist, albumCoverUrl, palette }: { title?: string; artist?: string; albumCoverUrl?: string | null; palette?: AmbientPalette }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(new Intl.DateTimeFormat(undefined,{hour:"2-digit",minute:"2-digit"}).format(new Date()));
    update(); const id = window.setInterval(update, 15000); return () => window.clearInterval(id);
  }, []);
  return <section className={`sonic-ambient ${palette ? "sonic-ambient-themed" : ""}`} style={palette ? ({"--sonic-theme-primary":palette.primary,"--sonic-theme-secondary":palette.secondary,"--sonic-theme-glow":palette.glow} as CSSProperties) : undefined} aria-label="Ambient-Standby">
    <div className="sonic-ambient-glow" aria-hidden="true" />
    <div className="sonic-ambient-content">
      <div className="sonic-ambient-clock" aria-label="Uhrzeit">{time || "--:--"}</div>
      <div className="sonic-ambient-status">SONIC DISPLAY · STANDBY</div>
      {albumCoverUrl && <img className="sonic-ambient-cover" src={albumCoverUrl} alt="Letztes Albumcover" />}
      <div className="sonic-ambient-track">{title || "Keine Musik"}</div>
      {artist && <div className="sonic-ambient-artist">{artist}</div>}
      <p>Musik auf Spotify starten, um zur Performance zurückzukehren.</p>
    </div>
  </section>;
}
