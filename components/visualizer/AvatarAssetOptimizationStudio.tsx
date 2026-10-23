"use client";
import { useState } from "react";
import { inspectGlb, type GlbAssetReport } from "./glbAssetInspector";
const readable = (n: number) => `${(n / 1024 / 1024).toFixed(2)} MB`;
export function AvatarAssetOptimizationStudio() {
  const [report, setReport] = useState<GlbAssetReport | null>(null);
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const analyze = async (file?: File) => {
    if (!file) return;
    setError(""); setReport(null); setFileName(file.name); setBusy(true);
    try { if (file.size > 250 * 1024 * 1024) throw new Error("Datei zu groß für lokale Analyse (>250 MB).");
      setReport(inspectGlb(await file.arrayBuffer()));
    } catch(e) { setError(e instanceof Error ? e.message : "Analyse fehlgeschlagen."); }
    finally { setBusy(false); }
  };
  return <section aria-label="Avatar Asset Optimization Studio" className="render-diagnostics">
    <h3>Avatar Asset Optimization Studio (V125)</h3>
    <p className="settings-note">Untersuche eine GLB-Datei lokal im Browser. Die Datei wird nicht hochgeladen oder verändert. Für die mehrstufige LOD-Erzeugung steht eine lokale CLI-Pipeline im Projekt zur Verfügung. Sie erzeugt separate Dateien, keine direkt in ein GLB eingebetteten LOD-Meshes.</p>
    <label>GLB-Datei auswählen <input type="file" accept=".glb,model/gltf-binary" onChange={e=>void analyze(e.currentTarget.files?.[0])} /></label>
    {busy && <p role="status">GLB wird untersucht …</p>}
    {error && <p role="alert">{error}</p>}
    {report && <div>
      <p><strong>{fileName}</strong> · {readable(report.bytes)}</p>
      <div className="render-diagnostics-grid">
        <div><span>Dreiecke (geschätzt)</span><strong>{report.estimatedTriangles.toLocaleString("de-AT")}</strong></div>
        <div><span>Meshes / Primitive</span><strong>{report.meshes} / {report.primitives}</strong></div>
        <div><span>Materialien / Texturen</span><strong>{report.materials} / {report.textures}</strong></div>
        <div><span>Animationen / Kanäle</span><strong>{report.animations} / {report.animationChannels}</strong></div>
        <div><span>Skins / Nodes</span><strong>{report.skins} / {report.nodes}</strong></div>
        <div><span>Eingebettete Bilder</span><strong>{readable(report.embeddedImageBytes)}</strong></div>
      </div>
      <p className="settings-note">LOD-Familien: {report.lodFamilies.length ? report.lodFamilies.join(", ") : "Keine"}</p>
      {report.warnings.map(w=><p key={w} className="settings-note">⚠ {w}</p>)}
      <p className="settings-note">Dreiecke sind aus Indices/Vertex-Counts geschätzt, nicht gemessene GPU-Draw-Dreiecke. V125 erzeugt über npm run avatar:lod separate LOD0/LOD1/LOD2-Dateien mit Prüfmanifest. Das bestehende V123-System erwartet jedoch LOD-Knoten innerhalb eines Modells; separate Dateien werden noch nicht automatisch umgeschaltet.</p>
      <p className="settings-note">Lokale Pipeline: <code>npm run avatar:lod -- input.glb ./avatar-lods</code>. Benötigt <code>@gltf-transform/cli</code>. Die Originaldatei bleibt unverändert.</p>
    </div>}
  </section>;
}
