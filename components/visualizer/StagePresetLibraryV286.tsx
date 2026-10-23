"use client";

import { useEffect, useRef, useState } from "react";
import { isStageEnvironmentId, type StageEnvironmentId } from "@/components/visualizer/stages";

type StageSettings = { stageTheme: StageEnvironmentId; stageReactive: boolean; stageLightStrength: number };
type Preset = StageSettings & { id: string; name: string };
const STORAGE_KEY = "sonic-display-stage-presets-v286";
const MAX_PRESETS = 40;
const BUILT_INS: readonly Preset[] = [
  { id: "builtin-festival", name: "Hardtekk Mainstage", stageTheme: "festival", stageReactive: true, stageLightStrength: 100 },
  { id: "builtin-cyber", name: "Industrial Rave", stageTheme: "cyberpunk", stageReactive: true, stageLightStrength: 85 },
  { id: "builtin-rap", name: "Deutschrap Studio", stageTheme: "white", stageReactive: true, stageLightStrength: 65 },
  { id: "builtin-night", name: "Midnight Galaxy", stageTheme: "galaxy", stageReactive: true, stageLightStrength: 45 },
  { id: "builtin-chill", name: "Chill Sunset", stageTheme: "vaporwave", stageReactive: false, stageLightStrength: 35 },
];

function isRecord(v: unknown): v is Record<string, unknown> { return typeof v === "object" && v !== null && !Array.isArray(v); }
function validatePreset(v: unknown): Preset | null {
  if (!isRecord(v) || typeof v.id !== "string" || typeof v.name !== "string" || !isStageEnvironmentId(v.stageTheme) || typeof v.stageReactive !== "boolean" || typeof v.stageLightStrength !== "number" || !Number.isFinite(v.stageLightStrength)) return null;
  const name = v.name.trim().slice(0, 60);
  if (!name) return null;
  return { id: v.id.slice(0, 100), name, stageTheme: v.stageTheme, stageReactive: v.stageReactive, stageLightStrength: Math.max(0, Math.min(100, Math.round(v.stageLightStrength))) };
}
function decode(input: unknown): Preset[] {
  if (!Array.isArray(input)) return [];
  const used = new Set<string>();
  return input.slice(0, MAX_PRESETS).map(validatePreset).filter((p): p is Preset => {
    if (!p || !p.id.startsWith("custom-") || used.has(p.id)) return false;
    used.add(p.id); return true;
  });
}
function readSaved(): Preset[] { try { return decode(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { return []; } }

export function StagePresetLibraryV286({ current, onApply }: { current: StageSettings; onApply: (next: StageSettings) => void }) {
  const [saved, setSaved] = useState<Preset[]>([]);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);
  useEffect(() => { setSaved(readSaved()); }, []);
  const persist = (items: Preset[]) => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); setSaved(items); return true; } catch { setMessage("Speichern im Browser ist nicht verfügbar."); return false; } };
  const add = () => {
    const title = name.trim().slice(0, 60);
    if (!title) { setMessage("Bitte einen Namen eingeben."); return; }
    if (saved.length >= MAX_PRESETS) { setMessage(`Maximal ${MAX_PRESETS} eigene Presets möglich.`); return; }
    const preset: Preset = { ...current, id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`, name: title };
    if (persist([...saved, preset])) { setName(""); setMessage(`„${title}“ gespeichert.`); }
  };
  const apply = (preset: Preset) => { onApply({ stageTheme: preset.stageTheme, stageReactive: preset.stageReactive, stageLightStrength: preset.stageLightStrength }); setMessage(`„${preset.name}“ aktiviert.`); };
  const remove = (preset: Preset) => { if (persist(saved.filter(item => item.id !== preset.id))) setMessage(`„${preset.name}“ gelöscht.`); };
  const exportPresets = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ format: "sonic-stage-presets", version: 1, presets: saved }, null, 2)], { type: "application/json" }));
    const anchor = document.createElement("a"); anchor.href = url; anchor.download = "sonic-display-stage-presets.json"; anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importPresets = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > 256_000) throw Error("Datei zu groß (maximal 256 kB).");
      const data: unknown = JSON.parse(await file.text());
      if (!isRecord(data) || data.format !== "sonic-stage-presets" || data.version !== 1 || !Array.isArray(data.presets)) throw Error("Kein unterstütztes Bühnen-Preset-Format.");
      const incoming = decode(data.presets);
      const combined = [...saved]; const existing = new Set(saved.map(p => p.id));
      for (const item of incoming) { if (combined.length >= MAX_PRESETS) break; if (!existing.has(item.id)) { combined.push(item); existing.add(item.id); } }
      if (persist(combined)) setMessage(`${combined.length - saved.length} neue Presets importiert.`);
    } catch (error) { setMessage(error instanceof Error ? error.message : "Import fehlgeschlagen."); }
    finally { if (fileRef.current) fileRef.current.value = ""; }
  };
  return <fieldset className="stage-preset-library-v286"><legend>Bühnen-Presets · V286</legend>
    <p>Speichere deine Kombination aus Bühnenstil und Lichtreaktion oder wähle einen sofort nutzbaren Look.</p>
    <div className="stage-preset-v286-grid">{BUILT_INS.map(preset => <button type="button" key={preset.id} onClick={() => apply(preset)}><strong>{preset.name}</strong><small>{preset.stageTheme} · {preset.stageLightStrength}% Licht</small></button>)}</div>
    <label>Eigenes Bühnen-Preset benennen<input value={name} maxLength={60} onChange={e => setName(e.target.value)} placeholder="z. B. Mein Festival-Set" /></label>
    <button type="button" onClick={add}>Aktuelle Bühne als Preset speichern</button>
    {saved.length > 0 && <div className="stage-preset-v286-saved" role="list" aria-label="Eigene Bühnen-Presets">{saved.map(preset => <div role="listitem" key={preset.id} className="stage-preset-v286-entry"><span><strong>{preset.name}</strong><small>{preset.stageTheme} · {preset.stageLightStrength}% · {preset.stageReactive ? "Musikreaktiv" : "Statisch"}</small></span><button type="button" onClick={() => apply(preset)}>Anwenden</button><button type="button" onClick={() => remove(preset)} aria-label={`${preset.name} löschen`}>Löschen</button></div>)}</div>}
    <div className="stage-preset-v286-actions"><button type="button" onClick={exportPresets}>Presets exportieren</button><label>Presets importieren<input ref={fileRef} type="file" accept=".json,application/json" onChange={e => { void importPresets(e.target.files?.[0]); }} /></label></div>
    <small role="status" aria-live="polite">{message || "Eigene Presets werden lokal in diesem Browser gespeichert."}</small>
  </fieldset>;
}
