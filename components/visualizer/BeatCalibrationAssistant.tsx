"use client";
import { useEffect, useRef, useState } from "react";
import { useAudioAnalysis } from "@/context/AudioAnalysisContext";
import { useUiPreferences } from "@/context/UiPreferencesContext";

const DURATION_MS = 8000;
export function BeatCalibrationAssistant() {
  const { active, metrics } = useAudioAnalysis();
  const { updatePreferences } = useUiPreferences();
  const samples = useRef<number[]>([]);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION_MS);
  const [suggestion, setSuggestion] = useState<number | null>(null);
  useEffect(() => {
    if (!running) return;
    samples.current = [];
    const started = Date.now();
    const timer = window.setInterval(() => {
      samples.current.push(metrics.kick);
      const elapsed = Date.now() - started;
      setRemaining(Math.max(0, DURATION_MS - elapsed));
      if (elapsed >= DURATION_MS) {
        window.clearInterval(timer);
        const sorted = [...samples.current].sort((a, b) => a - b);
        const percentile = sorted[Math.floor((sorted.length - 1) * 0.75)] ?? 0;
        const value = Math.max(0.5, Math.min(2, 0.9 / Math.max(0.1, percentile)));
        setSuggestion(Number(value.toFixed(2)));
        setRunning(false);
        setRemaining(0);
      }
    }, 100);
    return () => window.clearInterval(timer);
  }, [running, metrics.kick]);
  return <div className="beat-calibration">
    <p>Play music with a clear beat for 8 seconds. Keep microphone levels and speaker volume as you normally use them.</p>
    <button type="button" disabled={!active || running} onClick={() => { setSuggestion(null); setRemaining(DURATION_MS); setRunning(true); }}>{running ? `Calibrating… ${Math.ceil(remaining / 1000)}s` : "Start calibration"}</button>
    {!active && <small>Enable microphone analysis and grant permission first.</small>}
    {suggestion !== null && <div role="status"><p>Suggested beat sensitivity: <strong>{suggestion.toFixed(2)}×</strong></p><button type="button" onClick={() => updatePreferences({ beatSensitivity: suggestion })}>Apply suggestion</button></div>}
  </div>;
}
