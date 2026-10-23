import { sanitizeLightingPreset, type LightingPreset } from "./predictiveLighting";

/** V178: explicit snapshots, bounded local history, and validated portable JSON. */
export const PRESET_LIBRARY_KEY = "sonic-display:lighting-preset-library-v178";
export const PRESET_LIBRARY_CHANGED = "sonic-display:lighting-preset-library-changed";
export type PresetRevision = { revision: number; savedAt: string; preset: LightingPreset };
export type PresetLibraryEntry = { id: string; name: string; genre: string; revisions: PresetRevision[] };
export type PresetLibrary = { version: 1; entries: PresetLibraryEntry[] };
export const EMPTY_PRESET_LIBRARY: PresetLibrary = { version: 1, entries: [] };
const text = (value: unknown, size: number) => typeof value === "string" ? value.trim().slice(0,size) : "";
const record = (x: unknown): x is Record<string,unknown> => x !== null && typeof x === "object" && !Array.isArray(x);
const MAX_ENTRIES = 64;
const MAX_REVISIONS = 25;
export function sanitizePresetLibrary(value: unknown): PresetLibrary {
  if (!record(value) || value.version !== 1 || !Array.isArray(value.entries)) return {version:1,entries:[]};
  const entries: PresetLibraryEntry[] = [];
  const seen = new Set<string>();
  for (const raw of value.entries.slice(0, MAX_ENTRIES)) {
    if (!record(raw)) continue;
    const id = text(raw.id, 64), name = text(raw.name, 48), genre = text(raw.genre, 48);
    if (!id || !name || seen.has(id) || !Array.isArray(raw.revisions)) continue;
    const revisions: PresetRevision[] = [];
    for (const revision of raw.revisions.slice(-MAX_REVISIONS)) {
      if (!record(revision) || !record(revision.preset)) continue;
      const n = Number(revision.revision);
      if (!Number.isSafeInteger(n) || n < 1 || n > 10000000) continue;
      const savedAt = text(revision.savedAt, 40);
      if (!Number.isFinite(Date.parse(savedAt))) continue;
      revisions.push({revision:n,savedAt,preset:sanitizeLightingPreset(revision.preset)});
    }
    revisions.sort((a,b)=>a.revision-b.revision);
    if (!revisions.length) continue;
    seen.add(id);
    entries.push({id,name,genre,revisions});
  }
  return {version:1,entries};
}
export function addPresetRevision(library: PresetLibrary, id: string, name: string, genre: string, preset: LightingPreset, now = new Date()): PresetLibrary {
  const safe = sanitizePresetLibrary(library);
  const safeId = text(id,64), safeName=text(name,48), safeGenre=text(genre,48);
  if (!safeId || !safeName || !Number.isFinite(now.getTime())) return safe;
  const old = safe.entries.find(entry=>entry.id===safeId);
  const revision = (old?.revisions.at(-1)?.revision ?? 0) + 1;
  const revisions = [...(old?.revisions??[]),{revision,savedAt:now.toISOString(),preset:sanitizeLightingPreset(preset)}].slice(-MAX_REVISIONS);
  return sanitizePresetLibrary({version:1,entries:[...safe.entries.filter(e=>e.id!==safeId),{id:safeId,name:safeName,genre:safeGenre,revisions}].slice(-MAX_ENTRIES)});
}
export function deletePresetEntry(library:PresetLibrary,id:string):PresetLibrary {
  return sanitizePresetLibrary({...library,entries:library.entries.filter(e=>e.id!==id)});
}
/** Recover revision content as a draft; saving always creates a NEW revision. */
export function restorePresetRevision(library: PresetLibrary,id:string,revision:number): LightingPreset|null {
  const found=sanitizePresetLibrary(library).entries.find(e=>e.id===id)?.revisions.find(r=>r.revision===revision);
  return found ? {...found.preset} : null;
}
export function exportPresetLibrary(library:PresetLibrary):string {return JSON.stringify(sanitizePresetLibrary(library),null,2);}
export function importPresetLibrary(json:string):PresetLibrary {
  if (json.length > 1024*1024) throw new Error("JSON-Datei zu groß (maximal 1 MB)");
  let data:unknown;
  try {data=JSON.parse(json);} catch {throw new Error("Ungültiges JSON");}
  if (!record(data) || data.version!==1 || !Array.isArray(data.entries)) throw new Error("Unbekanntes Bibliotheksformat");
  return sanitizePresetLibrary(data);
}
export function loadPresetLibrary():PresetLibrary {
  if (typeof window==="undefined") return {version:1,entries:[]};
  try {return sanitizePresetLibrary(JSON.parse(window.localStorage.getItem(PRESET_LIBRARY_KEY)||"null"));}catch{return {version:1,entries:[]};}
}
export function savePresetLibrary(library:PresetLibrary):boolean {
  if (typeof window==="undefined") return false;
  try {window.localStorage.setItem(PRESET_LIBRARY_KEY,exportPresetLibrary(library));window.dispatchEvent(new Event(PRESET_LIBRARY_CHANGED));return true;}catch{return false;}
}
