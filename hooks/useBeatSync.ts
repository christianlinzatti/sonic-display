"use client";
import { useMemo } from "react";
import type { BeatEvent } from "@/types/audio";
import type { MusicContextValue } from "@/types/music";

/** Estimate a phase correction between microphone transients and a *synthetic* Spotify tempo grid.
 * This is NOT real Spotify beat analysis. A stable BPM and strong transients are prerequisites.
 * Offset only describes phase alignment; microphone analysis remains the source of real kicks.
 */
export function useBeatSync(events: BeatEvent[], music: Pick<MusicContextValue, "track" | "isPlaying" | "progressMs" | "fetchedAt" | "genre">,
  mode: "off" | "auto" | "manual", manualOffsetMs: number, active: boolean) {
  return useMemo(() => {
    const manual = Math.max(-500, Math.min(500, manualOffsetMs));
    if (mode === "off") return { syncOffsetMs: 0, syncConfidence: 0, syncStatus: "Off" };
    if (mode === "manual") return { syncOffsetMs: manual, syncConfidence: 1, syncStatus: "Manual delay" };
    if (!active || !music.isPlaying || !music.track || !music.fetchedAt)
      return { syncOffsetMs: manual, syncConfidence: 0, syncStatus: "Waiting for playback and microphone" };
    const genre = String(music.genre ?? "").toLowerCase();
    const bpm = genre.includes("hardstyle") ? 150 : genre.includes("techno") ? 140 : genre.includes("metal") ? 165 : genre.includes("rock") ? 120 : 120;
    const period = 60000 / bpm;
    // BeatEvent.at is performance.now(), while fetchedAt is Date.now(). Convert via wall/monotonic clock difference.
    const clockDifference = Date.now() - performance.now();
    const recent = events.filter(e => performance.now() - e.at < 8000 && e.strength >= 0.15);
    if (recent.length < 5) return { syncOffsetMs: manual, syncConfidence: 0, syncStatus: "Collecting beats (5 required)" };
    let x = 0, y = 0, total = 0;
    for (const event of recent) {
      const trackPosition = music.progressMs + (event.at + clockDifference - music.fetchedAt);
      const angle = 2 * Math.PI * (((trackPosition % period) + period) % period) / period;
      const weight = event.strength;
      x += Math.cos(angle) * weight; y += Math.sin(angle) * weight; total += weight;
    }
    const confidence = total ? Math.hypot(x, y) / total : 0;
    if (confidence < 0.55) return { syncOffsetMs: manual, syncConfidence: confidence, syncStatus: "Unstable beat phase — using manual offset" };
    const phaseMs = Math.atan2(y, x) * period / (2 * Math.PI);
    // Align synthetic beat grid with observed microphone transients; shortest signed shift.
    const offset = Math.round(Math.max(-500, Math.min(500, manual + phaseMs)));
    return { syncOffsetMs: offset, syncConfidence: confidence, syncStatus: "Phase estimate (synthetic grid)" };
  }, [events, music.track?.id, music.isPlaying, music.progressMs, music.fetchedAt, music.genre, mode, manualOffsetMs, active]);
}
