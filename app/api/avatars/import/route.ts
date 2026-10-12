import { NextRequest, NextResponse } from "next/server";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const MAX_BYTES = 35 * 1024 * 1024;
const TIMEOUT_MS = 120_000;

function runBlender(source: string, target: string): Promise<void> {
  const binary = process.env.BLENDER_PATH || "blender";
  const script = path.join(process.cwd(), "scripts", "fbx_to_glb.py");
  return new Promise((resolve, reject) => {
    const child = spawn(binary, ["--background", "--threads", "2", "--python", script, "--", source, target], { shell: false, windowsHide: true, stdio: ["ignore", "pipe", "pipe"] });
    let log = "";
    const append = (data: Buffer) => { log = (log + data.toString()).slice(-5000); };
    child.stdout.on("data", append);
    child.stderr.on("data", append);
    let timedOut = false;
    const timer = setTimeout(() => { timedOut = true; child.kill(); }, TIMEOUT_MS);
    child.on("error", error => { clearTimeout(timer); reject(new Error(`Blender konnte nicht gestartet werden: ${error.message}`)); });
    child.on("close", code => {
      clearTimeout(timer);
      if (timedOut) reject(new Error("Konvertierung hat zu lange gedauert (120 Sekunden)."));
      else if (code === 0 && log.includes("SONIC_FBX_CONVERSION_OK")) resolve();
      else reject(new Error(`Blender-Konvertierung fehlgeschlagen (Exit ${code}). ${log.slice(-700)}`));
    });
  });
}

export async function POST(req: NextRequest) {
  // Conversion executes a native 3D parser: NEVER expose it to remote users.
  const host = req.headers.get("host")?.split(":")[0]?.toLowerCase();
  if (process.env.NODE_ENV !== "development" || !["127.0.0.1", "localhost", "[::1]"].includes(host || "")) {
    return NextResponse.json({ error: "FBX-Import ist ausschließlich im lokalen Entwicklungsmodus verfügbar." }, { status: 403 });
  }
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES + 1024 * 1024) {
    return NextResponse.json({ error: "Datei zu groß (max. 35 MB)." }, { status: 413 });
  }
  const origin = req.headers.get("origin");
  if (origin && new URL(origin).host !== req.headers.get("host")) {
    return NextResponse.json({ error: "Ungültige Herkunft der Anfrage." }, { status: 403 });
  }
  let tempDir: string | undefined;
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File) || !/\.fbx$/i.test(file.name)) return NextResponse.json({ error: "Bitte eine .fbx-Datei auswählen." }, { status: 400 });
    if (file.size === 0 || file.size > MAX_BYTES) return NextResponse.json({ error: "FBX muss zwischen 1 Byte und 35 MB groß sein." }, { status: 413 });
    const raw = Buffer.from(await file.arrayBuffer());
    // Binary FBX starts with 'Kaydara FBX Binary'; Blender can also import ASCII FBX in some versions.
    const name = path.basename(file.name).replace(/\.fbx$/i, "").normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 64) || "avatar";
    tempDir = await mkdtemp(path.join(tmpdir(), "sonic-fbx-"));
    const input = path.join(tempDir, "input.fbx");
    const output = path.join(tempDir, "output.glb");
    await writeFile(input, raw);
    await runBlender(input, output);
    const result = await readFile(output);
    if (result.length < 20 || result.toString("ascii", 0, 4) !== "glTF") throw new Error("Blender hat keine gültige GLB-Datei erstellt.");
    const dir = path.join(process.cwd(), "public", "avatars");
    await mkdir(dir, { recursive: true });
    const filename = `${name}-${randomUUID().slice(0, 8)}.glb`;
    await rename(output, path.join(dir, filename));
    const dataDir = path.join(process.cwd(), "data");
    await mkdir(dataDir, { recursive: true });
    const configPath = path.join(dataDir, "avatars.local.json");
    let metadata: Record<string, { label?: string; description?: string; preview?: string }> = {};
    try {
      const existing = JSON.parse(await readFile(configPath, "utf8"));
      if (existing && typeof existing === "object" && !Array.isArray(existing)) metadata = existing;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    }
    metadata[filename] = { label: name, description: "Aus FBX konvertiert", preview: "/avatars/custom-preview.svg" };
    await writeFile(configPath, JSON.stringify(metadata, null, 2) + "\n", "utf8");
    return NextResponse.json({ model: { id: `local:${filename}`, label: name, url: `/avatars/${encodeURIComponent(filename)}`, description: "Aus FBX konvertiert", preview: "/avatars/custom-preview.svg" } });
  } catch (error) {
    console.error("FBX import failed", error instanceof Error ? error.message : "unknown");
    return NextResponse.json({ error: error instanceof Error ? error.message : "FBX-Konvertierung fehlgeschlagen" }, { status: 500 });
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true }).catch(() => {});
  }
}
