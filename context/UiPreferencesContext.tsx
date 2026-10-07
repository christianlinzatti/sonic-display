"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { UiPreferences } from "@/types/music";
const KEY = "sonic-display-ui-preferences-v1";
const defaults: UiPreferences = { visualizerMode: "avatar", lyricsVisible: true, microphoneEnabled: false, reducedMotion: false, avatarModelId: "procedural", avatarScale: 1, avatarOffsetY: 0, avatarAnimationIntensity: 1, autoAvatarByGenre: false };
type Value = { preferences: UiPreferences; updatePreferences: (patch: Partial<UiPreferences>) => void; };
const Context = createContext<Value | null>(null);
export function UiPreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<UiPreferences>(defaults);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(KEY); if (saved) setPreferences({ ...defaults, ...JSON.parse(saved) }); } catch { /* retain defaults */ } setHydrated(true); }, []);
  useEffect(() => { if (hydrated) localStorage.setItem(KEY, JSON.stringify(preferences)); }, [hydrated, preferences]);
  const updatePreferences = useCallback((patch: Partial<UiPreferences>) => setPreferences(current => ({ ...current, ...patch })), []);
  const value = useMemo(() => ({ preferences, updatePreferences }), [preferences, updatePreferences]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}
export function useUiPreferences() { const value = useContext(Context); if (!value) throw new Error("useUiPreferences must be used within UiPreferencesProvider"); return value; }
