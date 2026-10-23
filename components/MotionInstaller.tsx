"use client";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import type { AvatarModel } from "@/components/visualizer/avatarModels";

type Props = { admin: boolean; blobEnabled: boolean; models: AvatarModel[]; selectedId: string; onInstalled: () => Promise<void> };

/** A one-step import/assignment UI: no hand-edited JSON or URL required. */
export function MotionInstaller({ admin, blobEnabled, models, selectedId, onInstalled }: Props) {
  const usable = models.filter(model => model.id !== "procedural" && Boolean(model.url));
  const [target, setTarget] = useState(selectedId);
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [confirmReplace, setConfirmReplace] = useState(false);
  const model = usable.find(x => x.id === target) ?? usable[0];
  const existing = Boolean(model?.animationUrl);

  async function install() {
    if (!admin || !file || !model || busy) return;
    setBusy(true);
    setStatus("");
    try {
      if (!/\.glb$/i.test(file.name) || file.size < 20 || file.size > 35 * 1024 * 1024) {
        throw new Error("Eine Animations-GLB mit höchstens 35 MB auswählen.");
      }
      // Prevent uploading arbitrary content with just a .glb suffix.
      const signature = new TextDecoder().decode(await file.slice(0, 4).arrayBuffer());
      if (signature !== "glTF") throw new Error("Keine gültige GLB-Datei (glTF-Signatur fehlt).");
      if (existing && !confirmReplace) throw new Error("Bitte zuerst das Ersetzen der bisherigen Motion bestätigen.");
      let url: string;
      if (blobEnabled) {
        const name = file.name.replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 50) || "motion";
        const result = await upload(`sonic/animations/${name}-${crypto.randomUUID()}.glb`, file, {
          access: "public", handleUploadUrl: "/api/avatars/upload", contentType: "model/gltf-binary"
        });
        if (!result.url) throw new Error("Upload fehlgeschlagen");
        url = result.url;
      } else {
        const form = new FormData();
        form.set("file", file);
        const response = await fetch("/api/avatars/animations/import", { method: "POST", body: form });
        const data: { url?: string; error?: string } = await response.json();
        if (!response.ok || !data.url) throw new Error(data.error || "Upload fehlgeschlagen");
        url = data.url;
      }
      const response = await fetch("/api/avatars/animations/install", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ modelId: model.id.startsWith("local:") ? model.id : `default:${model.id}`, animationUrl: url })
      });
      const result: { error?: string } = await response.json();
      if (!response.ok) throw new Error(result.error || "Zuordnung fehlgeschlagen. Hochgeladene Datei bleibt erhalten.");
      await onInstalled();
      setFile(null); setConfirmReplace(false);
      setStatus(`Motion installiert und mit ${model.label} verknüpft. Keine Konfigurationsdatei erforderlich.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Installation fehlgeschlagen"); }
    finally { setBusy(false); }
  }

  return <section className="avatar-metadata-editor" aria-label="Motion Installer">
    <h3>Motion Installer · V187</h3>
    <p>Animations-GLB auswählen, Avatar festlegen und installieren. Die Zuordnung wird automatisch gespeichert.</p>
    {!admin && <p role="status">Für die Installation bitte oben als Administrator anmelden.</p>}
    <label>Ziel-Avatar <select disabled={!admin || busy} value={model?.id ?? ""} onChange={e => {setTarget(e.target.value);setConfirmReplace(false);setStatus("");}}>
      {usable.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select></label>
    <label>Motion-Datei (.glb, maximal 35 MB)
      <input type="file" accept=".glb,model/gltf-binary" disabled={!admin || busy} onChange={e => {setFile(e.target.files?.[0] ?? null);setStatus("");}} />
    </label>
    {existing && <label className="setting-check"><input type="checkbox" checked={confirmReplace} onChange={e=>setConfirmReplace(e.target.checked)} /> Vorhandene Animation für diesen Avatar ersetzen</label>}
    <button type="button" disabled={!admin || !file || !model || busy || (existing && !confirmReplace)} onClick={() => void install()}>
      {busy ? "Installiere Motion…" : "Motion installieren & automatisch zuweisen"}
    </button>
    {status && <p role="status">{status}</p>}
    <small>Unterstützt GLB-Clips mit passendem Avatar-Rig. Keine automatische FBX/BVH-Konvertierung und keine Garantie, dass fremde Skelett-Spuren ohne Retargeting funktionieren. Lokal nur im Entwicklungsmodus; mit Vercel Blob auch bei aktiviertem Blob-Speicher.</small>
  </section>;
}
