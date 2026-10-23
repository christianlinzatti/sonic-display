"use client";
import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { recordLoadMetric } from "@/services/loading/loadingMetrics";

let settingsModule: Promise<typeof import("@/components/SettingsPanel")> | undefined;
let requestStarted = 0;
function preloadSettings(): Promise<typeof import("@/components/SettingsPanel")> {
  if (!settingsModule) {
    requestStarted = window.performance.now();
    settingsModule = import("@/components/SettingsPanel").then(module => {
      recordLoadMetric("Einstellungen: Modul", window.performance.now() - requestStarted);
      return module;
    }).catch(error => { settingsModule = undefined; throw error; });
  }
  return settingsModule;
}
const LazySettingsPanel = dynamic(() => preloadSettings().then(module => module.SettingsPanel), {
  ssr: false,
  loading: () => <aside className="settings-panel"><button className="settings-trigger" disabled>⚙ Einstellungen laden…</button></aside>,
});

/** Keep the heavy settings UI unmounted until the first open. Hover/focus warms its chunk. */
export function SmartLazySettings() {
  const [requested, setRequested] = useState(false);
  const warm = useCallback(() => { void preloadSettings().catch(() => undefined); }, []);
  if (requested) return <LazySettingsPanel initiallyOpen />;
  return <aside className="settings-panel"><button className="settings-trigger"
    aria-expanded={false} onPointerEnter={warm} onFocus={warm}
    onClick={() => { warm(); setRequested(true); }}>⚙ Settings</button></aside>;
}
