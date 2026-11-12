"use client";
import {invalidateAvatarCatalogV733} from "@/services/avatarCatalogV733";

import { useState } from "react";
import { upload } from "@vercel/blob/client";
import type { AvatarModel } from "@/components/visualizer/avatarModels";
import { addCharacterMotion } from "@/components/visualizer/characterMotionLibrary";

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
      if (existing && !confirmReplace) throw new Error("Bitte zuerst das Ersetzen der bisherigen Motion bestätigen.");
      let prepared = file;
      if (/\.fbx$/i.test(file.name)) {
        setStatus("Konvertiere Mixamo-FBX lokal in GLB…");
        const { convertMixamoFbxToGlb } = await import("@/components/visualizer/mixamoFbxImporter");
        prepared = await convertMixamoFbxToGlb(file);
      }
      if (!/\.glb$/i.test(prepared.name) || prepared.size < 20 || prepared.size > 35 * 1024 * 1024) {
        throw new Error("Eine GLB mit höchstens 35 MB oder Mixamo-FBX mit höchstens 25 MB auswählen.");
      }
      // Prevent uploading arbitrary content with just a .glb suffix.
      const signature = new TextDecoder().decode(await prepared.slice(0, 4).arrayBuffer());
      if (signature !== "glTF") throw new Error("Keine gültige GLB-Datei (glTF-Signatur fehlt).");
      let url: string;
      if (blobEnabled) {
        const name = prepared.name.replace(/\.glb$/i, "").replace(/[^a-zA-Z0-9_-]/g, "-").slice(0, 50) || "motion";
        const result = await upload(`sonic/animations/${name}-${crypto.randomUUID()}.glb`, prepared, {
          access: "public", handleUploadUrl: "/api/avatars/upload", contentType: "model/gltf-binary"
        });
        if (!result.url) throw new Error("Upload fehlgeschlagen");
        url = result.url;
      } else {
        const form = new FormData();
        form.set("file", prepared);
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
      // The existing shared library can now select imported Mixamo motions by
      // genre/song section, without replacing the rest of the avatar catalogue.
      try { addCharacterMotion(model.id, prepared.name, url); }
      catch { /* Server assignment succeeded; optional browser storage may be unavailable. */ }
      await onInstalled();
      setFile(null); setConfirmReplace(false);
      setStatus(`Motion installiert und mit ${model.label} verknüpft. Keine Konfigurationsdatei erforderlich.`);
    } catch (error) { setStatus(error instanceof Error ? error.message : "Installation fehlgeschlagen"); }
    finally {invalidateAvatarCatalogV733(); setBusy(false); }
  }

  return <section className="avatar-metadata-editor" aria-label="Motion Installer">
    <h3>Motion Installer · V187</h3>
    <p>GLB oder selbst heruntergeladene <a href="https://www.mixamo.com/" target="_blank" rel="noopener noreferrer">Mixamo-FBX</a> auswählen, Avatar festlegen und installieren. FBX wird lokal im Browser in GLB umgewandelt – kein Adobe-Zugriff oder Login durch Sonic Display.</p>
    {!admin && <p role="status">Für die Installation bitte oben als Administrator anmelden.</p>}
    <label>Ziel-Avatar <select disabled={!admin || busy} value={model?.id ?? ""} onChange={e => {setTarget(e.target.value);setConfirmReplace(false);setStatus("");}}>
      {usable.map(item => <option key={item.id} value={item.id}>{item.label}</option>)}
    </select></label>
    <label>Motion-Datei (.glb bis 35 MB oder .fbx bis 25 MB)
      <input type="file" accept=".glb,.fbx,model/gltf-binary" disabled={!admin || busy} onChange={e => {setFile(e.target.files?.[0] ?? null);setStatus("");}} />
    </label>
    {existing && <label className="setting-check"><input type="checkbox" checked={confirmReplace} onChange={e=>setConfirmReplace(e.target.checked)} /> Vorhandene Animation für diesen Avatar ersetzen</label>}
    <button type="button" disabled={!admin || !file || !model || busy || (existing && !confirmReplace)} onClick={() => void install()}>
      {busy ? "Installiere Motion…" : "Motion installieren & automatisch zuweisen"}
    </button>
    {status && <p role="status">{status}</p>}
    <small>Für Mixamo möglichst als „Without Skin“ herunterladen. Der Import konvertiert FBX automatisch, die bestehende Rig-Zuordnung bleibt jedoch eine Heuristik: vor der Live-Show im Motion Library 3D-Viewer prüfen. Kein BVH-Import. Lokaler Upload nur im Entwicklungsmodus; in Produktion mit konfiguriertem Vercel Blob.</small>
  </section>;
}
