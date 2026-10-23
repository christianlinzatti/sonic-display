"use client";
import { useEffect, useState } from "react";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { measureAvatarAnatomy, type AnatomyMeasurement } from "./avatarAnatomyCalibration";

/** Read-only, model-space landmark diagnostics. Never changes or persists the source GLB. */
export function AvatarAnatomyStudio({modelUrl}: {modelUrl: string | null}) {
  const [report, setReport] = useState<AnatomyMeasurement | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    let cancelled = false;
    setReport(null); setError(""); setLoading(Boolean(modelUrl));
    if (!modelUrl) return;
    new GLTFLoader().load(modelUrl, gltf => {
      if (cancelled) return;
      try { setReport(measureAvatarAnatomy(gltf.scene)); }
      catch (e) { setError(e instanceof Error ? e.message : String(e)); }
      finally { setLoading(false); }
    }, undefined, e => { if (!cancelled) { setError(String(e)); setLoading(false); } });
    return () => { cancelled = true; };
  }, [modelUrl]);
  const fmt = (n: number | null) => n === null ? "Nicht messbar" : `${n.toFixed(3)} Modelleinheiten`;
  return <div className="retargeting-studio">
    <p>Automatische Bone-Diagnose für das ausgewählte GLB. Die Werte stammen aus den Skelett-Landmarks; sie sind keine garantierten Körpermaße oder biomechanischen Gelenkgrenzen.</p>
    {!modelUrl ? <p>Bitte einen GLB-Avatar auswählen. Der prozedurale Avatar hat hier keine GLB-Bone-Landmarks.</p> : loading ? <p role="status">Skelett wird analysiert…</p> : error ? <p role="alert">{error}</p> : report ? <>
      <p role="status">{report.detected} von {report.total} Landmark-Typen erkannt.</p>
      <table><tbody>{([
        ["Höhe (Kopf–Fuß)",report.height],["Schulterbreite",report.shoulderWidth],
        ["Armlänge links",report.leftArmLength],["Armlänge rechts",report.rightArmLength],
        ["Beinsegment links",report.leftLegLength],["Beinsegment rechts",report.rightLegLength],
        ["Torso",report.torsoLength]
      ] as [string, number | null][]).map(([name,val]) => <tr key={name}><th scope="row">{name}</th><td>{fmt(val)}</td></tr>)}</tbody></table>
      {report.warnings.map(w => <p key={w} role="status">⚠ {w}</p>)}
      <details><summary>Erkannte Bones &amp; Positionen</summary><div style={{maxHeight:280,overflow:"auto"}}><table><thead><tr><th>Landmark</th><th>Bone</th><th>Position (x / y / z)</th></tr></thead><tbody>{report.landmarks.map(b => <tr key={b.slot}><td>{b.slot}</td><td>{b.bone}</td><td>{b.position.map(n=>n.toFixed(3)).join(" / ")}</td></tr>)}</tbody></table></div></details>
      <button type="button" onClick={() => {
        const blob = new Blob([JSON.stringify({modelUrl, measuredAt:new Date().toISOString(), report},null,2)],{type:"application/json"});
        const link=document.createElement("a"); const url=URL.createObjectURL(blob); link.href=url; link.download="sonic-avatar-anatomy-v151.json"; link.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      }}>Diagnose als JSON exportieren</button>
    </> : null}
  </div>;
}
