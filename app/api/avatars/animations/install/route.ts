import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/avatarAdmin";
import { blobModels, readAvatarConfig, writeAvatarConfig, useBlob } from "@/lib/avatarBlob";
import { defaultAvatarModels } from "@/config/avatarModels.default";
import { readdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
/** Assign a motion without replacing the avatar's other metadata. */
export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Origin mismatch" }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > 2500) return NextResponse.json({ error: "Zu groß" }, { status: 413 });
  try {
    const body: unknown = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) return NextResponse.json({ error: "Ungültige Anfrage" }, { status: 400 });
    const { modelId, animationUrl } = body as Record<string, unknown>;
    if (typeof modelId !== "string" || typeof animationUrl !== "string" ||
       !( /^\/animations\/[a-zA-Z0-9_.-]+\.glb$/.test(animationUrl) || /^https:\/\/[^\s]+\.glb(?:\?[^\s]*)?$/.test(animationUrl)) || animationUrl.length > 700) {
      return NextResponse.json({ error: "Ungültiger Avatar oder GLB-Pfad" }, { status: 400 });
    }
    const defaultId = modelId.startsWith("default:") ? modelId.slice(8) : "";
    const isDefault = defaultAvatarModels.some(model => model.id === defaultId && model.id !== "procedural");
    let key = modelId;
    if (!isDefault) {
      if (!/^local:[a-zA-Z0-9][a-zA-Z0-9_. -]*\.(glb|gltf)$/i.test(modelId) || modelId.includes("..") || modelId.length > 186)
        return NextResponse.json({ error: "Ungültiges Modell" }, { status: 400 });
      key = modelId.slice(6);
      const available = useBlob ? (await blobModels()).map(b => b.pathname.split("/").pop()) : await readdir(path.join(process.cwd(), "public", "avatars"));
      if (!available.includes(key)) return NextResponse.json({ error: "Modell nicht gefunden" }, { status: 404 });
    }
    const config = await readAvatarConfig();
    config[key] = { ...(config[key] ?? {}), animationUrl };
    await writeAvatarConfig(config);
    return NextResponse.json({ ok: true, modelId, animationUrl });
  } catch (error) {
    console.error("Motion installer:", error);
    return NextResponse.json({ error: "Motion konnte nicht zugewiesen werden" }, { status: 500 });
  }
}
