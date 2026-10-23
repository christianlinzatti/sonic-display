"use client";
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { aliases, defaultCalibration, humanoidBoneNames, readRetargetCalibration, saveRetargetCalibration, type RetargetCalibration } from "./avatarAnimationRetarget";

export function RetargetingStudio({ modelUrl }: { modelUrl: string | null }) {
  const [bones, setBones] = useState<string[]>([]);
  const [config, setConfig] = useState<RetargetCalibration>(defaultCalibration);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  useEffect(() => { setConfig(modelUrl ? readRetargetCalibration(modelUrl) : defaultCalibration()); setBones([]); setStatus(""); setError(""); }, [modelUrl]);
  useEffect(() => {
    if (!modelUrl) return;
    let cancelled = false;
    setLoading(true);
    new GLTFLoader().load(modelUrl, gltf => {
      if (!cancelled) { setBones(humanoidBoneNames(gltf.scene)); setLoading(false); }
    }, undefined, err => { if (!cancelled) { setError(String(err)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [modelUrl]);
  const save = (next: RetargetCalibration) => { if (!modelUrl) return; try { saveRetargetCalibration(modelUrl, next); setConfig(next); setStatus("Kalibrierung lokal gespeichert und auf Live-Avatar und Vorschau angewendet."); } catch(e) { setError(String(e)); } };
  return <div className="retargeting-studio">
    <p>Individuelle Bone-Zuordnung und Rotationsoffsets für importierte GLB-Animationen. Die Zuordnung wird pro Avatar im Browser gespeichert. Originaldateien bleiben unverändert.</p>
    {!modelUrl ? <p>Für den Procedural-Avatar ist keine GLB-Retarget-Kalibrierung verfügbar.</p> : <>
      <label><input type="checkbox" checked={config.enabled} onChange={e => save({...config, enabled:e.target.checked})}/> Kalibrierung aktiv</label>
      <p>{loading ? "Lade Skelett…" : `${bones.length} Bones erkannt`}</p>
      <div style={{ maxHeight: 430, overflowY: "auto", overflowX: "auto" }}><table><thead><tr><th>Humanoid-Bone</th><th>Ziel-Bone</th><th>Offset X°</th><th>Y°</th><th>Z°</th></tr></thead><tbody>
      {Object.keys(aliases).map(key => <tr key={key}><td>{key}</td><td><select aria-label={`${key} Ziel-Bone`} value={config.mapping[key] ?? ""} onChange={e => save({...config, mapping: {...config.mapping, [key]:e.target.value}})}><option value="">Automatisch</option>{bones.map(name => <option key={name} value={name}>{name}</option>)}</select></td>{([0,1,2] as const).map(axis => <td key={axis}><input aria-label={`${key} Winkel ${axis}`} type="number" min={-180} max={180} step={1} style={{width:65}} value={(config.rotation[key] ?? [0,0,0])[axis]} onChange={e => { const value = Number(e.target.value); if (!Number.isFinite(value) || Math.abs(value)>180) return; const rotation = [...(config.rotation[key] ?? [0,0,0])] as [number,number,number]; rotation[axis]=value; save({...config, rotation:{...config.rotation,[key]:rotation}}); }}/></td>)}</tr>)}
      </tbody></table></div>
      <button type="button" onClick={() => save(defaultCalibration())}>Kalibrierung zurücksetzen</button>
      <button type="button" onClick={() => { const blob = new Blob([JSON.stringify(config, null, 2)], {type:"application/json"}); const url = URL.createObjectURL(blob); const link=document.createElement("a"); link.href=url; link.download="sonic-retarget-v103.json"; link.click(); URL.revokeObjectURL(url); }}>JSON exportieren</button>
      <label>JSON importieren <input type="file" accept=".json,application/json" onChange={async e => { const file=e.target.files?.[0]; if (!file) return; try { const parsed=JSON.parse(await file.text()); if (typeof parsed.enabled!=="boolean" || !parsed.mapping || !parsed.rotation) throw Error("Ungültiges Kalibrierungsformat"); const clean = {enabled:parsed.enabled, mapping: Object.fromEntries(Object.entries(parsed.mapping).filter(([k,v]) => k in aliases && typeof v==="string" && (v as string).length<180)), rotation:Object.fromEntries(Object.entries(parsed.rotation).filter(([k,v]) => k in aliases && Array.isArray(v) && v.length===3 && v.every(x=>typeof x==="number" && Number.isFinite(x) && Math.abs(x)<=180)))} as RetargetCalibration; save(clean); } catch(err) {setError(String(err));} e.target.value=""; }}/></label>
      {status && <p role="status">{status}</p>}{error && <p role="alert">{error}</p>}
      <small>Quaternion-Offsets sind lokale Nachkorrekturen, keine vollständige biomechanische Skelett-Neuausrichtung. Nur importierte Quaternion-Spuren sind betroffen.</small>
    </>}
  </div>;
}
