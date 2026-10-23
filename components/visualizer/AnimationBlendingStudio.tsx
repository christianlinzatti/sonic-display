"use client";
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useUiPreferences } from "@/context/UiPreferencesContext";

export function AnimationBlendingStudio({ modelUrl, animationUrl }: { modelUrl: string | null; animationUrl?: string }) {
  const { preferences, updatePreferences } = useUiPreferences();
  const [names, setNames] = useState<string[]>([]);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const loader = new GLTFLoader();
    setNames([]); setError("");
    if (!modelUrl) return;
    // Keep the exact naming scheme used by GltfAvatar: embedded first, then imported.
    Promise.all([
      loader.loadAsync(modelUrl),
      animationUrl ? loader.loadAsync(animationUrl) : Promise.resolve(null),
    ]).then(([model, imported]) => {
      if (cancelled) return;
      setNames([...model.animations.map(c => c.name), ...(imported?.animations ?? []).map(c => `Imported: ${c.name}`)]);
    }).catch(() => { if (!cancelled) setError("Clips konnten nicht geladen werden. Prüfe Modell-URL und CORS."); });
    return () => { cancelled = true; };
  }, [modelUrl, animationUrl]);
  const enabled = preferences.avatarBlendEnabled ?? false;
  return <fieldset><legend>Intelligent Motion Blending Studio · V104</legend>
    <p>Lege einen zweiten GLB-Animationsclip über die Hauptanimation. Wirkt live in der Avatar-Bühne, sofern keine gespeicherte Choreografie aktiv ist.</p>
    <label className="setting-check"><input type="checkbox" checked={enabled} onChange={e => updatePreferences({ avatarBlendEnabled: e.target.checked })}/> Zweiten Animationsclip überlagern</label>
    <label>Zweiter Clip<select disabled={!enabled || names.length < 2} value={names.includes(preferences.avatarBlendClip) ? preferences.avatarBlendClip : ""} onChange={e => updatePreferences({ avatarBlendClip: e.target.value })}>
      <option value="">Animation auswählen</option>{names.map((name,i) => <option key={`${name}-${i}`} value={name}>{name}</option>)}
    </select></label>
    <label>Bone-Masking<select disabled={!enabled} value={preferences.avatarBlendMask ?? "full"} onChange={e => updatePreferences({ avatarBlendMask: e.target.value as "full" | "upper" | "arms" | "lower" })}>
      <option value="full">Ganzer Körper (V98)</option>
      <option value="arms">Nur Arme und Hände</option>
      <option value="upper">Oberkörper, Arme und Kopf</option>
      <option value="lower">Nur Beine und Füße</option>
    </select></label>
    <label>Blend-Gewichtung ({Math.round((preferences.avatarBlendWeight ?? 0.3)*100)} %)<input disabled={!enabled} type="range" min="0" max="0.85" step="0.05" value={preferences.avatarBlendWeight ?? 0.3} onChange={e => updatePreferences({ avatarBlendWeight: Number(e.target.value) })}/></label>
    <label>Tempo des zweiten Clips ({(preferences.avatarBlendSpeed ?? 1).toFixed(2)}×)<input disabled={!enabled} type="range" min="0.25" max="2" step="0.05" value={preferences.avatarBlendSpeed ?? 1} onChange={e => updatePreferences({ avatarBlendSpeed: Number(e.target.value) })}/></label>
    <fieldset><legend>V104 · Musikadaptives Blending</legend>
      <label className="setting-check"><input type="checkbox" checked={preferences.avatarBlendAutoEnergy ?? false} onChange={e => updatePreferences({avatarBlendAutoEnergy:e.target.checked})}/> Überlagerung dynamisch an Audioenergie anpassen</label>
      <label>Übergangskurve<select value={preferences.avatarBlendCurve ?? "smooth"} onChange={e => updatePreferences({avatarBlendCurve:e.target.value as "linear" | "smooth" | "ease-in" | "ease-out"})}>
        <option value="smooth">Smoothstep</option><option value="linear">Linear</option><option value="ease-in">Ease in</option><option value="ease-out">Ease out</option>
      </select></label>
      <label>Gewicht-Glättung ({(preferences.avatarBlendSmoothing ?? 0.28).toFixed(2)} s Halbwertszeit)<input type="range" min="0" max="1.2" step="0.02" value={preferences.avatarBlendSmoothing ?? 0.28} onChange={e => updatePreferences({avatarBlendSmoothing:Number(e.target.value)})}/></label>
      <label className="setting-check"><input type="checkbox" checked={preferences.avatarBlendBpmSync ?? false} onChange={e => updatePreferences({avatarBlendBpmSync:e.target.checked})}/> Overlay-Tempo anhand der erkannten BPM synchronisieren</label>
      <label>Original-BPM des Animationsclips ({preferences.avatarBlendReferenceBpm ?? 120})<input type="number" min="60" max="240" step="1" value={preferences.avatarBlendReferenceBpm ?? 120} onChange={e => updatePreferences({avatarBlendReferenceBpm:Math.max(60,Math.min(240,Number(e.target.value)||120))})}/></label>
      <small>BPM-Synchronisation setzt voraus, dass die Original-BPM des Clips bekannt sind. Ohne zuverlässigen BPM-Wert bleibt das manuelle Clip-Tempo aktiv. Energieanpassung und BPM-Sync sind optional.</small>
    </fieldset>
    <button type="button" onClick={() => updatePreferences({ avatarBlendEnabled: false, avatarBlendClip: "", avatarBlendWeight: 0.3, avatarBlendSpeed: 1, avatarBlendMask: "full", avatarBlendAutoEnergy: false, avatarBlendBpmSync: false, avatarBlendReferenceBpm: 120, avatarBlendSmoothing: 0.28, avatarBlendCurve: "smooth" })}>Blending zurücksetzen</button>
    {error && <small role="status">{error}</small>}
    {modelUrl && names.length < 2 && !error && <small>Für Blending sind mindestens zwei Animationsclips nötig.</small>}
    <small>Bone-Masking filtert Animationsspuren nach bekannten humanoiden Bone-Namen. Nicht erkannte Spuren bleiben unverändert in der Hauptanimation. Bei aktiven Choreografien hat der Smart Dance Director Vorrang.</small>
  </fieldset>;
}
