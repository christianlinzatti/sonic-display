"use client";
import { useEffect, useState } from "react";
import { setPerformanceMode, useAdaptivePerformance } from "./adaptivePerformance";

export type QualityTier = "high" | "balanced" | "low";
export type PerformanceProfile = {
  id: string; name: string; deviceKey: string; quality: QualityTier;
  createdAt: string; benchmark?: { fps: number; frameMs: number; slowPercent: number; avatar: string; lyricsStyle: string };
};
const STORAGE_KEY = "sonic-performance-profiles-v85";
const AUTO_KEY = "sonic-performance-auto-profile-v85";
export function currentDeviceKey() {
  if (typeof window === "undefined") return "";
  // Local browser/display signature, not an account/device identifier.
  return [navigator.userAgent, window.screen.width, window.screen.height, window.devicePixelRatio].join("|");
}
export function readPerformanceProfiles(): PerformanceProfile[] {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || "[]");
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((p): p is PerformanceProfile => Boolean(p && typeof p.id === "string" && typeof p.name === "string" && typeof p.deviceKey === "string" && ["high", "balanced", "low"].includes(p.quality)));
  } catch { return []; }
}
export function savePerformanceProfile(profile: PerformanceProfile) {
  const profiles = readPerformanceProfiles();
  const next = [...profiles.filter(p => p.id !== profile.id), profile];
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event("sonic-performance-profiles-changed"));
}
function removePerformanceProfile(id: string) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(readPerformanceProfiles().filter(p => p.id !== id)));
  window.dispatchEvent(new Event("sonic-performance-profiles-changed"));
}
/** Mount once at application root, even before Spotify connects. */
export function AutoApplyPerformanceProfile() {
  useEffect(() => {
    try {
      if (window.localStorage.getItem(AUTO_KEY) !== "true") return;
      const matching = readPerformanceProfiles().filter(p => p.deviceKey === currentDeviceKey());
      const newest = matching[matching.length - 1];
      if (newest) setPerformanceMode(newest.quality);
    } catch { /* unavailable storage */ }
  }, []);
  return null;
}
export function PerformanceProfiles({ suggested }: { suggested?: {quality: QualityTier; fps: number; frameMs: number; slowPercent: number; avatar: string; lyricsStyle: string } | null }) {
  const quality = useAdaptivePerformance();
  const [profiles, setProfiles] = useState<PerformanceProfile[]>([]);
  const [name, setName] = useState("");
  const [automatic, setAutomatic] = useState(false);
  const [message, setMessage] = useState("");
  const [device, setDevice] = useState("");
  useEffect(() => {
    const refresh = () => setProfiles(readPerformanceProfiles());
    refresh(); setDevice(currentDeviceKey());
    try { setAutomatic(window.localStorage.getItem(AUTO_KEY) === "true"); } catch { /* ignore */ }
    window.addEventListener("sonic-performance-profiles-changed", refresh);
    return () => window.removeEventListener("sonic-performance-profiles-changed", refresh);
  }, []);
  const save = (fromBenchmark: boolean) => {
    const title = name.trim() || (fromBenchmark ? "Benchmark-Profil" : "Mein Gerät");
    const tier = fromBenchmark && suggested ? suggested.quality : quality.tier;
    const profile: PerformanceProfile = {
      id: crypto.randomUUID(), name: title, deviceKey: currentDeviceKey(), quality: tier,
      createdAt: new Date().toISOString(),
      ...(fromBenchmark && suggested ? {benchmark: {fps: suggested.fps, frameMs: suggested.frameMs, slowPercent: suggested.slowPercent, avatar: suggested.avatar, lyricsStyle: suggested.lyricsStyle}} : {}),
    };
    try {savePerformanceProfile(profile); setName(""); setMessage(`Profil „${title}“ gespeichert.`);} catch {setMessage("Speichern nicht möglich: Browser-Speicher gesperrt.");}
  };
  return <section className="render-diagnostics" aria-label="Performance-Profile">
    <h3>Performance-Profile (V85)</h3>
    <p className="settings-note">Profile werden in diesem Browser gespeichert. Du kannst eigene Profile benennen und eine passende Qualitätsstufe manuell anwenden. Automatik verwendet nur Profile, die mit der aktuellen Browser- und Bildschirmkennung übereinstimmen.</p>
    <div className="settings-field"><label htmlFor="perf-profile-name">Profilname / Gerät</label>
      <input id="perf-profile-name" value={name} maxLength={70} onChange={e => setName(e.target.value)} placeholder="z. B. Raspberry Pi Wohnzimmer" /></div>
    <div className="avatar-editor-buttons">
      <button type="button" onClick={() => save(false)}>Aktuelle Qualität ({quality.tier}) speichern</button>
      {suggested && <button type="button" onClick={() => save(true)}>Benchmark-Empfehlung ({suggested.quality}) speichern</button>}
    </div>
    <label className="settings-field"><input type="checkbox" checked={automatic} onChange={e => {
      setAutomatic(e.target.checked);
      try {window.localStorage.setItem(AUTO_KEY, String(e.target.checked));} catch {setMessage("Automatik konnte nicht gespeichert werden.");}
      if (e.target.checked) {
        const match = readPerformanceProfiles().filter(p => p.deviceKey === currentDeviceKey());
        if (match.length) setPerformanceMode(match[match.length - 1].quality);
      }
    }} /> Passendes Profil beim nächsten Start automatisch anwenden</label>
    {message && <p role="status">{message}</p>}
    {profiles.length === 0 && <p className="settings-note">Noch keine Profile gespeichert.</p>}
    {profiles.map(profile => <div key={profile.id} className="settings-field" style={{borderTop:"1px solid rgba(255,255,255,.15)", paddingTop:12}}>
      <strong>{profile.name}</strong> · {profile.quality} {profile.deviceKey === device ? "· Dieses Gerät" : "· Anderes Gerät"}
      <small>{new Date(profile.createdAt).toLocaleString("de-AT")}{profile.benchmark ? ` · Benchmark: ${profile.benchmark.fps.toFixed(1)} FPS, ${profile.benchmark.slowPercent.toFixed(1)} % langsame Frames · ${profile.benchmark.avatar} / ${profile.benchmark.lyricsStyle}` : ""}</small>
      <div className="avatar-editor-buttons"><button type="button" onClick={() => {setPerformanceMode(profile.quality);setMessage(`Qualität ${profile.quality} angewendet.`);}}>Anwenden</button>
        <button type="button" onClick={() => {removePerformanceProfile(profile.id);setMessage("Profil gelöscht.");}}>Löschen</button></div>
    </div>)}
    <p className="settings-note">Hinweis: Die automatische Erkennung ist auf diesen Browser und seine Bildschirmkonfiguration begrenzt. Browserwechsel und Änderung der Bildschirmauflösung können eine erneute Zuordnung erfordern.</p>
  </section>;
}
