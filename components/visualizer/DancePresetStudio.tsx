"use client";

import { useEffect, useState } from "react";
import { useUiPreferences } from "@/context/UiPreferencesContext";
import type { UiPreferences } from "@/types/music";

type DanceSettings = Pick<UiPreferences, "avatarDancePreset" | "avatarRigProfile" | "avatarAnimationIntensity" | "danceAggression" | "danceVariation" | "danceMotionStyle">;
type SavedProfile = { id: string; name: string; settings: DanceSettings };
const STORAGE_KEY = "sonic-display-dance-studio-v45";
const starterProfiles: SavedProfile[] = [
  { id: "starter-hardstyle", name: "Hardstyle Energy", settings: { avatarDancePreset: "hardstyle", avatarRigProfile: "auto", avatarAnimationIntensity: 1.5, danceAggression: 0.95, danceVariation: 0.7, danceMotionStyle: "sharp" } },
  { id: "starter-hardtekk", name: "Hardtekk Rave", settings: { avatarDancePreset: "hardstyle", avatarRigProfile: "auto", avatarAnimationIntensity: 1.7, danceAggression: 0.9, danceVariation: 0.95, danceMotionStyle: "sharp" } },
  { id: "starter-metal", name: "Metal Headbang", settings: { avatarDancePreset: "rock-metal", avatarRigProfile: "auto", avatarAnimationIntensity: 1.35, danceAggression: 0.85, danceVariation: 0.55, danceMotionStyle: "balanced" } },
  { id: "starter-chill", name: "Smooth Flow", settings: { avatarDancePreset: "ambient", avatarRigProfile: "auto", avatarAnimationIntensity: 0.75, danceAggression: 0.1, danceVariation: 0.65, danceMotionStyle: "smooth" } },
];
function validProfile(value: unknown): value is SavedProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Partial<SavedProfile>;
  const s = profile.settings;
  return typeof profile.id === "string" && typeof profile.name === "string" && profile.name.length <= 60 && !!s &&
    [s.avatarAnimationIntensity, s.danceAggression, s.danceVariation].every(n => typeof n === "number" && Number.isFinite(n)) &&
    typeof s.avatarDancePreset === "string" && typeof s.avatarRigProfile === "string" &&
    ["smooth", "balanced", "sharp"].includes(s.danceMotionStyle ?? "");
}
export function DancePresetStudio() {
  const { preferences, updatePreferences } = useUiPreferences();
  const [profiles, setProfiles] = useState<SavedProfile[]>(starterProfiles);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState(starterProfiles[0].id);
  const [loaded, setLoaded] = useState(false);
  const [message, setMessage] = useState("");
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed: unknown = JSON.parse(stored);
        if (Array.isArray(parsed)) setProfiles([...starterProfiles, ...parsed.filter(validProfile).filter(p => !p.id.startsWith("starter-")).slice(0, 40)]);
      }
    } catch { /* Invalid local storage falls back to starter profiles. */ }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (loaded) localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles.filter(p => !p.id.startsWith("starter-"))));
  }, [loaded, profiles]);
  const save = () => {
    const trimmed = name.trim().slice(0, 60);
    if (!trimmed) { setMessage("Enter a profile name first."); return; }
    const settings: DanceSettings = {
      avatarDancePreset: preferences.avatarDancePreset,
      avatarRigProfile: preferences.avatarRigProfile,
      avatarAnimationIntensity: preferences.avatarAnimationIntensity,
      danceAggression: preferences.danceAggression,
      danceVariation: preferences.danceVariation,
      danceMotionStyle: preferences.danceMotionStyle,
    };
    const id = `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    if (profiles.filter(p => !p.id.startsWith("starter-")).length >= 40) { setMessage("Maximum of 40 custom profiles reached."); return; }
    setProfiles(current => [...current, { id, name: trimmed, settings }]);
    setSelected(id);
    setName("");
    setMessage(`Saved “${trimmed}”.`);
  };
  const active = profiles.find(p => p.id === selected);
  return <fieldset className="dance-preset-studio"><legend>Dance Preset Studio · V45</legend>
    <p className="avatar-editor-help">Save and recall your current dance preset, rig profile and live tuning as one profile. Changes apply immediately to the avatar.</p>
    <label>Saved choreography profile
      <select value={selected} onChange={event => setSelected(event.target.value)}>
        {profiles.map(profile => <option key={profile.id} value={profile.id}>{profile.name}</option>)}
      </select>
    </label>
    {active && <small>{active.settings.avatarDancePreset} · {active.settings.danceMotionStyle} · {active.settings.avatarAnimationIntensity.toFixed(1)}× intensity</small>}
    <div className="avatar-editor-actions">
      <button type="button" disabled={!active} onClick={() => { if (active) { updatePreferences(active.settings); setMessage(`Applied “${active.name}”.`); } }}>Apply profile</button>
      <button type="button" disabled={!active || active.id.startsWith("starter-")} onClick={() => {
        if (!active || active.id.startsWith("starter-")) return;
        setProfiles(current => current.filter(p => p.id !== active.id));
        setSelected(starterProfiles[0].id);
        setMessage(`Deleted “${active.name}”.`);
      }}>Delete custom</button>
    </div>
    <label>New profile name
      <input type="text" maxLength={60} placeholder="e.g. My festival dance" value={name} onChange={event => setName(event.target.value)} />
    </label>
    <button type="button" onClick={save}>Save current dance settings</button>
    {message && <p role="status" className="avatar-editor-help">{message}</p>}
  </fieldset>;
}
