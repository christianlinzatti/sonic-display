"use client";
import {calibrationSuggestion} from "@/lib/concertProgramme";
import { useEffect, useRef, useState } from "react";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";

const DURATION_MS = 8000;
export function BeatCalibrationAssistant() {
  const { active, metrics } = useAudioAnalysis();
  const { updatePreferences } = useUiPreferences();
  const latest=useRef(metrics);latest.current=metrics;
  const samples = useRef<number[]>([]);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const [suggestion, setSuggestion] = useState<number | null>(null);
  useEffect(() => {
    if (!running) return;
    samples.current = [];
    const started = Date.now();
    const timer = window.setInterval(() => {
      samples.current.push(latest.current.kick);
      const elapsed = Date.now() - started;
      setRemaining(Math.max(0, DURATION_MS - elapsed));
      if (elapsed >= DURATION_MS) {
        window.clearInterval(timer);
        setSuggestion(calibrationSuggestion(samples.current));
        setRunning(false);
        setRemaining(0);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [running]);
  return <div className="beat-calibration">
    <p>Spiele acht Sekunden Musik mit klarem Takt bei deiner üblichen Lautstärke.</p>
    <button type="button" disabled={!active || running} onClick={() => { setSuggestion(null); setRemaining(DURATION_MS); setRunning(true); }}>{running ? `Messung… ${Math.ceil(remaining / 1000)}s` : "Kalibrierung starten"}</button>
    {!active && <small>Aktiviere zuerst das Mikrofon.</small>}
    {suggestion !== null && <div role="status"><p>Empfohlene Empfindlichkeit: <strong>{suggestion.toFixed(2)}×</strong></p><button type="button" onClick={() => updatePreferences({ beatSensitivity: suggestion })}>Vorschlag übernehmen</button></div>}
  </div>;
}
