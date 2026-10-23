"use client";
import { useEffect, useState } from "react";
import { getLoadMetrics, LOADING_METRIC_EVENT, type LoadMetric } from "@/services/loading/loadingMetrics";

/** Session-only chunk timing. Never persists a history or sends diagnostics anywhere. */
export function LoadingMetricsPanel() {
  const [metrics, setMetrics] = useState<LoadMetric[]>([]);
  useEffect(() => {
    const refresh = () => setMetrics(getLoadMetrics());
    refresh(); window.addEventListener(LOADING_METRIC_EVENT, refresh);
    return () => window.removeEventListener(LOADING_METRIC_EVENT, refresh);
  }, []);
  const recent = metrics.slice(-8).reverse();
  return <section aria-label="Ladezeiten" style={{padding:"0.75rem 1rem"}}>
    <strong>V248 · Ladezeiten (aktuelle Sitzung)</strong>
    {recent.length ? <ul>{recent.map((entry, index) => <li key={`${entry.at}-${index}`}>
      {entry.name}: {entry.milliseconds.toFixed(1)} ms
    </li>)}</ul> : <p>Noch keine Modul-Ladezeiten gemessen.</p>}
    <small>Messung der Modul-Ladezeit, keine vollständige Seitenladezeit. Nur im Arbeitsspeicher.</small>
  </section>;
}
