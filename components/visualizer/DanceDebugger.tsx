"use client";

import { useEffect, useState } from "react";
import { DEFAULT_LAYER_WEIGHTS, DEFAULT_MOTION_DEBUG, readMotionDebugSettings, setMotionDebugSettings, configureMotionAutoPresets, transitionToMotionPreset, configureMotionMorphDuration, MORPH_DURATION_STORAGE_KEY, MOTION_DEBUG_EVENT, type MotionDebugLayer } from "./motionDebugControls";
import { BUILTIN_MOTION_PRESETS, MOTION_AUTO_STORAGE_KEY, MOTION_PRESET_STORAGE_KEY, normalizePreset, parsePresetImport, type MotionLayerPreset, type PresetGenre } from "./motionLayerPresets";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { diagnoseAvatarRig, type RigDiagnosticReport } from "./avatarRigDiagnostics";

export function DanceDebugger({ modelUrl, animationUrl }: { modelUrl: string | null; animationUrl?: string }) {
  const [debug, setDebug] = useState(() => readMotionDebugSettings());
  const [presets, setPresets] = useState<MotionLayerPreset[]>(BUILTIN_MOTION_PRESETS);
  const [auto, setAuto] = useState(false);
  const [morphSeconds, setMorphSeconds] = useState(2.5);
  const [presetName, setPresetName] = useState("");
  const [presetGenre, setPresetGenre] = useState<PresetGenre>("deutschrap");
  const [selectedPreset, setSelectedPreset] = useState("built-in-rap");
  const [presetMessage, setPresetMessage] = useState("");
  useEffect(() => {
    try {
      const raw=localStorage.getItem(MOTION_PRESET_STORAGE_KEY);
      if(raw) {
        const values: unknown = JSON.parse(raw);
        if (Array.isArray(values)) setPresets([...BUILTIN_MOTION_PRESETS,...values.map(normalizePreset).filter((x):x is MotionLayerPreset=>!!x).slice(0,40)]);
      }
      setAuto(localStorage.getItem(MOTION_AUTO_STORAGE_KEY)==="true");
      const saved = Number(localStorage.getItem(MORPH_DURATION_STORAGE_KEY));
      if (localStorage.getItem(MORPH_DURATION_STORAGE_KEY) !== null && Number.isFinite(saved)) setMorphSeconds(Math.max(0,Math.min(12,saved)));
    } catch { setPresetMessage("Gespeicherte Presets konnten nicht gelesen werden."); }
  }, []);
  useEffect(() => { configureMotionAutoPresets(presets,auto); }, [presets,auto]);
  useEffect(() => { configureMotionMorphDuration(morphSeconds); }, [morphSeconds]);
  useEffect(() => { const sync = () => setDebug(readMotionDebugSettings()); window.addEventListener(MOTION_DEBUG_EVENT, sync); return () => window.removeEventListener(MOTION_DEBUG_EVENT, sync); }, []);
  const persist = (values: MotionLayerPreset[]) => {
    setPresets(values);
    try {localStorage.setItem(MOTION_PRESET_STORAGE_KEY, JSON.stringify(values.filter(p=>p.id.startsWith("custom-"))));}
    catch {setPresetMessage("Speichern im Browser fehlgeschlagen.");}
  };
  const savePreset = () => {
    const title=presetName.trim().slice(0,60);
    if (!title) {setPresetMessage("Bitte einen Namen eingeben.");return;}
    if (presets.filter(p=>p.id.startsWith("custom-")).length>=40) {setPresetMessage("Maximal 40 eigene Presets.");return;}
    const candidate=normalizePreset({id:`custom-${Date.now()}`,name:title,genre:presetGenre,weights:{...DEFAULT_LAYER_WEIGHTS,...debug.weights}});
    if (!candidate) return;
    persist([...presets,candidate]);setSelectedPreset(candidate.id);setPresetName("");setPresetMessage(`Preset „${title}“ gespeichert.`);
  };
  const downloadPresets = () => {
    const blob=new Blob([JSON.stringify(presets.filter(p=>p.id.startsWith("custom-")),null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;a.download="sonic-motion-presets-v119.json";a.click();URL.revokeObjectURL(url);
  };
  const [report, setReport] = useState<RigDiagnosticReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [requested, setRequested] = useState(0);
  useEffect(() => { setReport(null); setError(""); setRequested(0); }, [modelUrl, animationUrl]);
  useEffect(() => {
    if (requested === 0 || !modelUrl) return;
    let cancelled = false;
    const loader = new GLTFLoader();
    const load = (url: string) => new Promise<Awaited<ReturnType<typeof loader.loadAsync>>>((resolve, reject) => loader.load(url, resolve, undefined, reject));
    setLoading(true); setError(""); setReport(null);
    (async () => {
      try {
        const avatar = await load(modelUrl);
        const imported = animationUrl ? await load(animationUrl) : null;
        if (!cancelled) {
          const embedded = diagnoseAvatarRig(avatar.scene, avatar.animations);
          const external = imported ? diagnoseAvatarRig(avatar.scene, imported.animations, imported.scene) : null;
          setReport(external ? {
            ...embedded,
            clips: [...embedded.clips.map(c => ({...c, name: `Eingebettet: ${c.name}`})), ...external.clips.map(c => ({...c, name: `Importiert: ${c.name}`}))],
            findings: [...embedded.findings.filter(f => !f.title.startsWith("Keine Animationsclips") && f.title !== "Foot Sliding"),
              ...external.findings.filter(f => !f.title.startsWith("Linkes Bein") && !f.title.startsWith("Rechtes Bein") && f.title !== "Skelett erkannt" && f.title !== "Foot Sliding") ,
              { severity: "info" as const, title: "Foot Sliding", detail: "Nur im animierten Vorher/Nachher-Vergleich messbar; eine statische Analyse kann kein Fußgleiten bestätigen." }],
          } : embedded);
        }
      } catch (e) { if (!cancelled) setError(e instanceof Error ? e.message : "GLB konnte nicht gelesen werden"); }
      finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [modelUrl, animationUrl, requested]);
  return <div className="dance-debugger">
    <p>Untersucht das ausgewählte Avatar-GLB und die zugewiesene Animationsdatei. Es werden keine Dateien verändert oder hochgeladen.</p>
    {!modelUrl ? <p role="status">Der Procedural-Avatar besitzt kein importiertes humanoides Skelett. Wähle einen GLB-Avatar aus.</p> : <button type="button" disabled={loading} onClick={() => setRequested(n => n + 1)}>{loading ? "Analysiere GLB…" : report ? "Erneut analysieren" : "Avatar und Animation analysieren"}</button>}
    {error && <p role="alert">Analyse fehlgeschlagen: {error}. Prüfe die URL, CORS und ob das Modell gültiges GLB/GLTF ist.</p>}
    <fieldset style={{marginTop:16, padding:12, border:"1px solid #555", borderRadius:8}}><legend>V118 Motion Layer Mixer</legend>
      <p>Die Schalter wirken auf den importierten GLB-Avatar in der laufenden 3D-Szene (nur diese Browser-Sitzung).</p>
      <label style={{display:"block", marginBottom:8}}><input type="checkbox" checked={debug.skeleton} onChange={e => { const next={...debug,skeleton:e.target.checked}; setDebug(next); setMotionDebugSettings(next); }} /> Skelett-Overlay anzeigen</label>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))",gap:8}}>{(Object.keys(debug.layers) as MotionDebugLayer[]).map(layer => <label key={layer}><input type="checkbox" checked={debug.layers[layer]} onChange={e => { const next={...debug,layers:{...debug.layers,[layer]:e.target.checked}};setDebug(next);setMotionDebugSettings(next);}} /> {layer}</label>)}</div>
      <div style={{display:"grid",gap:10,marginTop:16}}>{(Object.keys(debug.layers) as MotionDebugLayer[]).map(layer => <label key={layer} style={{display:"grid",gap:4}}><span>{layer}: {Math.round((debug.weights?.[layer] ?? 1)*100)}%</span><input type="range" min="0" max="150" step="5" value={Math.round((debug.weights?.[layer] ?? 1)*100)} disabled={!debug.layers[layer]} onChange={e => {const next={...debug,weights:{...DEFAULT_LAYER_WEIGHTS,...debug.weights,[layer]:Number(e.target.value)/100}};setDebug(next);setMotionDebugSettings(next);}} /></label>)}</div>
      <button type="button" style={{marginTop:10}} onClick={() => {const next={skeleton:DEFAULT_MOTION_DEBUG.skeleton,layers:{...DEFAULT_MOTION_DEBUG.layers},weights:{...DEFAULT_LAYER_WEIGHTS}};setDebug(next);setMotionDebugSettings(next);}}>Alle Ebenen aktivieren / Overlay aus</button>
      <small style={{display:"block",marginTop:8}}>Die Schalter isolieren additive Gelenkbewegungen; importierte Animationsclips bleiben aktiv. Bone-Darstellung basiert auf den tatsächlichen GLB-Knochen.</small>
    </fieldset>
    <fieldset style={{marginTop:16,padding:12,border:"1px solid #555",borderRadius:8}}><legend>V119 Dance Preset Studio · Motion Layers</legend>
      <p>Eigene Motion-Layer-Mischungen dauerhaft speichern und einem Genre zuordnen. Die automatische Auswahl verwendet verfügbare Spotify-Genreinformationen.</p>
      <label style={{display:"block",margin:"10px 0"}}>V120 Überblenddauer: {morphSeconds.toFixed(1)} Sekunden <input type="range" min="0" max="12" step="0.5" value={morphSeconds} onChange={e=>{const n=Number(e.target.value);setMorphSeconds(n);try{localStorage.setItem(MORPH_DURATION_STORAGE_KEY,String(n));}catch{setPresetMessage("Überblenddauer konnte nicht gespeichert werden.");}}} /></label>
      <label><input type="checkbox" checked={auto} onChange={e=>{setAuto(e.target.checked);try{localStorage.setItem(MOTION_AUTO_STORAGE_KEY,String(e.target.checked));}catch{setPresetMessage("Automatik konnte nicht gespeichert werden.");}}}/> Automatisch nach Genre anwenden</label>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
        <select aria-label="Dance Preset" value={selectedPreset} onChange={e=>setSelectedPreset(e.target.value)}>{presets.map(p=><option key={p.id} value={p.id}>{p.name} ({p.genre})</option>)}</select>
        <button type="button" onClick={()=>{const found=presets.find(p=>p.id===selectedPreset);if(found){transitionToMotionPreset(found);setPresetMessage(`„${found.name}“ wird weich überblendet.`);}}}>Preset anwenden</button>
        <button type="button" disabled={!selectedPreset.startsWith("custom-")} onClick={()=>{persist(presets.filter(p=>p.id!==selectedPreset));setSelectedPreset(BUILTIN_MOTION_PRESETS[0].id);}}>Löschen</button>
      </div>
      <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
        <input aria-label="Presetname" placeholder="Neuer Presetname" maxLength={60} value={presetName} onChange={e=>setPresetName(e.target.value)}/>
        <select aria-label="Genre" value={presetGenre} onChange={e=>setPresetGenre(e.target.value as PresetGenre)}>{(["deutschrap","trap","hiphop","hardstyle","hardtekk","techno","any"] as PresetGenre[]).map(g=><option key={g} value={g}>{g}</option>)}</select>
        <button type="button" onClick={savePreset}>Aktuelle Regler speichern</button>
      </div>
      <div style={{display:"flex",gap:8,marginTop:10,flexWrap:"wrap"}}>
        <button type="button" onClick={downloadPresets}>JSON exportieren</button>
        <label>JSON importieren <input type="file" accept=".json,application/json" onChange={async e=>{const file=e.target.files?.[0];if(!file)return;try{if(file.size>100000)throw Error("Datei ist zu groß.");const values=parsePresetImport(await file.text());persist([...BUILTIN_MOTION_PRESETS,...presets.filter(p=>p.id.startsWith("custom-")),...values].filter((p,i,a)=>a.findIndex(x=>x.id===p.id)===i).slice(0,46));setPresetMessage(`${values.length} Presets importiert.`);}catch(err){setPresetMessage(err instanceof Error?err.message:"Import fehlgeschlagen");}e.target.value="";}}/></label>
      </div>
      {presetMessage && <p role="status">{presetMessage}</p>}
      <small>Automatik greift nur bei bekannten Genres; manuelle Layer-Schalter bleiben erhalten. Änderungen eines Songs werden in der Avatar-Komponente erkannt.</small>
    </fieldset>
    {report && <>
      <p><strong>{report.boneCount} Bones</strong> · {report.skinnedMeshes} Skinned Meshes · {report.clips.length} Animationsclips</p>
      <ul>{report.findings.map((item, i) => <li key={i}><strong>{item.severity === "warning" ? "⚠ " : item.severity === "good" ? "✓ " : "ℹ "}{item.title}:</strong> {item.detail}</li>)}</ul>
      {report.clips.length > 0 && <div style={{ overflowX: "auto" }}><table><thead><tr><th>Clip</th><th>Dauer</th><th>Spuren</th><th>Namentlich zugeordnet</th></tr></thead><tbody>{report.clips.map((clip,i) => <tr key={i}><td>{clip.name}</td><td>{clip.duration.toFixed(2)} s</td><td>{clip.tracks}</td><td>{clip.matched}/{clip.tracks}</td></tr>)}</tbody></table></div>}
      <small>Die Spurprüfung ist eine heuristische Namensanalyse, kein Beweis für korrektes Playback oder physikalisch richtigen Bodenkontakt. Bei gemischten eingebetteten/importierten Clips können einzelne Warnungen ungenau sein.</small>
    </>}
  </div>;
}
