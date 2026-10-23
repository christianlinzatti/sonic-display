"use client";

import { useEffect, useState } from "react";
import {
  RUNTIME_PERFORMANCE_EVENT, getJsHeapMiB, getNavigationSnapshot, getRuntimeCheckpoints,
} from "@/services/monitoring/runtimePerformanceV285";
import { getSessionSummary } from "@/services/monitoring/longSessionMetrics";

const formatMs = (value: number | null) => value === null ? "nicht verfügbar" : `${Math.round(value)} ms`;

export function RuntimePerformancePanelV285() {
  const [, refresh] = useState(0);
  useEffect(() => {
    const update = () => refresh(n => n + 1);
    window.addEventListener(RUNTIME_PERFORMANCE_EVENT, update);
    const timer = window.setInterval(update, 5000);
    return () => { window.removeEventListener(RUNTIME_PERFORMANCE_EVENT, update); window.clearInterval(timer); };
  }, []);

  const nav = getNavigationSnapshot();
  const checkpoints = getRuntimeCheckpoints();
  const session = getSessionSummary();
  const heap = getJsHeapMiB();
  const webgl = checkpoints.find(checkpoint => checkpoint.name === "Visualizer-Komponente gemountet");

  return <section aria-label="V285 Runtime Performance" className="runtime-performance-v285">
    <h3>V285 · Runtime Performance</h3>
    <p className="settings-note">Browser-Messwerte dieser Sitzung. Keine Übertragung, keine dauerhafte Speicherung. Die Werte hängen von Gerät, Cache und Verbindung ab.</p>
    <div className="render-diagnostics-grid">
      <div><span>DOM bereit</span><strong>{formatMs(nav.domContentLoadedMs)}</strong></div>
      <div><span>First Contentful Paint</span><strong>{formatMs(nav.firstContentfulPaintMs)}</strong></div>
      <div><span>Load Event</span><strong>{formatMs(nav.loadMs)}</strong></div>
      <div><span>Visualizer gemountet</span><strong>{formatMs(webgl?.elapsedMs ?? null)}</strong></div>
      <div><span>Session-FPS (Mittel)</span><strong>{session.fpsAverage === null ? "nicht verfügbar" : session.fpsAverage.toFixed(1)}</strong></div>
      <div><span>JS-Heap aktuell</span><strong>{heap === null ? "nicht verfügbar" : `${heap.toFixed(1)} MiB`}</strong></div>
      <div><span>Heap-Trend</span><strong>{session.heapGrowthMiBPerHour === null ? "nicht verfügbar" : `${session.heapGrowthMiBPerHour.toFixed(1)} MiB/h`}</strong></div>
      <div><span>Session-Messpunkte</span><strong>{session.samples}</strong></div>
    </div>
    <details>
      <summary>Start- und Lade-Meilensteine ({checkpoints.length})</summary>
      {checkpoints.length ? <ol>{checkpoints.map(checkpoint => <li key={checkpoint.name}>{checkpoint.name}: {formatMs(checkpoint.elapsedMs)}</li>)}</ol> : <p>Keine Meilensteine vorhanden.</p>}
    </details>
    <p className="settings-note">„Visualizer gemountet“ erfasst den React-Mount, nicht den ersten fertigen WebGL-Frame. Für detaillierte Frametimes und Langzeit-FPS die Renderdiagnose und Langzeit-Performance darunter verwenden. Heap-Daten sind nicht in allen Browsern verfügbar.</p>
  </section>;
}
