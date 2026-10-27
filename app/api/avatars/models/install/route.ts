import { NextRequest, NextResponse } from "next/server";
import { isAdmin, sameOrigin } from "@/lib/avatarAdmin";
import { readAvatarConfig, writeAvatarConfig, useBlob } from "@/lib/avatarBlob";
import { mkdir, writeFile, unlink, stat } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import path from "node:path";
export const runtime = "nodejs";
const MAX_BYTES = 35 * 1024 * 1024;
export async function POST(req: NextRequest) {
  if (!await isAdmin()) return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  if (!sameOrigin(req)) return NextResponse.json({ error: "Origin mismatch" }, { status: 403 });
  if (process.env.NODE_ENV !== "development" || useBlob) return NextResponse.json({ error: "Lokale Installation nur in der Entwicklung ohne Blob" }, { status: 403 });
  if (Number(req.headers.get("content-length") || 0) > MAX_BYTES + 1024 * 1024) return NextResponse.json({error:"Datei zu groß"},{status:413});
  try {
    const form=await req.formData(); const file=form.get("file");
    const sourceUrl=String(form.get("sharedMotionUrl")??"");
    const fingerprint=String(form.get("sharedMotionFingerprint")??"");
    const rigFingerprint=String(form.get("sharedRigFingerprint")??"");
    const clipCount=Number(form.get("sharedMotionClipCount")??0);
    if((sourceUrl&&!/^\/avatars\/[a-zA-Z0-9_.%-]+\.glb$/.test(sourceUrl))||
       (fingerprint&&!/^[a-f0-9]{64}$/.test(fingerprint))||(rigFingerprint&&!/^[a-f0-9]{64}$/.test(rigFingerprint))||
       (clipCount&&(!Number.isInteger(clipCount)||clipCount<1||clipCount>200)))return NextResponse.json({error:"Shared-Motion-Daten ungültig"},{status:400});
    if(sourceUrl){const sourceName=decodeURIComponent(sourceUrl.slice("/avatars/".length));
      if(!/^[a-zA-Z0-9_.-]+\.glb$/.test(sourceName)||!sourceName||
        !(await stat(path.join(process.cwd(),"public","avatars",sourceName)).then(f=>f.isFile()).catch(()=>false)))
        return NextResponse.json({error:"Shared-Motion-Quelle nicht vorhanden"},{status:400});}
    if (!(file instanceof File) || !/\.glb$/i.test(file.name) || file.size < 20 || file.size > MAX_BYTES) return NextResponse.json({error:"GLB erforderlich (max. 35 MB)"},{status:400});
    const bytes=new Uint8Array(await file.arrayBuffer());
    if (new TextDecoder().decode(bytes.slice(0,4)) !== "glTF" || new DataView(bytes.buffer).getUint32(4,true)!==2 || new DataView(bytes.buffer).getUint32(8,true)!==bytes.byteLength) return NextResponse.json({error:"Ungültige GLB-Datei"},{status:400});
    const base=file.name.replace(/\.glb$/i,"").replace(/[^a-zA-Z0-9_-]+/g,"-").slice(0,50)||"character";
    const filename=`${base}-${randomUUID().slice(0,8)}.glb`;
    const dir=path.join(process.cwd(),"public","avatars");
    await mkdir(dir,{recursive:true});
    await writeFile(path.join(dir,filename),bytes,{flag:"wx"});
    try {
      const metadata=await readAvatarConfig();
      metadata[filename]={label:base,description:"Über Character & Motion Library installiert",preview:"/avatars/custom-preview.svg",category:"Eigene Modelle",genre:[],tags:[],favorite:false,defaultDancePreset:"auto",sharedMotionUrl:sourceUrl,sharedMotionFingerprint:fingerprint,sharedRigFingerprint:rigFingerprint,sharedMotionClipCount:clipCount};
      await writeAvatarConfig(metadata);
    } catch { await unlink(path.join(dir,filename)).catch(()=>{}); throw new Error("Avatar-Metadaten konnten nicht gesichert werden"); }
    return NextResponse.json({id:`local:${filename}`,url:`/avatars/${encodeURIComponent(filename)}`,label:base});
  } catch {return NextResponse.json({error:"Charakter-Installation fehlgeschlagen"},{status:500});}
}
