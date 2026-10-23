"use client";
import { useEffect, useState } from "react";
import { setPerformanceMode } from "./adaptivePerformance";
import {configurePiConcertV479,usePiConcertBudgetV479} from "./piConcertRuntimeV479";
import { detectPiHints, readPiProfile, resolvePiQuality, writePiProfile, type PiProfile, type PiHints } from "./piDeviceProfile";

function browserHints(): PiHints {
  if (typeof navigator === "undefined") return detectPiHints("");
  const deviceMemory = (navigator as Navigator & {deviceMemory?: number}).deviceMemory;
  return detectPiHints(navigator.userAgent, navigator.hardwareConcurrency, deviceMemory);
}

/** Opt-in bootstrap: never override user quality without a selected device profile. */
export function RaspberryPiProfileBootstrap() {
  useEffect(() => {
    const apply = () => {
      const profile=readPiProfile();
      const hints=browserHints();
      configurePiConcertV479(profile,hints);
      const quality = resolvePiQuality(profile,hints);
      if (quality) setPerformanceMode(quality);
    };
    apply();
    window.addEventListener("sonic:pi-profile-changed", apply);
    return () => window.removeEventListener("sonic:pi-profile-changed", apply);
  }, []);
  return null;
}

export function RaspberryPiEditionSettings() {
  const [profile, setProfile] = useState<PiProfile>("off");
  const concertBudgetV479=usePiConcertBudgetV479();
  const [hints, setHints] = useState<PiHints>(() => detectPiHints(""));
  const [fullscreen, setFullscreen] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setProfile(readPiProfile()); setHints(browserHints());
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    update(); document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await document.documentElement.requestFullscreen();
      setMessage("");
    } catch { setMessage("Vollbildmodus wurde vom Browser abgelehnt. Für einen automatischen Kiosk-Start Chromium mit --kiosk starten."); }
  }
  return <section className="settings-field" aria-label="V165 Raspberry Pi Performance Edition">
    <h3>V165 – Raspberry Pi Performance Edition</h3>
    <p className="settings-note">{hints.platform} · CPU-Kerne: {hints.cores ?? "unbekannt"} · geschätzter Browser-Speicher: {hints.memoryGb ?? "unbekannt"} GB. {hints.reason}. Die Hardwareerkennung ist heuristisch.</p>
    <label htmlFor="pi-performance-profile">Geräteprofil (Opt-in)</label>
    <select id="pi-performance-profile" value={profile} onChange={e => {
      const next = e.target.value as PiProfile;
      setProfile(next); writePiProfile(next);
      if (next === "off") setPerformanceMode("auto");
    }}>
      <option value="off">Aus – bisherige Qualitätsregelung</option>
      <option value="auto">Automatisch bei Linux ARM / Pi-Hinweis</option>
      <option value="pi-balanced">Pi Balanced – begrenzte Auflösung</option>
      <option value="pi-low">Pi Low – Performance-Fokus</option>
    </select>
    <p className="settings-note">Aktuelle Profil-Empfehlung: {resolvePiQuality(profile, hints) ?? "keine Änderung"}. Bei Profilwechsel wird nur die Renderqualität angepasst; Spotify, Lyrics, Beat-Sync und IK bleiben unverändert.</p>
    <p className="settings-note">V479 Konzertbudget: {concertBudgetV479.enabled ? concertBudgetV479.level : "aus"}. Nutzt nur gemessene Framezeiten und reduziert bei längerer Last optionale automatische Shader-/Postprocessing-Effekte. Manuell eingeschaltete Effekte, Audio, Lyrics und Tanzzeiten bleiben unverändert.</p>
    <button type="button" onClick={toggleFullscreen}>{fullscreen ? "Vollbild verlassen" : "Vollbild aktivieren"}</button>
    {message && <p role="status">{message}</p>}
    <p className="settings-note">Browser-Vollbild benötigt einen Klick. Automatischer Kioskstart erfolgt außerhalb der Web-App über einen Chromium-Autostart.</p>
  </section>;
}
